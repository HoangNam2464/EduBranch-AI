# Spec 011 — Kiểm soát quyền đọc case/khóa học (H1–H3) và bổ sung backend còn thiếu từ PR #59

> **Trạng thái**: Được PO cho phép triển khai ngày 2026-11-26 ("Backend: Tạo branch mới từ develop, sửa H1–H3 và bổ sung những phần thực sự còn thiếu từ PR #59. Viết test âm đầy đủ."). Nhánh `fix/case-access-hardening`, tạo từ `develop` `aa5e408`.
> **Nguồn**: kết quả audit PR #87/#59/#74 ngày 2026-11-26 (trình bày trong chat với PO); FND §4–§6 (INV-01); `CLAUDE.md` §4; `ai-service/app/generation/schemas/decision_tree.py`.
> **Jira**: chưa có key cho H1–H3. Theo quyết định D7 của PO, cần tạo task corrective liên kết với BE-016…BE-023; agent không tự tạo.

## 1. Vấn đề

| ID | Route | Lỗi trên `develop` `aa5e408` |
|---|---|---|
| H1 | `GET /cases/:id` | Mọi vai trò không phải STUDENT đều nhận đủ cây (node, option, consequence) của bất kỳ case nào. Giảng viên đọc được cả case DRAFT của giảng viên khác. |
| H2 | `GET /courses/:courseId/cases` | Không kiểm tra chủ khóa học. Sinh viên liệt kê được case `PUBLISHED` của khóa học mình chưa tham gia. |
| H3 | `GET /courses/:courseId` | Không có `@Roles` và không kiểm tra ownership. |

Các phần còn thiếu, lấy lại từ PR #59 và viết mới trên code hiện tại (không copy code của PR #59):
- E: chỉ số node "lơ lửng" trong cây AI sinh ra.
- F: DTO cho đổi trạng thái case.
- G: tranh chấp khi tạo attempt đồng thời.
- H: node kế tiếp thuộc case khác.
- I: reasoning bị ghi trước khi hoàn thành lượt.
- J: DTO cho các request của branching.

## 2. Chính sách (PO 2026-11-26)
- **ADMIN** giữ quyền đọc cần cho quản trị và cho FE-029.
- **LECTURER** chỉ đọc được khóa học và case của khóa do mình phụ trách.
- **STUDENT** mở case `PUBLISHED` bằng link trực tiếp mà không cần ghi danh (OPD-001), nhưng không được duyệt danh mục case của khóa chưa tham gia.

Quy ước mã lỗi: tài nguyên tồn tại nhưng không có quyền → 403; không tồn tại → 404; ID sai định dạng → 400.

## 3. Tiêu chí chấp nhận
- **AC-H1**
  - STUDENT: điều kiện `PUBLISHED` nằm trong SQL; giữ bản rút gọn (projection) dành cho sinh viên; không kiểm tra ghi danh.
  - LECTURER: điều kiện `co.lecturer_id` nằm trong SQL; case của giảng viên khác trả 403.
  - ADMIN: nhận đủ cây.
  - Vai trò không xác định: 403.
- **AC-H2**: khóa không tồn tại → 404; LECTURER chỉ khóa của mình (khác → 403); ADMIN xem tất cả; STUDENT phải đã ghi danh (khác → 403) và chỉ nhận case `PUBLISHED`, chỉ gồm các cột dành cho sinh viên.
- **AC-H3**: khóa không tồn tại → 404; LECTURER chỉ khóa của mình; ADMIN xem tất cả; STUDENT được xem khi đã ghi danh **hoặc** khóa có ít nhất một case `PUBLISHED` (để link trực tiếp vẫn hoạt động — P-1, PO không phủ quyết), chỉ nhận các cột không chứa `lecturer_id`.
- **AC-D**: `ParseUUIDPipe` cho các tham số ID của `case`, `course`, `branching-attempt` controller.
- **AC-E**: `root_node_index` hoặc `next_node_index` khác null nằm ngoài mảng `nodes` → 502, rollback, vẫn ghi audit lỗi. `next_node_index = null` vẫn hợp lệ, vì đây là "terminal path" theo hợp đồng AI.
- **AC-F**: `UpdateCaseStatusDto` dùng `@IsIn`.
- **AC-G**: tạo attempt trong một transaction có `FOR UPDATE` trên case; mã `23505` → 409.
- **AC-H**: node kế tiếp phải thuộc cùng case, không thì 400 và attempt không đổi. Cạnh `null` vẫn là terminal path như hiện nay.
- **AC-I**: lưu reasoning khi lượt chưa hoàn thành → 400.
- **AC-J**: DTO dạng class với `@IsUUID` / `@IsString`. **Không** thêm giới hạn độ dài (quyết định D6).

## 4. Ngoài phạm vi
- **Kiểm tra `PUBLISHED` cho attempt đã tồn tại (INV-01 phía attempt)**: `BLOCKED-ON-D5`; PO phải quyết cho 3 trường hợp: lượt đang làm dở, lượt đã hoàn thành, mở lại lịch sử.
- Endpoint Journey Review riêng, đổi verb của reflection, trigger `V6` của PR #59: đã có sẵn trên `develop` hoặc không cần.
- **Bất nhất có sẵn từ trước, chỉ ghi nhận**: `findTreeViolation` (dùng khi giảng viên sửa node) từ chối option có `next_node_id = null`, trong khi hợp đồng AI cho phép "terminal path".
