# Implementation Plan: Courses & Materials Screens Rework to Figma 02.1–02.7 [FE-026]

**Branch**: `docs/spec-kit-workflow` | **Date**: 2026-11-15 | **Spec**: [specs/001-fe026-courses-materials/spec.md](./spec.md)  
**Parent Task**: Jira `EBA-89` (Sprint 3) · Master Tasks `EBA-101`, `EBA-102`, `EBA-201`–`EBA-207`, `EBA-217`, `EBA-218`  
**Input**: Feature specification from `specs/001-fe026-courses-materials/spec.md`  

---

## 1. Summary

This plan governs the visual rework and behavioral hardening of the Courses and Materials screens for the Lecturer Portal to align 100% with canonical Figma Page `08 · EduBranch – Bản hoàn chỉnh` (frames `02.1` to `02.7`). 

### Core Architectural Decisions & Strategy:
1. **Target Structure Dependency (PO Q1)**: Plan FE-026 against the FE-023 modular target structure (`frontend/src/pages/courses/CoursesPage.tsx`, `pages/materials/MaterialsPage.tsx`, `pages/materials/RagSourceInspectorPage.tsx`, `components/ds/`, `components/feedback/`, `routes/paths.ts`, `locales/`). Product code implementation will NOT occur on the legacy structure and will strictly await FE-023 being merged into `develop`.
2. **Zero Fake Data Policy & Missing API ≠ Empty Data (PO Q2 & Jira AC 4)**: Completely excise `MOCK_CHUNKS`, `OTHER_DOCUMENTS`, and hard-coded fake upload items. Frame 02.7 connects to real chunks via proposed backend task `BE-PROP-1` (`GET /materials/:id/chunks`, see `specs/001-fe026-courses-materials/be-dependencies.md`). The UI shows `EmptyState` ONLY for a 200 OK response with an empty list (`items: []`); missing endpoints (404), 403, 5xx, and network errors display an authentic `ErrorState` with the real failure reason and a retry action where sensible, never an empty list, and never cached or mocked data.
3. **Failed Material Semantics (PO Q3 & Review R2-4)**: The FAILED material action is renamed to "Tải lên lại" (Upload again) as an intended deviation from Figma node `586:8570`. Clicking opens the upload modal with the previous error context to upload a corrected file via existing `POST /courses/:courseId/materials`. No fake re-ingestion API is called.
4. **Soft Archive via OPD-014 (PO Q4 & Review R2-3)**: Frame 02.3 replaces destructive deletion with soft archive, eliminating the HTTP 500 error on courses with materials. Schema evaluation confirms that reusing the existing `is_active` column on the `courses` table (`courses.is_active = FALSE` per `backend/migrations/V1__init_schema.sql:39`) fulfills all OPD-014 requirements without creating parallel columns or mechanisms.
5. **Route Alignment (PO Q5 & Review R2-1)**: Fix `DELETE /materials/:id` directly in frontend `materialService.ts` relative to `/api/v1` base URL.
6. **API Response Envelope & Model Mapping (Review R3-1)**: All existing backend endpoints return `{ "status": "SUCCESS", "data": ... }` with snake_case fields (`course_code`, `lecturer_id`, `is_active`, `original_filename`, `stored_object_key`, `mime_type`, `size_bytes`, `processing_status`, `chunk_count`, `processing_error`, `uploaded_at`). Clean mapping to frontend camelCase models is encapsulated in `frontend/src/services/mappers/course.ts` and `material.ts`. All proposed endpoints (`PATCH /courses/:id/archive`, `GET /materials/:id/chunks`) adopt the identical envelope.

---

## 2. Technical Context

- **Language/Version**: `typescript ~6.0.2`, React 19 (`react ^19.2.8`, `react-dom ^19.2.8`), Node.js 20 LTS
- **Build Tooling & Styling**: `vite ^8.3.0`, `@vitejs/plugin-react ^6.1.1`, `tailwindcss ^4.3.3`, `@tailwindcss/postcss ^4.3.3`, `postcss ^8.5.28`, `autoprefixer ^10.5.6`, `oxlint ^1.81.0`
- **Present on develop** (`develop 273f1fc`, `frontend/package.json`):
  - `dependencies`: `@tailwindcss/postcss ^4.3.3`, `axios ^1.20.0`, `react ^19.2.8`, `react-dom ^19.2.8`, `react-router-dom ^7.18.3`, `reactflow ^11.11.4`, `zustand ^5.0.15`
  - `devDependencies`: `@types/node ^24.13.3`, `@types/react ^19.2.18`, `@types/react-dom ^19.2.7`, `@vitejs/plugin-react ^6.1.1`, `autoprefixer ^10.5.6`, `oxlint ^1.81.0`, `postcss ^8.5.28`, `tailwindcss ^4.3.3`, `typescript ~6.0.2`, `vite ^8.3.0`
  - `scripts`: `build` = `tsc -b && vite build`; `lint` = `oxlint`; `test` = `npx tsx --test <explicit list of 7 spec files>` (Node test runner; `tsx` is not a dependency, `npx` downloads it)
  - *Stack clarification*: There is NO Vitest, NO React Testing Library, NO Playwright, NO `@tanstack/react-query`, NO `lucide-react`, NO `clsx`, NO `tailwind-merge`, NO i18next on this branch.
- **Expected from FE-023 (dependency, unverified)**:
  - Target structure on branch `refactor/frontend-structure` (uncommitted on 2026-11-15, not reproducible from the repository; verified by T028 after merge; FE-026 does not add them):
  - Dependencies: `i18next`, `react-i18next`, `i18next-browser-languagedetector`, `lucide-react`, `@fontsource/roboto`, `@fontsource/be-vietnam-pro`, `@playwright/test 1.64.1`, `pngjs`
  - Script: `test:visual`
- **Scope Limit**: Adding any other library is out of scope (requires ADR + PO approval).
- **Storage**:
  - Client: `localStorage` for JWT access tokens.
  - Server: MinIO (Object Storage for PDF/DOCX files), PostgreSQL 16 + pgvector (metadata and 1536-dim embeddings).
- **Testing**: Node test runner via `npx tsx --test` for logic and the FE-023 Playwright Visual QA once merged (Vitest and React Testing Library removed).
- **Target Platform**: Desktop Web Browsers (Chrome, Edge, Firefox, Safari) optimized for `1440px` viewport.
- **Project Type**: Web Application Frontend (SPA) interacting exclusively with the NestJS Backend Gateway REST API (`/api/v1/*`).
- **Performance Goals**: Initial screen render `< 1.5s`; upload file validation `< 50ms`; material polling cycle every 3s without layout shifts or re-rendering stutter.
- **Constraints**:
  - Maximum upload size: `50 * 1024 * 1024` bytes (50MB) per `backend/src/modules/material/material.service.ts:19`.
  - Allowed file formats: PDF (`application/pdf`) and DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
  - Colors: Locked Eduva Navy (`#2A4E7F`) and Sky (`#00A5F5`) design tokens.
  - Strict Anti-AI-slop: Zero Unicode emojis, zero raw ASCII symbols as buttons, 100% academic Vietnamese UI chrome.
- **Scale/Scope**: 3 primary views, 4 modal/dialog flows, 7 Figma frames (`02.1`–`02.7`).

---

## 3. Constitution Check

*GATE: Evaluated prior to Phase 0 and re-verified post-Phase 1 design.*

| Constitutional Rule / Principle | Evaluation & Evidence | Status |
|---|---|:---:|
| **Architecture Boundaries (FND §3)** | Frontend communicates exclusively with the Backend Gateway (`/api/v1/*`). It never accesses the FastAPI AI Service (`/internal/v1/*`) or database directly. | **PASS** |
| **Case Lifecycle & Publication Gate (FND §4)** | Only published cases are accessible to students. FE-026 operates in the Lecturer domain and does not compromise this gate. | **PASS** |
| **Decision Tree Integrity (FND §5)** | Decision tree structure is not modified by Courses & Materials screens. | **PASS** |
| **AI Safety & Zero Fake Data (FND §6)** | Zero fake data policy and Missing API ≠ Empty Data strictly enforced. `MOCK_CHUNKS` and fake upload files are completely removed. Real chunks integration; missing endpoint (404) or error states render `ErrorState` with real reason and retry, while `EmptyState` renders only on 200 OK with empty list. | **PASS** |
| **Git Workflow & Branch Rules (FND §7)** | Active branch is `docs/spec-kit-workflow`. No product code commits or pushes in this stage. Branch naming and commit rules respected. | **PASS** |
| **No Invented Routes or Fields (AGENTS.md rules 7 & 8)** | All routes cited from actual controllers: `POST /courses/:courseId/materials` (`material.controller.ts:33`), `DELETE /materials/:id` (`material.controller.ts:80`), `is_active` (`V1__init_schema.sql:39`). Unbuilt endpoints clearly tagged `[ĐỀ-XUẤT]`. | **PASS** |
| **Provisional Design Tokens (AGENTS.md rule 9, GDS §0.2)** | Design tokens noted as provisional until official PO token approval. Frames are not falsely marked Ready for Dev. | **PASS** |
| **Test Traceability (AGENTS.md rule 10)** | Every acceptance scenario has a defined test in `quickstart.md` and will map to tasks in `tasks.md`. | **PASS** |

---

## 4. Proposed Upstream & Backend Tasks (Dependencies - Not in FE-026 Approved Scope)

Per PO decisions Q1, Q2, and Q4, the following items are dependencies recorded as proposed tasks (detailed in [`specs/001-fe026-courses-materials/be-dependencies.md`](./be-dependencies.md)). They are NOT part of FE-026's approved frontend scope and must be scheduled/approved separately:

### Proposed Task 1: Merge FE-023 Frontend Restructure (PO Q1)
- **Scope**: Upstream Frontend Integration
- **Description**: Complete code review, testing, and merge of `refactor/frontend-structure` into `develop`.
- **Target Deliverables**: `frontend/src/components/ds/`, `src/components/feedback/`, `src/routes/paths.ts`, `src/locales/`, and modular page directories (`pages/courses/`, `pages/materials/`).
- **Prerequisite for FE-026**: FE-026 implementation can only begin once FE-023 is merged into `develop` and its commit SHA is confirmed.

### Proposed Task 2: Backend Chunks Retrieval API (`BE-PROP-1`, PO Q2)
- **Scope**: Backend Gateway (`backend/src/modules/material/`)
- **Status**: PROPOSED — not created in Jira (requires PO approval)
- **Endpoint**: `GET /api/v1/materials/:id/chunks` `[ĐỀ-XUẤT]`
- **Requirements**:
  - Query `document_chunks` table in PostgreSQL for chunks belonging to `materialId`.
  - Validate course ownership (`WHERE lecturerId = currentUser.id`).
  - Pagination parameters: `page` (default: 1), `limit` (default: 20).
  - Return metadata (`totalChunks`, `pageCount`, `sizeBytes`) and chunk items (`id`, `chunkIndex`, `pageNumber`, `content`, `tokenCount`).
  - Integration tests verifying ownership boundaries and pagination.
  - UI rule (Missing API ≠ empty data): If endpoint is missing (404) or fails, UI renders `ErrorState` with real reason and retry; `EmptyState` is rendered only on 200 OK with `totalChunks = 0`.

### Proposed Task 3: Backend Course Soft Archive API per OPD-014 (`BE-PROP-2`, PO Q4)
- **Scope**: Backend Gateway (`backend/src/modules/course/`) & Database
- **Status**: PROPOSED — not created in Jira (requires PO approval)
- **Endpoint**: `PATCH /api/v1/courses/:id/archive` `[ĐỀ-XUẤT]`
- **Requirements**:
  - Reuses existing column `courses.is_active` (`is_active = FALSE`).
  - Updates course repository queries to filter `WHERE is_active = TRUE` for active course listings.
  - Does NOT delete or cascade-delete materials, pgvector chunks, or MinIO objects.
  - Preserves student attempt links and case histories.
  - Integration tests verifying that archived courses are omitted from active lists while preserving underlying data.

---

## 5. Project Structure & File Layout

### Documentation (Spec Kit Feature Directory)
```text
specs/001-fe026-courses-materials/
├── spec.md              # Clarified Feature Specification (with R1 & R2 fixes)
├── plan.md              # This Implementation Plan
├── research.md          # Architectural Decisions & Analysis (PO Q1–Q5)
├── data-model.md        # Entities, Lifecycles, and Validation Rules
├── be-dependencies.md   # Proposed Backend Dependencies (BE-PROP-1 & BE-PROP-2)
├── record.md            # Feature Record and Quality Gate Log
├── quickstart.md        # End-to-End Verification Scenarios & Run Guide
├── contracts/           # Interface & API Specifications
│   ├── courses-api.md   # Courses REST Contracts
│   ├── materials-api.md # Materials REST Contracts
│   └── ui-contracts.md  # FE-023 DS Component Interfaces
└── tasks.md             # Dependency-Ordered Task List (Phase 2 output)
```

### Source Code Target Layout (Post FE-023 Integration)
```text
frontend/src/
├── components/
│   ├── ds/                      # Design System Primitives (Figma Page 02 & 08)
│   │   ├── CourseCard.tsx       # Frame 02.1 course card
│   │   ├── CourseOverview.tsx   # Frame 02.1 detail panel
│   │   ├── Dialog.tsx           # Modals 02.2, 02.3, 02.5, 02.6
│   │   ├── ProcessingBadge.tsx  # Frame 02.4 RAG status badge
│   │   ├── Field.tsx            # Form inputs and textareas
│   │   ├── Button.tsx           # Navy / Tonal / Danger buttons
│   │   └── MetricCard.tsx       # Frame 02.7 metric counters
│   └── feedback/                # Feedback & Empty States
│       ├── EmptyState.tsx       # Zero data state
│       ├── ErrorState.tsx       # API failure state
│       └── Skeleton.tsx         # CourseListSkeleton, TableSkeleton
├── pages/
│   ├── courses/
│   │   └── CoursesPage.tsx      # Frames 02.1, 02.2, 02.3
│   └── materials/
│       ├── MaterialsPage.tsx    # Frames 02.4, 02.5, 02.6
│       └── RagSourceInspectorPage.tsx # Frame 02.7
├── routes/
│   └── paths.ts                 # Single source of truth for URL routes
├── services/
│   ├── courseService.ts         # Course API client methods
│   ├── materialService.ts       # Material API client methods (DELETE fixed)
│   └── mappers/                 # snake_case API to camelCase domain model mappers
│       ├── course.ts            # Maps Course API responses & computes counts
│       └── material.ts          # Maps Material API responses & status enums
└── locales/
    ├── vi.json                  # Vietnamese translations
    └── states.vi.json           # Shared state copy
```

---

## 6. Implementation Phases & Quality Gates

### Phase 0: Outline & Research (COMPLETE)
- [x] Extract unknowns and dependencies from Technical Context.
- [x] Consolidate decisions, rationales, and alternatives in `research.md`.
- [x] Address review fixes R2-1 through R2-4.

### Phase 1: Design & Contracts (COMPLETE)
- [x] Entity data models and lifecycle states in `data-model.md`.
- [x] Detailed API contracts in `contracts/courses-api.md` and `contracts/materials-api.md`.
- [x] UI component contracts in `contracts/ui-contracts.md`.
- [x] Runnable end-to-end verification scenarios in `quickstart.md`.
- [x] Re-evaluate Constitution Check (All gates PASS).

### Phase 2: Tasks Generation (`/speckit-tasks`)
- Dependency-ordered tasks breakdown in `tasks.md`.
- Every task references specific files, acceptance criteria, and verification tests.
- Incorporate Acceptance Test Matrix addressing PO Q3, Q4, Q5.

### Phase 3: Implementation Gate (BLOCKED)
- **Hold Condition**: Implementation (`/speckit-implement`) is blocked until:
  1. FE-023 restructure is merged into `develop`.
  2. PO formally approves the tasks and test matrix.
  3. No uncommitted files or legacy workarounds are used.

---

## 7. Complexity Tracking

| Consideration | Evaluation & Decision | Justification |
|---|---|---|
| **Soft Archive Database Schema** | Reusing `courses.is_active` vs adding new `is_archived` column | Reusing `is_active` (`is_active = FALSE`) avoids redundant columns and complies with PO Q4 directive to avoid parallel database mechanisms. |
| **Material Re-ingest** | Renaming to "Tải lên lại" vs implementing backend re-ingest | Avoids scope creep and honors existing backend capabilities while maintaining honest UX. |
