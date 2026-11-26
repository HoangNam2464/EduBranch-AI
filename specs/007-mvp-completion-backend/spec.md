# Feature Specification: Backend API hoàn thiện MVP (hồ sơ, dashboard giảng viên, Admin, Rubric và xuất dữ liệu nghiên cứu)

**Feature Branch**: `feature/mvp-completion-backend` (từ `origin/develop` `6f903f2`; FND §7.2, không dùng mã task)
**Feature directory**: `specs/007-mvp-completion-backend` (004 và 005 bỏ trống vì có thể đang dùng ở phiên khác; 006 thuộc PR #79)
**Created**: 2026-11-21
**Status**: Approved — G1–G7 PO duyệt gộp 2026-11-21 (record.md §2)
**Parent tasks**:
- BE-031 (Jira `EBA-98`, assignee Đức Anh Nguyễn);
- BE-030 (Jira `EBA-102`, assignee Đức Anh Nguyễn);
- BE-032 (Jira `EBA-99`, assignee Đức Anh Nguyễn);
- BE-033 (Jira `EBA-100`, assignee Nam Hoàng).

**Phục vụ FE**:
- FE-030 (`EBA-94`, đã merge);
- FE-027 (`EBA-91`, PR #73);
- FE-031 (`EBA-95`, đã merge);
- FE-032 (`EBA-96`, PR #75);
- FE-029 (`EBA-93`, PR #74).

**G0**: PO, chat 2026-11-21 (nguyên văn ở `record.md` §2). Claude implement cả 4 task. Assignee trên Jira giữ nguyên, commit ghi rõ người thực hiện.

## 1. Bối cảnh

Các dữ kiện dưới đây đều kiểm tra trên `develop` `6f903f2`.

- [DỮ-KIỆN] Frontend đã có hoặc đang có PR cho các màn 09.1/09.2, 07.1, 07.8/10.8 và 10.2–10.10, nhưng backend chưa có các route mà các màn này cần:
  - `PATCH /users/me`: `UserController` chỉ có `GET me`.
  - Toàn bộ `/admin/*`: không có module admin.
  - `/evaluation/*`: `evaluation.controller.ts` rỗng.
  - Không có API tổng hợp cho dashboard giảng viên.
  - Vì vậy hồ sơ không lưu được; Admin Dashboard gọi `/admin/overview` bị 404 và hiện dữ liệu bịa (EBA-95); các màn Admin và Rubric không có dữ liệu thật.
- [DỮ-KIỆN] `users.is_active` có trong schema V1, nhưng `AuthService.login` và `AuthService.validateToken` không kiểm tra cột này (`backend/src/modules/auth/auth.service.ts:53-90`). Vì vậy "khóa tài khoản" (10.4) hiện không có tác dụng.
- [DỮ-KIỆN] Schema không có bảng cho nhật ký hệ thống, cài đặt hệ thống, phiếu rubric hay tùy chọn ngôn ngữ (V1–V5).
- [DỮ-KIỆN] Các nguồn nghiệp vụ:
  - Jira AC của EBA-98/99/100/102;
  - `docs/features/FEATURE-EVALUATION-AND-RESEARCH.md` (FR-EVAL-01..05, BR-EVAL-01..02);
  - `docs/design/UX-SCREEN-NOTES.md` §07.1, §07.8, §09, §10;
  - `docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md`: OPD-011 → A (rubric trong nền tảng + CSV ẩn danh), OPD-015 → B (Admin đủ 10 màn), OPD-013 (AI service chỉ xem).
- [DỮ-KIỆN] Contract mà FE đang gọi (`frontend/src/services/{userService,adminService,rubricService}.ts` trên develop và trên các nhánh PR) chỉ là bằng chứng về code. Đó không phải yêu cầu đã duyệt (AGENTS.md rule 8). Khi contract FE khác nguồn nghiệp vụ, spec đi theo nguồn nghiệp vụ và ghi phần FE cần điều chỉnh (§8).

## 2. Vai trò

| Vai trò | Được làm | Nguồn |
|---|---|---|
| STUDENT, LECTURER, ADMIN | Xem và sửa hồ sơ của chính mình (họ tên, ngôn ngữ) | EBA-98 AC, UX §09 |
| LECTURER | Xem dashboard tổng hợp trên các khóa học mình sở hữu; tạo/sửa/xóa phiếu rubric của mình trên case thuộc khóa mình sở hữu; xem các phiếu rubric trên case của mình; xuất CSV ẩn danh của khóa/case mình sở hữu | EBA-102 AC, EBA-100 AC, FEATURE-EVALUATION §9, UX §07.8 |
| ADMIN | Toàn bộ `/admin/*`; rubric trên mọi case (màn 10.8); xuất CSV ẩn danh toàn hệ thống | EBA-99 AC, OPD-015 → B, UX §10 |
| STUDENT | Không có quyền trên `/admin/*`, `/lecturer/dashboard`, `/evaluation/*` | EBA-99 AC 1, FEATURE-EVALUATION §9 |

## 3. Ranh giới không được thay đổi

- B-1: Route và hành vi hiện có của `auth`, `course`, `case`, `material`, `branching-attempt`, `reasoning`, `review-study`, `lecturer-feedback`, `statistics`, `challenge-support` giữ nguyên, trừ các điểm sau:
  - kiểm tra `is_active` khi đăng nhập và khi xác thực token (US3);
  - ghi sự kiện vào nhật ký (US3, AC-A9).
  Phản hồi của các route này không đổi.
- B-2: INV-01 và các đường truy cập (FND §1, OPD-001 → A, FR-BS-01) giữ nguyên. Spec này không thêm route nào cho sinh viên đọc case.
- B-3: Không thêm dependency vào `backend/package.json`. AI service chỉ thêm trường `model` vào `GET /health` (không phải dữ liệu bí mật).
- B-4: Không chấm điểm, xếp hạng hay pass/fail sinh viên. Rubric chỉ đánh giá chất lượng case, do người thực hiện (BR-EVAL-02).
- B-5: Dữ liệu xuất nghiên cứu không chứa họ tên, email, ID thật của sinh viên hay văn bản tự do của sinh viên (FR-EVAL-05, BR-EVAL-01).
- B-6: Admin không đọc được nội dung lập luận, bài nộp hay tin nhắn Challenge Support (EBA-99 AC 4).
- B-7: Migration chỉ thêm (V6–V8). Không sửa hoặc xóa cột, ràng buộc hay dữ liệu hiện có.

## 4. User Stories và Acceptance Criteria

Tất cả AC dưới đây là [ĐỀ-XUẤT] cho tới khi PO duyệt G7.

### US1 — Người dùng sửa hồ sơ của mình (P1) — BE-031
- **AC-P1**: `GET /users/me` trả thêm `language` (`vi` | `en`; mặc định `vi`). Các trường hiện có giữ nguyên tên và kiểu; không trả `password_hash`.
- **AC-P2**: `PATCH /users/me` với `fullName` (sau trim dài 2–100 ký tự) và/hoặc `language` (`vi`|`en`) cập nhật đúng người dùng đang đăng nhập, rồi trả hồ sơ mới.
- **AC-P3**: Body rỗng, sai kiểu, hoặc có trường lạ (`email`, `role`, `password`, `id`, `isActive`…) → 400. Không cập nhật gì.
- **AC-P4**: API không nhận ID người dùng từ client: người dùng A không có cách nào sửa hồ sơ người dùng B. Test e2e cố sửa người khác bằng `id` trong body (400) và bằng token người khác (chỉ sửa chính chủ token).
- **AC-P5**: Không có token → 401. Tài khoản đã khóa → 401 (theo AC-A5).

### US2 — Giảng viên xem dashboard tổng hợp (P1) — BE-030
- **AC-D1**: `GET /lecturer/dashboard` (chỉ LECTURER) trả các số tổng hợp, chỉ trong các khóa giảng viên hiện tại sở hữu:
  - số khóa học (đang mở / lưu trữ);
  - số case theo trạng thái lifecycle và theo chế độ học;
  - số bài Review Study đang `SUBMITTED` (chờ nhận xét) kèm 5 bài cũ nhất;
  - số attempt Branching hoàn thành trong 7 ngày kèm 5 attempt mới nhất (có cờ đã/chưa có nhận xét).
- **AC-D2**: Lọc được theo `courseId`. Khóa không thuộc giảng viên → 403; khóa không tồn tại → 404.
- **AC-D3**: Phép đếm dùng `COUNT(DISTINCT …)` hoặc subquery riêng, không bị nhân đôi do JOIN. Có e2e với bộ dữ liệu xác định, gồm cả trường hợp một case có nhiều attempt và nhiều nhận xét.
- **AC-D4**: Khi chưa có dữ liệu → 200 với số 0 và danh sách rỗng.
- **AC-D5**: Không trả điểm số, xếp hạng hay pass/fail. Không trả email sinh viên (chỉ họ tên, như hàng đợi nhận xét hiện có).
- **AC-D6**: STUDENT hoặc ADMIN gọi → 403.

### US3 — Admin quản trị hệ thống (P1) — BE-032
- **AC-A1**: Mọi route `/admin/*` yêu cầu ADMIN. LECTURER/STUDENT → 403; không token → 401. Có e2e role-matrix cho từng route.
- **AC-A2**: `GET /admin/overview` trả dữ liệu thật cho 10.2:
  - tổng người dùng và số tăng trong tháng;
  - số khóa đang mở và số tăng trong tháng;
  - số case PUBLISHED và số tăng trong tháng;
  - số lần sinh case AI và số lần lỗi (từ nhật ký, trong 30 ngày);
  - số người dùng theo vai trò kèm phần trăm;
  - case theo khóa học (top 8, PUBLISHED/DRAFT/tổng);
  - số đăng ký mới theo tuần trong 8 tuần;
  - 5 sự kiện gần nhất;
  - danh sách mục cần chú ý (tài liệu lập chỉ mục lỗi, đăng nhập thất bại 24 giờ, tài khoản đang khóa), chỉ hiện mục có số > 0;
  - tình trạng hệ thống: app; database; AI service qua `GET {AI_SERVICE_BASE_URL}/health` với timeout 2 giây; số tài liệu đang `PROCESSING`.
  Không có số bịa: khi không có dữ liệu, giá trị là 0 hoặc danh sách rỗng.
- **AC-A3**: `GET /admin/users` (10.3):
  - lọc theo `search` (họ tên/email, không phân biệt hoa thường), `role`, `status` (`ACTIVE`|`LOCKED`);
  - phân trang `page` (≥1), `size` (1–100, mặc định 20);
  - kèm `metrics` (tổng, giảng viên, sinh viên, đang khóa) và `total`.
  Không trả mật khẩu hoặc token.
- **AC-A4**: `PATCH /admin/users/:id/status` với `{status: ACTIVE|LOCKED}` cập nhật `users.is_active` (10.4). Các trường hợp lỗi:
  - Admin tự khóa mình → 409;
  - khóa admin đang hoạt động cuối cùng → 409;
  - ID không tồn tại → 404;
  - ID sai định dạng → 400.
- **AC-A5**: Tài khoản bị khóa:
  - không đăng nhập được (401, cùng thông báo chung "Invalid email or password", không lộ trạng thái khóa);
  - token đã cấp bị từ chối ngay ở request kế tiếp (401), vì `validateToken` đọc `is_active`.
  Mở khóa khôi phục cả hai.
- **AC-A6**: `GET /admin/courses` (10.5, chỉ xem):
  - lọc `search`, `status` (`ACTIVE`|`ARCHIVED`), phân trang;
  - mỗi dòng có tên, mã, tên giảng viên, trạng thái, số tài liệu (tổng/sẵn sàng/lỗi), số case, số attempt, ngày tạo.
- **AC-A7**: `GET /admin/cases` (10.6, chỉ xem):
  - lọc `search`, `status`, `learningMode`, `courseId`, phân trang;
  - kèm `analytics`: tổng, theo trạng thái, theo chế độ, 5 case cập nhật gần nhất.
  Không trả nội dung node/option.
- **AC-A8**: `GET /admin/ai-service` (10.7, chỉ xem, OPD-013):
  - nhà cung cấp và mô hình lấy từ `GET /health` của AI service; trạng thái `ACTIVE`|`DOWN`;
  - số lần sinh case và thời gian trung bình (từ nhật ký);
  - số tài liệu sẵn sàng;
  - 10 lần sinh case gần nhất;
  - 10 tài liệu có trạng thái lập chỉ mục gần nhất.
  Không có thao tác đổi cấu hình. Không trả khóa API.
- **AC-A9**: Nhật ký hệ thống ghi các sự kiện sau, mỗi sự kiện kèm thời điểm, người thực hiện (nếu biết) và kết quả:
  - `LOGIN_SUCCEEDED`, `LOGIN_FAILED`;
  - `USER_LOCKED`, `USER_UNLOCKED`;
  - `CASE_GENERATED`, `CASE_GENERATION_FAILED` (kèm thời lượng);
  - `CASE_STATUS_CHANGED`;
  - `MATERIAL_UPLOADED`;
  - `SETTINGS_UPDATED`.
  `LOGIN_FAILED` với email không tồn tại không lưu email đã nhập. Lỗi khi ghi nhật ký không làm hỏng thao tác chính (ghi log cảnh báo, không ném lỗi).
- **AC-A10**: `GET /admin/logs` (10.9):
  - lọc `search` (tên/email người thực hiện, tiêu đề sự kiện), `eventType`, `timeRange` (`today`|`7d`|`30d`|`all`), phân trang;
  - kèm `metrics`: sự kiện hôm nay, lượt đăng nhập, lượt sinh case, số lỗi (hôm nay).
- **AC-A11**: Cài đặt hệ thống (10.10):
  - `GET /admin/settings` trả thông tin nền tảng (tên, đơn vị vận hành, thông báo trang đăng nhập, email hỗ trợ, ghi chú chính sách AI) và các giới hạn chỉ đọc (định dạng tệp, dung lượng tối đa, chế độ đăng ký, phiên bản, múi giờ) lấy từ cấu hình đang chạy;
  - `PUT /admin/settings` chỉ sửa 5 trường thông tin nền tảng; có validation (độ dài, email hợp lệ); ghi `SETTINGS_UPDATED`;
  - trường lạ → 400.
- **AC-A13** (PO 2026-11-21, Q1 → A): `PATCH /admin/users/:id/role` với `{role: STUDENT|LECTURER|ADMIN}`. Ghi nhật ký `USER_ROLE_CHANGED` (vai trò cũ → mới), và vai trò mới có hiệu lực ngay ở request kế tiếp (`validateToken` đọc vai trò từ DB). Các trường hợp lỗi:
  - đổi vai trò của chính mình → 409;
  - hạ vai trò admin hoạt động cuối cùng → 409;
  - vai trò không đổi → 200, không ghi nhật ký;
  - ID không tồn tại → 404.
- **AC-A12**: Không route admin nào trả nội dung lập luận, bài nộp, phản tư hay tin nhắn Challenge Support.

### US4 — Rubric chất lượng case và xuất dữ liệu nghiên cứu ẩn danh (P1) — BE-033
- **AC-R1** (FR-EVAL-01, UX §07.8): phiếu rubric gồm 3 điểm nguyên 1–5 và ghi chú tùy chọn (≤ 2000 ký tự). Phản hồi kèm điểm trung bình làm tròn 1 chữ số.
  - `realismScore` (Tính thực tế);
  - `difficultyScore` (Độ khó);
  - `alignmentScore` (Phù hợp môn).
- **AC-R2** (CRUD rubric):
  - `POST /evaluation/rubrics`: LECTURER chỉ trên case thuộc khóa mình sở hữu, ADMIN trên mọi case. Mỗi người đánh giá có tối đa 1 phiếu cho mỗi case; phiếu thứ hai → 409.
  - `GET /evaluation/rubrics?caseId=`: LECTURER thấy mọi phiếu trên case của mình; ADMIN thấy tất cả.
  - `GET /evaluation/rubrics/:id`.
  - `PUT` và `DELETE /evaluation/rubrics/:id`: chỉ người tạo phiếu.
- **AC-R3**: Truy cập không hợp lệ:
  - case hoặc phiếu không tồn tại → 404;
  - LECTURER thao tác trên case/phiếu ngoài quyền → 403;
  - STUDENT → 403 trên mọi route `/evaluation/*`.
- **AC-R4** (FR-EVAL-04): `GET /evaluation/export?dataset=activity|rubrics` trả `text/csv; charset=utf-8` (có BOM để Excel đọc tiếng Việt) và `Content-Disposition: attachment`.
  - Lọc tùy chọn theo `courseId`, `caseId`.
  - LECTURER chỉ xuất được khóa/case mình sở hữu; ngoài quyền → 403. ADMIN xuất được toàn hệ thống.
  - `activity`: mỗi dòng là một attempt Branching hoặc một bài Review Study, với các cột đã khái quát hóa để giảm ghép ngược với hàng đợi nhận xét (R-L3b phương án B, PO 2026-11-26):
    - mã người tham gia ẩn danh ổn định (`participant_code`, AC-R5);
    - mã khóa, ID case, chế độ học;
    - dải số lần thử (`attempt_band`: `1` | `2+`);
    - đã hoàn thành (`completed`);
    - dải số quyết định (`decision_count_band`: `0` | `1-2` | `3+`);
    - dải số từ lập luận (`reasoning_word_band`: `0` | `1-25` | `26-75` | `76-150` | `151+`);
    - dải số từ phản tư (`reflection_word_band`: `0` | `1-25` | `26-75` | `76-150` | `151+`);
    - số vòng Challenge Support (`0`–`2`, giảng viên không thấy trên hàng đợi nhận xét);
    - dải thời lượng hoàn thành (`duration_band`: `0-59s` | `1-5m` | `5-15m` | `15-30m` | `30m+`) — để trống khi attempt chưa hoàn thành và với Review Study (L3 Option C, PO 2026-11-25).
    - Không xuất `choice_path` và `outcome_node_id` trong CSV từng dòng (phân phối nhánh và kết quả tổng hợp đã có ở thống kê case).
  - `rubrics`: mỗi phiếu một dòng, gồm ID case, mã khóa, chế độ học, mã người đánh giá ẩn danh, 3 điểm, điểm trung bình.
  - L3 Option C (PO 2026-11-25) + R-L3b phương án B (PO 2026-11-26): cả hai bộ dữ liệu không có mốc thời gian tuyệt đối nào (không `started_at`, `completed_at`, `submitted_at`, `created_at`). Thứ tự dòng `activity` sắp hoàn toàn theo các cột đã xuất (`case_id`, `participant_code`, `attempt_band`, và các cột dải còn lại); `rubrics` theo `case_id`, `evaluator_code`. Không sắp theo thời gian hay ID người dùng/attempt thật. Lưu ý: đây là pseudonymization kết hợp giảm khả năng liên kết, không phải ẩn danh tuyệt đối (chi tiết rủi ro còn lại ở `record.md` §7.3).
- **AC-R5** (FR-EVAL-05):
  - Tệp CSV không chứa họ tên, email, ID thật của sinh viên hay của người đánh giá, và không chứa văn bản tự do của sinh viên (chỉ dải số từ).
  - Mã ẩn danh ổn định giữa các lần xuất: `P-` + 12 ký tự hex đầu của HMAC-SHA256 với khóa dẫn xuất từ `JWT_SECRET`, nhãn `edubranch-research-export-v1` và ID người dùng.
  - Ô bắt đầu bằng `= + - @` được thêm tiền tố `'`, chống chèn công thức (CSV injection).
  - E2e kiểm tra tệp xuất không chứa bất kỳ tên, email hay UUID người dùng nào của bộ dữ liệu test.
- **AC-R6**: Rubric không được dùng để chấm điểm hay xếp hạng sinh viên (B-4). Không có route nào ghép điểm rubric với sinh viên.

## 5. Ngoài phạm vi

- Sao lưu dữ liệu (10.10): PO 2026-11-21 chọn "Chỉ hiển thông tin", nên không có API hay hành động sao lưu. Màn hình chỉ hiển thị thông tin (bản copy do FE đề xuất, PO duyệt).
- Khảo sát sinh viên trong nền tảng (FR-EVAL-03): FEATURE-EVALUATION §3 ghi là post-MVP (dùng công cụ ngoài).
- Lịch hạn nộp ở 07.1: schema không có hạn nộp, mà thêm hạn nộp là tính năng mới. Ngoài phạm vi BE-030.
- Đăng nhập Google/Microsoft (BE-034): BLOCKED vì chưa có client ID/secret.
- Sửa các màn FE trong PR #73/#74/#75 của Hướng: không chạm. Phần FE cần điều chỉnh liệt kê ở §8.

## 6. Tiêu chí thành công

- SC-1: Các màn 09.1/09.2 (lưu hồ sơ), 10.2–10.10 và 07.8/10.8 chạy với dữ liệu thật trên backend, không còn 404 và không còn số bịa.
- SC-2: Khóa tài khoản có hiệu lực ngay (đăng nhập lẫn token cũ).
- SC-3:
  - QG1 xanh: build, unit, e2e, matrix, regression;
  - suite e2e mới có role-matrix và ownership-leak cho mọi route mới;
  - CSV không lộ PII.

## 7. Câu hỏi PO (chỉ chặn phần phụ thuộc)

- **Q1 — Đổi vai trò**: PO 2026-11-21 chọn "Có, thêm API" → AC-A13.
- **Q2 — Sao lưu**: PO 2026-11-21 chọn "Chỉ hiển thông tin" → §5.

## 8. Phần FE cần điều chỉnh sau khi API có (báo cho người phụ trách FE, không sửa trong spec này)

- PR #74 (FE-029): `rubricService` gửi mảng `criteria` tự do. Nguồn FR-EVAL-01 và UX §07.8 quy định 3 tiêu chí cố định, nên FE cần chuyển sang gửi `realismScore`/`difficultyScore`/`alignmentScore`/`notes`. Để FE dễ hiển thị, API vẫn trả thêm mảng `criteria` (mỗi phần tử có `key` và `score`).
- PR #75 (FE-032): `toggleUserLock` khớp. Các danh sách dùng `size`/`page` như contract. `getSystemSettings` khớp, trừ mục sao lưu (Q2).
- PR #73 (FE-027): hiện tự tổng hợp số liệu từ danh sách khóa/case ở client. Có thể chuyển sang `GET /lecturer/dashboard` để có số bài chờ nhận xét và attempt mới hoàn thành.
- FE-031 (develop): `attentionAlerts[].message` sẽ là mã (`indexing_failure`…) kèm `count`, để FE dịch qua i18n. Mapper hiện hiển thị `message` thẳng ra màn hình, nên FE cần thêm key dịch.
- FE-031 (develop): `AdminDashboardPage` còn số bịa (`|| 186`, nhật ký viết cứng). Khi `/admin/overview` có dữ liệu, các fallback này phải bỏ (EBA-95).
