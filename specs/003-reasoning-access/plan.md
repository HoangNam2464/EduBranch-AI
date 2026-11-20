# Implementation Plan: 003-reasoning-access

**Spec**: `spec.md`. **Branch**: `fix/reasoning-access`. **Tier**: BE only (FND §3: NestJS gateway, raw SQL qua `DatabaseService`).

## Constitution / boundary check
Không có công nghệ, dependency, route, bảng hay migration mới. Không đổi kiến trúc, nên không cần ADR. Dùng lại các mẫu đã có: `@Roles` cùng `RolesGuard` toàn cục, `@CurrentUser`, `ParseUUIDPipe`, envelope `{ status: "SUCCESS", data }`.

## Thiết kế

### `reasoning.controller.ts`
- Thêm `@Roles("STUDENT")` cho cả 2 route.
- `@Param(..., ParseUUIDPipe)`.
- Truyền `user.id` vào service.

### `reasoning.service.ts`
- `getReasoningById(id, studentId)`:
  - Một câu SQL `JOIN branching_attempts a`, `JOIN cases c`, `WHERE r.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`.
  - Chọn `CASE WHEN a.is_completed THEN o.consequence ELSE NULL END AS consequence`.
  - Nếu không có dòng nào, chạy truy vấn phân loại `SELECT a.student_id, c.status … WHERE r.id = $1`: không có dòng → 404, có dòng → 403.
  - Dữ liệu chỉ lấy từ câu SQL đã lọc. Truy vấn phân loại không trả nội dung.
- `getReasoningsByAttempt(attemptId, studentId)`:
  - Kiểm tra attempt bằng `SELECT a.is_completed … FROM branching_attempts a JOIN cases c … WHERE a.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`.
  - Nếu không có dòng, phân loại 404/403 như trên.
  - Sau đó đọc danh sách với cùng điều kiện lọc trong SQL và cùng biểu thức `CASE`, `ORDER BY r.submitted_at ASC`.

## Test

| File | Nội dung |
|---|---|
| `backend/src/modules/reasoning/reasoning.service.spec.ts` (mới) | Mock `DatabaseService`: SQL có điều kiện `student_id`, `PUBLISHED` và `CASE … is_completed`; 404 và 403; `consequence` null hoặc có giá trị |
| `backend/src/modules/reasoning/reasoning.controller.spec.ts` (mới) | Truyền `user.id`; envelope |
| `backend/test/security-regression.spec.ts` | Thêm `[SEC-OWN-13..]`: sinh viên khác → 403; LECTURER/ADMIN → 403; UUID sai → 400; không JWT → 401 |
| `backend/test/auth-matrix.spec.ts` | Thêm `[RBAC-*]` cho 2 route: STUDENT 200, LECTURER 403, ADMIN 403 |
| `backend/test/feedback-stats.live.spec.ts` hoặc file live mới `reasoning-access.live.spec.ts` (`QA_LIVE=1`, DB tạm) | Chạy SQL thật: attempt chưa xong → `consequence` null; đã xong → có giá trị; case không PUBLISHED → 403 |

## Rủi ro
- Test e2e/matrix dùng service mock: cần cập nhật mock cho chữ ký mới `(id, studentId)`.
- `migration.integration.e2e-spec.ts` lỗi sẵn khi chạy local (checksum V1 do CRLF). Đây là lỗi ngoài phạm vi; CI chạy với `POSTGRES_PORT=1` như lần trước.
