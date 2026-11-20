# Feature Specification: Backend API cho Review Study, Lecturer Feedback và Learning-Flow Statistics

**Feature Branch**: `feature/feedback-stats-backend` (FND §7.2: nhánh backend có hậu tố `-backend`; không dùng mã task)
**Feature directory**: `specs/002-feedback-stats-api`
**Created**: 2026-11-20
**Status**: Draft — chờ G1–G6 (PO có thể gộp) và G7
**Parent tasks**: BE-025 (Master `EBA-423`, Jira `EBA-72`), BE-026 (Master `EBA-424`, Jira `EBA-73`), BE-028 (Master `EBA-426`, Jira `EBA-75`) — `docs/03_TASK-DETAILS.md` [72], [73], [75]
**Phục vụ FE**: FE-018 (`EBA-413`, đã merge PR #63), FE-019 (`EBA-414`, PR #68), FE-020 (`EBA-415`, PR #69), FE-022 (`EBA-417`, PR #70)
**G0**: PO, chat 2026-11-20 (nguyên văn trong `record.md` §2)

## 1. Bối cảnh và lý do

- [DỮ-KIỆN] Trên `develop` `15ce434`, `ReviewStudyController`, `LecturerFeedbackController`, `StatisticsController` là skeleton rỗng (`backend/src/modules/{review-study,lecturer-feedback,statistics}/*.controller.ts`). Không có route Review Study, Lecturer Feedback hay Statistics nào tồn tại.
- [DỮ-KIỆN] FE-018 (đã merge) gọi 5 route Review Study chưa tồn tại (`frontend/src/services/reviewStudyService.ts`); PR #68/#69/#70 gọi thêm 4 route không có nguồn tài liệu (`GET /lecturer-feedback/submissions`, `GET /review-study-submissions/:id/feedback`, `GET /statistics/overview`, `GET /statistics/cases/:id/flow`). Vì vậy các màn hình FE-018/019/020/022 không chạy được với backend thật.
- [DỮ-KIỆN] Các bảng cần dùng đã có (migration V2): `review_study_submissions` (UNIQUE `uq_review_submission_per_student_case`, CHECK `submission_status IN (SUBMITTED, REVIEWED, REFLECTED)`), `lecturer_feedback` (CHECK `chk_feedback_one_target`), `branching_attempts`, `student_reasoning`, `case_nodes`, `case_options`. Không cần migration mới.
- [DỮ-KIỆN] BE-028 phụ thuộc EBA-420 (BE-022, terminal completion). Trên `develop`, `BranchingAttemptService.chooseOption` đã ghi `is_completed = TRUE`, `outcome_node_id`, `completed_at` khi tới node terminal (`backend/src/modules/branching-attempt/branching-attempt.service.ts:292`). Dữ liệu mà BE-028 đọc vì thế đã được ghi trên `develop`; phụ thuộc này không chặn BE-028 ở mức dữ liệu. Việc nghiệm thu BE-022 vẫn là của PR #59 (ngoài phạm vi).

## 2. Người dùng và vai trò

| Vai trò | Được làm | Nguồn |
|---|---|---|
| STUDENT | Nộp 1 bài Review Study cho case PUBLISHED; xem bài của mình; xem nhận xét giảng viên trên bài của mình; nộp phản tư khi bài ở REVIEWED | `feature-review-study.md`, `feature-reflection.md`, FE-018 AC-1..3, FE-020 AC-1..3 |
| LECTURER (chủ khóa học của case) | Xem hàng đợi bài nộp/attempt hoàn thành của các khóa mình sở hữu; viết nhận xét định tính; xem thống kê case | `feature-lecturer-feedback.md`, `feature-statistics.md`, FE-019 AC-1..3, FE-022 AC-1..3 |
| ADMIN | Không có quyền trên các API này | [DỮ-KIỆN] nguồn chỉ cấp cho LECTURER/STUDENT (`FEATURE-AUTH-AND-ROLES.md` dòng 75–76) |

## 3. Ranh giới không được thay đổi

- B-1 Schema DB: không migration mới, không đổi constraint (V1–V5 giữ nguyên).
- B-2 Route và hành vi hiện có của `branching-attempt`, `case`, `course`, `challenge-support`, `auth` giữ nguyên.
- B-3 AI service không bị chạm; không có AI chấm điểm (FND §6.1.2).
- B-4 Không thêm dependency mới (backend `package.json` giữ nguyên).
- B-5 INV-01 (FND §4): sinh viên không bao giờ đọc/ghi dữ liệu của case không ở `PUBLISHED`; kiểm tra ở mức truy vấn (`WHERE c.status = 'PUBLISHED'`).
- B-6 Thống kê là read-only, không trả dữ liệu định danh sinh viên (`feature-statistics.md` Constraints).

## 4. User Stories

### US1 — Sinh viên nộp bài Review Study (P1) — BE-025
Sinh viên mở case Review Study đã PUBLISHED, nộp phân tích (tùy chọn), giải pháp đề xuất và lập luận; chỉ được nộp 1 lần; sau đó thấy lại bài của mình ở chế độ chỉ đọc.

**Acceptance**
1. Cho case PUBLISHED, `learning_mode = REVIEW_STUDY`, sinh viên chưa nộp → nộp hợp lệ trả 201, bài có `submissionStatus = SUBMITTED`.
2. Nộp lần 2 cùng case → 409, không có bản ghi thứ hai.
3. Case không PUBLISHED hoặc không tồn tại → 404; case `BRANCHING_STUDY` → 400.
4. `proposedSolution` hoặc `reasoningText` < 10 ký tự (sau trim) → 400.
5. Sinh viên lấy bài của mình theo case: có → 200; chưa nộp → 404.

### US2 — Giảng viên xem hàng đợi và viết nhận xét (P1) — BE-026
Giảng viên thấy danh sách bài Review Study và attempt Branching đã hoàn thành của các khóa mình sở hữu, kèm thời gian nộp và trạng thái; viết nhận xét định tính; bài Review Study chuyển sang REVIEWED.

**Acceptance**
1. Hàng đợi chỉ chứa mục thuộc khóa giảng viên sở hữu; lọc được theo `courseId`, `caseId`; khóa/case không thuộc giảng viên → 403 (case không tồn tại → 404).
2. `POST /lecturer-feedback` với đúng 1 mục tiêu và `feedbackText` hợp lệ → 201; 0 hoặc 2 mục tiêu → 400.
3. Nhận xét trên bài Review Study `SUBMITTED` → bài thành `REVIEWED` trong cùng transaction.
4. Giảng viên không sở hữu khóa của mục tiêu → 403; STUDENT gọi → 403.
5. Nhận xét attempt Branching chưa hoàn thành → 409.

### US3 — Sinh viên đọc nhận xét và nộp phản tư (P1) — BE-025 AC-3, `feature-reflection.md`
**Acceptance**
1. Chủ bài gọi lấy nhận xét → 200 với danh sách nhận xét (rỗng khi chưa có); người khác → 403.
2. Nộp phản tư khi bài `REVIEWED` → 200; bài thành `REFLECTED`, `reflectionStatus = SUBMITTED`, `reflectionSubmittedAt` có giá trị.
3. Nộp phản tư khi bài `SUBMITTED` hoặc `REFLECTED` → 409; văn bản phản tư không đổi sau khi đã nộp.
4. Phản tư < 10 ký tự → 400.

### US4 — Giảng viên xem thống kê case (P2) — BE-028
**Acceptance**
1. Chủ khóa gọi thống kê của case → 200 với: tỷ lệ hoàn thành trên tổng attempt (BE-028 AC-1), đếm lựa chọn từng option tại mỗi decision point (AC-2), phân bổ số lượt làm mỗi sinh viên và kết cục (AC-3), phân bổ trạng thái learning-flow (`FEATURE-BASIC-STATISTICS.md` §2 mục 5).
2. Case chưa có hoạt động → 200 với các số đếm 0 và `completionRate = 0` (không lỗi chia 0).
3. Giảng viên không sở hữu → 403; STUDENT → 403; case không tồn tại → 404.
4. Phản hồi không chứa tên, email hay id sinh viên.

## 5. Functional Requirements

Ký hiệu: AC gốc giữ ID của `03_TASK-DETAILS.md`; yêu cầu mới là `[ĐỀ-XUẤT]` cho tới khi PO duyệt (G0 2026-11-20 đã đồng ý đưa 3 API không có task vào phạm vi BE-025/026 với nhãn `[ĐỀ-XUẤT]`).

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR-01 | API nộp bài Review Study: kiểm tra case PUBLISHED + `REVIEW_STUDY`, lưu vào `review_study_submissions`, `student_id` lấy từ JWT | BE-025 AC-1, `feature-review-study.md` |
| FR-02 | Mỗi sinh viên 1 bài/case; vi phạm UNIQUE → 409 | BE-025 AC-2 |
| FR-03 | Vòng đời forward-only `SUBMITTED → REVIEWED → REFLECTED`; mọi chuyển trạng thái là UPDATE có điều kiện trạng thái nguồn | BE-025 AC-3, `feature-reflection.md` |
| FR-04 | `proposedSolution`, `reasoningText` tối thiểu 10 ký tự; `studentAnalysis` tùy chọn (R2 Option A) | `feature-review-study.md` Constraints |
| FR-05 | [ĐỀ-XUẤT] Độ dài tối đa 3000 ký tự cho `studentAnalysis`, `proposedSolution`, `reasoningText`, `reflectionText`, `feedbackText` (khớp hằng số FE hiện có) | [ĐỀ-XUẤT]; FE `reviewStudyService.ts`, `lecturerFeedbackService.ts` (code, không phải yêu cầu) |
| FR-06 | [ĐỀ-XUẤT] API sinh viên lấy bài của mình theo case; API lấy bài theo id (chủ bài, hoặc giảng viên chủ khóa) | G0 "Có, thêm vào phạm vi"; FE-018 AC-3, FE-020 |
| FR-07 | API nộp phản tư Review Study: chỉ chủ bài, chỉ khi `REVIEWED`; ghi `reflection_text`, `reflection_status = SUBMITTED`, `reflection_submitted_at`, `submission_status = REFLECTED` | FE-020 AC-3, `feature-reflection.md`, DATA-FLOW Flow 5 |
| FR-08 | [ĐỀ-XUẤT] API sinh viên lấy nhận xét giảng viên của bài Review Study của mình (`feedback` hoặc `null`) | G0; FE-020 AC-1 |
| FR-09 | `POST /api/v1/lecturer-feedback` lưu nhận xét định tính, `lecturer_id` từ JWT, chỉ LECTURER chủ khóa | BE-026 AC-1, `feature-lecturer-feedback.md` |
| FR-10 | Đúng 1 mục tiêu (`branchingAttemptId` XOR `reviewSubmissionId`): kiểm ở DTO (400) và CHECK `chk_feedback_one_target` ở DB | BE-026 AC-2 |
| FR-11 | Lưu nhận xét cho bài Review Study `SUBMITTED` chuyển bài sang `REVIEWED` trong cùng transaction | BE-026 AC-3 |
| FR-12 | Nhận xét Branching chỉ cho attempt `is_completed = TRUE` | FE-019 AC-1 ("các attempt hoàn thành"), `FEATURE-LECTURER-FEEDBACK.md` §1 ("completed path") |
| FR-13 | [ĐỀ-XUẤT] API hàng đợi bài nộp cho giảng viên (Review Study mọi trạng thái + Branching attempt hoàn thành), có thời gian nộp, trạng thái xét duyệt và đủ trường để FE lọc client-side theo FE-019 AC-2; mục Branching kèm `steps` (situation, option đã chọn, `reasoningText`) | G0; FE-019 AC-1, AC-2; C3-A (PO 2026-11-20); Figma Frame 05.3 |
| FR-20 | Mỗi mục tiêu (attempt hoặc bài Review Study) tối đa 1 nhận xét; gửi lần 2 → 409, không sửa nhận xét | C2-A (PO 2026-11-20) |
| FR-14 | Thống kê: completion rate trên tổng attempt | BE-028 AC-1, FR-STAT-03 |
| FR-15 | Thống kê: đếm lựa chọn từng option tại mỗi decision point (gồm option 0 lượt) | BE-028 AC-2, FR-STAT-02 |
| FR-16 | Thống kê: phân bổ số lượt làm mỗi sinh viên (1 lượt vs retry) và phân bổ kết cục terminal | BE-028 AC-3, FR-STAT-04 |
| FR-17 | Thống kê: phân bổ trạng thái learning-flow (Branching: đang làm / hoàn thành / đã phản tư; Review Study: submitted / reviewed / reflected) | `FEATURE-BASIC-STATISTICS.md` §2.5, FR-STAT-05 |
| FR-18 | Thống kê chỉ chủ khóa xem được; read-only; không dữ liệu định danh sinh viên | `feature-statistics.md` Constraints, Testing Expectations |
| FR-19 | Mọi API dùng DTO `class-validator` và trả DTO camelCase trong envelope `{ status: "SUCCESS", data }`; không trả raw row | FND §8, mẫu `branching-attempt.controller.ts` |

## 6. Success Criteria

- SC-01 Mỗi FR có ít nhất một unit test hoặc e2e test chạy được, kể cả nhánh âm (400/403/404/409).
- SC-02 Ma trận quyền (STUDENT chủ / STUDENT khác / LECTURER chủ / LECTURER khác / ADMIN / không token) được kiểm cho mọi route mới.
- SC-03 CI backend chạy local xanh: `npm ci && npm run build && npm test -- --runInBand && npm run test:e2e -- --runInBand`.
- SC-04 Ba PR FE gọi đúng contract đã duyệt; không còn nuốt 404/501 thành "không có dữ liệu".

## 7. Ngoài phạm vi

- Sinh viên xem nhận xét giảng viên trên attempt Branching (không có FE trong phạm vi) — ghi nhận là việc sau.
- Màn hình/API Journey Review (BE-023), terminal completion (BE-022, PR #59), reasoning retrospective (BE-024).
- Cổng ghi danh (enrollment) cho Review Study: OPD-001 đang mở; spec giữ đúng nguồn hiện có (chỉ yêu cầu PUBLISHED), giống `branching-attempt` trên `develop`.
- Thống kê tổng hợp nhiều khóa/“overview”: `P3-SUPPORT-AND-STATISTICS.md` §1 Boundary cấm "cross-course analytics dashboard".
- Thay đổi tài liệu: theo C1-A, `DATA-FLOW.md` Flow 5 (route nộp bài `…/review-study/submissions` → `…/review-study/submit`) và `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md:71` cần sửa cho khớp; Claude chỉ đề xuất diff (T060), không tự sửa.

## Clarifications

### Session 2026-11-20 — PO đã trả lời (chat, 2026-11-20, chọn trong hộp câu hỏi; nguyên văn)

- C1 → **"C1-A"**
- C2 → **"C2-A: Từ chối 409"**
- C3 → **"C3-A: Có"**

Đã áp vào `contracts/api.md` (E1–E7), FR-08, FR-13, FR-20, `tasks.md`. Nội dung câu hỏi gốc giữ dưới đây làm lịch sử.

Các câu đã đối chiếu OPD/PSD/PO-n; không câu nào có quyết định sẵn. Theo AGENTS.md rule 5: liệt kê nguồn và phương án, không chọn tạm.

- **C1 — Họ route Review Study** (chặn: E1–E5 trong `contracts/api.md`, T010–T016, sửa FE-018/PR #69 service).
  Nguồn mâu thuẫn:
  - `03_TASK-DETAILS.md` BE-025 AC-1 (và `JIRA-BACKLOG-REFERENCE.md:1700`, `SPRINT-BACKLOG.md:244`): `POST /api/v1/cases/:id/review-study/submit`.
  - `docs/architecture/DATA-FLOW.md` Flow 5 (và `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md:71–72`): `POST /api/v1/cases/{caseId}/review-study/submissions`, `POST /api/v1/review-study/submissions/{submissionId}/reflection`.
  - Code FE-018 đã merge (không phải yêu cầu, AGENTS.md rule 8): `POST /cases/:caseId/review-study`, `GET /cases/:caseId/review-study/my-submission`, `GET /review-study-submissions/:id`, `POST /review-study-submissions/:id/reflection`.
  Phương án: **C1-A** nộp bài theo `03_TASK-DETAILS` (`…/review-study/submit`), các route còn lại theo DATA-FLOW (`/review-study/submissions/:id…`); **C1-B** toàn bộ theo DATA-FLOW (`/cases/:caseId/review-study/submissions`, `/review-study/submissions/:id…`); **C1-C** giữ route của code FE-018 (không phải sửa FE-018). Với A/B, FE-018 service phải sửa; Claude sẽ đề xuất diff cho tài liệu thua.
- **C2 — Giảng viên gửi nhận xét lần 2 cho cùng mục tiêu** (chặn: nhánh "đã có nhận xét" của E6, T020; trường `existingFeedback` của E7).
  Nguồn: `P3-SUPPORT-AND-STATISTICS.md` §2 Actions "creates/updates the `lecturer_feedback` row"; `feature-lecturer-feedback.md` "create or edit feedback"; DB không có UNIQUE theo mục tiêu; `feature-reflection.md` sinh viên phản tư "dựa trên nhận xét"; BE-026 AC chỉ nêu POST.
  Phương án: **C2-A** mỗi mục tiêu tối đa 1 nhận xét, POST lần 2 → 409, không sửa; **C2-B** POST lần 2 cập nhật nhận xét hiện có (upsert) khi bài chưa `REFLECTED`, `REFLECTED` → 409; **C2-C** POST lần 2 tạo thêm một nhận xét mới (nhiều nhận xét/mục tiêu), trạng thái bài không đổi.
- **C3 — Lộ trình attempt Branching trong màn hình giảng viên** (chặn: trường `steps` của mục Branching trong E7, T023).
  Nguồn: `docs/05_FIGMA.md` Frame 05.3 (cột phải hiển thị "lộ trình các node đã chọn, `reasoning_text` hồi cứu và `reflection_text`"); FE-019 AC-1 chỉ yêu cầu danh sách + thời gian + trạng thái; không có task BE nào cấp API lộ trình cho giảng viên; `GET /branching-attempts/:id` hiện chỉ cho chủ attempt.
  Phương án: **C3-A** thêm `steps` (situation, option đã chọn, `reasoningText`) vào mục Branching của hàng đợi trong phạm vi này `[ĐỀ-XUẤT]`; **C3-B** không làm trong phạm vi này, FE hiển thị kết cục + phản tư + số bước và ghi khoảng trống là finding.
