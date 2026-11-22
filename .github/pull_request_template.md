<!-- Title: <type>(<scope>): <description> [<TASK-ID>]   e.g. feat(course): enrollment by invite code [BE-029] -->

## Summary
<!-- What changes and why, in 2–5 lines. Who is affected (Lecturer / Student / Admin)? -->

## Task and spec
- Jira: <!-- EBA-nn (Group ID, e.g. FE-026) — the Jira key, not the Master Task ID -->
- Spec: <!-- specs/NNN-<name>/ (spec.md, tasks.md, record.md) or "not needed: <reason>" -->
- Figma frames (UI): <!-- code + node id, e.g. 02.1 483:9637 -->

## Scope
- In scope: <!-- files / modules -->
- Out of scope (unchanged): <!-- API contracts, schema, behaviour that must not change -->

## Type
- [ ] feat  - [ ] fix  - [ ] refactor  - [ ] docs  - [ ] test  - [ ] chore  - [ ] ci

## Test evidence (commands and exit codes, on this branch's HEAD)
<!-- Paste each command with its exit code and result. Report skipped/BLOCKED suites as such, never as passed. -->
| Tier | Command | Exit | Result |
|---|---|---|---|
| backend | `npm run build && npm test && npm run test:e2e` | | |
| ai-service | `pytest` | | |
| frontend | `npm run lint && npm test && npm run build` | | |
| l10n | `node scripts/l10n-approval-check.mjs` | | |

## Visual QA (UI changes)
<!-- Figma frame vs running app at 1440px: comparison image, mismatch %, DOM measurements; all states checked (loading, empty, error, 403, success). -->

## Known limitations / follow-ups
<!-- Open decisions, BLOCKED items with their blocker, data gaps (never fake data). -->

## Checklist
### Product and architecture
- [ ] Frontend calls only the backend gateway; the AI service stays internal
- [ ] Students never reach a non-PUBLISHED case (checked in SQL); student listings show joined courses only
- [ ] Branching Study stays experience-first; consequences only in Journey Review
- [ ] AI Challenge Support: max 2 rounds, counter-questions only, never grades
- [ ] Retrieved material wrapped in `<sources>` (AI changes)
- [ ] Ownership checked for every ID taken from the request
### Code and process
- [ ] Branch from fresh `develop`, named `feature/<feature>` / `fix/<name>` / `docs/<topic>` (no task ID in the name)
- [ ] Commits follow `<type>(<scope>): <description> [<TASK-ID>]`; git identity configured
- [ ] No secrets, `.env` or personal data; no debug logging
- [ ] UI strings through i18n (vi + en), English copy registered as PROPOSED
- [ ] No hard-coded/fake data; Design System components and tokens reused
- [ ] New migration file (existing migrations untouched) and `docs/database/DATA-MODEL.md` updated if the schema changed
- [ ] API contract in `specs/*/contracts/` updated if endpoints changed
