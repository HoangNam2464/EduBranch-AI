# MVP — Màn hình và trạng thái còn thiếu

> **Status**: Draft — chờ Project Owner duyệt · **Ngày**: 2026-11-03.
> **Phương pháp**: đối chiếu 38 frame MVP (Page 1, `0:1`) với yêu cầu trạng thái trong P0–P4, DES-002 và tên task. Chỉ liệt kê trạng thái **có liên quan thực tế** đến luồng; không thêm màn để đủ checklist.
> **Giới hạn bằng chứng**: phần lớn kết luận dựa trên tên frame, chữ và instance đọc từ `get_metadata`. Chỉ `1:3490`, `34:3183` được xem bằng ảnh. Mục ghi "cần xem ảnh" chưa được kiểm bằng hình.

## 1. Chức năng MVP chưa có màn không bị HOLD (điều kiện dừng)

| # | Chức năng | Task (SP) | Tình trạng | Vì sao chặn |
|---|---|---|---|---|
| G-1 | Cấu hình sinh case | DES-006 (3), FE-007 (3) | Chỉ có 3 frame wizard AI Studio (`1:3088`, `1:2939`, `1:2818`) đang HOLD (OPD-006). Không có frame "modal" đúng tên task | Không thể bàn giao FE-007 khi OPD-006 chưa có quyết định |
| G-2 | AI Challenge Support | DES-015 (3), FE-021 (5) | `27:321`, `88:2979` là dạng modal và đang HOLD (OPD-005). SITE-ARCHITECTURE §5.3 lại định nghĩa trang riêng `/student/cases/:caseId/challenge/:sessionId` | Hình thức chứa phụ thuộc OPD-005 |
| G-3 | Nhắc hạn hoàn thành case (Notification) | Không có task | Proposal ¶141 có; backlog không có task; DB không có cột hạn nộp | Mâu thuẫn Proposal ↔ backlog (PSD-03) |
| G-4 | Evaluation / Rubric | Không có task | Proposal ¶140; frame `1:2081` HOLD (OPD-011) | Mâu thuẫn Proposal ↔ backlog (PSD-02) |

## 2. Trạng thái còn thiếu theo luồng

| Luồng | Frame hiện có | Trạng thái còn thiếu (chỉ khi liên quan) | Nguồn yêu cầu |
|---|---|---|---|
| Đăng nhập | `1:2` (mặc định) | Lỗi sai thông tin (thông báo chung), lỗi validation trường, đang gửi (nút disabled + loading), thông báo hết phiên | FE-002 AC-1; P0 §2 States; sơ đồ `91:2601` |
| Đăng ký | `1:52`, `1:122` | Lỗi validation, email đã tồn tại, đang gửi, đăng ký thành công/chuyển hướng | FE-002; P0 §3 States |
| Khóa học | `1:2431`, `86:2446`, `86:2107`, `86:2277`, `1:1465`, `86:2682` | Lỗi validation trong hộp thoại tạo; **sửa khóa học** (route `PUT /courses/:courseId` có trong code, nhưng chưa có frame) — cần PO xác nhận có trong MVP không | BE-003; P1 §1 |
| Tài liệu | `1:2258`, `87:2306`, `29:1106` | Trạng thái trống (chưa có tài liệu); đang tải lên (tiến trình). DES-004 có chữ "Progress Bar" trong tên task — chưa thấy thanh tiến trình, chỉ có badge (cần xem ảnh) | DES-004; P1 §2 States |
| RAG drawer | `16:6` | Đang tải đoạn trích; tài liệu chưa xử lý xong (không có đoạn trích) | DES-005; FE-006 |
| Danh sách case | `1:2583`, `87:2379`, `87:2432` | Trạng thái trống; nút sinh case bị vô hiệu khi khóa học chưa có tài liệu `COMPLETED` | P1 §3 States |
| Kiểm duyệt case | `1:3219`, `88:2540`, `88:2343`, `1:1444` | Lỗi kiểm tra cây (vòng lặp / node mồ côi) chặn lưu; chặn xóa node còn được trỏ tới; Xuất bản bị vô hiệu kèm lý do (thiếu node gốc hoặc nội dung Review Study); cảnh báo case đã có lượt làm (**HOLD OPD-007**) | P1 §4 States; DES-009 |
| Phản hồi giảng viên | `1:1852`, `1:1702` | Hàng đợi trống; gửi nhận xét thành công; lỗi gửi | P3 §2; FE-019 |
| Thống kê | `1:1493` | Trống ("chưa có lượt làm"); đang tải (skeleton) | P3 §1 States |
| Player | `1:972`, `1:906`, `1:880` | **Điểm quyết định ở trạng thái mặc định (chưa chọn)** — hiện chỉ có frame "Đã chọn phương án"; đang chuyển bước; lỗi lưu lựa chọn; case chưa xuất bản (dùng 404 chung `86:2656`) | DES-010; P2 §1 |
| Journey Review | `1:619` | Validation lập luận bắt buộc cho quyết định then chốt (PO-26; cách xác định và độ dài tối thiểu chờ OPD-002); đang lưu / đã lưu lập luận | DES-011; FE-015 |
| Challenge Support | `27:321`, `88:2979` (HOLD) | Đang sinh câu hỏi; lỗi/timeout AI; sinh viên bỏ qua | P2 §3 States; BE-027 |
| Suy ngẫm & làm lại | `1:545`, `1:466`, `1:790`, `86:2712` | Validation biểu mẫu suy ngẫm; lịch sử lượt khi mới có 1 lượt | FE-017; DES-012 |
| Review Study | `1:384`, `88:2877`, `1:297` | Validation trường bắt buộc (`proposed_solution`, `reasoning_text`); lỗi nộp | P4 §1; FE-018 |

## 3. Đặc tả còn thiếu cho bàn giao

| Hạng mục | Tình trạng |
|---|---|
| Responsive | Tất cả frame MVP là desktop 1440px. P0 §1 yêu cầu sidebar thành drawer dưới ~768px nhưng chưa có frame. Phạm vi responsive của MVP chưa được quyết định |
| Biến thể component | Thiếu Focus, Active, Loading cho Button, Nav, Tab, Option Card; thiếu Select, Toast Warning, Button LG, Modal 720 (phát hiện Phase 6A) |
| Ngôn ngữ | UI tiếng Việt (PO-3), nhưng còn chữ tiếng Anh/Pháp trong frame Admin (HOLD/Phase 2, không ảnh hưởng MVP) |
| Hợp đồng API | Các module M3 (xóa, thử lại), M4, M6 (CRUD node), M8 (dữ liệu Journey Review), M10–M13 chưa có route trong code; hợp đồng chưa chốt |
