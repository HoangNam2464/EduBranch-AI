 EduBranch-AI — Figma UI/UX Design Catalog (15 Tasks / 50 Story Points)

> **Dự án**: EduBranch-AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh & phân tích phản biện  
> **Nguồn quản trị gốc**: `docs/01_MASTER-TASKS.md` · `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`  
> **Tài liệu tham chiếu thiết kế**: [`docs/design/GLOBAL-DESIGN-SYSTEM.md`](design/GLOBAL-DESIGN-SYSTEM.md) · [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) · [`docs/design/SITE-ARCHITECTURE.md`](design/SITE-ARCHITECTURE.md)  
> **Phạm vi chuyên môn**: Nhóm DES (UI/UX Design & Prototyping trên Figma)  
> **Quy mô**: 15 Tasks | 50 Story Points (14.88% toàn dự án)  
> **Quy chuẩn thiết kế**: Chuẩn mực học tập tình huống chuyên sâu & chuyên nghiệp (EduBranch-AI Design Standards).  

---

## 1. NGUYÊN TẮC THIẾT KẾ & HỆ THỐNG DESIGN TOKENS (GLOBAL DESIGN SYSTEM)

### 1.1. Triết lý thẩm mỹ học thuật đại học
- **Light Theme Only**: Giao diện sáng, tinh tế, trang nhã, tập trung vào nội dung học thuật chuyên sâu. Không áp dụng dark mode trong giai đoạn này.
- **Không lạm dụng biểu tượng AI & Chống "AI-Slop"**: AI là một tính năng hỗ trợ, không phải nhận diện thương hiệu. Tuyệt đối cấm dùng:
  1. Emoji Unicode (`🌿`, `📭`, `🤖`, `✍️`, `🏁`, `💡`, v.v.) hoặc ký tự ASCII giả làm icon (`->`, `&times;`, `✕`). Bắt buộc dùng **Vector Outline SVG (`lucide-react`, `strokeWidth={1.75}`)**.
  2. Màu tím/indigo (`#6366F1`, `purple-*`, `indigo-*`, `violet-*`), hiệu ứng phát sáng neon, gradient lòe loẹt, hoặc typing animation.
  3. Các hộp callout giảng giải dài dòng ("Preachy AI callouts") trên màn hình sinh viên.
- **Phân định rõ 2 cổng người dùng**:
  - **Lecturer Portal (`LecturerLayout` — `240px` Left Sidebar + `max-w-7xl` Workspace)**: Tập trung vào quản lý học phần (Course), tải lên giáo trình (Teaching Materials), sinh case bằng AI, biên tập cây quyết định (Decision Tree via ReactFlow `60/40` split-screen), và duyệt bài (Review & Qualitative Feedback).
  - **Student Portal (`StudentLayout` — `56px` Compact Top Header + `max-w-3xl` Reading Container)**: Trải nghiệm giải quyết tình huống rẽ nhánh 3 giai đoạn (`Phase 1: Experience` không gián đoạn → `Phase 2: REVIEW` tiết lộ hệ quả & ghi nhận lập luận hồi cứu → `Phase 3: Reflection & Retry`), phản biện mở (Review Study), và tương tác Socratic (AI Challenge Support tối đa 2 vòng).

### 1.2. Bảng mã màu chuẩn (Design Tokens — Đồng bộ 100% với `GLOBAL-DESIGN-SYSTEM.md`)

| Token Name | Mã Hex | Vai trò & Mục đích sử dụng |
|---|:---:|---|
| `bg-canvas` | `#F9FAFB` | Màu nền toàn bộ trang web (Page background) |
| `bg-surface` | `#FFFFFF` | Nền các thẻ Card, Modal, Panel, Bảng dữ liệu |
| `bg-surface-muted` | `#F3F4F6` | Nền khối trích dẫn, hàng bảng xen kẽ, ô disabled |
| `bg-surface-hover` | `#F3F4F6` | Trạng thái hover cho hàng bảng và danh sách |
| `bg-surface-selected` | `#EFF6FF` | Trạng thái đang chọn (Active nav item, Selected option card, Selected ReactFlow node) |
| `text-primary` | `#111827` | Tiêu đề chính, văn bản trọng tâm, nội dung tình huống |
| `text-secondary` | `#4B5563` | Văn bản phụ trợ, nhãn mô tả, nội dung diễn giải |
| `text-muted` | `#9CA3AF` | Placeholder, timestamp, chú thích phụ |
| `border-default` | `#E5E7EB` | Đường viền Card, đường phân cách bảng, viền ô nhập liệu (`1px solid`) |
| `border-strong` | `#D1D5DB` | Viền nhấn mạnh nhẹ (Input hover, Terminal node border) |
| `border-focus` | `#2563EB` | Viền focus (`2px`) cho Input, Option đang chọn, Node đang sửa |
| `action-primary` | `#2563EB` | Màu nhấn hành động chính duy nhất (Nút chính, tab active, link — Hover `#1D4ED8`) |
| `status-draft` | `#F3F4F6` / `#4B5563` | Badge trạng thái `DRAFT` (Nền xám nhạt / Chữ xám đậm / Dot `#9CA3AF`) |
| `status-reviewed` | `#EFF6FF` / `#1D4ED8` | Badge trạng thái `REVIEWED` (Nền xanh lam nhạt / Chữ xanh lam đậm / Dot `#2563EB`) |
| `status-approved` | `#FFFBEB` / `#92400E` | Badge trạng thái `APPROVED` (Nền vàng hổ phách nhạt / Chữ nâu hổ phách / Dot `#D97706`) |
| `status-published` | `#F0FDF4` / `#166534` | Badge trạng thái `PUBLISHED` (Nền xanh lá nhạt / Chữ xanh lá đậm / Dot `#16A34A`) |
| `mode-branching` | `#F0FDFA` / `#0F766E` | Badge chế độ `BRANCHING_STUDY` & viền trái khối Consequence (`4px solid #0F766E`) |
| `mode-review` | `#FDF2F8` / `#BE185D` | Badge chế độ `REVIEW_STUDY` |
| `ai-support` | `#F3F4F6` / `#4B5563` | Nhãn trung tính đánh dấu nội dung do AI khởi tạo (Bản nháp AI hoặc câu hỏi Socratic) |
| `semantic-success` | `#16A34A` | Thông báo thành công, hoàn thành |
| `semantic-warning` | `#D97706` | Cảnh báo nghiệp vụ, trạng thái đang xử lý |
| `semantic-error` | `#DC2626` | Lỗi xác thực biểu mẫu, trạng thái thất bại, hành động xóa/hủy |

---

## 2. MA TRẬN PHÂN BỔ 15 TASKS THIẾT KẾ FIGMA THEO SPRINT

| Group ID | Master Task ID | Tên công việc thiết kế | Sprint | Flow | Priority | SP | Dependencies (Master Task ID) |
|:---:|:---:|---|:---:|:---:|:---:|:---:|---|
| `DES-001` | **EBA-101** | **Information Architecture for Lecturer, Student & Dual Learning Modes** | Sprint 1 | Foundation | Highest | 3 | *None* |
| `DES-002` | **EBA-102** | **Shared Design States: Loading, Empty, Error & Permissions** | Sprint 1 | Foundation | High | 5 | is blocked by Master Task EBA-101 |
| `DES-003` | **EBA-201** | **Material Library & Upload Interaction Flow Design** | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-102 |
| `DES-004` | **EBA-202** | **Material Processing, Progress Bar & Failure Recovery States** | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-201 |
| `DES-005` | **EBA-203** | **RAG Grounding Evidence & Source Inspection UI Design** | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-201 |
| `DES-006` | **EBA-301** | **Case Generation Modal & Parameter Configuration Flow Design** | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-203 |
| `DES-007` | **EBA-302** | **ReactFlow Decision Tree Visualization & Topology Layout Design** | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-301 |
| `DES-008` | **EBA-303** | **Side-by-Side Node & Option Form Editor UX Design** | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-302 |
| `DES-009` | **EBA-304** | **Case Governance Lifecycle Action Bar & Approval Status Design** | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-302 |
| `DES-010` | **EBA-401** | **Branching Case Player Experience-First UI/UX Design** | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-309 |
| `DES-011` | **EBA-402** | **Journey Review Path Visualization & Consequence Reveal Design** | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-401 |
| `DES-012` | **EBA-403** | **Retry & New Attempt Initiation UX Design** | Sprint 4 | Branching Study | High | 2 | is blocked by Master Task EBA-402 |
| `DES-013` | **EBA-404** | **Review Study Open Analysis & Solution Proposal UI Design** | Sprint 4 | Review Study | High | 3 | is blocked by Master Task EBA-102 |
| `DES-014` | **EBA-405** | **Lecturer Qualitative Feedback & Review Dashboard Design** | Sprint 4 | Review Study | High | 3 | is blocked by Master Task EBA-404 |
| `DES-015` | **EBA-406** | **AI Challenge Support Socratic Interaction UI Design** | Sprint 4 | Challenge Support | High | 3 | is blocked by Master Task EBA-402, EBA-404 |

---

## 3. ĐẶC TẢ CHI TIẾT TỪNG TASK THIẾT KẾ (DES-001 ĐẾN DES-015)

### DES-001: [DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes

- **Master Task ID**: `EBA-101`
- **Sprint**: `Sprint 1` | **Flow**: `Foundation` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: None

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Tách rõ Lecturer Portal và Student Portal.
- [ ] **AC-2**: Có navigation riêng cho Branching Study và Review Study.
- [ ] **AC-3**: Được FE/BE review và phê duyệt.

---

### DES-002: [DES-002] Shared Design States: Loading, Empty, Error & Permissions

- **Master Task ID**: `EBA-102`
- **Sprint**: `Sprint 1` | **Flow**: `Foundation` | **Priority**: `High` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-101

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế đầy đủ loading, empty, error, 403 và processing states.
- [ ] **AC-2**: Token màu sắc, typography dùng thống nhất theo Design System.

---

### DES-003: [DES-003] Material Library & Upload Interaction Flow Design

- **Master Task ID**: `EBA-201`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-102

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế modal tải lên tài liệu hỗ trợ Drag-and-Drop cho định dạng PDF và DOCX.
- [ ] **AC-2**: Thiết kế bảng danh sách tài liệu hiển thị metadata và thanh tìm kiếm/lọc.

---

### DES-004: [DES-004] Material Processing, Progress Bar & Failure Recovery States

- **Master Task ID**: `EBA-202`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-201

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế các trạng thái tiến độ: Pending, Processing (Parsing/Embedding), Completed, Failed.
- [ ] **AC-2**: Thiết kế thông báo lỗi và nút bấm Retry khi xử lý tài liệu thất bại.

---

### DES-005: [DES-005] RAG Grounding Evidence & Source Inspection UI Design

- **Master Task ID**: `EBA-203`
- **Sprint**: `Sprint 2` | **Flow**: `Flow 1` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-201

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế modal/drawer hiển thị các đoạn văn bản trích dẫn nguồn (evidence chunks) đã retrieval.
- [ ] **AC-2**: Tuyệt đối không để lộ thông tin nhạy cảm (API keys, system prompt, internal ID).

---

### DES-006: [DES-006] Case Generation Modal & Parameter Configuration Flow Design

- **Master Task ID**: `EBA-301`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-203

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế picker chọn tài liệu tham khảo trong khóa học.
- [ ] **AC-2**: Thiết kế trường nhập chủ đề gợi ý (topic hint), số lượng node mong muốn và chọn chế độ học.
- [ ] **AC-3**: Thiết kế trạng thái spinner đang tạo case kèm thông báo tiến độ.

---

### DES-007: [DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design

- **Master Task ID**: `EBA-302`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-301

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế trực quan sơ đồ cây trên canvas ReactFlow (Root node, Decision node, Terminal node).
- [ ] **AC-2**: Thiết kế màu sắc, icon phân biệt các nhánh và đường nối (edges) thể hiện lựa chọn.
- [ ] **AC-3**: Hỗ trợ thao tác zoom, pan và căn chỉnh tự động cây quyết định.

---

### DES-008: [DES-008] Side-by-Side Node & Option Form Editor UX Design

- **Master Task ID**: `EBA-303`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-302

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế drawer/panel bên phải để xem và chỉnh sửa chi tiết từng node khi click trên canvas.
- [ ] **AC-2**: Thiết kế các trường chỉnh sửa: Situation text, Option text, Consequence explanation.
- [ ] **AC-3**: Thiết kế nút lưu thay đổi và hiển thị tức thì trên sơ đồ cây.

---

### DES-009: [DES-009] Case Governance Lifecycle Action Bar & Approval Status Design

- **Master Task ID**: `EBA-304`
- **Sprint**: `Sprint 3` | **Flow**: `Flow 2` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-302

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế thanh công cụ hiển thị trạng thái hiện tại (DRAFT, REVIEWED, APPROVED, PUBLISHED).
- [ ] **AC-2**: Thiết kế các nút hành động chuyển trạng thái có điều kiện (Mark as Reviewed, Approve, Publish).
- [ ] **AC-3**: Thiết kế hộp thoại xác nhận xuất bản kèm link chia sẻ cho sinh viên.

---

### DES-010: [DES-010] Branching Case Player Experience-First UI/UX Design

- **Master Task ID**: `EBA-401`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `Highest` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-309

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế màn hình ra quyết định tập trung, không phân tâm.
- [ ] **AC-2**: Tuyệt đối không hiển thị thẻ hệ quả (consequence card) giữa chừng.
- [ ] **AC-3**: Tuyệt đối không có form bắt buộc nhập lập luận (reasoning form) giữa các bước.

---

### DES-011: [DES-011] Journey Review Path Visualization & Consequence Reveal Design

- **Master Task ID**: `EBA-402`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `Highest` | **Story Points**: `5`
- **Dependencies**: is blocked by Master Task EBA-401

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế lộ trình toàn bộ các bước đã đi qua theo thứ tự thời gian.
- [ ] **AC-2**: Mở khóa và hiển thị đầy đủ văn bản hệ quả (consequences) lần đầu tiên tại màn hình Review.
- [ ] **AC-3**: Thiết kế form nhập lập luận hồi cứu (retrospective reasoning) cho các quyết định then chốt.

---

### DES-012: [DES-012] Retry & New Attempt Initiation UX Design

- **Master Task ID**: `EBA-403`
- **Sprint**: `Sprint 4` | **Flow**: `Branching Study` | **Priority**: `High` | **Story Points**: `2`
- **Dependencies**: is blocked by Master Task EBA-402

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế nút và modal Retry bắt đầu lượt chơi mới.
- [ ] **AC-2**: Truyền đạt rõ ràng việc lượt chơi cũ được bảo lưu trọn vẹn và không bị ghi đè.

---

### DES-013: [DES-013] Review Study Open Analysis & Solution Proposal UI Design

- **Master Task ID**: `EBA-404`
- **Sprint**: `Sprint 4` | **Flow**: `Review Study` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-102

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế giao diện hiển thị ngữ cảnh & dữ liệu thực tế (context) và bài toán mở (problem).
- [ ] **AC-2**: Thiết kế form nhập phân tích, đề xuất giải pháp và giải thích lập luận.
- [ ] **AC-3**: Không sử dụng cây quyết định hay câu hỏi trắc nghiệm đúng/sai.

---

### DES-014: [DES-014] Lecturer Qualitative Feedback & Review Dashboard Design

- **Master Task ID**: `EBA-405`
- **Sprint**: `Sprint 4` | **Flow**: `Review Study` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-404

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế dashboard cho giảng viên xem các bài nộp của sinh viên (cả Branching và Review Study).
- [ ] **AC-2**: Thiết kế khung soạn thảo nhận xét định tính (qualitative feedback).
- [ ] **AC-3**: Thiết kế giao diện cho sinh viên đọc nhận xét và viết bài phản tư (reflection).

---

### DES-015: [DES-015] AI Challenge Support Socratic Interaction UI Design

- **Master Task ID**: `EBA-406`
- **Sprint**: `Sprint 4` | **Flow**: `Challenge Support` | **Priority**: `High` | **Story Points**: `3`
- **Dependencies**: is blocked by Master Task EBA-402, EBA-404

#### Mục tiêu thiết kế Figma & User Experience
Thiết kế frame và components trên Figma cho màn hình/thành phần giao diện tương ứng của dự án EduBranch AI. Đảm bảo chuẩn giao diện phẳng, hiện đại, tuân thủ bảng màu học thuật và đáp ứng đầy đủ yêu cầu cho đội ngũ Frontend React 19 triển khai.

#### Tiêu chuẩn nghiệm thu (Acceptance Criteria)
- [ ] **AC-1**: Thiết kế giao diện hội thoại câu hỏi gợi mở phản biện của AI (tối đa 2 vòng).
- [ ] **AC-2**: Hiển thị rõ ranh giới: AI chỉ đặt câu hỏi chất vấn giả định, tuyệt đối không chấm điểm.
- [ ] **AC-3**: Thiết kế thanh tiến trình 2 vòng rõ ràng.

---

