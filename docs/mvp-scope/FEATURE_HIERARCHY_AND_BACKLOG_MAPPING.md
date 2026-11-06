# Feature Hierarchy & Backlog Mapping

> **Trạng thái**: `DRAFT — CHỜ PROJECT OWNER PHÊ DUYỆT` · Ngày: 2026-11-01
> **Nguyên tắc**: Không tạo task hay Story Points mới. Chỗ thiếu phân rã được ghi là **"Đề xuất task con — cần xác nhận"** và không gán SP. Endpoint chỉ ghi khi đã có trong tài liệu dự án. Endpoint chưa có ghi `UNKNOWN`.

---

## 1. Hệ thống phân cấp yêu cầu

```
Project Goal (Proposal §2 Goals 1–8, Objectives 1–8)
└── Product Scope (Proposal §4 Proposed Solution — 13 chức năng; Deliverable 1–6)
    └── Module / Feature (15 FEATURE-*.md + REQUIREMENT-TRACEABILITY 30 items)
        └── Sub-feature (FR-xxx trong từng feature spec)
            └── User Flow (SITE-ARCHITECTURE §6 Workflow 1–6; FEATURE §5 Main Flow)
                └── Screen / State (SITE-ARCHITECTURE §5 — 15 routes; P0–P4; 05_FIGMA Frame 00.1–05.7)
                    └── Backlog Task (84 task: DES/FE/BE/OPS/QA)  →  Story Points (336)
```

Lưu ý: backlog **tổ chức theo task kỹ thuật theo lớp** (DES/FE/BE/QA), không theo feature. Một feature được hiện thực bởi nhiều task ở nhiều lớp. Các trang nền tảng (landing, login, register, courses, statistics, 403/404) được `05_FIGMA §1.5` **gom chính thức vào DES-001/DES-002** dù không có task riêng.

---

## 2. Cây Feature → Sub-feature → Task

| Mục tiêu Proposal | Module (spec) | Sub-feature (FR) | Task cha trong backlog | Tình trạng phân rã |
|---|---|---|---|---|
| §4 "Account and role management" | Auth & Roles (`FEATURE-AUTH-AND-ROLES`) | FR-AUTH-01 Register · 02 Login/JWT · 03 RBAC · 04 `/auth/me` | DES-001, FE-001, FE-002, BE-001, BE-002, QA-001, QA-002 | Đủ |
| | | Landing `/`, 403/404, session expiry | DES-001, DES-002, FE-002 (AC-4/5) | Đủ (gom) |
| | | Chặn đăng nhập `is_active=false` (FR-AUTH §12) | BE-001 (ngầm) | **Chưa có AC**. Code chưa làm. Đề xuất bổ sung AC — cần xác nhận. |
| §4 "Teaching-material upload bound to a course" | Course & Materials | FR-MAT-01/02 Course CRUD | BE-003, FE-002 AC-3 | Đủ |
| | | FR-MAT-03..06 Upload, MinIO, status | DES-003, DES-004, FE-003, FE-004, FE-005, BE-005, OPS-002, BE-013, QA-003, QA-004 | Đủ |
| §4 "RAG-based AI Case Generator" | Document Processing & RAG | Parse, chunk, embed, retrieve | BE-007..BE-012, OPS-003, QA-005, QA-006 | Đủ |
| | | Source inspection UI | DES-005, FE-006 | Đủ |
| | Case Generation | FR-GEN-01..06 | DES-006, FE-007, BE-014, BE-015, QA-007 | Đủ |
| Goal 2 "verify, edit and approve" | Decision Tree + Case Review & Publishing | FR-REV-01..06, DAG validation | DES-007, DES-008, DES-009, FE-008..FE-011, BE-016..BE-019, QA-008..QA-010 | Đủ |
| Goal 3 "Branching Case Player" | Branching Study + Branching Attempt | Phase 1 play, terminal, resume | DES-010, FE-012, FE-013, BE-020..BE-022, QA-011, QA-012 | Đủ |
| Goal 4 "Journey Review, Reflection, Retry" | Branching Study, Reasoning, Reflection | FR-BS-07 reasoning, FR-BS-10 retry, reflection | DES-011, DES-012, FE-014..FE-017, BE-023, BE-024, QA-013 | Đủ |
| Goal 5 "Review Study" | Review Study | Submission (1/case), feedback, reflection | DES-013, FE-018, FE-020, BE-025, QA-014 | Đủ |
| Goal 7 "AI Reasoning/Challenge Support" | Challenge Support | FR-CS-*, 2-round cap | DES-015, FE-021, BE-027, QA-015 | Đủ |
| Goal 8 "Statistics + Lecturer Feedback" | Lecturer Feedback; Basic Statistics | FR-STAT-01..05; feedback authoring | DES-014, FE-019, FE-022, BE-026, BE-028 | Đủ |
| §4 "Quantitative Evaluation module"; Goal 8 research design; Deliverable 6 | Evaluation & Research | FR-EVAL-01..05 | **Không có task** | **Thiếu phân rã.** Phụ thuộc OPD-011. Đề xuất task con (cần xác nhận): BE `evaluation/` CRUD rubric; FE form rubric; export dữ liệu ẩn danh (FR-EVAL-04/05); QA kiểm tra loại bỏ PII. |
| §4 "Notification" | Notifications | FR-NOTIF-01 deadline (spec ghi MVP); 02–04 reminders (Phase 2) | **Không có task** | **Thiếu phân rã cho FR-NOTIF-01** (D-03). Đề xuất task con (cần xác nhận): cột `due_date` + hiển thị trên case. Reminders: Phase 2 theo spec. |
| Context Diagram — Admin | (không có FEATURE-ADMIN) | Manage accounts & roles · courses · API & logs | **Không có task** | **Không có spec feature lẫn task.** Phụ thuộc OPD-015. Nếu chọn Option A: đề xuất task con (cần xác nhận) BE `admin/users`, FE user management, QA RBAC admin. |
| — | Release / cross-cutting | E2E, load, UAT, WCAG, release | QA-016..QA-019, OPS-001 | Đủ |

**Tổng hợp**: 3 nhóm chức năng có nguồn trong Proposal nhưng **không có task trong backlog**: Evaluation/Rubric, Deadline display, Admin. Đây là các **mâu thuẫn Proposal ↔ backlog** PO cần xử lý. Có thể chấp nhận để ngoài 4 sprint, hoặc tìm chỗ phân rã trong task cha hiện có. Tôi không tự tạo task.

---

## 3. Mapping màn hình → feature → task → yêu cầu FE/BE/DB/QA

Dùng **route của sitemap** làm khóa (vì D-01 chưa chốt). Mỗi dòng ghi frame trên cả hai page.

| Route / Màn | Frame (Page 2 / Page 1) | Product Feature | Task cha | Sub-feature | FE Requirement | BE / API (đã có trong tài liệu) | DB | QA |
|---|---|---|---|---|---|---|---|---|
| `/` Landing | 1:5988 / — | Auth (public) | DES-001 | Giới thiệu, CTA | Route index hiện trỏ LoginPage. **Cần FE đổi khi Landing được lock.** | — | — | UNKNOWN (không có test) |
| `/login` | 1:6113 / 1:2 | Auth | BE-001, FE-002, QA-001 | FR-AUTH-02 | FE-002 AC-1 validation, lỗi chung | `POST /api/v1/auth/login` | `users` | QA-001, QA-002 |
| `/register` | 1:6144 / 1:52, 1:122 | Auth | BE-001, FE-002 | FR-AUTH-01 | FE-002 AC-1, role selector | `POST /api/v1/auth/register` | `users` (không có MSSV/Khoa) | QA-001 |
| Shell + 403/404/Error/Loading/Empty | 1:6187, 1:6341, 1:6701–1:6911 / (thiếu) | Auth, Shared states | DES-001, DES-002, FE-001, FE-002 | RBAC, route guard | PrivateRoute, catch-all, errorElement | `GET /api/v1/auth/me` | — | QA-002 |
| `/lecturer/courses` + modal | 1:6187, 1:6291 / 1:2431, 1:1465 | Course | BE-003, FE-002 AC-3 | FR-MAT-01/02 | CoursesPage, empty state, create modal | `/api/v1/courses` CRUD (BE-003; code: POST/GET/PUT/DELETE) | `courses` | QA-001 |
| `/lecturer/courses/:courseId/materials` | 1:6942, 1:7090, 1:7263 / 1:2258, 29:1106 | Materials | DES-003, DES-004, FE-003..005, BE-005, OPS-002 | FR-MAT-03..06, 4 statuses, retry, delete | Upload modal, bảng có lọc client-side, retry/delete | `POST /api/v1/courses/{courseId}/materials`, `GET /api/v1/courses/:courseId/materials`, `GET /api/v1/materials/:id`, `DELETE /api/v1/courses/:courseId/materials/:id`. **Retry: UNKNOWN** (OPD-012 gợi ý `POST /materials/{id}/retry`, chưa duyệt) | `teaching_materials`, `document_chunks` | QA-003, QA-004, QA-005 |
| RAG drawer | 1:7386 / 16:6 | RAG | DES-005, FE-006 | Inspect chunks | Drawer 520px, không lộ vector/prompt | **UNKNOWN** (chưa có endpoint đọc chunk trong tài liệu) | `document_chunks` | QA-006 |
| `/lecturer/courses/:courseId/cases` + generate | 1:7568, 1:7745, 1:7974 / 1:2583, 1:3088, 1:2939, 1:2818 | Case Generation | DES-006, FE-007, BE-015 | FR-GEN-01..06 | Lọc theo mode, modal/wizard (OPD-006), trạng thái progress/lỗi | `POST /api/v1/cases/generate` | `cases`, `case_nodes`, `case_options` | QA-007 |
| `/lecturer/cases/:caseId/review` | 1:8190, 1:8399, 1:8484 / 1:3219, 1:1444 | Case Review & Publishing | DES-007..009, FE-008..011, BE-016..019 | FR-REV-01..06 | Canvas ReactFlow, side panel, stepper, publish dialog + copy link | `GET/PUT /api/v1/cases/{caseId}`, `PUT /api/v1/cases/{caseId}/nodes/{nodeId}`, `POST /api/v1/cases/{caseId}/approve`, `POST /api/v1/cases/{caseId}/publish`. **Lưu ý: tài liệu có thêm `PATCH /api/v1/cases/:id/status`, cần thống nhất.** | `cases.status`, `cases.version` | QA-008, QA-009, QA-010 |
| `/student/cases/:caseId/branching-play` | 1:6341, 1:8652, 1:8703 / 1:972, 1:906, 1:880 | Branching Study | DES-010, FE-012, FE-013, BE-020..022 | Phase 1, resume, terminal | Không có form/consequence giữa các bước; tiến độ "Decision n" | `POST /api/v1/cases/{caseId}/branching-attempts`, `POST /api/v1/branching-attempts/{attemptId}/select`, `GET /api/v1/branching-attempts/{attemptId}`. **Resume: UNKNOWN** (OPD-003) | `branching_attempts`, `student_reasoning` | QA-011, QA-012 |
| `…/attempt/:attemptId/review` | 1:8745 / 1:619 | Journey Review + Reasoning | DES-011, FE-014, FE-015, BE-023, BE-024 | FR-BS-07 | Timeline, consequence reveal, reasoning 10–2000 ký tự | `GET /api/v1/cases/:id/branching-attempts/:attemptId/review`, `PATCH /api/v1/branching-attempts/{attemptId}/reasoning/{nodeId}` | `student_reasoning.reasoning_text` | QA-011 |
| `…/attempt/:attemptId/reflect` | 1:8832, 1:8884 / 1:545, 1:466, 1:790 | Reflection & Retry | DES-012, FE-016, FE-017, BE-024 | FR-BS-10 | Reflection read-only sau khi nộp; modal Retry; lịch sử lượt | `POST /api/v1/branching-attempts/{attemptId}/reflection` (tài liệu cũng có `PATCH …/reflection`, cần thống nhất). **Lịch sử lượt: UNKNOWN endpoint.** | `branching_attempts.reflection_*`, `attempt_number` | QA-013 |
| `/student/cases/:caseId/challenge/:sessionId` | 1:9357, 1:9408 / 27:321 | Challenge Support | DES-015, FE-021, BE-027 | FR-CS-*, ≤2 vòng | Round indicator, khóa sau vòng 2, không có ngôn ngữ chấm điểm | `POST /api/v1/challenge-support/start`, `POST /api/v1/challenge-support/{sessionId}/respond` | `challenge_support_sessions`, `challenge_messages` | QA-015 |
| `/student/cases/:caseId/review-study` | 1:8950, 1:8995 / 1:384 | Review Study | DES-013, FE-018, BE-025 | 1 submission/case | Form, read-only sau khi nộp | `POST /api/v1/cases/{caseId}/review-study/submissions` (tài liệu có thêm `…/review-study/submit`, cần thống nhất) | `review_study_submissions` (UNIQUE) | QA-014 |
| `…/review-study/:submissionId/feedback` | 1:9162 / 1:297 | Feedback + Reflection | DES-014, FE-020 | | Trạng thái chờ GV, phản tư | `POST /api/v1/review-study/submissions/{submissionId}/reflection` | idem | QA-014 |
| `/lecturer/cases/:caseId/feedback` | 1:9043 / 1:1852, 1:1702 | Lecturer Feedback | DES-014, FE-019, BE-026 | Feedback định tính | Master–detail, lọc client-side, không có ô điểm | `POST /api/v1/lecturer-feedback` | `lecturer_feedback` (`chk_feedback_one_target`) | QA-014 |
| `/lecturer/statistics` | 1:9213 / 1:1493 | Basic Statistics | DES-014, FE-022, BE-028 | FR-STAT-01..05 | KPI, phân bố nhánh, không xếp hạng | `GET /api/v1/cases/{caseId}/statistics` | Aggregate từ attempts/reasoning/submissions | UNKNOWN (không có task QA riêng; QA-016 cross-role) |
| Rubric (GV / Admin) | — / 1:2081, 1:4511 | Evaluation | **Không có** | FR-EVAL-01..05 | UNKNOWN | UNKNOWN | UNKNOWN (không có `case_evaluations`) | UNKNOWN |
| Màn sinh viên: Bàn học, Khóa học, Tham gia lớp | — / 1:1305, 1:1202, 1:1084 | (Không có feature) | **Không có** | OPD-001 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| Màn Admin (10) | — / 1:3715…1:4345 | (Không có feature spec) | **Không có** | OPD-015 | UNKNOWN | UNKNOWN | Chỉ có role `ADMIN` (V3) | UNKNOWN |
| Quên/đặt lại mật khẩu, email | — / 1:196…1:279, 26:78, 26:148 | Auth (Phase 2) | **Không có** | Phase 2 | — | — | — | — |
| Dashboard GV | — / 1:3490, 34:3183 | (Không có feature) | **Không có** | D-05 | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

---

## 4. Mâu thuẫn trong tài liệu cần làm rõ (không phải quyết định scope)

| # | Mâu thuẫn | Nguồn A | Nguồn B |
|:-:|---|---|---|
| C-1 | Có role Admin không | `00-project-foundation.md §1`, migration V3 | `feature-authentication.md` "not in MVP"; SITE-ARCH "two roles"; FR-AUTH-01 |
| C-2 | Refresh token | `feature-authentication.md` "refresh token rotation"; FE-001 AC-2 | BE-001 AC-2 chỉ nêu access token 8h |
| C-3 | Sinh case: modal hay wizard | DES-006, P1 §3 (modal) | Figma Page 1 (wizard), OPD-006 |
| C-4 | Challenge Support: trang riêng hay modal | SITE-ARCH §5.3 route riêng; Page 2 | OPD-005 đề xuất modal; Page 1 |
| C-5 | Sau khi xuất bản: tạo phiên bản hay khóa cấu trúc | DES-009 (Unpublish → v2) | OPD-007 Option A |
| C-6 | Endpoint đổi trạng thái case | `POST …/approve`, `POST …/publish` | `PATCH /cases/:id/status` |
| C-7 | Endpoint nộp Review Study / Reflection | `…/review-study/submissions`, `POST …/reflection` | `…/review-study/submit`, `PATCH …/reflection` |
| C-8 | Ngôn ngữ UI | `01-ui-design-standards §7` (Academic English) | Figma Page 1 (tiếng Việt) |
| C-9 | Proposal có Evaluation module + vai trò FE "Quantitative Evaluation UI" | Proposal §4, §9 | Backlog không có task nào |
| C-10 | Ngày bắt đầu sprint | Proposal Table 2: Sprint 1 từ 16/09/2026 | `01_MASTER-TASKS`: 07/10/2026 – 15/12/2026 (10 tuần) |
