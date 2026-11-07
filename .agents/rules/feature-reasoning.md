--
description: Rules for retrospective student reasoning capture in the REVIEW phase of EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Student Reasoning Capture

## Scope
Backend Gateway (NestJS `backend/`) — `reasoning/` module.
Frontend — `pages/student/BranchingReviewPage.tsx` (Phase 2: REVIEW screen, per-decision-point retrospective reasoning input).

## Included
- During Phase 1 (Experience), selecting a `CaseOption` records `selected_option_id` for `(attempt_id, node_id)` with `reasoning_text = NULL`
- During Phase 2 (REVIEW at `/student/cases/:caseId/attempt/:attemptId/review`), after reaching the terminal node and viewing the lecturer-authored `consequence` for each decision point, the student submits retrospective written reasoning (`reasoning_text`, 10–2000 chars) justifying each choice
- Reasoning is persisted to `student_reasoning`, owned strictly by `attempt_id NOT NULL` (`branching_attempts`) — NOT by the option or node globally (`INV-05`)
- One reasoning record per Decision Point per Attempt: `UNIQUE(attempt_id, node_id)` (`INV-06`)
- `selected_option_id` must belong to `node_id`'s options (service-layer validation, `INV-07`)
- Saved reasoning enables optional AI Reasoning / Challenge Support (max 2 rounds per node; see `feature-challenge-support.md`)
- Student may view their own submitted reasoning for their own attempts

## Excluded
- **Mid-flow reasoning capture during Phase 1 (`BranchingCasePlayerPage`)** — forbidden by the Experience-First pedagogical rule
- **AI grading of reasoning** — Challenge Support only asks counter-questions, never scores or grades
- **Automated pass/fail based on reasoning quality** — out of scope
- **Cross-attempt comparison/ranking** — no comparison engine (`INV-18`)
- Plagiarism detection — out of scope

## Service Owner
Backend Gateway (NestJS `backend/`) — `reasoning/` module.

## Constraints
- Written `reasoning_text` submitted in the REVIEW phase must have a minimum length (10 chars) and maximum length (2000 chars)
- Reasoning is stored as plain text (no HTML, sanitize on input)
- `studentId` is always derived from JWT via the owning `attempt` — never trust a client-provided student ID
- Retrying a case creates a NEW `branching_attempts` row; a new attempt means new reasoning rows, even for the same option chosen again — past attempts and their reasoning are immutable (`INV-12`)

## Testing Expectations
- Test reasoning length validation (10–2000 chars) when saving in the REVIEW phase
- Test that a student cannot submit reasoning for another student's attempt
- Test `UNIQUE(attempt_id, node_id)` is enforced (one reasoning row per Decision Point per Attempt)
