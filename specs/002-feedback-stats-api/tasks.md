# Tasks — 002-feedback-stats-api

Truy vết: Parent (BE-025 EBA-72 / BE-026 EBA-73 / BE-028 EBA-75) → FR → task → test. `[P]` = chạy song song được (khác file). `BLOCKED-ON-Cn` = chờ PO trả lời câu Clarify Cn (open-decision rule). Implementer: Antigravity qua `.agent-handoff/BE-025-026-028.md` (Phase 1–5); Claude review (QG2). FE (Phase 6): xem ghi chú Phase 6.

## Phase 1 — Setup
- [x] T001 Xác nhận 3 module đã import trong `backend/src/app.module.ts` (đã thấy: dòng 15–17, 42–44) và `DatabaseModule` là `@Global` — không sửa file. Test: build.

## Phase 2 — Nền tảng chung
- [x] T002 [P] `backend/src/modules/review-study/dto/submit-review-study.dto.ts`, `dto/submit-reflection.dto.ts`: `class-validator` + `@Transform(trim)`, min 10 / max 3000 (FR-04, FR-05). Test: T012.
- [x] T003 [P] `backend/src/modules/lecturer-feedback/dto/create-lecturer-feedback.dto.ts` (validator XOR tùy biến, FR-10), `dto/submission-queue-query.dto.ts` (`@IsUUID` tùy chọn). Test: T021.
- [x] T004 Ánh xạ row → DTO camelCase (hàm thuần trong từng service; không trả raw row, FR-19). Test: unit từng service.

## Phase 3 — US1 + US3 Review Study (BE-025)
Route theo C1-A (PO 2026-11-20), xem `contracts/api.md` §A.
- [x] T010 `review-study.service.ts`: `submit` (R-INV01, `REVIEW_STUDY`, 23505 → 409) — FR-01, FR-02, FR-04.
- [x] T011 `review-study.service.ts`: `getMine`, `getById` (STUDENT chủ + INV-01 / LECTURER chủ khóa) — FR-06.
- [x] T012 `review-study.service.ts`: `submitReflection` (UPDATE có điều kiện `REVIEWED`; 404/403/409) — FR-03, FR-07.
- [x] T013 `review-study.service.ts`: `getFeedback` (`{ feedback }` hoặc `null`, chủ bài) — FR-08.
- [x] T014 `review-study.controller.ts` E1–E5 theo C1-A.
- [x] T015 [P] `review-study.service.spec.ts`: mọi nhánh T010–T013 (gồm race: UPDATE trả 0 dòng).
- [x] T016 [P] `review-study.controller.spec.ts`: envelope, `@Roles`, `ParseUUIDPipe` .

## Phase 4 — US2 Lecturer Feedback (BE-026)
- [x] T020 `lecturer-feedback.service.ts` `create`: transaction, `FOR UPDATE`, chủ khóa, Branching phải hoàn thành, Review Study `SUBMITTED → REVIEWED` — FR-09..12. Mục tiêu đã có nhận xét → 409 (C2-A, FR-20).
- [x] T021 `lecturer-feedback.service.ts` `getQueue`: 2 truy vấn + gộp + sắp; lọc `courseId`/`caseId` có kiểm chủ — FR-13.
- [x] T022 `lecturer-feedback.controller.ts`: `POST lecturer-feedback`, `GET lecturer-feedback/submissions`, `@Roles("LECTURER")`.
- [x] T023 Trường `steps` cho mục Branching trong `getQueue` (C3-A), thứ tự `submitted_at`, không có `consequence`.
- [x] T024 [P] `lecturer-feedback.service.spec.ts`, `lecturer-feedback.controller.spec.ts`: XOR, 403 chủ khóa, 409 attempt chưa xong, chuyển `REVIEWED`, rollback khi lỗi.

## Phase 5 — US4 Statistics (BE-028)
- [x] T030 `statistics.service.ts`: chủ khóa; truy vấn tổng hợp Branching (FR-14..17) và Review Study (FR-17); chia 0; làm tròn 1 chữ số; option/outcome 0 lượt có mặt; không dữ liệu định danh (FR-18).
- [x] T031 `statistics.controller.ts`: `@Controller()` + `@Get("cases/:caseId/statistics")`, `@Roles("LECTURER")`.
- [x] T032 [P] `statistics.service.spec.ts`, `statistics.controller.spec.ts`: case rỗng, case Review Study, không chủ → 403, DTO không chứa khóa `student*`.

## Phase 6 — Kiểm thử tích hợp và FE
- [x] T040 `backend/test/feedback-stats.e2e-spec.ts`: supertest + guard thật + DB mock; ma trận 6 vai (không token, STUDENT chủ, STUDENT khác, LECTURER chủ, LECTURER khác, ADMIN) × E1–E8; 400/409. Phụ thuộc T014.
- [x] T041 `backend/test/feedback-stats.live.spec.ts` (opt-in `QA_LIVE=1`): seed tối thiểu bằng SQL trên Postgres docker, chạy luồng quickstart 1–6, kiểm UNIQUE, CHECK `chk_feedback_one_target`, race 2 lần nộp phản tư đồng thời, dọn dữ liệu seed.
- [x] T042 QG1: `npm ci && npm run build && npm test -- --runInBand && npm run test:e2e -- --runInBand` (+ T041) — ghi lệnh, exit code.
- [ ] T050 (Claude, sau khi PR BE mở) Sửa `frontend/src/services/reviewStudyService.ts` + `mappers/reviewStudy.ts` theo C1-A trên `feature/review-feedback` (#69); `getFeedback` đọc `{ feedback }`.
- [ ] T051 Sửa #68 `feature/lecturer-feedback` theo E6/E7 + finding review (nuốt lỗi, `fb-${Date.now()}`, `err.message`, i18n, test, registry l10n, xung đột `components/feedback/index.ts` với #69).
- [ ] T052 Sửa #69 `feature/review-feedback` (mở khóa phản tư chỉ khi tải được nhận xét, lỗi tải nhận xét, spec thật + `package.json`, i18n, registry).
- [ ] T053 Sửa #70 `feature/statistics` theo E8 (bỏ overview, trạng thái lỗi, lint `set-state-in-effect`, spec thật + `package.json`, i18n, registry; không thư viện chart).
- [ ] T054 QG3 Visual QA từng frame của #68/#69/#70 so với Figma (đọc file key/page/frame ID từ Figma trước khi so; verifier độc lập `visual-qa-verifier`).

## Phase 7 — Converge
- [ ] T060 `/speckit-converge`: FR → task → code → test; T/I/V từng AC (BE-025 AC-1..3, BE-026 AC-1..3, BE-028 AC-1..3, FR-06/08/13 [ĐỀ-XUẤT]); đề xuất diff `03_TASK-DETAILS.md`/`DATA-FLOW.md` theo C1.

## Dependencies
T002–T004 → T010–T013 → T014 (C1) → T016, T040. T003 → T020–T022 → T023 (C3) → T024. T030 → T031 → T032. Tất cả BE → T042 → PR BE → T050–T054.
Độc lập với C1–C3 và làm được ngay sau G7: T001–T004, T010–T013, T015, T020 (trừ nhánh C2), T021, T022, T024, T030–T032.
