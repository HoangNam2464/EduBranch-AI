"""
EduBranch AI - QA-005 (EBA-219): Ingestion Pipeline Edge Cases on Live Infrastructure.

Deliverable: ai-service/tests/test_ingestion/test_ingestion_edge_live.py (QA-005 AC-2)
Acceptance criteria: docs/03_TASK-DETAILS.md §[29] & docs/06_QA.md:
  - QA-005 AC-1: Kiểm thử tự động xuyên suốt: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector.
    (End-to-end integration verified in backend/test/ingestion-pipeline-integration.spec.ts; note that AC-1 requires a real embedding key and is BLOCKED/skipped without QA_EMBEDDINGS=1).
  - QA-005 AC-2: Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt.

Real: MinIO (object download), PostgreSQL 16 + pgvector (teaching_materials status,
document_chunks rows, vector(768) column), DocumentParser, DocumentChunker, VectorStore.
Offline: the embedding provider (deterministic 768-d vectors). This is NOT evidence for
real embedding quality; ingestion with a real provider needs an API key.

Covers: metadata/link integrity, Unicode + special characters + odd whitespace, empty
or unextractable files, a missing object, an embedding failure mid-pipeline.

Correction / Defect Note (Finding M5):
  - Fresh ingestion: failure leaves FAILED status and zero chunks in document_chunks.
  - Re-ingestion: if re-ingesting an already-ingested document fails mid-pipeline (e.g. embedding failure),
    teaching_materials status is updated to FAILED, but the previous chunks remain in document_chunks
    (defect: retriever.py does not filter on processing_status, allowing stale chunks to be retrieved).
    Asserted via strict xfail in test_extra_reingest_failure_mid_pipeline_cleans_stale_chunks.

Skips automatically when PostgreSQL or MinIO are not reachable (L3).
"""

import hashlib
import io
import socket
import unicodedata
import uuid
from unittest.mock import AsyncMock, patch

import numpy as np
import pytest

DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
PDF = "application/pdf"


def _infra() -> bool:
    """Probe the same PostgreSQL and MinIO host/port configured in settings (L3)."""
    try:
        from app.core.config import settings

        socket.create_connection((settings.postgres_host, settings.postgres_port), timeout=2).close()
        ep = settings.minio_endpoint
        m_host, m_port = ep.split(":", 1) if ":" in ep else (ep, 9000)
        socket.create_connection((m_host, int(m_port)), timeout=2).close()
        return True
    except OSError:
        return False


pytestmark = pytest.mark.skipif(not _infra(), reason="PostgreSQL/MinIO not available")


def _vec(text: str) -> list[float]:
    rng = np.random.default_rng(int.from_bytes(hashlib.sha256(text.encode()).digest()[:4], "big"))
    v = rng.standard_normal(768)
    return (v / np.linalg.norm(v)).tolist()


def _provider(fail: bool = False):
    from app.core.exceptions import EmbeddingException

    p = AsyncMock()

    async def batch(texts):
        if fail:
            raise EmbeddingException("simulated provider outage")
        return [_vec(t) for t in texts]

    p.generate_embeddings_batch.side_effect = batch
    p.generate_embedding.side_effect = lambda t: _vec(t)
    return p


def _docx(paragraphs: list[str]) -> bytes:
    from docx import Document

    d = Document()
    for p in paragraphs:
        d.add_paragraph(p)
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()


UNICODE_PARAS = [
    "Quản trị doanh nghiệp: Hội đồng quản trị phải giải trình trước cổ đông về mọi quyết định đầu tư.",
    "Ký tự đặc biệt: <script>alert('x')</script> & \"quotes\" ' ; -- DROP TABLE users; © ™ € ₫ ½ → ✓ 🚀 中文 العربية",
    "Khoảng trắng cứng,\ttab\t,​zero-width,   nhiều   dấu   cách,　full-width.",
    "\n\n\n   ",
    "Đoạn kết: trách nhiệm giải trình và minh bạch thông tin tài chính.",
]


@pytest.fixture
async def env():
    import asyncpg
    from minio import Minio
    from app.core.config import settings

    conn = await asyncpg.connect(
        f"postgresql://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_db}"
    )
    mc = Minio(settings.minio_endpoint, access_key=settings.minio_access_key,
               secret_key=settings.minio_secret_key, secure=settings.minio_secure)
    if not mc.bucket_exists(settings.minio_bucket_materials):
        mc.make_bucket(settings.minio_bucket_materials)
    user, course = uuid.uuid4(), uuid.uuid4()
    made: list[tuple[uuid.UUID, str]] = []

    try:
        await conn.execute(
            "INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'x','QA005','LECTURER')",
            user, f"qa005_{user}@test.edu",
        )
        await conn.execute(
            "INSERT INTO courses (id, name, course_code, lecturer_id) VALUES ($1,'QA-005','QA005',$2)", course, user
        )

        async def material(data: bytes | None, mime: str):
            mid = uuid.uuid4()
            key = f"qa005/{mid}/doc"
            await conn.execute(
                """INSERT INTO teaching_materials
                   (id, original_filename, stored_object_key, mime_type, size_bytes, course_id, uploaded_by)
                   VALUES ($1,'qa005',$2,$3,$4,$5,$6)""",
                mid, key, mime, len(data or b""), course, user,
            )
            if data is not None:
                mc.put_object(settings.minio_bucket_materials, key, io.BytesIO(data), length=len(data), content_type=mime)
            made.append((mid, key))
            return str(mid), key

        async def state(mid: str):
            row = await conn.fetchrow(
                "SELECT processing_status, chunk_count, processing_error FROM teaching_materials WHERE id = $1",
                uuid.UUID(mid),
            )
            chunks = await conn.fetch(
                "SELECT material_id, course_id, chunk_index, chunk_text, vector_dims(embedding) AS dims "
                "FROM document_chunks WHERE material_id = $1 ORDER BY chunk_index",
                uuid.UUID(mid),
            )
            return row, chunks

        yield {"course": str(course), "material": material, "state": state}
    finally:
        for mid, key in made:
            try:
                await conn.execute("DELETE FROM teaching_materials WHERE id = $1", mid)
            except Exception:
                pass
            try:
                mc.remove_object(settings.minio_bucket_materials, key)
            except Exception:
                pass
        try:
            await conn.execute("DELETE FROM courses WHERE id = $1", course)
        except Exception:
            pass
        try:
            await conn.execute("DELETE FROM users WHERE id = $1", user)
        except Exception:
            pass
        await conn.close()


async def _ingest(mid, key, course, mime, provider):
    from app.ingestion.service import ingest_document

    with patch("app.ingestion.service.get_provider", return_value=provider):
        return await ingest_document(material_id=mid, s3_object_key=key, course_id=course, mime_type=mime)


# ---------------------------------------------------------------------------
# QA-005 AC-2: Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt
# ---------------------------------------------------------------------------
async def test_ac2_unicode_docx_chunks_are_linked_and_stored_with_768d_vectors(env):
    mid, key = await env["material"](_docx(UNICODE_PARAS), DOCX)
    result = await _ingest(mid, key, env["course"], DOCX, _provider())
    row, chunks = await env["state"](mid)

    assert result["status"] == "COMPLETED"
    assert row["processing_status"] == "COMPLETED"
    assert row["chunk_count"] == result["chunk_count"] == len(chunks) >= 1
    assert [c["chunk_index"] for c in chunks] == list(range(len(chunks)))
    assert all(str(c["material_id"]) == mid and str(c["course_id"]) == env["course"] for c in chunks)
    assert all(c["dims"] == 768 for c in chunks)
    text = unicodedata.normalize("NFC", " ".join(c["chunk_text"] for c in chunks))
    for word in ("Quản trị doanh nghiệp", "giải trình", "₫", "🚀", "中文", "DROP TABLE users", "<script>"):
        assert word in text, f"lost during parse/chunk: {word!r}"
    assert all(c["chunk_text"].strip() for c in chunks), "empty/whitespace-only chunk stored"


async def test_extra_pdf_text_is_extracted_and_stored(env):
    import pathlib

    pdf = (pathlib.Path(__file__).parents[3] / "backend" / "test" / "fixtures" / "qa" / "sample.pdf").read_bytes()
    mid, key = await env["material"](pdf, PDF)
    result = await _ingest(mid, key, env["course"], PDF, _provider())
    _, chunks = await env["state"](mid)
    assert result["status"] == "COMPLETED"
    assert "Corporate governance requires accountability" in " ".join(c["chunk_text"] for c in chunks)


@pytest.mark.parametrize(
    "label,data,mime",
    [
        ("empty-bytes-pdf", b"", PDF),
        ("corrupt-pdf", b"%PDF-1.4 truncated", PDF),
        ("docx-without-text", None, DOCX),
        ("docx-whitespace-only", None, DOCX),
    ],
)
async def test_ac2_empty_or_unextractable_files_fail_without_false_success(env, label, data, mime):
    if label == "docx-without-text":
        data = _docx([])
    elif label == "docx-whitespace-only":
        data = _docx(["   ", "\t ​", "\n\n"])
    mid, key = await env["material"](data, mime)
    with pytest.raises(Exception):
        await _ingest(mid, key, env["course"], mime, _provider())
    row, chunks = await env["state"](mid)
    assert row["processing_status"] == "FAILED", label
    assert row["processing_error"], label
    assert chunks == [], label


async def test_extra_missing_minio_object_fails_cleanly(env):
    mid, key = await env["material"](None, DOCX)
    with pytest.raises(Exception):
        await _ingest(mid, key, env["course"], DOCX, _provider())
    row, chunks = await env["state"](mid)
    assert row["processing_status"] == "FAILED"
    assert row["processing_error"]
    assert chunks == []


async def test_extra_embedding_failure_mid_pipeline_leaves_failed_state_and_no_chunks(env):
    mid, key = await env["material"](_docx(UNICODE_PARAS), DOCX)
    with pytest.raises(Exception):
        await _ingest(mid, key, env["course"], DOCX, _provider(fail=True))
    row, chunks = await env["state"](mid)
    assert row["processing_status"] == "FAILED"
    assert "simulated provider outage" in row["processing_error"]
    assert chunks == []


async def test_extra_reingest_replaces_chunks_instead_of_duplicating(env):
    mid, key = await env["material"](_docx(UNICODE_PARAS), DOCX)
    first = await _ingest(mid, key, env["course"], DOCX, _provider())
    second = await _ingest(mid, key, env["course"], DOCX, _provider())
    row, chunks = await env["state"](mid)
    assert first["chunk_count"] == second["chunk_count"] == len(chunks) == row["chunk_count"]


@pytest.mark.xfail(
    strict=True,
    raises=AssertionError,
    reason="DEFECT (QA-005): re-ingest failure mid-pipeline (e.g. embedding failure) leaves material in FAILED "
    "state but preserves old document_chunks rows, making stale chunks retrievable because retriever.py does not filter on processing_status.",
)
async def test_extra_reingest_failure_mid_pipeline_cleans_stale_chunks(env):
    mid, key = await env["material"](_docx(UNICODE_PARAS), DOCX)
    first = await _ingest(mid, key, env["course"], DOCX, _provider())
    if first.get("status") != "COMPLETED":
        pytest.fail(f"Precondition failed: initial ingest expected COMPLETED, got {first.get('status')}")
    if (first.get("chunk_count") or 0) <= 0:
        pytest.fail(f"Precondition failed: initial ingest expected chunk_count > 0, got {first.get('chunk_count')}")

    # Attempt re-ingest with simulated embedding outage mid-pipeline
    with pytest.raises(Exception):
        await _ingest(mid, key, env["course"], DOCX, _provider(fail=True))

    row, chunks = await env["state"](mid)
    if row.get("processing_status") != "FAILED":
        pytest.fail(f"Precondition failed: re-ingest expected FAILED status, got {row.get('processing_status')}")
    # Defect: old chunks remain while status is FAILED.
    # Expecting stale chunks to be removed on failed re-ingestion raises AssertionError:
    assert chunks == [], "expected stale chunks to be removed on failed re-ingestion, but old chunks remain"
