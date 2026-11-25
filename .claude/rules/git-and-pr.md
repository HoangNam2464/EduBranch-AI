# Git, Commit & Pull Request Checklist — Claude Code

Authoritative rules: **FND §7**, [`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`](../../docs/workflows/FEATURE-DELIVERY-WORKFLOW.md) §5, **policy §7 & §11**, and **`.agents/rules/03-engineering-and-task-standards.md` §6**.

## Before Starting a Task
1. Inspect `git status`, active branch, `git rev-parse HEAD`; preserve any unrelated uncommitted/untracked files (policy §7).
2. Check `git fetch origin develop && git log --oneline HEAD..origin/develop`; branch from fresh `develop` reusing `feature/<domain>` (`-backend` for backend/AI), `fix/<name>`, or `docs/<topic>` — never task IDs or numbered Spec Kit branches.
3. Confirm Jira key, Group ID, and active `specs/NNN-*` directory; check open PRs via `mcp__github__list_pull_requests` to avoid file collisions.

## Before Committing & Opening a PR
- Stay inside task scope; stage explicitly (`git add -- <path>`, `git add -f -- <path>` only for tracked files under gitignored `.claude/` or `.agents/skills/`).
- Verify `git diff --check`, secret hygiene (`.githooks/pre-commit`), build/lint/tests (including negative & ownership cases), R01 §8 browser checks for UI, `node scripts/l10n-approval-check.mjs` for locale edits, and AC evidence completeness.
- Commit/push only when authorized by the current PO instruction. Open PRs into `develop` using `.github/pull_request_template.md`, move Jira to `review`, record exact head SHA for `QG5` CI (any later commit invalidates prior `QG5`), and never self-approve or admin-merge without direct PO chat order naming the PR(s).
- After merge: verify merge commit on `origin/develop`, run `QG7` re-checks at merge SHA, then transition Jira to `Done` with evidence.
