---
description: Rules for lecturer case review, edit, and publication workflow in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Lecturer Review & Edit

## Scope
Backend Gateway (NestJS `backend/`) — `case/` module.
Frontend — `pages/cases/CaseReviewPage.tsx`.

## Included
- Lecturer sees generated case in `DRAFT` status
- For `BRANCHING_STUDY`: Lecturer inspects all nodes and options on a split ReactFlow tree canvas + Node Inspector panel (`docs/design/screens/P1-LECTURER-CORE.md §4` owns layout geometry)
- For `REVIEW_STUDY`: Lecturer inspects and edits the context/data and problem fields in a structured form editor (no ReactFlow canvas)
- Lecturer can edit case title, description, node situations, option text, consequence, and Review Study prompts
- Lifecycle transitions: `DRAFT → REVIEWED → APPROVED → PUBLISHED`
- Version increment on significant revisions (`cases.version`)

## Excluded
- Real-time collaboration editing — out of scope
- AI auto-regeneration of specific nodes without lecturer request — out of scope
- Automatic approval — human-in-the-loop is mandatory

## Service Owner
Backend Gateway (NestJS) — enforces lifecycle transitions
Frontend — `pages/cases/CaseReviewPage.tsx` (ReactFlow decision tree visualization for Branching Study and form editor for Review Study)

## Constraints
- **STUDENTS MUST NEVER SEE CASES THAT ARE NOT PUBLISHED** (`INV-01`)
- This check must be at the repository query level
- A case advances through the lifecycle (`DRAFT → REVIEWED → APPROVED → PUBLISHED`)
- Reverting an unpublished/approved draft to `DRAFT` is allowed for further editing
- **Post-publication edits (`OPD-007` OPEN PO DECISION)**: Structural edits to a `PUBLISHED` case that already has active student attempts must preserve attempt history (`version = version + 1`); exact UI/policy rule (lock vs unpublish vs new version) awaits `OPD-007` PO closure — do not invent unapproved restrictions.

## Testing Expectations
- Status transition tests (valid and invalid transitions)
- Confirm student endpoint returns 404 for non-`PUBLISHED` cases
- Confirm lecturer can edit only their own courses' cases
