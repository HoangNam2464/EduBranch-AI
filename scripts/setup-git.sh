#!/usr/bin/env bash
# ==============================================================================
# EduBranch-AI — Developer Git Environment Setup Script
# Configures local git hooks, safety checks, and formatting standards.
#
# Usage:
#   bash scripts/setup-git.sh
#   or ./scripts/setup-git.sh (from repository root)
# ==============================================================================

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "======================================================================"
echo "🔧 Configuring EduBranch-AI Git Environment..."
echo "======================================================================"

# 1. Configure Git to use .githooks directory
echo "➡️  Configuring core.hooksPath -> .githooks"
git config core.hooksPath .githooks

# 2. Ensure hooks are executable
echo "➡️  Setting executable permissions on hook files"
chmod +x .githooks/* 2>/dev/null || true

# 3. Configure line ending safety (prevents CRLF/LF churn across Windows and Linux)
echo "➡️  Configuring core.autocrlf -> input"
git config core.autocrlf input

# 4. Configure pull strategy (avoid unwanted merge commits on simple pull)
echo "➡️  Configuring pull.rebase -> false"
git config pull.rebase false

echo ""
echo "✅ Git environment setup complete!"
echo "   - Active hooks: pre-commit (secrets), commit-msg (convention), pre-push (branch naming)"
echo "   - Protected branch: direct pushes to 'main' are blocked."
echo "   - Rule: task codes (FE-003, BE-001) are only allowed in commit messages, never branch names."
echo "======================================================================"

