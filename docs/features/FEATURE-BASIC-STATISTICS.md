# Feature: Basic Learning-Flow Statistics

> - **Document Class**: `[LIVING FEATURE SPEC]`
> - **Authoritative Traceability**: Proposal V1.2 (lines 65, 87)
> - **Target Package / Module**: Backend `statistics/` (`BE-028`) · Frontend `pages/statistics/StatisticsPage.tsx`, `components/stats/BranchStatsChart.tsx`
> - **MVP Scope Status**: **MVP Scope** (`(LATER)` label removed per PO `2026-11-25`, Figma `04.3` synchronized in [`P3-SUPPORT-AND-STATISTICS.md`](../design/screens/P3-SUPPORT-AND-STATISTICS.md)). *(Scope inclusion is distinct from full implementation completion: core `statistics/` `BE-028` / `StatisticsPage.tsx` are implemented on `develop`, whereas anonymized CSV export `BE-033` `OPD-011` and final UI/Visual acceptance remain in progress).*

---

## 1. Purpose
Provides university lecturers with clear, foundational **Learning-Flow Statistics** on how students navigated their published cases. Focuses strictly on meaningful pedagogical metrics defined in Proposal V1.2 without unnecessary analytics complexity.

---

## 2. Core Metrics Defined in Proposal V1.2

1. **Completion**: Proportion and count of student attempts that reached a terminal outcome node (`branching_attempts.is_completed = TRUE`).
2. **Selected Branch**: Distribution and frequency of student choices at each Decision Point (`student_reasoning.selected_option_id` grouped by `case_options`).
3. **Number of Attempts**: Count and distribution of attempts per student per case (`branching_attempts.attempt_number`).
4. **Outcome**: Distribution of terminal outcomes reached by the cohort (`branching_attempts.outcome_node_id`).
5. **Learning-Flow Status**: Current progression state of students:
   - Branching Study: in-progress vs completed vs reflected (`reflection_status`).
   - Review Study: submitted vs reviewed vs reflected (`review_study_submissions.submission_status`).

---

## 3. Scope & Guardrails
- Scoped strictly to the 5 Proposal metrics listed above.
- **Out of scope**: No automated comparison engine, no attempt scoring or ranking, no predictive modeling, no complex multi-tenant analytics dashboards.

---

## 4. Functional Requirements
- **FR-STAT-01**: The system shall allow lecturers to query statistics for any case in their owned courses.
- **FR-STAT-02**: The system shall aggregate branch selection counts at each `case_node` across all attempts.
- **FR-STAT-03**: The system shall compute cohort completion rates and the distribution of final outcomes.
- **FR-STAT-04**: The system shall provide summary metrics on attempt counts (e.g. single-attempt vs retry students).
- **FR-STAT-05**: The system shall display learning-flow status distributions (e.g. pending feedback, reflected).

---

## 5. Main Flow
1. Lecturer navigates to `/lecturer/statistics` (or clicks "View Statistics" on a case).
2. Frontend requests `GET /api/v1/cases/{caseId}/statistics`.
3. Backend aggregates data from:
   - `branching_attempts` (`is_completed`, `attempt_number`, `outcome_node_id`, `reflection_status`)
   - `student_reasoning` (`selected_option_id`, `node_id`)
   - `review_study_submissions` (`submission_status`, `reflection_status` if Review Study)
4. Backend returns clean statistics DTO.
5. Frontend renders summary cards and branch choice breakdowns.

---

## 6. Implementation Status
**Implemented** *(nhánh `fix/fe-screen-quality`, chưa merge `develop`)*
*(Backend `statistics/` `BE-028` merged in PR #76 and frontend `StatisticsPage.tsx` + `BranchStatsChart.tsx` merged in PR #70 on `develop`. Trên nhánh cục bộ `fix/fe-screen-quality` (`174e69b`), `FE-022` đã PASS Visual QA Round 4: bỏ emoji ở select, sửa % làm lại, xếp cột lịch dưới 1280px, KPI 2×2 dưới 1920px, tiêu đề điểm quyết định không cắt ellipsis, và trạng thái 403/500/empty khi tải danh sách khóa học.)*
