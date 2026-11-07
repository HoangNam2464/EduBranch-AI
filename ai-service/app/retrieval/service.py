"""
EduBranch AI — Retrieval Service Layer [BE-012].

Coordinates semantic search and prompt-safe context formatting via VectorRetriever:
  - Cosine similarity search over PostgreSQL pgvector (AC-1)
  - Course-level tenant isolation enforcement (AC-2)
  - <sources>...</sources> untrusted boundary wrapping (AC-3, AC-4)

Traceability:
  - Master Task ID: EBA-215
  - Jira Key: BE-012
  - Sprint: Sprint 2 (Material & RAG)
"""

from typing import Sequence

from app.providers.factory import get_provider
from app.retrieval.retriever import RetrievedChunk, VectorRetriever


async def retrieve_chunks(
    query: str,
    course_id: str,
    material_ids: list[str] | None = None,
    top_k: int | None = None,
) -> list[RetrievedChunk]:
    """
    AC-1, AC-2: High-level retrieval helper.
    Retrieves top-K chunks for course_id with optional material_ids scoping.
    """
    provider = get_provider()
    retriever = VectorRetriever(provider=provider)
    return await retriever.retrieve(
        query=query,
        course_id=course_id,
        material_ids=material_ids,
        top_k=top_k,
    )


def build_rag_context(chunks: Sequence[RetrievedChunk]) -> str:
    """
    AC-3: Formats retrieved chunks inside <sources>...</sources> tags.
    """
    return VectorRetriever.wrap_untrusted_sources(chunks)


__all__ = [
    "RetrievedChunk",
    "VectorRetriever",
    "get_provider",
    "retrieve_chunks",
    "build_rag_context",
]
