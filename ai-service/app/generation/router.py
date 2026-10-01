"""
EduBranch AI — Case Generation Router.
"""
from fastapi import APIRouter, Depends
from app.generation.schemas.requests import CaseGenerationRequest, CaseGenerationResponse
from app.generation.service import generate_case
from app.core.security import verify_internal_api_key

router = APIRouter(
    tags=["Generation"],
    dependencies=[Depends(verify_internal_api_key)]
)

@router.post("/generate-case", response_model=CaseGenerationResponse)
async def generate_case_endpoint(request: CaseGenerationRequest):
    """
    Generate a Case Draft.
    This is an internal API protected by X-Internal-API-Key.
    """
    return await generate_case(request)
