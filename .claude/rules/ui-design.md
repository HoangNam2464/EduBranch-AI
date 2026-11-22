---
paths:
  - "frontend/**"
  - "docs/design/**"
  - "docs/05_FIGMA.md"
---
# UI design work — Claude Code

- Read R01 (`.agents/rules/01-ui-design-standards.md`) before any UI work: it is the single design source (fixed decisions §0, tokens by name §2, layout §3, components §4, states §5, copy §6, quality bar §8). Token values live only in `frontend/src/index.css` `@theme`. Do not restate values here or in other docs.
- Figma file `6CtSgJPKo4jCIbB7WwCaWw`, page `EduBranch AI – Screens` (`483:9634`; Design System page `445:239`): the reference for what a screen contains. Frame register: `docs/05_FIGMA.md`; per-screen behaviour: `docs/design/UX-SCREEN-NOTES.md`. Read frames read-only through the Figma MCP; never edit Figma without explicit PO approval for that change. Where R01 and Figma differ visually, R01 wins and the difference is listed for a later Figma update (PO 2026-11-22).
- Improvement method (PO 2026-11-20, 2026-11-22): audit the running app; mark each part KEEP / IMPROVE / REDESIGN with the concrete problem; fix shared components before single screens; one spec per screen group; before/after screenshots; 3–4 browser review rounds (widths 1024/1280/1440/1920, VI/EN, all states, real interactions) before presenting. Never change something only to make it look different. Plan and order: `docs/design/DESIGN-DIRECTION.md`.
- Inspiration (PO 2026-11-22): full-page screenshots of reference sites may guide layout and quality; compress them (about 50%, tens of KB) before reading; never copy their brand, assets or copy; keep the identity of R01 §0. Notes: `docs/design/research/DESIGN-INSPIRATION.md`.
- A UI change is done only after the check in `CLAUDE.md` §5 step 5 and the R01 §8 quality bar.
