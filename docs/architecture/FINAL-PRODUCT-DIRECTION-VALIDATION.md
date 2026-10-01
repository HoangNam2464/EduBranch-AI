# Final Product-Direction Validation

Date: 2026-09-28

## 1. Product Direction Check

Status: PARTIALLY IMPLEMENTED.

The repository now names Edu-Branch-AI as a university Case-Based Learning
platform with two independent learning modes:

- Branching Study: experience continuously, complete the journey, REVIEW,
  reflection, and retry as a new attempt.
- Review Study: context/data, problem, analysis, proposed solution, reasoning,
  lecturer review, and reflection.

The frontend demonstrates these flows with sample data. The backend domain
modules remain scaffolds, so the product behavior is not yet persisted or
available through production APIs.

## 2. Branching Study Check

| Requirement | Classification | Evidence |
|---|---|---|
| Consecutive choice flow without a reasoning form | VERIFIED IN SOURCE | frontend/src/pages/student/BranchingCasePlayerPage.tsx |
| No consequence card between decisions | VERIFIED IN SOURCE | Experience page does not render option consequences |
| Variable terminal structure | VERIFIED IN SOURCE | Terminal state is derived from the next node, not fixed sample IDs |
| One coherent attempt in the client flow | PARTIALLY IMPLEMENTED | frontend/src/stores/caseStudyStore.ts; in-memory only |
| Terminal completion before REVIEW | VERIFIED IN SOURCE | REVIEW guard requires attempt.isCompleted |
| Consequences and path replay in REVIEW | VERIFIED IN SOURCE | frontend/src/pages/student/BranchingReviewPage.tsx |
| Retrospective reasoning is optional per decision | VERIFIED IN SOURCE | REVIEW textareas are optional |
| Reflection after REVIEW | VERIFIED IN SOURCE | frontend/src/pages/student/ReflectionPage.tsx |
| Retry preserves the previous attempt and creates a new one | PARTIALLY IMPLEMENTED | Client store only; no persistent API |
| Backend attempt navigation and reasoning endpoints | MISSING | backend/src/modules/branching-attempt/ and reasoning/ are controllers only |

## 3. Review Study Check

| Requirement | Classification | Evidence |
|---|---|---|
| Independent mode without a decision tree | VERIFIED IN SOURCE | ReviewStudyPage.tsx uses context and problem text |
| Student analysis | VERIFIED IN SOURCE | Optional analysis field |
| Proposed solution and reasoning | VERIFIED IN SOURCE | Required submission fields |
| Lecturer review and feedback | DOCUMENTED ONLY | SQL schema and docs exist; controller has no endpoint |
| Reflection after lecturer feedback | PARTIALLY IMPLEMENTED | UI blocks reflection while status is SUBMITTED; no lecturer transition exists |
| Multiple reasonable solutions and no AI grading | VERIFIED IN SOURCE | UI and schema contain no score/pass-fail path |

## 4. AI Role Check

Status: DOCUMENTED and structurally constrained.

AI is positioned for material analysis, case generation, and challenge
questions. The AI schemas and documentation prohibit grading, pass/fail
decisions, approval, and publication. Feature routers and backend integration
are not yet implemented, so runtime enforcement is not verified.

## 5. Lecturer and Student Role Check

Status: PARTIALLY IMPLEMENTED.

The frontend has lecturer navigation shells and student learning screens.
Lecturer case review, publishing, student-attempt review, and feedback remain
placeholder pages/controllers. Students do not have a case-browsing requirement
in the documented MVP flow, but direct published-lesson access is not yet
implemented by the backend.

## 6. Naming and Rebranding Check

Status: PARTIALLY VERIFIED.

- Current product identity is normalized to EduBranch AI in the active README,
  frontend README, layouts, and primary module headers.
- Active Docker services, network, database defaults, Redis configuration, and
  MinIO bucket use the EduBranch AI identity. The existing PostgreSQL volume
  name `casetree-ai_postgres_data` is retained only as a data-preservation
  alias; it is not a current product identity.
- Historical proposal filenames, changelog notes, and audit references still
  contain CaseTree-AI; these are provenance references, not current
  user-facing product names.
- The GitHub repository is already `EduBranch-AI` and the local `origin` remote
  points to the matching URL.

## 7. Documentation vs Source Mismatches

- README previously claimed no business logic existed even though the
  frontend contained an interactive prototype. It now distinguishes prototype
  behavior from backend implementation.
- Branching attempt documentation and migration comments previously implied
  reasoning was supplied immediately after option selection. They now state
  that choices are recorded during Experience and reasoning is optional in
  REVIEW.
- The data-model documentation previously marked branching reasoning as NOT
  NULL, conflicting with the migration and approved flow. It now marks the
  field nullable.
- Backend skeleton documentation is accurate about missing domain APIs.

## 8. UI and UX Mismatches Corrected

- REVIEW could be opened after any selected option. It now requires a
  completed attempt and the requested attempt ID.
- The terminal player rendered the terminal outcome before REVIEW. It now
  defers detailed consequences/outcome explanation to REVIEW.
- Terminal detection used the sample node IDs N4 through N7. It now uses the
  case graph isTerminal flag.
- Review Study feedback used fabricated fallback lecturer content and allowed
  reflection before lecturer review. It now shows a pending state until the
  submission status is REVIEWED or REFLECTED.

## 9. Data Model and Flow Mismatches

The V2 migrations correctly model attempts, per-attempt choices, nullable
retrospective reasoning, Review Study submissions, challenge sessions, and
lecturer feedback. However, no NestJS service currently writes or reads these
tables. The data model is therefore DOCUMENTED/STRUCTURED, not runtime
VERIFIED.

The frontend store is an intentional prototype adapter, not a replacement for
the database. It is volatile, does not authenticate a student, does not enforce
published-case access, and cannot support lecturer-to-student feedback across
sessions.

## 10. Genuinely Complete

- Frontend and backend TypeScript builds pass.
- The two learning modes are separately represented in routes and screens.
- Branching Experience no longer inserts reasoning or consequence interruptions.
- Branching REVIEW replays the selected path and captures optional
  retrospective reasoning.
- Retry creates a separate client attempt record and leaves the prior record in
  client history.
- Review Study has a separate context/problem/solution/reasoning form.
- SQL constraints express the core attempt, submission, challenge, and
  feedback relationships.
- AI documentation and schemas prohibit grading and pass/fail authority.

## 11. Documented Only

- Lecturer material upload and AI-assisted case generation.
- Lecturer editing, approval, and publication.
- Persistent student attempts and path replay through the backend.
- Persistent retrospective reasoning and reflection.
- Lecturer Review Study feedback workflow.
- AI challenge support runtime endpoints.
- Direct lesson-link authorization against PUBLISHED cases.

## 12. Items Still Requiring Correction

1. Implement NestJS services and DTOs for published case retrieval and
   Branching Study attempt navigation.
2. Implement persistent choice recording, terminal completion, retrospective
   reasoning, reflection, and retry.
3. Implement Review Study submission, lecturer feedback transition, and
   student reflection transition.
4. Connect the frontend pages to apiClient and replace the sample store
   adapter without changing the approved user flows.
5. Add integration tests for the two state machines and publication guards.
6. Replace remaining active EduBranch AI header/comment variants with the
   canonical Edu-Branch-AI spelling where they are user-facing or current
   technical labels.

## 13. Feature Expansion Candidates Ranked by Implementation Relevance

1. Persistent Learning Journey Review API and lecturer attempt inspection.
2. Material Traceability from case sections and nodes back to teaching
   material chunks.
3. Classroom Discussion support using selected paths and qualitative lecturer
   feedback.
4. Review Study multiple-solution showcase after lecturer review.
5. Attempt comparison and Alternative Path awareness, only after immutable
   attempt persistence and privacy rules are implemented.

These candidates are sequenced by dependency on the two core learning flows.
They are not a request to expand scope before the core APIs are complete.

## Correction Plan

The next implementation slice should establish one end-to-end vertical slice:
published Branching Study case -> authenticated attempt -> consecutive
selection -> terminal completion -> REVIEW -> reflection -> retry. Once that
slice is persisted and tested, implement the independent Review Study
submission -> lecturer feedback -> reflection slice. Only then should
traceability, discussion, and attempt-comparison extensions be considered.
