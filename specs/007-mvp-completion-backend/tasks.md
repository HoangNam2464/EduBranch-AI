# Tasks — spec 007

Các task theo thứ tự phụ thuộc. Đánh dấu `[P]` là có thể làm song song (cùng một người thực hiện, khác tệp). Mỗi nhóm task tương ứng một commit riêng.

## Phase 1 — Nền
- [ ] T001 Migration V6, V7, V8 (data-model.md); test migration chạy từ đầu và chạy lại không đổi gì.
- [ ] T002 `common/audit` (AuditService global, `record()` không ném lỗi) + unit test.

## Phase 2 — US1 Hồ sơ (BE-031) → commit `feat(auth): profile update api [BE-031]`
- [ ] T010 DTO `UpdateProfileDto` (fullName 2–100 sau trim, language vi|en, ít nhất 1 trường).
- [ ] T011 `UserService.updateProfile`, `getProfile` trả `language`; `PATCH /users/me`.
- [ ] T012 Unit + e2e: AC-P1..P5.

## Phase 3 — US3 Admin (BE-032) → commit `feat(admin): admin apis and account lock [BE-032]`
- [ ] T020 Auth: kiểm `is_active` ở `login` và `validateToken`; ghi LOGIN_SUCCEEDED/FAILED (AC-A5, AC-A9).
- [ ] T021 [P] Ghi CASE_GENERATED/FAILED (kèm `durationMs`), CASE_STATUS_CHANGED trong `case.service.ts`; MATERIAL_UPLOADED trong `material.service.ts`.
- [ ] T022 Module admin: overview (AC-A2), users + status + role (AC-A3, AC-A4, AC-A13), courses (AC-A6), cases (AC-A7), ai-service (AC-A8), logs (AC-A10), settings (AC-A11).
- [ ] T023 AI service `/health` trả thêm `model` + test.
- [ ] T024 Unit + e2e role-matrix + tích hợp DB: AC-A1..A12.

## Phase 4 — US2 Dashboard giảng viên (BE-030) → commit `feat(course): lecturer dashboard aggregation api [BE-030]`
- [ ] T030 `LecturerDashboardService` + controller `GET /lecturer/dashboard` (AC-D1..D6).
- [ ] T031 Unit + e2e + tích hợp DB với dữ liệu có nhiều attempt và nhiều nhận xét (AC-D3).

## Phase 5 — US4 Rubric và xuất dữ liệu (BE-033) → commit `feat(evaluation): case rubric and anonymized csv export [BE-033]`
- [ ] T040 Tiện ích CSV + mã ẩn danh + unit test.
- [ ] T041 CRUD rubric (AC-R1..R3, AC-R6).
- [ ] T042 Export `activity` và `rubrics` (AC-R4, AC-R5).
- [ ] T043 Unit + e2e + tích hợp DB kiểm tra không lộ PII.

## Phase 6 — Hội tụ
- [ ] T050 QG1: build, unit, e2e, matrix, regression; pytest phần health.
- [ ] T051 QG2: review độc lập (subagent reviewer, không phải người implement).
- [ ] T052 Cập nhật `record.md` (lệnh, exit code, SHA); `docs/database/DATA-MODEL.md` (bảng mới); `docs/api` nếu có danh mục route.

Ngoài phạm vi: hành động sao lưu (PO: chỉ hiển thông tin), sửa FE.
