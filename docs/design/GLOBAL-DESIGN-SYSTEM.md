 EduBranch-AI — Global Design System

> **Status**: CANONICAL — supersedes `.stitch/DESIGN.md` (retired/deleted).
> **Visual language v2 (2026-11-12, PO decision in chat)** (typography and imagery aligned to the Eduva template later on 2026-11-12; canonical Figma reference: page `08 · EduBranch – Bản hoàn chỉnh`): §1.1 (tone), §2, §3.1, §3.2 (colors), §4, §5, §6 (colors/shapes), §7 and §8 were updated to the layered navy/sky visual language derived from the licensed Eduva template (Figma page `03 · Eduva – Screens`, 14 original desktop screens). The previous flat gray/`#2563EB` values are retired. Product behaviour, pedagogy guardrails and accessibility rules are unchanged.
> **Target Platform**: React 19 / TailwindCSS v4 implementation; Figma file `6CtSgJPKo4jCIbB7WwCaWw` (variables `EduBranch · *`, text styles `EduBranch/*`).
> **Companion Agent Rule**: [`.agents/rules/01-ui-design-standards.md`](../../.agents/rules/01-ui-design-standards.md)
> **Scope**: All EduBranch-AI product screens (14 routes across P0–P4). Does NOT cover the internal "Start Design" tooling — see [`SITE-ARCHITECTURE.md §7`](SITE-ARCHITECTURE.md) for its classification.
> **Source of truth**: Product Direction V2 (EduBranch-AI), `C1SE_65-EduBranch-AI-Proposal_V1.2.docx`.

---

## 1. Visual Theme & Atmosphere

### 1.1. Core Philosophy
EduBranch AI is a professional academic platform for university lecturers and students. The interface must read as **structured, calm and data-rich** — a layered workspace where a white shell holds a soft blue-gray canvas and white cards, and where every color carries meaning.

- **Theme Mode**: **LIGHT ONLY.** No dark mode in this phase. This is a locked decision (Discovery Plan §P.2) — do not design or generate dark-mode variants.
- **Tone**: Academic, professional, modern, lean.
- **AI Representation**: AI is a **function**, never the product's visual identity. No sparkle glyphs as brand signature, no dedicated "AI accent border," no neon/glow, no chat-avatar faces, no typing animations. Where AI-originated content must be marked (a Case Draft, a Challenge Support message), use a small, muted, icon + label tag — never a saturated color block. See §2.7 (`ai-support` token).
- **Visual Density**: Medium-high — the canvas holds several cards per screen (Eduva density), but each card has one job and generous internal padding.
- **Hierarchy Principle**: Typography (weight/size) and the surface ladder (§4.3) lead; color is reserved for brand actions, data series, status and learning mode. Do not use color as decoration.

### 1.2. What This Replaces
The retired `.stitch/DESIGN.md` specified a near-black theme (`#0d0d10`/`#16161a`) with indigo/violet (`#6366f1`) accents and a sparkle-glyph AI signature, scoped to a single internal tooling screen. **None of those hex values, spacing values, or component specs carry forward.** The interim flat gray/`#2563EB` system (2026-10) is also retired by visual language v2.

---

## 2. Color System

All colors are final hex values. Token names are the Tailwind-style names to use in code (`bg-canvas`, `text-primary`, etc.) — see §2.10 for the Tailwind mapping. Every text/background pair meets WCAG AA at its intended size.

### 2.1. Surface & Background

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#FFFFFF` | App shell, sidebar, top navigation |
| `bg-canvas` | `#F3F6FC` | Rounded canvas panel (radius 18) holding all cards |
| `bg-surface` | `#FFFFFF` | Cards, panels, modals, table rows |
| `bg-surface-muted` | `#EEF2F9` | The one inset block allowed inside a card, table header, excerpt blocks, disabled surfaces |
| `bg-surface-hover` | `#E8EDF6` | Hover state for clickable rows/list items/nav items |
| `bg-selected` | `#DFEDF9` | Selected row, active nav item, selected filter segment |

### 2.2. Text

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#202124` | Headings, primary body text, active input value |
| `text-secondary` | `#696A70` | Supporting copy, field descriptions, table body text |
| `text-muted` | `#909198` | Placeholders, disabled text, decorative icons only — never information |
| `text-inverse` | `#FFFFFF` | Text on navy or destructive fills |
| `text-link` | `#2A4E7F` | Inline links, underline on hover |

### 2.3. Borders & Dividers

| Token | Hex | Usage |
|---|---|---|
| `border-default` | `#E1E8F5` | Input borders, table dividers, in-card dividers (not around cards) |
| `border-strong` | `#D1D9E8` | Input hover, secondary buttons, outlined mode tags |
| `border-focus` | `#2A4E7F` | 2px focus ring + `#00A5F5` 30% halo (see §5.4) |

### 2.4. Brand (`action-*`)

Navy is the single action color; sky is a data/highlight accent and never carries text.

| Token | Hex | Usage |
|---|---|---|
| `action-primary` | `#2A4E7F` | Primary buttons, active nav, links, focal data series |
| `action-primary-hover` | `#223F68` | Hover |
| `action-primary-active` | `#1B3253` | Pressed/active |
| `action-primary-disabled` | `#94A7C0` | Disabled primary button |
| `action-primary-subtle` | `#DFEDF9` | Tonal buttons, active nav fill, info banners, icon tiles |
| `action-accent` | `#00A5F5` | Chart series 2, selected calendar day, progress fill (never text) |
| `action-danger` | `#D11F1F` | Destructive button fill |

### 2.5. Case Status (case lifecycle: `DRAFT → REVIEWED → APPROVED → PUBLISHED`)

Filled pill + one 6px dot; one status = one color everywhere.

| Status | Badge BG | Badge Text | Dot | Meaning |
|---|---|---|---|---|
| `status-draft` | `#EEF2F9` | `#696A70` | `#909198` | AI-generated or newly created, not yet human-edited |
| `status-reviewed` | `#DFEDF9` | `#2A4E7F` | `#00A5F5` | Lecturer has edited; not yet approved |
| `status-approved` | `#FFF1DE` | `#9A5700` | `#F58A00` | Lecturer signed off; not yet visible to students |
| `status-published` | `#E1F7E9` | `#007A2D` | `#00B343` | Live; visible to students |

### 2.6. Learning Mode (`BRANCHING_STUDY` vs `REVIEW_STUDY`)

Distinct **shape** from status: outlined rectangular tag (radius 6, white fill, 1px border, 14px icon).

| Token | Border | Text + Icon | Icon | Meaning |
|---|---|---|---|---|
| `mode-branching` | `#D1D9E8` | `#2A4E7F` | `GitFork` | Branching Study — decision-tree cases |
| `mode-review` | `#B3E4FC` | `#00699E` | `FileCheck2` | Review Study — analysis/solution cases |

### 2.7. AI-Origin Marker (`ai-support`)

| Token | Hex | Usage |
|---|---|---|
| `ai-support-bg` | `#EEF2F9` | Tag background (deliberately unsaturated) |
| `ai-support-text` | `#696A70` | Tag label text, tag icon stroke |

Rendered as a small pill: a plain outline icon (`Cpu` / `FileCode` — never a sparkle/star glyph, never a robot/chat-bubble avatar) + the label text `AI-assisted` or `AI Draft`. Always neutral gray, never colored, never animated.

### 2.8. Semantic Feedback Colors

| Token | Icon/Fill | Text on tint | Tint | Border | Usage |
|---|---|---|---|---|---|
| `semantic-success` | `#00B343` | `#007A2D` | `#E1F7E9` | `#B3E8C7` | Success toasts, completed ingestion |
| `semantic-warning` | `#F58A00` | `#9A5700` | `#FFF1DE` | `#FFD9A8` | Pending/processing, unpublish warning |
| `semantic-error` | `#FF3535` | `#D11F1F` | `#FFE5E5` | `#FFBCBC` | Validation errors, failed ingestion |
| `semantic-info` | `#2A4E7F` | `#2A4E7F` | `#DFEDF9` | `#D1D9E8` | Informational banners |

### 2.9. Data Visualisation & Brand Gradient

- Max 3 series per chart: `#2A4E7F` (focal), `#00A5F5`, `#D1D6E0` (baseline/others). Heatmap ramp `#EEF2F9 → #B3E4FC → #00A5F5 → #2A4E7F`. Legends or direct labels and real units are mandatory.
- Never color branches/outcomes as correct/incorrect.
- **Brand panel gradient** (the only gradient): linear 135°, `#2A4E7F → #00A5F5`, used only on the auth brand panel and the landing hero.

### 2.10. Tailwind Token Mapping (implementation reference)

```
bg-page              → bg-white
bg-canvas            → bg-[#F3F6FC]
bg-surface           → bg-white
bg-surface-muted     → bg-[#EEF2F9]
bg-surface-hover     → bg-[#E8EDF6]
bg-selected          → bg-[#DFEDF9]
text-primary         → text-[#202124]
text-secondary       → text-[#696A70]
text-muted           → text-[#909198]
border-default       → border-[#E1E8F5]
border-strong        → border-[#D1D9E8]
action-primary       → bg-[#2A4E7F] / text-[#2A4E7F]
action-primary-hover → bg-[#223F68]
action-accent        → bg-[#00A5F5]
action-danger        → bg-[#D11F1F]
semantic-success     → text-[#007A2D] / icon #00B343
semantic-warning     → text-[#9A5700] / icon #F58A00
semantic-error       → text-[#D11F1F] / icon #FF3535
```
Do not introduce arbitrary hex values outside §2 in prompts or component code — this matches [`.agents/rules/01-ui-design-standards.md §2`](../../.agents/rules/01-ui-design-standards.md).

---

## 3. Typography, Icon System & Microcopy

### 3.1. Typography Scale

```
font-family: 'Roboto', ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
```

| Token | Size / Line-height | Weight | Usage |
|---|---|---|---|
| `text-display` | `40px / 48px` | `500` | Public pages: hero and section headings (Eduva landing) |
| `text-metric` | `28px / 36px` | `500` | `Eduva/Display`: metric values, profile names |
| `text-h1` | `22px / 28px` | `400` | `Eduva/H1`: app page title in the header |
| `text-h2` | `20px / 28px` | `400` | `Eduva/H2`: large panel titles |
| `text-h3` | `16px / 24px` | `400` | `Eduva/H3`: card titles, list item titles, modal titles |
| `text-body` | `14px / 20px` | `400` | `Eduva/Body`: body copy, table cells, form values |
| `text-body-strong` | `14px / 20px` | `500` | `Eduva/Body Strong`: field labels, button labels, active nav |
| `text-prose` | `15px / 22px` | `400` | `Eduva/Body Prose`: long-form reading (situation, context, problem, consequence, feedback) |
| `text-caption` | `12px / 16px` | `400` / `500` | `Eduva/Caption`, `Eduva/Caption Strong`: timestamps, helper text, badges, table headers |
| `text-overline` | `11px / 16px` | `500`, uppercase | `Eduva/Overline`: 1–3 word category labels only |
| `text-mono` | `13px / 20px` | `400`, Roboto Mono | `Eduva/Mono`: course codes, file extensions, counts |

Public pages (Home, How it works, FAQ — Figma page 08, frames 00.2 / 00.6 / 00.7, adopted 2026-11-12) use **Be Vietnam Pro SemiBold** for headings only; body text stays Roboto. Figma text styles `EduBranch/Public Hero` (60/70), `EduBranch/Public H2` (40/50), `EduBranch/Public H3` (22/30), `EduBranch/Public Statement` (Medium 28/38). App screens never use Be Vietnam Pro.

Rules:
- Never use color alone to indicate emphasis where weight can do the job.
- Nothing the user must read is smaller than 12px.
- Long-form reading is capped at ~65–75 characters with `text-prose`.
- **Imagery**: course/case covers, avatars, product mockups and illustrations from the Eduva template are part of the visual language. Never replace them with text-only blocks. A status pill may sit on the top-left of a cover, as in the template.

### 3.2. Icon System (Vector SVG Standard — ZERO Emojis / ZERO ASCII Hacks)

- **Library**: Use **`lucide-react`** (or a dedicated clean SVG icon wrapper in `frontend/src/components/ui/Icon.tsx`) with consistent outline geometry: `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.75}`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
- **Sizes**:
  - `xs` (`14px`): Inside status/mode badges and compact metadata pills.
  - `sm` (`16px`): Inside buttons, table action buttons, and breadcrumbs.
  - `md` (`20px`): Sidebar navigation items, card headers, modal close buttons, 32px icon tiles.
  - `lg` (`24px`): Empty-state / upload icons inside a 40px icon tile.
- **Icon tiles**: 32/40px, radius 8, default `#DFEDF9` with `#2A4E7F` icon. Semantic tints only when the tile itself shows that state. No rainbow tiles.
- **Strict Prohibitions**:
  - **NEVER** use Unicode emojis (`🌿`, `📭`, `📚`, `📋`, `✅`, `🎯`, `📝`, `🏁`, `📊`, `💡`, `📍`, `⚡`, `✍️`, `🤖`, `🔒`, `👤`, `❓`, `👨‍🏫`, `👉`).
  - **NEVER** use raw ASCII character hacks (`->`, `<-`, `&rarr;`, `&times;`, `✕`, `↑`).
- **Canonical Domain Icon Map**:
  - Brand Mark: official logo mark — Figma component `EB/Logo Mark` (source page 03 "Icon K3"), never recoloured or redrawn
  - Courses: `BookOpen` · Materials: `FileText` / `Upload` · Cases: `FolderGit2`
  - Branching Study Mode: `GitFork` · Review Study Mode: `FileCheck2`
  - Terminal Outcome Node: `Flag` · Socratic Challenge Support: `MessageSquareQuestion` / `HelpCircle`
  - Lecturer Feedback: `UserCheck` · Student Reflection: `PenLine` · Statistics: `BarChart3`
  - Retry / New Attempt: `RotateCcw` · Close / Dismiss: `X` · Navigation: `ArrowLeft`, `ArrowRight`, `ChevronRight`

### 3.3. Language & Microcopy Consistency

- **Vietnamese UI** (PO decision 2026-11-02). Zero language mixing on the same screen; no leftover template copy.
- **No Preachy Instructional Callout Spam**: Do not place multi-sentence colored callout boxes explaining how the app works above every textarea or card. Use a single concise helper caption (`12px`, `text-secondary`) if needed.
- Never show raw JSON, enum keys or internal IDs to users.

---

## 4. Spacing, Radii, Elevation

### 4.1. Spacing Scale
`4px · 8px · 12px · 16px · 20px · 24px · 32px · 48px · 64px` (public pages may also use `96px` section rhythm).

- Canvas panel padding: `24px`. Gap between cards: `16px`–`20px`.
- Inner card padding: `20px` (dense) or `24px` (forms, reading).
- Vertical gap between stacked form sections: `24px`; between related fields: `16px`.
- Horizontal gap between inline badges/tags: `8px`.

### 4.2. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 6px | Inputs, buttons, mode tags, course-code tags |
| `radius-md` | 8px | Inset blocks, icon tiles, thumbnails, segmented filters, table containers, toasts |
| `radius-lg` | 12px | Cards |
| `radius-xl` | 18px | Canvas panel, modals, auth brand panel |
| `radius-full` | 9999px | Status badges, AI tag, avatars, count chips only (never buttons) |

### 4.3. Surface Ladder & Elevation

Surface ladder (max 3 levels below the shell): `bg-page` → `bg-canvas` panel → `bg-surface` card → one `bg-surface-muted` inset block. No bordered card inside a card; no tinted block inside a tinted block.

| Token | Value | Usage |
|---|---|---|
| `elevation-0` | none, no border | Cards on canvas (the canvas tint separates them) |
| `elevation-hover` | `0 2px 8px rgba(32,33,36,0.06)` | Clickable cards on hover |
| `elevation-1` | `0 4px 16px rgba(32,33,36,0.08)` | Dropdowns, popovers |
| `elevation-2` | `0 12px 32px rgba(32,33,36,0.16)` | Modals, dialogs |
| `elevation-toast` | `0 4px 16px rgba(32,33,36,0.12)` | Toast notifications |

---

## 5. Shared Component Rules

### 5.1. Button
- **Primary**: `action-primary` fill, `text-inverse`, `radius-sm`, height 40px, horizontal padding 16px. One primary button per screen/section.
- **Secondary**: white, `border-strong`, `text-primary`. Non-destructive secondary actions ("Hủy", "Lưu nháp").
- **Tonal**: `action-primary-subtle` fill, navy text. Repeated row/card actions ("Chỉnh sửa", "Xem").
- **Destructive**: `action-danger` fill, `text-inverse`. Irreversible actions, always behind a confirmation dialog (§5.10).
- **Disabled**: `action-primary-disabled`, `cursor-not-allowed`.
- Shape: rectangular `radius-sm`, never a pill.

### 5.2. Input / Select / Textarea
- White, `border-default`, `radius-sm`, height 40px (input/select) or min-height 120px (long-form textarea).
- Focus: `border-focus` + 3px `#00A5F5` ring at 30%.
- Error state: `semantic-error` border, helper text below in `#D11F1F` at `text-caption`.
- Placeholder: `text-muted`.

### 5.3. Card
- White, **no border, no shadow**, `radius-lg`, padding 20–24px, sitting on the `bg-canvas` panel. `elevation-hover` only if the whole card is clickable.

### 5.4. Focus / Interaction States (all interactive elements)
- **Hover**: `bg-surface-hover` for rows/cards, one step darker for buttons/links.
- **Active/Pressed**: `-active` token.
- **Focus-visible**: 2px `border-focus` + halo, always visible.
- **Disabled**: `text-muted` + 60% opacity + `cursor-not-allowed`; disabled elements never simply disappear.

### 5.5. Table
- Container: white card; header row `bg-surface-muted`, `text-caption` medium, `text-secondary`.
- Rows: 52–56px, `border-default` dividers; hover `bg-surface-hover` when clickable.
- Dense academic data favors tables over card grids when there are more than ~6 items with 3+ comparable fields.

### 5.6. Tabs & Segmented Filters
- Page-level tabs: underline style, active `text-primary` + 2px navy underline.
- In-card filters: segmented control (`bg-surface-muted` track, radius 8; active segment white with `text-primary`).

### 5.7. Badge / Status Indicator
- Status: filled pill, one 6px dot, §2.5 pairs. Mode: outlined tag, §2.6. Never a bare colored dot where status is information.

### 5.8. Modal
- Max-width 560px (forms) or 720px (richer content), centered, `radius-xl`, `elevation-2`, white; scrim `rgba(32,33,36,0.40)` covering the full viewport.
- Header: `text-h3` title + close icon. Reserve modals for focused single-purpose interactions.

### 5.9. Toast
- Top-right, `radius-md`, `elevation-toast`, white, 20px semantic icon, auto-dismiss ~5s with manual close.

### 5.10. Confirmation Dialog
- Required before any destructive action. Modal (§5.8) with a question title, one sentence of consequence in `text-secondary`, "Hủy" secondary + destructive confirm.

### 5.11. Empty / Loading / Error States
- **Empty**: 40px icon tile + one-sentence message + primary action if applicable.
- **Loading**: skeleton blocks in `bg-surface-muted` matching the layout shape.
- **Error**: error icon tile + plain-language message + retry action.

---

## 6. Product-Specific Components

These are unique to EduBranch AI's domain and must be specified precisely so generators do not improvise product behavior.

### 6.1. Case Card
Used in `/lecturer/courses/:courseId/cases` list and course dashboards.
- Shows: title (`text-h3`), learning-mode tag (§2.6), status badge (§2.5), short description (`text-body`, `text-secondary`, 1–2 lines truncated), updated timestamp (`text-caption`).
- AI-origin marker (§2.7) shown only while status is `status-draft` — removed once status advances past `DRAFT`.
- Clickable → routes to `/lecturer/cases/:caseId/review`.

### 6.2. Learning-Mode Indicator
Standalone version of the §2.6 tag, used in filters and page headers.

### 6.3. Publish/Review Status Stepper
Horizontal 4-step stepper reflecting `DRAFT → REVIEWED → APPROVED → PUBLISHED`. Completed steps: navy filled circle with check + navy connector. Current step: navy outline, bold label. Future steps: `text-secondary`, `border-default` connector.

### 6.4. Decision Node (ReactFlow)
Rectangular card node, `radius-md`, 1px `border-default`, white, on a `#F3F6FC` dotted canvas. Root node: "Bắt đầu" chip. Terminal nodes: `border-strong` + `Flag` icon, label "Kết cục". Non-terminal nodes show a truncated situation preview (2 lines) and an option-count chip. Selected: `border-focus` ring. Never color-code nodes by "correctness" — there is no correct path (Proposal V1.2 guardrail).

### 6.5. Option Selector (Student, Branching Case Player — Experience Phase)
List of 2–4 option cards, white, 1px `border-default`, `radius-sm`, full-width. When a student selects an option: the selected option gets `border-focus`, then the player advances **immediately and seamlessly** to the next situation. No reasoning form appears between decision points during the Experience phase.

### 6.6. REVIEW Phase — Decision Reasoning Input
Large textarea (§5.2 long-form) shown in the **REVIEW phase** — NOT mid-flow. Each decision point in the REVIEW interface shows: the situation, the option chosen, the alternatives available, and the consequence (revealed here for the first time). Adjacent optional reasoning textarea. Label: "Lập luận của bạn". Helper caption: reflective, plain instruction; no rubric or grading language.

### 6.7. Consequence Display (REVIEW Phase Only)
Revealed in the **REVIEW phase** alongside the reasoning input — **never shown mid-flow**. Inset block (`bg-surface-muted`, radius 8) with a 2px navy left border. Label: "Hậu quả" (never "Kết quả" — outcome is reserved for the terminal node's final state).

### 6.8. Reflection Input
Same visual pattern as Reasoning Input (§6.6), used post-outcome (Branching Study) or post-lecturer-feedback (Review Study). Label: "Suy ngẫm của bạn".

### 6.9. Review-Study Submission Card
Shows: case context excerpt, problem text, student's proposed solution, student's reasoning, submission status badge (`SUBMITTED`/`REVIEWED`/`REFLECTED` — neutral → navy → green progression as its own local badge set).

### 6.10. Lecturer Feedback Block
White card with `UserCheck` icon and "Phản hồi của giảng viên" header; feedback text in the inset block. Never AI-marked — always human-authored.

### 6.11. Challenge Support Panel
Max 2 rounds, each a fixed pair (AI counter-question card → optional student response), round indicator ("Vòng 1/2"). No open-ended input after round 2. AI messages carry the `ai-support` tag; never colorful chat bubbles.

### 6.12. Statistics Widgets
Metric cards (label, `text-metric` value, default icon tile, optional caption) + charts per §2.9 (max 3 series, navy focal series). No rainbow palettes; no success/error colors on branches.

---

## 7. Accessibility Baseline

- All text/background pairs in §2 meet WCAG AA at their intended size; `text-muted` and `action-accent` are never used for readable text.
- Every interactive element has a visible `focus-visible` state (§5.4).
- Icon-only controls require an `aria-label`.
- Form fields require a visible, programmatically associated `<label>`.
- Status/mode information is never conveyed by color alone — always paired with a text label.

---

## 8. Explicit Exclusions (do not generate)

- Dark mode / dark theme variants of any screen.
- Indigo/violet/purple as an accent, border, button, badge, or "AI signature" color anywhere; rainbow palettes or rainbow icon tiles.
- Gradients other than the brand panel gradient (§2.9); blurred gradient blobs; gradient text.
- Unicode emojis, sparkle/star glyphs (`✦` / `✨`), or ASCII symbol hacks anywhere in the UI.
- Preachy multi-sentence instructional callout boxes explaining how the app works.
- Pill-shaped buttons (pills are for status badges, AI tag, avatars, count chips only).
- Bordered cards nested inside cards; text-only screens that drop the template's covers, charts and avatars.
- Template leftovers: foreign sample names, `$` prices, English labels, social-link placeholders, raw JSON.
- Grading marks, score numbers, pass/fail labels, or ranking UI anywhere in the student experience (Proposal V1.2 guardrail).
- A "debate" framing (chat-bubble avatars, "vs." framing, adversarial styling) for Challenge Support.
- ReactFlow graphs on student screens (ReactFlow is exclusively for the Lecturer Case Review editor when `learning_mode = 'BRANCHING_STUDY'`).
