# Project Audit — 2026-11-21

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Point-in-Time Repository Audit, `develop` `6f903f2`)

> **Status**: Audit record (point in time). **Author**: Claude (PO order in chat 2026-11-20: project-wide upgrade; UI "preserve and elevate"). **Baseline**: `develop` `6f903f2`. Labels: FACT (verified), INFERENCE, PROPOSAL, UNKNOWN; statuses per policy §8.
> Live task status: Jira and `docs/04_JIRA/JIRA-KEY-MAP.md`. Design: `docs/design/audit/UI-AUDIT.md`, `docs/design/DESIGN-DIRECTION.md`. Team: `docs/team/TEAM-CAPABILITY-MATRIX.md`.

## 1. Verified technical baseline (`develop` `6f903f2`)
| Check | Command | Exit | Result |
|---|---|---|---|
| Backend build | `npm run build` | 0 | — |
| Backend unit | `npm test -- --runInBand` | 0 | 30 suites, 300/300 |
| Backend e2e (local Postgres 16 + pgvector, Redis) | `npm run test:e2e -- --runInBand` | 0 | 148 pass, 33 skipped (live suites) |
| AI service (Python 3.12) | `pytest` | 1 | 153 pass, 1 fail (stale patch target, see F-07), 11 skipped |
| Frontend lint / unit / build | `npm run lint`, `npm test`, `npm run build` | 0 / 0 / 0 | 169/169 |
| l10n checker (dev) | `node scripts/l10n-approval-check.mjs` | 1 | 1585 en keys, 191 registered, 1424 errors (UNREGISTERED) |
| Visual QA public frames | `npm run test:visual` | 1 | 00.3 35.36%, 00.4 35.78%, 10.1 35.99% vs budgets 1.1–1.7% |

## 2. Findings
| ID | Finding | Type | Action taken | Status |
|---|---|---|---|---|
| F-01 | GDS §0 (source map, token approval) is cited by AGENTS.md, CLAUDE.md, rules, workflow, constitution but did not exist on any branch | doc gap | Added GDS §0 as PROPOSED register (facts and pointers only) | needs PO approval |
| F-02 | Master Task IDs (`EBA-101…435`) collide with real Jira keys (`EBA-1…106`) | traceability | `docs/04_JIRA/JIRA-KEY-MAP.md`; banner in `01_MASTER-TASKS.md`; rule in `.claude/rules/task-management.md` | fixed (docs) |
| F-03 | Repo backlog describes 84 tasks; Jira has 105 (21 added: FE-023…032, BE-029…034, QA-020…024) | doc drift | Listed in key map; `02/03/06` files not rewritten (status/AC changes there are proposed as diffs, workflow §4) | open — PO decides whether to extend the baseline files |
| F-04 | Jira EBA-5/6/7/10/11 summaries shifted one row from their descriptions/AC | Jira | Summaries corrected in Jira | fixed |
| F-05 | BE-025/026/028 merged (PR #76) but Jira In Progress; BE-027 (PR #65) and BE-029 (PR #62) merged but Jira To Do | Jira | QG7 run at merge SHAs; EBA-72/73/75 → Done, EBA-74/97 → review, with evidence comments | fixed |
| F-06 | Admin Dashboard renders placeholder data and non-i18n strings when the API is missing (FE-031, Jira Done) | defect | Jira EBA-95 comment with file/line | open — fix after PO review |
| F-07 | `ai-service/tests/test_retrieval_boundary.py::test_ac3…` patches `app.generation.service.get_provider`, removed by BE-015 | test defect | Jira EBA-30 comment | open |
| F-08 | Auth screens fail their accepted Visual QA budgets by ~35% on Linux Chromium | UI | Jira EBA-87 comment | open — re-measure on Windows |
| F-09 | l10n registry broken after locales were consolidated into `vi.json`/`en.json` (`b4854d1`): 1424 UNREGISTERED keys; registry rows keyed by old feature files are STALE | process | CLAUDE.md/frontend rule now describe the real structure | open — generate PROPOSED rows for base `en.json` in `docs/l10n/shared-copy-review.md` (agent may draft, never approve) |
| F-10 | CLAUDE.md said locale files are per feature, e2e rootDir is `backend/`, Roboto text rendering — all outdated | doc | CLAUDE.md rewritten | fixed |
| F-11 | README: Flyway, Vitest, branch pattern `feature/<module>-<name>` (contradicts FND §7.2) | doc | README corrected | fixed |
| F-12 | `DATA-MODEL.md` lists V1–V3 only and treats `infrastructure/postgres/migrations/` as a source (stale copy without V5) | doc | V4, V5, retired tables and the stale copy documented | fixed |
| F-13 | Workflow §5 said frontend CI never runs lint/tests; `frontend-ci.yml` has run both since `26755ef` | doc | Workflow CI facts and CI-PROP-1 corrected (factual lines only) | fixed |
| F-14 | `PROJECT_OVERVIEW.md` said "Implemented: strictly ZERO"; `HANDOVER_DIRECTIVE.md` described the 2026-10 state as current | doc | Status table replaced with evidence; handover marked SUPERSEDED | fixed |
| F-15 | PR template mentioned Flyway/Java, had no task ID, spec, test evidence or Visual QA section | process | `.github/pull_request_template.md` rewritten (PO order: standardize PR content) | fixed |
| F-16 | `backend/package.json` `start:prod` runs `node dist/main`, but `npm run build` emits `dist/src/main.js` (FACT, 2026-11-21: `tsconfig.json` has no `include`, so `test/` is compiled too). INFERENCE: the Dockerfile (`COPY . .`, `test/` not in `.dockerignore`, `CMD ["node","dist/main"]`) fails the same way | defect | — | open — Docker build not run (no Docker daemon); verify with `docker compose build backend` |
| F-17 | PR #59 (Đức Anh) carries BE-016…023 commits overlapping code already on `develop`; git identity `EMAIL_GITHUB_CUA_BAN` | process | Jira EBA-42 comment | NEEDS PO DECISION |
| F-18 | Theme toggle/dark theme on `develop` vs light-only GDS/R01 | design | PO, chat 2026-11-21: Light Mode baseline, toggle removed — recorded in GDS §0.5 U-01, CLAUDE.md §7, frontend rule | DECIDED — code removal pending (my earlier report wrongly re-opened this as a question) |
| F-19 | `.agents/skills/stitch-*`, `design-md`, `enhance-prompt` (Stitch, retired) are still installed for Antigravity | agent config | Listed as RETIRED in GDS §0.1 | open — PO decides removal |
| F-20 | Spec Kit scripts are PowerShell only (`init-options.json` `script: ps`); cloud/Linux sessions have no `pwsh` | process | CLAUDE.md §16 documents the manual fallback | open |
| F-21 | Commit/task ID hygiene in open PRs: `[BE-033]` on the FE-029 rubric UI, `[D-05]` on FE-027, Master IDs `[EBA-418]` on PR #59 | process | Listed in team matrix | open — fix in PR review |
| F-22 | Security fix PR #77 (reasoning reads limited to owner, consequences hidden mid-attempt) is open; `develop` still has the old behaviour | security | Independent review 2026-11-21 (§6): no blocking finding; all checks re-run PASS at `5b20fd6` | open — PO review/approval and merge |
| F-26 | Progress figures disagree by source: `5.Sprint_Backlog/SPRINT-BACKLOG.md` 8 Done / 34 of 336 SP (10.1%); `01_MASTER-TASKS.md` 10 Done / 44 SP (13.1%); Jira live 72 of 105 Done / 292 of 423 SP (69.0%). The backlog status column was last changed on 2026-10-21 (e.g. DES-003 TO DO, BE-014 IN PROGRESS, QA-003 TO DO there, while their PRs/frames exist and Jira is Done). Evidence-based estimate from `JIRA-KEY-MAP.md`: DONE + summary-only OUTDATED = 61 issues / 243 SP (57.4%); +8 tasks awaiting the PR #59 decision = 279 SP (66.0%). DONE here means code and tests on `develop`, not AC-by-AC verification. | process | PO direction 2026-11-21: three layers (scope baseline / Jira execution / evidence); split baseline 84 from added 21 — §7 | NEEDS PO DECISION: re-baseline or report added scope separately; refresh of baseline status columns (proposed as a diff) |
| F-27 | `.githooks/pre-commit`, `commit-msg`, `pre-push` are tracked with mode `100644`; on Linux/macOS git ignores them ("hook was ignored because it's not set as executable") even with `core.hooksPath .githooks`, so secret and commit-message checks do not run | process | Hooks run by hand for commit `824d6df` (both exit 0) | open — PO decides whether to commit the mode change (`git update-index --chmod=+x`) |
| F-23 | 10 Jira descriptions (EBA-86…90, 93…96, 106) still named the retired page label "Figma page 08" | Jira | Replaced by "Figma page `EduBranch AI – Screens`" (text only; AC unchanged) | fixed |
| F-24 | FE-031 (EBA-95) is Done although its own AC says "Dashboard lấy số liệu từ API BE-032, không giả lập dữ liệu"; BE-032 does not exist and the page shows placeholder data | Jira/defect | Comment on EBA-95 | NEEDS PO DECISION (reopen or follow-up task) |
| F-25 | FE tasks with open PRs (EBA-63, 64, 66, 89, 91, 93, 96) are In Progress; the workflow moves Jira to `review` when the PR opens | Jira | Left to the PR authors (not changed on their behalf) | open |

## 3. GitHub workflow audit
- Branches follow FND §7 except legacy `feature/EBA-105-auth-token-management` (merged, old). 56 remote branches; many merged feature branches remain (FND §7.2 item 4 keeps feature branches).
- `develop` and `main` are protected; `develop` ruleset: PR + 1 Code Owner approval; no required status checks (CI-PROP-4 open). Single Code Owner (CI-PROP-5 open; admin-merge per PR on PO order).
- CI: backend (build, unit, e2e without DB), ai-service (pytest+coverage), frontend (lint, unit, build); `ci.yml` on `main` only. No CI for docs/specs; no Visual QA or l10n check in CI.
- Conventions: `.githooks/commit-msg` enforces `<type>(<scope>): …`; checklists now in `.claude/rules/git-and-pr.md`.

## 4. Spec Kit audit
- Version 1.4.0, integrations `agy` (default) + `claude`, extension `bug` (agy only); constitution points to AGENTS/FND/workflow (no new principles) — consistent.
- Feature dirs on `develop`: `001-fe026-courses-materials`, `002-feedback-stats-api`. `003-reasoning-access` exists on open PR #77, so the next free number is `004`.
- Most merged features (BE-027, BE-029, FE-021, FE-028, FE-030, FE-031) have no spec directory; the workflow requires one for features (§1). Going forward: one bounded spec per feature task.

## 5. Decisions needed from the PO
1. Approve or change GDS §0 (PROPOSED register).
2. Review the UI trial (shell inset/header + profile) — merge path and whether to roll out to other screens (pilot only; no wide rollout).
3. PR #77, in order: (1) apply `spec003-sync-on-fix-reasoning-access.patch` on `fix/reasoning-access` @ `5b20fd6` only (3 files: `spec.md`, `record.md`, `checklists/requirements.md`); (2) `git diff --check`, push, CI must pass on the new head SHA (the `5b20fd6` runs do not count for it); (3) QG6 PO review/approval; (4) merge only on the PO's order; (5) QG7 on `develop`, then Jira EBA-71 Done. Residual risk 404/403 UUID existence disclosure is accepted under AC-R2 and recorded in spec 003 `record.md` §7.
4. EBA-95 (FE-031): reopen Done → In Progress (PO leaning, 2026-11-21) — waiting for the PO's confirmation before the transition.
5. PR #59: close or salvage.
6. Whether `01/02/03/06` backlog files should be extended with the 21 Jira-only tasks.
7. Removal of retired Stitch skills from `.agents/skills/`.
8. Commit/push of this package (withheld by the PO's instructions of 2026-11-20 and 2026-11-21).

## 6. Independent review — PR #77 `fix/reasoning-access` (head `5b20fd6`, base `develop` `55eb9ef`)
Reviewer: Claude (not the implementer of record for this review; the PR author account is HoangNam2464). Scope: `reasoning.controller.ts`, `reasoning.service.ts`, tests, `specs/003-reasoning-access/`.

Re-run on an isolated worktree at `5b20fd6`, fresh database (Postgres 16 + pgvector, Redis):
| Command | Exit | Result |
|---|---|---|
| `npm run build` | 0 | — |
| `npm test -- --runInBand` | 0 | 314/314 |
| `npm run test:e2e -- --runInBand` | 0 | 162 pass, 43 skipped (live suites) |
| `npm run test:matrix` | 0 | 26/26 |
| `npm run test:regression` | 0 | 44/44 |
| `QA_LIVE=1 npx jest -c test/jest-e2e.json reasoning-access.live` | 0 | 10/10 |

Trace AC → code: AC-R1 `@Roles("STUDENT")` on both routes; AC-R2 `a.student_id = $2` inside the SQL, 404 for unknown id, 403 otherwise; AC-R3 `c.status = 'PUBLISHED'` in the SQL; AC-R4 `CASE WHEN a.is_completed THEN o.consequence ELSE NULL END`; AC-R5 `ParseUUIDPipe`. Frontend does not call these routes (checked), so no UI regression.

| # | Severity | Finding |
|---|---|---|
| R1 | Low | 404 (unknown id) vs 403 (someone else's id) lets a caller test whether a UUID exists. Approved by AC-R2 and consistent with `getAttempt`; random UUIDs make enumeration impractical. No change requested. |
| R2 | Info | `specs/003-reasoning-access/spec.md` header still said "Draft — chờ G1–G6 và G7" while `record.md` logs G0–G7 approved. Fixed in a local patch on `fix/reasoning-access` (header → Approved, AC tags → `[PO-ĐÃ-XÁC-NHẬN]`, record §7 with QG5 evidence); the patch is not committed or pushed — it needs the PR author to apply it. |
| R3 | Info (outside this PR) | `startAttempt` checks `PUBLISHED` but not enrollment. This matches FR-BS-01 ("any case in `PUBLISHED` status with `learning_mode = 'BRANCHING_STUDY'`"), FND §1 and OPD-001 → A ("Direct case links … also remain functional"); listings are enrollment-scoped. Not a defect; changing it either way needs a PO decision. |

QG5 (GitHub Actions "Backend CI" on head `5b20fd6`): run #175 (`push`) and run #176 (`pull_request`) both `success`; steps Build, Unit Tests, HTTP Security E2E Tests success (CI has no Postgres, so live and migration-integration suites skip there).

Verdict: no Critical/High/Medium finding; QG2 re-run PASS; QG5 PASS. Claude never approves PRs (policy §11); PO/Code Owner approval and merge remain with the PO. After merge: QG7 on `develop`, then Jira EBA-71 (BE-024).

## 7. Progress reconciliation — baseline vs added scope (2026-11-21)

Three layers, kept apart (PO, chat 2026-11-21): committed scope = Proposal + baseline `01_MASTER-TASKS.md` (84 tasks / 336 SP); execution status = Jira; acceptance evidence = GitHub, tests, Figma, demo, QA reports. Classification from `docs/04_JIRA/JIRA-KEY-MAP.md` ("DONE" = code and tests on `develop`, not AC-by-AC acceptance).

| Layer | Baseline 84 tasks / 336 SP | Added 21 tasks / 87 SP |
|---|---|---|
| Jira Done | 66 tasks / 264 SP (78.6%) | 6 tasks / 28 SP (32.2%) |
| Evidence on `develop` (DONE + summary-only OUTDATED) | 58 tasks / 228 SP (67.9%) | 3 tasks / 15 SP (17.2%) |
| Waiting on the PR #59 decision (not counted as integrated) | 8 tasks / 36 SP | — |
| Jira Done with a recorded defect (INCOMPLETE) | — | 3 tasks / 13 SP (FE-024, FE-030, FE-031) |
| Not done (In Progress, review, To Do) | 18 tasks / 72 SP | 15 tasks / 59 SP |

Caveats: (1) QA-003…QA-006 are counted as DONE on merged test code (PR #40), but the PR body records open AC items at merge time: QA-003 AC-3 UI half not tested (defect in FE-003 upload modal); QA-004 AC-3 recorded defect (course delete → 500; later addressed by soft archive, PR #45, with an AC-3 test); QA-005 AC-1 BLOCKED (no embedding key at the time; PR #48 later moved to a live embedding model, re-verification not found); QA-006 real-LLM red team not run. Their acceptance is therefore PASS WITH CONDITIONS at best until each item is re-checked; the `docs/qa/QA-00x` reports themselves mark their scenarios PASS. (2) The "evidence" row is not AC-by-AC verification; the 50% evidence-backed implementation target needs that per-task check on the baseline 84 before it can be claimed. (3) The added 21 tasks have no Master Task ID and are not in `01/02/03/06`.

Origin of the 21 added tasks (all created in Jira on 2026-11-13 by the PO account "Nam Hoàng"):
| Tasks | Decision found | Source |
|---|---|---|
| FE-023, FE-024, FE-025, FE-026, QA-020 | Figma redesign "visual language v2" (PO 2026-11-12) | GDS header banner |
| FE-024 (social buttons), BE-034, QA-023 | PSD-09: Google and Microsoft sign-in in MVP (PO 2026-11-12) | `docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md` |
| FE-027, BE-030 | PSD-05 / D-05: lecturer dashboard in MVP (PO 2026-11-12) | same file |
| FE-028, BE-029, QA-021 (enrollment part) | PSD-01 / OPD-001 → A (PO 2026-11-12) | same file |
| FE-029, BE-033 | PSD-02 / OPD-011 → A: in-platform rubric (PO 2026-11-12) | same file |
| FE-031, FE-032, BE-032, QA-022 | PSD-04 / OPD-015 → B: Admin, 10 screens (PO 2026-11-12) | same file |
| FE-030, BE-031, QA-021 (profile part) | none found (Figma section 09 "Hồ sơ tài khoản" only) | UNKNOWN |
| QA-024 | none found | UNKNOWN |

Finding: the scope items behind 18 of the 21 tasks have recorded PO decisions; no record was found that the baseline itself was changed from 84 / 336 to 105 / 423. NEEDS PO DECISION: re-baseline (and add the tasks to `01/02/03/06` as a proposed diff), or keep them as a separately reported "added scope".
