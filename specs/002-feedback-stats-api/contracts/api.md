# API Contract — 002-feedback-stats-api

> Trạng thái: **Đề xuất, chờ PO duyệt (G3/G7)**. Mọi route có prefix `/api/v1` (`backend/src/main.ts`). Mọi phản hồi thành công: `{ "status": "SUCCESS", "data": <DTO> }` (mẫu `branching-attempt.controller.ts`). Lỗi: định dạng mặc định của NestJS `{ statusCode, message, error }`; FE **không** hiển thị `message` thô (chỉ map theo `statusCode`).
> Trường DTO là camelCase, ánh xạ 1-1 từ cột DB nêu trong ngoặc; không có trường nào ngoài cột DB hoặc giá trị tính từ cột DB.
> Xác thực: `JwtAuthGuard` + `RolesGuard` toàn cục (`main.ts`); `401` khi thiếu/sai token cho mọi route dưới đây.

## Quy ước kiểm tra chung

| Mã | Quy tắc |
|---|---|
| R-INV01 | Sinh viên: mọi truy vấn đọc/ghi gắn với case đều có `JOIN cases c … WHERE c.status = 'PUBLISHED'` (FND §4). Case không PUBLISHED được coi như không tồn tại → `404` (không lộ sự tồn tại). |
| R-OWN-S | Sinh viên chỉ thao tác bài của mình: `student_id` = `sub` của JWT; bài của người khác → `403`. |
| R-OWN-L | Giảng viên chỉ thao tác dữ liệu thuộc case có `courses.lecturer_id` = id JWT; khác → `403`. |
| R-ROLE | Role sai (vd. LECTURER gọi API sinh viên, ADMIN gọi bất kỳ route nào dưới đây) → `403` (`@Roles`). |
| R-UUID | Tham số đường dẫn/khóa id không phải UUID → `400` (`ParseUUIDPipe` / `@IsUUID`). |
| R-TRIM | Văn bản được `trim()` trước khi kiểm độ dài; lưu dạng văn bản thuần (React escape khi render; không lưu HTML). |
| R-LEN | Tối thiểu 10 ký tự (nguồn: `feature-review-study.md`); tối đa 3000 ký tự `[ĐỀ-XUẤT]` (FR-05). |

## DTO dùng chung

**ReviewStudySubmissionDto** (bảng `review_study_submissions`)
| Trường | Kiểu | Cột |
|---|---|---|
| `id` | uuid | `id` |
| `caseId` | uuid | `case_id` |
| `studentId` | uuid | `student_id` |
| `studentAnalysis` | string \| null | `student_analysis` |
| `proposedSolution` | string | `proposed_solution` |
| `reasoningText` | string | `reasoning_text` |
| `submissionStatus` | `SUBMITTED` \| `REVIEWED` \| `REFLECTED` | `submission_status` |
| `reflectionText` | string \| null | `reflection_text` |
| `reflectionStatus` | `NOT_STARTED` \| `SUBMITTED` | `reflection_status` |
| `reflectionSubmittedAt` | ISO-8601 \| null | `reflection_submitted_at` |
| `submittedAt` | ISO-8601 | `submitted_at` |
| `updatedAt` | ISO-8601 | `updated_at` |

**LecturerFeedbackDto** (bảng `lecturer_feedback`)
| Trường | Kiểu | Cột |
|---|---|---|
| `id` | uuid | `id` |
| `lecturerId` | uuid | `lecturer_id` |
| `branchingAttemptId` | uuid \| null | `branching_attempt_id` |
| `reviewSubmissionId` | uuid \| null | `review_submission_id` |
| `feedbackText` | string | `feedback_text` |
| `createdAt` | ISO-8601 | `created_at` |
| `updatedAt` | ISO-8601 | `updated_at` |

## A. Review Study (BE-025) — route theo C1-A (PO 2026-11-20)

Nộp bài theo `03_TASK-DETAILS.md` BE-025 AC-1; các route còn lại theo `DATA-FLOW.md` Flow 5 (`/review-study/submissions/...`). E2 là `[ĐỀ-XUẤT]` cùng họ route.

| ID | Hành động | Route |
|---|---|---|
| E1 | Nộp bài | `POST /cases/:caseId/review-study/submit` |
| E2 | Bài của tôi theo case | `GET /cases/:caseId/review-study/submissions/me` |
| E3 | Bài theo id | `GET /review-study/submissions/:submissionId` |
| E4 | Nộp phản tư | `POST /review-study/submissions/:submissionId/reflection` |
| E5 | Nhận xét của bài | `GET /review-study/submissions/:submissionId/feedback` |

### E1 — Nộp bài Review Study — STUDENT — FR-01..05
Body:
```json
{ "studentAnalysis": "string, tùy chọn, ≤3000", "proposedSolution": "string, 10..3000", "reasoningText": "string, 10..3000" }
```
Xử lý: R-INV01 (case PUBLISHED); `learning_mode = 'REVIEW_STUDY'`; `INSERT … submission_status = 'SUBMITTED'`; lỗi `23505` trên `uq_review_submission_per_student_case` → 409.
| Mã | Khi |
|---|---|
| 201 | Tạo thành công → `ReviewStudySubmissionDto` |
| 400 | Body sai (thiếu, quá ngắn/dài, trường lạ — whitelist `forbidNonWhitelisted`), `caseId` không phải UUID, case không phải `REVIEW_STUDY` |
| 403 | R-ROLE |
| 404 | Case không tồn tại hoặc không PUBLISHED |
| 409 | Sinh viên đã nộp bài cho case này |

### E2 — Bài của tôi theo case — STUDENT — FR-06 [ĐỀ-XUẤT]
| Mã | Khi |
|---|---|
| 200 | `ReviewStudySubmissionDto` |
| 403 | R-ROLE |
| 404 | Case không tồn tại/không PUBLISHED, **hoặc** sinh viên chưa nộp. Phân biệt bằng body lỗi `error: "SUBMISSION_NOT_FOUND"` khi case hợp lệ nhưng chưa nộp (FE-018 dùng 404 này để hiện form). |

### E3 — Bài theo id — STUDENT (chủ) hoặc LECTURER (chủ khóa) — FR-06 [ĐỀ-XUẤT]
STUDENT: R-INV01 + R-OWN-S. LECTURER: R-OWN-L (giảng viên xem được cả khi case đã về DRAFT).
| Mã | Khi |
|---|---|
| 200 | `ReviewStudySubmissionDto` |
| 403 | Không phải chủ bài / không phải chủ khóa / ADMIN |
| 404 | Không tồn tại; với STUDENT cả khi case không PUBLISHED |

### E4 — Nộp phản tư — STUDENT (chủ) — FR-03, FR-07
Body: `{ "reflectionText": "string, 10..3000" }`
Xử lý: R-INV01 + R-OWN-S; một câu `UPDATE … SET reflection_text, reflection_status='SUBMITTED', reflection_submitted_at=NOW(), submission_status='REFLECTED', updated_at=NOW() WHERE id=$1 AND student_id=$2 AND submission_status='REVIEWED' RETURNING *` (chống race; không ghi đè phản tư đã nộp).
| Mã | Khi |
|---|---|
| 200 | `ReviewStudySubmissionDto` (trạng thái `REFLECTED`) |
| 400 | Body sai |
| 403 | Không phải chủ bài / R-ROLE |
| 404 | Không tồn tại / case không PUBLISHED |
| 409 | Bài đang `SUBMITTED` (chưa có nhận xét) hoặc đã `REFLECTED` |

### E5 — Nhận xét của bài — STUDENT (chủ) — FR-08 [ĐỀ-XUẤT]
| Mã | Khi |
|---|---|
| 200 | `{ "feedback": LecturerFeedbackDto \| null }` — mỗi bài tối đa 1 nhận xét (C2-A); `feedback: null` khi chưa có nhận xét (trạng thái rỗng thật, không phải lỗi) |
| 403 | Không phải chủ bài / R-ROLE |
| 404 | Không tồn tại / case không PUBLISHED |

## B. Lecturer Feedback (BE-026)

### E6 — `POST /lecturer-feedback` — LECTURER — FR-09..12 (route: BE-026 AC-1, DATA-FLOW Flow 5)
Body: `{ "branchingAttemptId": "uuid?", "reviewSubmissionId": "uuid?", "feedbackText": "string, 10..3000" }` — đúng một trong hai id.
Xử lý trong 1 transaction: khóa hàng mục tiêu (`SELECT … FOR UPDATE`) → R-OWN-L qua `cases.course_id → courses.lecturer_id` → Branching: `is_completed = TRUE` bắt buộc → `INSERT lecturer_feedback` → Review Study `SUBMITTED`: `UPDATE … SET submission_status='REVIEWED'`.
Mỗi mục tiêu tối đa 1 nhận xét, không sửa (C2-A, PO 2026-11-20): trong cùng transaction, sau khi khóa hàng mục tiêu, nếu đã có dòng `lecturer_feedback` của mục tiêu → 409, không ghi gì.
| Mã | Khi |
|---|---|
| 201 | Tạo nhận xét → `LecturerFeedbackDto` |
| 400 | Body sai: 0 hoặc 2 mục tiêu, id không phải UUID, `feedbackText` sai độ dài |
| 403 | R-ROLE / không phải chủ khóa |
| 404 | Mục tiêu không tồn tại |
| 409 | Attempt Branching chưa hoàn thành; mục tiêu đã có nhận xét (C2-A) |

### E7 — `GET /lecturer-feedback/submissions` — LECTURER — FR-13 [ĐỀ-XUẤT]
Query: `courseId?` (uuid), `caseId?` (uuid). Không truyền → mọi khóa giảng viên sở hữu. `courseId`/`caseId` của người khác → 403; không tồn tại → 404. Sắp theo `submittedAt` giảm dần. Không phân trang `[ĐỀ-XUẤT]` (quy mô lớp MVP).
Phản hồi `200`: `{ "items": SubmissionQueueItemDto[] }`

**SubmissionQueueItemDto**
| Trường | Kiểu | Nguồn dữ liệu | Áp dụng |
|---|---|---|---|
| `targetType` | `REVIEW_STUDY` \| `BRANCHING_STUDY` | loại bảng | cả hai |
| `targetId` | uuid | `review_study_submissions.id` / `branching_attempts.id` | cả hai |
| `studentId`, `studentName`, `studentEmail` | uuid, string, string | `users.id`, `users.full_name`, `users.email` | cả hai |
| `courseId`, `courseName`, `courseCode` | uuid, string, string \| null | `courses.id`, `name`, `course_code` | cả hai |
| `caseId`, `caseTitle` | uuid, string | `cases.id`, `title` | cả hai |
| `submittedAt` | ISO-8601 | `submitted_at` / `completed_at` | cả hai |
| `feedbackStatus` | `PENDING` \| `REVIEWED` | `REVIEWED` khi mục tiêu đã có dòng `lecturer_feedback` | cả hai |
| `existingFeedback` | `LecturerFeedbackDto` \| null | dòng `lecturer_feedback` duy nhất của mục tiêu (C2-A) | cả hai |
| `reflectionStatus`, `reflectionText` | enum, string \| null | `reflection_status`, `reflection_text` | cả hai |
| `submissionStatus` | enum | `submission_status` | REVIEW_STUDY |
| `studentAnalysis`, `proposedSolution`, `reasoningText` | string | cột cùng tên | REVIEW_STUDY |
| `attemptNumber` | int | `attempt_number` | BRANCHING_STUDY |
| `isCompleted` | `true` | `is_completed` (hàng đợi chỉ chứa attempt hoàn thành) | BRANCHING_STUDY |
| `outcomeSituation` | string \| null | `case_nodes.situation` của `outcome_node_id` | BRANCHING_STUDY |
| `stepsCount` | int | `COUNT(student_reasoning)` của attempt | BRANCHING_STUDY |
| `steps` | `{ nodeId, situation, selectedOptionText, reasoningText \| null }[]` | `student_reasoning` ⨝ `case_nodes` ⨝ `case_options`, theo thứ tự `student_reasoning.submitted_at` tăng dần (C3-A, PO 2026-11-20) [ĐỀ-XUẤT]. Không có `consequence` (chỉ hiện ở Journey Review của sinh viên) | BRANCHING_STUDY |

Trường không áp dụng cho loại mục: không có mặt trong JSON.

## C. Statistics (BE-028)

### E8 — `GET /cases/:caseId/statistics` — LECTURER (chủ khóa) — FR-14..18
Route: `DATA-FLOW.md` Flow 7, `FEATURE-BASIC-STATISTICS.md` §5, `FEATURE_HIERARCHY_AND_BACKLOG_MAPPING.md:74` (thống nhất, không mâu thuẫn). Read-only; mọi case status (giảng viên xem cả case đã gỡ publish).
| Mã | Khi |
|---|---|
| 200 | `CaseStatisticsDto` |
| 400 | `caseId` không phải UUID |
| 403 | R-ROLE / không phải chủ khóa |
| 404 | Case không tồn tại |

**CaseStatisticsDto**
| Trường | Kiểu | Định nghĩa |
|---|---|---|
| `caseId`, `caseTitle`, `learningMode`, `caseStatus` | | `cases.id`, `title`, `learning_mode`, `status` |
| `branching` | object \| null | khác null khi `learningMode = BRANCHING_STUDY` |
| `branching.totalAttempts` | int | `COUNT(*)` attempt của case |
| `branching.completedAttempts` | int | `COUNT(*) WHERE is_completed` |
| `branching.completionRate` | number 0–100, 1 chữ số thập phân | `completed / total × 100`; `0` khi `total = 0` (BE-028 AC-1) |
| `branching.participants` | int | số sinh viên khác nhau có ≥1 attempt |
| `branching.singleAttemptStudents`, `branching.retryStudents` | int | sinh viên có đúng 1 attempt / >1 attempt (FR-STAT-04) |
| `branching.attemptsPerStudent` | `{ attempts: int, students: int }[]` | phân bổ `MAX(attempt_number)` theo sinh viên (BE-028 AC-3) |
| `branching.flowStatus` | `{ inProgress, completed, reflected }` | attempt `is_completed = FALSE` / `TRUE` và `reflection_status = NOT_STARTED` / `reflection_status = SUBMITTED` |
| `branching.decisionPoints` | `{ nodeId, nodeIndex, situation, totalSelections, options: { optionId, optionText, count, percentage }[] }[]` | mỗi node không terminal; đếm `student_reasoning.selected_option_id` (BE-028 AC-2); option 0 lượt vẫn có mặt; `percentage = count / totalSelections × 100` (0 khi `totalSelections = 0`) |
| `branching.outcomes` | `{ nodeId, situation, count, percentage }[]` | mỗi node terminal; đếm `outcome_node_id` trên attempt hoàn thành; `percentage` trên `completedAttempts` |
| `reviewStudy` | object \| null | khác null khi `learningMode = REVIEW_STUDY` |
| `reviewStudy.totalSubmissions` | int | `COUNT(*)` bài nộp |
| `reviewStudy.flowStatus` | `{ submitted, reviewed, reflected }` | đếm theo `submission_status` |

Không có trường định danh sinh viên (B-6). Số đếm là `int` (ép `COUNT(*)::int`).

## D. Không đổi / không cung cấp
- Không có `GET /statistics/overview`, `GET /statistics/cases/:id/flow`, `GET /review-study-submissions/:id/feedback` (route PR #70/#69 tự đặt), và không có route `/review-study-submissions/...` của code FE-018 (C1-A).
- Lecturer chọn khóa/case cho thống kê dùng API có sẵn `GET /courses` và `GET /courses/:courseId/cases`.
- `GET /courses/:courseId/cases/:caseId/review-study-submissions` (FE-018 `getSubmissionsByCourse`) **không** được tạo: E7 với `caseId` thay thế nó; Claude sẽ bỏ hàm FE này (không màn hình nào gọi — kiểm khi sửa FE).
