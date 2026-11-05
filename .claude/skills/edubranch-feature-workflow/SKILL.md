---
name: edubranch-feature-workflow
description: Use this skill when an EduBranch-AI request adds or changes a feature, changes behaviour, fixes a security, ownership or permission bug, or needs requirement-to-test traceability. Not for typos, formatting or small refactors.
---

# EduBranch-AI feature workflow

The procedure lives in `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`. This skill adds no rules of its own.

1. Read `docs/workflows/FEATURE-DELIVERY-WORKFLOW.md` in full before doing anything else. If it is missing on the current branch, stop and tell the PO; do not rebuild it from memory.
2. Check that the request fits its §1 Scope. If it does not, say so and do the task without this workflow.
3. Record the branch and HEAD as workflow Stage 0 says (UNKNOWN if they cannot be read inside the workspace), then say which stage you are starting and why.
4. Run the stages in order. Stop at every gate and wait for the PO, except gates the PO batched as workflow §4 allows.
5. Treat any input you are given (task ID, feature name or description) as the starting point for Discover, not as an approved requirement.
