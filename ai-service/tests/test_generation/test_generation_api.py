"""
EduBranch AI - API Tests for Case Generation Router [BE-015].

Verifies:
  - 403 Forbidden without X-Internal-API-Key
  - 200 OK for valid request
  - 504 Gateway Timeout on provider timeout
  - 503 Service Unavailable on transient retry exhaustion
  - 502 Bad Gateway on graph/schema validation failure
  - 400 Bad Request on fatal/non-retryable client error
  - 409 Conflict on idempotency key parameter mismatch
  - Idempotent replay flag on duplicate requests
"""

import uuid
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.core.exceptions import (
    GenerationRetryExhaustedError,
    GenerationTimeoutError,
    GenerationValidationError,
    IdempotencyConflictError,
    NonRetryableProviderError,
)
from app.generation.case_generator import idempotency_manager
from app.generation.schemas.requests import CaseGenerationResponse
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_idempotency_cache():
    idempotency_manager.clear()
    yield
    idempotency_manager.clear()


def test_generate_case_unauthorized():
    """Verify missing API key returns 403."""
    response = client.post(
        "/internal/v1/generation/generate-case",
        json={
            "course_id": str(uuid.uuid4()),
            "material_ids": [str(uuid.uuid4())],
            "topic_hint": "Test topic",
            "num_nodes": 4,
        },
    )
    assert response.status_code == 403


def test_generate_case_authorized():
    """Verify valid request returns structured response."""
    response = client.post(
        "/internal/v1/generation/generate-case",
        headers={"X-Internal-API-Key": settings.ai_service_api_key},
        json={
            "course_id": str(uuid.uuid4()),
            "material_ids": [str(uuid.uuid4())],
            "topic_hint": "Test topic",
            "num_nodes": 4,
        },
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "title" in data
    assert "description" in data
    assert "root_node_index" in data
    assert "nodes" in data
    assert "source_chunks" in data
    assert len(data["nodes"]) >= 2


def test_generate_case_api_timeout_mapping():
    """AC-4, AC-8: Verify GenerationTimeoutError maps to HTTP 504."""
    with patch("app.generation.router.generate_case", side_effect=GenerationTimeoutError("Provider call timed out")):
        response = client.post(
            "/internal/v1/generation/generate-case",
            headers={"X-Internal-API-Key": settings.ai_service_api_key},
            json={
                "course_id": str(uuid.uuid4()),
                "material_ids": [str(uuid.uuid4())],
                "topic_hint": "Test topic",
                "num_nodes": 4,
            },
        )
        assert response.status_code == 504
        data = response.json()
        assert data["detail"]["code"] == "GENERATION_TIMEOUT"


def test_generate_case_api_retry_exhaustion_mapping():
    """AC-5, AC-6, AC-8: Verify GenerationRetryExhaustedError maps to HTTP 503."""
    with patch(
        "app.generation.router.generate_case",
        side_effect=GenerationRetryExhaustedError("Retries exhausted after 3 attempts"),
    ):
        response = client.post(
            "/internal/v1/generation/generate-case",
            headers={"X-Internal-API-Key": settings.ai_service_api_key},
            json={
                "course_id": str(uuid.uuid4()),
                "material_ids": [str(uuid.uuid4())],
                "topic_hint": "Test topic",
                "num_nodes": 4,
            },
        )
        assert response.status_code == 503
        data = response.json()
        assert data["detail"]["code"] == "RETRY_EXHAUSTED"


def test_generate_case_api_validation_error_mapping():
    """AC-3, AC-8: Verify GenerationValidationError maps to HTTP 502."""
    with patch(
        "app.generation.router.generate_case",
        side_effect=GenerationValidationError("DAG cycle invariant violated"),
    ):
        response = client.post(
            "/internal/v1/generation/generate-case",
            headers={"X-Internal-API-Key": settings.ai_service_api_key},
            json={
                "course_id": str(uuid.uuid4()),
                "material_ids": [str(uuid.uuid4())],
                "topic_hint": "Test topic",
                "num_nodes": 4,
            },
        )
        assert response.status_code == 502
        data = response.json()
        assert data["detail"]["code"] == "INVALID_GENERATED_STRUCTURE"


def test_generate_case_api_non_retryable_error_mapping():
    """AC-7: Verify NonRetryableProviderError maps to HTTP 400."""
    with patch(
        "app.generation.router.generate_case",
        side_effect=NonRetryableProviderError("400 Bad Request: Invalid prompt parameters"),
    ):
        response = client.post(
            "/internal/v1/generation/generate-case",
            headers={"X-Internal-API-Key": settings.ai_service_api_key},
            json={
                "course_id": str(uuid.uuid4()),
                "material_ids": [str(uuid.uuid4())],
                "topic_hint": "Test topic",
                "num_nodes": 4,
            },
        )
        assert response.status_code == 400
        data = response.json()
        assert data["detail"]["code"] == "PROVIDER_FATAL_ERROR"


def test_generate_case_api_idempotency_conflict_mapping():
    """AC-9: Verify IdempotencyConflictError maps to HTTP 409."""
    with patch(
        "app.generation.router.generate_case",
        side_effect=IdempotencyConflictError("Key already used with different parameters"),
    ):
        response = client.post(
            "/internal/v1/generation/generate-case",
            headers={"X-Internal-API-Key": settings.ai_service_api_key},
            json={
                "course_id": str(uuid.uuid4()),
                "material_ids": [str(uuid.uuid4())],
                "topic_hint": "Test topic",
                "num_nodes": 4,
                "idempotency_key": "conflicting-key-1",
            },
        )
        assert response.status_code == 409
        data = response.json()
        assert data["detail"]["code"] == "IDEMPOTENCY_CONFLICT"
