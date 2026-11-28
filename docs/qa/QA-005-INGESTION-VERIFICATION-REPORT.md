# QA-005 Ingestion Verification Report (2026-11-28)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Bằng chứng kiểm chứng trên nhánh cục bộ `fix/ingestion-stale-chunks`, chưa merge vào `develop`).
> - **Task**: `QA-005` (`EBA-29` / Master `EBA-219`, liên quan `EBA-116`).
> - **Branch & SHA**: `fix/ingestion-stale-chunks` (tiếp nối `3ade495`, base `origin/develop` `59a9aa3`).
> - **Kho lưu log**: `D:\CAPSTONE_2026\EduBranch-AI-evidence\2026-11-28\ci-logs\qa005-chunkcount-pytest-ingestion.log`, `qa005-chunkcount-pytest-nonlive.log`.

## 1. Tóm tắt thay đổi
- `ai-service/app/ingestion/service.py`: cập nhật `_update_material_status` hỗ trợ cập nhật đồng thời `chunk_count` và `processing_error`; `_mark_failed` xóa `document_chunks`, reset `chunk_count = 0` và ghi `processing_status = 'FAILED'` + `processing_error` trong cùng một transaction (theo PO Option 1 ngày 2026-11-28: `chunk_count` là số chunk hiện tồn tại trong `document_chunks`); gộp bước thành công (xóa chunk cũ + chèn chunk mới + `COMPLETED`) vào cùng một transaction.
- `backend/src/modules/material/material.service.ts`: đồng bộ nhánh fallback `catch` trong `uploadMaterial` bằng CTE atomic `DELETE FROM document_chunks` + `UPDATE teaching_materials SET processing_status = 'FAILED', chunk_count = 0`.
- `ai-service/tests/test_ingestion/test_ingestion_edge_live.py`, `test_ingestion_failure_cleanup.py`, `test_api.py` & `backend/src/modules/material/material.service.spec.ts`: gỡ `xfail` và bổ sung regression assertions `chunk_count == 0` trên mọi trường hợp `FAILED`.
- `docs/database/DATA-MODEL.md`, `docs/features/FEATURE-COURSE-AND-MATERIALS.md`, `docs/features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`, `docs/PROJECT_OVERVIEW.md`: ghi rõ định nghĩa `teaching_materials.chunk_count` (PO Option 1).

## 2. Kết quả kiểm chứng độc lập (QG2 — cập nhật sau chỉnh sửa `chunk_count = 0`)

| Phạm vi kiểm thử | Trạng thái | Kết quả & Điều kiện |
|---|---|---|
| `pytest tests/test_ingestion -v` (DB tạm `edubranch_qa005_it`, có Postgres + MinIO, vector offline 768-d) | **PASS** | **69 passed** (8.68s): gồm 10/10 bài live edge cases (`test_ingestion_edge_live.py`, xác nhận `chunk_count == 0` khi `FAILED`) và 4/4 bài unit cleanup (`test_ingestion_failure_cleanup.py`). |
| `pytest -v --ignore-glob="*live*"` (kèm `test_retrieval_boundary.py` trên `edubranch_qa005_it`, `GEMINI_API_KEY` giả) | **PASS** | **158 passed, 7 warnings** (10.93s). |
| `backend`: `npm run build && npm test -- --runInBand` | **PASS** | **41 suites, 430/430 tests** (36.861s), gồm regression test `material.service.spec.ts` kiểm chứng `DELETE FROM document_chunks` + `chunk_count = 0` khi AI lỗi. |
| `QA-005` AC-1 chạy với Gemini embedding key thật & `test_live_flow2` | **NOT VERIFIED** | Live edge suite dùng vector deterministic offline; `test_live_flow2` ngoài phạm vi sửa là lỗi nền có sẵn trên `develop` (`Event loop is closed`). |
| `BE-009` (`EBA-22`) kích thước chunk (tokens vs chars) | **WAITING PO** | Chưa sửa `chunker.py`; giữ nguyên là câu hỏi mở chờ PO quyết định (xem `PO-OPEN-DECISIONS-2026-11-28.md`). |

## 3. Ghi chú định nghĩa dữ liệu (PO Option 1, 2026-11-28)
- `teaching_materials.chunk_count` là số chunk hiện đang tồn tại trong `document_chunks`; mọi đường chuyển sang `FAILED` (AI Service và Backend) đều xóa sạch `document_chunks` và đặt `chunk_count = 0` trong một thao tác atomic.
