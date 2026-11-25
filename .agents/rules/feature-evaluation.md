---
description: Rules for case-quality rubric evaluation and research export in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Evaluation & Case-Quality Rubric

## Scope
Backend Gateway (NestJS `backend/`) — `evaluation/` module (`BE-033` pending in PR #80).
FastAPI `ai-service/` — `evaluation/` package (auxiliary research utilities).
Frontend — `pages/rubric/CaseRubricPage.tsx` (`07.8`), `pages/admin/AdminRubricPage.tsx` (`10.8`).

## Included (MVP via PO 2026-11-12 OPD-011 → Option A)
- **In-Platform Case-Quality Rubric (`1–5` Likert scale)**: Evaluates **case study quality** (`Realism`, `Difficulty`, `Course Alignment`) comparing AI-generated vs lecturer-authored cases — NEVER grades students.
- **Anonymized Research Dataset Export**: CSV/JSON export stripped of all student PII (strict privacy filter).

## Excluded / Post-MVP Trial Scope
- Grading, scoring, or ranking students (prohibited globally across EduBranch-AI)
- In-platform student post-case survey forms & statistical test runners (collected externally during classroom trial per `docs/research/EVALUATION-DESIGN.md`)
- Public dataset publishing

## Service Owner
Backend Gateway: case-quality rubric persistence & PII-stripped research dataset export (`evaluation/`).
FastAPI: offline/auxiliary evaluation metrics boundary (`evaluation/`).

## Constraints
- Research dataset exports MUST be strictly anonymized (zero student name, email, or student ID)
- Rubric evaluations assess **case quality only** and are authored exclusively by human lecturers/evaluators — never by autonomous LLMs

## Testing Expectations
- Verify PII stripping on export and role/ownership enforcement on rubric endpoints (`BE-033` / `QA` EBA-100+)
