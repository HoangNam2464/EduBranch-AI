"""
EduBranch AI - Live End-to-End Integration Test for Flow 1.

This test verifies the complete Material Ingestion & RAG pipeline:
  1. Uploads a synthetic document to MinIO
  2. Calls the ingestion service (parse → chunk → embed → pgvector)
  3. Queries the retrieval service (embed → cosine search → RAG context)

Requirements:
  - PostgreSQL running on localhost:5432 (edubranch_ai / edubranch)
  - MinIO running on localhost:9000
  - GEMINI_API_KEY or OPENAI_API_KEY configured in .env

Run with:
  pytest tests/test_ingestion/test_live_flow1.py -v -m live

Skip automatically if infrastructure is unavailable.
"""

import io
import uuid
import os

import pytest

# Live integration tests require running PostgreSQL + MinIO infrastructure.
# If an LLM API key is present, real embeddings are generated; otherwise deterministic mock embeddings are used.


def _check_infra_available() -> bool:
    """Return True if PostgreSQL and MinIO are reachable."""
    import socket
    try:
        socket.create_connection(("localhost", 5432), timeout=2).close()
        socket.create_connection(("localhost", 9000), timeout=2).close()
        return True
    except OSError:
        return False


@pytest.fixture(scope="module")
def require_infra():
    """Skip if local infrastructure (Postgres + MinIO) is not running."""
    if not _check_infra_available():
        pytest.skip("Infrastructure (Postgres/MinIO) not available")


@pytest.fixture(scope="module")
def synthetic_docx_bytes() -> bytes:
    """Create a synthetic DOCX with meaningful text for RAG testing."""
    from docx import Document

    doc = Document()
    doc.add_heading("Corporate Governance Case Study", level=1)
    doc.add_paragraph(
        "This case study examines the role of corporate governance in preventing financial fraud. "
        "The board of directors must establish clear accountability structures."
    )
    doc.add_paragraph(
        "Stakeholder analysis requires identifying all parties affected by corporate decisions. "
        "Shareholders, employees, customers, and the broader community all have legitimate interests."
    )
    doc.add_paragraph(
        "Ethical leadership involves transparency in financial reporting and honest communication "
        "with all stakeholders. The whistleblower policy must be clearly articulated."
    )
    doc.add_paragraph(
        "Decision-making frameworks in corporate governance include the agency theory perspective "
        "and the stewardship theory. Each provides different insights into board responsibilities."
    )
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


@pytest.mark.asyncio
async def test_full_flow1_ingestion_and_retrieval(require_infra, synthetic_docx_bytes):
    """
    End-to-end test for Flow 1:
      MinIO upload → parse → chunk → embed → pgvector → retrieve → RAG context
    """
    from minio import Minio
    import asyncpg
    from app.core.config import settings
    from app.ingestion.service import ingest_document
    from app.retrieval.service import retrieve_chunks, build_rag_context
    from app.providers.factory import get_provider

    has_api_key = bool(os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY"))
    patchers = []
    if not has_api_key:
        import hashlib
        import numpy as np
        from unittest.mock import patch, AsyncMock

        def _make_vec(text: str) -> list[float]:
            h = hashlib.sha256(text.encode("utf-8")).digest()
            seed = int.from_bytes(h[:4], "big")
            rng = np.random.default_rng(seed)
            vec = rng.standard_normal(768).astype(np.float32)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            return vec.tolist()

        async def _mock_embedding(text: str) -> list[float]:
            return _make_vec(text)

        async def _mock_embeddings_batch(texts: list[str]) -> list[list[float]]:
            return [_make_vec(t) for t in texts]

        mock_provider = AsyncMock()
        mock_provider.generate_embedding.side_effect = _mock_embedding
        mock_provider.generate_embeddings_batch.side_effect = _mock_embeddings_batch

        p1 = patch("app.ingestion.service.get_provider", return_value=mock_provider)
        p2 = patch("app.retrieval.service.get_provider", return_value=mock_provider)
        p1.start()
        p2.start()
        patchers.extend([p1, p2])

    # -------------------------------------------------------------------------
    # Setup: create test course and material records in DB
    # -------------------------------------------------------------------------
    dsn = (
        f"postgresql://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_db}"
    )
    conn = await asyncpg.connect(dsn)

    test_user_id = uuid.uuid4()
    test_course_id = uuid.uuid4()
    test_material_id = uuid.uuid4()
    object_key = f"test/{test_material_id}/document.docx"
    mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    try:
        # Insert test user
        await conn.execute(
            """
            INSERT INTO users (id, email, password_hash, full_name, role)
            VALUES ($1, $2, $3, $4, 'LECTURER')
            ON CONFLICT DO NOTHING
            """,
            test_user_id,
            f"test_lecturer_{test_user_id}@test.edu",
            "hashed_password",
            "Test Lecturer",
        )

        # Insert test course
        await conn.execute(
            """
            INSERT INTO courses (id, name, course_code, lecturer_id)
            VALUES ($1, 'Business Ethics Test Course', 'BUS-TEST-001', $2)
            ON CONFLICT DO NOTHING
            """,
            test_course_id,
            test_user_id,
        )

        # Insert test teaching_material record
        await conn.execute(
            """
            INSERT INTO teaching_materials
                (id, original_filename, stored_object_key, mime_type, size_bytes, course_id, uploaded_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
            """,
            test_material_id,
            "corporate_governance.docx",
            object_key,
            mime_type,
            len(synthetic_docx_bytes),
            test_course_id,
            test_user_id,
        )

        # -------------------------------------------------------------------------
        # Upload document to MinIO
        # -------------------------------------------------------------------------
        minio_client = Minio(
            endpoint=settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )

        # Ensure bucket exists
        if not minio_client.bucket_exists(settings.minio_bucket_materials):
            minio_client.make_bucket(settings.minio_bucket_materials)

        minio_client.put_object(
            settings.minio_bucket_materials,
            object_key,
            io.BytesIO(synthetic_docx_bytes),
            length=len(synthetic_docx_bytes),
            content_type=mime_type,
        )

        # -------------------------------------------------------------------------
        # Step: Ingestion pipeline
        # -------------------------------------------------------------------------
        result = await ingest_document(
            material_id=str(test_material_id),
            s3_object_key=object_key,
            course_id=str(test_course_id),
            mime_type=mime_type,
        )

        assert result["status"] == "COMPLETED", f"Ingestion failed: {result}"
        assert result["chunk_count"] >= 1, "Expected at least 1 chunk"

        # Verify chunks are in DB
        chunk_count_db = await conn.fetchval(
            "SELECT COUNT(*) FROM document_chunks WHERE material_id = $1",
            test_material_id,
        )
        assert chunk_count_db == result["chunk_count"], (
            f"DB chunk count ({chunk_count_db}) != returned chunk_count ({result['chunk_count']})"
        )

        # Verify processing_status updated to COMPLETED
        status_val = await conn.fetchval(
            "SELECT processing_status FROM teaching_materials WHERE id = $1",
            test_material_id,
        )
        assert status_val == "COMPLETED"

        # -------------------------------------------------------------------------
        # Step: Retrieval pipeline
        # -------------------------------------------------------------------------
        chunks = await retrieve_chunks(
            query="corporate governance stakeholder accountability",
            course_id=str(test_course_id),
            top_k=3,
        )

        assert len(chunks) >= 1, "Retrieval returned no chunks"
        assert all(-1.0 <= c.similarity <= 1.0 for c in chunks), (
            "Similarity scores should be valid cosine similarity within [-1.0, 1.0]"
        )
        assert all(c.material_id == str(test_material_id) for c in chunks), (
            "Retrieved chunks should belong to the test material"
        )

        # Verify RAG context wrapping
        rag_context = build_rag_context(chunks)
        assert rag_context.startswith("<sources>")
        assert rag_context.endswith("</sources>")
        assert "governance" in rag_context.lower() or "stakeholder" in rag_context.lower()

        print(f"\n[PASS] Flow 1 - chunks ingested: {result['chunk_count']}, chunks retrieved: {len(chunks)}")
        print(f"   Top chunk similarity: {chunks[0].similarity:.3f}")
        print(f"   RAG context length: {len(rag_context)} chars")

    finally:
        # -------------------------------------------------------------------------
        # Cleanup: remove test data
        # -------------------------------------------------------------------------
        await conn.execute(
            "DELETE FROM document_chunks WHERE material_id = $1", test_material_id
        )
        await conn.execute(
            "DELETE FROM teaching_materials WHERE id = $1", test_material_id
        )
        await conn.execute("DELETE FROM courses WHERE id = $1", test_course_id)
        await conn.execute("DELETE FROM users WHERE id = $1", test_user_id)

        # Remove from MinIO
        try:
            minio_client.remove_object(settings.minio_bucket_materials, object_key)
        except Exception:
            pass

        for p in patchers:
            p.stop()

        await conn.close()
