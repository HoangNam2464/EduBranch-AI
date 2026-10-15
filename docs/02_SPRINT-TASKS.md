# EduBranch-AI — Sprint Tasks Tree & Role Breakdown (84 Tasks / 336 Story Points)

> **Dự án**: EduBranch-AI — Nền tảng học tập trải nghiệm tình huống rẽ nhánh & phân tích phản biện  
> **Nguồn quản trị gốc**: `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`  
> **Cơ cấu chuẩn hóa**: 5 Nhóm chuyên môn (DES, FE, BE, OPS, QA) | 84 Tasks | 336 Story Points  
> **Phạm vi nghiệp vụ**: Quá trình học tập tình huống thực nghiệm & ra quyết định (EduBranch-AI)  

---

## 1. TỔNG QUAN PHÂN BỔ THEO 5 NHÓM CHUYÊN MÔN

```text
EduBranch AI (84 Tasks / 336 Story Points)
├── DES (UI/UX Design - Figma)          : 15 tasks /  50 SP (14.88%)
├── FE  (Frontend Web - React 19)       : 22 tasks /  86 SP (25.60%)
├── BE  (Backend Gateway & AI Service)  : 25 tasks / 110 SP (32.74%)
├── OPS (DevOps, MinIO & pgvector HNSW) :  3 tasks /  11 SP ( 3.27%)
└── QA  (Quality Assurance & Security)  : 19 tasks /  79 SP (23.51%)
```

### Ma trận phân bổ nhóm chuyên môn theo từng Sprint

| Nhóm chuyên môn | Sprint 1 (Foundation) | Sprint 2 (Material & RAG) | Sprint 3 (Case & Approval) | Sprint 4 (Learning & Review) | Tổng số Task | Tổng Story Points |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **DES (Design)** | 2 tasks (8 SP) | 3 tasks (9 SP) | 4 tasks (14 SP) | 6 tasks (19 SP) | **15 tasks** | **50 SP** |
| **FE (Frontend)** | 2 tasks (8 SP) | 4 tasks (14 SP) | 5 tasks (21 SP) | 11 tasks (43 SP) | **22 tasks** | **86 SP** |
| **BE (Backend & AI)** | 3 tasks (15 SP) | 7 tasks (28 SP) | 6 tasks (28 SP) | 9 tasks (39 SP) | **25 tasks** | **110 SP** |
| **OPS (DevOps/Infra)**| 1 task (3 SP) | 2 tasks (8 SP) | 0 tasks (0 SP) | 0 tasks (0 SP) | **3 tasks** | **11 SP** |
| **QA (Quality/Test)** | 2 tasks (8 SP) | 4 tasks (16 SP) | 4 tasks (18 SP) | 9 tasks (37 SP) | **19 tasks** | **79 SP** |
| **TỔNG CỘNG** | **10 tasks / 42 SP** | **20 tasks / 75 SP** | **19 tasks / 81 SP** | **35 tasks / 138 SP** | **84 tasks** | **336 SP** |

---

## 2.1. NHÓM DES — UI/UX DESIGN & PROTOTYPING (FIGMA)

> **Quy mô**: **15 tasks** | **50 Story Points**  
> **Mô tả trọng tâm**: Chịu trách nhiệm toàn bộ hệ thống nhận diện giao diện, Design System chuẩn học thuật đại học, Design Tokens, wireframes và clickable prototypes cho 2 cổng Lecturer Portal và Student Portal.

### Cây phân rã công việc theo Sprint

```text
DES Module Tree (15 tasks / 50 SP)
├── Sprint 1 (2 tasks, 8 SP)
│   ├── [DES-001] (EBA-101) : Information Architecture for Lecturer, Student & Dual Learning Modes [3 SP]
│   ├── [DES-002] (EBA-102) : Shared Design States: Loading, Empty, Error & Permissions [5 SP]
├── Sprint 2 (3 tasks, 9 SP)
│   ├── [DES-003] (EBA-201) : Material Library & Upload Interaction Flow Design [3 SP]
│   ├── [DES-004] (EBA-202) : Material Processing, Progress Bar & Failure Recovery States [3 SP]
│   ├── [DES-005] (EBA-203) : RAG Grounding Evidence & Source Inspection UI Design [3 SP]
├── Sprint 3 (4 tasks, 14 SP)
│   ├── [DES-006] (EBA-301) : Case Generation Modal & Parameter Configuration Flow Design [3 SP]
│   ├── [DES-007] (EBA-302) : ReactFlow Decision Tree Visualization & Topology Layout Design [5 SP]
│   ├── [DES-008] (EBA-303) : Side-by-Side Node & Option Form Editor UX Design [3 SP]
│   ├── [DES-009] (EBA-304) : Case Governance Lifecycle Action Bar & Approval Status Design [3 SP]
├── Sprint 4 (6 tasks, 19 SP)
│   ├── [DES-010] (EBA-401) : Branching Case Player Experience-First UI/UX Design [3 SP]
│   ├── [DES-011] (EBA-402) : Journey Review Path Visualization & Consequence Reveal Design [5 SP]
│   ├── [DES-012] (EBA-403) : Retry & New Attempt Initiation UX Design [2 SP]
│   ├── [DES-013] (EBA-404) : Review Study Open Analysis & Solution Proposal UI Design [3 SP]
│   ├── [DES-014] (EBA-405) : Lecturer Qualitative Feedback & Review Dashboard Design [3 SP]
│   ├── [DES-015] (EBA-406) : AI Challenge Support Socratic Interaction UI Design [3 SP]
```

### Bảng danh mục công việc nhóm DES

| Group ID | Master Task ID | Sprint | Priority | SP | Dependencies (Master Task ID) | Tên công việc & Tóm tắt mục tiêu |
|:---:|:---:|:---:|:---:|:---:|---|---|
| `DES-001` | **EBA-101** | Sprint 1 | Highest | 3 | *None* | **[DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes** |
| `DES-002` | **EBA-102** | Sprint 1 | High | 5 | is blocked by Master Task EBA-101 | **[DES-002] Shared Design States: Loading, Empty, Error & Permissions** |
| `DES-003` | **EBA-201** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-102 | **[DES-003] Material Library & Upload Interaction Flow Design** |
| `DES-004` | **EBA-202** | Sprint 2 | High | 3 | is blocked by Master Task EBA-201 | **[DES-004] Material Processing, Progress Bar & Failure Recovery States** |
| `DES-005` | **EBA-203** | Sprint 2 | High | 3 | is blocked by Master Task EBA-201 | **[DES-005] RAG Grounding Evidence & Source Inspection UI Design** |
| `DES-006` | **EBA-301** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-203 | **[DES-006] Case Generation Modal & Parameter Configuration Flow Design** |
| `DES-007` | **EBA-302** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-301 | **[DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design** |
| `DES-008` | **EBA-303** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-302 | **[DES-008] Side-by-Side Node & Option Form Editor UX Design** |
| `DES-009` | **EBA-304** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-302 | **[DES-009] Case Governance Lifecycle Action Bar & Approval Status Design** |
| `DES-010` | **EBA-401** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-309 | **[DES-010] Branching Case Player Experience-First UI/UX Design** |
| `DES-011` | **EBA-402** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-401 | **[DES-011] Journey Review Path Visualization & Consequence Reveal Design** |
| `DES-012` | **EBA-403** | Sprint 4 | High | 2 | is blocked by Master Task EBA-402 | **[DES-012] Retry & New Attempt Initiation UX Design** |
| `DES-013` | **EBA-404** | Sprint 4 | High | 3 | is blocked by Master Task EBA-102 | **[DES-013] Review Study Open Analysis & Solution Proposal UI Design** |
| `DES-014` | **EBA-405** | Sprint 4 | High | 3 | is blocked by Master Task EBA-404 | **[DES-014] Lecturer Qualitative Feedback & Review Dashboard Design** |
| `DES-015` | **EBA-406** | Sprint 4 | High | 3 | is blocked by Master Task EBA-402, EBA-404 | **[DES-015] AI Challenge Support Socratic Interaction UI Design** |

---

## 2.2. NHÓM FE — FRONTEND WEB APPLICATION (REACT 19)

> **Quy mô**: **22 tasks** | **86 Story Points**  
> **Mô tả trọng tâm**: Chịu trách nhiệm xây dựng giao diện ứng dụng React 19 + TypeScript + Vite + TailwindCSS v4, state management qua Zustand, tích hợp trực quan hóa cây quyết định bằng ReactFlow, và kết nối REST API Gateway.

### Cây phân rã công việc theo Sprint

```text
FE Module Tree (22 tasks / 86 SP)
├── Sprint 1 (2 tasks, 8 SP)
│   ├── [FE-001] (EBA-103) : Harden authStore, API Client, Route Guards & Session Expiration [5 SP]
│   ├── [FE-002] (EBA-104) : Align Login, Register & Portal Layouts with Permission Matrix [3 SP]
├── Sprint 2 (4 tasks, 14 SP)
│   ├── [FE-003] (EBA-204) : Implement Material Upload Modal with Client-Side Validation [3 SP]
│   ├── [FE-004] (EBA-205) : Implement Materials Table with Metadata & Processing Status Indicators [5 SP]
│   ├── [FE-005] (EBA-206) : Implement Material Delete & Failure Retry Actions with API Integration [3 SP]
│   ├── [FE-006] (EBA-207) : Implement RAG Source Chunk Viewer Modal for Grounded Evidence [3 SP]
├── Sprint 3 (5 tasks, 21 SP)
│   ├── [FE-007] (EBA-305) : Implement Case Generation Trigger Modal & Progress Tracking [3 SP]
│   ├── [FE-008] (EBA-306) : Implement ReactFlow Decision Tree Visual Canvas Component [5 SP]
│   ├── [FE-009] (EBA-307) : Implement Interactive Node, Option & Consequence Editor Form [5 SP]
│   ├── [FE-010] (EBA-308) : Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking) [5 SP]
│   ├── [FE-011] (EBA-309) : Implement Case Approval State Transition Workflow UI [3 SP]
├── Sprint 4 (11 tasks, 43 SP)
│   ├── [FE-012] (EBA-407) : Implement Continuous Branching Case Player Component [5 SP]
│   ├── [FE-013] (EBA-408) : Implement Attempt Terminal Detection & Navigation to Journey Review [3 SP]
│   ├── [FE-014] (EBA-409) : Implement Journey Review Replay Canvas with Consequence Reveal [5 SP]
│   ├── [FE-015] (EBA-410) : Implement Retrospective Reasoning Capture on Pivotal Decisions [3 SP]
│   ├── [FE-016] (EBA-411) : Implement Retry Action Generating New Independent Branching Attempt [3 SP]
│   ├── [FE-017] (EBA-412) : Implement Post-Review Overall Reflection Submission Page [3 SP]
│   ├── [FE-018] (EBA-413) : Implement Review Study Independent Analysis & Submission Page [5 SP]
│   ├── [FE-019] (EBA-414) : Implement Lecturer Feedback Dashboard & Submission Review View [5 SP]
│   ├── [FE-020] (EBA-415) : Implement Student Review Feedback & Reflection Workflow [3 SP]
│   ├── [FE-021] (EBA-416) : Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds) [5 SP]
│   ├── [FE-022] (EBA-417) : Implement Learning-Flow Statistics Dashboard with Visual Charts [3 SP]
```

### Bảng danh mục công việc nhóm FE

| Group ID | Master Task ID | Sprint | Priority | SP | Dependencies (Master Task ID) | Tên công việc & Tóm tắt mục tiêu |
|:---:|:---:|:---:|:---:|:---:|---|---|
| `FE-001` | **EBA-103** | Sprint 1 | Highest | 5 | is blocked by Master Task EBA-101 | **[FE-001] Harden authStore, API Client, Route Guards & Session Expiration** |
| `FE-002` | **EBA-104** | Sprint 1 | High | 3 | is blocked by Master Task EBA-102, EBA-103 | **[FE-002] Align Login, Register & Portal Layouts with Permission Matrix** |
| `FE-003` | **EBA-204** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-201, EBA-107 | **[FE-003] Implement Material Upload Modal with Client-Side Validation** |
| `FE-004` | **EBA-205** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-202, EBA-204 | **[FE-004] Implement Materials Table with Metadata & Processing Status Indicators** |
| `FE-005` | **EBA-206** | Sprint 2 | High | 3 | is blocked by Master Task EBA-205 | **[FE-005] Implement Material Delete & Failure Retry Actions with API Integration** |
| `FE-006` | **EBA-207** | Sprint 2 | High | 3 | is blocked by Master Task EBA-203 | **[FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence** |
| `FE-007` | **EBA-305** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-301, EBA-205 | **[FE-007] Implement Case Generation Trigger Modal & Progress Tracking** |
| `FE-008` | **EBA-306** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-302, EBA-305 | **[FE-008] Implement ReactFlow Decision Tree Visual Canvas Component** |
| `FE-009` | **EBA-307** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-303, EBA-306 | **[FE-009] Implement Interactive Node, Option & Consequence Editor Form** |
| `FE-010` | **EBA-308** | Sprint 3 | High | 5 | is blocked by Master Task EBA-307 | **[FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking)** |
| `FE-011` | **EBA-309** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-304, EBA-307 | **[FE-011] Implement Case Approval State Transition Workflow UI** |
| `FE-012` | **EBA-407** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-401, EBA-309 | **[FE-012] Implement Continuous Branching Case Player Component** |
| `FE-013` | **EBA-408** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-407 | **[FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review** |
| `FE-014` | **EBA-409** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-402, EBA-408 | **[FE-014] Implement Journey Review Replay Canvas with Consequence Reveal** |
| `FE-015` | **EBA-410** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-409 | **[FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions** |
| `FE-016` | **EBA-411** | Sprint 4 | High | 3 | is blocked by Master Task EBA-409 | **[FE-016] Implement Retry Action Generating New Independent Branching Attempt** |
| `FE-017` | **EBA-412** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-410 | **[FE-017] Implement Post-Review Overall Reflection Submission Page** |
| `FE-018` | **EBA-413** | Sprint 4 | High | 5 | is blocked by Master Task EBA-404 | **[FE-018] Implement Review Study Independent Analysis & Submission Page** |
| `FE-019` | **EBA-414** | Sprint 4 | High | 5 | is blocked by Master Task EBA-405, EBA-413 | **[FE-019] Implement Lecturer Feedback Dashboard & Submission Review View** |
| `FE-020` | **EBA-415** | Sprint 4 | High | 3 | is blocked by Master Task EBA-414 | **[FE-020] Implement Student Review Feedback & Reflection Workflow** |
| `FE-021` | **EBA-416** | Sprint 4 | High | 5 | is blocked by Master Task EBA-406, EBA-410 | **[FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds)** |
| `FE-022` | **EBA-417** | Sprint 4 | High | 3 | is blocked by Master Task EBA-408 | **[FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts** |

---

## 2.3. NHÓM BE — BACKEND GATEWAY & FASTAPI AI SERVICE

> **Quy mô**: **25 tasks** | **110 Story Points**  
> **Mô tả trọng tâm**: Chịu trách nhiệm REST API Gateway (NestJS 10 + TypeScript), kiến trúc JWT Guards / RBAC / Ownership, và FastAPI AI Service (Python 3.12) xử lý RAG ingestion, LLM case generation, validation graph cycle.

### Cây phân rã công việc theo Sprint

```text
BE Module Tree (25 tasks / 110 SP)
├── Sprint 1 (3 tasks, 15 SP)
│   ├── [BE-001] (EBA-105) : Implement User Registration, Login & JWT Token Management [5 SP]
│   ├── [BE-002] (EBA-106) : Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard [5 SP]
│   ├── [BE-003] (EBA-107) : User Profile & Course Management Foundation with Lecturer Ownership Gates [5 SP]
├── Sprint 2 (7 tasks, 26 SP)
│   ├── [BE-005] (EBA-208) : Implement Material CRUD & Ownership Authorization Gates [3 SP]
│   ├── [BE-007] (EBA-210) : Implement PDF Document Parser with Text Extraction & Normalization [5 SP]
│   ├── [BE-008] (EBA-211) : Implement DOCX Document Parser with Text Extraction & Normalization [3 SP]
│   ├── [BE-009] (EBA-212) : Implement Recursive Document Chunking Pipeline [3 SP]
│   ├── [BE-010] (EBA-213) : Implement Vector Embedding Generation via Provider Abstraction [5 SP]
│   ├── [BE-012] (EBA-215) : Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping [5 SP]
│   ├── [BE-013] (EBA-216) : Fix Material Controller Spec Mock Data for Ownership Regression [2 SP]
├── Sprint 3 (6 tasks, 28 SP)
│   ├── [BE-014] (EBA-310) : Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator [5 SP]
│   ├── [BE-015] (EBA-311) : Implement AI Case Generation Service with Grounded Syllabus Prompting [5 SP]
│   ├── [BE-016] (EBA-312) : Implement Multi-Table Decision Tree Persistence with Transaction Rollback [5 SP]
│   ├── [BE-017] (EBA-313) : Implement Case Node & Option CRUD APIs with Topology Integrity Check [5 SP]
│   ├── [BE-018] (EBA-314) : Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED) [5 SP]
│   ├── [BE-019] (EBA-315) : Implement Database-Level Student Access Gate for Published-Only Cases [3 SP]
├── Sprint 4 (9 tasks, 41 SP)
│   ├── [BE-020] (EBA-418) : Implement Branching Attempt Initialization & Resumption APIs [5 SP]
│   ├── [BE-021] (EBA-419) : Implement Real-Time Option Selection & Path Traversal Persistence [5 SP]
│   ├── [BE-022] (EBA-420) : Implement Terminal Node Completion & Outcome Recording API [3 SP]
│   ├── [BE-023] (EBA-421) : Implement Journey Review Data Assembly & Consequence Unlocking API [5 SP]
│   ├── [BE-024] (EBA-422) : Implement Retrospective Reasoning Update & Reflection Submission APIs [3 SP]
│   ├── [BE-025] (EBA-423) : Implement Review Study Submission Lifecycle & Unique Student Gate [5 SP]
│   ├── [BE-026] (EBA-424) : Implement Lecturer Feedback Authoring & Status Progression API [5 SP]
│   ├── [BE-027] (EBA-425) : Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer [5 SP]
│   ├── [BE-028] (EBA-426) : Implement Learning-Flow Statistics Aggregation Queries [5 SP]
```

### Bảng danh mục công việc nhóm BE

| Group ID | Master Task ID | Sprint | Priority | SP | Dependencies (Master Task ID) | Tên công việc & Tóm tắt mục tiêu |
|:---:|:---:|:---:|:---:|:---:|---|---|
| `BE-001` | **EBA-105** | Sprint 1 | Highest | 5 | *None* | **[BE-001] Implement User Registration, Login & JWT Token Management** |
| `BE-002` | **EBA-106** | Sprint 1 | Highest | 5 | is blocked by Master Task EBA-105 | **[BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard** |
| `BE-003` | **EBA-107** | Sprint 1 | Highest | 5 | is blocked by Master Task EBA-105, EBA-106 | **[BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates** |
| `BE-005` | **EBA-208** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-107 | **[BE-005] Implement Material CRUD & Ownership Authorization Gates** |
| `BE-007` | **EBA-210** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-209 | **[BE-007] Implement PDF Document Parser with Text Extraction & Normalization** |
| `BE-008` | **EBA-211** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-209 | **[BE-008] Implement DOCX Document Parser with Text Extraction & Normalization** |
| `BE-009` | **EBA-212** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-210, EBA-211 | **[BE-009] Implement Recursive Document Chunking Pipeline** |
| `BE-010` | **EBA-213** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-212 | **[BE-010] Implement Vector Embedding Generation via Provider Abstraction** |
| `BE-012` | **EBA-215** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-214 | **[BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping** |
| `BE-013` | **EBA-216** | Sprint 2 | High | 2 | is blocked by Master Task EBA-208 | **[BE-013] Fix Material Controller Spec Mock Data for Ownership Regression** |
| `BE-014` | **EBA-310** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-215 | **[BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator** |
| `BE-015` | **EBA-311** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-310 | **[BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting** |
| `BE-016` | **EBA-312** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-311 | **[BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback** |
| `BE-017` | **EBA-313** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-312 | **[BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check** |
| `BE-018` | **EBA-314** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-313 | **[BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED)** |
| `BE-019` | **EBA-315** | Sprint 3 | Highest | 3 | is blocked by Master Task EBA-314 | **[BE-019] Implement Database-Level Student Access Gate for Published-Only Cases** |
| `BE-020` | **EBA-418** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-309 | **[BE-020] Implement Branching Attempt Initialization & Resumption APIs** |
| `BE-021` | **EBA-419** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-418 | **[BE-021] Implement Real-Time Option Selection & Path Traversal Persistence** |
| `BE-022` | **EBA-420** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-419 | **[BE-022] Implement Terminal Node Completion & Outcome Recording API** |
| `BE-023` | **EBA-421** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-420 | **[BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API** |
| `BE-024` | **EBA-422** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-421 | **[BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs** |
| `BE-025` | **EBA-423** | Sprint 4 | High | 5 | is blocked by Master Task EBA-309 | **[BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate** |
| `BE-026` | **EBA-424** | Sprint 4 | High | 5 | is blocked by Master Task EBA-423 | **[BE-026] Implement Lecturer Feedback Authoring & Status Progression API** |
| `BE-027` | **EBA-425** | Sprint 4 | High | 5 | is blocked by Master Task EBA-422, EBA-423 | **[BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer** |
| `BE-028` | **EBA-426** | Sprint 4 | High | 5 | is blocked by Master Task EBA-420, EBA-423 | **[BE-028] Implement Learning-Flow Statistics Aggregation Queries** |

---

## 2.4. NHÓM OPS — DEVOPS, OBJECT STORAGE & VECTOR DATABASE

> **Quy mô**: **3 tasks** | **11 Story Points**  
> **Mô tả trọng tâm**: Chịu trách nhiệm hạ tầng vận hành, hệ thống database migrations tự động với advisory lock, quản lý lưu trữ tài liệu bảo mật trên MinIO Object Storage, và thiết lập chỉ mục HNSW vector cosine trên pgvector.

### Cây phân rã công việc theo Sprint

```text
OPS Module Tree (3 tasks / 11 SP)
├── Sprint 1 (1 tasks, 3 SP)
│   ├── [OPS-001] (EBA-108) : PostgreSQL Migration Runner, Environment Validation & Health Checks [3 SP]
├── Sprint 2 (2 tasks, 8 SP)
│   ├── [OPS-002] (EBA-209) : Implement MinIO Storage Service with Secure Object Key Naming [3 SP]
│   ├── [OPS-003] (EBA-214) : Implement Document Chunks Persistence & HNSW Vector Indexing [5 SP]
```

### Bảng danh mục công việc nhóm OPS

| Group ID | Master Task ID | Sprint | Priority | SP | Dependencies (Master Task ID) | Tên công việc & Tóm tắt mục tiêu |
|:---:|:---:|:---:|:---:|:---:|---|---|
| `OPS-001` | **EBA-108** | Sprint 1 | High | 3 | *None* | **[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks** |
| `OPS-002` | **EBA-209** | Sprint 2 | Highest | 3 | is blocked by Master Task EBA-208 | **[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming** |
| `OPS-003` | **EBA-214** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-213 | **[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing** |

---

## 2.5. NHÓM QA — TESTING, SECURITY & QUALITY ASSURANCE

> **Quy mô**: **19 tasks** | **79 Story Points**  
> **Mô tả trọng tâm**: Chịu trách nhiệm chiến lược kiểm thử đa tầng: Unit test, Integration test, HTTP Security E2E (Supertest), Graph Theory Invariant validation, Retrieval grounding tests, UAT, Accessibility WCAG 2.1 AA.

### Cây phân rã công việc theo Sprint

```text
QA Module Tree (19 tasks / 79 SP)
├── Sprint 1 (2 tasks, 8 SP)
│   ├── [QA-001] (EBA-109) : Test Matrix for Auth, Course & Permissions [3 SP]
│   ├── [QA-002] (EBA-110) : Token Expiry, Role Denial & Ownership Leak Regression Suite [5 SP]
├── Sprint 2 (4 tasks, 18 SP)
│   ├── [QA-003] (EBA-217) : Test Suite for Material Upload Validation, File Types & Size Bounds [3 SP]
│   ├── [QA-004] (EBA-218) : Security & Authorization Tests for Material Storage & Tenant Isolation [5 SP]
│   ├── [QA-005] (EBA-219) : Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector) [5 SP]
│   ├── [QA-006] (EBA-220) : Vector Retrieval Relevance & Prompt Injection Boundary Testing [5 SP]
├── Sprint 3 (4 tasks, 18 SP)
│   ├── [QA-007] (EBA-316) : Contract & Schema Validation Tests for AI Case Generation Output [3 SP]
│   ├── [QA-008] (EBA-317) : Graph Theory Validation Test Suite for Decision Tree Invariants [5 SP]
│   ├── [QA-009] (EBA-318) : State Machine & Lifecycle Transition Boundary Test Suite [5 SP]
│   ├── [QA-010] (EBA-319) : Security Test Suite for Student Access Restriction to Unpublished Cases [5 SP]
├── Sprint 4 (9 tasks, 35 SP)
│   ├── [QA-011] (EBA-427) : E2E Integration Suite: Branching Study Complete Traversal to Review [5 SP]
│   ├── [QA-012] (EBA-428) : Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence [3 SP]
│   ├── [QA-013] (EBA-429) : Data Integrity Tests for Retry Isolation & Historical Attempt Preservation [3 SP]
│   ├── [QA-014] (EBA-430) : End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection [5 SP]
│   ├── [QA-015] (EBA-431) : Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading) [3 SP]
│   ├── [QA-016] (EBA-432) : Cross-Role Integration, Security & Performance Load Testing [5 SP]
│   ├── [QA-017] (EBA-433) : User Acceptance Testing (UAT) Execution & Defect Triage [5 SP]
│   ├── [QA-018] (EBA-434) : WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit [3 SP]
│   ├── [QA-019] (EBA-435) : Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests [3 SP]
```

### Bảng danh mục công việc nhóm QA

| Group ID | Master Task ID | Sprint | Priority | SP | Dependencies (Master Task ID) | Tên công việc & Tóm tắt mục tiêu |
|:---:|:---:|:---:|:---:|:---:|---|---|
| `QA-001` | **EBA-109** | Sprint 1 | High | 3 | is blocked by Master Task EBA-105, EBA-107 | **[QA-001] Test Matrix for Auth, Course & Permissions** |
| `QA-002` | **EBA-110** | Sprint 1 | Highest | 5 | is blocked by Master Task EBA-103, EBA-106, EBA-107 | **[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite** |
| `QA-003` | **EBA-217** | Sprint 2 | High | 3 | is blocked by Master Task EBA-204, EBA-208 | **[QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds** |
| `QA-004` | **EBA-218** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-208, EBA-209 | **[QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation** |
| `QA-005` | **EBA-219** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-214 | **[QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector)** |
| `QA-006` | **EBA-220** | Sprint 2 | Highest | 5 | is blocked by Master Task EBA-215 | **[QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing** |
| `QA-007` | **EBA-316** | Sprint 3 | High | 3 | is blocked by Master Task EBA-310, EBA-311 | **[QA-007] Contract & Schema Validation Tests for AI Case Generation Output** |
| `QA-008` | **EBA-317** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-310, EBA-313 | **[QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants** |
| `QA-009` | **EBA-318** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-314 | **[QA-009] State Machine & Lifecycle Transition Boundary Test Suite** |
| `QA-010` | **EBA-319** | Sprint 3 | Highest | 5 | is blocked by Master Task EBA-315 | **[QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases** |
| `QA-011` | **EBA-427** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-408, EBA-421 | **[QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review** |
| `QA-012` | **EBA-428** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-407, EBA-419 | **[QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence** |
| `QA-013` | **EBA-429** | Sprint 4 | High | 3 | is blocked by Master Task EBA-411, EBA-418 | **[QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation** |
| `QA-014` | **EBA-430** | Sprint 4 | High | 5 | is blocked by Master Task EBA-414, EBA-424 | **[QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection** |
| `QA-015` | **EBA-431** | Sprint 4 | High | 3 | is blocked by Master Task EBA-416, EBA-425 | **[QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading)** |
| `QA-016` | **EBA-432** | Sprint 4 | High | 5 | is blocked by Master Task EBA-427, EBA-430 | **[QA-016] Cross-Role Integration, Security & Performance Load Testing** |
| `QA-017` | **EBA-433** | Sprint 4 | Highest | 5 | is blocked by Master Task EBA-432 | **[QA-017] User Acceptance Testing (UAT) Execution & Defect Triage** |
| `QA-018` | **EBA-434** | Sprint 4 | High | 3 | is blocked by Master Task EBA-427 | **[QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit** |
| `QA-019` | **EBA-435** | Sprint 4 | Highest | 3 | is blocked by Master Task EBA-433, EBA-434 | **[QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests** |

---

## 3. CÁC ĐIỂM CHẶN DEPENDENCIES TRỌNG YẾU (CROSS-ROLE DEPENDENCY CHAINS)

1. **Chuỗi Khởi tạo & Định danh (Sprint 1)**:
   - `DES-001` (IA) ──→ `DES-002` (States) & `FE-001` (Auth Store) & `FE-002` (Layouts)
   - `BE-001` (JWT) ──→ `BE-002` (Guards) ──→ `BE-003` (Profile & Course)
   - `OPS-001` (Migration Runner) ──→ Hạ tầng sẵn sàng cho toàn bộ Backend
   - `QA-001` & `QA-002` ──→ Khóa chốt an ninh cho Sprint 1 trước khi sang Sprint 2

2. **Chuỗi Quản lý Tài liệu & RAG Pipeline (Sprint 2)**:
   - `BE-003` ──→ `BE-005` (Material CRUD) ──→ `OPS-002` (MinIO Storage)
   - `OPS-002` ──→ `BE-007` (PDF) & `BE-008` (DOCX) ──→ `BE-009` (Chunking) ──→ `BE-010` (Embeddings)
   - `BE-010` ──→ `OPS-003` (HNSW Vector Index) ──→ `BE-012` (Grounded Retrieval `<sources>`)
   - `QA-003`, `QA-004`, `QA-005`, `QA-006` ──→ Xác thực toàn vẹn đường ống nạp tài liệu

3. **Chuỗi Sinh Case & Phê duyệt Giảng viên (Sprint 3)**:
   - `BE-012` ──→ `BE-015` (AI Case Generation) ──→ `BE-014` (DFS Cycle Validation)
   - `BE-014` ──→ `BE-016` (Tree Persistence) ──→ `BE-017` (Node CRUD) ──→ `BE-018` (Lifecycle State Machine)
   - `BE-018` ──→ `BE-019` (Published-Only Gate) — Chặn triệt để sinh viên xem case DRAFT
   - `FE-008` (ReactFlow Canvas) ──→ `FE-009` & `FE-010` (Editor) ──→ `FE-011` (Approval UI)

4. **Chuỗi Học tập & Đánh giá Review (Sprint 4)**:
   - `BE-019` ──→ `BE-020` (Attempt Init) ──→ `BE-021` (Continuous Navigation) ──→ `BE-022` (Terminal Completion)
   - `BE-022` ──→ `BE-023` (Journey Review & Consequence Unlock) ──→ `BE-024` (Reasoning & Reflection)
   - `BE-027` (AI Challenge Support) ──→ Giới hạn nghiêm ngặt tối đa 2 vòng, không chấm điểm
   - `QA-011` → `QA-019` ──→ Kiểm thử toàn diện E2E, UAT và Release Readiness
