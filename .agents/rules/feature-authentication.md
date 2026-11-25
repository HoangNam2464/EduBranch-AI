---
description: Rules for authentication and authorization implementation in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Authentication & Role Management

## Scope
Backend Gateway (NestJS `backend/`) — `auth/` and `user/` modules.
Frontend — `pages/auth/` (`LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `AdminLoginPage.tsx`).

## Included
- User registration (email, password, fullName, role selection: LECTURER | STUDENT)
- Login with email/password → issues stateless JWT access token (8h default on `develop`; `rememberMe` extended TTL + frontend storage persistence queued per Figma `00.3` & PO 2026-11-25)
- Forgot & Reset Password UI flow (`/forgot-password`, `/reset-password` — included in MVP UI per PO 2026-11-25; backend password-reset APIs pending)
- Role-based access control (RBAC): LECTURER, STUDENT and ADMIN roles (ADMIN added to MVP by PO decision 2026-11-12, OPD-015 option B; admin login `/admin/login` without public registration or social buttons)
- Admin account lock/unlock via `users.is_active` (rejected at login once `BE-032` / `auth` integration lands; currently `BE-032` in PR #80)
- Sign in / sign up with Google and Microsoft (OAuth 2.0 / OpenID Connect) on the public login and register pages — added to MVP by PO decision 2026-11-12 (`PSD-09`, `BE-034`); the backend still issues its own JWT after verifying the provider ID token. Open PO rules: role choice on first social sign-in, linking when the email already has a password account, campus email domain restriction (`OPD-008`)
- Password hashing using BCrypt (`BCRYPT_ROUNDS = 12`; never store plaintext)
- JWT authentication guard, role enforcement guard, and auth rate limiter (`RateLimiterGuard`)

## Excluded
- Social login other than Google and Microsoft (e.g. Facebook, GitHub) — out of scope
- Campus SSO (LDAP / SAML) — out of scope
- Multi-factor authentication — out of scope
- Admin self-registration — admin accounts are provisioned by the system operator, not through the public register form

## Service Owner
Backend Gateway (NestJS `backend/`)

## Constraints
- Passwords MUST be hashed with BCrypt before storage
- JWT secret loaded from environment variable JWT_SECRET — never hardcoded
- Failed login attempts should be logged (without exposing user data)
- Never expose passwordHash or internal user IDs in API responses
- Authorization is enforced server-side — never trust client-provided user ID
- Lecturer can only access their own courses/materials/cases
- Student can only access PUBLISHED cases

## Testing Expectations
- Unit tests for JWT generation/validation
- Integration test for login → token validation flow
- Test that student cannot access lecturer-only endpoints
- Test that unauthorized user receives 401
