# EduBranch-AI Constitution

This constitution does not define new principles. EduBranch-AI already has them; Spec Kit commands read them from the sources below. When a source changes, it wins over any summary in this file.

## Sources of principles (read in full for every Constitution Check)

1. `AGENTS.md`: shared agent rules 1–11 (source map, banners, open decisions, no invented routes/values, existing code is not a requirement, provisional tokens, DONE needs verified evidence).
2. FND `.agents/rules/00-project-foundation.md`: §3 architecture boundaries, §4 case lifecycle, §5 decision-tree integrity, §6 AI governance, §7 Git workflow, branch naming and commits.
3. Feature rules `.agents/rules/feature-*.md` and `.agents/rules/01-ui-design-standards.md` for the area being changed.
4. `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`: stages, gates, Quality Gates QG1–QG7, roles and handoff.
5. `CLAUDE.md` (commands, Visual QA gate, code map) and approved PO decisions cited by ID.

## Constitution Check (used by `/speckit-plan` and `/speckit-analyze`)

A plan or task list fails the check when it:

- places a responsibility in a service other than the one FND §3 assigns (for example the frontend calling the AI service instead of the backend REST gateway) (FND §3), or adds a technology without an ADR and PO approval (workflow §4 Plan);
- changes an approved behaviour, API contract, permission or business rule that the spec does not list as in scope (AGENTS.md rule 8; workflow §4 Specify, §5);
- relies on a route, field, value or rule with no source, or on an OPEN/UNRESOLVED decision (AGENTS.md rules 5–7);
- shows fake data where the API gives none, or uses a raw value where a Design System token exists (CLAUDE.md "Frontend rules for UI work");
- plans no test for an acceptance criterion, or counts a BLOCKED test as PASS (AGENTS.md rule 10; workflow §5);
- breaks the branch, commit or PR rules (FND §7; workflow §5).

A failure is a Critical finding: fix it at its source stage or ask the PO.

## Governance

Amendments are made in the source files above, with PO approval, never by rewriting this file with new principles. `/speckit-constitution` is not run again on this repository.

**Version**: 1.0.0 | **Ratified**: 2026-11-15 (PO decision in chat: adopt Spec Kit, keep existing principles) | **Last Amended**: 2026-11-15
