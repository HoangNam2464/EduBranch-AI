# Proposed Backend Dependencies [FE-026]

> **Status**: PROPOSED — not created in Jira · Requires Product Owner (PO) approval.  
> **Context**: Upstream backend service dependencies identified during FE-026 (Jira EBA-89, Sprint 3) planning per PO Decisions Q2 and Q4 (2026-11-15). These tasks are NOT part of any Sprint backlog or active Jira sprint, and do not modify backend code in this change.

---

## 1. Core Principle: Missing API ≠ Empty Data

The user interface MUST handle data states honestly:
- **EmptyState (Dữ liệu trống)**: Displayed **ONLY** when the API returns an HTTP `200 OK` response with a valid, empty payload (e.g., `items: []`, `total_chunks: 0`).
- **ErrorState / Unavailable (Lỗi / Chưa khả dụng)**: Displayed when an endpoint returns `404 Not Found` (endpoint absent or resource missing), `403 Forbidden`, `5xx Server Error`, or when a network failure occurs. The UI MUST display the real failure reason with a retry action where sensible.
- **Strict Prohibition**: The UI must **NEVER** use an empty fallback array (`[]`), "hiển thị trống", or cached/mocked data when an endpoint is missing or returns an error.

---

## 2. Proposed Task Specifications

### BE-PROP-1: Chunks Retrieval API (`GET /materials/:id/chunks`)
- **Status**: PROPOSED — not created in Jira (requires PO approval)
- **Source**: PO Decision Q2 (2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`)
- **Contract Reference**: `specs/001-fe026-courses-materials/contracts/materials-api.md` §2.1
- **Target Module**: Backend Gateway (`backend/src/modules/material/`)
- **Blocked Frontend Tasks**: `T006` (`getMaterialChunks`), `T018` (contract tests), `T020` (chunks client), `T021` (RAG inspector page)
- **Requirements**:
  1. **Route & Envelope**: `GET /api/v1/materials/:id/chunks` returning standard backend envelope `{ "status": "SUCCESS", "data": { "material_id", "original_filename", "total_chunks", "page_count", "size_bytes", "page", "limit", "items": [...] } }`.
  2. **Data Source**: Query `document_chunks` table (ordered by `chunk_index ASC`) for chunks belonging to `materialId`.
  3. **Chunk Fields**: `id`, `chunk_index`, `page_number` (`V4__document_chunks.sql:24`), `chunk_text` (mapped to frontend `content`), `token_count` (estimated or derived).
  4. **Pagination**: Accept query parameters `page` (default: 1) and `limit` (default: 20).
  5. **Authentication & Ownership**: Validate `Authorization` Bearer JWT. Enforce course ownership check through `teaching_materials` join `courses` where `courses.lecturer_id = currentUser.id`. Return `403 Forbidden` if caller does not own the parent course.
  6. **Security Boundary**: Only return chunks for materials the caller is authorized to access.
  7. **Integration Tests**: Provide automated backend integration test with real seeded database data verifying pagination, chunk ordering, and ownership protection.

---

### BE-PROP-2: Course Soft Archive API (`PATCH /courses/:id/archive`) (BLOCKED-ON-C1: C1-B)
- **Status**: PROPOSED — not created in Jira (requires PO approval; `BLOCKED-ON-C1 — pending PO` for C1-A delete vs C1-B soft archive resolution)
- **Source**: PO Decision Q4 / OPD-014 (2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`)
- **Contract Reference**: `specs/001-fe026-courses-materials/contracts/courses-api.md` §2.1
- **Target Module**: Backend Gateway (`backend/src/modules/course/`) & Database
- **Blocked Frontend Tasks**: `T005` (`archiveCourse`), `T011` (`CourseArchiveDialog`), `T029` (course removal resolution)
- **Requirements**:
  1. **Route & Envelope**: `PATCH /api/v1/courses/:id/archive` returning standard backend envelope `{ "status": "SUCCESS", "data": { "id", "name", "course_code", "is_active": false, ... } }`.
  2. **Schema Evaluation**: Reuse existing database column `courses.is_active` (`BOOLEAN NOT NULL DEFAULT TRUE` per `backend/migrations/V1__init_schema.sql:39`). Set `is_active = FALSE`. Do NOT introduce redundant columns (e.g. `is_archived`, `archived_at`) or parallel mechanisms.
  3. **Data Preservation Invariant**: Archiving a course must **NEVER** delete or cascade-delete records in `teaching_materials`, `document_chunks`, or objects stored in MinIO. Historical case references and student attempt links remain 100% intact.
  4. **Active Course Filtering**:
     - Update `getCoursesByLecturer` (`course.service.ts:30`) and `getCourseById` (`course.service.ts:43`) to filter `WHERE is_active = TRUE` for active course listings.
     - Consumers that must be audited and aligned to exclude or reject archived courses:
       - `case.service.ts:37` (prevent creating cases for archived courses)
       - `material.service.ts:52` (prevent uploading materials to archived courses)
       - Student desk and admin course listing queries
  5. **Authentication & Ownership**: Enforce `lecturer_id = currentUser.id`. Return `403 Forbidden` if a lecturer attempts to archive a course owned by another lecturer.
  6. **Integration Tests**: Automated tests proving that:
     - Archived courses are omitted from active listings.
     - All linked materials, chunks, and MinIO objects are completely preserved.
     - HTTP 500 foreign key constraint errors are eliminated.
     - Unauthorized archival attempts return 403 Forbidden.
