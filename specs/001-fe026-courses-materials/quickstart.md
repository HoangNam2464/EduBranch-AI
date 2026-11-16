# Quickstart & Verification Guide: Courses & Materials [FE-026]

**Feature Directory**: `specs/001-fe026-courses-materials`  
**Reference Design**: Figma Page `08 · EduBranch – Bản hoàn chỉnh` (frames `02.1` – `02.7`)  
**Date**: 2026-11-16  
**Audience**: Implementers, Reviewers, and QA Engineers

---

## 1. Prerequisites & Setup

1. **Prerequisite Branch Merge**:
   - Verify that upstream task FE-023 (`refactor/frontend-structure`) has been merged into `develop`.
   - Confirm target files exist in workspace (*Note*: FE-023 (EBA-86) target structure on branch `refactor/frontend-structure` (uncommitted on 2026-11-15); every path from it is an expectation verified by T028 after merge):
     - `frontend/src/pages/courses/CoursesPage.tsx`
     - `frontend/src/pages/materials/MaterialsPage.tsx`
     - `frontend/src/pages/materials/RagSourceInspectorPage.tsx`
     - `frontend/src/components/ds/index.ts`
     - `frontend/src/routes/paths.ts`
2. **Environment & Services**:
   - Backend Gateway running on `http://localhost:3000/api/v1` (via `docker compose up -d`).
   - PostgreSQL 16 with pgvector running.
   - MinIO Object Storage running on `http://localhost:9000`.
   - Seeded user: Lecturer account (`role = 'LECTURER'`).
3. **Frontend Development Server**:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173/login` and log in with the lecturer credentials.

---

## 2. End-to-End Verification Scenarios

### Scenario 1: Courses Management & Course Removal (Figma 02.1 – 02.3, BLOCKED-ON-C1)
1. **Navigate to Courses Page**:
   - Click navigation item "Khóa học" or navigate to `/lecturer/courses`.
   - **Verification**:
     - 2-column layout matches Figma 02.1 (`483:9637`).
     - Left column displays course cards (`CourseCard`) with code, name, and material count.
     - Right column displays selected course details (`CourseOverview`).
     - Colors match Navy `#2A4E7F` / Sky `#00A5F5` / Canvas `#F3F6FC`. No emoji in UI.
2. **Create New Course**:
   - Click page button "Tạo khóa học mới" (`I483:9668;225:164`, 02.1).
   - **Verification**: Modal opens with title "Khởi tạo khóa học mới" matching Figma 02.2 (`483:10099`).
   - Fill "Tên khóa học" (e.g., "Kinh tế lượng ứng dụng"), "Mã khóa học" ("EC301"; [DỮ-KIỆN] Figma 02.2 ghi "Mã môn học *" bắt buộc, backend DTO ghi `@IsOptional()`; tính bắt buộc/tùy chọn: `BLOCKED-ON-C3 — pending PO`), description.
   - Click submit button "Tạo khóa học" (`I483:10110;225:146`, 02.2).
   - **Expected Outcome**: `POST /courses` succeeds (201 Created). Modal closes, new course appears in list and is selected in overview panel.
3. **Course Removal Action (Figma 02.3 vs PO Q4 / OPD-014 → C1)**:
   - Click course removal action in overview panel.
   - **Verification**: Dialog opens matching Figma 02.3 (`483:10111`). Dialog copy and behavior is `BLOCKED-ON-C1 — pending PO` ([DỮ-KIỆN] Figma 02.3 specifies destructive delete "Xóa khóa học này?"; [PO-ĐÃ-XÁC-NHẬN] PO Q4 / OPD-014 specify soft archive "Lưu trữ khóa học" preserving materials and chunks).
   - Click confirm button.
   - **Expected Outcome**: Dependent on C1 resolution: if soft archive, calls `PATCH /courses/:courseId/archive` [ĐỀ-XUẤT] setting `is_active` to false without HTTP 500 error; if hard delete, calls `DELETE /courses/:courseId`.

---

## 3. Scenario 2: Materials Management & Upload (Figma 02.4 – 02.6)
1. **Navigate to Materials View**:
   - Select an active course and click "Quản lý tài liệu" or navigate to `/lecturer/courses/:courseId/materials`.
   - **Verification**: Breadcrumb shows course name. Upper block shows 4-step process and quick dropzone. Lower block displays materials table matching Figma 02.4 (`483:10342`).
2. **Open Upload Dialog & Client Validation**:
   - Click "Tải tài liệu mới".
   - **Verification**: Modal opens matching Figma 02.5 (`483:10598`). Zero fake files hardcoded in file queue.
   - Drag an invalid file (e.g. `.exe` or `> 50MB` file) into dropzone.
   - **Expected Outcome**: Client rejects file with localized error message. "Tải lên" button remains disabled.
   - Drag a valid PDF file (`<= 50MB`). File appears in queue.
   - Click "Tải lên 1 tệp".
   - **Expected Outcome**: Multipart request `POST /courses/:courseId/materials` sent. Upload succeeds (201 Created). New row appears with `PENDING` badge.
3. **Polling & Completion**:
   - Observe table polling every 3s. Badge transitions to `PROCESSING (%)` and finally to `COMPLETED (✓)` with chunk count.
4. **Failed Material & Action Button (BLOCKED-ON-C2)**:
   - If an uploaded document is corrupt, badge shows `FAILED` with error text.
   - **Verification**: Action button label is `BLOCKED-ON-C2 — pending PO` ([DỮ-KIỆN] Figma node `586:8570` labels "Thử lại", [PO-ĐÃ-XÁC-NHẬN] PO Q3 requested "Tải lên lại").
   - Click action button: Opens upload modal displaying previous error reason so user can select an updated file via existing `POST /courses/:courseId/materials`.
5. **Delete Material**:
   - Hover row and click "Xóa".
   - **Verification**: Dialog opens matching Figma 02.6 (`483:10890`, dialog `I483:11147;228:301`). Displays dialog title "Xóa tài liệu này?", body warning "Tệp và các đoạn trích đã lập chỉ mục sẽ bị xóa vĩnh viễn. AI sẽ không dùng tài liệu này khi sinh case mới. Thao tác này không thể hoàn tác." (`I483:11147;228:302`), and confirm button "Xóa vĩnh viễn" (`I483:11147;228:310;225:254`).
   - Click "Xóa vĩnh viễn".
   - **Expected Outcome**: Calls `DELETE /materials/:id` (canonical backend route, PO Q5). Row is removed after HTTP 200/204 response.

---

## 4. Scenario 3: RAG Source Inspector (Figma 02.7)
1. **Navigate to RAG Inspector**:
   - On a `COMPLETED` material row, click "Xem nguồn" or navigate to `/lecturer/courses/:courseId/materials/:materialId/rag`.
   - **Verification**:
     - Layout matches Figma 02.7 (`483:11148`).
     - 3 metric cards at top (Đoạn trích, Số trang, Dung lượng).
     - Zero instances of `MOCK_CHUNKS` or `OTHER_DOCUMENTS` in DOM or network log.
     - If `GET /materials/:id/chunks` [ĐỀ-XUẤT] (`BE-PROP-1`) is available, real chunks render with page numbers.
     - If endpoint is not yet deployed by backend (404) or fails, renders authentic `ErrorState` explaining chunks sync status with a retry option; `EmptyState` is rendered only on 200 OK with empty items.

---

## 5. Scenario 4 – Language Switch (ATM-L10N-01..05) [FE-023 target (expected; not on develop `273f1fc`; verified by T028)]
1. **First Visit (Default Vietnamese - ATM-L10N-01)**:
   - Clear `localStorage` (ensure `LANGUAGE_STORAGE_KEY = "edubranch-lang"` is absent) or open an incognito session.
   - Navigate to `/lecturer/courses`.
   - **Verification**:
     - `document.documentElement.lang` is `"vi"`.
     - In the shared header `EB/Header Actions`, `Language` switch (`544:5800`) shows `Option · VI` (`544:5801`) active (`action/primary` `#2A4E7F` fill, `text/inverse` `#FFFFFF`, `aria-pressed="true"`) and `Option · EN` (`544:5803`) inactive (no fill, `text/secondary` `#696A70`, `aria-pressed="false"`).
     - All headings, button labels, table columns, form helpers, and dialogs render in Vietnamese (`"Quản lý khóa học"`, `"Tạo khóa học mới"`, `"Khởi tạo khóa học mới"`, `"Tạo khóa học"`, `"Tài liệu môn học"`, `"Tải tài liệu mới"`).
2. **Switch to English (ATM-L10N-02)**:
   - Click `Option · EN` on the header language toggle.
   - **Verification**:
     - `localStorage.getItem('edubranch-lang')` equals `"en"`.
     - Toggle styles swap: `Option · EN` active (Navy fill, white text, `aria-pressed="true"`); `Option · VI` inactive (no fill, secondary text, `aria-pressed="false"`).
     - Every visible UI text element across courses, materials, RAG inspector, and all dialogs/modals switches to English (`"Course Management"`, `"Create New Course"`, `"Course Materials"`, `"Upload New Materials"`, and course removal dialog title `BLOCKED-ON-C1 — pending PO`).
     - Zero Vietnamese strings remain in the UI chrome.
     - API data values (course names, filenames, chunk texts) remain unchanged as stored.
3. **Persistence on Reload (ATM-L10N-03)**:
   - Reload the browser page (`F5` or `Ctrl+R`).
   - **Verification**:
     - Application mounts directly in English; toggle displays `Option · EN` active immediately without a visual flash of Vietnamese.
4. **Switch Back to Vietnamese (ATM-L10N-04)**:
   - Click `Option · VI`.
   - **Verification**:
     - Toggle styles swap back; UI chrome reverts completely to academic Vietnamese; `localStorage` stores `"vi"`.
5. **Dynamic Feedback States Localization (ATM-L10N-05)**:
   - Trigger an empty state (e.g. 0 courses) or error state (e.g. simulated upload failure or 404).
   - Toggle language between VI and EN.
   - **Verification**:
     - State titles, descriptions, and action buttons dynamically translate between Vietnamese and English without page reload or loss of state context.

---

## 6. Build & Automated Quality Gate Check
Run the frontend production build:
```powershell
cd frontend
npm run build
```
**Expected Outcome**: Compilation succeeds with zero TypeScript errors and zero TailwindCSS warnings.
