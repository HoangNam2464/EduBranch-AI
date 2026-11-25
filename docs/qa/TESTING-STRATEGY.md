# EduBranch AI — Testing Strategy

> - **Document Class**: `[SUPPORTING GUIDE]` (Living Multi-Tier Testing Strategy)

**Status**: Active (Unit, Integration/E2E, Security, Node `tsx` Spec Runner & Playwright)

---

## Backend Gateway (NestJS)

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | Jest + ts-jest | Service layer, validation logic |
| Integration tests | Jest + Supertest | Controller → Service → Database |
| Security tests | NestJS Testing + JWT guards | Auth, role enforcement, JWT validation |

**Configuration**: Unit tests run with isolated Jest in-memory mocks; integration/E2E suites (`test:e2e`, `test:matrix`, `test:regression`) run against isolated PostgreSQL 16 (`pgvector`) + Redis 7 containers (no SQLite).

### Critical Tests Required

- Auth: login success/failure, JWT validation, role access control
- Case: status transition (valid and invalid), student cannot access non-`PUBLISHED` cases (`INV-01`)
- Branching Study (`branching-attempt` & `reasoning`): attempt creation, node navigation (`selected_option_id` recorded immediately), terminal detection, retrospective reasoning capture in REVIEW phase, immutable retry (`attempt_number + 1`)
- Review Study (`review-study`): single submission per student per case, forward-only status lifecycle (`SUBMITTED → REVIEWED → REFLECTED`)
- AI Reasoning / Challenge Support (`challenge-support`): round enforcement (max 2 rounds), completed session rejection, target XOR (`chk_challenge_one_target`)
- Statistics: ownership enforcement (lecturer sees only own courses)

---

## AI Service (FastAPI)

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | pytest | Pydantic schema validation, chunking, DFS 3-color cycle detection |
| Integration tests | pytest + httpx | FastAPI route handlers (mock LLM providers) |

### Critical Tests Required

- Decision tree schema: valid tree, invalid cycle, orphan node, no terminal node
- Provider abstraction: mock provider returns correct structure
- AI Reasoning / Challenge Support: counter-question does not contain grade/pass-fail language

---

## Frontend (React)

| Layer | Tool | Scope |
|---|---|---|
| Linting | oxlint (`npm run lint`) | Static rules across `src/` |
| Type checking & Build | TypeScript 6 (`tsc -b && vite build`) | Strict compile-time & bundle safety |
| Unit / Contract specs | Node test runner via `npx tsx --test` (`npm test`) | Mappers, routes, guards, stores, i18n, UI logic & component styles |
| Browser E2E & Visual | Playwright (`npm run test:e2e`, `npm run test:visual`) | Multi-width browser flows (1024/1280/1440/1920, VI/EN) & Figma pixel-diff reference |

---

## CI Integration

All tests run in GitHub Actions (plus `node scripts/l10n-approval-check.mjs --release` at QG4/release gates):
- `backend-ci.yml`: `npm run build`, `npm test`, and `npm run test:e2e`
- `ai-service-ci.yml`: `pytest`
- `frontend-ci.yml`: `npm run lint`, `npm test`, and `npm run build`
- `ci.yml` (`Integration CI Gate` on `develop` / `main`): backend & AI service integration suites in parallel

See `.github/workflows/` for workflow definitions.
