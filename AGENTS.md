# EduBranch-AI — Shared Agent Rules

Applies to every AI agent in this repository. Product/design source map: `docs/design/GLOBAL-DESIGN-SYSTEM.md` §0 (GDS §0).

## Sources
1. Before using a statement from a design or product document, read the heading that contains it, check for a `SUPERSEDED`/`UNRESOLVED` banner, and look up the ID in GDS §0.4.
2. Text under a banner is history, not guidance. A banner is not a decision: never declare a winner in an UNRESOLVED conflict.
3. Retired sources (for example `docs/design/STITCH-GENERATION-GUIDELINES.md`) are never templates, even on request. Say so and point to the current source.
4. If a PO decision, OPD or register ID is not in your context, cite the ID and ask; do not infer its content.

## Open decisions
5. For an OPEN/PENDING decision or an UNRESOLVED item: list the sources and options, propose no interim choice, and end by asking the PO.
6. Never mark a decision APPROVED and never close an UNRESOLVED item.

## Evidence
7. No route, field, value or rule without a source. Internal service routes are not public API. If evidence is missing, say UNKNOWN and name the missing source.
8. Code that exists is not an approved requirement.

## Design values
9. Design values are provisional until tokens are approved (GDS §0.2): label them provisional and never mark a frame Ready for Dev on them.
