---
name: "📖 User Story"
about: "Define a new feature as a user story for sprint planning"
title: "[STORY] <short title>"
labels: ["user-story", "sprint-backlog"]
assignees: ""
---

## User Story

**As a** [Lecturer / Student / Admin]
**I want to** [describe the feature or action]
**So that** [describe the benefit or outcome]

---

## Acceptance Criteria

- [ ] Given [context], when [action], then [expected outcome]
- [ ] Given [context], when [action], then [expected outcome]
- [ ] Given [context], when [action], then [expected outcome]

---

## Technical Notes

> _Optional: any known constraints, API endpoints, or implementation hints_

**Backend (NestJS):**
- Endpoint(s): `VERB /api/v1/...`
- Module: `backend/src/modules/<module>/`

**AI Service (FastAPI):**
- Endpoint(s): `VERB /internal/v1/...` (if applicable)

**Frontend (React):**
- Page/Route: `/lecturer/...` or `/student/...`

---

## Definition of Done

- [ ] Unit tests written and passing
- [ ] Controller DTOs validated with `class-validator`
- [ ] API response matches TypeScript types in `frontend/src/types/index.ts`
- [ ] No raw database entities exposed in REST responses
- [ ] PR reviewed and merged to `develop`
