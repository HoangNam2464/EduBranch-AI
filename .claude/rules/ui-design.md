---
paths:
  - "frontend/**"
  - "docs/design/**"
  - "docs/05_FIGMA.md"
---
# UI design work — Claude Code

- Design sources, in order: approved PO decisions → Figma page `EduBranch AI – Screens` (file `6CtSgJPKo4jCIbB7WwCaWw`, page `483:9634`, 71 desktop frames at 1440px in sections 00–10) → GDS (`docs/design/GLOBAL-DESIGN-SYSTEM.md`, read §0 first) → R01 (`.agents/rules/01-ui-design-standards.md`, shared with Antigravity; read the section you need with its banners; do not copy its values here) → `docs/05_FIGMA.md` (frame register) → `docs/design/screens/P0`–`P4`.
- The Design System page `445:239` holds the Figma variables and components. Read frames read-only through the Figma MCP (`create_session`, `get_metadata`, `get_screenshot`, `get_design_context`); never edit Figma without explicit PO approval for that change.
- Displayed UI language (PO 2026-11-16, AGENTS.md rule 12; supersedes PO-3): Vietnamese default; English through the approved VI/EN switch (`EB/Header Actions` `540:347`, `Language` `544:5800`); each screen fully in one language; established domain terms kept.
- Fixed visual identity (PO 2026-11-20, chat: "Duy trì Light Mode, màu thương hiệu Navy #2A4E7F và Sky #00A5F5, cùng các nguyên tắc thiết kế hiện hành"): light mode, navy for actions, sky for data/highlight (never text), 1440px desktop baseline, no mobile or native redesign. Inside those limits colour pairing, type, spacing, surfaces, borders, shadows, layout and interaction may be improved. Evolution proposals: `docs/design/DESIGN-DIRECTION.md` (PROPOSED).
- UI improvement method (PO 2026-11-20): audit the running app first; mark each part KEEP / IMPROVE / REDESIGN with the concrete problem; improve shared components before single screens; trial on a representative screen group, compare before/after screenshots, present the trial before rolling out. Never change something only to make it look different.
- Web font: system font (PO 2026-11-21, GDS §3.1); Figma text styles still name Roboto, so Visual QA text widths differ by the font only.
- A UI change is not done until it passes the Visual QA gate in `CLAUDE.md` §17.
