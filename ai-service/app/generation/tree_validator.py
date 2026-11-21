"""
EduBranch AI — Decision Tree Graph Validator & Invariants Engine.

Implements graph theory invariants for university-level case study decision trees:
1. DFS 3-Color cycle detection (WHITE=0, GRAY=1, BLACK=2) to reject cycles and self-loops.
2. Root node existence and validity.
3. Reachability validation (reject orphan / unreachable nodes from root).
4. Terminal path existence (at least one reachable terminal outcome).
5. Node reference bounds checking.
6. Structured validation errors for API and client consumption.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, Optional, Protocol, Sequence
from pydantic import BaseModel, Field


class TreeValidationErrorCode(str, Enum):
    """Canonical error codes for decision tree graph validation."""

    EMPTY_TREE = "EMPTY_TREE"
    INVALID_ROOT_INDEX = "INVALID_ROOT_INDEX"
    NODE_INDEX_OUT_OF_BOUNDS = "NODE_INDEX_OUT_OF_BOUNDS"
    CYCLE_DETECTED = "CYCLE_DETECTED"
    ORPHAN_NODE = "ORPHAN_NODE"
    NO_TERMINAL_PATH = "NO_TERMINAL_PATH"
    INVALID_OPTION_COUNT = "INVALID_OPTION_COUNT"
    SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR"


class TreeValidationIssue(BaseModel):
    """Structured detail for an invariant violation in the decision tree."""

    code: TreeValidationErrorCode = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable description of the violation")
    node_index: Optional[int] = Field(None, description="Source node index where violation occurred")
    target_node_index: Optional[int] = Field(None, description="Target node index if reference violation")
    cycle_path: Optional[list[int]] = Field(None, description="Cycle path sequence if cycle was detected")
    details: Optional[dict[str, Any]] = Field(default_factory=dict, description="Additional context payload")


class TreeValidationError(ValueError):
    """
    Structured exception raised when decision tree graph invariants fail.

    Inherits from ValueError for seamless compatibility with Pydantic model_validator
    and standard exception handling.
    """

    def __init__(
        self,
        message: str,
        issues: Optional[list[TreeValidationIssue]] = None,
        code: Optional[TreeValidationErrorCode] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.issues = issues or []
        self.code = code or (self.issues[0].code if self.issues else TreeValidationErrorCode.SCHEMA_VALIDATION_ERROR)

    def to_dict(self) -> dict[str, Any]:
        """Convert the error into a structured JSON-serializable dictionary."""
        return {
            "error": "TreeValidationError",
            "code": self.code.value if isinstance(self.code, TreeValidationErrorCode) else str(self.code),
            "message": self.message,
            "issues": [issue.model_dump() for issue in self.issues],
        }

    def __repr__(self) -> str:
        return f"TreeValidationError(code={self.code}, message={self.message!r}, issues_count={len(self.issues)})"


class OptionLike(Protocol):
    """Protocol representing a decision option."""

    next_node_index: Optional[int]


class NodeLike(Protocol):
    """Protocol representing a decision tree node."""

    options: Sequence[OptionLike]


class TreeValidator:
    """
    Validates directed graph invariants for branching decision trees using DFS 3-Color.
    """

    # 3-Color DFS States
    COLOR_WHITE = 0  # Unvisited
    COLOR_GRAY = 1   # Visiting (currently in recursion stack)
    COLOR_BLACK = 2  # Visited (fully explored, no cycles reachable from here)

    def __init__(
        self,
        nodes: Sequence[Any],
        root_node_index: int = 0,
        strict_option_bounds: bool = False,
    ) -> None:
        self.nodes = nodes
        self.root_node_index = root_node_index
        self.strict_option_bounds = strict_option_bounds
        self.n = len(nodes)
        self.issues: list[TreeValidationIssue] = []

    def validate(self) -> list[TreeValidationIssue]:
        """
        Execute full validation pipeline. Returns list of issues.
        Raises TreeValidationError on the first critical violation or collects all issues.
        """
        self.issues.clear()

        # 1. Basic tree size bounds
        if self.n < 2:
            self._add_issue(
                TreeValidationErrorCode.EMPTY_TREE,
                f"Decision tree must contain at least 2 nodes, found {self.n}",
            )
            raise TreeValidationError(self.issues[0].message, issues=self.issues, code=self.issues[0].code)

        # 2. Root node bounds
        if self.root_node_index < 0 or self.root_node_index >= self.n:
            self._add_issue(
                TreeValidationErrorCode.INVALID_ROOT_INDEX,
                f"root_node_index={self.root_node_index} is out of range (total nodes={self.n})",
                node_index=self.root_node_index,
            )
            raise TreeValidationError(self.issues[0].message, issues=self.issues, code=self.issues[0].code)

        # 3. Reference bounds check on all options
        for u, node in enumerate(self.nodes):
            opts = getattr(node, "options", [])
            for opt in opts:
                v = getattr(opt, "next_node_index", None)
                if v is not None:
                    if v < 0 or v >= self.n:
                        self._add_issue(
                            TreeValidationErrorCode.NODE_INDEX_OUT_OF_BOUNDS,
                            f"Node {u} option references out-of-bounds next_node_index={v} (total nodes={self.n})",
                            node_index=u,
                            target_node_index=v,
                        )

            # Strict option bounds check if requested (FND §5: 2 to 4 options for non-terminal)
            if self.strict_option_bounds:
                is_terminal_node = len(opts) == 0
                if not is_terminal_node and len(opts) not in (2, 3, 4):
                    self._add_issue(
                        TreeValidationErrorCode.INVALID_OPTION_COUNT,
                        f"Non-terminal node {u} must have between 2 and 4 options, found {len(opts)}",
                        node_index=u,
                        details={"options_count": len(opts)},
                    )

        if self.issues:
            raise TreeValidationError(self.issues[0].message, issues=self.issues, code=self.issues[0].code)

        # 3b. Pre-check: Ensure tree has at least one terminal node or option candidate
        has_terminal_candidate = any(
            len(getattr(node, "options", [])) == 0
            or any(getattr(opt, "next_node_index", None) is None for opt in getattr(node, "options", []))
            for node in self.nodes
        )
        if not has_terminal_candidate:
            self._add_issue(
                TreeValidationErrorCode.NO_TERMINAL_PATH,
                "Decision tree must have at least one terminal path (option with next_node_index=None or node with no options)",
                node_index=self.root_node_index,
            )
            raise TreeValidationError(
                "Decision tree must have at least one terminal path (option with next_node_index=None or node with no options)",
                issues=self.issues,
                code=TreeValidationErrorCode.NO_TERMINAL_PATH,
            )

        # 4. Cycle detection & Reachability using 3-color DFS
        self._run_dfs_validation()

        return self.issues

    def _run_dfs_validation(self) -> None:
        """
        Runs 3-color DFS starting from root_node_index.
        - Detects back-edges to GRAY nodes (cycles).
        - Tracks terminal path reachability.
        - Identifies unreachable (orphan) nodes.
        """
        colors = [self.COLOR_WHITE] * self.n
        current_path: list[int] = []
        has_terminal_path = False

        def dfs(u: int) -> None:
            nonlocal has_terminal_path
            colors[u] = self.COLOR_GRAY
            current_path.append(u)

            opts = getattr(self.nodes[u], "options", [])
            # Terminal node check: node with 0 options is a terminal outcome
            if len(opts) == 0:
                has_terminal_path = True

            for opt in opts:
                v = getattr(opt, "next_node_index", None)
                if v is None:
                    # Option leading to terminal outcome
                    has_terminal_path = True
                    continue

                # Check self-loop
                if v == u:
                    cycle = [u, u]
                    self._add_issue(
                        TreeValidationErrorCode.CYCLE_DETECTED,
                        f"Self-loop detected on node {u} pointing to itself",
                        node_index=u,
                        target_node_index=u,
                        cycle_path=cycle,
                    )
                    raise TreeValidationError(
                        f"Self-loop detected on node {u}",
                        issues=self.issues,
                        code=TreeValidationErrorCode.CYCLE_DETECTED,
                    )

                # Check back-edge to an ancestor currently in recursion stack
                if colors[v] == self.COLOR_GRAY:
                    try:
                        v_idx = current_path.index(v)
                        cycle = current_path[v_idx:] + [v]
                    except ValueError:
                        cycle = [v, u, v]
                    cycle_str = " -> ".join(f"node[{idx}]" for idx in cycle)
                    self._add_issue(
                        TreeValidationErrorCode.CYCLE_DETECTED,
                        f"Cycle detected in decision tree: {cycle_str}",
                        node_index=u,
                        target_node_index=v,
                        cycle_path=cycle,
                    )
                    raise TreeValidationError(
                        f"Cycle detected in decision tree involving node index {v}",
                        issues=self.issues,
                        code=TreeValidationErrorCode.CYCLE_DETECTED,
                    )

                if colors[v] == self.COLOR_WHITE:
                    dfs(v)

            colors[u] = self.COLOR_BLACK
            current_path.pop()

        # Traverse from root
        dfs(self.root_node_index)

        # 5. Check orphan / unreachable nodes
        orphan_indices: list[int] = []
        for i, color in enumerate(colors):
            if color == self.COLOR_WHITE:
                orphan_indices.append(i)
                self._add_issue(
                    TreeValidationErrorCode.ORPHAN_NODE,
                    f"Orphan node detected: node index {i} is unreachable from root node {self.root_node_index}",
                    node_index=i,
                )

        if orphan_indices:
            raise TreeValidationError(
                f"Orphan node detected: node index {orphan_indices[0]} is unreachable from root node {self.root_node_index}",
                issues=self.issues,
                code=TreeValidationErrorCode.ORPHAN_NODE,
            )

        # 6. Terminal path check
        if not has_terminal_path:
            self._add_issue(
                TreeValidationErrorCode.NO_TERMINAL_PATH,
                "Decision tree must have at least one terminal path (option with next_node_index=None or node with no options)",
                node_index=self.root_node_index,
            )
            raise TreeValidationError(
                "Decision tree must have at least one terminal path (option with next_node_index=None or node with no options)",
                issues=self.issues,
                code=TreeValidationErrorCode.NO_TERMINAL_PATH,
            )

    def _add_issue(
        self,
        code: TreeValidationErrorCode,
        message: str,
        node_index: Optional[int] = None,
        target_node_index: Optional[int] = None,
        cycle_path: Optional[list[int]] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        self.issues.append(
            TreeValidationIssue(
                code=code,
                message=message,
                node_index=node_index,
                target_node_index=target_node_index,
                cycle_path=cycle_path,
                details=details or {},
            )
        )


def validate_decision_tree_graph(
    nodes: Sequence[Any],
    root_node_index: int = 0,
    strict_option_bounds: bool = False,
) -> list[TreeValidationIssue]:
    """
    Convenience function to validate decision tree graph invariants.

    Raises:
        TreeValidationError: If any invariant is violated.
    Returns:
        List of TreeValidationIssue (empty if valid).
    """
    validator = TreeValidator(
        nodes=nodes,
        root_node_index=root_node_index,
        strict_option_bounds=strict_option_bounds,
    )
    return validator.validate()
