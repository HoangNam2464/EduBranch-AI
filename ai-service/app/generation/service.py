"""
EduBranch AI — Case Generation Service Layer [BE-015].

Provides high-level functional facade for case generation, delegating
to the robust CaseGenerator engine with retry, timeout, DAG validation,
and idempotency controls.
"""

from app.generation.case_generator import (
    CaseGenerator,
    default_case_generator,
    generate_case_service,
)
from app.generation.schemas.requests import (
    CaseGenerationRequest,
    CaseGenerationResponse,
)


async def generate_case(request: CaseGenerationRequest) -> CaseGenerationResponse:
    """
    Generate a decision tree case based on requested materials and topic.
    Delegates to default_case_generator (CaseGenerator).
    """
    return await default_case_generator.generate(request)


__all__ = [
    "generate_case",
    "generate_case_service",
    "CaseGenerator",
    "default_case_generator",
]
