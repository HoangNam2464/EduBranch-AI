# EduBranch AI — Jira-Ready Backlog (Corrected)

**Source:** `SPRINT-BACKLOG.md`

**Description rule:** Source has no separate Description field. For every task: `Description: Không có trường Description riêng trong source.` Acceptance Criteria remains a separate field.

## 1. SPRINT & ROLE OVERVIEW

### 1.1. Sprint Distribution

| Sprint | Tên Sprint | Timeline | Task Count | Story Points | Sprint Goal |
|---|---|---|---:|---:|---|
| Sprint 1 | Sprint 1 - Foundation | 07/10/2026 – 20/10/2026 | 10 | 42 | Ổn định Auth, Role, Ownership, shared UX states và đóng băng FE/BE API contracts. |
| Sprint 2 | Sprint 2 - Material & RAG | 21/10/2026 – 03/11/2026 | 20 | 75 | Hoàn thiện pipeline upload tài liệu → MinIO → parsing → chunking → embedding → grounded retrieval. |
| Sprint 3 | Sprint 3 - Case & Approval | 04/11/2026 – 17/11/2026 | 19 | 81 | Tạo case draft từ grounded context và hoàn thiện quy trình giảng viên kiểm duyệt, phê duyệt và xuất bản. |
| Sprint 4 | Sprint 4 - Learning & Review | 18/11/2026 – 15/12/2026 | 35 | 138 | Hoàn thiện Student learning experience với Branching Study experience-first và Review Study độc lập; giai đoạn cuối tập trung tích hợp hệ thống, UAT, bug fixing, demo và release readiness. |
| **Total** | **4 Sprints** | **10 tuần** | **84** | **336** | **Hoàn thành toàn diện nền tảng EduBranch AI** |

### 1.2. Role Distribution (5 Chuyên Môn)

| Role | Tên chuyên môn | Tasks | Story Points | Dải Group ID |
|:---:|---|:---:|:---:|:---:|
| **DES** | UI/UX Design & Prototyping (Figma) | 15 | 50 | `DES-001` → `DES-015` |
| **FE** | Frontend Web Application (React 19) | 22 | 86 | `FE-001` → `FE-022` |
| **BE** | Backend & AI Service (NestJS & FastAPI) | 25 | 110 | `BE-001` → `BE-028` (25 tasks) |
| **OPS** | DevOps, MinIO Storage & Vector HNSW | 3 | 11 | `OPS-001` → `OPS-003` |
| **QA** | Testing, Security & Quality Assurance | 19 | 79 | `QA-001` → `QA-019` |
| **Total** | **5 Nhóm chuyên môn** | **84** | **336** | **84 Tasks chuẩn hóa** |

# 2. SPRINT 1 TASKS — SPRINT 1 - FOUNDATION

Timeline: 07/10/2026 – 20/10/2026
Sprint Goal: Ổn định Auth, Role, Ownership, shared UX states và đóng băng FE/BE API contracts.
Task Count: 10
Story Points: 42

## Task

Master Task ID: **EBA-101**
Group ID: DES-001
Summary: [DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes
Issue Type: Task
Role: DES
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 3
Dependency: None

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Tách rõ Lecturer Portal và Student Portal.
2. Có navigation riêng cho Branching Study và Review Study.
3. Được FE/BE review và phê duyệt.

Status: DONE

## Task

Master Task ID: **EBA-102**
Group ID: DES-002
Summary: [DES-002] Shared Design States: Loading, Empty, Error & Permissions
Issue Type: Task
Role: DES
Sprint: Sprint 1
Flow: Foundation
Priority: High
Story Points: 5
Dependency: is blocked by EBA-101

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế đầy đủ loading, empty, error, 403 và processing states.
2. Token màu sắc, typography dùng thống nhất theo Design System.

Status: DONE

## Task

Master Task ID: **EBA-103**
Group ID: FE-001
Summary: [FE-001] Harden authStore, API Client, Route Guards & Session Expiration
Issue Type: Task
Role: FE
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-101

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. authStore khôi phục session an toàn qua persist middleware.
2. apiClient tự động intercept 401 và gọi refresh token hoặc logout.
3. PrivateRoute chặn truy cập chéo giữa STUDENT và LECTURER.

Status: DONE

## Task

Master Task ID: **EBA-104**
Group ID: FE-002
Summary: [FE-002] Align Login, Register & Portal Layouts with Permission Matrix
Issue Type: Task
Role: FE
Sprint: Sprint 1
Flow: Foundation
Priority: High
Story Points: 3
Dependency: is blocked by EBA-102, EBA-103

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Form validation và submitting states đầy đủ trên LoginPage và RegisterPage.
2. Portal layouts (LecturerLayout, StudentLayout) render đúng vai trò.
3. Sinh viên không thấy các nút tác vụ của giảng viên.

Status: DONE

## Task

Master Task ID: **EBA-105**
Group ID: BE-001
Summary: [BE-001] Implement User Registration, Login & JWT Token Management
Issue Type: Task
Role: BE
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 5
Dependency: None

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API POST /api/v1/auth/register mã hóa BCrypt (12 rounds) và lưu trữ user role.
2. API POST /api/v1/auth/login xác thực credentials và cấp JWT access token (8h).
3. API GET /api/v1/auth/me trả về profile của người dùng đang đăng nhập.

Status: DONE

## Task

Master Task ID: **EBA-106**
Group ID: BE-002
Summary: [BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard
Issue Type: Task
Role: BE
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-105

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. JwtAuthGuard bảo vệ toàn bộ route mặc định.
2. Decorator @Public() cho phép bỏ qua xác thực trên các route công khai.
3. Đóng gói RolesGuard và decorator @Roles() kiểm tra role thay thế kiểm tra thủ công.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-107**
Group ID: BE-003
Summary: [BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates
Issue Type: Task
Role: BE
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-105, EBA-106

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. CRUD API cho Course (/api/v1/courses) kiểm tra chính xác quyền sở hữu của lecturer_id.
2. Không có fallback user/course giả lập trong logic production.
3. Giảng viên chỉ xem và quản lý các khóa học do chính mình tạo.

Status: DONE

## Task

Master Task ID: **EBA-108**
Group ID: OPS-001
Summary: [OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks
Issue Type: Task
Role: OPS
Sprint: Sprint 1
Flow: Foundation
Priority: High
Story Points: 3
Dependency: None

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Migration chạy mượt mà trên PostgreSQL 16 và kích hoạt extension pgvector.
2. Health check endpoint (/api/v1/health) kiểm tra DB và Redis.
3. Server dừng khởi động và báo lỗi nếu thiếu các biến môi trường bắt buộc (.env).

Status: DONE

## Task

Master Task ID: **EBA-109**
Group ID: QA-001
Summary: [QA-001] Test Matrix for Auth, Course & Permissions
Issue Type: Task
Role: QA
Sprint: Sprint 1
Flow: Foundation
Priority: High
Story Points: 3
Dependency: is blocked by EBA-105, EBA-107

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Ma trận kiểm thử bao phủ toàn bộ Auth, Role RBAC và Course Ownership.
2. Có case positive và negative cho cả hai role LECTURER và STUDENT.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-110**
Group ID: QA-002
Summary: [QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite
Issue Type: Task
Role: QA
Sprint: Sprint 1
Flow: Foundation
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-103, EBA-106, EBA-107

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Token hết hạn hoặc sai chữ ký bị chặn lập tức với HTTP 401.
2. Truy cập tài nguyên của user khác bị từ chối với HTTP 403.
3. Có test evidence và log kiểm thử tự động.

Status: TO DO


# 3. SPRINT 2 TASKS — SPRINT 2 - MATERIAL & RAG

Timeline: 21/10/2026 – 03/11/2026
Sprint Goal: Hoàn thiện pipeline upload tài liệu → MinIO → parsing → chunking → embedding → grounded retrieval.
Task Count: 20
Story Points: 75

## Task

Master Task ID: **EBA-201**
Group ID: DES-003
Summary: [DES-003] Material Library & Upload Interaction Flow Design
Issue Type: Task
Role: DES
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-102

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế modal tải lên tài liệu hỗ trợ Drag-and-Drop cho định dạng PDF và DOCX.
2. Thiết kế bảng danh sách tài liệu hiển thị metadata và thanh tìm kiếm/lọc.

Status: TO DO

## Task

Master Task ID: **EBA-202**
Group ID: DES-004
Summary: [DES-004] Material Processing, Progress Bar & Failure Recovery States
Issue Type: Task
Role: DES
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 3
Dependency: is blocked by EBA-201

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế các trạng thái tiến độ: Pending, Processing (Parsing/Embedding), Completed, Failed.
2. Thiết kế thông báo lỗi và nút bấm Retry khi xử lý tài liệu thất bại.

Status: TO DO

## Task

Master Task ID: **EBA-203**
Group ID: DES-005
Summary: [DES-005] RAG Grounding Evidence & Source Inspection UI Design
Issue Type: Task
Role: DES
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 3
Dependency: is blocked by EBA-201

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế modal/drawer hiển thị các đoạn văn bản trích dẫn nguồn (evidence chunks) đã retrieval.
2. Tuyệt đối không để lộ thông tin nhạy cảm (API keys, system prompt, internal ID).

Status: TO DO

## Task

Master Task ID: **EBA-204**
Group ID: FE-003
Summary: [FE-003] Implement Material Upload Modal with Client-Side Validation
Issue Type: Story
Role: FE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-201, EBA-107

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Hỗ trợ chọn hoặc kéo thả tệp định dạng .pdf hoặc .docx.
2. Validate kích thước tệp tối đa 50MB và MIME type ngay tại client trước khi upload.
3. Hiển thị thanh phần trăm tiến độ upload khi gửi tới API.

Status: TO DO

## Task

Master Task ID: **EBA-205**
Group ID: FE-004
Summary: [FE-004] Implement Materials Table with Metadata & Processing Status Indicators
Issue Type: Story
Role: FE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-202, EBA-204

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Hiển thị danh sách tài liệu của khóa học với tên file, kích thước, ngày tải lên.
2. Hiển thị badge trạng thái động (Pending, Processing, Completed, Failed) theo processing_status.
3. Tự động polling hoặc cập nhật trạng thái khi tài liệu đang xử lý.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-206**
Group ID: FE-005
Summary: [FE-005] Implement Material Delete & Failure Retry Actions with API Integration
Issue Type: Task
Role: FE
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 3
Dependency: is blocked by EBA-205

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kết nối nút xóa tài liệu với API DELETE /api/v1/courses/:courseId/materials/:id kèm dialog xác nhận.
2. Cung cấp nút Retry gọi API xử lý lại đối với tài liệu có trạng thái FAILED.
3. Hiển thị thông báo toast thành công hoặc lỗi tương ứng.

Status: TO DO

## Task

Master Task ID: **EBA-207**
Group ID: FE-006
Summary: [FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence
Issue Type: Task
Role: FE
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 3
Dependency: is blocked by EBA-203

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Hiển thị modal xem chi tiết các chunk văn bản trích dẫn kèm số trang/chỉ số đoạn.
2. Cho phép giảng viên đối chiếu nguồn tài liệu gốc khi chuẩn bị tạo case study.

Status: TO DO

## Task

Master Task ID: **EBA-208**
Group ID: BE-005
Summary: [BE-005] Implement Material CRUD & Ownership Authorization Gates
Issue Type: Story
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-107

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Quản lý bản ghi trong teaching_materials (tên, dung lượng, MIME type, status).
2. Kiểm tra quyền sở hữu của Course tại Backend Gateway; chỉ owner mới được upload/xóa.
3. Trả về đúng mã lỗi 403 nếu truy cập tài liệu khóa học của giảng viên khác.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-209**
Group ID: OPS-002
Summary: [OPS-002] Implement MinIO Storage Service with Secure Object Key Naming
Issue Type: Task
Role: OPS
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-208

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Lưu trữ file an toàn trong bucket edubranch-materials trên MinIO.
2. Sử dụng object key dạng UUID không thể đoán trước (non-guessable keys).
3. Hỗ trợ streaming file upload và dọn dẹp file an toàn khi bị xóa.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-210**
Group ID: BE-007
Summary: [BE-007] Implement PDF Document Parser with Text Extraction & Normalization
Issue Type: Task
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-209

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Trích xuất văn bản từ tệp PDF nhiều trang tại ai-service/app/ingestion/parser.py.
2. Làm sạch khoảng trắng thừa, ký tự điều khiển và chuẩn hóa định dạng UTF-8.
3. Bắt ngoại lệ và gán trạng thái FAILED nếu file PDF bị hỏng hoặc mã hóa mật khẩu.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-211**
Group ID: BE-008
Summary: [BE-008] Implement DOCX Document Parser with Text Extraction & Normalization
Issue Type: Task
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-209

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Trích xuất văn bản từ tệp DOCX qua python-docx tại app/ingestion/parser.py.
2. Giữ nguyên cấu trúc phân đoạn văn bản và tiêu đề.
3. Bắt lỗi đối với định dạng docx rỗng hoặc không hợp lệ.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-212**
Group ID: BE-009
Summary: [BE-009] Implement Recursive Document Chunking Pipeline
Issue Type: Task
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-210, EBA-211

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Chia nhỏ văn bản thành các chunk kích thước 500-1000 tokens với overlap 100 tokens.
2. Bảo toàn ranh giới câu và đoạn văn qua RecursiveCharacterTextSplitter.
3. Gắn chỉ số tuần tự chunk_index và metadata tài liệu cho từng chunk.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-213**
Group ID: BE-010
Summary: [BE-010] Implement Vector Embedding Generation via Provider Abstraction
Issue Type: Task
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-212

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Sinh vector embeddings qua Gemini text-embedding-004 (768-dim) hoặc OpenAI (1536-dim).
2. Gọi mô hình thông qua Provider Abstraction Interface.
3. Xử lý batching embeddings để tối ưu hóa thời gian và tránh rate limit.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-214**
Group ID: OPS-003
Summary: [OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing
Issue Type: Task
Role: OPS
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-213

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Lưu trữ các chunk và vector vào bảng document_chunks trong PostgreSQL.
2. Xây dựng và duy trì chỉ mục HNSW vector_cosine_ops để tìm kiếm tương đồng nhanh.
3. Đảm bảo ràng buộc khóa ngoại và CASCADE khi tài liệu bị xóa.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-215**
Group ID: BE-012
Summary: [BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping
Issue Type: Task
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-214

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API POST /internal/v1/retrieval/query tìm kiếm vector tương đồng cosine.
2. Lọc bắt buộc theo course_id để cô lập dữ liệu theo quyền sở hữu khóa học.
3. Đánh dấu rõ nội dung tài liệu trích xuất là untrusted context bên trong khối <sources>...</sources> để LLM phân biệt với system instruction.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-216**
Group ID: BE-013
Summary: [BE-013] Fix Material Controller Spec Mock Data for Ownership Regression
Issue Type: Bug
Role: BE
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 2
Dependency: is blocked by EBA-208

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Cập nhật mock dữ liệu trong material.controller.spec.ts để khớp đúng lecturer_id người tạo.
2. Đảm bảo toàn bộ 4 test suite trong backend chạy vượt qua (PASS).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-217**
Group ID: QA-003
Summary: [QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds
Issue Type: Task
Role: QA
Sprint: Sprint 2
Flow: Flow 1
Priority: High
Story Points: 3
Dependency: is blocked by EBA-204, EBA-208

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử thành công upload file PDF và DOCX hợp lệ.
2. Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB.
3. Kiểm thử xử lý lỗi mạng và hiển thị trạng thái retry.

Status: TO DO

## Task

Master Task ID: **EBA-218**
Group ID: QA-004
Summary: [QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation
Issue Type: Task
Role: QA
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-208, EBA-209

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử Lecturer B không thể đọc, tải hoặc xóa tài liệu của Lecturer A.
2. Kiểm thử không thể đoán được URL/key tài liệu trên MinIO.
3. Kiểm thử tính toàn vẹn khi xóa khóa học thì tài liệu liên quan bị xóa an toàn.

Status: TO DO

## Task

Master Task ID: **EBA-219**
Group ID: QA-005
Summary: [QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)
Issue Type: Task
Role: QA
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-214

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử tự động xuyên suốt: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector.
2. Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt.

Status: TO DO

## Task

Master Task ID: **EBA-220**
Group ID: QA-006
Summary: [QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing
Issue Type: Task
Role: QA
Sprint: Sprint 2
Flow: Flow 1
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-215

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử độ chính xác truy xuất RAG theo cosine similarity.
2. Kiểm thử cô lập dữ liệu nghiêm ngặt giữa các course_id.
3. Kiểm thử ranh giới ngữ cảnh untrusted trong <sources>: đảm bảo generation prompt chỉ dẫn LLM coi tài liệu là tham khảo thuần túy và không thực thi chỉ thị độc hại bên trong nguồn.

Status: TO DO


# 4. SPRINT 3 TASKS — SPRINT 3 - CASE & APPROVAL

Timeline: 04/11/2026 – 17/11/2026
Sprint Goal: Tạo case draft từ grounded context và hoàn thiện quy trình giảng viên kiểm duyệt, phê duyệt và xuất bản.
Task Count: 19
Story Points: 81

## Task

Master Task ID: **EBA-301**
Group ID: DES-006
Summary: [DES-006] Case Generation Modal & Parameter Configuration Flow Design
Issue Type: Task
Role: DES
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-203

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế picker chọn tài liệu tham khảo trong khóa học.
2. Thiết kế trường nhập chủ đề gợi ý (topic hint), số lượng node mong muốn và chọn chế độ học.
3. Thiết kế trạng thái spinner đang tạo case kèm thông báo tiến độ.

Status: TO DO

## Task

Master Task ID: **EBA-302**
Group ID: DES-007
Summary: [DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design
Issue Type: Task
Role: DES
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-301

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế trực quan sơ đồ cây trên canvas ReactFlow (Root node, Decision node, Terminal node).
2. Thiết kế màu sắc, icon phân biệt các nhánh và đường nối (edges) thể hiện lựa chọn.
3. Hỗ trợ thao tác zoom, pan và căn chỉnh tự động cây quyết định.

Status: TO DO

## Task

Master Task ID: **EBA-303**
Group ID: DES-008
Summary: [DES-008] Side-by-Side Node & Option Form Editor UX Design
Issue Type: Task
Role: DES
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-302

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế drawer/panel bên phải để xem và chỉnh sửa chi tiết từng node khi click trên canvas.
2. Thiết kế các trường chỉnh sửa: Situation text, Option text, Consequence explanation.
3. Thiết kế nút lưu thay đổi và hiển thị tức thì trên sơ đồ cây.

Status: TO DO

## Task

Master Task ID: **EBA-304**
Group ID: DES-009
Summary: [DES-009] Case Governance Lifecycle Action Bar & Approval Status Design
Issue Type: Task
Role: DES
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-302

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế thanh công cụ hiển thị trạng thái hiện tại (DRAFT, REVIEWED, APPROVED, PUBLISHED).
2. Thiết kế các nút hành động chuyển trạng thái có điều kiện (Mark as Reviewed, Approve, Publish).
3. Thiết kế hộp thoại xác nhận xuất bản kèm link chia sẻ cho sinh viên.

Status: TO DO

## Task

Master Task ID: **EBA-305**
Group ID: FE-007
Summary: [FE-007] Implement Case Generation Trigger Modal & Progress Tracking
Issue Type: Story
Role: FE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-301, EBA-205

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Modal chọn tài liệu giảng dạy và cấu hình tham số sinh case.
2. Gọi API POST /api/v1/courses/:courseId/cases/generate và hiển thị loading state.
3. Điều hướng mượt mà sang trang CaseReviewPage khi bản nháp DRAFT được tạo thành công.

Status: TO DO

## Task

Master Task ID: **EBA-306**
Group ID: FE-008
Summary: [FE-008] Implement ReactFlow Decision Tree Visual Canvas Component
Issue Type: Story
Role: FE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-302, EBA-305

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Tích hợp ReactFlow hiển thị topo cây quyết định với custom nodes và edges.
2. Đánh dấu nổi bật Root Node và các Terminal Nodes.
3. Xử lý sự kiện click vào node để kích hoạt form chỉnh sửa chi tiết.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-307**
Group ID: FE-009
Summary: [FE-009] Implement Interactive Node, Option & Consequence Editor Form
Issue Type: Story
Role: FE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-303, EBA-306

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Form cho phép giảng viên biên tập tình huống (situation), nội dung phương án và hệ quả.
2. Gọi API PUT /api/v1/cases/:id/nodes/:nodeId để lưu thay đổi.
3. Cập nhật ngay nhãn trên canvas sau khi lưu mà không cần reload trang.

Status: TO DO

## Task

Master Task ID: **EBA-308**
Group ID: FE-010
Summary: [FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)
Issue Type: Story
Role: FE
Sprint: Sprint 3
Flow: Flow 2
Priority: High
Story Points: 5
Dependency: is blocked by EBA-307

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Cho phép thêm phương án lựa chọn mới cho một node.
2. Cho phép kéo thả nối cạnh (edge) sang node mục tiêu tiếp theo hoặc tạo node mới.
3. Chặn các thao tác tạo chu trình hoặc ngắt kết nối khỏi Root Node.

Status: TO DO

## Task

Master Task ID: **EBA-309**
Group ID: FE-011
Summary: [FE-011] Implement Case Approval State Transition Workflow UI
Issue Type: Story
Role: FE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-304, EBA-307

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Giao diện chuyển đổi trạng thái: DRAFT → REVIEWED → APPROVED → PUBLISHED.
2. Ẩn nút Publish nếu cây chưa có ít nhất 1 Terminal node hoặc Root node không hợp lệ.
3. Khi PUBLISHED, hiển thị modal sao chép đường link trực tiếp cấp cho sinh viên.

Status: TO DO

## Task

Master Task ID: **EBA-310**
Group ID: BE-014
Summary: [BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator
Issue Type: Task
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-215

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Định nghĩa CaseGenerationOutput, CaseNode, CaseOption Pydantic schemas tại app/generation/schemas/decision_tree.py.
2. Thuật toán DFS 3 màu phát hiện và từ chối tuyệt đối cây có chu trình (cycles).
3. Xác thực không có nút mồ côi (unreachable nodes) và có ít nhất 1 terminal path.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-311**
Group ID: BE-015
Summary: [BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting
Issue Type: Task
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-310

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Xây dựng prompt có cấu trúc tích hợp ngữ cảnh RAG từ <sources> tài liệu của giảng viên.
2. Yêu cầu LLM trả về Structured Output JSON tuân thủ đúng schema cây quyết định.
3. Tự động retry gọi LLM nếu kết quả sinh ra vi phạm ràng buộc đồ thị.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-312**
Group ID: BE-016
Summary: [BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback
Issue Type: Story
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-311

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Lưu bản nháp vào cases, case_nodes, case_options trong 1 Database Transaction duy nhất.
2. Ánh xạ chính xác node_index tạm thời sang UUID và cập nhật root_node_id.
3. Thực hiện ROLLBACK ngay lập tức nếu bất kỳ bước lưu node/option nào thất bại.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-313**
Group ID: BE-017
Summary: [BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check
Issue Type: Story
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-312

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API PUT /api/v1/cases/:id/nodes/:nodeId cập nhật tình huống và danh sách options mà không tự ý thay đổi lifecycle state của case.
2. Kiểm tra tính toàn vẹn tô pô (DFS cycle check) trước khi persistence để đảm bảo không tạo chu trình.
3. Case giữ nguyên trạng thái DRAFT cho đến khi giảng viên thực hiện action Review riêng biệt (do EBA-314 quản lý).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-314**
Group ID: BE-018
Summary: [BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)
Issue Type: Story
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-313

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API PATCH /api/v1/cases/:id/status thực thi cỗ máy trạng thái DRAFT → REVIEWED → APPROVED → PUBLISHED.
2. Ngăn chặn các bước nhảy trạng thái trái phép (ví dụ DRAFT nhảy thẳng lên PUBLISHED).
3. Chỉ giảng viên sở hữu khóa học mới có quyền thực hiện chuyển đổi trạng thái.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-315**
Group ID: BE-019
Summary: [BE-019] Implement Database-Level Student Access Gate for Published-Only Cases
Issue Type: Task
Role: BE
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-314

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Query kiểm tra trạng thái case ở tầng DB: sinh viên chỉ được đọc case khi status = 'PUBLISHED'.
2. Mọi truy vấn case DRAFT, REVIEWED, APPROVED từ role STUDENT đều bị chặn với HTTP 403.
3. Loại bỏ hoàn toàn nguy cơ rò rỉ đề bài chưa duyệt qua API.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-316**
Group ID: QA-007
Summary: [QA-007] Contract & Schema Validation Tests for AI Case Generation Output
Issue Type: Task
Role: QA
Sprint: Sprint 3
Flow: Flow 2
Priority: High
Story Points: 3
Dependency: is blocked by EBA-310, EBA-311

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử định dạng JSON sinh ra từ AI Service với các bộ dữ liệu tài liệu mẫu.
2. Kiểm thử khả năng phục hồi và từ chối khi mô hình trả về JSON sai cấu trúc.

Status: TO DO

## Task

Master Task ID: **EBA-317**
Group ID: QA-008
Summary: [QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants
Issue Type: Task
Role: QA
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-310, EBA-313

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử phát hiện chu trình (cycle detection) với các ca kiểm thử đồ thị phức tạp.
2. Kiểm thử phát hiện nút mồ côi (orphan nodes) và thiếu đường đi đến terminal node.
3. Kiểm thử tính bất biến của cây quyết định khi chỉnh sửa qua API.

Status: TO DO

## Task

Master Task ID: **EBA-318**
Group ID: QA-009
Summary: [QA-009] State Machine & Lifecycle Transition Boundary Test Suite
Issue Type: Task
Role: QA
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-314

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử các bước chuyển trạng thái hợp lệ từ DRAFT đến PUBLISHED.
2. Kiểm thử từ chối các bước chuyển không hợp lệ (nhảy cóc trạng thái).
3. Kiểm thử phân quyền: tài khoản không sở hữu không thể duyệt case.

Status: TO DO

## Task

Master Task ID: **EBA-319**
Group ID: QA-010
Summary: [QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases
Issue Type: Task
Role: QA
Sprint: Sprint 3
Flow: Flow 2
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-315

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử tự động sinh viên truy cập trực tiếp ID case ở trạng thái DRAFT, REVIEWED, APPROVED nhận 403.
2. Kiểm thử sinh viên truy cập thành công ngay khi trạng thái chuyển sang PUBLISHED.

Status: TO DO


# 5. SPRINT 4 TASKS — SPRINT 4 - LEARNING & REVIEW

Timeline: 18/11/2026 – 15/12/2026
Sprint Goal: Hoàn thiện Student learning experience với Branching Study experience-first và Review Study độc lập; giai đoạn cuối tập trung tích hợp hệ thống, UAT, bug fixing, demo và release readiness.
Task Count: 35
Story Points: 138

## Task

Master Task ID: **EBA-401**
Group ID: DES-010
Summary: [DES-010] Branching Case Player Experience-First UI/UX Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-309

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế màn hình ra quyết định tập trung, không phân tâm.
2. Tuyệt đối không hiển thị thẻ hệ quả (consequence card) giữa chừng.
3. Tuyệt đối không có form bắt buộc nhập lập luận (reasoning form) giữa các bước.

Status: TO DO

## Task

Master Task ID: **EBA-402**
Group ID: DES-011
Summary: [DES-011] Journey Review Path Visualization & Consequence Reveal Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-401

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế lộ trình toàn bộ các bước đã đi qua theo thứ tự thời gian.
2. Mở khóa và hiển thị đầy đủ văn bản hệ quả (consequences) lần đầu tiên tại màn hình Review.
3. Thiết kế form nhập lập luận hồi cứu (retrospective reasoning) cho các quyết định then chốt.

Status: TO DO

## Task

Master Task ID: **EBA-403**
Group ID: DES-012
Summary: [DES-012] Retry & New Attempt Initiation UX Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Branching Study
Priority: High
Story Points: 2
Dependency: is blocked by EBA-402

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế nút và modal Retry bắt đầu lượt chơi mới.
2. Truyền đạt rõ ràng việc lượt chơi cũ được bảo lưu trọn vẹn và không bị ghi đè.

Status: TO DO

## Task

Master Task ID: **EBA-404**
Group ID: DES-013
Summary: [DES-013] Review Study Open Analysis & Solution Proposal UI Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 3
Dependency: is blocked by EBA-102

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế giao diện hiển thị ngữ cảnh & dữ liệu thực tế (context) và bài toán mở (problem).
2. Thiết kế form nhập phân tích, đề xuất giải pháp và giải thích lập luận.
3. Không sử dụng cây quyết định hay câu hỏi trắc nghiệm đúng/sai.

Status: TO DO

## Task

Master Task ID: **EBA-405**
Group ID: DES-014
Summary: [DES-014] Lecturer Qualitative Feedback & Review Dashboard Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 3
Dependency: is blocked by EBA-404

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế dashboard cho giảng viên xem các bài nộp của sinh viên (cả Branching và Review Study).
2. Thiết kế khung soạn thảo nhận xét định tính (qualitative feedback).
3. Thiết kế giao diện cho sinh viên đọc nhận xét và viết bài phản tư (reflection).

Status: TO DO

## Task

Master Task ID: **EBA-406**
Group ID: DES-015
Summary: [DES-015] AI Challenge Support Socratic Interaction UI Design
Issue Type: Task
Role: DES
Sprint: Sprint 4
Flow: Challenge Support
Priority: High
Story Points: 3
Dependency: is blocked by EBA-402, EBA-404

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thiết kế giao diện hội thoại câu hỏi gợi mở phản biện của AI (tối đa 2 vòng).
2. Hiển thị rõ ranh giới: AI chỉ đặt câu hỏi chất vấn giả định, tuyệt đối không chấm điểm.
3. Thiết kế thanh tiến trình 2 vòng rõ ràng.

Status: TO DO

## Task

Master Task ID: **EBA-407**
Group ID: FE-012
Summary: [FE-012] Implement Continuous Branching Case Player Component
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-401, EBA-309

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Hiển thị tình huống hiện tại và các phương án lựa chọn.
2. Khi sinh viên bấm chọn phương án, chuyển mượt mà ngay lập tức sang tình huống tiếp theo.
3. Tuyệt đối không ngắt quãng bởi thẻ hệ quả hay form lập luận giữa chừng.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-408**
Group ID: FE-013
Summary: [FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-407

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Nhận biết khi sinh viên chạm nút kết thúc (is_terminal = true).
2. Gọi API hoàn thành attempt và tự động chuyển hướng sang /student/cases/:caseId/review.
3. Ngăn chặn sinh viên đi tiếp khi đã đạt nút kết thúc.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-409**
Group ID: FE-014
Summary: [FE-014] Implement Journey Review Replay Canvas with Consequence Reveal
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-402, EBA-408

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Tái hiện lại danh sách toàn bộ các quyết định đã chọn theo đúng trình tự thời gian.
2. Hiển thị các phương án thay thế chưa chọn.
3. Tiết lộ văn bản hệ quả (consequences) của từng lựa chọn đã đưa ra.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-410**
Group ID: FE-015
Summary: [FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-409

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Cung cấp ô nhập lập luận hồi cứu tại từng điểm quyết định trên trang Review.
2. Lập luận là tùy chọn (không bắt buộc nhập mọi node, khuyến khích node bước ngoặt).
3. Lưu lập luận hồi cứu an toàn về backend qua API.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-411**
Group ID: FE-016
Summary: [FE-016] Implement Retry Action Generating New Independent Branching Attempt
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: High
Story Points: 3
Dependency: is blocked by EBA-409

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Nút Retry kích hoạt API tạo một lượt chơi mới với attempt_number tăng thêm 1.
2. Đưa sinh viên về Root Node của case để trải nghiệm hướng đi mới.
3. Lưu trữ đầy đủ lịch sử các lượt chơi trước trong Zustand store / API history.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-412**
Group ID: FE-017
Summary: [FE-017] Implement Post-Review Overall Reflection Submission Page
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-410

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Màn hình cho phép sinh viên viết bài phản tư tổng thể (Reflection) sau khi hoàn tất Review.
2. Gọi API nộp bài phản tư và cập nhật trạng thái reflection_status = 'SUBMITTED'.
3. Khóa chỉnh sửa bài phản tư sau khi đã nộp thành công.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-413**
Group ID: FE-018
Summary: [FE-018] Implement Review Study Independent Analysis & Submission Page
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 5
Dependency: is blocked by EBA-404

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Hiển thị bối cảnh thực tế (context_text) và vấn đề mở (problem_text).
2. Form nhập bài phân tích, giải pháp đề xuất và giải thích lập luận.
3. Gọi API nộp bài và quản lý trạng thái SUBMITTED (mỗi sinh viên 1 bài duy nhất).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-414**
Group ID: FE-019
Summary: [FE-019] Implement Lecturer Feedback Dashboard & Submission Review View
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Lecturer Feedback
Priority: High
Story Points: 5
Dependency: is blocked by EBA-405, EBA-413

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Danh sách sinh viên đã nộp bài Review Study và các attempt Branching Study.
2. Khung soạn thảo nhận xét định tính chi tiết cho giảng viên.
3. Lưu nhận xét và chuyển trạng thái bài nộp sang REVIEWED.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-415**
Group ID: FE-020
Summary: [FE-020] Implement Student Review Feedback & Reflection Workflow
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 3
Dependency: is blocked by EBA-414

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Màn hình hiển thị nhận xét định tính của giảng viên cho sinh viên sau khi giảng viên phản hồi (trạng thái REVIEWED).
2. Mở khóa ô nhập bài phản tư dựa trên nhận xét của giảng viên.
3. Nộp bài phản tư và cập nhật trạng thái bài làm sang REFLECTED.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-416**
Group ID: FE-021
Summary: [FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Challenge Support
Priority: High
Story Points: 5
Dependency: is blocked by EBA-406, EBA-410

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Giao diện nhận câu hỏi gợi mở phản biện từ AI sau khi sinh viên nhập lập luận.
2. Hỗ trợ tối đa 2 vòng phản hồi (Round 1 & Round 2), sau đó khóa phiên.
3. Tuyệt đối không hiển thị điểm số, xếp loại hay đánh giá đúng/sai.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-417**
Group ID: FE-022
Summary: [FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts
Issue Type: Story
Role: FE
Sprint: Sprint 4
Flow: Statistics
Priority: High
Story Points: 3
Dependency: is blocked by EBA-408

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Màn hình StatisticsPage hiển thị tỷ lệ hoàn thành (Completion rate).
2. Biểu đồ phân bổ nhánh quyết định sinh viên lựa chọn (Branch selection distribution).
3. Thống kê số lượt thử (Attempts) và kết cục cuối cùng (Terminal outcomes).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-418**
Group ID: BE-020
Summary: [BE-020] Implement Branching Attempt Initialization & Resumption APIs
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-309

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API POST /api/v1/cases/:id/branching-attempts tạo bản ghi mới trong branching_attempts.
2. Xác thực case đang ở trạng thái PUBLISHED, tự động tăng attempt_number.
3. Gán current_node_id bằng root_node_id của cây quyết định.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-419**
Group ID: BE-021
Summary: [BE-021] Implement Real-Time Option Selection & Path Traversal Persistence
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-418

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API ghi nhận lựa chọn option của sinh viên vào bảng student_reasoning.
2. Cập nhật current_node_id sang node tiếp theo.
3. Giữ trường reasoning_text là null trong giai đoạn Experience.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-420**
Group ID: BE-022
Summary: [BE-022] Implement Terminal Node Completion & Outcome Recording API
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-419

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Phát hiện khi lựa chọn dẫn tới node có is_terminal = true.
2. Cập nhật is_completed = true, outcome_node_id và completed_at.
3. Mở khóa quyền truy cập vào endpoint Journey Review.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-421**
Group ID: BE-023
Summary: [BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-420

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API GET /api/v1/cases/:id/branching-attempts/:attemptId/review tổng hợp toàn bộ lộ trình.
2. Truy vấn và mở khóa văn bản hệ quả (consequences) của các option đã chọn.
3. Chặn truy cập nếu attempt chưa hoàn thành (is_completed = false).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-422**
Group ID: BE-024
Summary: [BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-421

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API cập nhật reasoning_text hồi cứu cho các node trong student_reasoning.
2. API PATCH /api/v1/branching-attempts/:id/reflection lưu bài phản tư tổng kết.
3. Cập nhật reflection_status = 'SUBMITTED' và ghi nhận thời gian nộp.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-423**
Group ID: BE-025
Summary: [BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 5
Dependency: is blocked by EBA-309

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API POST /api/v1/cases/:id/review-study/submit xác thực case đang ở trạng thái PUBLISHED và lưu bài nộp vào review_study_submissions.
2. Áp dụng ràng buộc UNIQUE(student_id, case_id) — mỗi sinh viên chỉ nộp 1 bài duy nhất.
3. Quản lý vòng đời trạng thái bài nộp: SUBMITTED → REVIEWED → REFLECTED.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-424**
Group ID: BE-026
Summary: [BE-026] Implement Lecturer Feedback Authoring & Status Progression API
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Lecturer Feedback
Priority: High
Story Points: 5
Dependency: is blocked by EBA-423

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. API POST /api/v1/lecturer-feedback lưu nhận xét định tính vào lecturer_feedback.
2. Ràng buộc toàn vẹn chk_feedback_one_target (gắn với attempt hoặc review_submission).
3. Tự động chuyển submission_status của Review Study sang REVIEWED khi feedback được lưu.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-425**
Group ID: BE-027
Summary: [BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Challenge Support
Priority: High
Story Points: 5
Dependency: is blocked by EBA-422, EBA-423

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. FastAPI service app/challenge_support/ sinh câu hỏi phản biện gợi mở từ lập luận của sinh viên.
2. Backend Gateway và DB thực thi ràng buộc cứng tối đa 2 vòng phản biện.
3. Tuyệt đối không chứa bất kỳ logic hoặc trường dữ liệu nào liên quan đến chấm điểm/xếp loại.

Status: IN PROGRESS

## Task

Master Task ID: **EBA-426**
Group ID: BE-028
Summary: [BE-028] Implement Learning-Flow Statistics Aggregation Queries
Issue Type: Story
Role: BE
Sprint: Sprint 4
Flow: Statistics
Priority: High
Story Points: 5
Dependency: is blocked by EBA-420, EBA-423

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Truy vấn tính toán tỷ lệ hoàn thành (Completion rate) trên tổng số attempt.
2. Gom nhóm đếm tần suất lựa chọn từng option tại mỗi Decision Point.
3. Thống kê phân bổ lượt làm (Attempts per student) và kết cục đạt được (Outcomes).

Status: IN PROGRESS

## Task

Master Task ID: **EBA-427**
Group ID: QA-011
Summary: [QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-408, EBA-421

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử E2E tự động: Mở case PUBLISHED → Chọn các option liên tục → Chạm terminal → Mở trang Review.
2. Xác minh dữ liệu lộ trình hiển thị chính xác 100% so với các bước sinh viên đã bấm.
3. Lưu bằng chứng kiểm thử E2E đạt chuẩn Definition of Done.

Status: TO DO

## Task

Master Task ID: **EBA-428**
Group ID: QA-012
Summary: [QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Branching Study
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-407, EBA-419

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Khẳng định không có bất kỳ văn bản hệ quả nào bị rò rỉ trước khi chạm terminal node.
2. Khẳng định sinh viên không bị chặn bởi form lập luận giữa các lần chọn phương án.
3. Kiểm thử trên cả API response và DOM giao diện client.

Status: TO DO

## Task

Master Task ID: **EBA-429**
Group ID: QA-013
Summary: [QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Branching Study
Priority: High
Story Points: 3
Dependency: is blocked by EBA-411, EBA-418

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử thao tác Retry tạo ra bản ghi attempt mới với attempt_number tăng dần.
2. Xác minh dữ liệu các lượt chơi cũ (path, reasoning, reflection) được giữ nguyên vẹn.
3. Không xảy ra tình trạng ghi đè hoặc xáo trộn giữa các lượt chơi của cùng một sinh viên.

Status: TO DO

## Task

Master Task ID: **EBA-430**
Group ID: QA-014
Summary: [QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Review Study
Priority: High
Story Points: 5
Dependency: is blocked by EBA-414, EBA-424

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử E2E luồng Review Study: Sinh viên nộp bài (SUBMITTED) → Giảng viên gửi feedback (REVIEWED) → Sinh viên nộp phản tư (REFLECTED).
2. Kiểm thử chặn nộp bài lần 2 cho cùng 1 case (ràng buộc unique submission).
3. Xác minh không có logic tự động chấm điểm nào diễn ra.

Status: TO DO

## Task

Master Task ID: **EBA-431**
Group ID: QA-015
Summary: [QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Challenge Support
Priority: High
Story Points: 3
Dependency: is blocked by EBA-416, EBA-425

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử tự động hệ thống dừng chính xác sau tối đa 2 vòng phản biện (Round 3 bị chặn).
2. Kiểm tra câu trả lời của AI: tuyệt đối không chứa điểm số, nhãn đúng/sai hay lời khen/chê học lực.
3. Kiểm tra bảo vệ prompt injection qua nội dung lập luận của sinh viên.

Status: TO DO

## Task

Master Task ID: **EBA-432**
Group ID: QA-016
Summary: [QA-016] Cross-Role Integration, Security & Performance Load Testing
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Release
Priority: High
Story Points: 5
Dependency: is blocked by EBA-427, EBA-430

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử tải đồng thời mô phỏng nhiều sinh viên cùng truy cập làm bài tình huống.
2. Giám sát độ trễ API và mức tiêu hao token/chi phí gọi LLM.
3. Đảm bảo hệ thống phản hồi ổn định dưới tải trọng của một lớp học 40-50 sinh viên.

Status: TO DO

## Task

Master Task ID: **EBA-433**
Group ID: QA-017
Summary: [QA-017] User Acceptance Testing (UAT) Execution & Defect Triage
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Release
Priority: Highest
Story Points: 5
Dependency: is blocked by EBA-432

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thực hiện kịch bản kiểm thử chấp nhận người dùng (UAT) với các persona Giảng viên và Sinh viên.
2. Ghi nhận, phân loại mức độ nghiêm trọng và xử lý dứt điểm các lỗi phát hiện.
3. Đạt 100% tiêu chí chấp nhận người dùng của Capstone 1.

Status: TO DO

## Task

Master Task ID: **EBA-434**
Group ID: QA-018
Summary: [QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Release
Priority: High
Story Points: 3
Dependency: is blocked by EBA-427

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Kiểm thử điều hướng hoàn toàn bằng bàn phím (Keyboard navigation) trên Branching Player.
2. Kiểm tra độ tương phản màu sắc theo chuẩn WCAG 2.1 AA.
3. Kiểm tra khả năng tương thích hiển thị trên Chrome, Firefox và Edge.

Status: TO DO

## Task

Master Task ID: **EBA-435**
Group ID: QA-019
Summary: [QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests
Issue Type: Task
Role: QA
Sprint: Sprint 4
Flow: Release
Priority: Highest
Story Points: 3
Dependency: is blocked by EBA-433, EBA-434

Description:
Không có trường Description riêng trong source.

Acceptance Criteria:
1. Thực hiện bộ smoke test trên môi trường staging trước buổi bảo vệ.
2. Rà soát và diễn tập thành công 100% kịch bản demo trực tiếp cho hội đồng.
3. Xác nhận sản phẩm sẵn sàng nghiệm thu và phát hành (Release Readiness).

Status: TO DO

# 6. FINAL CONSISTENCY CHECK

| Check | Expected | Actual | Result |
|---|---:|---:|---|
| Sprint count | 4 | 4 | PASS |
| Sprint 1 tasks | 10 | 10 | PASS |
| Sprint 2 tasks | 20 | 20 | PASS |
| Sprint 3 tasks | 19 | 19 | PASS |
| Sprint 4 tasks | 35 | 35 | PASS |
| Total tasks | 84 | 84 | PASS |
| Sprint 1 SP | 42 | 42 | PASS |
| Sprint 2 SP | 75 | 75 | PASS |
| Sprint 3 SP | 81 | 81 | PASS |
| Sprint 4 SP | 138 | 138 | PASS |
| Total SP | 336 | 336 | PASS |
| Duplicate Master IDs | 0 | 0 | PASS |
| Missing Master IDs | 0 | 0 | PASS |
| Invalid dependencies | 0 | 0 | PASS |

FINAL STATUS: READY FOR MANUAL JIRA ENTRY