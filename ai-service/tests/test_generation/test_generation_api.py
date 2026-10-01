"""
EduBranch AI - API Tests for Case Generation.
"""
import uuid
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_generate_case_unauthorized():
    """Verify missing API key returns 403."""
    response = client.post(
        "/internal/v1/generation/generate-case",
        json={
            "course_id": str(uuid.uuid4()),
            "material_ids": [str(uuid.uuid4())],
            "topic_hint": "Test topic",
            "num_nodes": 4
        }
    )
    assert response.status_code == 403


def test_generate_case_authorized():
    """Verify valid request in mock mode returns structured response."""
    response = client.post(
        "/internal/v1/generation/generate-case",
        headers={"X-Internal-API-Key": settings.ai_service_api_key},
        json={
            "course_id": str(uuid.uuid4()),
            "material_ids": [str(uuid.uuid4())],
            "topic_hint": "Test topic",
            "num_nodes": 4
        }
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert "title" in data
    assert "description" in data
    assert "root_node_index" in data
    assert "nodes" in data
    assert "source_chunks" in data
    assert len(data["nodes"]) >= 2
