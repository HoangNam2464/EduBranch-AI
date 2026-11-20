# Tasks: 003-reasoning-access

Parent: BE-024 (`EBA-71`) → subfeature "reasoning read access" → BE / QA.

- [x] **T001** [BE] `backend/src/modules/reasoning/reasoning.controller.ts`: thêm `@Roles("STUDENT")`, `ParseUUIDPipe`, `@CurrentUser`, truyền `user.id`. Phục vụ AC-R1, AC-R5. Chứng minh bằng T004, T005.
- [x] **T002** [BE] `backend/src/modules/reasoning/reasoning.service.ts`: lọc ownership và `PUBLISHED` trong SQL; phân loại 404/403; ẩn `consequence` bằng `CASE WHEN a.is_completed`. Phục vụ AC-R2, AC-R3, AC-R4. Chứng minh bằng T003, T006.
- [x] **T003** [QA] `backend/src/modules/reasoning/reasoning.service.spec.ts`, `reasoning.controller.spec.ts` (mới): unit test theo `plan.md`. Phục vụ AC-R2..R4.
- [x] **T004** [QA] `backend/test/security-regression.spec.ts`: thêm SEC-OWN cho 2 route (sinh viên khác 403, LECTURER/ADMIN 403, UUID sai 400, không JWT 401). Phục vụ AC-R1, AC-R2, AC-R5.
- [x] **T005** [QA] `backend/test/auth-matrix.spec.ts`: thêm RBAC cho 2 route. Phục vụ AC-R1.
- [x] **T006** [QA] Test live SQL (`QA_LIVE=1`, DB tạm `zz_*`, theo mẫu `feedback-stats.live.spec.ts`): consequence null hoặc có giá trị, case không PUBLISHED, sinh viên khác. Phục vụ AC-R2..R4.
- [x] **T007** [QA] Chạy hồi quy: `npm run build`, `npm test`, `npm run test:e2e` (cách chạy như CI), `test:matrix`, `test:regression`, live. Phục vụ AC-R6.
- [x] **T008** [Converge] Đối chiếu AC → code → test (T/I/V), ghi `record.md`.

Phụ thuộc: T001 và T002 trước T003–T006; T007 sau cùng; T008 sau T007.
Mỗi task chỉ sửa file đã ghi. Không đụng frontend, DB, ai-service, `branching-attempt/*`.
