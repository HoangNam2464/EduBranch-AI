# Feature Specification: Chặn truy cập trái phép API reasoning (ownership, vai trò, INV-01, ẩn hệ quả)

**Feature Branch**: `fix/reasoning-access` (từ `origin/develop` `55eb9ef`)
**Feature directory**: `specs/003-reasoning-access`
**Created**: 2026-11-21
**Status**: Approved — G0 và G1–G7 đã được PO duyệt ngày 2026-11-21 (nguyên văn trong `record.md` §2). Implement và Converge đã xong; QG1–QG4 PASS. QG5: GitHub CI PASS trên head `5b20fd6`; commit chứa bản đồng bộ tài liệu này tạo head mới, nên CI phải chạy lại và PASS trên head mới. Còn chờ QG6 (PO/Code Owner duyệt và merge) và QG7 (retest trên `develop` sau merge).
**Parent task**: BE-024 (Master `EBA-422`, Jira `EBA-71`) — `docs/03_TASK-DETAILS.md` [71]; deliverable `backend/src/modules/reasoning/*`
**G0**: PO, chat 2026-11-21: "Sửa reasoning" (nguyên văn trong `record.md` §2)
**Loại thay đổi**: sửa quyền/ownership (security) → workflow §4 đầy đủ, không dùng đường bug ngắn (workflow dòng 195)

## 1. Bối cảnh và lý do

- [DỮ-KIỆN] `backend/src/modules/reasoning/reasoning.controller.ts` (develop `55eb9ef`) có 2 route `GET /reasoning/:id` và `GET /branching-attempts/:attemptId/reasonings`. Cả hai không có `@Roles`, không nhận `@CurrentUser`. `reasoning.service.ts` truy vấn theo id mà không lọc theo người dùng.
- [DỮ-KIỆN] Guard toàn cục chỉ yêu cầu JWT hợp lệ (`backend/src/main.ts`), nên **mọi người dùng đã đăng nhập** (sinh viên khác, giảng viên của khóa khác, admin) đều đọc được lập luận và lựa chọn của bất kỳ sinh viên nào nếu biết id.
- [DỮ-KIỆN] `student_reasoning` được ghi ngay ở mỗi bước chọn (`branching-attempt.service.ts:266`), trước khi attempt hoàn thành. Hai route trả `o.consequence`. Vì vậy sinh viên có thể đọc **hệ quả giữa chừng** của chính lựa chọn mình. Điều này vi phạm FND §6 dòng 149–154 ("Consequence text … revealed ONLY here in the REVIEW phase"), `FEATURE-BRANCHING-STUDY.md` FR-BS-03, FR-BS-06 và INV-02.
- [DỮ-KIỆN] Các route không lọc `cases.status = 'PUBLISHED'`, nên vi phạm FND §4 INV-01 (lọc ở mức truy vấn repository).
- [DỮ-KIỆN] Id không phải UUID gây lỗi Postgres `22P02` và trả HTTP 500.
- [DỮ-KIỆN] Frontend trên develop không gọi hai route này (`grep` `frontend/src`, 2026-11-21). Sửa backend không làm hỏng màn hình nào.
- [DỮ-KIỆN] PR #59 (nhánh cũ, conflict với develop) chỉ sửa một phần: lọc sinh viên sở hữu và case PUBLISHED, nhưng vẫn trả `consequence` giữa chừng và vẫn để mọi vai trò khác đọc tự do. Spec này không dùng code của PR #59.

## 2. Người dùng và vai trò

| Vai trò | Được làm | Nguồn |
|---|---|---|
| STUDENT (chủ attempt) | Đọc reasoning của attempt của chính mình, trên case PUBLISHED; chỉ thấy `consequence` khi attempt đã hoàn thành | `FEATURE-AUTH-AND-ROLES.md` §9 ("Role `STUDENT`: All … `/api/v1/reasoning/**`"); FND §4, §6; tiền lệ `BranchingAttemptService.getAttempt` (P0-SEC-02) |
| STUDENT khác | Không được đọc | ownership (tiền lệ `getAttempt`: 403) |
| LECTURER, ADMIN | Không có quyền trên 2 route này | §9 chỉ cấp `/reasoning/**` cho STUDENT. Giảng viên xem hành trình qua `GET /lecturer-feedback/submissions` (spec 002 E7, có kiểm tra chủ khóa học) |

## 3. Phạm vi

**Trong phạm vi**: 2 route trong `ReasoningController` và `ReasoningService`; test backend tương ứng.

**Ngoài phạm vi (giữ nguyên)**: route, đường dẫn và tên trường trả về (trừ giá trị `consequence` khi attempt chưa xong); `PUT /branching-attempts/:id/reasoning`; `BranchingAttemptService`; DB schema (không có migration); frontend; ai-service.

## 4. Acceptance Criteria

Trạng thái: **[PO-ĐÃ-XÁC-NHẬN]** — AC-R1..R6 được PO duyệt cùng G1–G7 ngày 2026-11-21 ("Duyệt, bắt đầu", `record.md` §2). Bằng chứng V cho từng AC: `record.md` §6.

- **AC-R1** (vai trò) [PO-ĐÃ-XÁC-NHẬN]: LECTURER và ADMIN gọi một trong 2 route → 403. Không có JWT → 401 (giữ nguyên).
- **AC-R2** (ownership) [PO-ĐÃ-XÁC-NHẬN]: sinh viên gọi với reasoning hoặc attempt của sinh viên khác → 403. Id không tồn tại → 404. Điều kiện sở hữu nằm trong câu SQL (`a.student_id = $user`), không lọc sau khi đã đọc dữ liệu.
- **AC-R3** (INV-01) [PO-ĐÃ-XÁC-NHẬN]: attempt thuộc case không ở trạng thái `PUBLISHED` → 403, kể cả khi sinh viên là chủ attempt. Điều kiện `c.status = 'PUBLISHED'` nằm trong câu SQL.
- **AC-R4** (ẩn hệ quả) [PO-ĐÃ-XÁC-NHẬN]:
  - Khi `branching_attempts.is_completed = FALSE`, trường `consequence` của mọi dòng trả về là `null`.
  - Khi `TRUE`, trả đúng `case_options.consequence`.
  - Các trường khác giữ nguyên: `situation`, `option_text`, `reasoning_text`, `node_id`, `selected_option_id`, `submitted_at`, `attempt_id`, `id`, và `case_id`, `student_id` ở route theo id.
- **AC-R5** (đầu vào) [PO-ĐÃ-XÁC-NHẬN]: `:id` hoặc `:attemptId` không phải UUID → 400 (`ParseUUIDPipe`, như `case.controller.ts:102`), không còn 500.
- **AC-R6** (hồi quy) [PO-ĐÃ-XÁC-NHẬN]: các test hiện có vẫn pass: `npm test`, `npm run test:e2e` (cách chạy như CI), `test:matrix`, `test:regression`, `npm run build`.

## 5. Mã lỗi

| Tình huống | HTTP |
|---|---|
| Không có hoặc sai JWT | 401 |
| Vai trò không phải STUDENT | 403 |
| Không phải chủ attempt, hoặc case không PUBLISHED | 403 |
| Reasoning hoặc attempt không tồn tại | 404 |
| Id sai định dạng | 400 |

## 6. Truy vết

FND §4 INV-01, §6 (Experience/Review); `FEATURE-AUTH-AND-ROLES.md` §9; `FEATURE-BRANCHING-STUDY.md` FR-BS-03, FR-BS-06, INV-02; `docs/03_TASK-DETAILS.md` [70] BE-023 AC-3, [71] BE-024; `docs/qa/QA-002-REGRESSION-REPORT.md` AC-2 (SEC-OWN-*).

## Clarifications

- Không có câu hỏi mở. Mọi quy tắc đều có nguồn ở §6.
- Phạm vi INV-01 trong spec này: điều kiện là `cases.status = 'PUBLISHED'` cộng quyền sở hữu attempt. Spec không thêm điều kiện ghi danh khóa học: theo FR-BS-01 và OPD-001 → A, liên kết trực tiếp tới case PUBLISHED vẫn hoạt động; chỉ các danh sách (Bàn học, Khóa học của tôi) giới hạn theo lớp đã tham gia. Reasoning chỉ tồn tại trong attempt mà chính sinh viên đã bắt đầu, nên spec này không mở rộng quyền truy cập.
- Quyết định kỹ thuật: dùng `null` (không bỏ trường) khi ẩn `consequence`, để mọi dòng có cùng cấu trúc. Tiền lệ `getAttempt` bỏ trường (`undefined`). Cả hai cách đều không lộ nội dung; frontend không dùng các route này.
