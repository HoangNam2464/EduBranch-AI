# Feature Specification: Font tiêu đề landing khi build, footer tràn ngang ở 1024px, thuộc tính ngôn ngữ của trang

**Feature Branch**: `fix/public-landing` (từ `origin/develop` `7f98534`)
**Feature directory**: `specs/009-public-landing-fixes`
**Created**: 2026-11-23 · **Status**: Draft, chờ PO duyệt G1–G7
**Parent**: FE-024 (Public landing & auth, Jira `EBA-87`); bước 5 (public/auth) của `docs/design/DESIGN-DIRECTION.md`, làm trước theo yêu cầu PO
**G0**: PO, chat 2026-11-23: "đề xuất spec tiếp theo theo kế hoạch UI: sửa lỗi font khi build và cuộn ngang ở landing, rồi tới bước 2 là các component dùng chung"

## 1. Bối cảnh

- [DỮ-KIỆN] Bản build production (container `edubranch_frontend`, `develop` `7f98534`) tải 12 file font và cả 12 đều 404: `/assets/files/be-vietnam-pro-{latin,latin-ext,vietnamese}-{500,600}-normal.woff2|woff`. Thư mục `frontend/dist/assets` không có file `be-vietnam-pro` nào. Hệ quả: tiêu đề landing hiện font hệ thống thay vì Be Vietnam Pro (R01 §0). Dev server (`npm run dev`) hiện đúng.
- [DỮ-KIỆN] Font được nạp bằng `@import "@fontsource/be-vietnam-pro/500.css"` và `600.css` ở `frontend/src/index.css:3-4`. Các file CSS đó dùng `url(./files/...)` tương đối.
- [SUY-LUẬN] Khi build, Tailwind v4 (`@tailwindcss/postcss`) gộp nội dung CSS được `@import` vào file CSS đầu ra nhưng không viết lại đường dẫn `./files/...`, nên trình duyệt tìm font ở `/assets/files/` và Vite không xuất file font. Import font từ JavaScript (`main.tsx`) để Vite tự xử lý `url()` là cách khắc phục thông thường; xác nhận bằng build ở bước implement.
- [DỮ-KIỆN] Landing ở độ rộng 1024px cuộn ngang 120px (`scrollWidth` 1144). Phần tử vượt khung: cột link footer `nav.w-40` trong `frontend/src/components/ds/PublicFooter.tsx:64` (mép phải 1144px). Footer xếp một hàng: cột thương hiệu `w-[360px] shrink-0`, 3 cột link `w-40 shrink-0`, `gap-16`, khoảng 1096px, trong vùng nội dung khoảng 928px. Ở 1280px trở lên không tràn.
- [DỮ-KIỆN] `frontend/index.html:2` khai báo `<html lang="en">`, trong khi ngôn ngữ mặc định là tiếng Việt và người dùng có thể đổi VI/EN (R01 §9.2); không có code nào cập nhật `document.documentElement.lang`.

## 2. Phạm vi

**Trong phạm vi**
- Nạp font Be Vietnam Pro sao cho bản build production phục vụ đủ file font.
- Footer công khai không gây cuộn ngang từ 1024px; giữ nguyên bố cục từ 1280px trở lên.
- Thuộc tính `lang` của trang theo ngôn ngữ đang chọn (`vi` mặc định, `en` khi chuyển).

**Ngoài phạm vi, giữ nguyên**
- Nội dung, màu sắc, chữ của landing và footer; các trang khác; hero landing (đã kiểm: không gây tràn).
- Mã màu viết thẳng trong landing (19 chỗ): để spec landing/auth sau.
- Gỡ `@fontsource/roboto` (thư viện không còn dùng): cần PO quyết riêng.

## 3. Acceptance Criteria (tất cả là [ĐỀ-XUẤT] cho tới khi PO duyệt)

- **AC-F1 (font khi build)**: sau `npm run build`, `dist/assets` có file font Be Vietnam Pro 500/600; container frontend build lại tải landing với 0 lỗi 404 và tiêu đề hero hiển thị bằng Be Vietnam Pro (`document.fonts` có Be Vietnam Pro trạng thái `loaded`).
- **AC-F2 (không đổi chỗ khác)**: các màn trong app vẫn dùng font hệ thống; dev server vẫn hiển thị đúng.
- **AC-L1 (không tràn)**: landing không cuộn ngang ở 1024, 1280, 1440, 1920px (`scrollWidth = clientWidth`), cả VI và EN; footer không có chữ bị cắt hay chồng.
- **AC-L2 (giữ bố cục)**: ở 1280px trở lên, footer trông như hiện tại (so ảnh trước/sau).
- **AC-H1 (lang)**: trang mở lần đầu có `<html lang="vi">`; đổi sang EN thì `lang="en"`, đổi lại thì `lang="vi"`, không tải lại trang.
- **AC-Q (kiểm tra)**: `npm run lint`, `npm test`, `npm run build` exit 0; test e2e landing đạt; 3 vòng duyệt trên trình duyệt (V1 landing + footer ở 4 độ rộng, VI/EN, cả bản dev và bản build Docker; V2 đổi ngôn ngữ và kiểm `lang`; V3 hồi quy: header công khai, trang đăng nhập/đăng ký, một màn trong app).
