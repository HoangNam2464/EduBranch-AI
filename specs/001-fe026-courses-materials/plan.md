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
3. **Failed Material Semantics (PO Q3 & Review R2-4 → C2)**: [DỮ-KIỆN] Figma node `586:8570` labels action "Thử lại". [PO-ĐÃ-XÁC-NHẬN] PO Q3 requested "Tải lên lại" (or "Chọn tệp tải lại"). The action button label is `BLOCKED-ON-C2 — pending PO`. Behaviour is the same under C2-A (keep Figma: label "Thử lại") and C2-B (follow PO Q3: label "Tải lên lại" / "Chọn tệp tải lại"; needs PO to change Figma text) — both use the PO Q3 flow opening the upload modal (02.5) with previous error context to re-select the file and upload via existing `POST /courses/:courseId/materials` without fake re-ingest API. Out of FE-026 note: in-place re-ingestion of existing materials is out of FE-026 scope.
4. **Course Removal (C1, pending PO; option C1-B = PO Q4 answer & Review R2-3)**: [DỮ-KIỆN] Frame 02.3 specifies destructive deletion dialog ("Xóa khóa học này?"). [PO-ĐÃ-XÁC-NHẬN] PO Q4 states OPD-014 soft archive (option C1-B; `courses.is_active = FALSE`), preserving materials, chunks, and cases, and eliminating the foreign key HTTP 500 error. The course removal copy and mechanism is `BLOCKED-ON-C1 — pending PO`: C1-A (keep Figma: hard delete with Figma copy; needs PO to change Q4/OPD-014 and safe cascade delete backend change; not BE-PROP-2) vs C1-B (follow PO Q4 / OPD-014: soft archive; needs PO to change Figma 02.3 copy; BE-PROP-2 `PATCH /courses/:courseId/archive`). Reusing `courses.is_active` per `backend/migrations/V1__init_schema.sql:39` is evaluated under `BE-PROP-2` under C1-B.
5. **Route Alignment (PO Q5 & Review R2-1)**: Fix `DELETE /materials/:id` directly in frontend `materialService.ts` relative to `/api/v1` base URL.
6. **API Response Envelope & Model Mapping (Review R3-1)**: All existing backend endpoints return `{ "status": "SUCCESS", "data": ... }` with snake_case fields (`course_code`, `lecturer_id`, `is_active`, `original_filename`, `stored_object_key`, `mime_type`, `size_bytes`, `processing_status`, `chunk_count`, `processing_error`, `uploaded_at`). Clean mapping to frontend camelCase models is encapsulated in `frontend/src/services/mappers/course.ts` and `material.ts`. All proposed endpoints (`PATCH /courses/:id/archive` (C1-B only; BLOCKED-ON-C1), `GET /materials/:id/chunks`) adopt the identical envelope.
7. **Localization Architecture & VI/EN Language Switch (`[PO-ĐÃ-XÁC-NHẬN]`)**:
   - `SUPERSEDED (2026-11-16, PO chat): replaced by the PO directive that the approved Figma page 08, including the VI/EN switch, is the UI source`:
     > "MVP chỉ sử dụng tiếng Việt. English localization chỉ triển khai sau khi sản phẩm đạt khoảng 75% và có PO approval."
   - **PO Directive mới (2026-11-16, verbatim)**: "Figma page 08 đã được PO chốt. Nút chuyển ngôn ngữ VN / ENG là thành phần tôi chủ động bổ sung và đã hoàn thiện trên Figma. Thiết kế này thuộc giao diện sản phẩm đã được duyệt."
   - **Cơ chế i18n theo chuẩn FE-023 [FE-023 target (expected; not on develop `273f1fc`; verified by T028)]**: `src/lib/i18n.ts` định nghĩa `SUPPORTED_LANGUAGES = ["vi", "en"]`, `DEFAULT_LANGUAGE = "vi"`, `fallbackLng: "vi"`; ngôn ngữ được lưu trong `localStorage` key `LANGUAGE_STORAGE_KEY = "edubranch-lang"` (thứ tự phát hiện chỉ đọc localStorage; không đọc ngôn ngữ trình duyệt, lần đầu truy cập luôn mở tiếng Việt). File cơ sở `src/locales/vi.json` + `en.json` cùng bộ key, cộng các file tính năng `src/locales/<feature>.vi.json` / `<feature>.en.json` (mỗi file một top-level key: `courses`, `materials`) được gộp tự động qua `import.meta.glob`. Do `fallbackLng` là `vi`, bất kỳ key nào thiếu trong `.en.json` sẽ hiển thị tiếng Việt trên màn hình tiếng Anh gây trộn lẫn ngôn ngữ; vì vậy yêu cầu bắt buộc bảo đảm key parity (tập key giống hệt nhau giữa hai file).
   - **Shared Header Switch [FE-023 target (expected; not on develop `273f1fc`; verified by T028)]**: Shell FE-025 (`frontend/src/layouts/shell/HeaderActions.tsx`) hiển thị nút chuyển ngôn ngữ với `aria-pressed`, `lang`, label `lang.toUpperCase()`, gọi `i18n.changeLanguage(lang)`. Các màn hình FE-026 và component dùng chung chuyển đổi đầy đủ theo ngôn ngữ được chọn. Bản dịch tiếng Anh được gắn nhãn `[ĐỀ-XUẤT]` chờ PO duyệt.

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
  - Strict Anti-AI-slop: Zero Unicode emojis, zero raw ASCII symbols as buttons, UI chrome fully in the selected language (Vietnamese default; English via the switch), no mixing.
  - Localization: Vietnamese default, English pair supported via i18next and header VI/EN switch [FE-023 target (expected; not on develop `273f1fc`; verified by T028)]; choice persisted in `localStorage` (`LANGUAGE_STORAGE_KEY = "edubranch-lang"`, localStorage-only detection); feature files `courses.vi.json` / `.en.json` and `materials.vi.json` / `.en.json` merged via `import.meta.glob` with full key parity; no mixed language; English strings `[ĐỀ-XUẤT]` pending PO review.
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

### Proposed Task 3: Backend Course Soft Archive API per OPD-014 (`BE-PROP-2`, PO Q4) (C1-B only; BLOCKED-ON-C1)
- **Scope**: Backend Gateway (`backend/src/modules/course/`) & Database
- **Status**: PROPOSED — not created in Jira (requires PO approval; C1-B only; `BLOCKED-ON-C1 — pending PO` for C1-A delete vs C1-B soft archive resolution)
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
    ├── courses.vi.json          # Courses feature translations (one top-level key)
    ├── courses.en.json          # Courses English feature translations (key parity)
    ├── materials.vi.json        # Materials feature translations (one top-level key)
    ├── materials.en.json        # Materials English feature translations (key parity)
    ├── states.vi.json           # Shared state copy (Vietnamese)
    └── states.en.json           # Shared state copy (English)
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
| **Course Removal (C1)** | Hard delete per Figma 02.3 (C1-A) vs soft archive per PO Q4 / OPD-014 (C1-B) | `BLOCKED-ON-C1 — pending PO`. Under C1-B only: reusing `is_active` (`is_active = FALSE`) avoids redundant columns and follows PO Q4. Under C1-A only: safe cascade delete is required. |
| **FAILED-row action label (C2)** | "Thử lại" per Figma node `586:8570` (C2-A) vs "Tải lên lại" per PO Q3 (C2-B) | `BLOCKED-ON-C2 — pending PO`. Re-upload flow stays identical under both C2-A and C2-B. |
| **Course Code Required-ness (C3)** | "Mã môn học *" required per Figma 02.2 (C3-A) vs optional `courseCode` in `CreateCourseDto` (C3-B) | `BLOCKED-ON-C3 — pending PO`. Facts documented, UI requirement awaiting PO resolution. |
