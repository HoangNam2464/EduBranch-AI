 EduBranch AI — UI/UX Redesign: Phase 1 Discovery + Plan

> **Status**: PLAN ONLY — no project files modified. **Revised** with confirmed decisions below (Section P closed out).
> **Sources used (priority order, as instructed)**:
> 1. `C1SE_65-EduBranch-AI-Proposal_V1.2.docx` (Proposal V1.2) — business/product truth
> 2. `REQUIREMENT-TRACEABILITY.md` + `docs/features/*.md` + `V2__new_flow_schema.sql` — proxy for "Migration Plan Rev 2" (no such file exists standalone; user-confirmed proxy)
> 3. Repository source (`EduBranch-AI`, verified identical to GitHub `main` as of this audit)
> 4. `DESIGN.md`, `SITE-ARCHITECTURE.md`, `next-prompt.md` (`.stitch/`) — legacy/current UI references, **audited, not authoritative**

---

## A. Current Design Problems

1. **The dark/indigo/sparkle aesthetic exists only in legacy design documents, not in code.** `frontend/src/index.css` and `tailwind.config.js` currently ship a plain **light** theme (`#f9fafb` background, `#2563eb` blue primary, no indigo, no dark mode). Legacy `DESIGN.md` / `next-prompt.md` describe a near-black (`#0d0d10`/`#16161a`) theme with indigo/violet (`#6366f1`) accents and a sparkle glyph (`✦`) as the AI signature. These two are unrelated — the dark/AI-glyph direction was authored for one Stitch prompt and never implemented. **This is good news**: there is no dark theme to "undo" in real code, only in documents that would otherwise keep generating more dark/indigo screens if reused as-is.
2. **The existing design system was scoped to exactly one screen** (the "Bắt đầu với thiết kế của bạn" / Start Design modal) and provided no rules for the other 12 routes (courses, materials, cases, case review, statistics, lecturer feedback, branching player, reflection, review study, review feedback, challenge support, login/register).
3. **AI was previously treated as the product's visual identity**, not a feature: sparkle glyph (`✦`) on the primary button, a dedicated signature indigo border reserved for the one AI-related textarea, "XEM TRƯỚC" AI badge styling. Proposal V1.2 explicitly frames AI as an assistive, human-in-the-loop function (case drafting, challenge questions) — never the product's headline identity.
4. **No semantic status/workflow color system existed**, despite the product being built entirely around statuses: case lifecycle (`DRAFT → REVIEWED → APPROVED → PUBLISHED`), two learning modes (`BRANCHING_STUDY` / `REVIEW_STUDY`), and review-study submission states (`SUBMITTED → REVIEWED → REFLECTED`). None of this was represented in legacy color tables.
5. **No component system** beyond one modal's inputs/cards/button — no defined Table, Tabs, Badge-as-status, Empty/Loading/Error state, or the product-specific components (case card, decision node, consequence display, reasoning input, lecturer feedback block) that the actual product needs.

## B. Product / UI Inconsistencies (Conflicts Found)

| # | Conflict | Evidence | Recommendation |
|---|---|---|---|
| 1 | **Legacy rule files describe a forbidden "AI Debate Assistant / Devil's Advocate"** | Legacy `.agents/rules/feature-debate-assistant.md` (keywords include "devil advocate"), `.agents/rules/feature-argument.md`, `.agents/rules/feature-simulator.md` — all referenced `debate/`, `argument/`, `simulation/` backend modules that **no longer exist** in the repo (replaced by `challenge-support/`, `reasoning/`, `branching-attempt/`). Proposal V1.2 explicitly states: AI Reasoning/Challenge Support "does not grade, score or decide academic right or wrong, and **it is not a debate platform**." | **DELETE** `feature-debate-assistant.md`. **REPLACE** with a new rule file describing `challenge-support/` (2-round Socratic counter-questions, no grading) sourced from `docs/features/FEATURE-AI-REASONING-CHALLENGE-SUPPORT.md`. **UPDATE** `feature-argument.md` → rename concept to "reasoning" (`reasoning/` module), matching `docs/features/FEATURE-BRANCHING-STUDY.md`. **UPDATE** `feature-simulator.md` → rename to `branching-attempt/` terminology, matching `docs/features/FEATURE-BRANCHING-ATTEMPT.md`. |
| 2 | **`.agents/rules/01-ui-design-standards.md` §5 previously listed stale, incomplete routes** | Listed `/student/cases/:caseId/simulate` and `/student/cases/:caseId/debate/:sessionId` — neither exists in `router.tsx`. Missing entirely: `review-study`, `review-study/:submissionId/feedback`, `cases/:caseId/feedback` (lecturer feedback), `attempt/:attemptId/reflect`. | **UPDATE** §5 to mirror the live `router.tsx` route list (given in Section C below). |
| 3 | **`SITE-ARCHITECTURE.md` previously described a "Debate Assistant" acting as a "Socratic Devil's Advocate"** | Section 1 of legacy `SITE-ARCHITECTURE.md` directly contradicted Proposal V1.2's explicit "not a debate platform" statement. | Resolved: `SITE-ARCHITECTURE.md` updated to AI Reasoning / Challenge Support terminology and light-first academic system. |
| 4 | **The "Start Design" modal (`DESIGN.md`/`next-prompt.md`/`SITE-ARCHITECTURE.md §7`) does not correspond to any screen in Proposal V1.2, `REQUIREMENT-TRACEABILITY.md`, or the live `router.tsx`.** | `SITE-ARCHITECTURE.md` claimed a public route `/start-design` (or `/design`); no such route exists in `frontend/src/app/router.tsx` (verified against live GitHub `main`). Proposal V1.2 never describes lecturers/students supplying their own `DESIGN.md`, Figma files, or brand assets. | Resolved: This modal is an **internal meta-tool for generating EduBranch AI's own UI via Stitch** (tooling for development, not a product feature). Categorized strictly as internal design tooling (`SITE-ARCHITECTURE.md §7`). |
| 5 | **Router comment claims a "Final Migration Plan Rev 2" as source of truth** | `frontend/src/app/router.tsx` line 3. | Resolved: `REQUIREMENT-TRACEABILITY.md` + `docs/features/*.md` + `V2__new_flow_schema.sql` serve as the proxy. |

## C. Product Screen Inventory

All 13 routes below are **ACTUAL** (exist in `router.tsx`, verified identical on live GitHub `main`) and **DOCUMENTED** (each maps to a `docs/features/*.md` file and a `REQUIREMENT-TRACEABILITY.md` row).

| Screen | Role | Purpose | Learning Mode | Workflow Position | Status | 
|---|---|---|---|---|---|
| `/login` | Public | Sign in | — | Entry | Scaffolded |
| `/register` | Public | Account creation | — | Entry | Scaffolded |
| `/lecturer/courses` | Lecturer | Course catalog & creation | Both | Start | Scaffolded |
| `/lecturer/courses/:id/materials` | Lecturer | Upload/inspect teaching material (PDF/DOCX), RAG chunk status | Both | Pre-generation | Scaffolded |
| `/lecturer/courses/:id/cases` | Lecturer | Case list, filter by learning mode, trigger AI generation | Both | Generation trigger | Scaffolded |
| `/lecturer/cases/:id/review` | Lecturer | Verify/edit/approve/publish Case Draft (ReactFlow tree editor for Branching; form editor for Review) | Both | Human-in-the-loop gate | Scaffolded |
| `/lecturer/cases/:id/feedback` | Lecturer | Review student Review-Study submissions, write feedback | Review Study only | Post-submission | Scaffolded |
| `/lecturer/statistics` | Lecturer | Completion, branch distribution, attempts, outcome | Branching (primarily) | Ongoing | Scaffolded |
| `/student/cases/:id/branching-play` | Student | Context → Decision Point → Option → Reasoning → Consequence → Next Node → Outcome | Branching Study | Core loop | Scaffolded |
| `/student/cases/:id/attempt/:attemptId/reflect` | Student | Post-outcome reflection; entry point to retry | Branching Study | After outcome | Scaffolded |
| `/student/cases/:id/challenge/:sessionId` | Student | AI Reasoning/Challenge Support, max 2 rounds, counter-questions only | Both | Optional, mid-flow | Scaffolded |
| `/student/cases/:id/review-study` | Student | Context/data/problem → analysis → proposed solution + reasoning | Review Study | Core loop | Scaffolded |
| `/student/cases/:id/review-study/:submissionId/feedback` | Student | View lecturer feedback, reflect | Review Study | After lecturer review | Scaffolded |

Not a screen, but a required **shared state, not a route**: **Case Draft verify/edit/approve** is the single most business-critical interaction in the product (Proposal V1.2) and lives inside `/lecturer/cases/:id/review` — it deserves the deepest component work of anything in this system.

## D. Screen Priorities

| Priority | Screens | Rationale |
|---|---|---|
| **P0 — Global foundation** | App shell, Sidebar/Nav (Lecturer + Student layouts), Login, Register, Case status badges, core component library (button/input/card/table/tabs/badge/modal/toast/empty/loading/error) | Nothing else can be built consistently without this |
| **P1 — Core lecturer flow** | Courses, Materials, Cases list, **Case Review (Branching Study editor)** | Proposal V1.2 frames Branching Study as "the fully developed flow and focus of the MVP" — this is the critical path |
| **P2 — Core student flow** | Branching Case Player, Reflection, Challenge Support | The other half of the MVP-critical loop |
| **P3 — Support/statistics** | Lecturer Statistics, Lecturer Feedback (Review Study) | Important but not blocking the MVP classroom trial (which is Branching-Study-focused per Proposal V1.2) |
| **P4 — Secondary states/details** | Review Study (student), Review Feedback (student) | Proposal V1.2 explicitly calls Review Study "supported at a simple level in the MVP" — secondary build priority |

Per-screen sequencing is confirmed (Section P.3):
- **NOW**: **P0** Global Foundation, **P1** Core Lecturer Flow, **P2** Core Student Flow.
- **LATER**: **P3** Statistics & Lecturer Feedback, **P4** Review Study & Review Feedback.
- **NOT NEEDED YET**: Start Design (confirmed as internal tooling only, excluded from the product screen inventory).

## E. Confirmed Visual Direction

**Principle**: AI is a *function* (a labeled action, a small icon next to a specific button/panel), never the *skin* of the product. Remove: sparkle glyphs as brand signature, dedicated "AI accent border," neon/glow, gradients used decoratively, pill-shaped buttons as a universal default (fine for one modal, reads as consumer-SaaS everywhere else).

**Confirmed theme — LIGHT (locked per Section P.2)**: Proposal V1.2 and the actual shipped code default to **light**. The project adopts a **light-first, neutral-gray academic UI** (clean, calm readability, professional presentation, content-first design) as the sole default identity. Dark mode is **not** supported this phase, and the legacy dark/indigo palette is fully retired.

**Target qualities restated concretely**:
- Typography-led hierarchy over color-led hierarchy (weight/size do the work; color reserved for status and one primary action per screen)
- One accent color used sparingly for primary actions and links — not repeated on every card/border
- Status color (case lifecycle, learning mode) is the *only* place color carries meaning beyond the single accent
- Dense, readable data surfaces (tables for statistics, structured cards for cases) — not everything wrapped in a floating modal

## F. Color System Tokens

| Token | Purpose | Direction |
|---|---|---|
| `bg-canvas` | Page background | `#F9FAFB` |
| `bg-surface` | Cards, panels | `#FFFFFF` |
| `bg-surface-muted` | Nested blocks, table stripes | `#F3F4F6` |
| `text-primary` / `text-secondary` / `text-muted` | Content hierarchy | Neutral gray scale (`#111827`, `#4B5563`, `#9CA3AF`) |
| `border-default` | Structural lines | `#E5E7EB` |
| `action-primary` | One accent, primary buttons/links | `#2563EB` |
| `status-draft` | Case status: DRAFT | `#F3F4F6` / `#4B5563` |
| `status-reviewed` | Case status: REVIEWED | `#EFF6FF` / `#1D4ED8` |
| `status-approved` | Case status: APPROVED | `#FFFBEB` / `#92400E` |
| `status-published` | Case status: PUBLISHED | `#F0FDF4` / `#166534` |
| `mode-branching` | Learning-mode tag: Branching Study | `#F0FDFA` / `#0F766E` |
| `mode-review` | Learning-mode tag: Review Study | `#FDF2F8` / `#BE185D` |
| `ai-support` | AI-origin content marker (Case Draft, Challenge Support) | Small, muted, icon-based (`#F3F4F6` / `#4B5563`) |
| `semantic success/warning/error/info` | Standard feedback | Standard semantic greens/ambers/reds/blues |

See `docs/design/GLOBAL-DESIGN-SYSTEM.md` for full hex values and interactive-state table.

## G. Component Architecture

**Foundational** (shared across all screens): App shell, Sidebar (role-aware: Lecturer/Student), Header, Button (primary/secondary/destructive), Input, Select, Textarea, Card, Table, Tabs, Badge, Status indicator, Modal, Toast, Empty state, Loading state, Error state, Confirmation dialog.

**Product-specific**: Case card (shows learning mode + status), Learning-mode indicator (Branching/Review tag), Decision node (ReactFlow node for tree editor/player), Option selector, Consequence display, Reasoning input, Reflection input, Review-study submission card, Lecturer feedback block, Challenge Support panel (round 1/2 indicator), Statistics widgets (completion, branch distribution), Publish/review status stepper (`DRAFT → REVIEWED → APPROVED → PUBLISHED`).

## H. Reference Strategy

No external references are needed for branding. Architecture adheres 100% to EduBranch AI standards.

## I. Stitch Rules (generalized beyond one screen)

Every future Stitch prompt for any EduBranch AI screen must state: **WHAT** screen, **WHO** uses it (Lecturer/Student), **WHY** (which Proposal V1.2 objective it serves), **WHEN** (workflow position), **DATA** (fields that must appear, sourced from `docs/features/*.md`), **ACTION** (only actions in the traceability matrix), **STATE** (loading/empty/error/disabled/success), **VISUAL** (the new light-first system, not the retired dark/indigo palette), **BOUNDARY** (explicitly: no Debate Assistant framing, no grading/scoring UI, no ranking/comparison UI, no Review Study retry UI — all excluded per Proposal V1.2).

## J. Canonical Documentation Structure

| Document | Purpose | Replaces |
|---|---|---|
| `GLOBAL-DESIGN-SYSTEM.md` | Colors, type, spacing, component rules | `DESIGN.md` |
| `SCREEN-SPECIFICATIONS.md` (`docs/design/screens/*.md`) | Per-screen spec for P0–P4 | *(new)* |
| `STITCH-GENERATION-GUIDELINES.md` | The WHAT/WHO/WHY/... rules generalized (Section I above) | Supersedes retired Stitch prompt references |
| `SITE-ARCHITECTURE.md` | Sitemap & workflow architecture reference for EduBranch AI | — |

## K. Migration Strategy from Legacy Design Docs

1. Do not carry forward any hex value, spacing value, or component spec from legacy `DESIGN.md`/`next-prompt.md` as-is — they were built for one modal under an aesthetic direction now rejected.
2. Extract only the *structurally reusable* patterns worth keeping conceptually (e.g., modal max-width discipline, disabled/active button state logic, drag-and-drop card pattern) and re-skin them under the light/neutral system.
3. Treat `SITE-ARCHITECTURE.md` Sections 2–6 (roles, goals, sitemap, workflows) as accurate architecture reference for EduBranch AI.

## L. Design Specification Files

- `docs/design/GLOBAL-DESIGN-SYSTEM.md`
- `docs/design/STITCH-GENERATION-GUIDELINES.md`
- `docs/design/screens/P0-FOUNDATION.md`, `P1-LECTURER-CORE.md`, `P2-STUDENT-CORE.md`, `P3-SUPPORT-AND-STATISTICS.md`, `P4-REVIEW-STUDY.md`

## M. Status of Legacy Docs

- `.agents/rules/01-ui-design-standards.md` §5 (route list synchronized with `router.tsx`)
- Retired Stitch docs: `.stitch/DESIGN.md` and `.stitch/next-prompt.md` are permanently retired and deleted; canonical design specs reside in `docs/design/`.

## N. Files Replaced / Cleaned Up

- `.agents/rules/feature-debate-assistant.md` → Replaced by `feature-challenge-support.md`

## O. Files to Preserve As-Is

- `docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`
- `docs/requirements/REQUIREMENT-TRACEABILITY.md`
- `docs/features/*.md` (all current, matching live modules)
- `infrastructure/postgres/migrations/V2__new_flow_schema.sql`
- `SITE-ARCHITECTURE.md` Sections 2–7 (sitemap/roles/workflows), as architecture reference

## P. Clarifications — RESOLVED

1. **"Start Design" modal → INTERNAL TOOLING, not a product screen.**
   Confirmed: `DESIGN.md` / `next-prompt.md` (`.stitch/`) were internal Stitch/UI-authoring references, not an EduBranch AI product feature, and have been retired/deleted.
   - Removed from the product screen inventory.
   - It will **not** be designed as a lecturer/student screen in this system.
   - `SITE-ARCHITECTURE.md §7` is strictly classified as **INTERNAL DESIGN TOOLING ONLY**, not product scope.

2. **Theme → LIGHT, confirmed as default. No dark mode this phase.**
   Section E/F direction is locked: light-first, neutral, academic, professional. The dark/indigo palette from legacy docs is fully retired, not preserved as an alternate mode.

3. **Screen sequencing → confirmed:**
   - **NOW**: P0 Global Foundation, P1 Lecturer Core, P2 Student Core
   - **LATER**: P3 Statistics / Lecturer Feedback, P4 Review Study / Review Feedback
   - **NOT NEEDED YET**: Start Design (confirmed not a product screen at all, per #1)

4. **Terminology standards confirmed:**
   - Socratic Reasoning Challenge / Challenge Support (no debate, no grading, max 2 rounds)
   - Student Reasoning (never "argument")
   - Branching Case Player (never "simulator")
   - Branching Study & Review Study
   - Lecturer Feedback

5. **Canonical alignment complete:**
   `SITE-ARCHITECTURE.md` and design specifications in `docs/design/` are 100% synchronized with EduBranch AI Proposal V1.2.
