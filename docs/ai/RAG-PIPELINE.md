# EduBranch AI — RAG Pipeline

> - **Document Class**: `[LIVING ARCHITECTURE / OPS SPEC]` — **SSOT for Document Ingestion & Grounded Retrieval**
> - **Implementation Status**: Implemented (Internal FastAPI AI Service — `ingestion/`, `retrieval/`, `generation/`)

---

## Pipeline Overview

```mermaid
flowchart TD
    subgraph Ingestion ["Phase A: Material Ingestion (/internal/v1/ingestion/process)"]
        TM["TeachingMaterial\n(PDF / DOCX in MinIO)"] --> Parse["1. DocumentParser\n(PyPDF / python-docx)"]
        Parse --> Chunk["2. DocumentChunker\n(LangChain RecursiveCharacterTextSplitter\n512 tokens, 64 overlap)"]
        Chunk --> Embed["3. EmbeddingGeneration\n(gemini-embedding-001 @768 via factory.py)"]
        Embed --> Store[("4. PostgreSQL + pgvector\ndocument_chunks vector(768) HNSW")]
    end

    subgraph Retrieval ["Phase B: Grounded Case Generation (/internal/v1/generation/generate-case)"]
        Topic["Lecturer Topic & materialIds"] --> QEmbed["5. Query Embedding\n(same 768-dim model)"]
        QEmbed --> Filter["6. Course-Isolated Top-K Retrieval\nWHERE course_id = :course_id\nORDER BY embedding <=> query LIMIT 5"]
        Store -.-> Filter
        Filter --> Prompt["7. Prompt Assembly + Tag Neutralization\nSystem Instructions + sources XML + User Prompt"]
        Prompt --> Gen["8. LLM Generation\n(gemini-3.5-flash via factory.py)"]
        Gen --> Valid["9. Pydantic CaseGenerationOutput\n+ 3-Color DFS Cycle Validation"]
        Valid --> Return["10. Return Draft JSON to Backend Gateway"]
    end
```

## Security Rules

- Retrieved chunks are UNTRUSTED DATA from uploaded documents
- ALL retrieved content MUST be enclosed in `<sources>...</sources>` boundary
- The boundary prevents source content from overriding system instructions (prompt injection mitigation)
- Never concatenate raw source text directly into the system prompt
- User-provided topic hints must be validated and sanitized

## Citation / Provenance

Each generated case should track which source chunks were used:
- `source_chunk_id` → `document_chunk.id`
- `document_id` → `teaching_material.id`
- `page_number` (if available from parser)

This enables citation traceability: case content → source chunk → original document.

## MVP Scope

- Basic top-K cosine similarity retrieval
- No reranking, BM25, query expansion, or multi-step retrieval in MVP
- Metadata filtering by course/material IDs
