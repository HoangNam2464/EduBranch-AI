---
paths:
  - "frontend/**"
  - "docs/design/**"
  - "docs/05_FIGMA.md"
---
# UI Design Notes — Claude Code

Authoritative UI/UX rules live in **R01** (`.agents/rules/01-ui-design-standards.md`), [`docs/05_FIGMA.md`](../../docs/05_FIGMA.md), [`docs/design/UX-SCREEN-NOTES.md`](../../docs/design/UX-SCREEN-NOTES.md), and [`docs/design/DESIGN-DIRECTION.md`](../../docs/design/DESIGN-DIRECTION.md).

- **Figma Authority & MCP**: PO-approved Figma (`6CtSgJPKo4jCIbB7WwCaWw` — `EduBranch AI – Screens` `483:9634`, `EduBranch AI – Design System` `445:239`) is the **official screen design authority**. Access read-only; never edit Figma without explicit PO approval and never edit Figma to justify legacy code. When code mismatches PO-approved Figma, adjust code and implementation docs to follow Figma; if approved Figma conflicts with `R01` general rules, report it and mark `OPEN PO DECISION / UNRESOLVED`.
- **UI Verification Split**: Code implementation delegates via `.agent-handoff/<TASK-ID>.md` (`figma-screen-implementer` fallback if Antigravity unavailable); independent verification runs via `visual-qa-verifier` against R01 §8 across `1024/1280/1440/1920`, VI/EN, and all states (`loading/empty/error/403/success`) with before/after screenshots.
- **Design Inspiration Compression**: Compress third-party reference screenshots (~50%) for study; store notes in `docs/design/research/DESIGN-INSPIRATION.md` only and keep binaries out of git.
