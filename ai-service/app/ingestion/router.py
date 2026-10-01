"""
EduBranch AI — Ingestion Router.

Exposes the internal ingestion endpoint:
  POST /internal/v1/ingestion/process

Called by the NestJS Backend Gateway after a teaching material is uploaded.
Requires X-Internal-API-Key header.

Flow 1 implementation: Material Ingestion & RAG.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.logging import logger
from app.core.security import verify_internal_api_key
from app.core.exceptions import DocumentParsingException, EmbeddingException
from app.ingestion.service import ingest_document


router = APIRouter()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class IngestionRequest(BaseModel):
    """Request body for the document ingestion endpoint."""
    material_id: str = Field(..., description="UUID of the teaching_material record")
    s3_object_key: str = Field(..., description="MinIO object key (stored_object_key)")
    course_id: str = Field(..., description="UUID of the owning course (for tenant isolation)")
    mime_type: str = Field(
        ...,
        description="MIME type: application/pdf or application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )


class IngestionResponse(BaseModel):
    """Response body for a successful ingestion."""
    status: str
    chunk_count: int
    material_id: str


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.post(
    "/process",
    response_model=IngestionResponse,
    summary="Process and ingest a teaching material document",
    description=(
        "Downloads document from MinIO, parses text, chunks it, generates embeddings, "
        "and stores vectors in PostgreSQL/pgvector. "
        "Updates teaching_materials.processing_status to COMPLETED or FAILED."
    ),
)
async def process_document(
    body: IngestionRequest,
    _: str = Depends(verify_internal_api_key),
) -> IngestionResponse:
    """
    Full ingestion pipeline: MinIO → Parse → Chunk → Embed → pgvector.
    """
    logger.info(
        "ingestion_request_received",
        material_id=body.material_id,
        s3_key=body.s3_object_key,
        course_id=body.course_id,
        mime_type=body.mime_type,
    )

    try:
        result = await ingest_document(
            material_id=body.material_id,
            s3_object_key=body.s3_object_key,
            course_id=body.course_id,
            mime_type=body.mime_type,
        )
        return IngestionResponse(
            status=result["status"],
            chunk_count=result["chunk_count"],
            material_id=body.material_id,
        )

    except DocumentParsingException as e:
        logger.error("ingestion_parse_failure", material_id=body.material_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except EmbeddingException as e:
        logger.error("ingestion_embedding_failure", material_id=body.material_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Embedding generation failed: {e}",
        )
    except Exception as e:
        logger.error("ingestion_unexpected_error", material_id=body.material_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal ingestion error",
        )
