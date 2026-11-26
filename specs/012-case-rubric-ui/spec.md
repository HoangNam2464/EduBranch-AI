# Spec 012 — Màn Rubric chất lượng case (FE-029, Figma 07.8 / 10.8) dùng API BE-033

> **Trạng thái**: PO cho phép triển khai ngày 2026-11-26 với chỉ đạo: "Frontend: Tạo branch mới từ develop, tách FE-029 từ PR #74, tích hợp BE-033 và sửa các lỗi đã phát hiện." Nhánh `feature/case-rubric`, tạo từ `develop` `aa5e408`.
> **Jira**: EBA-93 (FE-029). **Tác giả ban đầu**: PR #74 của Nguyen Duc Huong; phần service, types và test được port lại có chọn lọc.
> **Nguồn**:
> - `docs/design/UX-SCREEN-NOTES.md` mục 07.8 và 10.8.
> - Figma `6CtSgJPKo4jCIbB7WwCaWw`: frame 10.8 `536:8408`, frame 10.6 `535:7980`, đã xem ở chế độ chỉ đọc ngày 2026-11-26.
> - API: `backend/src/modules/evaluation/`.
> - Quyết định PO D3a–D3d, ngày 2026-11-26.

## 1. Quyết định PO (2026-11-26)
- **D3c**:
  - Admin: nút "Xem" trên thẻ case ở 10.6 mở rubric của case đó, tại `/admin/rubric/:caseId`.
  - Giảng viên: thêm nút "Rubric nghiên cứu" trên trang review case, dẫn tới `/lecturer/cases/:caseId/rubric`.
- **D3a**: vào từ sidebar khi chưa chọn case thì không hiện form chấm, chỉ hiện danh sách phiếu đã lưu kèm hướng dẫn chọn case.
- **D3b**: danh sách phiếu gồm mọi phiếu người dùng được phép xem (giảng viên: các khóa của mình; admin: toàn hệ thống). Mỗi phiếu ghi tên case.
- **D3d**: ba tiêu chí ban đầu để trống; nút Lưu bị khóa cho tới khi chấm đủ 3 tiêu chí.

## 2. Tiêu chí chấp nhận
- **AC-1**:
  - Dùng service `/evaluation/rubrics` cho list, get, create, put, delete theo đúng hợp đồng BE-033.
  - Không bao giờ báo "đã lưu" khi API chưa xác nhận.
  - Lỗi 409 (đã chấm case này rồi) → báo cho người dùng và chuyển sang chế độ sửa phiếu của chính họ.
- **AC-2**:
  - Thẻ thông tin case có đủ trạng thái: đang tải, 404, 403, lỗi kèm nút thử lại.
  - Khi 403 (case của giảng viên khác) thì không hiện form chấm.
- **AC-3**:
  - Form chấm có 3 tiêu chí, mỗi tiêu chí là radiogroup 1–5 dùng được bằng bàn phím.
  - Ghi chú tối đa 1000 ký tự, theo Figma.
  - Điểm trung bình hiện "—" cho tới khi chấm đủ 3 tiêu chí.
  - Nếu người dùng đã có phiếu cho case này, form mở ở chế độ sửa với giá trị đã lưu.
- **AC-4**:
  - Danh sách phiếu có đủ trạng thái: đang tải, trống, lỗi kèm nút thử lại.
  - Chỉ được sửa/xóa phiếu của chính mình.
  - Xóa phải xác nhận qua `Dialog` của DS; báo thành công bằng `Toast`.
- **AC-5**: lối vào đúng theo D3c; mục sidebar "Nghiên cứu & Rubric" của admin sáng khi ở `/admin/rubric/<id>`.
- **AC-6**:
  - Đủ chuỗi VI và EN; không có chuỗi hard-code.
  - Key tiếng Anh được đăng ký `PROPOSED`.
  - `l10n-approval-check` exit 0.
- **AC-7**:
  - Dùng token, không dark mode.
  - Hiển thị tốt từ 1024 đến 1920 px, không cuộn ngang; nhãn, nút, số đếm không xuống dòng.
  - Kiểm tra bằng trình duyệt với dữ liệu thật ở 1024 / 1280 / 1440 / 1920, cả VI và EN (R01 §8).
- **AC-8**: `npm run lint`, `npm test`, `npm run build` đều exit 0; có unit test cho mapping và các hàm điều kiện (predicate).

## 3. Phụ thuộc
- FE-029 dùng `GET /cases/:id` và `GET /courses/:courseId` cho cả ADMIN và LECTURER (chủ khóa). Spec 011 (H1–H3) giữ nguyên các quyền này.
- Trạng thái 403 cho giảng viên không phải chủ khóa chỉ xuất hiện sau khi spec 011 đã merge.
