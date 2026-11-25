---
paths:
  - "backend/**"
---
# Backend Gateway Notes — Claude Code

Authoritative backend standards and recurring-defect rules live in **`.agents/rules/03-engineering-and-task-standards.md` §2 & §7** (`Rule B1`–`B4`), **FND §3–§6**, `.agents/rules/feature-<domain>.md`, and active API contracts under `specs/*/contracts/`. Do not duplicate them here.

## Claude Cloud-Session Local Database (without Docker)
When running E2E/regression suites (`npm run test:e2e`, `test:matrix`, `test:regression`) on a clean cloud container without Docker Compose:
```bash
apt-get install -y postgresql-16-pgvector
mkdir -p /var/lib/eb-pgdata && chown postgres /var/lib/eb-pgdata
su postgres -c "/usr/lib/postgresql/16/bin/initdb -D /var/lib/eb-pgdata -A trust -U postgres"
su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/eb-pgdata -l /var/lib/eb-pgdata/server.log -o '-p 5432 -k /tmp' -w start"
psql -h localhost -U postgres -c "create user edubranch with password 'test' superuser" -c "create database edubranch_ai owner edubranch"
redis-server --port 6379 --daemonize yes
```
Run backend commands with `POSTGRES_PASSWORD=test REDIS_PASSWORD= JWT_SECRET=<random 64+ chars>`.
