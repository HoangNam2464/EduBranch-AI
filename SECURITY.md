# Security Policy — EduBranch-AI

> - **Document Class**: `[SUPPORTING GUIDE]` (Security Policy & Responsible Disclosure)

## Reporting a Vulnerability

If you discover a security vulnerability in EduBranch-AI, **do not create a public GitHub issue**.

Please report it privately by emailing the project maintainer or opening a GitHub Security Advisory:
`Settings → Security → Advisories → New draft security advisory`

We will acknowledge your report within **72 hours** and aim to provide a fix timeline within **7 days** for critical issues.

---

## Security Scope

The following areas are in scope for security reporting:

- Authentication bypass or JWT vulnerabilities
- Authorization failures (e.g., student accessing unpublished cases)
- SQL injection, XSS, CSRF vulnerabilities
- File upload vulnerabilities (malicious file bypass)
- Exposure of internal service endpoints (FastAPI)
- Prompt injection through uploaded teaching materials
- Exposure of secrets or API keys in responses or logs
- Insecure direct object references (IDOR)
- Data leakage between lecturers/courses/students

---

## Security Architecture

### 1. Authentication

- The **Backend Gateway (NestJS)** handles all authentication via JWT (JSON Web Token)
- Passwords are hashed using BCrypt (`BCRYPT_ROUNDS = 12`) — plaintext passwords are never stored
- Stateless JWT access tokens are validated on every protected request via global `JwtAuthGuard` + `RolesGuard`
- Auth login/register endpoints enforce request rate limiting (`RateLimiterGuard`); failed login attempts are logged without leaking credentials or enumerating emails (`"Invalid email or password"`)
- Extended session support (`rememberMe` JWT expiry TTL) and Forgot/Reset Password APIs are queued MVP scope items (`BE`/`FE` auth sync)

### 2. Authorization

- Role-based access control: `LECTURER`, `STUDENT`, and `ADMIN` roles
- The **Backend Gateway (NestJS)** enforces ownership: lecturers can only access their own courses and materials
- Students join courses by invite code (displayed on Student Desk / My Courses) or open published cases via a direct link from the lecturer (`OPD-001 -> A`)
- **A student must never receive a case that is not in `PUBLISHED` status**
- Authorization is enforced server-side — never trust client-provided owner IDs

### 3. File Upload Security

- Only PDF and DOCX files are accepted (MIME type + extension validation)
- Maximum file size is enforced (configurable via `MAX_UPLOAD_SIZE_MB`)
- Files are stored in MinIO (object storage), never served as executable code
- File names are sanitized and stored under system-generated IDs

### 4. Internal Service Protection

- FastAPI AI Service is an **internal service** and must never be exposed to the public internet
- Communication between the **Backend Gateway (NestJS)** and the AI Service requires a shared internal API key (`X-Internal-API-Key` header)
- The AI Service must only listen on an internal Docker network interface in production

### 5. Prompt Injection & AI Safety Governance

Authoritative technical rules live in [`.agents/rules/00-project-foundation.md §6`](.agents/rules/00-project-foundation.md), [`.agents/rules/03-engineering-and-task-standards.md §4 & §7`](.agents/rules/03-engineering-and-task-standards.md), and [`docs/architecture/SERVICE-BOUNDARIES.md`](docs/architecture/SERVICE-BOUNDARIES.md):
- Wrap retrieved teaching material chunks inside `<sources>...</sources>` with `sanitize_sources_boundary` escaping look-alike closing tags (`app/retrieval/retriever.py`, `build_rag_context`).
- Validate and length-limit user text (`reasoning_text`, `proposed_solution`) via DTOs and Pydantic schemas before LLM calls.
- AI Challenge Support generates Socratic counter-questions only (max 2 rounds, hard DB constraint) and must never grade, score, render pass/fail verdicts, or mutate lecturer-approved case content.

### 6. Secret Management

- **Never** commit `.env` files or actual credentials to Git
- **Never** hardcode API keys, passwords, or connection strings in source code
- **Never** expose API keys, internal service URLs, or secrets in REST API responses
- **Never** log sensitive data (passwords, tokens, API keys)
- All secrets are managed via environment variables, loaded from `.env` files (excluded from Git)
- Enable the repository pre-commit safeguard via `git config core.hooksPath .githooks` to prevent accidental commits of `.env` and credentials
- Rotate credentials immediately if accidentally exposed

### 7. Data Privacy

- Student attempt data, reasoning, and challenge support history are private to the student and the relevant lecturer
- No student data is shared across courses or lecturers without explicit authorization
- Research/evaluation data exports must be anonymized (see `docs/research/EVALUATION-DESIGN.md`)

### 8. CORS

- Allowed origins are explicitly configured via `CORS_ALLOWED_ORIGINS` environment variable
- In production, only the frontend domain is allowed
- FastAPI does not expose CORS to external origins

### 9. Database Security

- All database access goes through the Backend Gateway repository layer — no raw SQL string concatenation
- pgvector queries use parameterized queries
- Database credentials are externalized in environment variables
- Connection pool is bounded (min/max configurable)

---

## Supported Versions

| Version | Supported |
| :--- | :--- |
| `main` (latest) | ✅ |
| `develop` | ⚠️ Development branch — may contain known issues |
| Older releases | ❌ |
