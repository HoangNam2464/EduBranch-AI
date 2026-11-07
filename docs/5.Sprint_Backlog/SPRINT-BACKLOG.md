# EduBranch AI — Sprint Backlog & Kế Hoạch Quản Trị Thực Thi 4 Sprints (Jira Ready)

> **Tài liệu quản trị thực thi chính thức**: EduBranch AI  
> **Khung quản trị**: Agile / Scrum — 4 Sprints × 10 tuần tổng thể (07/10/2026 – 15/12/2026)  
> **Đội ngũ dự án**: DES · FE · BE · QA (Nhóm Capstone C1SE.65 — Đại học Duy Tân)  
> **Source of Truth**: [Proposal V1.2](file:///D:/CAPSTONE_2026/EduBranch-AI/docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx), [PROJECT_OVERVIEW.md](file:///D:/CAPSTONE_2026/EduBranch-AI/docs/PROJECT_OVERVIEW.md) và baseline `develop` commit `9dcef22`  
> **Phiên bản tài liệu**: Final Jira Readiness Audit (2026-10-07)  
> **Jira Project Key đề xuất**: `EBA`

---

## 1. TỔNG QUAN DỰ ÁN & QUY ƯỚC QUẢN TRỊ TRÊN JIRA

```text
Jira Project: EduBranch AI (Key: EBA)
        │
        ├── Sprint 1 - Foundation (07/10/2026 - 20/10/2026 / 2 tuần / 42 SP / 10 tasks)
        ├── Sprint 2 - Material & RAG (21/10/2026 - 03/11/2026 / 2 tuần / 75 SP / 20 tasks)
        ├── Sprint 3 - Case & Approval (04/11/2026 - 17/11/2026 / 2 tuần / 81 SP / 19 tasks)
        └── Sprint 4 - Learning & Review (18/11/2026 - 15/12/2026 / 4 tuần / 138 SP / 35 tasks)
```

### 1.1. Phân biệt triệt để Master Task ID và Jira Issue Key

Trong quy trình vận hành và nhập liệu Jira, đội ngũ cần phân biệt tuyệt đối giữa hai khái niệm ID sau:

1. **Master Task ID (`EBA-101`, `EBA-102`, `EBA-210`,...)**:
   - Là mã định danh quản trị nội bộ cố định xuyên suốt vòng đời dự án.
   - Được định nghĩa trong tài liệu này tại cột riêng `Master Task ID`.
   - Dùng để đặt tên git branch (`feature/EBA-105-auth`), git commit (`feat(EBA-105): implement login`), pull request và truy vết ma trận kiểm thử (Traceability Matrix).
   - **Lưu ý**: Master Task ID **KHÔNG PHẢI** là Jira Issue Key.

2. **Jira Issue Key (`EBA-1`, `EBA-2`, `EBA-37`,...)**:
   - Là mã do phần mềm Jira tự động sinh ra tuần tự khi người dùng tạo issue trên giao diện Jira.
   - Thứ tự tạo issue trên Jira có thể làm Issue Key khác với Master Task ID (ví dụ: task `EBA-210` khi nhập vào Jira có thể mang Issue Key là `EBA-37`).
   - **Tuyệt đối không giả định `Master Task ID = Jira Issue Key`**.

### 1.2. Hướng dẫn nhập Jira thủ công và thiết lập liên kết Dependencies

Khi nhập backlog vào Jira, người quản trị thực hiện theo đúng 4 bước chuẩn hóa:

1. **Bước 1 — Tạo Issue**: Nhập lần lượt từng task theo bảng chi tiết. Sao chép chính xác `Issue Type`, `Summary`, `Story Points`, `Priority` và `Description / Acceptance Criteria`.
2. **Bước 2 — Ghi nhận Jira Issue Key**: Sau khi tạo, Jira tự sinh Issue Key thực tế (ví dụ: `EBA-12`).
3. **Bước 3 — Tạo liên kết phụ thuộc (Issue Linking)**: Cột `Dependencies (Master Task ID)` trong tài liệu thể hiện quan hệ kỹ thuật theo Master Task ID (ví dụ: `is blocked by Master Task EBA-208`). Trên giao diện Jira, người dùng sử dụng tính năng **Linked Issues → "is blocked by"** và trỏ tới **Jira Issue Key thực tế tương ứng** đã sinh ở Bước 2.
4. **Bước 4 — Đối soát**: Đối chiếu bảng mapping nội bộ để đảm bảo toàn bộ liên kết upstream/downstream không bị thiếu sót.

#### Bảng ví dụ minh họa ánh xạ ID:
| Master Task ID (Tài liệu) | Jira Issue Key (Jira tự sinh) | Summary chuẩn Jira | Dependency trong tài liệu | Link trên Jira |
|:---:|:---:|---|---|---|
| `EBA-208` | `EBA-35` | `[BE-005] Implement Material CRUD & Ownership Authorization Gates` | `is blocked by Master Task EBA-107` | is blocked by `EBA-7` |
| `EBA-210` | `EBA-37` | `[BE-007] Implement PDF Document Parser with Text Extraction & Normalization` | `is blocked by Master Task EBA-209` | is blocked by `EBA-36` |

### 1.3. Chuẩn đặt Summary & Issue Type

- **Summary chuẩn Jira**:
  - Bắt buộc theo cú pháp: `[GROUP-###] Tên công việc cụ thể` (Ví dụ: `[DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes`).
  - **TUYỆT ĐỐI KHÔNG** chèn mã Master Task ID `[EBA-###]` vào tên Summary để tránh gây trùng lặp và xung đột hiển thị với Jira Issue Key tự sinh.
- **Issue Type**: Chỉ sử dụng 3 loại:
  - `Story`: Đơn vị công việc mang lại giá trị chức năng trực tiếp cho người dùng cuối (Lecturer hoặc Student).
  - `Task`: Công việc kỹ thuật, thiết kế, hạ tầng, kiểm thử hoặc cấu hình.
  - `Bug`: Xử lý lỗi phát hiện trong quá trình kiểm thử hoặc hồi quy thực tế.
- **Priority**: `Highest`, `High`, `Medium`, `Low`.
- **Story Points**: Áp dụng nghiêm ngặt thang đo Fibonacci: `1, 2, 3, 5, 8`.

---

## 2. LỘ TRÌNH THỜI GIAN & KHUNG CÔNG TÁC 4 SPRINTS

```text
Tuần:       01    02 | 03    04 | 05    06 | 07    08    09    10
Khung ngày: 07/10-20/10 | 21/10-03/11 | 04/11-17/11 | 18/11-15/12/2026
Giai đoạn:  Foundation | Flow 1: RAG | Flow 2: Case | Learning, Review, UAT & Release
Sprint:     [ SPRINT 1 ] [ SPRINT 2 ] [    SPRINT 3    ] [                 SPRINT 4                 ]
```

| Sprint | Tên Sprint ngắn | Khung thời gian | Thời lượng | Trọng tâm bàn giao (Increment Deliverable) |
|---|---|:---:|:---:|---|
| **Sprint 1** | **Sprint 1 - Foundation** | 07/10/2026 – 20/10/2026 | 2 tuần | Ổn định Auth, Role RBAC, Course Ownership, Shared UI states, DB migration runner và đóng băng API contracts. |
| **Sprint 2** | **Sprint 2 - Material & RAG** | 21/10/2026 – 03/11/2026 | 2 tuần | Hoàn tất Flow 1: Upload PDF/DOCX → MinIO → Parsing → Chunking → Embeddings → Grounded RAG Retrieval có bọc `<sources>`. |
| **Sprint 3** | **Sprint 3 - Case & Approval** | 04/11/2026 – 17/11/2026 | 2 tuần | Hoàn tất Flow 2: AI sinh Case Draft (DFS cycle check) → ReactFlow editor → Quy trình kiểm duyệt `DRAFT → REVIEWED → APPROVED → PUBLISHED`. |
| **Sprint 4** | **Sprint 4 - Learning & Review** | 18/11/2026 – 15/12/2026 | 4 tuần | Hoàn thiện Branching Study (Player liên tục, Journey Review, Consequence reveal, Retry), Review Study độc lập, AI Challenge Support; Giai đoạn cuối hoàn thành Integration, UAT, Accessibility, Demo và Release readiness. |

---

## 3. BẢNG TỔNG HỢP SỐ LƯỢNG TASK & STORY POINTS (84 TASKS / 336 SP)

> **Ước lượng năng lực & Wording trung lập**:  
> **336 SP is the current estimated backlog size after decomposition.**  
> Khối lượng 336 SP là quy mô ước tính hiện tại sau khi phân rã kỹ thuật chi tiết 84 tasks. Tốc độ hoàn thành thực tế (Velocity) của đội ngũ 5 thành viên sẽ được quan sát và chuẩn hóa qua dữ liệu thực nghiệm trong Sprint 1 và Sprint 2.

### 3.1. Phân bổ theo từng Sprint

| Sprint | Tên Sprint | Thời gian | Số Task | Committed SP | Phân bổ vai trò (Task / SP) | Trọng tâm kiểm chứng (DoD) |
|---|---|:---:|:---:|:---:|---|---|
| **Sprint 1** | **Sprint 1 - Foundation** | 07/10 – 20/10/2026 (2 tuần) | **10 tasks** | **42 SP** | DES: 2 (8 SP) · FE: 2 (8 SP)<br>BE: 3 (15 SP) · OPS: 1 (3 SP) · QA: 2 (8 SP) | JWT Guard, BCrypt hash, Course CRUD, Route guards hoạt động, DB migration runner pass. |
| **Sprint 2** | **Sprint 2 - Material & RAG** | 21/10 – 03/11/2026 (2 tuần) | **20 tasks** | **75 SP** | DES: 3 (9 SP) · FE: 4 (14 SP)<br>BE: 7 (28 SP) · OPS: 2 (8 SP) · QA: 4 (18 SP) | Tải PDF/DOCX lên MinIO, chunking chuẩn, lưu pgvector HNSW, retrieval cô lập course_id. |
| **Sprint 3** | **Sprint 3 - Case & Approval** | 04/11 – 17/11/2026 (2 tuần) | **19 tasks** | **81 SP** | DES: 4 (14 SP) · FE: 5 (21 SP)<br>BE: 6 (28 SP) · OPS: 0 (0 SP) · QA: 4 (18 SP) | Pydantic DAG DFS validator không chu trình, ReactFlow editor, cổng chặn student case chưa duyệt. |
| **Sprint 4** | **Sprint 4 - Learning & Review** | 18/11 – 15/12/2026 (4 tuần) | **35 tasks** | **138 SP** | DES: 6 (19 SP) · FE: 11 (43 SP)<br>BE: 9 (39 SP) · OPS: 0 (0 SP) · QA: 9 (37 SP) | Player liên tục không lộ consequence, Journey Review hồi cứu, Retry lượt mới, UAT & Release. |
| **TỔNG** | **Toàn bộ 4 Sprints** | **10 tuần (07/10 – 15/12)** | **84 tasks** | **336 SP** | **DES: 15 (50 SP) · FE: 22 (86 SP)<br>BE: 25 (110 SP) · OPS: 3 (11 SP) · QA: 19 (79 SP)** | **Hệ thống EduBranch AI sẵn sàng nghiệm thu tốt nghiệp** |

### 3.2. Phân bổ theo Nhóm chuyên môn (Role Distribution - 5 Nhóm chuẩn hóa)

| Vai trò chuyên môn | Nhóm phụ trách chính | Mã nhóm | Số lượng Task | Tổng Story Points | Tỷ lệ khối lượng |
|---|---|:---:|:---:|:---:|:---:|
| **DES (UI/UX Design)** | Thiết kế hệ thống, Prototype, Luồng tương tác (Figma) | `DES` | **15 tasks** | **50 SP** | 14.88% |
| **FE (Frontend Development)** | React 19, Vite, TailwindCSS v4, ReactFlow | `FE` | **22 tasks** | **86 SP** | 25.60% |
| **BE (Backend Gateway & AI)** | NestJS Gateway, FastAPI AI Service, PostgreSQL | `BE` | **25 tasks** | **110 SP** | 32.74% |
| **OPS (DevOps & Storage/Vector)** | DevOps, PostgreSQL Migration, MinIO, pgvector HNSW | `OPS` | **3 tasks** | **11 SP** | 3.27% |
| **QA (Quality Assurance)** | Kiểm thử tự động, Security, E2E, UAT, Accessibility | `QA` | **19 tasks** | **79 SP** | 23.51% |
| **TỔNG CỘNG** | **Cả 5 nhóm chuyên môn** | | **84 tasks** | **336 SP** | **100.00%** |

### 3.3. Phân bổ theo Trạng thái thực tế (Status Distribution tại 2026-10-14)

> **Nguyên tắc đánh giá Status theo Nguyên Tắc Tam Phân**:
> - `DONE`: Đã đạt 100% Acceptance Criteria VÀ có đầy đủ Verified Evidence được kiểm chứng độc lập. (Gồm 6 tasks nền tảng: DES-001, DES-002, FE-001, BE-001, BE-003, OPS-001).
> - `IN PROGRESS`: Đã có mã nguồn scaffold, entity, service hoặc prototype nhưng còn Acceptance Criteria chưa hoàn tất hoặc đang trong quá trình tích hợp/kiểm thử. (Gồm 40 tasks, trong đó FE-002 được đặt IN PROGRESS để thực hiện và nghiệm thu 404 Catch-All và Error Boundary).
> - `TO DO`: Chưa thực hiện hoặc thuộc phạm vi của các Sprint tương lai. (Gồm 38 tasks).
> - Không đánh dấu `DONE` giả định cho các task thuộc Sprint 2, 3, 4 khi chưa qua giai đoạn thực thi và kiểm thử.

| Trạng thái | Số lượng Task | Tỷ lệ (%) | Ghi chú kiểm chứng quản trị |
|---|:---:|:---:|---|
| **DONE** | **6 tasks** | 7.14% | Đạt 100% Acceptance Criteria và có test evidence (DES-001, DES-002, FE-001, BE-001, BE-003, OPS-001). |
| **IN PROGRESS** | **40 tasks** | 47.62% | Đang triển khai tích cực; bao gồm FE-002 (chờ nghiệm thu 404 và Error Boundary) cùng các service backend/frontend. |
| **TO DO** | **38 tasks** | 45.24% | Chưa bắt đầu thực hiện; phân bổ theo đúng lộ trình của Sprint 2, Sprint 3 và Sprint 4. |
| **UNKNOWN** | **0 tasks** | 0.00% | Toàn bộ 84 tasks đều được xác định rõ ràng trạng thái kỹ thuật và nguồn truy vết. |
| **TỔNG CỘNG** | **84 tasks** | **100.00%** | **Phản ánh trung thực tuyệt đối hiện trạng mã nguồn dự án** |

---

## 4. CHI TIẾT 84 TASKS TRONG 4 SPRINT BACKLOG CHO JIRA

### 🟢 SPRINT 1 — FOUNDATION (07/10/2026 – 20/10/2026 / Tuần 1–2)

* **Thời gian thực hiện**: 07/10/2026 – 20/10/2026 (2 tuần).
* **Sprint Goal**: Ổn định Auth, Role, Ownership, shared UX states và đóng băng FE/BE API contracts.
* **Committed Capacity**: 42 SP (10 tasks).

| Group ID | Master Task ID | Issue Type | Summary | Sprint | Flow | Priority | SP | Dependencies (Master Task ID) | Acceptance Criteria | Status |
|:---:|:---:|:---:|---|---|:---:|:---:|:---:|---|---|:---:|
| `DES-001` | **EBA-101** | Task | `[DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes` | Sprint 1 | Foundation | Highest | 3 | None | 1. Tách rõ Lecturer Portal và Student Portal.<br>2. Có navigation riêng cho Branching Study và Review Study.<br>3. Được FE/BE review và phê duyệt. | DONE |
| `DES-002` | **EBA-102** | Task | `[DES-002] Shared Design States: Loading, Empty, Error & Permissions` | Sprint 1 | Foundation | High | 5 | is blocked by Master Task EBA-101 | 1. Thiết kế đầy đủ loading, empty, error, 403 và processing states.<br>2. Token màu sắc, typography dùng thống nhất theo Design System. | DONE |
| `FE-001` | **EBA-103** | Task | `[FE-001] Harden authStore, API Client, Route Guards & Session Expiration` | Sprint 1 | Foundation | Highest | 5 | is blocked by Master Task EBA-101 | 1. authStore khôi phục session an toàn qua persist middleware.<br>2. apiClient tự động intercept 401 và gọi refresh token hoặc logout.<br>3. PrivateRoute chặn truy cập chéo giữa STUDENT và LECTURER. | DONE |
| `FE-002` | **EBA-104** | Task | `[FE-002] Align Login, Register & Portal Layouts with Permission Matrix` | Sprint 1 | Foundation | High | 3 | is blocked by Master Task EBA-102, EBA-103 | 1. Form validation và submitting states đầy đủ trên LoginPage và RegisterPage.<br>2. Portal layouts (LecturerLayout, StudentLayout) render đúng vai trò người dùng đại học; sinh viên không thấy các nút tác vụ của giảng viên.<br>3. Tích hợp màn hình danh sách khóa học (CoursesPage.tsx) hiển thị danh sách khóa học của giảng viên, hỗ trợ Empty State khi chưa có khóa học và modal tạo khóa học mới với client-side validation.<br>4. Cấu hình 404 Route Catch-All (path: "*") trong React Router để bắt mọi URL không tồn tại và hiển thị giao diện 404 Not Found thân thiện kèm nút quay về portal.<br>5. Thiết lập React Router Error Boundary (errorElement) trên root/layout routes để cô lập các ngoại lệ runtime render hoặc lỗi điều hướng, hiển thị fallback UI an toàn thay vì blank white screen. | IN PROGRESS |
| `BE-001` | **EBA-105** | Task | `[BE-001] Implement User Registration, Login & JWT Token Management` | Sprint 1 | Foundation | Highest | 5 | None | 1. API POST /api/v1/auth/register mã hóa BCrypt (12 rounds) và lưu trữ user role.<br>2. API POST /api/v1/auth/login xác thực credentials và cấp JWT access token (8h).<br>3. API GET /api/v1/auth/me trả về profile của người dùng đang đăng nhập. | DONE |
| `BE-002` | **EBA-106** | Task | `[BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard` | Sprint 1 | Foundation | Highest | 5 | is blocked by Master Task EBA-105 | 1. JwtAuthGuard bảo vệ toàn bộ route mặc định.<br>2. Decorator @Public() cho phép bỏ qua xác thực trên các route công khai.<br>3. Đóng gói RolesGuard và decorator @Roles() kiểm tra role thay thế kiểm tra thủ công.<br>4. Tích hợp cơ chế kiểm soát tần suất truy cập tối thiểu (In-memory Rate Limiting / Throttler) trên các endpoint xác thực nhạy cảm (POST /api/v1/auth/login, POST /api/v1/auth/register) với ngưỡng cấu hình linh hoạt; kiểm thử tự động chứng minh khi vượt ngưỡng giới hạn, hệ thống trả về đúng mã lỗi HTTP 429 Too Many Requests nhằm ngăn chặn brute-force/dò quét cơ bản trong phạm vi Pilot. | IN PROGRESS |
| `BE-003` | **EBA-107** | Task | `[BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates` | Sprint 1 | Foundation | Highest | 5 | is blocked by Master Task EBA-105, EBA-106 | 1. CRUD API cho Course (/api/v1/courses) kiểm tra chính xác quyền sở hữu của lecturer_id.<br>2. Không có fallback user/course giả lập trong logic production.<br>3. Giảng viên chỉ xem và quản lý các khóa học do chính mình tạo. | DONE |
| `OPS-001` | **EBA-108** | Task | `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks` | Sprint 1 | Foundation | High | 3 | None | 1. Migration chạy mượt mà trên PostgreSQL 16 và kích hoạt extension pgvector.<br>2. Health check endpoint (/api/v1/health) kiểm tra DB và Redis.<br>3. Server dừng khởi động và báo lỗi nếu thiếu các biến môi trường bắt buộc (.env).<br>4. Sử dụng cơ chế khóa PostgreSQL Advisory Lock với cặp khóa số nguyên 32-bit pg_advisory_lock(key1, key2) (0x45445542, 0x52414e43 tạo không gian định danh kết hợp 64-bit) để tuần tự hóa việc chạy migration, ngăn chặn race condition khi nhiều instance khởi động đồng thời (đã xác minh qua Unit test mô phỏng; kiểm thử tích hợp thực tế đa instance thuộc phạm vi hạ tầng).<br>5. Tính toán và kiểm chứng Checksum SHA-256 cho từng file migration để bảo toàn tính toàn vẹn và ngăn chặn sửa đổi mã SQL lịch sử đã áp dụng. | DONE |
| `QA-001` | **EBA-109** | Task | `[QA-001] Test Matrix for Auth, Course & Permissions` | Sprint 1 | Foundation | High | 3 | is blocked by Master Task EBA-105, EBA-107 | 1. Ma trận kiểm thử bao phủ toàn bộ Auth, Role RBAC và Course Ownership.<br>2. Có case positive và negative cho cả hai role LECTURER và STUDENT.<br>3. Bổ sung bộ kiểm thử dự phòng điều hướng cho FE-002: xác nhận URL không khớp (path: "*") điều hướng hiển thị NotFoundPage và cho phép quay về portal phù hợp; xác nhận lỗi route/render được xử lý bởi errorElement, hiển thị fallback UI an toàn thay vì màn hình trắng (blank screen). | DONE |
| `QA-002` | **EBA-110** | Task | `[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite` | Sprint 1 | Foundation | Highest | 5 | is blocked by Master Task EBA-103, EBA-106, EBA-107 | 1. Token hết hạn hoặc sai chữ ký bị chặn lập tức với HTTP 401.<br>2. Truy cập tài nguyên của user khác bị từ chối với HTTP 403.<br>3. Có test evidence và log kiểm thử tự động. | DONE |

---

### 🟡 SPRINT 2 — MATERIAL & RAG (21/10/2026 – 03/11/2026 / Tuần 3–4)

* **Thời gian thực hiện**: 21/10/2026 – 03/11/2026 (2 tuần).
* **Sprint Goal**: Hoàn thiện pipeline upload tài liệu → MinIO → parsing → chunking → embedding → grounded retrieval.
* **Committed Capacity**: 75 SP (20 tasks).

| Group ID | Master Task ID | Issue Type | Summary | Sprint | Flow | Priority | SP | Dependencies (Master Task ID) | Acceptance Criteria | Status |
|:---:|:---:|:---:|---|---|:---:|:---:|:---:|---|---|:---:|
| `DES-003` | **EBA-201** | Task | `[DES-003] Material Library & Upload Interaction Flow Design` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-102 | 1. Thiết kế modal tải lên tài liệu hỗ trợ Drag-and-Drop cho định dạng PDF và DOCX.<br>2. Thiết kế bảng danh sách tài liệu hiển thị metadata và thanh tìm kiếm/lọc. | TO DO |
| `DES-004` | **EBA-202** | Task | `[DES-004] Material Processing, Progress Bar & Failure Recovery States` | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-201 | 1. Thiết kế các trạng thái tiến độ: Pending, Processing (Parsing/Embedding), Completed, Failed.<br>2. Thiết kế thông báo lỗi và nút bấm Retry khi xử lý tài liệu thất bại. | TO DO |
| `DES-005` | **EBA-203** | Task | `[DES-005] RAG Grounding Evidence & Source Inspection UI Design` | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-201 | 1. Thiết kế modal/drawer hiển thị các đoạn văn bản trích dẫn nguồn (evidence chunks) đã retrieval.<br>2. Tuyệt đối không để lộ thông tin nhạy cảm (API keys, system prompt, internal ID). | TO DO |
| `FE-003` | **EBA-204** | Story | `[FE-003] Implement Material Upload Modal with Client-Side Validation` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-201, EBA-107 | 1. Hỗ trợ chọn hoặc kéo thả tệp định dạng .pdf hoặc .docx.<br>2. Validate kích thước tệp tối đa 50MB và MIME type ngay tại client trước khi upload.<br>3. Hiển thị thanh phần trăm tiến độ upload khi gửi tới API. | TO DO |
| `FE-004` | **EBA-205** | Story | `[FE-004] Implement Materials Table with Metadata & Processing Status Indicators` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-202, EBA-204 | 1. Hiển thị danh sách tài liệu của khóa học với tên file, định dạng (PDF/DOCX), kích thước, số lượng chunks và ngày tải lên.<br>2. Hiển thị badge trạng thái động (Pending, Processing, Completed, Failed) theo processing_status; tự động polling hoặc cập nhật trạng thái khi tài liệu đang xử lý.<br>3. Cung cấp bộ lọc client-side cho danh sách tài liệu theo trạng thái xử lý (PENDING, PROCESSING, COMPLETED, FAILED) và theo định dạng tệp (PDF, DOCX) phù hợp với quy mô Pilot học phần (<50 tài liệu). | IN PROGRESS |
| `FE-005` | **EBA-206** | Task | `[FE-005] Implement Material Delete & Failure Retry Actions with API Integration` | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-205 | 1. Kết nối nút xóa tài liệu với API DELETE /api/v1/courses/:courseId/materials/:id kèm dialog xác nhận.<br>2. Cung cấp nút Retry gọi API xử lý lại đối với tài liệu có trạng thái FAILED.<br>3. Hiển thị thông báo toast thành công hoặc lỗi tương ứng. | TO DO |
| `FE-006` | **EBA-207** | Task | `[FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence` | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-203 | 1. Hiển thị modal xem chi tiết các chunk văn bản trích dẫn kèm số trang/chỉ số đoạn.<br>2. Cho phép giảng viên đối chiếu nguồn tài liệu gốc khi chuẩn bị tạo case study. | TO DO |
| `BE-005` | **EBA-208** | Story | `[BE-005] Implement Material CRUD & Ownership Authorization Gates` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-107 | 1. Quản lý bản ghi trong teaching_materials (tên, dung lượng, MIME type, status).<br>2. Kiểm tra quyền sở hữu của Course tại Backend Gateway; chỉ owner mới được upload và xóa tài liệu.<br>3. Bắt buộc kiểm tra quyền sở hữu khóa học trên toàn bộ các route đọc (GET /api/v1/courses/:courseId/materials và GET /api/v1/materials/:id) để ngăn chặn lỗ hổng IDOR giữa các giảng viên.<br>4. Trả về đúng mã lỗi 403 Forbidden nếu truy cập tài liệu khóa học của giảng viên khác. | IN PROGRESS |
| `OPS-002` | **EBA-209** | Task | `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-208 | 1. Lưu trữ file an toàn trong bucket edubranch-materials trên MinIO.<br>2. Sử dụng object key dạng UUID không thể đoán trước (non-guessable keys).<br>3. Hỗ trợ streaming file upload và dọn dẹp file an toàn khi bị xóa. | IN PROGRESS |
| `BE-007` | **EBA-210** | Task | `[BE-007] Implement PDF Document Parser with Text Extraction & Normalization` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-209 | 1. Trích xuất văn bản từ tệp PDF nhiều trang tại ai-service/app/ingestion/parser.py.<br>2. Làm sạch khoảng trắng thừa, ký tự điều khiển và chuẩn hóa định dạng UTF-8.<br>3. Bắt ngoại lệ và gán trạng thái FAILED nếu file PDF bị hỏng hoặc mã hóa mật khẩu. | IN PROGRESS |
| `BE-008` | **EBA-211** | Task | `[BE-008] Implement DOCX Document Parser with Text Extraction & Normalization` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-209 | 1. Trích xuất văn bản từ tệp DOCX qua python-docx tại app/ingestion/parser.py.<br>2. Giữ nguyên cấu trúc phân đoạn văn bản và tiêu đề.<br>3. Bắt lỗi đối với định dạng docx rỗng hoặc không hợp lệ. | IN PROGRESS |
| `BE-009` | **EBA-212** | Task | `[BE-009] Implement Recursive Document Chunking Pipeline` | Sprint 2 | Flow 1 | Highest | 3 | is blocked by Master Task EBA-210, EBA-211 | 1. Chia nhỏ văn bản thành các chunk kích thước 500-1000 tokens với overlap 100 tokens.<br>2. Bảo toàn ranh giới câu và đoạn văn qua RecursiveCharacterTextSplitter.<br>3. Gắn chỉ số tuần tự chunk_index và metadata tài liệu cho từng chunk. | IN PROGRESS |
| `BE-010` | **EBA-213** | Task | `[BE-010] Implement Vector Embedding Generation via Provider Abstraction` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-212 | 1. Sinh vector embeddings qua Gemini text-embedding-004 (768-dim) hoặc OpenAI (1536-dim).<br>2. Gọi mô hình thông qua Provider Abstraction Interface.<br>3. Xử lý batching embeddings để tối ưu hóa thời gian và tránh rate limit. | IN PROGRESS |
| `OPS-003` | **EBA-214** | Task | `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-213 | 1. Lưu trữ các chunk và vector vào bảng document_chunks trong PostgreSQL.<br>2. Xây dựng và duy trì chỉ mục HNSW vector_cosine_ops để tìm kiếm tương đồng nhanh.<br>3. Đảm bảo ràng buộc khóa ngoại và CASCADE khi tài liệu bị xóa. | IN PROGRESS |
| `BE-012` | **EBA-215** | Task | `[BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-214 | 1. API POST /internal/v1/retrieval/query tìm kiếm vector tương đồng cosine.<br>2. Lọc bắt buộc theo course_id để cô lập dữ liệu theo quyền sở hữu khóa học.<br>3. Đánh dấu rõ nội dung tài liệu trích xuất là untrusted context bên trong khối <sources>...</sources> để LLM phân biệt với system instruction. | IN PROGRESS |
| `BE-013` | **EBA-216** | Bug | `[BE-013] Fix Material Controller Spec Mock Data for Ownership Regression` | Sprint 2 | Flow 1 | High | 2 | is blocked by Master Task EBA-208 | 1. Cập nhật mock dữ liệu trong material.controller.spec.ts để khớp đúng lecturer_id người tạo.<br>2. Đảm bảo toàn bộ 4 test suite trong backend chạy vượt qua (PASS). | IN PROGRESS |
| `QA-003` | **EBA-217** | Task | `[QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds` | Sprint 2 | Flow 1 | High | 3 | is blocked by Master Task EBA-204, EBA-208 | 1. Kiểm thử thành công upload file PDF và DOCX hợp lệ.<br>2. Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB.<br>3. Kiểm thử xử lý lỗi mạng và hiển thị trạng thái retry. | TO DO |
| `QA-004` | **EBA-218** | Task | `[QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-208, EBA-209 | 1. Kiểm thử Lecturer B không thể đọc, tải hoặc xóa tài liệu của Lecturer A.<br>2. Kiểm thử không thể đoán được URL/key tài liệu trên MinIO.<br>3. Kiểm thử tính toàn vẹn khi xóa khóa học thì tài liệu liên quan bị xóa an toàn. | TO DO |
| `QA-005` | **EBA-219** | Task | `[QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-214 | 1. Kiểm thử tự động xuyên suốt: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector.<br>2. Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt. | TO DO |
| `QA-006` | **EBA-220** | Task | `[QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing` | Sprint 2 | Flow 1 | Highest | 5 | is blocked by Master Task EBA-215 | 1. Kiểm thử độ chính xác truy xuất RAG theo cosine similarity.<br>2. Kiểm thử cô lập dữ liệu nghiêm ngặt giữa các course_id.<br>3. Kiểm thử ranh giới ngữ cảnh untrusted trong <sources>: đảm bảo generation prompt chỉ dẫn LLM coi tài liệu là tham khảo thuần túy và không thực thi chỉ thị độc hại bên trong nguồn. | TO DO |

---

### 🟠 SPRINT 3 — CASE & APPROVAL (04/11/2026 – 17/11/2026 / Tuần 5–6)

* **Thời gian thực hiện**: 04/11/2026 – 17/11/2026 (2 tuần).
* **Sprint Goal**: Tạo case draft từ grounded context và hoàn thiện quy trình giảng viên kiểm duyệt, phê duyệt và xuất bản.
* **Committed Capacity**: 81 SP (19 tasks).

| Group ID | Master Task ID | Issue Type | Summary | Sprint | Flow | Priority | SP | Dependencies (Master Task ID) | Acceptance Criteria | Status |
|:---:|:---:|:---:|---|---|:---:|:---:|:---:|---|---|:---:|
| `DES-006` | **EBA-301** | Task | `[DES-006] Case Generation Modal & Parameter Configuration Flow Design` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-203 | 1. Thiết kế picker chọn tài liệu tham khảo trong khóa học.<br>2. Thiết kế trường nhập chủ đề gợi ý (topic hint), số lượng node mong muốn và chọn chế độ học.<br>3. Thiết kế trạng thái spinner đang tạo case kèm thông báo tiến độ. | TO DO |
| `DES-007` | **EBA-302** | Task | `[DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-301 | 1. Thiết kế trực quan sơ đồ cây trên canvas ReactFlow (Root node, Decision node, Terminal node).<br>2. Thiết kế màu sắc, icon phân biệt các nhánh và đường nối (edges) thể hiện lựa chọn.<br>3. Hỗ trợ thao tác zoom, pan và căn chỉnh tự động cây quyết định. | TO DO |
| `DES-008` | **EBA-303** | Task | `[DES-008] Side-by-Side Node & Option Form Editor UX Design` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-302 | 1. Thiết kế drawer/panel bên phải để xem và chỉnh sửa chi tiết từng node khi click trên canvas.<br>2. Thiết kế các trường chỉnh sửa: Situation text, Option text, Consequence explanation.<br>3. Thiết kế nút lưu thay đổi và hiển thị tức thì trên sơ đồ cây. | TO DO |
| `DES-009` | **EBA-304** | Task | `[DES-009] Case Governance Lifecycle Action Bar & Approval Status Design` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-302 | 1. Thiết kế thanh công cụ hiển thị trạng thái hiện tại (DRAFT, REVIEWED, APPROVED, PUBLISHED).<br>2. Thiết kế các nút hành động chuyển trạng thái có điều kiện (Mark as Reviewed, Approve, Publish).<br>3. Thiết kế hộp thoại xác nhận xuất bản kèm link chia sẻ cho sinh viên. | TO DO |
| `FE-007` | **EBA-305** | Story | `[FE-007] Implement Case Generation Trigger Modal & Progress Tracking` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-301, EBA-205 | 1. Xây dựng trang danh mục tình huống (CasesPage.tsx) tại đường dẫn /lecturer/courses/:courseId/cases, hiển thị danh sách case kèm badge trạng thái vòng đời (DRAFT, REVIEWED, APPROVED, PUBLISHED) và chế độ học (BRANCHING_STUDY, REVIEW_STUDY).<br>2. Hỗ trợ Empty State chuyên dụng khi khóa học chưa có tình huống nào, hướng dẫn giảng viên khởi tạo ca học và có nút kích hoạt Modal sinh case.<br>3. Điều hướng chính xác từ từng card case trong danh sách tới màn hình biên tập/phê duyệt cây quyết định (/lecturer/cases/:caseId/review), và nút liên kết nhanh tới màn hình quản lý tài liệu học phần (/lecturer/courses/:courseId/materials).<br>4. Modal sinh case AI (CaseGenerationModal.tsx hoặc embedded trong CasesPage) cho phép chọn tài liệu học phần đã ingestion (COMPLETED), nhập gợi ý chủ đề (topic hint), tùy chỉnh số lượng node rẽ nhánh, hiển thị loading spinner khi gọi API POST /cases/generate, và tự động điều hướng sang CaseReviewPage khi tạo bản nháp thành công. | TO DO |
| `FE-008` | **EBA-306** | Story | `[FE-008] Implement ReactFlow Decision Tree Visual Canvas Component` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-302, EBA-305 | 1. Tích hợp ReactFlow hiển thị topo cây quyết định với custom nodes và edges.<br>2. Đánh dấu nổi bật Root Node và các Terminal Nodes.<br>3. Xử lý sự kiện click vào node để kích hoạt form chỉnh sửa chi tiết. | IN PROGRESS |
| `FE-009` | **EBA-307** | Story | `[FE-009] Implement Interactive Node, Option & Consequence Editor Form` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-303, EBA-306 | 1. Form cho phép giảng viên biên tập tình huống (situation), nội dung phương án và hệ quả.<br>2. Gọi API PUT /api/v1/cases/:id/nodes/:nodeId để lưu thay đổi.<br>3. Cập nhật ngay nhãn trên canvas sau khi lưu mà không cần reload trang. | TO DO |
| `FE-010` | **EBA-308** | Story | `[FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)` | Sprint 3 | Flow 2 | High | 5 | is blocked by Master Task EBA-307 | 1. Cho phép thêm phương án lựa chọn mới cho một node.<br>2. Cho phép kéo thả nối cạnh (edge) sang node mục tiêu tiếp theo hoặc tạo node mới.<br>3. Chặn các thao tác tạo chu trình hoặc ngắt kết nối khỏi Root Node. | TO DO |
| `FE-011` | **EBA-309** | Story | `[FE-011] Implement Case Approval State Transition Workflow UI` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-304, EBA-307 | 1. Giao diện chuyển đổi trạng thái: DRAFT → REVIEWED → APPROVED → PUBLISHED.<br>2. Ẩn nút Publish nếu cây chưa có ít nhất 1 Terminal node hoặc Root node không hợp lệ.<br>3. Khi PUBLISHED, hiển thị modal sao chép đường link trực tiếp cấp cho sinh viên. | TO DO |
| `BE-014` | **EBA-310** | Task | `[BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-215 | 1. Định nghĩa CaseGenerationOutput, CaseNode, CaseOption Pydantic schemas tại app/generation/schemas/decision_tree.py.<br>2. Thuật toán DFS 3 màu phát hiện và từ chối tuyệt đối cây có chu trình (cycles).<br>3. Xác thực không có nút mồ côi (unreachable nodes) và có ít nhất 1 terminal path. | IN PROGRESS |
| `BE-015` | **EBA-311** | Task | `[BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-310 | 1. Xây dựng prompt có cấu trúc tích hợp ngữ cảnh RAG từ <sources> tài liệu của giảng viên.<br>2. Yêu cầu LLM trả về Structured Output JSON tuân thủ đúng schema cây quyết định.<br>3. Tự động retry gọi LLM nếu kết quả sinh ra vi phạm ràng buộc đồ thị.<br>4. Thiết lập cơ chế giới hạn thời gian chờ (HTTP Timeout thực thi trong đường gọi dịch vụ, cấu hình linh hoạt qua biến môi trường, đề xuất ban đầu 30s–60s) và giới hạn tối đa 3 lần gọi tổng cộng (1 lần gọi ban đầu + tối đa 2 lần retry đối với các lỗi mạng/quá tải tạm thời như 429, 503, timeout; không retry đối với lỗi 4xx client). Bảo đảm tính idempotency (tính lũy đẳng): Các lần retry của cùng một yêu cầu phải sử dụng định danh ổn định hoặc cơ chế chống trùng tương đương, tránh tạo nhiều case hoặc lưu cùng một kết quả nhiều lần, kể cả khi lần gọi trước đã được xử lý nhưng phản hồi bị timeout; nếu thất bại hoàn toàn, hệ thống kết thúc có kiểm soát (graceful failure) và ghi log lỗi rõ ràng. | IN PROGRESS |
| `BE-016` | **EBA-312** | Story | `[BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-311 | 1. Lưu bản nháp vào cases, case_nodes, case_options trong 1 Database Transaction duy nhất.<br>2. Ánh xạ chính xác node_index tạm thời sang UUID và cập nhật root_node_id.<br>3. Thực hiện ROLLBACK ngay lập tức nếu bất kỳ bước lưu node/option nào thất bại. | IN PROGRESS |
| `BE-017` | **EBA-313** | Story | `[BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-312 | 1. API PUT /api/v1/cases/:id/nodes/:nodeId cập nhật tình huống và danh sách options mà không tự ý thay đổi lifecycle state của case.<br>2. Kiểm tra tính toàn vẹn tô pô (DFS cycle check) trước khi persistence để đảm bảo không tạo chu trình.<br>3. Case giữ nguyên trạng thái DRAFT cho đến khi giảng viên thực hiện action Review riêng biệt (do EBA-314 quản lý). | IN PROGRESS |
| `BE-018` | **EBA-314** | Story | `[BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-313 | 1. API PATCH /api/v1/cases/:id/status thực thi cỗ máy trạng thái DRAFT → REVIEWED → APPROVED → PUBLISHED.<br>2. Ngăn chặn các bước nhảy trạng thái trái phép (ví dụ DRAFT nhảy thẳng lên PUBLISHED).<br>3. Chỉ giảng viên sở hữu khóa học mới có quyền thực hiện chuyển đổi trạng thái. | IN PROGRESS |
| `BE-019` | **EBA-315** | Task | `[BE-019] Implement Database-Level Student Access Gate for Published-Only Cases` | Sprint 3 | Flow 2 | Highest | 3 | is blocked by Master Task EBA-314 | 1. Query kiểm tra trạng thái case ở tầng DB: sinh viên chỉ được đọc case khi status = 'PUBLISHED'.<br>2. Mọi truy vấn case DRAFT, REVIEWED, APPROVED từ role STUDENT đều bị chặn với HTTP 403.<br>3. Loại bỏ hoàn toàn nguy cơ rò rỉ đề bài chưa duyệt qua API. | IN PROGRESS |
| `QA-007` | **EBA-316** | Task | `[QA-007] Contract & Schema Validation Tests for AI Case Generation Output` | Sprint 3 | Flow 2 | High | 3 | is blocked by Master Task EBA-310, EBA-311 | 1. Kiểm thử định dạng JSON sinh ra từ AI Service với các bộ dữ liệu tài liệu mẫu.<br>2. Kiểm thử khả năng phục hồi và từ chối khi mô hình trả về JSON sai cấu trúc. | TO DO |
| `QA-008` | **EBA-317** | Task | `[QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-310, EBA-313 | 1. Kiểm thử phát hiện chu trình (cycle detection) với các ca kiểm thử đồ thị phức tạp.<br>2. Kiểm thử phát hiện nút mồ côi (orphan nodes) và thiếu đường đi đến terminal node.<br>3. Kiểm thử tính bất biến của cây quyết định khi chỉnh sửa qua API. | TO DO |
| `QA-009` | **EBA-318** | Task | `[QA-009] State Machine & Lifecycle Transition Boundary Test Suite` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-314 | 1. Kiểm thử các bước chuyển trạng thái hợp lệ từ DRAFT đến PUBLISHED.<br>2. Kiểm thử từ chối các bước chuyển không hợp lệ (nhảy cóc trạng thái).<br>3. Kiểm thử phân quyền: tài khoản không sở hữu không thể duyệt case. | TO DO |
| `QA-010` | **EBA-319** | Task | `[QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases` | Sprint 3 | Flow 2 | Highest | 5 | is blocked by Master Task EBA-315 | 1. Kiểm thử tự động sinh viên truy cập trực tiếp ID case ở trạng thái DRAFT, REVIEWED, APPROVED nhận 403.<br>2. Kiểm thử sinh viên truy cập thành công ngay khi trạng thái chuyển sang PUBLISHED. | TO DO |

---

### 🔵 SPRINT 4 — LEARNING & REVIEW (18/11/2026 – 15/12/2026 / Tuần 7–10 / 4 tuần)

* **Thời gian thực hiện**: 18/11/2026 – 15/12/2026 (4 tuần).
* **Sprint Goal**: Hoàn thiện Student learning experience với Branching Study experience-first và Review Study độc lập; giai đoạn cuối tập trung tích hợp hệ thống, UAT, bug fixing, demo và release readiness.
* **Committed Capacity**: 138 SP (35 tasks).

| Group ID | Master Task ID | Issue Type | Summary | Sprint | Flow | Priority | SP | Dependencies (Master Task ID) | Acceptance Criteria | Status |
|:---:|:---:|:---:|---|---|:---:|:---:|:---:|---|---|:---:|
| `DES-010` | **EBA-401** | Task | `[DES-010] Branching Case Player Experience-First UI/UX Design` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-309 | 1. Thiết kế màn hình ra quyết định tập trung, không phân tâm.<br>2. Tuyệt đối không hiển thị thẻ hệ quả (consequence card) giữa chừng.<br>3. Tuyệt đối không có form bắt buộc nhập lập luận (reasoning form) giữa các bước. | TO DO |
| `DES-011` | **EBA-402** | Task | `[DES-011] Journey Review Path Visualization & Consequence Reveal Design` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-401 | 1. Thiết kế lộ trình toàn bộ các bước đã đi qua theo thứ tự thời gian.<br>2. Mở khóa và hiển thị đầy đủ văn bản hệ quả (consequences) lần đầu tiên tại màn hình Review.<br>3. Thiết kế form nhập lập luận hồi cứu (retrospective reasoning) cho các quyết định then chốt. | TO DO |
| `DES-012` | **EBA-403** | Task | `[DES-012] Retry & New Attempt Initiation UX Design` | Sprint 4 | Branching Study | High | 2 | is blocked by Master Task EBA-402 | 1. Thiết kế nút và modal Retry bắt đầu lượt chơi mới.<br>2. Truyền đạt rõ ràng việc lượt chơi cũ được bảo lưu trọn vẹn và không bị ghi đè. | TO DO |
| `DES-013` | **EBA-404** | Task | `[DES-013] Review Study Open Analysis & Solution Proposal UI Design` | Sprint 4 | Review Study | High | 3 | is blocked by Master Task EBA-102 | 1. Thiết kế giao diện hiển thị ngữ cảnh & dữ liệu thực tế (context) và bài toán mở (problem).<br>2. Thiết kế form nhập phân tích, đề xuất giải pháp và giải thích lập luận.<br>3. Không sử dụng cây quyết định hay câu hỏi trắc nghiệm đúng/sai. | TO DO |
| `DES-014` | **EBA-405** | Task | `[DES-014] Lecturer Qualitative Feedback & Review Dashboard Design` | Sprint 4 | Review Study | High | 3 | is blocked by Master Task EBA-404 | 1. Thiết kế dashboard cho giảng viên xem các bài nộp của sinh viên (cả Branching và Review Study).<br>2. Thiết kế khung soạn thảo nhận xét định tính (qualitative feedback).<br>3. Thiết kế giao diện cho sinh viên đọc nhận xét và viết bài phản tư (reflection). | TO DO |
| `DES-015` | **EBA-406** | Task | `[DES-015] AI Challenge Support Socratic Interaction UI Design` | Sprint 4 | Challenge Support | High | 3 | is blocked by Master Task EBA-402, EBA-404 | 1. Thiết kế giao diện hội thoại câu hỏi gợi mở phản biện của AI (tối đa 2 vòng).<br>2. Hiển thị rõ ranh giới: AI chỉ đặt câu hỏi chất vấn giả định, tuyệt đối không chấm điểm.<br>3. Thiết kế thanh tiến trình 2 vòng rõ ràng. | TO DO |
| `FE-012` | **EBA-407** | Story | `[FE-012] Implement Continuous Branching Case Player Component` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-401, EBA-309 | 1. Hiển thị tình huống hiện tại và các phương án lựa chọn.<br>2. Khi sinh viên bấm chọn phương án, chuyển mượt mà ngay lập tức sang tình huống tiếp theo.<br>3. Tuyệt đối không ngắt quãng bởi thẻ hệ quả hay form lập luận giữa chừng. | IN PROGRESS |
| `FE-013` | **EBA-408** | Story | `[FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-407 | 1. Nhận biết khi sinh viên chạm nút kết thúc (is_terminal = true).<br>2. Gọi API hoàn thành attempt và tự động chuyển hướng sang /student/cases/:caseId/review.<br>3. Ngăn chặn sinh viên đi tiếp khi đã đạt nút kết thúc. | IN PROGRESS |
| `FE-014` | **EBA-409** | Story | `[FE-014] Implement Journey Review Replay Canvas with Consequence Reveal` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-402, EBA-408 | 1. Tái hiện lại danh sách toàn bộ các quyết định đã chọn theo đúng trình tự thời gian.<br>2. Hiển thị các phương án thay thế chưa chọn.<br>3. Tiết lộ văn bản hệ quả (consequences) của từng lựa chọn đã đưa ra. | IN PROGRESS |
| `FE-015` | **EBA-410** | Story | `[FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-409 | 1. Cung cấp ô nhập lập luận hồi cứu tại từng điểm quyết định trên trang Review.<br>2. Lập luận là tùy chọn (không bắt buộc nhập mọi node, khuyến khích node bước ngoặt).<br>3. Lưu lập luận hồi cứu an toàn về backend qua API. | IN PROGRESS |
| `FE-016` | **EBA-411** | Story | `[FE-016] Implement Retry Action Generating New Independent Branching Attempt` | Sprint 4 | Branching Study | High | 3 | is blocked by Master Task EBA-409 | 1. Nút Retry kích hoạt API tạo một lượt chơi mới với attempt_number tăng thêm 1.<br>2. Đưa sinh viên về Root Node của case để trải nghiệm hướng đi mới.<br>3. Lưu trữ đầy đủ lịch sử các lượt chơi trước trong Zustand store / API history. | IN PROGRESS |
| `FE-017` | **EBA-412** | Story | `[FE-017] Implement Post-Review Overall Reflection Submission Page` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-410 | 1. Màn hình cho phép sinh viên viết bài phản tư tổng thể (Reflection) sau khi hoàn tất Review.<br>2. Gọi API nộp bài phản tư và cập nhật trạng thái reflection_status = 'SUBMITTED'.<br>3. Khóa chỉnh sửa bài phản tư sau khi đã nộp thành công. | IN PROGRESS |
| `FE-018` | **EBA-413** | Story | `[FE-018] Implement Review Study Independent Analysis & Submission Page` | Sprint 4 | Review Study | High | 5 | is blocked by Master Task EBA-404 | 1. Hiển thị bối cảnh thực tế (context_text) và vấn đề mở (problem_text).<br>2. Form nhập bài phân tích, giải pháp đề xuất và giải thích lập luận.<br>3. Gọi API nộp bài và quản lý trạng thái SUBMITTED (mỗi sinh viên 1 bài duy nhất). | IN PROGRESS |
| `FE-019` | **EBA-414** | Story | `[FE-019] Implement Lecturer Feedback Dashboard & Submission Review View` | Sprint 4 | Lecturer Feedback | High | 5 | is blocked by Master Task EBA-405, EBA-413 | 1. Hiển thị danh sách sinh viên đã nộp bài Review Study và các attempt hoàn thành Branching Study kèm thời gian nộp và trạng thái xét duyệt.<br>2. Cung cấp bộ lọc client-side cho danh sách bài nộp theo Chế độ học (All, Branching Study, Review Study) và theo trường trạng thái riêng biệt của từng loại dữ liệu: đối với Review Study lọc theo trạng thái bài nộp SUBMITTED (hiển thị nhãn giao diện PENDING_REVIEW), REVIEWED (Đã phản hồi), REFLECTED (Đã hoàn tất phản tư); đối với Branching Study lọc riêng biệt theo trạng thái hành trình (is_completed = true / COMPLETED) và trạng thái bài phản tư (reflection_status = 'SUBMITTED' vs Chưa nộp bài phản tư).<br>3. Khung soạn thảo nhận xét định tính chi tiết cho giảng viên, lưu nhận xét và chuyển trạng thái bài nộp sang REVIEWED. | IN PROGRESS |
| `FE-020` | **EBA-415** | Story | `[FE-020] Implement Student Review Feedback & Reflection Workflow` | Sprint 4 | Review Study | High | 3 | is blocked by Master Task EBA-414 | 1. Màn hình hiển thị nhận xét định tính của giảng viên cho sinh viên sau khi giảng viên phản hồi (trạng thái REVIEWED).<br>2. Mở khóa ô nhập bài phản tư dựa trên nhận xét của giảng viên.<br>3. Nộp bài phản tư và cập nhật trạng thái bài làm sang REFLECTED. | IN PROGRESS |
| `FE-021` | **EBA-416** | Story | `[FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)` | Sprint 4 | Challenge Support | High | 5 | is blocked by Master Task EBA-406, EBA-410 | 1. Giao diện nhận câu hỏi gợi mở phản biện từ AI sau khi sinh viên nhập lập luận.<br>2. Hỗ trợ tối đa 2 vòng phản hồi (Round 1 & Round 2), sau đó khóa phiên.<br>3. Tuyệt đối không hiển thị điểm số, xếp loại hay đánh giá đúng/sai. | IN PROGRESS |
| `FE-022` | **EBA-417** | Story | `[FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts` | Sprint 4 | Statistics | High | 3 | is blocked by Master Task EBA-408 | 1. Màn hình StatisticsPage hiển thị tỷ lệ hoàn thành (Completion rate).<br>2. Biểu đồ phân bổ nhánh quyết định sinh viên lựa chọn (Branch selection distribution).<br>3. Thống kê số lượt thử (Attempts) và kết cục cuối cùng (Terminal outcomes). | IN PROGRESS |
| `BE-020` | **EBA-418** | Story | `[BE-020] Implement Branching Attempt Initialization & Resumption APIs` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-309 | 1. API POST /api/v1/cases/:id/branching-attempts tạo bản ghi mới trong branching_attempts.<br>2. Xác thực case đang ở trạng thái PUBLISHED, tự động tăng attempt_number.<br>3. Gán current_node_id bằng root_node_id của cây quyết định. | IN PROGRESS |
| `BE-021` | **EBA-419** | Story | `[BE-021] Implement Real-Time Option Selection & Path Traversal Persistence` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-418 | 1. API ghi nhận lựa chọn option của sinh viên vào bảng student_reasoning.<br>2. Cập nhật current_node_id sang node tiếp theo.<br>3. Giữ trường reasoning_text là null trong giai đoạn Experience. | IN PROGRESS |
| `BE-022` | **EBA-420** | Story | `[BE-022] Implement Terminal Node Completion & Outcome Recording API` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-419 | 1. Phát hiện khi lựa chọn dẫn tới node có is_terminal = true.<br>2. Cập nhật is_completed = true, outcome_node_id và completed_at.<br>3. Mở khóa quyền truy cập vào endpoint Journey Review. | IN PROGRESS |
| `BE-023` | **EBA-421** | Story | `[BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-420 | 1. API GET /api/v1/cases/:id/branching-attempts/:attemptId/review tổng hợp toàn bộ lộ trình.<br>2. Truy vấn và mở khóa văn bản hệ quả (consequences) của các option đã chọn.<br>3. Chặn truy cập nếu attempt chưa hoàn thành (is_completed = false). | IN PROGRESS |
| `BE-024` | **EBA-422** | Story | `[BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-421 | 1. API cập nhật reasoning_text hồi cứu cho các node trong student_reasoning.<br>2. API PATCH /api/v1/branching-attempts/:id/reflection lưu bài phản tư tổng kết.<br>3. Cập nhật reflection_status = 'SUBMITTED' và ghi nhận thời gian nộp. | IN PROGRESS |
| `BE-025` | **EBA-423** | Story | `[BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate` | Sprint 4 | Review Study | High | 5 | is blocked by Master Task EBA-309 | 1. API POST /api/v1/cases/:id/review-study/submit xác thực case đang ở trạng thái PUBLISHED và lưu bài nộp vào review_study_submissions.<br>2. Áp dụng ràng buộc UNIQUE(student_id, case_id) — mỗi sinh viên chỉ nộp 1 bài duy nhất.<br>3. Quản lý vòng đời trạng thái bài nộp: SUBMITTED → REVIEWED → REFLECTED. | IN PROGRESS |
| `BE-026` | **EBA-424** | Story | `[BE-026] Implement Lecturer Feedback Authoring & Status Progression API` | Sprint 4 | Lecturer Feedback | High | 5 | is blocked by Master Task EBA-423 | 1. API POST /api/v1/lecturer-feedback lưu nhận xét định tính vào lecturer_feedback.<br>2. Ràng buộc toàn vẹn chk_feedback_one_target (gắn với attempt hoặc review_submission).<br>3. Tự động chuyển submission_status của Review Study sang REVIEWED khi feedback được lưu. | IN PROGRESS |
| `BE-027` | **EBA-425** | Story | `[BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer` | Sprint 4 | Challenge Support | High | 5 | is blocked by Master Task EBA-422, EBA-423 | 1. FastAPI service sinh câu hỏi phản biện gợi mở từ lập luận của sinh viên.<br>2. Backend Gateway và DB thực thi ràng buộc cứng tối đa 2 vòng phản biện.<br>3. Tuyệt đối không chứa bất kỳ logic hoặc trường dữ liệu nào liên quan đến chấm điểm/xếp loại.<br>4. Cấu hình HTTP Timeout thực tế trong lời gọi API (cấu hình linh hoạt qua biến môi trường, đề xuất ban đầu 15s–30s) và giới hạn tối đa 3 lần gọi tổng cộng (1 lần gọi ban đầu + tối đa 2 lần retry đối với lỗi mạng/quá tải tạm thời). Bảo đảm tính idempotency (tính lũy đẳng): Các lần retry của cùng một yêu cầu phải sử dụng định danh ổn định hoặc cơ chế chống trùng tương đương, tránh ghi nhận trùng lặp lượt phản biện hoặc lưu dữ liệu hai lần, kể cả khi lần gọi trước đã được xử lý nhưng phản hồi bị timeout; nếu timeout hoặc AI Service không phản hồi, xử lý kết thúc có kiểm soát và trả về thông báo lỗi thân thiện cho sinh viên. | IN PROGRESS |
| `BE-028` | **EBA-426** | Story | `[BE-028] Implement Learning-Flow Statistics Aggregation Queries` | Sprint 4 | Statistics | High | 5 | is blocked by Master Task EBA-420, EBA-423 | 1. Truy vấn tính toán tỷ lệ hoàn thành (Completion rate) trên tổng số attempt.<br>2. Gom nhóm đếm tần suất lựa chọn từng option tại mỗi Decision Point.<br>3. Thống kê phân bổ lượt làm (Attempts per student) và kết cục đạt được (Outcomes). | IN PROGRESS |
| `QA-011` | **EBA-427** | Task | `[QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review` | Sprint 4 | Branching Study | Highest | 5 | is blocked by Master Task EBA-408, EBA-421 | 1. Kiểm thử E2E tự động: Mở case PUBLISHED → Chọn các option liên tục → Chạm terminal → Mở trang Review.<br>2. Xác minh dữ liệu lộ trình hiển thị chính xác 100% so với các bước sinh viên đã bấm.<br>3. Lưu bằng chứng kiểm thử E2E đạt chuẩn Definition of Done. | TO DO |
| `QA-012` | **EBA-428** | Task | `[QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence` | Sprint 4 | Branching Study | Highest | 3 | is blocked by Master Task EBA-407, EBA-419 | 1. Khẳng định không có bất kỳ văn bản hệ quả nào bị rò rỉ trước khi chạm terminal node.<br>2. Khẳng định sinh viên không bị chặn bởi form lập luận giữa các lần chọn phương án.<br>3. Kiểm thử trên cả API response và DOM giao diện client. | TO DO |
| `QA-013` | **EBA-429** | Task | `[QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation` | Sprint 4 | Branching Study | High | 3 | is blocked by Master Task EBA-411, EBA-418 | 1. Kiểm thử thao tác Retry tạo ra bản ghi attempt mới với attempt_number tăng dần.<br>2. Xác minh dữ liệu các lượt chơi cũ (path, reasoning, reflection) được giữ nguyên vẹn.<br>3. Không xảy ra tình trạng ghi đè hoặc xáo trộn giữa các lượt chơi của cùng một sinh viên. | TO DO |
| `QA-014` | **EBA-430** | Task | `[QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection` | Sprint 4 | Review Study | High | 5 | is blocked by Master Task EBA-414, EBA-424 | 1. Kiểm thử E2E luồng Review Study: Sinh viên nộp bài (SUBMITTED) → Giảng viên gửi feedback (REVIEWED) → Sinh viên nộp phản tư (REFLECTED).<br>2. Kiểm thử chặn nộp bài lần 2 cho cùng 1 case (ràng buộc unique submission).<br>3. Xác minh không có logic tự động chấm điểm nào diễn ra. | TO DO |
| `QA-015` | **EBA-431** | Task | `[QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)` | Sprint 4 | Challenge Support | High | 3 | is blocked by Master Task EBA-416, EBA-425 | 1. Kiểm thử tự động hệ thống dừng chính xác sau tối đa 2 vòng phản biện (Round 3 bị chặn).<br>2. Kiểm tra câu trả lời của AI: tuyệt đối không chứa điểm số, nhãn đúng/sai hay lời khen/chê học lực.<br>3. Kiểm tra bảo vệ prompt injection qua nội dung lập luận của sinh viên. | TO DO |
| `QA-016` | **EBA-432** | Task | `[QA-016] Cross-Role Integration, Security & Performance Load Testing` | Sprint 4 | Release | High | 5 | is blocked by Master Task EBA-427, EBA-430 | 1. Kiểm thử tải đồng thời mô phỏng nhiều sinh viên cùng truy cập làm bài tình huống.<br>2. Giám sát độ trễ API và mức tiêu hao token/chi phí gọi LLM.<br>3. Đảm bảo hệ thống phản hồi ổn định dưới tải trọng của một lớp học 40-50 sinh viên. | TO DO |
| `QA-017` | **EBA-433** | Task | `[QA-017] User Acceptance Testing (UAT) Execution & Defect Triage` | Sprint 4 | Release | Highest | 5 | is blocked by Master Task EBA-432 | 1. Thực hiện kịch bản kiểm thử chấp nhận người dùng (UAT) với các persona Giảng viên và Sinh viên.<br>2. Ghi nhận, phân loại mức độ nghiêm trọng và xử lý dứt điểm các lỗi phát hiện.<br>3. Đạt 100% tiêu chí chấp nhận người dùng của Capstone 1. | TO DO |
| `QA-018` | **EBA-434** | Task | `[QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit` | Sprint 4 | Release | High | 3 | is blocked by Master Task EBA-427 | 1. Kiểm thử điều hướng hoàn toàn bằng bàn phím (Keyboard navigation) trên Branching Player.<br>2. Kiểm tra độ tương phản màu sắc theo chuẩn WCAG 2.1 AA.<br>3. Kiểm tra khả năng tương thích hiển thị trên Chrome, Firefox và Edge. | TO DO |
| `QA-019` | **EBA-435** | Task | `[QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests` | Sprint 4 | Release | Highest | 3 | is blocked by Master Task EBA-433, EBA-434 | 1. Thực hiện bộ smoke test trên môi trường staging trước buổi bảo vệ.<br>2. Rà soát và diễn tập thành công 100% kịch bản demo trực tiếp cho hội đồng.<br>3. Xác nhận sản phẩm sẵn sàng nghiệm thu và phát hành (Release Readiness).<br>4. Xây dựng quy trình hướng dẫn sao lưu cơ sở dữ liệu dự phòng bằng pg_dump và thực hiện diễn tập khôi phục (restore rehearsal) trên môi trường thử nghiệm biệt lập (isolated environment), xác minh toàn vẹn dữ liệu sau phục hồi và lưu lại báo cáo bằng chứng; tuyệt đối không thực hiện thử nghiệm phá hủy trên cơ sở dữ liệu đang vận hành thật. | TO DO |

---

## 5. PHÂN TÍCH CRITICAL PATH & CÁC DEPENDENCY THEN CHỐT

### 5.1. Chuỗi Critical Path cốt lõi (End-to-End Dependency Chain)

```text
EBA-105 (Auth & User Registration)
        ↓
EBA-106 (Global JwtAuthGuard & Role Enforcement)
        ↓
EBA-107 (Course CRUD & Ownership Gates)
        ↓
EBA-208 (Material CRUD & Course Ownership) ──→ EBA-209 (MinIO Object Storage)
        ↓                                              ↓
EBA-210 & EBA-211 (PDF & DOCX Parsers) ───────────────┘
        ↓
EBA-212 (Recursive Document Chunking Pipeline)
        ↓
EBA-213 (Vector Embeddings via Provider Abstraction)
        ↓
EBA-214 (Document Chunks Persistence & HNSW Indexing)
        ↓
EBA-215 (Grounded Vector Retrieval with <sources>)
        ↓
EBA-310 (Pydantic Decision Tree Schema & DFS Validator)
        ↓
EBA-311 (AI Case Generation Service with Grounded Prompting)
        ↓
EBA-312 (Multi-Table Decision Tree Transactional Persistence)
        ↓
EBA-313 (Case Node & Option CRUD APIs with Topology Integrity)
        ↓
EBA-314 (Case Lifecycle State Machine: DRAFT to PUBLISHED)
        ↓
EBA-315 (Database-Level Student Access Gate: Published-Only)
        ↓
EBA-418 (Branching Attempt Initialization & Resumption)
        ↓
EBA-419 (Real-Time Option Selection & Path Traversal Persistence)
        ↓
EBA-420 (Terminal Node Completion & Outcome Recording)
        ↓
EBA-421 (Journey Review Data Assembly & Consequence Unlocking)
        ↓
EBA-427 (E2E Integration Suite: Branching Study Traversal to Review)
        ↓
EBA-432 (Cross-Role Integration, Security & Performance Load Testing)
        ↓
EBA-433 (User Acceptance Testing Execution & Defect Triage)
        ↓
EBA-435 (Final Release Readiness Verification & Production Smoke Tests)
```

### 5.2. Phân định công việc Critical vs. Parallelizable (Có thể chạy song song)

- **Critical Path (Đường găng bắt buộc)**:
  - Khởi tạo Auth/Ownership → Upload & Parsing tài liệu → Embeddings & Vector Retrieval → AI Case Generation & DFS DAG check → Persistence & Approval State Machine → Published Gate → Student Attempt → Terminal Completion → Journey Review → E2E Suite → UAT & Release Readiness.
- **Parallelizable (Các luồng có thể chạy song song khi contract đã đóng băng)**:
  - Luồng thiết kế UI/UX (`DES`): Thiết kế màn hình cho Sprint N+1 chạy song song với việc lập trình Sprint N.
  - Luồng Frontend (`FE`): Xây dựng giao diện hiển thị, Zustand store và mock client chạy song song với Backend khi đã chốt DTO/Schema.
  - Luồng Review Study (`EBA-404`, `EBA-413`, `EBA-423`, `EBA-430`): Chạy song song độc lập với luồng Branching Study vì không phụ thuộc vào cây quyết định.
  - Luồng AI Challenge Support (`EBA-406`, `EBA-416`, `EBA-425`, `EBA-431`): Chạy song song sau khi schemas và API contract đã ổn định.
  - Luồng Thống kê học tập (`EBA-417`, `EBA-426`): Triển khai song song dựa trên dữ liệu các attempt đã ghi nhận.

---

## 6. PHÂN ĐỊNH PHẠM VI (SCOPE PRIORITIZATION)

| Phân loại | Tính năng / Thành phần | Cam kết thực thi & Phương án xử lý |
|---|---|---|
| **🔴 MUST HAVE** | - Xác thực JWT & phân quyền Role-Based Access Control (RBAC).<br>- Flow 1: Upload tài liệu (PDF/DOCX), MinIO, chunking, pgvector HNSW retrieval có grounding trích dẫn nguồn `<sources>`.<br>- Flow 2: AI sinh Case Draft cây quyết định, DFS DAG cycle check, ReactFlow editor cho giảng viên, cỗ máy trạng thái phê duyệt `DRAFT → REVIEWED → APPROVED → PUBLISHED`.<br>- Cổng chặn bảo mật: Sinh viên chỉ được truy cập case `PUBLISHED`.<br>- Branching Study: Trải nghiệm liên tục (Experience-first, không lộ consequence, không bắt lập luận giữa chừng), Journey Review hồi cứu lộ trình và hiển thị hệ quả, lập luận hồi cứu, nộp phản tư, Retry tạo Attempt mới độc lập.<br>- Review Study: Chế độ phân tích mở độc lập (1 nộp bài / case, giải pháp + lập luận, nhận xét của giảng viên, phản tư).<br>- Kiểm thử tích hợp E2E, UAT và kịch bản demo bảo vệ tốt nghiệp. | Bắt buộc hoàn thành 100% vì là phạm vi cốt lõi đã cam kết trong Proposal V1.2. |
| **🟡 SHOULD HAVE** | - AI Reasoning & Challenge Support: Tối đa 1–2 vòng câu hỏi gợi mở phản biện lập luận của sinh viên, tuyệt đối không chấm điểm.<br>- Bảng điều khiển thống kê luồng học tập cơ bản (Completion rate, Selected branch, Attempts, Outcomes). | Nếu gặp áp lực thời gian, giữ Challenge Support ở mức 1 vòng câu hỏi phản biện, duy trì đầy đủ nguyên tắc không chấm điểm. |
| **🟢 OUT OF SCOPE / PHASE 2** | - Hệ thống tự động đẩy thông báo qua email/in-app (MVP chỉ hiển thị deadline trên case header; push notification thuộc Phase 2).<br>- Chấm điểm tự động bằng AI, xếp hạng sinh viên.<br>- Tích hợp hệ thống quản lý học tập (LMS), cổng thanh toán, ứng dụng di động native, diễn đàn tranh biện tự do.<br>- Soạn giáo án chung hoặc các quy trình học tập đóng gói không thuộc phương pháp case study. | Tuyệt đối không đưa vào 4 Sprint của đồ án Capstone 1. |

---

## 7. SYSTEM DEFINITION OF DONE (DoD)

Mỗi Issue / Task chỉ được chuyển sang trạng thái `DONE` khi thỏa mãn toàn bộ các điều kiện nghiệm thu hệ thống sau:

- [ ] **API Boundary**: Backend Gateway (NestJS) là cổng giao tiếp API công khai duy nhất ra bên ngoài; FastAPI AI Service là service nội bộ, không bị lộ ra internet.
- [ ] **Role & Security Gate**: Route guards và Database query bảo vệ dữ liệu nghiêm ngặt; sinh viên chỉ có thể truy cập case ở trạng thái `PUBLISHED` (các trạng thái khác trả về 403 Forbidden).
- [ ] **Grounding Invariant**: Nội dung RAG được trích xuất từ tài liệu giáo trình thực tế và bọc trong thẻ `<sources>...</sources>`.
- [ ] **Human-in-the-Loop Gate**: Mọi case study AI sinh ra bắt buộc phải qua bước kiểm duyệt, chỉnh sửa và phê duyệt của giảng viên trước khi xuất bản.
- [ ] **Experience-First Invariant**: Trong giai đoạn trải nghiệm Branching Study, tuyệt đối không hiển thị thẻ hệ quả (consequence card) và không bắt buộc nhập form lập luận giữa các bước.
- [ ] **Journey Review Invariant**: Toàn bộ hệ quả và lộ trình chỉ được mở khóa tại màn hình Journey Review sau khi sinh viên đã chạm Terminal node.
- [ ] **Retry Isolation Invariant**: Thao tác Retry tạo ra một bản ghi `branching_attempts` mới với `attempt_number` tăng dần, bảo lưu 100% dữ liệu của các lượt chơi trước.
- [ ] **Review Study Invariant**: Hoạt động độc lập hoàn toàn với cây quyết định; mỗi sinh viên có duy nhất 1 bài nộp per case; giảng viên gửi nhận xét định tính trước khi sinh viên phản tư.
- [ ] **Non-Grading Invariant**: AI Challenge Support chỉ hỗ trợ tối đa 1–2 vòng câu hỏi gợi mở phản biện; tuyệt đối không có logic hoặc trường dữ liệu nào chấm điểm hay đánh giá đỗ/trượt.
- [ ] **Test Evidence**: Mã nguồn đi kèm kiểm thử đơn vị hoặc kiểm thử tích hợp vượt qua (PASS); frontend build thành công không có lỗi type check; có test evidence được ghi nhận.

---

## 8. CHANGELOG CẬP NHẬT SPRINT BACKLOG

### Lần cập nhật: 2026-10-14 — Phase 4.0 Final Governance, UI Coverage & Jira Readiness
- **Đồng bộ 5 Nhóm Chuyên Môn & 3 Task OPS**:
  - Tách bạch 3 task hạ tầng/cơ sở dữ liệu sang nhóm `OPS`: `OPS-001` (EBA-108, Migration & Advisory Lock), `OPS-002` (EBA-209, MinIO Storage), `OPS-003` (EBA-214, pgvector HNSW Indexing).
  - Phân bổ 5 vai trò chuẩn: DES (15 tasks / 50 SP), FE (22 tasks / 86 SP), BE (25 tasks / 110 SP), OPS (3 tasks / 11 SP), QA (19 tasks / 79 SP). Tổng 84 tasks / 336 SP.
- **Chuẩn hóa Trạng thái Thực tế & Rà soát FE-002 (EBA-104)**:
  - Chuyển `FE-002` từ `DONE` sang `IN PROGRESS` nhằm thực hiện và nghiệm thu 2 tiêu chí mới: 404 Route Catch-All (`path: "*"`) và React Router Error Boundary (`errorElement`).
  - Cập nhật số liệu trạng thái toàn dự án: **6 DONE / 40 IN PROGRESS / 38 TO DO / 0 UNKNOWN**.
- **Hoàn thiện Acceptance Criteria Giao diện & Bộ lọc Pilot**:
  - `FE-002` (EBA-104): Bổ sung `CoursesPage.tsx` vào Deliverables; bổ sung AC cho 404 Catch-All và Error Boundary.
  - `FE-004` (EBA-205): Ghi rõ bộ lọc client-side cho tài liệu theo trạng thái xử lý (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) và loại tệp (`PDF`, `DOCX`) cho quy mô Pilot (<50 items).
  - `FE-007` (EBA-305): Bổ sung `CasesPage.tsx` vào Deliverables; quy định rõ phạm vi case list, lifecycle badges, empty state và modal sinh case AI.
  - `FE-019` (EBA-414): Ghi rõ bộ lọc client-side theo Learning Mode và trạng thái xét duyệt, với phép ánh xạ backend chuẩn xác (`SUBMITTED` tương ứng `PENDING_REVIEW` trên UI, `REVIEWED`, `REFLECTED`).
  - `FE-020` (EBA-415): Bổ sung `ReviewFeedbackPage.tsx` (`/student/cases/:caseId/review-study/:submissionId/feedback`) vào Deliverables.
- **Khóa tiêu chí Hạ tầng, Bảo mật & AI Reliability**:
  - `OPS-001` (EBA-108): Khóa cơ chế PostgreSQL Advisory Lock bằng cặp khóa số nguyên 32-bit `pg_advisory_lock(key1, key2)` và kiểm tra checksum SHA-256 chống sửa đổi file migration.
  - `BE-002` (EBA-106): Bổ sung In-memory Throttler kiểm soát tần suất request trên các endpoint Auth nhạy cảm.
  - `BE-005` (EBA-208): Bổ sung bắt buộc kiểm tra quyền sở hữu khóa học trên các route GET chống lỗ hổng IDOR.
  - `BE-015` & `BE-027`: Bổ sung timeout thực tế, giới hạn tối đa 3 lần gọi tổng cộng (1 lần đầu + tối đa 2 lần retry cho lỗi tạm thời 429/503/timeout), bảo đảm Idempotency và graceful failure.
  - `QA-019` (EBA-435): Bổ sung runbook `pg_dump` và yêu cầu diễn tập khôi phục (restore rehearsal) trên môi trường thử nghiệm trước khi thử nghiệm sinh viên thật.

### Lần cập nhật: 2026-10-07 — Final Business Rules & Requirement Consistency Audit
- **Audit & Chuẩn hóa Case Lifecycle (EBA-313, EBA-314)**: Tách rời thao tác lưu/sửa Node & Option khỏi chuyển đổi trạng thái; Case giữ nguyên `DRAFT` cho đến khi Lecturer thực hiện hành động Review riêng biệt; bảo toàn kiểm tra DFS cycle check trước persistence.
- **Audit & Chuẩn hóa RAG Untrusted Context (EBA-215, EBA-220)**: Bỏ tuyên bố sai lệch về thẻ `<sources>` tự chống prompt injection; chuẩn hóa thành cơ chế đánh dấu rõ tài liệu là untrusted context, prompt chỉ dẫn LLM không thực thi chỉ thị trong nguồn và cô lập truy xuất vector theo `course_id`.
- **Audit & Chuẩn hóa Non-Grading Invariant trong Review Study (EBA-415)**: Loại bỏ từ ngữ "sau khi được chấm"; chuẩn hóa thành hiển thị nhận xét định tính sau khi giảng viên phản hồi (`REVIEWED`), tuyệt đối không có chấm điểm hay xếp loại.
- **Audit & Thắt chặt Cổng Chặn Published-Only (EBA-423)**: Bổ sung ràng buộc xác thực trạng thái `PUBLISHED` cho cả bài nộp Review Study (bên cạnh Branching Study), ngăn chặn hoàn toàn việc nộp bài trên case chưa công bố.

---

## 9. HẠNG MỤC VẬN HÀNH & TÍNH NĂNG NGOÀI PHẠM VI (POST-MVP / NGOÀI 4 SPRINTS)

Để bảo vệ mục tiêu Pilot của đồ án Capstone 10 tuần và ngăn chặn rủi ro phình to phạm vi (Scope Creep), các yêu cầu hạ tầng vận hành cấp độ Enterprise SaaS và tính năng phụ trợ thương mại dưới đây được ghi nhận chính thức vào lộ trình **Post-MVP (Phase 2)** và **tuyệt đối không đưa vào 4 Sprints hiện tại**:

1. **Khả năng quan sát phân tán nâng cao (Distributed Tracing & Full APM)**:
   - Tích hợp OpenTelemetry / Jaeger để trace chi tiết từng span qua các tầng micro-service.
   - Triển khai Prometheus và Grafana theo dõi 4 golden signals (Latency, Traffic, Errors, Saturation).
   - *Phạm vi Pilot hiện tại*: Đã được đáp ứng đầy đủ qua `/api/v1/health` (liveness/readiness probe) và structured NestJS/FastAPI console logging.
2. **Sao lưu dữ liệu tự động theo thời điểm (PITR - Point-In-Time Recovery)**:
   - Hạ tầng backup tự động streaming WAL sang Cloud Object Storage với khả năng khôi phục bất kỳ thời điểm nào.
   - *Phạm vi Pilot hiện tại*: Xây dựng runbook sao lưu thủ công với `pg_dump` và thực hiện 1 lần kiểm thử khôi phục (restore rehearsal) trên môi trường thử nghiệm biệt lập theo tiêu chuẩn của `QA-019` trước khi chạy thử nghiệm với sinh viên thật.
3. **Kiểm soát lạm dụng & Rate Limiting chuyên sâu đa tầng**:
   - Tích hợp Redis-backed distributed rate limiter, chống DDoS cấp mạng / Gateway CDN (Cloudflare).
   - *Phạm vi Pilot hiện tại*: Đã được quy định kiểm soát lạm dụng tối thiểu (In-memory Throttler) trên các route Auth nhạy cảm trong `BE-002`.
4. **Hạ tầng Chịu lỗi Đa vùng & Tự phục hồi tự động (Multi-Region HA & Circuit Breaker Mesh)**:
   - Tự động chuyển vùng dữ liệu đa trung tâm (Active-Active Database Cluster) và Service Mesh Circuit Breaker (Envoy / Istio).
   - *Phạm vi Pilot hiện tại*: Triển khai timeout có thể cấu hình linh hoạt tại AI client dùng chung (`AiClientService`) và bắt ngoại lệ graceful fallback trong `BE-015` và `BE-027`.
5. **Phân trang phía máy chủ & Tìm kiếm văn bản nâng cao (Server-Side Pagination & Text Search)**:
   - Phân trang SQL (`LIMIT`/`OFFSET` hoặc Cursor-based) kết hợp công cụ tìm kiếm toàn văn bản (Elasticsearch/OpenSearch).
   - *Phạm vi Pilot hiện tại*: Với quy mô Pilot học phần (<50 tài liệu/khóa học, <100 bài nộp/kỳ), áp dụng triệt để Client-Side Filtering (lọc theo trạng thái xử lý/MIME ở `FE-004` và lọc theo trạng thái/chế độ học ở `FE-019`) đem lại phản hồi tức thì và không làm phức tạp hóa kiến trúc.
6. **Tiện ích tài khoản thương mại & Thông báo đẩy (Password Reset, Change Password, OAuth/SSO, Push Notifications)**:
   - Quy trình khôi phục mật khẩu qua email SMTP, đổi mật khẩu, xác thực mạng xã hội/Google OAuth, và hệ thống thông báo đẩy thời gian thực (WebSockets/Push).
   - *Phạm vi Pilot hiện tại*: Giữ nguyên ngoài phạm vi 4 Sprint để tập trung 100% năng lực vào trải nghiệm rẽ nhánh tình huống đại học và đối thoại phản biện Socratic.

---

## 10. NGUYÊN TẮC QUẢN TRỊ TAM PHÂN BẮT BUỘC (TRI-LEVEL VERIFICATION PRINCIPLE)

Xuyên suốt quá trình phát triển 4 Sprints của EduBranch AI, toàn bộ đội ngũ và AI Assistant bắt buộc phải tuân thủ nghiêm ngặt nguyên tắc tam phân:

```text
Acceptance Criteria (Đặc tả)  ≠  Implementation (Mã nguồn)  ≠  Verified Evidence (Bằng chứng kiểm chứng)
```

1. **Acceptance Criteria (AC)**: Tiêu chuẩn nghiệm thu được quy định trong tài liệu này và `03_TASK-DETAILS.md`. Việc bổ sung hay hoàn thiện AC chỉ phản ánh mục tiêu thiết kế và điều kiện bàn giao, **tuyệt đối không tự chứng minh rằng mã nguồn đã đáp ứng**.
2. **Implementation (Code)**: Mã nguồn được lập trình trong NestJS, React 19 hoặc FastAPI. Việc code đã tồn tại **chưa đồng nghĩa với việc tính năng chạy đúng mọi trường hợp biên, bảo mật và sẵn sàng**.
3. **Verified Evidence (Test)**: Bằng chứng xác thực độc lập thông qua Unit Test (Jest/pytest), HTTP E2E Security Test (Supertest) hoặc biên bản kiểm thử thực tế. **Một task chỉ được phép chuyển sang trạng thái DONE trên Jira khi có đầy đủ Verified Evidence tương ứng**.
