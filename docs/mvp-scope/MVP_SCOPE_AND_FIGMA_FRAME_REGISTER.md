# MVP Scope & Figma Frame Register

> **Status**: Draft — chờ Project Owner duyệt · **Ngày**: 2026-11-03 · **Phạm vi**: chỉ phân loại, không sửa Figma, không viết code.
> **Figma**: file `6CtSgJPKo4jCIbB7WwCaWw`, page `Page 1` (`0:1`), đọc bằng `get_metadata` và `get_screenshot` (session `d524bf8e-77e9-416f-986d-699eff2ab367`). Không dùng `use_figma`.
> **Nguồn đối chiếu**: Proposal V1.2 (PO-10; bản cục bộ `docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`, đoạn trích theo số đoạn `¶`), `docs/01_MASTER-TASKS.md` (84 task / 336 SP), `docs/OPEN_PRODUCT_DECISIONS.md` v1.1.2 trên nhánh `feature/design-system` (Draft; mọi OPD `OPEN / PENDING`; mục CPD cũng là Draft), các quyết định PO-1..27, route trong `backend/src/**/*.controller.ts` tại `02028b2`.
> **Không frame nào được đánh dấu Ready for Dev hay Approved trong tài liệu này.** Phân loại dưới đây là đề xuất có bằng chứng; PO duyệt riêng.

## 1. Quy tắc phân loại

| Nhóm | Định nghĩa dùng trong tài liệu |
|---|---|
| **MVP** | Có nguồn yêu cầu (Proposal V1.2 hoặc spec/backlog) **và** có task trong 84 task. Có thể còn phần tử bị chặn (xem cột "Phần tử cần xử lý"). |
| **PHASE 2** | Chức năng hợp lệ nhưng được ghi ngoài 4 sprint (`01_MASTER-TASKS.md §4`) hoặc theo hướng PO 2026-11-03 §3. |
| **OUT OF SCOPE** | Không thuộc phạm vi sản phẩm hoặc là bản lưu trữ. Không xóa. |
| **HOLD** | Bố cục chính của frame phụ thuộc một quyết định đang `OPEN/PENDING` (OPD hoặc D-xx). |

- Frame chỉ có **một phần tử** phụ thuộc quyết định mở vẫn là MVP; phần tử đó được ghi ở cột riêng và không được bàn giao cho đến khi có quyết định.
- Không gán nhóm chỉ vì thiếu task hoặc chỉ vì có frame (quy tắc đã được PO xác nhận).
- Nhãn `[HOLD · …]` đang có trên tên frame trong Figma là nhãn làm việc trước đây, **không phải** quyết định.

## 2. Tổng hợp

| Nhóm | Số frame |
|---|:-:|
| MVP | 38 |
| HOLD | 15 |
| PHASE 2 | 11 |
| OUT OF SCOPE | 2 |
| **Tổng frame** | **66** |
| Node không phải frame (section 09) | 2 (`30:1127` Vector, `81:2036` instance Badge) — node rác, không phân loại |

## 3. Register

Ký hiệu cột "Phần tử cần xử lý": **P2** = phần tử Phase 2 · **H(x)** = phần tử chờ quyết định x · **NB** = không tìm thấy nguồn yêu cầu.

### Section `93:2601` — 00 · Tổng quan & Trang công khai

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `91:2601` | 00.1 · Sơ đồ ứng dụng & luồng người dùng | MVP (tài liệu IA, không phải màn dev) | DES-001 (3 SP); SITE-ARCHITECTURE §5 | Nội dung sơ đồ ghi "15 route MVP" và "sinh viên vào case qua đường dẫn trực tiếp" — OPD-001 chưa đóng (PO-25) |
| `90:2572` | 00.2 · Trang giới thiệu | MVP | P0 §0; `05_FIGMA.md §1.5` gom vào DES-001 | — |
| `1:2` | 00.3 · Đăng nhập · Mặc định | MVP | Proposal ¶129 "Account and role management"; BE-001, FE-002; route `POST /api/v1/auth/login` có trong code | **P2**: nút "Đăng nhập với Google", liên kết "Quên mật khẩu?" (`01_MASTER-TASKS §4.6`) |
| `1:52` | 00.4 · Đăng ký · Sinh viên | MVP | ¶129; BE-001, FE-002; `POST /api/v1/auth/register` | **P2**: "Đăng ký với Google" |
| `1:122` | 00.5 · Đăng ký · Giảng viên | MVP | ¶129; BE-001, FE-002 | **P2**: "Đăng ký với Google"; **H(OPD-008)**: khối "Lưu ý" về kích hoạt tài khoản giảng viên |

### Section `93:2602` — 01 · Trạng thái dùng chung

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `86:2446` | 01.1 · Đang tải (Skeleton) | MVP | DES-002 (5 SP) | **H(OPD-001)**: dòng "Mã tham gia" trên thẻ khóa học |
| `86:2107` | 01.2 · Trống (chưa có khóa học) | MVP | DES-002 | idem |
| `86:2277` | 01.3 · Lỗi (không tải được dữ liệu) | MVP | DES-002 | idem |
| `86:2630` | 01.4 · 403 | MVP | DES-002; QA-002 | — |
| `86:2656` | 01.5 · 404 | MVP | DES-002; FE-002 (Route 404 catch-all) | — |

### Section `93:2603` — 02 · Giảng viên · Khóa học & Tài liệu

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `1:2431` | 02.1 · Quản lý khóa học | MVP | ¶130; BE-003; route `/api/v1/courses` CRUD có trong code | **H(OPD-001)**: "Mã tham gia" trên thẻ |
| `1:1465` | 02.2 · Hộp thoại khởi tạo khóa học | MVP | BE-003; FR-MAT-01 | Có 4 trường; cần xác minh trường nào là mã lớp (OPD-001) — chưa xem ảnh trong phiên này |
| `86:2682` | 02.3 · Xác nhận xóa khóa học | MVP | BE-003 (`DELETE /courses/:courseId` có trong code) | **H(OPD-014)**: nội dung hộp thoại (xóa cứng hay lưu trữ) |
| `1:2258` | 02.4 · Chi tiết khóa học — Tài liệu | MVP | ¶130; DES-003, DES-004, FE-004, BE-005 | **H(OPD-001)**: nút "Mã mời: SEC7A2" |
| `87:2306` | 02.5 · Hộp thoại tải tài liệu | MVP | DES-003, FE-003, QA-003 | — |
| `29:1106` | 02.6 · Xác nhận xóa tài liệu | MVP | FE-005 | — |
| `16:6` | 02.7 · RAG Source Inspector | MVP | DES-005, FE-006 | **H(OPD-001)**: nút "Mã mời" ở nền |

### Section `93:2604` — 03 · Giảng viên · Sinh case & Kiểm duyệt

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `1:2583` | 03.1 · Quản lý Case Study | MVP | ¶131; DES-006, FE-007 | Bảng có cột "Khóa học" (liệt kê xuyên khóa) trong khi route MVP là `/lecturer/courses/:courseId/cases` — cần thống nhất |
| `87:2379` | 03.2 · Đang sinh case nháp | MVP | DES-006, FE-007 (progress tracking) | — |
| `87:2432` | 03.3 · Sinh case thất bại (toast) | MVP | FE-007; P1 §3 States | — |
| `1:3219` | 03.4 · Trình chỉnh sửa Case Study | MVP | ¶132; DES-007, DES-008, FE-008..FE-010 | — |
| `88:2540` | 03.5 · Trình chỉnh sửa Review Study | MVP | ¶135; P1 §4 (biến thể Review Study) | — |
| `88:2343` | 03.6 · Thanh duyệt 4 trạng thái | MVP | DES-009 (3 SP), FE-011, BE-018 | **H(OPD-007)**: thao tác sửa sau khi xuất bản (frame tự ghi rõ) |
| `1:1444` | 03.7 · Phê duyệt và xuất bản | MVP | DES-009, FE-011; CPD-01 (Draft) | — |

### Section `93:2605` — 04 · Giảng viên · Phản hồi & Thống kê

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `1:1852` | 04.1 · Hàng đợi Review | MVP | ¶138; DES-014, FE-019 | **H(D-04)**: cột "Mã số sinh viên" (DB `users` không có trường này) |
| `1:1702` | 04.2 · Chi tiết phản hồi | MVP | ¶138; DES-014, FE-019, BE-026 | **H(OPD-010)**: nút "Bấm để sinh gợi ý" (P3 §2 ghi không có gợi ý AI) |
| `1:1493` | 04.3 · Thống kê luồng học tập | MVP | ¶139; FE-022, BE-028 | **NB**: nút "Xuất dữ liệu CSV" (không thuộc 5 chỉ số FR-STAT; liên quan OPD-011) |

### Section `93:2606` — 05 · Sinh viên · Branching Study

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `1:972` | 05.1 · Giới thiệu tình huống | MVP | ¶133; DES-010, FE-012, BE-020 | **H(OPD-003)**: nút "Tiếp tục làm dở" |
| `1:906` | 05.2 · Đã chọn phương án | MVP | ¶133; DES-010, FE-012, BE-021 | **H(chưa có mã)**: nút "Xác nhận Phương án A & Xem Diễn biến Tiếp theo" (P2 §1 ghi chọn là chuyển ngay); bố cục hiện là **một cột 768px**, khác hướng "hai cột" của PO — xem PSD-07 |
| `1:880` | 05.3 · Kết thúc hành trình | MVP | ¶133; FE-013, BE-022 | — |
| `1:619` | 05.4 · Journey Review | MVP | ¶110, ¶112; DES-011, FE-014, FE-015, BE-023 | **H(OPD-002)**: quy tắc bắt buộc lập luận (PO-26 đã chốt bắt buộc với quyết định then chốt; cách xác định vẫn mở); **H(OPD-005)**: khối Challenge nằm ngay trong trang |
| `27:321` | 05.5 · AI Challenge Support (Modal) | **HOLD** | DES-015, FE-021 là MVP, nhưng hình thức modal/trang riêng phụ thuộc **OPD-005** | — |
| `88:2979` | 05.6 · Challenge Support hoàn tất (2/2) | **HOLD** | idem OPD-005 | — |
| `1:545` | 05.7 · Biểu mẫu suy ngẫm | MVP | ¶110; DES-012, FE-017, BE-024 | — |
| `1:466` | 05.8 · Đã nộp suy ngẫm | MVP | FE-017, FE-016 | **H(OPD-001)**: nút "Về Bàn học của tôi" trỏ tới dashboard sinh viên |
| `1:790` | 05.9 · Lịch sử lần làm bài | MVP | ¶110 "preserves previous attempts"; DES-012, FE-016, QA-013; route `GET /api/v1/cases/:caseId/attempts` có trong code | — |
| `86:2712` | 05.10 · Bắt đầu lượt mới | MVP | DES-012, FE-016 | **H(OPD-004)**: giới hạn số lượt (nếu có) |

### Section `93:2607` — 06 · Sinh viên · Review Study

| Node | Frame | Nhóm | Bằng chứng | Phần tử cần xử lý |
|---|---|---|---|---|
| `1:384` | 06.1 · Biểu mẫu Review Study | MVP | ¶111, ¶135; DES-013, FE-018, BE-025 | **H(D4-13)**: trường `student_analysis` tùy chọn hay không |
| `88:2877` | 06.2 · Đã nộp, chờ phản hồi | MVP | FE-018, BE-025 | Instance badge tên "Đã có phản hồi" trên frame "chờ phản hồi" — cần kiểm nội dung hiển thị |
| `1:297` | 06.3 · Đã phản hồi | MVP | DES-014, FE-020 | — |

### Section `93:2608` — 07 · Chờ quyết định

| Node | Frame | Nhóm | Bằng chứng | Ghi chú |
|---|---|---|---|---|
| `1:3088` | AI Studio — Khóa học và chế độ | **HOLD (OPD-006)** | Chức năng sinh case là MVP (DES-006, FE-007); hình thức wizard 3 bước khác tên task "Case Generation **Modal**" | Có nút "Tạo thủ công từ đầu" → **H(D-07)** |
| `1:2939` | AI Studio — Chủ đề và tài liệu | **HOLD (OPD-006)** | idem | — |
| `1:2818` | AI Studio — Xác nhận cấu hình | **HOLD (OPD-006)** | idem | — |
| `1:2081` | Rubric nghiên cứu (Giảng viên) | **HOLD (OPD-011)** | Proposal ¶140 có Evaluation module; backlog không có task | Mâu thuẫn Proposal ↔ backlog (PSD-02) |
| `1:1305` | Sinh viên · Bàn học | **HOLD (OPD-001)** | Không có task; P0 §1 và P2 §1 ghi không có trang danh sách cho sinh viên | Hướng PO: loại khỏi MVP → chờ PO đóng OPD-001 (PSD-01) |
| `1:1202` | Sinh viên · Khóa học của tôi | **HOLD (OPD-001)** | idem | idem |
| `1:1084` | Sinh viên · Tham gia lớp học | **HOLD (OPD-001)** | idem; DB không có bảng ghi danh | idem |
| `1:3490` | Giảng viên · Tổng quan (bản gốc) | **OUT OF SCOPE** (lưu trữ tham chiếu) | Hướng PO §4: giữ làm bản tham chiếu | Không xóa |
| `34:3183` | Lecturer Dashboard — Revision 01 | **HOLD (D-05)** | Không có yêu cầu hay task cho dashboard giảng viên; P1 §1 ghi Courses là màn đầu tiên | Ứng viên làm việc theo hướng PO; **chưa duyệt**. So sánh ở §4 |
| `26:148` | Email · Kích hoạt tài khoản | **HOLD (OPD-008)** | Không có task | — |
| `1:4477` | Admin · Đăng nhập | **HOLD (OPD-015)** | Chỉ cần nếu có màn quản lý người dùng | — |
| `1:3715` | Admin · Bảng điều khiển | **PHASE 2** | Hướng PO §3 (giám sát chi phí AI, cải tiến quản trị); không có task | Cũng nằm trong phương án B của OPD-015 |
| `1:4025` | Admin · Quản lý người dùng | **HOLD (OPD-015, OPD-008)** | Hướng PO §3 HOLD | Có tab chờ duyệt giảng viên |
| `30:1864` | Admin · Khóa người dùng | **HOLD (OPD-015)** | idem | — |
| `1:4795` | Admin · Quản lý khóa học | **PHASE 2** | Hướng PO §3 "other administrative enhancements" | — |
| `1:5043` | Admin · Quản lý Case Study | **PHASE 2** | idem | — |
| `1:5543` | Admin · Cấu hình dịch vụ AI | **PHASE 2** | Hướng PO §3 "Advanced AI configuration"; liên quan OPD-013 | — |
| `1:4511` | Admin · Nghiên cứu và Rubric | **HOLD (OPD-011, OPD-015)** | Hướng PO §3 HOLD | — |
| `1:5302` | Admin · Nhật ký hệ thống | **PHASE 2** | Hướng PO §3 "Admin logs" | — |
| `1:4345` | Admin · Cài đặt hệ thống | **PHASE 2** | Hướng PO §3 | — |

### Section `93:2609` — 08 · Phase 2 · Quên & đặt lại mật khẩu

| Node | Frame | Nhóm | Bằng chứng |
|---|---|---|---|
| `1:196` | Quên mật khẩu · Nhập email | PHASE 2 | `01_MASTER-TASKS §4.6` |
| `1:223` | Quên mật khẩu · Đã gửi hướng dẫn | PHASE 2 | idem |
| `26:78` | Email · Hướng dẫn đặt lại mật khẩu | PHASE 2 | idem |
| `1:250` | Mật khẩu mới · Biểu mẫu | PHASE 2 | idem |
| `1:279` | Mật khẩu mới · Thành công | PHASE 2 | idem |

### Section `93:2610` — 09 · Lưu trữ

| Node | Frame | Nhóm | Bằng chứng |
|---|---|---|---|
| `29:18` | [Đã thay bằng component App Sidebar] Thanh điều hướng giảng viên | OUT OF SCOPE | Đã được thay bằng component `App Sidebar` |

## 4. So sánh Dashboard `1:3490` và `34:3183`

Đối chiếu bằng ảnh chụp (900px) và cấu trúc node. Hai frame gần như giống hệt nhau: cùng sidebar, lời chào, khối "Bài nộp chờ bạn Phản hồi (4)", khối "Case Study gần đây (6)" và 4 thẻ chỉ số.

| Điểm | `1:3490` (gốc) | `34:3183` (Revision 01) |
|---|---|---|
| Nút "Tạo Case mới bằng AI" | Instance của component `Button` | **Không còn là instance** (node "Nhãn nút"); hiển thị giống nhưng đã tách khỏi component |
| Nhãn thẻ chỉ số | "Case đã Xuất bản", "Bản nháp đang soạn", "Bài sinh viên chờ Review", chữ đậm | "Case đã xuất bản", "Bản nháp", "**Bài nộp chờ bạn chấm**", chữ thường |
| Chiều cao | 1181 | 1165 (thẻ chỉ số thấp hơn) |

- Revision 01 có **hai điểm lùi**: (1) nút chính bị tách khỏi component; (2) chữ "chấm" mâu thuẫn nguyên tắc AI và hệ thống không chấm điểm (CPD-04, Draft) và quy ước tránh thuật ngữ chấm điểm (R01 §7).
- Cả hai đều hiển thị mã sinh viên trong ngoặc (D-04) và trùng chức năng với Courses / Phản hồi / Thống kê.
- Đề xuất: giữ `34:3183` làm ứng viên theo hướng PO, ghi nhận hai điểm lùi để sửa ở giai đoạn thiết kế; giữ `1:3490` làm bản tham chiếu. Không duyệt khi D-05 chưa có quyết định.

## 5. Kiểm tra màn quyết định của sinh viên (`1:906`)

- Phương án đã là instance `Option Card · A/B/C`.
- Không thấy hệ quả, ưu/nhược điểm, thống kê kết quả hay dấu đúng/sai trên màn. Mô tả phương án chỉ nêu hành động.
- Câu "Lựa chọn của bạn sẽ lập tức kích hoạt chuỗi phản ứng…" và nút "Xác nhận … & Xem Diễn biến Tiếp theo" thuộc mục chưa có mã số 2 (xác nhận hay chuyển ngay).
- **Bố cục hiện tại là một cột 768px**: `1:920` rộng 768px chứa "Cột trái — Hồ sơ & Dữ liệu sự cố" (`26:170`, y=32) và "Cột phải — Bảng điều khiển quyết định" (`26:204`, y=694) xếp chồng. Hướng PO §5 yêu cầu "giữ bố cục hai cột". Hai điều này không khớp → PSD-07.
- Thẻ chọn chế độ học trong AI Studio (`1:3088`) chưa được kiểm trong phiên này; việc khôi phục dấu chọn thuộc giai đoạn sửa thiết kế, không làm ở bước phân loại.
