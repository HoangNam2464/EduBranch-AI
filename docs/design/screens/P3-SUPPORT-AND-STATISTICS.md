# P3 — Support & Statistics

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]`
> - **Priority / MVP Scope**: **MVP Scope** (`(LATER)` label removed by PO decision `2026-11-25`; Figma frames `04.1`, `04.2`, `04.2b`, `04.3` synchronized). **Distinction from implementation**: MVP scope inclusion does not mark full feature completion — open UI element decisions (**`D-04`**, **`OPD-010`**), Lecturer Feedback route convention (`/lecturer/feedback` vs `/lecturer/cases/:caseId/feedback`), `BE-033` CSV export backend (PR #80), and Visual/E2E acceptance remain in progress or `OPEN PO DECISION`.
> - **Visual system**: `R01` (`.agents/rules/01-ui-design-standards.md`), the single design source; token values in `frontend/src/index.css` (target modular stylesheets in `frontend/src/styles/`).
> - **Covers**: `/lecturer/statistics`, and Lecturer Feedback (`/lecturer/feedback`, `/lecturer/feedback/:submissionId` in `SITE-ARCHITECTURE.md` / `paths.ts` vs `/lecturer/cases/:caseId/feedback` here — route convention **`OPEN PO DECISION / UNRESOLVED`**).

---

## 1. Lecturer Statistics (`/lecturer/statistics` — Figma `04.3`)

### Purpose & Function
Surfaces the five Proposal-defined Learning-Flow metrics: completion, selected branch distribution, number of attempts, outcome distribution, learning-flow status (`FEATURE-BASIC-STATISTICS.md`), plus the **`OPD-011 → Option A`** (`PO 2026-11-12`) anonymized research export button (`"Xuất dữ liệu CSV"` on Figma `04.3`).

### User & Context
Lecturer only. Entered from the top-level nav or a "View Statistics" link on a specific case.

### Layout & Components
Case selector (if not arriving scoped to one case) → summary number cards (completion rate, total attempts, single-attempt vs. retry split, using tabular numerals) → branch-selection-distribution breakdown per Decision Point → learning-flow status breakdown (in-progress / completed / reflected for Branching; submitted / reviewed / reflected for Review Study) → `"Xuất dữ liệu CSV"` action (`OPD-011`, anonymized export only).

### Data
Sourced from `branching_attempts` (`is_completed`, `attempt_number`, `outcome_node_id`, `reflection_status`), `student_reasoning` (`selected_option_id`, `node_id`), `review_study_submissions` (`submission_status`, `reflection_status`). CSV export strips all PII (`FEATURE-EVALUATION-AND-RESEARCH.md` FR-EVAL-05).

### States
- **Empty**: one page-level empty state (`"Chưa có dữ liệu thống kê"`) rather than repeating identical empty messages inside every widget card (`UI-AUDIT` X5).
- **Loading**: skeleton number cards + skeleton bars.

### Boundary
Core metrics stay strictly limited to the 5 defined metrics — no comparison/ranking engine, no grading/scoring, no predictive modeling, no cross-course student leaderboard (`FEATURE-BASIC-STATISTICS.md §3`). Anonymized CSV export (`OPD-011`) never exposes individual student reasoning text or PII (`student_id`, name, email) inside the cohort statistics view.

---

## 2. Lecturer Feedback (`/lecturer/feedback` overview & `/lecturer/cases/:caseId/feedback` case-scoped — Figma `04.1`, `04.2`, `04.2b`)

> **Route Convention (`OPEN PO DECISION / UNRESOLVED`)**: Whether both overview (`/lecturer/feedback`, `/lecturer/feedback/:submissionId`) and case-scoped (`/lecturer/cases/:caseId/feedback`) entry points remain active or standardize to one canonical path awaits formal PO confirmation (open UI elements `D-04` and `OPD-010` also remain `OPEN PO DECISION / UNRESOLVED`).

### Purpose & Function
Lets the Lecturer review individual student Review-Study submissions and Branching Study attempts (`FEATURE-LECTURER-FEEDBACK.md §1`) and author qualitative academic feedback.

### Layout (Figma `04.1`, `04.2`, `04.2b`)
- **Review Queue (`04.1`)**: Filterable submission/attempt table showing student *(open `D-04`: whether Student Code column/suffix appears in `users` & queue)*, submission timestamp, case & course, attempt number, equal-width action buttons (`"Đánh giá & nhận xét"` / `"Xem phản hồi"`), and equal-width centered status pills (`Chờ phản hồi` / `Đã phản hồi` / `Đã suy ngẫm`).
- **Branching Attempt Feedback Detail (`04.2`)**: Student reflection recap, actual traversed decision path, student reasoning at pivotal decision points, qualitative feedback textarea (`0 / 2000 ký tự` counter), `"Bài trước"` / `"Bài sau"`, `"Lưu nháp"`, and `"Gửi phản hồi"`. *(Open element `OPD-010`: Figma shows an optional AI suggestion button — kept `OPEN PO DECISION`; never auto-generate feedback or grades).*
- **Review Study Submission Detail (`04.2b`)**: Student's optional analysis (`D4-13`), proposed solution, reasoning, case context reference, qualitative feedback textarea (`0 / 2000 ký tự`), Previous/Next, Save Draft, and Submit Feedback.

### Data
`branching_attempt_id` or `review_submission_id` (exactly one per feedback record — `chk_feedback_one_target`), `feedback_text`.

### Actions
- **Save Draft / Submit Feedback** → creates/updates the `lecturer_feedback` row; for Review Study, submitting feedback transitions `submission_status` from `SUBMITTED` to `REVIEWED`, unlocking the student's reflection step (`FEATURE-LECTURER-FEEDBACK.md §3`).

### Boundary
No automatic scoring or grade field anywhere on this screen — all evaluation and feedback are authored by human lecturers (`FEATURE-LECTURER-FEEDBACK.md §3`). AI feedback suggestion UI (`OPD-010`) remains blocked until explicitly decided by PO.
