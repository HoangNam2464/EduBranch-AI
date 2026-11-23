# CLAUDE.md

How Claude Code works on EduBranch-AI. Stable rules only: no progress, task lists or dated status (those live in Jira and `docs/04_JIRA/JIRA-KEY-MAP.md`). When sources disagree: approved PO decisions → `AGENTS.md` → FND (`.agents/rules/00-project-foundation.md`) → R01 for UI (`.agents/rules/01-ui-design-standards.md`) → `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` → this file → other docs. Existing code shows what exists, not what is approved.

@AGENTS.md
@.agents/rules/02-agent-operating-policy.md

Path-scoped detail loads by itself from `.claude/rules/` (`frontend.md`, `backend.md`, `ai-service.md`, `database.md`, `ui-design.md`; `git-and-pr.md` and `task-management.md` always). Antigravity reads `AGENTS.md` and `.agents/rules/`, not `.claude/`.

## 1. Project overview — what, for whom, why

**What**: EduBranch-AI (capstone C1SE.65, Duy Tan University) is a web platform for experiential, case-based learning in university courses. A lecturer turns course materials into case studies with AI help; students learn by making decisions in those cases and reflecting on the consequences.

**For whom**
- **Lecturer**: creates courses, uploads PDF/DOCX materials, generates case drafts with AI, edits, approves and publishes them, gives qualitative feedback, reads statistics, manages a rubric.
- **Student**: joins a class by invite code, opens published cases, plays **Branching Study** (decide → Journey Review → reflect or retry) or **Review Study** (analyse → lecturer feedback → reflect), may ask **AI Challenge Support** for counter-questions.
- **Admin**: users, roles, courses, cases, AI service status, logs, settings.

**Why**: students practise real decisions safely and learn from consequences; AI provokes thinking, the lecturer judges. AI never grades.

Product source: Proposal V1.2 (`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`, not in the repo; cite its section or ask). Summary: `docs/PROJECT_OVERVIEW.md`. Domain terms (FND §1.2): Lecturer, Student, Course, Teaching Materials, Case Study, Branching Study, Review Study, Consequence, Outcome, AI Challenge Support. Never K-12 or "teacher / quiz / debate / simulator" wording.

## 2. Tech stack

A React single-page web app talking to a NestJS REST gateway, which calls an internal Python AI service. Not static HTML.

| Tier | Technology |
|---|---|
| Frontend `frontend/` | React 19, Vite 8, TypeScript 6, TailwindCSS v4 (tokens in `src/index.css` `@theme`), Zustand, React Router, ReactFlow 11, i18next, framer-motion (ADR-002), lucide-react |
| Backend gateway `backend/` | NestJS 10 (Node 20), raw SQL on `pg` (no ORM), JWT + RBAC, class-validator |
| AI service `ai-service/` | FastAPI, Pydantic v2, LangChain; Python 3.12 |
| Data | PostgreSQL 16 + pgvector, Redis 7, MinIO (Docker Compose) |
| LLM | Gemini `gemini-3.5-flash` (pinned), embeddings `gemini-embedding-001` (768 dims); OpenAI as alternative via `ai-service/app/providers/factory.py` |

Flow: browser → `/api/v1/*` on the backend (auth, ownership, all business state) → `/internal/v1/*` on the AI service (`X-Internal-API-Key`: parsing, chunking, embeddings, retrieval, generation, counter-questions). The browser never calls the AI service. A new technology or dependency needs an ADR and PO approval.

## 3. Design rules — colours, font, style

Full rules: **R01** (`.agents/rules/01-ui-design-standards.md`), the single design source. Token values: `frontend/src/index.css` `@theme` only. Figma (`docs/05_FIGMA.md`) shows what each screen contains; code + R01 are the visual standard and Figma follows later (PO 2026-11-22).

- **Style**: calm, minimal, professional university workspace; white shell, soft blue canvas, white cards with a thin edge and soft shadow; hierarchy from typography and spacing, not colour.
- **Colours**: light theme only (no dark mode). Navy `#2A4E7F` for actions, active states and focal data; sky `#00A5F5` for data and highlights, never text; status/mode/feedback colours only through their tokens. No purple/indigo, gradients, glow or emoji.
- **Font**: system font (Segoe UI on Windows); Be Vietnam Pro only for landing headings. Scale 22 / 20 / 16 / 14 / 12 px; nothing readable under 12px.
- **Layout**: web app. App screens are fluid beside the sidebar with fixed gutters; landing and auth centred at `max-w-7xl`. Works from 1024 to 1920+ without horizontal scroll.
- **Language**: Vietnamese default + English switch, both in the MVP; one language per screen.
- **Goal now** (PO 2026-11-22): keep the identity and fix everything that looks broken or unprofessional; plan in `docs/design/DESIGN-DIRECTION.md`.
- **Reference frontend**: file organisation, code conventions, VI/EN setup and UX behaviour were learned from the PO's reference frontend (zip kept in `D:\CAPSTONE_2026\EduBranch-AI-archive\reference\`, outside the repo). The result is written in R01 §5 and §9; learn from the zip only, never copy its files or name that project.

## 4. Mandatory rules

**Always**
- Reuse `src/components/ds` and `src/components/feedback`; tokens instead of raw values; routes from `src/routes/paths.ts` (`PATHS`, `buildPath`); every string through i18next in both `vi.json` and `en.json`.
- Give every data view loading, empty, error (with retry), 403 and success states; every interactive element hover, focus-visible, pressed and disabled states.
- Keep labels, counts, statuses and buttons on one line; page titles never truncate at 1440px.
- Use real API data. When a screen needs data the API lacks, show "—" or an honest state and report the gap.
- Check ownership in the SQL: lecturers see only their own courses, cases and submissions; students only their own attempts, reasoning and submissions. Treat every ID in a request as hostile.
- Run the tests of every tier you touch, including negative, boundary and ownership cases.

**Never** (FND §4–§6; breaking these is a Critical defect)
- Show a student a case that is not `PUBLISHED` (checked in the repository SQL, not only UI). Student lists show joined courses only; a direct link to a `PUBLISHED` case keeps working without an enrollment check.
- Let AI output start in any state but `DRAFT`, or let AI edit an approved case. Lifecycle `DRAFT → REVIEWED → APPROVED → PUBLISHED`.
- Accept a decision tree with options outside the case, unreachable nodes, cycles, fewer than 2 or more than 4 options per non-terminal node, or no terminal node. Review Study cases have no tree.
- Show consequences or a reasoning form during the Branching Study decision phase; they belong to Journey Review. Retry creates a new attempt; attempts are immutable.
- Let AI Challenge Support grade, score, rank or pass/fail, or exceed 2 rounds.
- Put retrieved material outside `<sources>…</sources>` or let it override instructions.
- Add fake data, emoji, purple/indigo, dark-mode classes, hard-coded UI strings or hard-coded routes.
- Commit to `develop`/`main`, force push, bypass branch protection or CI, `git add .`/`-A`, or `--no-verify`.

## 5. Workflow

1. **Understand**: read the Jira issue (EBA), the feature doc `docs/features/FEATURE-*.md`, the feature rule `.agents/rules/feature-*.md`, FND sections, R01 for UI, and the screen's Figma frame and `docs/design/UX-SCREEN-NOTES.md` entry.
2. **Branch** from a freshly pulled `develop`: `feature/<feature>` (backend `feature/<feature>-backend`), `fix/<name>`, `docs/<topic>`.
3. **Spec**: features, behaviour changes, security/ownership fixes and UI changes follow `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` with Spec Kit (`/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-checklist` → `/speckit-tasks` → `/speckit-analyze` → PO approval → `/speckit-implement` → `/speckit-converge`). Group related UI fixes into one spec per screen group. Bugs: `/speckit-bug-*` in Antigravity.
4. **Build**: code goes to Antigravity through `.agent-handoff/<TASK-ID>.md` (dispatched with `agy --print`, default permissions); Claude writes the package, reviews and verifies. Claude codes itself only small contained edits.
5. **Check UI after every significant change** (R01 §8): run the app with real data; take screenshots at 1280, 1440 and 1920 wide (and 1024 for breakage), in VI and EN, in each state; compare with the previous screenshots and the Figma frame's content; list every problem; fix; re-shoot. Do 3–4 review rounds judged from the user's side ("is it pleasant and convenient to use?"), not only automated tests. `npm run test:visual` gives a pixel diff against Figma for reference; it is not the pass criterion.
6. **Gates**: run QG1–QG4 of the workflow (tests, independent review, browser check, l10n check) → commit by explicit path (`git add -- <path>`), push, open a PR into `develop` with `.github/pull_request_template.md` → merge only after CI green and PO/Code Owner approval (QG5–QG6) → Jira Done only after the retest on `develop` (QG7).
7. **Report** to the PO in Vietnamese: what was done, files, commands with exit codes, screenshots, what is not verified and why. Status labels PASS / PASS WITH CONDITIONS / BLOCKED / NOT VERIFIED (policy §8).

## Commands

Copy each `.env.example` to `.env` (root, `backend/`, `ai-service/`, `frontend/`); `docker compose up -d` starts Postgres + pgvector, Redis and MinIO.
```bash
# backend/
npm run start:dev          # port 8080, prefix /api/v1; migrations run on start
npm run build
npm test                   # unit: src/**/*.spec.ts
npm run test:e2e           # test/ (needs Postgres)
npm run test:matrix        # role matrix
npm run test:regression    # security regression
# ai-service/
uvicorn app.main:app --reload --port 8000
pytest
# frontend/
npm run dev                # port 5173
npm run build              # tsc -b && vite build
npm run lint               # oxlint
npm test                   # Node test runner via npx tsx; new specs go into the test script list
npm run test:visual        # Playwright pixel diff vs Figma baselines (reference)
npm run test:e2e           # Playwright e2e
# repo root
node scripts/l10n-approval-check.mjs [--release]
```
Backend `npm run lint`/`format` do not work (eslint/prettier not installed).

## Code map

- Frontend (full map: R01 §9): entry `src/main.tsx` + `providers/AppProviders.tsx`; config `src/config/`; i18n `src/lib/i18n.ts` + `src/locales/vi.json`, `en.json`; HTTP `src/services/apiClient.ts` (Axios + JWT), one service per domain with mappers in `src/services/mappers/`; stores `src/stores/`; routes `src/routes/paths.ts`; shell `src/layouts/shell/`; shared UI `src/components/ds`, `src/components/feedback`; pages `src/pages/<domain>/`.
- Backend: `src/main.ts` (prefix, whitelist `ValidationPipe`, global `JwtAuthGuard` + `RolesGuard`, opt out with `@Public()`); domains `src/modules/*`; shared `src/common/` (`database` = `pg` Pool + raw SQL, `ai-client`, `minio`, `config`, `health`); migrations `backend/migrations/V<n>__*.sql` (the copy in `infrastructure/postgres/migrations/` is not read).
- AI service: `app/{core,providers,ingestion,retrieval,generation,challenge_support,evaluation}`; key check `app/core/security.py`; tree validation `app/generation/schemas/decision_tree.py`; 2-round cap `app/challenge_support/assistant/service.py`; `<sources>` wrapping `app/retrieval/service.py`.
- Docs: architecture `docs/architecture/`, features `docs/features/`, data model `docs/database/DATA-MODEL.md`, QA `docs/qa/`, specs `specs/NNN-*/`, team `docs/team/`.
