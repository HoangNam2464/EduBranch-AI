---
description: >-
  Global project rules for EduBranch-AI. Always loaded when working in this
  repository. Enforces architecture boundaries, coding standards, Git workflow,
  security rules, and engineering principles.
trigger: always_on
---

# EduBranch-AI — Global Project Rules

## 1. Project Identity & Pedagogical Domain

- **Name**: EduBranch-AI
- **Full Name**: EduBranch-AI — AI Platform for Experiential Case-Based Learning & Decision-Making Scenarios
- **Target Domain**: Higher-education experiential case-based learning & critical thinking cultivation (University-Level Case Learning Process)
- **Primary Actors**:
  - **Lecturer** (`LECTURER`): Course owner, curates teaching materials, generates and validates case studies, authors qualitative feedback, reviews student cohort statistics.
  - **Student** (`STUDENT`): University learner, traverses multi-branch decision trees (`Branching Study`) or open analytical dilemmas (`Review Study`), provides retrospective reasoning, reflects, and engages in Socratic challenge dialogues.
  - **Admin** (`ADMIN`): System-level operational governance and platform maintenance.
- **Technology Stack**:
  - **Backend Gateway**: Node.js 20 LTS (NestJS 10 + TypeScript)
  - **Internal AI Service**: Python 3.12 (FastAPI + Pydantic v2 + LangChain)
  - **Frontend Web App**: React 19 + Vite + TypeScript + TailwindCSS v4 + Zustand + ReactFlow
  - **Data & Storage**: PostgreSQL 16 + pgvector | MinIO (Object Storage) | Redis 7 (Cache/Session)
  - **LLM Providers**: Google Gemini 2.0 Flash / OpenAI GPT-4o-mini via Provider Abstraction (`providers/factory.py`)

### 1.1. Core Pedagogical Model: Experiential Case-Based Learning
1. **Higher-Education Case Focus**: EduBranch-AI is engineered specifically for university-level active learning through realistic multi-branch decision scenarios (`Branching Study`) and open analytical problems (`Review Study`) grounded in academic course materials (Business, Law, Medicine, Management, Engineering, etc.).
2. **Canonical Terminology Standards**:
   - Primary Actors: **Lecturer** and **Student**.
   - Academic Containers: **Course** and **Teaching Materials** (Syllabus, textbooks, real-world case archives).
   - Core Activity: **Case Study** (`Branching Study` & `Review Study`).
   - Reasoning & Reflection: **Student Reasoning**, **Reflection**, **Review Submission**.
   - Interactivity: **Branching Case Player**, **Branching Attempt**, **Journey Review**, **AI Challenge Support** (strictly Socratic, non-grading).
3. **Independent Project Governance**:
   - All specifications, schemas, tasks, and features derive strictly from the EduBranch-AI Proposal V1.2 (C1SE.65) and Product Direction V2, without mixing concepts or rules from external reference projects.

---

## 2. Repository Structure

```
EduBranch-AI/
├── backend/                    ← Node.js (NestJS 10) API Gateway
├── ai-service/                 ← FastAPI AI / RAG Service (INTERNAL ONLY)
├── frontend/                   ← React 19 + Vite + TailwindCSS v4
├── docs/                       ← Architecture, specifications & sprint backlogs
├── infrastructure/             ← Docker, Compose, migrations, cloud configs
├── scripts/                    ← Development, verification & bridge automation
├── .agents/rules/              ← AI coding agent governance rules (always in English)
├── .agents/specialists/        ← Specialized domain agent playbooks (always in English)
└── .github/workflows/          ← CI/CD pipelines
```

---

## 3. Architecture Boundaries

| Responsibility | Backend Gateway (`backend/`) | FastAPI AI Service (`ai-service/`) |
|---|:---:|:---:|
| Authentication, JWT, Google SSO (`@*.edu.vn`) & RBAC | ✅ | ❌ |
| User & Institutional Role Management | ✅ | ❌ |
| Course & Teaching Material Metadata | ✅ | ❌ |
| Case Lifecycle State Machine & Publication Gate | ✅ | ❌ |
| Branching Attempt Persistence (`branching_attempts`) | ✅ | ❌ |
| Student Reasoning Persistence (`student_reasoning`) | ✅ | ❌ |
| Review Study Submission Persistence (`review_study_submissions`) | ✅ | ❌ |
| Challenge Support Session & Message Persistence | ✅ | ❌ |
| Lecturer Qualitative Feedback Persistence (`lecturer_feedback`) | ✅ | ❌ |
| Lecturer Cohort & Branch Statistics | ✅ | ❌ |
| REST API Gateway for Frontend (`/api/v1/*`) | ✅ | ❌ |
| PDF/DOCX Document Parsing & Text Normalization | ❌ | ✅ |
| Recursive Text Chunking & Embeddings | ❌ | ✅ |
| pgvector Cosine Similarity Retrieval | ❌ | ✅ |
| RAG Prompt Assembly with `<sources>` Boundary | ❌ | ✅ |
| Structured Case Generation (LLM + DAG Validation) | ❌ | ✅ |
| Challenge Counter-Question Generation (LLM) | ❌ | ✅ |

**Strict Isolation**: The frontend communicates **exclusively** with the Backend Gateway. The FastAPI AI Service is **internal only** (`/internal/v1/*` protected by `X-Internal-API-Key`) and must never be exposed to the public internet or invoked directly from the client.

---

## 4. Case Lifecycle — Mandatory Human-in-the-Loop Gate

```
DRAFT  ──►  REVIEWED  ──►  APPROVED  ──►  PUBLISHED
```

- AI generates case draft $\rightarrow$ initialized as `DRAFT`.
- Lecturer reviews and edits $\rightarrow$ transitions to `REVIEWED` (or reverts to `DRAFT`).
- Lecturer approves $\rightarrow$ transitions to `APPROVED`.
- Lecturer publishes $\rightarrow$ transitions to `PUBLISHED`.
- **CRITICAL SECURITY INVARIANT (INV-01)**: Students MUST NEVER access cases that are not `PUBLISHED`. This must be enforced at the **database repository query level** (`WHERE status = 'PUBLISHED'`), never just in UI controllers or route guards.

---

## 5. Decision Tree Integrity (`BRANCHING_STUDY`)

- Every `CaseOption.nextNodeId` must reference a valid `CaseNode` within the same `Case` (or `null` if terminal).
- Every non-root node must be reachable from the `rootNodeId` (no orphan nodes).
- Zero cycles/loops are permitted (enforced by 3-color DFS cycle detection in `CaseGenerationOutput.validate_tree_structure` and on lecturer edits).
- Every non-terminal node must have between 2 and 4 options; at least one terminal node (`is_terminal = true`, 0 outgoing options) must exist per branching case.
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
   - Selecting an option immediately records `selected_option_id` in `student_reasoning` (with `reasoning_text = null`) and advances to `option.nextNodeId`.
2. **Phase 2 — REVIEW (`/student/cases/:caseId/attempt/:attemptId/review`)**:
   - Entered only after reaching a terminal node (`is_terminal = true`, `is_completed = true`).
   - Full journey timeline is replayed in chronological order.
   - **Consequence text (`case_options.consequence`) and alternative paths are revealed ONLY here in the REVIEW phase.**
   - **Retrospective Reasoning**: Students write `reasoning_text` retrospectively for pivotal decisions via `PUT/PATCH`.
3. **Phase 3 — Reflection & Retry (`/student/cases/:caseId/attempt/:attemptId/reflect`)**:
   - Student submits overall post-journey `reflection_text` (`reflection_status = 'SUBMITTED'`).
   - Student may optionally invoke AI Challenge Support (1–2 rounds) or initiate a **Retry**, which creates a **new immutable `branching_attempts` row** with `attempt_number = previous + 1`.

---

## 7. Git Workflow, Branch Naming & Commit Rules

### 7.1. Git Branching Model
```
feature/<feature-name>   →  develop  →  main
fix/<description>        →  develop
hotfix/<description>     →  main
refactor/<module>        →  develop
docs/<topic>             →  develop
```

### 7.2. Strict Branch Naming Rules (MANDATORY)
1. **ABSOLUTELY NO TASK CODES IN BRANCH NAMES**: Never include task codes (e.g., `TASK-123`, `BE-001`, `FE-010`, `DES-001`, `EBA-105`) in git branch names.
2. **Standard Domain-Based Branch Format**: Always use domain/feature format: `feature/<feature-name>` (e.g., `feature/auth`, `feature/branching-attempt`, `feature/course`, `feature/material`, `feature/case-review`, `docs/ui-standards`).
3. **Persistent Feature Branches**: A feature branch serves all related work across sprints for that domain; avoid creating fragmented branches for tiny sub-tasks.

### 7.3. Commit Convention & Task ID Placement
- **Format**: `<type>(<scope>): <short description> [<TASK-ID>]` (or `<type>(<scope>): <short description>` for general infrastructure/docs).
  - *Example with Task ID*: `feat(auth): implement rate limiter guard [BE-002]`, `feat(course): implement course management [BE-003]`, `docs(design): define information architecture [DES-001]`
  - *Example for general docs/infra*: `docs(rules): synchronize global project governance rules in pure english`
- **Task Code Placement**: Task IDs belong **exclusively in the commit message**, never in branch names.
- **Valid Types**: `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore` · `ci`
- **Valid Scopes**: `backend` · `ai-service` · `frontend` · `infra` · `docs` · `design` · `qa` or domain feature (`auth`, `course`, `case`, `material`, `branching-attempt`, `reasoning`, `challenge-support`, `review-study`, `lecturer-feedback`, `statistics`).

---

## 8. Coding Standards

### TypeScript / NestJS (Backend Gateway)
- Module structure: `auth/`, `user/`, `course/`, `material/`, `case/`, `branching-attempt/`, `reasoning/`, `challenge-support/`, `review-study/`, `lecturer-feedback/`, `statistics/`, `evaluation/`, `notification/`, `common/`
- Mandatory DTO layer with `class-validator` — never expose raw database entities directly in REST responses.
- Strict TypeScript configuration (`tsconfig.json`).

### Python / FastAPI (AI Service)
- Package structure: `core/`, `providers/`, `ingestion/`, `retrieval/`, `generation/`, `challenge_support/`, `evaluation/`
- **Always** route LLM calls through `providers/factory.py` — never hardcode vendor SDKs in route handlers.
- Pydantic v2 schemas for all request/response models.

### React / TypeScript (Frontend)
- API calls exclusively via `src/services/apiClient.ts`
- Global state managed via Zustand (`src/stores/`)
- Styling strictly adheres to `.agents/rules/01-ui-design-standards.md` and `docs/design/GLOBAL-DESIGN-SYSTEM.md`
- **Never** store secrets in frontend environment variables.

---

## 9. Scope Boundaries

### IN SCOPE
Institutional Google SSO (`@*.edu.vn`) & Academic Email/Password Authentication · Course Management · Teaching Material Ingestion · Vector Embeddings & RAG Retrieval · DAG Case Generation (Branching & Review Study) · Human Lecturer Review & Publication Gate · Branching Case Player (3 Phases) · Retrospective Student Reasoning · Review Study Submissions · AI Challenge Support (1-2 Socratic rounds, non-grading) · Student Reflections · Qualitative Lecturer Feedback · Cohort Statistics & Visualizations · System Operational Boundaries (Admin/403/404)

### OUT OF SCOPE
Lesson planning / K-12 blueprints · Generic consumer social logins (Facebook, TikTok, X) · Commercial payment gateways & SaaS subscriptions · Generic free-form chat widgets · LMS plugins · Real-time multi-user canvas collaboration · Native mobile applications · Automatic algorithmic student grading · Unconstrained multi-agent swarms
