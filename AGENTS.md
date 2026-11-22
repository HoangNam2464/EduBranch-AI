# EduBranch-AI — Shared Agent Rules

Read by every agent (Claude Code imports it from `CLAUDE.md`; Antigravity reads it with `.agents/rules/`). Sources: product = Proposal V1.2 and `docs/mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md`; architecture and invariants = FND `.agents/rules/00-project-foundation.md`; UI = R01 `.agents/rules/01-ui-design-standards.md` (single design source, values only in `frontend/src/index.css`); process = `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. Rule numbers are stable; other documents cite them.

1. Before using a design/product statement, read its heading and check for SUPERSEDED/UNRESOLVED banners.
2. Text under a banner is history, not guidance. A banner is not a decision: never declare a winner in an UNRESOLVED conflict.
3. Retired sources are never templates, even on request (Stitch prompts and skills, the Eduva template rules, the first flat-gray visual language); say so; name the current one.
4. PO decision, OPD or register ID not in context: cite and ask; never infer it.
5. OPEN/PENDING decision or UNRESOLVED item: list sources, options, propose no interim choice, end by asking the PO. Stop only the work that depends on it.
6. Never mark a decision APPROVED or close an UNRESOLVED item.
7. No route, field, value or rule without a source; internal routes are not public API; no evidence: UNKNOWN, name the source.
8. Existing code is not an approved requirement.
9. Design values are the tokens in `frontend/src/index.css` as R01 describes them (PO 2026-11-22: code + R01 are the visual standard, Figma follows). Never invent a value or restate design values in another document.
10. DONE needs verified test evidence (01_MASTER-TASKS §5); PO approval or ticked checklists are not enough.
11. Features, behaviour changes, security/ownership fixes and UI changes: follow docs/workflows/FEATURE-DELIVERY-WORKFLOW.md (Approved by the PO 2026-11-17), run with the installed GitHub Spec Kit skills (`/speckit-*`, v1.4.0; bugs: `/speckit-bug-*`). Its Quality Gates decide commit, push, PR, merge and Jira Done. Never re-run `specify init` or write a second constitution: `.specify/memory/constitution.md` points to this file, FND and the workflow and restates no new principle.
12. UI language (PO 2026-11-16; confirmed for the MVP 2026-11-22): Vietnamese default; English through the VI/EN switch; each screen fully in the selected language, no mixing; keep the established domain terms. English copy stays PROPOSED until the PO approves it.
13. Task ownership & autonomous execution (PO 2026-11-16): `.agents/rules/02-agent-operating-policy.md` is the single source (always on for Antigravity, imported by CLAUDE.md). Own the outcome, work in batches, test adversarially, review independently, converge before handoff; escalate only PO decisions and authorization boundaries (its §5, §7). It never widens an authorization.
