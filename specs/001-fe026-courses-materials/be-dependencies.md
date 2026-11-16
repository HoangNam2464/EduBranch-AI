# Proposed Backend Dependencies [FE-026]

> **Status**: `BE-PROP-1` PROPOSED — not created in Jira · Requires Product Owner (PO) approval. `BE-PROP-2` implemented on branch `feature/course-soft-archive`, pending merge into `develop` (not in Jira; scope approved by the PO on 2026-11-16, see `BE-PROP-2` below).  
> **Context**: Upstream backend service dependencies identified during FE-026 (Jira EBA-89, Sprint 3) planning per PO Decisions Q2 and Q4 (2026-11-15) and the PO decision on C1 (2026-11-16). `BE-PROP-1` is NOT part of any Sprint backlog or active Jira sprint, and this change does not modify backend code.

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

### BE-PROP-2: Course Soft Archive API (`PATCH /courses/:courseId/archive`) — implemented on branch `feature/course-soft-archive`, pending merge
- **Status**: Implemented on branch `feature/course-soft-archive`, pending merge into `develop` `[DỮ-KIỆN]`. Not in Jira (no Jira key is claimed). Scope approved by the PO on 2026-11-16 `[PO-ĐÃ-XÁC-NHẬN 2026-11-16]`: *"Duyệt, không đổi sinh viên"*. This is the former proposed `BE-PROP-2`; it is no longer PROPOSED / BLOCKED.
- **Source**: PO Decision Q4 / OPD-014 (2026-11-15 `[PO-ĐÃ-XÁC-NHẬN]`); C1 decided C1-B on 2026-11-16 `[PO-ĐÃ-XÁC-NHẬN 2026-11-16]`: *"chọn C1-B và update tài liệu luôn giúp tôi, cứ theo figma, tại liệu mà lệch thì sủa lại giúp tôi"*; legacy route decision: *"Gỡ DELETE"*; scope approval: *"Duyệt, không đổi sinh viên"*.
- **Contract Reference**: `specs/001-fe026-courses-materials/contracts/courses-api.md` §2.1 (and §1.5, removed)
- **Target Module**: Backend Gateway (`backend/src/modules/course/`) & Database
- **Dependent Frontend Tasks**: `T005` (`archiveCourse`), `T011` (`CourseRemovalDialog`), `T029` (course archive wiring). They stay `BLOCKED-ON-BE` only until the branch is merged into `develop` (they may be built against the contract, but are not reported done before the merge).
- **Implemented behaviour** `[DỮ-KIỆN]` (branch `feature/course-soft-archive`, not merged yet):
  1. **Route & Envelope**: `PATCH /api/v1/courses/:courseId/archive`, role `LECTURER`, owner only. Returns `{ "status": "SUCCESS", "data": <course with is_active = false, active = false> }`.
  2. **Errors & idempotency**: `404` for an unknown course, `403` for a non-owner. Archiving an already archived course returns `200` with the course (idempotent).
  3. **Schema**: Reuses existing column `courses.is_active` (`BOOLEAN NOT NULL DEFAULT TRUE`, `backend/migrations/V1__init_schema.sql:39`), set to `FALSE`. No redundant column or parallel mechanism.
  4. **Data Preservation Invariant**: Materials (`teaching_materials`), pgvector chunks (`document_chunks`), MinIO objects and cases are kept. Historical case references and student attempt links remain intact.
  5. **Lecturer list**: `GET /courses` returns only `is_active = TRUE` courses. `GET /courses/:courseId` still returns an archived course (`is_active = false`).
  6. **Archived course rejects new work**: uploading a material to an archived course, or generating a case in it, returns HTTP `409` with message "Course is archived" (`403` still wins for a non-owner).
  7. **`DELETE /courses/:courseId` no longer exists** (returns `404`). There is no restore / unarchive operation.
  8. **Students**: behaviour unchanged (PO: *"Duyệt, không đổi sinh viên"*).
- **Still to confirm at merge** (not verified by this FE spec): backend integration tests proving that archived courses are omitted from the lecturer list, that materials, chunks and MinIO objects survive, that unauthorized archival returns 403 and that the former HTTP 500 foreign-key error cannot occur.
