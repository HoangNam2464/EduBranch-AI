# Record — spec 011 (case/course read access H1–H3 + backend hardening)

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. Nội dung tiếng Việt.
> **Created**: 2026-11-26.
> Nhánh `fix/case-access-hardening` tạo từ `develop` `aa5e408`.
> **Người triển khai**: Antigravity (gói bàn giao `.agent-handoff/CASE-ACCESS-HARDENING.md`, chỉ lưu cục bộ, không commit).
> **Người review**: Claude. Claude không viết code backend của spec này.

## 1. Trạng thái gate
| Gate | Trạng thái | Ghi chú |
|---|---|---|
| Ủy quyền | PASS | PO trong chat ngày 2026-11-26: "Backend: Tạo branch mới từ develop, sửa H1–H3 và bổ sung những phần thực sự còn thiếu từ PR #59. Viết test âm đầy đủ." P-1 (sinh viên xem được thông tin khóa học khi đã ghi danh hoặc khi khóa có case `PUBLISHED`): PO không phủ quyết. |
| QG1 | PASS (cục bộ) | §3 |
| QG2 | PASS | §4. Review độc lập: Claude review mã do Antigravity viết. |
| QG3 | Không áp dụng | Không đổi frontend. |
| QG4 | PASS | Không đổi chuỗi i18n; không có secret trong diff. |
| QG5 | PASS | CI của PR #88 (Backend CI) success trên HEAD được merge. |
| QG6 | PASS | PO ra lệnh admin-merge PR #88 trực tiếp trong chat ngày 2026-11-26 (policy 02 §7). Merge `c94c954` vào `develop`. |
| QG7 | PASS | Kiểm tra lại trên `develop`:<br>• `c94c954`: unit 393, e2e 337 pass / 43 skip (live), matrix 26/26, regression 44/44, kiểm tra quyền qua HTTP 26/26, CI trên `develop` success.<br>• `cf3a6a5` (clone sạch, 2026-11-27): unit 410/410, e2e 337 pass / 43 skip, matrix 26/26, regression 44/44, `start:prod` và Docker chạy được.<br>Jira: task corrective EBA-112 (Done). Phần INV-01 cho attempt đã tồn tại vẫn `BLOCKED-ON-D5` (EBA-113). |

## 2. Phạm vi
- AC-H1, AC-H2, AC-H3, AC-D, AC-E, AC-F, AC-G, AC-H, AC-I, AC-J theo `spec.md` §3.
- `BLOCKED-ON-D5`: kiểm tra trạng thái case cho attempt đã tồn tại.
- Không lấy lại các phần sau của PR #59:
  - Endpoint Journey Review: đã có sẵn trên `develop`.
  - Đổi verb của reflection sang `PATCH`: không cần.
  - Trigger `V6`: trùng số migration với `develop`.
  - Phần reasoning: lỗi thời từ khi PR #77 merge.
  - Quy tắc "cạnh `null` chỉ hợp lệ ở node terminal": sai so với hợp đồng AI về terminal path (`decision_tree.py` dòng 16 và 49–51), nếu áp dụng sẽ làm gãy các case do AI sinh.

## 3. QG1 — Lệnh do Claude tự chạy (2026-11-26, Windows, PostgreSQL 16 trong Docker)
DB dev `edubranch_ai` không bị dùng. Mọi lần chạy cần DB đều dùng DB tạm và đã xóa sau khi xong.

| Lệnh (`backend/`) | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | — |
| `npm test -- --runInBand` | 0 | 39 suite, 393/393 |
| `POSTGRES_DB=edubranch_qg_tmp npx jest --config ./test/jest-e2e.json --runInBand` | 0 | 11 suite PASS, 5 suite skip (live/AI/MinIO); 337 pass, 43 skip. Có `migration.integration` (V1–V8), `case-access.integration` (11/11, chạy thật, không có dòng skip trong log) và `case-access-http` (21) |
| `npm run test:matrix` | 0 | 26/26 |
| `npm run test:regression` | 0 | 44/44 |

**HTTP thật.**
- Môi trường: backend của nhánh chạy bằng `node dist/src/main.js` ở cổng 8091, trên DB tạm `edubranch_live_tmp` đã migrate V1–V8. Seed: giảng viên A và B, ADMIN, sinh viên S đã ghi danh khóa A, sinh viên T không ghi danh khóa nào; khóa A, B, C.
- JWT được ký trong process; secret không bị in ra.
- **Kết quả trên nhánh: 26/26 PASS.**
- **Đối chứng trên `develop` `aa5e408`** (cùng dữ liệu, DB tạm `edubranch_live_base`): **12/26 PASS, 14 ca fail**:
  - B đọc được case DRAFT và PUBLISHED của A, nhận 200;
  - B liệt kê được case của khóa A;
  - S và T liệt kê được case của khóa chưa tham gia;
  - `lecturer_id` lộ cho sinh viên;
  - T đọc được khóa C (không có case `PUBLISHED`);
  - khóa không tồn tại trả 200 với mảng rỗng;
  - ID sai định dạng trả **500**.

| Ca | Người gọi | Route | Nhánh | `develop` |
|---|---|---|---|---|
| H1-2 / H1-3 | B | `GET /cases/{dA, pA}` | 403 | 200 |
| H1-5 / H1-6 | S / T | `GET /cases/{pA, pB}` | 200, không có cây | 200 |
| H2-2 | B | `GET /courses/A/cases` | 403 | 200 |
| H2-4 | S | `GET /courses/A/cases` | 200, chỉ `PUBLISHED`, các cột rút gọn | 200, đủ mọi cột |
| H2-5 / H2-6 | S / T | `GET /courses/{B, A}/cases` | 403 | 200 |
| H3-2 | B | `GET /courses/A` | 403 | 200 |
| H3-4 / H3-5 | S / T | `GET /courses/{A, B}` | 200, không có `lecturer_id` | 200, có `lecturer_id` |
| H3-6 | T | `GET /courses/C` | 403 | 200 |
| D-1..3 | — | ID sai định dạng | 400 | 500 |

## 4. QG2 — Review độc lập (Claude)
- Đã đọc toàn bộ diff:
  - `case.service`, `course.service`, `branching-attempt.service` và 3 controller;
  - 4 DTO mới;
  - 2 suite test mới và 4 suite test có sẵn bị sửa.
- **Không có finding chặn merge.** Các điểm đã xác minh:
  - Mọi điều kiện ownership và hiển thị đều nằm trong SQL và dùng tham số `$n`.
  - Các caller nội bộ của `getCaseById(..., "LECTURER", lecturerId)` vẫn đúng.
  - `getCourseById` nội bộ không đổi.
  - Mục E dựa trên việc `root_node_index` là `int` bắt buộc trong response của AI (`ai-service/app/generation/schemas/requests.py:41`).
  - `chooseOption` chỉ gọi `getAttempt` sau `COMMIT`/`release`.
  - Không có kiểm tra trạng thái case cho attempt đã tồn tại (đúng phạm vi D5).
- **Test có sẵn bị sửa** (`auth-matrix`, `security-regression`, `security.e2e`, `course-enrollment`): chỉ đổi ID sang UUID hợp lệ và payload `{nodeId, selectedOptionId}`. Số dòng assertion và tập mã trạng thái kỳ vọng không đổi; không có assertion nào bị làm yếu.
- **Low (ghi nhận, không sửa)**: helper `itDb` của suite DB thật "pass" mà không làm gì khi không kết nối được PostgreSQL (CI không có DB). Đây là quy ước sẵn có của `mvp-completion.integration.e2e-spec.ts`. Bằng chứng chạy thật nằm ở §3.

## 5. Phát hiện ngoài phạm vi (báo PO, không sửa trong spec này)
1. **Checksum migration theo CRLF.**
   - Checkout chính của PO có `backend/migrations/V1__init_schema.sql` dạng CRLF (`git ls-files --eol`: `w/crlf`), dù `.gitattributes` quy định `*.sql eol=lf`.
   - DB dev `edubranch_ai` đã lưu checksum tính từ bản CRLF.
   - Bất kỳ bản clone hoặc worktree mới nào (LF) chạy trên DB này sẽ gặp lỗi "checksum mismatch V1". `migration.integration` fail đúng như vậy khi Antigravity chạy trên `edubranch_ai`.
   - DB mới hoặc CI thì không bị ảnh hưởng.
   - Hướng xử lý cần PO quyết: chuẩn hóa line ending trước khi tính checksum trong `migration-runner.ts`, hoặc checkout lại các file `.sql` ở máy cục bộ.
2. **Rule B1.**
   - `npm run build` sinh ra `dist/src/main.js`, không có `dist/main.js`.
   - Vì vậy `start:prod` / `CMD` của Docker chạy `node dist/main` sẽ lỗi. Container `edubranch_backend` đang ở trạng thái `Exited (1)`; chưa xác minh đây có phải nguyên nhân.
   - Hạng mục này đã được xếp vào PR 2 Backend.
3. **Bất nhất validator.** `findTreeViolation` (dùng khi giảng viên sửa node) từ chối option có `next_node_id = null`, trong khi hợp đồng AI dùng `null` cho terminal path.
