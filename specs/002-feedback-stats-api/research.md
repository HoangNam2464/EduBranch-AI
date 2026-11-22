# Research — 002-feedback-stats-api

| # | Câu hỏi | Quyết định / kết quả | Lý do | Loại |
|---|---|---|---|---|
| R1 | Case không PUBLISHED trả 403 hay 404 cho sinh viên? | 404 | INV-01 phải lọc ở truy vấn (FND §4); lọc `WHERE status='PUBLISHED'` tự nhiên cho 0 dòng, không lộ sự tồn tại của bản nháp. `branching-attempt` hiện trả 403 — không đổi code cũ (B-2). | Quyết định kỹ thuật |
| R2 | Route thống kê | `GET /cases/:caseId/statistics` | 3 nguồn thống nhất (DATA-FLOW Flow 7, FEATURE-BASIC-STATISTICS §5, mapping :74); `/statistics/**` trong FEATURE-AUTH-AND-ROLES là danh sách prefix theo vai, không phải route. | Dữ kiện |
| R3 | Có cần API "overview" nhiều khóa (PR #70)? | Không | `P3-SUPPORT-AND-STATISTICS.md` §1 Boundary: không cross-course analytics; Frame 05.5 có bộ chọn khóa + case rồi KPI. | Dữ kiện |
| R4 | `case_nodes` không có cột tiêu đề | Trả `situation` + `nodeIndex` | Không bịa `nodeTitle` (AGENTS.md rule 7); FE tự cắt ngắn để hiển thị. | Quyết định kỹ thuật |
| R5 | BE-022 (EBA-420) có chặn BE-028? | Không ở mức dữ liệu | `develop` đã ghi `is_completed/outcome_node_id/completed_at` (`branching-attempt.service.ts:292`). | Dữ kiện |
| R6 | Chống race khi nộp phản tư / nhận xét | UPDATE có điều kiện trạng thái nguồn; `SELECT … FOR UPDATE` trong transaction cho nhận xét | Mẫu sẵn có trong `branching-attempt.service.ts`. | Quyết định kỹ thuật |
| R7 | Hàng đợi có lấy attempt chưa hoàn thành? | Không | FE-019 AC-1 "các attempt hoàn thành". | Dữ kiện |
| R8 | Dạng phản hồi nhận xét cho sinh viên | `{ items: [] }` | Bảng cho phép nhiều dòng/mục tiêu; dạng mảng đúng với mọi phương án C2; rỗng ≠ lỗi. | Quyết định kỹ thuật |
| R9 | "Sanitized" `feedback_text` | trim + kiểm độ dài, lưu văn bản thuần | React escape khi render; không thêm thư viện lọc HTML (B-4). | Quyết định kỹ thuật |
| R10 | Test SQL thật | test opt-in `QA_LIVE=1` với docker Postgres | CI chưa có `services:` Postgres (CI-PROP-2); mock DB không bắt lỗi SQL. | Quyết định kỹ thuật |
