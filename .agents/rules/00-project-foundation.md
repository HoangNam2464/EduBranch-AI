---
description: >-
  Global project rules for EduBranch-AI. Always loaded when working in this
  repository. Enforces pedagogical domain boundaries, architecture boundaries,
  case lifecycle, decision tree invariants, AI governance, Git workflow, and
  coding standards.
trigger: always_on
---

# EduBranch-AI — Global Project Rules

## 1. Project Identity & Pedagogical Domain

- **Name**: EduBranch-AI
- **Full Name**: EduBranch-AI — AI Platform for Experiential Case-Based Learning & Decision-Making Scenarios
- **Target Domain**: Quá trình học tập tình huống thực nghiệm & rèn luyện tư duy phản biện bậc Đại học (University-Level Experiential Case-Based Learning Process)
- **Primary Actors**:
  - **Lecturer** (`LECTURER` — Giảng viên / Người hướng dẫn): Creates courses, uploads teaching materials, triggers AI case generation, edits/approves/publishes cases, inspects student attempts/submissions, authors qualitative feedback, views cohort statistics.
  - **Student** (`STUDENT` — Sinh viên / Người học): Accesses published cases via direct link, navigates Branching Study experiences, completes retrospective Journey Review, submits Review Study analyses, engages in optional Socratic AI Challenge Support (max 2 rounds), writes post-activity reflections.
  - **Admin** (`ADMIN` — Quản trị hệ thống): System-level account/role and operational health boundary per Proposal V1.2.
- **Technology Stack**:
  - **Backend Gateway**: Node.js 20 LTS (NestJS 10 + TypeScript)
  - **Internal AI Service**: Python 3.12 (FastAPI + Pydantic v2 + LangChain)
  - **Frontend Web App**: React 19 + Vite + TypeScript + TailwindCSS v4 + Zustand + ReactFlow
  - **Data & Storage**: PostgreSQL 16 + pgvector | MinIO (Object Storage) | Redis 7 (Cache/Session)
  - **LLM Providers**: Google Gemini 2.0 Flash / OpenAI GPT-4o-mini via Provider Abstraction (`providers/factory.py`)

### 1.1. Core Pedagogical Model
1. **Experiential Case-Based Learning**: EduBranch-AI immerses university students into realistic multi-branch decision-making scenarios (`Branching Study`) and open analytical problems (`Review Study`) grounded in the lecturer's actual course materials (Business, Law, Medicine, Management, Engineering, etc.).
2. **Independent Project Governance**: All requirements, sprint backlogs (4 Sprints / 84 Tasks / 336 SP), schemas, and features derive strictly from **`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`** (Proposal V1.2) and Product Direction V2. Never import K-12 concepts, lesson planners, quiz generators, or external reference business logic.

### 1.2. Mandatory Terminology Standards

| Forbidden / Retired Terms | Canonical EduBranch-AI Terms | Pedagogical Role & Meaning |
|---|---|---|
| K-12 / Grade Levels / Schoolchild / Pupil | `University Learning`, `Student` (`Sinh viên / Người học`) | Higher-education learners analyzing complex professional dilemmas |
| Teacher / Teaching Assistant | `Lecturer` (`Giảng viên / Người hướng dẫn`) | Faculty member who owns courses, curates materials, and governs cases |
| Lesson Plan / Weekly Schedule / Curriculum Blueprint | `Course`, `Teaching Materials` (`Syllabus, giáo trình, tài liệu case`) | Source documents ingested into pgvector for grounded RAG generation |
| Simulator / Simulation Session | `Branching Case Player`, `Branching Attempt` (`branching_attempts`) | Student's traversal of a `BRANCHING_STUDY` decision tree |
| Student Argument / Argument | `Student Reasoning` (`student_reasoning.reasoning_text`) | Written justification captured retrospectively in the REVIEW phase or in Review Study |
| Debate Assistant / Devil's Advocate / Debate | `AI Reasoning / Challenge Support` (`challenge_support_sessions`) | Embedded Socratic questioning (max 2 rounds, counter-questions only, zero grading) |
| Result / Ending (for option impact) | `Consequence` (per-option impact) / `Outcome` (terminal node state) | Consequence is revealed in Journey Review; Outcome is the terminal node conclusion |
| Homework / Quiz / Auto-Grader | `Review Submission`, `Reflection`, `Lecturer Feedback` | Qualitative academic analysis and human-authored faculty commentary |

---

## 2. Repository Structure & Canonical Documentation Map

```text
EduBranch-AI/
├── backend/                    ← Node.js (NestJS 10) API Gateway
├── ai-service/                 ← FastAPI AI / RAG Service (INTERNAL ONLY)
├── frontend/                   ← React 19 + Vite + TailwindCSS v4
├── infrastructure/             ← Docker, Compose, Postgres migrations
├── scripts/                    ← Development and verification scripts
├── .agents/rules/              ← AI coding agent governance rules
│   ├── 00-project-foundation.md
│   ├── 01-ui-design-standards.md
│   └── feature-*.md            ← 15 domain-specific feature rule files
└── docs/                       ← Authoritative Project Documentation
    ├── 01_MASTER-TASKS.md      ← 84 Master Tasks (EBA-101 → EBA-435) across 4 Sprints
    ├── 02_SPRINT-TASKS.md      ← Role breakdown: DES (15), FE (22), BE (25), OPS (3), QA (19)
    ├── 03_TASK-DETAILS.md      ← Deliverables, Acceptance Criteria & Dependencies per task
    ├── 04_JIRA/                ← Jira CSV import & 3-way audit reports
    ├── 05_FIGMA.md             ← 15 Figma UI/UX Design tasks (DES-001 → DES-015)
    ├── 06_QA.md                ← 19 QA & Security test tasks (QA-001 → QA-019)
    ├── 5.Sprint_Backlog/       ← Immutable Sprint Backlog baseline (SPRINT-BACKLOG.md)
    ├── architecture/           ← System Architecture, Data Flow, Boundaries, ADRs & Audits
    ├── database/               ← Relational + pgvector Data Model & Operational Guide
    ├── ai/                     ← RAG Pipeline & Challenge Support AI specs
    ├── design/                 ← Global Design System, Site Architecture, Stitch Guide & Screens (P0–P4)
    ├── features/               ← 15 canonical FEATURE-*.md specifications
    ├── qa/                     ← Testing Strategy & Verification Reports
    ├── requirements/           ← Proposal V1.2 Requirement Traceability Matrix
    └── research/               ← Quantitative Evaluation & Research Boundary
```

### Documentation Hygiene Rules
1. **No Scattered Duplicate Docs**: Do not create hidden top-level folders (such as `.stitch/`) for documentation. All UI/UX specifications belong strictly inside `docs/design/` and `.agents/rules/01-ui-design-standards.md`.
2. **File Naming Convention**:
   - Rules in `.agents/rules/`: `00-project-foundation.md`, `01-ui-design-standards.md`, and `feature-<domain-kebab-case>.md`.
   - Technical & Design Docs in `docs/**/`: `UPPER-KEBAB-CASE.md` (e.g., `GLOBAL-DESIGN-SYSTEM.md`, `P0-FOUNDATION.md`, `FEATURE-BRANCHING-STUDY.md`).
   - Sprint Governance Root Docs in `docs/`: `01_MASTER-TASKS.md` through `06_QA.md`, `PROJECT_OVERVIEW.md`, `HANDOVER_DIRECTIVE.md`.

---

## 3. Architecture Boundaries

| Responsibility | Backend Gateway (`backend/`) | FastAPI AI Service (`ai-service/`) |
|---|:---:|:---:|
| Authentication, JWT & RBAC (`LECTURER`, `STUDENT`, `ADMIN`) | ✅ | ❌ |
| User & Role Management | ✅ | ❌ |
| Course & Teaching Material Metadata | ✅ | ❌ |
| Case Lifecycle State Machine & Publication Gate | ✅ | ❌ |
| Branching Attempt Persistence (`branching_attempts`) | ✅ | ❌ |
| Student Reasoning Persistence (`student_reasoning`) | ✅ | ❌ |
| Review Study Submission Persistence (`review_study_submissions`) | ✅ | ❌ |
| Challenge Support Session & Message Persistence | ✅ | ❌ |
| Lecturer Qualitative Feedback Persistence (`lecturer_feedback`) | ✅ | ❌ |
| Lecturer Cohort & Branch Statistics | ✅ | ❌ |
| REST API Gateway for Frontend | ✅ | ❌ |
| PDF/DOCX Document Parsing & Text Normalization | ❌ | ✅ |
| Recursive Text Chunking | ❌ | ✅ |
| Vector Embedding Generation | ❌ | ✅ |
| pgvector Cosine Similarity Retrieval | ❌ | ✅ |
| RAG Prompt Assembly with `<sources>` Boundary | ❌ | ✅ |
| Structured Case Generation (LLM + DAG Validation) | ❌ | ✅ |
| Challenge Counter-Question Generation (LLM) | ❌ | ✅ |

**Strict Isolation**: Frontend communicates **exclusively** with the Backend Gateway (`/api/v1/*`). The FastAPI AI Service is **internal only** (`/internal/v1/*` protected by `X-Internal-API-Key`) and must never be exposed to the public internet or called from the browser.

---

## 4. Case Lifecycle — Mandatory Human-in-the-Loop Gate

```text
DRAFT  ──►  REVIEWED  ──►  APPROVED  ──►  PUBLISHED
```

- AI generates a case draft → always initialized as `DRAFT`.
- Lecturer reviews and edits → transitions to `REVIEWED` (or reverts to `DRAFT`).
- Lecturer approves → transitions to `APPROVED`.
- Lecturer publishes → transitions to `PUBLISHED`.
- **CRITICAL SECURITY RULE**: Students MUST NEVER access cases that are not `PUBLISHED`. This invariant (`INV-01`) must be enforced at the **database repository query level** (`WHERE status = 'PUBLISHED'`), never just in the UI or controller.

---

## 5. Decision Tree Integrity (`BRANCHING_STUDY`)

- Every `CaseOption.next_node_id` must reference a valid `CaseNode` within the same `Case` (or `NULL` if terminal).
- Every non-root node must be reachable from `Case.root_node_id` (no orphan nodes).
- Zero cycles/loops are permitted (enforced by 3-color DFS cycle detection in `CaseGenerationOutput.validate_tree_structure` and on lecturer edits).
- Every non-terminal node must have between 2 and 4 options; at least one terminal node (`is_terminal = TRUE`, 0 outgoing options) must exist per branching case.
- Cases with `learning_mode = 'REVIEW_STUDY'` do not use decision tree nodes/options (`context_text` and `problem_text` only).

---

## 6. AI Governance & Pedagogical Flow Rules

### 6.1. AI Safety & Non-Grading Guardrails
1. **Untrusted Data Boundary**: All retrieved teaching material chunks MUST be wrapped inside `<sources>...</sources>` tags in prompts. Retrieved text must never override system instructions.
2. **Zero AI Grading**: AI Reasoning / Challenge Support MUST NOT grade, score, rank, or assign pass/fail judgments to student reasoning, solutions, or reflections. Academic evaluation belongs 100% to human lecturers.
3. **2-Round Hard Cap**: AI Challenge Support is strictly limited to **1–2 rounds maximum** (`CHECK (current_round >= 0 AND current_round <= 2)`), enforced at both Backend Gateway and FastAPI AI Service.
4. **Immutability After Approval**: AI must never alter lecturer-approved case branches, consequences, or outcomes.

### 6.2. 3-Phase Branching Study Flow (CRITICAL)
1. **Phase 1 — Experience (`/student/cases/:caseId/branching-play`)**:
   - Students navigate decision points consecutively with **NO blocking steps** between nodes.
   - **Strictly forbidden mid-flow**: No reasoning form and no consequence card may appear between decision points during the Experience phase.
   - Selecting an option immediately records `selected_option_id` in `student_reasoning` (with `reasoning_text = NULL`) and advances to `option.next_node_id`.
2. **Phase 2 — REVIEW (`/student/cases/:caseId/attempt/:attemptId/review`)**:
   - Entered only after reaching a terminal node (`is_terminal = TRUE`, `is_completed = TRUE`).
   - Full journey timeline is replayed in chronological order.
   - **Consequence text (`case_options.consequence`) and alternative paths are revealed ONLY here in the REVIEW phase.**
   - **Retrospective Reasoning**: Students write `reasoning_text` retrospectively for pivotal decisions via `PUT/PATCH`.
3. **Phase 3 — Reflection & Retry (`/student/cases/:caseId/attempt/:attemptId/reflect`)**:
   - Student submits overall post-journey `reflection_text` (`reflection_status = 'SUBMITTED'`).
   - Student may optionally invoke AI Challenge Support (1–2 rounds) or initiate a **Retry**, which creates a **new immutable `branching_attempts` row** with `attempt_number = previous + 1`.

---

## 7. Git Workflow, Branch Naming & Commit Rules

### 7.1. Git Branching Model
```text
feature/<feature-name>   →  develop  →  main
fix/<description>        →  develop
hotfix/<description>     →  main
refactor/<module>        →  develop
docs/<topic>             →  develop
```

### 7.2. Strict Branch Naming Rules (MANDATORY)
1. **TUYỆT ĐỐI KHÔNG dùng mã task** (như `TASK-123`, `BE-001`, `FE-010`, `DES-001`, `EBA-105`) để đặt tên nhánh Git.
2. **Tên nhánh BẮT BUỘC theo domain/feature chung**: format `feature/<feature-name>` (ví dụ: `feature/auth`, `feature/branching-attempt`, `feature/course`, `feature/material`, `feature/case-review`, `docs/ui-standards`).
3. **Tính bền vững của nhánh**: Nhánh feature được dùng bền vững cho toàn bộ các công việc liên quan đến tính năng đó, không tạo nhánh vụn vặt theo task đơn lẻ.

### 7.3. Commit Convention & Task ID Rules (MANDATORY)
- **Format chuẩn**: `<type>(<scope>): <short description> [<TASK-ID>]` (hoặc `<type>(<scope>): <short description>` đối với commit tài liệu/hạ tầng chung không gắn mã task riêng lẻ).
  - *Ví dụ có Task ID*: `feat(auth): implement rate limiter guard [BE-002]`, `feat(course): implement course management [BE-003]`, `docs(design): define information architecture and shared states [DES-001]`
  - *Ví dụ tài liệu/cấu hình chung*: `docs(design): standardize ui design rules and synchronize project documentation`
- **Mã task CHỈ ĐƯỢC XUẤT HIỆN trong Commit Message**, tuyệt đối không đưa vào tên branch.
- **Types hợp lệ**: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `ci`
- **Scopes hợp lệ**: `backend` · `ai-service` · `frontend` · `infra` · `docs` · `design` · `qa` hoặc tên feature domain (`auth`, `course`, `case`, `material`, `branching-attempt`, `reasoning`, `challenge-support`, `review-study`, `lecturer-feedback`, `statistics`).
- **Pre-commit Safety Hook**: Luôn kích hoạt `.githooks/pre-commit` (`git config core.hooksPath .githooks`) để chặn commit nhầm file `.env`, khóa bí mật hoặc chứng chỉ.
- **Quy trình thực thi theo Task (Strict Task-by-Task Execution)**: Không tự ý sửa đổi logic nghiệp vụ ngoài phạm vi task đang thực hiện trong `docs/02_SPRINT-TASKS.md` và `docs/03_TASK-DETAILS.md`.

---

## 8. Coding Standards

- **Backend Gateway (`backend/`)**: NestJS modular architecture (`auth/`, `user/`, `course/`, `material/`, `case/`, `branching-attempt/`, `reasoning/`, `challenge-support/`, `review-study/`, `lecturer-feedback/`, `statistics/`, `evaluation/`, `notification/`, `common/`). Mandatory `class-validator` DTOs; never return raw DB entities.
- **AI Service (`ai-service/`)**: FastAPI domain packages (`core/`, `providers/`, `ingestion/`, `retrieval/`, `generation/`, `challenge_support/`, `evaluation/`). Always route LLM calls through `providers/factory.py`; strict Pydantic v2 schemas.
- **Frontend (`frontend/`)**: React 19 + TypeScript + TailwindCSS v4. All HTTP calls via `src/services/apiClient.ts`; state via Zustand (`src/stores/`); UI strictly governed by `.agents/rules/01-ui-design-standards.md` and `docs/design/GLOBAL-DESIGN-SYSTEM.md`.
