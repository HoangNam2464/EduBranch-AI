# Feature Record: 008-ui-foundations [FE-025]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-22.

## 1. Discover
- Workspace: worktree `D:\CAPSTONE_2026\EduBranch-AI-ui`, nhánh `fix/ui-foundations`, tạo từ `origin/develop` `7725b85`.
- Nguồn đã đọc: R01 §0, §2, §5; `docs/design/DESIGN-DIRECTION.md` §3 bước 1; `docs/design/audit/UI-AUDIT.md` X7.
- Code: kết quả `git grep -i "theme|dark"` trong `frontend/src` và `frontend/tests` (liệt kê trong `spec.md` §1); kiểm tra class `.btn-primary`/`.btn-secondary`/`.card`: 0 file dùng.

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-22 | PO: "theo đề xuất đi, vì dự án tôi k còn nhiều thời gian, cần sản phẩm chất lượng và tiếp cận được người dùng" và, cho các bước tiếp theo, "bạn làm luôn giúp tôi" |
| G1–G6 | 2026-11-23 | PO (gộp) chọn "Duyệt spec 008" cho câu hỏi "Bạn có duyệt spec 008 (G1–G7) để bắt đầu code không?" (phạm vi nêu trong câu hỏi = `spec.md` §2; không gồm việc gỡ `@fontsource/roboto`) |
| G7 | 2026-11-23 | Cùng câu trả lời. Phạm vi: T001–T007 |

Phụ thuộc đã thỏa: PR #79 merge ngày 2026-11-23 (`e2fbe71`); nhánh đã merge `develop` (`6a50ea5`); phạm vi kiểm lại khớp `spec.md` §1.

## 3. Analyze (Claude)
- Mỗi AC có task (T001–T007); không task nào ngoài phạm vi.
- Không xung đột với AGENTS.md, FND hay R01; AC-D1 thực hiện đúng R01 §0.
- Phụ thuộc: PR #79 sửa cùng `HeaderActions.tsx`; code chỉ bắt đầu sau khi #79 merge.

## 4. Implement (Antigravity) và review (Claude), 2026-11-23

**Implement T001–T006**: Antigravity, headless (`agy --print`, quyền mặc định), conversation `412d2bbe-193d-4b9e-b08e-409292138ad0`, 08:00–08:10 (+07:00), `status: SUCCESS`, không có thao tác bị từ chối. Kết quả chi tiết trong handoff `FE-025-UI-FOUNDATIONS.md` §2 (ngoài repo).

**Review của Claude (QG2)**: đọc toàn bộ diff (13 file, +14/−242). Chỉ bỏ class `dark:` và CSS tối/cũ; mọi class của giao diện sáng giữ nguyên. Một phát hiện:
- R1 (Medium, đã sửa): `frontend/index.html` còn script gắn class `dark` lên `<html>` khi `localStorage.theme = "dark"` (file nằm ngoài `src/` nên plan và grep không quét). Claude tự sửa (sửa nhỏ, policy §10): xóa script.

**Kiểm tra chạy lại bởi Claude** (worktree, sau R1):
| Lệnh | Exit | Kết quả |
|---|---|---|
| `npm run lint` | 0 | — |
| `npm test` | 0 | 275/275 |
| `npm run build` | 0 | — |
| `git grep -E "dark:\|ThemeToggle\|themeStore\|useThemeStore\|\.dark\b\|custom-variant dark\|btn-primary\|btn-secondary\|GDS" -- frontend/src` | 1 | không còn kết quả |
| `node scripts/l10n-approval-check.mjs` (dev) | 1 | 1380 lỗi; `develop` gốc cũng exit 1 với 1381 lỗi (key EN chưa đăng ký, có sẵn); không lỗi mới |
| `npx playwright test -c tests/e2e/playwright.config.ts -g "Public Landing Page"` | 0 | 2/2 |

**Vòng duyệt trên trình duyệt** (Chrome qua Playwright, dev server của nhánh, backend Docker, dữ liệu seed; script và ảnh trong scratchpad, không commit):
- **V1** landing + trang chủ giảng viên/sinh viên/admin × 1024/1280/1440/1920 × VI/EN (32 lượt): nút đổi giao diện 1 → 0 ở mọi màn; không màn app nào cuộn ngang; khoảng cách các nút header đều (2/16/12 px), không chừa chỗ trống.
- **V2** người dùng cũ có `localStorage.theme = "dark"`: trước nền `rgb(11,17,32)` và `<html class="dark">`; sau (đã sửa R1) nền trắng, không có class `dark` ở cả 4 màn.
- **AC-D4** so pixel landing trước/sau trên cùng dev server, chiều cao trang không đổi: 1440 VI 0,06% (dòng 16–55, chỉ thanh điều hướng, chỗ nút cũ); 1920 VI 0,28% (dòng 16–55); 1440 EN 0,06% (dòng 16–766: thanh điều hướng và vùng hero có hoạt ảnh tự chạy; Claude đã xem ảnh, không thấy khác biệt nào khác).
- **V3** thao tác thật ở `/lecturer/courses`: đổi VI→EN→VI đổi chữ tại chỗ, không tải lại, lưu `edubranch-lang`; thu gọn sidebar 224→72 px; hộp thoại "Tạo khóa học" mở và đóng bằng Esc; 0 lỗi console. Toast không kiểm (không tạo thao tác đổi dữ liệu; `Toast.tsx` không bị sửa).

**Phát hiện ngoài phạm vi (không sửa ở spec này)**:
- Landing ở 1024 px cuộn ngang 120 px (có sẵn trên `develop`; hero dùng chiều rộng cố định).
- Bản build Docker của frontend: landing có 12 lỗi 404 khi tải tài nguyên và tiêu đề hero hiện font hệ thống, trong khi dev server hiện Be Vietnam Pro và 0 lỗi. [SUY-LUẬN] file font không được phục vụ trong bản build; chưa kiểm URL cụ thể.
- Admin dashboard: 404 khi gọi API thống kê (đã biết, EBA-95).
- `<html lang="en">` trong `index.html` trong khi ngôn ngữ mặc định là tiếng Việt.
