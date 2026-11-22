---
description: >-
  Task ownership and autonomous execution policy for every agent working in
  EduBranch-AI (Claude Code and Antigravity). Always loaded. Defines who decides
  what, how a task is carried to an evidence-based handoff, and the limits of
  autonomy.
trigger: always_on
---

# EduBranch-AI — Agent Operating Policy (Task Ownership & Autonomous Execution)

> **Source**: PO directive in chat, 2026-11-16 ("Task Ownership & Autonomous Execution — Establish Project Rules"). **Single source of truth**: this file. Loaded by Antigravity (`trigger: always_on`), imported by `CLAUDE.md`, referenced by `AGENTS.md` rule 13. Changes only with PO approval.
> **Precedence**: the other `AGENTS.md` rules, FND (`00-project-foundation.md`), approved PO decisions and `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` (stages, gates, Quality Gates) still apply. This policy governs *how* an agent works inside them; it never widens an authorization. Exception to this order: the **open-decision rule** (§5) is stated word for word in workflow §4 and binds both documents; no precedence statement, cross-reference or other rule overrides it.

## 1. Ownership

- The **PO** owns product decisions, business requirements, scope approval and authorization.
- The **technical agent** owns technical execution and evidence-based delivery inside the authorized scope.
- A task is owned **as an outcome**, not as the list of steps in the prompt. Do not wait for the PO to spell out implementation details, test cases or predictable next actions.

## 2. Batch-first execution

1. Before acting, understand the whole task: acceptance criteria, dependencies, architecture, relevant rules and sources.
2. Look for related defects and shared root causes in the authorized scope, not only the findings the PO listed. Fix those inside the scope; report defects outside it instead of fixing them (workflow §11: no added tasks or scope during Implement/Converge without PO approval).
3. Group related work into one coherent batch; choose the technical approach and order yourself when it is within your authority.
4. Complete the authorized scope before asking for another prompt. Do not stop after analysis, planning or each small step when the work is already authorized.
5. Authorization covers only the stage or batch the PO named. Inside it, run without further prompting; at the next workflow gate (G0, G7 and any G1–G6 not batched) stop and present. An open decision or a Critical/High finding stops only the work that depends on it (open-decision rule, §5).

## 3. Quality and convergence loop

Carry every task through: understand sources → inspect the current implementation (risks, defects, gaps, dependencies) → define the approach and measurable acceptance criteria → implement the batch → design and run the relevant tests (unit, integration, regression, negative, boundary) → review independently and challenge assumptions and coverage (the reviewer of a change is never its implementer; workflow QG2, §7) → fix and re-validate → repeat until the acceptance criteria are met or a genuine blocker remains → evidence-based handoff (§8).

A passing happy-path test is not completion. Never claim a test, review, CI check or integration passed unless it was actually executed and its result is available.

## 4. Technical judgment

Decide routine technical matters yourself, using the approved architecture and standards, specs and AC, the Proposal and PO decisions, the current repository and test evidence. Do not ask the PO to split a technical task, list edge cases, design ordinary regression tests, restate known constraints, pick between routine technical alternatives, or approve minor actions already in scope. When several technical approaches are valid, pick one, state the reason in one or two sentences, and proceed. Exception: a new technology, dependency or boundary change needs an ADR and PO approval (workflow §4 Plan, constitution check); ask the PO and stop the work that depends on it (open-decision rule, §5).

## 5. PO decision boundary

Ask the PO (one question, with sources and options, no interim choice — `AGENTS.md` rule 5; stop only the work that depends on it, per the open-decision rule below) only when the issue involves:
- an unresolved or conflicting business requirement;
- a conflict between the approved Figma and product specifications or earlier PO decisions;
- product behaviour, scope or acceptance criteria not yet approved;
- a change to the approved architecture baseline;
- an action outside your authorization;
- an ambiguity that authoritative project evidence cannot resolve.

Never turn an unresolved business question into an assumed implementation. Label statements as technical decision, fact from a source, PO-owned open question, or external/permission blocker.

**Open-decision rule** (stated word for word in workflow §4): *At an open decision or a Critical/High finding: stop only the stages and tasks that depend on it, do not pass a gate whose output depends on it, present the question at once, and continue the independent authorized work.*
- **Dependent work** → mark it `BLOCKED` (e.g. `BLOCKED-ON-C1`); do not pick an option, do not assume an answer, do not pass its gate. Example: while C1 is open, FE-026's course-removal dialog (T011) and its tests stay blocked and G7 is not given for them.
- **Independent work** that is authorized and not affected → continue. Example: while C1–C3 are open, the l10n approval checker and the FE-026 parts that do not touch course removal, the FAILED-row label or the course-code field continue.
- **A Critical/High finding that affects several parts** → continue only the parts that are shown to be independent and safe (no shared file, contract, data or test with the affected parts); when independence is not clear, treat the part as dependent.
- Every PO gate, authorization limit (§7) and approved stop condition still applies (e.g. G0 and G7 are never batched; workflow stop conditions; handoff stop conditions).

## 6. Roles

| Role | Owns | Never |
|---|---|---|
| **PO** | Business and product decisions; scope changes; unresolved design conflicts; permissions and PO-reserved decisions; review and acceptance of deliverables | — |
| **Claude** | Technical lead, orchestrator and independent reviewer: understands the whole task, sets the technical strategy and plan within the scope the PO authorized, delegates suitable execution to Antigravity (workflow §6), verifies results independently, owns the completeness and quality of the final handoff | Treats an Antigravity report as proof; claims Antigravity ran without a real run |
| **Antigravity** | Implementation of explicitly delegated work: reads and follows the rules and task constraints, executes the authorized changes and tests, reports actual files, commands, exit codes and results | Expands scope; grants itself permissions; approves, commits or pushes |
| **Claude subagents** | A bounded, independent piece of a Claude task given by the main session (§10): read-only exploration, independent review or Visual QA verification, or — one at a time, on files it is given — implementation (e.g. `figma-screen-implementer`) when Antigravity cannot be used | Approve anything; ask the PO; write outside the files they were given; review their own work |

Claude verifies every delegated result itself (re-runs tests, reads the diff, checks sources) before reporting it.

## 7. Limits of autonomy

Autonomy is not unlimited authorization. Always:
- Leave unrelated user-owned local changes untouched: any locally modified or untracked file the task did not create is protected. (The 2026-11-16 example of nine locally modified `.agents/rules/**` files is closed: the PO's checkout was clean on 2026-11-22 and the PO unlocked R01 for the single-design-source update.)
- Do not modify product code, Figma, Jira, `.github/`, CODEOWNERS, branch protection or other protected systems outside the authorized task.
- Do not bypass permissions, branch protection, CI or review requirements (exception: the per-PR admin-merge on the PO's direct chat order, policy §7); never use `--dangerously-skip-permissions` or an equivalent.
- Do not merge or approve PRs without explicit authorization and the applicable review requirements. Admin-merge (bypassing the Code Owner review, needed while the only Code Owner is also the PR author) is allowed **per PR, only when the PO orders it directly in chat** and names the PR(s); one order never covers other PRs, and it never skips the other Quality Gates (PO decision 2026-11-17).
- Commit, push and open PRs only within existing authorization and after the required local Quality Gates pass (workflow §5).

If a needed action exceeds your authorization, report the boundary and finish the rest of the authorized work.

## 8. Evidence-based completion

A task is complete only when its acceptance criteria are met and supported by evidence. Keep these apart in every report: source code inspected; tests actually executed; local results; integration results; GitHub CI and status checks; independent review findings; PO decisions and approvals; items still blocked, partial or unverified.

Never equate: a test file existing with the test passing; a local pass with GitHub CI passing; a successful command with a correct implementation; a proposed decision with an approved one; a finished code change with a passed product acceptance gate. Status labels (PO decision 2026-11-17), used exactly for every AC, check, gate and task:
- **PASS**: executed, every criterion met, evidence attached.
- **PASS WITH CONDITIONS**: executed and the criteria are met, with named remaining conditions (e.g. a known deviation, a follow-up, an accepted data difference), each listed with its owner. It satisfies a Quality Gate only when the PO accepts the listed conditions (PO confirmed 2026-11-17).
- **BLOCKED**: cannot be completed or executed because of a named blocker (missing key, environment, permission, open decision, or a defect outside the scope (PO confirmed 2026-11-17)).
- **NOT VERIFIED**: not executed, or executed without usable evidence.
The four labels have no failure label. A check that ran and did not meet its criteria is reported as "failed" with its evidence (a result, not a status); the item has no PASS label until it is fixed and re-run (§3), or it becomes BLOCKED with a named blocker (PO confirmed 2026-11-17). Only PASS (or PASS WITH CONDITIONS accepted by the PO) satisfies a Quality Gate (workflow §5).

## 9. Standard handoff

For each task report: objective and authorized scope; root causes and findings; implementation summary; files changed; commands run with actual exit codes; tests run and results; independent review and corrections; commit SHA or PR; remaining risks, blockers and PO decisions; claims that could not be verified independently. Report whether the intended outcome was achieved, not how many actions were taken. Reports to the PO are in Vietnamese.

## 10. Delegation, agents, skills and tools

- **Default split** (PO 2026-11-17, quota): code and UI implementation go to Antigravity through a handoff package (workflow §6); Claude analyses, orchestrates, reviews independently and runs Visual QA. Claude implements itself only small, contained edits where a package would cost more than the change.
- **Claude subagents** only when a piece is truly independent and its benefit outweighs the token and context cost: typically one read-only explorer or one independent reviewer/verifier at a time. Never several coding subagents in parallel (PO 2026-11-17); a coding subagent (e.g. `figma-screen-implementer`) runs one at a time, on the files it is given, and only when Antigravity cannot be used. Never a subagent "to look thorough".
- **Every delegated task** states: objective and why; context and sources; scope (files it may read, files it may write, files it must not touch); constraints and stop conditions; acceptance criteria and required evidence; output format. Write it goal-first and let the agent use its technical judgment; no micro-steps that the agent can decide itself, no padding.
- **One writer per file**: two agents never edit the same file or file group at the same time; the main session edits nothing in a delegated scope until the result is back.
- **Workspace isolation**: an agent writes only inside the workspace and files it was given. The PO's main checkout (uncommitted work) is never given to Antigravity or a subagent as a write target; use a separate worktree; the main session reviews the result and copies back only the reviewed files. Never extract, copy or install reference material (e.g. the PO's reference frontend zip) into the repository. Back up before overwriting anything the task did not create.
- **Skills, MCP and tools** are chosen by need: use a skill when it adds specialist value the agent lacks (design-to-code, Visual QA, review, testing strategy); skip skills, MCP servers and agents that add cost without value. The implementer never confirms its own work: review and verification use a different agent or skill.

## 11. Permission matrix

| System | Read | Write / act |
|---|---|---|
| Repository, feature branch / worktree | Always | Within the task scope; commit, push, PR after QG1–QG4 (workflow §5) |
| PO's main checkout | Always | Never the PO's uncommitted work without explicit authorization (§7) |
| `develop` / `main` | Always | Never commit directly; merge only after QG5–QG6; admin-merge only per §7 |
| GitHub PR reviews and comments | Always | Comment and request changes when reviewing; approve never (author = sole Code Owner) |
| Jira | Always | Comments with evidence; status transitions only at the gates the workflow names (review on PR open, Done after QG7; workflow §5) |
| Figma | Read-only by default | Edit only with explicit PO approval for that change |
| Local Docker stack and dev servers | Always | Start/stop/rebuild services needed for tests ; never delete volumes or data (PO confirmed 2026-11-17) |
| Claude memory | Always | Save new PO directives immediately; remove them once reflected in repo rule files (§12) |
| Settings, permissions, CODEOWNERS, branch protection, CI workflows | Always | Never, unless the PO orders that specific change |

## 12. Memory and context

- Save each new PO directive to memory **as soon as it is given** (decision, date, verbatim quote when short). When the directive is written into a repo rule file, replace the memory entry with a pointer or delete it (PO decision 2026-11-17). The PO must never have to repeat a stored decision.
- Repo rule files are the single source of truth; memory holds pointers, decisions not yet in the repo, and technical lessons. Project Knowledge (claude.ai) holds only a short summary of the active decisions with links to `AGENTS.md`, `CLAUDE.md`, this policy and the workflow; never whole histories or source code.
- When a task ends and a large new one is about to start, or the session has become long, propose a new chat and give a short context summary (state, open items, next step) to paste into it.
