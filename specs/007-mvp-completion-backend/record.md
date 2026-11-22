# Record — spec 007

## 1. Trạng thái gate
| Gate | Trạng thái | Ghi chú |
|---|---|---|
| G0 | PASS | PO chat 2026-11-21 (§2) |
| G1–G7 | PASS | PO duyệt gộp 2026-11-21 (§2) |
| QG1 | PASS (cục bộ) | §4 |
| QG2 | PASS WITH CONDITIONS | §5; điều kiện: L3 chờ PO |
| QG3 | Không áp dụng | Không đổi UI |
| QG4 | PASS | Không đổi chuỗi i18n; không có secret trong diff (§4) |
| QG5–QG7 | Chưa chạy | Cần push; phiên này không có quyền ghi GitHub |

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
| L3 | Low | Giảng viên có thể ghép CSV (thời điểm tới mili-giây, case, số attempt) với dashboard để nối mã ẩn danh với tên. Người chỉ có CSV thì không làm được | **Chờ PO** (§6). AC-R5 vẫn đạt như đã viết |
| L4 | Low | Thân lỗi 409 thiếu `statusCode`/`error` | Đã sửa: thân lỗi có `{statusCode, error, message, code}`. Có unit test |

Ghi nhận thêm, không sửa:
- `/admin/logs` tìm theo mã sự kiện, không theo tiêu đề đã dịch. FE dịch mã, nên tìm theo tiêu đề tiếng Việt cần FE gửi mã tương ứng.
- `LOGIN_FAILED`/`BAD_PASSWORD` ghi tài khoản bị nhắm tới vào `actor_id`.
- `caseGrowthThisMonth` đếm case được tạo trong tháng và hiện đang PUBLISHED.
- Login bỏ qua bcrypt với email không tồn tại, nên có thể đoán email qua thời gian phản hồi. Lỗi này có từ trước, ngoài phạm vi.

## 6. Việc còn mở cho PO
- **L3 — mức thời gian trong CSV nghiên cứu.**
  - (A) Giữ nguyên như hiện tại.
  - (B) Làm tròn mốc thời gian tới ngày, kèm cột thời lượng (giây).
  - (C) Chỉ xuất thời lượng, không xuất mốc thời gian.
  Chưa chọn phương án tạm.
