# Design Inspiration — Research Notes

> **Status**: Research (2026-11-21) · **Author**: Claude · **Feeds**: `docs/design/DESIGN-DIRECTION.md` (PROPOSED).
> **Method**: full-page screenshots at 1440px with Playwright (Chromium). The third-party screenshots are not kept in the repository (removed 2026-11-22); re-capture them locally, compressed to about 50%, when needed (R01 / `.claude/rules/ui-design.md`). Pages that rendered without CSS (Linear, Gradescope, Stripe: their asset CDNs were not reachable from the session) or behind a bot challenge (Khan Academy) were discarded, not described from memory. Third-party screenshots are kept for internal design study only; nothing is copied into the product.
> **Limit**: only public pages were reachable; logged-in product UIs (Canvas course pages, Gradescope grading, Coursera learner dashboard) were not, so their in-app UX is inferred from the marketing screenshots they publish. Claims marked INFERENCE are not verified in the live product.

## 1. Sources reviewed

| # | Source | Screenshot | Why it is relevant |
|---|---|---|---|
| 1 | recent.design — feed, Websites (SaaS, Product), item pages (Mixpanel, AuthKit, Interfere, Amie, AI Agent Scheduler UI) | `recent-*.jpg` | Curated, current SaaS/app patterns; its own UI is a calm catalogue with a left nav, chip filters and a metadata side panel |
| 2 | Canvas by Instructure (LMS) | `canvas-lms.jpg` | Higher-education LMS, lecturer + student roles, gradebook/SpeedGrader framing |
| 3 | Coursera | `coursera.jpg` | Course catalogue at scale; skeleton loading captured mid-load |
| 4 | Brilliant | `brilliant.jpg` | Interactive learning by doing, step-by-step problem flow |
| 5 | Notion | `notion.jpg` | Calm workspace typography, generous whitespace, document-first hierarchy |
| 6 | PostHog | `posthog.jpg` | Analytics product: dense data, persistent left rail, contextual cards |
| 7 | Vercel | `vercel.jpg` | Restrained monochrome dashboard language, strong type contrast |

## 2. Findings per source (what to learn, what not to take)

**recent.design (catalogue UI)** — Navigation: one quiet left rail (Browse / Resources) with plain text items and a dot for the active one; content starts immediately with a one-line title + subtitle. Filters are a single row of pill chips with one dark selected state, plus a sort dropdown at the far right. Item pages split media (left, large) from a metadata column (right: labelled key/value rows in two greys). Error state seen live: an inline red-tinted card "Failed to fetch … Try again" inside the content area, not a full-page error (`recent-inline-error-state.jpg`).
Learn: title + one-line context; one filter row; key/value metadata lists with label/value contrast; inline recoverable errors. Not for us: monochrome brand, image-first cards.

**Canvas LMS** — Strong role framing ("Student" panel listing what a student can do), cards with one icon, a two-line title and a short paragraph; dark navy brand areas alternate with white sections. Product shots show a gradebook table and calendar.
Learn: speak to each role in its own words; course cards keep one job each. Not for us: marketing-scale hero colour blocks inside the app.

**Coursera** — Catalogue rows grouped by intent ("New and popular", "Trending"), each with a short label and a horizontal set of equal cards; skeleton placeholders keep the exact card geometry while loading.
Learn: skeletons that match final geometry (our `Skeleton` already does this — KEEP); group lists by the user's next action rather than by entity type.

**Brilliant** — Learning is a sequence of small interactive steps with immediate, visual feedback and one primary action per step; copy is short and encouraging, not instructional.
Learn for the Branching Case Player: one decision per screen, generous space around the scenario text, the choice set as large tappable cards, no side noise. Not for us: gamification (streaks, mascots) — banned by R01 §1 rule 7.

**Notion** — Typographic hierarchy does the work: large page title, muted secondary text, minimal borders, content width capped for reading.
Learn: limit reading width for long case text (~70–80 characters per line); reduce border noise where whitespace separates enough.

**PostHog / Vercel** — Data-dense screens stay readable through a strict type scale, tabular numerals, right-aligned numbers, and one accent colour for focal data.
Learn: KPI cards with label above value, units always shown, tabular figures; one focal series in navy, others neutral (already R01 §2 — KEEP).

## 3. Patterns selected for EduBranch-AI

| Pattern | Seen in | EduBranch target |
|---|---|---|
| Page header = title + one-line context, actions on the right | recent.design, Notion | Shell title area; optional subtitle per page (no new copy without PO-approved Vietnamese text) |
| One filter row (search + chips + sort) above lists | recent.design, Coursera | Courses, Case Study library, Feedback queue (already close — IMPROVE alignment) |
| Inline recoverable error inside the card, not a page swap | recent.design | `ErrorState framed={false}` usage in cards (exists — apply consistently) |
| Skeletons matching final geometry | Coursera | KEEP current `Skeleton` |
| Key/value metadata rows (muted label, strong value) | recent.design item page | Course detail panel, Profile, Submission detail |
| One decision per view, large choice cards, quiet chrome | Brilliant | Branching Case Player (already experience-first — verify spacing with real data) |
| Reading width cap for long text | Notion | Case scenario/context text, reflection prompts |
| Tabular numerals, label-above-value KPI cards | PostHog, Vercel | Dashboard, Statistics, Admin KPI cards |
| Role-specific language | Canvas | Empty states that tell lecturer vs student the next step (copy already does this — KEEP) |
