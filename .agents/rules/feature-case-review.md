--
description: Rules for lecturer case review, edit, and publication workflow in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Lecturer Review & Edit

## Scope
Backend Gateway (NestJS `backend/`) — `case/` module.
Frontend — `pages/lecturer/CaseReviewPage.tsx`.

## Included
- Lecturer sees generated case in `DRAFT` status
- For `BRANCHING_STUDY`: Lecturer inspects all nodes and options on a split-screen ReactFlow canvas (`60%` canvas + `40%` slide-over Node Inspector Drawer)
- For `REVIEW_STUDY`: Lecturer inspects and edits the linear narrative and analysis prompt in a structured form editor (no ReactFlow canvas)
- Lecturer can edit case title, description, node situations, option text, consequence, and review prompt
- Lifecycle transitions: `DRAFT → REVIEWED → APPROVED → PUBLISHED`
- Version increment on each significant edit
- Basic version/history support

## Excluded
- Real-time collaboration editing — out of scope
- AI auto-regeneration of specific nodes without lecturer request — out of scope
- Automatic approval — human-in-the-loop is mandatory

## Service Owner
Backend Gateway (NestJS) — enforces lifecycle transitions
Frontend — `pages/lecturer/CaseReviewPage.tsx` (ReactFlow decision tree visualization for Branching Study and form editor for Review Study)

## Constraints
- **STUDENTS MUST NEVER SEE CASES THAT ARE NOT PUBLISHED** (`INV-01`)
- This check must be at the repository query level
- A case can only transition forward in the lifecycle (`DRAFT → REVIEWED → APPROVED → PUBLISHED`)
- Rollback to `DRAFT` is allowed for editing
- Published cases cannot be edited directly (must unpublish first → create new version)

## Testing Expectations
- Status transition tests (valid and invalid transitions)
- Confirm student endpoint returns 404 for non-`PUBLISHED` cases
- Confirm lecturer can edit only their own courses' cases
