# EduBranch AI — Backend Gateway

> **Document Class**: `[SUPPORTING GUIDE]` · **Authoritative Backend/DB Rules**: [`.agents/rules/03-engineering-and-task-standards.md §2–§3`](../.agents/rules/03-engineering-and-task-standards.md), [`docs/architecture/SERVICE-BOUNDARIES.md`](../docs/architecture/SERVICE-BOUNDARIES.md), [`docs/database/DATA-MODEL.md`](../docs/database/DATA-MODEL.md)

Node.js 20 LTS (NestJS 10 + TypeScript) REST API Gateway for **EduBranch AI**. Serves as the sole public HTTP interface (`/api/v1/*`) and owns all authentication, RBAC, course/enrollment ownership, case lifecycle state machines, and relational persistence.

---

## Responsibilities

- Authentication & stateless JWT issuance (`LECTURER`, `STUDENT`, `ADMIN` roles; auth rate limiting)
- Course management, soft archiving (`PATCH /courses/:courseId/archive`), and invite-code student enrollments (`V5`)
- Teaching material uploads to MinIO (`common/minio/`) and async ingestion dispatch to internal AI Service
- Case lifecycle state machine (`DRAFT → REVIEWED → APPROVED → PUBLISHED`) & SQL-level `status = 'PUBLISHED'` student access gate (`INV-01`)
- Branching Study attempt traversal, retrospective reasoning capture, and immutable retry tracking (`attempt_number + 1`)
- Review Study single-submission lifecycle (`SUBMITTED → REVIEWED → REFLECTED`) and Lecturer qualitative feedback
- AI Challenge Support orchestration (`1–2` round hard cap, non-grading) & basic Learning-Flow statistics
- Internal HTTP integration to FastAPI AI Service (`common/ai-client/`, `X-Internal-API-Key`)

---

## Technology

- **Runtime & Framework**: Node.js 20+ · NestJS 10 · TypeScript (strict)
- **Database**: PostgreSQL 16 + pgvector using **raw parameterized SQL via `pg` Pool** (`src/common/database/database.service.ts`) — no ORM, no TypeORM
- **Migrations**: Sequential SQL (`backend/migrations/V1`–`V5`) applied by `MigrationRunner` under a PostgreSQL advisory lock (`infrastructure/postgres/migrations/` is an unexecuted stale copy)
- **Cache & Storage**: Redis 7 · MinIO S3 SDK · `@nestjs/axios` · `class-validator` / `class-transformer`

---

## Module Structure

> Target layered structure & naming standards (`common/exception/`, `common/security/`, `common/dto/`, removing unused duplicate `common/storage/`, and selective `<domain>.repository.ts` extraction in SQL-dense/`INV-01` modules `case/`, `branching-attempt/`, `statistics/`, `evaluation/`): [`SERVICE-BOUNDARIES.md §5.1`](../docs/architecture/SERVICE-BOUNDARIES.md) and [`.agents/rules/03-engineering-and-task-standards.md §2, §7–§8`](../.agents/rules/03-engineering-and-task-standards.md).

```text
backend/
├── migrations/                  ← Active sequential SQL (V1__init_schema.sql .. V5__course_enrollments.sql)
└── src/
    ├── app.module.ts            ← Root NestJS module
    ├── main.ts                  ← Bootstrap (Port 8080, prefix /api/v1, ValidationPipe, JwtAuthGuard, RolesGuard)
    ├── common/
    │   ├── ai-client/           ← Internal FastAPI AI Service client
    │   ├── config/              ← Startup environment validation
    │   ├── database/            ← pg Pool DatabaseService & advisory-locked MigrationRunner
    │   ├── health/              ← Health probe (/api/v1/health)
    │   ├── minio/               ← Canonical MinIO client (duplicate storage/ queued for removal in PR 2)
    │   └── [PR 2 Target]        ← exception/ (HttpExceptionFilter), security/ (sanitizer + audit), dto/
    └── modules/                 ← auth, user, course, material, case, branching-attempt, reasoning,
                                    challenge-support, review-study, lecturer-feedback, statistics, evaluation, notification
```

---

## Local Setup & Verification

```bash
# 1. Start PostgreSQL + pgvector, Redis, MinIO (from repo root)
docker compose up -d

# 2. Configure and run Backend Gateway
cd backend
cp .env.example .env
npm install
npm run start:dev     # http://localhost:8080/api/v1

# 3. Build & Test
npm run build
npm test              # Jest unit suites (src/**/*.spec.ts)
npm run test:e2e      # E2E suites (requires PostgreSQL & Redis; live MinIO/AI suites skip without services)
```
