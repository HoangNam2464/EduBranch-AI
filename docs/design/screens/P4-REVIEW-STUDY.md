# P4 — Review Study

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]`
> - **Priority / MVP Scope**: **MVP Scope** (`(LATER)` label removed by PO decision `2026-11-25`; Proposal V1.2 explicitly includes simple Review Study in MVP and Figma frames `06.1`–`06.3` are synchronized). **Distinction from implementation**: MVP scope inclusion does not imply complete verification — open UI element decision **`D4-13`** (`student_analysis` required vs optional), `06.2` status badge check, draft persistence parity, and live Visual/E2E acceptance remain open or in verification even though core `BE-025` / `ReviewStudyPage.tsx` / `ReviewFeedbackPage.tsx` landed on `develop` (`PR #69`).
> - **Visual system**: PO-approved Figma governs per-screen design (`docs/05_FIGMA.md`); `R01` (`.agents/rules/01-ui-design-standards.md`) sets general UI/UX quality rules without overriding approved Figma; token values in `frontend/src/index.css` (target modular stylesheets in `frontend/src/styles/`).
> - **Covers**: `/student/cases/:caseId/review-study`, `/student/cases/:caseId/review-study/:submissionId/feedback`.

---

## 1. Review Study (`/student/cases/:caseId/review-study`)

### Purpose & Function
Context/Data → Problem/Question → Student Analysis → Proposed Solution → Student Reasoning, for cases with `learning_mode = REVIEW_STUDY` (`FEATURE-REVIEW-STUDY.md`). No decision tree — `context_text`/`problem_text` only.

### Layout (Figma `06.1`, `06.2`)
Single-column reading + writing flow (`65–75ch` readable measure per `R01 §3.1`):
- **Context & Attached Data (`"Số liệu & dữ liệu thực tế đính kèm"`)**: `context_text` plus 3 summary metric cards (e.g. trial spend, remaining budget, target) and channel breakdown table with a `"Tổng"` row (right-aligned numbers) and term definitions (`UX-SCREEN-NOTES.md §06`).
- **Problem Statement**: `problem_text`.
- **Student Work Form (`06.1`)**: optional `student_analysis` *(schema `V2` nullable; UI enforcement `D4-13` remains `OPEN PO DECISION`)* → `proposed_solution` (required) → `reasoning_text` (required, using Reasoning Input pattern in `R01`).
- **Bottom Action Bar**: `"Quay lại"`, finality warning note (`"Bài nộp là bản cuối..."`), `"Lưu nháp"`, and `"Nộp bài"`.

### Data
`context_text`, `problem_text` (from the case), `student_analysis`, `proposed_solution`, `reasoning_text` (student-authored, `review_study_submissions`).

### Actions
- Save draft (local/server draft before final submit per Figma `06.1`) or Submit (`"Nộp bài"`) → creates the single `review_study_submissions` row for this `(student, case)` pair (`submission_status = SUBMITTED`).
- Optional: open Challenge Support on the submitted `proposed_solution`/`reasoning_text` (`P2-STUDENT-CORE.md §3`, targeting `review_submission_id` instead of `reasoning_id`; modal vs page `OPD-005` open).

### States
- **Submitted / Awaiting Feedback (`06.2`)**: read-only view of the submitted analysis, attached metrics stacked vertically, and status indicator — **no retry/resubmit affordance** (`FEATURE-REVIEW-STUDY.md §3`). *(Figma check note: `MVP_SCOPE_AND_FIGMA_FRAME_REGISTER` line 124 flags verifying the waiting status badge copy on `06.2` vs `"Đã có phản hồi"` instance name).*

### Boundary
Do **not** pre-compute derived ratios, percentages, or cost-per-activation columns inside the attached-data block (students must analyze raw figures themselves — `UX-SCREEN-NOTES.md §06`). No AI grading of `proposed_solution` or `reasoning_text`. No "correct answer" framing anywhere (`FEATURE-REVIEW-STUDY.md §1`).

---

## 2. Review Feedback (`/student/cases/:caseId/review-study/:submissionId/feedback`)

### Purpose & Function
Student view of the Lecturer's feedback on their Review Study submission, and the entry point to submit a reflection (`FEATURE-LECTURER-FEEDBACK.md` §3, `FEATURE-REFLECTION.md`).

### Layout
Read-only recap of the student's own `proposed_solution`/`reasoning_text` → Lecturer Feedback Block (R01) → Reflection Input (`§6.8`), shown only once `submission_status = REVIEWED`.

### States
- **Not yet reviewed**: if the lecturer hasn't submitted feedback yet, show a waiting state ("Your lecturer hasn't reviewed this submission yet") rather than an empty feedback block.
- **Already reflected**: read-only, matching the Reflection screen's already-submitted state pattern (`P2-STUDENT-CORE.md` §2).

### Boundary
Same as `P2-STUDENT-CORE.md` §2 — no AI grading/scoring of the reflection.
