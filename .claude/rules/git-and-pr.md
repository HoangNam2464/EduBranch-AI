# Git, commit and pull request checklist

Sources: FND §7 (branches, commits), workflow §5 (Quality Gates, CI commands), policy §7 and §11 (limits). This file is the working checklist; when it disagrees with those sources, they win.

## Before starting a task
1. `git status`, current branch, `git rev-parse HEAD`; list uncommitted and untracked files. Files the task did not create are protected (policy §7): never stage, overwrite, stash-drop or reset them.
2. `git fetch origin develop` and compare (`git log --oneline HEAD..origin/develop`); start new work from a freshly pulled `develop`.
3. Identify the Jira key, Group ID (e.g. `FE-026`) and Spec Kit directory (`specs/NNN-*`) of the task; read the latest Jira state, not an old report.
4. Branch: reuse the feature branch if it exists (`feature/<feature>`, backend `feature/<feature>-backend`, AI service shares it, `fix/<name>`, `docs/<topic>`); never a task ID in the name, never numbered Spec Kit branches.
5. Check open PRs that touch the same files (`mcp__github__list_pull_requests`) to avoid conflicting with another member's work.

## While coding
- Stay inside the task scope and its planned files; report out-of-scope defects instead of fixing them (policy §2).
- Group changes into logical commits; one concern per commit; no unrelated reformatting.
- After each group of changes run the tier's checks (lint, typecheck/build, related tests).

## Before committing (all mandatory; record results)
1. `git diff` and `git diff --check` (no whitespace errors, no conflict markers).
2. Remove files that do not belong (logs, screenshots outside the evidence paths, `.env`, local configs). `.githooks/pre-commit` must be active: `git config core.hooksPath .githooks`.
3. Scan for secrets and personal data in the diff.
4. Lint (`frontend: npm run lint`; backend has no working linter).
5. Typecheck/build of every touched tier (`npm run build`).
6. Relevant tests, including negative and ownership cases (commands in `CLAUDE.md` "Commands"), and `node scripts/l10n-approval-check.mjs` for any locale change.
7. Browser check for UI changes (`CLAUDE.md` §5 step 5, R01 §8).
8. Re-read the acceptance criteria and the spec; every AC has evidence or a stated status (policy §8).
9. Stage by explicit path (`git add -- <path>`); force-add tracked files under `.claude/` and `.agents/skills/` (`git add -f -- <path>`, workflow §10).

Commit only when the PO's current instruction allows it. Default (PO 2026-11-15/17): after QG1–QG4 Claude commits, pushes the feature branch and opens the PR. A chat instruction that withholds commit or push for a package overrides that default for the package.

## Commit message
`<type>(<scope>): <imperative description> [<TASK-ID>]` — types `feat fix docs style refactor test chore ci`; scopes `backend ai-service frontend infra docs design qa` or a domain (`auth course case material branching-attempt reasoning challenge-support review-study lecturer-feedback statistics`). Task ID = Group ID (`[FE-026]`), several allowed (`[BE-025][BE-026]`). Body: why, what changed, evidence summary, PO decision IDs. Shared docs/config work without a task may omit the ID. Examples: `feat(course): enrollment by invite code [BE-029]`, `test(backend): role-matrix e2e for feedback API [BE-026]`, `docs(rules): restructure CLAUDE.md`.

## Pull request
- Into `develop` only (`develop` → `main` is the PO's). Title = first commit style with task IDs.
- Body follows `.github/pull_request_template.md`: summary, task/Jira links, spec reference, scope and files, test evidence (commands + exit codes), Visual QA images for UI, l10n check, known limitations, checklist.
- After opening: Jira to `review`; watch CI (QG5); answer review comments; never self-approve.
- QG5 evidence is bound to a head SHA: record the run links and the SHA. Any new commit on the PR (code or docs, including a record/spec status update) makes a new head; CI must pass again on that SHA before QG6, and evidence from an older SHA never stands in for it.

## After merge
1. Confirm the merge commit on `develop` (`git fetch origin develop`, `git log -1 origin/develop`).
2. QG7: re-run QG1 (and QG3 for UI) on `develop` at the merge SHA; check for regressions in neighbouring features.
3. Only then move Jira to Done, with the evidence (SHA, commands, results).
4. Delete the remote branch only when it is not a long-lived feature branch (FND §7.2 item 4 keeps feature branches for related work).

## Never
Commit to `develop`/`main`; force push; rewrite published history; bypass branch protection or CI (admin-merge only per PR on the PO's direct chat order); merge without QG5–QG6; `git add .`/`-A`; `--no-verify`.
