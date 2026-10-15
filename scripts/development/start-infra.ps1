#!/usr/bin/env pwsh
<#
.SYNOPSIS
    EduBranch-AI — Start infrastructure services (Windows PowerShell version).
.DESCRIPTION
    Starts PostgreSQL 16 + pgvector, Redis 7, and MinIO via Docker Compose.
    Backend (NestJS) and AI Service (FastAPI) are started separately in dev mode.
.EXAMPLE
    .\scripts\development\start-infra.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting EduBranch-AI infrastructure..." -ForegroundColor Cyan

# Check Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
}

# Start only infra services (not app services)
Write-Host "📦 Starting: PostgreSQL 16+pgvector, Redis 7, MinIO..." -ForegroundColor Yellow

docker compose up -d postgres redis minio

if ($LASTEXITCODE -ne 0) {
    Write-Error "docker compose failed. Check docker-compose.yml and .env file."
    exit 1
}

Write-Host ""
Write-Host "✅ Infrastructure is up!" -ForegroundColor Green
Write-Host ""
Write-Host "  PostgreSQL : localhost:5432 (db: edubranch_db)"
Write-Host "  Redis      : localhost:6379"
Write-Host "  MinIO      : http://localhost:9000  (console: http://localhost:9001)"
Write-Host ""
Write-Host "Next steps (run in separate terminals):" -ForegroundColor Cyan
Write-Host "  cd backend   && npm run start:dev"
Write-Host "  cd ai-service && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"
Write-Host "  cd frontend  && npm run dev"
Write-Host ""
