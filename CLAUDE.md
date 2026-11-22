# CLAUDE.md

Guidance for Claude Code in EduBranch-AI. Order of authority when sources disagree: approved PO decisions → `AGENTS.md` → FND (`.agents/rules/00-project-foundation.md`) → `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` → this file → other docs. Code is evidence of what exists, never of what is approved (AGENTS.md rule 8).

@AGENTS.md
@.agents/rules/02-agent-operating-policy.md

Detail lives outside this file. Path-scoped rules in `.claude/rules/` load when you touch matching files: `frontend.md`, `backend.md`, `ai-service.md`, `database.md`, `ui-design.md`; `git-and-pr.md` and `task-management.md` always load. Antigravity does not read `.claude/`; it reads `.agents/rules/` (FND, R01, feature rules), which Claude reads on demand.

## 1. Project overview
EduBranch-AI (capstone C1SE.65, Duy Tan University) is an AI platform for experiential case-based learning in university teaching. Product source: Proposal V1.2 (`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`, not in the repo; cite its section or ask). Summary: `docs/PROJECT_OVERVIEW.md`. Domain terms: FND §1.2 (Lecturer, Student, Course, Teaching Materials, Case Study, Branching Study, Review Study, Consequence, Outcome, AI Challenge Support); never K-12 or "teacher/quiz/debate/simulator" terms.

## 2. Product goals and users
- **Lecturer**: creates courses, uploads PDF/DOCX materials, generates case drafts with AI, edits, approves and publishes them, reviews student work, writes qualitative feedback, reads statistics.
- **Student**: joins a class by invite code (OPD-001 → A), opens PUBLISHED cases, plays Branching Study (experience → Journey Review → reflection/retry) or Review Study (analysis → lecturer feedback → reflection), may use AI Challenge Support.
- **Admin**: accounts, roles, courses, system health (OPD-015: in MVP).
- Educational value: students learn by deciding and reflecting; AI provokes thinking, the lecturer judges. AI never grades.

## 3. Tech stack (from manifests)
Frontend React 19 + Vite 8 + TypeScript 6 + TailwindCSS v4 + Zustand + ReactFlow 11 + i18next + framer-motion (ADR-002). Backend NestJS 10 (Node 20 in CI) + raw SQL on `pg` (no ORM). AI service FastAPI + Pydantic v2 + LangChain, Python 3.12 in CI. PostgreSQL 16 + pgvector, Redis 7, MinIO. LLM: Gemini `gemini-3.5-flash` (pinned, PO 2026-11-17), embeddings `gemini-embedding-001` at 768 dims; OpenAI GPT-4o-mini through `ai-service/app/providers/factory.py`. A new technology or dependency needs an ADR and PO approval (workflow §4 Plan).

## 4. Architecture
Browser → Backend Gateway `/api/v1/*` (JWT, RBAC, all business state) → internal AI service `/internal/v1/*` (`X-Internal-API-Key`; parsing, chunking, embeddings, retrieval, generation, counter-questions). The browser never calls the AI service. Responsibility split: FND §3; diagrams: `docs/architecture/SYSTEM-ARCHITECTURE.md`, `SERVICE-BOUNDARIES.md`, `DATA-FLOW.md`.
Code map: FE client `frontend/src/services/apiClient.ts`, stores `frontend/src/stores/`, routes `frontend/src/routes/paths.ts`; BE bootstrap `backend/src/main.ts` (global `ValidationPipe` whitelist, global `JwtAuthGuard` + `RolesGuard`, opt out with `@Public()`), domain modules `backend/src/modules/*`, shared `backend/src/common/` (`database`, `ai-client`, `minio`, `config`, `health`); AI packages `ai-service/app/{core,providers,ingestion,retrieval,generation,challenge_support,evaluation}`.

## 5. Business rules and security invariants (never break; FND §4–§6)
1. **INV-01**: a student never reads a case that is not `PUBLISHED`; the check sits in the repository SQL (`status = 'PUBLISHED'`), never only in UI or controller. Access paths (FND §1, OPD-001 → A, FR-BS-01): (a) the student desk and My courses list only courses the student joined by invite code; (b) a direct case link from the lecturer keeps working for a `PUBLISHED` case, with no enrollment condition added. Never widen or narrow these paths without a PO decision.
2. Case lifecycle `DRAFT → REVIEWED → APPROVED → PUBLISHED`; AI output always starts as DRAFT; AI never edits an approved case.
3. Decision tree: options point inside the same case, every node reachable from the root, no cycles (3-colour DFS), 2–4 options per non-terminal node, at least one terminal node. Review Study cases have no tree.
4. Branching Study is experience-first: no reasoning form and no consequence between decisions; consequences and alternatives appear only in Journey Review; retry creates a new immutable attempt.
5. AI Challenge Support: counter-questions only, max 2 rounds (DB `CHECK` and both services), never grades, scores, ranks or passes/fails.
6. Retrieved material is untrusted: wrap it in `<sources>…</sources>`; it never overrides instructions.
7. Ownership: a lecturer sees only own courses/cases/submissions; a student only own attempts, reasoning and submissions. Treat every ID in a request as hostile.
Where code implements these today: student PUBLISHED checks in `case.service.ts` and `branching-attempt.service.ts`; `MAX_ROUNDS` in `ai-service/app/challenge_support/assistant/service.py`; `<sources>` in `ai-service/app/retrieval/service.py`; tree checks in `ai-service/app/generation/schemas/decision_tree.py`. Code is not proof that FND is met.

## 6. Design philosophy
Calm, structured, data-rich academic workspace; typography and the surface ladder carry hierarchy, colour carries meaning (status, mode, data, one action colour). AI is a function, never the visual identity (no sparkles, glow, chat avatars). UI follows Figma page `EduBranch AI – Screens`; UX behaviour (loading, empty, error, pending, toast, dialog, thin borders, soft shadows, motion) learns from the PO's reference frontend zip, which is never copied into the repo (PO 2026-11-17; R01 §5.0). Width (PO 2026-11-21, "Tràn theo màn hình" + "Chỉ trong app", spec 006 / PR #79): screens inside the app shell use the full width next to the sidebar, with fixed side gutters, and long paragraphs are capped for reading; only the public landing, public header/footer and auth pages keep `max-w-7xl`. This replaces the earlier "Centered Container Mandate" for the app shell. Proposed evolution: `docs/design/DESIGN-DIRECTION.md` (PROPOSED until the PO approves it).

## 7. Design System guidelines
Tokens: GDS (`docs/design/GLOBAL-DESIGN-SYSTEM.md`) ↔ `frontend/src/index.css` `@theme` ↔ Figma variables `EduBranch · *`. Web font is the system font (PO 2026-11-21, GDS §3.1); Be Vietnam Pro only for public landing headings. Design values are provisional and not Ready for Dev until the PO approves tokens (AGENTS.md rule 9; GDS §0.2). Fixed identity (PO 2026-11-20, chat): light mode, navy `#2A4E7F`, sky `#00A5F5`, 1440px desktop baseline. Dark mode is out (PO, chat 2026-11-21: the baseline is Light Mode and the dark-mode toggle is removed; GDS §0.5 U-01). `develop` still ships the toggle and `.dark` styles from PR #54: never extend them; removing them is pending implementation work. Shared components: `src/components/ds` (primitives, page patterns) and `src/components/feedback` (states); never parallel copies in page folders.

## 8. Coding standards
Small, scoped changes; no sweeping refactors; no dead code or debug logging; strict TypeScript; DTOs with `class-validator`, never raw DB rows to the client; Pydantic v2 schemas on every AI boundary; secrets only from env (`.env.example` lists names); no fake data to make a screen look done; every user-visible string through i18n. Details per tier in `.claude/rules/`.

## 9–12. Frontend, backend, AI service, database
See `.claude/rules/frontend.md`, `backend.md`, `ai-service.md`, `database.md`. Feature rules for Antigravity and humans: `.agents/rules/feature-*.md`; feature specs: `docs/features/FEATURE-*.md`; API contracts per feature: `specs/*/contracts/`.

## 13. Testing strategy and commands
Strategy: `docs/qa/TESTING-STRATEGY.md`; QA tasks `docs/06_QA.md`. Run the tests of every tier you touch, plus negative, boundary and ownership cases; a happy path alone is not a test plan.
Infrastructure: `docker compose up -d` (Postgres 16 + pgvector, Redis 7, MinIO; ports from `.env`). Copy each `.env.example` to `.env` first (root, `backend/`, `ai-service/`, `frontend/`). Cloud sessions have no Docker daemon: run Postgres 16 with the `postgresql-16-pgvector` package and `redis-server` locally instead (see `.claude/rules/backend.md`).
```bash
# backend/
npm run start:dev          # port SERVER_PORT (8080), prefix /api/v1
npm run build
npm test                   # unit specs src/**/*.spec.ts
npm run test:e2e           # test/*.spec.ts + *.e2e-spec.ts (rootDir is backend/test); needs Postgres
npm run test:matrix        # test/auth-matrix.spec.ts
npm run test:regression    # test/security-regression.spec.ts
# ai-service/
uvicorn app.main:app --reload --port 8000
pytest                     # testpaths = tests
# frontend/
npm run dev                # port 5173
npm run build              # tsc -b && vite build
npm run lint               # oxlint
npm test                   # Node test runner via npx tsx; explicit file list in package.json
npm run test:visual        # Playwright Visual QA vs Figma baselines (needs dev server, backend, seed)
npm run test:e2e           # Playwright e2e (tests/e2e)
# repo root
node scripts/l10n-approval-check.mjs            # QG1 (dev mode)
node scripts/l10n-approval-check.mjs --release  # QG4
```
Backend `npm run lint` and `npm run format` do not work (eslint/prettier not installed). `tsx` is not a dependency; a new frontend spec must be added to the `test` script list. AI service tests use Python 3.12 (`uv venv -p python3.12`); token-based chunking tests download the tiktoken vocabulary from `openaipublic.blob.core.windows.net` and fail where that host is blocked (BLOCKED, not a code defect).

## 14–15. GitHub workflow, commits and PRs
Branch `feature/<feature>` (backend `feature/<feature>-backend`, AI service shares it), `fix/<name>`, `docs/<topic>`, from a freshly pulled `develop`; never a task ID in a branch name (FND §7.2). Commit `<type>(<scope>): <description> [<TASK-ID>]` (FND §7.3). PR into `develop` with the template `.github/pull_request_template.md`. Never commit to `develop`/`main`, force push, or bypass protection (admin-merge only per PR on the PO's direct chat order, policy §7). Stage by explicit path, never `.`/`-A`. Full checklists: `.claude/rules/git-and-pr.md`.

## 16. Spec Kit workflow
Features, behaviour changes, security/ownership fixes and Figma-to-code screens follow `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` with Spec Kit v1.4.0: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-checklist` → `/speckit-tasks` → `/speckit-analyze` → approval (G7) → `/speckit-implement` → `/speckit-converge`. One bounded change per `specs/NNN-<name>/` (next free number; never reuse an ID or overwrite an approved spec). Typo/format/dependency/doc edits the PO specified need no spec; small changes may take the short path only with PO approval (workflow §9). Bugs: `/speckit-bug-*` run in Antigravity only. Spec Kit scripts are PowerShell (`.specify/scripts/powershell`); in a Linux session without `pwsh`, create the feature directory by hand following the templates in `.specify/templates/` and set `SPECIFY_FEATURE_DIRECTORY`. Never re-run `specify init` or rewrite the constitution.

## 17. Visual QA and product QA
A UI change is done only after the Visual QA gate: read the file key, page and frame IDs from Figma (recorded: file `6CtSgJPKo4jCIbB7WwCaWw`, page `EduBranch AI – Screens` `483:9634`) and check them against `docs/05_FIGMA.md`; export the frame PNG at scale 1; screenshot the running app at 1440px with the frame height; compare; list each mismatch; fix; re-shoot. PASS needs the comparison image and DOM measurements within 1px. Known accepted difference since PO 2026-11-21: the web uses the system font while Figma text styles still name Roboto, so text widths differ; never compensate in code. Frames and budgets: `frontend/tests/visual/screens.ts`; baselines `frontend/tests/visual/figma/`; diffs `frontend/test-results/visual/`. Product QA also checks every state (default, loading, empty, error, 403, success), keyboard focus, no console errors, both languages. The independent check is run by someone other than the implementer (project subagent `.claude/agents/visual-qa-verifier.md`, or Claude reviewing Antigravity's work). Cloud-session recipe (no Chrome/Docker): `.claude/rules/frontend.md`. The dev quick-login block is gated by `VITE_ENABLE_DEV_LOGIN`.

## 18. Antigravity collaboration
Default split (PO 2026-11-17): Antigravity implements through `.agent-handoff/<TASK-ID>.md` (workflow §6, dispatched with `agy --print`, never `--dangerously-skip-permissions`); Claude writes the package, reviews independently and runs Visual QA. One writer per file; never edit Antigravity's scope while it runs; never claim a run without its evidence (conversation ID or CLI log, times, commands, exit codes). Give Antigravity only task-specific context (route, AC, frames, viewport, files, where to save evidence), never the whole repository. Cloud sessions have no `agy`: say so, offer the PO a package to paste, and implement yourself only small contained edits or, when Antigravity cannot be used, one `figma-screen-implementer` subagent at a time (policy §10).

## 19. Team responsibilities and AI capability
Five members, real assignments and role playbooks (BA, UI/UX, FE, BE, AI, QA/DevOps): `docs/team/TEAM-CAPABILITY-MATRIX.md`. Pick the role a task needs and follow that playbook; never change an assignee or impersonate a member; keep attribution.

## 20. Autonomy, permissions and escalation
Policy `.agents/rules/02-agent-operating-policy.md` (imported above) is the single source: own the outcome, work in batches, escalate only PO decisions and authorization limits (§5), permission matrix §11. Commit, push and open the PR yourself once QG1–QG4 pass, unless the PO's current instruction withholds commit or push for that package; merge only after QG5–QG6; Jira Done only after QG7 (workflow §5). Figma is read-only without explicit PO approval. Settings, CODEOWNERS, branch protection and CI workflows change only on a specific PO order. Protected local files: policy §7. Report to the PO in Vietnamese, with FACT / INFERENCE / PROPOSAL / UNKNOWN kept apart and the policy §8 status labels.

## Memory hygiene
This file holds stable rules only: no progress, task lists or dated status. When a PO decision changes a rule, update the source file (FND, workflow, GDS, rule file) and the pointer here in the same change. Current project status lives in Jira and `docs/04_JIRA/JIRA-KEY-MAP.md`; audits in `docs/audits/`.
