"""
EduBranch AI — AI Reasoning / Challenge Support Router.

Endpoint:
  POST /internal/v1/challenge-support/generate

Requires X-Internal-API-Key header (enforced by dependency injection).
Called exclusively by the NestJS Backend Gateway — never exposed directly.
"""

from fastapi import APIRouter, Depends, HTTPException, status

from app.challenge_support.schemas.requests import ChallengeRequest, ChallengeResponse
from app.challenge_support.assistant.service import generate_challenge_question
from app.core.security import verify_internal_api_key
from app.core.logging import logger

router = APIRouter(dependencies=[Depends(verify_internal_api_key)])


@router.post(
    "/generate",
    response_model=ChallengeResponse,
    summary="Generate AI Reasoning / Challenge Support counter-question",
    description=(
        "Generates ONE targeted counter-question based on the student's reasoning. "
        "Max 2 rounds per session. "
        "Does NOT grade, score, or determine pass/fail. "
        "For internal use by the NestJS Backend Gateway only."
    ),
)
async def generate_challenge(req: ChallengeRequest) -> ChallengeResponse:
    """
    POST /internal/v1/challenge-support/generate

    Generate a challenge counter-question for student reasoning.
    Supports both Branching Study (reasoning_id) and Review Study (review_submission_id).
    """
    logger.info(
        "challenge_support_request",
        session_id=str(req.session_id),
        round_number=req.round_number,
    )

    try:
        result = await generate_challenge_question(req)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error("challenge_support_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate challenge question",
        )
