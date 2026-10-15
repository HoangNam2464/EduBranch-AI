-- ==============================================================================
-- EduBranch-AI — V4 Migration: document_chunks table for pgvector RAG
-- Source of Truth: FEATURE-DOCUMENT-PROCESSING-AND-RAG.md (FR-RAG-04)
-- ==============================================================================
-- Creates the document_chunks table required for the Material Ingestion & RAG
-- pipeline (Flow 1). Stores text chunks with 768-dim embeddings (Gemini
-- text-embedding-004) or 1536-dim embeddings (OpenAI text-embedding-3-small).
--
-- The vector dimension stored here uses 768 to match Gemini text-embedding-004
-- (the default provider). If the deployment switches to OpenAI, the column
-- can be altered. A constraint is not enforced to support both providers
-- at migration time.
-- ==============================================================================

-- document_chunks: one row per text chunk extracted from a teaching material
CREATE TABLE document_chunks (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id   UUID NOT NULL REFERENCES teaching_materials(id) ON DELETE CASCADE,
    course_id     UUID NOT NULL REFERENCES courses(id),
    chunk_index   INTEGER NOT NULL,
    chunk_text    TEXT NOT NULL,
    -- 768-dim for Gemini text-embedding-004; use vector(1536) for OpenAI
    embedding     vector(768) NOT NULL,
    page_number   INTEGER,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for approximate cosine similarity search (pgvector >= 0.5.0)
CREATE INDEX idx_document_chunks_embedding
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops);

-- Supporting filter indexes for tenant isolation and material lookup
CREATE INDEX idx_document_chunks_material_id ON document_chunks(material_id);
CREATE INDEX idx_document_chunks_course_id   ON document_chunks(course_id);

-- Composite index: typical query pattern is WHERE course_id = X AND material_id = ANY(...)
CREATE INDEX idx_document_chunks_course_material ON document_chunks(course_id, material_id);
