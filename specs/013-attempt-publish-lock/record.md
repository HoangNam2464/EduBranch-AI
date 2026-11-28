# Record — spec 013 (khóa case đã có attempt, INV-01 cho attempt)

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. Nội dung tiếng Việt.
> **Created**: 2026-11-27. Nhánh `fix/attempt-publish-lock` tạo từ `develop` `a538afe`.
> **Người triển khai**: Claude. Antigravity headless bị từ chối quyền chạy lệnh (2026-11-26), và thay đổi nhỏ, gói gọn trong 2 service.
> **Người review**: Claude subagent độc lập, chỉ đọc (§4).

## 1. Trạng thái gate
| Gate | Trạng thái | Ghi chú |
|---|---|---|
| Ủy quyền | PASS | PO chốt D5, OPD-003, OPD-007 và yêu cầu triển khai INV-01 không có race, trong chat ngày 2026-11-27 (`spec.md`, nguồn). |
| QG1 | PASS (cục bộ) | Xem §3. |
| QG2 | Xem §4 | Review độc lập. |
| QG3 | Không áp dụng | Không đổi frontend. |
| QG4 | PASS | Không đổi chuỗi i18n; không có secret trong diff. |
| QG5–QG7 | PASS (PR #95) | Đã merge PR #95 vào `develop` (`373c8a4`, `2026-11-27`) trước baseline `59a9aa3`; riêng câu hỏi §5 về `REVIEW_STUDY` vẫn giữ mở chờ PO. |

## 2. Thay đổi
- **`backend/src/modules/case/case.service.ts` (`updateCaseStatus`):** phần ghi trạng thái chạy trong một transaction:
  1. `SELECT status … FOR UPDATE` trên hàng case, rồi kiểm tra lại trạng thái (đổi trong lúc chờ khóa → 409);
  2. nếu là `PUBLISHED → DRAFT` thì đếm `branching_attempts`; có attempt → 409;
  3. `UPDATE`, `COMMIT`; audit ghi sau khi commit.
- **`backend/src/modules/branching-attempt/branching-attempt.service.ts`:**
  - `getAttempt` đọc thêm `case_status`; sinh viên nhận 403 nếu case không `PUBLISHED` (sau bước kiểm tra quyền sở hữu; không áp dụng cho giảng viên).
  - `chooseOption`, `saveRetrospectiveReasoning`, `submitReflection`: sau khi khóa attempt và kiểm tra quyền sở hữu, đọc case `FOR SHARE`; nếu không `PUBLISHED` thì 403 và ROLLBACK.
  - `getAttemptsByCase`: `JOIN cases` và `c.status = 'PUBLISHED'`.
- **Thứ tự khóa:**
  - `startAttempt` và `updateCaseStatus` cùng lấy `FOR UPDATE` trên hàng case;
  - các đường attempt lấy `FOR UPDATE` trên attempt, rồi `FOR SHARE` trên case;
  - `updateCaseStatus` không khóa attempt, nên không có vòng chờ (deadlock).
- **Test:**
  - Unit: `case.service.spec.ts` (4 test mới), `branching-attempt.service.spec.ts` (7 test mới), cập nhật fixture cho các truy vấn mới (không bỏ assertion nào); `case.service.audit.spec.ts`: thêm client transaction cho mock.
  - Tích hợp: `test/attempt-publish-lock.integration.e2e-spec.ts` (5 test, PostgreSQL thật, DB riêng `edubranch_publish_lock_it`), gồm phép thử race chạy song song 25 lần.
- **`backend/src/modules/challenge-support/challenge-support.service.ts`** (theo QG2 #1): 4 truy vấn `JOIN cases`; sau bước kiểm tra quyền sở hữu, case không `PUBLISHED` trả 403 trước khi gọi AI hoặc ghi DB. Thêm 4 unit test và 1 kiểm tra với DB thật.
- **Tài liệu:** ledger quyết định PO (§0.A, PSD-10, PSD-11), `FEATURE-BRANCHING-ATTEMPT.md`, `FEATURE-BRANCHING-STUDY.md`, `DECISION-TREE-MODEL.md`, `.agents/rules/feature-case-review.md`, `UX-SCREEN-NOTES.md`, `PROJECT_OVERVIEW.md`.

## 3. QG1 — lệnh Claude tự chạy (2026-11-27, Windows, PostgreSQL 16 trong Docker, chỉ DB tạm)
| Lệnh | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | `dist/main.js` |
| `npm test` | 0 | 425/425 sau QG2 (trước: 410; thêm 15, gồm 4 test Challenge Support) |
| `npm run test:e2e` (DB tạm) | 0 | 342 pass, 43 skip (suite live cần AI service) |
| `npm run test:matrix` / `test:regression` | 0 / 0 | 26/26, 44/44 |
| Suite D5 mới | 0 | 5/5 (sau QG2 có thêm Challenge Support). Race 25 lần: lần 1 attempt thắng 23 / về `DRAFT` thắng 2; lần 2 là 22 / 3. Không lần nào có case `DRAFT` kèm attempt |
| Suite D5 trên code cũ | 1 | 4/5 FAIL như mong đợi. Test còn lại là "case chưa có attempt vẫn về được `DRAFT`", vốn đúng ở cả hai phiên bản |

## 4. QG2 — review độc lập
Reviewer là Claude subagent chỉ đọc, review commit `c4ddf03`.
- **Kết luận:** AC-1, AC-2, AC-3, AC-5, AC-7 PASS; AC-4 và AC-6 PASS WITH CONDITIONS.
- **Kiểm tra lớp khóa:** reviewer tự chạy phép thử đột biến trên DB tạm riêng. Bỏ `FOR UPDATE` trong `updateCaseStatus` thì 20/25 lần ra case `DRAFT` kèm attempt; giữ khóa thì 0/25. Lớp khóa đúng là thứ ngăn race.
- **Đường ghi:** `cases.status` chỉ được ghi ở `case.service.ts`, attempt chỉ được tạo ở `startAttempt`; không có đường nào bỏ qua khóa.
- **Deadlock:** không có (attempt → case; phía case không khóa attempt).
- **Test cũ:** không có assertion nào bị bỏ hay nới lỏng.

| # | Mức | Phát hiện | Xử lý |
|---|---|---|---|
| 1 | Medium | Challenge Support đọc nội dung case qua attempt mà không kiểm tra `PUBLISHED` | **Đã sửa** (§2): 403 trước khi gọi AI; unit 24/24, có kiểm tra với DB thật |
| 2 | Medium | OPD-003 bị đánh dấu đã chốt mà không có nguồn | **Không phải lỗi:** PO viết rõ tiêu đề "D5 / OPD-003:" trong chat ngày 2026-11-27. Đã trích dẫn nguyên văn trong `spec.md` |
| 3 | Low | `itDb` cho "pass" khi không có PostgreSQL | Giữ quy ước hiện có của các suite DB thật; đã có backlog EBA-119. Bằng chứng chạy thật nằm ở §3 |
| 4 | Low | Suite tạo/xóa DB qua `edubranch_ai` khi thiếu `POSTGRES_DB` | **Đã sửa:** suite mới dùng DB quản trị `postgres` |
| 5 | Low | Các kiểm tra trước khi xuất bản đọc dữ liệu chưa khóa; trạng thái đổi A→B→A trong lúc chạy thì không bị phát hiện | Ghi nhận; thực tế gần như không xảy ra. Không mở rộng phạm vi |
| 6 | Low | `FOR SHARE` làm các bước của sinh viên chờ `startAttempt` trên cùng case | Chấp nhận: thời gian giữ khóa ngắn, và cần cho tính đúng với dữ liệu cũ |
| 7 | Low | Case cũ đã rời `PUBLISHED` kèm attempt vẫn sửa rồi xuất bản lại được (OPD-007) | Ngoài phạm vi: versioning để Post-MVP theo quyết định PO |

**Sự cố trong lúc review:** reviewer chạy nhầm toàn bộ suite e2e mà không đặt `POSTGRES_DB`.
- `migration.integration` đã chạy trên DB dev `edubranch_ai`. Test này tự khôi phục checksum ở `finally`.
- Claude kiểm tra lại DB dev, chỉ đọc: `schema_migrations` giống hệt bản ghi ngày 2026-11-26 (V1–V8, cùng checksum, `max(applied_at)` vẫn là 2026-11-25); vẫn 98 user, 26 case, 44 khóa học. Không mất dữ liệu.
- `edubranch_spec007_it` là DB riêng của suite đó, bị tạo lại; không phải dữ liệu thật.

## 5. Câu hỏi cho PO (không chặn spec này)
- Case Review Study đã có bài nộp: có khóa `PUBLISHED → DRAFT` tương tự attempt không? Quyết định D5 chỉ nói về attempt, nên spec này không áp dụng cho bài nộp Review Study.
