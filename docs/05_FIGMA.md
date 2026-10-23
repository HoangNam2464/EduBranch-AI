# EduBranch-AI — Figma UI/UX Design Catalog & Master Blueprint (15 Tasks / 50 Story Points)

> **Dự án**: EduBranch-AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh & phân tích phản biện bậc Đại học  
> **Nguồn quản trị gốc**: [`docs/01_MASTER-TASKS.md`](01_MASTER-TASKS.md) · [`docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`](5.Sprint_Backlog/SPRINT-BACKLOG.md)  
> **Tài liệu tham chiếu thiết kế**: [`docs/design/GLOBAL-DESIGN-SYSTEM.md`](design/GLOBAL-DESIGN-SYSTEM.md) · [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) · [`docs/design/SITE-ARCHITECTURE.md`](design/SITE-ARCHITECTURE.md)  
> **Đặc tả chi tiết từng cụm màn hình**: [`P0-FOUNDATION.md`](design/screens/P0-FOUNDATION.md) · [`P1-LECTURER-CORE.md`](design/screens/P1-LECTURER-CORE.md) · [`P2-STUDENT-CORE.md`](design/screens/P2-STUDENT-CORE.md) · [`P3-SUPPORT-AND-STATISTICS.md`](design/screens/P3-SUPPORT-AND-STATISTICS.md) · [`P4-REVIEW-STUDY.md`](design/screens/P4-REVIEW-STUDY.md)  
> **Phạm vi chuyên môn**: Nhóm DES (UI/UX Design & Prototyping trên Figma — Làm chuẩn gốc trước khi đập đi xây lại giao diện Frontend)  
> **Quy mô**: 15 Tasks (`DES-001` → `DES-015`) | 50 Story Points (14.88% toàn dự án)

---

## 1. HỆ THỐNG CÀI ĐẶT CHUẨN TRÊN FIGMA (FIGMA WORKSPACE & DESIGN SYSTEM SETUP)

Trước khi vẽ bất kỳ màn hình nào, file Figma của dự án bắt buộc phải thiết lập đúng **Cấu trúc Pages**, **Frame Grid**, **Local Variables (Color/Radius/Spacing)**, **Text Styles**, và **Vector Icon Library** dưới đây.

### 1.1. Cấu trúc Tổ chức 6 Pages trong File Figma
```text
📁 EduBranch-AI — Master UI/UX Figma File
├── 📄 00_IA & Sitemap                  ← [DES-001] Sơ đồ luồng 14 routes, App Shells (Lecturer vs Student)
├── 📄 01_Design System & Shared States ← [DES-002] Color Variables, Text Styles, Lucide Icons, Shared Components & States
├── 📄 02_Lecturer: Materials & RAG     ← [DES-003, DES-004, DES-005] Upload PDF/DOCX, Processing Status, RAG Source Drawer
├── 📄 03_Lecturer: Case & ReactFlow    ← [DES-006, DES-007, DES-008, DES-009] AI Gen Modal, ReactFlow 60/40 Editor, Lifecycle Bar
├── 📄 04_Student: Branching Study      ← [DES-010, DES-011, DES-012] Phase 1 Player, Phase 2 REVIEW Timeline, Phase 3 Reflection & Retry
└── 📄 05_Review, Feedback & Socratic   ← [DES-013, DES-014, DES-015] Review Study Workspace, Lecturer Feedback, 2-Round Socratic AI
```

### 1.2. Kích thước Frame & Hệ thống Lưới (Frame & Layout Grid)
1. **Kích thước Frame Desktop chuẩn**: `1440 × 900 px` (hoặc chiều cao tự giãn theo nội dung `Auto Height`), màu nền Frame luôn là `bg-canvas` (`#F9FAFB`). **Tuyệt đối chỉ thiết kế Light Mode.**
2. **Khung Bố cục Cổng Giảng viên (`LecturerLayout` Frame)**:
   - **Left Sidebar cố định**: Rộng `240px × Cao 900px`, nền `#FFFFFF`, viền phải `1px solid #E5E7EB`, Auto-Layout dọc (`padding: 16px`, `gap: 4px`).
   - **Vùng Nội dung Chính (Main Content Area)**: Rộng `1200px` (`1440px - 240px`), đặt Layout Grid **12 Columns** (`Margin: 32px`, `Gutter: 24px`, độ rộng vùng nội dung thực tế `1136px`).
   - *Ngoại lệ cho màn hình Duyệt Case (`DES-007`, `DES-008`, `DES-009`)*: Vùng nội dung `1200px` dùng bố cục **Full-Height Split-Screen** (không cuộn trang ngoài): Thanh Header Stepper cao `64px` ở trên cùng + Vùng làm việc bên dưới chia đôi **60% ReactFlow Canvas (`720px`)** bên trái và **40% Node Inspector Drawer (`480px`)** bên phải.
3. **Khung Bố cục Cổng Sinh viên (`StudentLayout` Frame)**:
   - **Top Header Bar cố định**: Rộng `1440px × Cao 56px`, nền `#FFFFFF`, viền dưới `1px solid #E5E7EB`, `padding: 0 32px`. Không có Sidebar trái để sinh viên tập trung đọc tình huống.
   - **Vùng Đọc & Làm bài Chính (Reading Column)**: Khung đơn canh giữa rộng **`768px` (`max-w-3xl`)**, cách lề trái/phải `336px`, `padding-top: 32px`, `padding-bottom: 64px`, `gap: 24px`.
4. **Khung Bố cục Công khai (`PublicLayout` Frame — `/login`, `/register`)**:
   - Frame `1440 × 900px`, nền `#F9FAFB`, ở giữa là Auth Card rộng `400px` (`bg-surface #FFFFFF`, `border 1px #E5E7EB`, `radius 12px`, `padding 32px`).

### 1.3. Bảng Mã Màu Chuẩn (Figma Local Color Variables — Locked Hex)

> **Quy tắc chống "AI-Slop" trên Figma**: Tuyệt đối **CẤM** dùng màu tím/indigo (`#6366F1`, `purple`, `violet`), cấm hiệu ứng phát sáng neon, cấm gradient lòe loẹt, cấm tô màu xanh/đỏ cho node ReactFlow theo kiểu đúng/sai.

| Nhóm Variable | Tên Variable trên Figma | Mã Hex | Mục đích sử dụng trên Frame & Component |
|---|---|:---:|---|
| **Surface** | `surface/canvas` | `#F9FAFB` | Nền gốc của toàn bộ Frame `1440x900` và nền Canvas ReactFlow |
| | `surface/card` | `#FFFFFF` | Nền của Card, Sidebar, Top Header, Table Row, Modal, Drawer |
| | `surface/muted` | `#F3F4F6` | Nền Header bảng, khối trích dẫn Context/Feedback, vùng Dropzone, Skeleton |
| | `surface/selected` | `#EFF6FF` | Nền của mục Sidebar đang active, Option Card đang chọn, Node đang chọn |
| **Text** | `text/primary` | `#111827` | Tiêu đề trang, tiêu đề Card, văn bản tình huống (`situation`), nội dung chính |
| | `text/secondary` | `#4B5563` | Nhãn biểu mẫu (Form Label), mô tả phụ, nội dung bảng |
| | `text/muted` | `#9CA3AF` | Placeholder, timestamp, bộ đếm ký tự (`0 / 2000`), chú thích dưới ô nhập |
| | `text/inverse` | `#FFFFFF` | Chữ trắng trên nền nút Primary (`#2563EB`) hoặc nút Danger (`#DC2626`) |
| **Border** | `border/default` | `#E5E7EB` | Viền `1px` mặc định cho mọi Card, Input, Table, Sidebar, Header |
| | `border/strong` | `#D1D5DB` | Viền nhấn mạnh nhẹ (Hover trên Input/Card, viền Terminal Node, mũi tên Edge) |
| | `border/focus` | `#2563EB` | Viền `2px` khi Input đang focus, Option Card đang chọn, hoặc Node đang sửa |
| **Action** | `action/primary` | `#2563EB` | Màu nhấn chính **duy nhất** (Nút Primary, tab gạch chân active, link). Hover: `#1D4ED8` |
| | `action/disabled` | `#93C5FD` | Nền nút Primary khi bị vô hiệu hóa (Disabled) |
| **Case Status** | `status/draft-bg` / `text` | `#F3F4F6` / `#4B5563` | Badge `Draft` (kèm chấm tròn `6px` màu `#9CA3AF`) |
| | `status/reviewed-bg` / `text` | `#EFF6FF` / `#1D4ED8` | Badge `Reviewed` (kèm chấm tròn `6px` màu `#2563EB`) |
| | `status/approved-bg` / `text` | `#FFFBEB` / `#92400E` | Badge `Approved` (kèm chấm tròn `6px` màu `#D97706`) |
| | `status/published-bg` / `text` | `#F0FDF4` / `#166534` | Badge `Published` (kèm chấm tròn `6px` màu `#16A34A`) |
| **Learning Mode** | `mode/branching-bg` / `text` | `#F0FDFA` / `#0F766E` | Badge `Branching Study` (Xanh cổ vịt) & thanh viền trái `4px` của khối Consequence |
| | `mode/review-bg` / `text` | `#FDF2F8` / `#BE185D` | Badge `Review Study` (Hồng đậm học thuật) |
| **AI Neutral Tag** | `ai/support-bg` / `text` | `#F3F4F6` / `#4B5563` | Nhãn trung tính `AI Draft` hoặc `AI-assisted` (không màu mè, không icon lấp lánh `✨`) |
| **Semantic** | `semantic/success` | `#16A34A` | Trạng thái `Completed` (nền `#F0FDF4`, viền `#BBF7D0`), Toast thành công |
| | `semantic/warning` | `#D97706` | Trạng thái `Processing` (nền `#FFFBEB`, viền `#FDE68A`), cảnh báo nghiệp vụ |
| | `semantic/error` | `#DC2626` | Trạng thái `Failed` (nền `#FEF2F2`, viền `#FECACA`), lỗi form, nút Xóa/Hủy |

### 1.4. Hệ thống Typography Styles, Spacing & Vector Icons trên Figma
1. **Font chữ**: Sử dụng **`Inter`** trên Figma (tương đương System UI khi lên web).
   - `Display` (`28px / Line-height 36px / SemiBold 600 / Tracking -0.02em`): Tiêu đề trang lớn.
   - `H1` (`24px / 32px / SemiBold 600`): Tiêu đề khu vực.
   - `H2` (`20px / 28px / SemiBold 600`): Tiêu đề Card, tiêu đề Modal, tiêu đề Tình huống.
   - `H3` (`16px / 24px / SemiBold 600`): Tiêu đề nhóm Form, tiêu đề Drawer.
   - `Body Prose` (`15px / 24px / Regular 400`): Văn bản tình huống dài của sinh viên (tối đa `65–75` ký tự/dòng trong khung `768px`).
   - `Body Default` (`14px / 20px / Regular 400`) & `Body Strong` (`14px / 20px / Medium 500`): Nội dung bảng, nhãn Input, chữ trong nút bấm.
   - `Caption` (`12px / 16px / Regular 400` hoặc `Medium 500`): Text trong Badge, thời gian, chú thích phụ.
2. **Bo góc (Corner Radius) & Đổ bóng (Elevation)**:
   - `radius-sm: 6px` (Input, Select, Textarea) · `radius-md: 8px` (Button, Option Card, ReactFlow Node) · `radius-lg: 12px` (Card, Panel) · `radius-xl: 16px` (Modal) · `radius-full: 9999px` (**Chỉ dùng cho Badge**, tuyệt đối không làm nút bấm hình viên thuốc).
   - Card mặc định nằm trên nền `#F9FAFB` chỉ dùng viền `1px solid #E5E7EB` (**không đổ bóng**). Chỉ dùng bóng nhẹ cho Modal (`0 4px 12px rgba(17,24,39,0.10)`) và Toast (`0 4px 16px rgba(17,24,39,0.12)`).
3. **Bộ Icon Vector Chuẩn (`Lucide Icons` plugin trên Figma)**:
   - **Tuyệt đối không dùng Emoji (`🌿`, `📭`, `🤖`, `✍️`, `🏁`) hay ký tự chữ (`->`, `✕`) trên Figma.**
   - Dùng bộ icon nét mảnh **Lucide** (`stroke-width: 1.75px`, `16×16px` cho nút/bảng, `20×20px` cho menu/header, `14×14px` cho badge):
     - Logo Brand: Icon `git-branch` (`16px` trắng) đặt trong hộp vuông `28×28px` (`#2563EB`, bo góc `6px`) + chữ `EduBranch AI` (`16px SemiBold #111827`).
     - Menu & Nghiệp vụ: `book-open` (Courses), `file-text` / `upload` (Materials), `folder-git-2` (Cases), `git-fork` (Branching Study), `file-check-2` (Review Study), `flag` (Terminal Node), `message-square-question` (Challenge Support), `user-check` (Lecturer Feedback), `pen-line` (Reflection), `bar-chart-3` (Statistics), `rotate-ccw` (Retry), `x` (Close).

---

## 2. MA TRẬN PHÂN BỔ 15 TASKS THIẾT KẾ FIGMA THEO SPRINT

| Group ID | Master Task ID | Tên công việc thiết kế | Figma Page | Sprint | Flow | Priority | SP | Dependencies |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|---|
| `DES-001` | **EBA-101** | **Information Architecture for Lecturer, Student & Dual Learning Modes** | `00_IA & Sitemap` | Sprint 1 | Foundation | Highest | 3 | *None* |
| `DES-002` | **EBA-102** | **Shared Design States: Loading, Empty, Error & Permissions** | `01_Design System` | Sprint 1 | Foundation | High | 5 | EBA-101 |
| `DES-003` | **EBA-201** | **Material Library & Upload Interaction Flow Design** | `02_Materials & RAG` | Sprint 2 | Flow 1 | Highest | 3 | EBA-102 |
| `DES-004` | **EBA-202** | **Material Processing, Progress Bar & Failure Recovery States** | `02_Materials & RAG` | Sprint 2 | Flow 1 | High | 3 | EBA-201 |
| `DES-005` | **EBA-203** | **RAG Grounding Evidence & Source Inspection UI Design** | `02_Materials & RAG` | Sprint 2 | Flow 1 | High | 3 | EBA-201 |
| `DES-006` | **EBA-301** | **Case Generation Modal & Parameter Configuration Flow Design** | `03_Case & ReactFlow` | Sprint 3 | Flow 2 | Highest | 3 | EBA-203 |
| `DES-007` | **EBA-302** | **ReactFlow Decision Tree Visualization & Topology Layout Design** | `03_Case & ReactFlow` | Sprint 3 | Flow 2 | Highest | 5 | EBA-301 |
| `DES-008` | **EBA-303** | **Side-by-Side Node & Option Form Editor UX Design** | `03_Case & ReactFlow` | Sprint 3 | Flow 2 | Highest | 3 | EBA-302 |
| `DES-009` | **EBA-304** | **Case Governance Lifecycle Action Bar & Approval Status Design** | `03_Case & ReactFlow` | Sprint 3 | Flow 2 | Highest | 3 | EBA-302 |
| `DES-010` | **EBA-401** | **Branching Case Player Experience-First UI/UX Design** | `04_Branching Study` | Sprint 4 | Branching Study | Highest | 3 | EBA-309 |
| `DES-011` | **EBA-402** | **Journey Review Path Visualization & Consequence Reveal Design** | `04_Branching Study` | Sprint 4 | Branching Study | Highest | 5 | EBA-401 |
| `DES-012` | **EBA-403** | **Retry & New Attempt Initiation UX Design** | `04_Branching Study` | Sprint 4 | Branching Study | High | 2 | EBA-402 |
| `DES-013` | **EBA-404** | **Review Study Open Analysis & Solution Proposal UI Design** | `05_Review & Socratic` | Sprint 4 | Review Study | High | 3 | EBA-102 |
| `DES-014` | **EBA-405** | **Lecturer Qualitative Feedback & Review Dashboard Design** | `05_Review & Socratic` | Sprint 4 | Review Study | High | 3 | EBA-404 |
| `DES-015` | **EBA-406** | **AI Challenge Support Socratic Interaction UI Design** | `05_Review & Socratic` | Sprint 4 | Challenge Support | High | 3 | EBA-402, EBA-404 |

---

## 3. ĐẶC TẢ CHI TIẾT TỪNG TASK THIẾT KẾ TRÊN FIGMA (`DES-001` → `DES-015`)

---

### DES-001: [DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes

- **Master Task ID**: `EBA-101` | **Figma Page**: `00_IA & Sitemap`
- **Sprint**: `Sprint 1` | **Flow**: `Foundation` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: None
- **Tài liệu đối chiếu**: [`SITE-ARCHITECTURE.md`](design/SITE-ARCHITECTURE.md) · [`P0-FOUNDATION.md §1–3`](design/screens/P0-FOUNDATION.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 00.1 — Application Sitemap & User Flow Diagram`**: Sơ đồ tổng thể 14 routes chia làm 3 vùng (`PublicLayout`: 2 routes, `LecturerLayout`: 6 routes, `StudentLayout`: 6 routes) và đường rẽ nhánh giữa 2 chế độ học (`BRANCHING_STUDY` vs `REVIEW_STUDY`).
2. **`Frame 00.2 — Lecturer App Shell (`1440×900`) & Course Catalog (`/lecturer/courses`)`**:
   - **Left Sidebar (`240px × 900px`)**:
     - Header (`56px`): Logo `git-branch` (`28×28px #2563EB`) + chữ `EduBranch AI` + Role Pill `LECTURER` (`#F3F4F6` / `#4B5563`).
     - Menu chính (`padding: 16px 12px`, `gap: 4px`): Mục `Courses` (icon `book-open`, active state nền `#EFF6FF`, chữ `#2563EB`, thanh dọc trái `3px #2563EB`) và mục `Statistics` (icon `bar-chart-3`, chữ `#4B5563`).
     - Khu vực ngữ cảnh khóa học (`Course Context`): Tiêu đề nhỏ `SELECTED COURSE` (`11px Uppercase #9CA3AF`), bên dưới là 2 mục con: `Teaching Materials` (icon `file-text`) và `Case Studies` (icon `folder-git-2`).
     - Footer Sidebar (`border-top 1px #E5E7EB`, `padding: 16px`): Tên giảng viên, email đại học, nút icon `log-out`.
   - **Main Content Area (`1200px`)**: Breadcrumb + `PageHeader` (`"Courses"`, nút Primary `"New Course"` kèm icon `plus`) + Lưới 3 cột hiển thị `Course Card` (Mã học phần pill `#F3F4F6`, Tên học phần `20px SemiBold`, Mô tả 2 dòng, Footer gồm số lượng Materials/Cases và link `"Manage Materials"`, `"Manage Cases"`).
3. **`Frame 00.3 — Student App Shell (`1440×900`)`**:
   - **Compact Top Bar (`1440px × 56px`)**: Trái là Logo `EduBranch AI` + dấu gạch dọc + Tên học phần & Tên tình huống đang làm; Giữa là `LearningModeBadge` (`Branching Study` màu Teal hoặc `Review Study` màu Pink) + `Step Pill` (`Phase 1: Experience`); Phải là tên sinh viên + nút `Sign out`.
   - **Main Reading Container (`768px` canh giữa)**: Minh họa khung đọc không phân tâm (không có Sidebar trái).
4. **`Frame 00.4 & 00.5 — Public Auth Screens (`/login` & `/register`, `1440×900`)`**:
   - Card `400px` canh giữa màn hình nền `#F9FAFB`.
   - `/login`: Email, Password, nút Primary `"Sign In"` rộng 100%, link chuyển sang `/register`. (Không có nút chọn Role lúc đăng nhập, không có nút demo màu tím).
   - `/register`: Full Name, University Email, Password, bộ chọn Role 2 nút ngang (`Lecturer` / `Student` dạng Segmented Radio), nút Primary `"Create Account"`.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Tách rõ Lecturer Portal (`240px` Left Sidebar + `1200px` Workspace) và Student Portal (`56px` Compact Header + `768px` Reading Column).
- [ ] **AC-2**: Có navigation và hệ thống nhận diện (`LearningModeBadge`) riêng biệt cho `Branching Study` (`#F0FDFA / #0F766E`) và `Review Study` (`#FDF2F8 / #BE185D`).
- [ ] **AC-3**: Được FE/BE review và phê duyệt, đảm bảo 0% emoji và 0% màu tím.

---

### DES-002: [DES-002] Shared Design States: Loading, Empty, Error & Permissions

- **Master Task ID**: `EBA-102` | **Figma Page**: `01_Design System & Shared States`
- **Sprint**: `Sprint 1` | **Flow**: `Foundation` | **Priority**: `High` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-101
- **Tài liệu đối chiếu**: [`GLOBAL-DESIGN-SYSTEM.md §2–5`](design/GLOBAL-DESIGN-SYSTEM.md) · [`P0-FOUNDATION.md §4–5`](design/screens/P0-FOUNDATION.md)

#### Danh sách Components & Frames cần thiết kế trên Figma
1. **`Component Set 01.1 — Core UI Primitives`**:
   - `Button`: Variants `Primary` (`#2563EB`), `Secondary` (`#FFFFFF`, viền `#E5E7EB`), `Danger` (`#DC2626`), `Ghost`; Sizes `sm (32px)`, `md (40px)`, `lg (48px)`; States `Default`, `Hover`, `Active`, `Focus-Visible (2px ring #2563EB)`, `Disabled`, `Loading (kèm Spinner 16px)`. Tất cả đều bo góc `8px` (`radius-md`).
   - `Input / Select / Textarea`: Cao `40px` (Input/Select) và `120px–160px` (Academic Textarea), States `Default`, `Focus`, `Error (viền #DC2626 + chữ lỗi 12px bên dưới)`, `Disabled (#F3F4F6)`.
   - `CaseStatusBadge` (4 variants: `Draft`, `Reviewed`, `Approved`, `Published` kèm chấm `6px`), `LearningModeBadge` (2 variants: `Branching Study` kèm icon `git-fork`, `Review Study` kèm icon `file-check-2`), `AiOriginTag` (`AI Draft` / `AI-assisted` trung tính `#F3F4F6 / #4B5563` kèm icon `cpu` hoặc `file-code`, không dùng `✨`).
   - `Modal` (`560px` / `720px`), `ConfirmationDialog` (Xác nhận xóa/unpublish), `Toast` (4 variants: `Success`, `Warning`, `Error`, `Info` với thanh viền trái `4px`).
2. **`Frame 01.2 — Loading Skeleton State (`1440×900`)`**:
   - Hiển thị khung `LecturerLayout` khi đang tải dữ liệu: các khối chữ nhật xám nhạt `#F3F4F6` bo góc `8px` thay cho Course Cards và Table Rows (không dùng màn hình trắng trơ trọi chỉ có 1 vòng xoay).
3. **`Frame 01.3 — Empty State (`1440×900`)`**:
   - Khung giữa màn hình hiển thị hộp vuông `40×40px` (`#F3F4F6`, bo góc `8px`) chứa vector icon `inbox` hoặc `book-open` (`20px #9CA3AF`) + Tiêu đề `"No courses created yet"` (`16px SemiBold #111827`) + Mô tả 1 câu (`14px #4B5563`) + Nút Primary `"Create Your First Course"`. (Tuyệt đối không dùng emoji hòm thư `📭`).
4. **`Frame 01.4 — Error & 403 Permission Denied States (`1440×900`)`**:
   - **Error State**: Hộp vuông `40×40px` (`#FEF2F2`) chứa icon `alert-circle` (`20px #DC2626`) + Thông báo lỗi thân thiện (không lộ stack trace) + Nút Secondary `"Try Again"` (icon `rotate-ccw`).
   - **403 / 404 Access Denied State** (Ví dụ: Sinh viên truy cập link Case chưa `PUBLISHED` hoặc sai quyền Role): Hộp vuông `40×40px` (`#FFFBEB`) chứa icon `shield-alert` (`20px #D97706`) + Tiêu đề `"Case Not Available or Access Restricted"` + Nút quay lại.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế đầy đủ Loading (Skeleton), Empty (SVG Icon), Error (kèm Retry), 403 Permission Denied và Processing states.
- [ ] **AC-2**: Token màu sắc, typography và bộ Vector Icon (`Lucide`) dùng thống nhất 100% theo `GLOBAL-DESIGN-SYSTEM.md`.

---

### DES-003: [DES-003] Material Library & Upload Interaction Flow Design

- **Master Task ID**: `EBA-201` | **Figma Page**: `02_Lecturer: Materials & RAG`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-102
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §2`](design/screens/P1-LECTURER-CORE.md) · [`FEATURE-COURSE-AND-MATERIALS.md`](features/FEATURE-COURSE-AND-MATERIALS.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 02.1 — Course Materials Library (`/lecturer/courses/:courseId/materials`, `1440×900`)`**:
   - Đặt trong `LecturerLayout`. Breadcrumb: `Courses  /  Corporate Law (LAW301)  /  Teaching Materials`.
   - `PageHeader`: Tiêu đề `"Teaching Materials"`, mô tả phụ `"Upload course syllabi, case readings, and lecture notes (PDF or DOCX) for RAG grounding."`, nút Primary `"Upload Material"` (icon `upload`).
   - **Thanh công cụ lọc & tìm kiếm**: Ô tìm kiếm theo tên file (`320px`, icon `search`) + Bộ lọc trạng thái (`All Status`, `Completed`, `Processing`, `Failed`) + Bộ lọc định dạng (`All Types`, `PDF`, `DOCX`).
   - **Bảng danh sách tài liệu (`Materials Table`)**: Nền `#FFFFFF`, viền `1px #E5E7EB`, bo góc `8px`. Header bảng nền `#F3F4F6`. Các cột:
     1. `File Name`: Icon `file-text` (`16px #4B5563`) + tên file gốc (`originalFilename`, ví dụ `Syllabus_Corporate_Governance_2026.pdf`).
     2. `Type & Size`: Badge nhỏ `PDF` hoặc `DOCX` + dung lượng (`2.4 MB`).
     3. `Ingestion Status`: Badge trạng thái xử lý (`Completed`, `Processing`, `Pending`, `Failed`).
     4. `Indexed Chunks`: Số đoạn văn bản đã nhúng vector (ví dụ: `42 chunks`, nút bấm xem chi tiết mở `DES-005`).
     5. `Uploaded At`: Ngày giờ tải lên (`12px #9CA3AF`).
     6. `Actions`: Nút Ghost `"Inspect Chunks"` (icon `eye`) và nút Icon `"Delete"` (icon `trash-2`, hover `#DC2626`).
2. **`Frame 02.2 — Upload Material Modal (Drag-and-Drop PDF/DOCX, `560px Modal`)`**:
   - Tiêu đề Modal: `"Upload Teaching Material"` + nút đóng `x`.
   - **Vùng Drag-and-Drop (`Dropzone`)**: Khung chữ nhật viền nét đứt `2px dashed #D1D5DB` (hover/drag-over đổi sang viền `#2563EB`, nền `#EFF6FF`), chiều cao `180px`, ở giữa có hộp tròn `40px` chứa icon `upload-cloud` (`20px #2563EB`) + dòng chữ `"Click to select a file or drag and drop here"` + chú thích `"Supported formats: PDF, DOCX (Maximum file size: 50 MB)"`.
   - **Danh sách file đã chọn chuẩn bị tải lên**: Hiển thị thẻ file đính kèm (tên file, dung lượng, nút xóa `x`) và cảnh báo lỗi đỏ (`#DC2626`) nếu chọn nhầm file `.png`/`.xlsx` hoặc vượt quá `50MB`.
   - Footer Modal: Nút Secondary `"Cancel"` và nút Primary `"Start Upload & Ingestion"`.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế modal tải lên tài liệu hỗ trợ Drag-and-Drop cho định dạng PDF và DOCX (kèm trạng thái báo lỗi sai định dạng 415 / quá dung lượng 413).
- [ ] **AC-2**: Thiết kế bảng danh sách tài liệu hiển thị đầy đủ metadata (`filename`, `mimeType`, `size`, `status`, `chunk_count`, `uploadedAt`) và thanh tìm kiếm/lọc.

---

### DES-004: [DES-004] Material Processing, Progress Bar & Failure Recovery States

- **Master Task ID**: `EBA-202` | **Figma Page**: `02_Lecturer: Materials & RAG`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-201
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §2`](design/screens/P1-LECTURER-CORE.md) · [`FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`](features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md)

#### Danh sách Frames & Component States cần thiết kế trên Figma
1. **`Component Set 02.3 — Material Ingestion Status Row Variants`**:
   - **State 1 — `PENDING` (Đang xếp hàng chờ)**: Badge nền `#F3F4F6`, chữ `#4B5563`, icon `clock` (`14px`) + dòng phụ `"Queued for parsing..."`.
   - **State 2 — `PROCESSING` (Đang bóc tách văn bản & tạo Embedding)**: Badge nền `#FFFBEB`, chữ `#92400E`, icon `loader-2` (`14px` xoay) + Thanh tiến trình mảnh (`Progress Bar` cao `6px`, rộng `140px`, nền `#E5E7EB`, thanh chạy màu `#2563EB`) kèm nhãn giai đoạn `"Parsing & generating pgvector embeddings..."`.
   - **State 3 — `COMPLETED` (Hoàn tất)**: Badge nền `#F0FDF4`, chữ `#166534`, icon `check-circle-2` (`14px #16A34A`) + Hiển thị số lượng `"48 chunks indexed"`.
   - **State 4 — `FAILED` (Thất bại & Phục hồi)**: Badge nền `#FEF2F2`, chữ `#DC2626`, icon `alert-triangle` (`14px #DC2626`) + Dòng giải thích lỗi ngắn gọn dưới tên file (`"Failed to extract text: file may be password-protected or corrupted"`) + Nút hành động ngay trên dòng: Secondary `"Retry Ingestion"` (icon `rotate-ccw`) và `"Remove"` (icon `trash-2`).
2. **`Frame 02.4 — Materials Table with Live Processing & Failed Recovery States (`1440×900`)`**:
   - Màn hình tổng thể bảng tài liệu hiển thị đồng thời cả 4 trạng thái trên cùng một bảng để đội FE nhìn rõ sự khác biệt trực quan, kèm hộp thoại `ConfirmationDialog` khi giảng viên bấm xóa một tài liệu đã tạo case.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế rõ ràng 4 trạng thái tiến độ: `PENDING`, `PROCESSING` (Parsing/Chunking/Embedding kèm thanh tiến trình), `COMPLETED`, `FAILED`.
- [ ] **AC-2**: Thiết kế thông báo lỗi ngôn ngữ tự nhiên (không lộ mã lỗi server thô) và nút bấm `Retry Ingestion` khi xử lý tài liệu thất bại.

---

### DES-005: [DES-005] RAG Grounding Evidence & Source Inspection UI Design

- **Master Task ID**: `EBA-203` | **Figma Page**: `02_Lecturer: Materials & RAG`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-201
- **Tài liệu đối chiếu**: [`RAG-PIPELINE.md`](ai/RAG-PIPELINE.md) · [`FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`](features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 02.5 — Source Chunks & RAG Grounding Inspector Drawer (`1440×900` với Right Slide-Over Drawer rộng `520px`)`**:
   - Khi giảng viên bấm `"Inspect Chunks"` trên một tài liệu `COMPLETED` (hoặc bấm `"View Source Evidence"` trên một Case Draft được sinh từ RAG), một **Slide-Over Drawer rộng `520px × cao 900px`** trượt ra từ bên phải (`bg-surface #FFFFFF`, `border-left 1px #E5E7EB`, bóng `elevation-2`).
   - **Drawer Header**: Tiêu đề `"Indexed Source Chunks"`, tên file tài liệu (`Syllabus_Corporate_Governance_2026.pdf`), tổng số chunks (`48 chunks`), nút đóng `x`.
   - **Thanh tìm kiếm trong Drawer**: Ô lọc nhanh nội dung chunk (`"Filter chunks by keyword..."`, icon `search`).
   - **Danh sách `Evidence Chunk Cards`** (Auto-Layout dọc, `gap: 12px`, cuộn dọc):
     - Mỗi Card (`#F9FAFB`, viền `1px #E5E7EB`, bo góc `8px`, `padding: 16px`):
       - **Header của Chunk**: Pill nhỏ `Chunk #12` (`#E5E7EB / #374151`) + `Page 14` (icon `book-open` `12px`) + Số ký tự (`680 chars`). (Khi xem từ màn hình Case Review thì có thêm badge nhỏ `Referenced in Node 2`).
       - **Nội dung văn bản trích xuất (`chunk_text`)**: Font `14px/20px #111827`, trình bày sạch sẽ, dễ đọc.
   - **Ranh giới bảo mật bắt buộc trên giao diện**: Tuyệt đối không hiển thị mảng số thực embedding vector (`[0.0123, -0.0432, ...]`), không hiển thị `X-Internal-API-Key`, không hiển thị cấu trúc system prompt hay thẻ `<sources>` thô của backend.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế Drawer/Modal hiển thị danh sách các đoạn văn bản trích dẫn nguồn (`evidence chunks`) kèm số thứ tự chunk và số trang (`page_number`).
- [ ] **AC-2**: Tuyệt đối không để lộ thông tin nhạy cảm (API keys, system prompt, raw vector floats, internal DB UUIDs).

---

### DES-006: [DES-006] Case Generation Modal & Parameter Configuration Flow Design

- **Master Task ID**: `EBA-301` | **Figma Page**: `03_Lecturer: Case & ReactFlow`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-203
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §3`](design/screens/P1-LECTURER-CORE.md) · [`FEATURE-CASE-GENERATION.md`](features/FEATURE-CASE-GENERATION.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 03.1 — Course Cases List (`/lecturer/courses/:courseId/cases`, `1440×900`)`**:
   - Breadcrumb: `Courses  /  Corporate Law (LAW301)  /  Case Studies`.
   - `PageHeader`: Tiêu đề `"Case Studies"`, nút Primary `"Generate Case with AI"` (icon `plus`) và nút Secondary `"Create Manual Case"`.
   - **Underline Filter Tabs**: `All Cases (6)` · `Branching Study (4)` · `Review Study (2)` (Tab đang chọn có gạch chân `2px #2563EB` và chữ `#111827`).
   - **Lưới `Case Card` (2 cột trên vùng `1136px`)**: Mỗi Card (`#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 24px`) hiển thị:
     - Hàng trên cùng: `LearningModeBadge` (`Branching Study` Teal hoặc `Review Study` Pink) + `CaseStatusBadge` (`Draft`, `Reviewed`, `Approved`, `Published`) + `AiOriginTag` (`AI Draft` trung tính `#F3F4F6`, **chỉ hiện khi status là `DRAFT`**).
     - Tiêu đề tình huống (`20px SemiBold #111827`).
     - Mô tả tóm tắt (`14px #4B5563`, cắt gọn 2 dòng).
     - Footer Card (`border-top 1px #F3F4F6`, `pt-3`): Thời gian cập nhật (`Updated 2 hours ago`) + Nút link `"Review & Edit"` (kèm icon `arrow-right`).
2. **`Frame 03.2 — Generate Case Configuration Modal (`640px Modal`)`**:
   - **Trường 1 — Chọn Chế độ học (`Learning Mode Selector`)**: 2 thẻ chọn dạng Radio Card nằm ngang:
     - Thẻ 1 (`BRANCHING_STUDY`): Icon `git-fork`, tiêu đề `"Branching Study"`, mô tả `"Interactive multi-step decision tree with consequences and outcomes."` (Đang chọn: viền `2px #2563EB`, nền `#EFF6FF`).
     - Thẻ 2 (`REVIEW_STUDY`): Icon `file-check-2`, tiêu đề `"Review Study"`, mô tả `"Open-ended case context and problem for analytical solution proposal."`
   - **Trường 2 — Chọn Tài liệu Giáo trình Nguồn (`Teaching Materials Multi-Select`)**: Danh sách checkbox các tài liệu đã `COMPLETED` trong khóa học (kèm badge số chunks). Nếu khóa học chưa có tài liệu `COMPLETED` nào, hiển thị cảnh báo vàng `#FFFBEB` và khóa nút Generate.
   - **Trường 3 — Chủ đề / Định hướng tình huống (`Topic / Scenario Prompt`, bắt buộc `10–500` ký tự)**: Textarea cao `96px`, placeholder `"e.g., Board of Directors conflict of interest during a hostile takeover bid..."`, kèm bộ đếm `120 / 500`.
   - **Trường 4 — Độ sâu cây quyết định (`Target Node Count` — Chỉ hiện khi chọn `Branching Study`)**: Select hoặc Segmented number picker (`5 nodes (Compact)` · `7 nodes (Standard)` · `10 nodes (Deep)`).
   - Footer Modal: Nút Secondary `"Cancel"` + Nút Primary `"Generate Case Draft"`.
3. **`Frame 03.3 — Generating Case In-Progress State (`640px Modal Loading State`)`**:
   - Khi đang gọi AI Service sinh cấu trúc cây quyết định và kiểm tra DAG (mất ~5–15 giây), Modal chuyển sang trạng thái khóa form, hiển thị `Spinner` chuẩn (`#2563EB`) cùng 3 bước tiến độ rõ ràng:
     1. `Retrieving relevant chunks from 2 selected teaching materials...` (`check` `#16A34A`)
     2. `Synthesizing branching scenario and decision nodes...` (đang chạy `#2563EB`)
     3. `Validating acyclic decision tree structure (DAG check)...` (chờ `#9CA3AF`)

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế bộ chọn (multi-select picker) các tài liệu tham khảo đã xử lý xong (`COMPLETED`) trong khóa học.
- [ ] **AC-2**: Thiết kế trường nhập chủ đề gợi ý (`topic`, 10–500 ký tự), chọn chế độ học (`BRANCHING_STUDY` / `REVIEW_STUDY`) và số lượng node mong muốn (`targetNodeCount`).
- [ ] **AC-3**: Thiết kế trạng thái loading đang tạo case kèm thông báo tiến độ rõ ràng và trạng thái báo lỗi (Toast `#DC2626`) nếu AI sinh lỗi sau khi retry.

---

### DES-007: [DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design

- **Master Task ID**: `EBA-302` | **Figma Page**: `03_Lecturer: Case & ReactFlow`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-301
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §4`](design/screens/P1-LECTURER-CORE.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.4`](design/GLOBAL-DESIGN-SYSTEM.md) · [`FEATURE-DECISION-TREE.md`](features/FEATURE-DECISION-TREE.md)

#### Danh sách Frames & Node Components cần thiết kế trên Figma
1. **`Component Set 03.4 — ReactFlow Decision Node Variants (Rộng cố định `260px`)`**:
   - **Quy tắc màu sắc bắt buộc**: Mọi node đều có nền `#FFFFFF`, bo góc `8px` (`radius-md`). **Tuyệt đối không tô nền xanh lá cho Root hay đỏ hồng cho Terminal** (vì hệ thống không có nhánh "đúng/sai").
   - **Variant 1 — `Root Node (Start)`**: Viền `1px #E5E7EB`, Header gắn pill nhỏ `START` (`#EFF6FF / #1D4ED8`) + mã `Node 1`, thân node hiển thị 2 dòng văn bản `situation` (`13px #111827`), footer hiển thị pill `3 options` (`12px #4B5563`).
   - **Variant 2 — `Intermediate Decision Node`**: Viền `1px #E5E7EB`, Header gắn nhãn `DECISION NODE` (`#F3F4F6 / #4B5563`), thân node hiển thị 2 dòng `situation`, footer hiển thị `2 options`.
   - **Variant 3 — `Terminal Node (Outcome)`**: Viền đậm hơn `1.5px solid #D1D5DB`, Header có icon `flag` (`14px #4B5563`) + pill `OUTCOME` (`#F3F4F6 / #374151`), footer ghi `Terminal State (0 options)`.
   - **Variant 4 — `Selected / Active Editing Node`**: Viền `2px solid #2563EB` + hiệu ứng ring `4px rgba(37,99,235,0.12)` để giảng viên biết đang sửa node nào trên Drawer bên phải.
   - **Variant 5 — `Validation Error Node (Cycle / Orphan)`**: Viền `2px solid #DC2626`, badge nhỏ `Loop Detected` hoặc `Orphan Node` (`#FEF2F2 / #DC2626`).
2. **`Component 03.5 — ReactFlow Directed Edge & Option Label`**:
   - Đường nối Bezier/SmoothStep dày `1.5px`, màu `#9CA3AF` (khi chọn đổi sang `#2563EB`, khi bị lỗi vòng lặp đổi sang `#DC2626`). Tuyệt đối không dùng màu tím `#6366F1`.
   - Nhãn nằm giữa đường nối (`Edge Label Pill`): Nền `#FFFFFF`, viền `1px #E5E7EB`, bo góc `4px`, `padding: 2px 6px`, chữ `11px #4B5563` cắt gọn 24 ký tự đầu của `option_text` (ví dụ: `"Disclose conflict to board..."`).
3. **`Frame 03.6 — Case Review ReactFlow Canvas (`1440×900`, vùng Canvas chiếm `60% = 720px`)`**:
   - Nền Canvas `#F9FAFB` với lưới chấm bi mờ (`dot grid #E5E7EB`, khoảng cách `16px`).
   - Hiển thị một cây quyết định mẫu gồm 1 Root Node → 2 Decision Nodes → 3 Terminal Outcome Nodes được căn chỉnh phân tầng từ trên xuống dưới (`Top-to-Bottom DAG`).
   - Góc dưới bên trái Canvas có cụm nút điều khiển thu phóng (`Zoom In`, `Zoom Out`, `Fit View`, `Auto-Align Tree`) nằm trong hộp nổi nhỏ gọn (`#FFFFFF`, viền `1px #E5E7EB`, bo góc `8px`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế trực quan sơ đồ cây trên canvas ReactFlow với 3 loại node chuẩn (`Root Node`, `Decision Node`, `Terminal Outcome Node`) dùng nền trắng `#FFFFFF` học thuật, không tô màu lòe loẹt.
- [ ] **AC-2**: Thiết kế trạng thái Node đang chọn (`2px #2563EB`), Node bị lỗi cấu trúc (`2px #DC2626`), và đường nối (`edges` `#9CA3AF`) có nhãn tóm tắt lựa chọn.
- [ ] **AC-3**: Thiết kế cụm công cụ hỗ trợ thao tác `Zoom`, `Pan`, `Fit View` và `Auto-Align` trên góc Canvas.

---

### DES-008: [DES-008] Side-by-Side Node & Option Form Editor UX Design

- **Master Task ID**: `EBA-303` | **Figma Page**: `03_Lecturer: Case & ReactFlow`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-302
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §4`](design/screens/P1-LECTURER-CORE.md) · [`FEATURE-CASE-REVIEW-AND-PUBLISHING.md`](features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 03.7 — Split-Screen Case Review with Right Node Inspector Drawer (`/lecturer/cases/:caseId/review` — Branching Mode, `1440×900`)`**:
   - Bên trái (`60% = 720px`): ReactFlow Canvas (`DES-007`) với `Node 2` đang ở trạng thái `Selected (#2563EB)`.
   - Bên phải (`40% = 480px`): **Node Inspector & Form Editor Panel** (`#FFFFFF`, viền trái `1px #E5E7EB`, cuộn dọc độc lập):
     - **Panel Header (`padding: 16px 24px`, `border-bottom 1px #E5E7EB`)**: Tiêu đề `"Edit Node #2"`, công tắc/checkbox `"Mark as Terminal Outcome Node"`, nút `"View RAG Source"` (mở `DES-005`), nút đóng panel `x`.
     - **Khu vực 1 — Nội dung Tình huống (`Situation Narrative`)**: Nhãn `"Situation Description"`, Textarea cao `140px` chứa văn bản tình huống của node đang chọn.
     - **Khu vực 2 — Danh sách các Phương án lựa chọn (`Decision Options (2–4 options)`)**:
       - Mỗi phương án nằm trong một khung gọn (`#F9FAFB`, viền `1px #E5E7EB`, bo góc `8px`, `padding: 16px`, `gap: 12px`):
         1. Header phương án: Nhãn `"Option A"` (`12px SemiBold #4B5563`) + nút icon xóa phương án `trash-2`.
         2. Trường `"Option Text (Shown during Phase 1 Experience)"`: Input/Textarea 2 dòng.
         3. Trường `"Consequence Explanation (Revealed in Phase 2 REVIEW)"`: Textarea 3 dòng, có thanh viền trái `3px #0F766E` để nhắc giảng viên đây là nội dung hệ quả sẽ mở khóa ở màn hình Review.
         4. Trường `"Leads to Next Node (next_node_id)"`: Dropdown Select chọn node đích (ví dụ: `"→ Node 4: Emergency Shareholder Meeting (Outcome)"`).
       - Nút Secondary `"+ Add Option"` ở cuối danh sách (tối đa 4 options/node).
     - **Panel Sticky Footer (`padding: 16px 24px`, `border-top 1px #E5E7EB`, nền `#FFFFFF`)**: Nút Secondary `"Discard"` và nút Primary `"Save Node Changes"` (kèm chú thích nhỏ: lưu chỉnh sửa trên bản `DRAFT` sẽ tự động chuyển trạng thái Case sang `REVIEWED`).
2. **`Frame 03.8 — Review Study Case Editor Variant (`/lecturer/cases/:caseId/review` — Review Study Mode, `1440×900`)`**:
   - Khi `learning_mode = 'REVIEW_STUDY'`, **không hiển thị ReactFlow Canvas** (vì Review Study không có cây quyết định).
   - Hiển thị trình biên tập biểu mẫu 1 cột rộng `800px` canh giữa vùng làm việc: Trường `"Case Title"`, `"Short Description"`, Textarea lớn `"Case Context & Background Data (context_text)"` (cao `240px`), và Textarea lớn `"Analytical Problem / Question (problem_text)"` (cao `160px`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế панель/drawer bên phải (`40%` chiều rộng) song song với Canvas (`60%`) để xem và chỉnh sửa chi tiết từng node khi click trên canvas, cộng thêm biến thể Form Editor cho `REVIEW_STUDY`.
- [ ] **AC-2**: Thiết kế đầy đủ các trường chỉnh sửa: `Situation text`, `Option text`, `Consequence explanation` và `Next Node selector` (`next_node_id`).
- [ ] **AC-3**: Thiết kế nút `"Save Node Changes"` ở thanh footer cố định của panel và thể hiện trạng thái cập nhật tức thì trên sơ đồ cây.

---

### DES-009: [DES-009] Case Governance Lifecycle Action Bar & Approval Status Design

- **Master Task ID**: `EBA-304` | **Figma Page**: `03_Lecturer: Case & ReactFlow`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-302
- **Tài liệu đối chiếu**: [`P1-LECTURER-CORE.md §4`](design/screens/P1-LECTURER-CORE.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.3`](design/GLOBAL-DESIGN-SYSTEM.md) · [`FEATURE-CASE-REVIEW-AND-PUBLISHING.md`](features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md)

#### Danh sách Components & Frames cần thiết kế trên Figma
1. **`Component Set 03.9 — Case Governance Top Action Bar & 4-Step Lifecycle Stepper (4 Variants theo trạng thái)`**:
   - Thanh công cụ gắn cố định phía trên màn hình Case Review (`cao 64px`, nền `#FFFFFF`, `border-bottom 1px #E5E7EB`, `padding: 0 24px`):
   - **Bên trái**: Nút quay lại `arrow-left` + Tên Case (cho phép sửa inline) + `LearningModeBadge` + `Version Pill` (`v1`).
   - **Chính giữa — `4-Step Lifecycle Stepper`**:
     ```text
     (1) Draft  ───  (2) Reviewed  ───  (3) Approved  ───  (4) Published
     ```
     - Bước đã qua: Vòng tròn `20px` nền `#2563EB` có dấu `check` trắng, dây nối liền `#2563EB`.
     - Bước hiện tại: Vòng tròn viền `2px #2563EB`, chữ đậm `#111827`, kèm `CaseStatusBadge` tương ứng.
     - Bước chưa tới: Vòng tròn viền `#D1D5DB`, chữ `#9CA3AF`, dây nối `#E5E7EB`.
   - **Bên phải — Cụm nút chuyển trạng thái có điều kiện**:
     - Khi ở `DRAFT`: Nút Secondary `"Save & Mark as Reviewed"` · Nút `"Approve Case"` (Disabled) · Nút `"Publish"` (Disabled).
     - Khi ở `REVIEWED`: Nút Secondary `"Save Changes"` · Nút Primary `"Approve Case"` (`#2563EB`) · Nút `"Publish"` (Disabled kèm tooltip `"Case must be Approved before publishing"`).
     - Khi ở `APPROVED`: Nút Secondary `"Revert to Draft"` · Nút Primary `"Publish to Students"` (`#2563EB`, icon `globe` hoặc `share-2`).
     - Khi ở `PUBLISHED`: Badge `Published` (`#F0FDF4 / #166534`) + Nút Secondary `"Copy Student Link"` (icon `link`) + Nút Secondary `"Unpublish (Create v2 Draft)"`.
2. **`Frame 03.10 — Publish Confirmation & Student Direct Link Modal (`520px Modal`)`**:
   - Hộp thoại xác nhận trước khi xuất bản (`Publish Case`):
   - Giải thích rõ: *"Once published, this case becomes accessible to students via direct link. Structural edits will require creating a new version."*
   - Khung hiển thị **Direct Student Link** (`https://edubranch.univ.edu/student/cases/c8f9.../branching-play`) trên nền `#F3F4F6` kèm nút `"Copy Link"` (icon `copy`).
   - Footer Modal: Nút Secondary `"Cancel"` và nút Primary `"Confirm & Publish Case"`.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế thanh công cụ kèm `4-Step Stepper` hiển thị rõ trạng thái hiện tại (`DRAFT → REVIEWED → APPROVED → PUBLISHED`).
- [ ] **AC-2**: Thiết kế đầy đủ 4 variants của cụm nút hành động chuyển trạng thái có điều kiện (`Mark as Reviewed`, `Approve Case`, `Publish to Students`, `Unpublish`).
- [ ] **AC-3**: Thiết kế hộp thoại xác nhận xuất bản kèm ô sao chép đường dẫn trực tiếp (`Direct Student Link`) chia sẻ cho sinh viên.

---

### DES-010: [DES-010] Branching Case Player Experience-First UI/UX Design

- **Master Task ID**: `EBA-401` | **Figma Page**: `04_Student: Branching Study`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-309
- **Tài liệu đối chiếu**: [`P2-STUDENT-CORE.md §1`](design/screens/P2-STUDENT-CORE.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.5`](design/GLOBAL-DESIGN-SYSTEM.md) · [`FEATURE-BRANCHING-STUDY.md`](features/FEATURE-BRANCHING-STUDY.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 04.1 — Branching Case Player: Active Decision Point (`/student/cases/:caseId/branching-play`, `1440×900`)`**:
   - Sử dụng `StudentLayout` (`56px` Top Header + Cột đọc đơn **`768px` (`max-w-3xl`)** canh giữa màn hình nền `#F9FAFB`). **Tuyệt đối không vẽ sơ đồ ReactFlow trên màn hình sinh viên.**
   - **Header phụ của Tình huống (nằm đầu cột `768px`)**:
     - Hàng metadata nhỏ: Pill `"Attempt #1"` (`#F3F4F6 / #4B5563`) + Pill `"Decision Step 2"` (`#EFF6FF / #1D4ED8`) (Không dùng thanh phần trăm `%` vì độ dài mỗi nhánh khác nhau).
   - **Khối 1 — `Situation Narrative Card` (`768px`, nền `#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 32px`)**:
     - Nhãn nhỏ phía trên: `"CURRENT SITUATION"` (`12px SemiBold Uppercase #4B5563`, tracking `0.05em`).
     - Văn bản tình huống (`situation`): Font `15px / Line-height 24px / #111827`, chia đoạn rõ ràng, dễ đọc.
   - **Khối 2 — `Decision Options Selector` (Nằm ngay dưới Situation Card, `gap: 12px`)**:
     - Tiêu đề nhóm: `"Select your course of action"` (`16px SemiBold #111827`). (Tuyệt đối không chèn hộp callout màu mè giảng giải cách chơi).
     - Danh sách 2–4 `Option Cards` xếp dọc (`768px`, nền `#FFFFFF`, viền `1px #E5E7EB`, `radius 8px`, `padding: 16px 20px`):
       - **Trạng thái chưa chọn (`Rest`)**: Vòng tròn radio `18px` viền `#D1D5DB` bên trái + Nhãn `"Option A"` + Nội dung `option_text` (`14px #111827`).
       - **Trạng thái đang chọn (`Selected`)**: Viền `2px solid #2563EB`, nền `#EFF6FF`, vòng tròn radio bên trái tô `#2563EB` có chấm trắng ở giữa.
     - **Nút hành động dưới cùng bên phải**: Nút Primary `"Confirm & Continue"` (`#2563EB`, kèm icon `arrow-right`).
     - **LUẬT NGHIỆP VỤ BẮT BUỘC TRÊN FIGMA**: Giữa các bước ra quyết định ở Phase 1, **TUYỆT ĐỐI KHÔNG** có ô nhập lập luận (`Reasoning Textarea`) và **TUYỆT ĐỐI KHÔNG** có thẻ tiết lộ hệ quả (`Consequence Card`). Bấm `"Confirm & Continue"` là chuyển thẳng sang tình huống của node tiếp theo.
2. **`Frame 04.2 — Branching Case Player: Terminal Outcome Reached (`/student/cases/:caseId/branching-play`, `1440×900`)`**:
   - Khi sinh viên đi tới node kết thúc (`is_terminal = TRUE`):
   - Hiển thị **Terminal Outcome Card** (`768px`, nền `#FFFFFF`, viền đậm `1.5px #D1D5DB`, `radius 12px`, `padding 32px`):
     - Header của Card: Hộp vuông `36×36px` (`#F3F4F6`) chứa icon `flag` (`18px #374151`) + Badge `"Scenario Outcome Reached"` (`#F3F4F6 / #374151`).
     - Nội dung kết cục cuối cùng của nhánh (`situation` của terminal node).
     - Footer của Card (`border-top 1px #E5E7EB`, `pt-6`, `mt-6`): Dòng chữ ngắn gọn `"You have completed the decision phase of this scenario (3 decision steps taken)."` + Nút Primary `"Proceed to Journey Review & Analysis"` (`#2563EB`, icon `arrow-right` → chuyển sang `DES-011`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế màn hình ra quyết định tập trung (`768px` single-column prose layout), không phân tâm, không có sơ đồ ReactFlow, không có banner giảng giải dài dòng.
- [ ] **AC-2**: Tuyệt đối không hiển thị thẻ hệ quả (`consequence card`) giữa chừng trong Phase 1.
- [ ] **AC-3**: Tuyệt đối không có form nhập lập luận (`reasoning form`) giữa các bước trong Phase 1; thiết kế rõ trạng thái chạm `Terminal Outcome Node` chuyển tiếp sang Phase 2 (`REVIEW`).

---

### DES-011: [DES-011] Journey Review Path Visualization & Consequence Reveal Design

- **Master Task ID**: `EBA-402` | **Figma Page**: `04_Student: Branching Study`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `Highest` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-401
- **Tài liệu đối chiếu**: [`P2-STUDENT-CORE.md §1b`](design/screens/P2-STUDENT-CORE.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.6–6.7`](design/GLOBAL-DESIGN-SYSTEM.md) · [`FEATURE-STUDENT-REASONING.md`](features/FEATURE-STUDENT-REASONING.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 04.3 — Branching Study Phase 2: Journey Review & Consequence Reveal (`/student/cases/:caseId/attempt/:attemptId/review`, `1440×1320` Auto-Height)`**:
   - Sử dụng `StudentLayout` (`56px` Top Header hiển thị `Phase 2: Journey Review` + Cột chính **`768px`** canh giữa).
   - **Header Trang**: Tiêu đề `"Journey Review & Retrospective Analysis"` (`24px SemiBold #111827`) + phụ đề ngắn gọn `"Review the consequences of each decision along your path and articulate the reasoning behind your choices."`
   - **Dòng thời gian Hành trình (`Vertical Chronological Decision Timeline`)**:
     - Các bước quyết định (`Step 1`, `Step 2`, ..., `Final Outcome`) nối với nhau bằng một đường kẻ dọc `2px #E5E7EB` bên trái.
     - **Cấu trúc chuẩn của mỗi `Decision Step Review Card` (`768px`, nền `#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 24px`)**:
       1. **Phần 1 — Tình huống & Phương án đã chọn**:
          - Header bước: Badge `"Step 1"` (`#EFF6FF / #1D4ED8`) + Tiêu đề tóm tắt tình huống.
          - Khung phương án đã chọn (`#EFF6FF`, viền `1px #BFDBFE`, bo góc `8px`, `padding 12px 16px`): Nhãn `"Your Choice"` + nội dung `option_text` đã chọn.
          - Nút thu gọn/mở rộng nhẹ nhàng bên dưới: `"View 2 unchosen alternatives"` (khi mở ra hiển thị các phương án không chọn bằng chữ xám mờ `#9CA3AF` trên nền `#F9FAFB`).
       2. **Phần 2 — Khối Tiết lộ Hệ quả (`Consequence Reveal Block` — Lần đầu tiên xuất hiện)**:
          - Khung nền `#F3F4F6`, bo góc phải `8px`, **thanh viền trái dày `4px solid #0F766E` (`mode-branching` Teal)**, `padding: 16px`:
          - Nhãn `"Consequence"` (`12px SemiBold Uppercase #0F766E`) + Nội dung `case_options.consequence` do giảng viên biên soạn (`14px #111827`).
       3. **Phần 3 — Biểu mẫu Lập luận Hồi cứu (`Retrospective Student Reasoning Input`)**:
          - Nhãn `"Your Reasoning"` (`14px Medium #111827`) + Chú thích 1 dòng (`12px #4B5563`: `"Why did you select this option, and what trade-offs did you consider? (10–2000 characters)"`). (Tuyệt đối không dùng từ `"Your Argument"`).
          - Textarea cao `120px` (hoặc trạng thái `Saved` hiển thị badge xanh lá nhỏ `Saved` kèm icon `check` `#16A34A`).
          - Hàng nút hành động dưới Textarea: Bên trái là nút Secondary `"Explore with AI Challenge Support (0/2 rounds)"` (icon `message-square-question`, chỉ bật sau khi đã lưu reasoning → dẫn tới `DES-015`); Bên phải là nút Secondary/Primary `"Save Reasoning"`.
   - **Thanh điều hướng cuối trang (`Bottom Action Bar`)**: Nút Primary `"Complete Review & Proceed to Reflection"` (`#2563EB`, icon `arrow-right` → chuyển sang `DES-012`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế lộ trình toàn bộ các bước đã đi qua theo thứ tự thời gian (`Chronological Timeline`) trong khung `768px`.
- [ ] **AC-2**: Mở khóa và hiển thị đầy đủ văn bản hệ quả (`Consequence` với viền trái `4px #0F766E`) cùng các phương án thay thế lần đầu tiên tại màn hình Review.
- [ ] **AC-3**: Thiết kế form nhập lập luận hồi cứu (`Your Reasoning`, 10–2000 ký tự) và nút kích hoạt `AI Challenge Support` cho từng điểm quyết định.

---

### DES-012: [DES-012] Retry & New Attempt Initiation UX Design

- **Master Task ID**: `EBA-403` | **Figma Page**: `04_Student: Branching Study`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `High` | **Story Points**: `2`
- **Dependencies**: is blocked by Master Task EBA-402
- **Tài liệu đối chiếu**: [`P2-STUDENT-CORE.md §1–2`](design/screens/P2-STUDENT-CORE.md) · [`FEATURE-REFLECTION.md`](features/FEATURE-REFLECTION.md) · [`FEATURE-BRANCHING-STUDY.md`](features/FEATURE-BRANCHING-STUDY.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 04.4 — Phase 3: Post-Outcome Reflection & Retry Screen (`/student/cases/:caseId/attempt/:attemptId/reflect`, `1440×900`)`**:
   - Sử dụng `StudentLayout` (`56px` Top Header hiển thị `Phase 3: Reflection` + Cột chính **`768px`** canh giữa).
   - **Khối 1 — Tóm tắt kết quả lượt trải nghiệm hiện tại (`Attempt #1 Summary Banner`)**:
     - Card gọn (`#FFFFFF`, viền `1px #E5E7EB`, `padding 20px`): Hiển thị `"Attempt #1 Completed"`, kết cục đạt được (`Terminal Outcome`), số bước quyết định đã đi, và trạng thái nhận xét của giảng viên (nếu có).
   - **Khối 2 — Biểu mẫu Phản tư Tổng kết (`Your Reflection Card`)**:
     - Card chính (`#FFFFFF`, viền `1px #E5E7EB`, `padding 24px`):
     - Nhãn `"Your Post-Case Reflection"` (`16px SemiBold #111827`) + Chú thích 1 dòng (`12px #4B5563`: `"Synthesize what you learned from the consequences encountered across this decision path."`).
     - Textarea cao `160px` (`reflection_text`) + Nút Primary `"Submit Reflection"`.
     - *(Hiển thị thêm trạng thái sau khi đã nộp `reflection_status = 'SUBMITTED'`*: Văn bản phản tư chuyển sang chế độ Read-Only sạch sẽ kèm badge `"Reflection Submitted"` `#F0FDF4 / #166534`).
   - **Khối 3 — Khung Khám phá Nhánh Khác (`Explore Another Decision Path / Retry Card`)**:
     - Card nền `#F9FAFB`, viền `1px #E5E7EB`, `padding 20px`, bố cục ngang:
     - Bên trái: Icon `rotate-ccw` (`20px #4B5563`) + Tiêu đề `"Explore an Alternative Decision Path"` + Giải thích `"Start a new immutable attempt (Attempt #2) from the beginning while preserving your Attempt #1 history and reflections."`
     - Bên phải: Nút Secondary `"Try Another Path (New Attempt)"` (icon `rotate-ccw`).
2. **`Frame 04.5 — Start New Attempt Confirmation Modal (`480px Modal`)`**:
   - Tiêu đề: `"Start Attempt #2?"`
   - Nội dung truyền đạt chuẩn sư phạm (không phán xét đúng/sai): *"Your completed Attempt #1 (including all saved reasoning and reflection) is permanently preserved in your learning history. Starting Attempt #2 lets you explore different decisions and consequences from the initial situation."*
   - Footer Modal: Nút Secondary `"Cancel"` và nút Primary `"Start Attempt #2"` (`#2563EB`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế màn hình Reflection (Phase 3) kèm nút và Modal xác nhận `Try Another Path (New Attempt)` bắt đầu lượt trải nghiệm mới (`attempt_number + 1`).
- [ ] **AC-2**: Truyền đạt rõ ràng nguyên tắc bất biến dữ liệu (`INV-12`): lượt làm bài cũ (`Attempt #1`) được bảo lưu trọn vẹn, tuyệt đối không bị ghi đè hay chấm điểm đúng/sai.

---

### DES-013: [DES-013] Review Study Open Analysis & Solution Proposal UI Design

- **Master Task ID**: `EBA-404` | **Figma Page**: `05_Review, Feedback & Socratic`
- **Sprint**: `Sprint 4` | **Flow**: `Review Study` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-102
- **Tài liệu đối chiếu**: [`P4-REVIEW-STUDY.md §1`](design/screens/P4-REVIEW-STUDY.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.9`](design/GLOBAL-DESIGN-SYSTEM.md) · [`FEATURE-REVIEW-STUDY.md`](features/FEATURE-REVIEW-STUDY.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 05.1 — Student Review Study Workspace (`/student/cases/:caseId/review-study`, `1440×1200` Auto-Height)`**:
   - Sử dụng `StudentLayout` (`56px` Top Header kèm badge `Review Study` màu hồng đậm `#FDF2F8 / #BE185D` + Cột đọc & viết **`768px`** canh giữa).
   - **Khối 1 — Ngữ cảnh & Dữ liệu Tình huống (`Case Context & Background Data`)**:
     - Card đọc (`#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 32px`):
     - Nhãn `"CASE CONTEXT & DATA"` (`12px SemiBold Uppercase #4B5563`) + Tiêu đề tình huống (`22px SemiBold #111827`) + Nội dung `context_text` (`15px/24px #111827`).
   - **Khối 2 — Câu hỏi / Bài toán Phân tích Mở (`Analytical Problem Statement`)**:
     - Khung nhấn nhẹ (`#F3F4F6`, viền `1px #E5E7EB`, thanh viền trái `4px solid #BE185D`, `radius 8px`, `padding 20px`):
     - Nhãn `"PROBLEM TO ANALYZE"` (`12px SemiBold Uppercase #BE185D`) + Nội dung `problem_text` (`15px Medium #111827`).
   - **Khối 3 — Biểu mẫu Nộp bài Phân tích & Đề xuất Giải pháp (`Review Study Submission Form Card`)**:
     - Card (`#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 32px`, `gap: 24px`):
     - **Trường 1 (`student_analysis` — Tùy chọn)**: Nhãn `"1. Situation Analysis (Optional)"`, Textarea cao `120px`, placeholder `"Identify the core legal, ethical, or operational tensions in the case..."`.
     - **Trường 2 (`proposed_solution` — Bắt buộc, min 10 chars)**: Nhãn `"2. Proposed Solution *"`, Textarea cao `140px`, placeholder `"State your recommended course of action or policy solution..."`.
     - **Trường 3 (`reasoning_text` — Bắt buộc, min 10 chars)**: Nhãn `"3. Supporting Reasoning & Trade-offs *"`, Textarea cao `160px`, placeholder `"Justify why your proposed solution is appropriate and address potential counter-arguments..."`.
     - **Footer Form**: Chú thích nhỏ bên trái (`"Note: Review Study allows one final submission per case."`) + Nút Primary `"Submit Analysis & Solution"` (`#2563EB`) bên phải.
2. **`Frame 05.2 — Review Study Submitted Read-Only State (`768px Card State`)`**:
   - Sau khi nộp (`submission_status = 'SUBMITTED'`), form chuyển sang chế độ **Read-Only** (vì Review Study chỉ nộp 1 lần duy nhất, không có nút Retry), hiển thị badge `"Submitted — Awaiting Lecturer Review"` (`#EFF6FF / #1D4ED8`) và nút Secondary `"Explore Reasoning with AI Challenge Support (0/2 rounds)"` (icon `message-square-question` → mở `DES-015`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế giao diện đọc ngữ cảnh & dữ liệu thực tế (`context_text`) và bài toán mở (`problem_text`) trong cột `768px` rõ ràng, học thuật.
- [ ] **AC-2**: Thiết kế form nhập 3 phần: phân tích (`student_analysis`), đề xuất giải pháp (`proposed_solution`) và giải thích lập luận (`reasoning_text`), kèm trạng thái Read-Only sau khi nộp.
- [ ] **AC-3**: Tuyệt đối không sử dụng cây quyết định, không có câu hỏi trắc nghiệm đúng/sai, và không có nút làm lại (Retry) trên chế độ Review Study.

---

### DES-014: [DES-014] Lecturer Qualitative Feedback & Review Dashboard Design

- **Master Task ID**: `EBA-405` | **Figma Page**: `05_Review, Feedback & Socratic`
- **Sprint**: `Sprint 4` | **Flow**: `Review Study` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-404
- **Tài liệu đối chiếu**: [`P3-SUPPORT-AND-STATISTICS.md §1–2`](design/screens/P3-SUPPORT-AND-STATISTICS.md) · [`P4-REVIEW-STUDY.md §2`](design/screens/P4-REVIEW-STUDY.md) · [`FEATURE-LECTURER-FEEDBACK.md`](features/FEATURE-LECTURER-FEEDBACK.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 05.3 — Lecturer Student Submissions & Qualitative Feedback Workspace (`/lecturer/cases/:caseId/feedback`, `1440×900`)`**:
   - Đặt trong `LecturerLayout` (`240px` Sidebar + `1200px` Workspace).
   - **Bố cục Master–Detail 2 cột trên vùng `1136px`**:
     - **Cột trái (`Master List — 360px`)**:
       - Bộ lọc trạng thái (`All`, `Submitted`, `Reviewed`, `Reflected`) + Danh sách bài làm của sinh viên (hỗ trợ cả `Branching Study Attempts` và `Review Study Submissions`).
       - Mỗi dòng hiển thị: Tên sinh viên, thời gian nộp, badge trạng thái (`Submitted` / `Reviewed` / `Reflected`), và số lượt `Attempt #1` (nếu là Branching). Dòng đang chọn có nền `#EFF6FF` và viền trái `3px #2563EB`.
     - **Cột phải (`Submission Inspection & Feedback Editor — 752px`)**:
       - **Phần trên**: Hiển thị bài làm của sinh viên đang chọn (Với `Review Study`: hiển thị `student_analysis`, `proposed_solution`, `reasoning_text`; Với `Branching Study`: hiển thị lộ trình các node đã chọn, `reasoning_text` hồi cứu và `reflection_text`).
       - **Phần dưới — `Lecturer Qualitative Feedback Composer` (`#F3F4F6`, viền `1px #E5E7EB`, bo góc `12px`, `padding 24px`)**:
         - Header có icon `user-check` (`18px #374151`) + Tiêu đề `"Lecturer Qualitative Feedback"` (Nhấn mạnh 100% do giảng viên viết, không có nút AI chấm điểm và **không có ô nhập điểm số/thang điểm**).
         - Textarea cao `140px` (`feedback_text`) + Nút Primary `"Save & Send Feedback to Student"` (Khi gửi sẽ chuyển trạng thái bài Review Study từ `SUBMITTED` sang `REVIEWED`).
2. **`Frame 05.4 — Student Inspection of Lecturer Feedback & Reflection (`/student/cases/:caseId/review-study/:submissionId/feedback`, `1440×900`)`**:
   - Đặt trong `StudentLayout` (cột `768px` canh giữa):
   - Tóm tắt bài đã nộp của sinh viên (Read-Only) → Khối **`Lecturer Feedback Block`** (`#F3F4F6`, viền `1px #D1D5DB`, icon `user-check`, hiển thị nguyên văn nhận xét định tính của giảng viên) → Khối **`Post-Feedback Reflection Input`** (Textarea để sinh viên viết bài phản tư `reflection_text` sau khi đọc nhận xét của giảng viên, chuyển trạng thái sang `REFLECTED`).
3. **`Frame 05.5 — Lecturer Learning-Flow Statistics (`/lecturer/statistics`, `1440×900`)`**:
   - Đặt trong `LecturerLayout`: Bộ chọn Khóa học & Tình huống → Hàng 4 thẻ KPI (`Total Attempts`, `Completion Rate %`, `Single vs. Retry Attempts`, `Reflections Submitted` — chỉ dùng chữ số `28px SemiBold #111827` và icon vector mảnh `16px #9CA3AF`, không dùng emoji `📚 📋 ✅ 🎯 📝`) → Bảng phân bố tỷ lệ chọn nhánh (`Branch Selection Distribution`) dùng thanh ngang đơn sắc `#2563EB` (`height 8px`, độ đậm `100% / 70% / 40%`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế dashboard Master–Detail cho giảng viên xem các bài nộp của sinh viên (cả `Branching Study` và `Review Study`) kèm trang thống kê `Statistics` chuẩn học thuật.
- [ ] **AC-2**: Thiết kế khung soạn thảo nhận xét định tính (`Lecturer Qualitative Feedback`, không có ô nhập điểm số hay AI auto-grading).
- [ ] **AC-3**: Thiết kế giao diện cho sinh viên đọc nhận xét của giảng viên và viết bài phản tư (`Post-Feedback Reflection`).

---

### DES-015: [DES-015] AI Challenge Support Socratic Interaction UI Design

- **Master Task ID**: `EBA-406` | **Figma Page**: `05_Review, Feedback & Socratic`
- **Sprint**: `Sprint 4` | **Flow**: `Challenge Support` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-402, EBA-404
- **Tài liệu đối chiếu**: [`P2-STUDENT-CORE.md §3`](design/screens/P2-STUDENT-CORE.md) · [`GLOBAL-DESIGN-SYSTEM.md §6.11`](design/GLOBAL-DESIGN-SYSTEM.md) · [`REASONING-CHALLENGE-SUPPORT.md`](ai/REASONING-CHALLENGE-SUPPORT.md)

#### Danh sách Frames cần thiết kế trên Figma
1. **`Frame 05.6 — AI Challenge Support: Round 1 Active (`/student/cases/:caseId/challenge/:sessionId`, `1440×900`)`**:
   - Sử dụng `StudentLayout` (`56px` Top Header + Cột chính **`768px`** canh giữa).
   - **Thanh điều hướng quay lại**: Nút Ghost `"← Back to Journey Review"` (hoặc `"← Back to Review Study"`).
   - **Header của Khung Socratic (`Challenge Header Bar`)**:
     - Bên trái: Tiêu đề `"AI Reasoning & Challenge Support"` (`20px SemiBold #111827`) + Dòng mô tả ranh giới sư phạm (`13px #4B5563`: `"Socratic counter-questions to probe assumptions and trade-offs in your reasoning. Non-evaluative and ungraded."`).
     - Bên phải — **Thanh tiến trình 2 vòng (`2-Round Progress Pill`)**:
       - Hiển thị rõ 2 nấc chấm tròn + nhãn: **`Round 1 of 2`** (Nấc 1 tô `#2563EB`, Nấc 2 viền `#D1D5DB`).
   - **Khối Gốc (`Context Anchor Card` — Read-Only)**:
     - Khung nền `#F3F4F6`, viền `1px #E5E7EB`, bo góc `8px`, `padding 16px`: Hiển thị tóm tắt Quyết định/Giải pháp và nguyên văn lập luận (`reasoning_text`) mà sinh viên đã viết để đối chiếu.
   - **Cặp Tương tác Vòng 1 (`Round 1 Socratic Exchange`)**:
     - **Thẻ Câu hỏi Phản biện của AI (`AI Counter-Question Card — Round 1`)**:
       - Thiết kế dạng **Card học thuật phẳng** (`#FFFFFF`, viền `1px #E5E7EB`, `radius 12px`, `padding 24px`) — **tuyệt đối không vẽ bong bóng chat (chat bubble), không có avatar robot `🤖`, không có khung màu tím**.
       - Hàng trên của Card: Nhãn `Step 1 — Counter-Question` (`12px SemiBold #4B5563`) + `AiOriginTag` (`AI-assisted` nền `#F3F4F6`, chữ `#4B5563`, icon `message-square-question` `14px`).
       - Nội dung câu hỏi gợi mở Socratic (1 câu hỏi sắc bén duy nhất chất vấn giả định của sinh viên).
     - **Khung Sinh viên Phản hồi Vòng 1 (`Student Clarification Composer`)**:
       - Nhãn `"Your Clarification / Response (Optional)"` + Textarea cao `120px`.
       - Hàng nút dưới cùng: Bên trái là nút Secondary `"Conclude Session & Return"` (sinh viên có thể dừng ngay sau Vòng 1); Bên phải là nút Primary `"Submit Response for Round 2"` (`#2563EB`).
2. **`Frame 05.7 — AI Challenge Support: Round 2 Completed & Hard-Cap State (`/student/cases/:caseId/challenge/:sessionId`, `1440×1080`)`**:
   - Thanh tiến trình góc phải chuyển sang: **`Round 2 of 2 — Completed`** (Cả 2 nấc đều hoàn tất, badge `#F0FDF4 / #166534`).
   - Hiển thị đầy đủ lịch sử dọc:
     1. `Round 1 AI Counter-Question Card`
     2. `Round 1 Student Clarification Card` (Read-Only, nền `#FFFFFF`, viền `1px #E5E7EB`)
     3. `Round 2 Final AI Follow-Up Question Card` (Gắn tag `AI-assisted · Final Round 2 of 2`).
   - **Khung Khóa Phiên (`Session Complete Footer Banner` — Thay thế hoàn toàn ô nhập liệu)**:
     - Khung nền `#F3F4F6`, viền `1px #E5E7EB`, bo góc `8px`, `padding 20px`, căn giữa:
     - Icon `check-circle-2` (`18px #4B5563`) + Dòng thông báo `"Challenge Support session completed (Maximum 2 rounds reached). You may now update your reasoning or proceed to final reflection."` + Nút Primary `"Return to Review & Reflection"` (`#2563EB`).

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế giao diện hội thoại câu hỏi gợi mở phản biện của AI dạng thẻ học thuật (`Structured Academic Thread`), giới hạn cứng tối đa 2 vòng (`Round 1 of 2` → `Round 2 of 2 Completed`), không dùng giao diện chatbot tự do.
- [ ] **AC-2**: Hiển thị rõ ranh giới: AI chỉ đặt câu hỏi chất vấn giả định (`AI-assisted` neutral tag), tuyệt đối không chấm điểm, không phán xét đúng/sai, không dùng màu tím hay robot emoji.
- [ ] **AC-3**: Thiết kế thanh tiến trình 2 vòng rõ ràng và trạng thái khóa ô nhập liệu (`Session Completed`) ngay sau khi kết thúc Vòng 2.
