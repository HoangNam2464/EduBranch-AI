---
description: Rules for the Course domain in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Course & Lecturer Context

## Scope
Backend Gateway (NestJS `backend/`) — `course/` module.
Frontend — `pages/courses/CoursesPage.tsx` (Lecturer), `pages/courses/StudentCoursesPage.tsx` & `pages/student/StudentDeskPage.tsx` (Student).

## Included
- Lecturer creates/updates/archives courses (`PATCH /courses/:courseId/archive` sets `is_active = false`, OPD-014)
- Course owns: name, description, course code, invite code (`invite_code`, `invite_code_active`), `lecturerId`
- Student enrollment by invite code (`course_enrollments(course_id, student_id)`, `UNIQUE(course_id, student_id)` — V5 migration, OPD-001 → A, BE-029)
- Course is the grouping context for teaching materials and cases
- Lecturer can only access their own courses (ownership enforcement)

## Excluded
- Course marketplace or discovery — out of scope
- Hard deletion of courses — soft-archive only (`OPD-014`; no `DELETE /courses/:courseId`, no restore workflow per PO Q4 2026-11-15)
- Multi-instructor ownership — single lecturer per course in MVP

## Service Owner
Backend Gateway (NestJS `backend/`)

## Constraints
- Always filter by `lecturer_id = currentUser.id` in SQL when listing/modifying lecturer courses
- Archived courses reject new material uploads and case generation (`HTTP 409`)
- `courseId` is a required foreign key for both `TeachingMaterial` and `Case`

## Testing Expectations
- Lecturer can only see their own courses
- Another lecturer cannot access another's courses (403)
