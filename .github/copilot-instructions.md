# EduBranch AI — AI Coding Agent Instructions

> - **Document Class**: Copilot Entry Point · **Authority**: Subordinate to `AGENTS.md`, `.agents/rules/`, and `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`.
> - **Documentation Hub**: [`docs/README.md`](../docs/README.md) · Read first before making changes.

---

## 1. Authoritative Governance & Precedence

All AI coding agents operating on EduBranch-AI MUST read and obey this core rule hierarchy (in priority order):
1. **Product Baseline**: [`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`](../docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx) and approved PO decisions in [`docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md`](../docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md).
2. **Global Rules**:
   - [`AGENTS.md`](../AGENTS.md) — Shared Rules 1–13, Authority Precedence & Reading Router
   - [`.agents/rules/00-project-foundation.md`](../.agents/rules/00-project-foundation.md) — Domain Terminology, Architecture Boundaries, Lifecycle, DAG Invariants & Git Rules
   - [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) (`R01`) — General UI/UX Rules & Quality Standards (Light-only Navy `#2A4E7F` / Sky `#00A5F5`, `Plus Jakarta Sans` + `Inter` target, VI/EN; does not override PO-approved Figma per-screen design)
   - [`.agents/rules/02-agent-operating-policy.md`](../.agents/rules/02-agent-operating-policy.md) — Task Ownership, Escalation & Evidence Policy
   - [`.agents/rules/03-engineering-and-task-standards.md`](../.agents/rules/03-engineering-and-task-standards.md) — Tier Standards (raw `pg` SQL, `V1`–`V5` migrations via built-in runner, pinned AI models, FE Target Architecture & Naming §8, Jira ID disambiguation)
   - Applicable `.agents/rules/feature-<domain>.md` + [`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`](../docs/workflows/FEATURE-DELIVERY-WORKFLOW.md)

---

## 2. Project Identity & Scope Boundaries

- **Identity**: **EduBranch-AI** — university-level experiential case-based learning platform (roles: `LECTURER`, `STUDENT`, `ADMIN`; strictly higher-education case-based learning, never pre-university/K-12 or quiz/homework tools).
- **Dual Learning Modes**:
  1. **Branching Study** (`BRANCHING_STUDY`): Experience-first uninterrupted decision path → post-journey **REVIEW** revealing consequences + retrospective reasoning → Reflection & immutable Retry (`branching_attempts`).
  2. **Review Study** (`REVIEW_STUDY`): Context/Data → Problem → Analysis (optional) → Proposed Solution & Reasoning (single submission per student/case) → Lecturer Qualitative Feedback → Reflection (`review_study_submissions`).
- **MVP Auth Scope Updates**: Email/password + JWT; Google & Microsoft OAuth (`BE-034`, `PSD-09`, public login/register only, no campus LDAP/SAML); Forgot & Reset Password UI + `rememberMe` (PO 2026-11-25, backend reset/rememberMe TTL pending).
- **Independent Design & Stack Policy**: Never introduce pre-university/K-12 assets, dark themes, unapproved palettes, external ORMs/migration CLIs, untyped `.jsx`, or non-EduBranch brand names.

---

## 3. Non-Negotiable Architecture & Safety Invariants

| Concern / Invariant | Enforced Rule |
|---|---|
| **Tier Isolation** | Frontend (`React 19`) calls **only** Backend Gateway (`/api/v1/*`). FastAPI AI Service (`/internal/v1/*`, `X-Internal-API-Key`) is strictly internal (`docs/architecture/SYSTEM-ARCHITECTURE.md`). |
| **Database Ownership** | Backend Gateway owns raw parameterized SQL (`pg` Pool) and `backend/migrations/V1..V5`. AI Service reads/writes `document_chunks` (`vector(768)`). |
| **Untrusted RAG Boundary (`BR-RAG-01`)** | Wrap all retrieved teaching chunks in `<sources>...</sources>` tags with look-alike neutralization (`app/retrieval/service.py`). |
| **Mandatory Human-in-the-Loop (`INV-01`)** | AI cases initialize in `DRAFT` (`DRAFT → REVIEWED → APPROVED → PUBLISHED`). Students only ever query `PUBLISHED` cases (enforced in SQL). |
| **Experience-First Rule (`INV-02`, `INV-03`)** | Never show consequences or reasoning prompts between consecutive Branching Study Decision Points during Phase 1 Experience. |
| **DAG Tree Integrity** | Directed acyclic graph (no cycles via 3-color DFS, all nodes reachable from `root_node_id`, 2–4 options per non-terminal node, ≥1 terminal node). |
| **AI Non-Grading & 2-Round Cap (`INV-10`)** | AI Challenge Support asks Socratic counter-questions only, hard-capped at `1–2` rounds (`CHECK current_round BETWEEN 0 AND 2`). Never grades, scores, or renders pass/fail verdicts. |
| **Git & Secret Protection** | Never commit `.env` or secrets. Branch from `develop` using `feature/<domain>` (`-backend` for backend/AI), never put task IDs in branch names (`feat(scope): summary [GROUP-ID]`). |
