# EduBranch AI — Evaluation & Research Design

**Status**: Scaffolded (architectural boundary only)

---

## Purpose

This boundary supports the quantitative research dimension of EduBranch-AI,
enabling comparison between AI-generated cases and lecturer-authored cases,
and tracking student engagement with AI Reasoning / Challenge Support.

---

## Planned Components (not yet implemented)

### Rubric System
- Lecturers define rubrics for evaluating student reasoning and reflections
- Rubrics linked to courses or specific cases

### Evaluation Records
- Lecturers manually link rubric criteria to branching attempts or review study submissions
- Store evaluation results per attempt/reasoning submission

### Survey / Data Collection
- Post-case survey capture
- Student self-assessment

### Research Dataset Export
- Anonymized export of:
  - Branch selection patterns
  - Student reasoning quality (rubric scores)
  - Challenge Support engagement metrics
  - AI-generated vs lecturer-authored case comparison

---

## Privacy Requirements

- All research dataset exports MUST be anonymized (no PII)
- Student data may only be used for the research purpose with consent
- Personal identifiers must be removed before export

---

## Implementation Status

| Component | Status |
|---|---|
| Evaluation entity | Scaffolded |
| Rubric entity | Scaffolded |
| Survey capture | Planned |
| Dataset export | Planned |
| AI vs Human case comparison | Planned |

> This module will be implemented in a later phase, after the core MVP is complete.
