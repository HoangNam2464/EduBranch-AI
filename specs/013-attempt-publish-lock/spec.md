# Spec 013 — Khóa case đã có attempt và INV-01 cho attempt (D5)

> **Nguồn**:
> - Quyết định PO ngày 2026-11-27 trong chat: "Case đã có ít nhất một attempt thì không được chuyển từ `PUBLISHED` về `DRAFT`. Case chưa có attempt vẫn được chỉnh sửa như hiện tại. Attempt đang làm dở được tiếp tục đến terminal; attempt hoàn thành và reflection vẫn được xem lại." và "OPD-007: Chức năng versioning case để Post-MVP."
> - `docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md` §0.A, PSD-11.
> - FND §4–§6 (INV-01).
> - `specs/011-case-access-hardening/spec.md` §4 (`BLOCKED-ON-D5`).
>
> **Jira**: EBA-113 (BE-020 corrective). Nhánh `fix/attempt-publish-lock` tạo từ `develop` `a538afe`.

## 1. Vấn đề
Trên `develop`, backend cho phép `PUBLISHED → DRAFT` bất kể đã có sinh viên làm hay chưa. Sau khi case về `DRAFT`:
- giảng viên sửa được cây, trong khi attempt của sinh viên vẫn trỏ tới các node đó;
- năm đường attempt của sinh viên (`getAttempt`, `chooseOption`, `saveRetrospectiveReasoning`, `submitReflection`, `getAttemptsByCase`) vẫn chạy, nên sinh viên thấy nội dung không `PUBLISHED`. Điều này trái INV-01.

## 2. Hành vi yêu cầu
- **AC-1:** `PATCH /cases/:caseId/status` từ `PUBLISHED` về `DRAFT` trả **409** khi case có ít nhất một attempt. Trạng thái và attempt giữ nguyên; không ghi audit.
- **AC-2:** case `PUBLISHED` chưa có attempt vẫn về được `DRAFT` như trước. Các chuyển trạng thái khác không đổi.
- **AC-3:** không có race giữa "bắt đầu attempt" và "về `DRAFT`". Hai thao tác khóa cùng một hàng `cases` (`FOR UPDATE`), nên chỉ xảy ra một trong hai kết quả nối tiếp:
  - attempt tạo trước, thì lệnh về `DRAFT` nhận 409;
  - lệnh về `DRAFT` chạy trước, thì việc bắt đầu attempt nhận 403.

  Không bao giờ có case `DRAFT` mà có attempt.
- **AC-4:** trạng thái được đọc lại khi đã khóa. Nếu trạng thái đổi giữa lúc kiểm tra và lúc khóa, trả 409 và không ghi đè.
- **AC-5:** attempt đang làm dở trên case `PUBLISHED` đi tiếp được tới terminal; attempt đã hoàn thành, Journey Review và reflection vẫn xem lại và nộp được như trước (OPD-003).
- **AC-6:** với dữ liệu cũ (case đã rời `PUBLISHED` trước khi có quy tắc này):
  - sinh viên nhận **403** ở `getAttempt`, `chooseOption`, `saveRetrospectiveReasoning`, `submitReflection`;
  - `getAttemptsByCase` trả danh sách rỗng;
  - không ghi gì vào DB.

  Kiểm tra quyền sở hữu luôn chạy trước kiểm tra trạng thái, nên sinh viên khác không biết được trạng thái case. Phần đọc reasoning vốn đã lọc `PUBLISHED`.
- **AC-7:** giao diện của giảng viên không bị chặn bởi quy tắc chỉ dành cho sinh viên.

## 3. Ngoài phạm vi
- **Versioning case sau xuất bản (OPD-007):** để Post-MVP.
- **Giới hạn số lượt làm lại (OPD-004):** vẫn mở.
- **Bài nộp Review Study:** quyết định D5 nói về attempt. Có áp dụng khóa tương tự cho case Review Study đã có bài nộp hay không là câu hỏi riêng cho PO.
- **Frontend:** không đổi. Thanh điều phối `03.6` vốn không có nút chuyển `PUBLISHED` về `DRAFT`.
