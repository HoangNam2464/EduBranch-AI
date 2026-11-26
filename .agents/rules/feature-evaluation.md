---
description: Rules for case-quality rubric evaluation and research export in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Evaluation & Case-Quality Rubric

## Scope
Backend Gateway (NestJS `backend/`) — `evaluation/` module (`BE-033`, completed and merged in PR #80 `dec96f0`, `specs/007-mvp-completion-backend/`).
FastAPI `ai-service/` — `evaluation/` package (auxiliary research utilities).
Frontend — `pages/rubric/CaseRubricPage.tsx` (`07.8`), `pages/admin/AdminRubricPage.tsx` (`10.8`) (`FE-029`; on `develop` these pages do not call the BE-033 API yet).

## Included (MVP via PO 2026-11-12 OPD-011 → Option A, refined 2026-11-25/26)
- **In-Platform Case-Quality Rubric (`1–5` Likert scale)**: Evaluates **case study quality** (`Realism`, `Difficulty`, `Course Alignment`) comparing AI-generated vs lecturer-authored cases — NEVER grades students.
- **Pseudonymized Research CSV Export**: CSV-only export (`GET /api/v1/evaluation/export?dataset=activity|rubrics`) stripped of student/evaluator PII and free text, using stable HMAC pseudonyms (`AC-R5`), omitting absolute timestamps (`L3 Option C`, PO 2026-11-25), and coarsening/removing high-linkability quasi-identifiers (`R-L3b Option B`, PO 2026-11-26).

## Excluded / Post-MVP Trial Scope
- Grading, scoring, or ranking students (prohibited globally across EduBranch-AI)
- In-platform student post-case survey forms & statistical test runners (collected externally during classroom trial per `docs/research/EVALUATION-DESIGN.md`)
- Public dataset publishing or ad-hoc sharing of row-level CSV exports

## Service Owner
Backend Gateway: case-quality rubric persistence & pseudonymized research CSV export (`evaluation/`).
FastAPI: offline/auxiliary evaluation metrics boundary (`evaluation/`).

## Constraints
- Research dataset exports are **pseudonymization with reduced linkability**, NEVER absolute anonymization (PO decision 2026-11-26). Do not claim exported CSVs are strictly/absolutely anonymized.
- Exports MUST omit PII (zero student/evaluator names, emails, real UUIDs, or free text) and omit absolute timestamps (`L3 Option C`), while maintaining authorized lecturer/admin scope (`AC-R4`) and stable pseudonyms across exports (`AC-R5`).
- The five residual linkage limitations the PO accepted for the MVP on 2026-11-26 (QG2 stays `PASS WITH CONDITIONS`; `specs/007-mvp-completion-backend/record.md` §7.3 items 1–5) must remain documented: (1) retry row multiplicity per `participant_code`; (2) low 2-band resolution in `REVIEW_STUDY` and `k = 1` outliers; (3) cross-case `participant_code` intersection within a course; (4) differencing between exports taken at different times; (5) once one row is linked, its `participant_code` also exposes that student's incomplete attempts and `challenge_rounds` (and `GET /evaluation/rubrics` already returns `evaluatorName` with scores). Mitigate small-cohort and cross-export comparison risks in a dedicated post-MVP follow-up task.
- Rubric evaluations assess **case quality only** and are authored exclusively by human lecturers/evaluators — never by autonomous LLMs.

## Testing Expectations
- Verify PII/free-text/timestamp omission, band generalization, pseudonym stability, formula-cell neutralization, and role/ownership enforcement on rubric & export endpoints (`BE-033`, `specs/007-mvp-completion-backend/`).
