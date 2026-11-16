# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@.agents/rules/02-agent-operating-policy.md

## Rules Claude does not load by itself

`.agents/rules/` is loaded by Antigravity, not by Claude Code; the one exception is the agent operating policy imported above (task ownership, batch-first execution, PO decision boundary, roles, evidence-based handoff). Before changing an area, read the matching section of `.agents/rules/00-project-foundation.md` (FND): §3 architecture boundaries, §4 case lifecycle, §5 decision-tree integrity, §6 AI governance, §7 Git and commits. Feature rules: `.agents/rules/feature-*.md`. Claude path-scoped rules: `.claude/rules/`.

## Working with the PO

- Commit, push to the feature branch and open the PR yourself once the Quality Gates QG1–QG4 of `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §5 pass (workflow Approved by the PO 2026-11-17; PO decision 2026-11-15); no separate approval per operation. Never commit to `develop`/`main`, force push, bypass branch protection (exception: the per-PR admin-merge on the PO's direct chat order, policy §7), commit out-of-scope changes, or change architecture or business rules. Merge only after QG5–QG6 (all PR checks green, Code Owner/PO approval); Jira Done only after QG7 (retest on `develop` at the merge SHA). A UI change also needs Visual QA evidence against the approved Figma frames (see "Visual QA gate").
- Coding is done by Antigravity through `.agent-handoff/<TASK-ID>.md` (workflow §6); you write the task package and review independently. Never edit files in Antigravity's scope while it runs, and never claim it ran without a real run (its Result must carry the conversation ID or CLI log, times, commands and exit codes). Dispatch it headless with `agy --print` from the workspace root in the default permission mode; never `--dangerously-skip-permissions`.
- Work on Jira tasks in project EBA: branch from a freshly pulled `develop` (`feature/<feature>`), PRs go to `develop` only; `develop` → `main` is the PO's.
- Stage by explicit path (`git add -- <path>`), never `.` or `-A`. Never stage untracked files you did not create.
- For a feature, a behaviour change, a security/ownership/permission fix, or work that needs traceability, use the `edubranch-feature-workflow` skill (workflow Approved 2026-11-17), which runs the Spec Kit skills (`/speckit-specify` … `/speckit-converge`). Bugs: `/speckit-bug-assess` → `/speckit-bug-fix` → `/speckit-bug-test`, which run in Antigravity only (extension registered for `agy`); you review their reports. Not for small edits.
- Report to the PO in Vietnamese.

## Commands

Infrastructure: `docker compose up -d` starts Postgres 16 + pgvector, Redis 7 and MinIO (ports from `.env`, defaults 5432 / 6379 / 9000-9001). Copy each `.env.example` to `.env` first (root, `backend/`, `ai-service/`, `frontend/`).

Backend (`backend/`):
```bash
npm run start:dev                 # port SERVER_PORT (default 8080), prefix /api/v1
npm run build
npm test                          # unit tests: src/**/*.spec.ts
npx jest case.service -t "<name>" # one unit test file / test
npm run test:e2e                  # test/jest-e2e.json; rootDir is backend/, so it also runs the unit specs
npm run test:matrix               # test/auth-matrix.spec.ts
npm run test:regression           # test/security-regression.spec.ts
```
`npm run lint` and `npm run format` do not work: eslint and prettier are not installed.

AI service (`ai-service/`):
```bash
uvicorn app.main:app --reload --port 8000
pytest                            # testpaths = tests
pytest tests/test_retrieval -k "<name>"
```

Frontend (`frontend/`):
```bash
npm run dev                       # port 5173
npm run build                     # tsc -b && vite build
npm run lint                      # oxlint
npm test                          # Node test runner via tsx, explicit file list in package.json
npm run test:visual               # Playwright Visual QA against Figma baselines (local gate)
npx tsx --test src/stores/authStore.spec.ts
```
`tsx` is not a dependency; `npx` downloads it. A new spec file must be added to the `test` script list.

## Engineering system

Every task is traced Task → business requirement (Proposal V1.2, feature doc/rule, AC) → Figma frames → architecture → BE → FE → integration → QA → evidence. "Done" is never claimed without evidence: the AC handled, the frames implemented, test commands with exit codes, Visual QA results, build status and the remaining issues with reasons.

Project subagents (`.claude/agents/`) are used only for work that is really independent; the main session integrates and checks every result itself before reporting:
- `figma-screen-implementer`: makes one screen group match its Figma frames (owned files only).
- `visual-qa-verifier`: independent verifier; never the implementer of the change it verifies.

Frontend rules for UI work:
- Reuse `src/components/ds` (Design System primitives and page patterns) and `src/components/feedback` (states); do not create parallel versions in page folders.
- Tokens come from `src/index.css` `@theme` (mirrors the Figma variables). No raw hex in pages when a token exists.
- UI text goes through i18next; Vietnamese default, English pair with the same keys; feature files `src/locales/<feature>.vi.json` / `.en.json`, one top-level key, merged by `src/lib/i18n.ts`; no hard-coded UI strings; English copy translates the approved Vietnamese copy and uses the project's established English domain terms, never invented ones. Every English key must have a registry row (`specs/*/l10n-copy-review.md` or `docs/l10n/shared-copy-review.md`); `node scripts/l10n-approval-check.mjs` must pass. English strings stay PROPOSED until the PO approves them; never set them APPROVED yourself; unapproved English copy is not released.
- Paths come from `src/routes/paths.ts` (`PATHS`, `buildPath`); never hard-code route strings.
- No fake data to make a screen look done. When Figma shows content the API does not provide, report the gap.
- UI/UX boundary (PO 2026-11-17): UI follows Figma page 08 (colours, data fields, business behaviour); UX learns from the PO's reference frontend (`frontend.zip`): content capped at `max-w-7xl`, thin borders, soft shadows, animation, plus its loading/error/empty/pending/toast/dialog behaviour. Details: R01 §4.3, §5.0. Never copy files from the zip into the repo.
- Token budget (PO 2026-11-17): coding goes to Antigravity via `.agent-handoff/` (workflow §6); Claude reviews and runs Visual QA. Do not run several Claude coding sub-agents in parallel; an agent never writes outside its assigned workspace.

### Visual QA gate (UI changes)

Figma is the baseline; an implementation screenshot never replaces it. Before comparing, read the file key, page and frame IDs from Figma itself and check them against `docs/05_FIGMA.md` (recorded today as file `6CtSgJPKo4jCIbB7WwCaWw`, page `08 · EduBranch – Bản hoàn chỉnh`); never assume a page or frame is current without that check. Loop: export the Figma frame PNG at scale 1 → screenshot the running app at 1440px with the frame height → compare → list each mismatch → fix the source → re-shoot → repeat.
- `cd frontend && npm run test:visual` (Playwright, local Chrome, needs `npm run dev` with the backend and seed data). Frames and their accepted mismatch budgets: `frontend/tests/visual/screens.ts`; Figma baselines: `frontend/tests/visual/figma/`; diff images: `frontend/test-results/visual/`.
- A frame is PASS only with the comparison image and DOM measurements (sizes, spacing, type, colours) within 1px of Figma. Known Chrome text rendering (Roboto 14/20 about 1px higher, labels up to 0.5px narrower) is accepted and never compensated in code.
- The login page's dev quick-access block is gated by `VITE_ENABLE_DEV_LOGIN` (`src/config/devTools.ts`); visual tests hide it.

## Code map

- Frontend HTTP client: `frontend/src/services/apiClient.ts` (Axios, JWT interceptors, `VITE_API_BASE_URL`). Stores: `frontend/src/stores/` (Zustand).
- Backend bootstrap: `backend/src/main.ts` sets the `/api/v1` prefix, a global whitelist `ValidationPipe`, and global `JwtAuthGuard` + `RolesGuard` (opt out with `@Public()`). Domain code: `backend/src/modules/*`. Shared services: `backend/src/common/` (`database`, `ai-client`, `minio`, `config`, `health`).
- No ORM: `common/database/database.service.ts` wraps a `pg` Pool and runs raw SQL.
- Migrations run on backend start (`AUTO_MIGRATE`, default true) through `common/database/migration-runner.ts`, under a Postgres advisory lock, from `backend/migrations/`. `infrastructure/postgres/migrations/` holds a second copy that the runner does not read (header comment and BOM differ). Compose mounts only `infrastructure/postgres/init/` (extensions).
- Backend → AI service: `common/ai-client/ai-client.service.ts` (`AI_SERVICE_BASE_URL`, `AI_SERVICE_API_KEY`). AI-side key check: `verify_internal_api_key` in `ai-service/app/core/security.py`; `/health` has no key check. LLM providers: `ai-service/app/providers/factory.py`.
- Code that implements FND §4–§6 checks today: student PUBLISHED checks in `case.service.ts` and `branching-attempt.service.ts`; `MAX_ROUNDS` in `ai-service/app/challenge_support/assistant/service.py`; `<sources>` wrapping in `ai-service/app/retrieval/service.py`; tree checks in `ai-service/app/generation/schemas/decision_tree.py`. Code is not proof that FND is met.
- `README.md` and `.github/copilot-instructions.md` are not in the GDS §0 register and are partly outdated (README says Vitest and an infrastructure migrations path). Trust code and approved sources; report mismatches.
