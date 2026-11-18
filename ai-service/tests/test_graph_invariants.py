"""
EduBranch AI — Graph Invariants & 3-Color DFS Validator Test Suite (AC-2, AC-3, BE-014 / QA-008).

Tests:
- 3-Color DFS cycle detection (self-loops, 2-node cycles, 3-node cycles, deep branch cycles)
- Complex valid DAGs (diamond graph, branching and converging paths without directed cycles)
- Reachability & Orphan nodes detection (unreachable nodes from root)
- Terminal path invariants (reachable terminal outcomes)
- Structured error handling (TreeValidationError, TreeValidationIssue, error codes, to_dict())
- Option bounds validation (strict 2-4 options constraint)
"""

import pytest
from pydantic import ValidationError

from app.generation.schemas.decision_tree import (
    CaseGenerationOutput,
    CaseNode,
    CaseOption,
)
from app.generation.tree_validator import (
    TreeValidationError,
    TreeValidationErrorCode,
    TreeValidationIssue,
    TreeValidator,
    validate_decision_tree_graph,
)


def _opt(text: str, next_idx: int | None = None) -> CaseOption:
    """Helper to create minimal valid options."""
    return CaseOption(
        text=text if len(text) >= 5 else f"{text} choice",
        consequence="Valid consequence text for testing.",
        next_node_index=next_idx,
    )


def _node(situation: str, options: list[CaseOption] | None = None) -> CaseNode:
    """Helper to create minimal valid nodes."""
    return CaseNode(
        situation=situation if len(situation) >= 20 else f"{situation} with sufficient academic padding.",
        options=options or [],
    )


# ==============================================================================
# 1. 3-Color DFS Cycle Detection Tests (AC-2)
# ==============================================================================


def test_dfs_rejects_self_loop():
    """Verify 3-color DFS immediately rejects self-loop (node pointing to itself)."""
    nodes = [
        _node("Root node with self loop", [_opt("Self loop option", 0), _opt("Exit option", None)]),
        _node("Second unreachable node", []),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.CYCLE_DETECTED
    assert "Self-loop" in err.message or "Cycle detected" in err.message
    assert err.issues[0].node_index == 0


def test_dfs_rejects_two_node_cycle():
    """Verify 3-color DFS rejects 2-node mutual cycle (0 -> 1 -> 0)."""
    nodes = [
        _node("Root node pointing to node 1", [_opt("To node 1", 1), _opt("Exit path", None)]),
        _node("Node 1 pointing back to node 0", [_opt("Back to node 0", 0)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.CYCLE_DETECTED
    assert "Cycle detected" in err.message
    assert err.issues[0].cycle_path is not None
    assert 0 in err.issues[0].cycle_path


def test_dfs_rejects_three_node_cycle():
    """Verify 3-color DFS rejects 3-node cycle (0 -> 1 -> 2 -> 0)."""
    nodes = [
        _node("Root node 0", [_opt("To node 1", 1), _opt("Terminal exit", None)]),
        _node("Node 1", [_opt("To node 2", 2)]),
        _node("Node 2", [_opt("Back to root node 0", 0)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.CYCLE_DETECTED
    assert err.issues[0].cycle_path == [0, 1, 2, 0]


def test_dfs_rejects_deep_cycle_in_branch():
    """Verify 3-color DFS rejects cycle deep inside a child branch (0 -> 1 -> 2 -> 3 -> 2)."""
    nodes = [
        _node("Root node 0", [_opt("To branch 1", 1), _opt("Terminal exit", None)]),
        _node("Branch node 1", [_opt("To node 2", 2)]),
        _node("Cycle node 2", [_opt("To node 3", 3)]),
        _node("Cycle node 3", [_opt("Loop back to node 2", 2)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.CYCLE_DETECTED
    assert err.issues[0].cycle_path == [2, 3, 2]


def test_valid_converging_dag_is_accepted():
    """
    Verify that a Directed Acyclic Graph (DAG) with converging branches (diamond pattern)
    passes validation because multiple paths to the same node are valid as long as there is NO cycle.
    Path A: 0 -> 1 -> 3
    Path B: 0 -> 2 -> 3
    Terminal: 3 has terminal options
    """
    nodes = [
        _node("Root node 0 branching into 1 and 2", [_opt("Take Path A", 1), _opt("Take Path B", 2)]),
        _node("Node 1 (Path A) converging to 3", [_opt("Converge to 3", 3)]),
        _node("Node 2 (Path B) converging to 3", [_opt("Converge to 3", 3)]),
        _node("Node 3 terminal synthesis", [_opt("Final outcome", None)]),
    ]
    issues = validate_decision_tree_graph(nodes=nodes, root_node_index=0)
    assert len(issues) == 0


# ==============================================================================
# 2. Reachability & Orphan Nodes Tests (AC-3)
# ==============================================================================


def test_orphan_node_rejected():
    """Verify that any node unreachable from the root is detected as an orphan."""
    nodes = [
        _node("Root node 0 pointing to terminal directly", [_opt("Complete case", None)]),
        _node("Orphan node 1 with no incoming edges", [_opt("Isolated choice", None)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.ORPHAN_NODE
    assert "Orphan node detected" in err.message
    assert err.issues[0].node_index == 1


def test_multiple_orphan_nodes_detected():
    """Verify that multiple disconnected nodes are all flagged."""
    nodes = [
        _node("Root node 0 pointing to terminal", [_opt("Complete case", None)]),
        _node("Orphan 1", [_opt("Orphan edge", 2)]),
        _node("Orphan 2", [_opt("Orphan terminal", None)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.ORPHAN_NODE
    orphan_indices = [issue.node_index for issue in err.issues if issue.code == TreeValidationErrorCode.ORPHAN_NODE]
    assert 1 in orphan_indices
    assert 2 in orphan_indices


# ==============================================================================
# 3. Terminal Path Invariants Tests (AC-3)
# ==============================================================================


def test_missing_terminal_path_rejected():
    """Verify that a graph with no terminal paths is rejected."""
    # A graph where node 0 -> 1, and node 1 -> 0 (no terminal candidate anywhere)
    nodes = [
        _node("Root node 0 pointing to 1", [_opt("To node 1", 1)]),
        _node("Node 1 pointing to 0", [_opt("To node 0", 0)]),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    err = exc_info.value
    assert err.code == TreeValidationErrorCode.NO_TERMINAL_PATH


def test_unreachable_terminal_node_rejected():
    """
    Verify that if a terminal node exists in the array but is NOT reachable from root,
    the tree is rejected because the root has no terminal path (and orphan node exists).
    """
    nodes = [
        _node("Root node 0 with self loop candidate", [_opt("Self loop", 0)]),
        _node("Terminal node 1 that is unreachable", []),
    ]
    with pytest.raises(TreeValidationError) as exc_info:
        validate_decision_tree_graph(nodes=nodes, root_node_index=0)

    # Either cycle or orphan/terminal error is caught
    assert exc_info.value.code in (
        TreeValidationErrorCode.CYCLE_DETECTED,
        TreeValidationErrorCode.NO_TERMINAL_PATH,
        TreeValidationErrorCode.ORPHAN_NODE,
    )


def test_multiple_terminal_paths_accepted():
    """Verify that trees with multiple valid terminal paths pass validation."""
    nodes = [
        _node("Root node 0", [_opt("Branch to terminal 1", 1), _opt("Branch to terminal 2", 2)]),
        _node("Terminal Node 1 (no options)", []),
        _node("Terminal Node 2 (terminal option)", [_opt("Terminal Option Outcome", None)]),
    ]
    issues = validate_decision_tree_graph(nodes=nodes, root_node_index=0)
    assert len(issues) == 0


# ==============================================================================
# 4. Structured Error & Serialization Tests
# ==============================================================================


def test_tree_validation_error_to_dict():
    """Verify TreeValidationError.to_dict() returns structured, serializable error details."""
    issue = TreeValidationIssue(
        code=TreeValidationErrorCode.CYCLE_DETECTED,
        message="Cycle detected in decision tree: node[0] -> node[1] -> node[0]",
        node_index=1,
        target_node_index=0,
        cycle_path=[0, 1, 0],
        details={"step": "dfs_visit"},
    )
    err = TreeValidationError(
        message=issue.message,
        issues=[issue],
        code=issue.code,
    )

    payload = err.to_dict()
    assert payload["error"] == "TreeValidationError"
    assert payload["code"] == "CYCLE_DETECTED"
    assert payload["message"] == issue.message
    assert len(payload["issues"]) == 1
    assert payload["issues"][0]["code"] == "CYCLE_DETECTED"
    assert payload["issues"][0]["cycle_path"] == [0, 1, 0]
    assert payload["issues"][0]["node_index"] == 1


# ==============================================================================
# 5. Strict Option Bounds Tests (FND §5: 2 to 4 options for non-terminal)
# ==============================================================================


def test_strict_option_bounds_rejected_when_too_few():
    """In strict mode, a non-terminal node with fewer than 2 options must be rejected."""
    nodes = [
        _node("Root node with only 1 option", [_opt("Only single option", 1)]),
        _node("Terminal node", []),
    ]
    validator = TreeValidator(nodes=nodes, root_node_index=0, strict_option_bounds=True)
    with pytest.raises(TreeValidationError) as exc_info:
        validator.validate()

    assert exc_info.value.code == TreeValidationErrorCode.INVALID_OPTION_COUNT
    assert "between 2 and 4 options" in exc_info.value.message


def test_strict_option_bounds_rejected_when_too_many():
    """In strict mode, a non-terminal node with more than 4 options must be rejected."""
    five_options = [_opt(f"Choice {i}", 1) for i in range(5)]
    nodes = [
        _node("Root node with 5 options", five_options),
        _node("Terminal node", []),
    ]
    validator = TreeValidator(nodes=nodes, root_node_index=0, strict_option_bounds=True)
    with pytest.raises(TreeValidationError) as exc_info:
        validator.validate()

    assert exc_info.value.code == TreeValidationErrorCode.INVALID_OPTION_COUNT
    assert "between 2 and 4 options" in exc_info.value.message


def test_strict_option_bounds_passes_with_three_options():
    """In strict mode, non-terminal node with 3 options passes."""
    three_options = [_opt("Choice 1", 1), _opt("Choice 2", 1), _opt("Choice 3", 1)]
    nodes = [
        _node("Root node with 3 options", three_options),
        _node("Terminal node", []),
    ]
    validator = TreeValidator(nodes=nodes, root_node_index=0, strict_option_bounds=True)
    issues = validator.validate()
    assert len(issues) == 0
