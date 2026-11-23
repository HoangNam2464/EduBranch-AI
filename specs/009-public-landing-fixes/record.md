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
| G1–G6 | — | chờ PO |
| G7 | — | chờ PO |

## 3. Analyze (Claude)
- Mỗi AC có task (T001–T005); không task nào ngoài phạm vi.
- Không xung đột AGENTS.md, FND, R01. Không thêm thư viện.
- Không có PR mở nào sửa `PublicFooter.tsx`, `main.tsx`, `index.css`, `i18n.ts`, `index.html` (kiểm lúc soạn).
