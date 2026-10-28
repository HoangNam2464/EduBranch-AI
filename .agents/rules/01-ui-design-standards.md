---
description: >-
  SINGLE SOURCE OF TRUTH — Authoritative UI/UX Design System, MCP Figma-First
  Workflow, GitHub-Grade Craft Standards, Color Tokens, Icon System, Auto-Layout
  Rules, 7-State Interaction Matrix, Anti-AI-Slop Guardrails, and Pedagogical
  Flow Boundaries for EduBranch-AI. ALL agents MUST read and obey this file
  before touching any Figma frame or frontend code.
trigger: always_on
---

# EduBranch-AI — UI/UX Master Rulebook (Single Source of Truth)

> **CANONICAL STATUS**: This file is the **sole authoritative source** for all
> UI/UX decisions. Files `docs/design/GLOBAL-DESIGN-SYSTEM.md`,
> `docs/design/SITE-ARCHITECTURE.md`, and `docs/design/screens/P0–P4` are
> **read-only reference archives** — they do NOT override this file.
>
> **FIGMA-FIRST MANDATE**: No agent may modify `frontend/src/` UI code until
> the corresponding Figma frame is updated via MCP and **explicitly approved by
> the User**. See §0 for the mandatory gate protocol.

---

## §0. MANDATORY MCP FIGMA-FIRST WORKFLOW PROTOCOL

> **This is the highest-priority rule in the entire rulebook. Violating it is
> forbidden regardless of any other instruction.**

### §0.1. The Two-Gate Invariant

Every UI/UX change MUST pass through two sequential, non-skippable gates:

```
REQUEST FOR UI CHANGE
        │
        ▼
┌───────────────────────────────────────────────┐
│  GATE 1: FIGMA (via MCP) — MANDATORY FIRST    │
│                                               │
│  1. Connect to Figma MCP server               │
│     (figma-dev-mode or StitchMCP)             │
│  2. Read existing frames to understand        │
│     current state — never assume              │
│  3. Apply changes: tokens, Auto-Layout,       │
│     components, all 15 DES tasks              │
│  4. Report changes & REQUEST USER APPROVAL    │
│                                               │
│  ⛔ DO NOT proceed to Gate 2 without approval │
└────────────────────┬──────────────────────────┘
                     │ User approves Figma ✅
                     ▼
┌───────────────────────────────────────────────┐
│  GATE 2: FRONTEND CODE — ONLY AFTER GATE 1   │
│                                               │
│  1. Rebuild frontend/src/ UI to match        │
│     the approved Figma 1:1                    │
│  2. Zero creative deviation from Figma        │
│  3. Run lint + build checks                   │
└───────────────────────────────────────────────┘
```

### §0.2. Absolute Prohibitions for Workflow

- **FORBIDDEN**: Modifying any file under `frontend/src/` for UI/visual changes
  before Gate 1 is complete and approved.
- **FORBIDDEN**: "Improvising" UI details not present in Figma (e.g.,
  self-inventing animations, shadow depths, spacing values, or color tints).
- **FORBIDDEN**: Skipping Gate 1 because "it's a minor fix." Every visual
  change — including a single padding value — goes through Figma first.
- **REQUIRED**: When unsure about any design decision, **STOP and ask the User
  for approval** before proceeding.

### §0.3. MCP Tool Usage Order (Figma Operations)

When operating on Figma via MCP, always follow this sequence:

1. `list_projects` → identify the correct `projectId`
2. `list_screens` → survey existing frames for the relevant DES task
3. `get_screen` → read `screenshot.downloadUrl` + `htmlCode.downloadUrl` to
   understand the current state
4. `list_design_systems` → confirm the EduBranch-AI design system is applied
5. **Apply changes** using `edit_screens` or `generate_screen_from_text`
6. **Report** what was changed and **request User approval** before Gate 2

### §0.4. Stitch MCP Prompt Construction Rules

Before calling any Stitch generation/editing tool, the prompt MUST be enhanced
with **precision descriptors** — never submit vague, generic language:

| ❌ Vague / Forbidden | ✅ Precise / Required |
|---|---|
| "Make a nice header" | "Sticky `h-14` navigation bar, `bg-white border-b border-gray-200`, with `git-branch` SVG brand icon `28×28px #2563EB rounded-md` + `EduBranch AI` wordmark `16px SemiBold #111827`" |
| "A list of cards" | "Responsive 2-column `Case Card` grid, each card `bg-white border border-gray-200 rounded-xl p-6`, showing `LearningModeBadge` + `CaseStatusBadge` + `24px SemiBold #111827` title + `14px #4B5563` 2-line description + footer link" |
| "Upload area" | "Drag-and-drop dropzone `h-44 border-2 border-dashed border-gray-300 rounded-lg`, centered `upload-cloud` SVG `24px #2563EB` in `40px bg-gray-100 rounded-lg` container, hover state: `border-blue-500 bg-blue-50`" |
| "Some buttons" | "Primary button `h-10 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8]` + Secondary button `bg-white border border-gray-200 text-gray-900 hover:bg-gray-100`" |

---

## §1. Core Aesthetic Mandate & 7 Strict Anti-"AI-Slop" Rules

EduBranch-AI is a **university-level academic authoring and case-learning
platform** modelled after the visual rigor of **Notion, Linear, Coursera
Academic, and Harvard Business Publishing**. It must feel **calm,
intellectually rigorous, high-contrast, utilitarian, and content-first**.

### §1.1. The 7 Non-Negotiable Prohibitions

1. **ZERO Unicode Emojis in UI**
   - Forbidden anywhere in JSX/TSX, Figma frames, or markdown labels:
     `🌿 📭 👉 👨‍🏫 🏁 📊 💡 📍 ⚡ ✍️ 🤖 🔒 👤 📚 📋 ✅ 🎯 📝 ❓ ✦ ✨`
   - Required: monoline outline Lucide SVG icons only (see §3)

2. **ZERO Raw ASCII Symbols as Icons**
   - Forbidden as standalone UI elements: `-> &rarr; ← ↑ ✕ &times; ✓ •`
   - Required: `ChevronRight ArrowLeft Upload X Check` SVG with `aria-label`

3. **ZERO Purple / Indigo / Rainbow "AI Colors"**
   - Forbidden: `#6366F1 purple-* indigo-* violet-*`, decorative gradients
     `bg-gradient-to-*`, neon borders, glowing `box-shadow`
   - Required: Light Theme Only — neutral grays + single `#2563EB` accent

4. **ZERO Preachy "Instructional Callout Spam"**
   - Forbidden: 2–4 colored alert boxes on one screen explaining product rules
     (e.g., `💡 Mục tiêu giai đoạn REVIEW:...`, `🔒 AI không chấm điểm...`)
   - Required: Max **1** contextual alert per screen (errors/warnings only).
     Routine guidance = single `12px text-muted (#9CA3AF)` caption line.

5. **ZERO "Box-Inside-Box-Inside-Box" Nesting**
   - Forbidden: `bg-white border rounded-xl` card → inside `bg-gray-50 border
     rounded-lg` → inside another `bg-white border` wrapper
   - Required: Max **1 card layer** (`#FFFFFF` + `1px solid #E5E7EB`) on
     canvas (`#F9FAFB`). Internal sections: `24px` whitespace + `1px hr`
     dividers, or flat `#F3F4F6` blocks without added borders.

6. **ZERO Language Mixing on the Same Screen**
   - Forbidden: English headings (`Create Account`, `Node 1 Editor`) mixed
     with Vietnamese labels on the same screen
   - Required: 100% **Academic English** for all UI chrome, buttons, labels,
     and headings. User-inputted content (reasoning, case text) may be Vietnamese.

7. **ZERO Chatbot / Gamification Gimmicks**
   - Forbidden: Chat bubble tails, robot avatars, typing-dot animations,
     progress rings, confetti, score badges, XP counters, "vs." debate framing
   - Required: AI marked only by neutral gray pill `AiOriginTag` (see §6.1.4)

### §1.2. Visual Hierarchy — The 60-30-10 Distribution Rule

To prevent "monotonous gray soup" (all-gray, no visual priority), every screen
MUST distribute visual weight as follows:

| Zone | % of Screen | Tokens | Purpose |
|---|:---:|---|---|
| **Neutral Base** | ~60% | `#F9FAFB` canvas + `#FFFFFF` card surfaces | Background, breathing room |
| **Structural Depth** | ~30% | `#F3F4F6` muted blocks + `#4B5563` secondary text | Section separation, body content |
| **Action Accent** | ~10% | `#2563EB` primary buttons + active states | Primary CTA, active nav, focus rings |

> **Rule**: If a screen has no visible `#2563EB` element, it has no clear call
> to action — add one. If a screen has more than 2 `#2563EB` elements at rest,
> demote secondary ones to `secondary` or `ghost` button variants.

---

## §2. Color System & Design Tokens (Locked Hex Values)

> **Theme**: **LIGHT MODE ONLY** — `dark:*` variants are strictly forbidden.
> **Rule**: Never invent hex values. Never use unapproved Tailwind scales:
> `purple indigo violet cyan lime fuchsia rose`. Use ONLY tokens below.

### §2.1. Surfaces & Backgrounds

| Token | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `bg-canvas` | `#F9FAFB` | `bg-gray-50` | Root page background behind all layouts |
| `bg-surface` | `#FFFFFF` | `bg-white` | Cards, panels, modals, table rows, sidebar |
| `bg-surface-muted` | `#F3F4F6` | `bg-gray-100` | Table headers, code blocks, disabled inputs, callout fills |
| `bg-surface-hover` | `#F3F4F6` | `hover:bg-gray-100` | Row/card hover on white surface |
| `bg-surface-selected` | `#EFF6FF` | `bg-blue-50` | Active sidebar item, selected option/node card |

### §2.2. Typography Colors

| Token | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `text-primary` | `#111827` | `text-gray-900` | Page titles, headings, primary body text, active input values |
| `text-secondary` | `#4B5563` | `text-gray-600` | Supporting copy, table body, form labels, inactive nav |
| `text-muted` | `#9CA3AF` | `text-gray-400` | Placeholders, timestamps, char counters, helper captions (12px only) |
| `text-inverse` | `#FFFFFF` | `text-white` | Text on primary/danger filled button backgrounds |
| `text-link` | `#2563EB` | `text-blue-600 hover:underline` | Inline hyperlinks |

### §2.3. Borders & Dividers

| Token | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `border-default` | `#E5E7EB` | `border-gray-200` | Card, input, table, sidebar, header borders |
| `border-strong` | `#D1D5DB` | `border-gray-300` | Hover state borders on interactive cards/inputs, terminal node |
| `border-focus` | `#2563EB` | `border-blue-600 ring-blue-600/20` | Active focus ring (`2px`) + selected node/option border |

### §2.4. Primary Action Accent (Single Brand Accent — `action-primary`)

> One restrained academic blue — **not** indigo/violet (that hue is explicitly
> retired as "AI-slop-coded"). Used for primary buttons, active tab underline,
> active nav, links, focus rings. **Never repeated decoratively.**

| Token | Hex | Tailwind Class | Usage |
|---|:---:|---|---|
| `action-primary` | `#2563EB` | `bg-blue-600 / text-blue-600` | Primary CTAs (max 1 per screen), active nav, links |
| `action-primary-hover` | `#1D4ED8` | `hover:bg-blue-700` | Hover state |
| `action-primary-active` | `#1E40AF` | `active:bg-blue-800` | Pressed state |
| `action-primary-disabled` | `#93C5FD` | `disabled:bg-blue-300` | Disabled primary fill |
| `action-primary-subtle` | `#EFF6FF` | `bg-blue-50` | Active sidebar bg tint, info banners, selected option card |

### §2.5. Case Lifecycle Status Tokens (`DRAFT → REVIEWED → APPROVED → PUBLISHED`)

Status badges MUST always pair BG + text + `6px` status dot. Never use purple
for `APPROVED` or amber for `DRAFT`.

| Status | Badge BG | Badge Text | Dot Hex | Meaning |
|---|:---:|:---:|:---:|---|
| `DRAFT` | `#F3F4F6` | `#4B5563` | `#9CA3AF` | AI-generated or newly created; not yet edited by Lecturer |
| `REVIEWED` | `#EFF6FF` | `#1D4ED8` | `#2563EB` | Lecturer edited; awaiting formal sign-off |
| `APPROVED` | `#FFFBEB` | `#92400E` | `#D97706` | Approved; not yet visible to students |
| `PUBLISHED` | `#F0FDF4` | `#166534` | `#16A34A` | Live; accessible to students via direct link |

### §2.6. Learning Mode Tokens

Visually distinct from status badges AND `action-primary` — a Case Card can
show Mode + Status simultaneously without color collision.

| Mode | Badge BG | Badge Text | Optional Border | Meaning |
|---|:---:|:---:|:---:|---|
| `BRANCHING_STUDY` | `#F0FDFA` | `#0F766E` | `#CCFBF1` | Interactive multi-branch decision tree (Teal) |
| `REVIEW_STUDY` | `#FDF2F8` | `#BE185D` | `#FCE7F3` | Open-ended analysis/solution case — no tree (Pink) |

### §2.7. AI-Origin Marker (`ai-support`)

Used **only** as a small neutral pill on AI-generated content. Never colored,
never animated, never glowing.

| Token | Hex | Usage |
|---|:---:|---|
| `ai-support-bg` | `#F3F4F6` | Pill background — same as `bg-surface-muted`, deliberately unsaturated |
| `ai-support-text` | `#4B5563` | Pill label text + icon stroke |

### §2.8. Semantic Feedback Colors

| Token | Foreground | BG Tint | Border Tint | Usage |
|---|:---:|:---:|:---:|---|
| `semantic-success` | `#16A34A` | `#F0FDF4` | `#BBF7D0` | Completed ingestion, toast success |
| `semantic-warning` | `#D97706` | `#FFFBEB` | `#FDE68A` | Processing/pending, unpublish warning |
| `semantic-error` | `#DC2626` | `#FEF2F2` | `#FECACA` | Validation errors, failed ingestion, danger button |
| `semantic-info` | `#2563EB` | `#EFF6FF` | `#BFDBFE` | Neutral system notices |

---

## §3. Icon System Standards

### §3.1. Format & Technical Rules

- **Library**: `lucide-react` — clean monoline outline SVG icons only
- **SVG Attributes** (mandatory on every icon):
  ```
  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"
  strokeWidth={1.75}   strokeLinecap="round"  strokeLinejoin="round"
  ```
- **Color**: Always `stroke="currentColor"` — inherits from parent text token.
  At rest: `text-secondary (#4B5563)` or `text-muted (#9CA3AF)`.
  On active/hover: `text-primary (#111827)` or `action-primary (#2563EB)`.
  Never multi-color, filled-cartoon, or 3D icons.
- **Accessibility**:
  - Decorative icons next to text: `aria-hidden="true"`
  - Icon-only buttons: explicit `aria-label="..."` + min `32×32px` hit target
    (`p-1.5 rounded-md`)

### §3.2. Icon Size Scale

| Token | Size | Tailwind | Context |
|---|:---:|---|---|
| `icon-xs` | `14×14px` | `h-3.5 w-3.5 shrink-0` | Inside compact badges (`AiOriginTag`, status dots, meta tags) |
| `icon-sm` | `16×16px` | `h-4 w-4 shrink-0` | Buttons (`gap-2`), sidebar nav items, breadcrumbs, table actions |
| `icon-md` | `20×20px` | `h-5 w-5 shrink-0` | Modal close, alert/toast leading icon, card header |
| `icon-lg` | `24×24px` | `h-6 w-6 shrink-0` | Inside `40×40px` (`rounded-lg bg-gray-100`) container for EmptyState, ErrorState, dropzone |

### §3.3. Canonical Domain Icon Mapping

| UI Element | Required Lucide Icon | Forbidden |
|---|---|---|
| Brand Logo | `GitBranch` `18px #2563EB` inside `28×28px #2563EB rounded-md` square | 🚫 `🌿` leaf |
| Sidebar: Courses | `BookOpen` `16px` | 🚫 `📚` |
| Sidebar: Teaching Materials | `FileText` `16px` | 🚫 `📋` |
| Sidebar: Case Studies | `GitBranch` `16px` | 🚫 `🎯` |
| Sidebar: Statistics | `BarChart2` `16px` | 🚫 `📊` |
| Sidebar: Sign Out | `LogOut` `16px` | 🚫 door emoji |
| Upload Dropzone | `UploadCloud` `24px` in `40px bg-gray-100 rounded-lg` | 🚫 `↑` text |
| Empty State | `Inbox` or `FolderOpen` `24px` in `40px bg-gray-100 rounded-lg` | 🚫 `📭` |
| Error Alert | `AlertCircle` `20px` in `#DC2626` | 🚫 `❌` `⚠️` |
| Warning Banner | `AlertTriangle` `20px` in `#D97706` | 🚫 `⚡` |
| Success / Completed | `CheckCircle2` `16px` in `#16A34A` | 🚫 `✅` `✓` text |
| AI-Origin Tag | `Cpu` or `FileCode` `14px #4B5563` | 🚫 `✦` `✨` `🤖` |
| AI Challenge Support | `MessageSquareQuestion` `16px #4B5563` | 🚫 robot face |
| Lecturer Feedback | `UserCheck` `16px #4B5563` | 🚫 `👨‍🏫` |
| Terminal Outcome Node | `Flag` `14px #4B5563` | 🚫 `🏁` |
| Breadcrumb separator | `ChevronRight` `14px` | 🚫 `->` `→` |
| Navigation back | `ArrowLeft` `16px` | 🚫 `←` text |
| Modal close | `X` `20px stroke` | 🚫 `✕` `&times;` |
| Retry / New Attempt | `RotateCcw` `16px` | 🚫 restart emoji |

---

## §4. Typography, Spacing, Radius & Elevation

### §4.1. Font Stack

Use the native system sans-serif stack — no custom web fonts in this phase:

```css
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

On Figma: use **Inter** (closest match to system-ui).

### §4.2. Type Hierarchy

| Token | Size / LH | Weight | Figma Style | Usage |
|---|:---:|:---:|---|---|
| `text-display` | `24px / 32px` | `600` | `Display` | Page title in `PageHeader` |
| `text-h1` | `20px / 28px` | `600` | `H1` | Major section title, case title in player |
| `text-h2` | `16px / 24px` | `600` | `H2` | Card title, modal title, side-panel title |
| `text-h3` | `14px / 20px` | `600` | `H3` | Subsection header, form group title |
| `text-body-prose` | `15px / 24px` | `400` | `Body Prose` | Academic reading: `situation`, `context_text`, `problem_text` |
| `text-body` | `14px / 22px` | `400` | `Body Default` | Standard body copy, table cells |
| `text-body-strong` | `14px / 20px` | `500` | `Body Strong` | Form labels, button labels, active nav links |
| `text-caption` | `12px / 16px` | `400/500` | `Caption` | Timestamps, badge text, char counters, table col headers |
| `text-mono` | `12px / 18px` | `400` | `Mono` | Course codes (`BUS301`), file extensions (`PDF`), chunk counts |

**Reading Measure Rule**: All long-form academic text (`situation`, `context_text`,
`consequence`, `lecturer_feedback`) MUST be constrained to `65–75 characters/line`
(`max-w-prose` or `max-w-3xl`) with `leading-relaxed` (1.625) line-height.

**No All-Caps Sentences**: `uppercase tracking-wider text-xs` ONLY for short
1–3 word category labels or table column headers.

**WCAG AAA Contrast Requirement**: All body text must achieve minimum `7:1`
contrast ratio. `text-primary (#111827)` on `bg-surface (#FFFFFF)` = `17.7:1` ✅.
Never use `text-muted (#9CA3AF)` for body reading text.

### §4.3. Spacing — Strict 4px/8px Grid (No Odd Pixels)

**Allowed values only**: `4 8 12 16 20 24 32 48 64px`

Any spacing NOT in this list (e.g., `7px, 9px, 13px, 17px, 21px`) is a
**hard violation** — fix immediately.

| Context | Value | Tailwind |
|---|---|---|
| Page container padding (desktop) | `px-24px py-32px` | `px-6 py-8` |
| Page container padding (mobile) | `px-16px py-24px` | `px-4 py-6` |
| Card internal padding | `24px` desktop, `16px` compact | `p-6` / `p-4` |
| Gap between page sections | `24px` | `space-y-6` |
| Gap between form fields | `16px` | `space-y-4` |
| Label to input gap | `6px` | `mb-1.5` |
| Icon to label gap (buttons/nav) | `8px` | `gap-2` |
| Sidebar nav item gap | `4px` | `gap-1` |

### §4.4. Border Radius

| Token | Value | Tailwind | Usage |
|---|:---:|---|---|
| `radius-sm` | `6px` | `rounded-md` | Inputs, selects, textareas, buttons, icon buttons, code/tag pills |
| `radius-md` | `8px` | `rounded-lg` | Standard Cards, alert banners, table containers, ReactFlow nodes |
| `radius-lg` | `12px` | `rounded-xl` | Modals and Dialogs ONLY |
| `radius-full` | `9999px` | `rounded-full` | **ONLY** for `CaseStatusBadge` and `LearningModeBadge`. NEVER for buttons. |

### §4.5. Elevation — Flat-First Principle

| Surface | Rule |
|---|---|
| Cards at rest | `bg-white border border-gray-200` — **no shadow** |
| Interactive cards on hover | `hover:border-gray-300 hover:shadow-sm transition-all` |
| Dropzone drag-over | `border-blue-500 bg-blue-50` |
| Modals / Dialogs | `shadow-lg border border-gray-200` over `bg-gray-900/40` backdrop |
| Toasts | `shadow-md` — floating, not page-level |
| ReactFlow canvas | `bg-gray-50` with `dot-grid #E5E7EB` — no shadow on canvas |

---

## §5. Auto-Layout Rules (Figma — Mandatory 100%)

> Every Component and Frame on Figma MUST use Auto-Layout. Fixed-coordinate
> groups are forbidden. They produce dead spacing that breaks 1:1 dev handoff.

### §5.1. Standard Auto-Layout Presets

| Frame Type | Direction | Padding | Gap | Width |
|---|---|---|---|---|
| Page Section Container | `Vertical` | `32px top/bottom, 24px sides` | `24px` | `Fill container` |
| Card (standard) | `Vertical` | `24px` | `16px` | `Fill container` |
| Card (compact) | `Vertical` | `16px` | `12px` | `Fill container` |
| Form Field Group | `Vertical` | `0px` | `6px` | `Fill container` |
| Button | `Horizontal` | `10px top/bottom, 16px sides` | `8px` | `Hug contents` |
| Badge / Pill | `Horizontal` | `2px top/bottom, 10px sides` | `6px` | `Hug contents` |
| Sidebar Nav Item | `Horizontal` | `8px top/bottom, 12px sides` | `8px` | `Fill container` |
| Icon + Label Row | `Horizontal` | `0px` | `8px` | `Hug contents` |
| Academic Reading Column | `Vertical` | `0px` | `24px` | `Fixed 768px` |
| Modal | `Vertical` | `24px` | `20px` | `Fixed 560px` or `640px` |
| Drawer / Side Panel | `Vertical` | `0px` | `0px` | `Fixed 480px` |
| Figma Desktop Frame | `Vertical` | `0px` | `0px` | `Fixed 1440px, Height: Auto` |

### §5.2. Figma Frame Naming Convention

Frames must be named exactly as: `[DES-XXX] Frame NN.N — Description`  
Example: `[DES-010] Frame 04.1 — Branching Player Active Decision Point`

---

## §6. 7-State Interaction Matrix (Mandatory — Every Interactive Component)

> AI-generated UIs almost always design only the `Default` state ("happy path").
> Every interactive component in Figma MUST show all 7 states below.

| State # | State Name | Visual Specification |
|---|---|---|
| **1** | `Default / Rest` | Base token values — no modification |
| **2** | `Hover` | `border-gray-300 bg-gray-50` (card/input) or `bg-blue-700` (button) |
| **3** | `Active / Pressed` | `bg-blue-800` (primary button) or `bg-gray-200` (card) |
| **4** | `Focus-Visible` | `outline-none border-blue-600 ring-2 ring-blue-600/20` — `2px solid #2563EB` + `4px spread` |
| **5** | `Disabled` | `opacity-50 cursor-not-allowed` — content grayed out, no interaction |
| **6** | `Error / Validation` | `border-red-500 bg-red-50` field + `12px #DC2626` error message below |
| **7** | `Loading / Processing` | Inline `Spinner 16px #2563EB` replacing button label, or `Skeleton` pulse replacing content |

### §6.1. Text Overflow & Defensive UI

Long text MUST be handled defensively — never overflow containers:

| Element | Rule |
|---|---|
| Case Card title | `line-clamp-2` — truncate at 2 lines |
| Case Card description | `line-clamp-3` — truncate at 3 lines |
| Sidebar nav item text | `truncate` — single line with ellipsis |
| Table cell (long text) | `truncate max-w-[200px]` |
| Reasoning Textarea | `min-h-[120px]` — vertically resizable, no max-height cap |
| Node situation text | `line-clamp-3` on canvas card; full text in inspector panel |
| Badge label | Max `24 chars` — truncate with `...` if exceeded |

---

## §7. Component Specifications

### §7.1. Core Shared Primitives

**`Button` Component**

| Variant | Base Classes |
|---|---|
| `primary` | `h-10 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:bg-[#93C5FD] disabled:cursor-not-allowed` |
| `secondary` | `h-10 px-4 bg-white text-[#111827] text-sm font-medium border border-[#E5E7EB] rounded-md hover:bg-[#F3F4F6] active:bg-[#E5E7EB]` |
| `danger` | `h-10 px-4 bg-[#DC2626] text-white text-sm font-medium rounded-md hover:bg-red-700 active:bg-red-800` |
| `ghost` | `h-10 px-4 bg-transparent text-[#4B5563] text-sm font-medium rounded-md hover:bg-[#F3F4F6] hover:text-[#111827]` |

Sizes: `sm` (`h-8 px-3 text-xs`), `md` (`h-10 px-4 text-sm`), `lg` (`h-11 px-5 text-sm`)

> **Rule**: Max **1 `primary` button** visible per view/modal at any time.

**`Input` / `Select` / `Textarea`**

- `<label htmlFor={id}>` is mandatory — never rely on `placeholder` alone
- Input/Select: `h-10 px-3 py-2 text-sm bg-white border border-gray-200 rounded-md`
- Focus: `focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20`
- Error: `border-[#DC2626] ring-[#DC2626]/20` + `text-xs text-[#DC2626] mt-1` error message
- Academic Textarea: `min-h-[120px] leading-relaxed resize-y` (Reasoning, Reflection, Feedback)

**`CaseStatusBadge`**

```
rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5
```
Contains: `6px` (`h-1.5 w-1.5 rounded-full`) colored dot + text label.
Uses exact §2.5 hex pairs. Zero deviation.

**`LearningModeBadge`**

```
rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5
```
`Branching Study`: teal `#F0FDFA / #0F766E` + `GitFork` icon  
`Review Study`: pink `#FDF2F8 / #BE185D` + `FileCheck2` icon

**`AiOriginTag`**

```
bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs font-medium
inline-flex items-center gap-1
```
14px `Cpu` or `FileCode` icon + `"AI Draft"` or `"AI-assisted"` label.  
Shown ONLY when `status = DRAFT`. Hidden once `REVIEWED/APPROVED/PUBLISHED`.

**`Skeleton` / `EmptyState` / `ErrorState`**

- `Skeleton`: `animate-pulse bg-gray-100 rounded-md` — match exact layout shape
- `EmptyState`: `40×40px rounded-lg bg-gray-100` + `24px` outline SVG + title + 1-sentence description + optional CTA
- `ErrorState`: Same but `bg-red-50` + `AlertCircle 24px #DC2626` + "Try Again" button

### §7.2. Realistic Mock Data Standard (Anti-Generic Copy)

> AI-generated UIs commonly fill frames with `"Lorem ipsum"`, `"Title goes
> here"`, `"User 1"`. This is forbidden. All mock data in Figma MUST be
> realistic academic content.

| Field | Required Realistic Example |
|---|---|
| Course name | `"Corporate Governance & Business Ethics"` |
| Course code | `"LAW301"` or `"BUS402"` |
| Case title | `"Conflict of Interest: Board Disclosure During M&A"` |
| Situation text | `"The CEO of TechCorp has received an acquisition offer from RiverBridge Capital. Three board members hold significant equity in RiverBridge. The General Counsel requests an emergency board meeting..."` |
| Consequence text | `"By choosing immediate disclosure, the board preserved institutional integrity but triggered a 48-hour trading halt and significant media scrutiny of the transaction..."` |
| Student reasoning | `"I selected Option B because the fiduciary duty to shareholders outweighs the short-term reputational risk. The Caremark standard requires..."` |
| Lecturer feedback | `"Your analysis correctly identifies the Caremark duty. However, consider the Delaware Court's ruling in Smith v. Van Gorkom regarding..."` |
| Student name | `"Nguyen Thi Lan"` |
| File name | `"Syllabus_Corporate_Governance_2026.pdf"` |

---

## §8. App Shell & Layout Architecture

### §8.1. Lecturer Portal Shell (`LecturerLayout`)

**Desktop structure** (`1440px` frame, `min-h-screen bg-[#F9FAFB] flex`):

**Left Sidebar** (`w-60` / `240px` fixed, `bg-white border-r border-gray-200`):
- **Brand Header** (`h-14 px-5 border-b border-gray-200`):
  - `GitBranch` `18px #2563EB` inside `28×28px #2563EB rounded-md` + `"EduBranch AI"` `16px SemiBold #111827` + `"Lecturer"` pill (`bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded`)
- **Nav** (`p-3 space-y-1 flex-1`):
  - Top-level: `Courses` (`BookOpen`), `Statistics` (`BarChart2`)
  - Contextual (when inside a course): `Materials` (`FileText`), `Case Studies` (`GitBranch`), `Case Review`, `Feedback` — indented `ml-3`
  - Active: `bg-[#EFF6FF] text-[#2563EB] font-medium` + `3px left border #2563EB` + `aria-current="page"`
  - Inactive: `text-gray-600 hover:bg-gray-100 hover:text-gray-900`
- **User Footer** (`p-4 border-t border-gray-200`): Full name `text-sm font-medium` + role caption + `LogOut` button

**Main Content** (`flex-1 min-w-0`):
- Standard pages: `max-w-6xl mx-auto px-6 py-8`
- Case Review workspace: `h-screen flex flex-col overflow-hidden` → `h-14` lifecycle bar + split pane (`60%` ReactFlow / `40%` `480px` inspector)

### §8.2. Student Portal Shell (`StudentLayout`)

**Structure** (`min-h-screen bg-[#F9FAFB] flex flex-col`):

**Top Header** (`h-14 bg-white border-b border-gray-200 px-6`):
- Left: `"EduBranch AI"` `text-sm font-semibold` + `h-4 w-px bg-gray-200` divider + `LearningModeBadge` + `Step Pill` (`"Phase 1: Experience"`)
- Right: Student name `text-sm text-gray-600` + `LogOut` icon button

**Main Container**: `max-w-3xl w-full mx-auto px-6 py-8 flex-1`  
(768px reading column — no sidebar, no peripheral distraction)

### §8.3. Public Auth Shell (`PublicLayout`)

`min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 px-4`  
Single card: `max-w-md w-full mx-auto bg-white border border-gray-200 rounded-xl p-8`  
Above card: wordmark + subtitle `"University Case-Based Learning Platform"`

---

## §9. Product Domain Widgets

### §9.1. Case Governance Lifecycle Stepper

4-step horizontal stepper in the Case Review top bar (`h-14`):
```
(1) Draft ─── (2) Reviewed ─── (3) Approved ─── (4) Published
```
- Completed step: `20px` circle `bg-[#2563EB]` + white `Check` icon + solid `#2563EB` connector line
- Current step: `20px` circle `border-2 border-[#2563EB]` + bold `#111827` label + `CaseStatusBadge`
- Future step: `20px` circle `border border-gray-300` + `#9CA3AF` label + `#E5E7EB` connector line

Conditional action buttons (right side):
- At `DRAFT`: `"Save & Mark as Reviewed"` (secondary) | `"Approve"` (disabled) | `"Publish"` (disabled)
- At `REVIEWED`: `"Save Changes"` (secondary) | `"Approve Case"` (primary) | `"Publish"` (disabled + tooltip)
- At `APPROVED`: `"Revert to Draft"` (secondary) | `"Publish to Students"` (primary + `Globe` icon)
- At `PUBLISHED`: `"Published"` badge + `"Copy Student Link"` (secondary) + `"Unpublish"` (secondary)

### §9.2. ReactFlow Decision Tree Canvas

**Canvas**: `bg-[#F9FAFB]` with subtle dot-grid (`#E5E7EB`, `16px` spacing)  
**Edges**: Smoothstep, `1.5px`, `#9CA3AF` at rest → `#2563EB` selected → `#DC2626` on cycle error.  
**Edge label**: `11px #4B5563` on `#FFFFFF` pill (`border #E5E7EB, radius 4px, px-1.5 py-0.5`)  
Never use `#6366F1` indigo edges.

**Node Variants** (all `w-64 bg-white rounded-lg p-3.5 text-left`):

| Variant | Border | Header Badge |
|---|---|---|
| Root Node | `1px #E5E7EB` | `START` pill `#EFF6FF / #1D4ED8` |
| Intermediate Decision | `1px #E5E7EB` | `DECISION NODE` pill `#F3F4F6 / #4B5563` |
| Terminal Outcome | `1.5px #D1D5DB` | `Flag` icon + `OUTCOME` pill `#F3F4F6 / #374151` |
| Selected (editing) | `2px #2563EB ring-2 ring-[#2563EB]/20` | current badge + blue glow ring |
| Validation Error | `2px #DC2626` | `"Loop Detected"` / `"Orphan Node"` badge `#FEF2F2 / #DC2626` |

> **Hard Rule**: Never color-code nodes green (correct) vs red (wrong). There is
> no correct path in EduBranch-AI — every color on a node must be structural,
> not evaluative.

### §9.3. Branching Case Player — Phase 1 (Experience)

Layout: `StudentLayout` + `768px` single reading column.

**Situation Card** (`bg-white border border-gray-200 rounded-xl p-8`):
- Eyebrow label: `"CURRENT SITUATION"` `12px SemiBold uppercase tracking-[0.05em] text-gray-600`
- Body: `15px / 24px text-gray-900 leading-relaxed`

**Option Selector** (vertical stack, `gap: 12px`):
- Title: `"Select your course of action"` `16px SemiBold` — NO callout boxes explaining rules
- Each option card: `bg-white border border-gray-200 rounded-lg p-4 text-left`
  - Rest: `18px` radio circle `border border-gray-300` + index badge (`A/B/C`) `24px rounded-md bg-gray-100 text-gray-700 text-xs font-medium`
  - Selected: `border-2 border-[#2563EB] bg-[#EFF6FF]` + filled radio `#2563EB`
- CTA: `"Confirm & Continue"` primary button + `ArrowRight` icon

> **PEDAGOGICAL INVARIANT (Phase 1)**: Between decision points, there MUST be
> ZERO: reasoning textareas, consequence cards, instructional banners, loading
> overlays, or explanatory callouts. Selecting an option IMMEDIATELY advances
> to the next node. This is non-negotiable and must be enforced in both Figma
> frames and frontend code.

**Terminal Outcome Card** (`bg-white border-[1.5px] border-gray-300 rounded-xl p-8`):
- Header: `36×36px bg-gray-100 rounded-lg` + `Flag 18px #374151` + `"Scenario Outcome Reached"` badge
- Body: terminal `situation` text
- Footer: `"Proceed to Journey Review & Analysis"` primary button

### §9.4. Branching REVIEW Phase — Phase 2 (Journey Review)

Vertical chronological timeline (`border-l-2 border-gray-200 ml-3 pl-6 space-y-6`).

Each **Decision Step Review Card** (`bg-white border border-gray-200 rounded-xl p-6`):

1. **Step Header**: `"Step N"` badge (`#EFF6FF / #1D4ED8`) + situation summary title
2. **Chosen Option Block**: `bg-[#EFF6FF] border-l-2 border-[#2563EB] px-4 py-3 rounded-r-md`
   - Label: `"Your Choice"` `12px SemiBold uppercase #2563EB`
   - Content: `option_text` the student selected
3. **Alternatives Disclosure**: `"View N unchosen alternatives"` collapsed — expand to show in `text-gray-400 text-sm` (never `line-through` — implies error)
4. **Consequence Reveal Block** (`bg-[#F3F4F6] border-l-4 border-[#0F766E] px-4 py-4 rounded-r-lg`):
   - Label: `"CONSEQUENCE"` `12px SemiBold uppercase tracking-wider #0F766E`
   - Content: `case_options.consequence` — revealed HERE for the first time
5. **Retrospective Reasoning Textarea**:
   - Label: `"Your Reasoning"` `14px Medium #111827`
   - Caption: `"Why did you select this option? What trade-offs did you consider? (10–2000 characters)"` `12px #4B5563`
   - Textarea: `min-h-[120px] resize-y`
   - Actions: `"Save Reasoning"` (primary/secondary) + `"Explore with AI Challenge Support (N/2 rounds)"` (secondary, unlocks after saving reasoning)

### §9.5. Reflection & Retry Phase — Phase 3

**Attempt Summary Banner** (`bg-white border border-gray-200 rounded-lg p-5`):
- `"Attempt #N Completed"` — terminal outcome reached, steps count, reflection status

**Reflection Card** (`bg-white border border-gray-200 rounded-xl p-6`):
- Label: `"Your Post-Case Reflection"` `16px SemiBold`
- Caption: `"Synthesize what you learned from the consequences encountered."` `12px #4B5563`
- Textarea: `min-h-[160px] resize-y`
- After submit: read-only + `"Reflection Submitted"` badge `#F0FDF4 / #166534`

**Retry Card** (`bg-[#F9FAFB] border border-gray-200 rounded-lg p-5 flex items-center justify-between`):
- Left: `RotateCcw 20px #4B5563` + `"Explore an Alternative Decision Path"` + `"Start a new immutable attempt (Attempt #N+1) while preserving your history."`
- Right: `"Try Another Path"` secondary button

**New Attempt Confirmation Modal** (`480px`):
- No "correct answer" framing. Copy must convey exploration, not correction:
  `"Starting Attempt #2 lets you explore different decisions and consequences while your completed Attempt #1 history and reflections are permanently preserved."`

### §9.6. AI Challenge Support — Socratic Panel

> This panel must NEVER look like a chat interface. It is a structured academic
> exchange thread with flat cards, not conversational bubbles.

**Header** (`Challenge Header Bar`):
- Left: `"AI Reasoning & Challenge Support"` `20px SemiBold` + `13px` description `"Socratic counter-questions to probe assumptions — non-evaluative and ungraded."`
- Right: **2-Round Progress Pill** — `Round 1 of 2` (dot 1: `#2563EB filled`, dot 2: `#D1D5DB outline`)

**Context Anchor Card** (read-only, `bg-[#F3F4F6] border border-gray-200 rounded-lg p-4`):
- Shows the student's reasoning text for reference

**AI Counter-Question Card** (`bg-white border border-gray-200 rounded-xl p-6`):
- Header row: `"Step N — Counter-Question"` `12px SemiBold #4B5563` + `AiOriginTag` (`AI-assisted · Round N`)
- Body: Single focused Socratic question (never multiple questions per round)
- NO chat bubble tail. NO avatar. NO purple accent. NO typing animation.

**Student Response Textarea** (`min-h-[120px]`):
- Label: `"Your Clarification / Response"` `14px Medium`
- Actions: `"Conclude Session & Return"` (secondary, left) + `"Submit for Round 2"` (primary, right)

**Session Complete Footer** (replaces textarea after Round 2):
- `bg-[#F3F4F6] border border-gray-200 rounded-lg p-5 text-center`
- `CheckCircle2 18px #4B5563` + `"Challenge Support session completed (Maximum 2 rounds reached). You may now update your reasoning or proceed to final reflection."`
- `"Return to Review & Reflection"` primary button

### §9.7. Lecturer Feedback Block

`bg-gray-50 border border-gray-200 rounded-xl p-6`  
Header: `UserCheck 16px #374151` + `"Lecturer Qualitative Feedback"` `14px SemiBold`  
No score field. No grade field. No AI suggestion button. 100% human-authored textarea.  
Never use yellow/amber warning colors or teacher emoji on this block.

### §9.8. Statistics Widgets

**KPI Summary Cards** (4 cards in a row):
- Label: `text-xs font-medium text-gray-500 uppercase tracking-wider`
- Value: `text-2xl font-semibold text-gray-900` (number only — no emoji)
- Trend icon: subtle `16px` outline icon `text-gray-400` top-right corner

**Branch Distribution Bars**: Single-color horizontal bars `#2563EB` at varying
opacity levels (`100% / 70% / 40%`) — never a rainbow multi-color chart.

---

## §10. Pedagogical Flow Boundaries (Hard Invariants)

These rules are enforced at **both the Figma frame level and the frontend code
level**. Violating them in a Figma frame = the frame fails acceptance criteria.

| Invariant ID | Rule | Enforcement |
|---|---|---|
| `INV-UI-01` | No reasoning form or consequence card between decision points (Phase 1) | Figma: zero such elements in `Frame 04.1`. Code: no conditional textarea render during Experience phase |
| `INV-UI-02` | Consequence text first appears ONLY in Phase 2 Review Timeline | Figma: only in `Frame 04.3` consequence blocks. Code: `consequence` field never sent to Phase 1 API response |
| `INV-UI-03` | AI Challenge Support hard-capped at 2 rounds — UI must show round counter and lock input after Round 2 | Figma: `Frame 05.7` shows locked state. Code: `isCompleted` check gates the reply textarea |
| `INV-UI-04` | No score/grade/pass/fail UI anywhere — not on AI panel, not on stats, not on feedback | Figma: zero such labels. Code: no score field in any form or response display |
| `INV-UI-05` | No student-facing ReactFlow canvas — decision tree is lecturer-only | Figma: `Frame 04.x` (Student) has no ReactFlow. Code: `CaseReviewPage` is `/lecturer/*` route only |
| `INV-UI-06` | Review Study has no Retry button — single submission only | Figma: `Frame 05.2` shows read-only state, no retry affordance. Code: `submission_status = SUBMITTED` renders read-only |
| `INV-UI-07` | AiOriginTag visible ONLY when `status = DRAFT` | Figma: tag absent in `REVIEWED/APPROVED/PUBLISHED` variants. Code: conditional render on status |
| `INV-UI-08` | Students MUST NOT access unpublished cases — show 403/warning state | Figma: `Frame 01.4` 403 state. Code: `INV-01` enforced at repository query level |

---

## §11. Route Map & Navigation Guards

> Mirrors `frontend/src/app/router.tsx` and `docs/design/SITE-ARCHITECTURE.md`.

### §11.1. Public Routes (`PublicLayout`)
- `/` — Landing: Hero, Dual Learning Modes comparison, 4-Step Governance workflow, Entry CTAs
- `/login` — University email + password sign-in
- `/register` — Account creation with explicit `STUDENT / LECTURER` role selector (segmented radio, 2 options)

### §11.2. Lecturer Routes (`LecturerLayout`)
- `/lecturer/courses` — Course catalog + `"New Course"` modal
- `/lecturer/courses/:courseId/materials` — Upload center (PDF/DOCX, max 50MB) + RAG ingestion status table
- `/lecturer/courses/:courseId/cases` — Case list (mode filter tabs) + `"Generate Case"` modal
- `/lecturer/cases/:caseId/review` — 4-step stepper + ReactFlow editor (Branching) or form editor (Review Study)
- `/lecturer/cases/:caseId/feedback` — Student submissions inspector + Qualitative Feedback composer
- `/lecturer/statistics` — Cohort completion rate, attempt counts, branch distribution

### §11.3. Student Routes (`StudentLayout`)
- `/student/cases/:caseId/branching-play` — Phase 1 Experience (no mid-flow blocks)
- `/student/cases/:caseId/attempt/:attemptId/review` — Phase 2 Journey Review (consequence reveal + retrospective reasoning)
- `/student/cases/:caseId/attempt/:attemptId/reflect` — Phase 3 Reflection + Retry initiation
- `/student/cases/:caseId/challenge/:sessionId` — Socratic AI Challenge (1–2 rounds, zero grading)
- `/student/cases/:caseId/review-study` — Review Study workspace (single submission)
- `/student/cases/:caseId/review-study/:submissionId/feedback` — Lecturer feedback view + post-feedback reflection

---

## §12. Frontend Code Guardrails

1. **Presentational Separation**: `src/components/ui/` — strictly presentational, no API calls.
   All HTTP → `src/services/apiClient.ts` → `src/services/*.ts`.
2. **Zero Internal Data Leaks**: Never render `nodeId`, `attemptId`, `userId` UUIDs, raw stack
   traces, embedding vectors, or internal prompt structures in any user-facing component.
3. **Client + Server Validation**: Enforce all constraints client-side before submit:
   - Reasoning / reflection: `10–2000 chars`
   - Password: `min 8 chars`
   - File upload: `PDF/DOCX only`, `max 50MB`
   - Topic/prompt: `10–500 chars`
   Show inline `semantic-error` messages, never silent failures.
4. **Dark Mode Disabled**: Remove all `dark:*` Tailwind classes globally. Light mode only.
5. **Spacing Lint**: Any CSS value outside `[4, 8, 12, 16, 20, 24, 32, 48, 64]px` is a linting
   violation. Use `eslint-plugin-tailwindcss` to catch arbitrary values.

---

## §13. Reference Documents (Read-Only Archives)

These files are **informational context only** — they do NOT define rules.
When conflicts exist, this file (`01-ui-design-standards.md`) takes precedence.

| File | Purpose |
|---|---|
| `docs/design/GLOBAL-DESIGN-SYSTEM.md` | Extended prose rationale for color and component decisions |
| `docs/design/SITE-ARCHITECTURE.md` | Product vision, user roles, and route listing |
| `docs/design/screens/P0-FOUNDATION.md` | Foundation screen spec (Landing, Auth, App Shells) |
| `docs/design/screens/P1-LECTURER-CORE.md` | Lecturer workflow screen spec |
| `docs/design/screens/P2-STUDENT-CORE.md` | Student branching flow screen spec |
| `docs/design/screens/P3-SUPPORT-AND-STATISTICS.md` | Statistics & Feedback screen spec |
| `docs/design/screens/P4-REVIEW-STUDY.md` | Review Study screen spec |
| `docs/05_FIGMA.md` | Figma implementation blueprint — 15 DES tasks, 6 Pages, Auto-Layout specs |
