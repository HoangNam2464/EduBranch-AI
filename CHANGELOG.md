# Changelog — EduBranch-AI

> - **Document Class**: `[PROJECT CHANGELOG]`

All notable changes to EduBranch AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added / Changed
- **Documentation Governance & Reorganization**: Established unified Documentation Hub (`docs/README.md`), standardized rule precedence & agent parity (`.agents/rules/03-engineering-and-task-standards.md`, `AGENTS.md`, `.agents/rules/feature-*.md`, `.claude/rules/`), converted core architecture/AI/DB/feature diagrams to Mermaid, and separated live SSOT specs from immutable baselines and historical snapshots.
- **PO Scope & UI/Architecture Alignment (Nov 2026)**: Added Admin role (`V3`), Course Invite-Code Enrollments (`V5`, `BE-029`, `OPD-001`), Soft Course Archiving (`OPD-014`), 3-step AI Studio (`OPD-006`), In-Platform Case-Quality Rubric (`OPD-011`), Lecturer Dashboard (`D-05`), Forgot/Reset Password MVP UI + `rememberMe`, confirmed `P3`/`P4` (`Statistics`, `Lecturer Feedback`, `Review Study`) in MVP scope (removing `(LATER)` labels while preserving `D-04`, `OPD-010`, `D4-13`, `ROLE_HOME.LECTURER`, and Feedback route convention as `OPEN PO DECISION` and separating MVP scope from implementation completeness), Light-only `R01` visual system (`#2A4E7F` / `#00A5F5`, `Plus Jakarta Sans` + `Inter` target, modular frontend architecture & canonical naming standard §8), and Spec Kit v1.4.0 delivery workflow (`FEATURE-DELIVERY-WORKFLOW.md`).
- **Official Identity & Core Flows**: Standardized project identity to **EduBranch-AI**, synchronized Docker infrastructure, enforced Experience-First Branching Study (`step` -> Journey Review retrospective reasoning -> Reflection/Retry), Review Study submissions (`BE-025`), Lecturer Feedback (`BE-026`), Basic Statistics (`BE-028`), and 1–2 round non-grading AI Challenge Support (`BE-027`).

---

## [0.0.1] - 2026-09-11

### Scaffolded
- Initial repository skeleton for EduBranch-AI (formerly CaseTree-AI)
- NestJS 10 backend project structure with domain modules: `auth`, `user`, `course`, `material`, `case`, `branching-attempt`, `reasoning`, `challenge-support`, `review-study`, `lecturer-feedback`, `statistics`, `evaluation`, `notification`, `common`
- FastAPI AI service project structure with domain packages: `core`, `providers`, `ingestion`, `retrieval`, `generation`, `challenge_support`, `evaluation`
- React 19 + Vite + TypeScript + TailwindCSS v4 frontend with feature-based module structure
- PostgreSQL 16 + pgvector + Redis 7 + MinIO Docker Compose infrastructure
- GitHub Actions CI/CD workflows for backend, ai-service, and frontend
- Agent/AI coding rules in `.agents/rules/`
- Architecture documentation in `docs/architecture/`
- AI documentation in `docs/ai/`
- Database documentation in `docs/database/`
- Research/evaluation documentation in `docs/research/`
- QA and testing strategy in `docs/qa/`
- `.env.example` for all services
- CONTRIBUTING.md, SECURITY.md, CODE_OF_CONDUCT.md

### Added
- Repository initialized
- Proposal document preserved in `docs/`
