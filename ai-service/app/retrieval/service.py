"""
EduBranch AI — Retrieval Service.

Implements semantic retrieval using pgvector cosine similarity.
Returns the top-K most relevant document chunks for a given query.

Security: Retrieved chunks are UNTRUSTED DATA from uploaded documents.
All returned text MUST be enclosed in <sources>...</sources> tags by the caller.

Flow 1 implementation: Material Ingestion & RAG.
"""

import uuid

import asyncpg

from app.core.config import settings
from app.core.exceptions import RetrievalException
from app.core.logging import logger
from app.providers.factory import get_provider


# ---------------------------------------------------------------------------
# Response data class
# ---------------------------------------------------------------------------
from dataclasses import dataclass


@dataclass
class RetrievedChunk:
    """A retrieved document chunk with similarity score."""
    chunk_id: str
    text: str
    similarity: float
    material_id: str
    chunk_index: int


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


# ---------------------------------------------------------------------------
# Retrieval orchestrator
# ---------------------------------------------------------------------------
async def retrieve_chunks(
    query: str,
    course_id: str,
    material_ids: list[str] | None = None,
    top_k: int | None = None,
) -> list[RetrievedChunk]:
    """
    Retrieve top-K most relevant document chunks for a given query.

    Enforces course-level tenant isolation: chunks from other courses are never returned.

    Args:
        query: The search query text (topic, concept, or free text)
        course_id: UUID of the course — enforces tenant isolation
        material_ids: Optional list of material UUIDs to restrict retrieval scope
        top_k: Number of chunks to return (default: settings.rag_top_k)

    Returns:
        List of RetrievedChunk ordered by descending similarity
    """
    k = top_k or settings.rag_top_k

    if not query or not query.strip():
        raise RetrievalException("Query text must not be empty")

    # Step 1: Generate query embedding
    provider = get_provider()
    logger.info("retrieval_embed_query", course_id=course_id, query_length=len(query))
    query_embedding: list[float] = await provider.generate_embedding(query)

    # Step 2: Query pgvector
    conn: asyncpg.Connection | None = None
    try:
        conn = await _get_db_connection()

        from pgvector.asyncpg import register_vector
        await register_vector(conn)

        import numpy as np
        query_vec = np.array(query_embedding, dtype=np.float32)

        # Build query — filter by course + optional material list
        if material_ids:
            mat_uuids = [uuid.UUID(m) for m in material_ids]
            rows = await conn.fetch(
                """
                SELECT
                    id::text          AS chunk_id,
                    chunk_text        AS text,
                    material_id::text AS material_id,
                    chunk_index,
                    1 - (embedding <=> $1::vector) AS similarity
                FROM document_chunks
                WHERE course_id = $2
                  AND material_id = ANY($3::uuid[])
                ORDER BY embedding <=> $1::vector
                LIMIT $4
                """,
                query_vec,
                uuid.UUID(course_id),
                mat_uuids,
                k,
            )
        else:
            rows = await conn.fetch(
                """
                SELECT
                    id::text          AS chunk_id,
                    chunk_text        AS text,
                    material_id::text AS material_id,
                    chunk_index,
                    1 - (embedding <=> $1::vector) AS similarity
                FROM document_chunks
                WHERE course_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3
                """,
                query_vec,
                uuid.UUID(course_id),
                k,
            )

        chunks = [
            RetrievedChunk(
                chunk_id=row["chunk_id"],
                text=row["text"],
                similarity=float(row["similarity"]),
                material_id=row["material_id"],
                chunk_index=row["chunk_index"],
            )
            for row in rows
        ]

        logger.info(
            "retrieval_complete",
            course_id=course_id,
            returned_chunks=len(chunks),
            top_k=k,
        )
        return chunks

    except RetrievalException:
        raise
    except Exception as e:
        raise RetrievalException(f"Vector retrieval failed: {e}") from e
    finally:
        if conn:
            await conn.close()


def build_rag_context(chunks: list[RetrievedChunk]) -> str:
    """
    Assemble retrieved chunks into a prompt-safe RAG context string.

    SECURITY: All retrieved text is enclosed in <sources>...</sources> boundary
    to prevent indirect prompt injection (BR-RAG-01).

    Args:
        chunks: List of retrieved chunks ordered by similarity

    Returns:
        RAG context string ready to be included in an LLM prompt
    """
    if not chunks:
        return ""

    parts = []
    for i, chunk in enumerate(chunks, start=1):
        parts.append(
            f"[Source {i} | material={chunk.material_id} | chunk={chunk.chunk_index} | "
            f"similarity={chunk.similarity:.3f}]\n{chunk.text}"
        )

    inner = "\n\n".join(parts)
    return f"<sources>\n{inner}\n</sources>"
