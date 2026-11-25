# EduBranch-AI — Figma Frame Register (15 DES Tasks / 50 Story Points)

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]` (Figma Frame Register & Content Reference)
> - **Dự án**: EduBranch-AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh & phân tích phản biện bậc Đại học
> - **Nguồn quản trị gốc**: [`docs/01_MASTER-TASKS.md`](01_MASTER-TASKS.md) · [`docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`](5.Sprint_Backlog/SPRINT-BACKLOG.md)
> - **Quy tắc thiết kế (nguồn duy nhất)**: [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) (`R01`); giá trị token hiện tại ở `frontend/src/index.css` (mục tiêu tái cấu trúc module: `frontend/src/styles/`) · [`docs/design/SITE-ARCHITECTURE.md`](design/SITE-ARCHITECTURE.md)
> - **Đặc tả chi tiết từng cụm màn hình**: [`P0-FOUNDATION.md`](design/screens/P0-FOUNDATION.md) · [`P1-LECTURER-CORE.md`](design/screens/P1-LECTURER-CORE.md) · [`P2-STUDENT-CORE.md`](design/screens/P2-STUDENT-CORE.md) · [`P3-SUPPORT-AND-STATISTICS.md`](design/screens/P3-SUPPORT-AND-STATISTICS.md) · [`P4-REVIEW-STUDY.md`](design/screens/P4-REVIEW-STUDY.md)
> - **Phạm vi chuyên môn**: Nhóm DES (UI/UX Design & Prototyping trên Figma — Làm chuẩn gốc trước khi đập đi xây lại giao diện Frontend)
> - **Quy mô**: 15 Tasks (`DES-001` → `DES-015`) | 50 Story Points (14.88% toàn dự án)

---

## 0. TRẠNG THÁI HIỆN TẠI (cập nhật 2026-11-13) — ĐỌC TRƯỚC

- **Cả 15 task DES đã Done** (Jira `EBA`, 2026-11-13). Giao diện đã chốt nằm ở Figma file `6CtSgJPKo4jCIbB7WwCaWw`, page **`EduBranch AI – Screens`**. Figma cho biết mỗi màn có nội dung gì; về hình thức, code + R01 là chuẩn (PO 2026-11-22, xem ghi chú cuối file).
- **Đổi tên page (PO, 2026-11-18):** file chỉ còn 2 page: `EduBranch AI – Design System` (`445:239`, trước đây "05 · EduBranch – Design System") và `EduBranch AI – Screens` (`483:9634`, trước đây "08 · EduBranch – Bản hoàn chỉnh"). ID page và frame không đổi. Hai page Eduva ("02 · Eduva – Design System", "03 · Eduva – Screens") đã chuyển sang một file Figma lưu trữ riêng; 72 component EduBranch đang dùng được chuyển trước sang page Design System (section `696:297`, giữ nguyên node ID). Các nhật ký quyết định cũ ghi "page 08" hoặc "page 02" nghĩa là hai page này; không sửa nhật ký.
- Ghi chú từng màn: [`design/UX-SCREEN-NOTES.md`](design/UX-SCREEN-NOTES.md). Token, component và trạng thái: R01 (`.agents/rules/01-ui-design-standards.md`). Route: [`design/SITE-ARCHITECTURE.md §5`](design/SITE-ARCHITECTURE.md).

### 0.1. DES → frame trên page EduBranch AI – Screens

| Task | Frame trên page EduBranch AI – Screens |
|---|---|
| DES-001 IA & app shell | 00.2 trang công khai (một trang cuộn), 00.3–00.5 đăng nhập/đăng ký; sidebar, header, footer dùng chung cho 3 vai trò |
| DES-002 Trạng thái dùng chung | 01.1–01.8 |
| DES-003 Tải tài liệu | 02.4, 02.5 |
| DES-004 Trạng thái xử lý & lỗi | 02.4 (danh sách tài liệu), 02.5, 02.6 |
| DES-005 Nguồn trích dẫn | 02.7 |
| DES-006 Cấu hình sinh case | 07.6 → 07.5 → 07.7 (wizard 3 bước, OPD-006), 03.2, 03.3 |
| DES-007 Cây quyết định | 03.4 (panel cây quyết định, kiểm tra cây) |
| DES-008 Trình sửa node & phương án | 03.4, 03.5 |
| DES-009 Thanh duyệt vòng đời | 03.6 (4 trạng thái), 03.7 |
| DES-010 Branching player | 05.1, 05.2, 05.3 |
| DES-011 Journey Review | 05.4 |
| DES-012 Làm lại | 05.8, 05.9, 05.10 |
| DES-013 Review Study | 06.1, 06.2 |
| DES-014 Phản hồi giảng viên | 04.1, 04.2, 04.2b, 06.3 |
| DES-015 AI Challenge Support | 05.5, 05.6 (OPD-005 còn HOLD) |

Ngoài 15 task DES, page `EduBranch AI – Screens` còn các màn thuộc MVP chưa có task riêng trong baseline 84 task: `04.3` thống kê *(đã xác nhận thuộc MVP, bỏ `(LATER)` theo PO `2026-11-25`)*, `07.1–07.8` (Dashboard giảng viên `D-05`, Bàn học / Khóa học của tôi / Tham gia lớp `OPD-001 → A`, AI Studio `OPD-006`, Rubric `OPD-011 → A`), `08` (quên & đặt lại mật khẩu UI MVP — PO 2026-11-25), `09.1–09.2` hồ sơ, và `10.1–10.10` Admin (`OPD-015 → B`). *(Riêng `D-04`, `OPD-010`, `D4-13` vẫn giữ `OPEN PO DECISION`.)*

### 0.2. Đặc tả ban đầu (đã gỡ) so với Figma page EduBranch AI – Screens

| Đặc tả ban đầu | Theo Figma page EduBranch AI – Screens |
|---|---|
| Cấu trúc 6 page Figma (§1.1) | Một page canonical `EduBranch AI – Screens`, các khu 00–10 |
| Màu chính `#2563EB`, `bg-canvas #F9FAFB`, viền `#E5E7EB` | Navy `#2A4E7F` (`action/primary`), sky `#00A5F5` (`action/accent`), token `EduBranch · Color` |
| Sinh viên: Top Bar 56px + cột đọc 768px, không sidebar | Sinh viên dùng cùng khung sidebar thu gọn được như giảng viên; vùng đọc/viết giữ độ rộng 65–75 ký tự |
| Sidebar giảng viên 240px có vạch active 3px | Sidebar dùng chung (`Navigation/Sidebar`), mục đang chọn nền navy, không vạch; bản thu gọn 72px |
| Chữ giao diện tiếng Anh ("Approve Case", "Publish to Students"…) | Tiếng Việt; có nút chuyển VI/EN (mặc định tiếng Việt) |
| DES-006 dạng modal | Wizard 3 bước ở `/lecturer/ai-studio` |
| DES-009 hiện link chia sẻ sau khi xuất bản | Trạng thái Đã xuất bản chỉ còn nút "Sao chép đường dẫn" (03.6) |
| Đăng nhập Google là Phase 2 | Google + Microsoft thuộc MVP (PSD-09), không có ở đăng nhập quản trị |
| Card phẳng không viền, không bóng | Thêm viền 1px 80% và đổ bóng kép `shadow-eb-card` (PO 2026-11-17 "Sửa Figma rồi code") |
| Khung giao diện toàn màn hình dàn phẳng | Trang công khai và Auth: bọc `max-w-7xl mx-auto`, form Auth tối đa 440px. Trong app shell: dùng hết chiều rộng cạnh sidebar, lề cố định (PO 2026-11-21, spec 006 / PR #79; thay quyết định 17/11 cho app shell) |

> **Cập nhật 2026-11-22 (PO, "theo đề xuất")**: code + R01 là chuẩn giao diện; Figma là tham chiếu về **nội dung** của từng màn (trường dữ liệu, khối, hành động) và sẽ được cập nhật theo code sau. Bản đặc tả pixel ban đầu của 15 task DES (§1–§3 cũ: 6 page Figma, màu `#2563EB`/`#F9FAFB`/`#E5E7EB`, giao diện tiếng Anh) đã bị thay thế từ 2026-11-12 và được **gỡ khỏi file này** ngày 2026-11-22 để tránh nhầm lẫn; nội dung cũ vẫn còn trong lịch sử git (`git log -- docs/05_FIGMA.md`). Tiêu chí nghiệm thu của từng task DES nằm ở `docs/01_MASTER-TASKS.md` và `docs/03_TASK-DETAILS.md`.
