"""
EduBranch AI — Case Generation Router [BE-015].

Exposes internal generation endpoint:
  POST /internal/v1/generation/generate-case

Protected by X-Internal-API-Key. Handles structured exception mapping to standard HTTP status codes:
  - 504 Gateway Timeout for provider timeouts (AC-4, AC-8)
  - 503 Service Unavailable for transient retry exhaustion (AC-5, AC-6, AC-8)
  - 502 Bad Gateway for structural output validation failures (AC-3, AC-8)
  - 400 Bad Request for non-retryable 4xx provider failures (AC-7)
  - 409 Conflict for idempotency key parameter mismatches (AC-9)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.exceptions import (
    GenerationRetryExhaustedError,
    GenerationTimeoutError,
    GenerationValidationError,
    IdempotencyConflictError,
    NonRetryableProviderError,
)
from app.core.logging import logger
from app.core.security import verify_internal_api_key
from app.generation.schemas.requests import (
    CaseGenerationRequest,
    CaseGenerationResponse,
)
from app.generation.service import generate_case

router = APIRouter(
    tags=["Generation"],
    dependencies=[Depends(verify_internal_api_key)],
)


@router.post("/generate-case", response_model=CaseGenerationResponse)
async def generate_case_endpoint(request: CaseGenerationRequest):
    """
    Generate a Case Draft.
    This is an internal API protected by X-Internal-API-Key.
    """
    try:
        return await generate_case(request)
    except GenerationTimeoutError as e:
        logger.error("generation_api_timeout", error=str(e), course_id=str(request.course_id))
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"code": "GENERATION_TIMEOUT", "message": str(e)},
        )
    except GenerationRetryExhaustedError as e:
        logger.error("generation_api_retry_exhausted", error=str(e), course_id=str(request.course_id))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "RETRY_EXHAUSTED", "message": str(e)},
        )
    except GenerationValidationError as e:
        logger.error("generation_api_validation_failed", error=str(e), course_id=str(request.course_id))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"code": "INVALID_GENERATED_STRUCTURE", "message": str(e)},
        )
    except NonRetryableProviderError as e:
        logger.error("generation_api_non_retryable_error", error=str(e), course_id=str(request.course_id))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"code": "PROVIDER_FATAL_ERROR", "message": str(e)},
        )
    except IdempotencyConflictError as e:
        logger.error("generation_api_idempotency_conflict", error=str(e), idempotency_key=request.idempotency_key)
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "IDEMPOTENCY_CONFLICT", "message": str(e)},
        )
    except Exception as e:
        logger.error("generation_api_unexpected_failure", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "INTERNAL_GENERATION_ERROR", "message": str(e)},
        )
