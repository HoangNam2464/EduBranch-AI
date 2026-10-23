 EduBranch-AI — Website & Application Architecture Reference

> **Canonical Path**: `docs/design/SITE-ARCHITECTURE.md` (formerly `docs/design/SITE-ARCHITECTURE.md`)  
> **Companion Specs**: `.agents/rules/01-ui-design-standards.md` · `docs/design/GLOBAL-DESIGN-SYSTEM.md` · `docs/design/screens/P0-FOUNDATION.md`–`P4-REVIEW-STUDY.md`  
> **Product Name**: EduBranch-AI  
> **Full Title**: EduBranch-AI — AI Platform for Experiential Case-Based Learning & Decision-Making Scenarios

---

## 1. Product Vision

EduBranch-AI is an educational technology platform engineered specifically for **university-level experiential case-based learning**. It transforms static teaching materials (textbooks, lecture slides, academic papers, and syllabi) into rich, interactive **Branching Study** and **Review Study** cases.

Rather than passively reading theoretical texts, students are immersed into realistic professional dilemmas where they navigate consecutive decision points first (Experience-First), and then enter a dedicated **REVIEW Phase** that reveals lecturer-authored consequences, captures retrospective reasoning, and provides optional **AI Reasoning / Challenge Support** (up to 2 rounds of targeted counter-questions without grading, scoring, or pass/fail determination).

Lecturers remain strictly in the loop: every AI-generated case starts in `DRAFT` status and must be verified, edited, approved, and explicitly published by the lecturer before any student can access it.

---

## 2. Target Users & Roles

The system strictly serves two distinct academic user roles:

| User Role | Responsibilities & Activities | Core Needs in UI |
|---|---|---|
| **Lecturer (`LECTURER`)** | Manages courses, uploads teaching materials (PDF/DOCX), triggers AI case generation, reviews and edits decision trees via interactive visual editor (ReactFlow) or Review Study form editor, approves/publishes cases, inspects student branch choices, reasoning, and statistics, provides qualitative academic feedback. | Uncluttered management workspace (`240px` left sidebar), split-screen ReactFlow editor, fast document ingestion, clear publication lifecycle controls. |
| **Student (`STUDENT`)** | Participates in **Branching Study** (Phase 1: consecutive decision-point navigation → Phase 2: REVIEW screen revealing consequences + retrospective Student Reasoning + optional AI Challenge Support → Phase 3: Reflection & Retry) and **Review Study** (analyzes case context and problems, submits proposed solutions and reasoning, inspects lecturer feedback, writes reflection). | Distraction-free reading experience (`56px` compact top bar, `max-w-3xl` single-column prose layout), clear retrospective consequence analysis, structured Socratic counter-question threads. |

*(Note: Unauthenticated visitors only have access to `/login` and `/register`).*

---

## 3. Product Goals

1. **Active Decision-Making Over Passive Reading**: Elevate university case method pedagogy through dynamic multi-branch decision trees and structured open-ended review studies.
2. **AI with Human-in-the-Loop Governance**: AI drafts cases from authenticated course materials via RAG (`<sources>...</sources>`); the lecturer retains 100% editorial authority.
3. **Socratic Reasoning Challenge, NOT Autonomous Grading**: AI Reasoning / Challenge Support challenges student reasoning with targeted counter-questions capped at 2 rounds; academic evaluation remains the exclusive domain of faculty.
4. **Pedagogical Insights**: Provide lecturers with simple, clear learning-flow statistics (branch selection distribution, completion rates, attempt counts, and outcomes) to observe student decision pathways.

---

## 4. Product Experience Attributes

- **Academic & Focused**: Engineered for critical thinking — zero Unicode emojis, zero ASCII symbol hacks, zero gamified badges, and zero purple/indigo "AI-slop" gradients.
- **Efficient & Professional**: High-density management layouts for lecturers (`max-w-7xl`) paired with calm, distraction-free reading layouts for students (`max-w-3xl`).
- **Predictable & Governed**: Transparent AI provenance showing which teaching materials informed each case dilemma.
- **Light-First Academic Presentation**: Clean, neutral, high-contrast light surfaces (`#F8FAFC` canvas, `#FFFFFF` cards, `#E2E8F0` hairlines, `#2563EB` primary action) suitable for extended analytical reading and review sessions.

---

## 5. Canonical Application Sitemap (15 Routes — Full Figma Template Coverage)

Because the Sprint Backlog tasks focus on core functional workflows, the Figma Master Template (`docs/05_FIGMA.md`) explicitly covers both the **foundational/public screens** (`/`, `/login`, `/register`, App Shells, Course Catalog, 403/404) and the **core academic feature screens**:

### 5.1. Public & Onboarding Routes (`PublicLayout`)
- `/` — **Product Landing & Academic Introduction Page**: Introduces EduBranch-AI, compares `Branching Study` vs `Review Study`, illustrates the 4-step Human-in-the-Loop workflow, and provides direct entry (`Sign In` / `Create Account`).
- `/login` — **Sign In Page**: University email & password authentication (`pages/auth/LoginPage.tsx`).
- `/register` — **Account Registration Page**: University account creation with explicit `Lecturer` / `Student` role selection (`pages/auth/RegisterPage.tsx`).

### 5.2. Lecturer Portal (`LecturerLayout` — `240px` Left Sidebar)
- `/lecturer/courses` — Course catalog & creation interface (`CoursesPage.tsx`).
- `/lecturer/courses/:courseId/materials` — Teaching materials upload center (`MaterialsPage.tsx`).
- `/lecturer/courses/:courseId/cases` — Case study management, filter by learning mode (`BRANCHING_STUDY` vs `REVIEW_STUDY`), trigger AI Case Generation (`CasesPage.tsx`).
- `/lecturer/cases/:caseId/review` — Interactive ReactFlow Decision Tree Editor (`BRANCHING_STUDY`) or structured form editor (`REVIEW_STUDY`), node editing, approval and publishing workflow (`CaseReviewPage.tsx`).
- `/lecturer/cases/:caseId/feedback` — Review student attempts/submissions and submit qualitative lecturer feedback (`LecturerFeedbackPage.tsx`).
- `/lecturer/statistics` — Branch selection distribution, participation metrics, and attempt analytics (`StatisticsPage.tsx`).

### 5.3. Student Portal (`StudentLayout` — `56px` Compact Top Header)
- `/student/cases/:caseId/branching-play` — **Branching Case Player (Phase 1: Experience)**: Situation → Select Option → Immediate Advance (`selected_option_id` recorded, no reasoning form or consequence card mid-flow) → Terminal Outcome Card (`BranchingCasePlayerPage.tsx`).
- `/student/cases/:caseId/attempt/:attemptId/review` — **Branching Study Review & Analysis (Phase 2: REVIEW)**: Reveals full chronological decision journey, lecturer-authored `consequence` for each chosen option, per-decision-point retrospective Student Reasoning input (`10–2000` chars), and per-node AI Challenge Support trigger (`BranchingReviewPage.tsx`).
- `/student/cases/:caseId/attempt/:attemptId/reflect` — **Post-Outcome Reflection (Phase 3: Reflection & Retry)**: Final reflection submission (`reflection_text`) and immutable `Retry Case (New Attempt)` action (`ReflectionPage.tsx`).
- `/student/cases/:caseId/challenge/:sessionId` — **AI Reasoning / Challenge Support**: Dedicated full-page 1–2 round Socratic counter-question thread supporting both Branching Study and Review Study (`ChallengeSupportPage.tsx`).
- `/student/cases/:caseId/review-study` — **Review Study Workspace**: Case context & problem analysis, proposed solution formulation, and reasoning submission (`ReviewStudyPage.tsx`).
- `/student/cases/:caseId/review-study/:submissionId/feedback` — **Review Study Feedback & Reflection**: Inspection of lecturer feedback and post-feedback student reflection (`ReviewFeedbackPage.tsx`).

---

## 6. Major Application Workflows

```
Workflow 1: Material Ingestion
Lecturer uploads PDF/DOCX → MinIO Storage → FastAPI parses & chunks → pgvector embeddings stored.

Workflow 2: AI Case Generation & Specification
Teaching material / lecturer-provided case context → RAG retrieves course chunks (<sources>...</sources>) → LLM drafts Case JSON (Branching Study or Review Study) → Case created as DRAFT.

Workflow 3: Human-in-the-Loop Review
Lecturer verifies and edits case draft → Validates Branching Study tree structure (DFS 3-color cycle detection, reachable nodes, valid terminal nodes) or Review Study content → Moves through REVIEWED → APPROVED → PUBLISHED.

Workflow 4: Branching Study (3-Phase Experience-First Model)
  • Phase 1 (Experience): Context/Data → Decision Point → Select Option (records selected_option_id immediately; NO mid-flow reasoning, NO mid-flow consequence) → Next Node → Terminal Outcome Node.
  • Phase 2 (REVIEW): Full Decision Path Revealed → Lecturer-authored Consequence per step → Retrospective Student Reasoning per Decision Point (10–2000 chars) → Optional AI Challenge Support (max 2 rounds per node).
  • Phase 3 (Reflection & Retry): Post-Outcome Student Reflection → Optional New Attempt / Retry (attempt_number + 1).

Workflow 5: Review Study
Context/Data → Problem → Student Analysis (optional) → Proposed Solution → Student Reasoning → Optional AI Challenge Support (max 2 rounds) → Lecturer Review / Feedback → Student Reflection.

Workflow 6: AI Reasoning / Challenge Support
Student submits reasoning (in Branching Study REVIEW phase or Review Study) → Optional Challenge Support invoked → AI poses targeted challenge/counter-question (Round 1) → Student may clarify/respond (Round 2 max) → Challenge concluded (is_completed = TRUE).
(Strict guardrails: cross-mode support for both Branching and Review Study, maximum 2 rounds, challenge/counter-questions only, no grading, no scoring, no academic right/wrong decision).
```

---

## 7. Internal Design Tooling ("Bắt đầu với thiết kế của bạn")

> **Classification: INTERNAL DESIGN TOOLING**  
> This tooling is strictly used for Stitch/UI-authoring workflows during development. It is **NOT** an EduBranch-AI user-facing product feature, is **NOT** part of the Lecturer or Student product sitemap, and must **NOT** be treated as a product requirement.

---

## 8. Design Documentation Map

All screen-level specifications are maintained in `docs/design/screens/`:

- **P0 — Global Foundation** ([`P0-FOUNDATION.md`](file:///C:/Users/OS/.gemini/antigravity/worktrees/EduBranch-AI/standardize_ui_docs_rules/docs/design/screens/P0-FOUNDATION.md)): App shells (`LecturerLayout`, `StudentLayout`, `PublicLayout`), authentication screens (`/login`, `/register`), status/mode badges, and shared primitive components.
- **P1 — Core Lecturer Flow** ([`P1-LECTURER-CORE.md`](file:///C:/Users/OS/.gemini/antigravity/worktrees/EduBranch-AI/standardize_ui_docs_rules/docs/design/screens/P1-LECTURER-CORE.md)): Course catalog (`/lecturer/courses`), materials ingestion management (`/lecturer/courses/:courseId/materials`), case list (`/lecturer/courses/:courseId/cases`), and interactive Case Review with ReactFlow Decision Tree Editor (`/lecturer/cases/:caseId/review`).
- **P2 — Core Student Flow** ([`P2-STUDENT-CORE.md`](file:///C:/Users/OS/.gemini/antigravity/worktrees/EduBranch-AI/standardize_ui_docs_rules/docs/design/screens/P2-STUDENT-CORE.md)): 3-Phase Branching Study screens (`/student/cases/:caseId/branching-play`, `/student/cases/:caseId/attempt/:attemptId/review`, `/student/cases/:caseId/attempt/:attemptId/reflect`) and cross-mode AI Reasoning / Challenge Support (`/student/cases/:caseId/challenge/:sessionId`).
- **P3 — Support & Statistics** ([`P3-SUPPORT-AND-STATISTICS.md`](file:///C:/Users/OS/.gemini/antigravity/worktrees/EduBranch-AI/standardize_ui_docs_rules/docs/design/screens/P3-SUPPORT-AND-STATISTICS.md)): Basic Learning-Flow Statistics (`/lecturer/statistics`) and Lecturer Feedback workspace (`/lecturer/cases/:caseId/feedback`).
- **P4 — Secondary Review Study** ([`P4-REVIEW-STUDY.md`](file:///C:/Users/OS/.gemini/antigravity/worktrees/EduBranch-AI/standardize_ui_docs_rules/docs/design/screens/P4-REVIEW-STUDY.md)): Review Study reading & solution formulation (`/student/cases/:caseId/review-study`) and student inspection of lecturer feedback (`/student/cases/:caseId/review-study/:submissionId/feedback`).
