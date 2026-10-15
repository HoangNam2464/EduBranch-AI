# EduBranch AI — Jira CSV & Backlog Reconciliation Audit Report

> **Tài liệu**: Biên bản kiểm toán đối soát độc lập 4 chiều (4-Way Reconciliation Audit)  
> **Các nguồn đối chiếu**:  
> 1. `docs/5.Sprint_Backlog/SPRINT-BACKLOG.md` (Single Source of Truth gốc)  
> 2. `docs/01_MASTER-TASKS.md` & `docs/02_SPRINT-TASKS.md` (Cây phân rã nhóm chuyên môn)  
> 3. `docs/03_TASK-DETAILS.md` (Đặc tả chi tiết từng task)  
> 4. `docs/04_JIRA/eba-jira-import.csv` (Tệp CSV sẵn sàng import lên Jira Software)  
> 5. `docs/04_JIRA/JIRA-BACKLOG-REFERENCE.md` (Bản tham chiếu Jira)  
> **Ngày kiểm toán**: 2026-10-13  
> **Người thực hiện**: Senior QA Automation & Technical Project Lead  
> **Kết luận kiểm toán**: **READY FOR JIRA** (Đạt chuẩn 100%, không có ngoại lệ)  

---

## 1. TỔNG HỢP KẾT QUẢ ĐỐI SOÁT CỐT LÕI

| Tiêu chí kiểm toán | Yêu cầu chuẩn hóa | Kết quả đối soát thực tế | Trạng thái |
|---|:---:|:---:|:---:|
| **Tổng số Task duy nhất** | Đúng 84 tasks | **84 / 84 tasks** (Không trùng, không thiếu) | ✅ **PASS** |
| **Tổng Story Points (SP)** | Đúng 336 SP | **336 / 336 Story Points** | ✅ **PASS** |
| **Số lượng Sprint** | 4 Sprints cố định | **4 Sprints** (Timeline: 07/10/2026 – 15/12/2026) | ✅ **PASS** |
| **Phân bổ 5 Nhóm chuyên môn** | DES (15), FE (22), BE (25), OPS (3), QA (19) | **DES: 15, FE: 22, BE: 25, OPS: 3, QA: 19** | ✅ **PASS** |
| **Mapping 3 Task OPS** | EBA-108, EBA-209, EBA-214 | Khớp 100% mã `OPS-001`, `OPS-002`, `OPS-003` | ✅ **PASS** |
| **Định dạng Summary chuẩn Jira** | `[GROUP-###] Work name` (Không có `[EBA-###]`) | **84/84 tasks** tuân thủ nghiêm ngặt (0 lỗi) | ✅ **PASS** |
| **Tính toàn vẹn Dependencies** | Giữ nguyên Master Task ID | Không tự sinh Issue Key giả lập | ✅ **PASS** |
| **Bảo toàn Acceptance Criteria** | 100% điều kiện nghiệm thu gốc | Không làm mất tiêu chí nào khi định dạng | ✅ **PASS** |
| **Ranh giới nghiệp vụ giáo dục** | Higher Education ONLY | Không có từ khóa hay workflow K-12 | ✅ **PASS** |

---

## 2. MA TRẬN ĐỐI SOÁT PHÂN BỔ THEO SPRINT

| Sprint | Tên Sprint | Task Count (Gốc) | Task Count (CSV) | SP (Gốc) | SP (CSV) | Trạng thái đối soát |
|:---:|---|:---:|:---:|:---:|:---:|:---:|
| **Sprint 1** | Foundation | 10 | 10 | 42 | 42 | ✅ **PASS** (100% khớp) |
| **Sprint 2** | Material & RAG | 20 | 20 | 75 | 75 | ✅ **PASS** (100% khớp) |
| **Sprint 3** | Case & Approval | 19 | 19 | 81 | 81 | ✅ **PASS** (100% khớp) |
| **Sprint 4** | Learning & Review | 35 | 35 | 138 | 138 | ✅ **PASS** (100% khớp) |
| **TỔNG CỘNG** | **4 Sprints** | **84** | **84** | **336** | **336** | ✅ **PASS (100% KHỚP)** |

---

## 3. MA TRẬN ĐỐI SOÁT THEO 5 NHÓM CHUYÊN MÔN (ROLE BREAKDOWN)

| Nhóm chuyên môn | Mã nhóm | Dải Group ID | Số task | Story Points | Tỷ lệ SP | Trạng thái đối soát |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **UI/UX Design (Figma)** | `DES` | `DES-001` → `DES-015` | 15 | 50 | 14.88% | ✅ **PASS** |
| **Frontend Web (React 19)** | `FE` | `FE-001` → `FE-022` | 22 | 86 | 25.60% | ✅ **PASS** |
| **Backend & AI Service** | `BE` | `BE-001` → `BE-028` (25 tasks) | 25 | 110 | 32.74% | ✅ **PASS** |
| **DevOps & Vector DB Infra** | `OPS` | `OPS-001` → `OPS-003` | 3 | 11 | 3.27% | ✅ **PASS** |
| **Quality Assurance & Test** | `QA` | `QA-001` → `QA-019` | 19 | 79 | 23.51% | ✅ **PASS** |
| **TỔNG CỘNG** | **5 Nhóm** | **84 Tasks chuẩn hóa** | **84** | **336** | **100.00%** | ✅ **PASS (100% KHỚP)** |

---

## 4. XÁC MINH CHI TIẾT 3 MAPPING CHUYỂN ĐỔI OPS

Ba tác vụ hạ tầng và cơ sở dữ liệu đã được tách riêng khỏi nhóm Backend thuần túy sang nhóm `OPS` theo đúng chỉ thị bàn giao:

| Master Task ID | Mã cũ trong SPRINT-BACKLOG | Mã mới chuẩn hóa | Tên Task Chuẩn Hóa | Sprint | SP | Xác minh CSV & Tài liệu |
|:---:|:---:|:---:|---|:---:|:---:|:---:|
| **`EBA-108`** | `BE-004` | **`OPS-001`** | `[OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks` | Sprint 1 | 3 | ✅ **PASS** (Khớp trong CSV, 01, 02, 03, Reference) |
| **`EBA-209`** | `BE-006` | **`OPS-002`** | `[OPS-002] Implement MinIO Storage Service with Secure Object Key Naming` | Sprint 2 | 3 | ✅ **PASS** (Khớp trong CSV, 01, 02, 03, Reference) |
| **`EBA-214`** | `BE-011` | **`OPS-003`** | `[OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing` | Sprint 2 | 5 | ✅ **PASS** (Khớp trong CSV, 01, 02, 03, Reference) |

---

## 5. ĐỐI SOÁT CẤU TRÚC TỆP `eba-jira-import.csv`

- **Tên tệp**: `docs/04_JIRA/eba-jira-import.csv`
- **Mã hóa (Encoding)**: UTF-8 with BOM (`utf-8-sig`) — Tương thích tuyệt đối với Excel và trình nhập liệu Jira Import Wizard.
- **Tổng số dòng**: 85 dòng (1 dòng tiêu đề Header + 84 dòng bản ghi công việc).
- **Danh sách 11 cột chuẩn hóa**:
  1. `Summary`: Định dạng `[GROUP-###] Work name` (Không có `[EBA-###]`).
  2. `Issue Type`: Giá trị `Task`.
  3. `Description`: Mô tả chi tiết vai trò, ngữ cảnh đại học, mã tham chiếu và phụ thuộc.
  4. `Priority`: `Highest`, `High`, `Medium`.
  5. `Story Points`: Số nguyên thang đo Fibonacci (1, 2, 3, 5, 8).
  6. `Sprint`: `Sprint 1`, `Sprint 2`, `Sprint 3`, `Sprint 4`.
  7. `Master Task ID`: `EBA-101` đến `EBA-435`.
  8. `Group Task ID`: `DES-001` đến `QA-019` (bao gồm `OPS-001` đến `OPS-003`).
  9. `Dependency`: Cú pháp quan hệ kỹ thuật theo Master Task ID.
  10. `Status`: Trạng thái nguồn (`DONE`, `IN PROGRESS`, `TO DO`).
  11. `Acceptance Criteria`: Toàn bộ điều kiện nghiệm thu được đánh số thứ tự rõ ràng.

---

## 6. DANH SÁCH ĐỐI SOÁT TOÀN DIỆN 84 TASKS

| # | Master Task ID | Group ID | Sprint | SP | Priority | Summary chuẩn hóa | Trạng thái đối soát |
|:---:|:---:|:---:|:---:|:---:|:---:|---|:---:|
| 01 | **EBA-101** | `DES-001` | Sprint 1 | 3 | Highest | [DES-001] Information Architecture for Lecturer, Student & Dual Learning Modes | ✅ PASS |
| 02 | **EBA-102** | `DES-002` | Sprint 1 | 5 | High | [DES-002] Shared Design States: Loading, Empty, Error & Permissions | ✅ PASS |
| 03 | **EBA-103** | `FE-001` | Sprint 1 | 5 | Highest | [FE-001] Harden authStore, API Client, Route Guards & Session Expiration | ✅ PASS |
| 04 | **EBA-104** | `FE-002` | Sprint 1 | 3 | High | [FE-002] Align Login, Register & Portal Layouts with Permission Matrix | ✅ PASS |
| 05 | **EBA-105** | `BE-001` | Sprint 1 | 5 | Highest | [BE-001] Implement User Registration, Login & JWT Token Management | ✅ PASS |
| 06 | **EBA-106** | `BE-002` | Sprint 1 | 5 | Highest | [BE-002] Implement Global JwtAuthGuard, Public Route Decorator & Role Enforcement Guard | ✅ PASS |
| 07 | **EBA-107** | `BE-003` | Sprint 1 | 5 | Highest | [BE-003] User Profile & Course Management Foundation with Lecturer Ownership Gates | ✅ PASS |
| 08 | **EBA-108** | `OPS-001` | Sprint 1 | 3 | High | [OPS-001] PostgreSQL Migration Runner, Environment Validation & Health Checks | ✅ PASS |
| 09 | **EBA-109** | `QA-001` | Sprint 1 | 3 | High | [QA-001] Test Matrix for Auth, Course & Permissions | ✅ PASS |
| 10 | **EBA-110** | `QA-002` | Sprint 1 | 5 | Highest | [QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite | ✅ PASS |
| 11 | **EBA-201** | `DES-003` | Sprint 2 | 3 | Highest | [DES-003] Material Library & Upload Interaction Flow Design | ✅ PASS |
| 12 | **EBA-202** | `DES-004` | Sprint 2 | 3 | High | [DES-004] Material Processing, Progress Bar & Failure Recovery States | ✅ PASS |
| 13 | **EBA-203** | `DES-005` | Sprint 2 | 3 | High | [DES-005] RAG Grounding Evidence & Source Inspection UI Design | ✅ PASS |
| 14 | **EBA-204** | `FE-003` | Sprint 2 | 3 | Highest | [FE-003] Implement Material Upload Modal with Client-Side Validation | ✅ PASS |
| 15 | **EBA-205** | `FE-004` | Sprint 2 | 5 | Highest | [FE-004] Implement Materials Table with Metadata & Processing Status Indicators | ✅ PASS |
| 16 | **EBA-206** | `FE-005` | Sprint 2 | 3 | High | [FE-005] Implement Material Delete & Failure Retry Actions with API Integration | ✅ PASS |
| 17 | **EBA-207** | `FE-006` | Sprint 2 | 3 | High | [FE-006] Implement RAG Source Chunk Viewer Modal for Grounded Evidence | ✅ PASS |
| 18 | **EBA-208** | `BE-005` | Sprint 2 | 3 | Highest | [BE-005] Implement Material CRUD & Ownership Authorization Gates | ✅ PASS |
| 19 | **EBA-209** | `OPS-002` | Sprint 2 | 3 | Highest | [OPS-002] Implement MinIO Storage Service with Secure Object Key Naming | ✅ PASS |
| 20 | **EBA-210** | `BE-007` | Sprint 2 | 5 | Highest | [BE-007] Implement PDF Document Parser with Text Extraction & Normalization | ✅ PASS |
| 21 | **EBA-211** | `BE-008` | Sprint 2 | 3 | Highest | [BE-008] Implement DOCX Document Parser with Text Extraction & Normalization | ✅ PASS |
| 22 | **EBA-212** | `BE-009` | Sprint 2 | 3 | Highest | [BE-009] Implement Recursive Document Chunking Pipeline | ✅ PASS |
| 23 | **EBA-213** | `BE-010` | Sprint 2 | 5 | Highest | [BE-010] Implement Vector Embedding Generation via Provider Abstraction | ✅ PASS |
| 24 | **EBA-214** | `OPS-003` | Sprint 2 | 5 | Highest | [OPS-003] Implement Document Chunks Persistence & HNSW Vector Indexing | ✅ PASS |
| 25 | **EBA-215** | `BE-012` | Sprint 2 | 5 | Highest | [BE-012] Implement Grounded Vector Retrieval with Course Isolation & <sources> Wrapping | ✅ PASS |
| 26 | **EBA-216** | `BE-013` | Sprint 2 | 2 | High | [BE-013] Fix Material Controller Spec Mock Data for Ownership Regression | ✅ PASS |
| 27 | **EBA-217** | `QA-003` | Sprint 2 | 3 | High | [QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds | ✅ PASS |
| 28 | **EBA-218** | `QA-004` | Sprint 2 | 5 | Highest | [QA-004] Security & Authorization Tests for Material Storage & Tenant Isolation | ✅ PASS |
| 29 | **EBA-219** | `QA-005` | Sprint 2 | 5 | Highest | [QA-005] Integration Test Suite for End-to-End Ingestion Pipeline (Upload to pgvector) | ✅ PASS |
| 30 | **EBA-220** | `QA-006` | Sprint 2 | 5 | Highest | [QA-006] Vector Retrieval Relevance & Prompt Injection Boundary Testing | ✅ PASS |
| 31 | **EBA-301** | `DES-006` | Sprint 3 | 3 | Highest | [DES-006] Case Generation Modal & Parameter Configuration Flow Design | ✅ PASS |
| 32 | **EBA-302** | `DES-007` | Sprint 3 | 5 | Highest | [DES-007] ReactFlow Decision Tree Visualization & Topology Layout Design | ✅ PASS |
| 33 | **EBA-303** | `DES-008` | Sprint 3 | 3 | Highest | [DES-008] Side-by-Side Node & Option Form Editor UX Design | ✅ PASS |
| 34 | **EBA-304** | `DES-009` | Sprint 3 | 3 | Highest | [DES-009] Case Governance Lifecycle Action Bar & Approval Status Design | ✅ PASS |
| 35 | **EBA-305** | `FE-007` | Sprint 3 | 3 | Highest | [FE-007] Implement Case Generation Trigger Modal & Progress Tracking | ✅ PASS |
| 36 | **EBA-306** | `FE-008` | Sprint 3 | 5 | Highest | [FE-008] Implement ReactFlow Decision Tree Visual Canvas Component | ✅ PASS |
| 37 | **EBA-307** | `FE-009` | Sprint 3 | 5 | Highest | [FE-009] Implement Interactive Node, Option & Consequence Editor Form | ✅ PASS |
| 38 | **EBA-308** | `FE-010` | Sprint 3 | 5 | High | [FE-010] Implement Graph Mutation Capabilities (Add/Remove Node & Option Re-linking) | ✅ PASS |
| 39 | **EBA-309** | `FE-011` | Sprint 3 | 3 | Highest | [FE-011] Implement Case Approval State Transition Workflow UI | ✅ PASS |
| 40 | **EBA-310** | `BE-014` | Sprint 3 | 5 | Highest | [BE-014] Implement Pydantic Decision Tree Schema & DFS Graph Cycle Validator | ✅ PASS |
| 41 | **EBA-311** | `BE-015` | Sprint 3 | 5 | Highest | [BE-015] Implement AI Case Generation Service with Grounded Syllabus Prompting | ✅ PASS |
| 42 | **EBA-312** | `BE-016` | Sprint 3 | 5 | Highest | [BE-016] Implement Multi-Table Decision Tree Persistence with Transaction Rollback | ✅ PASS |
| 43 | **EBA-313** | `BE-017` | Sprint 3 | 5 | Highest | [BE-017] Implement Case Node & Option CRUD APIs with Topology Integrity Check | ✅ PASS |
| 44 | **EBA-314** | `BE-018` | Sprint 3 | 5 | Highest | [BE-018] Implement Case Lifecycle State Machine Enforcement (DRAFT to PUBLISHED) | ✅ PASS |
| 45 | **EBA-315** | `BE-019` | Sprint 3 | 3 | Highest | [BE-019] Implement Database-Level Student Access Gate for Published-Only Cases | ✅ PASS |
| 46 | **EBA-316** | `QA-007` | Sprint 3 | 3 | High | [QA-007] Contract & Schema Validation Tests for AI Case Generation Output | ✅ PASS |
| 47 | **EBA-317** | `QA-008` | Sprint 3 | 5 | Highest | [QA-008] Graph Theory Validation Test Suite for Decision Tree Invariants | ✅ PASS |
| 48 | **EBA-318** | `QA-009` | Sprint 3 | 5 | Highest | [QA-009] State Machine & Lifecycle Transition Boundary Test Suite | ✅ PASS |
| 49 | **EBA-319** | `QA-010` | Sprint 3 | 5 | Highest | [QA-010] Security Test Suite for Student Access Restriction to Unpublished Cases | ✅ PASS |
| 50 | **EBA-401** | `DES-010` | Sprint 4 | 3 | Highest | [DES-010] Branching Case Player Experience-First UI/UX Design | ✅ PASS |
| 51 | **EBA-402** | `DES-011` | Sprint 4 | 5 | Highest | [DES-011] Journey Review Path Visualization & Consequence Reveal Design | ✅ PASS |
| 52 | **EBA-403** | `DES-012` | Sprint 4 | 2 | High | [DES-012] Retry & New Attempt Initiation UX Design | ✅ PASS |
| 53 | **EBA-404** | `DES-013` | Sprint 4 | 3 | High | [DES-013] Review Study Open Analysis & Solution Proposal UI Design | ✅ PASS |
| 54 | **EBA-405** | `DES-014` | Sprint 4 | 3 | High | [DES-014] Lecturer Qualitative Feedback & Review Dashboard Design | ✅ PASS |
| 55 | **EBA-406** | `DES-015` | Sprint 4 | 3 | High | [DES-015] AI Challenge Support Socratic Interaction UI Design | ✅ PASS |
| 56 | **EBA-407** | `FE-012` | Sprint 4 | 5 | Highest | [FE-012] Implement Continuous Branching Case Player Component | ✅ PASS |
| 57 | **EBA-408** | `FE-013` | Sprint 4 | 3 | Highest | [FE-013] Implement Attempt Terminal Detection & Navigation to Journey Review | ✅ PASS |
| 58 | **EBA-409** | `FE-014` | Sprint 4 | 5 | Highest | [FE-014] Implement Journey Review Replay Canvas with Consequence Reveal | ✅ PASS |
| 59 | **EBA-410** | `FE-015` | Sprint 4 | 3 | Highest | [FE-015] Implement Retrospective Reasoning Capture on Pivotal Decisions | ✅ PASS |
| 60 | **EBA-411** | `FE-016` | Sprint 4 | 3 | High | [FE-016] Implement Retry Action Generating New Independent Branching Attempt | ✅ PASS |
| 61 | **EBA-412** | `FE-017` | Sprint 4 | 3 | Highest | [FE-017] Implement Post-Review Overall Reflection Submission Page | ✅ PASS |
| 62 | **EBA-413** | `FE-018` | Sprint 4 | 5 | High | [FE-018] Implement Review Study Independent Analysis & Submission Page | ✅ PASS |
| 63 | **EBA-414** | `FE-019` | Sprint 4 | 5 | High | [FE-019] Implement Lecturer Feedback Dashboard & Submission Review View | ✅ PASS |
| 64 | **EBA-415** | `FE-020` | Sprint 4 | 3 | High | [FE-020] Implement Student Review Feedback & Reflection Workflow | ✅ PASS |
| 65 | **EBA-416** | `FE-021` | Sprint 4 | 5 | High | [FE-021] Implement AI Challenge Support Socratic Dialogue Component (Max 2 Rounds) | ✅ PASS |
| 66 | **EBA-417** | `FE-022` | Sprint 4 | 3 | High | [FE-022] Implement Learning-Flow Statistics Dashboard with Visual Charts | ✅ PASS |
| 67 | **EBA-418** | `BE-020` | Sprint 4 | 5 | Highest | [BE-020] Implement Branching Attempt Initialization & Resumption APIs | ✅ PASS |
| 68 | **EBA-419** | `BE-021` | Sprint 4 | 5 | Highest | [BE-021] Implement Real-Time Option Selection & Path Traversal Persistence | ✅ PASS |
| 69 | **EBA-420** | `BE-022` | Sprint 4 | 3 | Highest | [BE-022] Implement Terminal Node Completion & Outcome Recording API | ✅ PASS |
| 70 | **EBA-421** | `BE-023` | Sprint 4 | 5 | Highest | [BE-023] Implement Journey Review Data Assembly & Consequence Unlocking API | ✅ PASS |
| 71 | **EBA-422** | `BE-024` | Sprint 4 | 3 | Highest | [BE-024] Implement Retrospective Reasoning Update & Reflection Submission APIs | ✅ PASS |
| 72 | **EBA-423** | `BE-025` | Sprint 4 | 5 | High | [BE-025] Implement Review Study Submission Lifecycle & Unique Student Gate | ✅ PASS |
| 73 | **EBA-424** | `BE-026` | Sprint 4 | 5 | High | [BE-026] Implement Lecturer Feedback Authoring & Status Progression API | ✅ PASS |
| 74 | **EBA-425** | `BE-027` | Sprint 4 | 5 | High | [BE-027] Implement AI Challenge Support Assistant Service & 2-Round Cap Enforcer | ✅ PASS |
| 75 | **EBA-426** | `BE-028` | Sprint 4 | 5 | High | [BE-028] Implement Learning-Flow Statistics Aggregation Queries | ✅ PASS |
| 76 | **EBA-427** | `QA-011` | Sprint 4 | 5 | Highest | [QA-011] E2E Integration Suite: Branching Study Complete Traversal to Review | ✅ PASS |
| 77 | **EBA-428** | `QA-012` | Sprint 4 | 3 | Highest | [QA-012] Pedagogical Invariant Regression: Mid-Flow Consequence & Reasoning Absence | ✅ PASS |
| 78 | **EBA-429** | `QA-013` | Sprint 4 | 3 | High | [QA-013] Data Integrity Tests for Retry Isolation & Historical Attempt Preservation | ✅ PASS |
| 79 | **EBA-430** | `QA-014` | Sprint 4 | 5 | High | [QA-014] End-to-End Test Suite for Review Study, Lecturer Feedback & Reflection | ✅ PASS |
| 80 | **EBA-431** | `QA-015` | Sprint 4 | 3 | High | [QA-015] Security & Safety Audit for AI Challenge Support (2-Round Bound & Zero Grading) | ✅ PASS |
| 81 | **EBA-432** | `QA-016` | Sprint 4 | 5 | High | [QA-016] Cross-Role Integration, Security & Performance Load Testing | ✅ PASS |
| 82 | **EBA-433** | `QA-017` | Sprint 4 | 5 | Highest | [QA-017] User Acceptance Testing (UAT) Execution & Defect Triage | ✅ PASS |
| 83 | **EBA-434** | `QA-018` | Sprint 4 | 3 | High | [QA-018] WCAG 2.1 AA Accessibility & Cross-Browser Compliance Audit | ✅ PASS |
| 84 | **EBA-435** | `QA-019` | Sprint 4 | 3 | Highest | [QA-019] Final Release Readiness Verification, Demo Script Validation & Production Smoke Tests | ✅ PASS |

---

## 7. KẾT LUẬN & KHUYẾN NGHỊ VẬN HÀNH

1. **Trạng thái hệ thống tài liệu**: **READY FOR JIRA**  
   Toàn bộ 84 tasks đã được chuẩn hóa và sẵn sàng cho hai phương thức đưa lên Jira:
   - **Phương thức 1 (Tự động 1-Click)**: Sử dụng tính năng **Jira Settings → System → External System Import → CSV** và tải lên file `docs/04_JIRA/eba-jira-import.csv`.
   - **Phương thức 2 (Thủ công từng task)**: Sử dụng trực tiếp dữ liệu chuẩn hóa trong `docs/03_TASK-DETAILS.md`.
2. **Quy tắc tạo liên kết Dependencies trên Jira**:
   - Khi import hoàn tất, mở từng issue và thiết lập liên kết **Linked Issues → "is blocked by"** trỏ đến **Jira Issue Key thực tế** tương ứng theo bảng ánh xạ trong `03_TASK-DETAILS.md`.
3. **Bảo toàn mã nguồn**:
   - Quá trình chuẩn hóa và kiểm toán không tác động, không sửa đổi bất kỳ tệp mã nguồn nào trong working tree.
