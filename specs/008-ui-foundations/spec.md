# Feature Specification: Bỏ dark mode và dọn CSS giao diện cũ

**Feature Branch**: `fix/ui-foundations` (từ `origin/develop` `7725b85`)
**Feature directory**: `specs/008-ui-foundations`
**Created**: 2026-11-22 · **Status**: G1–G7 do PO duyệt 2026-11-23 (xem `record.md` §2)
**Parent**: FE-025 (Shared App Shell, Jira `EBA-88`); bước 1 của `docs/design/DESIGN-DIRECTION.md`
**G0**: PO, chat 2026-11-22: "theo đề xuất đi" và "bạn làm luôn giúp tôi" (nguyên văn trong `record.md`)

## 1. Bối cảnh

- [DỮ-KIỆN] R01 §0 (PO 2026-11-20, 2026-11-21, 2026-11-22): giao diện chỉ có nền sáng; nút đổi giao diện và style `.dark` phải bỏ; không thêm class `dark:`.
- [DỮ-KIỆN] Code trên `develop` `7725b85` vẫn có dark mode từ PR #54:
  - `components/ds/ThemeToggle.tsx`, `stores/themeStore.ts` (lưu `localStorage["theme"]`, gắn class `dark` lên `<html>`).
  - Nút ở `layouts/shell/HeaderActions.tsx:101` (app) và `components/ds/PublicNav.tsx:105` (trang công khai); export ở `components/ds/index.ts:79`.
  - `index.css`: `@custom-variant dark` (dòng 6), khối biến `:root.dark, .dark` (dòng 104–160), utility `.dark .text-primary` (dòng 214–217).
  - 14 class `dark:` trong `pages/landing/sections/HeroSection.tsx` và `LifecycleSection.tsx`.
  - Key i18n `shell.themeSoon`, `shell.themeLight`, `shell.themeDark`, `shell.themeToggle` (VI/EN).
  - Bước 3 của e2e `tests/e2e/full-platform.spec.ts:54-58` bấm nút theme nếu có.
- [DỮ-KIỆN] `index.css` `@layer components` còn `.btn-primary` (`#1d4ed8`), `.btn-secondary`, `.card` (`#e5e7eb`) của giao diện thế hệ đầu; không file nào trong `frontend/src` dùng chúng.
- [DỮ-KIỆN] Hai comment code còn trỏ tới "GDS §3" (`index.css:2`, `pages/landing/landingConstants.ts:5`); file đó đã bị xóa ngày 2026-11-22 (PR #81).
- [SUY-LUẬN] Người dùng đã từng bật dark mode vẫn còn `localStorage["theme"] = "dark"`. Khi bỏ store, khóa này không còn tác dụng vì không ai gắn class `dark` nữa.

## 2. Phạm vi

**Trong phạm vi**
- Xóa nút đổi giao diện ở header app và thanh điều hướng công khai; xóa `ThemeToggle`, `themeStore` và export của nó.
- Xóa toàn bộ CSS dark (`@custom-variant dark`, khối `.dark`, utility `.dark .text-primary`) và 14 class `dark:` ở landing.
- Xóa 4 key i18n `shell.theme*` ở cả VI và EN, cùng các dòng tương ứng trong sổ l10n nếu có.
- Xóa class CSS cũ không dùng `.btn-primary`, `.btn-secondary`, `.card`.
- Sửa 2 comment "GDS" thành R01.
- Bỏ bước bấm nút theme trong e2e.

**Ngoài phạm vi, giữ nguyên**
- Màu, khoảng cách, bố cục của giao diện sáng; nút ngôn ngữ, thông báo, cài đặt ở header.
- 19 chỗ mã màu viết thẳng trong page (chủ yếu ở landing): xử lý ở bước 5 (public/auth) của kế hoạch UI.
- Độ rộng app shell và vị trí toast: thuộc spec 006 (PR #79).

## 3. Acceptance Criteria (tất cả là [ĐỀ-XUẤT] cho tới khi PO duyệt)

- **AC-D1 (không còn dark mode)**: không còn nút đổi giao diện ở header app (giảng viên, sinh viên, admin) và thanh điều hướng công khai; `git grep -E "dark:|ThemeToggle|themeStore|\.dark\b" frontend/src` không còn kết quả.
- **AC-D2 (người dùng cũ)**: trình duyệt có `localStorage["theme"] = "dark"` vẫn thấy giao diện sáng ở mọi màn, không nháy tối khi tải trang.
- **AC-D3 (header gọn)**: các nút còn lại ở header giữ thứ tự và khoảng cách đều, không để lại khoảng trống chỗ nút cũ, ở 1024/1280/1440/1920 px.
- **AC-D4 (landing giữ nguyên)**: landing ở giao diện sáng nhìn giống hệt trước khi sửa (ảnh trước/sau ở 1440 px, VI và EN).
- **AC-C1 (dọn CSS cũ)**: `index.css` không còn `.btn-primary`, `.btn-secondary`, `.card`, cũng như mã màu của giao diện thế hệ đầu (`#1d4ed8`, `#e5e7eb`, `#f9fafb`, `#374151`).
- **AC-I1 (i18n)**: không còn key `shell.theme*`; `vi.json` và `en.json` vẫn có cùng bộ key; `node scripts/l10n-approval-check.mjs` không phát sinh lỗi mới so với `develop`.
- **AC-Q (kiểm tra)**:
  - `npm run lint`, `npm test`, `npm run build` đều exit 0; e2e landing chạy qua.
  - 3 vòng duyệt trên trình duyệt thật: (V1) header app 3 vai trò và landing ở 1024/1280/1440/1920, VI và EN; (V2) người dùng cũ có `theme=dark` trong localStorage; (V3) hồi quy: mở hộp thoại, toast, đổi ngôn ngữ, thu gọn sidebar. Mỗi vòng ghi lỗi, sửa, chụp lại.

## 4. Phụ thuộc

- PR #79 (spec 006) cũng sửa `HeaderActions.tsx`. Theo nguyên tắc một người viết một file, chỉ code sau khi #79 đã merge, rồi rebase nhánh này lên `develop`.
