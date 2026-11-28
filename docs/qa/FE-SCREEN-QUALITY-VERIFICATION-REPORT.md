# FE Screen Quality & Materials Flows Verification Report (2026-11-28)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Bằng chứng kiểm chứng trên nhánh cục bộ `fix/fe-screen-quality`, chưa merge vào `develop` và chưa đóng Jira).
> - **Branch**: `fix/fe-screen-quality` (base `origin/develop` `59a9aa3`, code HEAD `174e69b`).
> - **Phạm vi (9 mã task FE)**: `FE-003` (`EBA-12` / Master `EBA-204`), `FE-004` (`EBA-15` / Master `EBA-205`), `FE-005` (`EBA-16` / Master `EBA-206`), `FE-019` (`EBA-63` / Master `EBA-414`), `FE-020` (`EBA-64` / Master `EBA-415`), `FE-022` (`EBA-66` / Master `EBA-417`), `FE-026` (`EBA-89`), `FE-031` (`EBA-95`), `FE-032` (`EBA-96`).
> - **Kho lưu bằng chứng thô (ngoài Git, đã loại `tokens.json`)**: `D:\CAPSTONE_2026\EduBranch-AI-evidence\2026-11-28\visual-qa\` (852 ảnh PNG, JSON `r3_*` / `r4_*`, log lint/test/build).

## 1. Bảng kết quả từng task (9 mã task FE)

| Task ID | Jira | Master | Trạng thái xác minh | Tóm tắt kết quả & bằng chứng |
|---|---|---|---|---|
| **FE-003** | `EBA-12` | `EBA-204` | **PASS** | Client check yêu cầu khớp cả extension lẫn MIME PDF/DOCX (`materialFileRules.ts` + 8 unit tests `materialFileRules.spec.ts`); `npm test` 335/335; kiểm tra trên trình duyệt (`b52a49c` & `174e69b`). |
| **FE-004** | `EBA-15` | `EBA-205` | **PASS** | Hiển thị ngày tải lên trên từng dòng; thêm bộ lọc trạng thái xử lý (`PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`) & loại tệp (`PDF`/`DOCX`) kèm trạng thái rỗng khi không khớp (`r4_mat.json`). |
| **FE-005** | `EBA-16` | `EBA-206` | **PASS** | Áp dụng PO Q3 (`specs/001`): nút trên dòng `FAILED` là `"Tải lên lại"` / `"Re-upload"`, dialog nêu tên tệp & cảnh báo tạo bản ghi mới (giữ bản lỗi cũ); toast upload/xóa hoạt động; nút xóa tiếp cận qua phím `Tab` (`r4_mat.json`). *(Ghi chú Low: focus outline nút `Button` đo tức thì sau `Tab` là `rgb(32,33,36)` do `transition-colors` chuyển tiếp sang `--color-focus`.)* |
| **FE-019** | `EBA-63` | `EBA-414` | **PASS** | Có bộ lọc chế độ học (`Branching Study` / `Review Study`); bảng hàng đợi vừa khung ở 1024/1280/1440/1920 (`innerScroll: 0`); dòng phụ `#attempt · date` hiển thị đầy đủ dưới 1440px (`r4_queue2.json`, `r4q_q_vi_1024.png`); nút gửi 1 dòng trong card (`r4_queue.json`). |
| **FE-020** | `EBA-64` | `EBA-415` | **PASS** | `StateCard.tsx` giãn theo nội dung (`min-w-[min(480px,100%)] max-w-full`), mô tả 403/404/500 nằm gọn trong panel (`over: 0` ở cả 4 độ rộng VI/EN, `r4_fe020.json`); email hỗ trợ hiển thị ở dòng lỗi inline; tiêu đề ngôi thứ hai `"của bạn"`; bỏ raw enum. |
| **FE-022** | `EBA-66` | `EBA-417` | **PASS** | Bỏ emoji ở select; sửa công thức % làm lại; lịch xếp dưới 1280px; 4 thẻ KPI 2×2 dưới 1920px giữ nhãn 1 dòng ở 1024–1920 (`r4_stats.json`); tiêu đề điểm quyết định (`h4`) không cắt ellipsis (`cut: False`); trạng thái 403/500/empty cho danh sách khóa học. |
| **FE-026** | `EBA-89` | — | **PASS** | Sửa 403 lần tải đầu `/lecturer/courses`; nhãn `PENDING`/`PROCESSING` ở Round 4 hết hồi quy tràn slot (`lines: 1`, `statusR === liR`, `probe9.js`); glyph loại tệp 12px; xóa bằng bàn phím qua `Tab`. |
| **FE-031** | `EBA-95` | — | **PASS** | Bỏ dữ liệu giả và fallback số 0 (`AdminDashboardPage.spec.ts`); `SystemHealthCard` dùng dữ liệu thật (`"—"` khi thiếu); dịch mã cảnh báo/nhật ký sang i18n; 403/404/500/501/502 đúng; bố cục dưới `xl` 1280px giúp chip/legend/nút lọc vừa 1 dòng ở 1024px (`r4_dash2.json`, `r4_dash.json`). |
| **FE-032** | `EBA-96` | — | **PASS** | Bảng `/admin/users` vừa khung 1024/1280/1440/1920 (`innerScroll: 0`), cột nút và pill 1 dòng (`r3_users.json` PASS ở Round 3 và xác nhận lại ở `r4_users.json` sau sửa `StateCard.tsx`). |

## 2. Kết quả Quality Gates (trên code SHA `174e69b`)

| Hạng mục | Kết quả | Chi tiết |
|---|---|---|
| **QG1 Lint** (`npm run lint`) | **PASS** | Exit 0 (28 cảnh báo `set-state-in-effect` / `only-export-components` có sẵn). |
| **QG1 Unit Tests** (`npm test`) | **PASS** | **335/335** tests pass across 58 files, 0 fail, 0 skip. |
| **QG1 Typecheck & Build** (`tsc -b`, `vite build`) | **PASS** | Exit 0. |
| **QG1 l10n (`l10n-approval-check.mjs`)** | **PASS WITH CONDITIONS** | 66/66 khóa `en.json` thêm/sửa trên `59a9aa3..174e69b` đã đăng ký `PROPOSED` trong `docs/l10n/shared-copy-review.md` (`missing: []`, `approved: []`). Chế độ `--release` (QG4) chưa thể pass cho tới khi PO duyệt `APPROVED` cho toàn bộ copy tiếng Anh. *(Ghi chú: `l10n-approval-check.test.mjs` pass 25/26 với lỗi có sẵn ở test #16 trên `develop`.)* |
| **QG3 Visual QA Round 4** | **PASS** (trong batch) | Đã đối chiếu DOM audit + ảnh chụp ở 1024/1280/1440/1920 × VI/EN cho toàn bộ màn trong phạm vi 9 task. |
| **Pixel Visual Diff (`npm run test:visual`)** | **NOT VERIFIED** | Bị lỗi/skip một phần ở Round 3 do DB seed thiếu fixture `Runbook_ung_cuu_su_co_DDoS.pdf` và màn hình đã điều chỉnh bố cục/nội dung theo quyết định sửa lỗi mới. |
| **Màn hình ngoài batch & dữ liệu thật Challenge Support** | **NOT VERIFIED / OUT OF BATCH** | Xem danh sách tách riêng tại [`OUT-OF-BATCH-RESPONSIVE-DEFECTS.md`](OUT-OF-BATCH-RESPONSIVE-DEFECTS.md). |
