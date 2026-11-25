# UI Audit — running app vs Figma (1440px)

> - **Document Class**: `[HISTORICAL SNAPSHOT]` (Point-in-time visual audit at `develop` `6f903f2`, `2026-11-21`).
> - **Status**: Audit + trial result (2026-11-21, Claude). The trial code (§4) is **not** in the repository: the PO chose (2026-11-21) to ship the docs package without it, because PR #79 (spec 006, fluid app layout) changes the same shell files. Re-measure X1/X2 after PR #79 merges and redo the trial on top of it if still needed. The `after/` and `compare/` images record what the trial produced.
> - **Environment**: `develop` `6f903f2` (before PRs #68–#75 merged on 2026-11-22; the measurements must be re-run on the current `develop`, with MinIO, case/attempt/submission data and on Windows/Chrome, before they serve as acceptance evidence); backend on local Postgres 16 + pgvector + Redis (no MinIO, no AI provider key → no materials, no cases); Vite dev server; Chromium (Playwright) 1440×900, deviceScaleFactor 1; language `vi`. Seed: `frontend/tests/visual/seed-local.mjs` (3 accounts, 8 courses; material upload failed without MinIO).
> - **Evidence**: the before/after/compare images and capture reports of 2026-11-21 were removed from the repository on 2026-11-22 (the trial was not shipped and `develop` has changed since). Re-capture on the current `develop` when this audit is used; the findings below are the input of `docs/design/DESIGN-DIRECTION.md`.
> - **Limit**: screens that need cases, attempts or submissions (05.x player/review, 06.x Review Study, 04.2 detail, 03.4 editor) could not be audited with data; they are NOT VERIFIED here.

## 1. Cross-cutting findings (root causes)
| ID | Finding | Evidence | Verdict |
|---|---|---|---|
| X1 | Shell content inset 48px vs Figma 20px (`AppShell.tsx` `lg:px-8` + `px-4`); content column 56px narrower than designed | pixel measure: Figma 02.1 title x=245, card top y=93; app x=274, y=105 | IMPROVE — trialled |
| X2 | Page titles truncate at 1440px ("Hàng đợi Review và phản h…", "Rubric nghiên cứu chất lượn…") because the 320px search never shrinks | baseline 04.1, 07.8 | IMPROVE — trialled |
| X3 | Status/count values wrap inside fixed-width slots ("Chưa có case" over 3 lines; "8 khóa / đang dạy"; "Tất cả khóa / học") | baseline 09.1, 02.1 | IMPROVE — root cause X1 plus missing `whitespace-nowrap` |
| X4 | Admin Dashboard shows placeholder data when the API is missing (186 users, 92/6/2%, 5 named log rows, fixed week axis); 2 console 404s | `AdminDashboardPage.tsx` ~L320, ~L543; capture-report | REDESIGN states (defect, EBA-95) |
| X5 | Statistics: six cards each with the same "Chưa có dữ liệu thống kê" | baseline 04.3 | IMPROVE — one page-level empty state (after PR #70) |
| X6 | Auth screens 00.3/00.4/10.1 differ ~35% from Figma (brand panel is a small centred card, not full height) | `npm run test:visual` 2026-11-21 | IMPROVE — confirm on Windows first (EBA-87) |
| X7 | Theme toggle in header vs "light mode only" | R01 §0 | DECIDED (PO 2026-11-21: remove) — implementation pending |
| X8 | Search placeholder gets clipped when the search shrinks (trial side effect) | after 07.8 | accepted trade-off; shorter placeholder copy needs PO-approved Vietnamese text |

## 2. Screen verdicts (KEEP / IMPROVE / REDESIGN)
| Screen (frame) | Route | Verdict | Notes |
|---|---|---|---|
| Landing (00.2) | `/` | KEEP | No shell; not re-measured (public budget 2.3%) |
| Login / Register / Admin login (00.3–00.5, 10.1) | `/login`, `/register`, `/admin/login` | IMPROVE | X6 |
| 403 / 404 (01.4, 01.5) | | KEEP | Clear message, two actions, support link |
| Lecturer dashboard (07.1) | `/lecturer/dashboard` | IMPROVE | Empty month calendar dominates the first screen; KPI "—" without reason; open PR #73 |
| Courses (02.1) | `/lecturer/courses` | IMPROVE | X1/X3 fixed by trial; lecturer name still truncated in the meta row; open PR #72 |
| Materials (02.4) | `/lecturer/courses/:id/materials` | KEEP (layout) | Upload flow not verifiable without MinIO |
| Case Study library (03.1) | `/lecturer/cases` | KEEP | Good empty state with one action |
| AI Studio (07.5–07.7) | `/lecturer/ai-studio` | KEEP | Clear 3-step structure |
| Rubric (07.8) | `/lecturer/rubric` | IMPROVE | Title truncation fixed by trial; open PR #74 |
| Feedback queue (04.1) | `/lecturer/feedback` | KEEP + X2 | Table empty state inside body is right |
| Statistics (04.3) | `/lecturer/statistics` | IMPROVE | X5; open PR #70 |
| Profile (09.1/09.2) | `/lecturer/profile`, `/student/profile` | IMPROVE — trialled | X1/X3; Figma also has breadcrumb + back button that the app lacks (gap, not changed) |
| Student desk / My courses / History (07.2–07.4, 05.9) | `/student/*` | KEEP | Honest empty states; data views NOT VERIFIED |
| Admin dashboard (10.2) | `/admin/dashboard` | REDESIGN (states) | X4 |
| Admin users/courses/cases/logs/settings (10.3–10.10) | `/admin/*` | NOT VERIFIED | Placeholder screens until BE-032; open PR #75 |

## 3. Shared components to improve first
1. `layouts/shell/AppShell.tsx`, `HeaderActions.tsx` — inset, header height, title priority (trialled).
2. `components/ds/MetricCard.tsx` — tabular numerals, honest "—" with reason.
3. Status/count slots — `whitespace-nowrap` convention in `StatusPill`, count labels.
4. Page-level empty state pattern for dashboards with many widgets.

## 4. Trial: shared shell + Profile (09.1/09.2)
**Why this group**: the shell is used by every lecturer, student and admin screen (highest leverage); Profile showed the clearest breakage; none of these files is touched by an open PR (#68–#77 checked), so the trial cannot conflict with teammates' work.

**Changes (3 files, 11 lines)** — see `git diff`:
- `frontend/src/layouts/shell/AppShell.tsx`: container `px-3 sm:px-6 lg:px-8` → `px-1`; header/main `px-2 sm:px-4` → `px-3 sm:px-4` (20px inset at ≥640px); canvas `pt-2` removed; header `h-[84px]` → `h-[76px]`; main `pt-[5px]`; title `min-w-0 truncate` → `max-w-[60%] shrink-0 truncate`.
- `frontend/src/layouts/shell/HeaderActions.tsx`: actions row `min-w-0`; search `w-80` → `w-80 min-w-52 shrink`.
- `frontend/src/pages/profile/ProfileEditPage.tsx`: case-count slot and teaching-count label `shrink-0 whitespace-nowrap`.

**Visual QA** (`npm run test:visual`, local Chromium, same data before/after; mismatch vs Figma, lower is better; no frame in this group has an accepted budget because the data differs from Figma):
| Frame | Before | After |
|---|---|---|
| 02.1 Courses | 8.70% | 5.48% |
| 03.1 Case library | 7.38% | 7.08% |
| 04.1 Feedback queue | 5.40% | 4.97% |
| 04.3 Statistics | 6.43% | 6.75% |
| 07.1 Lecturer dashboard | 6.33% | 5.89% |
| 09.1 Lecturer profile | 8.60% | 8.34% |
| 09.2 Student profile | 11.66% | 9.71% |
| 10.2 Admin dashboard | 10.97% | 11.42% (placeholder chart X4 moves with the wider column) |

**DOM/pixel measurements vs Figma 02.1** (1440px): title glyph top y 40 (Figma) / 53 before / 41 after; left x 245 / 274 / 246; first card top y 93 / 105 / 94 → within 1px after the trial. Page title not truncated on `/lecturer/feedback` (`scrollWidth = clientWidth`).

**Checks**: frontend `npm run lint` 0, `npm test` 169/169, `npm run build` 0; no new console errors (only the pre-existing 2× 404 on `/admin/dashboard`).

**Verdict**: PASS WITH CONDITIONS for the trial — conditions: (1) PO review of before/after (`compare/`), (2) re-measure on the team's Windows/Chrome, (3) X8 placeholder clipping accepted or shorter copy approved. Not merged, not committed.
