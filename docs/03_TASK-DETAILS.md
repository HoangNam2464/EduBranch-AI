# EduBranch-AI — Task Details Specification (84 Tasks / 336 Story Points)

> **Dự án**: EduBranch-AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh & phân tích phản biện  
> **Nguồn quản trị gốc**: `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`  
> **Quy chuẩn định dạng Summary**: `[GROUP-###] Work name` (Không chèn mã `[EBA-###]` vào Summary)  
> **Quy mô chuẩn hóa**: 4 Sprints | 84 Tasks | 336 Story Points  
> **Phạm vi nghiệp vụ**: Quá trình học tập tình huống thực nghiệm & ra quyết định (EduBranch-AI)  

---

## [01] [DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes

- **Master Task ID**: `EBA-101`
- **Summary**: `[DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes`
- **Sprint**: `Sprint 1`
- **Group ID**: `DES-001`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: None

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Canvas: `EduBranch-Design-System` / Frame: `Information Architecture & User Flow Matrix` (Lecturer Portal vs. Student Portal, Dual Learning Modes).

### Acceptance Criteria
- [ ] **AC-1**: Tách rõ Lecturer Portal và Student Portal.
- [ ] **AC-2**: Có navigation riêng cho Branching Study và Review Study.
- [ ] **AC-3**: Được FE/BE review và phê duyệt.

---

## [02] [DES-002] Shared Design States: Loading, Empty, Error & Permissions

- **Master Task ID**: `EBA-102`
- **Summary**: `[DES-002] Shared Design States: Loading, Empty, Error & Permissions`
- **Sprint**: `Sprint 1`
- **Group ID**: `DES-002`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: is blocked by Master Task EBA-101 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Component Library: `Shared UI States` (Loading skeleton, Empty state, Error alert, 403 Forbidden banner, Async Processing states).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế đầy đủ loading, empty, error, 403 và processing states.
- [ ] **AC-2**: Token màu sắc, typography dùng thống nhất theo Design System.

---

## [03] [FE-001] Harden authStore, API Client, Route Guards & Session Expiration

- **Master Task ID**: `EBA-103`
- **Summary**: `[FE-001] Harden authStore, API Client, Route Guards & Session Expiration`
- **Sprint**: `Sprint 1`
- **Group ID**: `FE-001`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: is blocked by Master Task EBA-101 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/stores/authStore.ts`, `frontend/src/services/apiClient.ts`, `frontend/src/components/ui/PrivateRoute.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: authStore khôi phục session an toàn qua persist middleware.
- [ ] **AC-2**: apiClient tự động intercept 401 và gọi refresh token hoặc logout.
- [ ] **AC-3**: PrivateRoute chặn truy cập chéo giữa STUDENT và LECTURER.

---

## [04] [FE-002] Align Login, Register & Portal Layouts with Permission Matrix

- **Master Task ID**: `EBA-104`
- **Summary**: `[FE-002] Align Login, Register & Portal Layouts with Permission Matrix`
- **Sprint**: `Sprint 1`
- **Group ID**: `FE-002`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-102, EBA-103 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/RegisterPage.tsx`, `frontend/src/layouts/LecturerLayout.tsx`, `frontend/src/layouts/StudentLayout.tsx`, `frontend/src/pages/lecturer/CoursesPage.tsx`, `frontend/src/app/router.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Form validation và submitting states đầy đủ trên LoginPage và RegisterPage.
- [ ] **AC-2**: Portal layouts (LecturerLayout, StudentLayout) render đúng vai trò người dùng đại học; sinh viên không thấy các nút tác vụ của giảng viên.
- [ ] **AC-3**: Tích hợp màn hình danh sách khóa học (CoursesPage.tsx) hiển thị danh sách khóa học của giảng viên, hỗ trợ Empty State khi chưa có khóa học và modal tạo khóa học mới với client-side validation.
- [ ] **AC-4**: Cấu hình 404 Route Catch-All (path: "*") trong React Router để bắt mọi URL không tồn tại và hiển thị giao diện 404 Not Found thân thiện kèm nút quay về portal.
- [ ] **AC-5**: Thiết lập React Router Error Boundary (errorElement) trên root/layout routes để cô lập các ngoại lệ runtime render hoặc lỗi điều hướng, hiển thị fallback UI an toàn thay vì blank white screen.

---

## [05] [BE-001] Implement User Registration, Login & JWT Token Management

- **Master Task ID**: `EBA-105`
- **Summary**: `[BE-001] Implement User Registration, Login & JWT Token Management`
- **Sprint**: `Sprint 1`
- **Group ID**: `BE-001`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: None

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/auth.service.ts`, `backend/src/modules/auth/dto/login.dto.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API POST /api/v1/auth/register mã hóa BCrypt (12 rounds) và lưu trữ user role.
- [ ] **AC-2**: API POST /api/v1/auth/login xác thực credentials và cấp JWT access token (8h).
- [ ] **AC-3**: API GET /api/v1/auth/me trả về profile của người dùng đang đăng nhập.

---

## [06] [BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard

- **Master Task ID**: `EBA-106`
- **Summary**: `[BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard`
- **Sprint**: `Sprint 1`
- **Group ID**: `BE-002`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-105 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/common/guards/jwt-auth.guard.ts`, `backend/src/common/guards/roles.guard.ts`, `backend/src/common/decorators/public.decorator.ts`.

### Acceptance Criteria
- [ ] **AC-1**: JwtAuthGuard bảo vệ toàn bộ route mặc định.
- [ ] **AC-2**: Decorator @Public() cho phép bỏ qua xác thực trên các route công khai.
- [ ] **AC-3**: Đóng gói RolesGuard và decorator @Roles() kiểm tra role thay thế kiểm tra thủ công.
- [ ] **AC-4**: Tích hợp cơ chế kiểm soát tần suất truy cập tối thiểu (In-memory Rate Limiting / Throttler) trên các endpoint xác thực nhạy cảm (POST /api/v1/auth/login, POST /api/v1/auth/register) với ngưỡng cấu hình linh hoạt; kiểm thử tự động chứng minh khi vượt ngưỡng giới hạn, hệ thống trả về đúng mã lỗi HTTP 429 Too Many Requests nhằm ngăn chặn brute-force/dò quét cơ bản trong phạm vi Pilot.

---

## [07] [BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates

- **Master Task ID**: `EBA-107`
- **Summary**: `[BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates`
- **Sprint**: `Sprint 1`
- **Group ID**: `BE-003`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: is blocked by Master Task EBA-105, EBA-106 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/course/course.controller.ts`, `backend/src/modules/course/course.service.ts`, `backend/src/modules/course/guards/course-ownership.guard.ts`.

### Acceptance Criteria
- [ ] **AC-1**: CRUD API cho Course (/api/v1/courses) kiểm tra chính xác quyền sở hữu của lecturer_id.
- [ ] **AC-2**: Không có fallback user/course giả lập trong logic production.
- [ ] **AC-3**: Giảng viên chỉ xem và quản lý các khóa học do chính mình tạo.

---

## [08] [OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks

- **Master Task ID**: `EBA-108`
- **Summary**: `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks`
- **Sprint**: `Sprint 1`
- **Group ID**: `OPS-001`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `DONE`
- **Dependencies**: None

### Description
Thực hiện công việc chuyên môn thuộc nhóm **OPS** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/common/database/migration-runner.ts`, `backend/src/common/health/health.controller.ts`, `backend/migrations/`.

### Acceptance Criteria
- [ ] **AC-1**: Migration chạy mượt mà trên PostgreSQL 16 và kích hoạt extension pgvector.
- [ ] **AC-2**: Health check endpoint (/api/v1/health) kiểm tra DB và Redis.
- [ ] **AC-3**: Server dừng khởi động và báo lỗi nếu thiếu các biến môi trường bắt buộc (.env).
- [ ] **AC-4**: Sử dụng cơ chế khóa PostgreSQL Advisory Lock với cặp khóa số nguyên 32-bit pg_advisory_lock(key1, key2) (0x45445542, 0x52414e43 tạo không gian định danh kết hợp 64-bit) để tuần tự hóa việc chạy migration, ngăn chặn race condition khi nhiều instance khởi động đồng thời (đã xác minh qua Unit test mô phỏng; kiểm thử tích hợp thực tế đa instance thuộc phạm vi hạ tầng).
- [ ] **AC-5**: Tính toán và kiểm chứng Checksum SHA-256 cho từng file migration để bảo toàn tính toàn vẹn và ngăn chặn sửa đổi mã SQL lịch sử đã áp dụng.

---

## [09] [QA-001] Test Matrix for Auth, Course & Permissions

- **Master Task ID**: `EBA-109`
- **Summary**: `[QA-001] Test Matrix for Auth, Course & Permissions`
- **Sprint**: `Sprint 1`
- **Group ID**: `QA-001`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-105, EBA-107 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/auth-matrix.spec.ts` (Auth, Course & Permissions test matrix).

### Acceptance Criteria
- [ ] **AC-1**: Ma trận kiểm thử bao phủ toàn bộ Auth, Role RBAC và Course Ownership.
- [ ] **AC-2**: Có case positive và negative cho cả hai role LECTURER và STUDENT.
- [ ] **AC-3**: Bổ sung bộ kiểm thử dự phòng điều hướng cho FE-002: xác nhận URL không khớp (path: "*") điều hướng hiển thị NotFoundPage và cho phép quay về portal phù hợp; xác nhận lỗi route/render được xử lý bởi errorElement, hiển thị fallback UI an toàn thay vì màn hình trắng (blank screen).

---

## [10] [QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite

- **Master Task ID**: `EBA-110`
- **Summary**: `[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite`
- **Sprint**: `Sprint 1`
- **Group ID**: `QA-002`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Foundation`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-103, EBA-106, EBA-107 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Foundation** trong khuôn khổ **Sprint 1** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/security-regression.spec.ts` (Token expiry, role denial & ownership leak HTTP test suite).

### Acceptance Criteria
- [ ] **AC-1**: Token hết hạn hoặc sai chữ ký bị chặn lập tức với HTTP 401.
- [ ] **AC-2**: Truy cập tài nguyên của user khác bị từ chối với HTTP 403.
- [ ] **AC-3**: Có test evidence và log kiểm thử tự động.

---

## [11] [DES-003] Material Library & Upload Interaction Flow Design

- **Master Task ID**: `EBA-201`
- **Summary**: `[DES-003] Material Library & Upload Interaction Flow Design`
- **Sprint**: `Sprint 2`
- **Group ID**: `DES-003`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-102 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Frame: `Material Library & Upload Modal Flow` (Drag & drop zone, file validation visual cues, course material list).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế modal tải lên tài liệu hỗ trợ Drag-and-Drop cho định dạng PDF và DOCX.
- [ ] **AC-2**: Thiết kế bảng danh sách tài liệu hiển thị metadata và thanh tìm kiếm/lọc.

---

## [12] [DES-004] Material Processing, Progress Bar & Failure Recovery States

- **Master Task ID**: `EBA-202`
- **Summary**: `[DES-004] Material Processing, Progress Bar & Failure Recovery States`
- **Sprint**: `Sprint 2`
- **Group ID**: `DES-004`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-201 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Component: `Material Processing & Failure Recovery States` (Progress indicators, parsing/chunking status badges, retry actions).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế các trạng thái tiến độ: Pending, Processing (Parsing/Embedding), Completed, Failed.
- [ ] **AC-2**: Thiết kế thông báo lỗi và nút bấm Retry khi xử lý tài liệu thất bại.

---

## [13] [DES-005] RAG Grounding Evidence & Source Inspection UI Design

- **Master Task ID**: `EBA-203`
- **Summary**: `[DES-005] RAG Grounding Evidence & Source Inspection UI Design`
- **Sprint**: `Sprint 2`
- **Group ID**: `DES-005`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-201 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Frame: `RAG Grounding Evidence & Source Inspection Modal` (Retrieved chunk citation badges, text preview, source metadata).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế modal/drawer hiển thị các đoạn văn bản trích dẫn nguồn (evidence chunks) đã retrieval.
- [ ] **AC-2**: Tuyệt đối không để lộ thông tin nhạy cảm (API keys, system prompt, internal ID).

---

## [14] [FE-003] Implement Material Upload Modal with Client-Side Validation

- **Master Task ID**: `EBA-204`
- **Summary**: `[FE-003] Implement Material Upload Modal with Client-Side Validation`
- **Sprint**: `Sprint 2`
- **Group ID**: `FE-003`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-201, EBA-107 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/materials/MaterialUploadModal.tsx`, `frontend/src/services/materialService.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Hỗ trợ chọn hoặc kéo thả tệp định dạng .pdf hoặc .docx.
- [ ] **AC-2**: Validate kích thước tệp tối đa 50MB và MIME type ngay tại client trước khi upload.
- [ ] **AC-3**: Hiển thị thanh phần trăm tiến độ upload khi gửi tới API.

---

## [15] [FE-004] Implement Materials Table with Metadata & Processing Status Indicators

- **Master Task ID**: `EBA-205`
- **Summary**: `[FE-004] Implement Materials Table with Metadata & Processing Status Indicators`
- **Sprint**: `Sprint 2`
- **Group ID**: `FE-004`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-202, EBA-204 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/MaterialsPage.tsx`, `frontend/src/components/materials/MaterialsTable.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Hiển thị danh sách tài liệu của khóa học với tên file, định dạng (PDF/DOCX), kích thước, số lượng chunks và ngày tải lên.
- [ ] **AC-2**: Hiển thị badge trạng thái động (Pending, Processing, Completed, Failed) theo processing_status; tự động polling hoặc cập nhật trạng thái khi tài liệu đang xử lý.
- [ ] **AC-3**: Cung cấp bộ lọc client-side cho danh sách tài liệu theo trạng thái xử lý (PENDING, PROCESSING, COMPLETED, FAILED) và theo định dạng tệp (PDF, DOCX) phù hợp với quy mô Pilot học phần (<50 tài liệu).

---

## [16] [FE-005] Implement Material Delete & Failure Retry Actions with API Integration

- **Master Task ID**: `EBA-206`
- **Summary**: `[FE-005] Implement Material Delete & Failure Retry Actions with API Integration`
- **Sprint**: `Sprint 2`
- **Group ID**: `FE-005`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-205 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/materials/MaterialDeleteDialog.tsx`, `frontend/src/components/materials/MaterialRetryButton.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Kết nối nút xóa tài liệu với API DELETE /api/v1/courses/:courseId/materials/:id kèm dialog xác nhận.
- [ ] **AC-2**: Cung cấp nút Retry gọi API xử lý lại đối với tài liệu có trạng thái FAILED.
- [ ] **AC-3**: Hiển thị thông báo toast thành công hoặc lỗi tương ứng.

---

## [17] [FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence

- **Master Task ID**: `EBA-207`
- **Summary**: `[FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence`
- **Sprint**: `Sprint 2`
- **Group ID**: `FE-006`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-203 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/materials/SourceChunkViewerModal.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Hiển thị modal xem chi tiết các chunk văn bản trích dẫn kèm số trang/chỉ số đoạn.
- [ ] **AC-2**: Cho phép giảng viên đối chiếu nguồn tài liệu gốc khi chuẩn bị tạo case study.

---

## [18] [BE-005] Implement Material CRUD & Ownership Authorization Gates

- **Master Task ID**: `EBA-208`
- **Summary**: `[BE-005] Implement Material CRUD & Ownership Authorization Gates`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-005`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-107 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/material/material.controller.ts`, `backend/src/modules/material/material.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Quản lý bản ghi trong teaching_materials (tên, dung lượng, MIME type, status).
- [ ] **AC-2**: Kiểm tra quyền sở hữu của Course tại Backend Gateway; chỉ owner mới được upload và xóa tài liệu.
- [ ] **AC-3**: Bắt buộc kiểm tra quyền sở hữu khóa học trên toàn bộ các route đọc (GET /api/v1/courses/:courseId/materials và GET /api/v1/materials/:id) để ngăn chặn lỗ hổng IDOR giữa các giảng viên.
- [ ] **AC-4**: Trả về đúng mã lỗi 403 Forbidden nếu truy cập tài liệu khóa học của giảng viên khác.

---

## [19] [OPS-002] Implement MinIO Storage Service with Secure Object Key Naming

- **Master Task ID**: `EBA-209`
- **Summary**: `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming`
- **Sprint**: `Sprint 2`
- **Group ID**: `OPS-002`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-208 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **OPS** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/common/storage/minio.service.ts`, `backend/src/common/storage/storage.module.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Lưu trữ file an toàn trong bucket edubranch-materials trên MinIO.
- [ ] **AC-2**: Sử dụng object key dạng UUID không thể đoán trước (non-guessable keys).
- [ ] **AC-3**: Hỗ trợ streaming file upload và dọn dẹp file an toàn khi bị xóa.

---

## [20] [BE-007] Implement PDF Document Parser with Text Extraction & Normalization

- **Master Task ID**: `EBA-210`
- **Summary**: `[BE-007] Implement PDF Document Parser with Text Extraction & Normalization`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-007`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-209 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/ingestion/parser.py` (PDF Parser module).

### Acceptance Criteria
- [ ] **AC-1**: Trích xuất văn bản từ tệp PDF nhiều trang tại ai-service/app/ingestion/parser.py.
- [ ] **AC-2**: Làm sạch khoảng trắng thừa, ký tự điều khiển và chuẩn hóa định dạng UTF-8.
- [ ] **AC-3**: Bắt ngoại lệ và gán trạng thái FAILED nếu file PDF bị hỏng hoặc mã hóa mật khẩu.

---

## [21] [BE-008] Implement DOCX Document Parser with Text Extraction & Normalization

- **Master Task ID**: `EBA-211`
- **Summary**: `[BE-008] Implement DOCX Document Parser with Text Extraction & Normalization`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-008`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-209 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/ingestion/parser.py` (DOCX Parser module).

### Acceptance Criteria
- [ ] **AC-1**: Trích xuất văn bản từ tệp DOCX qua python-docx tại app/ingestion/parser.py.
- [ ] **AC-2**: Giữ nguyên cấu trúc phân đoạn văn bản và tiêu đề.
- [ ] **AC-3**: Bắt lỗi đối với định dạng docx rỗng hoặc không hợp lệ.

---

## [22] [BE-009] Implement Recursive Document Chunking Pipeline

- **Master Task ID**: `EBA-212`
- **Summary**: `[BE-009] Implement Recursive Document Chunking Pipeline`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-009`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-210, EBA-211 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/ingestion/chunker.py` (Recursive Character Text Splitter).

### Acceptance Criteria
- [ ] **AC-1**: Chia nhỏ văn bản thành các chunk kích thước 500-1000 tokens với overlap 100 tokens.
- [ ] **AC-2**: Bảo toàn ranh giới câu và đoạn văn qua RecursiveCharacterTextSplitter.
- [ ] **AC-3**: Gắn chỉ số tuần tự chunk_index và metadata tài liệu cho từng chunk.

---

## [23] [BE-010] Implement Vector Embedding Generation via Provider Abstraction

- **Master Task ID**: `EBA-213`
- **Summary**: `[BE-010] Implement Vector Embedding Generation via Provider Abstraction`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-010`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-212 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/ingestion/embedder.py`, `ai-service/app/providers/factory.py` (Embedding provider abstraction).

### Acceptance Criteria
- [ ] **AC-1**: Sinh vector embeddings qua Gemini text-embedding-004 (768-dim) hoặc OpenAI (1536-dim).
- [ ] **AC-2**: Gọi mô hình thông qua Provider Abstraction Interface.
- [ ] **AC-3**: Xử lý batching embeddings để tối ưu hóa thời gian và tránh rate limit.

---

## [24] [OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing

- **Master Task ID**: `EBA-214`
- **Summary**: `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing`
- **Sprint**: `Sprint 2`
- **Group ID**: `OPS-003`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-213 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **OPS** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/migrations/V002__pgvector_hnsw_indexes.sql`, `ai-service/app/ingestion/vector_store.py`.

### Acceptance Criteria
- [ ] **AC-1**: Lưu trữ các chunk và vector vào bảng document_chunks trong PostgreSQL.
- [ ] **AC-2**: Xây dựng và duy trì chỉ mục HNSW vector_cosine_ops để tìm kiếm tương đồng nhanh.
- [ ] **AC-3**: Đảm bảo ràng buộc khóa ngoại và CASCADE khi tài liệu bị xóa.

---

## [25] [BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping

- **Master Task ID**: `EBA-215`
- **Summary**: `[BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-012`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-214 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/retrieval/retriever.py`, `ai-service/app/routers/retrieval.py` (`<sources>` boundary wrapping).

### Acceptance Criteria
- [ ] **AC-1**: API POST /internal/v1/retrieval/query tìm kiếm vector tương đồng cosine.
- [ ] **AC-2**: Lọc bắt buộc theo course_id để cô lập dữ liệu theo quyền sở hữu khóa học.
- [ ] **AC-3**: Đánh dấu rõ nội dung tài liệu trích xuất là untrusted context bên trong khối <sources>...</sources> để LLM phân biệt với system instruction.

---

## [26] [BE-013] Fix Material Controller Spec Mock Data for Ownership Regression

- **Master Task ID**: `EBA-216`
- **Summary**: `[BE-013] Fix Material Controller Spec Mock Data for Ownership Regression`
- **Sprint**: `Sprint 2`
- **Group ID**: `BE-013`
- **Issue Type**: `Bug`
- **Priority**: `High`
- **Story Points**: `2`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-208 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/material/material.controller.spec.ts` (Mock data regression test).

### Acceptance Criteria
- [ ] **AC-1**: Cập nhật mock dữ liệu trong material.controller.spec.ts để khớp đúng lecturer_id người tạo.
- [ ] **AC-2**: Đảm bảo toàn bộ 4 test suite trong backend chạy vượt qua (PASS).

---

## [27] [QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds

- **Master Task ID**: `EBA-217`
- **Summary**: `[QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds`
- **Sprint**: `Sprint 2`
- **Group ID**: `QA-003`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-204, EBA-208 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/material-upload.spec.ts` (File type, size bounds & validation test suite).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử thành công upload file PDF và DOCX hợp lệ.
- [ ] **AC-2**: Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB.
- [ ] **AC-3**: Kiểm thử xử lý lỗi mạng và hiển thị trạng thái retry.

---

## [28] [QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation

- **Master Task ID**: `EBA-218`
- **Summary**: `[QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation`
- **Sprint**: `Sprint 2`
- **Group ID**: `QA-004`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-208, EBA-209 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/material-storage-security.spec.ts` (MinIO non-guessable key & tenant isolation test suite).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử Lecturer B không thể đọc, tải hoặc xóa tài liệu của Lecturer A.
- [ ] **AC-2**: Kiểm thử không thể đoán được URL/key tài liệu trên MinIO.
- [ ] **AC-3**: Kiểm thử tính toàn vẹn khi xóa khóa học thì tài liệu liên quan bị xóa an toàn.

---

## [29] [QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)

- **Master Task ID**: `EBA-219`
- **Summary**: `[QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)`
- **Sprint**: `Sprint 2`
- **Group ID**: `QA-005`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-214 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/ingestion-pipeline-integration.spec.ts` (End-to-End ingestion upload to pgvector).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử tự động xuyên suốt: Upload file → MinIO → Parsing → Chunking → Embeddings lưu vào pgvector.
- [ ] **AC-2**: Kiểm thử khả năng phục hồi khi file rỗng hoặc chứa ký tự đặc biệt.

---

## [30] [QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing

- **Master Task ID**: `EBA-220`
- **Summary**: `[QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing`
- **Sprint**: `Sprint 2`
- **Group ID**: `QA-006`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 1`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-215 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 1** trong khuôn khổ **Sprint 2** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/tests/test_retrieval_boundary.py` (Vector retrieval relevance & prompt injection boundary tests).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử độ chính xác truy xuất RAG theo cosine similarity.
- [ ] **AC-2**: Kiểm thử cô lập dữ liệu nghiêm ngặt giữa các course_id.
- [ ] **AC-3**: Kiểm thử ranh giới ngữ cảnh untrusted trong <sources>: đảm bảo generation prompt chỉ dẫn LLM coi tài liệu là tham khảo thuần túy và không thực thi chỉ thị độc hại bên trong nguồn.

---

## [31] [DES-006] Case Generation Modal & Parameter Configuration Flow Design

- **Master Task ID**: `EBA-301`
- **Summary**: `[DES-006] Case Generation Modal & Parameter Configuration Flow Design`
- **Sprint**: `Sprint 3`
- **Group ID**: `DES-006`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-203 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Modal: `Case Generation Trigger & Parameter Configuration` (Course context select, syllabus prompt, difficulty slider, learning mode choice).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế picker chọn tài liệu tham khảo trong khóa học.
- [ ] **AC-2**: Thiết kế trường nhập chủ đề gợi ý (topic hint), số lượng node mong muốn và chọn chế độ học.
- [ ] **AC-3**: Thiết kế trạng thái spinner đang tạo case kèm thông báo tiến độ.

---

## [32] [DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design

- **Master Task ID**: `EBA-302`
- **Summary**: `[DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design`
- **Sprint**: `Sprint 3`
- **Group ID**: `DES-007`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-301 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Interactive Canvas: `ReactFlow Decision Tree Topology` (Node types: root, decision, terminal; Edge types: option consequences; minimap).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế trực quan sơ đồ cây trên canvas ReactFlow (Root node, Decision node, Terminal node).
- [ ] **AC-2**: Thiết kế màu sắc, icon phân biệt các nhánh và đường nối (edges) thể hiện lựa chọn.
- [ ] **AC-3**: Hỗ trợ thao tác zoom, pan và căn chỉnh tự động cây quyết định.

---

## [33] [DES-008] Side-by-Side Node & Option Form Editor UX Design

- **Master Task ID**: `EBA-303`
- **Summary**: `[DES-008] Side-by-Side Node & Option Form Editor UX Design`
- **Sprint**: `Sprint 3`
- **Group ID**: `DES-008`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-302 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Component: `Side-by-Side Node & Option Form Editor` (Situation text editor, option branching controls, consequence preview pane).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế drawer/panel bên phải để xem và chỉnh sửa chi tiết từng node khi click trên canvas.
- [ ] **AC-2**: Thiết kế các trường chỉnh sửa: Situation text, Option text, Consequence explanation.
- [ ] **AC-3**: Thiết kế nút lưu thay đổi và hiển thị tức thì trên sơ đồ cây.

---

## [34] [DES-009] Case Governance Lifecycle Action Bar & Approval Status Design

- **Master Task ID**: `EBA-304`
- **Summary**: `[DES-009] Case Governance Lifecycle Action Bar & Approval Status Design`
- **Sprint**: `Sprint 3`
- **Group ID**: `DES-009`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-302 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Action Bar: `Case Governance Lifecycle Bar` (Draft, Reviewed, Approved, Published status pills, approval confirmation dialog).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế thanh công cụ hiển thị trạng thái hiện tại (DRAFT, REVIEWED, APPROVED, PUBLISHED).
- [ ] **AC-2**: Thiết kế các nút hành động chuyển trạng thái có điều kiện (Mark as Reviewed, Approve, Publish).
- [ ] **AC-3**: Thiết kế hộp thoại xác nhận xuất bản kèm link chia sẻ cho sinh viên.

---

## [35] [FE-007] Implement Case Generation Trigger Modal & Progress Tracking

- **Master Task ID**: `EBA-305`
- **Summary**: `[FE-007] Implement Case Generation Trigger Modal & Progress Tracking`
- **Sprint**: `Sprint 3`
- **Group ID**: `FE-007`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-301, EBA-205 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/lecturer/CasesPage.tsx`, `frontend/src/components/cases/CaseGenerationModal.tsx`, `frontend/src/services/caseService.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Xây dựng trang danh mục tình huống (CasesPage.tsx) tại đường dẫn /lecturer/courses/:courseId/cases, hiển thị danh sách case kèm badge trạng thái vòng đời (DRAFT, REVIEWED, APPROVED, PUBLISHED) và chế độ học (BRANCHING_STUDY, REVIEW_STUDY).
- [ ] **AC-2**: Hỗ trợ Empty State chuyên dụng khi khóa học chưa có tình huống nào, hướng dẫn giảng viên khởi tạo ca học và có nút kích hoạt Modal sinh case.
- [ ] **AC-3**: Điều hướng chính xác từ từng card case trong danh sách tới màn hình biên tập/phê duyệt cây quyết định (/lecturer/cases/:caseId/review), và nút liên kết nhanh tới màn hình quản lý tài liệu học phần (/lecturer/courses/:courseId/materials).
- [ ] **AC-4**: Modal sinh case AI (CaseGenerationModal.tsx hoặc embedded trong CasesPage) cho phép chọn tài liệu học phần đã ingestion (COMPLETED), nhập gợi ý chủ đề (topic hint), tùy chỉnh số lượng node rẽ nhánh, hiển thị loading spinner khi gọi API POST /cases/generate, và tự động điều hướng sang CaseReviewPage khi tạo bản nháp thành công.

---

## [36] [FE-008] Implement ReactFlow Decision Tree Visual Canvas Component

- **Master Task ID**: `EBA-306`
- **Summary**: `[FE-008] Implement ReactFlow Decision Tree Visual Canvas Component`
- **Sprint**: `Sprint 3`
- **Group ID**: `FE-008`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-302, EBA-305 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/cases/DecisionTreeCanvas.tsx` (ReactFlow canvas component).

### Acceptance Criteria
- [ ] **AC-1**: Tích hợp ReactFlow hiển thị topo cây quyết định với custom nodes và edges.
- [ ] **AC-2**: Đánh dấu nổi bật Root Node và các Terminal Nodes.
- [ ] **AC-3**: Xử lý sự kiện click vào node để kích hoạt form chỉnh sửa chi tiết.

---

## [37] [FE-009] Implement Interactive Node, Option & Consequence Editor Form

- **Master Task ID**: `EBA-307`
- **Summary**: `[FE-009] Implement Interactive Node, Option & Consequence Editor Form`
- **Sprint**: `Sprint 3`
- **Group ID**: `FE-009`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-303, EBA-306 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/cases/NodeOptionEditorForm.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Form cho phép giảng viên biên tập tình huống (situation), nội dung phương án và hệ quả.
- [ ] **AC-2**: Gọi API PUT /api/v1/cases/:id/nodes/:nodeId để lưu thay đổi.
- [ ] **AC-3**: Cập nhật ngay nhãn trên canvas sau khi lưu mà không cần reload trang.

---

## [38] [FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)

- **Master Task ID**: `EBA-308`
- **Summary**: `[FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)`
- **Sprint**: `Sprint 3`
- **Group ID**: `FE-010`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-307 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/cases/GraphMutationControls.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Cho phép thêm phương án lựa chọn mới cho một node.
- [ ] **AC-2**: Cho phép kéo thả nối cạnh (edge) sang node mục tiêu tiếp theo hoặc tạo node mới.
- [ ] **AC-3**: Chặn các thao tác tạo chu trình hoặc ngắt kết nối khỏi Root Node.

---

## [39] [FE-011] Implement Case Approval State Transition Workflow UI

- **Master Task ID**: `EBA-309`
- **Summary**: `[FE-011] Implement Case Approval State Transition Workflow UI`
- **Sprint**: `Sprint 3`
- **Group ID**: `FE-011`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-304, EBA-307 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/cases/CaseApprovalActionBar.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Giao diện chuyển đổi trạng thái: DRAFT → REVIEWED → APPROVED → PUBLISHED.
- [ ] **AC-2**: Ẩn nút Publish nếu cây chưa có ít nhất 1 Terminal node hoặc Root node không hợp lệ.
- [ ] **AC-3**: Khi PUBLISHED, hiển thị modal sao chép đường link trực tiếp cấp cho sinh viên.

---

## [40] [BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator

- **Master Task ID**: `EBA-310`
- **Summary**: `[BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-014`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-215 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/generation/schemas.py`, `ai-service/app/generation/tree_validator.py` (DFS 3-color cycle detection).

### Acceptance Criteria
- [ ] **AC-1**: Định nghĩa CaseGenerationOutput, CaseNode, CaseOption Pydantic schemas tại app/generation/schemas/decision_tree.py.
- [ ] **AC-2**: Thuật toán DFS 3 màu phát hiện và từ chối tuyệt đối cây có chu trình (cycles).
- [ ] **AC-3**: Xác thực không có nút mồ côi (unreachable nodes) và có ít nhất 1 terminal path.

---

## [41] [BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting

- **Master Task ID**: `EBA-311`
- **Summary**: `[BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-015`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-310 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/app/generation/case_generator.py`, `ai-service/app/routers/generation.py`.

### Acceptance Criteria
- [ ] **AC-1**: Xây dựng prompt có cấu trúc tích hợp ngữ cảnh RAG từ <sources> tài liệu của giảng viên.
- [ ] **AC-2**: Yêu cầu LLM trả về Structured Output JSON tuân thủ đúng schema cây quyết định.
- [ ] **AC-3**: Tự động retry gọi LLM nếu kết quả sinh ra vi phạm ràng buộc đồ thị.
- [ ] **AC-4**: Thiết lập cơ chế giới hạn thời gian chờ (HTTP Timeout thực thi trong đường gọi dịch vụ, cấu hình linh hoạt qua biến môi trường, đề xuất ban đầu 30s–60s) và giới hạn tối đa 3 lần gọi tổng cộng (1 lần gọi ban đầu + tối đa 2 lần retry đối với các lỗi mạng/quá tải tạm thời như 429, 503, timeout; không retry đối với lỗi 4xx client). Bảo đảm tính idempotency (tính lũy đẳng): Các lần retry của cùng một yêu cầu phải sử dụng định danh ổn định hoặc cơ chế chống trùng tương đương, tránh tạo nhiều case hoặc lưu cùng một kết quả nhiều lần, kể cả khi lần gọi trước đã được xử lý nhưng phản hồi bị timeout; nếu thất bại hoàn toàn, hệ thống kết thúc có kiểm soát (graceful failure) và ghi log lỗi rõ ràng.

---

## [42] [BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback

- **Master Task ID**: `EBA-312`
- **Summary**: `[BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-016`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-311 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/case/case-tree-persistence.service.ts` (Transactional multi-table persistence).

### Acceptance Criteria
- [ ] **AC-1**: Lưu bản nháp vào cases, case_nodes, case_options trong 1 Database Transaction duy nhất.
- [ ] **AC-2**: Ánh xạ chính xác node_index tạm thời sang UUID và cập nhật root_node_id.
- [ ] **AC-3**: Thực hiện ROLLBACK ngay lập tức nếu bất kỳ bước lưu node/option nào thất bại.

---

## [43] [BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check

- **Master Task ID**: `EBA-313`
- **Summary**: `[BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-017`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-312 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/case/case-node.controller.ts`, `backend/src/modules/case/case-node.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API PUT /api/v1/cases/:id/nodes/:nodeId cập nhật tình huống và danh sách options mà không tự ý thay đổi lifecycle state của case.
- [ ] **AC-2**: Kiểm tra tính toàn vẹn tô pô (DFS cycle check) trước khi persistence để đảm bảo không tạo chu trình.
- [ ] **AC-3**: Case giữ nguyên trạng thái DRAFT cho đến khi giảng viên thực hiện action Review riêng biệt (do EBA-314 quản lý).

---

## [44] [BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)

- **Master Task ID**: `EBA-314`
- **Summary**: `[BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-018`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-313 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/case/case-lifecycle.service.ts` (State machine DRAFT -> REVIEWED -> APPROVED -> PUBLISHED).

### Acceptance Criteria
- [ ] **AC-1**: API PATCH /api/v1/cases/:id/status thực thi cỗ máy trạng thái DRAFT → REVIEWED → APPROVED → PUBLISHED.
- [ ] **AC-2**: Ngăn chặn các bước nhảy trạng thái trái phép (ví dụ DRAFT nhảy thẳng lên PUBLISHED).
- [ ] **AC-3**: Chỉ giảng viên sở hữu khóa học mới có quyền thực hiện chuyển đổi trạng thái.

---

## [45] [BE-019] Implement Database-Level Student Access Gate for Published-Only Cases

- **Master Task ID**: `EBA-315`
- **Summary**: `[BE-019] Implement Database-Level Student Access Gate for Published-Only Cases`
- **Sprint**: `Sprint 3`
- **Group ID**: `BE-019`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-314 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/case/case.repository.ts`, `backend/src/modules/case/case.controller.ts` (Published-only gate at DB query level).

### Acceptance Criteria
- [ ] **AC-1**: Query kiểm tra trạng thái case ở tầng DB: sinh viên chỉ được đọc case khi status = 'PUBLISHED'.
- [ ] **AC-2**: Mọi truy vấn case DRAFT, REVIEWED, APPROVED từ role STUDENT đều bị chặn với HTTP 403.
- [ ] **AC-3**: Loại bỏ hoàn toàn nguy cơ rò rỉ đề bài chưa duyệt qua API.

---

## [46] [QA-007] Contract & Schema Validation Tests for AI Case Generation Output

- **Master Task ID**: `EBA-316`
- **Summary**: `[QA-007] Contract & Schema Validation Tests for AI Case Generation Output`
- **Sprint**: `Sprint 3`
- **Group ID**: `QA-007`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-310, EBA-311 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/tests/test_case_generation_schema.py` (Pydantic schema validation for AI case output).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử định dạng JSON sinh ra từ AI Service với các bộ dữ liệu tài liệu mẫu.
- [ ] **AC-2**: Kiểm thử khả năng phục hồi và từ chối khi mô hình trả về JSON sai cấu trúc.

---

## [47] [QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants

- **Master Task ID**: `EBA-317`
- **Summary**: `[QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants`
- **Sprint**: `Sprint 3`
- **Group ID**: `QA-008`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-310, EBA-313 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`ai-service/tests/test_graph_invariants.py` (DFS cycle, reachability, terminal node invariants test suite).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử phát hiện chu trình (cycle detection) với các ca kiểm thử đồ thị phức tạp.
- [ ] **AC-2**: Kiểm thử phát hiện nút mồ côi (orphan nodes) và thiếu đường đi đến terminal node.
- [ ] **AC-3**: Kiểm thử tính bất biến của cây quyết định khi chỉnh sửa qua API.

---

## [48] [QA-009] State Machine & Lifecycle Transition Boundary Test Suite

- **Master Task ID**: `EBA-318`
- **Summary**: `[QA-009] State Machine & Lifecycle Transition Boundary Test Suite`
- **Sprint**: `Sprint 3`
- **Group ID**: `QA-009`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-314 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/case-lifecycle-statemachine.spec.ts` (State machine transition boundary tests).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử các bước chuyển trạng thái hợp lệ từ DRAFT đến PUBLISHED.
- [ ] **AC-2**: Kiểm thử từ chối các bước chuyển không hợp lệ (nhảy cóc trạng thái).
- [ ] **AC-3**: Kiểm thử phân quyền: tài khoản không sở hữu không thể duyệt case.

---

## [49] [QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases

- **Master Task ID**: `EBA-319`
- **Summary**: `[QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases`
- **Sprint**: `Sprint 3`
- **Group ID**: `QA-010`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Flow 2`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-315 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Flow 2** trong khuôn khổ **Sprint 3** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/student-published-only-gate.spec.ts` (Security test suite preventing student access to non-published cases).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử tự động sinh viên truy cập trực tiếp ID case ở trạng thái DRAFT, REVIEWED, APPROVED nhận 403.
- [ ] **AC-2**: Kiểm thử sinh viên truy cập thành công ngay khi trạng thái chuyển sang PUBLISHED.

---

## [50] [DES-010] Branching Case Player Experience-First UI/UX Design

- **Master Task ID**: `EBA-401`
- **Summary**: `[DES-010] Branching Case Player Experience-First UI/UX Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-010`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-309 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Flow: `Branching Case Player Experience-First UI/UX` (Immersive situation card, clean radio option cards, zero mid-flow consequence distraction).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế màn hình ra quyết định tập trung, không phân tâm.
- [ ] **AC-2**: Tuyệt đối không hiển thị thẻ hệ quả (consequence card) giữa chừng.
- [ ] **AC-3**: Tuyệt đối không có form bắt buộc nhập lập luận (reasoning form) giữa các bước.

---

## [51] [DES-011] Journey Review Path Visualization & Consequence Reveal Design

- **Master Task ID**: `EBA-402`
- **Summary**: `[DES-011] Journey Review Path Visualization & Consequence Reveal Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-011`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-401 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Canvas: `Journey Review Path Visualization & Consequence Reveal` (Node traversal history, revealed consequence cards, decision path replay).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế lộ trình toàn bộ các bước đã đi qua theo thứ tự thời gian.
- [ ] **AC-2**: Mở khóa và hiển thị đầy đủ văn bản hệ quả (consequences) lần đầu tiên tại màn hình Review.
- [ ] **AC-3**: Thiết kế form nhập lập luận hồi cứu (retrospective reasoning) cho các quyết định then chốt.

---

## [52] [DES-012] Retry & New Attempt Initiation UX Design

- **Master Task ID**: `EBA-403`
- **Summary**: `[DES-012] Retry & New Attempt Initiation UX Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-012`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `2`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-402 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Flow: `Retry & New Attempt Initiation UX` (New attempt prompt, attempt counter badge, immutable attempt history viewer).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế nút và modal Retry bắt đầu lượt chơi mới.
- [ ] **AC-2**: Truyền đạt rõ ràng việc lượt chơi cũ được bảo lưu trọn vẹn và không bị ghi đè.

---

## [53] [DES-013] Review Study Open Analysis & Solution Proposal UI Design

- **Master Task ID**: `EBA-404`
- **Summary**: `[DES-013] Review Study Open Analysis & Solution Proposal UI Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-013`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-102 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Page: `Review Study Open Analysis & Solution Proposal Form` (Case document reader, open analysis text area, solution proposal panel).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế giao diện hiển thị ngữ cảnh & dữ liệu thực tế (context) và bài toán mở (problem).
- [ ] **AC-2**: Thiết kế form nhập phân tích, đề xuất giải pháp và giải thích lập luận.
- [ ] **AC-3**: Không sử dụng cây quyết định hay câu hỏi trắc nghiệm đúng/sai.

---

## [54] [DES-014] Lecturer Qualitative Feedback & Review Dashboard Design

- **Master Task ID**: `EBA-405`
- **Summary**: `[DES-014] Lecturer Qualitative Feedback & Review Dashboard Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-014`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-404 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Dashboard: `Lecturer Qualitative Feedback & Review Dashboard` (Student submission list, rubrics-free qualitative feedback input, status pill).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế dashboard cho giảng viên xem các bài nộp của sinh viên (cả Branching và Review Study).
- [ ] **AC-2**: Thiết kế khung soạn thảo nhận xét định tính (qualitative feedback).
- [ ] **AC-3**: Thiết kế giao diện cho sinh viên đọc nhận xét và viết bài phản tư (reflection).

---

## [55] [DES-015] AI Challenge Support Socratic Interaction UI Design

- **Master Task ID**: `EBA-406`
- **Summary**: `[DES-015] AI Challenge Support Socratic Interaction UI Design`
- **Sprint**: `Sprint 4`
- **Group ID**: `DES-015`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Challenge Support`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-402, EBA-404 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **DES** phục vụ phân hệ **Challenge Support** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
Figma Chat Interface: `AI Challenge Support Socratic Interaction Modal` (2-round hard cap counter-question UI, round badge, reflection box).

### Acceptance Criteria
- [ ] **AC-1**: Thiết kế giao diện hội thoại câu hỏi gợi mở phản biện của AI (tối đa 2 vòng).
- [ ] **AC-2**: Hiển thị rõ ranh giới: AI chỉ đặt câu hỏi chất vấn giả định, tuyệt đối không chấm điểm.
- [ ] **AC-3**: Thiết kế thanh tiến trình 2 vòng rõ ràng.

---

## [56] [FE-012] Implement Continuous Branching Case Player Component

- **Master Task ID**: `EBA-407`
- **Summary**: `[FE-012] Implement Continuous Branching Case Player Component`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-012`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-401, EBA-309 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/BranchingPlayPage.tsx`, `frontend/src/components/player/ContinuousNodePlayer.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Hiển thị tình huống hiện tại và các phương án lựa chọn.
- [ ] **AC-2**: Khi sinh viên bấm chọn phương án, chuyển mượt mà ngay lập tức sang tình huống tiếp theo.
- [ ] **AC-3**: Tuyệt đối không ngắt quãng bởi thẻ hệ quả hay form lập luận giữa chừng.

---

## [57] [FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review

- **Master Task ID**: `EBA-408`
- **Summary**: `[FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-013`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-407 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/player/TerminalCompletionGate.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Nhận biết khi sinh viên chạm nút kết thúc (is_terminal = true).
- [ ] **AC-2**: Gọi API hoàn thành attempt và tự động chuyển hướng sang /student/cases/:caseId/review.
- [ ] **AC-3**: Ngăn chặn sinh viên đi tiếp khi đã đạt nút kết thúc.

---

## [58] [FE-014] Implement Journey Review Replay Canvas with Consequence Reveal

- **Master Task ID**: `EBA-409`
- **Summary**: `[FE-014] Implement Journey Review Replay Canvas with Consequence Reveal`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-014`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-402, EBA-408 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/JourneyReviewPage.tsx`, `frontend/src/components/player/ConsequenceRevealCanvas.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Tái hiện lại danh sách toàn bộ các quyết định đã chọn theo đúng trình tự thời gian.
- [ ] **AC-2**: Hiển thị các phương án thay thế chưa chọn.
- [ ] **AC-3**: Tiết lộ văn bản hệ quả (consequences) của từng lựa chọn đã đưa ra.

---

## [59] [FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions

- **Master Task ID**: `EBA-410`
- **Summary**: `[FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-015`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-409 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/player/RetrospectiveReasoningModal.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Cung cấp ô nhập lập luận hồi cứu tại từng điểm quyết định trên trang Review.
- [ ] **AC-2**: Lập luận là tùy chọn (không bắt buộc nhập mọi node, khuyến khích node bước ngoặt).
- [ ] **AC-3**: Lưu lập luận hồi cứu an toàn về backend qua API.

---

## [60] [FE-016] Implement Retry Action Generating New Independent Branching Attempt

- **Master Task ID**: `EBA-411`
- **Summary**: `[FE-016] Implement Retry Action Generating New Independent Branching Attempt`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-016`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-409 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/components/player/RetryAttemptAction.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Nút Retry kích hoạt API tạo một lượt chơi mới với attempt_number tăng thêm 1.
- [ ] **AC-2**: Đưa sinh viên về Root Node của case để trải nghiệm hướng đi mới.
- [ ] **AC-3**: Lưu trữ đầy đủ lịch sử các lượt chơi trước trong Zustand store / API history.

---

## [61] [FE-017] Implement Post-Review Overall Reflection Submission Page

- **Master Task ID**: `EBA-412`
- **Summary**: `[FE-017] Implement Post-Review Overall Reflection Submission Page`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-017`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-410 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/ReflectionPage.tsx`, `frontend/src/services/reflectionService.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Màn hình cho phép sinh viên viết bài phản tư tổng thể (Reflection) sau khi hoàn tất Review.
- [ ] **AC-2**: Gọi API nộp bài phản tư và cập nhật trạng thái reflection_status = 'SUBMITTED'.
- [ ] **AC-3**: Khóa chỉnh sửa bài phản tư sau khi đã nộp thành công.

---

## [62] [FE-018] Implement Review Study Independent Analysis & Submission Page

- **Master Task ID**: `EBA-413`
- **Summary**: `[FE-018] Implement Review Study Independent Analysis & Submission Page`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-018`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-404 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/ReviewStudyPage.tsx`, `frontend/src/services/reviewStudyService.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Hiển thị bối cảnh thực tế (context_text) và vấn đề mở (problem_text).
- [ ] **AC-2**: Form nhập bài phân tích, giải pháp đề xuất và giải thích lập luận.
- [ ] **AC-3**: Gọi API nộp bài và quản lý trạng thái SUBMITTED (mỗi sinh viên 1 bài duy nhất).

---

## [63] [FE-019] Implement Lecturer Feedback Dashboard & Submission Review View

- **Master Task ID**: `EBA-414`
- **Summary**: `[FE-019] Implement Lecturer Feedback Dashboard & Submission Review View`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-019`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Lecturer Feedback`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-405, EBA-413 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Lecturer Feedback** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/LecturerFeedbackPage.tsx`, `frontend/src/components/feedback/SubmissionReviewList.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Hiển thị danh sách sinh viên đã nộp bài Review Study và các attempt hoàn thành Branching Study kèm thời gian nộp và trạng thái xét duyệt.
- [ ] **AC-2**: Cung cấp bộ lọc client-side cho danh sách bài nộp theo Chế độ học (All, Branching Study, Review Study) và theo trường trạng thái riêng biệt của từng loại dữ liệu: đối với Review Study lọc theo trạng thái bài nộp SUBMITTED (hiển thị nhãn giao diện PENDING_REVIEW), REVIEWED (Đã phản hồi), REFLECTED (Đã hoàn tất phản tư); đối với Branching Study lọc riêng biệt theo trạng thái hành trình (is_completed = true / COMPLETED) và trạng thái bài phản tư (reflection_status = 'SUBMITTED' vs Chưa nộp bài phản tư).
- [ ] **AC-3**: Khung soạn thảo nhận xét định tính chi tiết cho giảng viên, lưu nhận xét và chuyển trạng thái bài nộp sang REVIEWED.

---

## [64] [FE-020] Implement Student Review Feedback & Reflection Workflow

- **Master Task ID**: `EBA-415`
- **Summary**: `[FE-020] Implement Student Review Feedback & Reflection Workflow`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-020`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-414 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/student/ReviewFeedbackPage.tsx`, `frontend/src/components/feedback/StudentReviewFeedbackView.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Màn hình hiển thị nhận xét định tính của giảng viên cho sinh viên sau khi giảng viên phản hồi (trạng thái REVIEWED).
- [ ] **AC-2**: Mở khóa ô nhập bài phản tư dựa trên nhận xét của giảng viên.
- [ ] **AC-3**: Nộp bài phản tư và cập nhật trạng thái bài làm sang REFLECTED.

---

## [65] [FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)

- **Master Task ID**: `EBA-416`
- **Summary**: `[FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-021`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Challenge Support`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-406, EBA-410 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Challenge Support** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/ChallengeSupportPage.tsx`, `frontend/src/components/challenge/SocraticDialoguePanel.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Giao diện nhận câu hỏi gợi mở phản biện từ AI sau khi sinh viên nhập lập luận.
- [ ] **AC-2**: Hỗ trợ tối đa 2 vòng phản hồi (Round 1 & Round 2), sau đó khóa phiên.
- [ ] **AC-3**: Tuyệt đối không hiển thị điểm số, xếp loại hay đánh giá đúng/sai.

---

## [66] [FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts

- **Master Task ID**: `EBA-417`
- **Summary**: `[FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts`
- **Sprint**: `Sprint 4`
- **Group ID**: `FE-022`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Statistics`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-408 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **FE** phục vụ phân hệ **Statistics** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`frontend/src/pages/StatisticsPage.tsx`, `frontend/src/components/stats/BranchStatsChart.tsx`.

### Acceptance Criteria
- [ ] **AC-1**: Màn hình StatisticsPage hiển thị tỷ lệ hoàn thành (Completion rate).
- [ ] **AC-2**: Biểu đồ phân bổ nhánh quyết định sinh viên lựa chọn (Branch selection distribution).
- [ ] **AC-3**: Thống kê số lượt thử (Attempts) và kết cục cuối cùng (Terminal outcomes).

---

## [67] [BE-020] Implement Branching Attempt Initialization & Resumption APIs

- **Master Task ID**: `EBA-418`
- **Summary**: `[BE-020] Implement Branching Attempt Initialization & Resumption APIs`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-020`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-309 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/branching-attempt/branching-attempt.controller.ts`, `branching-attempt.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API POST /api/v1/cases/:id/branching-attempts tạo bản ghi mới trong branching_attempts.
- [ ] **AC-2**: Xác thực case đang ở trạng thái PUBLISHED, tự động tăng attempt_number.
- [ ] **AC-3**: Gán current_node_id bằng root_node_id của cây quyết định.

---

## [68] [BE-021] Implement Real-Time Option Selection & Path Traversal Persistence

- **Master Task ID**: `EBA-419`
- **Summary**: `[BE-021] Implement Real-Time Option Selection & Path Traversal Persistence`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-021`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-418 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/branching-attempt/traversal.service.ts` (Real-time traversal & path persistence).

### Acceptance Criteria
- [ ] **AC-1**: API ghi nhận lựa chọn option của sinh viên vào bảng student_reasoning.
- [ ] **AC-2**: Cập nhật current_node_id sang node tiếp theo.
- [ ] **AC-3**: Giữ trường reasoning_text là null trong giai đoạn Experience.

---

## [69] [BE-022] Implement Terminal Node Completion & Outcome Recording API

- **Master Task ID**: `EBA-420`
- **Summary**: `[BE-022] Implement Terminal Node Completion & Outcome Recording API`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-022`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-419 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/branching-attempt/terminal-completion.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Phát hiện khi lựa chọn dẫn tới node có is_terminal = true.
- [ ] **AC-2**: Cập nhật is_completed = true, outcome_node_id và completed_at.
- [ ] **AC-3**: Mở khóa quyền truy cập vào endpoint Journey Review.

---

## [70] [BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API

- **Master Task ID**: `EBA-421`
- **Summary**: `[BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-023`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-420 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/branching-attempt/journey-review.service.ts` (Consequence unlocking & path assembly).

### Acceptance Criteria
- [ ] **AC-1**: API GET /api/v1/cases/:id/branching-attempts/:attemptId/review tổng hợp toàn bộ lộ trình.
- [ ] **AC-2**: Truy vấn và mở khóa văn bản hệ quả (consequences) của các option đã chọn.
- [ ] **AC-3**: Chặn truy cập nếu attempt chưa hoàn thành (is_completed = false).

---

## [71] [BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs

- **Master Task ID**: `EBA-422`
- **Summary**: `[BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-024`
- **Issue Type**: `Story`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-421 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/reasoning/reasoning.controller.ts`, `backend/src/modules/reasoning/reasoning.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API cập nhật reasoning_text hồi cứu cho các node trong student_reasoning.
- [ ] **AC-2**: API PATCH /api/v1/branching-attempts/:id/reflection lưu bài phản tư tổng kết.
- [ ] **AC-3**: Cập nhật reflection_status = 'SUBMITTED' và ghi nhận thời gian nộp.

---

## [72] [BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate

- **Master Task ID**: `EBA-423`
- **Summary**: `[BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-025`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-309 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/review-study/review-study.controller.ts`, `backend/src/modules/review-study/review-study.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API POST /api/v1/cases/:id/review-study/submit xác thực case đang ở trạng thái PUBLISHED và lưu bài nộp vào review_study_submissions.
- [ ] **AC-2**: Áp dụng ràng buộc UNIQUE(student_id, case_id) — mỗi sinh viên chỉ nộp 1 bài duy nhất.
- [ ] **AC-3**: Quản lý vòng đời trạng thái bài nộp: SUBMITTED → REVIEWED → REFLECTED.

---

## [73] [BE-026] Implement Lecturer Feedback Authoring & Status Progression API

- **Master Task ID**: `EBA-424`
- **Summary**: `[BE-026] Implement Lecturer Feedback Authoring & Status Progression API`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-026`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Lecturer Feedback`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-423 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Lecturer Feedback** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/lecturer-feedback/lecturer-feedback.controller.ts`, `lecturer-feedback.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: API POST /api/v1/lecturer-feedback lưu nhận xét định tính vào lecturer_feedback.
- [ ] **AC-2**: Ràng buộc toàn vẹn chk_feedback_one_target (gắn với attempt hoặc review_submission).
- [ ] **AC-3**: Tự động chuyển submission_status của Review Study sang REVIEWED khi feedback được lưu.

---

## [74] [BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer

- **Master Task ID**: `EBA-425`
- **Summary**: `[BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-027`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Challenge Support`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-422, EBA-423 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Challenge Support** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/challenge-support/challenge-support.service.ts`, `ai-service/app/routers/challenge.py` (2-round cap).

### Acceptance Criteria
- [ ] **AC-1**: FastAPI service sinh câu hỏi phản biện gợi mở từ lập luận của sinh viên.
- [ ] **AC-2**: Backend Gateway và DB thực thi ràng buộc cứng tối đa 2 vòng phản biện.
- [ ] **AC-3**: Tuyệt đối không chứa bất kỳ logic hoặc trường dữ liệu nào liên quan đến chấm điểm/xếp loại.
- [ ] **AC-4**: Cấu hình HTTP Timeout thực tế trong lời gọi API (cấu hình linh hoạt qua biến môi trường, đề xuất ban đầu 15s–30s) và giới hạn tối đa 3 lần gọi tổng cộng (1 lần gọi ban đầu + tối đa 2 lần retry đối với lỗi mạng/quá tải tạm thời). Bảo đảm tính idempotency (tính lũy đẳng): Các lần retry của cùng một yêu cầu phải sử dụng định danh ổn định hoặc cơ chế chống trùng tương đương, tránh ghi nhận trùng lặp lượt phản biện hoặc lưu dữ liệu hai lần, kể cả khi lần gọi trước đã được xử lý nhưng phản hồi bị timeout; nếu timeout hoặc AI Service không phản hồi, xử lý kết thúc có kiểm soát và trả về thông báo lỗi thân thiện cho sinh viên.

---

## [75] [BE-028] Implement Learning-Flow Statistics Aggregation Queries

- **Master Task ID**: `EBA-426`
- **Summary**: `[BE-028] Implement Learning-Flow Statistics Aggregation Queries`
- **Sprint**: `Sprint 4`
- **Group ID**: `BE-028`
- **Issue Type**: `Story`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Statistics`
- **Trạng thái nguồn**: `IN PROGRESS`
- **Dependencies**: is blocked by Master Task EBA-420, EBA-423 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **BE** phục vụ phân hệ **Statistics** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/src/modules/statistics/statistics.controller.ts`, `backend/src/modules/statistics/statistics.service.ts`.

### Acceptance Criteria
- [ ] **AC-1**: Truy vấn tính toán tỷ lệ hoàn thành (Completion rate) trên tổng số attempt.
- [ ] **AC-2**: Gom nhóm đếm tần suất lựa chọn từng option tại mỗi Decision Point.
- [ ] **AC-3**: Thống kê phân bổ lượt làm (Attempts per student) và kết cục đạt được (Outcomes).

---

## [76] [QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review

- **Master Task ID**: `EBA-427`
- **Summary**: `[QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-011`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-408, EBA-421 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/branching-study-e2e.spec.ts` (Complete continuous traversal to review flow).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử E2E tự động: Mở case PUBLISHED → Chọn các option liên tục → Chạm terminal → Mở trang Review.
- [ ] **AC-2**: Xác minh dữ liệu lộ trình hiển thị chính xác 100% so với các bước sinh viên đã bấm.
- [ ] **AC-3**: Lưu bằng chứng kiểm thử E2E đạt chuẩn Definition of Done.

---

## [77] [QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence

- **Master Task ID**: `EBA-428`
- **Summary**: `[QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-012`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-407, EBA-419 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/pedagogical-invariants.spec.ts` (Verification of zero mid-flow consequence or reasoning).

### Acceptance Criteria
- [ ] **AC-1**: Khẳng định không có bất kỳ văn bản hệ quả nào bị rò rỉ trước khi chạm terminal node.
- [ ] **AC-2**: Khẳng định sinh viên không bị chặn bởi form lập luận giữa các lần chọn phương án.
- [ ] **AC-3**: Kiểm thử trên cả API response và DOM giao diện client.

---

## [78] [QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation

- **Master Task ID**: `EBA-429`
- **Summary**: `[QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-013`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Branching Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-411, EBA-418 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Branching Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/retry-isolation.spec.ts` (Immutable historical attempts & retry isolation tests).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử thao tác Retry tạo ra bản ghi attempt mới với attempt_number tăng dần.
- [ ] **AC-2**: Xác minh dữ liệu các lượt chơi cũ (path, reasoning, reflection) được giữ nguyên vẹn.
- [ ] **AC-3**: Không xảy ra tình trạng ghi đè hoặc xáo trộn giữa các lượt chơi của cùng một sinh viên.

---

## [79] [QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection

- **Master Task ID**: `EBA-430`
- **Summary**: `[QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-014`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Review Study`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-414, EBA-424 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Review Study** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/review-study-feedback-e2e.spec.ts` (Review Study, Lecturer Feedback & Reflection suite).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử E2E luồng Review Study: Sinh viên nộp bài (SUBMITTED) → Giảng viên gửi feedback (REVIEWED) → Sinh viên nộp phản tư (REFLECTED).
- [ ] **AC-2**: Kiểm thử chặn nộp bài lần 2 cho cùng 1 case (ràng buộc unique submission).
- [ ] **AC-3**: Xác minh không có logic tự động chấm điểm nào diễn ra.

---

## [80] [QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)

- **Master Task ID**: `EBA-431`
- **Summary**: `[QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-015`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Challenge Support`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-416, EBA-425 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Challenge Support** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/challenge-support-safety.spec.ts` (2-round hard cap, non-grading boundary audit).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử tự động hệ thống dừng chính xác sau tối đa 2 vòng phản biện (Round 3 bị chặn).
- [ ] **AC-2**: Kiểm tra câu trả lời của AI: tuyệt đối không chứa điểm số, nhãn đúng/sai hay lời khen/chê học lực.
- [ ] **AC-3**: Kiểm tra bảo vệ prompt injection qua nội dung lập luận của sinh viên.

---

## [81] [QA-016] Cross-Role Integration, Security & Performance Load Testing

- **Master Task ID**: `EBA-432`
- **Summary**: `[QA-016] Cross-Role Integration, Security & Performance Load Testing`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-016`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `5`
- **Flow / Milestone**: `Release`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-427, EBA-430 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Release** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`backend/test/cross-role-security-load.spec.ts` (Cross-role isolation & performance stress tests).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử tải đồng thời mô phỏng nhiều sinh viên cùng truy cập làm bài tình huống.
- [ ] **AC-2**: Giám sát độ trễ API và mức tiêu hao token/chi phí gọi LLM.
- [ ] **AC-3**: Đảm bảo hệ thống phản hồi ổn định dưới tải trọng của một lớp học 40-50 sinh viên.

---

## [82] [QA-017] User Acceptance Testing (UAT) Execution & Defect Triage

- **Master Task ID**: `EBA-433`
- **Summary**: `[QA-017] User Acceptance Testing (UAT) Execution & Defect Triage`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-017`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `5`
- **Flow / Milestone**: `Release`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-432 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Release** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`docs/qa/UAT-EXECUTION-REPORT.md` (User Acceptance Testing scripts & defect triage matrix).

### Acceptance Criteria
- [ ] **AC-1**: Thực hiện kịch bản kiểm thử chấp nhận người dùng (UAT) với các persona Giảng viên và Sinh viên.
- [ ] **AC-2**: Ghi nhận, phân loại mức độ nghiêm trọng và xử lý dứt điểm các lỗi phát hiện.
- [ ] **AC-3**: Đạt 100% tiêu chí chấp nhận người dùng của Capstone 1.

---

## [83] [QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit

- **Master Task ID**: `EBA-434`
- **Summary**: `[QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-018`
- **Issue Type**: `Task`
- **Priority**: `High`
- **Story Points**: `3`
- **Flow / Milestone**: `Release`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-427 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Release** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`docs/qa/ACCESSIBILITY-AUDIT.md` (WCAG 2.1 AA audit report & keyboard navigation test log).

### Acceptance Criteria
- [ ] **AC-1**: Kiểm thử điều hướng hoàn toàn bằng bàn phím (Keyboard navigation) trên Branching Player.
- [ ] **AC-2**: Kiểm tra độ tương phản màu sắc theo chuẩn WCAG 2.1 AA.
- [ ] **AC-3**: Kiểm tra khả năng tương thích hiển thị trên Chrome, Firefox và Edge.

---

## [84] [QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests

- **Master Task ID**: `EBA-435`
- **Summary**: `[QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests`
- **Sprint**: `Sprint 4`
- **Group ID**: `QA-019`
- **Issue Type**: `Task`
- **Priority**: `Highest`
- **Story Points**: `3`
- **Flow / Milestone**: `Release`
- **Trạng thái nguồn**: `TO DO`
- **Dependencies**: is blocked by Master Task EBA-433, EBA-434 *(Lưu ý: Khi nhập lên Jira, ánh xạ sang Jira Issue Key thực tế tương ứng)*

### Description
Thực hiện công việc chuyên môn thuộc nhóm **QA** phục vụ phân hệ **Release** trong khuôn khổ **Sprint 4** của dự án EduBranch AI (Giáo dục đại học). Đảm bảo tuân thủ triệt để ranh giới nghiệp vụ đại học (Lecturer/Student, Course, Case Study, Decision Tree) phục vụ quá trình học tập tình huống thực nghiệm. Chi tiết yêu cầu kỹ thuật và điều kiện hoàn thành được xác định trong Deliverables và Acceptance Criteria bên dưới.

### Deliverables
`docs/qa/RELEASE-READINESS-REPORT.md` (Final smoke test run log & demo validation script).

### Acceptance Criteria
- [ ] **AC-1**: Thực hiện bộ smoke test trên môi trường staging trước buổi bảo vệ.
- [ ] **AC-2**: Rà soát và diễn tập thành công 100% kịch bản demo trực tiếp cho hội đồng.
- [ ] **AC-3**: Xác nhận sản phẩm sẵn sàng nghiệm thu và phát hành (Release Readiness).
- [ ] **AC-4**: Xây dựng quy trình hướng dẫn sao lưu cơ sở dữ liệu dự phòng bằng pg_dump và thực hiện diễn tập khôi phục (restore rehearsal) trên môi trường thử nghiệm biệt lập (isolated environment), xác minh toàn vẹn dữ liệu sau phục hồi và lưu lại báo cáo bằng chứng; tuyệt đối không thực hiện thử nghiệm phá hủy trên cơ sở dữ liệu đang vận hành thật.

---

