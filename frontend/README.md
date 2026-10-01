# Edu-Branch-AI — Frontend

React 19 + Vite + TypeScript + TailwindCSS v4 UI for the Edu-Branch-AI platform.

The current student learning screens are an interactive prototype: they use
sample case data and a local Zustand store. Persistent attempts, lecturer
feedback, and published-case access will be connected through the NestJS
Backend Gateway as the domain APIs are implemented.

## Responsibilities

- Lecturer UI: courses, material upload, case generation, review/edit/publish, statistics
- Student UI: Branching Case Player (experience-first), Journey Review (retrospective reasoning), Reflection, Review Study, Challenge Support
- Authentication: login, registration
- Decision tree visualization via ReactFlow

## Technology

- **Framework**: React 19 + Vite
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **State**: Zustand
- **HTTP**: Axios (centralized client with JWT interceptors)
- **Routing**: React Router v7
- **Decision Tree Visualization**: ReactFlow

## Architecture Rules

- **Frontend → Backend Gateway only** — Never call internal FastAPI AI Service directly
- **API calls via apiClient** — Never call axios directly in components
- **Business logic in services** — Keep UI components presentation-only
- **Centralized state** — Zustand stores in `src/stores/`
- **Never store secrets** — No API keys in frontend environment variables

## Feature Structure

```
src/features/
├── auth/              ← Login, registration, password reset
├── courses/           ← Lecturer course management
├── materials/         ← Teaching material upload
├── cases/             ← Case generation trigger
├── case-review/       ← Decision tree review, edit, approve, publish
├── branching-study/   ← Branching Case Player & Journey Review
├── review-study/      ← Review Study case analysis & solution submission
├── challenge-support/ ← AI Reasoning / Challenge Support (max 2 rounds)
├── reflection/        ← Post-journey / post-feedback reflection
├── statistics/        ← Lecturer statistics view
└── evaluation/        ← Research evaluation boundary
```

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
# Frontend at http://localhost:5173
```

## Build

```bash
npm run build
```
