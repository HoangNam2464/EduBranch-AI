# EduBranch AI — FastAPI AI Service

> **Document Class**: `[SUPPORTING GUIDE]` · **Authoritative AI Rules**: [`.agents/rules/03-engineering-and-task-standards.md §4`](../.agents/rules/03-engineering-and-task-standards.md), [`docs/ai/RAG-PIPELINE.md`](../docs/ai/RAG-PIPELINE.md), [`docs/ai/REASONING-CHALLENGE-SUPPORT.md`](../docs/ai/REASONING-CHALLENGE-SUPPORT.md)

Strictly internal Python 3.12 + FastAPI AI/RAG microservice for **EduBranch AI**.

> **CRITICAL BOUNDARY**: All endpoints under `/internal/v1/*` require the `X-Internal-API-Key` header (`app/core/security.py`). Never expose this service to the public internet or call it from the browser. Only `/health` is unauthenticated.

---

## Responsibilities

- Document parsing (`PyPDF`, `python-docx`) and text normalization
- Recursive chunking (`LangChain` text splitters)
- Embedding generation (`gemini-embedding-001` at `768` dims primary; OpenAI via `providers/factory.py`)
- `pgvector` cosine similarity retrieval (`document_chunks.embedding vector(768)`) strictly isolated by `course_id`
- Untrusted source boundary wrapping (`<sources>...</sources>` with look-alike sanitization)
- Structured case draft generation (`gemini-3.5-flash` pinned, PO 2026-11-17) + Pydantic v2 / 3-color DFS DAG validation
- AI Reasoning / Challenge Support (max `1–2` rounds Socratic counter-questions, zero grading)

---

## Domain Structure

```text
ai-service/app/
├── main.py              ← FastAPI entry point (/health, /internal/v1/*)
├── core/                ← Config, X-Internal-API-Key security, logging, exceptions
├── providers/           ← LLM & embedding provider abstraction (factory.py, gemini, openai)
├── ingestion/           ← PDF/DOCX parser + chunker
├── retrieval/           ← Embeddings, pgvector retrieval & <sources> sanitization
├── generation/          ← Case generator + Pydantic tree schemas + 3-color DFS validator
├── challenge_support/   ← 2-round Socratic counter-question service & schemas
└── evaluation/          ← Auxiliary research evaluation utilities
```

---

## Local Setup & Verification

Python 3.12 is required (`uv venv -p python3.12` recommended; pinned wheels do not build on 3.13).

```bash
cd ai-service
python -m venv .venv
# Linux/macOS: source .venv/bin/activate
# Windows:     .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Unit tests (mock provider factory — no live API call)
pytest
```
