# P0 — Global Foundation (Figma Master Template Baseline)

> **Priority**: NOW. Nothing else can be built consistently without this.
> **Visual system**: `docs/design/GLOBAL-DESIGN-SYSTEM.md` (all tokens/components referenced below live there).
> **Covers**: Landing / Introduction Page (`/`), App shell & role-aware navigation (`LecturerLayout`, `StudentLayout`, `PublicLayout`), `/login`, `/register`, 403/404 & session states, case status/mode badges, core component library.
> **Important Note**: Because Sprint feature tasks focus on core academic workflows, `P0 — Global Foundation` in the Figma Master File serves as the **authoritative visual template** for all public, onboarding, navigation shell, and system state screens when rebuilding the Frontend UI.

---

## 0. Product Landing & Academic Introduction Page (`/`)

### Purpose & Function
Provides a clear, authoritative academic landing page for unauthenticated visitors, faculty, and students visiting the root URL (`/`). Explains what EduBranch-AI is without marketing fluff or "AI-hype" clichés, and directs users to `/login` or `/register`.

### Layout (`1440px` desktop, ONE scrolling page on a uniform `bg/canvas` background)
> Updated 2026-11-12 (PO decision). Figma: page `08 · EduBranch – Bản hoàn chỉnh`, frame **00.2 · Chung · Trang giới thiệu**. The former separate frames 00.6 "Cách hoạt động" and 00.7 "Câu hỏi thường gặp" were merged into this page as anchor sections and deleted; there are no `/how-it-works` or `/faq` routes. UI copy is Vietnamese; colours are EduBranch navy `#2A4E7F` / sky `#00A5F5`. Headings use `EduBranch/Public *` (Be Vietnam Pro), body Roboto.

1. **Public nav (`EB/Public Nav`, sticky, white)**: logo + "EduBranch AI"; links "Cách hoạt động" · "Hai chế độ học" · "Câu hỏi thường gặp" smooth-scroll to `#cach-hoat-dong`, `#hai-che-do`, `#cau-hoi` (`scroll-margin-top` = nav height; scroll-spy bolds the link of the section in view). From `/login` / `/register` these links go to `/#anchor`. Right: "Đăng nhập" (`/login`) + primary "Đăng ký" (`/register`).
2. **Hero**: headline "Mỗi quyết định mở ra một nhánh mới", lead, CTAs "Đăng ký tài khoản" + "Xem cách hoạt động" (scrolls to `#cach-hoat-dong`); right side is a real branching-decision diagram (situation → options A/B/C → consequence).
3. **Cách hoạt động `#cach-hoat-dong`**: 5 auto-playing step cards — Tải tài liệu → AI soạn bản nháp → Duyệt & xuất bản → Sinh viên làm bài → Phản hồi & suy ngẫm — each with icon tile, number badge (✓ navy when done), role chip and a mini UI demo; connectors (solid when done, dashed ahead); progress pills + status line underneath. Motion: 2,500 ms per step, 1,500 ms pause then loop; active card raised with sky border; future cards 55% opacity; click a card/pill to jump; `prefers-reduced-motion` disables auto-play (pattern: `HowItWorksSection` with framer-motion).
4. **Hai chế độ học `#hai-che-do`**: two cards, Branching Study and Review Study, each with a small visual preview and 3 bullet points.
5. **Vòng đời bản nháp (navy band)**: statement "AI chỉ soạn bản nháp. Giảng viên quyết định điều gì đến tay sinh viên." + horizontal track Bản nháp → Đã rà soát → Đã phê duyệt → (lock "Mở cho lớp") → Đã xuất bản, highlighting that students see a case only once published.
6. **Theo vai trò**: "Cho giảng viên" / "Cho sinh viên" cards with 4 points and a register button each.
7. **Câu hỏi thường gặp `#cau-hoi`**: centered heading, search field, popular-topic chips, 2×2 accordion groups (Chung, Giảng viên, Sinh viên, AI và tài liệu — 10 questions), contact card (support email).
8. **Kêu gọi** CTA card + **`EB/Public Footer`** (product/account/legal links; product links use the same anchors).

### Boundary
Zero dark-mode hero sections, zero glowing purple/indigo gradients, zero 3D robot illustrations, zero fake customer testimonials or pricing tables (this is an academic university platform, not a commercial SaaS sales page).

---

## 1. App Shell & Role-Aware Navigation

### Purpose & Function
Provides the persistent frame (sidebar/nav + content area) that every authenticated screen renders inside. Three role shells exist — `LecturerLayout`, `StudentLayout` and `AdminLayout` — built on the same shared sidebar, header actions and footer components (Figma page 08), plus `PublicLayout` for `/`, `/login` and `/register`.

### User & Context
- **Lecturer** sees `LecturerLayout`: Khóa học, Case Study, Phản hồi sinh viên, Thống kê học tập; dashboard [07.1] and AI Studio [07.5–07.7] are reachable from it.
- **Student** sees `StudentLayout`: Bàn học, Khóa học của tôi, Tham gia lớp học (OPD-001 → A, 2026-11-12). Case routes still carry the case id; a direct case link from the lecturer also works.
- **Admin** sees `AdminLayout` with the 8 admin sections (OPD-015 → B).
- The sidebar can collapse to a 72px icon rail (`Collapsed=True`); header actions include search (Ctrl K), VI/EN switch, light/dark toggle (dark theme not designed yet), notifications, settings and account.
- **When used**: On every authenticated screen; this is the persistent frame, not a standalone route.

### Information Hierarchy & Layout
- Sidebar (desktop, 240px fixed) or collapsible drawer (mobile): product wordmark (text only — "EduBranch AI", no logo mark specified), role indicator (small text badge under the wordmark: "Lecturer" / "Student"), primary nav items, user menu (name, sign-out) pinned to the bottom.
- Header bar within content area: page title (`text-display`), optional breadcrumb trail for nested routes (Course → Materials, Course → Cases → Review).
- Content area: `bg-canvas`, centered max-width container on wide screens (avoid full-bleed tables/cards stretching beyond a readable measure on ultra-wide monitors).

### Lecturer Nav Items
- Courses (`/lecturer/courses`) — top-level entry point.
- Statistics (`/lecturer/statistics`) — top-level.
- Contextual, shown only once a course is selected: Materials, Cases (which itself leads to Review and Feedback per case).

### Student Nav Items
Students arrive at a specific case route directly (no course browsing screen in the sitemap). The student shell nav is minimal: current case title/breadcrumb + sign-out. No dashboard/list screen exists in the approved sitemap — do not invent one.

### Actions
- Sign out (clears auth store, routes to `/login`).
- Role-based route guarding (`PrivateRoute` component) — a Student hitting a `/lecturer/*` URL (or vice versa) must be redirected, never shown a broken/empty shell.

### States
- **Loading**: skeleton nav (gray blocks) while auth/profile resolves on first load.
- **Error**: if the session is invalid/expired, redirect to `/login` with a toast: "Your session has expired — please sign in again."

### Responsive Behavior
- Sidebar collapses to a hamburger-triggered drawer under ~768px width.
- Header page title remains visible at all widths; breadcrumbs truncate to the immediate parent only on narrow screens.

### Accessibility
- Nav is a `<nav>` landmark with `aria-label="Main navigation"`.
- Active nav item indicated by both `action-primary` color/underline AND `aria-current="page"` — never color alone.

---

## 2. Login (`/login`)

### Purpose & Function
Authenticates an existing university Lecturer or Student account via email/password (`FEATURE-AUTH-AND-ROLES.md` FR-AUTH-02).

### User & Context
Public/unauthenticated. Entry point for both roles — the same form, role is determined server-side from the account, not selected by the user at login (registration is where role is chosen — see §3).

### Layout
Centered card (max-width ~400px) on `bg-canvas`, vertically centered on the viewport. Wordmark above the card. No sidebar (uses `PublicLayout`).

### Data / Fields
- `email` (required)
- `password` (required)

### Actions
- Submit → `POST /api/v1/auth/login`.
- Link to `/register` ("Don't have an account? Register").

### States
- **Default**: empty form, submit disabled until both fields have content.
- **Loading**: submit button shows a spinner, fields disabled.
- **Error**: generic "Invalid email or password" inline banner (`semantic-error`) — matches `FEATURE-AUTH-AND-ROLES.md` §12 (never reveal which field was wrong, to prevent user enumeration).
- **Success**: redirect to `/lecturer/courses` or the student's case route based on returned `role`.

### Boundary
Social login is limited to "Tiếp tục với Google" and "Tiếp tục với Microsoft" below the primary button on `/login` and `/register` (PO decision 2026-11-12, component `EB/Social Sign-in`); no other providers (Facebook/GitHub), not on the admin login. No campus SSO / MFA UI.

---

## 3. Register (`/register`)

### Purpose & Function
Account creation for a new Lecturer or Student (`FEATURE-AUTH-AND-ROLES.md` FR-AUTH-01).

### Layout
Same card pattern as Login.

### Data / Fields
- `email` (required, must be unique)
- `password` (required)
- `fullName` (required)
- `role` — explicit selector, two options only: **Lecturer** / **Student** (segmented control or radio group, not a dropdown — only two mutually exclusive values, per `FEATURE-AUTH-AND-ROLES.md` BR-AUTH-01: one role per account, ever).

### Actions
- Submit → `POST /api/v1/auth/register`.
- Link back to `/login`.

### States
- **Error — duplicate email**: inline banner, "An account with this email already exists."
- **Error — validation**: per-field error text below the offending input (§5.2 of Global Design System).
- **Success**: auto-login and redirect (or redirect to `/login` with a success toast — implementation detail, either is acceptable).

---

## 4. Case Status & Learning-Mode Badges

Not a screen — a shared visual primitive used everywhere a case is listed or referenced (case cards, Case Review header, statistics). Fully specified in `GLOBAL-DESIGN-SYSTEM.md §2.5–2.6, §6.1–6.3`. This entry exists in P0 only to confirm it is a **foundation-priority** deliverable: no other screen (P1–P4) can be built correctly without these badges existing first, since every list/detail screen in the product references case status and/or learning mode.

---

## 5. Core Component Library

The following shared components (fully specified in `GLOBAL-DESIGN-SYSTEM.md §5`) are P0 deliverables, required before any P1+ screen work begins: Button (primary/secondary/destructive), Input, Select, Textarea, Card, Table, Tabs, Badge, Modal, Toast, Empty/Loading/Error states, Confirmation dialog. Build/spec these once, generically, and reuse — do not re-derive per screen.
