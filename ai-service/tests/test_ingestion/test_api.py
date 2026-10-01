"""
EduBranch AI — Integration Tests for Ingestion & Retrieval API Endpoints.

Tests the FastAPI routes with a mocked provider (no real LLM API calls) and
mocked MinIO/DB (no real infrastructure required for unit layer).

Separate integration tests that DO require live DB/MinIO are in test_ingestion_live.py.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


INTERNAL_API_KEY = "changeme_internal_ai_service_api_key"
HEADERS = {"X-Internal-API-Key": INTERNAL_API_KEY}

FAKE_COURSE_ID = str(uuid.uuid4())
FAKE_MATERIAL_ID = str(uuid.uuid4())
FAKE_EMBEDDING = [0.1] * 768  # Matches Gemini text-embedding-004 dimensions


# ===========================================================================
# Ingestion endpoint tests
# ===========================================================================
class TestIngestionEndpoint:
    """Tests for POST /internal/v1/ingestion/process"""

    async def test_missing_api_key_returns_403(self):
        """Requests without the internal API key must be rejected with 403."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/internal/v1/ingestion/process",
                json={
                    "material_id": FAKE_MATERIAL_ID,
                    "s3_object_key": "test/doc.pdf",
                    "course_id": FAKE_COURSE_ID,
                    "mime_type": "application/pdf",
                },
            )
        assert response.status_code == 403

    async def test_ingestion_success_docx(self):
        """Valid DOCX ingestion request should return 200 with chunk_count."""
        # Mock at the router level so we bypass lru_cache on get_provider
        with patch(
            "app.ingestion.router.ingest_document",
            new_callable=AsyncMock,
            return_value={"status": "COMPLETED", "chunk_count": 2},
        ):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/internal/v1/ingestion/process",
                    json={
                        "material_id": FAKE_MATERIAL_ID,
                        "s3_object_key": "materials/test.docx",
                        "course_id": FAKE_COURSE_ID,
                        "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    },
                    headers=HEADERS,
                )

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["status"] == "COMPLETED"
        assert data["material_id"] == FAKE_MATERIAL_ID
        assert data["chunk_count"] >= 1



    async def test_ingestion_invalid_mime_type_returns_422(self):
        """Ingestion of unsupported MIME type should return 422."""
        with (
            patch("app.ingestion.service._download_from_minio", return_value=b"fake data"),
            patch("app.ingestion.service._get_db_connection") as mock_conn_factory,
        ):
            mock_conn = AsyncMock()
            mock_conn.execute = AsyncMock()
            mock_conn.close = AsyncMock()
            mock_conn_factory.return_value = mock_conn

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/internal/v1/ingestion/process",
                    json={
                        "material_id": FAKE_MATERIAL_ID,
                        "s3_object_key": "materials/test.txt",
                        "course_id": FAKE_COURSE_ID,
                        "mime_type": "text/plain",
                    },
                    headers=HEADERS,
                )

        assert response.status_code == 422


# ===========================================================================
# Retrieval endpoint tests
# ===========================================================================
class TestRetrievalEndpoint:
    """Tests for POST /internal/v1/retrieval/query"""

    async def test_missing_api_key_returns_403(self):
        """Requests without the internal API key must be rejected with 403."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/internal/v1/retrieval/query",
                json={
                    "query": "corporate governance",
                    "course_id": FAKE_COURSE_ID,
                },
            )
        assert response.status_code == 403

    async def test_retrieval_returns_chunks_and_rag_context(self):
        """Valid retrieval request should return chunks + <sources> context."""
        from app.retrieval.service import RetrievedChunk

        fake_chunks = [
            RetrievedChunk(
                chunk_id=str(uuid.uuid4()),
                text="Corporate governance structures define accountability.",
                similarity=0.92,
                material_id=FAKE_MATERIAL_ID,
                chunk_index=0,
            ),
            RetrievedChunk(
                chunk_id=str(uuid.uuid4()),
                text="Stakeholders must be considered in all major decisions.",
                similarity=0.85,
                material_id=FAKE_MATERIAL_ID,
                chunk_index=1,
            ),
        ]

        with patch("app.retrieval.router.retrieve_chunks", new_callable=AsyncMock, return_value=fake_chunks):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/internal/v1/retrieval/query",
                    json={
                        "query": "corporate governance structures",
                        "course_id": FAKE_COURSE_ID,
                        "top_k": 5,
                        "include_rag_context": True,
                    },
                    headers=HEADERS,
                )

        assert response.status_code == 200, response.text
        data = response.json()
        assert data["total_chunks"] == 2
        assert len(data["chunks"]) == 2
        assert data["rag_context"] is not None
        assert "<sources>" in data["rag_context"]
        assert "</sources>" in data["rag_context"]
        assert "Corporate governance" in data["rag_context"]

    async def test_retrieval_empty_query_returns_error(self):
        """Empty query string should be rejected by Pydantic validation."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/internal/v1/retrieval/query",
                json={
                    "query": "",  # min_length=1 should reject this
                    "course_id": FAKE_COURSE_ID,
                },
                headers=HEADERS,
            )
        assert response.status_code == 422

    async def test_retrieval_no_chunks_returns_empty(self):
        """When no relevant chunks exist, should return empty list and empty rag_context."""
        with patch("app.retrieval.router.retrieve_chunks", new_callable=AsyncMock, return_value=[]):
            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/internal/v1/retrieval/query",
                    json={
                        "query": "quantum physics unrelated topic",
                        "course_id": FAKE_COURSE_ID,
                    },
                    headers=HEADERS,
                )

        assert response.status_code == 200
        data = response.json()
        assert data["total_chunks"] == 0
        assert data["chunks"] == []
        # rag_context should be empty string (no chunks → build_rag_context returns "")
        assert data["rag_context"] == "" or data["rag_context"] is None


# ===========================================================================
# RAG context security test
# ===========================================================================
class TestRagContextSecurity:
    """Verify <sources> boundary wrapping (BR-RAG-01)."""

    def test_rag_context_wraps_in_sources_tags(self):
        """build_rag_context must always wrap content in <sources>...</sources>."""
        from app.retrieval.service import build_rag_context, RetrievedChunk

        chunks = [
            RetrievedChunk(
                chunk_id=str(uuid.uuid4()),
                text="Retrieved context text here.",
                similarity=0.9,
                material_id=FAKE_MATERIAL_ID,
                chunk_index=0,
            )
        ]
        context = build_rag_context(chunks)
        assert context.startswith("<sources>")
        assert context.endswith("</sources>")
        assert "Retrieved context text here." in context

    def test_rag_context_empty_chunks_returns_empty_string(self):
        """Empty chunk list should return empty string, not a bare <sources> tag."""
        from app.retrieval.service import build_rag_context
        assert build_rag_context([]) == ""
