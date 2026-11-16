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

Order convention: A = keep the approved Figma as drawn; B = follow the earlier PO decision / current backend DTO. The letters are labels only, not a preference.

### Decision 3: Failed Material Action Semantics & Flow (PO Q3, Review R2-4 → C2, BLOCKED-ON-C2)
- **Problem**: Figma frames 02.4 and 02.6 label the action on a `FAILED` material row as "Thử lại" (Retry / node `586:8570`). However, the backend does not possess a re-ingestion endpoint for existing material records. In legacy code, clicking "Thử lại" merely reloaded the list without doing anything.
- **Context & Conflict**:
  - Facts: Figma label "Thử lại". PO Q3 (2026-11-15): label "Tải lên lại" (or "Chọn tệp tải lại"); the action opens the upload modal (02.5), shows the previous failure reason, the user re-selects the file, a new upload goes through the existing `POST /courses/:courseId/materials`, the old FAILED record is not deleted before the new upload succeeds; "Không tạo API re-ingest mới trong phạm vi FE-026".
  - **Behaviour is the same under C2-A and C2-B** (the PO Q3 flow above, existing upload API, no new API). Only the label differs.
- **Options (C2 Option Analysis)**:
  - **C2-A (keep Figma):** label "Thử lại".
  - **C2-B (follow PO Q3):** label "Tải lên lại" / "Chọn tệp tải lại"; needs the PO to change the Figma text.
- **Out of FE-026 (not an option here):** a "Thử lại" that re-ingests the existing material in place would need a new backend API and is a business/scope change requiring separate PO approval (PO Q3). Mention it only as this note.
- **Decision**: `BLOCKED-ON-C2 — pending PO`. No interim option recommended.

---

### Decision 4: Course Removal = Soft Archive (C1-B, decided by the PO on 2026-11-16; PO Q4 answer & Review R2-3)
- **Problem**: Attempting to delete a course with associated materials returned HTTP 500 due to PostgreSQL foreign key constraints. PO Q4 (2026-11-15) cites OPD-014 for soft archive, which conflicted with the earlier Figma 02.3 hard delete copy (conflict C1).
- **Context & Conflict (history)**:
  - Facts at the time: Figma 02.3 dialog `I483:10341;228:301` "Xóa khóa học này?", body `…228:302` (courses, materials and case studies are deleted, irreversible), confirm `…228:310;225:254` "Xóa khóa học". PO Q4 (2026-11-15) + OPD-014: soft archive, keep course, materials, chunks, MinIO objects. Backend before the change: `DELETE /courses/:courseId` returned HTTP 500 when the course had materials (FK, no cascade); `courses.is_active` exists.
- **PO decision** `[PO-ĐÃ-XÁC-NHẬN 2026-11-16]` (chat, verbatim, date 2026-11-16):
  - C1 question → *"chọn C1-B và update tài liệu luôn giúp tôi, cứ theo figma, tại liệu mà lệch thì sủa lại giúp tôi"*
  - May Claude change Figma 02.3 copy to archive wording? → *"Sửa Figma theo lưu trữ"*
  - What to do with `DELETE /courses/:id`? → *"Gỡ DELETE"*
  - Scope approval (backend archive API, remove DELETE, lecturer list hides archived, archived course rejects upload and case generation with 409, students unchanged) → *"Duyệt, không đổi sinh viên"*
- **History line**: C1-A (hard delete) was not chosen, PO 2026-11-16.
- **Non-conflict schema fact**: Database table `courses` already contains `is_active BOOLEAN NOT NULL DEFAULT TRUE` (`backend/migrations/V1__init_schema.sql:39`). Soft archive reuses `is_active` (`is_active = FALSE`) without redundant columns or parallel mechanisms.
- **Facts now true** `[DỮ-KIỆN]`: Backend branch `feature/course-soft-archive` (not merged yet) implements `PATCH /api/v1/courses/:courseId/archive` (see `be-dependencies.md` `BE-PROP-2`, `contracts/courses-api.md` §2.1) and removes `DELETE /courses/:courseId`. Figma page 08 frame 02.3 (node `483:10111`, renamed "02.3 · Giảng viên · Hộp thoại xác nhận lưu trữ khóa học"), dialog instance `483:10341` (variant Type=Destructive, unchanged): title `I483:10341;228:301` = "Lưu trữ khóa học này?"; message `I483:10341;228:302` = "Khóa học sẽ ẩn khỏi danh sách đang hoạt động. Tài liệu và case study được giữ nguyên." + line 2 "CS402 · An ninh mạng & Ứng cứu sự cố · 4 tài liệu · 6 case"; confirm `I483:10341;228:310;225:254` = "Lưu trữ khóa học"; cancel "Hủy bỏ" unchanged.
- **Decision**: Soft archive (C1-B). The frontend calls `courseService.archiveCourse(courseId)` → `PATCH /courses/:courseId/archive`; no hard delete. Open follow-up `[CHƯA-QUYẾT]`: whether the archive confirm button should keep the Destructive (red) variant shown in Figma or use a non-destructive variant (PO question C1-F1, spec.md); no interim choice is made here.

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
  - Facts: Figma 02.2 label "Mã môn học *" (`I483:10105;226:146`, asterisk = required). `CreateCourseDto.courseCode`: `@IsOptional()`, `@IsString()`, `@MaxLength(20)` (`backend/src/modules/course/dto/create-course.dto.ts:14-17`).
- **Options (C3 Option Analysis)**:
  - **C3-A (keep Figma):** required; needs a backend DTO change (and a rule for existing courses without a code).
  - **C3-B (follow the DTO):** optional; needs the PO to remove the asterisk on Figma.
- **Decision**: `BLOCKED-ON-C3 — pending PO`. Facts documented neutrally; awaiting PO decision on whether courseCode is required in the UI form or optional per DTO. No interim option recommended.

---

## 2. Best Practices & Component Mapping

| Figma Screen / Frame | FE-023 Target Page | DS Primitives (`src/components/ds/`) | Feedback Components (`src/components/feedback/`) |
|---|---|---|---|
| **02.1 Courses** (`483:9637`) | `pages/courses/CoursesPage.tsx` | `CourseCard`, `CourseOverview`, `Button`, `SearchField`, `FilterControl`, `Pagination`, `ResultCount` | `CourseListSkeleton`, `CourseCardSkeleton`, `EmptyState`, `ErrorState`, `NoResultsState` |
| **02.2 Create/Edit Course** (`483:9866`) | Modal in `CoursesPage.tsx` | `Dialog`, `Field` (input, textarea), `Button` | N/A (inline form errors) |
| **02.3 Course Archive Confirmation** (`483:10111`) | Dialog in `CoursesPage.tsx` (`CourseRemovalDialog`) | `Dialog`, `Button` (Destructive variant per Figma; open question C1-F1) | N/A |
| **02.4 Materials Table** (`483:10342`) | `pages/materials/MaterialsPage.tsx` | `Breadcrumb`, `Button`, `ProcessingBadge`, `StatusPill`, `SearchField`, `Pagination` | `EmptyState`, `ErrorState`, `Skeleton` |
| **02.5 Upload Modal** (`483:10598`) | Modal in `MaterialsPage.tsx` | `Dialog`, `Button`, `Field` | N/A (file queue state) |
| **02.6 Delete Material** (`483:10890`) | Dialog in `MaterialsPage.tsx` | `Dialog`, `Button` (danger) | N/A |
| **02.7 RAG Source Inspector** (`483:11148`) | `pages/materials/RagSourceInspectorPage.tsx` | `Breadcrumb`, `BackIconButton`, `MetricCard`, `Button` | `EmptyState`, `ErrorState`, `Skeleton` |
