---
description: Rules for the RAG pipeline in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: RAG Pipeline

## Scope
FastAPI `ai-service/` — `ingestion/`, `retrieval/`, `generation/` packages.
Full Mermaid architecture & step specification: [`docs/ai/RAG-PIPELINE.md`](../../docs/ai/RAG-PIPELINE.md).

## Included
- PDF parsing (`PyPDF`) and DOCX parsing (`python-docx`)
- Recursive text chunking with overlap (`LangChain RecursiveCharacterTextSplitter`, default 512 / overlap 64)
- Embedding generation (`gemini-embedding-001` @768 primary; OpenAI via `app/providers/factory.py`)
- pgvector storage (`document_chunks.embedding vector(768)` per V4) with source metadata (`document_id`, `chunk_index`, `page_number`)
- Top-K semantic retrieval filtered strictly by `course_id` and optional `material_ids`
- Citation/provenance tracking (`source_chunk_id → document_id → material`)

## Excluded
- BM25 or hybrid retrieval — not in MVP
- Multi-step retrieval or query expansion — not in MVP
- Reranking or cross-encoders — not in MVP

## Security — CRITICAL
- Retrieved chunks are UNTRUSTED DATA (`BR-RAG-01`)
- ALL retrieved content MUST be placed inside `<sources>...</sources>` boundary in the prompt, with tag look-alikes neutralized (`app/retrieval/service.py`)
- Retrieved content MUST NOT be concatenated raw into system instructions or allowed to override instructions

## Testing Expectations
- Unit tests for chunking (chunk size and overlap)
- Unit tests confirming `<sources>` boundary wrapping and tag neutralization in prompts
- Integration test for embedding → pgvector course-isolated retrieval roundtrip (mocking provider in unit CI)
