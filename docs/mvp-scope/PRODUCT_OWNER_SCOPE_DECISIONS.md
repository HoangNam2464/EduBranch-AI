# Product Owner — Quyết định phạm vi MVP cần duyệt

> **Status**: Draft — chờ Project Owner duyệt · **Ngày**: 2026-11-03.
> Mỗi mục gồm: hướng PO đã nêu (2026-11-03), bằng chứng, xung đột phát hiện được, và đề xuất. **Không mục nào được coi là đã duyệt.** Không OPD nào được chuyển sang APPROVED.

## 1. Điều kiện dừng đã gặp

| Điều kiện (yêu cầu §11) | Gặp? | Mục |
|---|---|---|
| Proposal V1.2 mâu thuẫn backlog | **Có** | PSD-02, PSD-03, PSD-04 |
| Frame không khớp yêu cầu nào | **Có** | PSD-05 (dashboard giảng viên) |
| Task bắt buộc không có màn tương ứng | **Có** | PSD-06 (DES-006, DES-015) |
| Không xác minh được Story Points | Không — SP lấy nguyên văn từ `01_MASTER-TASKS.md` | — |
| OPD đang OPEN chặn quyết định thiết kế | **Có** | PSD-01, PSD-06 |
| Thay đổi có thể sửa frame gốc / component dùng chung | Chưa phát sinh (chưa sửa gì) | PSD-07, PSD-08 sẽ phát sinh khi sửa thiết kế |

Vì vậy tài liệu dừng ở bước phân loại và chờ PO.

## 2. Các quyết định

### PSD-01 — Loại mã mời, Tham gia lớp, Khóa học của tôi, Bàn học sinh viên khỏi MVP
- **Hướng PO**: loại khỏi MVP, giữ frame trong khu lưu trữ; không loại truy cập case qua đường dẫn giảng viên gửi. Đồng thời PO xếp "Student enrollment: OPD-001" vào HOLD.
- **Bằng chứng ủng hộ việc loại**: không có task; P0 §1 và P2 §1 ghi không có trang danh sách cho sinh viên; DB không có bảng ghi danh.
- **Xung đột**: hai phương án của OPD-001 chính là (A) mã mời + dashboard và (B) chỉ đường dẫn trực tiếp. Loại (A) khỏi MVP tương đương chọn (B). PO-25 lại ghi truy cập bằng đường dẫn trực tiếp **chưa được xác nhận**.
- **Đề xuất**: PO quyết định đóng OPD-001 theo phương án B cho MVP. Sau khi có quyết định: 3 frame (`1:1305`, `1:1202`, `1:1084`) chuyển OUT OF SCOPE; gỡ phần tử mã mời/mã tham gia trên `1:2431`, `86:2446`, `86:2107`, `86:2277`, `1:2258`, `16:6`, `1:1465`; đổi nút "Về Bàn học của tôi" trên `1:466`. Cho đến lúc đó, các frame giữ HOLD.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. OPD-001 chốt **phương án A**: mã mời, Tham gia lớp, Khóa học của tôi, Bàn học sinh viên thuộc **MVP** (page 08: 07.2–07.4, hồ sơ 09.2). 3 frame `1:1305`, `1:1202`, `1:1084` chuyển MVP; mã mời trên màn giảng viên và nút "Về Bàn học của tôi" giữ nguyên. Việc còn lại: bảng `course_enrollments` + API ghi danh, task BE/FE/QA, sửa P0 §1, P2 §1, SITE-ARCHITECTURE §5.3.

### PSD-02 — Evaluation / Rubric (Proposal có, backlog không có)
- **Bằng chứng**: Proposal ¶140 (Quantitative Evaluation module), Deliverable 6, ¶343 (vai trò "Quantitative Evaluation UI"); 84 task không có task nào.
- **Đề xuất**: giữ HOLD (OPD-011) theo hướng PO. PO cần xác định cách thu dữ liệu cho Deliverable 6, kể cả khi làm ngoài nền tảng.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** OPD-011 chốt **A — rubric trong nền tảng**, thuộc **MVP**: Rubric giảng viên (`1:2081` → page 08 `07.8`) và Admin "Nghiên cứu & Rubric" (`1:4511` → `10.8`). Backlog cần thêm task BE `evaluation/`, FE form rubric, export CSV ẩn danh, QA loại bỏ PII.

### PSD-03 — Notification nhắc hạn (Proposal có, backlog không có)
- **Bằng chứng**: Proposal ¶141; không có task; DB không có cột hạn nộp; không có frame.
- **Đề xuất**: PO chọn Phase 2 hoặc bổ sung task. Hướng PO hiện chưa nhắc mục này.

### PSD-04 — Phạm vi Admin
- **Hướng PO**: HOLD quản lý người dùng và xác minh giảng viên (OPD-015, OPD-008); Phase 2 cho nhật ký, cấu hình AI nâng cao, giám sát chi phí AI và cải tiến quản trị khác.
- **Bằng chứng**: Proposal ¶129 chỉ nêu Lecturer / Student; Deliverable 1 chỉ có giao diện giảng viên và sinh viên; không có task Admin. CPD-07 (Draft) ghi phạm vi module Admin còn mở.
- **Xung đột**: xếp 6 frame Admin vào PHASE 2 đã loại trước phương án B (đủ 10 màn) của OPD-015.
- **Đề xuất**: PO xác nhận cách xếp này. Các frame HOLD: `1:4477`, `1:4025`, `30:1864`, `1:4511`; PHASE 2: `1:3715`, `1:4795`, `1:5043`, `1:5543`, `1:5302`, `1:4345`.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. Admin thuộc **MVP**, không chờ duyệt thêm (OPD-015 → B, đủ 10 màn). 9 frame chuyển sang MVP: `1:4477`, `1:3715`, `1:4025`, `30:1864`, `1:4795`, `1:5043`, `1:5543` (chỉ xem, OPD-013), `1:5302`, `1:4345`. `1:4511` (Nghiên cứu & Rubric) chuyển MVP khi OPD-011 chốt A (xem PSD-02). Xác minh giảng viên (OPD-008) vẫn mở. Thiết kế mới: page 08, section `10 · Admin` (10.1–10.10).

### PSD-05 — Dashboard giảng viên (D-05)
- **Hướng PO**: giữ Revision 01 (`34:3183`) làm ứng viên; lưu bản gốc (`1:3490`); không duyệt Revision 01.
- **Bằng chứng**: không có yêu cầu trong Proposal hay task; P1 §1 ghi Courses là màn đầu tiên sau đăng nhập.
- **Phát hiện**: Revision 01 làm nút chính tách khỏi component, và dùng chữ "Bài nộp chờ bạn chấm" (trái nguyên tắc không chấm điểm).
- **Đề xuất**: PO quyết D-05 (có dashboard trong MVP hay không). Nếu có, cần chỉ định task chịu trách nhiệm vì hiện không có SP nào cho màn này.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** D-05 chốt **có dashboard giảng viên**, thuộc **MVP** (`34:3183` → page 08 `07.1 · Bảng điều khiển`). `1:3490` vẫn là bản tham chiếu. Việc còn lại: task FE/BE cho dashboard; sửa P1 §1 (đang ghi Courses là màn đầu tiên sau đăng nhập).

### PSD-06 — Cấu hình sinh case và Challenge Support chỉ có frame HOLD
- **Hướng PO**: giữ AI Case Studio trong MVP và khôi phục dấu chọn ở thẻ chế độ học của AI Studio.
- **Xung đột**: AI Studio là wizard 3 bước (OPD-006), trong khi task là "Case Generation **Modal**" (DES-006). Hướng PO ngầm chọn wizard. Challenge Support có dạng modal (OPD-005), còn SITE-ARCHITECTURE §5.3 là trang riêng.
- **Đề xuất**: PO đóng OPD-006 và OPD-005. Nếu chọn wizard, cần cập nhật DES-006 cho khớp.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** OPD-006 chốt **wizard 3 bước** — AI Studio (`1:3088`, `1:2939`, `1:2818` → page 08 `07.5`–`07.7`) thuộc **MVP**. Cần cập nhật tên/AC của DES-006 và thêm route wizard vào sitemap. OPD-005 (Challenge Support) vẫn mở.

### PSD-07 — Bố cục màn quyết định của sinh viên
- **Hướng PO**: giữ bố cục hai cột (trái: tình huống; phải: phương án).
- **Bằng chứng**: frame `1:906` hiện là **một cột 768px**, hai khối "Cột trái" và "Cột phải" xếp chồng theo chiều dọc. Quy ước student hiện hành là Top Bar + cột 768px (P2 §1 "capped-width column").
- **Đề xuất**: PO xác nhận chuyển sang hai cột (cần quy ước độ rộng mới cho màn này) hay giữ một cột. Đây là thay đổi thiết kế, làm ở giai đoạn sau khi được duyệt.

### PSD-08 — Nút xác nhận sau khi chọn phương án
- **Bằng chứng**: `1:906` có nút "Xác nhận Phương án A & Xem Diễn biến Tiếp theo"; P2 §1 ghi chọn là chuyển ngay, không có bước chặn.
- **Đề xuất**: PO quyết định và cấp mã quyết định. Mục này chưa có mã OPD.

### PSD-09 — Google Sign-In
- **Hướng PO**: loại khỏi MVP.
- **Bằng chứng**: `01_MASTER-TASKS §4.6` xếp OAuth/SSO vào Post-MVP (Phase 2).
- **Đề xuất**: xếp **PHASE 2** (không phải OUT OF SCOPE) theo backlog. Nút Google trên `1:2`, `1:52`, `1:122` sẽ được gỡ khỏi bản MVP khi PO duyệt sửa thiết kế.
- **ĐÃ QUYẾT ĐỊNH 2026-11-12 (PO):** hướng trên được thay thế. Đăng nhập/đăng ký bằng **Google và Microsoft** thuộc **MVP**, trên 00.3, 00.4, 00.5 của page 08 (component `EB/Social Sign-in`); đăng nhập quản trị không có. SSO LDAP/SAML của trường vẫn ngoài phạm vi. Việc còn mở: quy tắc gán vai trò khi đăng nhập lần đầu, liên kết khi trùng email với tài khoản mật khẩu, có giới hạn domain email trường hay không (liên quan OPD-008), và bổ sung task BE/FE/QA vì `01_MASTER-TASKS §4.6` vẫn ghi Post-MVP.

### PSD-10 — Các phần tử MVP còn chờ quyết định
| Phần tử | Frame | Quyết định |
|---|---|---|
| Thông báo kích hoạt giảng viên | `1:122` | OPD-008 |
| Nội dung xóa khóa học | `86:2682` | OPD-014 |
| Sửa case sau xuất bản | `88:2343` | OPD-007 |
| Tiếp tục lượt làm dở | `1:972` | OPD-003 |
| Giới hạn số lượt | `86:2712` | OPD-004 |
| Cách xác định quyết định then chốt | `1:619` | OPD-002, D-06 |
| Gợi ý phản hồi bằng AI | `1:1702` | OPD-010 |
| Cột mã số sinh viên | `1:1852` | D-04 |
| Trường `student_analysis` | `1:384` | D4-13 |
| Nút xuất CSV | `1:1493` | Thuộc OPD-011 (đã chốt A 2026-11-12: export CSV ẩn danh trong nền tảng) |
| Sửa khóa học (có route, không có frame) | — | PO xác nhận có trong MVP |
| Phạm vi responsive | Tất cả | PO quyết |

## 3. Thứ tự đề xuất
1. PSD-01 (OPD-001), PSD-04 (OPD-015 + OPD-008) — khung điều hướng.
2. PSD-06 (OPD-006, OPD-005), PSD-07, PSD-08 — các luồng chính.
3. PSD-02, PSD-03 — mâu thuẫn Proposal ↔ backlog.
4. PSD-05, PSD-09, PSD-10.

Sau khi PO duyệt, bước tiếp theo mới là sửa thiết kế trên Figma (cần phê duyệt riêng, kèm kiểm tra không ảnh hưởng frame gốc và component dùng chung).
