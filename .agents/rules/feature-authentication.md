---
description: Rules for authentication and authorization implementation in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Authentication & Institutional Role Management

## Scope
- **Backend Gateway (NestJS `backend/`)**: `auth/` and `user/` modules.
- **Frontend Web App (`frontend/`)**: `PublicLayout.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `UnauthorizedPage.tsx` (403), `NotFoundPage.tsx` (404), and `authStore.ts`.

## Included
- User registration (academic email, password, full name, role selection: `LECTURER` | `STUDENT`).
- **Institutional Google SSO (`@*.edu.vn`)**: Single-click sign-in with Google OAuth2.
- **First-Time Role Handshake**: One-time interstitial modal for new Google accounts to bind permanent role (`LECTURER` vs `STUDENT`) per invariant `BR-AUTH-01`.
- Login with email/password $\rightarrow$ returns JWT access + refresh tokens.
- JWT access token validation on protected endpoints (`AuthGuard`).
- Refresh token rotation mechanism.
- Role-based access control (RBAC): `LECTURER` and `STUDENT` roles.
- Password hashing using BCrypt with salt rounds $\ge 10$ (never store plaintext).
- Rate-limiting protection on login and auth endpoints.
- **Frontend Academic UI**:
  - `PublicLayout`: Centered high-contrast card (`max-w-md`, `448px`) on `#F9FAFB` canvas.
  - `LoginPage`: Email/Password form with single primary blue button (`#2563EB`) on top $\rightarrow$ horizontal divider ("OR" / "HOẶC") $\rightarrow$ Google SSO button ("Sign in with Google" / "Đăng nhập với Google" with NO technical domain suffixes) below, generic error banner ("Invalid email or password" — preventing user enumeration), loading spinner.
  - `RegisterPage`: Academic registration form (Full Name, Institutional Email, Password $\ge 8$ chars) + **Segmented Control Role Selector** (`LECTURER` vs `STUDENT`) on top $\rightarrow$ Primary Register button $\rightarrow$ horizontal divider $\rightarrow$ Google SSO button ("Register with Google" / "Đăng ký với Google").
  - System Exception Pages: 403 Forbidden screen (`UnauthorizedPage`), 404 Not Found screen (`NotFoundPage`), session expiration handler.

## Excluded
- Consumer social logins (Facebook, TikTok, Twitter/X) — out of scope for university academic environment.
- Multi-factor authentication (SMS/TOTP) — deferred post-MVP.
- Multi-role switching (dual-role) — accounts are strictly assigned exactly one role permanently (`BR-AUTH-01`).

## Service Owner
Backend Gateway (NestJS `backend/`)

## Constraints
- Passwords MUST be hashed with BCrypt before persistence.
- JWT secrets must be loaded strictly from environment variables (`JWT_SECRET`, `JWT_REFRESH_SECRET`) — never hardcoded.
- Failed authentication attempts must be logged without leaking sensitive credentials.
- Never expose password hashes or internal system metadata in API responses.
- Authorization is strictly enforced server-side — never trust client-provided user claims.
- Lecturer can only access their own courses, materials, and draft cases.
- Students can only access cases with status = `PUBLISHED` (`INV-01`).

## Testing Expectations
- Unit tests for JWT generation, signature verification, and expiration handling.
- Integration tests for Google OAuth handshake and email/password authentication flows.
- RBAC boundary tests: verify that students receive `403 Forbidden` on lecturer endpoints.
- Unauthenticated access tests: verify that requests without valid tokens receive `401 Unauthorized`.
