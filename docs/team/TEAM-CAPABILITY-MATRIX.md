# EduBranch-AI — Team Capability Matrix

> **Status**: Reference (evidence-based snapshot) · **Read on**: 2026-11-21 (Hướng's row updated 2026-11-22 after PRs #68–#75 merged) · **Owner**: PO · **Used by**: `CLAUDE.md` §19.
> **Sources**: Jira EBA assignees (105 issues, `docs/04_JIRA/JIRA-KEY-MAP.md`), `git log` on `develop` and remote branches, GitHub PRs #1–#78, `docs/02_SPRINT-TASKS.md` role groups (DES/FE/BE/OPS/QA).
> **Rules**: assignments are facts from Jira; who wrote the code is a fact from git; everything else is labelled. Never change an assignee, reporter or attribution from this file; Jira is the source of the current assignment. This file is not a performance review.
> **GitHub evidence per member and task** (PRs, own commits on `develop`, local test runs): `docs/team/MEMBER-CONTRIBUTION-EVIDENCE.md`.

## 1. Members and evidence

| Member (Jira) | GitHub / git identity | Jira scope (count · SP) | Code that reached `develop` (git author) | Open work |
|---|---|---|---|---|
| **Nam Hoàng** | `HoangNam2464` (git: HoangNam2464 / Nguyễn Hoàng Nam) — PO, sole Code Owner (`.github/CODEOWNERS`) | DES-001…015, QA-001…016, QA-018, QA-020…023, BE-007…010, BE-012, BE-014, BE-015, BE-027, BE-033 (45 · 176 SP) | 171 commits: governance/docs, RAG pipeline, case generation, FE rebuild (FE-025), most Sprint 3–4 BE (BE-017, BE-025/026/028, BE-027, BE-029), QA suites | PRs #77 (reasoning access, BE-024), #79 (fluid app layout, FE-025), #80 (BE-030…BE-033, Claude), #81 (docs) |
| **Đức Anh Nguyễn** | `DucAnh1906` (git on PR branch: "Nguyen Duc Anh" `<EMAIL_GITHUB_CUA_BAN>` — identity not configured) | BE-001…003, BE-005, BE-013, BE-016…026, BE-028…032, BE-034, OPS-001…003 (25 · 106 SP) | No commit under this identity on `develop` [FACT]; BE-016…BE-023 commits sit on open PR #59 | PR #59 (material-backend, overlaps code already on `develop`) |
| **Baohy Nguyenduc** | `Baohy-14` (git: `nguyenducbaohy22`) | FE-001, FE-008, FE-010, FE-012…017, FE-021, FE-023, FE-025, FE-028, FE-030, FE-031 (15 · 65 SP) | FE-001 (PR #7), FE-021 (PR #64), FE-030 (PR #66), FE-031 (PR #67); PRs #33–#37, #41–#47, #56, #57 closed without merge | — |
| **Hướng Nguyễn** | `Myth28-De` (git: "Nguyen Duc Huong") | FE-002…007, FE-009, FE-011, FE-018…020, FE-022, FE-024, FE-026, FE-027, FE-029, FE-032 (17 · 65 SP) | FE-002 (PR #20), FE-018 (PR #63), FE-024 (PR #71); merged 2026-11-22: FE-019 (#68), FE-020 (#69), FE-022 (#70), FE-026 (#72), FE-027 (#73), FE-032 (#75) — in Jira review, not Done | PR #74 FE-029 |
| **Ngoc Duc** | UNKNOWN (no GitHub/git identity matched) | QA-017 UAT, QA-019 release readiness, QA-024 test-case docs & user guide (3 · 11 SP) | none found | — |

Also seen: git identity `THT154` (`thangth.23ns@…`) authored one merged commit (`f6436a8`, material CRUD ownership gates, BE-005 scope). Which member it belongs to is UNKNOWN; do not attribute it without the PO.

**INFERENCE (needs PO confirmation)**: the five delivery roles are Product/Design + QA lead (Nam), Backend (Đức Anh), Frontend A — app shell, student flows, admin (Baohy), Frontend B — public/auth, lecturer screens, feedback/statistics (Hướng), QA/Docs/UAT (Ngoc Duc). Jira assignment and git authorship differ for many Sprint 3–4 BE tasks; this file reports both and changes neither.

## 2. Role playbooks (what Claude does when a task needs the role)

Each playbook lists scope, task groups, tools, domain knowledge, workflow, files, output standard, tests, handoff and common mistakes. Global rules (FND, policy, workflow, CLAUDE.md) always apply.

### 2.1 Product / Business Analyst (Nam's planning work; any task with unclear AC)
- **Scope**: requirements, AC, scope boundaries, traceability Proposal V1.2 → feature doc → Jira → spec.
- **Tasks**: Jira AC rewrites, Spec Kit Specify/Clarify, gap analysis spec ↔ code, backlog audits.
- **Knowledge**: FND §1, §4–§6; `docs/features/`; `docs/mvp-scope/` (PSD, OPD); `.agents/rules/feature-*.md`.
- **Workflow**: read source → list AC by ID → mark `[ĐỀ-XUẤT]` for new AC → one question per open decision (AGENTS.md rule 5) → record in `specs/NNN/record.md`.
- **Output standard**: every statement has a source ID or tag (`[DỮ-KIỆN]`, `[ĐỀ-XUẤT]`, `[CHƯA-QUYẾT]`, `[PO-ĐÃ-XÁC-NHẬN]`); no invented route, field or rule.
- **Mistakes to avoid**: treating code as requirement; closing an OPD; confusing Master Task ID with Jira key.

### 2.2 UI/UX Designer (DES-001…015 owner: Nam)
- **Scope**: Figma page `EduBranch AI – Screens`, R01 tokens, screen states, UX copy (Vietnamese source).
- **Tasks**: frame review, design direction, UI audit (KEEP/IMPROVE/REDESIGN), state coverage, UX writing.
- **Tools**: Figma MCP read-only (edit only with PO approval), Playwright screenshots, `docs/design/`.
- **Knowledge**: R01 (single design source), `docs/05_FIGMA.md`, `docs/design/DESIGN-DIRECTION.md`, pedagogy guardrails (no grading UI, consequences only in review).
- **Output**: annotated audit with screenshots, measurable deltas (px, %), token-level proposals marked PROPOSED.
- **Mistakes**: changing brand colours; dark mode; sparkle/chat AI imagery; one layout for every screen; redesign without a real problem.

### 2.3 Frontend Developer (Baohy, Hướng)
- **Scope**: `frontend/` React 19 + TS + Tailwind v4; screens per Figma; API integration.
- **Tasks**: FE-0xx screen tasks, shared components in `src/components/ds` and `feedback`, services/mappers, i18n.
- **Files**: `src/pages/<domain>/`, `src/layouts/shell/`, `src/services/`, `src/locales/{vi,en}.json`, `src/routes/paths.ts`.
- **Workflow**: Spec Kit for screens (workflow §1) → reuse DS → real API only → all states → i18n + l10n registry → lint/test/build → Visual QA at 1440px.
- **Tests**: `npm run lint`, `npm test` (register new spec in `package.json`), `npm run build`, `npm run test:visual`.
- **Handoff**: PR with Figma/app comparison images, l10n check output, known gaps.
- **Mistakes seen in this repo**: hard-coded fallback data (Admin Dashboard), strings outside i18n, commit tagged with the wrong task ID (`[BE-033]` on FE-029, `[D-05]`), fixed widths that break at 1440px.

### 2.4 Backend Developer (Đức Anh)
- **Scope**: `backend/` NestJS gateway, raw SQL, migrations, auth/RBAC, ownership, business invariants.
- **Tasks**: BE-0xx APIs, migrations, e2e role matrices, OPS-001…003 infrastructure.
- **Workflow**: contract first (`specs/*/contracts/`) → DTO validation → ownership in SQL → transaction for multi-table writes → unit + e2e + role-matrix + live SQL where constraints matter.
- **Tests**: `npm run build`, `npm test`, `npm run test:e2e`, `test:matrix`, `test:regression`, `QA_LIVE=1` live suites.
- **Mistakes**: unconfigured git identity; task IDs as Master IDs (`[EBA-418]`); long-lived branches that diverge from `develop` (PR #59).

### 2.5 AI Engineer (BE-007…015, BE-027 owner: Nam)
- **Scope**: `ai-service/` FastAPI, providers, ingestion, retrieval, generation, challenge support.
- **Workflow**: Pydantic schema first → provider via `factory.py` → `<sources>` boundary → validation and bounded retries → tests with mocked providers.
- **Guardrails**: AI never grades; max 2 rounds; DAG validation before returning a case; course isolation in retrieval.
- **Tests**: `pytest` on Python 3.12; live tests only with keys; keep tests pointing at real call sites after refactors (QA-006 AC3 test broke after BE-015).

### 2.6 QA / DevOps (QA-001…023: Nam; QA-017, 019, 024: Ngoc Duc; OPS: Đức Anh)
- **Scope**: test strategy, API/integration/security tests, Visual QA, CI, environments, UAT, release.
- **Workflow**: matrix per AC (positive, negative, boundary, ownership, role) → run on a clean DB → record command, exit code, SHA → QG7 after merge → evidence in Jira.
- **Tools**: Jest/supertest, pytest, Playwright (visual + e2e), local Postgres/Redis (cloud sessions) or Docker compose.
- **Mistakes**: counting skipped live suites as passed; Visual QA budgets measured on one OS only; Done without QG7.

## 3. Dependencies between members (current)
- FE screens wait on BE APIs: FE-027 → BE-030; FE-029 → BE-033; FE-031/FE-032 → BE-032; FE-030 profile edit → BE-031; Google/Microsoft sign-in → BE-034 (+ provider credentials).
- QA-021 → BE-029/FE-028/BE-031; QA-022 → BE-032; QA-023 → BE-034; QA-017/019/024 → Sprint 4 PRs merged.
- Every merge needs the PO as Code Owner (single owner; admin-merge only per PR on the PO's order).
