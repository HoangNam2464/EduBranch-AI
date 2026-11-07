"""
Unit tests for VectorStore & HNSW Vector Indexing [OPS-003].
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch
import pytest

from app.core.exceptions import DatabaseException, RetrievalException
from app.ingestion.vector_store import VectorStore, ChunkRecord


@pytest.fixture
def vector_store():
    return VectorStore(expected_dim=768)


@pytest.mark.asyncio
async def test_insert_chunks_success(vector_store):
    conn = AsyncMock()
    conn.executemany = AsyncMock(return_value=None)

    with patch("app.ingestion.vector_store.register_vector", new_callable=AsyncMock) as mock_reg:
        mat_id = str(uuid.uuid4())
        crs_id = str(uuid.uuid4())
        chunks = ["Chunk 1 content", "Chunk 2 content"]
        embeddings = [[0.1] * 768, [0.2] * 768]
        pages = [1, 2]

        count = await vector_store.insert_chunks(
            conn=conn,
            material_id=mat_id,
            course_id=crs_id,
            chunk_texts=chunks,
            embeddings=embeddings,
            page_numbers=pages,
        )

        assert count == 2
        mock_reg.assert_called_once_with(conn)
        conn.executemany.assert_called_once()

        # Verify insert SQL contains required columns including embedding and HNSW targets
        call_args = conn.executemany.call_args[0]
        sql = call_args[0]
        assert "INSERT INTO document_chunks" in sql
        assert "embedding" in sql
        assert "material_id" in sql
        assert "course_id" in sql

        rows = call_args[1]
        assert len(rows) == 2
        assert rows[0][3] == 0  # chunk_index 0
        assert rows[0][4] == "Chunk 1 content"
        assert rows[1][3] == 1  # chunk_index 1
        assert rows[1][4] == "Chunk 2 content"


@pytest.mark.asyncio
async def test_insert_chunks_mismatched_counts(vector_store):
    conn = AsyncMock()
    mat_id = str(uuid.uuid4())
    crs_id = str(uuid.uuid4())
    chunks = ["Chunk 1", "Chunk 2"]
    embeddings = [[0.1] * 768]  # Only 1 embedding

    with pytest.raises(DatabaseException, match="Mismatch between chunk texts count"):
        await vector_store.insert_chunks(
            conn=conn,
            material_id=mat_id,
            course_id=crs_id,
            chunk_texts=chunks,
            embeddings=embeddings,
        )


@pytest.mark.asyncio
async def test_insert_chunks_empty(vector_store):
    conn = AsyncMock()
    count = await vector_store.insert_chunks(
        conn=conn,
        material_id=str(uuid.uuid4()),
        course_id=str(uuid.uuid4()),
        chunk_texts=[],
        embeddings=[],
    )
    assert count == 0


@pytest.mark.asyncio
async def test_search_similar_with_hnsw_operator(vector_store):
    conn = AsyncMock()
    fake_rows = [
        {
            "chunk_id": str(uuid.uuid4()),
            "text": "Relevant chunk text",
            "material_id": str(uuid.uuid4()),
            "course_id": str(uuid.uuid4()),
            "chunk_index": 0,
            "page_number": 3,
            "similarity": 0.89,
        }
    ]
    conn.fetch = AsyncMock(return_value=fake_rows)

    with patch("app.ingestion.vector_store.register_vector", new_callable=AsyncMock) as mock_reg:
        crs_id = str(uuid.uuid4())
        results = await vector_store.search_similar(
            conn=conn,
            course_id=crs_id,
            query_embedding=[0.05] * 768,
            top_k=3,
        )

        assert len(results) == 1
        assert results[0].similarity == 0.89
        assert results[0].chunk_text == "Relevant chunk text"

        mock_reg.assert_called_once_with(conn)
        conn.fetch.assert_called_once()
        sql = conn.fetch.call_args[0][0]
        # AC-2: Ensure cosine distance operator <=> is used
        assert "<=>" in sql
        assert "1 - (embedding <=> $1::vector) AS similarity" in sql


@pytest.mark.asyncio
async def test_delete_chunks_by_material(vector_store):
    conn = AsyncMock()
    conn.execute = AsyncMock(return_value="DELETE 5")

    mat_id = str(uuid.uuid4())
    deleted_count = await vector_store.delete_chunks_by_material(conn, mat_id)

    assert deleted_count == 5
    conn.execute.assert_called_once_with(
        "DELETE FROM document_chunks WHERE material_id = $1",
        uuid.UUID(mat_id),
    )


@pytest.mark.asyncio
async def test_check_cascade_foreign_key(vector_store):
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value={"delete_rule": "CASCADE"})

    is_cascade = await vector_store.check_cascade_foreign_key(conn)
    assert is_cascade is True

    conn.fetchrow = AsyncMock(return_value=None)
    is_cascade_missing = await vector_store.check_cascade_foreign_key(conn)
    assert is_cascade_missing is False

