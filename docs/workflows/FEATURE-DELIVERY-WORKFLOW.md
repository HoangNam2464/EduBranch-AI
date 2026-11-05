# EduBranch-AI — Feature Delivery Workflow

> **Status**: Draft · **Role**: Normative once Approved · **Owner**: not assigned · **Approver**: PO · **Version**: 0.3
> **Origin**: adapted from GitHub Spec Kit (`docs/reference/agentic-sdd.md`, `docs/guides/existing-projects.md`; v1.3.0). The Specify CLI, `.specify/`, `constitution.md` and `specs/NNN-*` are **not** used.
> **Read by**: the `edubranch-feature-workflow` skill (Claude Code and Antigravity). This file is the only copy of the procedure.

## 1. Scope

Use for: a new feature or subfeature, a significant behaviour change, a security or ownership fix, or any work the PO wants traced from requirement to test.

Do not use for: typo or wording fixes, formatting, dependency bumps, small refactors with no behaviour change, or rule/doc edits the PO has already specified line by line.

One run covers **one bounded change**: a slice that can be reviewed on its own, with stated boundaries that must not change. Never write specs for the existing system as a whole.

`AGENTS.md` applies at every stage, in particular rules 5–6 on open decisions.

## 2. Sources (read; never copy)

| Role | Source | Notes |
|---|---|---|
| Principles | `AGENTS.md`, FND (`.agents/rules/00-project-foundation.md`), approved PO decisions | No separate constitution file. |
| Product requirement | Proposal V1.2 | Cite the section; ask if it is not in context. |
| Feature description | `docs/features/FEATURE-*.md`, `.agents/rules/feature-*.md` | Status Unknown: provisional (GDS §0.2). |
| Task and AC | `docs/01_MASTER-TASKS.md`, `docs/03_TASK-DETAILS.md` | Parent task = Master Task ID + Group ID. |
| QA | `docs/06_QA.md` | — |
| Design | GDS §0 source map, `docs/05_FIGMA.md`, R01, `docs/design/screens/P0`–`P4`, Figma | Status Unknown: provisional (GDS §0.2). Figma is evidence, not approval. Design values follow AGENTS.md rule 9. |
| Open decisions | OPD (`docs/OPEN_PRODUCT_DECISIONS.md`, branch `feature/design-system`), PSD (`docs/mvp-scope/`) | Read only; on another branch read with `git show <branch>:<path>`, never guess a path. |

Verification levels (01_MASTER-TASKS §5): **T** acceptance criteria · **I** implementation · **V** verified evidence. One never implies another.

## 3. Change record

Each run keeps one change record (location: `docs/changes/<GROUP-ID>-<slug>.md`, in Vietnamese; D5) with these sections in order: Discover · Spec · Clarify log · Plan · Checklist · Tasks · Analyze · Approval · Converge. Every statement carries a source ID or one of the tags `[PO-ĐÃ-XÁC-NHẬN]` `[DỮ-KIỆN]` `[CHƯA-QUYẾT]` `[ĐỀ-XUẤT]`.

Write the record only after the PO approves creating it. Until then, present each section in chat.

## 4. Stages and gates

Every stage ends at a PO gate. At a gate, present the output, stop, and wait. Start the next stage only after the PO says so; a gate the PO has batched (below) is passed by that approval.

| Stage | Spec Kit | Writes | Gate (PO) |
|---|---|---|---|
| 0 Discover | — (reads the principles that replace Constitution) | nothing | G0: change and boundary confirmed |
| 1 Specify | specify | Spec | G1: spec reviewed |
| 2 Clarify | clarify | Clarify log | G2: no blocking question left, or deferred by the PO |
| 3 Plan | plan | Plan | G3: plan reviewed |
| 4 Checklist | checklist | Checklist | G4: open items fixed or accepted |
| 5 Tasks | tasks | Tasks | G5: task list reviewed |
| 6 Analyze | analyze | nothing | G6: no open Critical or High finding |
| 7 Approval | — | Approval | G7: implementation scope approved |
| 8 Implement | implement | code, tests | G8: diff and test results reviewed |
| 9 Converge | converge | Converge | G9: converge report accepted |

The PO may batch consecutive gates from G1 to G6 in one approval. Record the batch in the Approval section and present every batched output at the closing gate. A batch stops early at any open decision, blocking question or Critical/High finding: present the outputs so far and wait. G0, G7, G8 and G9 are never batched. To resume in a new session, take the last passed gate from the approved change record or from the PO.

### 0. Discover (read-only)
Record the branch and HEAD using only allowed tools inside the workspace. If they cannot be read, write UNKNOWN and ask the PO; never read files outside the workspace to find them. Identify the parent task (Master Task ID, Group ID, Trạng thái nguồn), the feature doc and feature rule, the FND sections, the OPD/PSD/PO-n items that touch the change, the code and tests that touch it, and the current T/I/V of each related AC. For UI, list the routes, Figma pages and node IDs, and whether each frame is Ready for Dev.

### 1. Specify
Describe the intended change only: what and why, users and roles, the boundaries that must stay unchanged (existing API, data, behaviour), and acceptance criteria. Reuse existing AC by ID. A new or changed AC is `[ĐỀ-XUẤT]` until the PO approves it. No technology choices here. For UI, list the screens and states as requirements (P0–P4 section, Figma node ID).

### 2. Clarify
List what is ambiguous or missing, at most 5 questions per round. Match each to an existing OPD, PSD or PO-n first; for anything open or unregistered, apply AGENTS.md rule 5. Record each PO answer verbatim with its date. Never write an assumed answer into the spec, plan or tasks.

### 3. Plan
Plan within current decisions: FND §3, `docs/architecture/`, the approved stack. Per tier (FE, API, BE, DB, AI), list the files to touch, the screens, Figma frames and reused or new components for FE, API contract changes, DB changes (new migration in `backend/migrations/`), AI-service changes and risks. A new technology or boundary change needs an ADR and PO approval: stop and ask.

### 4. Checklist
Check the quality of the requirements, not the code: complete, unambiguous, testable, traced to a source, consistent with FND, GDS and banners, and covering roles, ownership, states (default, loading, empty, error, 403, success), focus and labels, responsive scope, R01 §1 bans and Vietnamese UI copy. The agent proposes each answer; only the PO or a named reviewer marks an item `[x]`. A checked item never means the work is implemented.

### 5. Tasks
Break the plan into dependency-ordered tasks traced as parent task → subfeature → FE / API / BE / DB / AI / QA. Each task names its files, the AC it serves and the test that will prove it. Changes to `03_TASK-DETAILS.md` or `06_QA.md` are proposed as a diff, never applied silently.

### 6. Analyze (read-only)
Cross-check spec, plan, tasks and sources. Report requirements without a task or test, tasks without a requirement (scope creep), conflicts with FND, GDS, banners or open OPDs, terminology drift, and files outside the plan. A conflict with AGENTS.md, FND or an approved PO decision is Critical; a conflict between those sources goes to the PO (AGENTS.md rule 5). Fix findings at their source stage and re-run Analyze.

### 7. Approval
Present the change record summary, the task list and the expected file list. The approval must name the scope; record it verbatim with its date. List each frame in scope that uses provisional or UNRESOLVED values; it is never Ready for Dev, and whether it may be built is the PO's decision. Approval to implement does not cover commit, push, PR or merge; each needs its own approval.

### 8. Implement
Do only the approved tasks, in order. Branch and commit as FND §7.2–§7.3 require. Run the planned tests and record each command and exit code. Stage files by explicit path. If the work needs anything outside the approved scope, stop and return to Clarify.

### 9. Converge
Compare requirement → plan → tasks → code → tests, and for UI each screen with its Figma node and P0–P4 states; give each approved AC its T/I/V. V needs the tests re-run by a verifier who did not write the code, on a stated commit or diff MD5. Per AC, list ID, T/I/V, file:line, test, command and result. List gaps as proposed tasks; adding them needs PO approval. Report "Converged" only when every approved AC has an implementation and verified evidence. Status changes in `01_MASTER-TASKS.md` or `03_TASK-DETAILS.md` are proposed as a diff.

## 5. Short path

For a small bounded change the PO may approve the short path: Discover → Specify → Plan → Tasks → Approval → Implement → Converge. Record the PO's approval of the short path in the Approval section. Never skip Clarify, Checklist or Analyze without it.

## 6. Never

- Create `constitution.md`, `.specify/` or `specs/`, or install or run the Specify CLI.
- Turn an `[ĐỀ-XUẤT]` into a requirement, or treat existing code as an approved requirement.
- Change the branch or commit convention, or create per-task branches.
- Treat a checked checklist item, a passing build or existing code as proof that an AC is met.
- Add tasks or expand scope during Implement or Converge without PO approval.

## 7. Delegation

The main session orchestrates and owns every gate. It may hand a stage's work to sub-agents: explorer (Discover, Analyze; read-only), implementer (Implement; approved files only), verifier (re-runs tests for Converge; never the implementer). Each brief names the stage, the input paths, the allowed tools and files, the expected output and the stop conditions. Two sub-agents never edit the same file. A sub-agent never approves anything or asks the PO: it stops with `STOPPED: <reason>`. The main session checks each result before presenting it at the gate.
