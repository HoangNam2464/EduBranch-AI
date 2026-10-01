"""
EduBranch AI — Ingestion Service.

Orchestrates the full document ingestion pipeline:
  1. Download document bytes from MinIO
  2. Parse text from PDF/DOCX
  3. Chunk text into overlapping segments
  4. Generate embeddings via provider abstraction
  5. Store chunks + embeddings in PostgreSQL/pgvector

Flow 1 implementation: Material Ingestion & RAG.
"""

import asyncio
import uuid
from datetime import datetime, timezone

import asyncpg

from app.core.config import settings
from app.core.exceptions import DocumentParsingException, EmbeddingException
from app.core.logging import logger
from app.ingestion.chunker import DocumentChunker
from app.ingestion.parser import DocumentParser
from app.providers.factory import get_provider


# ---------------------------------------------------------------------------
# MinIO client helper
# ---------------------------------------------------------------------------
def _get_minio_client():
    """Return a configured MinIO client."""
    from minio import Minio
    return Minio(
        endpoint=settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )


def _download_from_minio(object_key: str) -> bytes:
    """
    Download a document from MinIO and return raw bytes.

    Args:
        object_key: The stored_object_key value from teaching_materials table.

    Returns:
        Raw bytes of the document.
    """
    client = _get_minio_client()
    bucket = settings.minio_bucket_materials

    logger.info("minio_download_start", bucket=bucket, object_key=object_key)
    response = client.get_object(bucket, object_key)
    try:
        data = response.read()
    finally:
        response.close()
        response.release_conn()

    logger.info("minio_download_complete", object_key=object_key, bytes=len(data))
    return data


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------
async def _get_db_connection() -> asyncpg.Connection:
    """Return a raw asyncpg connection to PostgreSQL."""
    dsn = (
        f"postgresql://{settings.postgres_user}:{settings.postgres_password}"
        f"@{settings.postgres_host}:{settings.postgres_port}/{settings.postgres_db}"
    )
    return await asyncpg.connect(dsn)


async def _delete_existing_chunks(conn: asyncpg.Connection, material_id: str) -> None:
    """Remove any previously-ingested chunks for this material (idempotent re-ingestion)."""
    deleted = await conn.execute(
        "DELETE FROM document_chunks WHERE material_id = $1",
        uuid.UUID(material_id),
    )
    if deleted != "DELETE 0":
        logger.info("existing_chunks_deleted", material_id=material_id)


async def _insert_chunks(
    conn: asyncpg.Connection,
    material_id: str,
    course_id: str,
    chunk_texts: list[str],
    embeddings: list[list[float]],
) -> int:
    """
    Batch-insert chunk records with embeddings into document_chunks table.

    Returns number of rows inserted.
    """
    from pgvector.asyncpg import register_vector

    await register_vector(conn)

    import numpy as np

    rows = []
    for idx, (text, embedding) in enumerate(zip(chunk_texts, embeddings)):
        rows.append((
            uuid.uuid4(),
            uuid.UUID(material_id),
            uuid.UUID(course_id),
            idx,
            text,
            np.array(embedding, dtype=np.float32),
            datetime.now(timezone.utc),
        ))

    await conn.executemany(
        """
        INSERT INTO document_chunks
            (id, material_id, course_id, chunk_index, chunk_text, embedding, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        rows,
    )
    return len(rows)


async def _update_material_status(
    conn: asyncpg.Connection,
    material_id: str,
    status: str,
    chunk_count: int | None = None,
    error: str | None = None,
) -> None:
    """Update processing_status (and optionally chunk_count / processing_error) on teaching_materials."""
    if chunk_count is not None:
        await conn.execute(
            """
            UPDATE teaching_materials
            SET processing_status = $1,
                chunk_count       = $2,
                updated_at        = NOW()
            WHERE id = $3
            """,
            status,
            chunk_count,
            uuid.UUID(material_id),
        )
    elif error is not None:
        await conn.execute(
            """
            UPDATE teaching_materials
            SET processing_status = $1,
                processing_error  = $2,
                updated_at        = NOW()
            WHERE id = $3
            """,
            status,
            error,
            uuid.UUID(material_id),
        )
    else:
        await conn.execute(
            """
            UPDATE teaching_materials
            SET processing_status = $1,
                updated_at        = NOW()
            WHERE id = $2
            """,
            status,
            uuid.UUID(material_id),
        )


# ---------------------------------------------------------------------------
# Main ingestion orchestrator
# ---------------------------------------------------------------------------
async def ingest_document(
    material_id: str,
    s3_object_key: str,
    course_id: str,
    mime_type: str,
) -> dict:
    """
    Full ingestion pipeline:
      MinIO → Parse → Chunk → Embed → pgvector

    Args:
        material_id: UUID of the teaching_material record
        s3_object_key: Object key in MinIO (stored_object_key)
        course_id: UUID of the course (for tenant isolation)
        mime_type: MIME type of the document (PDF or DOCX)

    Returns:
        dict with status and chunk_count
    """
    conn: asyncpg.Connection | None = None
    try:
        conn = await _get_db_connection()

        # Mark as PROCESSING
        await _update_material_status(conn, material_id, "PROCESSING")

        # Step 1: Download from MinIO
        logger.info("ingestion_start", material_id=material_id, s3_key=s3_object_key)
        raw_bytes = await asyncio.get_event_loop().run_in_executor(
            None, _download_from_minio, s3_object_key
        )

        # Step 2: Parse document text
        parser = DocumentParser()
        text = parser.parse_bytes(raw_bytes, mime_type)

        # Step 3: Chunk text
        chunker = DocumentChunker()
        chunks = chunker.chunk(text=text, document_id=material_id)

        if not chunks:
            raise DocumentParsingException("Document produced zero chunks after parsing")

        chunk_texts = [c.text for c in chunks]

        # Step 4: Generate embeddings (batch)
        provider = get_provider()
        embeddings = await provider.generate_embeddings_batch(chunk_texts)

        if len(embeddings) != len(chunk_texts):
            raise EmbeddingException(
                f"Embedding count mismatch: expected {len(chunk_texts)}, got {len(embeddings)}"
            )

        # Step 5: Delete old chunks (idempotent), then insert new ones
        await _delete_existing_chunks(conn, material_id)
        inserted = await _insert_chunks(conn, material_id, course_id, chunk_texts, embeddings)

        # Mark as COMPLETED
        await _update_material_status(conn, material_id, "COMPLETED", chunk_count=inserted)

        logger.info(
            "ingestion_complete",
            material_id=material_id,
            chunk_count=inserted,
        )
        return {"status": "COMPLETED", "chunk_count": inserted}

    except DocumentParsingException as e:
        error_msg = str(e)
        logger.error("ingestion_parse_error", material_id=material_id, error=error_msg)
        if conn:
            await _update_material_status(conn, material_id, "FAILED", error=error_msg)
        raise

    except EmbeddingException as e:
        error_msg = str(e)
        logger.error("ingestion_embedding_error", material_id=material_id, error=error_msg)
        if conn:
            await _update_material_status(conn, material_id, "FAILED", error=error_msg)
        raise

    except Exception as e:
        error_msg = f"Ingestion pipeline error: {e}"
        logger.error("ingestion_error", material_id=material_id, error=error_msg)
        if conn:
            await _update_material_status(conn, material_id, "FAILED", error=error_msg)
        raise

    finally:
        if conn:
            await conn.close()
