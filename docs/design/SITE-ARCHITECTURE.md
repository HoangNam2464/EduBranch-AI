# EduBranch-AI — Website & Application Architecture Reference

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]`
> - **Canonical Path**: `docs/design/SITE-ARCHITECTURE.md`
> - **Companion Specs**: PO-approved Figma (`docs/05_FIGMA.md`, per-screen design authority) · `.agents/rules/01-ui-design-standards.md` (`R01`, general UI quality standards) · `docs/design/screens/P0-FOUNDATION.md`–`P4-REVIEW-STUDY.md`
> - **Product Name**: EduBranch-AI
> - **Full Title**: EduBranch-AI — AI Platform for Experiential Case-Based Learning & Decision-Making Scenarios

---

## 1. Product Vision

EduBranch-AI is an educational technology platform engineered specifically for **university-level experiential case-based learning**. It transforms static teaching materials (textbooks, lecture slides, academic papers, and syllabi) into rich, interactive **Branching Study** and **Review Study** cases.

Rather than passively reading theoretical texts, students are immersed into realistic professional dilemmas where they navigate consecutive decision points first (Experience-First), and then enter a dedicated **REVIEW Phase** that reveals lecturer-authored consequences, captures retrospective reasoning, and provides optional **AI Reasoning / Challenge Support** (up to 2 rounds of targeted counter-questions without grading, scoring, or pass/fail determination).

Lecturers remain strictly in the loop: every AI-generated case starts in `DRAFT` status and must be verified, edited, approved, and explicitly published by the lecturer before any student can access it.

---

## 2. Target Users & Roles

The system serves two academic user roles plus a system administrator (Admin, in MVP since OPD-015 → B, 2026-11-12):

| User Role | Responsibilities & Activities | Core Needs in UI |
|---|---|---|
| **Lecturer (`LECTURER`)** | Manages courses, uploads teaching materials (PDF/DOCX), triggers AI case generation, reviews and edits decision trees via interactive visual editor (ReactFlow) or Review Study form editor, approves/publishes cases, inspects student branch choices, reasoning, and statistics, provides qualitative academic feedback. | Uncluttered collapsible sidebar workspace (`AppShell`), split-screen ReactFlow editor, fast document ingestion, clear publication lifecycle controls. |
| **Student (`STUDENT`)** | Participates in **Branching Study** (Phase 1: consecutive decision-point navigation → Phase 2: REVIEW screen revealing consequences + retrospective Student Reasoning + optional AI Challenge Support → Phase 3: Reflection & Retry) and **Review Study** (analyzes case context and problems, submits proposed solutions and reasoning, inspects lecturer feedback, writes reflection). | Distraction-free reading experience inside the shared `AppShell` (`HeaderActions` + collapsible `Sidebar`, `65–75ch` reading measure per R01 §3.1), clear retrospective consequence analysis, structured Socratic counter-question threads. |

| **Admin (`ADMIN`)** | Manages accounts (lock/unlock), views system-wide courses, cases, AI service status (view only), logs, research rubric and platform settings. | One dashboard with admin-only charts; read-mostly tables; no editing of lecturer content. |

*(Note: Unauthenticated visitors only have access to `/`, `/login` and `/register`; admins sign in at `/admin/login`).*

---

## 3. Product Goals

1. **Active Decision-Making Over Passive Reading**: Elevate university case method pedagogy through dynamic multi-branch decision trees and structured open-ended review studies.
2. **AI with Human-in-the-Loop Governance**: AI drafts cases from authenticated course materials via RAG (`<sources>...</sources>`); the lecturer retains 100% editorial authority.
3. **Socratic Reasoning Challenge, NOT Autonomous Grading**: AI Reasoning / Challenge Support challenges student reasoning with targeted counter-questions capped at 2 rounds; academic evaluation remains the exclusive domain of faculty.
4. **Pedagogical Insights**: Provide lecturers with simple, clear learning-flow statistics (branch selection distribution, completion rates, attempt counts, and outcomes) to observe student decision pathways.

---

## 4. Product Experience Attributes

- **Academic & Focused**: Engineered for critical thinking — zero Unicode emojis, zero ASCII symbol hacks, zero gamified badges, and zero purple/indigo "AI-slop" gradients.
- **Efficient & Professional**: One shared app shell (sidebar, header actions, footer) for lecturer, student and admin; reading and writing areas keep a 65–75 character measure.
- **Predictable & Governed**: Transparent AI provenance showing which teaching materials informed each case dilemma.
- **Light-First Academic Presentation**: Clean, neutral, high-contrast light surfaces (`bg/canvas` page background, white cards, light hairlines, navy `#2A4E7F` primary action and sky `#00A5F5` accent — see R01) suitable for extended analytical reading and review sessions.

---

## 5. Canonical Application Sitemap (Figma page EduBranch AI – Screens)

Because the Sprint Backlog tasks focus on core functional workflows, the Figma Master Template (`docs/05_FIGMA.md`) explicitly covers both the **foundational/public screens** (`/`, `/login`, `/register`, App Shells, Course Catalog, 403/404) and the **core academic feature screens**:

### 5.1. Public & Onboarding Routes (`PublicLayout`)
- `/` — **Product Landing & Academic Introduction Page**: Introduces EduBranch-AI, compares `Branching Study` vs `Review Study`, illustrates the 5-step Human-in-the-Loop workflow, answers common questions, and provides direct entry (`Sign In` / `Create Account`). Single scrolling page: How it works (`#cach-hoat-dong`), learning modes (`#hai-che-do`) and FAQ (`#cau-hoi`) are anchor sections reached from the public nav, not separate routes.
- `/login` — **Sign In Page**: University email & password authentication (`pages/auth/LoginPage.tsx`).
- `/register` — **Account Registration Page**: University account creation with explicit `Lecturer` / `Student` role selection (`pages/auth/RegisterPage.tsx`).
- `/forgot-password`, `/reset-password` — **Forgot & Reset Password Pages** [08]: Email recovery request and new-password form (included in MVP UI per PO 2026-11-25; `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`; backend reset API pending).

> Update 2026-11-25: **PO-approved Figma** (`EduBranch AI – Screens`) is the official design authority per screen, implemented in code using `Plus Jakarta Sans` + `Inter` and `R01` general quality rules (never edit Figma to justify old code; mark R01-vs-Figma conflicts `UNRESOLVED`). Frame codes are shown in brackets; per-screen behaviour is in [`UX-SCREEN-NOTES.md`](UX-SCREEN-NOTES.md).

### 5.2. Lecturer Portal (`LecturerLayout` — shared collapsible sidebar)
- `/lecturer/dashboard` — Lecturer dashboard [07.1] (`D-05` 2026-11-12 → in MVP; **`OPEN PO DECISION`**: post-login default landing route `ROLE_HOME.LECTURER` — `/lecturer/dashboard` vs `/lecturer/courses` currently in `frontend/src/routes/paths.ts`).
- `/lecturer/courses` — Course catalog with detail panel, create and archive dialogs [02.1–02.3] (courses are archived, not deleted: OPD-014, PO 2026-11-16) (`CoursesPage.tsx`).
- `/lecturer/courses/:courseId/materials` — Material upload and indexing status [02.4–02.6] (`MaterialsPage.tsx`).
- `/lecturer/courses/:courseId/materials/:materialId/rag` — Indexed excerpts of a document [02.7] (`RagSourceInspectorPage.tsx`).
- `/lecturer/cases`, `/lecturer/courses/:courseId/cases` — Case library, filter by status and learning mode [03.1–03.3] (`CasesPage.tsx`).
- `/lecturer/ai-studio` — 3-step AI case generation wizard [07.6 → 07.5 → 07.7] (OPD-006 → wizard) (`AiStudioPage.tsx`).
- `/lecturer/cases/:caseId/review` — Case editor (decision tree for `BRANCHING_STUDY`, context/problem form for `REVIEW_STUDY`), review bar and publish dialog [03.4–03.7] (`CaseReviewPage.tsx`).
- `/lecturer/feedback`, `/lecturer/feedback/:submissionId` (vs `/lecturer/cases/:caseId/feedback` in `P3-SUPPORT-AND-STATISTICS.md` — **`OPEN PO DECISION / UNRESOLVED`**: confirm dual overview + case-scoped routing or standardize one canonical path) — Review queue and submission detail with qualitative feedback [04.1, 04.2, 04.2b].
- `/lecturer/statistics` — Learning-flow statistics [04.3] (`StatisticsPage.tsx`).
- `/lecturer/cases/:caseId/rubric` — Research rubric for case quality [07.8] (OPD-011 → A).
- `/lecturer/profile` — Account profile [09.1].

### 5.3. Student Portal (`StudentLayout` — same shared sidebar shell)
- `/student/desk` — Student desk [07.2] (OPD-001 → A).
- `/student/courses` — My courses, join a class by invite code (dialog) [07.3, 07.4].
- `/student/cases/:caseId/branching-play` — **Branching Case Player (Phase 1: Experience)** [05.1–05.3]: Situation → Select Option → Immediate Advance (no reasoning form or consequence card mid-flow) → end of journey (`BranchingCasePlayerPage.tsx`).
- `/student/cases/:caseId/attempt/:attemptId/review` — **Journey Review (Phase 2)** [05.4]: full chronological path, revealed consequences, retrospective reasoning (`BranchingReviewPage.tsx`).
- `/student/cases/:caseId/challenge/:sessionId` — **AI Challenge Support** [05.5, 05.6]: 1–2 Socratic rounds, zero grading. Figma shows a dialog over Journey Review; modal vs. full page is still **OPD-005 (HOLD)** (`ChallengeSupportPage.tsx`).
- `/student/cases/:caseId/attempt/:attemptId/reflect` — **Reflection & Retry (Phase 3)** [05.7, 05.8] (`ReflectionPage.tsx`).
- `/student/history`, `/student/cases/:caseId/history` — Attempt history and new-attempt dialog [05.9, 05.10] (`StudentAttemptsHistoryPage.tsx`).
- `/student/cases/:caseId/review-study` — **Review Study Workspace** [06.1] (`ReviewStudyPage.tsx`).
- `/student/cases/:caseId/review-study/:submissionId/feedback` — **Review Study submitted / feedback & reflection** [06.2, 06.3] (`ReviewFeedbackPage.tsx`).
- `/student/profile` — Account profile without scores [09.2].

### 5.4. Admin Portal (`AdminLayout`, OPD-015 → B)
- `/admin/login` [10.1] · `/admin/dashboard` [10.2] · `/admin/users` [10.3, 10.4] · `/admin/courses` [10.5] · `/admin/cases` [10.6] · `/admin/ai-service` (view only, OPD-013) [10.7] · `/admin/rubric` [10.8] · `/admin/logs` [10.9] · `/admin/settings` [10.10].

### 5.5. Shared states
- Loading, empty, load error, no search results inside the page [01.1–01.3, 01.8]; full-page 403 / 404 / 500 without shell [01.4, 01.5, 01.7]; session-expired dialog [01.6]. Forgot / reset password screens [section 08] are included in MVP UI (§5.1, PO 2026-11-25; backend API pending).

---

## 6. Major Application Workflows

> End-to-end technical sequence diagrams live in [`docs/architecture/DATA-FLOW.md`](../architecture/DATA-FLOW.md).

| Workflow | Summary | Authoritative Spec |
|---|---|---|
| **1. Material Ingestion** | Upload PDF/DOCX → MinIO → FastAPI parse & chunk → pgvector `vector(768)` | [`FEATURE-COURSE-AND-MATERIALS`](../features/FEATURE-COURSE-AND-MATERIALS.md), [`RAG-PIPELINE`](../ai/RAG-PIPELINE.md) |
| **2. AI Case Generation** | RAG `<sources>` retrieval → LLM structured JSON (`DRAFT`) | [`FEATURE-CASE-GENERATION`](../features/FEATURE-CASE-GENERATION.md) |
| **3. Human Review & Publish** | Edit Branching DAG / Review form → `REVIEWED → APPROVED → PUBLISHED` (`INV-01`) | [`FEATURE-CASE-REVIEW-AND-PUBLISHING`](../features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md) |
| **4. Branching Study (3-Phase)** | Phase 1 Experience (no consequences mid-flow) → Phase 2 Journey Review (consequences + reasoning) → Phase 3 Reflection & Retry | [`FEATURE-BRANCHING-STUDY`](../features/FEATURE-BRANCHING-STUDY.md) |
| **5. Review Study** | Context/Problem → single submission (`student_analysis` optional `D4-13`) → Lecturer Feedback → Reflection | [`FEATURE-REVIEW-STUDY`](../features/FEATURE-REVIEW-STUDY.md) |
| **6. AI Challenge Support** | Cross-mode Socratic counter-questions (`<=2` rounds, zero grading; modal vs page `OPD-005` open) | [`FEATURE-AI-REASONING-CHALLENGE-SUPPORT`](../features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md) |

---

## 7. Retired UI Drafts & Design Authority

> **RETIRED SOURCE (`AGENTS.md` rule 3)**: Ad-hoc UI generation prompts/scripts and retired initial flat-gray templates are **never used** in EduBranch-AI. Design standards live solely in `.agents/rules/01-ui-design-standards.md` (`R01`) and `frontend/src/index.css` (target modular stylesheets in `frontend/src/styles/`), plus Figma `EduBranch AI – Screens` for screen content.

---

## 8. Design Documentation Map

All screen-level specifications are maintained in `docs/design/screens/`:

- **P0 — Global Foundation** ([`P0-FOUNDATION.md`](screens/P0-FOUNDATION.md)): App shells (`LecturerLayout`, `StudentLayout`, `AdminLayout`, `PublicLayout`), authentication screens (`/login`, `/register`), status/mode badges, and shared primitive components.
- **P1 — Core Lecturer Flow** ([`P1-LECTURER-CORE.md`](screens/P1-LECTURER-CORE.md)): Lecturer Dashboard (`/lecturer/dashboard`, `D-05` in MVP; `ROLE_HOME.LECTURER` default `OPEN PO DECISION`), 3-step AI Studio (`/lecturer/ai-studio`, `OPD-006`), Course catalog (`/lecturer/courses`), materials ingestion (`/lecturer/courses/:courseId/materials`), case library (`/lecturer/cases`, `/lecturer/courses/:courseId/cases`), and interactive Case Review (`/lecturer/cases/:caseId/review`).
- **P2 — Core Student Flow** ([`P2-STUDENT-CORE.md`](screens/P2-STUDENT-CORE.md)): Student Entry (`/student/desk`, `/student/courses`, `/student/history`), 3-Phase Branching Study screens (`/student/cases/:caseId/branching-play`, `/student/cases/:caseId/attempt/:attemptId/review`, `/student/cases/:caseId/attempt/:attemptId/reflect`), and cross-mode AI Reasoning / Challenge Support (`/student/cases/:caseId/challenge/:sessionId`).
- **P3 — Support & Statistics** ([`P3-SUPPORT-AND-STATISTICS.md`](screens/P3-SUPPORT-AND-STATISTICS.md)): Basic Learning-Flow Statistics (`/lecturer/statistics`) and Lecturer Feedback workspace (MVP scope per PO `2026-11-25`; route convention `/lecturer/feedback` vs `/lecturer/cases/:caseId/feedback`, `D-04`, and `OPD-010` remain **`OPEN PO DECISION / UNRESOLVED`**).
- **P4 — Review Study** ([`P4-REVIEW-STUDY.md`](screens/P4-REVIEW-STUDY.md)): Review Study reading & solution formulation (`/student/cases/:caseId/review-study`) and student inspection of lecturer feedback (`/student/cases/:caseId/review-study/:submissionId/feedback`) — MVP scope per PO `2026-11-25`; `D4-13` remains **`OPEN PO DECISION / UNRESOLVED`**.
