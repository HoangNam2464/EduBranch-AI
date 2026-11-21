"""
EduBranch AI — Decision Tree Case JSON Schema and Pydantic Models.

These Pydantic models define the STRUCTURED OUTPUT contract for the AI Case Generator.
The LLM produces output conforming to this schema, which is validated by the AI service
before persistence or forwarding to the Backend Gateway (NestJS).

Domain Entities:
  CaseGenerationOutput
    └── nodes: list[CaseNode] (alias: NodeOutput)
           └── options: list[CaseOption] (alias: OptionOutput)
                    └── next_node_index: int | None (index into nodes array)

Invariants enforced at validation:
  - root_node_index must be a valid 0-based index.
  - At least one terminal node (len(options)==0) or terminal path (option with next_node_index=None).
  - No orphan nodes (every non-root node reachable from root_node_index).
  - No cycles or self-loops (enforced by 3-color DFS graph validation).
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field, model_validator

from app.generation.tree_validator import (
    TreeValidationError,
    TreeValidationErrorCode,
    TreeValidationIssue,
    validate_decision_tree_graph,
)


class CaseOption(BaseModel):
    """
    A decision option available at a decision node in the branching scenario.
    """

    text: str = Field(
        ...,
        description="The decision choice text presented to the student.",
        min_length=5,
    )
    consequence: str = Field(
        ...,
        description="The consequence associated with this option, revealed retrospectively to the student during Journey Review.",
        min_length=10,
    )
    next_node_index: Optional[int] = Field(
        None,
        description="0-based index into the nodes array for the next node. None represents a terminal path.",
        ge=0,
    )
    option_id: Optional[str] = Field(
        None,
        description="Optional client or database identifier for the option.",
    )


# Backward-compatible alias for existing imports
OptionOutput = CaseOption


class CaseNode(BaseModel):
    """
    A decision or situation node in the branching case study.
    """

    situation: str = Field(
        ...,
        description="The scenario or dilemma description presented to the student at this decision point.",
        min_length=20,
    )
    options: list[CaseOption] = Field(
        default_factory=list,
        description="List of decision options available at this node. An empty list denotes a terminal outcome node.",
    )
    node_id: Optional[str] = Field(
        None,
        description="Optional client or database identifier for the node.",
    )
    node_index: Optional[int] = Field(
        None,
        description="Optional index of the node within the case structure.",
        ge=0,
    )

    @property
    def is_terminal(self) -> bool:
        """A node is terminal if it has no outgoing decision options."""
        return len(self.options) == 0


# Backward-compatible alias for existing imports
NodeOutput = CaseNode


class CaseGenerationOutput(BaseModel):
    """
    Structured output contract for the EduBranch AI Case Generator.

    Validated by the AI service before forwarding to the Backend Gateway (NestJS).
    Enforces graph theory invariants (no cycles, reachability, terminal path).
    """

    title: str = Field(..., description="Case study title.", min_length=5)
    description: str = Field(..., description="Brief description of the case scenario and learning context.", min_length=20)
    root_node_index: int = Field(
        0,
        description="Index of the root node in the nodes array. Defaults to 0.",
        ge=0,
    )
    nodes: list[CaseNode] = Field(
        ...,
        description="All nodes belonging to this decision tree.",
        min_length=2,
    )

    @model_validator(mode="after")
    def validate_tree_structure(self) -> CaseGenerationOutput:
        """
        Validate the decision tree structure against DAG and pedagogical invariants.
        Delegates graph validation to the dedicated TreeValidator (3-color DFS).
        """
        validate_decision_tree_graph(
            nodes=self.nodes,
            root_node_index=self.root_node_index,
            strict_option_bounds=False,
        )
        return self


# JSON Schema for LLM structured output (passed to provider.generate_structured)
CASE_GENERATION_JSON_SCHEMA = CaseGenerationOutput.model_json_schema()

__all__ = [
    "CaseOption",
    "CaseNode",
    "CaseGenerationOutput",
    "OptionOutput",
    "NodeOutput",
    "TreeValidationError",
    "TreeValidationErrorCode",
    "TreeValidationIssue",
    "validate_decision_tree_graph",
    "CASE_GENERATION_JSON_SCHEMA",
]
