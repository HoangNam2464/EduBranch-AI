# ==============================================================================
# EduBranch-AI — Developer Git Environment Setup Script (Windows PowerShell)
# Configures local git hooks, safety checks, and formatting standards.
#
# Usage:
#   .\scripts\setup-git.ps1
# ==============================================================================

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Configuring EduBranch-AI Git Environment (Windows)..." -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

# 1. Configure Git to use .githooks directory
Write-Host "-> Configuring core.hooksPath -> .githooks" -ForegroundColor Yellow
git config core.hooksPath .githooks

# 2. Configure line ending safety
Write-Host "-> Configuring core.autocrlf -> true" -ForegroundColor Yellow
git config core.autocrlf true

# 3. Configure pull strategy
Write-Host "-> Configuring pull.rebase -> false" -ForegroundColor Yellow
git config pull.rebase false

Write-Host ""
Write-Host "Git environment setup complete!" -ForegroundColor Green
Write-Host "Active hooks: pre-commit (secrets), commit-msg (convention), pre-push (branch naming)"
Write-Host "Protected branch: direct pushes to 'main' are blocked."
Write-Host "Rule: task codes like FE-003 or BE-001 are only allowed in commit messages, never branch names."
Write-Host "======================================================================" -ForegroundColor Cyan
