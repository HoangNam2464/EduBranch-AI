# Jira Task Management Notes — Claude Code

Authoritative ID disambiguation (`Jira Key` vs `Group ID` vs `Master Task ID`) lives in **`.agents/rules/03-engineering-and-task-standards.md` §1** and [`docs/04_JIRA/JIRA-KEY-MAP.md`](../../docs/04_JIRA/JIRA-KEY-MAP.md). Do not duplicate it here.

- **Jira Instance**: `hoangnam2005.atlassian.net`, project `EBA`, board `67` (`To Do → In Progress → review → Done`). Read the live issue before acting.
- **Allowed Jira Edits (policy §11)**: description, AC, technical notes, links, labels, and Vietnamese team-tone evidence comments (never `"AI updated this task"` or false attribution). Transition to `review` on PR open and `Done` only after `QG7` verification with SHA/command evidence. Never delete, close, re-scope, or reassign an issue without PO approval.
- **Audit Status Tags**: `CURRENT`, `OUTDATED`, `INCOMPLETE`, `DUPLICATE`, `BLOCKED`, `READY`, `IN PROGRESS`, `DONE`, `NEEDS PO DECISION`.
