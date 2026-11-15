# Feature Record: Courses & Materials Screens Rework to Figma 02.1–02.7 [FE-026]

> **Canonical Record**: Maintained per `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §3, §4 Stage 0, and §6.  
> **Pilot Feature**: FE-026 (Jira EBA-89, Sprint 3) — Spec Kit Figma-to-code pilot workflow.  
> **Active Directory**: `specs/001-fe026-courses-materials`  
> **Workspace**: repository root  
> **Created**: 2026-11-15  
> **Last Updated**: 2026-11-16 (Stage 6 Analyze Completed & Gate Log Established)

---

## 1. Discover (Workflow §4 Stage 0)

### 1.1. Workspace & Git Context
- **Workspace**: repository root
- **Active Git Branch**: `docs/spec-kit-workflow`
- **HEAD Commit SHA**: `273f1fc7d2f11c2f3df120a2999bedea5ada0633` (= `origin/develop`)
- **Pre-execution MD5 Integrity Verification (exit code 0)**:
  - `AGENTS.md`: `42b6255072f1a6f2938f1c0eabcfc4bc` (MATCH)
  - `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`: `ce8399bc41c1c188a879cdbbffce5b78` (MATCH)
  - `.specify/memory/constitution.md`: `54321da28efadf643cc40c9cb8f59cb4` (MATCH)
- **UI Rules Version (`[DỮ-KIỆN]`)**:
  - The version used is `.agents/rules/01-ui-design-standards.md` on this branch (develop `273f1fc`, git blob `b7c4c10e8134b1e687179dfee121d46b8e16aec5`, see `git rev-parse 273f1fc:.agents/rules/01-ui-design-standards.md`). The PO has a newer local version of this file and of 8 `feature-*.md` rules that is not committed to any branch: it is NOT integrated, is a separate scope of work, and FE-026 must re-check the committed UI rules once the PO commits them (verified by T028 preflight).

### 1.2. Parent Task & Traceability
- **Jira Task**: `EBA-89` (Sprint 3, To Do) — `[FE-026] Rework Courses & Materials Screens to Figma 02.1–02.7`
- **Master Tasks (docs/01_MASTER-TASKS.md)**:
  - `EBA-101`: Course & Class Management (Sprint 1)
  - `EBA-102`: Teaching Materials Upload & MinIO Storage (Sprint 1)
  - `EBA-201` – `EBA-207`: RAG Pipeline, Ingestion, and Status Polling (Sprint 2)
  - `EBA-217`: Lecturer Materials Table & Polling UI (Sprint 2)
  - `EBA-218`: Lecturer RAG Source Chunks Inspector (Sprint 2)
- **Sprint Tasks Breakdown (docs/02_SPRINT-TASKS.md)**: `FE-001` … `FE-006` (verified baseline behaviors), `FE-023` (Frontend Restructure, prerequisite dependency), `FE-026` (Figma Rework).
- **QA Tasks (docs/06_QA.md)**: `QA-003` (Course Management & Access Control), `QA-004` (Material Ingestion & Validation).

### 1.3. Canonical Sources & Governance Documents
- **Foundation**: `.agents/rules/00-project-foundation.md` (§1 Pedagogy & Terminology, §3 Architecture Boundaries, §4 Publication Gate, §6 AI Safety & Zero Fake Data, §7 Git Workflow).
- **Feature Rules**: `.agents/rules/feature-course.md`, `.agents/rules/feature-material.md`, `.agents/rules/feature-rag.md`.
- **UI System**: `.agents/rules/01-ui-design-standards.md`, `docs/design/GLOBAL-DESIGN-SYSTEM.md`.
- **Figma Reference**: `docs/05_FIGMA.md` (§0.1 DES → frame map), `docs/design/screens/P1-LECTURER-CORE.md`, `docs/features/FEATURE-COURSE-AND-MATERIALS.md`.

### 1.4. Figma Canvas & Frames Inventory
- **Figma File Key**: `6CtSgJPKo4jCIbB7WwCaWw`
- **Canonical Page**: `08 · EduBranch – Bản hoàn chỉnh` (Node ID: `483:9634`)
- **Section**: `02 · Giảng viên · Khóa học & Tài liệu` (Node ID: `483:9636`)
- **Extracted Frames (verified via Figma MCP `get_metadata`)**:
  - `02.1`: `483:9637` (1440 × 1413) — `02.1 · Giảng viên · Quản lý khóa học`
  - `02.2`: `483:9866` (1440 × 1413) — `02.2 · Giảng viên · Hộp thoại khởi tạo khóa học`
  - `02.3`: `483:10111` (1440 × 1413, Dialog `483:10341`) — `02.3 · Giảng viên · Hộp thoại xác nhận xóa khóa học` (Soft Archive per OPD-014)
  - `02.4`: `483:10342` (1440 × 1123) — `02.4 · Giảng viên · Chi tiết khóa học — Tài liệu môn học`
  - `02.5`: `483:10598` (1440 × 1123) — `02.5 · Giảng viên · Hộp thoại tải tài liệu môn học`
  - `02.6`: `483:10890` (1440 × 1123) — `02.6 · Giảng viên · Hộp thoại xác nhận xóa tài liệu`
  - `02.7`: `483:11148` (1440 × 1329) — `02.7 · Giảng viên · RAG Source Inspector (DES-005)`
- **Ready for Dev Status**: Provisional per GDS §0.2 and AGENTS.md Rule 9 pending formal token approval.
- **Intended Deviation from Figma**: Frame 02.4 / Node `586:8570` FAILED action button renamed from "Thử lại" to "Tải lên lại" (or "Chọn tệp tải lại") per PO Decision Q3 (2026-11-15 [PO-ĐÃ-XÁC-NHẬN]).

### 1.5. Current Routes, Files & Known Gaps (`[DỮ-KIỆN]`)
- **Current Routes**:
  - `/lecturer/courses` → `frontend/src/pages/lecturer/CoursesPage.tsx`
  - `/lecturer/courses/:courseId/materials` → `frontend/src/pages/lecturer/MaterialsPage.tsx`
  - `/lecturer/courses/:courseId/materials/:materialId/rag` → `frontend/src/pages/lecturer/RagSourceInspectorPage.tsx`
- **Known Code Gaps Identified**:
  1. `frontend/src/pages/lecturer/MaterialsPage.tsx:55–75`: Upload modal queue starts with 3 hard-coded fake files.
  2. `frontend/src/pages/lecturer/MaterialsPage.tsx:132–135`: Upload errors are swallowed without proper user notification.
  3. `frontend/src/pages/lecturer/MaterialsPage.tsx:789`: Calls `DELETE /courses/:courseId/materials/:id`, whereas the backend controller provides `DELETE /materials/:id` (`backend/src/modules/material/material.controller.ts:80`).
  4. Nút "Thử lại" trên dòng FAILED chỉ reload lại danh sách do backend chưa có API re-ingest.
  5. `frontend/src/pages/lecturer/RagSourceInspectorPage.tsx:18,53`: Uses `MOCK_CHUNKS` and `OTHER_DOCUMENTS` (backend has no chunks endpoint).
  6. Xóa khóa học có tài liệu trả về lỗi HTTP 500 (backend foreign key cascade constraint).
  7. FE-023 (EBA-86) target structure on branch `refactor/frontend-structure` (uncommitted on 2026-11-15); every path from it is an expectation verified by T028 after merge.

---

## 2. Gate Log (G0–G6 outputs ready for PO review)

> **Gate status note (Claude, 2026-11-15)**: The PO asked for this pilot on 2026-11-15 (`[PO-ĐÃ-XÁC-NHẬN]`: *"chứng minh bằng một feature mẫu thuộc giai đoạn Figma-to-code"*). That request is not an approval of the G0–G6 outputs: they are presented to the PO at the closing gate and pass only when the PO approves them. Earlier wording "batched by the PO" came from Claude's package and was wrong.  
> **G7 Implementation Gate**: `[CHƯA-CẤP]` (Not Given). No product code implementation (`/speckit-implement`) is authorized.

| Gate | Stage | Skill | Status | Date | Evidence / Outputs |
|:---:|---|---|:---:|:---:|---|
| **G0** | Discover | Manual / Discovery Tools | **READY — awaiting PO review** | 2026-11-15 | Change boundary confirmed; branch, HEAD, Figma frames, and gaps recorded in `record.md`. |
| **G1** | Specify | `/speckit-specify` | **READY — awaiting PO review** | 2026-11-15 | `specs/001-fe026-courses-materials/spec.md` (47,491 bytes) covering 13 Functional Requirements (`FR-001`–`FR-013`), 5 Success Criteria (`SC-001`–`SC-005`), and 3 User Stories. |
| **G2** | Clarify | `/speckit-clarify` | **READY — awaiting PO review** | 2026-11-15 | 5 PO Decisions Q1–Q5 recorded verbatim with date 2026-11-15 under `[PO-ĐÃ-XÁC-NHẬN]`; review items R1-1, R1-2, R1-3 resolved. Zero unresolved blocking questions. |
| **G3** | Plan | `/speckit-plan` | **READY — awaiting PO review** | 2026-11-15 | Implementation plan and design artifacts produced: `plan.md`, `research.md`, `data-model.md`, `be-dependencies.md`, `contracts/courses-api.md`, `contracts/materials-api.md`, `contracts/ui-contracts.md`, `quickstart.md`. R2-1..R2-4 and R3-1 review fixes applied. Constitution Check: PASS. |
| **G4** | Checklist | `/speckit-checklist` | **READY — awaiting PO review** | 2026-11-15 | UX Requirements Quality Checklist generated in `checklists/ux.md` (9,576 bytes, 41 checklist items `CHK001`–`CHK041`, all unchecked `[ ]` awaiting reviewer sign-off). |
| **G5** | Tasks | `/speckit-tasks` | **READY — awaiting PO review** | 2026-11-15 | 24 tasks T001–T024 from `/speckit-tasks` (2026-11-15) + 15 tasks T025–T039 from `/speckit-converge` (2026-11-15/16) + T040 PO copy review of the English strings (added by the PR #38 F8 fix, 2026-11-16) = 40. |
| **G6** | Analyze | `/speckit-analyze` | **READY — awaiting PO review** | 2026-11-15 | Cross-artifact consistency analysis completed with 0 Critical findings, 0 Constitution violations, 0 unmapped tasks, and 100% requirements coverage. |
| **G7** | Approval | — | **PENDING** (`[CHƯA-CẤP]`) | — | Implementation scope pending PO formal sign-off post-FE-023 merge into `develop`. `/speckit-implement` is BLOCKED. |

---

## 3. Product Owner Clarification Record (`[PO-ĐÃ-XÁC-NHẬN]`)

All decisions recorded verbatim from PO chat on 2026-11-15:

1. **Q1: Frontend Architectural Target & Restructure**:
   > *"Chọn B – chờ FE-023 merge vào develop. Đúng theo thứ tự triển khai đã được PO xác lập ngày 13/11: hoàn thành tái cấu trúc frontend trước, sau đó mới triển khai lại các màn hình trên cấu trúc mới. Yêu cầu: - FE-026 phải kế thừa cấu trúc FE-023 sau khi được tích hợp vào develop. - Không triển khai code FE-026 trên cấu trúc cũ. - Không tự lấy hoặc đưa các thay đổi uncommitted từ refactor/frontend-structure vào nhánh hiện tại. - Trong thời gian chờ, có thể hoàn thiện spec, plan, tasks và Acceptance Criteria dựa trên định hướng FE-023, nhưng phải xác minh lại cấu trúc thực tế sau khi merge. - Trước khi implement, kiểm tra commit SHA mới nhất của develop và xác nhận các dependency của FE-023 đã thực sự có mặt. - Không tự merge FE-023 hoặc thay đổi trạng thái task khi chưa đủ quyền và điều kiện nghiệm thu."*

2. **Q2: RAG Source Inspector & Chunks API Gap**:
   > *"Chọn B – bổ sung task BE để cung cấp API lấy danh sách chunks thực tế của tài liệu. Lý do: Màn hình 02.7 RAG Source Inspector cần thể hiện dữ liệu chunks thật, không được sử dụng MOCK_CHUNKS hoặc dữ liệu giả để tạo cảm giác chức năng đã hoàn thành. Yêu cầu: - Đề xuất API GET `/materials/:id/chunks` với response contract phù hợp. - Xác định pagination, metadata, thứ tự chunks và trạng thái dữ liệu. - Bảo đảm authentication, authorization và course ownership. - Kiểm tra API chỉ trả về chunks thuộc tài liệu mà người dùng có quyền truy cập. - Bổ sung integration test với dữ liệu thực. - FE-026 phải phụ thuộc vào API BE này nếu chức năng xem chunks nằm trong phạm vi được duyệt. Chỉ tạo đề xuất task BE và ghi nhận dependency trong Spec Kit. Không tự đưa task vào Sprint, thay đổi Jira hoặc mở rộng scope khi chưa có PO duyệt. Trong thời gian API chưa sẵn sàng, không dùng mock để thay thế dữ liệu thật và không tuyên bố màn hình đã hoàn thành chức năng."*

3. **Q3: Failed Material Re-upload Semantics ("Tải lên lại")**:
   > *"Chọn A – mở modal để người dùng chọn lại và tải lên tài liệu. Nhưng cần điều chỉnh semantics cho chính xác: - Không gọi đây là retry/re-ingest vì backend chưa có API xử lý lại ingestion của material hiện hữu. - Đổi nhãn nút từ "Thử lại" thành "Tải lên lại" hoặc "Chọn tệp tải lại". - Khi nhấn, mở upload modal và yêu cầu người dùng chọn lại file gốc. - Hiển thị lý do tài liệu trước đó FAILED để người dùng hiểu nguyên nhân. - Upload lại phải tạo một lượt xử lý mới thông qua API upload hiện có. - Không tự động xóa bản ghi FAILED cũ trước khi upload mới thành công. - Thông báo rõ nếu việc tải lên lại có thể tạo bản ghi tài liệu mới để tránh người dùng hiểu nhầm. - Chỉ cập nhật trạng thái theo kết quả API thực tế, không báo thành công giả. - Kiểm tra đầy đủ loading, error, success và trường hợp upload thất bại. Không tạo API re-ingest mới trong phạm vi FE-026. Nếu sau này muốn retry trực tiếp ingestion của tài liệu hiện có thì đó là một yêu cầu BE riêng cần PO duyệt. Hãy ghi rõ quyết định này trong spec, Acceptance Criteria và test scenarios."*

4. **Q4: Course Deletion Policy & OPD-014 Soft Archive**:
   > *"Chọn C – Lưu trữ khóa học thay vì xóa cứng. Đây là quyết định đã được PO xác lập trong OPD-014: khóa học và Case sử dụng cơ chế soft archive. Yêu cầu: - Kế thừa đúng quyết định OPD-014, không coi đây là nghiệp vụ mới cần PO quyết định lại. - Thay thao tác xóa cứng bằng lưu trữ mềm. - Không xóa các tài liệu, chunks hoặc object trên MinIO khi lưu trữ khóa học. - Dữ liệu liên quan phải được bảo toàn. - Giao diện sử dụng nhãn và trạng thái phù hợp với nghiệp vụ lưu trữ. - Kiểm tra lại danh sách khóa học, trạng thái khóa học và các API liên quan để bảo đảm khóa học đã lưu trữ không bị hiển thị hoặc sử dụng như khóa học đang hoạt động trái với quy định. - Xem xét khả năng khôi phục chỉ theo đúng phạm vi OPD-014 đã duyệt; không tự tạo thêm nghiệp vụ khôi phục nếu chưa có căn cứ. - Xác định cách điều chỉnh API và database dựa trên kiến trúc hiện tại, không tự ý tạo một cơ chế song song. - Bổ sung integration test kiểm tra dữ liệu khóa học, tài liệu, chunks và MinIO vẫn được bảo toàn sau khi lưu trữ. Ghi rõ quyết định OPD-014 trong spec, plan, tasks và Acceptance Test Matrix. Lỗi HTTP 500 hiện tại phải được xử lý bằng cách triển khai đúng nghiệp vụ lưu trữ mềm, không phải bằng cách thêm cascade xóa dữ liệu."*

5. **Q5: Material Delete Route Alignment (`DELETE /materials/:id`)**:
   > *"Chọn A – sửa trong FE-026. Yêu cầu: - Sử dụng đúng endpoint DELETE mà backend hiện đang cung cấp. - Kiểm tra global prefix, API baseURL và route thực tế trước khi xác định URL cuối cùng. Không tự ý thêm `/api/v1` hai lần. - Không tạo alias backend chỉ để tương thích với endpoint frontend sai. - Giữ nguyên API contract và kiến trúc backend hiện tại. - Ghi nhận đây là lỗi tồn đọng từ FE-005, liên kết nguồn phát hiện để bảo đảm truy vết. - Bổ sung regression test xác nhận frontend gọi đúng endpoint và xử lý chính xác các kết quả 200/204, 403, 404 và lỗi server. - Kiểm tra dữ liệu danh sách được cập nhật sau khi xóa thành công; không xóa hàng trên UI trước khi API xác nhận thành công. - Kiểm tra cả trường hợp lỗi mạng và quyền truy cập. - Chạy kiểm thử trên phiên bản tích hợp sau khi merge vào develop. Đưa nội dung sửa lỗi vào spec, tasks và Acceptance Test Matrix của FE-026. Không đánh dấu hoàn thành nếu mới chỉ sửa URL mà chưa kiểm chứng thao tác xóa thực tế."*

6. **Q6: Phạm vi Bản địa hóa & Nút chuyển ngôn ngữ VI/EN trên Header (Localization Scope & Header Language Switch)**:
   - **Superseded decision (2026-11-16, PO chat)**:
     `SUPERSEDED (2026-11-16, PO chat): replaced by the PO directive that the approved Figma page 08, including the VI/EN switch, is the UI source`:
     > *"MVP chỉ sử dụng tiếng Việt. English localization chỉ triển khai sau khi sản phẩm đạt khoảng 75% và có PO approval."*
   - **PO Directive mới `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-16, chat, verbatim)**:
     > *"Figma page 08 đã được PO chốt. Nút chuyển ngôn ngữ VN / ENG là thành phần tôi chủ động bổ sung và đã hoàn thiện trên Figma. Thiết kế này thuộc giao diện sản phẩm đã được duyệt."*
     - **Nguyên tắc**: (1) Figma đã duyệt là nguồn duy nhất cho thiết kế UI; (2) Các tài liệu kỹ thuật, ghi chú UX, Kế hoạch dự án và Spec Kit chưa được PO duyệt phải được cập nhật để khớp với Figma; (3) Tuyệt đối không dùng tài liệu cũ hoặc tài liệu Draft để loại bỏ, từ chối hay hoãn thành phần giao diện đã được duyệt.
     - **Yêu cầu thực thi**:
       - Giữ nguyên nút chuyển đổi VI/EN trên shared header đúng như trên Figma page 08 (khung `Language` node `544:5800`, component `EB/Header Actions` `540:347`). Bản thân header thuộc phạm vi vỏ ứng dụng FE-025 (shell); các màn hình và component dùng chung của FE-026 phải chuyển đổi đồng bộ theo trạng thái ngôn ngữ được chọn.
       - Hệ thống bản địa hóa hỗ trợ song ngữ Tiếng Việt và Tiếng Anh trong phạm vi giao diện được duyệt; khôi phục cặp tệp locale `.vi.json` / `.en.json` theo cơ chế i18n thực tế của FE-023 (`SUPPORTED_LANGUAGES = ["vi", "en"]`, `DEFAULT_LANGUAGE = "vi"`, `fallbackLng: "vi"`, lưu lựa chọn trong `localStorage` key `edubranch-lang`).
       - Tiêu chí nghiệm thu (AC) và kiểm thử phải kiểm chứng hành vi chuyển đổi ngôn ngữ thực tế trên trình duyệt, không chỉ kiểm tra riêng nút bấm.
       - Màn hình và component dùng chung hiển thị trọn vẹn theo một ngôn ngữ tại một thời điểm (không trộn lẫn ngôn ngữ); dữ liệu động từ API (tên khóa học, tên file, nội dung chunk) hiển thị đúng theo dữ liệu gốc được lưu trữ, không tự ý dịch; không tự ý dịch tự do thuật ngữ nghiệp vụ; các chuỗi tiếng Anh được đánh dấu `[ĐỀ-XUẤT]` cho đến khi PO duyệt.

---

## 4. Planned Quality Gates & Verification Readiness

| Quality Gate | Description | Verification Method & Target | Status |
|:---:|---|---|:---:|
| **QG1** | Developer tests | `npx tsx --test frontend/src/**/*.spec.ts` covering mappers, services, pages, and the ATM scenarios. | Planned (`T003`–`T007`, `T013`, `T018`, `T022`, `T032`) |
| **QG2** | Independent review | Diff only touches planned files; trace spec → tasks → code → tests; `/speckit-analyze` clean; QG1 re-run by reviewer. | Planned |
| **QG3** | Browser check | Side-by-side browser inspection at 1440px viewport against Page 08 frames 02.1–02.7 per `CLAUDE.md`. | Planned (`T024`, `T035`) |
| **QG4** | No open FAIL/BLOCKED incl. no PROPOSED copy in release | Every mandatory AC PASS; any BLOCKED item reported to the PO; all English strings in release scope marked APPROVED by the PO in `l10n-copy-review.md`. | Planned (`T038`, `T040`) |
| **QG5** | PR checks | Every GitHub Actions run on the PR is green, plus manual test of the PR head. | Downstream |
| **QG6** | Merge | Valid Code Owner/PO approval; merge by approved method; no bypass. | Downstream |
| **QG7** | Post-merge | QG1 + QG3 re-run on `develop` at the merge SHA. | Downstream |
