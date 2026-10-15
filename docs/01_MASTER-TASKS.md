# EduBranch AI — Master Tasks Catalog (84 Tasks / 336 Story Points)

> **Dự án**: EduBranch AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh cho giáo dục đại học  
> **Nguồn quản trị gốc (Single Source of Truth)**: `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`  
> **Quy mô chuẩn hóa**: 4 Sprints cố định | 84 Master Tasks | 336 Story Points  
> **Thời gian thực thi**: 07/10/2026 – 15/12/2026 (10 tuần)  
> **Phạm vi nghiệp vụ**: Đại học / Sau đại học (Higher Education ONLY — Không áp dụng K-12)  

---

## 1. TỔNG QUAN PHÂN BỔ QUẢN TRỊ

### 1.1. Bảng phân bổ theo Sprint

| Sprint | Tên Sprint | Khung thời gian | Thời lượng | Số lượng Task | Tổng Story Points | Mục tiêu cốt lõi (Sprint Goal) |
|---|---|:---:|:---:|:---:|:---:|---|
| **Sprint 1** | Sprint 1 - Foundation | 07/10/2026 – 20/10/2026 | 2 tuần | 10 | 42 | Ổn định Auth, Role, Ownership, shared UX states và đóng băng FE/BE API contracts. |
| **Sprint 2** | Sprint 2 - Material & RAG | 21/10/2026 – 03/11/2026 | 2 tuần | 20 | 75 | Hoàn thiện pipeline upload tài liệu → MinIO → parsing → chunking → embedding → grounded retrieval. |
| **Sprint 3** | Sprint 3 - Case & Approval | 04/11/2026 – 17/11/2026 | 2 tuần | 19 | 81 | Tạo case draft từ grounded context và hoàn thiện quy trình giảng viên kiểm duyệt, phê duyệt và xuất bản. |
| **Sprint 4** | Sprint 4 - Learning & Review | 18/11/2026 – 15/12/2026 | 4 tuần | 35 | 138 | Hoàn thiện Student learning experience với Branching Study experience-first và Review Study độc lập; tích hợp hệ thống, UAT và release readiness. |
| **TỔNG CỘNG** | **4 Sprints** | **10 tuần** | **10 tuần** | **84** | **336** | **Hoàn thành toàn diện nền tảng EduBranch AI** |

---

### 1.2. Bảng phân bổ theo Nhóm chuyên môn (Role Distribution)

| Nhóm (Role) | Tên nhóm chuyên môn | Dải mã nhóm (Group ID) | Số lượng Task | Tổng Story Points | Tỷ trọng SP |
|:---:|---|:---:|:---:|:---:|:---:|
| **DES** | UI/UX Design & Prototyping (Figma) | `DES-001` → `DES-015` | 15 | 50 | 14.88% |
| **FE** | Frontend Web Application (React 19) | `FE-001` → `FE-022` | 22 | 86 | 25.60% |
| **BE** | Backend & AI Service (NestJS & FastAPI) | `BE-001` → `BE-028` (25 tasks) | 25 | 110 | 32.74% |
| **OPS** | DevOps, Cloud Storage & Vector DB | `OPS-001` → `OPS-003` | 3 | 11 | 3.27% |
| **QA** | Testing, Security & Quality Assurance | `QA-001` → `QA-019` | 19 | 79 | 23.51% |
| **TỔNG CỘNG** | **5 Nhóm chuyên môn** | **84 Tasks duy nhất** | **84** | **336** | **100.00%** |

---

### 1.3. Bảng chuẩn hóa đối soát 3 Task chuyển đổi OPS

| Master Task ID | Mã cũ | Mã chuẩn hóa (Group ID) | Tên Task Chuẩn Hóa | Sprint | SP | Trách nhiệm chuyên môn |
|:---:|:---:|:---:|---|:---:|:---:|---|
| **`EBA-108`** | `BE-004` | **`OPS-001`** | `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks` | Sprint 1 | 3 | Viết MigrationRunner tự động, advisory lock CSDL, kiểm tra biến môi trường và healthcheck vận hành. |
| **`EBA-209`** | `BE-006` | **`OPS-002`** | `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming` | Sprint 2 | 3 | Cấu hình hạ tầng lưu trữ Object Storage MinIO, quản lý bucket và bảo mật object key. |
| **`EBA-214`** | `BE-011` | **`OPS-003`** | `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing` | Sprint 2 | 5 | Tối ưu hóa hạ tầng cơ sở dữ liệu vector pgvector, cấu hình HNSW index và tuning tham số tìm kiếm. |

---

## 2. DANH MỤC 84 MASTER TASKS CHI TIẾT THEO SPRINT

### 🟢 SPRINT 1 — FOUNDATION (07/10/2026 – 20/10/2026 / 10 Tasks / 42 SP)

| Master Task ID | Group ID | Summary | Flow | Issue Type | Priority | SP | Dependencies (Master Task ID) | Trạng thái nguồn |
|:---:|:---:|---|:---:|:---:|:---:|:---:|---|:---:|
| **EBA-101** | `DES-001` | `[DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes` | Foundation | Task | Highest | 3 | *None* | DONE |
| **EBA-102** | `DES-002` | `[DES-002] Shared Design States: Loading, Empty, Error & Permissions` | Foundation | Task | High | 5 | is blocked by Master Task EBA-101 | DONE |
| **EBA-103** | `FE-001` | `[FE-001] Harden authStore, API Client, Route Guards & Session Expiration` | Foundation | Task | Highest | 5 | is blocked by Master Task EBA-101 | DONE |
| **EBA-104** | `FE-002` | `[FE-002] Align Login, Register & Portal Layouts with Permission Matrix` | Foundation | Task | High | 3 | is blocked by Master Task EBA-102, EBA-103 | IN PROGRESS |
| **EBA-105** | `BE-001` | `[BE-001] Implement User Registration, Login & JWT Token Management` | Foundation | Task | Highest | 5 | *None* | DONE |
| **EBA-106** | `BE-002` | `[BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard` | Foundation | Task | Highest | 5 | is blocked by Master Task EBA-105 | IN PROGRESS |
| **EBA-107** | `BE-003` | `[BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates` | Foundation | Task | Highest | 5 | is blocked by Master Task EBA-105, EBA-106 | DONE |
| **EBA-108** | `OPS-001` | `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks` | Foundation | Task | High | 3 | *None* | DONE |
| **EBA-109** | `QA-001` | `[QA-001] Test Matrix for Auth, Course & Permissions` | Foundation | Task | High | 3 | is blocked by Master Task EBA-105, EBA-107 | IN PROGRESS |
| **EBA-110** | `QA-002` | `[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite` | Foundation | Task | Highest | 5 | is blocked by Master Task EBA-103, EBA-106, EBA-107 | TO DO |

*Tổng kết Sprint 1: 10 tasks | 42 Story Points*

---

### 🟡 SPRINT 2 — MATERIAL & RAG (21/10/2026 – 03/11/2026 / 20 Tasks / 75 SP)

| Master Task ID | Group ID | Summary | Flow | Issue Type | Priority | SP | Dependencies (Master Task ID) | Trạng thái nguồn |
|:---:|:---:|---|:---:|:---:|:---:|:---:|---|:---:|
| **EBA-201** | `DES-003` | `[DES-003] Material Library & Upload Interaction Flow Design` | Flow 1 | Task | Highest | 3 | is blocked by Master Task EBA-102 | TO DO |
| **EBA-202** | `DES-004` | `[DES-004] Material Processing, Progress Bar & Failure Recovery States` | Flow 1 | Task | High | 3 | is blocked by Master Task EBA-201 | TO DO |
| **EBA-203** | `DES-005` | `[DES-005] RAG Grounding Evidence & Source Inspection UI Design` | Flow 1 | Task | High | 3 | is blocked by Master Task EBA-201 | TO DO |
| **EBA-204** | `FE-003` | `[FE-003] Implement Material Upload Modal with Client-Side Validation` | Flow 1 | Story | Highest | 3 | is blocked by Master Task EBA-201, EBA-107 | TO DO |
| **EBA-205** | `FE-004` | `[FE-004] Implement Materials Table with Metadata & Processing Status Indicators` | Flow 1 | Story | Highest | 5 | is blocked by Master Task EBA-202, EBA-204 | IN PROGRESS |
| **EBA-206** | `FE-005` | `[FE-005] Implement Material Delete & Failure Retry Actions with API Integration` | Flow 1 | Task | High | 3 | is blocked by Master Task EBA-205 | TO DO |
| **EBA-207** | `FE-006` | `[FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence` | Flow 1 | Task | High | 3 | is blocked by Master Task EBA-203 | TO DO |
| **EBA-208** | `BE-005` | `[BE-005] Implement Material CRUD & Ownership Authorization Gates` | Flow 1 | Story | Highest | 3 | is blocked by Master Task EBA-107 | IN PROGRESS |
| **EBA-209** | `OPS-002` | `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming` | Flow 1 | Task | Highest | 3 | is blocked by Master Task EBA-208 | IN PROGRESS |
| **EBA-210** | `BE-007` | `[BE-007] Implement PDF Document Parser with Text Extraction & Normalization` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-209 | IN PROGRESS |
| **EBA-211** | `BE-008` | `[BE-008] Implement DOCX Document Parser with Text Extraction & Normalization` | Flow 1 | Task | Highest | 3 | is blocked by Master Task EBA-209 | IN PROGRESS |
| **EBA-212** | `BE-009` | `[BE-009] Implement Recursive Document Chunking Pipeline` | Flow 1 | Task | Highest | 3 | is blocked by Master Task EBA-210, EBA-211 | IN PROGRESS |
| **EBA-213** | `BE-010` | `[BE-010] Implement Vector Embedding Generation via Provider Abstraction` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-212 | IN PROGRESS |
| **EBA-214** | `OPS-003` | `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-213 | IN PROGRESS |
| **EBA-215** | `BE-012` | `[BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-214 | IN PROGRESS |
| **EBA-216** | `BE-013` | `[BE-013] Fix Material Controller Spec Mock Data for Ownership Regression` | Flow 1 | Bug | High | 2 | is blocked by Master Task EBA-208 | IN PROGRESS |
| **EBA-217** | `QA-003` | `[QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds` | Flow 1 | Task | High | 3 | is blocked by Master Task EBA-204, EBA-208 | TO DO |
| **EBA-218** | `QA-004` | `[QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-208, EBA-209 | TO DO |
| **EBA-219** | `QA-005` | `[QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-214 | TO DO |
| **EBA-220** | `QA-006` | `[QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing` | Flow 1 | Task | Highest | 5 | is blocked by Master Task EBA-215 | TO DO |

*Tổng kết Sprint 2: 20 tasks | 75 Story Points*

---

### 🟠 SPRINT 3 — CASE & APPROVAL (04/11/2026 – 17/11/2026 / 19 Tasks / 81 SP)

| Master Task ID | Group ID | Summary | Flow | Issue Type | Priority | SP | Dependencies (Master Task ID) | Trạng thái nguồn |
|:---:|:---:|---|:---:|:---:|:---:|:---:|---|:---:|
| **EBA-301** | `DES-006` | `[DES-006] Case Generation Modal & Parameter Configuration Flow Design` | Flow 2 | Task | Highest | 3 | is blocked by Master Task EBA-203 | TO DO |
| **EBA-302** | `DES-007` | `[DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-301 | TO DO |
| **EBA-303** | `DES-008` | `[DES-008] Side-by-Side Node & Option Form Editor UX Design` | Flow 2 | Task | Highest | 3 | is blocked by Master Task EBA-302 | TO DO |
| **EBA-304** | `DES-009` | `[DES-009] Case Governance Lifecycle Action Bar & Approval Status Design` | Flow 2 | Task | Highest | 3 | is blocked by Master Task EBA-302 | TO DO |
| **EBA-305** | `FE-007` | `[FE-007] Implement Case Generation Trigger Modal & Progress Tracking` | Flow 2 | Story | Highest | 3 | is blocked by Master Task EBA-301, EBA-205 | TO DO |
| **EBA-306** | `FE-008` | `[FE-008] Implement ReactFlow Decision Tree Visual Canvas Component` | Flow 2 | Story | Highest | 5 | is blocked by Master Task EBA-302, EBA-305 | IN PROGRESS |
| **EBA-307** | `FE-009` | `[FE-009] Implement Interactive Node, Option & Consequence Editor Form` | Flow 2 | Story | Highest | 5 | is blocked by Master Task EBA-303, EBA-306 | TO DO |
| **EBA-308** | `FE-010` | `[FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)` | Flow 2 | Story | High | 5 | is blocked by Master Task EBA-307 | TO DO |
| **EBA-309** | `FE-011` | `[FE-011] Implement Case Approval State Transition Workflow UI` | Flow 2 | Story | Highest | 3 | is blocked by Master Task EBA-304, EBA-307 | TO DO |
| **EBA-310** | `BE-014` | `[BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-215 | IN PROGRESS |
| **EBA-311** | `BE-015` | `[BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-310 | IN PROGRESS |
| **EBA-312** | `BE-016` | `[BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback` | Flow 2 | Story | Highest | 5 | is blocked by Master Task EBA-311 | IN PROGRESS |
| **EBA-313** | `BE-017` | `[BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check` | Flow 2 | Story | Highest | 5 | is blocked by Master Task EBA-312 | IN PROGRESS |
| **EBA-314** | `BE-018` | `[BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)` | Flow 2 | Story | Highest | 5 | is blocked by Master Task EBA-313 | IN PROGRESS |
| **EBA-315** | `BE-019` | `[BE-019] Implement Database-Level Student Access Gate for Published-Only Cases` | Flow 2 | Task | Highest | 3 | is blocked by Master Task EBA-314 | IN PROGRESS |
| **EBA-316** | `QA-007` | `[QA-007] Contract & Schema Validation Tests for AI Case Generation Output` | Flow 2 | Task | High | 3 | is blocked by Master Task EBA-310, EBA-311 | TO DO |
| **EBA-317** | `QA-008` | `[QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-310, EBA-313 | TO DO |
| **EBA-318** | `QA-009` | `[QA-009] State Machine & Lifecycle Transition Boundary Test Suite` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-314 | TO DO |
| **EBA-319** | `QA-010` | `[QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases` | Flow 2 | Task | Highest | 5 | is blocked by Master Task EBA-315 | TO DO |

*Tổng kết Sprint 3: 19 tasks | 81 Story Points*

---

### 🔵 SPRINT 4 — LEARNING & REVIEW (18/11/2026 – 15/12/2026 / 35 Tasks / 138 SP)

| Master Task ID | Group ID | Summary | Flow | Issue Type | Priority | SP | Dependencies (Master Task ID) | Trạng thái nguồn |
|:---:|:---:|---|:---:|:---:|:---:|:---:|---|:---:|
| **EBA-401** | `DES-010` | `[DES-010] Branching Case Player Experience-First UI/UX Design` | Branching Study | Task | Highest | 3 | is blocked by Master Task EBA-309 | TO DO |
| **EBA-402** | `DES-011` | `[DES-011] Journey Review Path Visualization & Consequence Reveal Design` | Branching Study | Task | Highest | 5 | is blocked by Master Task EBA-401 | TO DO |
| **EBA-403** | `DES-012` | `[DES-012] Retry & New Attempt Initiation UX Design` | Branching Study | Task | High | 2 | is blocked by Master Task EBA-402 | TO DO |
| **EBA-404** | `DES-013` | `[DES-013] Review Study Open Analysis & Solution Proposal UI Design` | Review Study | Task | High | 3 | is blocked by Master Task EBA-102 | TO DO |
| **EBA-405** | `DES-014` | `[DES-014] Lecturer Qualitative Feedback & Review Dashboard Design` | Review Study | Task | High | 3 | is blocked by Master Task EBA-404 | TO DO |
| **EBA-406** | `DES-015` | `[DES-015] AI Challenge Support Socratic Interaction UI Design` | Challenge Support | Task | High | 3 | is blocked by Master Task EBA-402, EBA-404 | TO DO |
| **EBA-407** | `FE-012` | `[FE-012] Implement Continuous Branching Case Player Component` | Branching Study | Story | Highest | 5 | is blocked by Master Task EBA-401, EBA-309 | IN PROGRESS |
| **EBA-408** | `FE-013` | `[FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review` | Branching Study | Story | Highest | 3 | is blocked by Master Task EBA-407 | IN PROGRESS |
| **EBA-409** | `FE-014` | `[FE-014] Implement Journey Review Replay Canvas with Consequence Reveal` | Branching Study | Story | Highest | 5 | is blocked by Master Task EBA-402, EBA-408 | IN PROGRESS |
| **EBA-410** | `FE-015` | `[FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions` | Branching Study | Story | Highest | 3 | is blocked by Master Task EBA-409 | IN PROGRESS |
| **EBA-411** | `FE-016` | `[FE-016] Implement Retry Action Generating New Independent Branching Attempt` | Branching Study | Story | High | 3 | is blocked by Master Task EBA-409 | IN PROGRESS |
| **EBA-412** | `FE-017` | `[FE-017] Implement Post-Review Overall Reflection Submission Page` | Branching Study | Story | Highest | 3 | is blocked by Master Task EBA-410 | IN PROGRESS |
| **EBA-413** | `FE-018` | `[FE-018] Implement Review Study Independent Analysis & Submission Page` | Review Study | Story | High | 5 | is blocked by Master Task EBA-404 | IN PROGRESS |
| **EBA-414** | `FE-019` | `[FE-019] Implement Lecturer Feedback Dashboard & Submission Review View` | Lecturer Feedback | Story | High | 5 | is blocked by Master Task EBA-405, EBA-413 | IN PROGRESS |
| **EBA-415** | `FE-020` | `[FE-020] Implement Student Review Feedback & Reflection Workflow` | Review Study | Story | High | 3 | is blocked by Master Task EBA-414 | IN PROGRESS |
| **EBA-416** | `FE-021` | `[FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)` | Challenge Support | Story | High | 5 | is blocked by Master Task EBA-406, EBA-410 | IN PROGRESS |
| **EBA-417** | `FE-022` | `[FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts` | Statistics | Story | High | 3 | is blocked by Master Task EBA-408 | IN PROGRESS |
| **EBA-418** | `BE-020` | `[BE-020] Implement Branching Attempt Initialization & Resumption APIs` | Branching Study | Story | Highest | 5 | is blocked by Master Task EBA-309 | IN PROGRESS |
| **EBA-419** | `BE-021` | `[BE-021] Implement Real-Time Option Selection & Path Traversal Persistence` | Branching Study | Story | Highest | 5 | is blocked by Master Task EBA-418 | IN PROGRESS |
| **EBA-420** | `BE-022` | `[BE-022] Implement Terminal Node Completion & Outcome Recording API` | Branching Study | Story | Highest | 3 | is blocked by Master Task EBA-419 | IN PROGRESS |
| **EBA-421** | `BE-023` | `[BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API` | Branching Study | Story | Highest | 5 | is blocked by Master Task EBA-420 | IN PROGRESS |
| **EBA-422** | `BE-024` | `[BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs` | Branching Study | Story | Highest | 3 | is blocked by Master Task EBA-421 | IN PROGRESS |
| **EBA-423** | `BE-025` | `[BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate` | Review Study | Story | High | 5 | is blocked by Master Task EBA-309 | IN PROGRESS |
| **EBA-424** | `BE-026` | `[BE-026] Implement Lecturer Feedback Authoring & Status Progression API` | Lecturer Feedback | Story | High | 5 | is blocked by Master Task EBA-423 | IN PROGRESS |
| **EBA-425** | `BE-027` | `[BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer` | Challenge Support | Story | High | 5 | is blocked by Master Task EBA-422, EBA-423 | IN PROGRESS |
| **EBA-426** | `BE-028` | `[BE-028] Implement Learning-Flow Statistics Aggregation Queries` | Statistics | Story | High | 5 | is blocked by Master Task EBA-420, EBA-423 | IN PROGRESS |
| **EBA-427** | `QA-011` | `[QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review` | Branching Study | Task | Highest | 5 | is blocked by Master Task EBA-408, EBA-421 | TO DO |
| **EBA-428** | `QA-012` | `[QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence` | Branching Study | Task | Highest | 3 | is blocked by Master Task EBA-407, EBA-419 | TO DO |
| **EBA-429** | `QA-013` | `[QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation` | Branching Study | Task | High | 3 | is blocked by Master Task EBA-411, EBA-418 | TO DO |
| **EBA-430** | `QA-014` | `[QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection` | Review Study | Task | High | 5 | is blocked by Master Task EBA-414, EBA-424 | TO DO |
| **EBA-431** | `QA-015` | `[QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)` | Challenge Support | Task | High | 3 | is blocked by Master Task EBA-416, EBA-425 | TO DO |
| **EBA-432** | `QA-016` | `[QA-016] Cross-Role Integration, Security & Performance Load Testing` | Release | Task | High | 5 | is blocked by Master Task EBA-427, EBA-430 | TO DO |
| **EBA-433** | `QA-017` | `[QA-017] User Acceptance Testing (UAT) Execution & Defect Triage` | Release | Task | Highest | 5 | is blocked by Master Task EBA-432 | TO DO |
| **EBA-434** | `QA-018` | `[QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit` | Release | Task | High | 3 | is blocked by Master Task EBA-427 | TO DO |
| **EBA-435** | `QA-019` | `[QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests` | Release | Task | Highest | 3 | is blocked by Master Task EBA-433, EBA-434 | TO DO |

*Tổng kết Sprint 4: 35 tasks | 138 Story Points*

---

## 3. NGUYÊN TẮC QUẢN TRỊ TRÊN JIRA SOFTWARE

1. **Phân biệt Master Task ID vs. Jira Issue Key**:
   - `Master Task ID` (`EBA-101` → `EBA-435`) là mã định danh quản trị xuyên suốt dự án trong toàn bộ tài liệu đặc tả.
   - Khi nhập lên Jira, Jira sẽ tự động sinh `Jira Issue Key` (ví dụ: `EB-1`, `EB-2` hoặc `EBA-1` tùy project setting).
   - **Tuyệt đối không đưa mã `[EBA-###]` vào trường Summary trên Jira** để tránh trùng lặp hiển thị. Cú pháp Summary chuẩn là: `[GROUP-###] Work name`.
2. **Thiết lập liên kết phụ thuộc (Issue Linking)**:
   - Cột `Dependencies (Master Task ID)` chỉ ra task tiền đề.
   - Khi nhập lên Jira: Sử dụng tính năng **Linked Issues → "is blocked by"** và trỏ tới **Jira Issue Key thực tế** đã được tạo trước đó.
3. **Quy chuẩn cập nhật trạng thái**:
   - Các task `DONE` thuộc Sprint 1 phản ánh baseline kỹ thuật đã hoàn thành và kiểm thử nghiêm ngặt (63 unit tests, 11 HTTP security E2E tests). Riêng task `FE-002` được chuyển trạng thái sang `IN PROGRESS` nhằm thực hiện và nghiệm thu riêng biệt 2 tiêu chuẩn Route 404 Catch-All và React Router Error Boundary.
   - Các task `IN PROGRESS` và `TO DO` thuộc Sprint 2, 3, 4 sẽ được phân bổ và thực thi theo đúng kế hoạch Sprint.

---

## 4. HẠNG MỤC VẬN HÀNH & TÍNH NĂNG NGOÀI PHẠM VI (POST-MVP / NGOÀI 4 SPRINTS)

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

## 5. NGUYÊN TẮC QUẢN TRỊ TAM PHÂN BẮT BUỘC (TRI-LEVEL VERIFICATION PRINCIPLE)

Xuyên suốt quá trình phát triển 4 Sprints của EduBranch AI, toàn bộ đội ngũ và AI Assistant bắt buộc phải tuân thủ nghiêm ngặt nguyên tắc tam phân:

```text
Acceptance Criteria (Đặc tả)  ≠  Implementation (Mã nguồn)  ≠  Verified Evidence (Bằng chứng kiểm thử)
```

1. **Acceptance Criteria (AC)**: Tiêu chuẩn nghiệm thu được quy định trong `03_TASK-DETAILS.md`. Việc bổ sung hay hoàn thiện AC chỉ phản ánh mục tiêu thiết kế và điều kiện bàn giao, **tuyệt đối không tự chứng minh rằng mã nguồn đã đáp ứng**.
2. **Implementation (Code)**: Mã nguồn được lập trình trong NestJS, React 19 hoặc FastAPI. Việc code đã tồn tại **chưa đồng nghĩa với việc tính năng chạy đúng mọi trường hợp biên, bảo mật và sẵn sàng**.
3. **Verified Evidence (Test)**: Bằng chứng xác thực độc lập thông qua Unit Test (Jest/pytest), HTTP E2E Security Test (Supertest) hoặc biên bản kiểm thử thực tế. **Một task chỉ được phép chuyển sang trạng thái DONE trên Jira khi có đầy đủ Verified Evidence tương ứng**.
