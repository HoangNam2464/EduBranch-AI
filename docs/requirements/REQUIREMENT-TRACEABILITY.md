# EduBranch AI — Proposal Requirement Traceability Matrix

> - **Document Class**: `[PO SCOPE / DECISION]` (Proposal V1.2 Requirement Traceability Matrix)
> - **Authoritative Source**: `C1SE_65-EduBranch-AI-Proposal_V1.2.docx` (September 28, 2026 — Renamed to EduBranch AI: updated Branching Study & future enhancements)
> - **Snapshot Synced**: 2026-11-25 (`develop` `0e78075` + PO decisions through 2026-11-25)
> - **Status States** *(note: `Implemented` indicates running code + tests on `develop`, NOT PO acceptance or Jira Done — `AGENTS.md` rule 10)*:
> - **`Documented`**: Specification authored in `docs/` according to standard; no business implementation yet.
> - **`Structurally Scaffolded` / `Partial`**: Architectural boundary or partial UI/API exists; full workflow pending (`BE-033` in PR #80, or Phase 2).
> - **`Implemented`**: Business logic, endpoints, and tests active across the implemented tiers on `develop`.

---

## 1. Traceability Matrix: Core Traceability Items Extracted from Proposal V1.2

| # | Traceability Item | Proposal Source Reference | Authoritative Documentation | Target Implementation Area | Status |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Authentication & Roles** | Section 4 & Section 6 | [`docs/features/FEATURE-AUTH-AND-ROLES.md`](../features/FEATURE-AUTH-AND-ROLES.md) | Backend `auth/`, `user/` + Frontend `pages/auth/` | **Implemented** *(email/JWT/RBAC; Forgot/Reset Password MVP UI active, BE APIs + `rememberMe` TTL + OAuth `BE-034` pending)* |
| **2** | **Lecturer Role** | Section 2 & Section 4 | [`docs/features/FEATURE-AUTH-AND-ROLES.md`](../features/FEATURE-AUTH-AND-ROLES.md) | Backend `user/`, Frontend `layouts/LecturerLayout.tsx` | **Implemented** *(Dashboard `D-05` 07.1 in MVP; `ROLE_HOME.LECTURER` `/lecturer/courses` vs `/lecturer/dashboard` `OPEN PO DECISION`)* |
| **3** | **Student Role** | Section 2 & Section 4 | [`docs/features/FEATURE-AUTH-AND-ROLES.md`](../features/FEATURE-AUTH-AND-ROLES.md) | Backend `user/`, Frontend `layouts/StudentLayout.tsx` | **Implemented** |
| **4** | **Course Context** | Section 4 & Table 1 | [`docs/features/FEATURE-COURSE-AND-MATERIALS.md`](../features/FEATURE-COURSE-AND-MATERIALS.md) | Backend `course/` + Frontend `pages/courses/CoursesPage.tsx`, `StudentCoursesPage.tsx` | **Implemented** *(incl. `V5` invite-code enrollments & soft archive `OPD-014`)* |
| **5** | **Teaching Materials (PDF/DOCX)** | Section 2 & Section 4 | [`docs/features/FEATURE-COURSE-AND-MATERIALS.md`](../features/FEATURE-COURSE-AND-MATERIALS.md) | Backend `material/` + MinIO Object Storage + `pages/materials/` | **Implemented** |
| **6** | **Document Processing & Chunking** | Section 4 & Section 6 | [`docs/features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`](../features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md) | AI Service `ingestion/` (parser + chunker) | **Implemented** |
| **7** | **RAG Retrieval (pgvector)** | Section 4 & Section 7 | [`docs/features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`](../features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md) | AI Service `retrieval/` + pgvector HNSW (`vector(768)`) | **Implemented** |
| **8** | **AI Case Draft Generation** | Section 4 & Section 6 | [`docs/features/FEATURE-CASE-GENERATION.md`](../features/FEATURE-CASE-GENERATION.md) | AI Service `generation/` (Structured Output) + `pages/cases/AiStudioPage.tsx` | **Implemented** |
| **9** | **Two Learning Modes** | Proposal line 34, 75 | [`docs/architecture/DATA-FLOW.md`](../architecture/DATA-FLOW.md) | Backend `cases.learning_mode`, Frontend types | **Implemented** |
| **10** | **Branching Decision Tree** | Section 2 & Section 4 | [`docs/features/FEATURE-DECISION-TREE.md`](../features/FEATURE-DECISION-TREE.md) | Backend `case/`, Frontend ReactFlow (`pages/cases/`) | **Implemented** |
| **11** | **Situation Node & Options** | Section 4 & Section 9 | [`docs/features/FEATURE-DECISION-TREE.md`](../features/FEATURE-DECISION-TREE.md) | Backend DB `case_nodes`, `case_options` | **Implemented** |
| **12** | **Consequences (Author/Approved)** | Section 4 & Section 9 | [`docs/features/FEATURE-DECISION-TREE.md`](../features/FEATURE-DECISION-TREE.md) | Backend `case_options.consequence` field | **Implemented** |
| **13** | **Lecturer Review & Edit** | Section 2 & Section 4 | [`docs/features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md`](../features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md) | Frontend `pages/cases/CaseReviewPage.tsx` | **Implemented** |
| **14** | **Lecturer Approval & Publishing** | Section 7 & Section 10 | [`docs/features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md`](../features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md) | Backend `CaseStatus` (`APPROVED`, `PUBLISHED`) | **Implemented** |
| **15** | **Branching Case Player** | Proposal line 35, 76 | [`docs/features/FEATURE-BRANCHING-STUDY.md`](../features/FEATURE-BRANCHING-STUDY.md) | Frontend `pages/branching/BranchingCasePlayerPage.tsx` | **Implemented** |
| **16** | **Attempt & Retry Model** | Proposal line 35, 59, 76 | [`docs/features/FEATURE-BRANCHING-ATTEMPT.md`](../features/FEATURE-BRANCHING-ATTEMPT.md) | Backend `branching-attempt/` + DB `branching_attempts` | **Implemented** |
| **17** | **Reasoning per Attempt** | Proposal line 35, 59, 76 | [`docs/features/FEATURE-BRANCHING-STUDY.md`](../features/FEATURE-BRANCHING-STUDY.md) | Backend `reasoning/` + DB `student_reasoning` | **Implemented** |
| **18** | **Outcome & Student Reflection** | Proposal line 35, 60, 76 | [`docs/features/FEATURE-REFLECTION.md`](../features/FEATURE-REFLECTION.md) | Frontend `pages/branching/ReflectionPage.tsx` | **Implemented** |
| **19** | **Review Study Mode** | Proposal line 37, 61, 77 | [`docs/features/FEATURE-REVIEW-STUDY.md`](../features/FEATURE-REVIEW-STUDY.md) | Backend `review-study/`, Frontend `pages/review-study/ReviewStudyPage.tsx` | **Implemented (core)** *(MVP scope confirmed PO `2026-11-25`; `D4-13` `OPEN PO DECISION`)* |
| **20** | **Review Submissions (1 per case)** | Proposal line 37, 77 | [`docs/features/FEATURE-REVIEW-STUDY.md`](../features/FEATURE-REVIEW-STUDY.md) | Backend DB `review_study_submissions` (`UNIQUE`) | **Implemented** |
| **21** | **Lecturer Review & Feedback** | Proposal line 37, 61, 77 | [`docs/features/FEATURE-LECTURER-FEEDBACK.md`](../features/FEATURE-LECTURER-FEEDBACK.md) | Backend `lecturer-feedback/`, `pages/feedback/` | **Implemented (core)** *(MVP scope confirmed PO `2026-11-25`; route convention, `D-04` & `OPD-010` `OPEN PO DECISION`)* |
| **22** | **Reflection on Review Feedback** | Proposal line 37, 61, 77 | [`docs/features/FEATURE-REFLECTION.md`](../features/FEATURE-REFLECTION.md) | Frontend `pages/feedback/ReviewFeedbackPage.tsx` | **Implemented** |
| **23** | **AI Reasoning/Challenge Support** | Proposal line 40, 63, 78 | [`docs/features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`](../features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md) | AI Service `challenge_support/`, Backend `challenge-support/`, `pages/challenge/` | **Implemented** |
| **24** | **1–2 Challenge Rounds Max** | Proposal line 40, 63, 78 | [`docs/features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`](../features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md) | Backend DB check constraint + AI Service schema | **Implemented** |
| **25** | **No AI Grading / No Pass-Fail** | Proposal line 40, 63, 78 | [`docs/features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`](../features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md) | System Invariant INV-10 | **Implemented** |
| **26** | **Basic Learning-Flow Statistics** | Proposal line 65, 87 | [`docs/features/FEATURE-BASIC-STATISTICS.md`](../features/FEATURE-BASIC-STATISTICS.md) | Backend `statistics/`, Frontend `pages/statistics/StatisticsPage.tsx` | **Implemented (core)** *(MVP scope confirmed PO `2026-11-25`; anonymized CSV `OPD-011` / `BE-033` in PR #80)* |
| **27** | **Notification Extension Point** | Section 4 (p. 7) | [`docs/features/FEATURE-NOTIFICATIONS.md`](../features/FEATURE-NOTIFICATIONS.md) | Backend `notification/` placeholder | **Structurally Scaffolded** *(Phase 2)* |
| **28** | **Quantitative Evaluation (Case Quality)**| Section 4 & Section 6 | [`docs/features/FEATURE-EVALUATION-AND-RESEARCH.md`](../features/FEATURE-EVALUATION-AND-RESEARCH.md) | AI/Backend `evaluation/` + Frontend `pages/rubric/CaseRubricPage.tsx` | **Partial** *(`BE-033` pending in PR #80)* |
| **29** | **Research Data Collection** | Section 6 & Section 10 | [`docs/features/FEATURE-EVALUATION-AND-RESEARCH.md`](../features/FEATURE-EVALUATION-AND-RESEARCH.md) | Offline / Export boundary | **Partial** *(`BE-033` pending in PR #80)* |
| **30** | **Research Dataset / Evaluation** | Section 6 & Section 10 | [`docs/features/FEATURE-EVALUATION-AND-RESEARCH.md`](../features/FEATURE-EVALUATION-AND-RESEARCH.md) | Offline / Research report boundary | **Partial** *(`BE-033` pending in PR #80)* |

---

## 2. Summary of Implementation Status

- **`Implemented`**: 26 core Proposal items active on `develop` (post-baseline MVP PO additions — Admin Portal `OPD-015`, Lecturer Dashboard `D-05`, Case-Quality Rubric `OPD-011`, Google/MS OAuth `PSD-09`, Forgot/Reset Password MVP UI — are tracked in [`PRODUCT_OWNER_SCOPE_DECISIONS.md`](../mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md) and [`docs/PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md)).
- **`Partial`**: 3 evaluation/research items (`OPD-011 → A`: rubric UI on `develop`; `BE-033` persistence/export pending in PR #80; external trial survey/stats offline).
- **`Structurally Scaffolded`**: 1 item (Notifications extension boundary, Phase 2; `PSD-03` open).
