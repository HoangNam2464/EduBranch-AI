---
paths:
  - "ai-service/**"
---
# AI service rules (FastAPI + Pydantic v2, internal only)

Read first: FND §3 and §6, `docs/ai/RAG-PIPELINE.md`, `docs/ai/REASONING-CHALLENGE-SUPPORT.md`, feature rules `feature-rag.md`, `feature-case-generation.md`, `feature-challenge-support.md`.

## Boundaries
- Internal routes `/internal/v1/*` only, protected by `verify_internal_api_key` (`app/core/security.py`); `/health` is the only unauthenticated route. Never exposed publicly, never called by the browser.
- The AI service owns parsing, chunking, embeddings, retrieval, generation and counter-questions; it owns no business state (no case status, attempts, feedback). Persistence of business data belongs to the backend.

## LLM integration
- Every LLM or embedding call goes through `app/providers/factory.py`. Models: `gemini-3.5-flash` (pinned, PO 2026-11-17), `gemini-embedding-001` at 768 dims (V4 `document_chunks` column). Changing a model or provider is a PO decision.
- Prompts: system instructions first; retrieved chunks only inside `<sources>…</sources>`, with tag look-alikes in source text neutralised (`app/retrieval/service.py`); retrieval always filtered by `course_id`.
- Structured output parsed into Pydantic v2 models; generation output validated by `app/generation/schemas/decision_tree.py` (references, reachability, 3-colour DFS, 2–4 options, terminal node) before it is returned; invalid output is retried within a bound and then fails cleanly, never repaired silently.
- Challenge Support: counter-questions only, `MAX_ROUNDS = 2` (`app/challenge_support/assistant/service.py`), output schema forbids scores, grades, rankings and verdicts. AI supports the student's thinking; the lecturer judges.
- Timeouts, bounded retries and provider errors mapped to stable error codes; no API key or prompt in logs.

## Tests
`pytest` (CI env: `AI_SERVICE_API_KEY=ci-test-key AI_PROVIDER=gemini GEMINI_API_KEY=ci-fake-key-not-called-in-unit-tests`, Postgres vars). Unit tests never call a real provider; mock `factory.py`. Live tests (`test_*_live.py`) need keys and services: report them as skipped or BLOCKED, never passed. Python 3.12 (pinned wheels do not build on 3.13: use `uv venv -p python3.12`).
