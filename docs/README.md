# EduBranch-AI — Documentation Hub & Governance Catalog

> - **Document Class**: `[DOCUMENTATION HUB]` (Master Documentation Index & Governance Router)

> - **Single Entry Point** for all project rules, product scope, architecture, design specs, feature specifications, operations guides, and historical baselines.
> - **Quick Navigation**: Read [`AGENTS.md`](../AGENTS.md) first for mandatory rules and precedence, then use this catalog to locate the single canonical source (SSOT) for your task.

---

## 1. Authority & Classification Standard

Every document under this repository belongs to one of six strictly separated authority classes:

| Class Tag | Meaning | Normative? | Edit Policy |
|---|---|:---:|---|
| **`[NORMATIVE RULE]`** | Mandatory governance rules for coding agents, domain invariants, Git workflow, and UI standards | **Yes** | Requires PO approval (`AGENTS.md`, `.agents/rules/`, `FEATURE-DELIVERY-WORKFLOW.md`) |
| **`[PO SCOPE / DECISION]`** | Product requirements baseline & PO-confirmed or open scope decisions | **Yes** (confirmed items) | Never close `OPEN` / `UNRESOLVED` items without explicit PO decision |
| **`[LIVING ARCHITECTURE / OPS SPEC]`** | Canonical architecture, DB schema, AI pipeline, testing & UX specs synced with `develop` | **Reference SSOT** | Update alongside approved architectural/schema/design changes |
| **`[LIVING FEATURE SPEC]`** | Canonical per-feature domain specifications & active Spec Kit feature directories (`specs/`) | **Feature SSOT** | Distinguish **Approved MVP Scope** vs **Current `develop` Implementation** |
| **`[IMMUTABLE BASELINE]`** | Original project planning baseline (84 tasks / 336 SP, Proposal V1.2) | **Baseline Only** | Never rewrite history; annotate superseded conventions rather than deleting |
| **`[HISTORICAL SNAPSHOT]`** | Point-in-time audits, QA test reports, contribution snapshots & early gap analyses | **Historical Evidence Only** | Preserve point-in-time facts verbatim; never treat snapshots as live Jira/code status |

### Precedence Order on Conflict
1. Proposal V1.2 (`C1SE_65-EduBranch-AI-Proposal_V1.2.docx`) + Confirmed PO Decisions (`docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md`)
2. Normative Rules (`AGENTS.md`, `00-project-foundation.md`, `01-ui-design-standards.md`, `02-agent-operating-policy.md`, `03-engineering-and-task-standards.md`, `.agents/rules/feature-*.md`, `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`)
3. Active Feature Specs & Contracts (`specs/NNN-*/`, `docs/features/FEATURE-*.md`)
4. Living Architecture, Data, AI & UI Design Specs (`docs/architecture/`, `docs/database/`, `docs/ai/`, `docs/design/`, `docs/05_FIGMA.md`)
5. Immutable Baselines & Historical Snapshots (never override levels 1–4)

---

## 2. Task-to-Documentation Routing Table

| If Your Task Involves… | Read These Canonical Sources (SSOT) |
|---|---|
| **Any feature, bug, or permission change** | [`FEATURE-DELIVERY-WORKFLOW.md`](workflows/FEATURE-DELIVERY-WORKFLOW.md) + matching [`.agents/rules/feature-*.md`](../.agents/rules/) + matching [`docs/features/FEATURE-*.md`](features/) + active [`specs/`](../specs/) |
| **Frontend UI, tokens, layout, VI/EN copy** | [`01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) (`R01`) + [`05_FIGMA.md`](05_FIGMA.md) + [`UX-SCREEN-NOTES.md`](design/UX-SCREEN-NOTES.md) + [`P0`–`P4`](design/screens/) + [`03-engineering-and-task-standards.md §5`](../.agents/rules/03-engineering-and-task-standards.md) |
| **Backend REST API or SQL query** | [`03-engineering-and-task-standards.md §2`](../.agents/rules/03-engineering-and-task-standards.md) + [`SERVICE-BOUNDARIES.md`](architecture/SERVICE-BOUNDARIES.md) + [`DATA-MODEL.md`](database/DATA-MODEL.md) + [`DATA-FLOW.md`](architecture/DATA-FLOW.md) |
| **Database migrations & baseline ops** | [`03-engineering-and-task-standards.md §3`](../.agents/rules/03-engineering-and-task-standards.md) + [`DATA-MODEL.md`](database/DATA-MODEL.md) + [`OPERATIONAL-BASELINE-GUIDE.md`](database/OPERATIONAL-BASELINE-GUIDE.md) |
| **AI service / RAG / LLM prompting** | [`03-engineering-and-task-standards.md §4`](../.agents/rules/03-engineering-and-task-standards.md) + [`RAG-PIPELINE.md`](ai/RAG-PIPELINE.md) + [`REASONING-CHALLENGE-SUPPORT.md`](ai/REASONING-CHALLENGE-SUPPORT.md) |
| **Decision tree schema & graph checks** | [`DECISION-TREE-MODEL.md`](architecture/DECISION-TREE-MODEL.md) + [`FEATURE-DECISION-TREE.md`](features/FEATURE-DECISION-TREE.md) |
| **Sprint tasks, Jira IDs & QA verification** | Live Jira (`EBA`) + [`JIRA-KEY-MAP.md`](04_JIRA/JIRA-KEY-MAP.md) + [`TESTING-STRATEGY.md`](qa/TESTING-STRATEGY.md) + [`03-engineering-and-task-standards.md §1`](../.agents/rules/03-engineering-and-task-standards.md) |
| **Product scope & open PO questions** | [`PRODUCT_OWNER_SCOPE_DECISIONS.md`](mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md) + [`MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`](mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md) |

---

## 3. Master Documentation Catalog

### 3.1 Governance & Delivery Process `[NORMATIVE RULE]`
- [`AGENTS.md`](../AGENTS.md) — Shared rules 1–13, precedence & router (all agents)
- [`CLAUDE.md`](../CLAUDE.md) — Claude Code workspace instructions & command reference
- [`.agents/rules/00-project-foundation.md`](../.agents/rules/00-project-foundation.md) (`FND`) — Project identity, canonical terminology, architecture boundaries, case lifecycle, DAG invariants, Git rules
- [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) (`R01`) — General UI/UX design rules & quality standards (`Light` theme `#2A4E7F`/`#00A5F5`, `Plus Jakarta Sans` + `Inter`, target modular SPA architecture, layout, components, VI/EN; does not override PO-approved Figma per-screen design)
- [`.agents/rules/02-agent-operating-policy.md`](../.agents/rules/02-agent-operating-policy.md) — Autonomous execution, PO boundary & open-decision rule
- [`.agents/rules/03-engineering-and-task-standards.md`](../.agents/rules/03-engineering-and-task-standards.md) — Shared backend/DB/AI/FE code-sync standards, canonical naming & module organization (`§8`), and Jira ID disambiguation
- [`.agents/rules/feature-*.md`](../.agents/rules/) — 15 domain-specific rule files
- [`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`](workflows/FEATURE-DELIVERY-WORKFLOW.md) — Approved Spec Kit v1.4.0 delivery workflow (`QG1`–`QG7`)
- [`.specify/memory/constitution.md`](../.specify/memory/constitution.md) — Spec Kit constitution pointer

### 3.2 Product Authority, Overview & Open PO Decisions `[PO SCOPE / DECISION]`
- [`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`](C1SE_65-EduBranch-AI-Proposal_V1.2.docx) — Proposal V1.2 (Immutable Product Baseline)
- [`docs/PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) — Executive summary, core value proposition, live `develop` implementation matrix
- [`docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md`](mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md) — **Canonical PO Decision & Open-Question Ledger** (separates Decided vs `OPEN PO DECISION`)
- [`docs/mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`](mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md) — Frame-level MVP / HOLD / Phase 2 classification register
- [`docs/requirements/REQUIREMENT-TRACEABILITY.md`](requirements/REQUIREMENT-TRACEABILITY.md) — 30 Proposal requirements mapped to specs & implementation status

### 3.3 Architecture, Database & AI Technical Specs `[LIVING ARCHITECTURE / OPS SPEC]`
- [`docs/architecture/SYSTEM-ARCHITECTURE.md`](architecture/SYSTEM-ARCHITECTURE.md) — **Diagram SSOT**: 3-tier topology Mermaid architecture
- [`docs/architecture/SERVICE-BOUNDARIES.md`](architecture/SERVICE-BOUNDARIES.md) — **Governance & Contracts SSOT**: responsibility matrix, HTTP/payload & AI isolation contracts
- [`docs/architecture/DATA-FLOW.md`](architecture/DATA-FLOW.md) — Canonical end-to-end Mermaid sequence diagrams (Flows 1–7)
- [`docs/architecture/DECISION-TREE-MODEL.md`](architecture/DECISION-TREE-MODEL.md) — **Tree Model SSOT**: `Case`/`CaseNode`/`CaseOption` schema, structural invariants & AI JSON format
- [`docs/architecture/ADR-001-TECHNOLOGY-STACK.md`](architecture/ADR-001-TECHNOLOGY-STACK.md) — Ratified technology stack selections & Gemini model pins
- [`docs/architecture/ADR-002-FRAMER-MOTION.md`](architecture/ADR-002-FRAMER-MOTION.md) — Approved Framer Motion dependency & reduced-motion constraints
- [`docs/database/DATA-MODEL.md`](database/DATA-MODEL.md) — **DB Schema SSOT**: tables, constraints, ER diagram & `V1`–`V8` migrations
- [`docs/database/OPERATIONAL-BASELINE-GUIDE.md`](database/OPERATIONAL-BASELINE-GUIDE.md) — Legacy Postgres baseline & transactional DDL rules
- [`docs/ai/RAG-PIPELINE.md`](ai/RAG-PIPELINE.md) — **RAG SSOT**: PDF/DOCX ingestion, `vector(768)` retrieval & `<sources>` safety pipeline
- [`docs/ai/REASONING-CHALLENGE-SUPPORT.md`](ai/REASONING-CHALLENGE-SUPPORT.md) — **Challenge Support SSOT**: 2-round Socratic cap & zero-grading enforcement

### 3.4 UI/UX Design & Localization Specs `[LIVING FEATURE / DESIGN SPEC]`
- [`docs/05_FIGMA.md`](05_FIGMA.md) — Figma file `6CtSgJPKo4jCIbB7WwCaWw` canonical page & DES task mapping
- [`docs/design/SITE-ARCHITECTURE.md`](design/SITE-ARCHITECTURE.md) — Application sitemap (Public, Lecturer, Student, Admin) & workflows
- [`docs/design/UX-SCREEN-NOTES.md`](design/UX-SCREEN-NOTES.md) — Frame-by-frame UX interactions, Figma Dev-Mode annotations & UI open decisions
- [`docs/design/DESIGN-DIRECTION.md`](design/DESIGN-DIRECTION.md) — Approved "Preserve & Elevate" UI upgrade plan (Steps 1–7)
- [`docs/design/screens/P0-FOUNDATION.md`](design/screens/P0-FOUNDATION.md) — Landing `/`, `AppShell`, Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`), shared primitives
- [`docs/design/screens/P1-LECTURER-CORE.md`](design/screens/P1-LECTURER-CORE.md) — Courses, Materials, Cases List & Case Review editor
- [`docs/design/screens/P2-STUDENT-CORE.md`](design/screens/P2-STUDENT-CORE.md) — Branching Case Player, Journey Review, Reflection & Challenge Support
- [`docs/design/screens/P3-SUPPORT-AND-STATISTICS.md`](design/screens/P3-SUPPORT-AND-STATISTICS.md) — Statistics & Lecturer Feedback *(MVP scope per PO `2026-11-25`; route convention, `D-04` & `OPD-010` `OPEN PO DECISION`)*
- [`docs/design/screens/P4-REVIEW-STUDY.md`](design/screens/P4-REVIEW-STUDY.md) — Review Study workspace & student feedback/reflection view *(MVP scope per PO `2026-11-25`; `D4-13` `OPEN PO DECISION`)*
- [`docs/l10n/shared-copy-review.md`](l10n/shared-copy-review.md) — Shared EN/VI copy approval registry (checked by `scripts/l10n-approval-check.mjs`)

### 3.5 Canonical Feature Specifications (`docs/features/` & `specs/`) `[LIVING FEATURE SPEC]`
- [`FEATURE-AUTH-AND-ROLES.md`](features/FEATURE-AUTH-AND-ROLES.md) · [`FEATURE-COURSE-AND-MATERIALS.md`](features/FEATURE-COURSE-AND-MATERIALS.md) · [`FEATURE-DOCUMENT-PROCESSING-AND-RAG.md`](features/FEATURE-DOCUMENT-PROCESSING-AND-RAG.md)
- [`FEATURE-CASE-GENERATION.md`](features/FEATURE-CASE-GENERATION.md) · [`FEATURE-DECISION-TREE.md`](features/FEATURE-DECISION-TREE.md) · [`FEATURE-CASE-REVIEW-AND-PUBLISHING.md`](features/FEATURE-CASE-REVIEW-AND-PUBLISHING.md)
- [`FEATURE-BRANCHING-STUDY.md`](features/FEATURE-BRANCHING-STUDY.md) · [`FEATURE-BRANCHING-ATTEMPT.md`](features/FEATURE-BRANCHING-ATTEMPT.md) · [`FEATURE-REVIEW-STUDY.md`](features/FEATURE-REVIEW-STUDY.md)
- [`FEATURE-REFLECTION.md`](features/FEATURE-REFLECTION.md) · [`FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`](features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md) · [`FEATURE-LECTURER-FEEDBACK.md`](features/FEATURE-LECTURER-FEEDBACK.md)
- [`FEATURE-BASIC-STATISTICS.md`](features/FEATURE-BASIC-STATISTICS.md) · [`FEATURE-EVALUATION-AND-RESEARCH.md`](features/FEATURE-EVALUATION-AND-RESEARCH.md) · [`FEATURE-NOTIFICATIONS.md`](features/FEATURE-NOTIFICATIONS.md)
- Active Spec Kit feature records: [`specs/001-fe026-courses-materials/`](../specs/001-fe026-courses-materials/), [`specs/002-feedback-stats-api/`](../specs/002-feedback-stats-api/), [`specs/003-reasoning-access/`](../specs/003-reasoning-access/), [`specs/006`](../specs/006-app-fluid-layout/), [`specs/007`](../specs/007-mvp-completion-backend/), [`specs/008`](../specs/008-ui-foundations/), [`specs/009`](../specs/009-public-landing-fixes/), [`specs/010`](../specs/010-ds-components/), [`specs/011`](../specs/011-case-access-hardening/), [`specs/012`](../specs/012-case-rubric-ui/), [`specs/013`](../specs/013-attempt-publish-lock/).

### 3.6 Testing, Research & Service Guides `[SUPPORTING GUIDE]`
- [`docs/qa/TESTING-STRATEGY.md`](qa/TESTING-STRATEGY.md) — Living multi-tier verification & CI strategy
- [`docs/research/EVALUATION-DESIGN.md`](research/EVALUATION-DESIGN.md) — Classroom trial & comparative research methodology (subordinate to `FEATURE-EVALUATION-AND-RESEARCH.md`)
- Service guides: [`backend/README.md`](../backend/README.md) · [`ai-service/README.md`](../ai-service/README.md) · [`frontend/README.md`](../frontend/README.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md) · [`SECURITY.md`](../SECURITY.md)

### 3.7 Immutable Baselines & Historical Snapshots `[IMMUTABLE BASELINE]` / `[HISTORICAL SNAPSHOT]`
> **Important**: Preserve these files untouched in substance for audit traceability. Always verify live task/test status against current Jira (`EBA`) and CI rather than snapshot tables below. Local untracked workspace files (`.agent-handoff/`, `scratch/`, `*.zip`, ad-hoc `scripts/*.py`) are ignored non-canonical scratch/reference artifacts and must never be force-committed into Git.

- **Initial 84-Task Baseline**: [`docs/5.Sprint_Backlog/SPRINT-BACKLOG.md`](5.Sprint_Backlog/SPRINT-BACKLOG.md) *(branch naming section superseded by `FND §7.2`)* · [`01_MASTER-TASKS.md`](01_MASTER-TASKS.md) · [`02_SPRINT-TASKS.md`](02_SPRINT-TASKS.md) · [`03_TASK-DETAILS.md`](03_TASK-DETAILS.md) · [`06_QA.md`](06_QA.md)
- **Early Gap Snapshot (2026-11-01)**: [`docs/mvp-scope/FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md`](mvp-scope/FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md)
- **Jira & Audit Snapshots**: [`docs/04_JIRA/JIRA-KEY-MAP.md`](04_JIRA/JIRA-KEY-MAP.md) · [`JIRA-BACKLOG-REFERENCE.md`](04_JIRA/JIRA-BACKLOG-REFERENCE.md) · [`docs/audits/PROJECT-AUDIT-2026-11-21.md`](audits/PROJECT-AUDIT-2026-11-21.md)
- **Team Snapshots**: [`docs/team/TEAM-CAPABILITY-MATRIX.md`](team/TEAM-CAPABILITY-MATRIX.md) · [`MEMBER-CONTRIBUTION-EVIDENCE.md`](team/MEMBER-CONTRIBUTION-EVIDENCE.md)
- **Design Audit & Inspiration Snapshots (2026-11-21)**: [`docs/design/audit/UI-AUDIT.md`](design/audit/UI-AUDIT.md) · [`docs/design/research/DESIGN-INSPIRATION.md`](design/research/DESIGN-INSPIRATION.md)
- **Point-in-Time QA Verification Reports**: [`OPS-001-VERIFICATION-REPORT.md`](qa/OPS-001-VERIFICATION-REPORT.md) · [`QA-001-TEST-MATRIX-REPORT.md`](qa/QA-001-TEST-MATRIX-REPORT.md) · [`QA-002-REGRESSION-REPORT.md`](qa/QA-002-REGRESSION-REPORT.md) · [`QA-003-UPLOAD-VALIDATION-REPORT.md`](qa/QA-003-UPLOAD-VALIDATION-REPORT.md) · [`MVP-BASELINE-QG7-REPORT.md`](qa/MVP-BASELINE-QG7-REPORT.md) (MVP baseline `develop` `cf3a6a5`, 2026-11-27)
