"""
EduBranch AI — Schema Validation Tests for AI Case Output (AC-1, BE-014 / QA-007).

Validates Pydantic schemas:
- CaseGenerationOutput, CaseNode, CaseOption
- Field constraints (min_length, required fields)
- Out-of-bounds reference validation
- JSON Schema generation (CASE_GENERATION_JSON_SCHEMA)
"""

import pytest
from pydantic import ValidationError

from app.generation.schemas.decision_tree import (
    CASE_GENERATION_JSON_SCHEMA,
    CaseGenerationOutput,
    CaseNode,
    CaseOption,
    NodeOutput,
    OptionOutput,
)
from app.generation.tree_validator import TreeValidationErrorCode


def test_valid_case_schema():
    """Verify CaseGenerationOutput instantiation with CaseNode and CaseOption."""
    case = CaseGenerationOutput(
        title="Valid Higher-Ed Case Study",
        description="A comprehensive business management case study for graduate students.",
        root_node_index=0,
        nodes=[
            CaseNode(
                situation="Initial dilemma: The board must decide whether to expand operations overseas.",
                options=[
                    CaseOption(
                        text="Expand to Southeast Asian markets immediately",
                        consequence="Operations begin in Vietnam with initial regulatory hurdles.",
                        next_node_index=1,
                    ),
                    CaseOption(
                        text="Delay expansion and conduct extensive feasibility study",
                        consequence="The board approves a 6-month research phase; market remains stable.",
                        next_node_index=None,
                    ),
                ],
            ),
            CaseNode(
                situation="Second phase: Local partners in Vietnam request joint-venture governance.",
                options=[
                    CaseOption(
                        text="Accept the joint-venture framework",
                        consequence="Successful collaboration with shared market risks.",
                        next_node_index=None,
                    ),
                ],
            ),
        ],
    )
    assert case.title == "Valid Higher-Ed Case Study"
    assert len(case.nodes) == 2
    assert case.root_node_index == 0
    assert not case.nodes[0].is_terminal
    assert not case.nodes[1].is_terminal


def test_schema_aliases_compatibility():
    """Ensure backward-compatible aliases NodeOutput and OptionOutput match CaseNode and CaseOption."""
    assert NodeOutput is CaseNode
    assert OptionOutput is CaseOption

    opt = OptionOutput(
        text="Sample choice text",
        consequence="Detailed outcome consequence text.",
        next_node_index=None,
    )
    assert isinstance(opt, CaseOption)
    assert opt.next_node_index is None

    node = NodeOutput(
        situation="A dilemma requiring student critical analysis and decision-making.",
        options=[opt],
    )
    assert isinstance(node, CaseNode)
    assert not node.is_terminal


def test_terminal_node_property():
    """Verify is_terminal property when a node has zero options."""
    terminal_node = CaseNode(
        situation="Terminal conclusion: The company successfully consolidated its core market.",
        options=[],
    )
    assert terminal_node.is_terminal is True


def test_min_length_validation_failures():
    """Verify field length constraints on title, description, situation, text, and consequence."""
    # 1. Title too short (< 5 chars)
    with pytest.raises(ValidationError) as exc:
        CaseGenerationOutput(
            title="Tiny",
            description="Valid long description that exceeds twenty characters.",
            nodes=[
                CaseNode(
                    situation="Valid situation text with more than twenty characters.",
                    options=[
                        CaseOption(
                            text="Valid option text",
                            consequence="Valid consequence text for student review.",
                            next_node_index=None,
                        )
                    ],
                ),
                CaseNode(situation="Second node situation with more than twenty characters.", options=[]),
            ],
        )
    assert "title" in str(exc.value)

    # 2. Description too short (< 20 chars)
    with pytest.raises(ValidationError) as exc:
        CaseGenerationOutput(
            title="Valid Case Title",
            description="Too short desc",
            nodes=[
                CaseNode(
                    situation="Valid situation text with more than twenty characters.",
                    options=[
                        CaseOption(
                            text="Valid option text",
                            consequence="Valid consequence text for student review.",
                            next_node_index=None,
                        )
                    ],
                ),
                CaseNode(situation="Second node situation with more than twenty characters.", options=[]),
            ],
        )
    assert "description" in str(exc.value)

    # 3. Situation text too short (< 20 chars)
    with pytest.raises(ValidationError) as exc:
        CaseNode(situation="Short dilemma", options=[])
    assert "situation" in str(exc.value)

    # 4. Option text too short (< 5 chars)
    with pytest.raises(ValidationError) as exc:
        CaseOption(text="Go", consequence="Valid consequence text.")
    assert "text" in str(exc.value)

    # 5. Consequence text too short (< 10 chars)
    with pytest.raises(ValidationError) as exc:
        CaseOption(text="Valid option", consequence="Bad")
    assert "consequence" in str(exc.value)


def test_out_of_bounds_root_node_index():
    """Verify validation error when root_node_index is out of range."""
    with pytest.raises(ValidationError) as exc:
        CaseGenerationOutput(
            title="Valid Case Title",
            description="Valid description with plenty of characters for higher education.",
            root_node_index=5,  # Out of range (only 2 nodes exist)
            nodes=[
                CaseNode(
                    situation="First situation with enough descriptive content.",
                    options=[
                        CaseOption(
                            text="Option A choice",
                            consequence="Consequence A outcome text.",
                            next_node_index=None,
                        )
                    ],
                ),
                CaseNode(situation="Second situation with enough descriptive content.", options=[]),
            ],
        )
    assert "root_node_index" in str(exc.value) or "INVALID_ROOT_INDEX" in str(exc.value)


def test_out_of_bounds_next_node_index():
    """Verify validation error when an option points to an index outside nodes array."""
    with pytest.raises(ValidationError) as exc:
        CaseGenerationOutput(
            title="Valid Case Title",
            description="Valid description with plenty of characters for higher education.",
            root_node_index=0,
            nodes=[
                CaseNode(
                    situation="First situation with enough descriptive content.",
                    options=[
                        CaseOption(
                            text="Option A choice",
                            consequence="Consequence A outcome text.",
                            next_node_index=99,  # Non-existent node
                        )
                    ],
                ),
                CaseNode(situation="Second situation with enough descriptive content.", options=[]),
            ],
        )
    assert "out-of-bounds" in str(exc.value) or "NODE_INDEX_OUT_OF_BOUNDS" in str(exc.value)


def test_minimum_nodes_requirement():
    """A decision tree must contain at least 2 nodes."""
    with pytest.raises(ValidationError) as exc:
        CaseGenerationOutput(
            title="Single Node Case",
            description="A case study cannot contain only a single isolated node.",
            root_node_index=0,
            nodes=[
                CaseNode(
                    situation="Only node in the entire case structure here.",
                    options=[],
                )
            ],
        )
    assert "at least 2" in str(exc.value)


def test_json_schema_structure():
    """Validate that CASE_GENERATION_JSON_SCHEMA contains required properties for structured LLM output."""
    schema = CASE_GENERATION_JSON_SCHEMA
    assert isinstance(schema, dict)
    assert "properties" in schema
    assert "title" in schema["properties"]
    assert "description" in schema["properties"]
    assert "nodes" in schema["properties"]
    assert "root_node_index" in schema["properties"]
    assert "required" in schema
    assert "title" in schema["required"]
    assert "nodes" in schema["required"]
