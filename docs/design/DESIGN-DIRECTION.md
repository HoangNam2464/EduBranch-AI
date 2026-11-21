# EduBranch-AI — Design Direction "Preserve and Elevate"

> **Status**: PROPOSED (2026-11-21, Claude) — not approved; values here are not Ready for Dev (AGENTS.md rule 9). Approval and any Figma change belong to the PO.
> **Fixed by the PO (2026-11-20, chat)**: light mode; navy `#2A4E7F` for actions; sky `#00A5F5` for data/highlight (never text); 1440px desktop baseline; no mobile/native redesign; preserve business logic, approved flows, API contracts, schema, authorization and working IA. Web font = system font (PO 2026-11-21).
> **Inputs**: UI audit of the running app (`docs/design/audit/UI-AUDIT.md`), research (`docs/design/research/DESIGN-INSPIRATION.md`), GDS, R01, Figma page `EduBranch AI – Screens`.

## 1. Direction in one paragraph
EduBranch-AI should read like a calm university workspace: a quiet white shell, a soft blue canvas, white cards that each do one job, and typography that carries the hierarchy. The identity is already right; what lowers perceived quality today is execution — content squeezed by excess padding, text that wraps or truncates where space exists, data screens that show placeholder content, and empty states repeated card by card. The direction is to fix those systematically through shared components first, then apply proven patterns screen by screen. Nothing changes only to look different.

## 2. Principles
1. **Figma geometry first.** Layout, insets and component sizes follow the approved frames (≤1px at 1440px). Deviations need a reason and PO approval.
2. **Text never breaks where space exists.** Labels, counts and status values are `whitespace-nowrap`; only titles and descriptions wrap or truncate, with a tooltip for truncated identifiers.
3. **One job per card; one primary action per view.**
4. **Real data or an honest state.** Empty, loading, error and 403 states replace any placeholder data; one consolidated empty state when a whole page has no data, instead of six identical empty cards.
5. **Typography carries hierarchy.** Page title 22/28, section title 16/20, body 14/20, meta 12/16; tabular numerals for counts and percentages; muted label above strong value for key/value data.
6. **Colour carries meaning only.** Navy = action/focal data; sky = second series/progress; status and learning-mode tokens as GDS §2.5–§2.6; never colour outcomes as right/wrong.
7. **Pedagogy shapes layout.** Experience phase without side noise; consequences only in Journey Review; AI marked by the neutral `AI Draft`/`AI-assisted` tag only.
8. **Motion explains change.** 150–200ms ease-out for hover/press, 200–250ms for panels and dialogs; respect `prefers-reduced-motion`; no decorative loops.

## 3. Design System evolution (PROPOSED values, all inside the fixed identity)

| Area | Current (develop) | Proposal | Why |
|---|---|---|---|
| Shell inset | 48px from canvas edge at ≥1024px | 20px (Figma) — **trialled 2026-11-21** | Content column was 56px narrower than designed: wraps, truncation |
| Header | 84px + 8px top padding; title truncates when long; fixed 320px search | 76px + 5px main top (Figma); title keeps priority up to 60%; search shrinks to ≥208px — **trialled** | Full page titles at 1440px |
| Typography | system font; 22/28 page title; many 11–12px labels | keep scale; minimum 12px for any information-bearing text; `tabular-nums` on KPI values and table numbers | Legibility of dense data |
| Surfaces | page → canvas → card → one inset | KEEP | Clear ladder, matches GDS §4.3 |
| Buttons | navy primary, tonal secondary | KEEP; ensure pressed (`action-primary-active`) and disabled states everywhere; 150ms transition | Feedback on interaction |
| Inputs | 40px, 10px radius, focus ring | KEEP; add inline validation text slot of fixed height to avoid layout jump | Stable forms |
| Tables | header row on `surface-muted`, sortable headers | right-align numeric columns; sticky header inside scroll; row hover `surface-hover`; empty state inside table body (already) | Scanning |
| KPI cards | icon + label + value | label above value, value 24/32 medium tabular, unit/delta line; "—" only when the API has no value, with a tooltip saying why | Honest data |
| Empty states | one per card | page-level empty state when every widget is empty (Statistics: 6 identical cards today) | Less noise, clearer next step |
| Toast | `Toast` in ds | top-right, 4s, success/error/info tokens, action link optional | Consistency |
| Dialogs | `Dialog` in ds | KEEP; destructive confirm uses danger button and names the object | Error prevention |
| Theme toggle | moon button in header (dark theme exists) | Remove toggle and `.dark` styles (PO 2026-11-21, GDS §0.5 U-01) | Light mode is fixed |

## 4. Roadmap (each step: audit → change → Visual QA before/after → PO review)
1. **Shell & profile trial** — done as a trial on 2026-11-21, awaiting PO review (`docs/design/audit/UI-AUDIT.md` §4).
2. **Honest data**: remove placeholder data from Admin Dashboard (EBA-95) and wire states to real API errors; consolidated empty state on Statistics (after PR #70 merges).
3. **Shared components**: KPI card (`MetricCard`) tabular numerals + empty semantics; table numeric alignment; text-nowrap utility for status/count slots; toast placement.
4. **Screen groups**, in order of user value and after their open PRs merge (no edits on files another member is changing): Courses & Materials (PR #72) → Case library & editor → Feedback queue & detail (PR #68) → Student desk & player (needs case data) → Admin (PR #75).
5. **Public/auth**: resolve the 35% mismatch of 00.3/00.4/10.1 against Figma (EBA-87) — measure on the team's Windows/Chrome first.

## 5. What we keep (KEEP list)
Sidebar structure and collapse; navy active nav item; canvas/card ladder; course cards with code chip and status pill; detail side panel on Courses; case lifecycle stepper; skeleton geometry; empty states with icon + title + one line + one action; 403/404 pages; auth split layout concept; VI/EN switch.
