# Research & Architectural Decisions: Courses & Materials Rework [FE-026]

**Feature Directory**: `specs/001-fe026-courses-materials`  
**Date**: 2026-11-15  
**Status**: Completed  
**Context**: Pilot implementation planning for FE-026 (Jira EBA-89, Sprint 3) aligned with PO Clarifications Q1–Q5 and Review Items R2-1–R2-4.

---

## 1. Architectural Unknowns & Decisions

### Decision 1: Target Frontend Architecture & Component Migration (PO Q1)
- **Problem**: The current branch `docs/spec-kit-workflow` contains the legacy frontend structure (`frontend/src/pages/lecturer/CoursesPage.tsx`, `MaterialsPage.tsx`, `RagSourceInspectorPage.tsx`, `components/ui/`). Concurrently, the frontend architectural restructure FE-023 (`src/components/ds/`, `src/routes/paths.ts`, `src/locales/`, modular page layout `src/pages/courses/`, `src/pages/materials/`) was developed on `refactor/frontend-structure`. Should FE-026 plan against the legacy structure or target FE-023?
- **Decision**: **Plan FE-026 strictly against the FE-023 target structure as an upstream dependency** (PO Q1, 2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`).  
  *Note*: FE-023 (EBA-86) target structure on branch `refactor/frontend-structure` (FE-023 target (expected; not on develop `273f1fc`; verified by T028)); every path from it is an expectation verified by T028 after merge.
  - Page targets:
    - `frontend/src/pages/courses/CoursesPage.tsx` (Figma 02.1, 02.2, 02.3)
    - `frontend/src/pages/materials/MaterialsPage.tsx` (Figma 02.4, 02.5, 02.6)
    - `frontend/src/pages/materials/RagSourceInspectorPage.tsx` (Figma 02.7)
  - Design system components target `frontend/src/components/ds/` (`Button`, `Dialog`, `Field`, `SearchField`, `FilterControl`, `StatusTabs`, `Pagination`, `MetricCard`, `CourseCard`, `CourseOverview`, `ProcessingBadge`, `StatusPill`, `Toast`).
  - Feedback states target `frontend/src/components/feedback/` (`EmptyState`, `ErrorState`, `NoResultsState`, `Skeleton`, `CourseCardSkeleton`, `CourseListSkeleton`).
  - Route navigation targets `frontend/src/routes/paths.ts` (`PATHS.LECTURER.COURSES`, `PATHS.LECTURER.COURSE_MATERIALS`, `PATHS.LECTURER.MATERIAL_SOURCES`, `buildPath()`).
  - Implementation constraint: Zero product code for FE-026 will be written on the legacy structure. Implementation awaits FE-023 being merged into `develop`.
- **Rationale**: Prevents double work and throwaway code. Respects the implementation sequence established by the PO on 2026-11-13 and 2026-11-15.
- **Alternatives Considered**:
  - *Option A (Code on legacy structure)*: Rejected by PO. Would require complete rewriting once FE-023 lands.
  - *Option B (Import uncommitted changes into this branch)*: Rejected by PO. Violates Git branching rules and clean repository hygiene.

---

### Decision 2: Backend Chunks Retrieval for RAG Source Inspector (PO Q2)
- **Problem**: `RagSourceInspectorPage.tsx` previously used `MOCK_CHUNKS` and `OTHER_DOCUMENTS` because the backend lacked an endpoint returning parsed chunks from pgvector. Jira AC 4 and Constitution prohibit fake data. How should frame 02.7 be handled?
- **Decision**: **Propose a Backend task (BE) to provide `GET /api/v1/materials/:id/chunks` with pagination, metadata, and ownership checks** (PO Q2, 2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`).
  - FE-026 removes 100% of `MOCK_CHUNKS` and `OTHER_DOCUMENTS`.
  - In FE-026 UI, if the endpoint is deployed, it binds to real chunks. If the endpoint is absent (404), 403, 5xx, or network failure occurs, the UI displays an authentic error or unavailable state (`ErrorState`) with the real reason and a retry action where sensible (per Missing API ≠ empty data rule). `EmptyState` is rendered ONLY on HTTP 200 OK with an empty chunks list (`items: []`, `total_chunks: 0`). Empty fallback arrays (`[]`) and fake data are strictly forbidden.
  - Record `GET /api/v1/materials/:id/chunks` as a proposed backend task dependency, not approved FE-026 scope.
- **Rationale**: Complies with the Zero Fake Data policy. Preserves pedagogical and academic credibility.
- **Alternatives Considered**:
  - *Keep mock data*: Prohibited by AGENTS.md, Constitution, and Jira AC 4.
  - *Remove/hide screen 02.7*: Rejected because frame 02.7 is an explicit deliverable of Jira EBA-89.

---

### Decision 3: Failed Material Action Semantics & Flow (PO Q3, Review R2-4 → C2, BLOCKED-ON-C2)
- **Problem**: Figma frames 02.4 and 02.6 label the action on a `FAILED` material row as "Thử lại" (Retry / node `586:8570`). However, the backend does not possess a re-ingestion endpoint for existing material records. In legacy code, clicking "Thử lại" merely reloaded the list without doing anything.
- **Context & Conflict**:
  - [DỮ-KIỆN] Figma node `586:8570` labels the action button "Thử lại".
  - [PO-ĐÃ-XÁC-NHẬN] PO Q3 (2026-11-15) requested renaming action label to "Tải lên lại" (or "Chọn tệp tải lại").
  - **Action Button Label**: `BLOCKED-ON-C2 — pending PO`.
  - **Common Behavior (settled)**: Under both label options, clicking the button opens the Upload Modal (02.5) displaying the previous error context (`processingError`), prompting the user to re-select the original file to initiate a new upload via existing `POST /courses/:courseId/materials`, without calling a fake re-ingest API.
- **Alternatives Considered (C2 Option Analysis)**:
  - *Option 1 — Retain "Thử lại" label per Figma (Node `586:8570`)*:
    - Copy: Action button labeled "Thử lại" (Retry).
    - Behaviour: Clicking button opens Upload Modal (02.5) displaying previous error context (`processingError`), prompting user to re-select original file to upload.
    - Backend/data impact: Uses existing upload endpoint `POST /courses/:courseId/materials`; requires zero backend changes.
  - *Option 2 — Rename to "Tải lên lại" / "Chọn tệp tải lại" per PO Q3 (2026-11-15)*:
    - Copy: Action button labeled "Tải lên lại" (Re-upload) or "Chọn tệp tải lại".
    - Behaviour: Identical to Option 1 (opens Upload Modal 02.5 with previous error context to re-select file).
    - Backend/data impact: Uses existing upload endpoint `POST /courses/:courseId/materials`; requires zero backend changes.
  - *Non-conflict technical scope fact*: Backend in-place re-ingestion endpoint (e.g. `POST /materials/:id/reingest` without re-selecting file) is out of scope for FE-026 per PO Q3; would require ingestion pipeline architecture changes and PO approval. (Legacy frontend behavior of reloading the list with no action does not trigger re-processing).
  - *Decision*: `BLOCKED-ON-C2 — pending PO`.

---

### Decision 4: Course Deletion vs Soft Archive Policy (PO Q4 & OPD-014, Review R2-3 → C1, BLOCKED-ON-C1)
- **Problem**: Attempting to delete a course with associated materials returned HTTP 500 due to PostgreSQL foreign key constraints. In addition, OPD-014 established that courses and cases use a soft-archive mechanism rather than destructive deletion.
- **Context & Conflict**:
  - [DỮ-KIỆN] Figma frame 02.3 specifies a destructive deletion dialog ("Xóa khóa học này?").
  - [PO-ĐÃ-XÁC-NHẬN] PO Q4 (2026-11-15) and OPD-014 specify soft archive for courses (`courses.is_active = FALSE`), preserving materials, chunks, and cases.
  - **Dialog Copy & Backend API**: `BLOCKED-ON-C1 — pending PO`.
  - **Schema Evaluation for Soft Archive**: Database table `courses` already contains `is_active BOOLEAN NOT NULL DEFAULT TRUE` (`backend/migrations/V1__init_schema.sql:39`). Reusing `is_active` (`is_active = FALSE`) fulfills the soft-archive requirement without introducing redundant columns or parallel mechanisms if soft archive is confirmed.
- **Alternatives Considered (C1 Option Analysis)**:
  - *Option 1 — Hard delete per Figma frame 02.3 (`483:10111` / `483:10341`)*:
    - Copy: Destructive deletion confirmation dialog titled "Xóa khóa học này?" with warning text.
    - Behaviour: Irreversible removal of course record from database.
    - Backend/data impact: Calls existing `DELETE /courses/:courseId`. In PostgreSQL, foreign key constraints from child materials or cases result in HTTP 500 unless ON DELETE CASCADE is configured on the backend; permanently removes associated case studies and materials.
  - *Option 2 — Soft archive per PO Q4 (2026-11-15) & OPD-014*:
    - Copy: Archive confirmation dialog (e.g. "Lưu trữ khóa học này?").
    - Behaviour: Deactivates course from active view while preserving course materials, chunks, and case studies.
    - Backend/data impact: Requires proposed backend endpoint `PATCH /courses/:courseId/archive` (BE-PROP-2) to set `courses.is_active = FALSE`. Schema fact: Database table `courses` already contains `is_active BOOLEAN NOT NULL DEFAULT TRUE` (`backend/migrations/V1__init_schema.sql:39`), so reusing `is_active` requires no schema migrations or new columns.
  - *Non-conflict schema fact*: Introducing a separate `is_archived` column is not required if soft archive is confirmed, because `courses.is_active` already exists in the baseline schema.
  - *Decision*: `BLOCKED-ON-C1 — pending PO`.

---

### Decision 5: Material Deletion API Alignment (PO Q5, Review R2-1)
- **Problem**: `MaterialsPage.tsx:789` called `DELETE /courses/:courseId/materials/:id`, whereas the backend controller (`backend/src/modules/material/material.controller.ts:80`) defines `DELETE /materials/:id`.
- **Decision**: **Fix the API route in FE-026 to call `DELETE /materials/:id` directly relative to API base (`/api/v1`)** (PO Q5, 2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`).
  - Frontend `materialService.deleteMaterial(id)` calls `apiClient.delete(`/materials/${id}`)`.
  - Table row is removed from UI only upon receiving HTTP 200/204 response from backend.
  - Regression tests verify error handling for 403, 404, and network failure.
- **Rationale**: Fixes legacy bug from FE-005 directly in frontend without modifying backend controller or introducing alias routes.
- **Alternatives Considered**:
  - *Add backend alias `DELETE /courses/:courseId/materials/:id`*: Rejected by PO. Unnecessary API surface duplication.

---

### Decision 6: Upload API Contract & Limits (Review R2-1, R1-3)
- **Problem**: Upload endpoint and size limits must reflect actual backend contracts.
- **Decision**: 
  - Route: `POST /courses/:courseId/materials` relative to `/api/v1` (`backend/src/modules/material/material.controller.ts:33`).
  - Multipart field: `file` (single file per request).
  - Size limit: `MAX_SIZE_BYTES = 50 * 1024 * 1024` (50MB) defined in `backend/src/modules/material/material.service.ts:19`.
  - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.pdf`, `.docx`).
  - Client-side validation validates size and MIME type before sending, preventing unnecessary uploads.
- **Rationale**: Exact alignment with existing backend implementation (AGENTS.md rule 7).

---

### Decision 7: Course Code Required-ness (C3, BLOCKED-ON-C3)
- **Context & Conflict**:
  - [DỮ-KIỆN] Figma frame 02.2 (`483:9866`) marks "Mã môn học *" as a required field with an asterisk.
  - [DỮ-KIỆN] Backend DTO `CreateCourseDto` (`backend/src/modules/course/dto/create-course.dto.ts:9`) defines `@IsOptional() courseCode?: string`.
  - **UI Required-ness**: `BLOCKED-ON-C3 — pending PO`. Facts documented neutrally; awaiting PO decision on whether courseCode is required in the UI form or optional per DTO.

---

## 2. Best Practices & Component Mapping

| Figma Screen / Frame | FE-023 Target Page | DS Primitives (`src/components/ds/`) | Feedback Components (`src/components/feedback/`) |
|---|---|---|---|
| **02.1 Courses** (`483:9637`) | `pages/courses/CoursesPage.tsx` | `CourseCard`, `CourseOverview`, `Button`, `SearchField`, `FilterControl`, `Pagination`, `ResultCount` | `CourseListSkeleton`, `CourseCardSkeleton`, `EmptyState`, `ErrorState`, `NoResultsState` |
| **02.2 Create/Edit Course** (`483:9866`) | Modal in `CoursesPage.tsx` | `Dialog`, `Field` (input, textarea), `Button` | N/A (inline form errors) |
| **02.3 Course Removal (C1)** (`483:10111`) | Dialog in `CoursesPage.tsx` | `Dialog`, `Button` (tonal/danger) | N/A |
| **02.4 Materials Table** (`483:10342`) | `pages/materials/MaterialsPage.tsx` | `Breadcrumb`, `Button`, `ProcessingBadge`, `StatusPill`, `SearchField`, `Pagination` | `EmptyState`, `ErrorState`, `Skeleton` |
| **02.5 Upload Modal** (`483:10598`) | Modal in `MaterialsPage.tsx` | `Dialog`, `Button`, `Field` | N/A (file queue state) |
| **02.6 Delete Material** (`483:10890`) | Dialog in `MaterialsPage.tsx` | `Dialog`, `Button` (danger) | N/A |
| **02.7 RAG Source Inspector** (`483:11148`) | `pages/materials/RagSourceInspectorPage.tsx` | `Breadcrumb`, `BackIconButton`, `MetricCard`, `Button` | `EmptyState`, `ErrorState`, `Skeleton` |
