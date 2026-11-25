---
paths:
  - "frontend/**"
---
# Frontend Notes — Claude Code

Authoritative design, code-structure, VI/EN copy, and recurring UI-defect guardrails live in **R01** (`.agents/rules/01-ui-design-standards.md`), **`.agents/rules/03-engineering-and-task-standards.md` §5 & §7** (`Rule F1`–`F3`, `G1`), [`docs/design/UX-SCREEN-NOTES.md`](../../docs/design/UX-SCREEN-NOTES.md), and `.agents/rules/feature-<domain>.md`. Do not restate them here.

## Claude Cloud-Session Browser & Visual QA Notes
- **Checks**: `npm run lint`, `npm test` (register new `*.spec.ts` files in `package.json`), `npm run build`, browser verification per `CLAUDE.md` §5 step 5 & R01 §8, `node scripts/l10n-approval-check.mjs`. `npm run test:visual` is a reference pixel-diff only (`tests/visual/screens.ts`), not the pass criterion.
- **Headless cloud Visual QA (no Chrome / no Docker)**:
  - `node tests/visual/seed-local.mjs` calls `docker exec edubranch_postgres psql …` and reads `backend/.env`: provide a temporary `docker` shim on `PATH` forwarding to `psql -h localhost` and a temporary `backend/.env` with `POSTGRES_USER`/`POSTGRES_DB`. (Material uploads fail without MinIO; AI generation needs an AI provider key.)
  - Run visual Playwright specs via a temporary uncommitted override setting `channel: undefined` and `launchOptions: { executablePath: "/opt/pw-browsers/chromium" }`, then `npx playwright test -c <override> -g "<frame codes>"`.
  - Report Linux Chromium font rendering differences explicitly; delete temporary shims, overrides, `backend/.env`, and `.env.visual.local` immediately afterwards.
