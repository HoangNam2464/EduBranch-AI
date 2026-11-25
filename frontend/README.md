# EduBranch AI — Frontend

> **Document Class**: `[SUPPORTING GUIDE]` · **Visual & UI Governance SSOT**: [`.agents/rules/01-ui-design-standards.md`](../.agents/rules/01-ui-design-standards.md) (`R01`) & [`.agents/rules/03-engineering-and-task-standards.md §5`](../.agents/rules/03-engineering-and-task-standards.md)

React 19 + Vite + TypeScript + TailwindCSS v4 SPA for the **EduBranch AI** platform. Connects to the NestJS Backend Gateway (`/api/v1/*`) across Lecturer, Student, Admin, and Public flows (with Forgot/Reset Password UI, Lecturer Dashboard, Rubric, and Admin UI implemented in frontend; pending backend endpoints in PR #80 / backlog).

---

## Responsibilities

- **Public & Auth (`PublicLayout`)**: Scrolling landing page (`/`), Login (`/login` with `rememberMe` UI + Google/Microsoft placeholder buttons), Register (`/register`), Forgot & Reset Password MVP UI (`/forgot-password`, `/reset-password` — backend API pending).
- **Lecturer (`LecturerLayout`)**: Dashboard, Courses (create/edit/soft-archive + invite code), Materials (PDF/DOCX upload + RAG source inspector), 3-step AI Studio, Case Library, interactive ReactFlow / Review Study Case Review & Publishing, Feedback (overview & case-scoped), Statistics, Case Quality Rubric, and Profile.
- **Student (`StudentLayout`)**: Student Desk, My Courses & Join Class by Invite Code, Branching Study (Experience-first Player → Journey Review + retrospective reasoning → Reflection & Retry), Review Study (Context/Problem → Submission → Feedback/Reflection), AI Challenge Support (1–2 Socratic rounds, zero grading), Attempt History, Profile.
- **Admin (`AdminLayout`)**: Admin Login, Dashboard, Users, Courses, Cases, AI Service (view-only), Research & Rubric, Logs, Settings (`BE-032` APIs pending in PR #80).

---

## Technology

- **Framework**: React 19 + Vite 8 + TypeScript 6 (strict mode)
- **Styling & Typography**: TailwindCSS v4 (`@theme` tokens); Light-only theme (`#2A4E7F` Navy / `#00A5F5` Sky); typography target `Plus Jakarta Sans` + `Inter` (PO 2026-11-25; `@fontsource/roboto` legacy dependency queued for removal)
- **State & Routing**: Zustand (`stores/authStore.ts`) · React Router v7 (`routes/paths.ts`)
- **HTTP & i18n**: Axios (`services/apiClient.ts` + domain services/mappers) · `i18next` + `react-i18next` (`vi.json` Vietnamese default, `en.json` English)
- **Visualization & Motion**: ReactFlow 11 · Framer Motion (`ADR-002`, respects `prefers-reduced-motion`) · `lucide-react`

---

## Architecture & Directory Map (`develop` Current vs Target Modular Layout)

> Full Current vs Target Architecture matrix and naming conventions: [`SERVICE-BOUNDARIES.md §5.2`](../docs/architecture/SERVICE-BOUNDARIES.md), [`R01 §9.1`](../.agents/rules/01-ui-design-standards.md), and [`.agents/rules/03-engineering-and-task-standards.md §8`](../.agents/rules/03-engineering-and-task-standards.md).

```text
frontend/src/
├── main.tsx / App.tsx      ← Entry & root route mount [PR 4: add root ErrorBoundary]
├── routes/                 ← paths.ts (route SSOT), AppRoutes.tsx, PrivateRoute.tsx, guards.ts
├── layouts/                ← Public, Lecturer, Student, Admin + shared layouts/shell/ (AppShell, Sidebar, HeaderActions)
├── pages/<domain>/         ← Route containers by domain [PR 4: delete legacy shims & extract nested UI]
├── features/<domain>/      ← [PR 4 Target] Domain sub-components & modals extracted from pages/*
├── components/
│   ├── ds/                 ← Shared UI primitives (39 files) [PR 4 Target: rename to ui/]
│   ├── feedback/           ← Shared UI states (Skeleton, Empty, Error, NoResults, 403/404/500, 401 dialog)
│   └── <domain>/           ← Cross-page domain widgets (brand/, cases/, stats/)
├── services/               ← apiClient.ts (sole Axios instance) + domain services & mappers/
├── stores/                 ← Zustand stores (authStore, caseStudyStore)
├── hooks/ · utils/         ← Shared hooks (`use<Domain>.ts`) & domain-scoped pure modules [PR 4 Target: extract page-trapped helpers]
├── locales/                ← vi.json / en.json (parity + scripts/l10n-approval-check.mjs)
├── config/ · providers/    ← api.ts, devTools.ts · AppProviders.tsx
├── lib/ · types/           ← i18n.ts · shared types
└── index.css               ← Tailwind v4 @theme tokens [PR 4 Target: modular src/styles/, drop App.css]
```

### Mandatory Conventions
- Import via `@/` alias (`@/routes/paths`); never hardcode URL strings (`PATHS` / `buildPath`).
- All UI text MUST reside in both `locales/vi.json` and `locales/en.json`; register English strings as `PROPOSED` in `docs/l10n/shared-copy-review.md` (`node scripts/l10n-approval-check.mjs`).
- Light-only theme: dark mode and `ThemeToggle` were removed (`R01 §0`); never add `dark:` classes.
- Never call `ai-service` directly from the browser; all requests route through `apiClient.ts` → Backend Gateway.

---

## Local Setup & Verification

```bash
npm install
cp .env.example .env.local
npm run dev      # Frontend at http://localhost:5173
npm run lint     # oxlint
npm test         # Node test runner (npx tsx --test)
npm run build    # TypeScript check + Vite production build
```
