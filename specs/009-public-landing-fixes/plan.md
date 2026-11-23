# Implementation Plan: 009-public-landing-fixes

**Spec**: `specs/009-public-landing-fixes/spec.md` · **Tier**: frontend only (không đổi API, DB, AI service, không thêm thư viện)

## Constitution check
- FND §3: chỉ frontend. Đạt.
- R01 §0 (font landing = Be Vietnam Pro), §3.1 (không tràn ngang từ 1024px), §9.2 (VI/EN). Đạt.
- Không thêm thư viện, không đổi route. Đạt.

## Cách làm
| File | Thay đổi |
|---|---|
| `frontend/src/index.css` | bỏ 2 dòng `@import "@fontsource/be-vietnam-pro/…css"` |
| `frontend/src/main.tsx` | import `@fontsource/be-vietnam-pro/500.css` và `600.css` (trước `@/index.css`) để Vite xử lý `url()` và xuất file font |
| `frontend/src/components/ds/PublicFooter.tsx` | hàng cột co giãn: dưới 1280px cho các cột link co lại hoặc xuống hàng (ví dụ `flex-wrap`, cột thương hiệu `w-full max-w-[360px]`, khoảng cách nhỏ hơn); từ `xl` (1280px) giữ đúng class hiện tại |
| `frontend/src/lib/i18n.ts` | đặt `document.documentElement.lang` theo ngôn ngữ hiện tại khi khởi tạo và trên sự kiện `languageChanged` |
| `frontend/index.html` | `<html lang="vi">` làm giá trị ban đầu |

Nếu build vẫn không xuất file font sau khi chuyển import: dừng và báo (không đổi sang thư viện khác).

## Kiểm tra
- `npm run lint`, `npm test`, `npm run build`; kiểm `dist/assets` có `be-vietnam-pro-*`; test e2e landing.
- Playwright (script tạm ngoài repo): landing + footer ở 1024/1280/1440/1920, VI/EN, trên dev server và trên container build lại; đo `scrollWidth`, 4xx, `document.fonts`, `lang`; ảnh trước/sau.
- Người kiểm độc lập: Claude review diff do Antigravity viết.

## Người làm
Antigravity qua `.agent-handoff/FE-024-PUBLIC-LANDING.md`; Claude review, chạy vòng duyệt, build lại Docker sau merge.
