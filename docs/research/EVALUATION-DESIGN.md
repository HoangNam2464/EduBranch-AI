# EduBranch AI — Evaluation & Classroom Research Methodology

> - **Document Class**: `[SUPPORTING GUIDE]` (Research Trial Methodology)
> - **Canonical Feature & Rubric SSOT**: [`docs/features/FEATURE-EVALUATION-AND-RESEARCH.md`](../features/FEATURE-EVALUATION-AND-RESEARCH.md) · [`OPD-011`](../mvp-scope/PRODUCT_OWNER_SCOPE_DECISIONS.md)
> - **Strict Guardrail**: Academic evaluation assesses **Case Study Quality** (`Realism`, `Difficulty`, `Course Alignment`) — NEVER student grades, scores, or pass/fail rankings.

---

## 1. Research Purpose & Proposal Question

Supports the quantitative Capstone Deliverable 6 evaluation answering the Proposal V1.2 research question:
> *"Evaluate the quality of AI-generated cases (produced from a lecturer's teaching material via RAG) compared with lecturer-authored cases, based on a rubric covering realism, difficulty, and alignment with the course content."*

---

## 2. Case-Quality Rubric & Trial Boundaries

### A. In-Platform MVP Components (`OPD-011 → Option A`, PO 2026-11-12)
- **Case-Quality Rubric UI & Storage (`07.8` Lecturer / `10.8` Admin)**: Human lecturers/evaluators rate published cases on a `1–5` Likert scale across three standardized criteria:
  1. **Realism** — plausibility of professional situations, options, and consequences.
  2. **Difficulty** — cognitive complexity and authentic trade-off ambiguity.
  3. **Course Alignment** — faithfulness to uploaded course syllabus and materials.
- **Anonymized Telemetry & CSV/JSON Export (`BE-033` pending in PR #80)**: Exports branch choice counts, attempt depth, reasoning word lengths, challenge-support rounds (`0`, `1`, `2`), and case-quality rubric ratings with **all PII stripped** (zero names, emails, or student IDs).

### B. Classroom Trial & Offline Analysis Components (Weeks 12–13 Trial / Post-MVP)
- **Post-Case Student Survey**: Collected externally during classroom trials (standardized Likert survey link post-session) rather than in-platform interactive survey builders.
- **Comparative Statistical Analysis**: Executed offline (SPSS / R / Excel — e.g. paired t-tests or Mann-Whitney U tests) on anonymized exported datasets comparing RAG-generated vs lecturer-authored cases.

---

## 3. Privacy & Non-Grading Rules

1. **Zero Student Grading**: Rubrics and telemetry MUST NEVER score, rank, or grade students (`INV-10`).
2. **Human-Only Case Evaluation**: AI never rates or approves its own cases (`BR-EVAL-02`).
3. **Strict PII Anonymization**: Exports omit all personally identifiable student attributes (`FR-EVAL-05`).

---

## 4. Implementation Status

| Component | Status on `develop` | Source / Gap |
|---|---|---|
| Case-Quality Rubric UI (`CaseRubricPage.tsx`, `AdminRubricPage.tsx`) | **Implemented** | Merged (`PR #74` / `#75`) |
| Backend Rubric Persistence & PII-Stripped Export (`evaluation/`) | **Pending** | Open PR #80 (`BE-033`) |
| AI Service Evaluation Utilities (`ai-service/app/evaluation/`) | **Skeleton** | Auxiliary metrics boundary |
| Classroom Student Survey & Offline Stats | **External / Trial** | Collected outside platform during pilot |
