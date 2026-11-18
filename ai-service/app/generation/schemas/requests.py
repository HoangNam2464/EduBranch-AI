"""
EduBranch AI — Case Generation API Request/Response Schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
import uuid


class CaseGenerationRequest(BaseModel):
    """Request body for POST /generation/cases."""

    material_ids: list[uuid.UUID] = Field(
        ...,
        description="IDs of teaching materials to retrieve context from.",
        min_length=1,
    )
    course_id: uuid.UUID = Field(..., description="Course context ID.")
    topic_hint: Optional[str] = Field(
        None,
        description="Optional topic or scenario hint from the lecturer.",
    )
    num_nodes: int = Field(
        default=4,
        description="Approximate number of decision nodes to generate.",
        ge=2,
        le=10,
    )
    idempotency_key: Optional[str] = Field(
        None,
        description="Optional client-provided idempotency key to prevent duplicate case generation upon retries.",
    )


class CaseGenerationResponse(BaseModel):
    """Response body for a successful case generation."""

    case_id: Optional[uuid.UUID] = Field(None, description="Assigned by Backend Gateway after persistence.")
    title: str
    description: str
    root_node_index: int
    nodes: list[dict]  # Serialized NodeOutput list
    source_chunks: list[str] = Field(
        default_factory=list,
        description="IDs of source document chunks used during generation (for citation).",
    )
    idempotent_replay: bool = Field(
        default=False,
        description="Indicates whether this response was served from the idempotency cache.",
    )
