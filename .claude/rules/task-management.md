# Task management (Jira project EBA)

- Jira site `hoangnam2005.atlassian.net`, project `EBA`, board 67, sprints "Sprint 1 - Foundation" … "Sprint 4 - Learning & Review". Workflow: To Do → In Progress → review → Done.
- Three identifiers exist; never mix them up:
  - **Jira key** (`EBA-89`): the live issue.
  - **Group ID** (`FE-026`): in the issue summary `[FE-026] …`, in commit messages and specs.
  - **Master Task ID** (`EBA-101`…`EBA-435`): the planning ID in `docs/01_MASTER-TASKS.md` for the 84 baseline tasks. It is not a Jira key, and the same strings are real Jira keys for other issues (Jira `EBA-105` is QA-023, Master `EBA-105` is BE-001). Always write "Master Task ID EBA-105" or "Jira EBA-5" explicitly.
  - Mapping and live status snapshot: `docs/04_JIRA/JIRA-KEY-MAP.md`.
- Source of the current state is Jira itself; repo docs carry the baseline and the requirement text. Read the issue before acting on it.
- Allowed edits (policy §11): description, AC, technical notes, links, labels, comments with evidence. Status: `review` when the PR opens; `Done` only after QG7 with evidence. Never close, delete or re-scope an issue, change its assignee, reporter or sprint without a PO decision.
- Comments only when they add value for the team (progress with evidence, blocker, next step, dependency), in Vietnamese, in the team's normal tone. Never "AI updated this task"; never write as if a member did work they did not do.
- Classification used in audits: CURRENT, OUTDATED, INCOMPLETE, DUPLICATE, BLOCKED, READY, IN PROGRESS, DONE (with evidence), NEEDS PO DECISION.
