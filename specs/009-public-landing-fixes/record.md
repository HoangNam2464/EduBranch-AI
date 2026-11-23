# Feature Record: 009-public-landing-fixes [FE-024]

> Theo `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` §4. **Created**: 2026-11-23.

## 1. Discover
- Nhánh `fix/public-landing` từ `origin/develop` `7f98534`.
- Nguồn: R01 §0, §3.1, §9.2; `docs/design/DESIGN-DIRECTION.md` §3; phát hiện ngoài phạm vi trong `specs/008-ui-foundations/record.md` §4.
- Đo trên container build từ `develop` `7f98534` (Playwright, Chrome): 12 request font `/assets/files/be-vietnam-pro-*` trả 404 ở 1024 và 1440px; `dist/assets` không có file `be-vietnam-pro`; landing 1024px `scrollWidth` 1144, phần tử vượt khung `nav.w-40` của `PublicFooter` (mép phải 1144); 1440px không tràn.

## 2. Gate log
| Gate | Ngày | Nguyên văn |
|---|---|---|
| G0 | 2026-11-23 | PO: "đề xuất spec tiếp theo theo kế hoạch UI: sửa lỗi font khi build và cuộn ngang ở landing, rồi tới bước 2 là các component dùng chung" |
| G1–G6 | 2026-11-23 | PO (gộp) chọn "Duyệt spec 009" cho câu hỏi "Bạn có duyệt spec 009 (G1–G7) để bắt đầu code không?" (phạm vi nêu trong câu hỏi = `spec.md` §2; không gồm việc gỡ `@fontsource/roboto`) |
| G7 | 2026-11-23 | Cùng câu trả lời. Phạm vi: T001–T005 |

## 3. Analyze (Claude)
- Mỗi AC có task (T001–T005); không task nào ngoài phạm vi.
- Không xung đột AGENTS.md, FND, R01. Không thêm thư viện.
- Không có PR mở nào sửa `PublicFooter.tsx`, `main.tsx`, `index.css`, `i18n.ts`, `index.html` (kiểm lúc soạn).

## 4. Implement (Antigravity) và review (Claude), 2026-11-23

**Implement T001–T004**: Antigravity, headless (`agy --print`, quyền mặc định), conversation `ec4a9dd1-1ff1-4439-ba41-352bf460bf4b`, 08:35–08:49 (+07:00), `status: SUCCESS`, không có thao tác bị từ chối. Kết quả chi tiết trong handoff `FE-024-PUBLIC-LANDING.md` §2 (ngoài repo).

**Review của Claude (QG2)**: đọc toàn bộ diff (6 file + `src/lib/i18n.spec.ts`; `package.json` chỉ thêm file test đó vào script `test`). Một phát hiện:
- R1 (Low, đã sửa): ở 1024 px, `gap-8` làm hàng footer rộng 936 px so với vùng nội dung 928 px nên cột "Pháp lý" rơi xuống hàng hai dưới logo, để trống bên phải. Claude đổi `gap-8` → `gap-6` (dưới `xl`); cả 3 cột nằm một hàng, chiều cao footer giữ 283 px.

**Kiểm tra chạy lại bởi Claude** (worktree, sau R1):
| Lệnh | Exit | Kết quả |
|---|---|---|
| `npm run lint` | 0 | — |
| `npm test` | 0 | 278/278 (thêm 3 test `i18n.spec.ts`) |
| `npm run build` | 0 | `dist/assets` có 12 file `be-vietnam-pro-*`; CSS trỏ tới file đã băm |
| `node scripts/l10n-approval-check.mjs` (dev) | 1 | 1380 lỗi, có sẵn trên `develop`, không lỗi mới |
| e2e landing trên bản build (`VISUAL_BASE_URL=http://localhost:4173`) | 0 | 2/2 |

**Vòng duyệt trên trình duyệt** (Chrome qua Playwright; bản build production của nhánh phục vụ bằng `vite preview`; "trước" = container build từ `develop` `7f98534`):
- **V1** landing × 1024/1280/1440/1920 × VI/EN: cuộn ngang 120 px → 0 ở 1024; font Be Vietnam Pro `loaded`, 404 từ 12 (VI) / 4 (EN) → 0; lỗi console 0. Footer 1280/1440/1920: giống hệt trước (so pixel 0,00 %). Footer 1024: hết bị cắt cột "Pháp lý", 3 cột một hàng (Claude đã xem ảnh).
- **V2** `lang`: lần đầu `vi`; bấm EN → `en` ngay trên trang (không tải lại); bấm VI → `vi`.
- **V3** `/login`, `/register` ở 1024: không cuộn ngang, `lang="vi"`. `/lecturer/courses`: khung app hiện, font hệ thống (AC-F2); dữ liệu không tải vì backend chặn CORS từ cổng 4173 của `vite preview` (giới hạn môi trường kiểm, không phải lỗi code) — màn app kiểm lại trên container sau merge (QG7).
