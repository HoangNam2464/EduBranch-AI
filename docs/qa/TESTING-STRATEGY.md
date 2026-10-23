# EduBranch AI — Testing Strategy

**Status**: Scaffolded

---

## Backend Gateway (NestJS)

| Layer | Tool | Scope |
|---|---|---|
| Unit tests | Jest + ts-jest | Service layer, validation logic |
| Integration tests | Jest + Supertest | Controller → Service → Database |
| Security tests | NestJS Testing + JWT guards | Auth, role enforcement, JWT validation |

**Configuration**: All tests use isolated test environment with SQLite/PostgreSQL test container.

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
| Type checking | TypeScript strict | Compile-time safety |
| Build test | Vite build | Ensures no broken imports |

---

## CI Integration

All tests run in GitHub Actions:
- `backend-ci.yml`: `npm test` and `npm run build`
- `ai-service-ci.yml`: `pytest`
- `frontend-ci.yml`: `npm run build`
- `ci.yml` (on PR to main): all three in parallel

See `.github/workflows/` for workflow definitions.
