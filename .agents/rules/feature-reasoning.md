---
description: Rules for student reasoning capture in EduBranch-AI.
trigger: keyword
keywords: [reasoning, student reasoning, justification, written response]
---

# Feature Rules: Student Reasoning Capture

## Scope
Backend Gateway (NestJS `backend/`) — `reasoning/` and `branching-attempt/` modules.
Frontend — `/student/cases/:caseId/attempt/:attemptId/review` (REVIEW Phase — Decision Reasoning Input component).

## Included
- **Two-phase reasoning capture in Branching Study**:
  1. **Selection capture (Experience phase)**: Selecting a `CaseOption` immediately records `selected_option_id` to `student_reasoning`, owned strictly by `attempt_id NOT NULL` (`branching_attempts`) — NOT by the option or node globally (INV-05).
  2. **Retrospective reasoning (REVIEW phase)**: After completing the journey (reaching terminal node), student may write reflective reasoning justifying their decisions (`reasoning_text` via PUT/PATCH, encouraged for pivotal decisions, not blocking mid-flow, optional per node).
- **Reasoning capture in Review Study**: Student submits `proposed_solution` along with mandatory `reasoning_text` (`NOT NULL` in `review_study_submissions`).
- One reasoning record per Decision Point per Attempt: `UNIQUE(attempt_id, node_id)` (INV-06)
- `selected_option_id` must belong to `node_id`'s options (service-layer validation, INV-07)
- Reasoning text is the trigger for optional AI Reasoning / Challenge Support (see `feature-challenge-support.md`)
- Student may view their own submitted reasoning for their own attempts

## Excluded
- **AI grading of reasoning** — Challenge Support only asks counter-questions, never scores or grades
- **Automated pass/fail based on reasoning quality** — out of scope
- **Cross-attempt comparison/ranking** — no comparison engine (INV-18)
- Plagiarism detection — out of scope

## Service Owner
Backend Gateway (NestJS `backend/`) — `reasoning/` module.

## Constraints
- **Branching Study**: Writing reasoning is encouraged for pivotal decisions but is **optional** overall; `reasoning_text` may be null. If provided, length must be between 10 and 2,000 characters.
- **Review Study**: `reasoning_text` is **mandatory** (required, 10–2,000 characters).
- Reasoning is stored as plain text (no HTML, sanitize on input)
- `studentId` is always derived from JWT via the owning `attempt` — never trust a client-provided student ID
- Retrying a case creates a NEW `branching_attempts` row; a new attempt means new reasoning rows, even for the same option chosen again — past attempts and their reasoning are immutable (INV-12)

## Testing Expectations
- Test reasoning length validation
- Test that a student cannot submit reasoning for another student's attempt
- Test `UNIQUE(attempt_id, node_id)` is enforced (one reasoning row per Decision Point per Attempt)
