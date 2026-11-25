# API contract — spec 007

Quy ước chung:
- Prefix `/api/v1`. Phản hồi thành công có dạng `{ "status": "SUCCESS", "data": … }`, như các module hiện có. Riêng export CSV trả tệp thô.
- Lỗi dùng exception HTTP của Nest: 400 validation, 401 không token/token sai/tài khoản khóa, 403 sai vai trò hoặc ngoài quyền sở hữu, 404 không tồn tại, 409 xung đột.
- Body có trường lạ → 400 (global `forbidNonWhitelisted`).
- ID trong path phải là UUID (`ParseUUIDPipe`), sai định dạng → 400.
- Phân trang: `page` ≥ 1 (mặc định 1), `size` 1–100 (mặc định 20). Phản hồi có `total`, `page`, `size`.

## 1. Hồ sơ (BE-031)

| Method | Path | Vai trò | Body | 200 data |
|---|---|---|---|---|
| GET | `/users/me` | mọi vai trò đã đăng nhập | — | `{ id, email, fullName, role, createdAt, language }` |
| PATCH | `/users/me` | mọi vai trò đã đăng nhập | `{ fullName?: string(2..100, trim), language?: "vi"\|"en" }`, ít nhất 1 trường | như GET |

## 2. Dashboard giảng viên (BE-030)

`GET /lecturer/dashboard?courseId=<uuid?>`, chỉ LECTURER.

```json
{
  "courses": { "total": 3, "active": 2, "archived": 1 },
  "cases": {
    "total": 7,
    "byStatus": { "DRAFT": 2, "REVIEWED": 1, "APPROVED": 1, "PUBLISHED": 3 },
    "byMode": { "BRANCHING_STUDY": 5, "REVIEW_STUDY": 2 }
  },
  "pendingReviews": {
    "count": 4,
    "items": [{ "submissionId": "…", "caseId": "…", "caseTitle": "…", "courseId": "…", "courseName": "…", "studentName": "…", "submittedAt": "…" }]
  },
  "recentCompletedAttempts": {
    "countLast7Days": 6,
    "items": [{ "attemptId": "…", "caseId": "…", "caseTitle": "…", "courseId": "…", "courseName": "…", "studentName": "…", "attemptNumber": 1, "completedAt": "…", "hasFeedback": false }]
  },
  "generatedAt": "…"
}
```

- `items` có tối đa 5 phần tử: `pendingReviews` xếp theo `submittedAt` tăng dần (cũ nhất trước), `recentCompletedAttempts` theo `completedAt` giảm dần.
- `courseId` của khóa khác → 403; khóa không tồn tại → 404.

## 3. Admin (BE-032), mọi route chỉ ADMIN

| Method | Path | Query / Body | data |
|---|---|---|---|
| GET | `/admin/overview` | — | xem §3.1 |
| GET | `/admin/users` | `search, role, status=ACTIVE\|LOCKED, page, size` | `{ users[], metrics, total, page, size }` |
| PATCH | `/admin/users/:id/status` | `{ status: "ACTIVE"\|"LOCKED" }` | `{ id, status }` |
| PATCH | `/admin/users/:id/role` | `{ role: "STUDENT"\|"LECTURER"\|"ADMIN" }` | `{ id, role }` |
| GET | `/admin/courses` | `search, status=ACTIVE\|ARCHIVED, page, size` | `{ courses[], total, page, size }` |
| GET | `/admin/cases` | `search, status, learningMode, courseId, page, size` | `{ cases[], analytics, total, page, size }` |
| GET | `/admin/ai-service` | — | `{ metrics, config, recentGenerations[], indexingStatuses[] }` |
| GET | `/admin/logs` | `search, eventType, timeRange=today\|7d\|30d\|all, page, size` | `{ logs[], metrics, total, page, size }` |
| GET | `/admin/settings` | — | `{ platformName, operatorUnit, loginNotice, supportEmail, aiPolicyNote, limits }` |
| PUT | `/admin/settings` | `{ platformName?(1..120), operatorUnit?(0..200), loginNotice?(0..500), supportEmail?(email\|""), aiPolicyNote?(0..1000) }` | như GET |

Thân lỗi 409: `{ statusCode: 409, error: "Conflict", message, code }`. Lỗi riêng: `PATCH …/status` tự khóa mình → 409 `CANNOT_LOCK_SELF`; `PATCH …/role` tự đổi vai trò của mình → 409 `CANNOT_CHANGE_OWN_ROLE`; khóa hoặc hạ vai trò admin hoạt động cuối cùng → 409 `LAST_ACTIVE_ADMIN`.

### 3.1 `/admin/overview`

Tên trường khớp với `frontend/src/services/mappers/adminOverview.ts` (dạng camelCase).

```json
{
  "attentionAlerts": [{ "id": "indexing_failure", "type": "indexing_failure", "message": "…", "count": 2 }],
  "totalUsers": 0, "userGrowthThisMonth": 0,
  "openCourses": 0, "courseGrowthThisMonth": 0,
  "publishedCases": 0, "caseGrowthThisMonth": 0,
  "aiCaseGenerations": 0, "aiCaseFailures": 0,
  "studentsCount": 0, "lecturersCount": 0, "adminsCount": 0,
  "studentPercent": 0, "lecturerPercent": 0, "adminPercent": 0,
  "weeklySignups": [{ "weekStart": "2026-09-28", "count": 0 }],
  "casesByCourse": [{ "courseCode": "…", "courseName": "…", "publishedCount": 0, "draftCount": 0, "totalCount": 0 }],
  "recentLogs": [{ "id": "…", "description": "…", "meta": "…", "tone": "success", "occurredAt": "…" }],
  "system_health": { "app_server": "UP", "database": "UP", "ai_service": "UP", "indexing": "UP", "indexing_processing_count": 0 }
}
```

`system_health` để dạng snake_case vì mapper đã merge trên develop (`toAdminOverview`) chỉ đọc khóa này.

- `attentionAlerts[].message` là mã ổn định (`indexing_failure`, `login_failure`, `locked_account`) kèm `count`. FE tự dịch qua i18n, nên API không trả câu tiếng Việt cố định.
- `aiCaseGenerations` và `aiCaseFailures` tính trong 30 ngày gần nhất.

### 3.2 Phần tử danh sách

- `users[]`: `{ id, name, email, role, status, createdAt, coursesInfo, attemptCount }`. `coursesInfo` là số khóa phụ trách (LECTURER) hoặc số khóa đã tham gia (STUDENT).
- `courses[]`: `{ id, name, courseCode, lecturerName, status, materialsCount, materialsReady, errorCount, casesCount, attemptsCount, description, createdAt }`.
- `cases[]`: `{ id, title, courseId, courseName, courseCode, learningMode, status, nodesCount, updatedAt }`.
- `logs[]`: `{ id, code, actorName, actorEmail, timestamp, eventTitle, eventMeta, status: SUCCESS|WARNING|ERROR }`. `eventTitle` là mã sự kiện (FE dịch). `eventMeta` chỉ có dữ liệu không nhạy cảm (tên case, tên tệp, trạng thái cũ → mới, thời lượng).

## 4. Evaluation (BE-033)

| Method | Path | Vai trò | Ghi chú |
|---|---|---|---|
| GET | `/evaluation/rubrics?caseId=` | LECTURER (case của mình), ADMIN | danh sách phiếu |
| GET | `/evaluation/rubrics/:id` | LECTURER (case của mình), ADMIN | |
| POST | `/evaluation/rubrics` | LECTURER (case của mình), ADMIN | 201; `{ caseId, realismScore, difficultyScore, alignmentScore, notes? }`; trùng người đánh giá + case → 409 |
| PUT | `/evaluation/rubrics/:id` | người tạo phiếu | `{ realismScore?, difficultyScore?, alignmentScore?, notes? }` |
| DELETE | `/evaluation/rubrics/:id` | người tạo phiếu | 200 `{ id }` |
| GET | `/evaluation/export?dataset=activity\|rubrics&courseId=&caseId=` | LECTURER (khóa/case của mình), ADMIN | `text/csv; charset=utf-8`, có BOM |

Phiếu trả về:

```json
{
  "id": "…", "caseId": "…", "caseTitle": "…", "evaluatorId": "…", "evaluatorName": "…",
  "realismScore": 4, "difficultyScore": 3, "alignmentScore": 5, "averageScore": 4.0,
  "criteria": [{ "key": "REALISM", "score": 4 }, { "key": "DIFFICULTY", "score": 3 }, { "key": "ALIGNMENT", "score": 5 }],
  "notes": "…", "createdAt": "…", "updatedAt": "…"
}
```

`evaluatorName` chỉ xuất hiện trong API. CSV dùng mã ẩn danh.

CSV `activity`, các cột theo thứ tự:
`participant_code, course_code, case_id, learning_mode, attempt_number, completed, decision_count, choice_path, outcome_node_id, reasoning_word_count, reflection_word_count, challenge_rounds, duration_seconds`.

`challenge_rounds` là số vòng sâu nhất (0–2) trong các phiên Challenge Support của attempt hoặc bài nộp (FR-EVAL-04).

CSV `rubrics`, các cột theo thứ tự:
`case_id, course_code, learning_mode, evaluator_code, realism_score, difficulty_score, alignment_score, average_score`.

L3 Option C (PO 2026-11-25): không bộ dữ liệu nào có cột mốc thời gian. `duration_seconds` là số giây nguyên giữa bắt đầu và hoàn thành; để trống khi attempt chưa hoàn thành và với bài Review Study. Thứ tự dòng: `activity` theo `case_id`, `participant_code`, `attempt_number`; `rubrics` theo `case_id`, `evaluator_code`. Không sắp theo thời gian.
