# Implementation Plan: 007-ui-foundations

**Spec**: `specs/007-ui-foundations/spec.md` · **Tier**: frontend only (không đổi API, DB, AI service)

## Constitution check
- FND §3: chỉ frontend, không gọi API mới. Đạt.
- AGENTS.md rule 9 / R01 §0, §2: bỏ dark mode và mã màu cũ đúng quyết định PO. Đạt.
- Không thêm thư viện, không đổi route. Đạt.

## File sẽ sửa
| File | Thay đổi |
|---|---|
| `frontend/src/components/ds/ThemeToggle.tsx` | xóa |
| `frontend/src/stores/themeStore.ts` | xóa |
| `frontend/src/components/ds/index.ts` | bỏ export `ThemeToggle` |
| `frontend/src/layouts/shell/HeaderActions.tsx` | bỏ nút và import; sửa comment đầu file |
| `frontend/src/components/ds/PublicNav.tsx` | bỏ nút và import |
| `frontend/src/index.css` | bỏ `@custom-variant dark`, khối `:root.dark`, utility `.dark .text-primary`, `.btn-primary`, `.btn-secondary`, `.card`; comment "GDS" → R01 |
| `frontend/src/pages/landing/sections/HeroSection.tsx`, `LifecycleSection.tsx` | bỏ 14 class `dark:` |
| `frontend/src/pages/landing/landingConstants.ts` | comment "GDS" → R01 |
| `frontend/src/locales/vi.json`, `en.json` | bỏ 4 key `shell.theme*` |
| `docs/l10n/shared-copy-review.md` | bỏ dòng của 4 key đó nếu có |
| `frontend/tests/e2e/full-platform.spec.ts` | bỏ bước 3 (theme toggle) |

Kiểm tra thêm ở bước implement: `main.tsx`/`App.tsx` có import `themeStore` để khởi tạo sớm không (grep trước khi xóa).

## Kiểm tra
- `npm run lint`, `npm test`, `npm run build`; `node scripts/l10n-approval-check.mjs`.
- Playwright (script tạm ngoài repo): header 3 vai trò + landing ở 1024/1280/1440/1920, VI/EN, ảnh trước/sau; trường hợp `localStorage.theme = "dark"`.
- Người kiểm tra độc lập: Claude review lại diff do Antigravity viết, hoặc `visual-qa-verifier`.

## Người làm
Antigravity qua `.agent-handoff/FE-025-UI-FOUNDATIONS.md` (workflow §6); Claude review và chạy vòng duyệt.
