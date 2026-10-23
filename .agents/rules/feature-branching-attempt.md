--
description: Rules for the Branching Case Player, 3-Phase Branching Study flow, and branching attempt/retry model in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Branching Case Player & Branching Attempt Model

## Scope
Backend Gateway (NestJS `backend/`) — `branching-attempt/` module.
Frontend — `pages/student/BranchingCasePlayerPage.tsx` (Phase 1: Experience) and `pages/student/BranchingReviewPage.tsx` (Phase 2: REVIEW).

## Included (3-Phase Branching Study Flow)
- **Phase 1: Experience (`/student/cases/:caseId/branching-play`)**:
  - Student loads a `PUBLISHED` case with `learning_mode = 'BRANCHING_STUDY'`.
  - Student reads the current situation (`CaseNode`) and its available `CaseOption` choices in a focused prose layout (NO ReactFlow graph on student screens).
  - Student selects an option and clicks `Confirm & Continue`. The system records `selected_option_id` (`student_reasoning` placeholder with `reasoning_text = NULL`) and immediately advances `current_node_id` to `option.next_node_id` — **NO reasoning input and NO consequence text mid-flow**.
  - When reaching a terminal node (`is_terminal = TRUE`), the system records `outcome_node_id`, `is_completed = TRUE`, displays the Terminal Outcome Card, and enables `Proceed to Review & Analysis`.
- **Phase 2: REVIEW (`/student/cases/:caseId/attempt/:attemptId/review`)**:
  - Reveals the full decision journey in vertical chronological cards, displaying the lecturer-authored `consequence` for each chosen option, retrospective reasoning input (`student_reasoning.reasoning_text`, 10–2000 chars), and optional AI Reasoning / Challenge Support (max 2 rounds per node).
- **Phase 3: Reflection & Retry (`/student/cases/:caseId/attempt/:attemptId/reflect`)**:
  - Student submits post-outcome reflection (`reflection_text`, `reflection_status = 'SUBMITTED'`).
  - Student may retry: a retry creates a NEW `branching_attempts` row with `attempt_number = previous + 1` (`UNIQUE(student_id, case_id, attempt_number)`).
  - Past attempts are immutable history — never overwritten or mutated retrospectively.

## Excluded
- Student modifying the case or its content (nodes/options/consequences are lecturer-owned)
- Revealing consequence text or requiring reasoning text mid-flow during Phase 1
- Rendering ReactFlow graphs on student screens
- Skipping nodes or options
- Real-time multi-student interaction in the same attempt
- **No Comparison Engine**: no automated semantic diffs, ranking, or auto-comparison across attempts
- **No Attempt Scoring**: no scoring columns on `branching_attempts`, no grading of the path taken

## Service Owner
Backend Gateway: attempt persistence, node traversal logic, retry/versioning.
Frontend: Branching Case Player UI (`BranchingCasePlayerPage.tsx`), REVIEW UI (`BranchingReviewPage.tsx`), and Reflection UI (`ReflectionPage.tsx`).

## Constraints
- Only `PUBLISHED` cases can be loaded (`INV-01`)
- `studentId` is always set from JWT — never trust a client-provided student ID
- Terminal node detection is based on `CaseNode.is_terminal`
- `reflection_status` defaults to `NOT_STARTED`, transitions to `SUBMITTED` only via the Reflection screen

## Testing Expectations
- Test that non-`PUBLISHED` cases return 403/404
- Test attempt creation and node progression without requiring reasoning text mid-flow
- Test terminal node detection and `outcome_node_id` recording
- Test that retry creates a new attempt row rather than mutating the previous one, and that `attempt_number` increments correctly
