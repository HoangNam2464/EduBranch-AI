# ADR-002: Adoption of Framer Motion for Presentational UI Transitions

> - **Document Class**: `[LIVING ARCHITECTURE / OPS SPEC]`

> **Status**: `[B. Project-Owner Decision]` Approved
> **Date**: 2026-11-18
> **Classification Standard**: Every decision item is tagged with:
> - `[A. Proposal Requirement]`: Explicitly stated in the EduBranch AI Proposal (C1SE.65).
> - `[B. Project-Owner Decision]`: Explicitly confirmed by the project owner.
> - `[C. Reference Architectural Pattern]`: Evaluated architectural pattern benchmark.
> - `[D. Architectural Decision]`: System-level architectural design choice.

---

## 1. Context

EduBranch AI is an academic authoring and experiential case-learning platform. Following the visual language and UX refinement directive (PO decision, 2026-11-17), interactive transitions and presentational animations were introduced to enhance comprehension of complex pedagogical flows (such as decision-tree branching progressions, stepper stage completions, and hero scenario simulations).

Pursuant to `.agents/rules/02-agent-operating-policy.md` §4, the introduction of a new production client dependency requires an architectural decision record and explicit PO approval.

---

## 2. Decision

- **Framework**: `framer-motion` (version pinned: `^14.14.0` in `frontend/package.json`).
- **Approval Source**:
  - `.agents/rules/01-ui-design-standards.md:256` (PO approval 2026-11-17).
  - PO confirmation in chat (2026-11-18).
- **Scope Boundary**:
  1. **Strictly Presentational**: Used exclusively for layout transitions, entry/exit reveals, and step progress indicators. Never used for business state, auth logic, or routing guards.
  2. **Accessibility & Reduced Motion**: Every animation MUST strictly obey `prefers-reduced-motion: reduce`. When reduced motion is preferred, animations must either terminate immediately or render directly in their final completed state without intermediate motion (enforced via `usePrefersReducedMotion.ts`).
  3. **Performance**: GPU-accelerated transforms (`opacity`, `transform`) only. No continuous layout recalculations or CPU-heavy SVG filter morphs.

---

## 3. Alternatives Considered

1. **Pure CSS Transitions / Keyframes (`transition-*`, `@keyframes`)**:
   - *Pros*: Zero bundle size overhead, native browser execution.
   - *Cons*: Difficult to orchestrate chained multi-step sequences (e.g. Hero automated phase loop with pause/resume and interrupted transitions); exit animations (`AnimatePresence`) require complex manual DOM lifecycle coordination.
2. **React Spring**:
   - *Pros*: Physics-based spring animations.
   - *Cons*: Larger API surface, steeper learning curve, less seamless integration with TailwindCSS layout utilities.

---

## 4. Consequences & Compliance

- **Bundle Impact**: ~32 KB minified/gzipped; loaded only on client bundles.
- **Verification Rule**: Any pull request introducing `motion.*` components must verify that disabling motion (`prefers-reduced-motion: reduce`) produces a stable, accessible static UI with no missing content or infinite loops.
