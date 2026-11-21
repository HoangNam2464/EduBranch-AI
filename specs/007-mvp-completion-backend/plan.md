# Implementation Plan — spec 007

## Constitution check
- Không thêm công nghệ hay dependency mới (B-3). HMAC dùng `crypto` có sẵn của Node; CSV tự sinh, không dùng thư viện. Vì vậy không cần ADR.
- Các ranh giới đều giữ nguyên:
  - Browser → Gateway → AI service: Gateway chỉ gọi `GET /health` công khai của AI service.
  - INV-01;
  - không chấm điểm sinh viên;
  - không lộ PII trong dữ liệu xuất.

## Cấu trúc
| Phần | Tệp | Ghi chú |
|---|---|---|
| Migration | `backend/migrations/V6__…`, `V7__…`, `V8__…` | data-model.md |
| BE-031 | `modules/user/{user.controller,user.service}.ts`, `modules/user/dto/update-profile.dto.ts` | |
| BE-030 | `modules/course/lecturer-dashboard.{controller,service}.ts`, đăng ký trong `course.module.ts` | route `lecturer/dashboard` |
| BE-032 | `modules/admin/{admin.module,admin.controller,admin.service}.ts`, `modules/admin/dto/*.ts`, `common/audit/{audit.module,audit.service}.ts` (global) | |
| BE-032, phần chạm module khác | `auth.service.ts` (kiểm `is_active`, ghi LOGIN_*); `case.service.ts` (ghi CASE_GENERATED/FAILED kèm thời lượng, CASE_STATUS_CHANGED); `material.service.ts` (ghi MATERIAL_UPLOADED) | chỉ thêm, không đổi phản hồi (B-1) |
| BE-033 | `modules/evaluation/{evaluation.module,evaluation.controller,evaluation.service,csv}.ts`, `modules/evaluation/dto/*.ts` | |
| AI service | `ai-service/app/main.py` `/health` thêm `model`; test `tests/test_health*.py` | |

## Quyết định kỹ thuật
1. **Nhật ký không chặn thao tác chính**: `AuditService.record()` bắt mọi lỗi và chỉ ghi `Logger.warn`. Thao tác chính (đăng nhập, sinh case…) không bao giờ thất bại vì không ghi được nhật ký.
2. **Khóa tài khoản**: `login` thêm `is_active` vào câu SELECT. Tài khoản khóa ném cùng `UnauthorizedException("Invalid email or password")`, để không lộ trạng thái khóa. `validateToken` cũng kiểm `is_active = TRUE`, vì vậy token cũ bị từ chối ngay mà không cần danh sách thu hồi.
3. **Admin cuối cùng**: kiểm tra trong transaction có `SELECT … FOR UPDATE` trên các dòng admin đang hoạt động, tránh hai request đồng thời khóa hết admin.
4. **Đếm không nhân đôi**: mỗi số đếm trong dashboard và overview dùng subquery hoặc `COUNT(DISTINCT)` riêng, không JOIN nhiều bảng con rồi đếm.
5. **Mã ẩn danh**: `P-` + 12 ký tự hex đầu của `HMAC_SHA256(HMAC_SHA256(JWT_SECRET, "edubranch-research-export-v1"), userId)`.
   - Mã ổn định giữa các lần xuất và không đảo ngược được nếu không có secret.
   - Đổi `JWT_SECRET` thì mã đổi theo; điều này được ghi vào record như một giới hạn đã biết.
6. **CSV**: RFC 4180, có dấu ngoặc kép khi cần; BOM `﻿`; ô bắt đầu bằng `= + - @ \t \r` được thêm tiền tố `'`. Dữ liệu xuất chỉ có số từ, không có văn bản tự do.
7. **AI service health**: gọi bằng `fetch` (Node 20), timeout 2 giây qua `AbortController`. Gọi lỗi → `DOWN`, provider/model `null`.
8. **Thời lượng sinh case**: đo quanh lời gọi `aiClient.generateCase`, ghi vào `meta.durationMs`.

## Kiểm thử
- **Unit** (`src/**/*.spec.ts`): service với DB giả lập cho từng nhánh lỗi; tiện ích CSV (thoát ký tự, chống chèn công thức, BOM); mã ẩn danh ổn định và khác nhau theo người dùng; `AuditService` nuốt lỗi.
- **E2E HTTP** (`test/mvp-completion.e2e-spec.ts`, chạy trong CI): role-matrix 401/403 cho mọi route mới; validation 400 (trường lạ, giá trị ngoài miền, UUID sai); ánh xạ lỗi 404/409.
- **Tích hợp DB thật** (`test/mvp-completion.integration.e2e-spec.ts`): chạy migration V1–V8 trên Postgres thật, tạo bộ dữ liệu xác định, rồi kiểm tra:
  - phép đếm dashboard/overview, gồm trường hợp có nhiều attempt và nhiều nhận xét;
  - ownership: giảng viên B không thấy dữ liệu của A;
  - khóa/mở khóa và token cũ;
  - admin cuối cùng;
  - CSV không chứa tên, email hay UUID người dùng.
  Suite tự bỏ qua khi không có Postgres, theo mẫu `migration.integration.e2e-spec.ts`. CI hiện không có service Postgres (`.github/workflows/backend-ci.yml`), nên bằng chứng chạy DB thật là bằng chứng chạy cục bộ. Thêm Postgres vào CI cần lệnh riêng của PO.
- **Hồi quy**: `npm test`, `npm run test:e2e`, `test:matrix`, `test:regression`; AI service `pytest tests/test_health*`.
