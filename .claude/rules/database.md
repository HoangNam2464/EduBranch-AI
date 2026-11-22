---
paths:
  - "backend/migrations/**"
  - "infrastructure/**"
  - "docs/database/**"
---
# Database and migration rules (PostgreSQL 16 + pgvector)

- Schema reference: `docs/database/DATA-MODEL.md`; operations: `docs/database/OPERATIONAL-BASELINE-GUIDE.md`.
- The migration runner (`backend/src/common/database/migration-runner.ts`) applies `backend/migrations/V<n>__<name>.sql` in order on backend start (`AUTO_MIGRATE`, default true) under a Postgres advisory lock. It does not read `infrastructure/postgres/migrations/` (a stale copy that lacks V5); compose mounts only `infrastructure/postgres/init/` (extensions). There is no Flyway.
- Never edit an applied migration; add the next `V<n+1>__<name>.sql`. Schema changes are a plan item (workflow §4 Plan) and need the data model doc updated in the same change.
- Naming: plural `snake_case` tables, `id UUID DEFAULT uuid_generate_v4()`, `<entity>_id` foreign keys, `created_at`/`updated_at TIMESTAMPTZ`.
- Invariants belong in the schema where possible: `CHECK (current_round BETWEEN 0 AND 2)`, one feedback target, `UNIQUE(course_id, student_id)` for enrollments, case status check.
- V1 still contains retired tables (`simulation_sessions`, `student_arguments`, `debate_*`); do not build on them.
- Never delete Docker volumes or data (policy §11); test migrations against a fresh database.
