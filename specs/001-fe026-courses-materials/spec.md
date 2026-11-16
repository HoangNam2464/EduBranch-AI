# Feature Specification: Rework Courses & Materials Screens to Figma 02.1–02.7 [FE-026]

**Feature Branch**: `docs/spec-kit-workflow` (Worktree: `specs/001-fe026-courses-materials`)  
**Date**: 2026-11-16  
**Created**: 2026-11-15  
**Updated**: 2026-11-16 (Clarifications & PO Decisions Integrated)  
**Status**: Draft (Clarified)  
**Parent Task**: Jira `EBA-89` (Sprint 3) · Master Tasks `EBA-101`, `EBA-102`, `EBA-201`, `EBA-202`, `EBA-203`, `EBA-204`, `EBA-205`, `EBA-206`, `EBA-207`, `EBA-217`, `EBA-218`  
**Input**: Jira description (verbatim):
> "Làm lại các màn Khóa học và Tài liệu đã code (danh sách khóa học, tạo/sửa khóa học, bảng tài liệu, upload, trạng thái xử lý, xem nguồn) cho khớp Figma page 08 (frame 02.1–02.7), giữ nguyên tích hợp API hiện có."

---

## 1. Mục tiêu & Phạm vi (Scope & Boundaries)

### 1.1. Mục tiêu (What & Why)
- **Mục tiêu**: Tái cấu trúc và hoàn thiện giao diện các màn hình Quản lý Khóa học và Tài liệu môn học (`frontend/src/pages/lecturer/CoursesPage.tsx`, `MaterialsPage.tsx`, `RagSourceInspectorPage.tsx`) để đồng bộ 100% với bản thiết kế Figma chuẩn (Page `08 · EduBranch – Bản hoàn chỉnh`, các frame `02.1` đến `02.7`).
- **Lý do**: Khắc phục các vi phạm thiết kế, loại bỏ 100% dữ liệu giả lập (`MOCK_CHUNKS`, fake upload files), chuẩn hóa hệ thống màu sắc theo Design System mới (Navy `#2A4E7F` / Sky `#00A5F5`), đồng thời bảo toàn các hành vi nghiệp vụ và bảo mật đã được nghiệm thu trong Sprint 1 và 2 (`FE-001` … `FE-006`, `QA-003`, `QA-004`).

### 1.2. Vai trò người dùng (Users & Roles)
- **Giảng viên (`LECTURER`)**: Là đối tượng người dùng duy nhất tương tác với phân hệ này. Giảng viên sở hữu khóa học, tạo/chỉnh sửa khóa học, thực hiện thao tác loại bỏ khóa học (removal: under C1-A xóa cứng theo Figma 02.3 vs under C1-B lưu trữ mềm theo OPD-014 / PO Q4; `BLOCKED-ON-C1 — pending PO`), tải lên tài liệu giảng dạy (PDF/DOCX), theo dõi tiến trình xử lý vector hóa RAG, xóa tài liệu và kiểm tra các đoạn trích dẫn (source chunks).
- **Sinh viên (`STUDENT`)**: Tuyệt đối không có quyền truy cập vào các màn hình quản trị khóa học và tài liệu của giảng viên. Mọi truy cập trái phép phải bị chuyển hướng hoặc chặn ở tầng guard (`403 Forbidden` / `NotFoundPage`).
- **Quản trị viên (`ADMIN`)**: Quản lý ở phạm vi hệ thống theo Proposal V1.2, không trực tiếp thao tác biên soạn bài giảng thay giảng viên trong flow này.

### 1.3. Ranh giới bất biến (Boundaries that must stay unchanged)
- **Giữ nguyên API Backend Gateway**: Giữ nguyên các hợp đồng API REST hiện có giữa Frontend và Backend (các route tương đối sau tiền tố `/api/v1`: `/courses`, `/materials`). Sửa lỗi lệch route xóa tài liệu sang đúng route hiện hữu `DELETE /materials/:id` [PO-ĐÃ-XÁC-NHẬN].
- **Ranh giới dịch vụ AI (FND §3)**: Frontend chỉ giao tiếp duy nhất với Backend Gateway (`/api/v1/*`), tuyệt đối không gọi trực tiếp sang FastAPI AI Service (`/internal/v1/*`).
- **Không giả lập dữ liệu & Missing API ≠ Empty Data**: Tuyệt đối không hard-code dữ liệu giả lập khi API backend chưa hỗ trợ hoặc trả về lỗi. Mọi thiếu hụt API (như API chunks pgvector `BE-PROP-1`, soft archive `BE-PROP-2` [C1-B only; BLOCKED-ON-C1 — pending PO]) được ghi nhận là đề xuất backend dependency trong `specs/001-fe026-courses-materials/be-dependencies.md`. Giao diện chỉ hiển thị `EmptyState` khi API trả về HTTP 200 OK với danh sách rỗng (`items: []`); khi API chưa có (404), 403, 5xx hoặc lỗi mạng, giao diện PHẢI hiển thị trạng thái lỗi / chưa khả dụng (`ErrorState`) với lý do thực tế và nút thử lại, tuyệt đối không dùng mảng rỗng `[]` làm fallback, không hiển thị rỗng giả tạo và không dùng dữ liệu cache/mock.
- **Ranh giới sở hữu (Ownership Invariant)**: Giảng viên chỉ được xem và thao tác trên khóa học và tài liệu do chính mình tạo ra (`currentUser.id`). Không hỗ trợ đồng sở hữu trong MVP.
- **Ranh giới phụ thuộc tái cấu trúc Frontend FE-023**: FE-026 kế thừa cấu trúc FE-023 sau khi được merge vào `develop`. Trong thời gian chờ, hoàn thiện spec, plan, tasks dựa trên định hướng FE-023 nhưng tuyệt đối không triển khai mã nguồn trên cấu trúc cũ và không tự ý đưa thay đổi uncommitted vào branch [PO-ĐÃ-XÁC-NHẬN].

---

## 2. Clarifications (Làm rõ & Quyết định của Product Owner)

### Session 2026-11-15

- **Q1: Kiến trúc tái cấu trúc Frontend & Thư mục Component mục tiêu (Architectural Target)**
  - **Question**: Kế hoạch thực hiện FE-026 sẽ xây dựng trực tiếp trên cấu trúc thư mục hiện tại của nhánh (`src/components/ui/`, `src/pages/lecturer/`), hay cần đồng bộ/áp dụng cấu trúc tái cấu trúc FE-023 (`src/components/ds/`, `src/routes/paths.ts`, locale i18n riêng) đang nằm uncommitted trên nhánh `refactor/frontend-structure`?
  - **Answer**: `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-15, chat, verbatim):
    > "Chọn B – chờ FE-023 merge vào develop. Đúng theo thứ tự triển khai đã được PO xác lập ngày 13/11: hoàn thành tái cấu trúc frontend trước, sau đó mới triển khai lại các màn hình trên cấu trúc mới. Yêu cầu: - FE-026 phải kế thừa cấu trúc FE-023 sau khi được tích hợp vào develop. - Không triển khai code FE-026 trên cấu trúc cũ. - Không tự lấy hoặc đưa các thay đổi uncommitted từ refactor/frontend-structure vào nhánh hiện tại. - Trong thời gian chờ, có thể hoàn thiện spec, plan, tasks và Acceptance Criteria dựa trên định hướng FE-023, nhưng phải xác minh lại cấu trúc thực tế sau khi merge. - Trước khi implement, kiểm tra commit SHA mới nhất của develop và xác nhận các dependency của FE-023 đã thực sự có mặt. - Không tự merge FE-023 hoặc thay đổi trạng thái task khi chưa đủ quyền và điều kiện nghiệm thu."

- **Q2: Xử lý dữ liệu RAG Source Inspector khi Backend chưa có API Chunks (API Gap Handling)**
  - **Question**: Backend hiện tại chưa có API trả về danh sách các chunks trích xuất của một tài liệu trong pgvector (trước đây dùng `MOCK_CHUNKS`). FE-026 nên hiển thị màn hình 02.7 như thế nào để tuân thủ quy tắc "Không giả lập dữ liệu"?
  - **Answer**: `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-15, chat, verbatim):
    > "Chọn B – bổ sung task BE để cung cấp API lấy danh sách chunks thực tế của tài liệu. Lý do: Màn hình 02.7 RAG Source Inspector cần thể hiện dữ liệu chunks thật, không được sử dụng MOCK_CHUNKS hoặc dữ liệu giả để tạo cảm giác chức năng đã hoàn thành. Yêu cầu: - Đề xuất API GET `/materials/:id/chunks` với response contract phù hợp. - Xác định pagination, metadata, thứ tự chunks và trạng thái dữ liệu. - Bảo đảm authentication, authorization và course ownership. - Kiểm tra API chỉ trả về chunks thuộc tài liệu mà người dùng có quyền truy cập. - Bổ sung integration test với dữ liệu thực. - FE-026 phải phụ thuộc vào API BE này nếu chức năng xem chunks nằm trong phạm vi được duyệt. Chỉ tạo đề xuất task BE và ghi nhận dependency trong Spec Kit. Không tự đưa task vào Sprint, thay đổi Jira hoặc mở rộng scope khi chưa có PO duyệt. Trong thời gian API chưa sẵn sàng, không dùng mock để thay thế dữ liệu thật và không tuyên bố màn hình đã hoàn thành chức năng."

- **Q3: Hành vi nút "Thử lại" khi Tài liệu xử lý Thất bại (Retry Action for Failed Materials)**
  - **Question**: Khi một tài liệu bị trạng thái `FAILED`, nút "Thử lại" trên dòng tài liệu (02.4) nên thực hiện hành động gì khi Backend hiện chưa có endpoint Re-ingest?
  - **Answer**: `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-15, chat, verbatim):
    > "Chọn A – mở modal để người dùng chọn lại và tải lên tài liệu. Nhưng cần điều chỉnh semantics cho chính xác: - Không gọi đây là retry/re-ingest vì backend chưa có API xử lý lại ingestion của material hiện hữu. - Đổi nhãn nút từ "Thử lại" thành "Tải lên lại" hoặc "Chọn tệp tải lại". - Khi nhấn, mở upload modal và yêu cầu người dùng chọn lại file gốc. - Hiển thị lý do tài liệu trước đó FAILED để người dùng hiểu nguyên nhân. - Upload lại phải tạo một lượt xử lý mới thông qua API upload hiện có. - Không tự động xóa bản ghi FAILED cũ trước khi upload mới thành công. - Thông báo rõ nếu việc tải lên lại có thể tạo bản ghi tài liệu mới để tránh người dùng hiểu nhầm. - Chỉ cập nhật trạng thái theo kết quả API thực tế, không báo thành công giả. - Kiểm tra đầy đủ loading, error, success và trường hợp upload thất bại. Không tạo API re-ingest mới trong phạm vi FE-026. Nếu sau này muốn retry trực tiếp ingestion của tài liệu hiện có thì đó là một yêu cầu BE riêng cần PO duyệt. Hãy ghi rõ quyết định này trong spec, Acceptance Criteria và test scenarios."

- **Q4: Course removal (C1, pending PO; option C1-B = PO Q4 answer)**
  - **Question**: Theo UX Screen Notes 02.3, nội dung xóa khóa học còn chờ quyết định OPD-014 (xóa cứng hay lưu trữ) và backend hiện trả về 500 nếu khóa học có tài liệu. Giao diện modal xác nhận xóa khóa học (02.3) nên thông báo cảnh báo thế nào?
  - **Answer**: `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-15, chat, verbatim):
    > "Chọn C – Lưu trữ khóa học thay vì xóa cứng. Đây là quyết định đã được PO xác lập trong OPD-014: khóa học và Case sử dụng cơ chế soft archive. Yêu cầu: - Kế thừa đúng quyết định OPD-014, không coi đây là nghiệp vụ mới cần PO quyết định lại. - Thay thao tác xóa cứng bằng lưu trữ mềm. - Không xóa các tài liệu, chunks hoặc object trên MinIO khi lưu trữ khóa học. - Dữ liệu liên quan phải được bảo toàn. - Giao diện sử dụng nhãn và trạng thái phù hợp với nghiệp vụ lưu trữ. - Kiểm tra lại danh sách khóa học, trạng thái khóa học và các API liên quan để bảo đảm khóa học đã lưu trữ không bị hiển thị hoặc sử dụng như khóa học đang hoạt động trái với quy định. - Xem xét khả năng khôi phục chỉ theo đúng phạm vi OPD-014 đã duyệt; không tự tạo thêm nghiệp vụ khôi phục nếu chưa có căn cứ. - Xác định cách điều chỉnh API và database dựa trên kiến trúc hiện tại, không tự ý tạo một cơ chế song song. - Bổ sung integration test kiểm tra dữ liệu khóa học, tài liệu, chunks và MinIO vẫn được bảo toàn sau khi lưu trữ. Ghi rõ quyết định OPD-014 trong spec, plan, tasks và Acceptance Test Matrix. Lỗi HTTP 500 hiện tại phải được xử lý bằng cách triển khai đúng nghiệp vụ lưu trữ mềm, không phải bằng cách thêm cascade xóa dữ liệu."

- **Q5: Đồng bộ Đường dẫn API Xóa Tài liệu (Material Delete API Alignment)**
  - **Question**: Mã nguồn frontend cũ tại `MaterialsPage.tsx:789` gọi `DELETE /courses/:courseId/materials/:id`, trong khi route của NestJS backend là `DELETE /materials/:id`. FE-026 có được phép sửa lệnh gọi API này sang đúng route của backend không?
  - **Answer**: `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-15, chat, verbatim):
    > "Chọn A – sửa trong FE-026. Yêu cầu: - Sử dụng đúng endpoint DELETE mà backend hiện đang cung cấp. - Kiểm tra global prefix, API baseURL và route thực tế trước khi xác định URL cuối cùng. Không tự ý thêm `/api/v1` hai lần. - Không tạo alias backend chỉ để tương thích với endpoint frontend sai. - Giữ nguyên API contract và kiến trúc backend hiện tại. - Ghi nhận đây là lỗi tồn đọng từ FE-005, liên kết nguồn phát hiện để bảo đảm truy vết. - Bổ sung regression test xác nhận frontend gọi đúng endpoint và xử lý chính xác các kết quả 200/204, 403, 404 và lỗi server. - Kiểm tra dữ liệu danh sách được cập nhật sau khi xóa thành công; không xóa hàng trên UI trước khi API xác nhận thành công. - Kiểm tra cả trường hợp lỗi mạng và quyền truy cập. - Chạy kiểm thử trên phiên bản tích hợp sau khi merge vào develop. Đưa nội dung sửa lỗi vào spec, tasks và Acceptance Test Matrix của FE-026. Không đánh dấu hoàn thành nếu mới chỉ sửa URL mà chưa kiểm chứng thao tác xóa thực tế."

### Session 2026-11-16

- **Q6: Phạm vi Bản địa hóa & Nút chuyển ngôn ngữ VI/EN trên Header (Localization Scope & Header Language Switch)**
  - **Question**: Bản thiết kế Figma thể hiện nút chuyển đổi ngôn ngữ VI/EN trên shared header (`EB/Header Actions`, frame `Language` node `544:5800`). Phạm vi bản địa hóa cho FE-026 và MVP được xác định như thế nào?
  - **Answer**: `SUPERSEDED (2026-11-16, PO chat): replaced by the PO directive that the approved Figma page 08, including the VI/EN switch, is the UI source`:
    > "MVP chỉ sử dụng tiếng Việt. English localization chỉ triển khai sau khi sản phẩm đạt khoảng 75% và có PO approval."
  - **PO Directive mới `[PO-ĐÃ-XÁC-NHẬN]` (2026-11-16, chat, verbatim)**:
    > "Figma page 08 đã được PO chốt. Nút chuyển ngôn ngữ VN / ENG là thành phần tôi chủ động bổ sung và đã hoàn thiện trên Figma. Thiết kế này thuộc giao diện sản phẩm đã được duyệt."
    - **Nguyên tắc**: (1) Figma đã duyệt là nguồn duy nhất cho thiết kế UI; (2) Các tài liệu kỹ thuật, ghi chú UX, Kế hoạch dự án và Spec Kit chưa được PO duyệt phải được cập nhật để khớp với Figma; (3) Tuyệt đối không dùng tài liệu cũ hoặc tài liệu Draft để loại bỏ, từ chối hay hoãn thành phần giao diện đã được duyệt.
    - **Yêu cầu thực thi**:
      - Giữ nguyên nút chuyển đổi VI/EN trên shared header đúng như trên Figma page 08 (khung `Language` node `544:5800`, component `EB/Header Actions` `540:347`). Bản thân header thuộc phạm vi vỏ ứng dụng FE-025 (shell); các màn hình và component dùng chung của FE-026 phải chuyển đổi đồng bộ theo trạng thái ngôn ngữ được chọn.
      - Hệ thống bản địa hóa hỗ trợ song ngữ Tiếng Việt và Tiếng Anh trong phạm vi giao diện được duyệt; khôi phục cặp tệp locale `.vi.json` / `.en.json` theo cơ chế i18n của FE-023 [FE-023 target (expected; not on develop `273f1fc`; verified by T028)] (`SUPPORTED_LANGUAGES = ["vi", "en"]`, `DEFAULT_LANGUAGE = "vi"`, `fallbackLng: "vi"`, lưu lựa chọn trong `localStorage` key `LANGUAGE_STORAGE_KEY = "edubranch-lang"`, localStorage-only detection, gộp file qua `import.meta.glob`).
      - Tiêu chí nghiệm thu (AC) và kiểm thử phải kiểm chứng hành vi chuyển đổi ngôn ngữ thực tế trên trình duyệt, không chỉ kiểm tra riêng nút bấm.
      - Màn hình và component dùng chung hiển thị trọn vẹn theo một ngôn ngữ tại một thời điểm (không trộn lẫn ngôn ngữ); dữ liệu động từ API (tên khóa học, tên file, nội dung chunk) hiển thị đúng theo dữ liệu gốc được lưu trữ, không tự ý dịch; không tự ý dịch tự do thuật ngữ nghiệp vụ; các chuỗi tiếng Anh được đánh dấu `[ĐỀ-XUẤT]` cho đến khi PO duyệt.

### Session 2026-11-16 (Tiếp tục) — Câu hỏi mở chờ Product Owner quyết định (`[CHƯA-QUYẾT]`)

Order convention: A = keep the approved Figma as drawn; B = follow the earlier PO decision / current backend DTO. The letters are labels only, not a preference. All three stay `[CHƯA-QUYẾT]`.

- **C1 — Course removal on 02.3** `[CHƯA-QUYẾT]`
  - Facts: Figma 02.3 dialog `I483:10341;228:301` "Xóa khóa học này?", body `…228:302` (courses, materials and case studies are deleted, irreversible), confirm `…228:310;225:254` "Xóa khóa học". PO Q4 (2026-11-15) + OPD-014: soft archive, keep course, materials, chunks, MinIO objects. Backend today: `DELETE /courses/:courseId` returns HTTP 500 when the course has materials (FK, no cascade); `courses.is_active` exists.
  - **C1-A (keep Figma):** hard delete with the Figma copy. Needs: the PO to change the Q4/OPD-014 decision; a backend change that deletes the course's materials, chunks, MinIO objects and related cases safely (today it fails with 500). Not BE-PROP-2.
  - **C1-B (follow PO Q4 / OPD-014):** soft archive. Needs: the PO to change the Figma 02.3 copy (archive wording); BE-PROP-2 (`PATCH /courses/:courseId/archive`, `is_active = false`, active lists exclude archived courses).
  - *Trạng thái*: `BLOCKED-ON-C1 — pending PO`. Không đề xuất lựa chọn tạm thời (tuân thủ nghiêm ngặt AGENTS.md Quy tắc 5). Chờ Product Owner quyết định.

- **C2 — Label of the FAILED-row action (02.4/02.6, `586:8534`, `586:8570`)** `[CHƯA-QUYẾT]`
  - Facts: Figma label "Thử lại". PO Q3 (2026-11-15): label "Tải lên lại" (or "Chọn tệp tải lại"); the action opens the upload modal (02.5), shows the previous failure reason, the user re-selects the file, a new upload goes through the existing `POST /courses/:courseId/materials`, the old FAILED record is not deleted before the new upload succeeds; "Không tạo API re-ingest mới trong phạm vi FE-026".
  - **Behaviour is the same under C2-A and C2-B** (the PO Q3 flow above, existing upload API, no new API). Only the label differs.
  - **C2-A (keep Figma):** label "Thử lại".
  - **C2-B (follow PO Q3):** label "Tải lên lại" / "Chọn tệp tải lại"; needs the PO to change the Figma text.
  - **Out of FE-026 (not an option here):** a "Thử lại" that re-ingests the existing material in place would need a new backend API and is a business/scope change requiring separate PO approval (PO Q3). Mention it only as this note.
  - *Trạng thái*: `BLOCKED-ON-C2 — pending PO`. Không đề xuất lựa chọn tạm thời (tuân thủ nghiêm ngặt AGENTS.md Quy tắc 5). Chờ Product Owner quyết định.

- **C3 — Course code required-ness on 02.2** `[CHƯA-QUYẾT]`
  - Facts: Figma 02.2 label "Mã môn học *" (`I483:10105;226:146`, asterisk = required). `CreateCourseDto.courseCode`: `@IsOptional()`, `@IsString()`, `@MaxLength(20)` (`backend/src/modules/course/dto/create-course.dto.ts:14-17`).
  - **C3-A (keep Figma):** required; needs a backend DTO change (and a rule for existing courses without a code).
  - **C3-B (follow the DTO):** optional; needs the PO to remove the asterisk on Figma.
  - *Trạng thái*: `BLOCKED-ON-C3 — pending PO`. Không đề xuất lựa chọn tạm thời (tuân thủ nghiêm ngặt AGENTS.md Quy tắc 5). Chờ Product Owner quyết định.

---

## 3. Thiết kế giao diện theo Figma (UI Specification: Figma Frames 02.1–02.7)

### 3.1. Nguồn tham chiếu Figma & Trạng thái thiết kế
- **Figma File Key**: `6CtSgJPKo4jCIbB7WwCaWw`
- **Figma Canonical Page**: `08 · EduBranch – Bản hoàn chỉnh` (Node ID: `483:9634`)
- **Figma Section**: `02 · Giảng viên · Khóa học & Tài liệu` (Node ID: `483:9636`)
- **Trạng thái đọc Figma MCP**: Đã kiểm tra và trích xuất thành công toàn bộ Node ID, tên frame và kích thước chính xác qua công cụ Figma MCP `get_metadata` trên section `483:9636`.
- **Trạng thái phê duyệt Token**: `[DỮ-KIỆN]` Theo GDS §0.2 và AGENTS.md Quy tắc 9, các giá trị thiết kế là tạm thời (provisional) cho đến khi bộ token chính thức được phê duyệt; các frame chưa đóng dấu Ready for Dev.

### 3.2. Danh mục 7 Frames chuẩn (02.1 – 02.7)

| Mã Frame | Node ID | Tên Frame trên Figma Page 08 | Kích thước (W × H) | Route / Vị trí hiển thị | Component Frontend tương ứng | Nhiệm vụ chính & Bố cục |
|---|---|---|---|---|---|---|
| **02.1** | `483:9637` | `02.1 · Giảng viên · Quản lý khóa học` | 1440 × 1413 | `/lecturer/courses` | `CoursesPage.tsx` | Bố cục 2 cột: Danh sách thẻ khóa học bên trái (ảnh cover, mã `courseCode`, tên `name`, số tài liệu sẵn sàng, số case, ghi chú cần xử lý), panel chi tiết khóa học được chọn bên phải. |
| **02.2** | `483:9866` | `02.2 · Giảng viên · Hộp thoại khởi tạo khóa học` | 1440 × 1413 | Modal trên `/lecturer/courses` | Modal trong `CoursesPage.tsx` | Hộp thoại tạo mới / chỉnh sửa khóa học: Tên khóa học (`name`, bắt buộc, độ dài 2..200 ký tự per `CreateCourseDto`), Mã khóa học (`courseCode`, [DỮ-KIỆN] Figma 02.2 ghi "Mã môn học *" bắt buộc, backend DTO ghi `@IsOptional()`; tính bắt buộc/tùy chọn: `BLOCKED-ON-C3 — pending PO` (C3-A bắt buộc vs C3-B tùy chọn); tối đa 20 ký tự), Mô tả (`description`, tùy chọn, tối đa 1000 ký tự), Ảnh bìa (tùy chọn). Submit `POST /courses` hoặc `PUT /courses/:courseId`. |
| **02.3** | `483:10111` | `02.3 · Giảng viên · Hộp thoại xác nhận xóa khóa học` | 1440 × 1413 | Dialog trên `/lecturer/courses` | `CourseRemovalDialog` (`483:10341`) trong `CoursesPage.tsx` | Hộp thoại xác nhận loại bỏ khóa học ([DỮ-KIỆN] Figma 02.3 `483:10111` / `483:10341` mang tiêu đề xóa cứng "Xóa khóa học này?"; [PO-ĐÃ-XÁC-NHẬN] PO Q4 2026-11-15 và OPD-014 quy định lưu trữ mềm; copy và hành vi: `BLOCKED-ON-C1 — pending PO` (under C1-A xóa cứng vs under C1-B lưu trữ mềm)). Endpoint backend: under C1-B only gọi `PATCH /courses/:courseId/archive` [ĐỀ-XUẤT] (tái sử dụng `is_active`), under C1-A only gọi `DELETE /courses/:courseId` an toàn. |
| **02.4** | `483:10342` | `02.4 · Giảng viên · Chi tiết khóa học — Tài liệu môn học` | 1440 × 1123 | `/lecturer/courses/:courseId/materials` | `MaterialsPage.tsx` | Khối trên: Quy trình 4 bước và vùng kéo thả nhanh. Khối dưới: Bảng tài liệu kèm thanh tiến độ "x/y đã lập chỉ mục". Dòng hiển thị trạng thái PENDING, PROCESSING (%), COMPLETED (✓), FAILED (lý do lỗi đỏ + nút hành động: [DỮ-KIỆN] Figma node `586:8570` ghi "Thử lại", [PO-ĐÃ-XÁC-NHẬN] PO Q3 ghi "Tải lên lại"; nhãn nút: `BLOCKED-ON-C2 — pending PO` (C2-A "Thử lại" vs C2-B "Tải lên lại")). Nút xóa hiện khi hover/focus. |
| **02.5** | `483:10598` | `02.5 · Giảng viên · Hộp thoại tải tài liệu môn học` | 1440 × 1123 | Modal trên `MaterialsPage.tsx` | Upload Modal trong `MaterialsPage.tsx` | Hộp thoại tải tài liệu: Vùng kéo thả file, hàng đợi các tệp (sẵn sàng, đang tải %, lỗi định dạng, quá dung lượng), nút "Tải lên n tệp" chỉ đếm tệp hợp lệ. Gọi `POST /courses/:courseId/materials` (multipart field `file`). Loại bỏ 100% fake files mặc định. Hiển thị ngữ cảnh lỗi nếu mở từ dòng FAILED. |
| **02.6** | `483:10890` | `02.6 · Giảng viên · Hộp thoại xác nhận xóa tài liệu` | 1440 × 1123 | Dialog trên `MaterialsPage.tsx` | Delete Dialog trong `MaterialsPage.tsx` | Hộp thoại xác nhận xóa tài liệu: Nêu đích danh tên tệp và số đoạn trích dẫn (chunks) sẽ bị xóa khỏi pgvector và MinIO. Gọi đúng `DELETE /materials/:id` [PO-ĐÃ-XÁC-NHẬN]. |
| **02.7** | `483:11148` | `02.7 · Giảng viên · RAG Source Inspector (DES-005)` | 1440 × 1329 | `/lecturer/courses/:courseId/materials/:materialId/rag` | `RagSourceInspectorPage.tsx` | Thanh số liệu 3 cột (Đoạn trích, Số trang, Dung lượng). Danh sách đoạn trích từ API thực tế [ĐỀ-XUẤT] `GET /materials/:id/chunks` [PO-ĐÃ-XÁC-NHẬN]. Loại bỏ 100% `MOCK_CHUNKS` và `OTHER_DOCUMENTS`. |

### 3.2.1. Ghi chú về xung đột nhãn nút trên dòng FAILED (Frame 02.4 / Node `586:8570` → C2)
- **Nhãn nút thao tác trên dòng FAILED (Frame 02.4 / Node `586:8570`)**: [DỮ-KIỆN] Trên Figma frame 02.4 (`586:8570`), nút hành động gắn nhãn "Thử lại". [PO-ĐÃ-XÁC-NHẬN] Theo PO Q3 (2026-11-15, chat), PO yêu cầu đổi nhãn nút thành "Tải lên lại" (hoặc "Chọn tệp tải lại") do backend chưa có API re-ingest tài liệu hiện hữu. Nhãn nút hành động trên giao diện: `BLOCKED-ON-C2 — pending PO` (C2-A "Thử lại" vs C2-B "Tải lên lại"). Về hành vi: khi bấm nút, hệ thống mở Modal Tải tài liệu (02.5) kèm ngữ cảnh lỗi của tệp trước đó và yêu cầu người dùng chọn lại file gốc để tạo lượt xử lý mới qua API upload hiện có `POST /courses/:courseId/materials` (luồng hành vi này là như nhau dưới cả C2-A và C2-B). Out of FE-026 note: cơ chế "Thử lại" re-ingest tài liệu hiện hữu tại chỗ đòi hỏi API backend mới và nằm ngoài phạm vi FE-026 (PO Q3).

### 3.2.2. Nút chuyển đổi ngôn ngữ VI/EN trên Shared Header (Figma Language Switch)
- Nút chuyển đổi ngôn ngữ `Language` (Node `544:5800`) thuộc component dùng chung `EB/Header Actions` (Node `540:347`, COMPONENT; mô tả "... đổi ngôn ngữ VI/EN ..."; 76 instances trên Page 08 `483:9634`). Kích thước 78×40, fill `bg/surface-muted` (`#EEF2F9`), viền `border-default`, bo góc radius 10.
  - `Option · VI` (Node `544:5801`): 34×32, radius 8, fill `action/primary` (`#2A4E7F`), chữ "VI" (`544:5802`) Roboto Medium 12 `text/inverse` (`#FFFFFF`) — thể hiện trạng thái hoạt động (active state mặc định).
  - `Option · EN` (Node `544:5803`): không fill, chữ "EN" (`544:5804`) Roboto Medium 12 `text/secondary` (`#696A70`) — thể hiện trạng thái không hoạt động (inactive state). Nhãn trên Figma chính xác là "VI" và "EN".
  - Trạng thái EN-active chưa được vẽ riêng trên Figma prototype; khi EN được chọn, style hai tùy chọn được hoán đổi (EN nhận fill `action/primary` + `text/inverse`, VI chuyển sang no fill + `text/secondary`).
  - Bản thân header thuộc phạm vi vỏ ứng dụng FE-025 (shell scope); các màn hình và component dùng chung của FE-026 phải chuyển đổi ngôn ngữ đồng bộ theo trạng thái lựa chọn từ nút này.

### 3.3. Quy chuẩn Design System Tokens & Typography (Tuân thủ R01 & Eduva)
- **Hệ màu chuẩn (Locked Hex Tokens)** `[DỮ-KIỆN]`:
  - *Màu nền & Bề mặt*: `bg-page` (`#FFFFFF`), `bg-canvas` (`#F3F6FC`, radius 18), `bg-surface` (`#FFFFFF`, radius 12, không viền, không đổ bóng), `bg-surface-muted` (`#EEF2F9`, radius 8), `bg-surface-hover` (`#E8EDF6`), `bg-selected` (`#DFEDF9`).
  - *Màu chữ*: `text-primary` (`#202124`), `text-secondary` (`#696A70`), `text-muted` (`#909198` - chỉ dùng cho placeholder/disabled/icons, cấm dùng cho văn bản cần đọc), `text-inverse` (`#FFFFFF`).
  - *Viền*: `border-default` (`#E1E8F5`), `border-strong` (`#D1D9E8`), `border-focus` (`#2A4E7F` kèm halo sky `#00A5F5` 30%). Không viền quanh card trên nền canvas.
  - *Thương hiệu & Hành động*: `action-primary` (`#2A4E7F`), hover `#223F68`, active `#1B3253`, disabled `#94A7C0`. `action-accent` (`#00A5F5` - chỉ dùng cho highlight số liệu/tiến độ, tuyệt đối không dùng làm màu chữ hay nền nút chữ trắng). `action-danger` (`#D11F1F`).
  - *Trạng thái xử lý tài liệu*:
    - `PENDING`: Nền `#EEF2F9`, chữ `#696A70`, nhãn "Đang chờ".
    - `PROCESSING`: Nền `#FFF1DE`, chữ `#9A5700`, nhãn kèm thanh tiến độ `%`.
    - `COMPLETED`: Nền `#E1F7E9`, chữ `#007A2D`, icon check `✓` và số chunks.
    - `FAILED`: Nền `#FFE5E5`, chữ `#D11F1F`, thông báo lý do lỗi; nút hành động ([DỮ-KIỆN] "Thử lại" per Figma / [PO-ĐÃ-XÁC-NHẬN] "Tải lên lại" per PO Q3): `BLOCKED-ON-C2 — pending PO` (C2-A vs C2-B).
- **Phiên bản UI Rules sử dụng `[DỮ-KIỆN]`**: Phiên bản quy chuẩn UI được áp dụng là `.agents/rules/01-ui-design-standards.md` trên nhánh này (develop `273f1fc`, git blob `b7c4c10e8134b1e687179dfee121d46b8e16aec5`, xem `git rev-parse 273f1fc:.agents/rules/01-ui-design-standards.md`). PO có bản local mới hơn của file này và của 8 file `feature-*.md` chưa commit lên bất kỳ nhánh nào: bản local này CHƯA được tích hợp, là phạm vi công việc riêng biệt, và FE-026 bắt buộc phải kiểm tra lại các quy tắc UI đã commit một khi PO đưa lên repository (nội dung này được xác minh trong preflight của task T028). Tuyệt đối không trích dẫn, băm mã hash hay dẫn đường dẫn tuyệt đối của bản local.
- **Typography & Font**:
  - Font gia đình: `Roboto`, sans-serif.
  - Tiêu đề dùng `Font-Weight: 400` (Regular) theo phong cách Eduva; phân cấp bằng kích thước và bề mặt.
  - Độ dài dòng đọc (Measure): Giới hạn `65–75ch` cho văn bản mô tả và nội dung đoạn trích.
- **Quy tắc chống "AI-Slop" (R01 §1)**:
  - CẤM 100% emoji Unicode (`🌿`, `📚`, `📄`, `✅`, `❌`, `⚠️`, `🔍`, v.v.) trong code và giao diện; thay bằng Lucide vector SVG (`BookOpen`, `FileText`, `CheckCircle2`, `AlertCircle`, `UploadCloud`, `Trash2`, `RotateCcw`).
  - CẤM các ký tự text thay icon (`->`, `&rarr;`, `✕`, `✓`).
  - CẤM màu tím, gradient lòe loẹt, viền neon.
  - CẤM trộn lẫn tiếng Anh và tiếng Việt trên cùng một màn hình; màn hình và component dùng chung hiển thị trọn vẹn theo một ngôn ngữ được chọn tại một thời điểm (mặc định tiếng Việt, chuyển sang tiếng Anh thông qua nút chuyển đổi VI/EN).

---

## 4. Tích hợp Dữ liệu & Hợp đồng API (Data & API Mapping)

### 4.1. Màn hình Quản lý Khóa học (`/lecturer/courses`)
- **Dữ liệu hiển thị**: Danh sách các khóa học của giảng viên hiện tại. Mỗi item: `id`, `name`, `courseCode` (mã học phần per `backend/src/modules/course/dto/create-course.dto.ts`), `description`, `is_active` (`BOOLEAN NOT NULL DEFAULT TRUE` per `backend/migrations/V1__init_schema.sql:39`), `createdAt`, `updatedAt`, `materialCount`, `caseCount`.
- **API tương ứng** (các route tương đối sau tiền tố `/api/v1`):
  - `GET /courses`: Lấy danh sách khóa học (`lecturerId = currentUser.id`).
  - `POST /courses`: Tạo khóa học mới ([DỮ-KIỆN] existing DTO `CreateCourseDto` per `backend/src/modules/course/dto/create-course.dto.ts`: `name` required độ dài 2..200 ký tự, `courseCode` optional tối đa 20 ký tự — required-ness in the UI: `BLOCKED-ON-C3 — pending PO` (C3-A required vs C3-B optional), `description` optional tối đa 1000 ký tự) kích hoạt từ nút "Tạo khóa học mới" trên trang (02.1 `I483:9668;225:164`), mở hộp thoại tiêu đề "Khởi tạo khóa học mới" (02.2 `483:10099`) và submit bằng nút "Tạo khóa học" (02.2 `I483:10110;225:146`).
  - `PUT /courses/:courseId`: Cập nhật thông tin khóa học (`UpdateCourseDto`).
  - Loại bỏ khóa học (Course removal): [DỮ-KIỆN] Figma 02.3 thể hiện hộp thoại xóa cứng "Xóa khóa học này?"; [PO-ĐÃ-XÁC-NHẬN] PO Q4 (2026-11-15) và OPD-014 quy định lưu trữ mềm. Giao diện và API tương ứng (under C1-B soft archive: `PATCH /courses/:courseId/archive` [ĐỀ-XUẤT] tái sử dụng `is_active` bảo toàn dữ liệu; under C1-A hard delete: `DELETE /courses/:courseId` xóa cascade an toàn): `BLOCKED-ON-C1 — pending PO` (C1-A hard delete vs C1-B soft archive).

### 4.2. Màn hình Tài liệu môn học (`/lecturer/courses/:courseId/materials`)
- **Dữ liệu hiển thị**: Thông tin khóa học cha (tên, mã `courseCode`) và danh sách tài liệu. Mỗi tài liệu: `id`, `courseId`, `originalFilename`, `mimeType`, `sizeBytes`, `processingStatus` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), `chunkCount`, `uploadedAt`, `processingError`.
- **API tương ứng** (các route tương đối sau tiền tố `/api/v1`):
  - `GET /courses/:courseId`: Lấy thông tin khóa học hiện tại.
  - `GET /courses/:courseId/materials`: Lấy danh sách tài liệu của khóa học.
  - `POST /courses/:courseId/materials`: Tải file lên MinIO và lưu metadata (`multipart/form-data`, trường multipart `file` per `backend/src/modules/material/material.controller.ts:33`, file PDF/DOCX <= 50MB per `MAX_SIZE_BYTES = 50 * 1024 * 1024` trong `backend/src/modules/material/material.service.ts:19`).
  - `DELETE /materials/:id`: Xóa tài liệu khỏi hệ thống. Đã đồng bộ đúng endpoint backend thực tế per `backend/src/modules/material/material.controller.ts:80` [PO-ĐÃ-XÁC-NHẬN].
- **Hành vi xử lý tệp lỗi (Failed Material Action)**: Khi tài liệu ở trạng thái `FAILED`, nút trên dòng tài liệu mang nhãn: [DỮ-KIỆN] Figma node `586:8570` ghi "Thử lại", [PO-ĐÃ-XÁC-NHẬN] PO Q3 ghi "Tải lên lại" (hoặc "Chọn tệp tải lại"); nhãn nút: `BLOCKED-ON-C2 — pending PO`. Về hành vi: khi nhấn, mở modal tải tài liệu (02.5), hiển thị lý do lỗi của tệp trước đó để người dùng nắm rõ, và cho phép chọn lại file gốc để tạo lượt xử lý mới qua API upload hiện có `POST /courses/:courseId/materials` [PO-ĐÃ-XÁC-NHẬN].

### 4.3. Màn hình RAG Source Inspector (`/lecturer/courses/:courseId/materials/:materialId/rag`)
- **Dữ liệu hiển thị**: Thông tin tệp tài liệu, 3 thẻ chỉ số (Tổng số đoạn trích, Số trang, Dung lượng tệp), danh sách các đoạn trích chunks (số trang, nội dung text trích xuất).
- **API tương ứng** (các route tương đối sau tiền tố `/api/v1`):
  - `GET /materials/:id`: Lấy chi tiết metadata của tài liệu.
  - `GET /materials/:id/chunks` `[ĐỀ-XUẤT]`: Lấy danh sách chunks thực tế từ pgvector qua đề xuất backend `BE-PROP-1` (chi tiết tại `specs/001-fe026-courses-materials/be-dependencies.md`) [PO-ĐÃ-XÁC-NHẬN Q2].
- **Chính sách Zero Fake Data & Missing API ≠ Empty Data**: Loại bỏ 100% `MOCK_CHUNKS` và `OTHER_DOCUMENTS`. Áp dụng nguyên tắc Missing API ≠ Empty Data: Giao diện chỉ hiển thị `EmptyState` khi API trả về 200 OK với danh sách rỗng (`items: []`, `total_chunks: 0`). Khi endpoint chưa sẵn sàng (404), 403, 5xx hoặc mất mạng, giao diện PHẢI hiển thị trạng thái lỗi / chưa khả dụng (`ErrorState`) với lý do thực tế và nút thử lại; tuyệt đối không dùng mảng rỗng `[]` làm fallback và không dùng dữ liệu giả [PO-ĐÃ-XÁC-NHẬN].

---

## 5. Các trạng thái giao diện chuẩn (States Matrix)

Mỗi màn hình trong 3 màn hình chính phải triển khai đầy đủ 6 trạng thái bắt buộc:

| Trạng thái | `/lecturer/courses` (02.1) | `/lecturer/courses/:id/materials` (02.4) | `.../materials/:id/rag` (02.7) |
|---|---|---|---|
| **Default** | Hiển thị lưới/danh sách thẻ khóa học và panel chi tiết của khóa học đang chọn. | Hiển thị bảng tài liệu với badge trạng thái đồng bộ, thanh tiến độ xử lý và số lượng lập chỉ mục. | Hiển thị 3 card số liệu và danh sách đoạn trích kèm số trang từ API chunks thực tế. |
| **Loading** | Skeleton cards mô phỏng thẻ khóa học và panel chi tiết. | Skeleton rows mô phỏng các dòng tài liệu trong bảng. | Skeleton cards mô phỏng 3 chỉ số và skeleton text cho các khối đoạn trích. |
| **Empty** | Khối EmptyState với icon `BookOpen` (40px tile), tiêu đề "Chưa có khóa học nào", nút CTA "Tạo khóa học đầu tiên" [ĐỀ-XUẤT]. | Khối EmptyState với icon `UploadCloud`, hướng dẫn kéo thả tài liệu bài giảng đầu tiên. | Khối EmptyState: chỉ hiển thị khi API trả về 200 OK với danh sách đoạn trích rỗng (`total_chunks = 0`, `items: []`). |
| **Error** | Khối ErrorState hoặc Toast thông báo lỗi từ API, nút "Tải lại trang". Không mock dữ liệu. | Alert banner hoặc Toast thông báo lỗi tải danh sách tài liệu. Lỗi upload hiển thị rõ (413: quá 50MB, 415: sai định dạng). | Khối ErrorState khi endpoint chưa khả dụng (404), lỗi 403, 5xx hoặc mất mạng; hiển thị rõ lý do và nút thử lại, không dùng mảng rỗng làm fallback. |
| **403 Forbidden** | Chặn hiển thị nếu user không phải LECTURER hoặc không sở hữu khóa học; chuyển hướng `/403`. | Chặn truy cập nếu khóa học không thuộc quyền sở hữu của giảng viên đang đăng nhập. | Chặn truy cập nếu tài liệu không thuộc khóa học của giảng viên. |
| **Success** | Modal đóng sau khi tạo/sửa thành công; Toast xanh xác nhận; danh sách tự động cập nhật. | File upload thành công xuất hiện trong bảng ở trạng thái `PENDING`/`PROCESSING`; Toast xanh. Xóa thành công cập nhật bảng. | (Xem dữ liệu - read-only). |

*Ghi chú về bản địa hóa các trạng thái (States Localization)*: Toàn bộ thông điệp và nội dung trạng thái (loading, empty, error, 403, success) được bản địa hóa đầy đủ qua cặp tệp locale `states.vi.json` / `states.en.json` và các file locale chức năng `courses.vi.json` / `courses.en.json`, `materials.vi.json` / `materials.en.json`. Trạng thái hiển thị đồng bộ theo ngôn ngữ được chọn; mặc định tiếng Việt, chuyển sang tiếng Anh khi người dùng chọn EN trên header; không trộn lẫn ngôn ngữ.

---

## 6. Kịch bản người dùng & Tiêu chí nghiệm thu (User Scenarios & Testing)

### User Story 1 - Quản lý Danh mục Khóa học theo chuẩn Figma 02.1–02.3 (Priority: P1, BLOCKED-ON-C1)
Giảng viên muốn quản lý danh mục khóa học của mình với giao diện 2 cột chuẩn Figma, xem nhanh số liệu tài liệu và case study, tạo khóa học mới và thao tác loại bỏ khóa học (removal: under C1-A delete / under C1-B archive) (BLOCKED-ON-C1 — pending PO: xóa cứng theo Figma 02.3 hay lưu trữ mềm theo OPD-014 / PO Q4).

- **Why this priority**: Khóa học là thực thể gốc (context) để nhóm toàn bộ tài liệu giảng dạy và case study.
- **Independent Test**: Giảng viên đăng nhập, vào `/lecturer/courses`, xem danh sách, tạo khóa học mới, thông tin hiển thị chính xác ở panel chi tiết.
- **Acceptance Scenarios**:
  1. **Given** Giảng viên đã đăng nhập và có 3 khóa học, **When** truy cập `/lecturer/courses`, **Then** hiển thị danh sách thẻ khóa học bên trái (ảnh, mã, tên, số tài liệu sẵn sàng, số case) và panel chi tiết khóa học được chọn đầu tiên bên phải.
  2. **Given** Giảng viên chưa tạo khóa học nào, **When** truy cập `/lecturer/courses`, **Then** hiển thị trạng thái Empty State chuẩn với nút CTA "Tạo khóa học đầu tiên" [ĐỀ-XUẤT], không có lỗi console.
  3. **Given** Giảng viên bấm nút "Tạo khóa học mới" (02.1 `I483:9668;225:164`), **When** điền Tên khóa học hợp lệ (độ dài 2..200 ký tự per `CreateCourseDto`) trong hộp thoại "Khởi tạo khóa học mới" (02.2 `483:10099`) và bấm nút "Tạo khóa học" (02.2 `I483:10110;225:146`), **Then** modal đóng lại, khóa học mới xuất hiện trong danh sách và panel chi tiết hiển thị khóa học này.
  4. **Given** Giảng viên bấm nút loại bỏ khóa học (02.3), **When** hộp thoại xác nhận xuất hiện và giảng viên xác nhận, **Then** hành vi và nội dung hộp thoại ([DỮ-KIỆN] xóa cứng theo Figma hay [PO-ĐÃ-XÁC-NHẬN] lưu trữ mềm bảo toàn dữ liệu theo PO Q4 / OPD-014): `BLOCKED-ON-C1 — pending PO`.

---

### User Story 2 - Quản lý & Tải lên Tài liệu Môn học theo chuẩn Figma 02.4–02.6 (Priority: P1)
Giảng viên muốn tải tài liệu PDF/DOCX vào khóa học, kiểm tra hợp lệ định dạng và dung lượng tại client, theo dõi tiến trình xử lý vector hóa RAG, xử lý tệp lỗi minh bạch và xóa tài liệu an toàn.

- **Why this priority**: Tài liệu là nguồn tri thức duy nhất cho RAG để sinh case study học thuật.
- **Independent Test**: Vào trang tài liệu khóa học, mở modal tải tài liệu, chọn tệp hợp lệ, kiểm tra tệp xuất hiện trong hàng đợi và tải lên backend thành công.
- **Acceptance Scenarios**:
  1. **Given** Giảng viên mở modal "Tải tài liệu" (02.5), **When** modal mở ra, **Then** danh sách tệp chờ tải phải trống (không có 3 file giả lập hard-code), vùng kéo thả hiển thị rõ giới hạn PDF/DOCX tối đa 50MB (`MAX_SIZE_BYTES = 50 * 1024 * 1024`).
  2. **Given** Giảng viên chọn tệp `.exe` hoặc tệp dung lượng >50MB, **When** thả vào modal, **Then** client từ chối ngay lập tức, hiển thị thông báo lỗi tương ứng (sai định dạng hoặc quá dung lượng), nút "Tải lên" không đếm các tệp lỗi này.
  3. **Given** Giảng viên chọn tệp PDF hợp lệ và bấm "Tải lên 1 tệp", **When** gửi request `POST /courses/:courseId/materials` (trường multipart `file`) và API trả về thành công, **Then** modal đóng, bảng tài liệu (02.4) xuất hiện dòng tài liệu mới với trạng thái `PENDING` hoặc `PROCESSING` kèm polling cập nhật chu kỳ 3s.
  4. **Given** Tài liệu ở trạng thái `FAILED`, **When** hiển thị trong bảng, **Then** dòng tài liệu hiển thị nguyên nhân lỗi (màu đỏ); nhãn nút hành động ([DỮ-KIỆN] "Thử lại" per Figma node `586:8570` / [PO-ĐÃ-XÁC-NHẬN] "Tải lên lại" per PO Q3): `BLOCKED-ON-C2 — pending PO`; bấm nút sẽ mở upload modal kèm thông tin lỗi để chọn lại file gốc.
  5. **Given** Giảng viên hover vào một dòng tài liệu và bấm nút "Xóa", **When** hộp thoại xác nhận (02.6) xuất hiện, **Then** hiển thị chính xác tên tệp và cảnh báo mất các đoạn trích dẫn; bấm "Xóa vĩnh viễn" gọi đúng endpoint `DELETE /materials/:id` [PO-ĐÃ-XÁC-NHẬN].

---

### User Story 3 - Kiểm tra Đoạn trích RAG (Source Inspector) theo chuẩn Figma 02.7 (Priority: P2)
Giảng viên muốn kiểm tra các đoạn trích dẫn (chunks) của một tài liệu đã lập chỉ mục để biết tài liệu được AI chia tách như thế nào dựa trên dữ liệu thực tế.

- **Why this priority**: Giúp giảng viên minh bạch hóa căn cứ tri thức mà AI sẽ dùng để sinh case tình huống.
- **Independent Test**: Nhấp vào tài liệu đã hoàn thành lập chỉ mục (`COMPLETED`) để điều hướng sang trang `RagSourceInspectorPage.tsx`.
- **Acceptance Scenarios**:
  1. **Given** Giảng viên truy cập trang chi tiết RAG của tài liệu đã hoàn tất, **When** trang tải xong, **Then** hiển thị 3 card chỉ số (Đoạn trích, Số trang, Dung lượng) theo đúng cấu trúc Figma 02.7 (`483:11148`).
  2. **Given** Backend đã triển khai endpoint [ĐỀ-XUẤT] `GET /materials/:id/chunks`, **When** trang RAG inspector hiển thị, **Then** danh sách đoạn trích hiển thị đúng số trang và nội dung thực tế từ pgvector; 0% dữ liệu mock tĩnh (`MOCK_CHUNKS`, `OTHER_DOCUMENTS`) được sử dụng [PO-ĐÃ-XÁC-NHẬN].
  3. **Given** Backend chưa sẵn sàng endpoint chunks (404) hoặc gặp lỗi (403, 5xx, mất mạng), **When** trang hiển thị, **Then** giao diện hiển thị trạng thái lỗi / chưa khả dụng (`ErrorState`) nêu rõ lý do thực tế và nút thử lại; chỉ hiển thị `EmptyState` khi API trả về 200 OK với danh sách rỗng (`total_chunks: 0`); tuyệt đối không dùng mảng rỗng `[]` làm fallback và không giả lập dữ liệu [PO-ĐÃ-XÁC-NHẬN].

---

### Edge Cases

- **Tệp tải lên biên giới dung lượng**: Tệp có dung lượng chính xác bằng `50 * 1024 * 1024` bytes được chấp nhận; tệp `50 * 1024 * 1024 + 1` bytes bị từ chối ngay tại client trước khi gửi request.
- **Tệp rỗng (0-byte file)**: Client phát hiện và từ chối tệp 0 byte với thông báo "Tệp không có nội dung".
- **Mất kết nối mạng khi tải lên**: Thanh tiến độ hiển thị lỗi kết nối; giữ nguyên tệp trong danh sách để người dùng có thể bấm thử lại mà không phải chọn lại từ ổ đĩa.
- **Polling xử lý tài liệu quá thời gian (Timeout)**: Nếu tài liệu ở trạng thái `PROCESSING` quá 5 phút mà không đổi trạng thái, giao diện hiển thị cảnh báo "Quá trình lập chỉ mục kéo dài hơn dự kiến, bạn có thể tải lại trang sau".
- **Xóa tài liệu khi đang xử lý (`PROCESSING`)**: Nút xóa bị vô hiệu hóa kèm tooltip giải thích, hoặc hiển thị cảnh báo đặc biệt yêu cầu xác nhận dừng tiến trình.
- **Loại bỏ khóa học đã có nhiều tài liệu & case study (Course removal)**: [DỮ-KIỆN] Figma 02.3 thể hiện xóa; [PO-ĐÃ-XÁC-NHẬN] PO Q4 quy định soft archive; hành vi thực thi: `BLOCKED-ON-C1 — pending PO` (removal: under C1-A delete / under C1-B archive).

---

## 7. Requirements (Yêu cầu chức năng & Thực thể)

### 7.1. Functional Requirements (Yêu cầu chức năng)

- **FR-001**: Hệ thống PHẢI tái cấu trúc giao diện trang Quản lý Khóa học (`/lecturer/courses`, Figma frame `02.1` / Node `483:9637`) theo bố cục 2 cột chuẩn: danh sách thẻ khóa học bên trái (ảnh bìa, mã học phần `courseCode`, tên khóa học `name`, số tài liệu sẵn sàng, số case study, ghi chú xử lý) và panel chi tiết khóa học được chọn bên phải. (Phục vụ Jira AC 1, Frame 02.1)
- **FR-002**: Hệ thống PHẢI cung cấp Modal Khởi tạo / Chỉnh sửa khóa học (Figma frame `02.2` / Node `483:9866`): Tên khóa học (`name`, bắt buộc, trim whitespace, độ dài 2..200 ký tự per `CreateCourseDto`); Mã khóa học (`courseCode`, tối đa 20 ký tự; [DỮ-KIỆN] Figma ghi "Mã môn học *" bắt buộc, backend DTO ghi `@IsOptional()`; tính bắt buộc/tùy chọn: `BLOCKED-ON-C3 — pending PO` (C3-A bắt buộc vs C3-B tùy chọn)); Mô tả (`description`, tùy chọn, tối đa 1000 ký tự) và Ảnh bìa; submit gửi request `POST /courses` hoặc `PUT /courses/:courseId` (tương ứng `CreateCourseDto` / `UpdateCourseDto`) và cập nhật dữ liệu hiển thị tức thì. (Phục vụ Jira AC 1, Frame 02.2)
- **FR-003**: Hộp thoại loại bỏ khóa học (`CourseRemovalDialog`, Figma frame `02.3` / Node `483:10111`, Dialog `483:10341`): [DỮ-KIỆN] Figma thể hiện xóa cứng ("Xóa khóa học này?"); [PO-ĐÃ-XÁC-NHẬN] PO Q4 và OPD-014 quy định lưu trữ mềm (soft archive) bảo toàn 100% dữ liệu khóa học, tài liệu, chunks trong pgvector và đối tượng trên MinIO. Nội dung hiển thị của hộp thoại và hành vi API tương ứng (under C1-A hard delete: `DELETE /courses/:courseId` an toàn; under C1-B soft archive: `PATCH /courses/:courseId/archive` [ĐỀ-XUẤT] tái sử dụng `is_active`): `BLOCKED-ON-C1 — pending PO`. (Phục vụ Jira AC 1, 2, Frame 02.3, PO Q4, C1)
- **FR-004**: Hệ thống PHẢI tái cấu trúc giao diện trang Chi tiết Khóa học — Tài liệu (`/lecturer/courses/:courseId/materials`, Figma frame `02.4` / Node `483:10342`): khối trên hiển thị quy trình 4 bước và vùng kéo thả nhanh; khối dưới hiển thị bảng tài liệu kèm thanh tiến độ "x/y đã lập chỉ mục". (Phục vụ Jira AC 1, Frame 02.4)
- **FR-005**: Hệ thống PHẢI hiển thị trạng thái xử lý tài liệu đồng bộ theo 4 trạng thái chuẩn: `PENDING` (chờ), `PROCESSING` (kèm tiến độ %), `COMPLETED` (check xanh `✓`, số chunks), `FAILED` (thông báo lỗi màu đỏ kèm nút hành động); kích hoạt polling chu kỳ 3 giây tự động cập nhật mà không giật màn hình. (Phục vụ Jira AC 1, 2, Frame 02.4)
- **FR-006**: Đối với tài liệu ở trạng thái `FAILED`: [DỮ-KIỆN] Figma node `586:8570` ghi nhãn "Thử lại"; [PO-ĐÃ-XÁC-NHẬN] PO Q3 yêu cầu nhãn "Tải lên lại" (hoặc "Chọn tệp tải lại"); nhãn nút: `BLOCKED-ON-C2 — pending PO` (C2-A "Thử lại" vs C2-B "Tải lên lại"). Khi nhấn, mở Upload Modal (02.5), hiển thị lý do lỗi của tệp trước đó, yêu cầu người dùng chọn lại file gốc để tạo lượt xử lý mới qua API upload hiện có `POST /courses/:courseId/materials` (trường multipart `file`; hành vi này là như nhau dưới cả C2-A và C2-B); không gọi API re-ingest giả lập; cơ chế in-place re-ingest nằm ngoài phạm vi FE-026 (PO Q3). (Phục vụ Jira AC 2, Frame 02.4, PO Q3, C2)
- **FR-007**: Hệ thống PHẢI cung cấp Modal Tải tài liệu chuyên sâu (Figma frame `02.5` / Node `483:10598`) với vùng kéo thả file, danh sách hàng đợi các tệp hợp lệ; loại bỏ 100% tệp mẫu giả lập (`fake files`); thực hiện client validation chỉ chấp nhận PDF/DOCX và dung lượng tối đa 50MB (`MAX_SIZE_BYTES = 50 * 1024 * 1024` theo `backend/src/modules/material/material.service.ts:19`); nút tải lên chỉ đếm số tệp hợp lệ; gửi request multipart với trường `file` tới `POST /courses/:courseId/materials`. (Phục vụ Jira AC 1, 2, 4, Frame 02.5)
- **FR-008**: Hệ thống PHẢI sửa đổi đường dẫn API xóa tài liệu trong Hộp thoại xác nhận xóa (Figma frame `02.6` / Node `483:10890`) sang đúng route hiện có của backend là `DELETE /materials/:id` (khắc phục lỗi tồn đọng từ FE-005 per `backend/src/modules/material/material.controller.ts:80`); chỉ cập nhật gỡ bỏ dòng tài liệu khi API trả về thành công (200/204); xử lý an toàn lỗi 403, 404 và mất kết nối. (Phục vụ Jira AC 1, 2, Frame 02.6, PO Q5)
- **FR-009**: Hệ thống PHẢI tái cấu trúc giao diện trang RAG Source Inspector (`/lecturer/courses/:courseId/materials/:materialId/rag`, Figma frame `02.7` / Node `483:11148`) hiển thị 3 card chỉ số metadata; loại bỏ 100% dữ liệu tĩnh giả lập (`MOCK_CHUNKS`, `OTHER_DOCUMENTS`); kết nối với API chunks thực tế qua đề xuất backend `BE-PROP-1` `GET /materials/:id/chunks` (`specs/001-fe026-courses-materials/be-dependencies.md`); hiển thị trạng thái lỗi / chưa khả dụng (`ErrorState`) với lý do thực tế khi API chưa sẵn sàng hoặc trả về lỗi (404, 403, 5xx); chỉ hiển thị `EmptyState` khi API trả về 200 OK với danh sách rỗng; tuyệt đối không dùng fallback mảng rỗng `[]` khi thiếu API hay gặp lỗi. (Phục vụ Jira AC 1, 4, Frame 02.7, PO Q2)
- **FR-010**: Kế hoạch triển khai và kiến trúc component của FE-026 PHẢI kế thừa cấu trúc FE-023 (`src/components/ds/`, `src/routes/paths.ts`, locale i18n riêng) sau khi FE-023 được merge vào `develop`; không triển khai mã nguồn trên cấu trúc cũ và không tự ý đưa thay đổi uncommitted vào branch. (Phục vụ PO Q1, Kiến trúc)
- **FR-011**: Toàn bộ giao diện PHẢI tuân thủ nghiêm ngặt bảng token màu sắc Eduva Navy `#2A4E7F` / Sky `#00A5F5` (R01 §2); áp dụng quy tắc phẳng hóa không viền không bóng card trên nền canvas `#F3F6FC`; cấm 100% emoji Unicode, cấm icon text thô, cấm màu tím / gradient lòe loẹt theo quy tắc chống AI-slop (R01 §1). (Phục vụ Jira AC 1, R01 §1)
- **FR-012**: Toàn bộ nội dung hiển thị trên giao diện các màn hình FE-026 và các component dùng chung PHẢI được bản địa hóa đầy đủ theo ngôn ngữ được chọn thông qua hệ thống i18n [FE-023 target (expected; not on develop `273f1fc`; verified by T028)] (hỗ trợ Tiếng Việt và Tiếng Anh); mặc định tiếng Việt, chuyển sang tiếng Anh thông qua nút chuyển đổi VI/EN trên shared header (FE-023 target: `HeaderActions.tsx` `aria-pressed`/`changeLanguage`); lựa chọn được lưu trong `localStorage` (`LANGUAGE_STORAGE_KEY = "edubranch-lang"`, localStorage-only detection); tuyệt đối không trộn lẫn ngôn ngữ trên cùng một màn hình; dữ liệu động từ API (tên khóa học, tên file, nội dung đoạn trích chunks) hiển thị nguyên vẹn như được lưu trữ, không tự ý dịch; đồng nhất các thuật ngữ theo FND §1.2 (`Khóa học` / `Courses`, `Tài liệu môn học` / `Course Materials`, `Lập chỉ mục` / `Indexing`, `Lưu trữ` / `Archive`), không tự ý dịch tự do; các chuỗi tiếng Anh được gắn nhãn `[ĐỀ-XUẤT]` cho đến khi PO phê duyệt. (Phục vụ Jira AC 3, FND §1.2, PO Directive 2026-11-16 [PO-ĐÃ-XÁC-NHẬN])
- **FR-013**: Hệ thống PHẢI đảm bảo kiểm soát truy cập và ranh giới sở hữu: chỉ tài khoản đăng nhập có role `LECTURER` và là chủ sở hữu của khóa học (`lecturerId = currentUser.id`) mới được phép truy cập và thao tác trên 3 route này; mọi truy cập trái phép bị chặn ở mức guard `403`. (Phục vụ FND §3, Bảo mật)

### 7.2. Key Entities (Thực thể chính)

- **Course (`Khóa học`)**: Thực thể gốc đại diện cho một môn học do giảng viên phụ trách.
  - Thuộc tính: `id` (UUID), `name` (String, bắt buộc, độ dài 2..200 ký tự per `CreateCourseDto`), `courseCode` (String, mã môn học per `backend/src/modules/course/dto/create-course.dto.ts`: [DỮ-KIỆN] optional trong DTO; tính bắt buộc trong UI: `BLOCKED-ON-C3 — pending PO` (C3-A bắt buộc vs C3-B tùy chọn), tối đa 20 ký tự), `description` (Text, tối đa 1000 ký tự), `is_active` (Boolean, mặc định `TRUE` per `backend/migrations/V1__init_schema.sql:39`, chuyển sang `FALSE` nếu lưu trữ theo OPD-014: `BLOCKED-ON-C1 — pending PO` (C1-B)), `lecturerId` (UUID, khóa ngoại tham chiếu người dùng sở hữu), `createdAt`, `updatedAt`, `materialCount` (Integer, số lượng tài liệu liên kết), `caseCount` (Integer, số lượng case study).
- **Material (`Tài liệu môn học`)**: Thực thể lưu trữ metadata của tài liệu bài giảng được tải lên.
  - Thuộc tính: `id` (UUID), `courseId` (UUID, khóa ngoại tham chiếu Khóa học), `originalFilename` (String, tên tệp gốc, độ dài 1..500 ký tự per `UpdateMaterialDto`), `mimeType` (String, `application/pdf` hoặc `application/vnd.openxmlformats-officedocument.wordprocessingml.document`), `sizeBytes` (Integer, tối đa `50 * 1024 * 1024`), `processingStatus` (Enum: `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`), `chunkCount` (Integer, số lượng đoạn trích được sinh ra), `processingError` (Text, thông báo lỗi nếu thất bại), `uploadedAt` (Timestamp).
- **Chunk (`Đoạn trích RAG`)**: Thực thể biểu diễn một đoạn văn bản sau khi chia tách tài liệu và vector hóa trong pgvector.
  - Thuộc tính: `id` (UUID), `materialId` (UUID, tham chiếu Tài liệu), `chunkIndex` (Integer, thứ tự đoạn trích trong tài liệu), `pageNumber` (Integer, số trang xuất hiện trong tài liệu gốc), `content` (Text, nội dung văn bản trích dẫn), `tokenCount` (Integer, số lượng token ước tính).

---

## 8. Success Criteria (Tiêu chí thành công & Đo lường)

### Measurable Outcomes (Chỉ số đo lường được)

- **SC-001**: 100% giao diện của 7 frame (02.1–02.7) khớp pixel, bố cục, khoảng cách (4px grid), màu sắc token và typography với Figma Page 08 tại các frame node ID tương ứng khi kiểm tra visual QA song song trên trình duyệt thực tế.
- **SC-002**: 0% dữ liệu giả lập còn sót lại trong codebase: loại bỏ hoàn toàn `MOCK_CHUNKS`, `OTHER_DOCUMENTS` và mảng 3 tệp hard-coded trong modal upload; áp dụng nguyên tắc Missing API ≠ Empty Data: `EmptyState` chỉ xuất hiện khi API trả về 200 OK với danh sách rỗng; các trạng thái lỗi hoặc thiếu API (404, 403, 5xx) thể hiện đúng `ErrorState` trung thực với lý do thực tế.
- **SC-003**: 100% các tệp sai định dạng (không phải PDF/DOCX) hoặc vượt quá `MAX_SIZE_BYTES` (50MB) bị từ chối ngay tại client với thông báo lỗi cụ thể, không phát sinh request tải lên lãng phí lên server.
- **SC-004**: 100% request xóa tài liệu gửi đúng endpoint `DELETE /materials/:id` (tương đối theo baseURL `/api/v1`); bảng danh sách tài liệu không tự ý gỡ hàng khi API trả về lỗi (403, 404, 500 hoặc mất kết nối).
- **SC-005**: Lệnh `npm run build` tại thư mục `frontend/` biên dịch thành công 100% không có cảnh báo hoặc lỗi TypeScript, TailwindCSS hay linting.
- **SC-006**: PO approval of the English copy (all keys in `l10n-copy-review.md` and `docs/l10n/shared-copy-review.md` marked APPROVED; `node scripts/l10n-approval-check.mjs --release` exits 0) is required before FE-026 is Done or released.

---

## 9. Tiêu chuẩn Kỹ thuật & Phương pháp Kiểm thử Trực quan (Verification Method)

### 9.1. Kiểm tra build & Code Quality
- Lệnh: `npm run build` tại thư mục `frontend/` phải biên dịch thành công 100% không có lỗi TypeScript hoặc TailwindCSS.
- Cấm để sót bất kỳ tham chiếu nào tới `MOCK_CHUNKS`, `OTHER_DOCUMENTS`, hoặc mảng fake files trong `MaterialsPage.tsx`.

### 9.2. Phương pháp kiểm thử Visual QA đối chiếu Figma (CLAUDE.md & QG3)
- Mở song song ứng dụng chạy trên trình duyệt thực tế (với backend docker compose) và bản thiết kế Figma Page 08 tại các frame 02.1 – 02.7 (`483:9637` đến `483:11148`).
- Kiểm tra các tiêu chí thị giác:
  1. Bố cục 2 cột của `CoursesPage`: Tỉ lệ, khoảng cách card `20px`, màu nền canvas `#F3F6FC`, không có viền thừa quanh card trắng.
  2. Màu sắc nút và badge: Nút chính màu Navy `#2A4E7F`, không còn nút màu xanh lam cũ `#2563EB`, không có màu tím hay gradient.
  3. Badge trạng thái: Đúng màu nền, màu chữ và chấm tròn `6px` theo bảng token §3.3.
  4. Icon: Toàn bộ là Lucide SVG monochrome, không có emoji hay ký tự thô.
  5. Ngôn ngữ: Mặc định tiếng Việt, chuyển sang tiếng Anh khi bật nút chuyển đổi VI/EN; không trộn lẫn ngôn ngữ; các thuật ngữ học thuật đồng nhất theo FND §1.2.

---

## 10. Giả định & Phụ thuộc (Assumptions & Dependencies)

- **Giả định 1**: Người dùng đã hoàn tất đăng nhập và có token JWT hợp lệ với role `LECTURER`.
- **Giả định 2**: Giới hạn dung lượng tải lên tối đa được quản lý thống nhất ở mức 50MB theo hằng số `MAX_SIZE_BYTES = 50 * 1024 * 1024` trong `backend/src/modules/material/material.service.ts:19` (AGENTS.md Quy tắc 7).
- **Phụ thuộc 1 (FE-023)**: FE-023 (EBA-86) target structure on branch `refactor/frontend-structure` (uncommitted on 2026-11-15); every path from it is an expectation verified by T028 after merge [PO-ĐÃ-XÁC-NHẬN Q1].
- **Phụ thuộc 2 (BE Chunks API - BE-PROP-1)**: Phụ thuộc vào đề xuất task Backend `BE-PROP-1` bổ sung endpoint `GET /materials/:id/chunks` (chi tiết tại `specs/001-fe026-courses-materials/be-dependencies.md`) để cung cấp dữ liệu chunks thực tế cho màn hình 02.7 RAG Source Inspector [PO-ĐÃ-XÁC-NHẬN Q2].
- **Phụ thuộc 3 (BE-PROP-2 Course Soft Archive per OPD-014, C1-B only)**: Đề xuất lưu trữ mềm thay thế xóa cứng kế thừa quyết định OPD-014 của PO [PO-ĐÃ-XÁC-NHẬN Q4] (xóa cứng vs lưu trữ mềm: `BLOCKED-ON-C1 — pending PO`: C1-A vs C1-B), đề xuất task Backend `BE-PROP-2` (C1-B only) bổ sung endpoint `PATCH /courses/:courseId/archive` (chi tiết tại `specs/001-fe026-courses-materials/be-dependencies.md`) tái sử dụng trường `is_active` của bảng `courses` nếu C1-B lưu trữ mềm được chọn.
