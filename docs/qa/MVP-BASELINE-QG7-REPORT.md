# MVP Baseline — QG7 trên `develop` `cf3a6a5`

> - **Document Class**: `[HISTORICAL SNAPSHOT]`. Bằng chứng tại một thời điểm (2026-11-27). Trạng thái task hiện hành xem Jira `EBA`; quyết định PO xem [`PRODUCT_OWNER_SCOPE_DECISIONS.md`](../mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md).
> - **Baseline code**: `develop` `cf3a6a5cc36d07fdfc55313129d13117cef1c816` (merge PR #91, 2026-11-27). QG7 chạy trên commit này.
> - **`develop` hiện tại**: `12c01f5` (merge PR #93, chỉ sửa tài liệu). `git diff --name-only cf3a6a5 12c01f5` không có file nào ngoài `docs/` và `specs/`, nên kết quả QG7 vẫn đúng cho code trên `develop`.
> - **Kết luận**: giai đoạn hoàn thiện MVP khép lại với QG7 **PASS** trên `cf3a6a5`, cùng các ngoại lệ có tên ở §4 và các quyết định PO còn mở ở §5.

## 1. Các PR của giai đoạn hoàn thiện MVP

| PR | Nội dung | Merge vào `develop` | Jira |
|---|---|---|---|
| #87 | Đồng bộ rule evaluation và hồ sơ QG7 của PR #77, #80 | `aa5e408` | — (tài liệu) |
| #88 | Kiểm soát quyền đọc case/khóa học H1–H3, hardening attempt (spec 011); thay PR #59 | `c94c954` | EBA-112 (Done) |
| #89 | FE-029 màn Rubric 07.8 / 10.8 tích hợp BE-033 (spec 012); thay PR #74 | `150a9f7` | EBA-93 (Sprint 4, In Progress) |
| #90 | Backend build ra `dist/main.js` (`start:prod`, Docker); checksum migration chấp nhận CRLF/LF | `26c52d7` | EBA-107 (Done) |
| #91 | Backend không còn sập khi PostgreSQL ngắt kết nối; lỗi UI 03.1 / 10.6 / 10.9; bộ lọc nhóm và nhãn sự kiện 10.9; footer; EN "1 node" | `cf3a6a5` | EBA-108, EBA-109 (Done); EBA-110 (Sprint 4, In Progress) |
| #92 | Sửa test F-07 (`<sources>` boundary) theo contract hiện tại | `19a1a2b` | EBA-111 (Done) |
| #93 | Ghi baseline MVP, quyết định PO 26–27/11 và D5 (chỉ tài liệu) | `12c01f5` | — (tài liệu) |

PR #59 và #74 đã đóng, mỗi PR kèm comment dẫn tới PR thay thế; commit của các thành viên vẫn được giữ. Mọi lần admin-merge đều theo lệnh trực tiếp của PO cho từng PR (policy 02 §7) và khóa đúng HEAD đã review bằng `--match-head-commit` (thể hiện trong log lệnh merge, GitHub không lưu tham số này). Comment ghi nhận QG5–QG6 có trên PR #88, #91, #92 (cùng #87). PR #89 có comment QG5 và comment bằng chứng review, nhưng không có comment QG6. PR #90 không có comment nào. Lệnh merge của PO cho #89 và #90 nằm trong chat ngày 2026-11-26.

## 2. QG7 trên `cf3a6a5`

Chạy ngày 2026-11-27 trên bản clone sạch từ GitHub (Windows, Node 20, Python 3.12, PostgreSQL 16 + pgvector trong Docker). Chỉ dùng DB tạm, đã xóa sau khi chạy. DB dev `edubranch_ai` không đổi (98 user, 26 case, migration V8).

| Tầng | Lệnh | Exit | Kết quả |
|---|---|---|---|
| backend | `npm ci && npm run build` | 0 | `dist/main.js` |
| backend | `npm test` | 0 | 410/410 |
| backend | `npm run test:e2e` (DB tạm) | 0 | 337 pass, 43 skip (suite live cần AI service hoặc API key) |
| backend | `npm run test:matrix` / `test:regression` | 0 / 0 | 26/26, 44/44 |
| backend | `npm run start:prod` + `pg_terminate_backend` | — | Khởi động được; process vẫn sống sau khi bị cắt kết nối; `/health` 200; login có truy vấn DB vẫn trả 401 |
| backend | `node dist/main.js` trên bản sao DB dev | — | Khởi động được; V1/V2 chỉ cảnh báo khác ký tự xuống dòng (CRLF/LF), nội dung không đổi |
| docker | `docker build ./backend` + `docker run` | 0 | 0 lỗi; MinIO bucket xác minh được; health 200 |
| frontend | `npm ci && npm run lint && npm test && npm run build` | 0 / 0 / 0 | lint 0 lỗi; 321/321; build OK |
| ai-service | `pytest -q` | 0 | 165 passed, 1 xfailed (QA-005, xem §4) |
| l10n | `node scripts/l10n-approval-check.mjs` | 1 | 1326 lỗi là nợ đăng ký cũ; 0 lỗi ở các key đã sửa trong giai đoạn này (xem §4) |
| trình duyệt | Playwright (Chrome), 1024 / 1280 / 1440 / 1920 × VI / EN, dữ liệu seed thật | — | 84/84 cho 03.1, 10.6, 10.9 (tổng của từng bộ lọc khớp số đếm trong DB), footer ứng dụng, EN "1 node" |
| CI trên `develop` | GitHub Actions | — | Backend CI và Frontend CI success tại `cf3a6a5`; AI Service CI success tại `19a1a2b` |

## 3. Quyết định PO áp dụng trong giai đoạn này
Ghi đầy đủ trong `PRODUCT_OWNER_SCOPE_DECISIONS.md` §0.A:
- D3a–D3d (luồng Rubric);
- D6 (không thêm giới hạn độ dài khi không có nguồn);
- D7 (ghi nhận bằng task corrective, không mở lại BE-016…BE-023);
- bộ lọc 10.9;
- ẩn cột "Mã" dưới 1280 trên 10.9;
- KPI "Lượt đăng nhập" chỉ đếm `LOGIN_SUCCEEDED`;
- chấp nhận N1.

## 4. Ngoại lệ còn lại trên baseline (đã vào backlog Jira, không sửa trong giai đoạn này)

| Jira | Mức | Nội dung |
|---|---|---|
| EBA-113 | High, **BLOCKED** (Jira: To Do, label `blocked-on-d5`) | INV-01 cho attempt đã tồn tại khi case rời `PUBLISHED`. Chờ PO chốt D5 (§5). |
| EBA-116 | Medium (lỗi đã biết) | QA-005: re-ingest thất bại giữa chừng để lại chunk cũ vẫn truy xuất được. Đang là test `xfail` strict. |
| EBA-117 | Low (lỗi đã biết) | `findTreeViolation` từ chối cạnh `null`, trong khi hợp đồng AI cho phép terminal path. |
| EBA-114 | Low, PO chấp nhận | 10.9: ô thời gian xuống 2 dòng ở 1024 (N1); tìm kiếm theo mã sự kiện, không theo nhãn; danh sách loại sự kiện ở frontend là bản sao của backend. |
| EBA-115 | Low | Migration runner lúc khởi động mượn client trực tiếp, chưa có listener mất kết nối. |
| EBA-118 | Low | Nợ đăng ký l10n (1326 key EN); copy EN còn ở trạng thái `PROPOSED`, chờ PO duyệt. |
| EBA-119 | Low | Helper `itDb` cho test DB thật "pass" khi CI không có PostgreSQL. CI xanh không chứng minh test tích hợp DB đã chạy. |

Chưa có trên `develop`, nằm ngoài các ngoại lệ trên:
- Google/Microsoft sign-in (BE-034, EBA-101, In Progress);
- API đặt lại mật khẩu và TTL cho `rememberMe` (rule B4);
- module Notification (chỉ là khung, Phase 2).

## 5. Quyết định PO còn mở liên quan trực tiếp tới baseline
- **D5** (mới, 2026-11-26): attempt khi case rời `PUBLISHED`. Đi cùng **OPD-003** (tiếp tục hay hủy lượt làm dở) và **OPD-007** (sửa hoặc phiên bản hóa case sau khi xuất bản). Tóm tắt và các lựa chọn: `PRODUCT_OWNER_SCOPE_DECISIONS.md` §0.B và PSD-11.
- Các mục `OPEN` khác giữ nguyên trong §0.B của ledger.

## 6. Tái lập
Clone `develop`, sao chép các file `.env.example`, rồi `docker compose up -d`. Sau đó chạy các lệnh ở §2 theo `CLAUDE.md` (Commands). Test e2e phải trỏ `POSTGRES_DB` tới một DB tạm, không dùng DB dev. Lý do: `backend/test/migration.integration.e2e-spec.ts` chạy migration và thử sửa checksum trên `POSTGRES_DB`, mà giá trị mặc định là `edubranch_ai`.
