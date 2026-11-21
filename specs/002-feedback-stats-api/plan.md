# Implementation Plan: 002-feedback-stats-api

**Branch**: `feature/feedback-stats-backend` (từ `origin/develop` `15ce434`) | **Date**: 2026-11-20 | **Spec**: `spec.md` | **Contract**: `contracts/api.md`

## Summary
Hiện thực 3 module backend đang là skeleton (`review-study`, `lecturer-feedback`, `statistics`) bằng NestJS + SQL thô qua `DatabaseService`, theo contract E1–E8. Không migration, không dependency mới, không chạm AI service. Sau khi BE merge, sửa 3 PR FE (#68/#69/#70) và service FE-018 theo contract đã duyệt.

## Technical Context
- **Language/Version**: TypeScript, NestJS 10, Node 20 (CI) — [DỮ-KIỆN] `backend/package.json`, `.github/workflows/backend-ci.yml`
- **Storage**: PostgreSQL 16, SQL thô qua `pg` Pool (`common/database/database.service.ts`); transaction theo mẫu `branching-attempt.service.ts` (`FOR UPDATE`)
- **Testing**: Jest unit (`src/**/*.spec.ts`, mock `DatabaseService`), Jest e2e HTTP (`test/*.e2e-spec.ts`, supertest + guard thật, mẫu `test/challenge-support.e2e-spec.ts`), test SQL trực tiếp với Postgres docker (opt-in `QA_LIVE=1`, mẫu `test/helpers/qa-live.ts`)
- **Constraints**: FND §3 (backend là chủ dữ liệu), §4 INV-01, §6.1.2 (không chấm điểm), §8 (DTO `class-validator`, không trả raw row)
- **Scale**: lớp MVP; không phân trang [ĐỀ-XUẤT]

## Constitution Check (`.specify/memory/constitution.md` → AGENTS.md, FND, workflow)
| Kiểm | Kết quả |
|---|---|
| FND §3 ranh giới | PASS — toàn bộ ở Backend Gateway; FE chỉ gọi `/api/v1` |
| FND §4 INV-01 | PASS (thiết kế) — R-INV01 lọc `c.status = 'PUBLISHED'` trong truy vấn sinh viên |
| FND §5 | Không áp dụng (không sửa cây) |
| FND §6 | PASS — không trường điểm/xếp hạng; không gọi AI |
| FND §7 | Nhánh `feature/feedback-stats-backend`, commit `feat(review-study|lecturer-feedback|statistics): … [BE-025|BE-026|BE-028]` |
| Công nghệ/ranh giới mới (ADR) | Không có |
| AGENTS.md rule 7 (không route/field không nguồn) | Mỗi route/field có nguồn hoặc `[ĐỀ-XUẤT]` (contract); C1–C3 đã được PO trả lời 2026-11-20 (C1-A, C2-A, C3-A) |

## Project Structure (file sẽ chạm)

```text
backend/src/modules/review-study/
  review-study.module.ts            (sửa: providers, import DatabaseModule nếu cần)
  review-study.controller.ts        (viết lại skeleton → E1–E5)
  review-study.service.ts           (mới)
  review-study.service.spec.ts      (mới)
  review-study.controller.spec.ts   (mới)
  dto/submit-review-study.dto.ts    (mới)
  dto/submit-reflection.dto.ts      (mới)
backend/src/modules/lecturer-feedback/
  lecturer-feedback.module.ts       (sửa)
  lecturer-feedback.controller.ts   (viết lại → E6, E7)
  lecturer-feedback.service.ts      (mới)
  lecturer-feedback.service.spec.ts (mới)
  lecturer-feedback.controller.spec.ts (mới)
  dto/create-lecturer-feedback.dto.ts (mới; validator XOR tùy biến)
  dto/submission-queue-query.dto.ts (mới)
backend/src/modules/statistics/
  statistics.module.ts              (sửa)
  statistics.controller.ts          (viết lại → E8; route `cases/:caseId/statistics`, @Controller() không prefix)
  statistics.service.ts             (mới)
  statistics.service.spec.ts        (mới)
  statistics.controller.spec.ts     (mới)
backend/test/
  feedback-stats.e2e-spec.ts        (mới; HTTP + ma trận quyền, DB mock)
  feedback-stats.live.spec.ts       (mới; SQL thật, opt-in QA_LIVE=1)
```
Không chạm: `backend/migrations/**`, `infrastructure/**`, `ai-service/**`, `app.module.ts` (3 module đã được import — kiểm lại ở T001), `package.json`.

## Thiết kế theo tầng

**API/BE**
- Controller dùng `@Controller()` không prefix (mẫu `branching-attempt.controller.ts`) để route đúng contract; `@Roles("STUDENT")`/`@Roles("LECTURER")`; `ParseUUIDPipe` cho tham số.
- `review-study.service.ts`: `submit`, `getMine`, `getById(user)`, `submitReflection` (UPDATE có điều kiện, phân biệt 404/403/409 bằng SELECT sau khi UPDATE trả 0 dòng), `getFeedback`.
- `lecturer-feedback.service.ts`: `create` (transaction `BEGIN…COMMIT`, `FOR UPDATE` trên mục tiêu, kiểm chủ khóa, cập nhật `REVIEWED`), `getQueue` (2 truy vấn: Review Study và Branching hoàn thành, gộp và sắp ở service; `existingFeedback` bằng LEFT JOIN `lecturer_feedback` (tối đa 1 dòng/mục tiêu, C2-A); `steps` cho mục Branching (C3-A)).
- `statistics.service.ts`: kiểm chủ khóa → 4–6 truy vấn tổng hợp `COUNT(*)::int` (attempt, theo sinh viên, theo option `LEFT JOIN` để giữ option 0 lượt, theo outcome, review status). Làm tròn `completionRate`/`percentage` 1 chữ số ở service.
- Lỗi DB `23505` (UNIQUE) → `ConflictException`; `23514` (CHECK) → `BadRequestException` (phòng thủ, DTO đã chặn trước).
- Validator XOR: custom `@ValidatorConstraint` trong `create-lecturer-feedback.dto.ts` (không dependency mới).

**DB**: không đổi. Index sẵn có đủ (`idx_rs_submissions_case_id`, `idx_attempts_case_id`, `idx_feedback_submission_id`, `idx_feedback_attempt_id`, `idx_reasoning_attempt_id`).

**AI**: không đổi.

**FE (sau khi BE được duyệt — thực hiện trên nhánh của Hương)**
- `reviewStudyService.ts` (develop, FE-018 + PR #69): đổi route theo C1-A; `getFeedback` đọc `{ feedback }` (`LecturerFeedback | null`), không nuốt lỗi; bỏ `getSubmissionsByCourse`; mapper không tự bịa `submittedAt` (`new Date()` trong `mappers/reviewStudy.ts`).
- `lecturerFeedbackService.ts` (#68): route E6/E7, không nuốt 404/501, kiểu theo `SubmissionQueueItemDto`, không bịa `fb-${Date.now()}`.
- `statisticsService.ts` (#70): một hàm `getCaseStatistics(caseId)` gọi E8, bỏ `overview`; trạng thái lỗi riêng; sửa cảnh báo lint `set-state-in-effect`.
- Các finding FE còn lại (i18n `common.*`, `err.message` thô, spec tautology, `package.json` test list, registry l10n PROPOSED, xung đột `components/feedback/index.ts`, Visual QA) — xử lý theo tasks Phase 6.

## Tests & evidence
| Lớp | Lệnh | Bao phủ |
|---|---|---|
| Unit | `cd backend && npm test -- --runInBand` | mọi nhánh service (FR-01..19), mapping DTO, làm tròn, chia 0 |
| E2E HTTP | `npm run test:e2e -- --runInBand` | ma trận quyền 6 vai × 8 route, 400/401/403/404/409, envelope |
| SQL thật | `QA_LIVE=1 npx jest test/feedback-stats.live.spec.ts --runInBand` (docker postgres) | truy vấn chạy trên schema V1–V5 thật, UNIQUE/CHECK, race reflection |
| Build | `npm run build` | tsc |

## Risks
- RISK-1 Ràng buộc chủ khóa dựa `courses.lecturer_id`; khóa bị archive (`is_active = FALSE`) vẫn cho xem/nhận xét — [DỮ-KIỆN] nguồn không cấm; ghi nhận.
- RISK-2 Không có cổng ghi danh (OPD-001 mở) — sinh viên có id case PUBLISHED nộp được bài; giống `branching-attempt` trên `develop`.
- RISK-3 PR #59 (BE-022) có thể đổi cách ghi `is_completed`/`outcome_node_id`; thống kê đọc cột, không phụ thuộc code PR #59.
- RISK-4 Jira BE-025/026/028 đang gán Đức Anh — PO phải báo và chuyển người trước khi code (tránh trùng việc như BE-017/FE-021).
