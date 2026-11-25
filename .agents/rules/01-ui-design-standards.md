---
description: >-
  General UI/UX design rules and quality standards for EduBranch-AI (identity,
  token names, layout, components, states, copy, and quality bar); PO-approved
  Figma remains the official per-screen design authority.
trigger: always_on
---

# EduBranch-AI — UI/UX Design Rules (R01)

> - **Design authority & precedence (PO 2026-11-25)**: **PO-approved Figma** (`file 6CtSgJPKo4jCIbB7WwCaWw`, pages `EduBranch AI – Screens` & `EduBranch AI – Design System`, frame register `docs/05_FIGMA.md`) is the **official design authority for each screen**. **`R01`** (this file) defines general UI/UX design rules and quality standards — it must **NOT** be used to override a specific PO-approved Figma design.
> - **Code vs Design**: Frontend code (`frontend/src/index.css` `@theme` / target `frontend/src/styles/variables.css`) is the **implementation** of the design, never the authority deciding the design. When code mismatches PO-approved Figma, update code and implementation docs to follow Figma. **Never edit Figma to legitimize or conform to old code.** If a conflict arises between PO-approved Figma and `R01` general rules, report it and keep it **`OPEN PO DECISION / UNRESOLVED`** until the PO decides.
> - **Per-screen behaviour**: `docs/design/UX-SCREEN-NOTES.md`. Routes: `frontend/src/routes/paths.ts`.
> - **Frontend architecture & typography standard** (updated 2026-11-25): UI uses `Plus Jakarta Sans` (primary) and `Inter` (secondary) on Light-only Navy `#2A4E7F` / Sky `#00A5F5` surfaces, Vietnamese default UI (`vi.json` / `en.json`), and a modular TypeScript architecture (`styles/`, `routes/`, `layouts/`, `pages/<domain>/`, `features/<domain>/components/`, `components/ui/`, `components/feedback/`, `hooks/`, `services/`, `stores/`, domain-scoped `utils/`, `config/`, `lib/`). Naming & structure must reflect EduBranch-AI's own higher-education domain exclusively—never import non-university concepts, dark mode, unapproved color palettes, or external brand names.
> - **Improvement plan** for the current UI: `docs/design/DESIGN-DIRECTION.md`.

## 0. Fixed decisions (change only with a new PO decision; update this list in the same change)

| Topic | Decision | Source |
|---|---|---|
| Identity | Light theme only (matches live Figma `6CtSgJPKo4jCIbB7WwCaWw`: `page`/`surface`, `canvas`, `surface-muted`, `selected`). Navy `#2A4E7F` = actions and focal data. Sky `#00A5F5` = data and highlights, never text | PO 2026-11-20, 2026-11-22 & 2026-11-25 |
| Dark mode | None. The theme toggle and `.dark` styles are removed; never add `dark:` classes | PO 2026-11-20, 2026-11-21, 2026-11-25 |
| Font | `Plus Jakarta Sans` (primary) and `Inter` (secondary), fallback `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (code transition from `Segoe UI`/`Be Vietnam Pro` in `index.css` queued for code-sync pass) | PO 2026-11-25 |
| Platform | Web app in the browser. App screens are fluid with the window; landing and auth pages are centred at `max-w-7xl` | PO 2026-11-21, 2026-11-22 |
| Language | Vietnamese default, English through the VI/EN switch, both in the MVP; one language per screen | PO 2026-11-16, 2026-11-22 |
| Style goal | Keep existing approved Figma/Light Navy-Sky identity and fix broken UI/UX execution; no new design phase now — consider visual UI redesign **only after project completion, if time permits** | PO 2026-11-22 & 2026-11-25 |
| Design Authority | **PO-approved Figma** governs per-screen design; **`R01`** governs general UI quality rules without overriding approved Figma; **code implements Figma** (never edit Figma to justify legacy code; escalate R01-vs-Figma conflicts as `UNRESOLVED`) | PO 2026-11-25 |

## 1. Character

A calm, structured university workspace. Quiet white shell, soft blue canvas, white cards that each do one job. Typography and spacing carry the hierarchy; colour carries meaning (one action colour, status, learning mode, data). AI is a function, not a look.

Never:
1. Emoji anywhere in the UI. Use `lucide-react` outline icons.
2. ASCII glyphs as icons (`->`, `✕`, `✓`, `•`).
3. Purple, indigo, violet, rainbow, neon, glow, gradient text, blurred blobs. The only gradient is the brand panel on landing hero and auth.
4. More than one alert banner per screen; routine guidance is one short caption line.
5. A bordered card inside a bordered card, or more than the surface ladder (§3.2).
6. Mixed languages on one screen or leftover template copy (`Add Student`, sample names, `$`).
7. Chat bubbles, robot avatars, typing dots, confetti, streaks, scores or "vs." framing. AI output is marked only by the neutral `AiOriginBadge` (`AI Draft` / `AI-assisted`).
8. Fake or placeholder data to make a screen look full.
9. Grading words in UI copy (`Điểm`, `Đạt`, `Trượt`, `Đúng`, `Sai`, `Score`, `Grade`) and right/wrong colours on branches or outcomes.

## 2. Tokens (names from `frontend/src/index.css` `@theme`)

| Group | Tokens | Use |
|---|---|---|
| Surfaces | `page`, `canvas`, `surface`, `surface-muted`, `surface-hover`, `selected` | shell, content canvas, cards, the one inset block, hover rows, selected items |
| Text | `ink`, `ink-secondary`, `ink-muted`, `ink-inverse`, `link` | headings and body, supporting text, placeholders/disabled only, text on navy, links |
| Lines | `line`, `line-soft`, `line-strong`, `focus` | input borders and dividers, sidebar divider, hover borders, focus ring |
| Action | `primary` (+`-hover`, `-active`, `-disabled`, `-subtle`, `-subtle-hover`), `accent`, `danger` (+`-hover`) | buttons, active nav, tabs; sky data accent; destructive |
| Feedback | `success`, `warning`, `error`, `info` each with `-text`, `-bg`, `-border` | toasts, banners, field errors, status tiles |
| Status and mode | `status-*`, `mode-review-*` and the badge components | case lifecycle and learning mode |
| Shape | `rounded-eb-sm` 6 (inputs, buttons, tags), `-md` 8 (insets, tiles, tables, toasts), `-lg` 12 (cards), `-xl` 18 (canvas, dialogs, brand panel), `rounded-full` (status badge, AI tag, avatar, count chip only) | |
| Elevation | `shadow-eb-card` (cards at rest), `shadow-eb-hover` (clickable card hover), `shadow-eb-dialog`, `shadow-eb-toast`, `shadow-eb-focus` | |

- No raw hex or arbitrary colour in pages when a token exists. A missing token is added to `index.css` (one place), never inlined.
- Status: `DRAFT → REVIEWED → APPROVED → PUBLISHED`; one status = one colour everywhere; render only through `CaseStatusBadge` (filled pill, one dot).
- Learning mode: render only through `LearningModeBadge` (outlined tag: `GitFork` Branching Study, `FileCheck2` Review Study), so it never collides with a status pill.
- Charts: at most 3 series: `primary` (focal), `accent`, neutral. Legend or direct labels, real units, never green-vs-red branches.

## 3. Layout

### 3.1 Shell and width
- App screens (lecturer, student, admin) use `AppShell`: sidebar (expanded / collapsed) + canvas. Content uses the full width beside the sidebar with fixed side gutters; no `max-w-7xl` cap in the app shell. Long reading text (case situation, context, problem, consequence, feedback, reflection) is capped at 65–75ch.
- Landing, public header/footer and auth pages are centred in `max-w-7xl mx-auto`; auth forms at most 440px (480px for two-column register).
- It is a web app: every screen works from 1024px to 1920px+ wide with no horizontal page scroll, no overlapping and no clipped controls. 1440px is the review width, not a fixed frame. Below 1024px the sidebar collapses; phone layouts are not an MVP target.

### 3.2 Surface ladder
`page` shell → `canvas` panel (`rounded-eb-xl`) → `surface` card (`rounded-eb-lg`, `shadow-eb-card`) → at most one `surface-muted` inset block (`rounded-eb-md`, no border). Inside a card, separate sections with 16–24px space or one `line` divider.

### 3.3 Spacing and type
- 4px grid: 4, 8, 12, 16, 20, 24, 32, 48, 64. Canvas padding 24; card padding 20 (dense) or 24 (forms, reading); gap between cards 16 or 20; field gap 16; label → input 6.
- Type scale: page title 22/28; panel title 20/28; card title 16/24; body 14/20; long reading 15/22; caption 12/16; overline 11/16 uppercase (1–3 word labels only); metric 28/36 medium with `tabular-nums`. Hierarchy from size and weight 400/500, never all-caps sentences.
- Nothing the user must read is under 12px. `ink-muted` is never used for information.

## 4. Components (reuse; never fork)

Shared UI lives in `frontend/src/components/ds` (primitives and page patterns) and `frontend/src/components/feedback` (states). Extend these; a pattern used by two pages moves into `ds`.

- **Button**: variants `primary`, `secondary`, `tonal`, `danger`, `ghost`; sizes `sm` 32, `md` 40, `lg` 44; `rounded-eb-sm`, medium weight. At most one `primary` per view or dialog; repeated row actions use `tonal`/`secondary` `sm`. Never pill-shaped.
- **Inputs**: visible `<label>` always (placeholder is never the label); height 40; focus = `focus` border + `shadow-eb-focus`; error text under the field in a fixed-height slot so the layout does not jump. Academic textareas ≥ 4 rows, 15/22, vertical resize.
- **Cards**: one job each; clickable cards get `shadow-eb-hover` on hover, no translate/scale.
- **Tables**: header on `surface-muted`; numeric columns right-aligned with `tabular-nums`; row hover `surface-hover`; empty state inside the table body.
- **MetricCard**: label above value; value with unit; "—" only when the API has no value, with a tooltip saying why.
- **Dialog**: full-viewport scrim, focus trap, `Esc` closes when safe; destructive confirm names the object and uses `danger`; closes only after success, errors shown inside (`role="alert"`).
- **Toast**: one region per page, bottom-right, auto-dismiss ~4s, success/error/info tokens.
- **Icons**: `lucide-react`, stroke 1.75, `currentColor`; sizes 14 (badges), 16 (buttons, rows), 20 (nav, dialog close), 24 (empty/error tiles). Decorative icons `aria-hidden`; icon-only buttons have `aria-label` and a 32px target.
- **Domain widgets**: lifecycle stepper on Case Review; ReactFlow tree on `canvas` with dot grid, neutral edges that turn `primary` when selected, never green/red nodes; Branching player = situation card + full-width option buttons, no consequence or reasoning mid-flow; Journey Review = timeline with chosen option, alternatives (never struck through) and the consequence inset; Challenge Support = stacked neutral cards with round badge `Vòng N/2`, hard stop after round 2.

## 5. States and interaction (every screen)

1. Every data view handles: loading (`Skeleton` shaped like the content), empty (`EmptyState` with one next action), error (`ErrorState` with retry, inside the same region), 403, and success. When every widget on a page is empty, show one page-level empty state, not one per card.
2. Every interactive element has hover, `focus-visible` ring, pressed and disabled states, with a 150–200ms transition. Panels and dialogs animate 200–250ms with framer-motion (ADR-002) and respect `prefers-reduced-motion`. No decorative loops.
3. Mutations: disable the trigger and show a pending label; on success a toast and UI from the server response; on failure keep the previous state and show an i18n message mapped from the HTTP status. Never report success from a `catch`, never simulate with `setTimeout`.
4. Text never breaks where space exists: labels, counts, status values and buttons use `whitespace-nowrap`; only titles and descriptions wrap or truncate, and a truncated identifier gets a tooltip. A page title never truncates at 1440px.
5. A value the API lacks keeps its slot and shows "—" or a short reason; report the gap; never invent it.
6. Never show internal IDs, enum keys (`ACTIVE`), JSON or stack traces; translate them into readable copy.
7. Accessibility: AA contrast, keyboard-reachable controls in visual order, labelled inputs, `aria-current="page"` on the active nav item.

## 6. Copy and language

- All UI text goes through i18next: `frontend/src/locales/vi.json` and `en.json`, same keys in both. No hard-coded strings.
- Vietnamese is the source copy; English translates it with the established domain terms. Each screen renders fully in the selected language.
- Product names stay as they are in both languages: `EduBranch AI`, `Case Study`, `Branching Study`, `Review Study`, `Journey Review`, `AI Draft`, `AI-assisted`.
- Buttons: 1–3 words, sentence case (`Tạo khóa học`, `Xuất bản`, `Thử hướng khác`). No exclamation marks, no filler, no grading terms.
- English keys stay `PROPOSED` in the l10n registry until the PO approves them; unapproved English is not released (`node scripts/l10n-approval-check.mjs --release`).

## 7. Pedagogy and security in the UI (from FND §4–§6; never relax)

- Students see only `PUBLISHED` cases. Branching Study is experience-first: no consequence, reasoning form or tree canvas during the decision phase; consequences and alternatives appear only in Journey Review; retry starts a new attempt.
- AI Challenge Support asks counter-questions only, at most 2 rounds, never grades.
- Client validation mirrors the server (reasoning 10–2000 chars, password ≥ 8, PDF/DOCX ≤ 50MB) with inline field errors; the server stays the authority.
- HTTP only through `src/services/apiClient.ts`; UI primitives never fetch.

## 8. UI quality bar (how a screen is judged)

A screen is ready only when, in the running app with real data:
1. It shows the content and actions its Figma frame and `UX-SCREEN-NOTES.md` require, with no fake data.
2. It looks right at 1280, 1440 and 1920 wide, and does not break at 1024: no horizontal scroll, no clipped or wrapped labels, no truncated page title.
3. All states of §5 are reachable and correct, in Vietnamese and English.
4. Spacing, type and colours use the tokens and scale above; nothing on the screen violates §1.
5. Keyboard and focus work; no console errors.
6. Before/after screenshots exist for the change and a reviewer who did not build it has checked them.

## 9. Frontend code organisation and VI/EN setup (`src/`)

### 9.1 Folders (`frontend/src`, TypeScript, import alias `@/` = `src/`)
| Folder | Holds | Rule |
|---|---|---|
| `main.tsx`, `App.tsx` | thin entry and root | no logic beyond mounting providers and routes |
| `providers/AppProviders.tsx` | app-wide providers (i18n today) | new global providers go here, not in `main.tsx` |
| `config/` | `api.ts` (base URL, timeout from `VITE_API_BASE_URL`), `devTools.ts` (`VITE_ENABLE_DEV_LOGIN`) | only public, frontend-safe values; no secrets |
| `lib/` | `i18n.ts` | library setup only |
| `routes/` | `paths.ts` (`PATHS`, `buildPath`, `ROLE_HOME`), `AppRoutes.tsx`, `PrivateRoute.tsx`, `guards.ts` | every route string comes from `paths.ts` |
| `layouts/` | `PublicLayout`, `LecturerLayout`, `StudentLayout`, `AdminLayout`; `shell/` = `AppShell`, `Sidebar`, `HeaderActions`, `AppFooter`, `shellRoutes`, `useSidebarCollapsed`, `ShellTitleContext` | role layouts wrap `AppShell`; pages render only their content area |
| `pages/<domain>/` | route page containers (`*Page.tsx`) per domain (`auth`, `courses`, `materials`, `cases`, `branching`, `challenge`, `review-study`, `feedback`, `statistics`, `rubric`, `dashboard`, `student`, `profile`, `admin`, `landing`, `errors`) | keep `pages/<domain>/` strictly to route orchestration (`develop` still holds nested components/helpers queued for `PR 4` extraction; all **new** domain helpers use explicit `<domain><Concern>.ts` names in `src/utils/`, never `*Helpers.ts` or `*Logic.ts`) |
| `features/<domain>/components/` | `[PR 4 Target]` domain modals, cards, wizard panels & landing sections extracted from `pages/*` | route-specific multi-file feature UI lives here; cross-page primitives still belong in `components/ui/` |
| `components/ds/` | design-system primitives and page patterns (`Button`, `Field`, `SearchField`, `Dialog`, `Toast`/`ToastRegion`, `StatusTabs`, `FilterControl`, `Pagination`, `ResultCount`, `MetricCard`, badges, `CourseCard`, `Breadcrumb`, `PageContext`, `SectionHeading`, `PublicNav`, `PublicFooter`, `LanguageSwitcher`, `cx`, `FOCUS`) exported from `ds/index.ts` `[PR 4 Target: rename to ui/]` | the sole place for shared primitives; a pattern used by two pages moves here |
| `components/feedback/` | states (`Skeleton`, `EmptyState`, `ErrorState`, `NoResultsState`, `StatusPage` + 403/404/500 pages, `SessionExpiredDialog`, `[PR 4 Target: ErrorBoundary.tsx]`) and shared feedback views | every loading/empty/error/crash state uses these |
| `components/<domain>/` | domain widgets shared by several pages (`brand/LogoMark`, `cases/CaseGovernanceBar`, `stats/BranchStatsChart`) | no HTTP calls |
| `services/` | `apiClient.ts` (Axios + JWT interceptors) and one `<domain>Service.ts` per backend domain; `mappers/` turn API DTOs into view models | all HTTP goes through `apiClient`; mappers are unit-tested |
| `stores/` | Zustand stores for cross-page state (`authStore`, `caseStudyStore`) | page UI state stays local; no server data cached in a store without an invalidation rule |
| `hooks/` | `[PR 4 Target]` shared domain & UI hooks (`use<DomainNoun>.ts`, extracted from `pages/*`) | reusable stateful client logic with co-located `*.spec.ts` |
| `types/` | shared TypeScript types | |
| `utils/` | pure domain-scoped utilities (`navigation.ts`, plus PR 4 extractions: `statisticsFormatting.ts`, `caseTreeTopology.ts`, etc.) | pure, unit-tested, explicit `<domain><Concern>.ts` naming (no vague `utils.ts`/`*Helpers.ts`) |
| `locales/` | `vi.json`, `en.json` | see §9.2 |
| `qa/` | cross-cutting QA specs | |
Tests: `*.spec.ts` beside the code, run by the Node test runner (`npm test`, files listed in `package.json`); Playwright e2e in `frontend/tests/e2e`, visual diff in `frontend/tests/visual`. Libraries in use: React 19, React Router, Zustand, Axios, i18next + react-i18next + i18next-browser-languagedetector, framer-motion, lucide-react, ReactFlow, TailwindCSS v4. (`@fontsource/roboto` in `package.json` is retired and queued for removal; fonts migrate to `Plus Jakarta Sans` + `Inter` in code-sync). A new library needs an ADR and PO approval.

> **Approved Code-Sync Target (PO 2026-11-25 — Target Modular Frontend Architecture, detailed in [`SERVICE-BOUNDARIES.md §5.2`](../../docs/architecture/SERVICE-BOUNDARIES.md) & [`03-engineering-and-task-standards.md §8`](03-engineering-and-task-standards.md))**:
> While `develop` currently holds monolithic `frontend/src/index.css` `@theme` (+ legacy `App.css`), primitives in `components/ds/`, sub-components/hooks/helpers inside `pages/<domain>/`, vague `*Parts.tsx`/`*Helpers.ts` names, and legacy re-export shims (`pages/StatisticsPage.tsx`, `pages/student/ReviewFeedbackPage.tsx`), the PO-approved refactor target (`PR 4 Frontend`, execute only in its authorized PR) completes EduBranch-AI's layered TypeScript SPA layout:
> - **CSS modules (`src/styles/`)**: split Tailwind v4 `@theme` tokens and base/component/layout/landing/auth stylesheets (`main.css`, `variables.css`, `base.css`, `components.css`, `layout.css`, `landing.css`, `auth.css`) using Light-only Navy `#2A4E7F` / Sky `#00A5F5`, drop `App.css`, and migrate font dependencies from `@fontsource/roboto` to `Plus Jakarta Sans` + `Inter`.
> - **Components, Features & Shims**: rename `components/ds/` → `components/ui/`, retain `components/feedback/` and cross-page domain widgets cleanly (zero parallel core primitive folder), extract page-embedded sub-components into `features/<domain>/components/`, and delete legacy `pages/StatisticsPage.tsx` and `pages/student/ReviewFeedbackPage.tsx` compatibility shims.
> - **Hooks, Utils & Error Boundary**: move domain hooks/helpers out of `pages/*` (replacing vague `parts.tsx`, `CaseReviewParts.tsx`, `StudioParts.tsx`, `statisticsHelpers.ts`, `adminErrorHelper.ts`, `*Logic.ts` with clear, single-responsibility filenames) into `src/hooks/` (`use<DomainNoun>.ts`) and domain-scoped pure `src/utils/` modules (`navigation.ts`, `formatting.ts`, `caseTreeTopology.ts`, etc.), and wrap the app root (`App.tsx`) in `ErrorBoundary`.
> - **Core Runtime Invariants**: keep React 19, TypeScript 6, Zustand (`stores/authStore.ts`), Axios + `services/mappers/`, `routes/paths.ts`, i18next VI/EN, and Light-only theme strictly unified (zero untyped `.jsx`, dual state/query libraries, `.dark` toggles, or non-university terminology).

### 9.2 VI/EN setup (`src/lib/i18n.ts`)
- Resources: `locales/vi.json` and `locales/en.json`, one `translation` namespace, the same key set in both files. Keys are grouped by top-level key: `g1` public/auth, `g2` courses/materials, `g3` cases, `g4` lecturer dashboard/feedback/statistics/profile, `g5` student flows, `g6` admin, plus `common`, `nav`, `errors`, `shell`, `states`, `authRecovery`, `caseReview`, `ragInspector`, `rubric`. A new screen adds its keys under its group; never a new locale file.
- Default and fallback language `vi`; supported `vi`, `en` (`SUPPORTED_LANGUAGES`, `LANGUAGE_NAMES`).
- The choice is stored in `localStorage["edubranch-lang"]`; the browser language is ignored on purpose, so a first visit always opens in Vietnamese.
- The switch is `ds/LanguageSwitcher`, in the app header (`HeaderActions`) and the public nav (`PublicNav`). Changing language re-renders in place; no reload, no route change.
- In components: `const { t } = useTranslation()`; interpolation `{{name}}`; plurals with i18next `_one`/`_other`; never concatenate translated fragments; dates and numbers formatted for the active language.
- English copy is registered in `docs/l10n/shared-copy-review.md` (or `specs/*/l10n-copy-review.md`) as `PROPOSED` until the PO approves it (§6).
