# Data Model — 002-feedback-stats-api

**Không có thay đổi schema.** Mọi bảng/cột dưới đây đã có trong `backend/migrations/V1__init_schema.sql`, `V2__new_flow_schema.sql`, `V5__course_enrollments.sql` [DỮ-KIỆN].

| Bảng | Cột dùng | Đọc/Ghi | API |
|---|---|---|---|
| `review_study_submissions` | tất cả cột; UNIQUE `uq_review_submission_per_student_case`; CHECK `submission_status`, `reflection_status` | Ghi: E1 (INSERT), E4 (UPDATE), E6 (UPDATE → REVIEWED). Đọc: E2, E3, E5, E7, E8 | BE-025, BE-026, BE-028 |
| `lecturer_feedback` | tất cả cột; CHECK `chk_feedback_one_target` | Ghi: E6. Đọc: E5, E7 | BE-026 |
| `branching_attempts` | `id, student_id, case_id, attempt_number, outcome_node_id, is_completed, reflection_text, reflection_status, completed_at` | Đọc: E6 (khóa hàng), E7, E8 | BE-026, BE-028 |
| `student_reasoning` | `attempt_id, node_id, selected_option_id, reasoning_text` | Đọc: E7 (`stepsCount`, `steps` — C3-A), E8 | BE-026, BE-028 |
| `case_nodes` | `id, case_id, situation, is_terminal, node_index` | Đọc: E7, E8 | |
| `case_options` | `id, node_id, option_text` | Đọc: E7 (`steps`, C3-A), E8 | |
| `cases` | `id, title, course_id, status, learning_mode` | Đọc: mọi API | |
| `courses` | `id, name, course_code, lecturer_id` | Đọc: kiểm chủ khóa, E7 | |
| `users` | `id, full_name, email` | Đọc: E7 (chỉ hàng đợi giảng viên; không có trong E8) | |

## Máy trạng thái `review_study_submissions`

```text
SUBMITTED ──(E6: lecturer feedback)──► REVIEWED ──(E4: student reflection)──► REFLECTED
```
- Chỉ tiến, không lùi; mỗi chuyển là `UPDATE … WHERE submission_status = <nguồn>`.
- E4 đồng thời: `reflection_status NOT_STARTED → SUBMITTED`, `reflection_submitted_at = NOW()`; văn bản phản tư bất biến sau đó (`feature-reflection.md`).
- E6 trên mục tiêu đã có nhận xét → 409, trạng thái bài không đổi (C2-A, PO 2026-11-20). Mỗi mục tiêu tối đa 1 dòng `lecturer_feedback` (kiểm ở tầng ứng dụng trong transaction; DB không có UNIQUE theo mục tiêu).
