---
paths:
  - "frontend/**"
---
# Frontend rules (React 19 + TypeScript + TailwindCSS v4)

Read first: R01 `.agents/rules/01-ui-design-standards.md` (single design source), the screen's Figma frame and `docs/design/UX-SCREEN-NOTES.md` entry, and the feature rule `.agents/rules/feature-<domain>.md`.

## Structure
Folders, conventions and libraries: R01 §9.1 (shared with Antigravity; do not restate here). They were learned from the PO's reference frontend (`D:\CAPSTONE_2026\EduBranch-AI-archive\reference\frontend.zip`): read it only when a pattern is unclear, extract it to the scratchpad, never into the repo, never copy its files and never name that project.

## Styling
Follow R01 §2–§5. In short: tokens from `src/index.css` `@theme` (the only place values live; add a missing token there, never inline a hex); app-shell screens fluid beside the sidebar, `max-w-7xl` only on landing, public header/footer and auth; surface ladder page → canvas → card → one inset; `lucide-react` icons; framer-motion only for purposeful transitions with `prefers-reduced-motion`. Light mode only: the `ThemeToggle` and `.dark` styles still on `develop` (PR #54) are to be removed; never extend them or add `dark:` classes.

## Copy and i18n
VI/EN setup and key groups: R01 §9.2; copy rules: R01 §6. Every English key needs a registry row with status `PROPOSED`; only the PO sets `APPROVED`. `node scripts/l10n-approval-check.mjs` must exit 0 (QG1).

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
