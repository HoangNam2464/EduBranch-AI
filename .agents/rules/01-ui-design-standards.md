--
description: >-
  Authoritative UI/UX Design System, Color Tokens, Icon System, Layout
  Architecture, and Anti-AI-Clutter Rules for EduBranch-AI. Always loaded when
  designing or implementing frontend components and screens.
trigger: always_on
---

# EduBranch-AI — UI/UX Design Standards & Anti-Clutter Rulebook

> **Canonical Reference**: Synchronized 100% with [`docs/design/GLOBAL-DESIGN-SYSTEM.md`](../../docs/design/GLOBAL-DESIGN-SYSTEM.md) and [`docs/05_FIGMA.md`](../../docs/05_FIGMA.md).
> **Scope**: All Frontend (`frontend/src/`) components, layouts, pages, ReactFlow graphs, and Figma/Stitch design specifications (`DES-001` → `DES-015`, `FE-001` → `FE-022`).

---

## 1. Core Aesthetic Mandate & 7 Strict Anti-"AI-Slop" Rules

EduBranch-AI is a **university-level academic authoring and case-learning platform** (similar in visual rigor to Notion, Linear, Coursera Academic, or Harvard Business Publishing). It must feel **calm, intellectually rigorous, high-contrast, utilitarian, and content-first**.

To eliminate the amateurish "AI-generated template" look, every screen and component MUST obey these **7 Non-Negotiable Prohibitions**:

1. **ZERO Unicode Emojis in UI (STRICT BAN)**:
   - **Forbidden**: `🌿`, `📭`, `👉`, `👨‍🏫`, `🏁`, `📊`, `💡`, `📍`, `⚡`, `✍️`, `🤖`, `🔒`, `👤`, `📚`, `📋`, `✅`, `🎯`, `📝`, `❓`, `✦`, `✨`, or any other emoji character anywhere in JSX/TSX or design frames.
   - **Required**: Use standardized monoline outline SVG icons only (see §3).
2. **ZERO Raw ASCII Symbols as Icons (STRICT BAN)**:
   - **Forbidden**: Using text characters like `->`, `&rarr;`, `←`, `↑`, `✕`, `&times;`, `✓`, or `•` as standalone UI buttons or icons.
   - **Required**: Use vector SVG icons (`ChevronRight`, `ArrowLeft`, `Upload`, `X`, `Check`, etc.) with proper `aria-label` or `aria-hidden="true"`.
3. **ZERO Purple / Indigo / Rainbow "AI Colors" (STRICT BAN)**:
   - **Forbidden**: Indigo/violet/purple (`#6366F1`, `purple-*`, `indigo-*`, `violet-*`), decorative gradients (`bg-gradient-to-*`), neon borders, or glowing shadows.
   - **Required**: Strictly **Light Theme Only** with neutral gray surfaces and a single restrained academic blue accent (`#2563EB`) plus locked semantic status/mode badges (see §2).
4. **ZERO Preachy "Instructional Callout Spam" (STRICT BAN)**:
   - **Forbidden**: Placing 2–4 colored alert boxes (`bg-blue-50`, `bg-amber-50`, `bg-purple-50`, `bg-emerald-50`) on a page to lecture the user on product rules (e.g., *"💡 Mục tiêu của giai đoạn REVIEW:..."*, *"🔒 Nguyên tắc sư phạm: AI hoàn toàn không chấm điểm..."*, *"* Chọn một phương án để tiến thẳng..."*).
   - **Required**: Maximum **1** contextual alert banner per screen (used only for active errors, warnings, or status transitions). Routine helper guidance belongs in a single concise `12px` `text-muted` (`#9CA3AF`) or `text-secondary` (`#4B5563`) caption line.
5. **ZERO "Box-Inside-Box-Inside-Box" Nesting (STRICT BAN)**:
   - **Forbidden**: Wrapping a `bg-white border rounded-xl` card inside another `bg-gray-50 border rounded-lg` box inside another `bg-white border` box.
   - **Required**: Maximum **1 card container layer** (`bg-surface` `#FFFFFF` with `1px solid #E5E7EB`) resting on the page canvas (`bg-canvas` `#F9FAFB`). Separate internal sections using whitespace (`24px`) and thin `1px` horizontal dividers (`border-gray-200`), or a flat `bg-surface-muted` (`#F3F4F6`) block without heavy borders.
6. **ZERO Language Mixing on the Same Screen (STRICT BAN)**:
   - **Forbidden**: Mixing English headings/buttons (`Create an account`, `My Courses`, `Node 1 Editor`) with verbose Vietnamese paragraphs or labels on the same portal or screen.
   - **Required**: Maintain 100% consistent, concise academic terminology within each screen flow (see §7).
7. **ZERO Chatbot / Gamification Gimmicks (STRICT BAN)**:
   - **Forbidden**: Chat bubble tails, robot/human avatars, typing-dot animations, progress rings, confetti, score badges, or "vs." debate framing.
   - **Required**: AI is a background function marked only by a neutral gray pill tag (`AI Draft` or `AI-assisted`) when required.

---

## 2. Color System & Design Tokens (Locked Hex Values)

> **Theme Mode**: **LIGHT MODE ONLY**. Dark mode (`dark:*`) is strictly forbidden.
> **Rule**: Never invent arbitrary hex values or use unapproved Tailwind color scales (`purple`, `indigo`, `violet`, `cyan`, `lime`, `fuchsia`, `rose`). Use ONLY the tokens below.

### 2.1. Surfaces & Backgrounds

| Token Name | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `bg-canvas` | `#F9FAFB` | `bg-[#F9FAFB]` / `bg-gray-50` | Root page background behind all layouts |
| `bg-surface` | `#FFFFFF` | `bg-white` | Primary cards, panels, modals, table body rows, sidebar |
| `bg-surface-muted` | `#F3F4F6` | `bg-gray-100` | Table header rows, code/excerpt blocks, disabled inputs, subtle callout fill |
| `bg-surface-hover` | `#F3F4F6` | `hover:bg-gray-100` | Hover background for interactive table rows and nav items |

### 2.2. Typography Colors

| Token Name | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `text-primary` | `#111827` | `text-gray-900` | Page titles, headings, primary case body text, active form values |
| `text-secondary` | `#4B5563` | `text-gray-600` | Supporting descriptions, table cell text, inactive navigation items, form labels |
| `text-muted` | `#9CA3AF` | `text-gray-400` | Input placeholders, timestamps, breadcrumbs separator, helper captions (`12px` only) |
| `text-inverse` | `#FFFFFF` | `text-white` | Text inside filled primary or destructive buttons |
| `text-link` | `#2563EB` | `text-blue-600 hover:underline` | Inline text links |

### 2.3. Borders & Dividers

| Token Name | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `border-default` | `#E5E7EB` | `border-gray-200` | Card borders, input borders, table dividers, sidebar/header borders |
| `border-strong` | `#D1D5DB` | `border-gray-300` | Hover border on clickable cards/inputs, terminal node border |
| `border-focus` | `#2563EB` | `border-blue-600 ring-blue-600/20` | Active focus ring (`2px`) and selected option/node border |

### 2.4. Primary Action Accent (`action-primary` — Single Brand Accent)

| Token Name | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `action-primary` | `#2563EB` | `bg-blue-600` / `text-blue-600` | Primary CTA button (max 1 per screen/section), active tab indicator, active nav item |
| `action-primary-hover` | `#1D4ED8` | `hover:bg-blue-700` | Hover state for primary buttons |
| `action-primary-active` | `#1E40AF` | `active:bg-blue-800` | Pressed state for primary buttons |
| `action-primary-disabled` | `#93C5FD` | `disabled:bg-blue-300` | Disabled primary button fill |
| `action-primary-subtle` | `#EFF6FF` | `bg-blue-50` | Active sidebar navigation item background tint, informational banner fill |

### 2.5. Case Lifecycle Status Tokens (`DRAFT → REVIEWED → APPROVED → PUBLISHED`)

Status badges MUST always pair the background, text, and `6px` status dot hex below. Never use `purple` for `APPROVED` or `amber` for `DRAFT`.

| Status | Token Prefix | Badge BG | Badge Text | Dot / Icon Hex | Meaning |
|---|---|:---:|:---:|:---:|---|
| `DRAFT` | `status-draft` | `#F3F4F6` | `#4B5563` | `#9CA3AF` | Newly generated by AI or created; not yet edited by Lecturer |
| `REVIEWED` | `status-reviewed` | `#EFF6FF` | `#1D4ED8` | `#2563EB` | Edited/inspected by Lecturer; awaiting formal sign-off |
| `APPROVED` | `status-approved` | `#FFFBEB` | `#92400E` | `#D97706` | Approved by Lecturer; ready for publication (hidden from students) |
| `PUBLISHED` | `status-published` | `#F0FDF4` | `#166534` | `#16A34A` | Live and accessible to Students via direct link |

### 2.6. Learning Mode Tokens (`BRANCHING_STUDY` vs `REVIEW_STUDY`)

Visually distinct from all status badges and `action-primary` so a Case Card can display both Mode and Status simultaneously without color collision:

| Learning Mode | Token Prefix | Badge BG | Badge Text | Border (Optional) | Meaning |
|---|---|:---:|:---:|:---:|---|
| `BRANCHING_STUDY` | `mode-branching` | `#F0FDFA` | `#0F766E` | `#CCFBF1` | Interactive multi-branch decision tree scenario (Teal) |
| `REVIEW_STUDY` | `mode-review` | `#FDF2F8` | `#BE185D` | `#FCE7F3` | Open case analysis & solution proposal without tree (Pink/Rose) |

### 2.7. AI-Origin Marker (`ai-support`)

Used **only** as a compact neutral pill (`AiOriginTag`) on `DRAFT` cases before lecturer edits or on AI Challenge Support counter-question cards:

| Token Name | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `ai-support-bg` | `#F3F4F6` | `bg-gray-100` | Neutral pill background (never colored, never glowing) |
| `ai-support-text` | `#4B5563` | `text-gray-600` | Pill label text (`AI Draft` or `AI-assisted`) + outline icon stroke |

### 2.8. Semantic Feedback Colors

| Token Name | Foreground Hex | Background Tint | Border Tint | Usage |
|---|:---:|:---:|:---:|---|
| `semantic-success` | `#16A34A` | `#F0FDF4` | `#BBF7D0` | Completed material ingestion, toast confirmation |
| `semantic-warning` | `#D97706` | `#FFFBEB` | `#FDE68A` | Processing/pending state, unpublish warning |
| `semantic-error` | `#DC2626` | `#FEF2F2` | `#FECACA` | Validation error, failed ingestion, destructive button (`bg-red-600`) |
| `semantic-info` | `#2563EB` | `#EFF6FF` | `#BFDBFE` | Neutral system notice |

---

## 3. Icon System Standards (Mandatory Vector SVG Specification)

### 3.1. Icon Format & Technical Rules
- **Library Standard**: Clean monoline outline vector icons (**Lucide Icons** / `lucide-react` or matching inline SVG primitives).
- **SVG Attributes**:
  - `viewBox="0 0 24 24"`
  - `fill="none"`
  - `stroke="currentColor"`
  - `strokeWidth={1.75}` (or `1.5` for `24px` empty-state icons)
  - `strokeLinecap="round"`
  - `strokeLinejoin="round"`
- **Color Inheritance**: Icons must always use `stroke="currentColor"` and inherit the parent text token (`text-secondary` `#4B5563` or `text-muted` `#9CA3AF` at rest; `text-primary` `#111827` or `action-primary` `#2563EB` on active/hover). Never render multi-color, filled-cartoon, or 3D icons.
- **Accessibility**:
  - Decorative icons next to text labels MUST have `aria-hidden="true"`.
  - Icon-only buttons (e.g., Modal Close, Delete row action) MUST have an explicit `aria-label="..."` and a minimum hit target of `32px × 32px` (`p-1.5 rounded-md`).

### 3.2. Icon Size Scale

| Size Token | Dimensions | Tailwind Class | Usage Context |
|---|:---:|---|---|
| `icon-xs` | `14px × 14px` | `h-3.5 w-3.5 shrink-0` | Inside compact badges (`AiOriginTag`, status indicators, metadata tags) |
| `icon-sm` | `16px × 16px` | `h-4 w-4 shrink-0` | Inside buttons (`gap-2`), sidebar nav items (`gap-2.5`), breadcrumbs, table row actions |
| `icon-md` | `20px × 20px` | `h-5 w-5 shrink-0` | Modal close button, alert/toast leading icon, card header icon |
| `icon-lg` | `24px × 24px` | `h-6 w-6 shrink-0` | Inside a `40px × 40px` (`h-10 w-10 rounded-lg bg-gray-100 text-gray-500`) container for `EmptyState`, `ErrorState`, and file upload dropzone |

### 3.3. Canonical Domain Icon Mapping

Every feature must use these consistent vector icon metaphors (never emojis):

| UI Element / Concept | Required Vector Icon Metaphor (Lucide / SVG Equivalent) | Forbidden Replacement |
|---|---|---|
| Brand Header Wordmark | **Text-only** `EduBranch AI` (or minimal geometric branch node SVG `GitFork` `18px` in `#2563EB`) | 🚫 `🌿` leaf emoji |
| Sidebar: Courses | `BookOpen` (`16px`) | 🚫 `📚` |
| Sidebar: Teaching Materials | `FileText` or `Files` (`16px`) | 🚫 `📋` / `📄` |
| Sidebar: Case Studies | `GitBranch` (`16px`) | 🚫 `🎯` |
| Sidebar: Statistics | `BarChart2` (`16px`) | 🚫 `📊` |
| Sidebar: Sign Out / Logout | `LogOut` (`16px`) | 🚫 Door emoji |
| Upload Dropzone | `UploadCloud` (`24px` inside `40px` `bg-gray-100` square) | 🚫 `↑` text character |
| Empty State | `Inbox` or `FolderOpen` (`24px` inside `40px` `bg-gray-100` square) | 🚫 `📭` mailbox emoji |
| Error / Validation Alert | `AlertCircle` (`20px` in `#DC2626`) | 🚫 `❌` / `⚠️` |
| Warning Banner | `AlertTriangle` (`20px` in `#D97706`) | 🚫 `⚡` |
| Completed / Success | `CheckCircle2` or `Check` (`16px` in `#16A34A`) | 🚫 `✅` / `✓` text |
| AI-Origin Tag (`AiOriginTag`) | `FileCode` or `Cpu` (`14px` neutral `#4B5563`) | 🚫 `✦` / `✨` / `🤖` |
| AI Challenge Support Card | `HelpCircle` or `MessageSquare` (`16px` neutral `#4B5563`) | 🚫 `🤖` robot face |
| Lecturer Feedback Block | `UserCheck` or `MessageSquareText` (`16px` `#4B5563`) | 🚫 `👨‍🏫` teacher emoji |
| Terminal Outcome Node | `Flag` (`14px` `#4B5563`) | 🚫 `🏁` checkered flag emoji |
| Navigation / Breadcrumb | `ChevronRight` (`14px`), `ArrowLeft` (`16px`), `ArrowRight` (`16px`) | 🚫 `->`, `&rarr;`, `←` |
| Modal Close | `X` (`20px` stroke) | 🚫 `✕` / `&times;` |

---

## 4. Typography, Spacing, Radius & Elevation

### 4.1. Font Stack & Type Hierarchy
Use the native system sans-serif stack for crisp, fast academic reading:
```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Token | Size / Line-Height | Weight | Tailwind Equivalent | Usage |
|---|:---:|:---:|---|---|
| `text-display` | `24px / 32px` | `600` (Semibold) | `text-2xl font-semibold tracking-tight text-gray-900` | Page title in `PageHeader` |
| `text-h1` | `20px / 28px` | `600` (Semibold) | `text-xl font-semibold text-gray-900` | Major section title, case title in player |
| `text-h2` | `16px / 24px` | `600` (Semibold) | `text-base font-semibold text-gray-900` | Card title, modal title, side-panel title |
| `text-h3` | `14px / 20px` | `600` (Semibold) | `text-sm font-semibold text-gray-900` | Subsection header, form group title |
| `text-body` | `14px / 22px` | `400` (Regular) | `text-sm leading-relaxed text-gray-900` | Standard body copy, situation text, table cells |
| `text-body-strong` | `14px / 20px` | `500` (Medium) | `text-sm font-medium text-gray-700` | Form field labels, button labels, active nav links |
| `text-caption` | `12px / 16px` | `400` / `500` | `text-xs text-gray-500` | Timestamps, helper captions, badge text, table headers (`uppercase tracking-wider`) |
| `text-mono` | `12px / 18px` | `400` | `font-mono text-xs text-gray-600` | Course codes (`BUS301`), file extensions (`PDF`), chunk counts |

- **Reading Measure Rule**: Long-form academic reading (case `situation`, `context_text`, `problem_text`, `consequence`, `lecturer_feedback`) MUST be constrained to `65–75ch` (`max-w-prose` or `max-w-3xl`) with `leading-relaxed` (`1.625`) line height.
- **No All-Caps Sentences**: Use `uppercase tracking-wider text-xs` ONLY for short 1–3 word category labels or table column headers — never for full sentences or instructions.

### 4.2. Spacing Scale (Strict 4px/8px Grid)
- Allowed spacing values: `4px` (`1`), `8px` (`2`), `12px` (`3`), `16px` (`4`), `20px` (`5`), `24px` (`6`), `32px` (`8`), `48px` (`12`).
- **Page container padding**: `px-6 py-8` desktop (`px-4 py-6` mobile).
- **Card internal padding**: `p-6` (`24px`) desktop, `p-4` (`16px`) compact/mobile.
- **Vertical gap between page sections**: `space-y-6` (`24px`).
- **Vertical gap between form fields**: `space-y-4` (`16px`).
- **Gap between label and input**: `mb-1.5` (`6px`).

### 4.3. Border Radius & Elevation
- **Border Radius**:
  - `radius-sm` (`6px` / `rounded-md`): Inputs, selects, textareas, buttons, icon buttons, rectangular tags (`courseCode`).
  - `radius-lg` (`8px` / `rounded-lg`): Standard Cards, Alert banners, Table containers, ReactFlow nodes.
  - `radius-xl` (`12px` / `rounded-xl`): Modals and Dialogs only.
  - `radius-full` (`9999px` / `rounded-full`): **Strictly reserved for Status Badges and Learning Mode Badges**. Buttons must NEVER be pill-shaped (`rounded-full`).
- **Elevation (Flat-First Principle)**:
  - **Cards at rest**: `elevation-0` — `bg-white border border-gray-200` with **no shadow** (or `shadow-none`). Borders do the structural separation work.
  - **Interactive Clickable Cards on hover**: `hover:border-gray-300 hover:shadow-xs transition-all`.
  - **Modals / Dialogs**: `shadow-lg border border-gray-200` over `bg-gray-900/40` backdrop (no heavy blur effects).

---

## 5. App Shell & Layout Architecture by User Role

### 5.1. Lecturer Portal Shell (`LecturerLayout.tsx`)
- **Structure**: Persistent 2-column desktop layout (`min-h-screen bg-[#F9FAFB] flex`):
  - **Left Sidebar (`w-60` / `240px` fixed on desktop, `bg-white border-r border-gray-200 flex flex-col`)**:
    - **Top Brand Header (`h-14 px-5 border-b border-gray-200 flex items-center justify-between`)**: Clean wordmark `EduBranch AI` (`text-base font-semibold text-gray-900`) + subtle `Lecturer` badge (`bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded`).
    - **Primary Navigation (`p-3 space-y-1 flex-1`)**:
      - `Courses` (`/lecturer/courses`) with `BookOpen` (`16px`) icon.
      - `Statistics` (`/lecturer/statistics`) with `BarChart2` (`16px`) icon.
      - **Contextual Course Sub-Navigation** (rendered when URL matches `/lecturer/courses/:courseId/*` or `/lecturer/cases/:caseId/*`): indented section showing `Materials`, `Case Studies`, `Case Review`, `Feedback` with `16px` outline icons.
      - Active nav item style: `bg-blue-50 text-blue-600 font-medium` with `aria-current="page"`. Inactive: `text-gray-600 hover:bg-gray-100 hover:text-gray-900`.
    - **Bottom User Footer (`p-4 border-t border-gray-200`)**: Displays lecturer full name (`text-sm font-medium text-gray-900 truncate`), role caption, and `Sign out` button with `LogOut` (`16px`) icon.
  - **Main Content Area (`flex-1 min-w-0`)**:
    - Standard pages: `max-w-6xl mx-auto px-6 py-8`.
    - Full-viewport workspace (`CaseReviewPage`): `h-[calc(100vh)] flex flex-col overflow-hidden` with top lifecycle action bar (`h-14`) + split pane (`65%` ReactFlow canvas / `35%` `w-96` right node-editor panel).

### 5.2. Student Portal Shell (`StudentLayout.tsx`)
- **Pedagogical Context**: Students access specific published cases via direct links (no course-browsing sidebar).
- **Structure**: Focused single-column academic workspace (`min-h-screen bg-[#F9FAFB] flex flex-col`):
  - **Top Header (`h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between`)**:
    - Left: Wordmark `EduBranch AI` (`text-sm font-semibold text-gray-900`) + vertical divider (`h-4 w-px bg-gray-200`) + `LearningModeBadge` (`Branching Study` or `Review Study`).
    - Right: Student name (`text-sm text-gray-600`) + `Sign out` button (`LogOut` `16px` icon).
  - **Main Reading & Writing Container**: `max-w-3xl w-full mx-auto px-6 py-8 flex-1` — keeps the student's eyes focused on a comfortable `65–75ch` reading column without peripheral clutter.

### 5.3. Public Auth Shell (`PublicLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`)
- Centered single-column layout (`min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4`).
- Clean wordmark `EduBranch AI` + 1-line subtitle (`University Case-Based Learning Platform`) above a single `max-w-md w-full mx-auto bg-white border border-gray-200 rounded-lg p-8` card.
- **Note**: Ensure `LoginPage` and `RegisterPage` do not duplicate the outer `min-h-screen` header if rendered inside `PublicLayout` (render header once cleanly).
- Local dev quick-access controls (when `import.meta.env.DEV` is true) must use neutral `bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100` styling with SVG icons — never purple/emoji buttons.

---

## 6. Standardized Component & Product-Specific Widget Rules

### 6.1. Core Shared Primitives (`src/components/ui/index.tsx`)
1. **`Button`**:
   - Variants:
     - `primary`: `bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-[#93C5FD]`
     - `secondary`: `bg-white text-[#111827] border border-[#E5E7EB] hover:bg-[#F3F4F6]`
     - `danger`: `bg-[#DC2626] text-white hover:bg-red-700`
     - `ghost`: `bg-transparent text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]`
   - Sizes: `sm` (`h-8 px-3 text-xs`), `md` (`h-10 px-4 text-sm`), `lg` (`h-11 px-5 text-sm`). Always `rounded-md font-medium`.
   - **Rule**: Maximum **one** `primary` button visible per view/modal to establish an unmistakable primary action.
2. **`Input`, `Select`, `Textarea`**:
   - Associated `<label htmlFor={id}>` (`text-sm font-medium text-gray-700 mb-1.5 block`) is mandatory — never rely on `placeholder` alone.
   - Input/Select height: `h-10` (`40px`), `px-3 py-2 text-sm bg-white border border-gray-200 rounded-md`.
   - Focus state: `focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20`.
   - Academic writing `Textarea` (Student Reasoning, Proposed Solution, Reflection, Lecturer Feedback): minimum `rows={4}` (`min-h-[120px]`), `leading-relaxed`, vertical resize enabled.
3. **`CaseStatusBadge` & `LearningModeBadge`**:
   - `CaseStatusBadge`: Pill (`rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5`) with a `6px` (`h-1.5 w-1.5 rounded-full`) colored dot and text label (`Draft`, `Reviewed`, `Approved`, `Published`) using exact §2.5 tokens.
   - `LearningModeBadge`: Pill (`rounded-full px-2.5 py-0.5 text-xs font-medium`) using exact §2.6 tokens (`Branching Study` in Teal, `Review Study` in Pink).
4. **`AiOriginTag`**:
   - Neutral gray pill (`bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1`) with a `14px` outline SVG icon + `AI Draft` or `AI-assisted`. Shown on `DRAFT` cases only; hidden once status advances to `REVIEWED`/`APPROVED`/`PUBLISHED`.
5. **`Skeleton`, `EmptyState`, `ErrorState`**:
   - Loading tables/cards must use `Skeleton` (`animate-pulse bg-gray-100 rounded-md`) matching the layout shape rather than a bare text string `"Loading..."`.
   - `EmptyState` and `ErrorState` must use a `24px` outline SVG inside a `40px` `rounded-lg bg-gray-100` (or `bg-red-50` for error) container + concise title + 1-sentence description + optional action button.

### 6.2. Product-Specific Domain Widgets
1. **Publish / Review Status Stepper (`CaseReviewPage`)**:
   - Horizontal 4-step indicator (`1. Draft` → `2. Reviewed` → `3. Approved` → `4. Published`) in the Case Review top bar.
   - Shows current lifecycle stage and enables only valid state-machine transitions (`Save Edits`, `Mark as Reviewed`, `Approve Case`, `Publish Case` behind confirmation modal).
2. **ReactFlow Decision Tree Canvas & Nodes (`CaseReviewPage` — Lecturer Only)**:
   - **Canvas Background**: `#F9FAFB` with subtle dot/grid pattern (`#E5E7EB`).
   - **Edges**: Smoothstep directed edges in neutral slate `#9CA3AF` (`strokeWidth: 1.75`), turning `#2563EB` when selected. Edge label in `11px` `#4B5563` on `#FFFFFF` pill background. **Never use `#6366f1` indigo edges.**
   - **Decision Node Card**: `w-64 bg-white border border-gray-200 rounded-lg p-3.5 text-left shadow-xs`.
     - Selected state: `border-[#2563EB] ring-2 ring-[#2563EB]/20`.
     - Root node badge: `Start` (`bg-blue-50 text-blue-700 text-[11px] font-medium px-2 py-0.5 rounded`).
     - Terminal node badge: `Outcome` (`bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded` with `12px` `Flag` SVG icon).
     - **Strict Guardrail**: Never color-code nodes green vs. red/rose (`border-emerald-500` / `border-rose-400`) — there is no "right" or "wrong" branch in EduBranch-AI.
3. **Branching Case Player — Experience Phase (`BranchingCasePlayerPage`)**:
   - Header bar: Case title, `Attempt #N` tag, and current step counter (`Decision Point N` — never a percentage bar since path depth is dynamic).
   - Situation Card: Clean `bg-white border border-gray-200 rounded-lg p-6` with readable `15px`/`16px` (`text-base leading-relaxed text-gray-900`) prose.Optional `contextData` rendered in a subtle `bg-gray-50 border-l-2 border-gray-300 pl-4 py-2 text-sm text-gray-600` block.
   - Option Selector: Vertical stack of full-width option buttons (`bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-[#2563EB] hover:bg-blue-50/30 transition-colors flex items-start gap-3`). Option index badge (`A`, `B`, `C` or `1`, `2`, `3`) in a `24px` `rounded-md bg-gray-100 text-gray-700 font-medium text-xs` square.
   - **Immediate Transition**: Clicking an option immediately advances to the next node. **Zero consequence cards, zero reasoning textareas, and zero instructional banners mid-flow.**
4. **Branching REVIEW Phase Timeline (`BranchingReviewPage`)**:
   - Vertical chronological timeline (`border-l-2 border-gray-200 ml-3 pl-6 space-y-6`).
   - Each step card (`bg-white border border-gray-200 rounded-lg p-6`) displays in clear order:
     1. **Step Header**: `Decision Point #N` badge (without exposing internal `nodeId` to students).
     2. **Situation Summary**: Compact text of the dilemma faced.
     3. **Chosen Option vs. Alternatives**: Chosen option highlighted with a clean `#2563EB` or `#0F766E` left border (`bg-gray-50 border-l-2 border-[#2563EB] px-3.5 py-2.5`); unselected options listed below in muted `text-gray-500 text-xs` (never `line-through` which implies an error).
     4. **Consequence Reveal**: `bg-[#F0FDFA]/60 border-l-2 border-[#0F766E] px-4 py-3 rounded-r-md` with label `Consequence` (`text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1`).
     5. **Retrospective Reasoning Input**: Standard `Textarea` labeled `Your Reasoning (Optional — recommended for pivotal decisions)` + secondary action button `Challenge Reasoning` (with `MessageSquare` SVG icon, styled as `Button variant="secondary" size="sm"` — never a purple robot button).
5. **AI Challenge Support Panel (`ChallengeSupportPage`)**:
   - Header with `Round 1 of 2` / `Round 2 of 2` step badge.
   - Neutral stacked cards (not left/right chat bubbles):
     - Student Reasoning card: `bg-gray-50 border border-gray-200 rounded-lg p-4`.
     - AI Counter-Question card: `bg-white border border-gray-200 rounded-lg p-5` with `AiOriginTag` (`AI Challenge Question · Round N`) in the header.
   - Hard-capped at 2 rounds: once `isCompleted = true`, replace the reply form with a calm completion footer (`Session complete — maximum 2 rounds reached`) and a primary button to return to the Review/Reflection flow.
6. **Lecturer Feedback Block (`LecturerFeedbackPage`, `ReviewFeedbackPage`)**:
   - Rendered as a structured academic evaluation card (`bg-gray-50 border border-gray-200 rounded-lg p-5`) with `UserCheck` (`16px`) icon and `Lecturer Feedback` header — never yellow/amber warning colors or teacher emojis.
7. **Statistics Widgets (`StatisticsPage`)**:
   - Metric summary cards: Label at top (`text-xs font-medium text-gray-500 uppercase tracking-wider`), large metric value below (`text-2xl font-semibold text-gray-900`), optional subtle `16px` outline icon in top-right (`text-gray-400`).
   - Branch distribution bars: Horizontal progress bars using `action-primary` (`#2563EB`) at `100%`, `70%`, `40%` opacity steps — never a multi-color rainbow chart.

---

## 7. Language & Microcopy Standards

1. **Single-Language Consistency per Screen**:
   - Do not mix English UI chrome (`Create Course`, `Upload Material`, `Node Editor`) with Vietnamese labels on the same page.
   - Standardize UI labels to clean, concise **Academic English** across all product components and screens (matching the Backend DTOs, Figma tasks `DES-001`–`DES-015`, and `GLOBAL-DESIGN-SYSTEM.md`), while user-inputted content (course names, case text, student reasoning, lecturer feedback) naturally supports full Vietnamese UTF-8 text.
2. **Concise Academic Tone**:
   - Button labels must be 1–3 words in Title Case (`Create Course`, `Generate Case`, `Publish Case`, `Save Changes`, `Complete Review`, `Submit Reflection`, `Try Another Path`).
   - Avoid exclamation marks (`!`), conversational filler, or grading terminology (`Score`, `Grade`, `Pass`, `Fail`, `Correct`, `Wrong`).

---

## 8. Canonical Route Map & Pedagogical Flow Boundaries

> Mirrors `frontend/src/app/router.tsx` and `docs/design/SITE-ARCHITECTURE.md`.

### 8.1. Public Routes (`PublicLayout`)
- `/login` — University email/password sign-in.
- `/register` — Account registration with role selection (`STUDENT` | `LECTURER`).

### 8.2. Lecturer Routes (`LecturerLayout`)
- `/lecturer/courses` — Course catalog & course creation modal.
- `/lecturer/courses/:courseId/materials` — PDF/DOCX upload dropzone & RAG processing status table.
- `/lecturer/courses/:courseId/cases` — Course case list, mode filter (`All` / `Branching Study` / `Review Study`), and `Generate Case` modal.
- `/lecturer/cases/:caseId/review` — **Human-in-the-Loop Gate**: 4-step status stepper + ReactFlow Decision Tree canvas & side-by-side node editor (for `BRANCHING_STUDY`) or context/problem form editor (for `REVIEW_STUDY`).
- `/lecturer/cases/:caseId/feedback` — Inspect student Branching Attempts and Review Study submissions; author qualitative `lecturer_feedback`.
- `/lecturer/statistics` — Cohort completion rate, attempt count, and branch-selection distribution.

### 8.3. Student Routes (`StudentLayout`)
- `/student/cases/:caseId/branching-play` — **Phase 1 (Experience)**: Distraction-free situation reading and immediate option selection (no mid-flow consequence card, no mid-flow reasoning form, no ReactFlow canvas).
- `/student/cases/:caseId/attempt/:attemptId/review` — **Phase 2 (REVIEW)**: Full chronological path replay, revealed consequences (`consequence`), alternative options, and retrospective `reasoning_text` capture.
- `/student/cases/:caseId/attempt/:attemptId/reflect` — **Phase 3 (Reflection & Retry)**: Post-journey metacognitive `reflection_text` submission and `Try Another Path` (creates `attempt_number + 1`).
- `/student/cases/:caseId/challenge/:sessionId` — **Cross-Mode Socratic Support**: 1–2 rounds of counter-questions probing student reasoning (zero grading).
- `/student/cases/:caseId/review-study` — **Review Study Workspace**: Read `context_text` & `problem_text`, submit `student_analysis` (optional), `proposed_solution` (required), and `reasoning_text` (required). Single submission per case.
- `/student/cases/:caseId/review-study/:submissionId/feedback` — View human Lecturer Feedback (`REVIEWED`) and submit final Reflection (`REFLECTED`).

---

## 9. Frontend Component & Security Guardrails

1. **Presentational Separation**: Components in `src/components/ui/` are strictly presentational and reusable. Never make HTTP calls directly inside UI primitives; route all API calls through `src/services/*` using `src/services/apiClient.ts`.
2. **Zero Internal Data Leaks**: Never render internal database UUIDs (`nodeId`, `attemptId`, `userId`), raw server stack traces, or internal prompt structures in student-facing or lecturer-facing UI.
3. **Client & Server Validation**: Validate required fields, character lengths (e.g., reasoning `10–2000` chars, password `min 8` chars), and file constraints (`PDF`/`DOCX` only, `max 50MB`) with inline `semantic-error` field messages before submitting.
