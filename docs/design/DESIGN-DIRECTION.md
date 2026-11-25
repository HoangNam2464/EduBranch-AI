# EduBranch-AI — UI Improvement Plan "Preserve and Elevate"

> - **Document Class**: `[LIVING FEATURE / DESIGN SPEC]`

> **Status**: Direction chosen by the PO on 2026-11-22 (chat, option 1: "giữ nhận diện, nâng cấp … sửa lại các vấn đề về UI, UX để nó không bị xấu và không chuyên nghiệp, sau này sẽ nâng cấp") and updated on 2026-11-25 to adopt `Plus Jakarta Sans` + `Inter` typography and layered TypeScript SPA conventions cleanly on Light-only Navy/Sky surfaces. The rules themselves are in R01 (`.agents/rules/01-ui-design-standards.md`); this file is only the plan and its order. Each step still goes through a spec and PO review (workflow).
> **Inputs**: UI audit `docs/design/audit/UI-AUDIT.md` (2026-11-21, findings X1–X8), research `docs/design/research/DESIGN-INSPIRATION.md`, R01, Figma page `EduBranch AI – Screens` (content reference).

## 1. Direction in one paragraph
EduBranch-AI should read like a calm university workspace. The identity is already right (light theme, navy actions, sky data, white cards on a soft blue canvas). What lowers perceived quality today is execution: content squeezed by excess padding, labels that wrap or truncate where space exists, placeholder data, empty states repeated card by card, and a layout built for one fixed desktop frame instead of a browser window. Fix those systematically, shared components first, then screen groups. Nothing changes only to look different; a larger visual upgrade comes after the MVP.

## 2. Principles (detail in R01)
1. **Web first**: fluid app shell, works 1024 → 1920+ without horizontal scroll (R01 §3.1).
2. **Text never breaks where space exists** (R01 §5.4).
3. **One job per card; one primary action per view** (R01 §4).
4. **Real data or an honest state**; one page-level empty state when everything is empty (R01 §5.1, §5.5).
5. **Typography carries hierarchy**; tabular numerals for numbers (R01 §3.3).
6. **Colour carries meaning only** (R01 §2).
7. **Pedagogy shapes layout**: quiet decision phase, consequences only in Journey Review (R01 §7).
8. **Feedback on every interaction**: hover, focus, pressed, disabled, pending, toast (R01 §5.2–§5.3).

## 3. Steps (each: audit on current `develop` → spec → change → before/after screenshots → 3–4 review rounds → PO review)
1. **Foundations** *(merged: Specs 006/008/009, PRs #79/#83/#84; typography transition to `Plus Jakarta Sans` + `Inter` queued per PO 2026-11-25)*: remove theme toggle and `.dark` styles; fluid app shell and responsive widths (1024–1920+); `whitespace-nowrap` convention for status/count slots; bottom-right toast placement.
2. **Shared components** *(merged: Spec 010, PR #85)*: `MetricCard` (label above value, tabular numerals, honest "—" with reason), tables (numeric alignment, sticky header, row hover), inputs (fixed-height error slot), button pressed/disabled states, contrast fixes.
3. **Honest data**: remove placeholder data from the Admin dashboard (X4, EBA-95); one empty state on Statistics (X5).
4. **Screen groups**, in order of user value: Courses & Materials → Case library, AI Studio & Case editor → Lecturer feedback queue & detail → Student desk, Branching player, Journey Review, Review Study → Lecturer dashboard & Statistics → Profile → Admin. Never edit files another member is changing in an open PR.
5. **Public and auth**: landing and auth pages against their frames (X6), measured on Windows/Chrome.
6. **English copy**: draft English for every screen group as `PROPOSED` registry rows; the PO approves per group so English can ship in the MVP (R01 §6).
7. **Figma sync (later)**: list the differences between code and Figma per screen group for a later Figma update (PO approval needed for any Figma edit).

## 4. What we keep
Sidebar structure and collapse; navy active nav item; canvas/card ladder; course cards with code chip and status pill; detail side panel on Courses; case lifecycle stepper; skeleton geometry; empty states with icon + title + one line + one action; 403/404 pages; auth split layout concept; VI/EN switch.
