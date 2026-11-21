# EduBranch AI — Project Overview

**Full Name**: EduBranch AI — AI Platform for Experiential Case-Based Learning in University Teaching
**Version**: development (`develop`); live task status in Jira EBA and `docs/04_JIRA/JIRA-KEY-MAP.md`
**Repository**: https://github.com/HoangNam2464/EduBranch-AI

---

## Problem Statement

University lecturers need engaging, pedagogically rich case studies that challenge students to make decisions under real-world uncertainty. Creating these manually is time-consuming and hard to scale. EduBranch AI automates case generation from existing teaching materials while keeping the lecturer in full control of what students receive and experience.

Students learn not by passively reading outcomes, but by making decisions, completing the full journey, then reviewing *how* each of their choices shaped the result — connecting personal experience to course material.

---

## Core Value Proposition

1. **AI generates case studies from the lecturer's own materials** — not generic content. Both Branching Study (interactive decision journeys) and Review Study (open analysis) cases are grounded in the actual syllabus, teaching materials, and course data uploaded by the lecturer.
2. **Lecturer reviews and controls publication** — mandatory human-in-the-loop (DRAFT → REVIEWED → APPROVED → PUBLISHED). No case reaches students without explicit lecturer approval.
3. **Supports dual learning modes**:
   - **Branching Study**: students experience a situational journey through consecutive decisions (no interruptions mid-flow), then enter a structured REVIEW phase to look back at every choice, understand its effect on the outcome, write retrospective reasoning, reflect, and optionally retry with a new attempt.
   - **Review Study**: students analyze case context and data, propose a solution with reasoning, receive qualitative lecturer feedback, and complete a reflection. No decision tree required.
4. **AI Reasoning / Challenge Support probes reasoning** — Socratic counter-questions (1–2 rounds, NO grading, NO scoring, NO pass/fail).
5. **Lecturer feedback & statistics** — qualitative commentary on student attempts/submissions, plus branch selection frequency and completion statistics for classroom discussion.

---

## Primary Actors

| Actor | Role |
|---|---|
| **Lecturer** | Creates courses; uploads teaching materials; triggers AI case generation; inspects, edits, approves, and publishes cases; shares case link with students; reviews student attempts/submissions; writes qualitative feedback; uses statistics for class discussion. |
| **Student** | Joins a class by invite code and opens published cases from the student desk or "My courses"; a direct link from the lecturer also works. In Branching Study: navigates the experience, makes consecutive decisions, completes the journey, reviews the full path retrospectively, writes reasoning and reflection, and may retry. In Review Study: analyzes context, proposes solution, receives feedback, reflects. |
| **Admin** | System administrator (Proposal V1.2 Context Diagram): manages user accounts and roles, manages courses, monitors API and system health logs. |

> **Students do not create cases.** Students only ever open `PUBLISHED` cases (INV-01); the student desk and My courses list only classes they joined. Update 2026-11-12 (PO decision OPD-001 → A): students join a class with an invite code and browse their courses and assigned cases on the student desk; the direct case link from the lecturer remains available.

---

## Core Workflow

### Lecturer → Case → Student Flow
```
1. Lecturer creates Course and uploads Teaching Materials (PDF / DOCX)
2. Materials processed: parsed → chunked → embedded → pgvector
3. Lecturer triggers AI Case Generation (Branching Study or Review Study)
4. RAG retrieves relevant material → LLM generates structured case draft
5. Lecturer inspects, edits nodes/options/consequences/questions, approves, and publishes
6. Lecturer sends the published case link to students (e.g. via LMS, email, or in-class)
7. Students open the link and begin the learning experience
```

### Branching Study Flow (Student)

**Phase 1 — Experience (No interruptions mid-flow)**
```
Initial Situation + Context / Data presented
            ↓
Decision Point → Student selects an option
            ↓
Next Situation (seamless — no consequence card, no reasoning form between nodes)
            ↓
Decision Point → Student selects next option
            ↓
... (variable number of decision points depending on case structure)
            ↓
Terminal Node → Journey complete
```

**Phase 2 — REVIEW (Retrospective — after journey is complete)**
```
Full journey replay shown to student:
  • Every decision point traversed, in order
  • The option chosen at each point
  • The path taken and what the alternatives were
  • How each choice contributed to the outcome
  • Which decisions were pivotal to the final result
            ↓
Student writes reasoning for key decisions (retrospective, not per-click)
Student can see: "Why this choice? What would have changed if I chose differently?"
```

**Phase 3 — Reflection & Retry**
```
Student submits overall Reflection
            ↓
[Optional: AI Reasoning / Challenge Support — max 2 rounds, counter-questions only, no grading]
            ↓
[Optional: Retry → New Attempt → Student explores a different path from scratch]
```

### Review Study Flow (Student)
```
1. Student opens case: reads context_text (situation + background data)
2. Student reads problem_text (the open question/problem to analyze)
3. Student writes analysis and proposes a solution with reasoning (student_analysis, proposed_solution, reasoning_text)
4. [Optional] AI Reasoning / Challenge Support: counter-questions to probe student's reasoning (max 2 rounds)
5. Student submits work → Status: SUBMITTED
6. Lecturer reviews submission, writes qualitative feedback → Status: REVIEWED
7. Student reads feedback, writes reflection → Status: REFLECTED
```

---

## Architecture Summary

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 19 + Vite + TypeScript + TailwindCSS v4 + ReactFlow | Lecturer and Student UI |
| Backend Gateway | Node.js (NestJS 10 + TypeScript) | API Gateway, business state, persistence |
| AI Service | FastAPI (Python 3.12) + Pydantic v2 | Document parsing, RAG, case generation, challenge support (Internal) |
| Vector DB | PostgreSQL 16 + pgvector | Embeddings + relational business data |
| Cache & Session | Redis 7 | Caching, session store |
| Object Storage | MinIO | PDF/DOCX teaching material storage |
| LLM | Gemini 3.5 Flash (`gemini-3.5-flash`; embeddings `gemini-embedding-001` 768-dim) / OpenAI GPT-4o-mini | Provider abstraction for text & embeddings |

---

## Documentation Index

| Category | Document | Description |
|---|---|---|
| **Audit & Requirements** | [Architectural Governance](architecture/ARCHITECTURAL-GOVERNANCE.md) | Architectural governance & system boundaries |
| | [Requirement Traceability](requirements/REQUIREMENT-TRACEABILITY.md) | 30 Proposal items mapped to documentation |
| **Architecture** | [Technology Stack ADR](architecture/ADR-001-TECHNOLOGY-STACK.md) | Technology choices & candidate options |
| | [System Architecture](architecture/SYSTEM-ARCHITECTURE.md) | Multi-tier overview & design principles |
| | [Service Boundaries](architecture/SERVICE-BOUNDARIES.md) | Inter-service contracts, protocols & security |
| | [System Data Flows](architecture/DATA-FLOW.md) | End-to-end sequence diagrams & lifecycle |
| | [Decision Tree Model](architecture/DECISION-TREE-MODEL.md) | Invariants & JSON schema for branching cases |
| | [Architecture Audits & Reports](architecture/audits/README.md) | Historical audits, baseline validations & migration reports |
| **Features** | [Feature Specifications](features/) | Comprehensive per-feature specifications |
| **UI / UX Design System** | [Global Design System](design/GLOBAL-DESIGN-SYSTEM.md) | Canonical light-first color tokens, vector SVG icons, typography & components |
| | [Site Architecture](design/SITE-ARCHITECTURE.md) | 14-route sitemap, role boundaries & 6 product workflows |
| | [Screen Specifications (P0–P4)](design/screens/) | Detailed per-screen layout, state & component specs |
| | [Stitch Generation Guidelines](design/STITCH-GENERATION-GUIDELINES.md) | RETIRED — history only, never a template (AGENTS.md rule 3) |
| | [Design Direction](design/DESIGN-DIRECTION.md) | Proposed visual/UX evolution within the fixed identity (PROPOSED) |
| **Task Catalogs** | [Master Task Backlog](01_MASTER-TASKS.md) | 84-task baseline (`01_MASTER-TASKS.md`–`06_QA.md`); Jira holds 105 issues — see [Jira Key Map](04_JIRA/JIRA-KEY-MAP.md) |
| **Team** | [Team Capability Matrix](team/TEAM-CAPABILITY-MATRIX.md) | Members, assignments, role playbooks |
| **Data & AI** | [Data Model](database/DATA-MODEL.md) | PostgreSQL schema & SQL migration guide |
| | [RAG Pipeline](ai/RAG-PIPELINE.md) | Document parsing, chunking, retrieval & sources |
| | [Reasoning & Challenge Support](ai/REASONING-CHALLENGE-SUPPORT.md) | Counter-question rules, 2-round cap, non-grading mandate |
| **Research & QA** | [Testing Strategy](qa/TESTING-STRATEGY.md) | Test profiles, test boundaries & CI checks |
| | [Evaluation Design](research/EVALUATION-DESIGN.md) | Research questions, rubrics & dataset export |

---

## Feature Status (as of 2026-11-21)

> The previous table ("Implemented: strictly ZERO in this snapshot", 2026-10) is SUPERSEDED: it described the scaffold, not the current code. Status words: **Implemented** = code on `develop` with automated tests; **Partial** = some flows or screens missing; **Not started**. Implemented never means PO-accepted or Done in Jira (AGENTS.md rule 10). Evidence: `develop` `6f903f2` — backend build 0, unit 300/300, e2e 148 pass/33 skipped; AI service 153 pass/1 fail/11 skipped; frontend lint 0, unit 169/169, build 0.

| Feature Area | Status | Evidence / gap |
|---|---|---|
| Authentication & Roles | Implemented (email/password, JWT, RBAC, rate limit) | Google/Microsoft sign-in (BE-034) not started; password reset UI exists without API |
| Course Context & Enrollment | Implemented | Soft archive (OPD-014), invite code + student desk (BE-029, V5) |
| Teaching Materials & Upload | Implemented | MinIO storage, PDF/DOCX validation |
| Document Processing & RAG | Implemented | parse → chunk → embed (768) → pgvector; `<sources>` boundary |
| AI Case Generation | Implemented | DAG validation, grounded prompting; one stale boundary test (QA-006 AC3) |
| Decision Tree / Case Editor | Implemented | node save with topology checks (BE-017), editor (FE-009/010) |
| Lecturer Review & Publishing | Implemented | lifecycle state machine, published-only student gate |
| Branching Case Player & Attempts | Implemented | play → review → reflect → retry; reasoning access fix pending (PR #77) |
| Review Study | Implemented (BE) / Partial (FE) | BE-025 Done; student feedback view in open PR #69 |
| AI Challenge Support | Implemented | 2-round cap in gateway and AI service (BE-027, FE-021) |
| Lecturer Feedback & Statistics | Implemented (BE) / Partial (FE) | BE-026/028 Done; FE-019/FE-022 in open PRs #68/#70 |
| Lecturer Dashboard | Partial | FE-027 open PR #73; aggregation API BE-030 not started |
| Profile | Partial | view implemented; update API BE-031 not started |
| Admin Portal | Partial | shell/dashboard UI (shows placeholder data — defect), admin APIs BE-032 not started, screens in PR #75 |
| Evaluation & Rubric | Partial | rubric UI in PR #74; storage/export BE-033 not started |
| Notifications | Documented (Phase 2) | automated reminders are Phase 2 |
