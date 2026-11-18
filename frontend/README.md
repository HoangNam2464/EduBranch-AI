# EduBranch AI — Frontend

React 19 + Vite + TypeScript + TailwindCSS v4 UI for the EduBranch AI platform.

The current student learning screens are an interactive prototype: they use
sample case data and a local Zustand store. Persistent attempts, lecturer
feedback, and published-case access will be connected through the NestJS
Backend Gateway as the domain APIs are implemented.

## Responsibilities

- Lecturer UI: courses, material upload, case generation, review/edit/publish, statistics
- Student UI: Branching Case Player (experience-first), Journey Review (retrospective reasoning), Reflection, Review Study, Challenge Support
- Authentication: login, registration
- Decision tree visualization via ReactFlow

## Technology

- **Framework**: React 19 + Vite
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **State**: Zustand
- **HTTP**: Axios (centralized client with JWT interceptors)
- **Routing**: React Router v7
- **i18n**: i18next + react-i18next (Vietnamese default, English available)
- **Decision Tree Visualization**: ReactFlow

## Architecture Rules

- **Frontend → Backend Gateway only** — Never call internal FastAPI AI Service directly
- **API calls via apiClient** — Never call axios directly in components
- **Business logic in services** — Keep UI components presentation-only
- **Centralized state** — Zustand stores in `src/stores/`
- **Never store secrets** — No API keys in frontend environment variables

## Source Structure

```
src/
├── main.tsx              ← Entry: providers + <App/>
├── App.tsx               ← Renders the route tree
├── routes/
│   ├── paths.ts          ← SINGLE source of every URL (PATHS, ROLE_HOME, buildPath, withQuery)
│   ├── AppRoutes.tsx     ← Route tree (createBrowserRouter), one area per role
│   ├── PrivateRoute.tsx  ← Shared role guard for Lecturer / Student / Admin
│   └── guards.ts         ← Pure guard rules (unit-tested)
├── layouts/              ← PublicLayout, LecturerLayout, StudentLayout, AdminLayout
├── pages/<feature>/      ← Screens grouped by feature, aligned with backend modules:
│   ├── landing/ auth/ profile/ dashboard/
│   ├── courses/ materials/ cases/ rubric/ feedback/ statistics/
│   ├── branching/ review-study/ challenge/
│   ├── admin/            ← Admin management screens
│   └── errors/           ← 404 and route error pages
├── components/
│   ├── ui/               ← Shared primitives (Button, Alert, ForbiddenPage, logo…)
│   └── <feature>/        ← Feature components (e.g. cases/CaseGovernanceBar)
├── services/             ← apiClient.ts (the only Axios instance) + one service per feature
├── stores/               ← Zustand stores
├── config/api.ts         ← API base URL and timeout
├── providers/            ← AppProviders (i18n; add query/theme providers here)
├── lib/i18n.ts           ← i18next setup (Vietnamese default, choice kept in localStorage)
├── locales/              ← vi.json / en.json (same keys in both)
├── types/                ← Shared domain types
└── utils/                ← Pure helpers (e.g. safe returnUrl resolution)
```

### Conventions

- Import with the `@/` alias (`@/routes/paths`), not long relative paths.
- Never hardcode a URL: use `PATHS.X`, or `buildPath(PATHS.X, { id })` for routes with params.
- New UI text goes into `locales/vi.json` and `locales/en.json` with the same key, read with `t("key")`.
  Screens move their remaining hardcoded text into the locale files when they are reworked to Figma page 08.
- Route guards only steer the UI; the backend is still the authorization boundary.

## App shell (FE-025, Figma page 08)

- `layouts/shell/AppShell.tsx` is the one layout for Lecturer, Student and Admin: sidebar 224px
  (collapsed 72px, remembered for the browser session), header with search / VI|EN / theme /
  notifications / settings / account, and the shared footer. Menus, the active item and the
  header title come from `layouts/shell/shellRoutes.ts` (pure, unit-tested).
- Student menu follows the context: main area (Bàn học, Khóa học của tôi, Tham gia lớp học),
  inside a Branching case (Tình huống, Lịch sử lần làm, Journey Review) and inside a Review Study
  case (Bài làm, Phản hồi). Items whose target does not exist yet are disabled, not faked.
- Screens that show a record name call `useShellTitle(name)` to replace the default title.
- Header search writes the keyword to `?q=` on the current screen; screens filter by it.
- The notification dot shows only when there are unread notifications (no data source yet).
  The theme button is a placeholder: the dark theme is not designed.
- Shared states live in `components/feedback/` (01.1–01.8): skeletons, empty, load error,
  no results, full-page 403/404/500 and the 401 dialog. Opening another role's page shows the
  403 page; a 401 while signed in opens the "Phiên đăng nhập đã hết hạn" dialog.
- Design tokens (`index.css` `@theme`): `bg-canvas`, `text-ink`, `border-line`, `bg-primary`,
  `text-accent`, `rounded-eb-xl`… Font: Roboto (self-hosted). Icons: `lucide-react`.

## Tests

```bash
npm run build   # type-check + production build (same as CI)
npm test        # node:test specs run with tsx
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
# Frontend at http://localhost:5173
```

## Build

```bash
npm run build
```
