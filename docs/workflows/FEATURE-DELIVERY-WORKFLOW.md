# EduBranch-AI — Feature Delivery Workflow

> **Status**: Proposed — pending PO approval (PR #38) · **Role**: Normative once the PO approves it · **Owner**: not assigned · **Approver**: PO · **Version**: 0.5
> **Activation**: binding only after the PO approves this document (the PO changes this Status line; agents never do) and PR #38 is merged into develop. Until then it applies only to runs the PO starts explicitly, such as the FE-026 pilot.
> **Runs on**: GitHub Spec Kit **v1.4.0** (Specify CLI, installed in this repository): integrations `agy` (Antigravity, default) and `claude` (Claude Code), extension `bug`. PO decisions of 2026-11-15 (chat) applied: Spec Kit adopted, delegated commit/push/PR under Quality Gates, Antigravity handoff, local CI before push, retest on `develop` before Jira Done.
> **Read by**: the `edubranch-feature-workflow` skill (Claude Code and Antigravity). This file is the only copy of the procedure; Spec Kit skills carry the mechanics, this file carries the project rules.

## 1. Scope

Use for: a new feature or subfeature, a significant behaviour change, a security or ownership fix, a Figma-to-code screen task, or any work the PO wants traced from requirement to test. Bugs use §8.

Do not use for: typo or wording fixes, formatting, dependency bumps, small refactors with no behaviour change, or rule/doc edits the PO has already specified line by line.

One run covers **one bounded change**: a slice that can be reviewed on its own, with stated boundaries that must not change. Never write specs for the existing system as a whole. The Project Execution Plan stays the project-level governance and requirement source; a Spec Kit feature directory organises the execution of one task or slice and links back to it.

`AGENTS.md` applies at every stage, in particular rules 5–6 on open decisions.

## 2. Sources (read; never copy)

| Role | Source | Notes |
|---|---|---|
| Principles | `AGENTS.md`, FND (`.agents/rules/00-project-foundation.md`), approved PO decisions | `.specify/memory/constitution.md` only points here; Spec Kit's Constitution Check uses these sources. |
| Product requirement | Proposal V1.2 | Cite the section; ask if it is not in context. |
| Feature description | `docs/features/FEATURE-*.md`, `.agents/rules/feature-*.md` | Status Unknown: provisional (GDS §0.2). |
| Task and AC | Jira EBA issue, `docs/01_MASTER-TASKS.md`, `docs/03_TASK-DETAILS.md` | Parent task = Master Task ID + Group ID + Jira key. |
| QA | `docs/06_QA.md` | — |
| Design | GDS §0 source map, `docs/05_FIGMA.md`, R01, `docs/design/screens/P0`–`P4`, Figma | Status Unknown: provisional (GDS §0.2). Figma is evidence, not approval. Design values follow AGENTS.md rule 9. Read file key, page and frame IDs from Figma at Discover; never assume a page is current. |
| Open decisions | OPD (`docs/OPEN_PRODUCT_DECISIONS.md`, branch `feature/design-system`), PSD (`docs/mvp-scope/`) | Read only; on another branch read with `git show <branch>:<path>`, never guess a path. |

Verification levels (01_MASTER-TASKS §5): **T** acceptance criteria · **I** implementation · **V** verified evidence. One never implies another.

## 3. Change record = Spec Kit feature directory

Each run keeps one feature directory `specs/NNN-<short-name>/` (created by `/speckit-specify`, sequential numbering). Content is written in Vietnamese (D5) (artefact language; UI language: AGENTS.md rule 12); headings from the Spec Kit templates may stay in English.

| File | Written by | Holds (former change-record section) |
|---|---|---|
| `record.md` | main session | Discover, Approval (PO words verbatim with date), gate log, Quality Gate evidence |
| `spec.md` | `/speckit-specify`, `/speckit-clarify` | Spec; Clarify log (section `Clarifications`) |
| `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` | `/speckit-plan` | Plan |
| `checklists/*.md` | `/speckit-checklist` | Checklist |
| `tasks.md` | `/speckit-tasks`, `/speckit-converge` | Tasks; Converge findings appended as new tasks |

Every statement carries a source ID or one of the tags `[PO-ĐÃ-XÁC-NHẬN]` `[DỮ-KIỆN]` `[CHƯA-QUYẾT]` `[ĐỀ-XUẤT]`.

**Which feature is active.** Spec Kit resolves the feature directory from `SPECIFY_FEATURE_DIRECTORY` (explicit) or `.specify/feature.json` (per checkout, git-ignored, rewritten by `/speckit-specify`). Before any `/speckit-*` command after the first, check that `.specify/feature.json` names the directory of the current task; if not, set `SPECIFY_FEATURE_DIRECTORY=specs/NNN-<short-name>` for the session. Never run a command against another task's directory.

**Branches.** Spec Kit does not create branches here (the `git` extension is not installed and must not be: it creates numbered branches, which FND §7.2 forbids). Branch per FND §7 (`feature/<feature>`, `fix/<name>`, `docs/<topic>`), from a freshly pulled `develop`.

## 4. Stages and gates

| Stage | Spec Kit skill | Writes | Gate | Who passes it |
|---|---|---|---|---|
| 0 Discover | — (reads §2 sources) | `record.md` | G0: change and boundary confirmed | PO |
| 1 Specify | `/speckit-specify` | `spec.md` | G1: spec reviewed | PO (batchable) |
| 2 Clarify | `/speckit-clarify` | `spec.md` Clarifications | G2: no blocking question left, or deferred by the PO | PO (batchable) |
| 3 Plan | `/speckit-plan` | `plan.md` + design artefacts | G3: plan reviewed | PO (batchable) |
| 4 Checklist | `/speckit-checklist` | `checklists/` | G4: open items fixed or accepted | PO (batchable) |
| 5 Tasks | `/speckit-tasks` | `tasks.md` | G5: task list reviewed | PO (batchable) |
| 6 Analyze | `/speckit-analyze` | nothing | G6: no open Critical or High finding | PO (batchable) |
| 7 Approval | — | `record.md` Approval | G7: implementation scope approved | PO |
| 8 Implement | `/speckit-implement` | code, tests | G8: Quality Gates QG1–QG4 (§5) | Claude, delegated by the PO |
| 9 Converge | `/speckit-converge` | `tasks.md` | G9: no open converge gap, QG5–QG7 | Claude reports; PO via Code Owner approval |

Every PO gate ends a stage: present the output, stop, and wait; start the next stage only after the PO says so. `record.md` is created only after the PO approves starting the run (G0); until then, present Discover in chat. Asking for a run is not approval of its outputs.

The PO may batch consecutive gates from G1 to G6 in one approval, normally when handing a task package to Antigravity (§6). Record the batch in `record.md` and present every batched output at the closing gate. A batch stops early at any open decision, blocking question or Critical/High finding: present the outputs so far and wait. G0 and G7 are never batched. To resume in a new session, take the last passed gate from `record.md` or from the PO.

**Depth by complexity.** Specify → Plan → Tasks → Implement → Converge is always run. Clarify, Checklist and Analyze are required for UI screens, security/ownership changes, new API or DB changes, and any task over 3 SP; for smaller tasks the PO may approve the short path (§9).

### 0. Discover (read-only)
Record the branch and HEAD using only allowed tools inside the workspace. If they cannot be read, write UNKNOWN and ask the PO; never read files outside the workspace to find them, except paths the PO named. Identify the parent task (Master Task ID, Group ID, Jira key, Trạng thái nguồn), the feature doc and feature rule, the FND sections, the OPD/PSD/PO-n items that touch the change, the code and tests that touch it, and the current T/I/V of each related AC. For UI, list the routes, the Figma file key, page and node IDs read from Figma, and whether each frame is Ready for Dev.

### 1. Specify — `/speckit-specify <task description>`
Describe the intended change only: what and why, users and roles, the boundaries that must stay unchanged (existing API, data, behaviour), and acceptance criteria. Reuse existing AC by ID. A new or changed AC is `[ĐỀ-XUẤT]` until the PO approves it. No technology choices here. For a UI task the spec also lists: Figma page and frame IDs; screens and components; Design System tokens, typography, spacing and layout as requirements; the data each screen shows and the API that provides it (real data only; a gap is a finding, never fake data); default, loading, empty, error, 403 and success states and interactions; visual and behavioural AC; how each frame is checked in the browser against Figma.

### 2. Clarify — `/speckit-clarify`
List what is ambiguous or missing, at most 5 questions per round. Match each to an existing OPD, PSD or PO-n first; for anything open or unregistered, apply AGENTS.md rule 5. Record each PO answer verbatim with its date. Never write an assumed answer into the spec, plan or tasks.

### 3. Plan — `/speckit-plan`
Plan within current decisions: FND §3, `docs/architecture/`, the approved stack and the real source tree. Per tier (FE, API, BE, DB, AI), list the files to touch, the screens, Figma frames and reused or new components for FE (`src/components/ds`, `src/components/feedback` where they exist), API contract changes, DB changes (new migration in `backend/migrations/`), AI-service changes, the tests and risks. A new technology or boundary change needs an ADR and PO approval: stop and ask.

### 4. Checklist — `/speckit-checklist`
Check the quality of the requirements, not the code: complete, unambiguous, testable, traced to a source, consistent with FND, GDS and banners, and covering roles, ownership, states (default, loading, empty, error, 403, success), focus and labels, responsive scope, R01 §1 bans and UI copy fully in the selected language (Vietnamese default, English through the approved VI/EN switch, AGENTS.md rule 12), no mixing. The agent proposes each answer; only the PO or a named reviewer marks an item `[x]`. A checked item never means the work is implemented.

### 5. Tasks — `/speckit-tasks`
Break the plan into dependency-ordered tasks traced as parent task → subfeature → FE / API / BE / DB / AI / QA. Each task names its files, the AC it serves and the test that will prove it. Changes to `03_TASK-DETAILS.md` or `06_QA.md` are proposed as a diff, never applied silently.

### 6. Analyze — `/speckit-analyze` (read-only)
Cross-check spec, plan, tasks and sources. Report requirements without a task or test, tasks without a requirement (scope creep), conflicts with FND, GDS, banners or open OPDs, terminology drift, and files outside the plan. A conflict with AGENTS.md, FND or an approved PO decision is Critical; a conflict between those sources goes to the PO (AGENTS.md rule 5). Fix findings at their source stage and re-run Analyze.

### 7. Approval
Present the spec summary, the task list and the expected file list. The approval must name the scope; record it verbatim with its date in `record.md`. List each frame in scope that uses provisional or UNRESOLVED values; it is never Ready for Dev, and whether it may be built is the PO's decision. Commit, push and PR are then governed by §5, not by a further approval.

### 8. Implement — `/speckit-implement`
Do only the approved tasks, in order. Branch and commit as FND §7.2–§7.3 require. Run the planned tests and record each command and exit code. Stage files by explicit path. If the work needs anything outside the approved scope, stop and return to Clarify.

### 9. Converge — `/speckit-converge`
Compare requirement → plan → tasks → code → tests, and for UI each screen with its Figma node and P0–P4 states; give each approved AC its T/I/V. V needs the tests re-run by a verifier who did not write the code, on a stated commit or diff MD5. Per AC, list ID, T/I/V, file:line, test, command and result. Gaps are appended to `tasks.md` by `/speckit-converge`; tasks that widen the approved scope need PO approval before they are implemented. Repeat Implement → Converge until no gap is left. Report "Converged" only when every approved AC has an implementation and verified evidence. Status changes in `01_MASTER-TASKS.md` or `03_TASK-DETAILS.md` are proposed as a diff.

## 5. Quality Gates

A gate passes only with recorded evidence (command, exit code, SHA, result) in `record.md`. **BLOCKED** (missing provider, API key or environment) is never PASS: name what is missing.

| Gate | When | Check | Who | Automated by |
|---|---|---|---|---|
| QG1 Developer tests | before handing back | the CI commands below for every touched service, plus the integration/E2E tests in the plan, and dev-mode `node scripts/l10n-approval-check.mjs` | implementer (Antigravity) | — (run locally) |
| QG2 Independent review | before commit | diff only touches planned files; trace spec → tasks → code → tests; `/speckit-analyze` clean; QG1 re-run by the reviewer on the same SHA | Claude (never the implementer) | Spec Kit analyze/converge (agent-run) |
| QG3 Browser check (FE) | before commit | running app on the real backend and seed data: each frame against the Figma frame read in Discover (CLAUDE.md "Visual QA gate"), all states, no console errors, no fake data | Claude | `npm run test:visual` where the branch has it; rest manual |
| QG4 No open FAIL/BLOCKED | before commit | every mandatory AC PASS; any BLOCKED item reported to the PO; `node scripts/l10n-approval-check.mjs --release` exits 0 (all English keys in release scope APPROVED) | Claude | — |
| QG5 PR checks | after push | every GitHub Actions run on the PR is green (where triggered by path), plus a manual test of the PR head | Claude | GitHub Actions (path-filtered; no required status checks in develop ruleset today) |
| QG6 Merge | after QG5 | valid Code Owner/PO approval; merge by the approved method; no bypass | PO approves, Claude merges | `develop` ruleset: PR + 1 Code Owner approval |
| QG7 Post-merge | after merge | QG1 + QG3 re-run on `develop` at the merge SHA | Claude | — |

Translation approval is a content gate separate from the technical language-switch tests. All English copy in the release scope (every key across all `frontend/src/locales/*.en.json`, including base `en.json`, at release time) must be registered in a copy review registry: `specs/*/l10n-copy-review.md` for feature copy, or `docs/l10n/shared-copy-review.md` for shared namespaces (base `en.json`, `states.*`, `shell.*`). All registries follow Schema A: `| `<key>` | <vi> | <en> | <status> | <approved_by> | <approved_on> | <source> |` (`status` ∈ `PROPOSED`, `APPROVED`, `CHANGES_REQUESTED`). A row with status `APPROVED` strictly requires a non-empty, non-placeholder `approved_by` and a valid calendar date `approved_on` in `YYYY-MM-DD` format (violations report `APPROVAL_INCOMPLETE` error). For array values (e.g. i18next `returnObjects`), keys descend into arrays using numeric index segments (e.g. `g1.landing.how.steps.0`, `g1.landing.how.steps.0.title`); leaf nodes must be strings (numbers, booleans and null are flagged as errors). Implementers and agents draft copy only (status `PROPOSED`, approval cells `—`) and MUST NEVER mark copy APPROVED. English copy remains PROPOSED until the PO approves it in the registry; only the PO changes PROPOSED to APPROVED. Quality Gate QG1 includes running dev-mode `node scripts/l10n-approval-check.mjs`. Quality Gate QG4 runs `node scripts/l10n-approval-check.mjs --release` (exit code 0 strictly required) and fails while any English string in the release scope is PROPOSED, unregistered, or modified without re-approval, or if no English locale files exist in the scanned directory (`NO_EN_LOCALES`); until the check is wired into `npm test`/CI it is run locally and its output recorded in `record.md`. Regression test suite: `node --test scripts/l10n-approval-check.test.mjs`.

After QG1–QG4 pass, Claude commits, pushes the feature branch and opens the PR into `develop` without asking for each operation (PO decision 2026-11-15). Never: commit to `develop` or `main`, force push, include out-of-scope changes, bypass branch protection, change architecture or business rules. Jira (project EBA workflow: To Do → In Progress → review → Done) moves to `review` when the PR opens and to `Done` only after QG7 passes.

**CI commands (from `.github/workflows/`, run locally before push):**
- backend (`backend-ci.yml`): `npm ci && npm run build && npm test -- --runInBand && npm run test:e2e -- --runInBand` (Node 20)
- ai-service (`ai-service-ci.yml`): `pip install -r requirements.txt && pytest --cov=app --cov-report=xml -v` (Python 3.12; env `AI_SERVICE_API_KEY=ci-test-key AI_PROVIDER=gemini GEMINI_API_KEY=ci-fake-key-not-called-in-unit-tests POSTGRES_HOST=localhost POSTGRES_PORT=5432 POSTGRES_DB=edubranch_ai POSTGRES_USER=edubranch POSTGRES_PASSWORD=test`). `ci.yml` (main only) runs `pytest -v` without coverage.
- frontend (`frontend-ci.yml`): `npm ci && npm run build` (Node 20, `VITE_API_BASE_URL=http://localhost:8080/api`). `ci.yml` (main only) runs the same with `VITE_API_BASE_URL=http://localhost:8080/api/v1`.
- Added checks that no workflow runs yet: frontend `npm test` and `npm run lint`.
- Live tests need the docker stack (`docker compose up -d postgres redis minio ai-service backend`). Run backend e2e against a clean database, as CI does.

### CI coverage and proposals

#### 1. Definitions
- **Required checks**: Status checks that the GitHub branch protection ruleset explicitly blocks on before merging (none configured today in the `develop` ruleset).
- **GitHub checks**: Workflows triggered by GitHub Actions that ran on the PR (path-filtered by service).
- **Manual verification**: Quality gates verified independently by Claude with recorded evidence (`QG2` review, `QG3` browser/visual inspection, `QG7` post-merge retest).
- **Code Owner approval**: Quality gate `QG6` approval by a `.github/CODEOWNERS` member other than the PR author.

#### 2. Current CI Coverage Matrix

| Check | Where it runs today | Gap / Risk |
|---|---|---|
| Backend build & unit/e2e tests | Non-required GitHub check (`backend-ci.yml` on `backend/**`) | Integration tests (`migration.integration.e2e-spec.ts`) skip because CI has no Postgres/MinIO `services:`. Ruleset does not require check. |
| AI service pytest & coverage | Non-required GitHub check (`ai-service-ci.yml` on `ai-service/**`) | Live tests (`test_live_flow1.py`, `test_*_live.py`) skip because CI lacks live database/MinIO services. Ruleset does not require check. |
| Frontend build (`npm run build`) | Non-required GitHub check (`frontend-ci.yml` on `frontend/**`) | `npm test` and `npm run lint` (`oxlint`) have NEVER run in CI. Ruleset does not require check. |
| Frontend tests & lint | Local only (`npm test`, `npm run lint`) | Not automated on PRs; relies entirely on local execution in QG1. |
| Integration CI Gate | Main branch only (`ci.yml` on push/PR to `main`) | Does not run on PRs to `develop`; runs after features have already merged. |
| Documentation & Specs validation | Local only / manual | Branches `docs/**` and paths `docs/**`, `specs/**`, `.specify/**`, `AGENTS.md` trigger zero workflows; PRs are check-less (`gh pr checks 38` reports no checks). |
| Code Owner approval gate | Manual / GitHub PR review | `CODEOWNERS` specifies `* @HoangNam2464` (single owner). When a PR is opened from that same account, GitHub cannot count self-approval; requires a second code owner or a recorded PO merge procedure. |

#### 3. Proposed CI Changes `[ĐỀ-XUẤT]`
Each proposed change requires PO approval; modifying repository rulesets, workflows, or CODEOWNERS is strictly a PO action:

| Proposal ID | Proposed Action | Objective & Rationale | Action Owner |
|---|---|---|---|
| `CI-PROP-1` | Add `npm run lint` and `npm test` to `frontend-ci.yml` | Ensure frontend unit tests and oxlint run on every frontend PR, preventing test regressions. | PO approval / PO action |
| `CI-PROP-2` | Add Postgres 16 + pgvector (and MinIO where needed) `services:` container blocks to `backend-ci.yml` and `ai-service-ci.yml` | Allow backend migration integration tests and AI service live retrieval tests to execute in CI instead of silently skipping. | PO approval / PO action |
| `CI-PROP-3` | Add a docs/specs verification workflow for `AGENTS.md`, `CLAUDE.md`, `docs/**`, `specs/**`, `.specify/**` | Automatically validate that no machine paths exist, cited repository paths exist (`git ls-files`), and `specify integration status` passes, ensuring docs PRs are not check-less. | PO approval / PO action |
| `CI-PROP-4` | Configure workflow job names as Required checks in the `develop` branch protection ruleset | Prevent merging PRs when CI workflows fail or are bypassed. | PO action |
| `CI-PROP-5` | Add a second Code Owner to `.github/CODEOWNERS` or formalize the PO merge procedure | Enable legitimate Code Owner approvals when PRs are opened by the primary account holder. | PO approval / PO action |

## 6. Roles and Antigravity handoff

| Role | Does | Never |
|---|---|---|
| PO | G0, G7, batched G1–G6, Code Owner approval, opens Antigravity on a task package | — |
| Claude (main session) | Discover, writes the task package, QG2–QG7, commit/push/PR/merge per §5, Jira transitions | edits files in Antigravity's scope while it runs; claims Antigravity ran without a real run (a Result counts only with its run evidence: conversation ID or CLI log, times, commands and exit codes) |
| Antigravity | runs `/speckit-*` stages it is given, codes, runs QG1, writes its result into the handoff file | approves anything, commits, pushes, edits files outside the package |

**Handoff file**: `.agent-handoff/<TASK-ID>.md` at the root of the main checkout (PO decision 2026-11-15) (main checkout; excluded through `.git/info/exclude`, never committed, project `.gitignore` unchanged). Sections, in order:
1. **Package** (Claude): task, Jira key, gates already passed, workspace path, branch, HEAD SHA, files in scope, Spec Kit commands to run in order, stop conditions, required evidence.
2. **Result** (Antigravity): per round, start and end time, the commands it ran with exit codes, files changed, open questions, `STOPPED: <reason>` if it stopped.
3. **Review** (Claude): per round, findings with file:line and the fix requests for the next round.

Both agents work in the same workspace, branch and SHA named in the Package. Only one agent edits at a time: Claude edits nothing in scope between handing over and reading a new Result. If the workspace cannot be shared or Antigravity cannot be run, Claude says so and falls back to the PO pasting the Package manually.

**Headless dispatch (default).** Claude runs Antigravity itself with the CLI (`agy` ≥ 1.0; checked with 1.5.0), from the workspace root, one Spec Kit stage per run, the prompt starting with the stage's slash command:
`agy --print "/speckit-<stage> … Follow <handoff file> section …" --add-dir <workspace> --add-dir <handoff dir> --settings <allowlist.json> --output-format json --print-timeout 2400s`
- Permissions: default Auto mode; never `--dangerously-skip-permissions` or `SPECKIT_AGY_ALLOW_ALL_TOOLS`. Tools a headless run cannot ask for are denied and listed in `denied_actions`; grant only what the stage needs through a session-only `--settings` allowlist, e.g. read-only Figma MCP tools `mcp(figma_figma/get_metadata)`, `get_screenshot`, `get_design_context`, `get_variable_defs`, `whoami`, `create_session`. Never add the main checkout (it holds the PO's uncommitted work) as a workspace directory; give Antigravity a read-only snapshot in the handoff directory instead.
- Windows sandbox: Antigravity's terminal cannot write to the workspace, so Spec Kit scripts that write files (`create-new-feature.ps1`, `setup-plan.ps1`) fail there. Claude runs them before the stage (with `SPECIFY_FEATURE_DIRECTORY` set); Antigravity writes files with its file-editing tool.
- A run counts only with `status: SUCCESS`, no `denied_actions`, and a Result entry for that run; a network or model error after the work is written is reviewed, not assumed. Keep every run's JSON and the conversation ID; the transcript is under `~/.gemini/antigravity-cli/brain/<conversation-id>/`.
- Clarify needs the PO: a headless run only lists the questions; Claude asks the PO and passes the answers verbatim in the next round.
- Claude Code runs its own skills headless the same way: `claude -p "/speckit-<stage> …" --allowedTools <scoped list>`.

## 7. Sub-agents

The main session orchestrates and owns every gate. It may hand a stage's work to sub-agents: explorer (Discover, Analyze; read-only), implementer (Implement; approved files only), verifier (re-runs tests for Converge; never the implementer). Each brief names the stage, the input paths, the allowed tools and files, the expected output and the stop conditions. Two agents never edit the same file. A sub-agent never approves anything or asks the PO: it stops with `STOPPED: <reason>`. The main session checks each result before presenting it at a gate.

## 8. Bug path

For a defect in existing behaviour, use the Spec Kit bug extension instead of a feature directory: `/speckit-bug-assess <report>` → `/speckit-bug-fix` → `/speckit-bug-test`; reports are kept in `.specify/bugs/<slug>/` (`assessment.md`, `fix.md`, `test.md`). A fix that changes an approved behaviour, an API, the DB schema or a permission is not a small bug: run §4. Quality Gates QG1–QG7 apply to bug fixes too. The bug extension is registered for the default integration (`agy`) only: the `/speckit-bug-*` skills run in Antigravity; Claude cannot invoke them and reviews their reports.

## 9. Short path

For a small bounded change the PO may approve the short path: Discover → Specify → Plan → Tasks → Approval → Implement → Converge. Record the PO's approval of the short path in `record.md`. Never skip Clarify, Checklist or Analyze without it.

## 10. Spec Kit maintenance

- Version is pinned: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v1.4.0`. Upgrade only with PO approval: `specify integration upgrade agy`, then `specify integration upgrade claude --force`, in a branch, and review the diff.
- `specify integration status` shows installed integrations, the default and modified managed files. It reports `ERROR unsafe-multi-install` by design: `agy` is not declared multi-install safe, and `claude` was added with `--force` (PO decision to use both agents). The two write to separate skill directories; any other finding is a real error.
- Skills: `.agents/skills/speckit-*/` (Antigravity: 9 core + 3 bug) and `.claude/skills/speckit-*/` (Claude Code: 9 core). `.agents/skills/` and `.claude/` are git-ignored by the project (`.gitignore` §8), so every tracked file under them (Spec Kit skills, `.agents/skills/edubranch-feature-workflow/`, `.claude/agents/`, `.claude/rules/`) is added with `git add -f -- <path>`; a new file there stays untracked unless force-added.

## 11. Never

- Re-run `specify init`, replace `.specify/memory/constitution.md` with new principles, or install the `git` extension or community extensions and skills the PO did not approve.
- Set `SPECKIT_AGY_ALLOW_ALL_TOOLS` or pass `--dangerously-skip-permissions` without PO approval.
- Turn an `[ĐỀ-XUẤT]` into a requirement, or treat existing code as an approved requirement.
- Change the branch or commit convention, or create per-task branches.
- Treat a checked checklist item, a passing build or existing code as proof that an AC is met.
- Add tasks or expand scope during Implement or Converge without PO approval.
