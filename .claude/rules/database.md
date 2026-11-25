---
paths:
  - "backend/migrations/**"
  - "infrastructure/**"
  - "docs/database/**"
---
# Database & Migration Notes — Claude Code

Authoritative database and migration rules live in **`.agents/rules/03-engineering-and-task-standards.md` §3**, [`docs/database/DATA-MODEL.md`](../../docs/database/DATA-MODEL.md), and [`docs/database/OPERATIONAL-BASELINE-GUIDE.md`](../../docs/database/OPERATIONAL-BASELINE-GUIDE.md). Do not duplicate them here.

- Never delete Docker volumes or database state (`.agents/rules/02-agent-operating-policy.md §11`).
- Always test schema migrations against a fresh database instance before handoff.
