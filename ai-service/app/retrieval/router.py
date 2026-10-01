"""
EduBranch AI — Retrieval Router.

Exposes the internal retrieval endpoint:
  POST /internal/v1/retrieval/query

Called by the NestJS Backend Gateway during case generation or challenge support.
Requires X-Internal-API-Key header.

Flow 1 implementation: Material Ingestion & RAG.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.logging import logger
from app.core.security import verify_internal_api_key
from app.core.exceptions import RetrievalException
from app.retrieval.service import retrieve_chunks, build_rag_context, RetrievedChunk


router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class RetrievalRequest(BaseModel):
    """Request body for the RAG retrieval endpoint."""
    query: str = Field(..., min_length=1, description="Topic or query text to embed and search")
    course_id: str = Field(..., description="UUID of the course (enforces tenant isolation)")
    material_ids: list[str] | None = Field(
        default=None,
        description="Optional list of material UUIDs to restrict retrieval scope",
    )
    top_k: int = Field(default=5, ge=1, le=20, description="Number of chunks to return")
    include_rag_context: bool = Field(
        default=True,
        description="If True, assemble and return the <sources>...</sources> context string",
    )


class ChunkResult(BaseModel):
    """A single retrieved chunk."""
    chunk_id: str
    text: str
    similarity: float
    material_id: str
    chunk_index: int


class RetrievalResponse(BaseModel):
    """Response body for the retrieval endpoint."""
    chunks: list[ChunkResult]
    rag_context: str | None = Field(
        default=None,
        description="<sources>...</sources> context string ready for LLM prompts",
    )
    total_chunks: int


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post(
    "/query",
    response_model=RetrievalResponse,
    summary="Retrieve relevant document chunks for a query",
    description=(
        "Embeds the query text and performs top-K cosine similarity search over document_chunks "
        "filtered by course_id. Enforces tenant isolation. "
        "Returns chunk texts and optionally the <sources> RAG context string."
    ),
)
async def query_chunks(
    body: RetrievalRequest,
    _: str = Depends(verify_internal_api_key),
) -> RetrievalResponse:
    """
    RAG retrieval: embed query → pgvector cosine search → return top-K chunks.
    """
    logger.info(
        "retrieval_request_received",
        course_id=body.course_id,
        query_length=len(body.query),
        top_k=body.top_k,
        material_ids=body.material_ids,
    )

    try:
        chunks: list[RetrievedChunk] = await retrieve_chunks(
            query=body.query,
            course_id=body.course_id,
            material_ids=body.material_ids,
            top_k=body.top_k,
        )

        rag_context: str | None = None
        if body.include_rag_context:
            rag_context = build_rag_context(chunks)

        return RetrievalResponse(
            chunks=[
                ChunkResult(
                    chunk_id=c.chunk_id,
                    text=c.text,
                    similarity=c.similarity,
                    material_id=c.material_id,
                    chunk_index=c.chunk_index,
                )
                for c in chunks
            ],
            rag_context=rag_context,
            total_chunks=len(chunks),
        )

    except RetrievalException as e:
        logger.error("retrieval_failure", course_id=body.course_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Retrieval failed: {e}",
        )
    except Exception as e:
        logger.error("retrieval_unexpected_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal retrieval error",
        )
