---
paths:
  - "ai-service/**"
---
# AI Service Notes — Claude Code

Authoritative AI rules and recurring-defect guardrails live in **`.agents/rules/03-engineering-and-task-standards.md` §4 & §7** (`Rule A1`–`A2`), **FND §3 & §6**, [`docs/ai/RAG-PIPELINE.md`](../../docs/ai/RAG-PIPELINE.md), [`docs/ai/REASONING-CHALLENGE-SUPPORT.md`](../../docs/ai/REASONING-CHALLENGE-SUPPORT.md), and feature rules (`feature-rag.md`, `feature-case-generation.md`, `feature-challenge-support.md`). Do not duplicate them here.

## Claude Session Test Command
- Python 3.12 required (`uv venv -p python3.12`; pinned wheels do not build on 3.13).
- CI-compatible unit run (mocking `app/providers/factory.py`, never calling real LLMs):
  `AI_SERVICE_API_KEY=ci-test-key AI_PROVIDER=gemini GEMINI_API_KEY=ci-fake-key-not-called-in-unit-tests pytest`
- Live integration suites (`test_*_live.py`): require live keys and services; report as `skipped` or `BLOCKED`, never as passed.
