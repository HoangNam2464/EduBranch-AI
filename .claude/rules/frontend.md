---
paths:
  - "frontend/**"
---
# Frontend rules (React 19 + TypeScript + TailwindCSS v4)

Read first: R01 `.agents/rules/01-ui-design-standards.md` (single design source), the screen's Figma frame and `docs/design/UX-SCREEN-NOTES.md` entry, and the feature rule `.agents/rules/feature-<domain>.md`.

## Structure
- Pages `src/pages/<domain>/`; layouts `src/layouts/` (`AppShell`, `Sidebar`, `HeaderActions` in `layouts/shell/`; role layouts `LecturerLayout`, `StudentLayout`, `AdminLayout`, `PublicLayout`).
- Shared UI: `src/components/ds` (primitives and page patterns: `Button`, `Field`, `Dialog`, `Toast`, `StatusTabs`, `Pagination`, `SearchField`, `CaseStatusBadge`, `LearningModeBadge`, `AiOriginBadge`, `MetricCard`, …) and `src/components/feedback` (`Skeleton`, `EmptyState`, `ErrorState`, `NoResultsState`, status pages, `SessionExpiredDialog`). Extend these; never create a parallel version in a page folder. A component used by two pages moves into `ds`.
- HTTP only through `src/services/apiClient.ts` (Axios, JWT interceptors, `VITE_API_BASE_URL`); one service per domain in `src/services/`, response mapping in `src/services/mappers/` (unit-tested). Never call the AI service.
- State: Zustand stores in `src/stores/` for cross-page state (auth, session); local state for page UI. No server data duplicated into stores without an invalidation rule.
- Routes: only `PATHS` and `buildPath()` from `src/routes/paths.ts`; guards in `src/routes/`; role homes in `ROLE_HOME`. Never hard-code a route string.

## Styling
Follow R01 §2–§5. In short: tokens from `src/index.css` `@theme` (the only place values live; add a missing token there, never inline a hex); app-shell screens fluid beside the sidebar, `max-w-7xl` only on landing, public header/footer and auth; surface ladder page → canvas → card → one inset; `lucide-react` icons; framer-motion only for purposeful transitions with `prefers-reduced-motion`. Light mode only: the `ThemeToggle` and `.dark` styles still on `develop` (PR #54) are to be removed; never extend them or add `dark:` classes.

## Copy and i18n
- Every UI string goes through i18next. Today all strings live in `src/locales/vi.json` and `src/locales/en.json` (consolidated in commit `b4854d1`), grouped by top-level key: `g1` public/auth, `g2` courses/materials, `g3` cases, `g4` lecturer dashboard/feedback/statistics/profile, `g5` student flows, `g6` admin, plus `common`, `nav`, `errors`, `shell`, `states`, `authRecovery`, `caseReview`, `ragInspector`, `rubric`. Same key set in both files.
- Vietnamese is the default and the source copy; English translates the approved Vietnamese copy with established domain terms. Each screen renders fully in one language.
- Every English key needs a registry row (`docs/l10n/shared-copy-review.md` for base `en.json`, `specs/*/l10n-copy-review.md` for feature copy) with status `PROPOSED`; only the PO sets `APPROVED`. `node scripts/l10n-approval-check.mjs` must exit 0 (QG1).

## Data and states
- Real API data only. When Figma shows a field the API lacks, report the gap; never fake it.
- Every data view handles default, loading (`Skeleton`), empty, error (with retry), 403 and success; mutations show pending and a toast; destructive actions use a confirm `Dialog`.
- Accessibility: labelled inputs, visible focus ring (R01 §4), keyboard-reachable dialogs with focus trap, contrast AA.

## Tests and checks
`npm run lint`, `npm test` (add new `*.spec.ts` to the `test` script list), `npm run build`; for UI, the browser check in `CLAUDE.md` §5 step 5 and the R01 §8 quality bar. `npm run test:visual` (frames and budgets in `tests/visual/screens.ts`) is a pixel diff against Figma for reference, not the pass criterion. E2E: `npm run test:e2e`.

Visual QA in a cloud session (no Google Chrome, no Docker):
- Seed: `node tests/visual/seed-local.mjs` promotes the admin with `docker exec edubranch_postgres psql …` and reads `backend/.env`; without Docker put a temporary `docker` shim on `PATH` that forwards to `psql -h localhost`, and a temporary `backend/.env` with `POSTGRES_USER`/`POSTGRES_DB`. Material upload fails without MinIO; cases need an AI provider key.
- The visual config uses `channel: "chrome"`; run it through a temporary, uncommitted override that spreads the config and sets `use: { ...base.use, channel: undefined, launchOptions: { executablePath: "/opt/pw-browsers/chromium" } }`, then `npx playwright test -c <override> -g "<frame codes>"`.
- Text renders with the container's `system-ui` font, so budgets signed off on Windows can differ; report the environment with every number. Delete the shim, the override, `backend/.env` and `.env.visual.local` afterwards.
