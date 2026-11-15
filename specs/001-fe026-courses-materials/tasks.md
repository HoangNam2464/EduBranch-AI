# Tasks: Courses & Materials Screens Rework to Figma 02.1–02.7 [FE-026]

**Input**: Design documents from `specs/001-fe026-courses-materials/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/courses-api.md`, `contracts/materials-api.md`, `contracts/ui-contracts.md`, `checklists/ux.md`)  
**Prerequisites**: Upstream task FE-023 merged into `develop`, Backend Gateway API on `/api/v1/*`, MinIO running, PostgreSQL 16 + pgvector running.  
**Tests**: Automated tests are specified for each user story and foundational layer using the project's Node/TS test framework (`npx tsx --test`).  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.  

---

## Format: `[TaskID] [P?] [Story?] Description with file path`

- **Checkbox**: `- [ ]` markdown checkbox
- **Task ID**: Sequential identifier (`T001`, `T002`, `T003`...)
- **[P]**: Parallelizable (touches different files, has no dependencies on incomplete tasks)
- **[Story]**: User story identifier (`[US1]`, `[US2]`, `[US3]`); omitted for Setup, Foundational, and Polish tasks
- **Description**: Clear action with exact file path, referenced AC, and verification test
- **Constraints**: Field constraints and validation rules quoted verbatim from `data-model.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verification of upstream prerequisites, path contracts, and localization infrastructure.

- [ ] T001 Verify upstream FE-023 integration prerequisite and router path dictionary in `frontend/src/routes/paths.ts`  
  *Details*: Confirm that `PATHS.LECTURER.COURSES` (`/lecturer/courses`), `PATHS.LECTURER.COURSE_MATERIALS` (`/lecturer/courses/:courseId/materials`), and `PATHS.LECTURER.MATERIAL_SOURCES` (`/lecturer/courses/:courseId/materials/:materialId/rag`) are exported and that `buildPath()` helper handles param interpolation correctly.  
  *AC*: FR-010, PO Q1. *Test*: `npx tsx --test frontend/src/routes/paths.spec.ts`.

- [ ] T002 [P] Configure Vietnamese localization strings for courses and materials in `frontend/src/locales/vi.json` and `frontend/src/locales/states.vi.json`  
  *Details*: Add 100% academic Vietnamese UI strings following FND §1.2 (`Khóa học`, `Tài liệu môn học`, `Lập chỉ mục`, `Lưu trữ khóa học`, `Đoạn trích RAG`, `Tải lên lại`). Include validation error messages: `"Tên khóa học không được để trống"`, `"Mã khóa học tối đa 20 ký tự"`, `"Mô tả khóa học tối đa 1000 ký tự"`, `"Hệ thống chỉ hỗ trợ định dạng PDF hoặc DOCX"`, `"Dung lượng tệp vượt quá giới hạn tối đa 50MB"`, `"Tệp không có nội dung (0 bytes)"`.  
  *AC*: FR-012, Jira AC 3, R01 §1 Rule 6. *Test*: Verify all translation keys exist and contain zero English fallback copy.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data mappers, API client methods, and common envelope handling that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story implementation can begin until this foundational phase is complete.

- [ ] T003 [P] Implement and test Course API response mapper in `frontend/src/services/mappers/course.ts` and `frontend/src/services/mappers/course.spec.ts`  
  *Details*: Transform backend `{ "status": "SUCCESS", "data": ... }` snake_case payload into camelCase domain Course model. Handle fields: `id` (UUID), `name` (`min(1)`, `max(255)`, trimmed), `course_code` (`max(20)`, alphanumeric & dashes mapped to `courseCode`), `description` (`max(1000)`), `cover_image_url` (mapped to `coverImageUrl`), `is_active` (boolean, default: `true`, mapped to `is_active`), `lecturer_id` (mapped to `lecturerId`), `created_at` (mapped to `createdAt`), `updated_at` (mapped to `updatedAt`). Compute client aggregates: `materialCount`, `caseCount`, and `readyMaterialCount`.  
  *AC*: FR-001, FR-002, FR-010. *Test*: `npx tsx --test frontend/src/services/mappers/course.spec.ts` with valid, empty, and edge-case envelopes.

- [ ] T004 [P] Implement and test Material API response mapper in `frontend/src/services/mappers/material.ts` and `frontend/src/services/mappers/material.spec.ts`  
  *Details*: Transform backend `{ "status": "SUCCESS", "data": ... }` snake_case payload into camelCase domain Material model. Handle fields: `id` (UUID), `course_id` (mapped to `courseId`), `original_filename` (`min(1)`, `max(255)` mapped to `originalFilename`), `stored_object_key` (mapped to `storageKey`), `mime_type` (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` mapped to `mimeType`), `size_bytes` (`min(1)`, `max(52428800)` (50MB) mapped to `sizeBytes`), `processing_status` (enum `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` mapped to `processingStatus`), `chunk_count` (`min(0)`, default: `0` mapped to `chunkCount`), `processing_error` (mapped to `processingError`), `uploaded_at` (mapped to `uploadedAt`).  
  *AC*: FR-004, FR-005, FR-010. *Test*: `npx tsx --test frontend/src/services/mappers/material.spec.ts` covering all 4 lifecycle states.

- [ ] T005 [P] Implement and test Course API service methods in `frontend/src/services/courseService.ts` and `frontend/src/services/courseService.spec.ts`  
  *Details*: Implement HTTP client methods via `apiClient`: `getCourses()` (`GET /courses`), `getCourseById(id)` (`GET /courses/:id`), `createCourse(data)` (`POST /courses` sending `name`, `courseCode`, `description`), `updateCourse(id, data)` (`PUT /courses/:id`), and soft-archive method `archiveCourse(id)` (`PATCH /courses/:id/archive` `[ĐỀ-XUẤT]`, setting `is_active = FALSE` per OPD-014 and PO Q4). Ensure all endpoints are relative to `/api/v1` base URL without duplicate prefix.  
  *AC*: FR-001, FR-002, FR-003, PO Q4. *Test*: `npx tsx --test frontend/src/services/courseService.spec.ts` mocking axios responses and asserting exact URLs and HTTP methods.

- [ ] T006 [P] Implement and test Material API service methods with canonical delete route in `frontend/src/services/materialService.ts` and `frontend/src/services/materialService.spec.ts`  
  *Details*: Implement HTTP client methods: `getMaterials(courseId)` (`GET /courses/:courseId/materials`), `uploadMaterial(courseId, file, onProgress)` (`POST /courses/:courseId/materials` sending multipart/form-data with field name `file`), and fix canonical delete route `deleteMaterial(id)` calling `DELETE /materials/:id` relative to `/api/v1` base URL (PO Q5, fixing bug from FE-005 at `MaterialsPage.tsx:789`). Add proposed `getMaterialChunks(materialId, page, limit)` calling `GET /materials/:id/chunks` `[ĐỀ-XUẤT]` with safe empty fallback.  
  *AC*: FR-004, FR-007, FR-008, FR-009, PO Q2, PO Q5. *Test*: `npx tsx --test frontend/src/services/materialService.spec.ts` asserting exact relative URL for delete (`/materials/:id`) and multipart upload parameters.

**Checkpoint**: Foundation ready. Mappers and API service clients pass unit tests. User story implementation can now begin.

---

## Phase 3: User Story 1 - Quản lý Danh mục Khóa học & Lưu trữ Mềm theo chuẩn Figma 02.1–02.3 (Priority: P1) 🎯 MVP

**Goal**: Deliver the 2-column Course Management workspace matching Figma frame 02.1 (`483:9637`), Course Creation/Edit modal matching frame 02.2 (`483:9866`), and Course Soft Archive dialog matching frame 02.3 (`483:10111`) per OPD-014 without HTTP 500 errors.

**Independent Test**: Log in as lecturer, navigate to `/lecturer/courses`, verify 2-column layout with course card list on left and overview on right, create a course via modal 02.2, and soft-archive a course with existing materials via dialog 02.3 confirming `is_active = FALSE` without cascade delete.

### Tests for User Story 1 ⚠️

- [ ] T007 [P] [US1] Unit and integration tests for Course management flows in `frontend/src/pages/courses/CoursesPage.spec.ts`  
  *Details*: Test initial render with skeleton loader, rendering of course cards with thumbnail and counts, auto-selection of first course, empty state rendering when courses array is empty, create course form validation (`name` required trimmed `1..255`, `courseCode` optional `max(20)`, `description` optional `max(1000)`), soft-archive confirmation dialog opening and dispatching `PATCH /courses/:courseId/archive` with UI list update, and 403 Forbidden handling for non-lecturer or unowned course.  
  *AC*: FR-001, FR-002, FR-003, FR-013, SC-001. *Test*: `npx tsx --test frontend/src/pages/courses/CoursesPage.spec.ts`.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Refactor and style `CourseCard` component in `frontend/src/components/ds/CourseCard.tsx`  
  *Details*: Align with Figma 02.1 (`483:9637`). Displays course thumbnail cover image, courseCode badge (`radius-sm`, 6px), course name (`text-body-strong`, `#202124`), ready material count and case study count (`text-caption`, `#696A70`). Resting card: white background, radius 12px, no border, no shadow. Selected card: background `#DFEDF9`, border-left 3px solid `#2A4E7F`. Hover state: `0 2px 8px rgba(32,33,36,0.06)`. Zero emojis.  
  *AC*: FR-001, FR-011, R01 §4.3. *Test*: Visual inspection in browser at 1440px viewport.

- [ ] T009 [P] [US1] Refactor and style `CourseOverview` component in `frontend/src/components/ds/CourseOverview.tsx`  
  *Details*: Align with Figma 02.1 (`483:9637`) right detail panel. Header shows course name, courseCode, and active status pill. Detail sections: description paragraph (`text-prose`), summary metric cards (Tài liệu bài giảng, Tình huống Case Study, Ngày tạo), action buttons: "Quản lý tài liệu" (primary Navy `#2A4E7F`, navigates to `PATHS.LECTURER.COURSE_MATERIALS`), "Chỉnh sửa" (tonal `#DFEDF9` / `#2A4E7F`), "Lưu trữ khóa học" (ghost `#696A70` hover `#D11F1F`). Max 1 primary button.  
  *AC*: FR-001, FR-011, R01 §6.1. *Test*: Component render verification in `CoursesPage.spec.ts`.

- [ ] T010 [US1] Implement Course Create and Edit modal dialog in `frontend/src/pages/courses/components/CourseFormDialog.tsx`  
  *Details*: Align with Figma 02.2 (`483:9866`). Integrates `Dialog.tsx` and `Field.tsx`. Fields: Tên khóa học (`name`: required, `trim().length >= 1 && <= 255`, error: `"Tên khóa học không được để trống"`), Mã khóa học (`courseCode`: optional, `length <= 20`, error: `"Mã khóa học tối đa 20 ký tự"`), Mô tả (`description`: optional, `length <= 1000`, textarea `min-h-[120px]`, error: `"Mô tả khóa học tối đa 1000 ký tự"`). In-flight state: submit button shows spinner, inputs disabled. On success: calls `courseService.createCourse()` or `updateCourse()`, shows success toast, closes dialog, refreshes list.  
  *AC*: FR-002, SC-001. *Test*: Form submission and validation tests in `CoursesPage.spec.ts`.

- [ ] T011 [US1] Implement Course Soft Archive confirmation dialog in `frontend/src/pages/courses/components/CourseArchiveDialog.tsx`  
  *Details*: Align with Figma 02.3 (`483:10111`, Dialog `483:10341`). In accordance with OPD-014 and PO Q4, replaces destructive delete with soft archive: displays dialog titled `"Lưu trữ khóa học"` with warning copy: `"Bạn có chắc chắn muốn lưu trữ khóa học này? Khóa học sẽ không còn xuất hiện trong danh sách hoạt động, nhưng toàn bộ tài liệu giảng dạy, đoạn trích RAG và case study liên quan vẫn được bảo toàn nguyên vẹn."` Danger action button labeled `"Xác nhận lưu trữ"`. On confirm: calls `courseService.archiveCourse(courseId)`, displays success toast `"Đã lưu trữ khóa học thành công"`, closes dialog, and removes course from active list without triggering HTTP 500 error.  
  *AC*: FR-003, PO Q4, ATM-Q4. *Test*: Soft-archive test in `CoursesPage.spec.ts` and Acceptance Test Matrix item `ATM-Q4-01`.

- [ ] T012 [US1] Assemble and wire `CoursesPage` in `frontend/src/pages/courses/CoursesPage.tsx`  
  *Details*: Container page on path `PATHS.LECTURER.COURSES`. Implements 2-column layout inside canvas panel (`#F3F6FC`, radius 18px). Left column: header with search input (`SearchField.tsx`), "Tạo khóa học mới" button, course card list with `CourseListSkeleton` while loading, `EmptyState` when 0 courses. Right column: `CourseOverview` for selected course. Enforces ownership check (`currentUser.id === course.lecturerId`), renders `ForbiddenStatusPage` on 403. Auto-selects first course on load.  
  *AC*: FR-001, FR-002, FR-003, FR-011, FR-012, FR-013, SC-001. *Test*: `CoursesPage.spec.ts` end-to-end component rendering and state transitions.

**Checkpoint**: User Story 1 complete and testable independently. Course list, create/edit modal, and soft archive dialog function with zero mock data.

---

## Phase 4: User Story 2 - Quản lý & Tải lên Tài liệu Môn học theo chuẩn Figma 02.4–02.6 (Priority: P1)

**Goal**: Deliver the Materials table view matching Figma frame 02.4 (`483:10342`), Upload dialog matching frame 02.5 (`483:10598`) with zero fake files and strict client validation, and Delete dialog matching frame 02.6 (`483:10890`) calling canonical `DELETE /materials/:id` per PO Q5.

**Independent Test**: Navigate to `/lecturer/courses/:courseId/materials`, verify upper 4-step workflow and lower table, upload a valid PDF (<=50MB) and observe polling transition from PENDING to COMPLETED, verify client rejection of >50MB and invalid file types, test "Tải lên lại" on a FAILED file opening modal with error context per PO Q3, and delete a material verifying call to `DELETE /materials/:id` without premature row removal.

### Tests for User Story 2 ⚠️

- [ ] T013 [P] [US2] Unit and integration tests for Materials management and upload in `frontend/src/pages/materials/MaterialsPage.spec.ts`  
  *Details*: Test material table rendering with 4 status badge states (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), 3s polling timer lifecycle, client-side file validation (rejection of file >50MB with `"Dung lượng tệp vượt quá giới hạn tối đa 50MB"`, rejection of `.exe` with `"Hệ thống chỉ hỗ trợ định dạng PDF hoặc DOCX"`, rejection of 0-byte file with `"Tệp không có nội dung (0 bytes)"`), verification that upload modal opens with 0 fake files in queue, PO Q3 "Tải lên lại" button action opening upload dialog with previous error context without calling fake re-ingest API, and PO Q5 canonical `DELETE /materials/:id` regression verification ensuring row is not removed before HTTP 200/204 response.  
  *AC*: FR-004, FR-005, FR-006, FR-007, FR-008, PO Q3, PO Q5, SC-002, SC-003, SC-004. *Test*: `npx tsx --test frontend/src/pages/materials/MaterialsPage.spec.ts`.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Refactor and style `ProcessingBadge` component in `frontend/src/components/ds/ProcessingBadge.tsx`  
  *Details*: Align with Figma 02.4 (`483:10342`). 4 discrete visual states: `PENDING` (pill `#EEF2F9`, text `#696A70`, dot `#909198`, label `"Đang chờ"`), `PROCESSING` (pill `#DFEDF9`, text `#2A4E7F`, rotating spinner icon, label `"Đang xử lý (X%)"`), `COMPLETED` (pill `#E1F7E9`, text `#007A2D`, icon `CheckCircle2`, label `"Hoàn tất (N đoạn)"`), `FAILED` (pill `#FFE5E5`, text `#D11F1F`, icon `AlertCircle`, label `"Thất bại"`). Zero emojis, vector SVG only.  
  *AC*: FR-005, FR-011, R01 §2.5. *Test*: Visual badge rendering tests in `MaterialsPage.spec.ts`.

- [ ] T015 [US2] Implement Material Upload Modal Dialog in `frontend/src/pages/materials/components/MaterialUploadDialog.tsx`  
  *Details*: Align with Figma 02.5 (`483:10598`). Completely remove legacy hard-coded fake files (excision of `MaterialsPage.tsx:55–75`). Implement drag-and-drop dropzone with `UploadCloud` icon tile (40px, `#DFEDF9`). Client-side validation: format check against `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (error: `"Hệ thống chỉ hỗ trợ định dạng PDF hoặc DOCX"`), size check `sizeBytes <= 52428800` (`MAX_SIZE_BYTES = 50 * 1024 * 1024`, error: `"Dung lượng tệp vượt quá giới hạn tối đa 50MB"`), empty file check `sizeBytes > 0` (error: `"Tệp không có nội dung (0 bytes)"`). Display selected valid files with individual removal buttons and progress bars. Support PO Q3 context: when opened via "Tải lên lại" button, render warning banner showing previous error reason and instruction to select a corrected file. Submit button label `"Tải lên N tệp"` counts only valid files. Submits multipart request `POST /courses/:courseId/materials` with field `file`.  
  *AC*: FR-006, FR-007, PO Q3, SC-002, SC-003, ATM-Q3. *Test*: Upload validation and submission tests in `MaterialsPage.spec.ts` and Acceptance Test Matrix item `ATM-Q3-01`.

- [ ] T016 [US2] Implement Material Delete Confirmation Dialog in `frontend/src/pages/materials/components/MaterialDeleteDialog.tsx`  
  *Details*: Align with Figma 02.6 (`483:10890`). Displays dialog with filename and warning: `"Hành động này sẽ xóa vĩnh viễn tài liệu và các đoạn trích dẫn liên quan khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"` Confirm button labeled `"Xóa vĩnh viễn"`. Calls canonical endpoint `DELETE /materials/:id` via `materialService.deleteMaterial(id)` relative to `/api/v1` base URL without duplicate prefix (PO Q5). Row retention invariant: the table row remains visible during in-flight request and is removed ONLY after HTTP 200/204 confirmation; displays error toast and retains row if API returns 403, 404, or network error.  
  *AC*: FR-008, PO Q5, SC-004, ATM-Q5. *Test*: Delete confirmation tests in `MaterialsPage.spec.ts` and Acceptance Test Matrix item `ATM-Q5-01`.

- [ ] T017 [US2] Assemble Material Table and 3s Polling View in `frontend/src/pages/materials/MaterialsPage.tsx`  
  *Details*: Container page on path `PATHS.LECTURER.COURSE_MATERIALS`. Upper section: 4-step workflow indicator cards and quick dropzone matching Figma 02.4 (`483:10342`). Lower section: materials table with indexing progress bar (`"x/y đã lập chỉ mục"`). Columns: Tên tài liệu, Dung lượng, Trạng thái xử lý (`ProcessingBadge.tsx`), Số đoạn trích, Ngày tải lên, Thao tác ("Xem nguồn" navigates to RAG inspector, "Tải lên lại" for FAILED rows, "Xóa" opens delete dialog). PO Q3 intended deviation: FAILED action button labeled `"Tải lên lại"` (or `"Chọn tệp tải lại"`), opening `MaterialUploadDialog` with error context. Polling mechanism: automatically polls `GET /courses/:courseId/materials` every 3s if any row is in `PENDING` or `PROCESSING` status; updates row states in place without whole-page flicker or layout shift. Handles 5-minute timeout warning. EmptyState when 0 materials.  
  *AC*: FR-004, FR-005, FR-006, FR-008, FR-011, FR-012, SC-001, SC-002. *Test*: `MaterialsPage.spec.ts` polling and action tests.

**Checkpoint**: User Story 2 complete. Materials table, 3s polling, zero-fake upload modal, "Tải lên lại" action, and canonical `DELETE /materials/:id` operational.

---

## Phase 5: User Story 3 - Kiểm tra Đoạn trích RAG (Source Inspector) theo chuẩn Figma 02.7 (Priority: P2)

**Goal**: Deliver the RAG Source Inspector workspace matching Figma frame 02.7 (`483:11148`), displaying 3 metric cards, connecting to real chunks if available via proposed API `GET /materials/:id/chunks`, displaying an honest Empty/Info state when API is pending per PO Q2, and completely eliminating `MOCK_CHUNKS` and `OTHER_DOCUMENTS`.

**Independent Test**: Navigate to `/lecturer/courses/:courseId/materials/:materialId/rag`, verify 3 metric cards (Đoạn trích, Số trang, Dung lượng), verify complete absence of mock data, and verify honest empty fallback or real chunks.

### Tests for User Story 3 ⚠️

- [ ] T018 [P] [US3] Unit and contract tests for RAG Source Inspector in `frontend/src/pages/materials/RagSourceInspectorPage.spec.ts`  
  *Details*: Test page header render with back navigation button, 3 metric cards rendering calculated values from Material model (`chunkCount`, page count, formatted size in KB/MB), assertion that `MOCK_CHUNKS` and `OTHER_DOCUMENTS` do not exist in test DOM or module exports, rendering of real chunk cards when `getMaterialChunks()` returns data, and rendering of honest EmptyState (`"Tính năng duyệt nội dung chi tiết từng đoạn trích đang được đồng bộ với API chỉ mục RAG"`) when endpoint returns 404 or empty array per PO Q2.  
  *AC*: FR-009, PO Q2, SC-002. *Test*: `npx tsx --test frontend/src/pages/materials/RagSourceInspectorPage.spec.ts`.

### Implementation for User Story 3

- [ ] T019 [P] [US3] Refactor and style `MetricCard` component in `frontend/src/components/ds/MetricCard.tsx`  
  *Details*: Align with Figma 02.7 (`483:11148`). Layout: 40px icon tile (`#DFEDF9`, icon `#2A4E7F`), metric value (`text-metric`, 28px/36px, weight 500, `#202124`), metric label (`text-caption`, `#696A70`), optional helper description. Flat card: white surface, radius 12px, no border, no shadow.  
  *AC*: FR-009, FR-011, R01 §4.1. *Test*: Component render verification in `RagSourceInspectorPage.spec.ts`.

- [ ] T020 [US3] Implement RAG Chunks Data Client in `frontend/src/services/materialService.ts`  
  *Details*: Implement `getMaterialChunks(materialId: string, page = 1, limit = 20)` calling `GET /materials/:id/chunks` `[ĐỀ-XUẤT]`. If endpoint returns HTTP 404 or fails due to backend endpoint pending, catch error gracefully and return empty array with `{ isPendingApi: true }` flag to trigger authentic EmptyState instead of crashing or generating fake mock chunks.  
  *AC*: FR-009, PO Q2. *Test*: Mocked API test in `materialService.spec.ts`.

- [ ] T021 [US3] Assemble RAG Source Inspector Page in `frontend/src/pages/materials/RagSourceInspectorPage.tsx`  
  *Details*: Container page on path `PATHS.LECTURER.MATERIAL_SOURCES`. Completely delete `MOCK_CHUNKS` (line 18) and `OTHER_DOCUMENTS` (line 53). Top bar: `BackIconButton` linking back to `PATHS.LECTURER.COURSE_MATERIALS`, document title, material status badge, upload date. Header section: 3 `MetricCard` components (Đoạn trích trích xuất, Số trang tài liệu, Dung lượng tệp). Body section: if real chunks available, render chunk list cards (showing chunk index, page number, clean normalized content); if API is pending per PO Q2, render authentic `EmptyState` with info icon tile, title `"Đang đồng bộ đoạn trích RAG"`, and description `"Tính năng duyệt nội dung chi tiết từng đoạn trích đang được đồng bộ với API chỉ mục RAG. Dữ liệu vector đã được lưu trữ an toàn trong pgvector."` Zero fake data.  
  *AC*: FR-009, FR-011, FR-012, PO Q2, SC-001, SC-002. *Test*: `RagSourceInspectorPage.spec.ts` integration rendering.

**Checkpoint**: User Story 3 complete. RAG Source Inspector renders 3 metric cards with 100% real data or honest empty fallback; all legacy mock chunks excised.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: System-wide regression verification, production build validation, and visual inspection against Figma Page 08 frames.

- [ ] T022 [P] Comprehensive QA Regression & Acceptance Matrix Verification in `frontend/src/qa/qa-matrix.spec.ts`  
  *Details*: Execute full QA regression matrix covering QA-003 (Courses & Soft Archive) and QA-004 (Materials, Upload, Delete, and RAG Source Inspector). Validate all 9 test scenarios in the Acceptance Test Matrix (ATM-Q3-01..03, ATM-Q4-01..03, ATM-Q5-01..03).  
  *AC*: Jira AC 2, SC-001, SC-002, SC-003, SC-004. *Test*: `npx tsx --test frontend/src/qa/qa-matrix.spec.ts`.

- [ ] T023 Run production build and TypeScript compilation check in `frontend/`  
  *Details*: Execute `npm run build` (`tsc -b && vite build`) at `frontend/` root to verify zero TypeScript errors, zero TailwindCSS warnings, and zero unresolved imports.  
  *AC*: SC-005, Jira AC 5. *Test*: Command line exit code 0.

- [ ] T024 Perform Browser Visual Inspection at 1440px Viewport against Figma Page 08 Frames 02.1–02.7  
  *Details*: Execute Quality Gate 3 (QG3) visual comparison in browser against canonical Figma Page 08 frames: `02.1` (`483:9637`), `02.2` (`483:9866`), `02.3` (`483:10111`), `02.4` (`483:10342`), `02.5` (`483:10598`), `02.6` (`483:10890`), `02.7` (`483:11148`). Verify 2-column layout, flat card surfaces, Navy `#2A4E7F` brand action buttons, 6px status dots, vector SVG icons, and zero emojis. Document evidence in verification report.  
  *AC*: SC-001, Jira AC 1, R01 §1–§6. *Test*: Visual QA checklist.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup (T001, T002)
       │
       ▼
Phase 2: Foundational (T003, T004, T005, T006) ──► BLOCKS all User Stories
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
Phase 3: User Story 1 (T007–T012)        Phase 4: User Story 2 (T013–T017)
  [Courses Management & Soft Archive]       [Materials & Upload & Delete]
       │                                         │
       └────────────────────┬────────────────────┘
                            ▼
                 Phase 5: User Story 3 (T018–T021)
                    [RAG Source Inspector]
                            │
                            ▼
                 Phase 6: Polish (T022–T024)
              [QA Matrix, Build, Visual QG3]
```

- **Setup (Phase 1)**: Independent; can start immediately.
- **Foundational (Phase 2)**: Depends on Setup; MUST be 100% complete before User Stories begin.
- **User Story 1 (Phase 3)**: Depends on Foundational completion. Delivers MVP course management.
- **User Story 2 (Phase 4)**: Depends on Foundational completion. Can proceed in parallel with US1 if staffed.
- **User Story 3 (Phase 5)**: Depends on Foundational completion and Material model from US2.
- **Polish (Phase 6)**: Depends on all user stories completing.
- **Convergence (Phase 7)**: T028 runs first and blocks every other task in the phase; T025–T027 (CRITICAL) must be settled before Phase 3–5 code is merged; T030 gates T005 `archiveCourse`, T011, T020 and T021 (BLOCKED-ON-BE); T035 and T038 run last, after Phase 6.

### Within Each User Story

1. Write tests FIRST and confirm test harnesses are in place (`*.spec.ts`).
2. Design system primitives and dialog components before container pages.
3. Service calls wired to components with in-flight loading and error states.
4. Acceptance criteria validated before declaring story complete.

### Parallel Opportunities

- **Phase 1**: `T002` (localization) runs in parallel with `T001`.
- **Phase 2**: `T003` (Course mapper), `T004` (Material mapper), `T005` (Course service), and `T006` (Material service) can all run in parallel as they touch independent files.
- **Phase 3**: `T007` (test), `T008` (`CourseCard`), and `T009` (`CourseOverview`) can be developed in parallel.
- **Phase 4**: `T013` (test), `T014` (`ProcessingBadge`), and `T015` (`MaterialUploadDialog`) can be developed in parallel.
- **Phase 5**: `T018` (test), `T019` (`MetricCard`), and `T020` (chunks client) can be developed in parallel.

---

## Parallel Example: User Story 1 & User Story 2

```bash
# Parallel Track A (Courses):
Task T008: "Refactor CourseCard in frontend/src/components/ds/CourseCard.tsx"
Task T009: "Refactor CourseOverview in frontend/src/components/ds/CourseOverview.tsx"
Task T010: "Implement CourseFormDialog in frontend/src/pages/courses/components/CourseFormDialog.tsx"

# Parallel Track B (Materials):
Task T014: "Refactor ProcessingBadge in frontend/src/components/ds/ProcessingBadge.tsx"
Task T015: "Implement MaterialUploadDialog in frontend/src/pages/materials/components/MaterialUploadDialog.tsx"
Task T016: "Implement MaterialDeleteDialog in frontend/src/pages/materials/components/MaterialDeleteDialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`T001`, `T002`).
2. Complete Phase 2: Foundational (`T003`–`T006`).
3. Complete Phase 3: User Story 1 (`T007`–`T012`).
4. **STOP and VALIDATE**: Test `/lecturer/courses` independently (create course, view overview, soft-archive course).
5. Deliver MVP slice.

### Incremental Delivery

1. **Increment 1**: Foundation + User Story 1 (Courses Management & Soft Archive OPD-014).
2. **Increment 2**: User Story 2 (Materials Table, Client Upload Validation, 3s Polling, "Tải lên lại" Action, and Canonical `DELETE /materials/:id`).
3. **Increment 3**: User Story 3 (RAG Source Inspector with 3 Metric Cards and Zero Mock Chunks).
4. **Increment 4**: Polish, Full QA Acceptance Matrix, and Browser Visual Inspection QG3.

---

## Acceptance Test Matrix (PO Decisions Q3, Q4, Q5)

This Acceptance Test Matrix operationalizes the explicit directives provided by the Product Owner (PO) on 2026-11-15 regarding Questions Q3, Q4, and Q5. Every test scenario is mapped to specific preconditions, user triggers, exact API calls, expected UI feedback, and regression verification tasks.

### Matrix Summary Table

| Test ID | PO Topic | Category | Preconditions | Trigger / Action | Exact API Request | Expected UI Behavior & Feedback | Postconditions & Invariant | Test File & Task |
|---|---|---|---|---|---|---|---|---|
| **ATM-Q3-01** | Q3: Re-upload | Happy Path | Material in table has status `FAILED` with `processing_error` | Lecturer clicks action button `"Tải lên lại"` (Figma node `586:8570`) | None upon click (opens UI modal) | `MaterialUploadDialog` opens with previous error context banner; dropzone is active | Old `FAILED` record is NOT deleted before new upload; modal queue starts clean | `MaterialsPage.spec.ts` (`T013`, `T015`) |
| **ATM-Q3-02** | Q3: Re-upload | Upload Trigger | Upload modal open with error context; user selects corrected PDF `<= 50MB` | Lecturer clicks `"Tải lên 1 tệp"` | `POST /courses/:courseId/materials` (multipart `file`) | Modal closes; new row created in table with `PENDING` badge; success toast shown | New material record initiated; 3s polling commences; old FAILED row preserved until user deletes | `MaterialsPage.spec.ts` (`T013`, `T015`, `T017`) |
| **ATM-Q3-03** | Q3: Re-upload | Negative Path | Upload modal open via "Tải lên lại"; user drops corrupted or oversized file | User drops invalid file into dropzone | No API call made | Client rejects file immediately with localized error; submit button remains disabled | Zero fake success messages; error banner clearly describes rejection reason | `MaterialsPage.spec.ts` (`T013`, `T015`) |
| **ATM-Q4-01** | Q4: Soft Archive | Happy Path | Active course exists with linked materials and case studies (`is_active = TRUE`) | Lecturer clicks `"Lưu trữ khóa học"` on CourseOverview panel | None upon click (opens confirmation dialog) | `CourseArchiveDialog` (02.3) opens warning that course will be hidden but data preserved | Dialog explicitly mentions soft archive per OPD-014, not hard delete | `CoursesPage.spec.ts` (`T007`, `T011`) |
| **ATM-Q4-02** | Q4: Soft Archive | Confirm Action | Confirmation dialog open; lecturer clicks `"Xác nhận lưu trữ"` | `PATCH /courses/:courseId/archive` `[ĐỀ-XUẤT]` | In-flight button spinner; dialog closes; success toast `"Đã lưu trữ khóa học thành công"` | Course `is_active` set to `FALSE`; course removed from active list; materials/chunks preserved | Zero HTTP 500 foreign key constraint errors; MinIO objects and pgvector chunks 100% intact | `CoursesPage.spec.ts`, `qa-matrix.spec.ts` (`T011`, `T022`) |
| **ATM-Q4-03** | Q4: Soft Archive | Security / 403 | Lecturer attempts to archive a course owned by another lecturer | Request sent with foreign `courseId` | `PATCH /courses/:foreignId/archive` | Error toast `"Bạn không có quyền thao tác trên khóa học này"` (403 Forbidden) | Target course remains completely unmodified; no unauthorized archival | `CoursesPage.spec.ts` (`T007`, `T011`) |
| **ATM-Q5-01** | Q5: Delete Route | Happy Path | Material exists in table under owned course | Lecturer clicks `"Xóa"` on row and confirms in dialog 02.6 | `DELETE /materials/:id` (relative to `/api/v1` base URL) | Row displays in-flight spinner; row removed from table ONLY after HTTP 200/204 response | Correct canonical route called (NOT `/courses/:courseId/materials/:id`); chunks deleted | `materialService.spec.ts`, `MaterialsPage.spec.ts` (`T006`, `T013`, `T016`) |
| **ATM-Q5-02** | Q5: Delete Route | Retention Invariant | Material delete requested; backend returns HTTP 500 or network drops | Lecturer confirms delete; API fails | `DELETE /materials/:id` returns error | Error toast `"Không thể xóa tài liệu. Vui lòng thử lại"`; row is RETAINED in table | Row is NOT prematurely removed from UI; optimistic deletion prohibited | `MaterialsPage.spec.ts` (`T013`, `T016`) |
| **ATM-Q5-03** | Q5: Delete Route | Ownership / 403 | Lecturer attempts to delete a material belonging to another lecturer's course | API request intercepted or manipulated | `DELETE /materials/:id` returns 403 | Error toast `"Bạn không có quyền xóa tài liệu này"`; row remains visible in table | Authorization boundary strictly enforced; material record preserved | `materialService.spec.ts`, `MaterialsPage.spec.ts` (`T006`, `T013`) |

---

### Detailed Test Specifications

#### 1. PO Q3 Detailed Test: Failed Material Re-upload Semantics ("Tải lên lại")

- **Background & Context**: Under legacy implementation, clicking "Thử lại" on a FAILED row merely reloaded the list without performing re-ingestion, as no backend re-ingest API exists. PO Decision Q3 renames the action to "Tải lên lại" (intended deviation from Figma node `586:8570`) and requires opening the upload dialog with the previous error context.
- **Test Case ATM-Q3-01 (Dialog Context Verification)**:
  - *Setup*: Seed mock material `{ id: "mat-1", processing_status: "FAILED", processing_error: "PDF scan không thể trích xuất văn bản", original_filename: "lecture1.pdf" }`.
  - *Execution*: In `MaterialsPage`, locate row `mat-1`. Assert action button text is `"Tải lên lại"` (not `"Thử lại"`). Click button.
  - *Assertion*: `MaterialUploadDialog` is visible. Header shows `"Tải lên lại tài liệu"`. Alert banner displays `"Tệp lecture1.pdf trước đó xử lý thất bại: PDF scan không thể trích xuất văn bản. Vui lòng chọn tệp thay thế hoặc tệp đã sửa."`
- **Test Case ATM-Q3-02 (New Upload Dispatch & Non-Deletion of Old Record)**:
  - *Setup*: From dialog opened in ATM-Q3-01, attach valid file `lecture1_v2.pdf` (2MB).
  - *Execution*: Click `"Tải lên 1 tệp"`.
  - *Assertion*: Verifies request is dispatched to `POST /courses/:courseId/materials` with multipart field `file`. Does NOT call any fake re-ingest API. Does NOT call `DELETE /materials/mat-1`. Table appends new material row with `PENDING` badge.

#### 2. PO Q4 Detailed Test: Course Soft Archive per OPD-014

- **Background & Context**: Deleting a course with child materials previously produced an unhandled HTTP 500 error due to database foreign key constraints. PO Decision Q4 confirms OPD-014: courses use soft archive (`courses.is_active = FALSE`), preserving all child materials, pgvector chunks, and MinIO objects.
- **Test Case ATM-Q4-01 (Dialog Text & Warning Verification)**:
  - *Setup*: Seed course with 2 materials and 1 case study.
  - *Execution*: On `CoursesPage`, select course. Click `"Lưu trữ khóa học"` on `CourseOverview`.
  - *Assertion*: Dialog 02.3 renders. Dialog title is `"Lưu trữ khóa học"`. Body copy explicitly states: `"Toàn bộ tài liệu giảng dạy, đoạn trích RAG và case study liên quan vẫn được bảo toàn nguyên vẹn."` Danger button is labeled `"Xác nhận lưu trữ"`.
- **Test Case ATM-Q4-02 (API Dispatch & Zero HTTP 500)**:
  - *Setup*: Dialog 02.3 is active.
  - *Execution*: Click `"Xác nhận lưu trữ"`.
  - *Assertion*: `courseService.archiveCourse(courseId)` is invoked, sending `PATCH /courses/:courseId/archive` `[ĐỀ-XUẤT]`. Server returns HTTP 200 `{ "status": "SUCCESS", "data": { "id": courseId, "is_active": false } }`. Course disappears from active courses list. Database verification asserts linked materials and chunks remain in database. Zero HTTP 500 errors.

#### 3. PO Q5 Detailed Test: Material Delete Route Alignment & Retention Invariant

- **Background & Context**: Legacy `MaterialsPage.tsx:789` called `DELETE /courses/:courseId/materials/:id`, whereas the backend controller provides `DELETE /materials/:id`. PO Decision Q5 mandates fixing this route directly in FE-026 and verifying that table rows are not prematurely deleted before HTTP confirmation.
- **Test Case ATM-Q5-01 (Canonical Route Verification)**:
  - *Setup*: Seed course with material `{ id: "mat-99", original_filename: "syllabus.pdf" }`.
  - *Execution*: Click `"Xóa"` on row `mat-99`. Confirmation dialog 02.6 appears. Click `"Xóa vĩnh viễn"`.
  - *Assertion*: Intercept outgoing HTTP request. Assert URL is exactly `/api/v1/materials/mat-99` (relative to API base URL). Assert method is `DELETE`. Assert no `/courses/` prefix exists in URL path.
- **Test Case ATM-Q5-02 (Row Retention Invariant on Failure)**:
  - *Setup*: Mock `DELETE /materials/mat-99` to return HTTP 500 Server Error.
  - *Execution*: Confirm deletion in dialog 02.6.
  - *Assertion*: Dialog closes. Toast displays error: `"Không thể xóa tài liệu. Vui lòng thử lại sau."` Row `mat-99` MUST remain in the materials table. Row count does not decrease.

---

## Phase 7: Convergence

**Purpose**: Gaps found by `/speckit-converge` on 2026-11-15 against branch `docs/spec-kit-workflow` (develop `273f1fc`, FE-023 not merged, no FE-026 code). Evidence is cited as `file:line` on that snapshot and MUST be re-checked on the merged `develop` before work starts. T028 runs first; every other task here is BLOCKED until T028 records a passing result. Tasks above (T001–T024) remain the source of the main work; these tasks only add what they miss or contradict.

- [ ] T025 CRITICAL: Remove every fabricated-data fallback from the legacy pages while porting them, show `ErrorState`/`EmptyState` instead, and add a repo grep test that fails if any remain. Known sites: `MOCK_COURSES` and hard-coded `caseCount` fallbacks (`CoursesPage.tsx:34-59`, `:646`), demo fallback course "CS402" and fake `displayMaterials` rows when the list is empty (`MaterialsPage.tsx:331-400`), 3 fake upload files (`MaterialsPage.tsx:55-75`), `MOCK_CHUNKS` (`RagSourceInspectorPage.tsx:18`) and `OTHER_DOCUMENTS` (`:53`). Test file: `frontend/src/qa/no-fake-data.spec.ts` (add to the `test` script). per Constitution (fake data where the API gives none) / FND §6, SC-002, FR-007, FR-009 (contradicts)

- [ ] T026 CRITICAL: Resolve every route/field that the spec, plan or tasks use without a source (AGENTS.md rules 7–8). For each, either cite the source or render an honest absent state and report the gap to the PO; invent nothing. Items: (a) cover image / `cover_image_url` (no `courses` column in `V1__init_schema.sql:33-42`, not in `CreateCourseDto`; T003, T008, spec 02.2); (b) PROCESSING percentage `Đang xử lý (X%)` (no progress field in `teaching_materials`; T014, FR-005); (c) "Số trang" metric (no page count on material; T018/T021, FR-009); (d) `tokenCount` (absent from `document_chunks`, `V4__document_chunks.sql`); (e) `materialCount` / `caseCount` / `readyMaterialCount` (not returned by `GET /courses`, `course.service.ts:30-38`; define a derivation without N+1 calls or report the gap); (f) plan §4 names table `material_chunks` and field `content`, but the real table is `document_chunks` with `chunk_text`; (g) `GET /courses/my-courses` fallback in `courseService.ts:18` has no backend route, so remove it, and drop the same route from the legacy `frontend/src/qa/qa-matrix.spec.ts` (lines 13, 71, 269-271); (h) `document_chunks.page_number` exists per chunk (`V4__document_chunks.sql:24`, nullable) but no page count exists per material: either derive "Số trang" from the chunks endpoint once T030 delivers it, or render an honest absent state; `teaching_materials.chunk_count` is nullable with no default (`V1__init_schema.sql:57`), so the mapper must handle `null`, not assume `0`. Record the outcome per item in `specs/001-fe026-courses-materials/contracts/` as UNKNOWN/derived/omitted. per Constitution (no route or field without source), FR-001, FR-005, FR-009, plan: API envelope and mapping (partial)

- [ ] T027 CRITICAL: Reconcile the plan's technology list with what exists. Plan §2 lists Vitest, React Testing Library, `@tanstack/react-query`, `lucide-react`, `clsx`, `tailwind-merge`; `frontend/package.json` on develop has none of them, and CLAUDE.md fixes the Node test runner via `tsx`. After FE-023 merges, check `package.json`; for each missing package either confirm FE-023 added it or raise an ADR and PO approval request. Do not add a dependency without that approval. Spec §3.3 and FR-011 require Lucide icons, so `lucide-react` is the first one to settle. per Constitution (technology without ADR/PO approval), plan: Technical Context (contradicts)

- [ ] T028 HIGH: Run the Q1 pre-implementation gate and write the evidence to `specs/001-fe026-courses-materials/preflight.md`: `git rev-parse develop`, proof that FE-023 is merged, and the real presence of `src/components/ds/`, `src/components/feedback/` (EmptyState, ErrorState, Skeleton), `src/routes/paths.ts` with the exact names `PATHS.LECTURER.COURSES`, `COURSE_MATERIALS`, `MATERIAL_SOURCES`, `ForbiddenStatusPage`, `SearchField`, `BackIconButton`, `src/locales/`, `frontend/tests/visual/`, and `npm run test:visual`. Then re-verify the plan's target layout (`pages/courses/`, `pages/materials/`) against what actually merged and report differences instead of adapting silently. On snapshot `273f1fc` none of these exist (pages are in `pages/lecturer/`, no `routes/`, `locales/`, `components/ds`, `tests/visual`). T001 only checks `paths.ts` and does not cover this. per FR-010, PO Q1, plan Phase 3 hold condition (missing)

- [ ] T029 HIGH: Stop using hard delete for courses. Remove `courseService.deleteCourse` (`courseService.ts`, `DELETE /courses/:id`) and `DeleteCourseModal` (`CoursesPage.tsx:549-568`, used at `:780`) in favour of `CourseArchiveDialog`. While backend `PATCH /courses/:courseId/archive` does not exist (see T030), the "Lưu trữ khóa học" action must show an honest "chưa khả dụng" state and must never fall back to `DELETE /courses/:id` (`course.controller.ts` still exposes it and the service runs a raw `DELETE FROM courses`, the source of the 500). Test: no call to `DELETE /courses/*` anywhere in `frontend/src`. per FR-003, PO Q4 / OPD-014 (contradicts)

- [ ] T030 HIGH: Write the two BE dependency proposals as files in `specs/001-fe026-courses-materials/contracts/be-dependencies.md` (proposal only: no sprint, Jira or backend code change without PO approval) and gate FE tasks on them. (1) `PATCH /courses/:id/archive` setting `is_active = FALSE`: ownership check, same envelope, listing filters. Today `getCoursesByLecturer` and `getCourseById` do not filter `is_active` (`course.service.ts:30-50`), and consumers still treat an archived course as active (`case.service.ts:37` case creation, `material.service.ts:52` upload, student and admin course pages); list each consumer and the behaviour required. Integration tests must prove courses, `teaching_materials`, `document_chunks` and MinIO objects survive archiving, plus 403 for a foreign owner. (2) `GET /materials/:id/chunks` over `document_chunks` (ordered by `chunk_index`, pagination, ownership through `teaching_materials` → `courses.lecturer_id`, integration test with real data). Mark T005 `archiveCourse`, T011, T020, T021 as BLOCKED-ON-BE: they may be built against the contract but must not be reported done until the endpoints exist (PO Q2: do not claim the screen is functionally complete). per PO Q2, PO Q4, plan §4 Proposed Tasks 2–3 (missing)

- [ ] T031 HIGH: Align client validation with the real backend DTOs. `CreateCourseDto` limits the name to `MinLength(2)` and `MaxLength(200)` (`create-course.dto.ts:5-6`) but T003, T007 and T010 specify `min(1)`/`max(255)`, so a 1-character name and a 201–255 character name pass the client and fail with 400. Read `UpdateCourseDto`, set client limits equal to the DTOs (name 2..200, `courseCode` 20, description 1000), map backend 400 messages to field errors, and add boundary tests (1/2 and 200/201). Also confirm the material filename limit against `V1__init_schema.sql` (`VARCHAR(500)`) before using 255 in T004. per FR-002, AGENTS.md rule 7 (contradicts)

- [ ] T032 HIGH: Make the planned tests exercise real code. The existing `frontend/src/pages/lecturer/CoursesPage.spec.ts` re-implements its logic inline and never imports the page, and node:test (`npx tsx --test`) cannot render React components without a DOM harness (see T027). Extract validators, mappers, state computation and the delete/upload flows into plain modules, test those through their real exports with an injected HTTP client, and cover DOM behaviour through Playwright. `frontend/src/qa/qa-matrix.spec.ts` already exists on `develop` (it is in the `test` script and still targets `/courses/my-courses`), so T022 must update it instead of creating it. Add every new spec to the `test` script in `frontend/package.json` (CLAUDE.md requirement; none of T001–T024 does it) and drop the stale `src/pages/lecturer/CoursesPage.spec.ts` entry once the page moves. Verify with `cd frontend && npm test` exit code 0 and show the new files in the run output. per AGENTS.md rule 10, plan: Testing, SC-002–SC-004 (partial)

- [ ] T033 HIGH: Put UI text in the locale files CLAUDE.md prescribes: `frontend/src/locales/courses.vi.json` / `courses.en.json` and `materials.vi.json` / `materials.en.json`, one top-level key each, merged automatically, Vietnamese default with an English file carrying the same keys. T002 instead edits `vi.json` / `states.vi.json` and asserts "zero English fallback copy", which conflicts with the required English pair. Replace that test with a key-parity test (vi keys equal en keys) and a test that no Vietnamese-UI string is hard-coded in the three pages. per FR-012, CLAUDE.md frontend rules (contradicts)

- [ ] T034 HIGH: Use `src/index.css` `@theme` tokens instead of the raw hex values written in T008, T009, T014 and T019 (`#2A4E7F`, `#DFEDF9`, `#E1F7E9`, `#D11F1F` etc.). First compare spec §3.3 against the real `@theme` and list each mismatch for the PO (spec notes that the workspace copy of `01-ui-design-standards.md` still carries the old palette; do not pick a winner). Add a test that fails on a raw hex in the new page and component files when a token exists, and state "tokens provisional, not Ready for Dev" (AGENTS.md rule 9) in the evidence. per FR-011, CLAUDE.md (tokens), Constitution (raw value where a token exists) (contradicts)

- [ ] T035 HIGH: Turn T024 into the real Visual QA gate. Read file key, page and the 7 frame IDs from Figma and check them against `docs/05_FIGMA.md` before comparing; export each frame PNG at scale 1 into `frontend/tests/visual/figma/`; register 02.1–02.7 with their mismatch budgets in `frontend/tests/visual/screens.ts` (modal frames 02.2, 02.3, 02.5, 02.6 need fixtures that open the dialog); run `npm run test:visual` at 1440px with the frame heights; record comparison images and DOM measurements within 1px (known Chrome text rendering accepted, never compensated). The comparison must be done by `visual-qa-verifier`, not by the implementer. Record the intentional "Tải lên lại" deviation from node `586:8570` as an accepted difference, not a failure. per SC-001, spec §9.2, CLAUDE.md Visual QA gate (partial)

- [ ] T036 HIGH: Cover the Q3 and edge-case behaviour that T015/T016/T017 omit. (a) Upload dialog opened from a FAILED row must say plainly that re-uploading may create a new material record and that the old FAILED record is not removed (PO Q3); (b) on network loss the file stays in the queue with a retry action and no re-pick (spec edge case); (c) delete is disabled with tooltip, or needs an extra confirmation, while a material is `PROCESSING` (spec edge case); (d) dialog 02.6 states the file name and the number of chunks to be removed from `chunk_count` (spec §3.2 02.6; T016 copy has no count); (e) the 5-minute PROCESSING warning text and its test with a fake clock. Tests in `MaterialsPage` logic specs (see T032). per FR-006, FR-007, FR-008, spec Edge Cases, PO Q3 (partial)

- [ ] T037 MEDIUM: Complete the PO Q5 evidence. The legacy delete in `MaterialsPage.tsx:789-790` calls `apiClient` directly and ends in an empty `catch {}`; move it behind `materialService.deleteMaterial` and add tests through that service for each outcome Q5 lists (200, 204, 403, 404, 500, network error): the row stays until success, the list is re-fetched from the API after success, and each failure shows its own message. T006 and T013 only assert the URL and the 500 case. Re-run the same checks on the integrated `develop` after merge, because Q5 requires it. per FR-008, SC-004, PO Q5 (partial)

- [ ] T038 MEDIUM: Produce the closing evidence report `specs/001-fe026-courses-materials/verification-report.md` after all tasks pass: acceptance scenarios handled (US1–US3), frames implemented, test commands with exit codes (`npm test`, `npm run build`, `npm run lint`, `npm run test:visual`), remaining issues with reasons and the BLOCKED-ON-BE items from T030. Map QG1–QG4 to evidence before commit/PR and QG7 (retest on `develop` at the merge SHA) before Jira Done. Do not mark FE-026 DONE from checklist ticks alone. per AGENTS.md rule 10, FEATURE-DELIVERY-WORKFLOW.md §5 (partial)

- [ ] T039 LOW: Check the course-list search input (`SearchField.tsx` in T012) against Figma 02.1 (`483:9637`). Neither FR-001 nor Spec §3.2 lists a search field; if the frame does not show it, remove it, otherwise cite the frame node in the task evidence. per FR-001 (unrequested)
