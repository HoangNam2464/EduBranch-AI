--
description: Rules for authentication and authorization implementation in EduBranch-AI.
trigger: model_decision
---

# Feature Rules: Authentication & Role Management

## Scope
Backend Gateway (NestJS `backend/`) — `auth/` and `user/` modules.

## Included
- User registration (email, password, fullName, role selection: LECTURER | STUDENT)
- Login with email/password → returns JWT access + refresh tokens
- JWT access token validation on protected endpoints
- Refresh token rotation
- Role-based access control (RBAC): LECTURER, STUDENT and ADMIN roles (ADMIN added to MVP by PO decision 2026-11-12, OPD-015 option B)
- Admin account lock/unlock via `users.is_active` (login is rejected when `is_active = false`)
- Sign in / sign up with Google and Microsoft (OAuth 2.0 / OpenID Connect) on the public login and register pages — added to MVP by PO decision 2026-11-12; the backend still issues its own JWT after verifying the provider ID token. Not offered on the admin login. Open product rules: role choice on first social sign-in, linking when the email already has a password account, campus email domain restriction (OPD-008)
- Password hashing using BCrypt (never store plaintext)
- JWT authentication guard and strategy

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
