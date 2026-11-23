# Feature Specification: App giãn theo màn hình, toast không che nội dung

**Feature Branch**: `fix/app-fluid-layout` (từ `origin/develop` `6f903f2`)
**Feature directory**: `specs/006-app-fluid-layout`
**Created**: 2026-11-21 · **Status**: Draft, chờ G1–G6 (PO có thể duyệt gộp) và G7
**Parent**: FE-025 (Shared App Shell, Jira `EBA-88`); màn hình liên quan FE-026, FE-018
**G0**: PO, chat 2026-11-21: "Tràn theo màn hình" + "Chỉ trong app" (nguyên văn trong `record.md`)

## 1. Bối cảnh

- [DỮ-KIỆN] `frontend/src/layouts/shell/AppShell.tsx:83` bọc toàn bộ nội dung app trong `mx-auto max-w-7xl` (1280px). Trên màn 1920px, nội dung bắt đầu từ x=368, hai bên là khoảng trống lớn. PO nhận xét: "bị bóp hẹp giao diện, web thực tế không ai làm kiểu vậy".
- [DỮ-KIỆN] Quyết định PO ngày 2026-11-21 thay thế "Centered Container Mandate" (2026-11-17) và ghi chú 2026-11-20, **chỉ trong phạm vi app shell**. Landing, header công khai, footer và các trang đăng nhập/đăng ký vẫn giữ `max-w-7xl`.
- [DỮ-KIỆN] `frontend/src/components/ds/Toast.tsx:71` đặt toast ở `fixed top-24 right-8`, ngay dưới header. Khi hiện, toast đè lên thẻ nội dung người dùng đang xem (ảnh PO 2026-11-21: toast "Course archived" che thẻ "Course details").
- [DỮ-KIỆN] Discover vòng 0 ngày 2026-11-21: bỏ giới hạn trên bản nháp, chụp 13 màn × 3 độ rộng (1366, 1920, 2560). Kết quả:
  - Không màn nào tràn ngang.
  - Đoạn văn dài (bối cảnh case trong màn Review Study) kéo dài khoảng 150 ký tự mỗi dòng ở 1920px, khó đọc.
  - Màn Review Study hiện nguyên chuỗi key `g5.reviewStudy.oneSubmissionNote` vì key này chưa có trong file ngôn ngữ.

## 2. Phạm vi

**Trong phạm vi**
- Bỏ giới hạn độ rộng của app shell, giữ lề hai bên cố định.
- Giới hạn độ dài dòng của các khối văn bản dài cho dễ đọc.
- Đổi vị trí toast.
- Thêm key i18n đang thiếu.

**Ngoài phạm vi, giữ nguyên**
- Landing, auth, sidebar, header (nội dung và chiều cao), routes, API, dữ liệu.
- Admin Dashboard đang có dữ liệu bịa (`AdminDashboardPage.tsx:323` `|| 186`; nhật ký viết cứng ở dòng 544). Đây là lỗi riêng của FE-031, sẽ báo PO và xử lý ở spec khác.

## 3. Acceptance Criteria (tất cả là [ĐỀ-XUẤT] cho tới khi PO duyệt)

- **AC-F1 (app tràn màn hình)**:
  - Mọi màn trong app shell (giảng viên, sinh viên, admin) dùng hết chiều rộng còn lại sau sidebar.
  - Lề trái/phải giữ như hiện tại: 12px (<640), 24px (≥640), 32px (≥1024).
  - Không còn khoảng trống thừa hai bên ở 1920px và 2560px.
  - Header (tiêu đề + nút) và nội dung bắt đầu cùng một mép trái.
- **AC-F2 (không vỡ bố cục)**: ở 1280, 1366, 1440, 1920 và 2560px:
  - Không màn nào tràn ngang.
  - Không phần tử nào bị cắt.
  - Lưới thẻ và bảng giãn theo chiều rộng.
  - Cột phụ cố định (ví dụ "Chi tiết khóa học") giữ kích thước, cột chính giãn ra.
- **AC-F3 (dễ đọc)**: đoạn văn dài (bối cảnh case, vấn đề, mô tả khóa học, nội dung nhận xét) giới hạn khoảng 80 ký tự mỗi dòng (`max-w-[80ch]`). Khung chứa vẫn giãn; chỉ dòng chữ được giới hạn.
- **AC-T1 (toast)**:
  - Toast hiện ở góc **dưới bên phải**, cách mép 24px. Không che header, không che vùng đầu nội dung.
  - Nhiều toast xếp chồng từ dưới lên.
  - Dưới 640px, toast chiếm hết chiều ngang và cách đáy 12px.
  - Giữ nút đóng, tự ẩn sau 6 giây, `role`/`aria-live` như cũ.
  - [ĐỀ-XUẤT]: đổi GDS §5.9 từ "Top-right" sang "Bottom-right".
- **AC-I1 (i18n)**: thêm `g5.reviewStudy.oneSubmissionNote` cho VI và EN. EN đăng ký trạng thái PROPOSED. Không màn nào trong vòng kiểm tra còn hiện key thô.
- **AC-Q (kiểm tra giao diện, theo yêu cầu PO 2026-11-21)**: tối thiểu 4 vòng duyệt trên trình duyệt thật, mỗi vòng ghi lỗi, sửa rồi chụp lại:
  - **V1**: 13 màn × 1366/1920/2560, tiếng Việt, giao diện sáng.
  - **V2**: cùng các màn ở 1440 với EN và dark mode.
  - **V3**: thao tác thật: thu gọn/mở sidebar, mở hộp thoại, hiện toast (lưu trữ rồi khôi phục một khóa fixture), cuộn trang, cửa sổ hẹp 1024px.
  - **V4**: hồi quy cuối: build, test, lint, l10n, cùng Visual QA các frame có baseline.
  - Mỗi vòng đánh giá từ góc nhìn người dùng: có dễ đọc không, có bị che không, thao tác có tiện không.

## 4. Lệch Figma đã biết

- Các frame Figma rộng 1440px. Ở 1440px, nội dung vẫn rộng 1440 − sidebar − lề, nên gần như không đổi so với hiện tại.
- Ở màn rộng hơn, app giãn ra theo quyết định của PO. Đây là sai khác đã được chấp nhận, không tính là lỗi Visual QA.

## Clarifications

- Không còn câu hỏi mở. AC-T1 (toast dưới phải) và AC-F3 (80 ký tự) là đề xuất UX của Claude, chờ PO duyệt ở G1.
