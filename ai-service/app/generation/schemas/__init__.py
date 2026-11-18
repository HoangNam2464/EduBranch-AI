"""
EduBranch AI — Case Generation Schemas Package.
"""

from app.generation.schemas.decision_tree import (
    CASE_GENERATION_JSON_SCHEMA,
    CaseGenerationOutput,
    CaseNode,
    CaseOption,
    NodeOutput,
    OptionOutput,
    TreeValidationError,
    TreeValidationErrorCode,
    TreeValidationIssue,
    validate_decision_tree_graph,
)
from app.generation.schemas.requests import (
    CaseGenerationRequest,
    CaseGenerationResponse,
)

__all__ = [
    "CaseGenerationOutput",
    "CaseNode",
    "CaseOption",
    "NodeOutput",
    "OptionOutput",
    "CaseGenerationRequest",
    "CaseGenerationResponse",
    "TreeValidationError",
    "TreeValidationErrorCode",
    "TreeValidationIssue",
    "validate_decision_tree_graph",
    "CASE_GENERATION_JSON_SCHEMA",
]
