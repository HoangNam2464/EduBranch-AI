"""
QA-005 (EBA-29): a FAILED material keeps no chunks.

Unit-level companion of the live test
test_ingestion_edge_live.py::test_extra_reingest_failure_mid_pipeline_cleans_stale_chunks, which needs PostgreSQL and
MinIO and is skipped in CI. A fake asyncpg connection records the SQL and whether each statement ran inside a
transaction.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.core.exceptions import DocumentParsingException, EmbeddingException
from app.ingestion import service

MATERIAL_ID = "11111111-1111-4111-8111-111111111111"
COURSE_ID = "22222222-2222-4222-8222-222222222222"


class FakeTransaction:
    def __init__(self, conn: "FakeConnection") -> None:
        self.conn = conn

    async def __aenter__(self):
        self.conn.depth += 1
        return self

    async def __aexit__(self, exc_type, exc, tb):
        self.conn.depth -= 1
        return False


class FakeConnection:
    def __init__(self) -> None:
        self.depth = 0
        self.calls: list[tuple[str, tuple, bool]] = []
        self.close = AsyncMock()

    def transaction(self) -> FakeTransaction:
        return FakeTransaction(self)

    async def execute(self, sql: str, *args):
        self.calls.append((" ".join(sql.split()), args, self.depth > 0))
        return "DELETE 3" if sql.lstrip().upper().startswith("DELETE") else "UPDATE 1"

    def statements(self, prefix: str) -> list[tuple[str, tuple, bool]]:
        return [c for c in self.calls if c[0].upper().startswith(prefix)]


async def _run(conn: FakeConnection, *, embed_error: Exception | None = None, parse_error: Exception | None = None):
    embedder = AsyncMock()
    if embed_error:
        embedder.embed_chunks.side_effect = embed_error
    else:
        embedder.embed_chunks.return_value = [[0.0] * 768]
    with (
        patch.object(service, "_get_db_connection", AsyncMock(return_value=conn)),
        patch.object(service, "_download_from_minio", return_value=b"bytes"),
        patch.object(service, "DocumentParser") as parser_cls,
        patch.object(service, "DocumentEmbedder", return_value=embedder),
        patch.object(service, "get_provider"),
        patch.object(service._vector_store, "insert_chunks", AsyncMock(return_value=1)),
    ):
        if parse_error:
            parser_cls.return_value.parse_bytes.side_effect = parse_error
        else:
            parser_cls.return_value.parse_bytes.return_value = "Một đoạn văn bản đủ dài để tạo ít nhất một đoạn trích."
        return await service.ingest_document(MATERIAL_ID, "materials/x.docx", COURSE_ID, "application/pdf")


def _failed_update(conn: FakeConnection):
    updates = [c for c in conn.statements("UPDATE TEACHING_MATERIALS") if "FAILED" in c[1]]
    assert len(updates) == 1, conn.calls
    return updates[0]


@pytest.mark.parametrize(
    "kwargs",
    [
        {"embed_error": EmbeddingException("simulated provider outage")},
        {"parse_error": DocumentParsingException("unreadable")},
        {"embed_error": RuntimeError("unexpected")},
    ],
    ids=["embedding", "parsing", "unexpected"],
)
async def test_failed_ingest_removes_chunks_and_marks_failed_in_one_transaction(kwargs):
    conn = FakeConnection()
    with pytest.raises(Exception):
        await _run(conn, **kwargs)

    deletes = conn.statements("DELETE FROM DOCUMENT_CHUNKS")
    assert len(deletes) == 1, conn.calls
    _, delete_args, delete_in_tx = deletes[0]
    _, _, failed_in_tx = _failed_update(conn)
    assert str(delete_args[0]) == MATERIAL_ID
    assert delete_in_tx and failed_in_tx, "chunk removal and FAILED status must commit together"
    # The chunks are removed before the FAILED status is written.
    assert conn.calls.index(deletes[0]) < conn.calls.index(_failed_update(conn))
    conn.close.assert_awaited_once()


async def test_successful_ingest_replaces_chunks_and_completes_in_one_transaction():
    conn = FakeConnection()
    result = await _run(conn)

    assert result == {"status": "COMPLETED", "chunk_count": 1}
    deletes = conn.statements("DELETE FROM DOCUMENT_CHUNKS")
    completed = [c for c in conn.statements("UPDATE TEACHING_MATERIALS") if "COMPLETED" in c[1]]
    assert len(deletes) == 1 and len(completed) == 1
    assert deletes[0][2] and completed[0][2], "delete + insert + COMPLETED must be atomic"
    assert not [c for c in conn.statements("UPDATE TEACHING_MATERIALS") if "FAILED" in c[1]]
