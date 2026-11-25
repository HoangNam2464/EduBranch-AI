# EduBranch AI — System Architecture

> - **Document Class**: `[LIVING ARCHITECTURE / OPS SPEC]` · **Diagram SSOT**: Canonical 3-Tier Topology Diagram
> - **Implementation Status**: Core 3-Tier Architecture Active on `develop` (see [`docs/PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md) for per-feature status and open items)

---

## High-Level 3-Tier Architecture (Canonical Diagram)

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        FE["React 19 SPA + TypeScript + TailwindCSS v4\n• ReactFlow Decision Tree Editor (Case Review)\n• Lecturer Studio & Student Learning Players\n• Calls ONLY /api/v1/* via apiClient"]
    end

    subgraph Gateway ["Backend Gateway (Node.js 20 LTS + NestJS 10)"]
        BG["NestJS REST API Gateway\n• Auth, JWT & RBAC (LECTURER / STUDENT / ADMIN)\n• Courses, Enrollments & Material Metadata\n• Case Lifecycle & DAG Validation (Two Learning Modes)\n• Attempts, Retrospective Reasoning & Reflections\n• Review Submissions, Feedback & Statistics\n• Challenge Support Orchestrator (Max 2 Rounds)"]
    end

    subgraph Storage ["Persistence, Cache & Object Storage"]
        PG[("PostgreSQL 16 + pgvector\nRelational Schema V1..V5 & vector(768)")]
        REDIS[("Redis 7\nCache & Session Store")]
        MINIO[("MinIO Object Storage\nPDF / DOCX Teaching Materials")]
    end

    subgraph InternalAI ["AI Service (Python 3.12 + FastAPI — Internal Only)"]
        AI["FastAPI AI / RAG Service\n• PDF / DOCX Parsing & LangChain Chunking\n• Gemini Embedding Generation (768 dims)\n• Course-Scoped pgvector Retrieval + sources Wrapper\n• Structured Case Draft Generation + 3-Color DFS\n• 2-Round Socratic Challenge Support"]
    end

    subgraph Providers ["External LLM Providers"]
        LLM["Gemini 3.5 Flash / OpenAI GPT-4o-mini\n(via app/providers/factory.py)"]
    end

    FE -->|"HTTPS REST + JWT"| BG
    BG -->|"Parameterized SQL (pg Pool)"| PG
    BG -->|"Cache / Rate Limit"| REDIS
    BG -->|"S3 Object Stream"| MINIO
    BG -->|"Internal HTTP + X-Internal-API-Key"| AI
    AI -->|"pgvector Cosine Retrieval"| PG
    AI -->|"Structured Prompt + sources"| LLM
```

## Architecture Principles

1. **Frontend → Backend only**: React communicates exclusively with the Backend Gateway via REST API; it never calls FastAPI directly.
2. **FastAPI is internal**: Never exposed to the public internet; requires `X-Internal-API-Key` authentication.
3. **Untrusted document content**: Retrieved chunks always wrapped in `<sources>...</sources>` boundary.
4. **Human-in-the-loop**: All AI-generated cases start as `DRAFT`; a lecturer must explicitly approve before publication.
5. **AI does not grade**: Challenge Support generates targeted counter-questions only (no grades, no scores, no pass/fail).

## See Also

- [ADR-001-TECHNOLOGY-STACK.md](ADR-001-TECHNOLOGY-STACK.md)
- [SERVICE-BOUNDARIES.md](SERVICE-BOUNDARIES.md)
- [DATA-FLOW.md](DATA-FLOW.md)
