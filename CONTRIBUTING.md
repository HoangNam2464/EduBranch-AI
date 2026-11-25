# Contributing to EduBranch-AI

> - **Document Class**: `[SUPPORTING GUIDE]` · **Authoritative Process & Rules**: [`AGENTS.md`](AGENTS.md) · [`.agents/rules/00-project-foundation.md`](.agents/rules/00-project-foundation.md) (`FND`) · [`.agents/rules/03-engineering-and-task-standards.md`](.agents/rules/03-engineering-and-task-standards.md) · [`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`](docs/workflows/FEATURE-DELIVERY-WORKFLOW.md).
> All code changes must follow the Feature Delivery Workflow Quality Gates (`QG1`–`QG7`) and PR checklist before integrating into `develop` or `main`.

---

## 🚀 Quick Start: Cài đặt Môi trường Phát triển (Dành cho thành viên)

### 1. Kích hoạt Git Hooks bảo vệ mã nguồn (Bắt buộc chạy 1 lần)
Để tự động ngăn chặn commit file nhạy cảm (`.env`), kiểm tra đúng chuẩn commit message và chặn đặt sai tên nhánh:
- **Trên Windows (PowerShell)**:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-git.ps1
  ```
- **Trên macOS / Linux / Git Bash**:
  ```bash
  chmod +x scripts/setup-git.sh
  ./scripts/setup-git.sh
  ```
*(Lệnh trên sẽ thiết lập `git config core.hooksPath .githooks`, kích hoạt `pre-commit`, `commit-msg` và `pre-push` hooks).*

### 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
Dự án đã tích hợp đầy đủ cả hạ tầng dữ liệu và ứng dụng (Postgres, Redis, MinIO, Backend Gateway, Frontend Web App):
```bash
# Khởi động toàn bộ dịch vụ và build mới nhất
docker compose up --build -d

# Xem log các dịch vụ
docker compose logs -f

# Dừng hệ thống
docker compose down
```

| Dịch vụ | URL / Port | Tài khoản mặc định |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:5173` | — |
| **Backend Gateway API** | `http://localhost:8080/api/v1` | — |
| **AI Service (FastAPI)** | `http://localhost:8000/health` | — |
| **MinIO Console** | `http://localhost:9001` | `minioadmin` / `changeme_minio_password` |
| **PostgreSQL 16 + pgvector** | `localhost:5432` | `edubranch` / `changeme_db_password` / DB: `edubranch_ai` |
| **Redis 7** | `localhost:6379` | pass: `changeme_redis_password` |

---

## 🧭 1. Git Workflow, Code Standards & Boundaries (SSOT Pointers)

Do not maintain separate copies of engineering rules here—follow the canonical sources directly:
- **Branching & Commits**: [`.agents/rules/00-project-foundation.md §7`](.agents/rules/00-project-foundation.md) (`feature/<domain>` for frontend/shared, `feature/<domain>-backend` for backend & AI; **never** include task IDs in branch names; commit `<type>(<scope>): <summary> [<GROUP-ID>]`; never push directly to `develop` or `main`).
- **Tier Architecture, DB, AI, Frontend & Naming Rules**: [`.agents/rules/03-engineering-and-task-standards.md`](.agents/rules/03-engineering-and-task-standards.md) (NestJS raw parameterized `pg` SQL without ORMs, migrations solely in `backend/migrations/V1..V5`, internal AI routing via `providers/factory.py` + `<sources>` escaping, Target Modular Frontend + `R01`, canonical Naming Standard `§8`, Jira key vs Master ID rules).
- **UI & Design**: [`.agents/rules/01-ui-design-standards.md`](.agents/rules/01-ui-design-standards.md) (`R01`), [UX Screen Notes](docs/design/UX-SCREEN-NOTES.md), and `node scripts/l10n-approval-check.mjs`.
- **Service Isolation & Security**: [`docs/architecture/SERVICE-BOUNDARIES.md`](docs/architecture/SERVICE-BOUNDARIES.md) and [`SECURITY.md`](SECURITY.md).
- **Local Scratch Hygiene**: Never force-add gitignored scratch/reference artifacts (`.agent-handoff/`, `scratch/`, `*.zip`, ad-hoc `scripts/*.py`).

---

## 🔄 2. Pull Request Checklist (`QG1`–`QG7`)

Full Quality Gate criteria and Spec Kit stage requirements live in [`docs/workflows/FEATURE-DELIVERY-WORKFLOW.md`](docs/workflows/FEATURE-DELIVERY-WORKFLOW.md). Before opening a PR against `develop` using `.github/pull_request_template.md`:
- [ ] Branched from latest `develop` with clean `feature/<domain>` / `feature/<domain>-backend` / `fix/<desc>` / `docs/<topic>` name (no task IDs in branch name)
- [ ] Explicit file staging (`git add -- <path>`), hooks active (`core.hooksPath .githooks`), zero secrets or `.env` files
- [ ] Tier build, lint, unit, and integration/e2e suites pass locally (plus `l10n-approval-check` if touching EN strings)
- [ ] All PR head-SHA CI checks (`QG5`) pass before approval and merge (`QG6`)
- [ ] Canonical docs in [`docs/README.md`](docs/README.md) updated if contracts, routes, or migrations changed
