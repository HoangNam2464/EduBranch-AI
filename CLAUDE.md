# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Rules Claude does not load by itself

`.agents/rules/` is loaded by Antigravity, not by Claude Code. Before changing an area, read the matching section of `.agents/rules/00-project-foundation.md` (FND): §3 architecture boundaries, §4 case lifecycle, §5 decision-tree integrity, §6 AI governance, §7 Git and commits. Feature rules: `.agents/rules/feature-*.md`. Claude path-scoped rules: `.claude/rules/`.

## Working with the PO

- Each step (file change, commit, push, PR, merge) needs its own PO approval in chat. Show the content or diff first.
- Stage by explicit path (`git add -- <path>`), never `.` or `-A`. Never stage untracked files you did not create.
- For a feature, a behaviour change, a security/ownership/permission fix, or work that needs traceability, use the `edubranch-feature-workflow` skill. Not for small edits.
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
npx tsx --test src/stores/authStore.spec.ts
```
`tsx` is not a dependency; `npx` downloads it. A new spec file must be added to the `test` script list.

## Code map

- Frontend HTTP client: `frontend/src/services/apiClient.ts` (Axios, JWT interceptors, `VITE_API_BASE_URL`). Stores: `frontend/src/stores/` (Zustand).
- Backend bootstrap: `backend/src/main.ts` sets the `/api/v1` prefix, a global whitelist `ValidationPipe`, and global `JwtAuthGuard` + `RolesGuard` (opt out with `@Public()`). Domain code: `backend/src/modules/*`. Shared services: `backend/src/common/` (`database`, `ai-client`, `minio`, `config`, `health`).
- No ORM: `common/database/database.service.ts` wraps a `pg` Pool and runs raw SQL.
- Migrations run on backend start (`AUTO_MIGRATE`, default true) through `common/database/migration-runner.ts`, under a Postgres advisory lock, from `backend/migrations/`. `infrastructure/postgres/migrations/` holds a second copy that the runner does not read (header comment and BOM differ). Compose mounts only `infrastructure/postgres/init/` (extensions).
- Backend → AI service: `common/ai-client/ai-client.service.ts` (`AI_SERVICE_BASE_URL`, `AI_SERVICE_API_KEY`). AI-side key check: `verify_internal_api_key` in `ai-service/app/core/security.py`; `/health` has no key check. LLM providers: `ai-service/app/providers/factory.py`.
- Code that implements FND §4–§6 checks today: student PUBLISHED checks in `case.service.ts` and `branching-attempt.service.ts`; `MAX_ROUNDS` in `ai-service/app/challenge_support/assistant/service.py`; `<sources>` wrapping in `ai-service/app/retrieval/service.py`; tree checks in `ai-service/app/generation/schemas/decision_tree.py`. Code is not proof that FND is met.
- `README.md` and `.github/copilot-instructions.md` are not in the GDS §0 register and are partly outdated (README says Vitest and an infrastructure migrations path). Trust code and approved sources; report mismatches.
