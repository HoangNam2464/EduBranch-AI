# Record — spec 007

## 1. Trạng thái gate
| Gate | Trạng thái | Ghi chú |
|---|---|---|
| G0 | PASS | PO chat 2026-11-21 (§2) |
| G1–G7 | PASS | PO duyệt gộp 2026-11-21 (§2) |
| QG1 | PASS (cục bộ) | §4 |
| QG2 | PASS WITH CONDITIONS | §5, §7.2, §7.3; PO đã chốt chính thức R-L3b phương án B (2026-11-26, §6) và reviewer độc lập (`040ec391`) xác nhận `PASS WITH CONDITIONS`; điều kiện: các giới hạn ghép còn lại thuộc AC-R4/AC-R5 (§7.3) đã được ghi nhận minh bạch và cần chạy lại QG5 CI sau commit |
| QG3 | Không áp dụng | Không đổi UI |
| QG4 | PASS | Không đổi chuỗi i18n; không có secret trong diff (§4) |
| QG5 | Xem PR #80 | Bằng chứng CI gắn với head SHA, ghi trong comment của PR #80; mỗi commit mới phải chạy lại |
| QG6–QG7 | Chưa chạy | QG6 cần PO/Code Owner duyệt; QG7 sau khi merge |

## 2. G0, nguyên văn
- PO, 2026-11-21: "tôi k quan tâm số liệu, chỉ quan tâm tới sản phẩm, nên tôi cần sản phẩm phải được hoàn thành".
- Câu hỏi phân công (AskUserQuestion, 2026-11-21) liệt kê BE-031, BE-032, BE-030 (giao Đức Anh) và BE-033 (giao PO). PO chọn: "Claude làm cả 4 (Recommended)". Mô tả của lựa chọn này: "Claude viết spec cho cả 4, trình duyệt G7 một lần rồi implement và test. Assignee trên Jira giữ nguyên, commit ghi rõ do Claude làm. Đức Anh sẽ review PR."

- G1–G7 (AskUserQuestion, 2026-11-21): "Duyệt, implement".
- Q1 Đổi vai trò: "Có, thêm API". Q2 Sao lưu 10.10: "Chỉ hiển thông tin".

## 3. Giới hạn đã biết
- Phiên cloud này không có quyền ghi GitHub (push trả 403, 2026-11-21). Commit được giao cho PO dưới dạng git bundle cho tới khi quyền ghi được cấp.
- CI backend không có Postgres, nên suite tích hợp DB tự bỏ qua trên CI; bằng chứng DB thật là bằng chứng chạy cục bộ.
- Mã ẩn danh phụ thuộc `JWT_SECRET`: đổi secret thì mã của các lần xuất sau sẽ khác.

## 4. QG1 — bằng chứng chạy cục bộ (2026-11-21)

Môi trường: worktree `feature/mvp-completion-backend` tách từ `origin/develop` `6f903f2`; Node 20; PostgreSQL 16 + pgvector cục bộ (`postgresql-16-pgvector`) và Redis cục bộ, vì phiên cloud không có Docker. Biến môi trường: `POSTGRES_PASSWORD=test`, `REDIS_PASSWORD=` (rỗng), `JWT_SECRET` ngẫu nhiên 64 ký tự.

| Lệnh (thư mục `backend/`) | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | |
| `npm test -- --runInBand` | 0 | 37 suite, 336/336 (sau khi sửa theo QG2) |
| `npm run test:e2e -- --runInBand` | 0 | 9 suite pass, 4 suite live bị skip (MinIO/AI, như trước), 290 pass / 33 skip (sau khi sửa theo QG2) |
| `npm run test:matrix` | 0 | 24/24 |
| `npm run test:regression` | 0 | 32/32 |
| `pytest tests/test_health.py` (ai-service, Python 3.12) | 0 | 2/2 |

Test mới:
- **Unit** (`src/`):
  - `user.service.spec.ts`, `admin-format.spec.ts`, `admin.service.spec.ts`, `research-export.spec.ts`;
  - `auth.service.lock.spec.ts`, `case.service.audit.spec.ts`, `audit.service.spec.ts`.
- **HTTP e2e** `test/mvp-completion.e2e-spec.ts` (124 test):
  - role-matrix 401/403/200 cho từng route mới;
  - validation 400 (trường lạ `email`/`role`/`id`, giá trị ngoài miền, UUID sai);
  - header CSV.
- **Tích hợp DB thật** `test/mvp-completion.integration.e2e-spec.ts` (18 test): chạy V1–V8 trên database mới `edubranch_spec007_it`, rồi kiểm tra:
  - phép đếm dashboard với 2 nhận xét trên cùng 1 attempt (AC-D3);
  - giảng viên B không thấy dữ liệu của A;
  - khóa tài khoản → đăng nhập và token cũ đều bị từ chối, mở khóa thì khôi phục (AC-A5);
  - đăng nhập thất bại với email không tồn tại thì email không được lưu;
  - không khóa/hạ được admin hoạt động cuối cùng;
  - đổi vai trò có hiệu lực ngay;
  - CSV không chứa tên, email, UUID người dùng hay văn bản tự do (AC-R5).

Sửa test cũ: `src/modules/auth/auth.service.spec.ts`, hai assertion so khớp nguyên văn câu SQL, nay có thêm `is_active`. Đây là thay đổi hành vi có chủ đích (AC-A5).

Giới hạn của bằng chứng:
- Trên CI không có Postgres, suite tích hợp tự bỏ qua. Các test khi đó vẫn báo "passed" nhưng không chạy gì (cùng mẫu với `migration.integration.e2e-spec.ts`), nên không được tính là bằng chứng CI.
- Test migration cục bộ đã áp V6–V8 lên database `edubranch_ai` cục bộ (không ảnh hưởng môi trường dùng chung).

Phát hiện ngoài phạm vi (báo PO, không sửa): `MaterialService` có giới hạn 50 MB (`MAX_SIZE_BYTES`, `material.service.ts:20`), nhưng chỉ kiểm tra sau khi đã nhận xong tệp. `FileInterceptor("file")` không đặt `limits` (`material.controller.ts:34`), nên tệp lớn vẫn bị đọc hết vào bộ nhớ trước khi bị từ chối. Đính chính 2026-11-22: bản ghi trước nói "không có giới hạn" là sai. `GET /admin/settings` trả `maxFileSize: "50 MB"` lấy từ chính hằng số này.

## 5. QG2 — review độc lập (2026-11-21)

Người review là một agent riêng, không phải người implement, và làm việc ở chế độ chỉ đọc. Agent đã chạy:
- `build`, unit và e2e;
- hai probe trên database thật dùng một lần (`qg2_probe`, `qg2_probe2`, đã xóa sau khi chạy).

Không có lỗi Critical hoặc High. Không tìm thấy SQL injection, lỗ hổng phân quyền hay lộ PII.

| ID | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| M1 | Medium | `PUT /admin/settings` với giá trị `null` trả 500 (vi phạm NOT NULL) thay vì 400 | Đã sửa: DTO dùng `ValidateIf(v !== undefined)`, nên `null` bị kiểm tra và trả 400. Có test e2e |
| M2 | Medium | Cột `challenge_rounds` trong CSV cộng dồn các phiên của attempt, nên có thể > 2 | Đã sửa: lấy `MAX` theo FR-EVAL-04 ("0, 1 hoặc 2") và AC-R4. Có test tích hợp (2 phiên × 2 vòng → 2) |
| M3 | Medium | `total` = 0 khi xem trang vượt quá trang cuối (courses/cases/logs) | Đã sửa: khi trang rỗng thì chạy truy vấn đếm riêng (`pageTotal`). Có test tích hợp |
| L1 | Low | Hai admin khóa lẫn nhau cùng lúc gây deadlock, trả 500 | Đã sửa: khóa các dòng admin theo thứ tự `id` trước, rồi mới khóa dòng đích. Có unit test và test tích hợp chạy đồng thời |
| L2 | Low | `PATCH /users/me` với `null` trả 200 mà không đổi gì | Đã sửa như M1; cũng áp dụng cho `PUT` rubric. Có test e2e |
| L3 | Low | Giảng viên có thể ghép CSV (thời điểm tới mili-giây, case, số attempt) với dashboard để nối mã ẩn danh với tên. Người chỉ có CSV thì không làm được | **Đã sửa theo Option C (PO 2026-11-25)**: bỏ `started_at` và `completed_at`, thay bằng `duration_seconds` (giây nguyên); bỏ `created_at` khỏi CSV `rubrics`; thứ tự dòng không còn theo thời gian (§7). Không còn mốc thời gian trong CSV. Rủi ro ghép qua các cột khác còn mở: R-L3b (§7.2) |
| L4 | Low | Thân lỗi 409 thiếu `statusCode`/`error` | Đã sửa: thân lỗi có `{statusCode, error, message, code}`. Có unit test |

Ghi nhận thêm, không sửa:
- `/admin/logs` tìm theo mã sự kiện, không theo tiêu đề đã dịch. FE dịch mã, nên tìm theo tiêu đề tiếng Việt cần FE gửi mã tương ứng.
- `LOGIN_FAILED`/`BAD_PASSWORD` ghi tài khoản bị nhắm tới vào `actor_id`.
- `caseGrowthThisMonth` đếm case được tạo trong tháng và hiện đang PUBLISHED.
- Login bỏ qua bcrypt với email không tồn tại, nên có thể đoán email qua thời gian phản hồi. Lỗi này có từ trước, ngoài phạm vi.

## 6. Các quyết định đã chốt

Không còn việc mở cho PO trong spec này.

- **L3 — PO chốt phương án C, 2026-11-25** (PO trong chat: "Tôi xác nhận chính thức chọn phương án C cho quyết định L3 của PR #80, ngày 25/11/2026"):
  - chỉ xuất thời lượng (`duration_seconds` trước khi khái quát hóa thành `duration_band` ở R-L3b B);
  - không xuất mốc thời gian tuyệt đối trong CSV nghiên cứu;
  - mục tiêu: không ghép được CSV với dashboard để suy ra danh tính sinh viên từ mã ẩn danh;
  - không bỏ timestamp trong database hay API response ngoài phạm vi L3.
- **R-L3b — PO chốt phương án B, 2026-11-26** (PO trong chat: `"PO decision — 2026-11-26: PO chính thức chọn phương án B cho R-L3b, bao gồm việc khái quát hóa decision_count thành decision_count_band và các trường dữ liệu khác theo phương án đã được rà soát. Tiếp tục duy trì quyền xuất dữ liệu theo AC-R4 và pseudonym ổn định giữa các lần xuất theo AC-R5. Không khôi phục timestamp tuyệt đối đã loại bỏ theo L3 Option C. Các rủi ro liên kết dữ liệu còn lại phải được ghi nhận minh bạch; không tuyên bố CSV đã ẩn danh tuyệt đối."`): giảm độ chi tiết của dữ liệu xuất CSV để hạn chế ghép ngược với hàng đợi nhận xét của giảng viên, không tuyên bố ẩn danh tuyệt đối; chi tiết thiết kế, bằng chứng kiểm thử và rủi ro còn lại ở §7.3.

## 7. Kiểm tra L3 Option C (2026-11-25)

### 7.1 Phần sửa

Commit `768013c` bỏ `started_at`/`completed_at` khỏi CSV `activity`. Kiểm tra lại toàn bộ đầu ra CSV theo quyết định của PO còn hai chỗ chưa đạt, đã sửa trong commit tiếp theo:
- CSV `rubrics` vẫn có `created_at` (ISO tới mili-giây). Đã bỏ cột này (spec AC-R4 và contract cập nhật theo).
- Dòng được sắp theo thời gian (`ba.started_at`, `s.submitted_at`, `r.created_at`), nên vị trí dòng vẫn cho biết thứ tự hoạt động. Đã đổi sang sắp trong code theo ID case → mã ẩn danh → số thứ tự attempt (rubric: ID case → mã người đánh giá). Không sắp theo `student_id`: giảng viên thấy UUID sinh viên qua API, nên thứ tự theo UUID vẫn ghép ngược được; mã ẩn danh là HMAC với khóa bí mật nên không suy ra được.

Không đổi: database, API rubric (`createdAt`/`updatedAt` vẫn trả trong API, ngoài phạm vi L3), cách tính `duration_seconds` (`EXTRACT(EPOCH FROM completed_at - started_at)::integer`, để trống khi chưa hoàn thành và với Review Study).

Bằng chứng cục bộ (Windows, Docker Postgres 16 + pgvector; suite tích hợp chạy trên database riêng `edubranch_spec007_it`):

| Lệnh (thư mục `backend/`) | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | |
| `npm test` | 0 | 37 suite, 338/338 |
| `npx jest --config test/jest-e2e.json test/mvp-completion.integration.e2e-spec.ts` | 0 | 18/18 |
| Suite tích hợp chạy lại 3 lần liên tiếp (ID ngẫu nhiên mỗi lần) | 0 ×3 | 18/18 mỗi lần |
| `npx jest --config test/jest-e2e.json test/mvp-completion.e2e-spec.ts` | 0 | 124/124 |
| `npm run test:matrix` | 0 | 24/24 |
| `npm run test:regression` | 0 | 32/32 |
| Đột biến 1: bỏ sắp xếp (giữ thứ tự bảng) | 1 (mong đợi), 3/3 lần | 2 test xuất CSV fail |
| Đột biến 2: code của `768013c` (sắp theo thời gian, còn `created_at`) | 1 (mong đợi), 2/2 lần | 2 test xuất CSV fail |
| Đột biến 3: activity sắp theo case rồi `student_id` thô giảm dần | 1 (mong đợi), 3/3 lần | test activity fail |
| Đột biến 4: rubric `ORDER BY ca.id, r.created_at DESC`, bỏ sắp trong code | 1 (mong đợi), 3/3 lần | test rubric fail |
| Đột biến 5: rubric `ORDER BY ca.id, r.evaluator_id DESC`, bỏ sắp trong code | 1 (mong đợi), 3/3 lần | test rubric fail |
| Đột biến 6–8: activity chỉ sắp theo case trong code, SQL `ORDER BY ca.id, ba.completed_at DESC NULLS FIRST` / `DESC NULLS LAST` / `ba.started_at DESC` (bài nộp `s.submitted_at DESC`) | 1 (mong đợi), 3/3 lần mỗi đột biến | test activity fail |

Test thêm:
- unit `research-export.spec.ts`: không cột nào có dạng thời gian (`_at`, `date`, `time`); `compareRows` sắp đúng, số theo giá trị số;
- tích hợp:
  - `duration_seconds` = 125 với attempt bắt đầu 125 giây trước khi hoàn thành; để trống khi chưa hoàn thành và với Review Study; fixture đặt `started_at` cụ thể (trước đây mặc định `NOW()`, sau `completed_at`);
  - cả hai CSV không chứa chuỗi ngày `YYYY-MM-DD`; header rubric không có `created_at`;
  - thứ tự dòng so với một dãy kỳ vọng cụ thể:
    - test thêm tạm một sinh viên thứ ba vào case K1 (attempt hoàn thành 90 phút trước, nằm giữa a1 và a2 theo thời gian) và một phiếu rubric thứ ba, rồi xóa sau khi xuất;
    - vai trò được gán theo thứ tự mã ẩn danh của ba UUID ngẫu nhiên; bộ ba chỉ được giữ khi thứ tự UUID thô phù hợp (xác suất cố định 1/3 và 2/3 mỗi lần thử, tối đa 1000 lần rồi báo lỗi);
    - nhờ vậy thứ tự kỳ vọng khác thứ tự chèn, thứ tự bảng, thứ tự thời gian (cả NULL đứng đầu hay cuối) và thứ tự UUID thô, theo cả chiều tăng lẫn chiều giảm (đột biến 1–8). Ngoại lệ đã biết, không kiểm soát: đột biến sắp rubric chỉ theo `r.id` ngẫu nhiên lọt khoảng 1/6 số lần chạy (ID dòng không được chọn).

### 7.2 Review độc lập (QG2)

Người review: một agent riêng, chỉ đọc, không viết phần sửa. Phạm vi: HEAD `768013c` cộng phần sửa ở §7.1, các commit sau lần QG2 2026-11-21, tài liệu §1/§5–§7. Agent tự chạy `npm run build` (0), `npm test` (0, 338/338), suite tích hợp (0, 18/18). Lần kiểm tra lại trên `ac3ebc0`: R2, R4 và cách ghi R-L3b đạt; R3 còn hai điểm Low (ghi trong dòng R3), đã sửa ở `10ab852`. Lần kiểm tra lại trên `10ab852`: cách chọn ID (dừng chắc chắn, xác suất cố định), thứ tự rubric, việc dọn dữ liệu tạm và câu chữ đều đạt; còn một điểm Low: attempt tạm của sinh viên thứ ba chưa hoàn thành, nên đột biến `completed_at DESC` (NULL đứng đầu) có thể lọt. Đã sửa ở commit sau `10ab852` theo đề xuất của reviewer (đột biến 6–8). Phần sửa cuối chỉ được chính người sửa kiểm bằng đột biến, chưa được reviewer kiểm lại.

Kết luận: phần sửa L3 đúng.
- Không cột nào là mốc thời gian.
- `duration_seconds` tính đúng.
- Khóa sắp xếp là duy nhất (ràng buộc UNIQUE trong DB), nên không rơi về thứ tự chèn.
- ID là UUID v4, không mang thông tin thời gian.
- Sắp theo mã HMAC là đúng hướng.
- Không có SQL injection, quyền sở hữu không đổi, không có regression trong các commit sau QG2 2026-11-21.

| ID | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| R-L3b | Medium | Mục tiêu "không ghép được CSV với dashboard" chưa đạt hết. Hàng đợi nhận xét của giảng viên trả tên sinh viên, `attemptNumber`, toàn văn reflection và lập luận. Giảng viên có thể đếm số từ và ghép bộ (`case_id`, `attempt_number`, số từ lập luận, số từ phản tư, `outcome_node_id`/`choice_path`) với một dòng CSV. Mã ẩn danh ổn định, nên ghép được một dòng là lộ mọi dòng của sinh viên đó. Xuất hai lần rồi so sánh cũng lộ các dòng mới. Với CSV `rubrics`, API rubric đã trả `evaluatorName` cùng điểm | **Đã xử lý theo phương án B (PO 2026-11-26)**: bỏ `choice_path`, `outcome_node_id`; khái quát hóa `attempt_number` → `attempt_band`, `decision_count` → `decision_count_band`, số từ → `reasoning_word_band` / `reflection_word_band`, `duration_seconds` → `duration_band` (§7.3). Giảm ghép 1-1 trên tập thông thường, nhưng vẫn là pseudonymization (còn rủi ro ngoại lệ/nhóm nhỏ và sai phân giữa nhiều lần xuất do AC-R4 + AC-R5). |
| R2 | Medium | Bản ghi đánh QG2 PASS trước khi có review độc lập | Đã sửa: §1 ghi QG2 PASS WITH CONDITIONS, dẫn tới mục này |
| R3 | Low | Test thứ tự dòng phụ thuộc UUID ngẫu nhiên: đột biến "không sắp xếp" lọt khoảng 25% số lần chạy; với rubric, đột biến bị bắt nhờ kiểm tra header, không nhờ kiểm tra thứ tự. Lần kiểm tra lại trên `ac3ebc0`: đột biến sắp giảm dần (`created_at DESC`, `evaluator_id DESC`, `student_id` giảm dần) vẫn lọt; vòng chọn `admin2` có đuôi dài (mô phỏng 20.000 lần: trung bình 361 lần thử, tối đa khoảng 1,36 triệu) | Đã sửa trong hai lần: chọn ID có chủ đích, so với dãy kỳ vọng cụ thể; sau đó dùng bộ ba theo thứ tự mã, xác suất cố định, có giới hạn số lần thử, thêm sinh viên và phiếu thứ ba. Đột biến 1–5 ở §7.1 fail ở mọi lần chạy |
| R4 | Low | Truy vấn bài nộp vẫn SELECT `s.submitted_at` (không xuất ra nhưng dễ bị thêm lại) | Đã sửa: bỏ khỏi SELECT |
| R5 | Low, ngoài phạm vi | `completed_at` được ghi khi tới node kết thúc, trước phần phản tư, nên `duration_seconds` là "bắt đầu → node kết thúc". Giảng viên không đọc được `started_at` qua API (`GET /branching-attempts/:id` trả 403 cho người không sở hữu) | Ghi nhận, không sửa |

### 7.3 Triển khai R-L3b phương án B (2026-11-26)

#### Thiết kế khái quát hóa CSV (`activity`)
Giữ nguyên AC-R4 (quyền export cho giảng viên theo khóa/case sở hữu và ADMIN toàn hệ thống), AC-R5 (pseudonym `P-` + 12 hex HMAC ổn định giữa các lần xuất) và L3 Option C (không mốc thời gian tuyệt đối, `rubrics` giữ nguyên không chứa dữ liệu sinh viên). Các cột trong `ACTIVITY_COLUMNS` được điều chỉnh như sau:

| Cột cũ | Cột mới | Xử lý & lý do |
|---|---|---|
| `choice_path`, `outcome_node_id` | *(bỏ)* | Khớp 1-1 trực tiếp với `steps[].selectedOptionText` và `outcomeSituation` trên hàng đợi nhận xét (`LecturerFeedbackService.getQueue`). Phân phối lựa chọn và kết quả tổng hợp đã có sẵn tại `GET /cases/:caseId/statistics`. |
| `attempt_number` | `attempt_band` (`"1"` \| `"2+"`) | Xóa dấu vân tay ở các số attempt hiếm (`3, 4, ...`) hiển thị trên hàng đợi và dashboard, vẫn giữ phân biệt lượt đầu vs thử lại. |
| `decision_count` | `decision_count_band` (`"0"` \| `"1-2"` \| `"3+"`) | Làm mờ độ sâu cây quyết định (`stepsCount` trên hàng đợi), tách rõ Review Study (`0`), nhánh ngắn (`1-2`) và nhánh sâu (`3+`). |
| `reasoning_word_count`, `reflection_word_count` | `reasoning_word_band`, `reflection_word_band` (`"0"`, `"1-25"`, `"26-75"`, `"76-150"`, `"151+"`) | Hàng đợi trả toàn văn để đếm chính xác; dải 5 bậc gộp nhiều sinh viên vào cùng nhóm nhưng vẫn giữ thứ bậc độ dài cho phân tích nghiên cứu. |
| `duration_seconds` | `duration_band` (`""`, `"0-59s"`, `"1-5m"`, `"5-15m"`, `"15-30m"`, `"30m+"`) | Giữ nguyên quy tắc trống khi chưa hoàn thành và với Review Study; làm thô thời lượng theo `FLOOR(EXTRACT(EPOCH ...))`. |
| `challenge_rounds` | `challenge_rounds` (`0` \| `1` \| `2`, giữ nguyên) | Giảng viên không xem được số vòng Challenge Support trên hàng đợi, dashboard hay statistics (`ChallengeSupportController` chỉ mở cho `STUDENT`), nên không làm tăng rủi ro ghép hàng đợi và giữ nguyên mục tiêu FR-EVAL-04. |
| `participant_code`, `course_code`, `case_id`, `learning_mode`, `completed` | *(giữ nguyên)* | Cần cho phân tích so sánh case AI vs giảng viên và ổn định pseudonym theo AC-R4/AC-R5. |

Thứ tự sắp xếp `activity` dùng `compareRows([2, 0, 4, 5, 6, 7, 8, 9, 10])` (toàn bộ các cột đã xuất), không dùng thời gian hay ID thật kể cả khi một sinh viên có nhiều dòng `"2+"`.

#### Khắc phục theo review độc lập & Bằng chứng kiểm thử cục bộ
Sau vòng review độc lập đầu tiên (chỉ-đọc, conversation `040ec391`), đã sửa thêm:
1. `evaluation.service.ts` (`WORDS`): đổi `btrim(${col})` sang `regexp_replace(COALESCE(${col}, ''), '^\s+|\s+$', '', 'g')` để cắt đồng nhất `\n`, `\r`, `\t` và chuỗi chỉ có khoảng trắng như `wordCount` phía JS; dùng `FLOOR(EXTRACT(EPOCH ...))::integer`.
2. `research-export.ts`: bảo vệ `!Number.isFinite(...)` cho `attemptBand`, `decisionCountBand`, `wordCountBand`.
3. `research-export.spec.ts` & `mvp-completion.integration.e2e-spec.ts`: bổ sung test `\t`/`\r`/`NaN`; sửa fixture học sinh retry 3 lần (`attNo` `2` và `3` đầy đủ); bổ sung bộ test `REVIEW_STUDY` 6 sinh viên (gồm text nhiều dòng / chỉ khoảng trắng) và kiểm tra giao nhiều case trong cùng khóa học.

Môi trường chạy lại sau lần sửa code cuối: Windows, Docker `edubranch_postgres` (PostgreSQL 16 + pgvector, DB test `edubranch_spec007_it`), tắt Postgres sau khi chạy xong:

| Lệnh (thư mục `backend/`) | Exit | Kết quả |
|---|---|---|
| `npm run build` | `0` | Biên dịch sạch |
| `npm test -- --runInBand` | `0` | 37 suite, `339/339` PASS (bao gồm các test mới của `research-export.spec.ts`) |
| `npx jest --config test/jest-e2e.json test/mvp-completion.integration.e2e-spec.ts --runInBand` (chạy 2 lần liên tiếp) | `0`, `0` | `19/19` PASS mỗi lần (có `R-L3b option B` trên `LecturerFeedbackService.getQueue` + `EvaluationService.exportCsv`) |
| `npx jest --config test/jest-e2e.json test/mvp-completion.e2e-spec.ts --runInBand` | `0` | `124/124` PASS |
| `npm run test:matrix` | `0` | `24/24` PASS |
| `npm run test:regression` | `0` | `32/32` PASS |

*Kết quả re-review độc lập (`040ec391`, 2026-11-26)*: `PASS WITH CONDITIONS` — xác nhận cả 4 hạng mục khắc phục đều đạt (không còn lỗi code, test hoặc tài liệu); điều kiện còn lại gồm 5 giới hạn ghép ngược cố hữu dưới AC-R4 + AC-R5 (chủ: PO) và việc chạy lại QG5 trên CI sau khi PO cho phép commit/push (chứng cứ test cục bộ do phiên chính thực thi và đối soát log).

*Lưu ý*: Các thay đổi hiện nằm trong working tree cục bộ của nhánh `feature/mvp-completion-backend` (chưa commit/push theo giới hạn PO), nên QG5 (CI GitHub) sẽ cần chạy lại sau khi PO duyệt và cho phép commit/push.

#### Giới hạn và rủi ro còn lại (pseudonymization + giảm liên kết, không phải ẩn danh tuyệt đối)
1. **Đa dòng trên sinh viên có nhiều lượt thử**: vì AC-R4 xuất mỗi attempt một dòng, đếm số dòng theo `(case_id, participant_code)` vẫn suy ra được tổng số lần thử (`1` + số dòng `"2+"`), có thể phân biệt sinh viên thử lại `3` lần với sinh viên thử `2` lần.
2. **Độ phân giải thấp ở `REVIEW_STUDY` và ngoại lệ (`k = 1`)**: mỗi dòng `REVIEW_STUDY` chỉ có 2 dải phân biệt (`reasoning_word_band`, `reflection_word_band`), và hàng đợi cho thấy `reflectionStatus = NOT_STARTED` tương ứng `"0"`. Sinh viên có bài rất dài (`151+`) hoặc cây dài đơn lẻ (`3+`) vẫn khớp `1-1`.
3. **Giao nhiều case cùng khóa**: vì `participant_code` ổn định theo AC-R5, đối chiếu sự có mặt của sinh viên giữa nhiều case (`kCohort` ∩ `kReviewCohort`) thu hẹp tập ứng viên.
4. **Sai phân qua nhiều lần xuất (`T₁` vs `T₂`)**: xuất CSV trước và sau khi có sinh viên mới hoàn thành trên dashboard/hàng đợi vẫn cô lập được dòng mới phát sinh; đây là hệ quả cố hữu khi đồng thời giữ AC-R4 (giảng viên tự xuất) và AC-R5 (pseudonym ổn định).
5. **Độ trễ / lộ thêm trường sau khi ghép được 1 dòng**: nếu một dòng bị ghép đúng danh tính, `participant_code` sẽ liên kết được cả các attempt chưa hoàn thành (`completed = "false"`) và `challenge_rounds` vốn giảng viên không thấy trên hàng đợi. Với `rubrics` CSV, `GET /evaluation/rubrics` đã trả `evaluatorName` kèm 3 điểm cho giảng viên sở hữu khóa và ADMIN.
6. **Ghi nhận ngoài phạm vi thay đổi**: nếu về sau muốn triệt tiêu rủi ro giảng viên ghép với hàng đợi mà vẫn giữ AC-R5, hướng phù hợp là giới hạn quyền xuất `activity` về `ADMIN` (vốn không xem được hàng đợi nhận xét/lập luận theo B-6) hoặc áp dụng ngưỡng ẩn nhóm nhỏ (`k`-anonymity suppression) — hiện chưa thực hiện để giữ nguyên quyền AC-R4 đã duyệt.
