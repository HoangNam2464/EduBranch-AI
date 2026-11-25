---
description: >-
  Shared engineering, database, AI-service, frontend-sync, and task-identifier
  standards for EduBranch-AI across all coding agents (Antigravity and Claude
  Code). Supplements FND, R01, and operating policy without duplicating them.
trigger: always_on
---

# EduBranch-AI — Engineering & Task Standards

> **Authority**: Subordinate to Proposal V1.2, approved PO decisions, `AGENTS.md`, `00-project-foundation.md` (FND), `01-ui-design-standards.md` (R01), `02-agent-operating-policy.md`, and `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. Canonical source for shared tier rules previously isolated in tool-specific folders.

---

## 1. Task Identifiers & Jira Tracking Discipline

Three distinct identifiers exist in this repository; **never conflate them**:
- **Jira Key** (`EBA-1`…`EBA-106`): The live Jira issue in project `EBA`. Always the authoritative live execution status.
- **Group ID** (`FE-026`, `BE-029`, `DES-001`, `OPS-001`, `QA-003`): Role/functional ID used in issue summaries, commit tags `[FE-026]`, and spec titles.
- **Master Task ID** (`EBA-101`…`EBA-435`): Immutable baseline planning ID in `docs/01_MASTER-TASKS.md` (84 tasks / 336 SP). It is **NOT** a Jira key—identical strings denote completely different issues (e.g., Master `EBA-105` = `BE-001`, whereas Jira `EBA-105` = `QA-023`).

**Mandatory Rules**:
- Always cite both Group ID and explicit label (e.g., `BE-001 / Master Task ID EBA-105 / Jira EBA-5`). Never use a bare `EBA-xxx` ambiguously.
- Never use any task ID in a Git branch name (`FND §7.2`).
- Read live task state from Jira + `docs/04_JIRA/JIRA-KEY-MAP.md`, not from baseline backlog snapshot columns.

---

## 2. Backend Gateway Standards (`backend/`)

- **Architecture**: NestJS 10 + TypeScript (`src/modules/<domain>/`: default `controller -> service -> DatabaseService`; selectively extract `<domain>.repository.ts` ONLY in SQL-dense, multi-table transactional, or `INV-01` gatekeeper modules such as `case/`, `branching-attempt/`, `statistics/`, `evaluation/` — never add pass-through boilerplate repositories in simple CRUD modules). Uses raw parameterized SQL via `pg` Pool (`src/common/database/database.service.ts`) — **no TypeORM, no Prisma, no query builder**. Target refactoring runs only in authorized scoped PRs (`docs/architecture/SERVICE-BOUNDARIES.md §5.1`, naming rules in `§8`).
- **Security & Auth**:
  - Global prefix `/api/v1`, global whitelist `ValidationPipe`, global `JwtAuthGuard` + `RolesGuard` (`src/main.ts`). Public endpoints require `@Public()`; role constraints use `@Roles(...)`.
  - Auth endpoints apply `RateLimiterGuard` + BCrypt (`BCRYPT_ROUNDS = 12`). Currently `develop` issues an 8h stateless JWT access token (no refresh token rotation); `rememberMe` extended TTL and backend password-reset APIs remain queued MVP items (`FE` UI already exists).
  - Never build SQL with string interpolation (`$1`, `$2` parameters only). Enforce ownership filters (`lecturer_id = $user`, `student_id = $user`) and student case publication isolation (`WHERE status = 'PUBLISHED'`, `INV-01`) directly in SQL queries.
  - Multi-table mutations (case trees, attempts) must execute inside a single DB transaction with rollback on error.
- **Integrations & Cross-Cutting Modules**:
  - AI calls go exclusively through `src/common/ai-client/ai-client.service.ts` (`X-Internal-API-Key`).
  - Object storage goes through `src/common/minio/` (note legacy duplicate `common/storage/` is queued for consolidation).
  - 2xx JSON responses preserve `{ status: "SUCCESS", data }` across existing controllers and FE services/mappers (technical decision delegated by PO on 2026-11-25); target cross-cutting standardization (`PR 2 Backend` per `SERVICE-BOUNDARIES.md §5.1`) adds global `HttpExceptionFilter` (`common/exception/`), prompt/input sanitizer + structured `[SECURITY_AUDIT]` logger (`common/security/`), optional `common/dto/api-response.ts` helper, and typed config (`common/config/`).
- **Testing**: Unit `npm test` (`src/**/*.spec.ts`); E2E `npm run test:e2e` (`backend/test/`). Always include negative role-matrix (`401`/`403`) and ownership-leak cases. Never report skipped live tests (`*.live.spec.ts` without MinIO/AI service) as passed.

---

## 3. Database & Migration Standards (`backend/migrations/`, `docs/database/`)

- **Authoritative Directory**: `backend/migrations/V<n>__<name>.sql` (`V1`–`V5` active), applied sequentially on startup by `backend/src/common/database/migration-runner.ts` (`AUTO_MIGRATE`) under a PostgreSQL advisory lock — **uses this built-in runner exclusively, never external schema migration CLIs**.
- **Stale Copy Warning**: `infrastructure/postgres/migrations/` is an unexecuted stale copy lacking `V5`. Never edit it as a migration source; Docker Compose mounts only `infrastructure/postgres/init/`.
- **Strict Migration Rules**:
  - Never modify an already-applied migration (`V1`–`V5`); add `V<n+1>__<name>.sql` and update `docs/database/DATA-MODEL.md` in the same change.
  - Naming: plural `snake_case` tables, `id UUID DEFAULT uuid_generate_v4()`, `<entity>_id` foreign keys, `created_at` / `updated_at TIMESTAMPTZ`.
  - Encode core invariants as DB constraints (`CHECK (current_round >= 0 AND current_round <= 2)`, `chk_feedback_one_target`, `chk_challenge_one_target`, `UNIQUE (course_id, student_id)`).
  - Never use non-transactional DDL (`CREATE INDEX CONCURRENTLY`, `VACUUM`) inside migration scripts (`docs/database/OPERATIONAL-BASELINE-GUIDE.md §3.2`).
  - `V1` still creates retired legacy tables (`simulation_sessions`, `student_arguments`, `debate_*`); never reference or build on them.
  - Never delete Docker volumes or persisted database data (`02-agent-operating-policy.md §11`).

---

## 4. AI Service Standards (`ai-service/`)

- **Boundaries**: Strictly internal (`/internal/v1/*` protected by `verify_internal_api_key` in `app/core/security.py`; `/health` is the sole unauthenticated probe). Never expose publicly or store business persistence state.
- **Models & Providers**: Route every LLM or embedding call through `app/providers/factory.py`. Pinned models: `gemini-3.5-flash` (PO 2026-11-17) and `gemini-embedding-001` requested at `768` dims (matching V4 `document_chunks.embedding vector(768)`). Changing models or providers requires a PO decision.
- **RAG & Safety Guardrails**:
  - Always place system prompt instructions first; wrap retrieved material chunks strictly inside `<sources>...</sources>` tags with tag look-alikes neutralized (`app/retrieval/service.py`); always scope vector queries by `course_id`.
  - Case generation outputs validate against Pydantic v2 schemas (`app/generation/schemas/decision_tree.py`: node references, root reachability, 3-color DFS acyclicity, 2–4 options per non-terminal node, ≥1 terminal node) with bounded retries; invalid output fails cleanly with HTTP `502` and is never repaired silently.
  - Challenge Support enforces `MAX_ROUNDS = 2` (`app/challenge_support/`) and schemas explicitly prohibit scores, grades, rankings, or pass/fail verdicts.
  - Never log API keys or full prompts.
- **Runtime & Tests**: Python 3.12 (`uv venv -p python3.12`). Run `pytest` mocking `factory.py`; report live tests as `skipped` or `BLOCKED` when API keys/services are absent.

---

## 5. Frontend Code-Sync & Quality Standards (`frontend/`)

- Visual identity, tokens, layout, components, states, VI/EN copy, and the UI quality bar live solely in **`.agents/rules/01-ui-design-standards.md` (R01)**. Never restate hex codes outside R01 §0 and `frontend/src/index.css`.
- **Current Runtime (`develop`) vs Approved Target Modular Architecture (PO 2026-11-25)**:
  - *Current `develop`*: Tailwind v4 `@theme` tokens in `frontend/src/index.css` (+ legacy `App.css`), shared UI primitives in `src/components/ds/`, sub-components/hooks/helpers nested inside `src/pages/<domain>/`, legacy compatibility re-export shims (`pages/StatisticsPage.tsx`, `pages/student/ReviewFeedbackPage.tsx`), vague `*Parts.tsx`/`*Helpers.ts` names, and `@fontsource/roboto` legacy dependency in `package.json`. When modifying existing UI before the Frontend Target PR, follow existing `develop` imports (`@/components/ds`, `index.css`) unless specifically executing that authorized refactor PR.
  - *Approved Target (`PR 4 Frontend`, per `SERVICE-BOUNDARIES.md §5.2`, `R01 §9.1` & `§8`)*: Modular Tailwind v4 stylesheets (`src/styles/`), `src/components/ui/` (renamed from `ds/`) + `components/feedback/`, `src/features/<domain>/components/`, shared cross-page `src/hooks/`, domain-scoped pure `src/utils/` modules, root `ErrorBoundary` (`App.tsx`), `Plus Jakarta Sans` + `Inter` Light-only typography/surfaces, and removal of `App.css`, legacy shims, and vague page-trapped helpers. Never introduce untyped `.jsx`, `.dark` classes, alternate palettes, parallel UI primitive directories, duplicate state/query libraries, or pre-university (`K-12`) terminology.
- **Localization Registry Gate**: Every English copy string must be added to `frontend/src/locales/en.json` matching `vi.json` and registered as `PROPOSED` in `docs/l10n/shared-copy-review.md` (or feature `specs/*/l10n-copy-review.md`). Run `node scripts/l10n-approval-check.mjs` before commit/PR (`--release` checks `APPROVED` status).
- **Checks**: `npm run lint`, `npm test` (Node `tsx --test`), `npm run build`, and browser verification per R01 §8.

---

## 6. Git, PR & Quality Gate Mechanics

- Follow `FND §7` (branching/commits) and `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` (Stage 0–7, Quality Gates `QG1`–`QG7`).
- Stage files explicitly by path (`git add -- <path>`, never `git add .` or `-A`; use `git add -f -- <path>` only for tracked files under gitignored `.claude/` or `.agents/skills/`). Ensure `.githooks/pre-commit` is active (`git config core.hooksPath .githooks`).
- Any new commit on an open PR invalidates prior CI runs: `QG5` CI evidence binds strictly to the exact PR head SHA before `QG6` / merge.

---

## 7. Known Defect Traps & Mandatory Code-Fix Rules (Prevent Recurrence)

AI coding agents MUST enforce these guardrails derived directly from verified defects on `develop` (`PROJECT-AUDIT-2026-11-21`, `UI-AUDIT`, and live codebase checks):

### Backend & Build (`backend/`)
- **Rule B1 — `dist/main.js` & Docker Build Alignment (`F-16`)**: `backend/tsconfig.json` currently compiles `test/` alongside `src/`, emitting `dist/src/main.js` while `package.json` `start:prod` and `Dockerfile` run `node dist/main`. Always ensure `src/` compiles to `dist/main.js` (e.g., dedicated build config / `"rootDir": "src"` + `"include": ["src/**/*"]` and `.dockerignore` excluding `test/`) or align `start:prod`/`CMD` and verify `node dist/main` resolves without `MODULE_NOT_FOUND`.
- **Rule B2 — Single Object-Storage Module**: Use `common/minio/` (`MinioModule`, `MinioService`) exclusively. Never import from legacy duplicate `common/storage/` (queued for removal in PR 2 Backend).
- **Rule B3 — Centralized Error & Audit Handling**: Never invent custom error JSON shapes in controllers or leak raw stack traces / DB errors. Keep `{ status: "SUCCESS", data }` on 2xx responses and route errors through global `HttpExceptionFilter` (`common/exception/`) + prompt/secret sanitization via `common/security/` once added in PR 2 Backend.
- **Rule B4 — Auth Parity Checklist**: Do not treat Frontend auth screens (`rememberMe`, `/forgot-password`, `/reset-password`, `RegisterPage` studentId/department inputs, `users.is_active` account lock) as complete until Backend DTOs, JWT TTL handling, `403` inactive-account checks, and FE persistence (`localStorage` vs `sessionStorage`) are integrated and negative-tested.

### AI Service (`ai-service/`)
- **Rule A1 — Provider Patching Target (`F-07`)**: Resolve and mock all LLM/embedding providers strictly through `app/providers/factory.py` (`get_provider()`) or the actual active module symbol (e.g. `app.generation.case_generator`), **never** the removed `app.generation.service.get_provider` symbol (broken in `tests/test_retrieval_boundary.py:307`).
- **Rule A2 — Unconditional `<sources>` Tag Escaping (`QA-006`)**: Always sanitize retrieved chunk text with `sanitize_sources_boundary` (`app/retrieval/retriever.py`) inside `build_rag_context` (`app/retrieval/service.py`) so injected `</sources>`/`<sources>` look-alikes cannot prematurely close the untrusted boundary. Keep `test_ac3_document_cannot_close_the_sources_boundary` passing without `xfail` once fixed.

### Frontend (`frontend/`) & Design Sync (`R01`)
- **Rule F1 — Fixed-Height Validation Slots (No 60px Form Jump)**: Never inject multi-line `<FormMessage>` banners conditionally above auth inputs (`LoginPage`, `RegisterPage`, `AdminLoginPage`) without reserving slot space or placing inline per-field error slots, which shifts inputs ~60px on submit.
- **Rule F2 — Zero Placeholder KPIs or Silent `404`s (`F-06 / UI-AUDIT X4–X5`)**: Never render hardcoded sample metrics, fake activity logs, or empty blanks when an API returns missing/empty data (e.g. `AdminDashboardPage`). Render skeleton states, honest `"—"` with context note, a single page-level `EmptyState`, or recoverable `ErrorState`.
- **Rule F3 — Shell Flex Protection, Pill Wrapping & Target Styling (`UI-AUDIT X1–X3, X7`)**:
  - Protect shell header titles (`truncate`) with shrinking search controls (`min-w-* shrink`) so page headings never truncate at `1440px` (`X2`).
  - Add `whitespace-nowrap shrink-0` to compact status pills and metric/count badges (`X3`).
  - Route strictly via `PATHS` and `ROLE_HOME` from `src/routes/paths.ts`; remove `.dark` toggles and `@fontsource/roboto` legacy references in the Frontend Target PR (`Plus Jakarta Sans` + `Inter`, Light-only `#2A4E7F`/`#00A5F5`).
  - Verify real browser layouts across `1024 / 1280 / 1440 / 1920` widths in both VI and EN (`R01 §8`).

### Tooling, Localization & Git (`scripts/`, `.githooks/`)
- **Rule G1 — Localization Key Registration (`F-09`)**: Every edit to `frontend/src/locales/en.json` MUST register matching `PROPOSED` entries in `docs/l10n/shared-copy-review.md` (or active `specs/*/l10n-copy-review.md`) and pass `node scripts/l10n-approval-check.mjs` cleanly for touched keys.
- **Rule G2 — Hook Executability (`F-27`)**: Keep `.githooks/*` active (`git config core.hooksPath .githooks`) and tracked with executable permissions (`100755`) so Linux/macOS CI/hosts enforce pre-commit secret checks and commit-message format.

---

## 8. Canonical Naming & Module Organization Standard

All new files, folders, symbols, routes, database objects, and docs MUST follow EduBranch-AI's independent naming system (using canonical higher-education domain terms from `00-project-foundation.md §1.2`).

### 8.1 Tier & Layer Naming Matrix

| Layer / Scope | Folder Convention | File Naming Convention | Required Suffixes / Patterns |
|---|---|---|---|
| **Backend Domain (`backend/src/modules/`)** | `kebab-case` domain (`auth`, `branching-attempt`, `lecturer-feedback`) | `kebab-case.<role>.ts` | `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.repository.ts` (SQL-dense/INV-01 only), `*.dto.ts`, `*.guard.ts`, `*.spec.ts` |
| **Backend Cross-Cutting (`backend/src/common/`)** | Explicit technical scope (`ai-client`, `config`, `database`, `dto`, `exception`, `health`, `minio`, `security`) | `kebab-case.<role>.ts` | Zero duplicate provider folders (`common/storage/` banned alongside `common/minio/`); no generic catch-all folders |
| **AI Service (`ai-service/app/`)** | `snake_case` single-concern (`core`, `providers`, `ingestion`, `retrieval`, `generation`, `challenge_support`, `evaluation`, `db`) | `snake_case.py` | Domain-clear modules (`case_generator.py`, `decision_tree.py`, `chunker.py`, `retriever.py`, `service.py`) |
| **Frontend Containers & Components** | `pages/<domain>/`, `features/<domain>/components/`, `layouts/<role>/`, `components/{ui,feedback,<domain>}/` | `PascalCase.tsx` | Route containers end in `*Page.tsx` under `pages/<domain>/`; feature UI lives in `features/<domain>/components/` |
| **Frontend Hooks, State & Services** | `hooks/`, `stores/`, `services/`, `services/mappers/`, `routes/` | `camelCase.ts` | Hooks `use<DomainNoun>.ts`; stores `<domain>Store.ts`; HTTP `<domain>Service.ts`; mappers `<domain>.ts` |
| **Frontend Scoped Utilities & Styles** | `utils/`, `styles/` (Target), `locales/` | `camelCase.ts` / `kebab-case.css` | Name exact responsibility (`navigation.ts`, `formatting.ts`, `caseTreeTopology.ts`); `styles/{main,variables,base,components,layout,landing,auth}.css` |
| **Code Symbols** | — | `PascalCase` / `camelCase` / `SCREAMING_SNAKE_CASE` | `PascalCase` classes/types/interfaces/DTOs/components (never `I`-prefix interfaces or `Impl` classes); `camelCase` functions/hooks/fields; `SCREAMING_SNAKE_CASE` constants (`PATHS`, `ROLE_HOME`, `MAX_ROUNDS`) |
| **REST APIs & PostgreSQL** | `/api/v1/<plural-kebab>` · `/internal/v1/<pkg>/<action>` | `V<n>__<snake_case>.sql` | Tables plural `snake_case`; PK `id UUID`; FK `<entity>_id`; constraints `chk_*`, `uq_*`, `idx_*`; uppercase enums |
| **Documentation (`docs/`)** | Lowercase `kebab-case/` (`mvp-scope/`, `design/screens/`) | `UPPER-KEBAB-CASE.md` | Tool-bound exceptions: `docs/README.md`, `docs/l10n/shared-copy-review.md`, `01_MASTER-TASKS.md`–`06_QA.md`, `05_FIGMA.md`, `PROJECT_OVERVIEW.md` |

### 8.2 Strict Naming Prohibitions (Rule N1–N3)
- **Rule N1 — Zero Vague Catch-All File Names**: Never create or retain non-descriptive names such as `parts.tsx`, `*Parts.tsx`, `helpers.ts`, `*Helpers.ts`, `*ErrorHelper.ts`, `*Logic.ts`, `common.ts`, `utils.ts`, `manager.ts`, `misc.ts`, or `temp.*`. Every file name must express its exact UI responsibility or domain transform (e.g., `CaseMetadataCard.tsx`, `BranchingMetricsSummary.ts`, `apiErrorMessages.ts`).
- **Rule N2 — Zero Compatibility Shims & Duplicate Layers**: Never add re-export page shims across directories (`pages/StatisticsPage.tsx`) or duplicate infrastructure folders (`common/storage/` vs `common/minio/`). Delete dead files when relocating modules inside their target refactor PR.
- **Rule N3 — Domain & Path Conciseness**: Inside `modules/case/` or `features/cases/`, drop redundant filler prefixes when the folder already establishes context, while keeping top-level services/pages globally unambiguous (`branchingAttemptService.ts`, `CaseReviewPage.tsx`).

### 8.3 Verified Source-Code Naming & Cleanup Queue (`PR 2` & `PR 4` Only)

> **Guardrail**: Do NOT modify these source files during documentation-only tasks (`PR 1`). Execute cleanly inside `PR 2 Backend` / `PR 4 Frontend` following [`SERVICE-BOUNDARIES.md §5.1–§5.3`](../../docs/architecture/SERVICE-BOUNDARIES.md) (always survey dependencies and keep `frontend/package.json` `"test"` script synced when relocating tested files):
- **Backend & Config (`PR 2`)**: Delete unused `backend/src/common/storage/` (`0` external imports); add `backend/tsconfig.build.json` (`dist/main.js`, `Rule B1`) + `.dockerignore` `test/`; add `common/exception/http-exception.filter.ts`, `common/security/{input-sanitizer.ts,security-audit.logger.ts}`, `common/dto/api-response.ts`; extract `<domain>.repository.ts` ONLY in SQL-dense/`INV-01` modules (`case/`, `branching-attempt/`, `statistics/`, `evaluation/`); clean stale env comment in `ai-service/.env.example:8`.
- **Frontend Target Refactor (`PR 4`)**:
  - *Delete legacy shims & CSS stub*: `pages/StatisticsPage.tsx`, `pages/student/ReviewFeedbackPage.tsx`, `App.css`, and `@fontsource/roboto`; split `index.css` into `styles/{main,variables,base,components,layout,landing,auth}.css` using `Plus Jakarta Sans` + `Inter`.
  - *Primitives & ErrorBoundary*: rename `components/ds/` → `components/ui/`, `components/ds/courseParts.tsx` → `components/ui/CourseMetadataChips.tsx`; add `components/feedback/ErrorBoundary.tsx` wrapping `<AppRoutes />` in `App.tsx`; clean legacy draft-file node/token comments in `CaseStatusBadge.tsx`, `ui/index.ts`, `CaseGovernanceBar.tsx`, and `CaseReviewSections.tsx`.
  - *Feature Components, Hooks & Pure Utils (extracted out of `pages/*`)*: move `pages/admin/components/AdminPanel.tsx`, `pages/auth/components/*`, `pages/branching/components/NewAttemptDialog.tsx`, `pages/cases/components/{CaseAnalytics,CaseLibraryCard,GenerationDialog}.tsx`, `pages/landing/{landingConstants.ts,sections/*Section.tsx}`, `pages/profile/components/{MiniCalendar,MonthStepper}.tsx` into `src/features/<domain>/components/`; replace vague `pages/branching/components/parts.tsx` → `BranchingStepHeader.tsx`, `pages/cases/CaseReviewParts.tsx` → `CaseReviewSections.tsx`, `pages/cases/components/StudioParts.tsx` → `StudioWizardPanels.tsx`, `pages/landing/landingShared.tsx` → `LandingSectionPrimitives.tsx`; move `useStudentCase.ts`, `useLecturerCourseCases.ts`, `usePrefersReducedMotion.ts` → `src/hooks/`; relocate pure helpers to domain-scoped `src/utils/` (`statisticsHelpers.ts` → `statisticsFormatting.ts`, `adminErrorHelper.ts` → `adminErrorMessages.ts`, `lecturerFeedbackLogic.ts` → `lecturerFeedbackFormatting.ts`, `reviewFeedbackLogic.ts` → `reviewFeedbackFormatting.ts`, `caseEdits.ts` → `caseDraftEdits.ts`, `caseTree.ts` → `caseTreeTopology.ts`, `caseUi.ts` → `caseDisplay.ts`, `describeRouteError.ts` → `routeErrorDescription.ts`, `calendar.ts` → `calendarGrid.ts`, plus `authErrors.ts`, `courseInsights.ts`, `calendarGrouping.ts`) and update `frontend/package.json` `"test"` paths in lockstep.
