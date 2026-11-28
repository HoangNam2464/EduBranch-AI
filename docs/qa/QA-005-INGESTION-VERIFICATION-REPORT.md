# QA-005 Ingestion Verification Report (2026-11-28)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Bằng chứng kiểm chứng trên nhánh cục bộ `fix/ingestion-stale-chunks`, chưa merge vào `develop`).
> - **Task**: `QA-005` (`EBA-29` / Master `EBA-219`, liên quan `EBA-116`).
> - **Branch & SHA**: `fix/ingestion-stale-chunks` (`3ade495`, base `origin/develop` `59a9aa3`).
> - **Kho lưu log**: `D:\CAPSTONE_2026\EduBranch-AI-evidence\2026-11-28\ci-logs\qa005-3ade495-pytest-ingestion.log`, `qa005-3ade495-pytest-full-nonlive.log`.

## 1. Tóm tắt thay đổi
- `ai-service/app/ingestion/service.py`: thêm `_mark_failed` để xóa `document_chunks` và ghi `processing_status = 'FAILED'` + `processing_error` trong cùng một transaction; gộp bước thành công (xóa chunk cũ + chèn chunk mới + `COMPLETED`) vào cùng một transaction.
- `ai-service/tests/test_ingestion/test_ingestion_edge_live.py`: gỡ `xfail` trên `test_extra_reingest_failure_mid_pipeline_cleans_stale_chunks` thành test chuẩn.
- `ai-service/tests/test_ingestion/test_ingestion_failure_cleanup.py`: bổ sung 4 unit tests chạy trong CI không cần PostgreSQL.
- `ai-service/tests/test_ingestion/test_api.py`: cập nhật mock `asyncpg` cho đúng `transaction()` và `execute()`.

## 2. Kết quả kiểm chứng độc lập (QG2 trên SHA `3ade495`)

| Phạm vi kiểm thử | Trạng thái | Kết quả & Điều kiện |
|---|---|---|
| `pytest tests/test_ingestion -v` (DB tạm `edubranch_qa005_it`, có Postgres + MinIO, vector offline 768-d) | **PASS** | **69 passed** (10.03s): gồm 10/10 bài live edge cases (`test_ingestion_edge_live.py`) và 4/4 bài unit cleanup (`test_ingestion_failure_cleanup.py`). |
| `pytest -v --ignore-glob="*live*"` (kèm `test_retrieval_boundary.py` trên `edubranch_qa005_it`, `GEMINI_API_KEY` giả) | **PASS** | **158 passed** (8.36s). |
| `QA-005` AC-1 chạy với Gemini embedding key thật & `test_live_flow2` | **NOT VERIFIED** | Live edge suite dùng vector deterministic offline; `test_live_flow2` ngoài phạm vi sửa là lỗi nền có sẵn trên `develop` (`Event loop is closed`). |
| `BE-009` (`EBA-22`) kích thước chunk (tokens vs chars) | **WAITING PO** | Chưa sửa `chunker.py`; giữ nguyên là câu hỏi mở chờ PO quyết định (xem `PO-OPEN-DECISIONS-2026-11-28.md`). |

## 3. Quan sát kỹ thuật nhỏ (không chặn QA-005)
- Khi re-ingest thất bại, `_mark_failed` xóa sạch `document_chunks` và ghi `processing_status = 'FAILED'`, giữ nguyên giá trị cột `chunk_count` cũ trên `teaching_materials`. UI và retriever đều kiểm tra `processing_status` / `document_chunks`, không dùng `chunk_count` khi `FAILED`.
