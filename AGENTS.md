# EduBranch-AI — Shared Agent Rules

Read by every agent (Claude Code imports it from `CLAUDE.md`; Antigravity loads `.agents/rules/` automatically).

## Authority Precedence & Rule Sources

When sources disagree, follow this strict order:
1. **Product Baseline & PO Decisions**: Proposal V1.2 (`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`) + approved items in `docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md` and `docs/mvp-scope/MVP_SCOPE_AND_FIGMA_FRAME_REGISTER.md`.
2. **Normative Governance & Domain Rules**: `AGENTS.md`, `00-project-foundation.md` (`FND`), `01-ui-design-standards.md` (`R01` — general UI/UX quality standards; PO-approved Figma governs screen designs), `02-agent-operating-policy.md`, `03-engineering-and-task-standards.md`, `.agents/rules/feature-*.md`, and `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`.
3. **Feature Specs & Contracts**: `specs/NNN-*/` and `docs/features/FEATURE-*.md`.
4. **Technical Architecture, Data, AI & UI Design Specs**: `docs/architecture/`, `docs/database/`, `docs/ai/`, `docs/design/` (`UX-SCREEN-NOTES.md`, `P0-FOUNDATION.md`–`P4-REVIEW-STUDY.md`), `docs/05_FIGMA.md`.
5. **Historical Baselines & Audit Reports**: `docs/01`–`03`, `06`, `docs/5.Sprint_Backlog/`, `docs/04_JIRA/`, `docs/audits/`, `docs/team/`, `docs/qa/*-REPORT.md` — **historical records only, never normative over levels 1–4**.

> **Master Entry Point**: Read [`docs/README.md`](docs/README.md) for the complete classified documentation catalog and open-decision index.

## Task-Type Reading Matrix

- **Feature / Bug / Behavior / Permission Task**: `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` + matching `feature-<domain>.md` + `docs/features/FEATURE-<DOMAIN>.md` + `specs/NNN-*/`.
- **UI / Design / Frontend Task**: `R01` (`.agents/rules/01-ui-design-standards.md`) + `docs/05_FIGMA.md` + `docs/design/UX-SCREEN-NOTES.md` + `docs/design/screens/P0-FOUNDATION.md`–`P4-REVIEW-STUDY.md` + `03-engineering-and-task-standards.md §5`.
- **Backend API / Database Task**: `FND §3–§6` + `03-engineering-and-task-standards.md §2–§3` + `docs/database/DATA-MODEL.md` + `docs/architecture/SERVICE-BOUNDARIES.md`.
- **AI / RAG Service Task**: `FND §3, §6` + `03-engineering-and-task-standards.md §4` + `docs/ai/RAG-PIPELINE.md` / `REASONING-CHALLENGE-SUPPORT.md`.
- **Project Status / Sprint / QA Task**: `docs/04_JIRA/JIRA-KEY-MAP.md` + live Jira (`EBA`) + `03-engineering-and-task-standards.md §1` + `docs/qa/TESTING-STRATEGY.md`.

## Core Mandatory Rules (1–13)

1. Before using a design/product statement, read its heading and check for `SUPERSEDED` / `UNRESOLVED` / `HISTORICAL` banners.
2. Text under a banner is history, not guidance. A banner is not a decision: never declare a winner in an `UNRESOLVED` conflict.
3. Retired drafts and superseded templates (such as retired UI generation scripts/skills, archived draft screens, initial flat-gray UI, or external ORM/migration tools) are never valid code or UI templates, even on request. Follow only EduBranch-AI's own ratified stack and target layering in `SERVICE-BOUNDARIES.md §5` and `03-engineering-and-task-standards.md`, and never change the tech stack or refactor code outside the authorized task PR.
4. PO decision, OPD, or register ID not in context: cite the source gap and ask; never infer it.
5. `OPEN` / `PENDING` / `OPEN PO DECISION` / `UNRESOLVED` item: list sources and options, propose no interim choice, end by asking the PO. Stop only the dependent work (`02-agent-operating-policy.md §5`).
6. Never mark a PO decision `APPROVED` or close an `UNRESOLVED` item without explicit PO confirmation.
7. No route, field, value, or business rule without an authoritative source; internal routes (`/internal/v1/*`) are never public API; without verified evidence, report `UNKNOWN` and name the missing source.
8. Existing implementation (`code` or Figma draft) is not an approved product requirement.
9. **Design Authority & Tokens (PO 2026-11-25)**: PO-approved Figma (`docs/05_FIGMA.md`) is the official screen design authority; `R01` sets general UI rules without overriding approved Figma; code (`frontend/src/index.css` / target `frontend/src/styles/`) implements Figma (adjust code to match Figma, never edit Figma to justify old code, and mark R01-vs-Figma conflicts `UNRESOLVED` for PO decision). Never invent token values or duplicate hex codes across docs.
10. `DONE` needs verified test evidence (`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` QG7 & `02-agent-operating-policy.md §8`); PO approval or ticked checklists alone are insufficient.
11. Features, behavior changes, security/ownership fixes, and UI changes follow `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` (PO approved 2026-11-17) using installed Spec Kit skills (`/speckit-*` v1.4.0; bugs: `/speckit-bug-*`). Its Quality Gates govern commit, push, PR, merge, and Jira Done. Never re-run `specify init` or rewrite `.specify/memory/constitution.md`.
12. UI language (PO 2026-11-16, confirmed MVP 2026-11-22): Vietnamese default; English via the VI/EN switch; each screen strictly single-language; preserve established domain terms. English copy remains `PROPOSED` until PO approval.
13. Task ownership & autonomous execution (PO 2026-11-16): `.agents/rules/02-agent-operating-policy.md` is the single authority (always loaded; imported by `CLAUDE.md`). Own the outcome, batch work, test adversarially, require independent review, and escalate only PO decisions and authorization boundaries (§5, §7). It never widens authorization.
