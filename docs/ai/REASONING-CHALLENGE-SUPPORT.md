# EduBranch AI — AI Reasoning & Challenge Support

> - **Document Class**: `[LIVING ARCHITECTURE / OPS SPEC]` — **SSOT for Challenge Support Mechanics & Guardrails**
> - **Implementation Status**: Implemented (Backend `challenge-support/` + AI Service `challenge_support/`) | **Source of Truth**: Proposal V1.2 (`docs/C1SE_65-EduBranch-AI-Proposal_V1.2.docx`)

---

## Purpose

AI Reasoning/Challenge Support generates focused, contextual challenge questions that probe student reasoning, trade-offs, and implicit assumptions.

It operates strictly under academic guardrails:
- **Questions Only**: Generates probing counter-questions to prompt deeper reflection.
- **NO GRADING**: Strictly NOT a grading system, NOT a pass/fail system, and does NOT score reasoning.
- **Both Learning Modes**: Supports student reasoning in Branching Study and student proposed solutions/reasoning in Review Study.

---

## Flow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant BE as Backend Gateway
    participant AI as FastAPI AI Service
    participant DB as PostgreSQL

    Student->>BE: Invoke Challenge Support (reasoningId XOR reviewSubmissionId)
    BE->>DB: Create challenge_support_sessions (current_round = 1)
    BE->>AI: POST /internal/v1/challenge-support/question (round=1, sources)
    AI-->>BE: Return Round 1 Socratic question (no grades/scores)
    BE->>DB: Persist challenge_messages (CHALLENGE_SUPPORT, round=1)
    BE-->>Student: Show Round 1 counter-question

    opt Optional Student Response (Round 2)
        Student->>BE: POST /challenge-support/{sessionId}/respond
        BE->>DB: Persist STUDENT message (round=2)
        BE->>AI: POST /internal/v1/challenge-support/question (round=2)
        AI-->>BE: Return Round 2 final question
        BE->>DB: Persist CHALLENGE_SUPPORT (round=2) & set is_completed = TRUE
        BE-->>Student: Show Round 2 question (Hard Stop — Round 3+ HTTP 400)
    end
```

---

## Challenge Round Enforcement

| Round | Trigger | AI Response | Status After |
|---|---|---|---|
| 1 | Student submits reasoning | Challenge question | Round 1 active |
| 2 | Student responds to Round 1 | Final challenge question | COMPLETED |
| 3+ | **BLOCKED** | None (HTTP 400) | N/A |

Enforced at BOTH layers:
- Backend Gateway: rejects requests when `current_round >= 2`
- FastAPI AI Service: validates `round_number <= 2` in Pydantic schema

---

## AI Governance Invariants

1. **Teaching Material is Untrusted Data**: Always wrap in `<sources>...</sources>` boundary to prevent prompt injection.
2. **No Grading Fields**: Neither request nor response schemas contain score, grade, or rating fields.
3. **No Overrides**: Sources and student input must never override system prompt instructions.
