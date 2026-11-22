---
paths:
  - "backend/**"
---
# Backend Gateway rules (NestJS 10 + raw SQL)

Read first: FND §3–§6 and the feature rule `.agents/rules/feature-<domain>.md`; API contract in `specs/*/contracts/` when one exists.

## Structure
- One module per domain in `src/modules/` (`auth`, `user`, `course`, `material`, `case`, `branching-attempt`, `reasoning`, `challenge-support`, `review-study`, `lecturer-feedback`, `statistics`, `evaluation`, `notification`): controller → service → SQL through `common/database/database.service.ts` (`pg` Pool). No ORM, no query builder.
- Global prefix `/api/v1`, global whitelist `ValidationPipe`, global `JwtAuthGuard` + `RolesGuard` (`backend/src/main.ts`). A route is public only with `@Public()`; role checks with `@Roles()`.
- AI calls only through `common/ai-client/ai-client.service.ts` (`AI_SERVICE_BASE_URL`, `AI_SERVICE_API_KEY`); MinIO through `common/minio`.

## Rules
- DTOs with `class-validator` for every input; response DTOs/mappers, never raw rows or internal columns (password hash, object keys).
- Parameterised SQL only (`$1`), never string interpolation of input.
- Ownership in the query: lecturer resources filtered by `lecturer_id = $user`, student resources by `student_id = $user`; student case reads add `status = 'PUBLISHED'` (INV-01); student listings (desk, My courses) are limited to joined courses; a direct case link keeps working for a `PUBLISHED` case without an enrollment condition (FND §1, OPD-001 → A, FR-BS-01) — do not add or drop conditions without a PO decision. Return 404 rather than leaking existence where the contract says so.
- Multi-table writes (case tree, attempts) in one transaction; roll back on any failure.
- Errors: Nest HTTP exceptions with a stable error code; no stack traces or SQL in responses.
- Rate limiting on auth endpoints (`@nestjs/throttler`).

## Tests
- Unit: `src/**/*.spec.ts` (`npm test`). E2E/integration: `test/*.spec.ts`, `test/*.e2e-spec.ts` (`npm run test:e2e`, rootDir `backend/test`), with role-matrix and ownership-leak cases for every new endpoint (`test/auth-matrix.spec.ts`, `test/security-regression.spec.ts` patterns). Live suites (`*.live.spec.ts`, ingestion, storage) skip without MinIO/AI service; report them as skipped, never as passed.
- Run e2e against a clean database, as CI does.

## Local database without Docker (cloud sessions)
```bash
apt-get install -y postgresql-16-pgvector
mkdir -p /var/lib/eb-pgdata && chown postgres /var/lib/eb-pgdata
su postgres -c "/usr/lib/postgresql/16/bin/initdb -D /var/lib/eb-pgdata -A trust -U postgres"
su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/eb-pgdata -l /var/lib/eb-pgdata/server.log -o '-p 5432 -k /tmp' -w start"
psql -h localhost -U postgres -c "create user edubranch with password 'test' superuser" -c "create database edubranch_ai owner edubranch"
redis-server --port 6379 --daemonize yes
```
Then run backend commands with `POSTGRES_PASSWORD=test REDIS_PASSWORD= JWT_SECRET=<random 64+ chars>`.
