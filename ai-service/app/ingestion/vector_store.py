"""
EduBranch AI — Document Chunks Persistence & HNSW Vector Store [OPS-003].

Implements persistence and indexing for document text chunks and vector embeddings:
  - Batch insertion into PostgreSQL `document_chunks` table (AC-1)
  - HNSW index support using `vector_cosine_ops` for high-performance approximate similarity search (AC-2)
  - Foreign key validation and CASCADE deletion semantics upon material cleanup (AC-3)

Traceability:
  - Master Task ID: EBA-214
  - Sprint: Sprint 2 (Material & RAG)
"""

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import asyncpg
import numpy as np
from pgvector.asyncpg import register_vector

from app.core.exceptions import DatabaseException, RetrievalException
from app.core.logging import logger


@dataclass
class ChunkRecord:
    """Represents a persisted text chunk with metadata."""
    id: str
    material_id: str
    course_id: str
    chunk_index: int
    chunk_text: str
    page_number: int | None = None
    similarity: float | None = None


class VectorStore:
    """
    Manages vector embeddings and chunk persistence in PostgreSQL using pgvector.
    Leverages HNSW index with vector_cosine_ops for fast similarity lookups.
    """

    def __init__(self, expected_dim: int = 768):
        self.expected_dim = expected_dim

    async def register_pgvector(self, conn: asyncpg.Connection) -> None:
        """Register pgvector type codecs on the active asyncpg connection."""
        await register_vector(conn)

    async def insert_chunks(
        self,
        conn: asyncpg.Connection,
        material_id: str,
        course_id: str,
        chunk_texts: list[str],
        embeddings: list[list[float]],
        page_numbers: list[int | None] | None = None,
    ) -> int:
        """
        AC-1: Batch-insert chunk records and their vector embeddings into document_chunks.

        Args:
            conn: Active PostgreSQL connection.
            material_id: UUID of the parent teaching material.
            course_id: UUID of the associated course (tenant boundary).
            chunk_texts: List of extracted text chunks.
            embeddings: Corresponding vector embeddings (e.g. 768-dim float vectors).
            page_numbers: Optional source page numbers.

        Returns:
            Number of chunks persisted.
        """
        if not chunk_texts or not embeddings:
            logger.info("vector_store_insert_empty", material_id=material_id)
            return 0

        if len(chunk_texts) != len(embeddings):
            raise DatabaseException(
                f"Mismatch between chunk texts count ({len(chunk_texts)}) and embeddings count ({len(embeddings)})"
            )

        await self.register_pgvector(conn)

        mat_uuid = uuid.UUID(material_id)
        crs_uuid = uuid.UUID(course_id)
        now = datetime.now(timezone.utc)

        rows = []
        for idx, (text, emb) in enumerate(zip(chunk_texts, embeddings)):
            if len(emb) != self.expected_dim:
                logger.warn(
                    "vector_dimension_warning",
                    expected=self.expected_dim,
                    received=len(emb),
                    chunk_index=idx,
                )

            page = page_numbers[idx] if page_numbers and idx < len(page_numbers) else None
            vec_data = np.array(emb, dtype=np.float32)

            rows.append((
                uuid.uuid4(),
                mat_uuid,
                crs_uuid,
                idx,
                text,
                vec_data,
                page,
                now,
            ))

        await conn.executemany(
            """
            INSERT INTO document_chunks (
                id, material_id, course_id, chunk_index, chunk_text, embedding, page_number, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """,
            rows,
        )

        logger.info(
            "vector_store_chunks_inserted",
            material_id=material_id,
            count=len(rows),
        )
        return len(rows)

    async def search_similar(
        self,
        conn: asyncpg.Connection,
        course_id: str,
        query_embedding: list[float],
        top_k: int = 5,
        material_ids: list[str] | None = None,
    ) -> list[ChunkRecord]:
        """
        AC-2: Search similar chunks using HNSW index and vector_cosine_ops (<=> operator).
        Calculates cosine similarity as: 1 - (embedding <=> query_vec).
        Enforces course-level tenant isolation.
        """
        if not query_embedding:
            raise RetrievalException("Query embedding cannot be empty")

        await self.register_pgvector(conn)
        query_vec = np.array(query_embedding, dtype=np.float32)
        crs_uuid = uuid.UUID(course_id)

        if material_ids:
            mat_uuids = [uuid.UUID(m) for m in material_ids]
            rows = await conn.fetch(
                """
                SELECT
                    id::text          AS chunk_id,
                    chunk_text        AS text,
                    material_id::text AS material_id,
                    course_id::text   AS course_id,
                    chunk_index,
                    page_number,
                    1 - (embedding <=> $1::vector) AS similarity
                FROM document_chunks
                WHERE course_id = $2
                  AND material_id = ANY($3::uuid[])
                ORDER BY embedding <=> $1::vector
                LIMIT $4
                """,
                query_vec,
                crs_uuid,
                mat_uuids,
                top_k,
            )
        else:
            rows = await conn.fetch(
                """
                SELECT
                    id::text          AS chunk_id,
                    chunk_text        AS text,
                    material_id::text AS material_id,
                    course_id::text   AS course_id,
                    chunk_index,
                    page_number,
                    1 - (embedding <=> $1::vector) AS similarity
                FROM document_chunks
                WHERE course_id = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3
                """,
                query_vec,
                crs_uuid,
                top_k,
            )

        return [
            ChunkRecord(
                id=r["chunk_id"],
                material_id=r["material_id"],
                course_id=r["course_id"],
                chunk_index=r["chunk_index"],
                chunk_text=r["text"],
                page_number=r.get("page_number"),
                similarity=float(r["similarity"]),
            )
            for r in rows
        ]

    async def delete_chunks_by_material(
        self,
        conn: asyncpg.Connection,
        material_id: str,
    ) -> int:
        """
        Manually remove all chunks for a material if needed (idempotent re-ingestion).
        Note: When deleting material from teaching_materials, PostgreSQL CASCADE automatically
        removes these records per AC-3.
        """
        result = await conn.execute(
            "DELETE FROM document_chunks WHERE material_id = $1",
            uuid.UUID(material_id),
        )
        # Result format: "DELETE <count>"
        parts = result.split()
        count = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
        logger.info("vector_store_chunks_deleted", material_id=material_id, count=count)
        return count

    async def check_cascade_foreign_key(self, conn: asyncpg.Connection) -> bool:
        """
        AC-3: Verifies that document_chunks table has ON DELETE CASCADE configured
        for foreign key referencing teaching_materials(id).
        """
        row = await conn.fetchrow(
            """
            SELECT rc.delete_rule
            FROM information_schema.referential_constraints rc
            JOIN information_schema.table_constraints tc
              ON rc.constraint_name = tc.constraint_name
             AND rc.constraint_schema = tc.constraint_schema
            WHERE tc.table_name = 'document_chunks'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND rc.delete_rule = 'CASCADE';
            """
        )
        return row is not None

