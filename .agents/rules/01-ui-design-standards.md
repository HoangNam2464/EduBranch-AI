---
description: >-
  Authoritative UI/UX Design System, Color Tokens, Icon System, Layout
  Architecture, and Anti-AI-Clutter Rules for EduBranch-AI. Always loaded when
  designing or implementing frontend components and screens.
trigger: always_on
---

# EduBranch-AI — UI/UX Design Standards & Anti-Clutter Rulebook

> **Canonical Reference**: Synchronized with [`docs/design/GLOBAL-DESIGN-SYSTEM.md`](../../docs/design/GLOBAL-DESIGN-SYSTEM.md) and [`docs/05_FIGMA.md`](../../docs/05_FIGMA.md).
> **Visual language v2 (2026-11-12, PO decision in chat)** (typography and imagery aligned to the Eduva template later on 2026-11-12; canonical Figma reference: page `08 · EduBranch – Bản hoàn chỉnh`): The style rules in §1 (rules 3 and 5), §2, §3 (colors), §4, §5, §6 (colors/shapes) and §7 (language) were rewritten to adopt the layered navy/sky visual language of the licensed Eduva template (Figma page `03 · Eduva – Screens`, 14 original desktop screens) and the EduBranch design system derived from it. The previous flat gray/`#2563EB` rules are retired. **All product, pedagogy, accessibility and security rules are unchanged.**
> **Scope**: All Frontend (`frontend/src/`) components, layouts, pages, ReactFlow graphs, and Figma/Stitch design specifications (`DES-001` → `DES-015`, `FE-001` → `FE-022`).
> **Figma-First Master Template Mandate (Khuôn mẫu chuẩn từ Link Figma)**:
> - Các task trong Sprint Backlog (`01_MASTER-TASKS.md` / `02_SPRINT-TASKS.md`) chỉ tập trung đặc tả các **tính năng nghiệp vụ chính**, còn các trang nền tảng/bao quanh như **Trang Giới thiệu (`/` — Landing Page)**, **Đăng nhập (`/login`)**, **Đăng ký (`/register`)**, **Khung điều hướng (`LecturerLayout`, `StudentLayout`, `PublicLayout`)**, **Quản lý Học phần (`/lecturer/courses` & Modals)**, **Thống kê (`/lecturer/statistics`)** và **Trang lỗi (`403` / `404`)** không có mã task riêng lẻ.
> - Do đó, **Link Figma chuẩn của dự án (đặc tả toàn diện tại `docs/05_FIGMA.md`) là khuôn mẫu gốc duy nhất (Single Source of Truth)** cho toàn bộ các trang này. Giao diện Frontend có sẵn hiện tại trong `frontend/src/` chỉ là khung tạm thời và sẽ được đập đi xây dựng lại 100% theo đúng bản thiết kế thống nhất trên Figma.

---

## 1. Core Aesthetic Mandate & 7 Strict Anti-"AI-Slop" Rules

EduBranch-AI is a **university-level academic authoring and case-learning platform**. It must feel **calm, structured, data-rich and content-first**: a layered workspace (white shell, soft blue-gray canvas, white cards) with one navy brand color and one sky accent, where every color carries meaning.

To eliminate the amateurish "AI-generated template" look, every screen and component MUST obey these **7 Non-Negotiable Prohibitions**:

1. **ZERO Unicode Emojis in UI (STRICT BAN)**:
   - **Forbidden**: `🌿`, `📭`, `👉`, `👨‍🏫`, `🏁`, `📊`, `💡`, `📍`, `⚡`, `✍️`, `🤖`, `🔒`, `👤`, `📚`, `📋`, `✅`, `🎯`, `📝`, `❓`, `✦`, `✨`, or any other emoji character anywhere in JSX/TSX or design frames.
   - **Required**: Use standardized monoline outline SVG icons only (see §3).
2. **ZERO Raw ASCII Symbols as Icons (STRICT BAN)**:
   - **Forbidden**: Using text characters like `->`, `&rarr;`, `←`, `↑`, `✕`, `&times;`, `✓`, or `•` as standalone UI buttons or icons.
   - **Required**: Use vector SVG icons (`ChevronRight`, `ArrowLeft`, `Upload`, `X`, `Check`, etc.) with proper `aria-label` or `aria-hidden="true"`.
3. **ZERO Purple / Indigo / Rainbow "AI Colors" (STRICT BAN)**:
   - **Forbidden**: Indigo/violet/purple (`#6366F1`, `purple-*`, `indigo-*`, `violet-*`), rainbow palettes, neon borders, glowing shadows, blurred gradient blobs, gradient-filled text, and decorative gradients on cards or buttons.
   - **Required**: Light theme only. Brand = navy `#2A4E7F` (actions, active states, primary data series) + sky `#00A5F5` (secondary data series, highlights — never text). Every other color is a locked semantic token (§2). The **only** gradient allowed is the brand panel gradient (§2.9) on the public/auth hero panel.
4. **ZERO Preachy "Instructional Callout Spam" (STRICT BAN)**:
   - **Forbidden**: Placing 2–4 colored alert boxes on a page to lecture the user on product rules (e.g., *"💡 Mục tiêu của giai đoạn REVIEW:..."*, *"🔒 Nguyên tắc sư phạm: AI hoàn toàn không chấm điểm..."*, *"* Chọn một phương án để tiến thẳng..."*).
   - **Required**: Maximum **1** contextual alert banner per screen (used only for active errors, warnings, or status transitions). Routine helper guidance belongs in a single concise `12px` `text-secondary` (`#696A70`) caption line.
5. **ZERO Uncontrolled Nesting (STRICT BAN)**:
   - **Forbidden**: A bordered card inside another bordered card; more than 3 surface levels; a colored tinted box inside a colored tinted box.
   - **Required**: Fixed surface ladder (§4.3): **page shell** (`bg-page` white) → **canvas panel** (`bg-canvas` `#F3F6FC`, radius 18) → **card** (`bg-surface` white, radius 12, **no border, no shadow**) → at most **one inset block** (`bg-surface-muted` `#EEF2F9`, radius 8, no border). Inside a card, separate sections with whitespace (16–24px) or a 1px `border-default` divider.
6. **ZERO Language Mixing on the Same Screen (STRICT BAN)**:
   - **Forbidden**: Mixing English headings/buttons (`Create an account`, `My Courses`, `Node 1 Editor`) with Vietnamese labels on the same screen; leftover template copy (`Add Student`, `Total`, `$`, sample names) in any frame.
   - **Required**: 100% Vietnamese UI chrome with consistent academic terminology (see §7). Fixed product terms `Branching Study`, `Review Study`, `Case Study`, `AI Draft`, `AI-assisted` stay as proper names.
7. **ZERO Chatbot / Gamification Gimmicks (STRICT BAN)**:
   - **Forbidden**: Chat bubble tails, robot/human avatars for AI, typing-dot animations, progress rings used as achievement meters, confetti, score badges, or "vs." debate framing. (Data donut/gauge charts on the lecturer Statistics screen are data visualisation, not gamification, and are allowed.)
   - **Required**: AI is a background function marked only by a neutral gray tag (`AI Draft` or `AI-assisted`) when required.

---

## 2. Color System & Design Tokens (Locked Hex Values)

> **Theme Mode**: **LIGHT MODE ONLY**. Dark mode (`dark:*`) is strictly forbidden.
> **Rule**: Never invent arbitrary hex values. Use ONLY the tokens below (Figma: collections `EduBranch · Primitives` / `EduBranch · Color`). Every text/background pair below meets WCAG AA at its intended size.

### 2.1. Surfaces & Backgrounds

| Token Name | Hex | Usage |
|---|:---:|---|
| `bg-page` | `#FFFFFF` | Outer app shell behind the canvas panel; sidebar; top bar |
| `bg-canvas` | `#F3F6FC` | Rounded content canvas panel (radius 18) that holds all cards; auth form side |
| `bg-surface` | `#FFFFFF` | Cards, panels, modals, table body rows |
| `bg-surface-muted` | `#EEF2F9` | The single allowed inset block inside a card, table header row, excerpt/code blocks, disabled inputs |
| `bg-surface-hover` | `#E8EDF6` | Hover background for interactive rows, list items and nav items |
| `bg-selected` | `#DFEDF9` | Selected row/list item, active nav item, selected filter segment |

### 2.2. Typography Colors

| Token Name | Hex | Usage |
|---|:---:|---|
| `text-primary` | `#202124` | Page titles, headings, primary body text, active form values |
| `text-secondary` | `#696A70` | Supporting descriptions, table cell text, form helper text, inactive nav items |
| `text-muted` | `#909198` | **Placeholders, disabled text and decorative icons only** — never for information the user must read (fails AA for body text) |
| `text-inverse` | `#FFFFFF` | Text on filled navy or destructive surfaces |
| `text-link` | `#2A4E7F` | Inline text links (`hover:underline`) |

### 2.3. Borders & Dividers

| Token Name | Hex | Usage |
|---|:---:|---|
| `border-default` | `#E1E8F5` | Input borders, table row dividers, in-card section dividers. **Not used around cards.** |
| `border-strong` | `#D1D9E8` | Hover border on inputs, outlined mode tags, secondary buttons |
| `border-focus` | `#2A4E7F` | 2px focus ring (plus 3px `#00A5F5` at 30% halo) and selected option border |

### 2.4. Brand Actions (`action-*`)

| Token Name | Hex | Usage |
|---|:---:|---|
| `action-primary` | `#2A4E7F` | Primary CTA (max 1 per view/section), active nav item, active tab indicator, links |
| `action-primary-hover` | `#223F68` | Hover |
| `action-primary-active` | `#1B3253` | Pressed |
| `action-primary-disabled` | `#94A7C0` | Disabled primary fill |
| `action-primary-subtle` | `#DFEDF9` | Active nav background, secondary-tinted button, info banner fill |
| `action-accent` | `#00A5F5` | Data highlight only: chart series 2, selected calendar day, progress fill. **Never** text, never a filled button with white text (contrast 2.7:1) |
| `action-danger` | `#D11F1F` | Destructive button fill (white text 5.3:1) |

### 2.5. Case Lifecycle Status Tokens (`DRAFT → REVIEWED → APPROVED → PUBLISHED`)

Status badges are **filled pills with a 6px dot** and MUST always pair the background, text and dot below. One status = one color everywhere (never color the same status differently on different cards).

| Status | Badge BG | Badge Text | Dot | Meaning |
|---|:---:|:---:|:---:|---|
| `DRAFT` (Bản nháp) | `#EEF2F9` | `#696A70` | `#909198` | Newly generated by AI or created; not yet edited by Lecturer |
| `REVIEWED` (Đã rà soát) | `#DFEDF9` | `#2A4E7F` | `#00A5F5` | Edited/inspected by Lecturer; awaiting formal sign-off |
| `APPROVED` (Đã phê duyệt) | `#FFF1DE` | `#9A5700` | `#F58A00` | Approved by Lecturer; ready for publication (hidden from students) |
| `PUBLISHED` (Đã xuất bản) | `#E1F7E9` | `#007A2D` | `#00B343` | Live and accessible to Students via direct link |

### 2.6. Learning Mode Tokens (`BRANCHING_STUDY` vs `REVIEW_STUDY`)

Learning modes use a **different shape** from status so both can sit on one card without collision: an **outlined rectangular tag** (radius 6, white fill, 1px border, 14px icon), never a filled pill.

| Learning Mode | Border | Text + Icon | Icon | Meaning |
|---|:---:|:---:|---|---|
| `BRANCHING_STUDY` | `#D1D9E8` | `#2A4E7F` | `GitFork` | Interactive multi-branch decision tree scenario |
| `REVIEW_STUDY` | `#B3E4FC` | `#00699E` | `FileCheck2` | Open case analysis & solution proposal without tree |

### 2.7. AI-Origin Marker (`ai-support`)

| Token Name | Hex | Usage |
|---|:---:|---|
| `ai-support-bg` | `#EEF2F9` | Neutral tag background (never colored, never glowing) |
| `ai-support-text` | `#696A70` | Tag label text (`AI Draft` or `AI-assisted`) + 14px outline icon (`Cpu` / `FileCode`) |

### 2.8. Semantic Feedback Colors

| Token Name | Icon / Fill | Text on tint | Background Tint | Border Tint | Usage |
|---|:---:|:---:|:---:|:---:|---|
| `semantic-success` | `#00B343` | `#007A2D` | `#E1F7E9` | `#B3E8C7` | Completed ingestion, toast confirmation |
| `semantic-warning` | `#F58A00` | `#9A5700` | `#FFF1DE` | `#FFD9A8` | Processing/pending, unpublish warning |
| `semantic-error` | `#FF3535` | `#D11F1F` | `#FFE5E5` | `#FFBCBC` | Validation error, failed ingestion |
| `semantic-info` | `#2A4E7F` | `#2A4E7F` | `#DFEDF9` | `#D1D9E8` | Neutral system notice |

### 2.9. Data Visualisation & Brand Gradient

- **Chart series** (max 3 per chart): series-1 `#2A4E7F` (the focal series), series-2 `#00A5F5`, series-3 `#D1D6E0` (baseline / "others"). Heatmap ramp: `#EEF2F9` → `#B3E4FC` → `#00A5F5` → `#2A4E7F`. Every chart has a legend or direct labels and real axis units.
- Charts never color branches or outcomes as good/bad (no green-vs-red decision paths).
- **Brand panel gradient** (only allowed gradient): linear 135°, `#2A4E7F` → `#00A5F5`, used solely for the left panel of `/login`, `/register` and the public landing hero.

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
- **Color Inheritance**: Icons must always use `stroke="currentColor"` and inherit the parent text token (`text-secondary` `#696A70` at rest; `text-primary` `#202124` or `action-primary` `#2A4E7F` on active/hover). Never render multi-color, filled-cartoon, or 3D icons.
- **Icon tiles**: A 32px or 40px square tile (radius 8) behind an icon is allowed for metric cards, list leading items, empty/error states and the upload dropzone. Default tile = `#DFEDF9` with a `#2A4E7F` icon. A semantic tint (success/warning/error) is allowed **only** when the tile itself communicates that state. Rainbow tiles (different tints on sibling cards for decoration) are forbidden.
- **Accessibility**:
  - Decorative icons next to text labels MUST have `aria-hidden="true"`.
  - Icon-only buttons (e.g., Modal Close, Delete row action) MUST have an explicit `aria-label="..."` and a minimum hit target of `32px × 32px`.

### 3.2. Icon Size Scale

| Size Token | Dimensions | Usage Context |
|---|:---:|---|
| `icon-xs` | `14px` | Inside badges, mode tags, AI tags, metadata rows |
| `icon-sm` | `16px` | Inside buttons, table row actions, breadcrumbs |
| `icon-md` | `20px` | Sidebar nav items, modal close button, alert/toast leading icon, icon tiles (32px) |
| `icon-lg` | `24px` | Icon tiles (40px) for EmptyState, ErrorState and upload dropzone |

### 3.3. Canonical Domain Icon Mapping

Every feature must use these consistent vector icon metaphors (never emojis):

| UI Element / Concept | Required Vector Icon Metaphor (Lucide / SVG Equivalent) | Forbidden Replacement |
|---|---|---|
| Brand Header Wordmark | `EduBranch AI` wordmark with the official logo mark (Figma component `EB/Logo Mark`, source page 03 "Icon K3"; 32px in app shells, 36px on auth panels; never recolour or redraw) | 🚫 `🌿` leaf emoji |
| Sidebar: Courses | `BookOpen` (`20px`) | 🚫 `📚` |
| Sidebar: Teaching Materials | `FileText` or `Files` | 🚫 `📋` / `📄` |
| Sidebar: Case Studies | `GitBranch` | 🚫 `🎯` |
| Sidebar: Statistics | `BarChart2` | 🚫 `📊` |
| Sidebar: Sign Out / Logout | `LogOut` | 🚫 Door emoji |
| Upload Dropzone | `UploadCloud` (`24px` inside `40px` icon tile) | 🚫 `↑` text character |
| Empty State | `Inbox` or `FolderOpen` (`24px` inside `40px` icon tile) | 🚫 `📭` mailbox emoji |
| Error / Validation Alert | `AlertCircle` (`20px` in `#FF3535`) | 🚫 `❌` / `⚠️` |
| Warning Banner | `AlertTriangle` (`20px` in `#F58A00`) | 🚫 `⚡` |
| Completed / Success | `CheckCircle2` or `Check` (`16px` in `#00B343`) | 🚫 `✅` / `✓` text |
| AI-Origin Tag (`AiOriginTag`) | `FileCode` or `Cpu` (`14px` `#696A70`) | 🚫 `✦` / `✨` / `🤖` |
| AI Challenge Support Card | `HelpCircle` or `MessageSquare` (`16px` `#696A70`) | 🚫 `🤖` robot face |
| Lecturer Feedback Block | `UserCheck` or `MessageSquareText` (`16px` `#696A70`) | 🚫 `👨‍🏫` teacher emoji |
| Terminal Outcome Node | `Flag` (`14px` `#696A70`) | 🚫 `🏁` checkered flag emoji |
| Navigation / Breadcrumb | `ChevronRight` (`14px`), `ArrowLeft` (`16px`), `ArrowRight` (`16px`) | 🚫 `->`, `&rarr;`, `←` |
| Modal Close | `X` (`20px` stroke) | 🚫 `✕` / `&times;` |

---

## 4. Typography, Spacing, Radius & Elevation

### 4.1. Font Stack & Type Hierarchy
```css
font-family: "Roboto", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
```
Headings use **Regular (400)** exactly as in the Eduva template; hierarchy comes from size and the surface layout. Figma text styles: `Eduva/*` (page `02 · Eduva – Design System`).
Public pages only (Home, How it works, FAQ): headings use **Be Vietnam Pro SemiBold** via `EduBranch/Public *` text styles; body text stays Roboto. Never use Be Vietnam Pro on app screens.

| Token | Size / Line-Height | Weight | Usage |
|---|:---:|:---:|---|
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

- **Minimum size**: nothing the user must read is smaller than `12px`.
- **Reading Measure Rule**: Long-form academic reading (case `situation`, `context_text`, `problem_text`, `consequence`, `lecturer_feedback`) MUST be constrained to `65–75ch` with `text-prose`.
- **Imagery**: course/case covers, avatars, product mockups and illustrations from the Eduva template are part of the visual language. Never replace them with text-only blocks. A status pill may sit on the top-left of a cover, as in the template.
- **No All-Caps Sentences**: `text-overline` ONLY for short 1–3 word category labels — never for full sentences or instructions.

### 4.2. Spacing Scale (Strict 4px Grid)
- Allowed spacing values: `4`, `8`, `12`, `16`, `20`, `24`, `32`, `48`, `64` px.
- **Canvas panel padding**: `24px`. **Gap between cards**: `16px` (dense dashboards) or `20px`.
- **Card internal padding**: `20px` (dense) or `24px` (forms, reading).
- **Vertical gap between form fields**: `16px`. **Label → input**: `6px`.

### 4.3. Surface Ladder, Border Radius & Elevation
- **Surface ladder (max 3 levels below the shell)**: `bg-page` → `bg-canvas` panel → `bg-surface` card → one `bg-surface-muted` inset block. See §1 rule 5.
- **Border Radius**:
  - `radius-sm` (`6px`): Inputs, selects, textareas, buttons, icon buttons, mode tags, course-code tags.
  - `radius-md` (`8px`): Inset blocks, icon tiles, thumbnails, table containers, segmented filters, toasts.
  - `radius-lg` (`12px`): Cards.
  - `radius-xl` (`18px`): Canvas panel, modals, auth brand panel.
  - `radius-full` (`9999px`): **Only** status badges, AI tag, avatars and count chips. Buttons and mode tags are never pill-shaped.
- **Elevation (Flat-First)**:
  - Cards at rest: **no border, no shadow** — the `#F3F6FC` canvas does the separation work.
  - Clickable cards on hover: background stays white, `0 2px 8px rgba(32,33,36,0.06)`.
  - Popovers/dropdowns: `0 4px 16px rgba(32,33,36,0.08)`.
  - Modals/dialogs: `0 12px 32px rgba(32,33,36,0.16)` over a `rgba(32,33,36,0.40)` scrim that covers the **full** viewport (no blur).

---

## 5. App Shell & Layout Architecture by User Role

### 5.1. Lecturer Portal Shell (`LecturerLayout.tsx`)
- **Structure**: `bg-page` white shell, `1440px` design width:
  - **Left Sidebar (`240px`, `bg-page`, no border)**: brand wordmark + role caption (`Không gian giảng viên`), primary navigation (`Khóa học`, `Case Study`, `Phản hồi sinh viên`, `Thống kê học tập`), user footer (name, email, `Đăng xuất`).
    - Active nav item: `bg-selected` `#DFEDF9` fill, `#2A4E7F` text + icon, radius 8, `aria-current="page"`. Inactive: `text-secondary`, hover `bg-surface-hover`.
  - **Canvas Panel (`flex-1`, `bg-canvas`, radius 18, margin 12px, padding 24px)**: top bar (page title `text-h1`, optional breadcrumb, search, notifications, user chip) followed by the page's cards.
  - Footer line inside the canvas: copyright + policy links in `text-caption` `text-secondary`. No social-link placeholders.
- **Full-viewport workspace** (`CaseReviewPage`): same shell; the canvas holds the lifecycle action bar + split editor.

### 5.2. Student Portal Shell (`StudentLayout.tsx`)
- **Pedagogical Context (unchanged)**: Students access specific published cases via direct links. Any course-browsing navigation (`Bàn học`, `Khóa học của tôi`, `Tham gia lớp học`) depends on **OPD-001** and stays HOLD until the PO closes it.
- **Structure**: same visual shell as §5.1 (sidebar + canvas panel) so both roles share one system. Reading and writing areas inside the canvas are constrained to the `65–75ch` measure (§4.1); case context sits in a left column card, the working area in the main column.

### 5.3. Public Auth Shell (`PublicLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`)
- Full-bleed **50/50 split screen**: left = brand panel (§2.9 gradient, radius 18, wordmark, one-line value proposition, one product preview); right = form column (`max-w-[400px]`, centered) on `bg-page`.
- Product previews in the brand panel must show real EduBranch screens — never template mockups with foreign data.
- Local dev quick-access controls (when `import.meta.env.DEV` is true) use secondary button styling with SVG icons — never purple/emoji buttons.

### 5.4. Public Marketing Pages (`/`, `Cách hoạt động`, `FAQ`)
- Top navigation bar (`72px`, white) + content container `1200px`; headline/FAQ reading column `768px`.
- One idea per section, `96px` vertical section rhythm, section title `text-display` + one lead sentence. No eyebrow pill on every section, no blurred blobs, no gradient text.
- Process sections show the **actual product state** at each step (files, statuses, a case node), not decorative icons.

---

## 6. Standardized Component & Product-Specific Widget Rules

### 6.1. Core Shared Primitives (`src/components/ui/index.tsx`)
1. **`Button`**:
   - Variants:
     - `primary`: `bg-[#2A4E7F] text-white hover:bg-[#223F68] active:bg-[#1B3253] disabled:bg-[#94A7C0]`
     - `secondary`: `bg-white text-[#202124] border border-[#D1D9E8] hover:bg-[#E8EDF6]`
     - `tonal`: `bg-[#DFEDF9] text-[#2A4E7F] hover:bg-[#D1E4F5]` — repeated row actions and secondary emphasis
     - `danger`: `bg-[#D11F1F] text-white hover:bg-[#B01818]`
     - `ghost`: `bg-transparent text-[#696A70] hover:bg-[#E8EDF6] hover:text-[#202124]`
   - Sizes: `sm` (`h-8 px-3 text-xs`), `md` (`h-10 px-4 text-sm`), `lg` (`h-11 px-5 text-sm`). Always `rounded-md` (6px) `font-medium`.
   - **Rule**: Maximum **one** `primary` button visible per view/modal. Repeated row/card actions use `tonal` or `secondary` `sm`.
2. **`Input`, `Select`, `Textarea`**:
   - Associated `<label htmlFor={id}>` (`text-sm font-medium text-[#202124] mb-1.5 block`) is mandatory — never rely on `placeholder` alone.
   - Input/Select height: `h-10` (`40px`), `px-3 text-sm bg-white border border-[#E1E8F5] rounded-md`.
   - Focus state: `focus:outline-none focus:border-[#2A4E7F] focus:ring-[3px] focus:ring-[#00A5F5]/30`.
   - Academic writing `Textarea` (Student Reasoning, Proposed Solution, Reflection, Lecturer Feedback): minimum `rows={4}` (`min-h-[120px]`), `text-prose`, vertical resize enabled.
3. **`CaseStatusBadge` & `LearningModeBadge`**:
   - `CaseStatusBadge`: filled pill (`rounded-full px-2.5 py-0.5 text-xs font-medium inline-flex items-center gap-1.5`) with **one** `6px` dot and a Vietnamese label, exact §2.5 tokens. Never render two dots.
   - `LearningModeBadge`: outlined tag (`rounded-md border px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1` + 14px icon), exact §2.6 tokens.
4. **`AiOriginTag`**:
   - Neutral pill (`bg-[#EEF2F9] text-[#696A70] rounded-full px-2 py-0.5 text-xs font-medium inline-flex items-center gap-1`) with a `14px` outline SVG icon + `AI Draft` or `AI-assisted`. Shown on `DRAFT` cases only; hidden once status advances to `REVIEWED`/`APPROVED`/`PUBLISHED`.
5. **`Skeleton`, `EmptyState`, `ErrorState`**:
   - Loading tables/cards must use `Skeleton` (`animate-pulse bg-[#EEF2F9] rounded-md`) matching the layout shape rather than a bare text string `"Loading..."`.
   - `EmptyState` and `ErrorState` use a `24px` outline SVG inside a `40px` icon tile (`#DFEDF9`, or `#FFE5E5` for error) + concise title + 1-sentence description + optional action button.
6. **`MetricCard`**: label (`text-body` `text-secondary`) top-left, value (`text-metric`) below, optional 32px default icon tile top-right, optional delta/caption line in `text-caption`. All metric cards on one screen use the same tile color.

### 6.2. Product-Specific Domain Widgets
1. **Publish / Review Status Stepper (`CaseReviewPage`)**:
   - Horizontal 4-step indicator (`1. Bản nháp` → `2. Đã rà soát` → `3. Đã phê duyệt` → `4. Đã xuất bản`) in the Case Review action bar. Completed steps: `#2A4E7F` filled circle with `Check`, navy connector; current step: navy outline + bold label; future: `text-secondary`, `#E1E8F5` connector.
   - Shows current lifecycle stage and enables only valid state-machine transitions (`Save Edits`, `Mark as Reviewed`, `Approve Case`, `Publish Case` behind confirmation modal).
2. **ReactFlow Decision Tree Canvas & Nodes (`CaseReviewPage` — Lecturer Only)**:
   - **Canvas Background**: `#F3F6FC` with subtle dot pattern (`#D1D9E8`).
   - **Edges**: Smoothstep directed edges in `#94A7C0` (`strokeWidth: 1.75`), turning `#2A4E7F` when selected. Edge label in `11px` `#696A70` on a white pill. **Never use indigo edges.**
   - **Decision Node Card**: `w-64 bg-white rounded-lg p-3.5 text-left border border-[#E1E8F5]` (nodes are the one place a card keeps a border, because they sit on a dotted canvas).
     - Selected state: `border-[#2A4E7F] ring-[3px] ring-[#00A5F5]/30`.
     - Root node badge: `Bắt đầu` (`bg-[#DFEDF9] text-[#2A4E7F] text-[11px] font-medium px-2 py-0.5 rounded`).
     - Terminal node badge: `Kết cục` (`bg-[#EEF2F9] text-[#696A70] text-[11px] font-medium px-2 py-0.5 rounded` with `12px` `Flag` SVG icon).
     - **Strict Guardrail**: Never color-code nodes green vs. red — there is no "right" or "wrong" branch in EduBranch-AI.
3. **Branching Case Player — Experience Phase (`BranchingCasePlayerPage`)**:
   - Header bar: Case title, `Lượt làm #N` tag, and current step counter (`Điểm quyết định N` — never a percentage bar since path depth is dynamic).
   - Situation Card: white card with readable `text-prose`. Optional `contextData` rendered in the single inset block (`bg-[#EEF2F9] rounded-md px-4 py-3 text-sm text-[#696A70]`).
   - Option Selector: Vertical stack of full-width option buttons (`bg-white border border-[#E1E8F5] rounded-md p-4 text-left hover:border-[#2A4E7F] hover:bg-[#F3F6FC] flex items-start gap-3`). Option index badge (`A`, `B`, `C`) in a `24px` `rounded-md bg-[#EEF2F9] text-[#202124] font-medium text-xs` square.
   - **Immediate Transition**: Clicking an option immediately advances to the next node. **Zero consequence cards, zero reasoning textareas, and zero instructional banners mid-flow.**
4. **Branching REVIEW Phase Timeline (`BranchingReviewPage`)**:
   - Vertical chronological timeline (`border-l-2 border-[#E1E8F5] ml-3 pl-6 space-y-6`).
   - Each step card (white card, radius 12, `p-6`) displays in clear order:
     1. **Step Header**: `Điểm quyết định #N` badge (without exposing internal `nodeId` to students).
     2. **Situation Summary**: Compact text of the dilemma faced.
     3. **Chosen Option vs. Alternatives**: Chosen option in the inset block with a `2px` `#2A4E7F` left border; unselected options listed below in `text-secondary text-xs` (never `line-through`, which implies an error).
     4. **Consequence Reveal**: inset block `bg-[#EEF2F9] border-l-2 border-[#2A4E7F] px-4 py-3 rounded-r-md` with label `Hậu quả` (`text-overline` `#2A4E7F`).
     5. **Retrospective Reasoning Input**: Standard `Textarea` labeled `Lập luận của bạn (không bắt buộc — khuyến khích với quyết định then chốt)` + `secondary` `sm` button `Phản biện lập luận` (with `MessageSquare` icon).
5. **AI Challenge Support Panel (`ChallengeSupportPage`)**:
   - Header with `Vòng 1/2` / `Vòng 2/2` step badge.
   - Neutral stacked cards (not left/right chat bubbles):
     - Student Reasoning: inset block (`bg-[#EEF2F9] rounded-md p-4`).
     - AI Counter-Question: white card with `AiOriginTag` (`AI-assisted · Vòng N`) in the header.
   - Hard-capped at 2 rounds: once `isCompleted = true`, replace the reply form with a calm completion footer and a primary button to return to the Review/Reflection flow.
6. **Lecturer Feedback Block (`LecturerFeedbackPage`, `ReviewFeedbackPage`)**:
   - Structured academic evaluation card (white card; feedback text in the inset block) with `UserCheck` (`16px`) icon and `Phản hồi của giảng viên` header — never yellow/amber warning colors or teacher emojis.
7. **Statistics Widgets (`StatisticsPage`)**:
   - Metric summary cards per §6.1.6.
   - Charts per §2.9: max 3 series (navy, sky, neutral); branch-selection distribution uses navy for the focal branch and sky/neutral for the rest — never a rainbow and never success/error colors on branches.

---

## 7. Language & Microcopy Standards

1. **Single-Language Consistency per Screen**:
   - UI chrome is **Vietnamese** (PO decision 2026-11-02). Do not mix English UI chrome (`Create Course`, `Upload Material`, `Add Student`) with Vietnamese labels on the same page. User-inputted content supports full Vietnamese UTF-8 text.
   - Product proper names stay as-is: `EduBranch AI`, `Branching Study`, `Review Study`, `Case Study`, `AI Draft`, `AI-assisted`, `Journey Review`.
2. **Concise Academic Tone**:
   - Button labels are 1–3 words, sentence case (`Tạo khóa học`, `Sinh case`, `Xuất bản`, `Lưu thay đổi`, `Nộp suy ngẫm`, `Thử hướng khác`).
   - Avoid exclamation marks (`!`), conversational filler, or grading terminology (`Điểm`, `Đạt`, `Trượt`, `Đúng`, `Sai`, `Score`, `Grade`).
   - Never show raw data formats (JSON, enum keys such as `ACTIVE`, internal IDs) to users; translate them into readable Vietnamese.

---

## 8. Canonical Route Map & Pedagogical Flow Boundaries

> Mirrors `frontend/src/app/router.tsx`, `docs/design/SITE-ARCHITECTURE.md`, and the Figma Master Template (`docs/05_FIGMA.md`).

### 8.1. Public & Onboarding Routes (`PublicLayout`)
- `/` — Product Landing & Academic Introduction Page (Hero, Dual Learning Modes `Branching Study` vs `Review Study`, 4-Step Faculty/Student Workflow, Entry CTAs).
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
