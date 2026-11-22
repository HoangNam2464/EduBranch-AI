# Tasks: 008-ui-foundations [FE-025]

Chỉ bắt đầu sau G7 và sau khi PR #79 đã merge (rebase `fix/ui-foundations` lên `develop`).

- [ ] T001 Xóa `ThemeToggle.tsx`, `themeStore.ts`, export trong `ds/index.ts`; bỏ nút ở `HeaderActions.tsx` và `PublicNav.tsx` (AC-D1, AC-D3)
- [ ] T002 Bỏ CSS dark trong `index.css` và 14 class `dark:` ở `HeroSection.tsx`, `LifecycleSection.tsx` (AC-D1, AC-D2, AC-D4)
- [ ] T003 Bỏ `.btn-primary`, `.btn-secondary`, `.card` khỏi `index.css`; sửa 2 comment "GDS" (AC-C1)
- [ ] T004 Bỏ 4 key `shell.theme*` ở VI/EN và dòng sổ l10n tương ứng (AC-I1)
- [ ] T005 Bỏ bước theme trong `tests/e2e/full-platform.spec.ts` (AC-Q)
- [ ] T006 Chạy lint, test, build, l10n check; ghi exit code (AC-Q)
- [ ] T007 Vòng duyệt V1–V3 với ảnh trước/sau; ghi vào `record.md` (AC-D2, AC-D3, AC-D4, AC-Q)
