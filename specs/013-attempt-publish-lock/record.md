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
| QG5–QG7 | Chờ | CI trên PR, lệnh merge của PO, rồi kiểm tra lại trên `develop`. |

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
- **Tài liệu:** ledger quyết định PO (§0.A, PSD-10, PSD-11), `FEATURE-BRANCHING-ATTEMPT.md`, `FEATURE-BRANCHING-STUDY.md`, `DECISION-TREE-MODEL.md`, `.agents/rules/feature-case-review.md`, `UX-SCREEN-NOTES.md`, `PROJECT_OVERVIEW.md`.

## 3. QG1 — lệnh Claude tự chạy (2026-11-27, Windows, PostgreSQL 16 trong Docker, chỉ DB tạm)
| Lệnh | Exit | Kết quả |
|---|---|---|
| `npm run build` | 0 | `dist/main.js` |
| `npm test` | 0 | 421/421 (trước: 410; thêm 11) |
| `npm run test:e2e` (DB tạm) | 0 | 342 pass, 43 skip (suite live cần AI service) |
| `npm run test:matrix` / `test:regression` | 0 / 0 | 26/26, 44/44 |
| Suite D5 mới | 0 | 5/5. Race 25 lần: attempt thắng 23, về `DRAFT` thắng 2, không lần nào có case `DRAFT` kèm attempt |
| Suite D5 trên code cũ | 1 | 4/5 FAIL như mong đợi. Test còn lại là "case chưa có attempt vẫn về được `DRAFT`", vốn đúng ở cả hai phiên bản |

## 4. QG2 — review độc lập
(điền sau review)

## 5. Câu hỏi cho PO (không chặn spec này)
- Case Review Study đã có bài nộp: có khóa `PUBLISHED → DRAFT` tương tự attempt không? Quyết định D5 chỉ nói về attempt, nên spec này không áp dụng cho bài nộp Review Study.
