# QA-002 / EBA-110 Regression Report: Token Expiry, Role Denial & Ownership Leak

**Master Task ID**: `EBA-110`  
**Group Task ID**: `QA-002`  
**Role**: `QA (Quality Assurance)`  
**Sprint**: `Sprint 1 - Foundation`  
**Status**: `Verified & Passing (100% Pass Rate)`  
**Target Codebase**: Backend Gateway (`backend/`)  
**Deliverables**: `backend/test/security-regression.spec.ts`  
**Automated Runner**: `npm run test:regression`  

---

## 1. Executive Summary

This report delivers the automated regression test suite, empirical verification evidence, and security evaluation for **[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite** (Master Task ID: `EBA-110`).

The primary objective of QA-002 is to establish an unyielding automated regression harness protecting the EduBranch-AI platform against:
1. **Broken Authentication**: Expired tokens, untrusted cryptographic signatures, tampered payloads, and malformed authorization headers.
2. **Broken Object Level Authorization (BOLA / IDOR)**: Unauthorized cross-lecturer modifications to courses/cases and unauthorized cross-student tampering with branching study attempts, reasoning, and reflections.
3. **Privilege Escalation & Role Denial**: Students attempting to access lecturer-only endpoints or spoof roles via query parameters or body payloads, and vice versa.

All 3 Acceptance Criteria defined in Sprint 1 are completely satisfied across **32 automated E2E integration tests** executed with Supertest against the NestJS application pipeline (`backend/test/security-regression.spec.ts`).

---

## 2. Acceptance Criteria Verification Matrix

| # | Acceptance Criterion | Verification Suite & Test IDs | Result |
|---|---|---|:---:|
| **AC-1** | Token hết hạn hoặc sai chữ ký bị chặn lập tức với HTTP 401 | `backend/test/security-regression.spec.ts`<br>`[SEC-EXP-01]` to `[SEC-EXP-09]` (Expired timestamp, untrusted secret, tampered payload, malformed format, missing sub claim, missing header) | **PASS** |
| **AC-2** | Truy cập tài nguyên của user khác bị từ chối với HTTP 403 theo authorization policy | `backend/test/security-regression.spec.ts`<br>`[SEC-ROLE-01]` to `[SEC-ROLE-11]` (Student on Lecturer APIs, Lecturer on Student APIs, query spoofing, DRAFT lifecycle barrier)<br>`[SEC-OWN-01]` to `[SEC-OWN-12]` (Cross-lecturer course/case boundary, cross-student attempt read/step/reasoning/reflection isolation) | **PASS** |
| **AC-3** | Có test evidence và log kiểm thử tự động | Documented in Section 3, 4 & 5 of this report; automated script `npm run test:regression` in `backend/package.json` | **PASS** |

---

## 3. Test Suite Specification & Mapping Matrix

### 3.1. Suite 1: Token Expiry & Cryptographic Signature Validation (AC-1)

| Test ID | Scenario | Input / Headers | Expected HTTP Status | Verified Guard / Security Boundary | Status |
|---|---|---|:---:|---|:---:|
| `SEC-EXP-01` | Expired JWT token on course list | `Authorization: Bearer <exp: now - 1800s>` | `401 Unauthorized` | `JwtStrategy` rejects expired token via passport-jwt | **PASS** |
| `SEC-EXP-02` | Expired token on branching study attempt | `POST /api/v1/cases/:id/branching-attempts` + expired token | `401 Unauthorized` | Blocked before executing `BranchingAttemptController` | **PASS** |
| `SEC-EXP-03` | Invalid signature (signed with untrusted key) | `Authorization: Bearer <token_signed_with_untrusted_key>` | `401 Unauthorized` | HMAC SHA-256 signature mismatch rejects token | **PASS** |
| `SEC-EXP-04` | Tampered payload with original signature | Altered payload claim (`role: "LECTURER"`) + original signature | `401 Unauthorized` | Signature verification failure rejects tampered token | **PASS** |
| `SEC-EXP-05` | Malformed token structure | `Bearer invalid-token-string`, `Bearer header.body` | `401 Unauthorized` | JWT parser rejects malformed token format | **PASS** |
| `SEC-EXP-06` | Missing Authorization header | `GET /courses`, `POST /courses` without header | `401 Unauthorized` | `JwtAuthGuard` rejects unauthenticated request | **PASS** |
| `SEC-EXP-07` | Non-Bearer Authorization scheme | `Basic dXNlcg==`, `Token abcdef` | `401 Unauthorized` | Only `Bearer` token scheme permitted on protected routes | **PASS** |
| `SEC-EXP-08` | Missing `sub` claim in token payload | Payload without subject identifier `sub` | `401 Unauthorized` | `AuthService.validateToken` rejects payload without `sub` | **PASS** |
| `SEC-EXP-09` | Valid token with legitimate secret & unexpired claims | Valid JWT signed with `TEST_JWT_SECRET` | `200 OK` | Authentication passes, populates `req.user`, executes handler | **PASS** |

### 3.2. Suite 2: Role Denial & Privilege Escalation Regression (AC-2)

| Test ID | Endpoint | Method | Caller Role | Target Resource / Action | Expected Status | Verified Policy Gate | Status |
|---|---|:---:|:---:|---|:---:|---|:---:|
| `SEC-ROLE-01` | `/api/v1/courses` | POST | STUDENT | Create Course | `403 Forbidden` | `RolesGuard` rejects non-LECTURER role | **PASS** |
| `SEC-ROLE-02` | `/api/v1/courses` | GET | STUDENT | List Lecturer Courses | `403 Forbidden` | `RolesGuard` rejects non-LECTURER role | **PASS** |
| `SEC-ROLE-03` | `/api/v1/cases/generate` | POST | STUDENT | AI Case Generation | `403 Forbidden` | `RolesGuard` rejects non-LECTURER role | **PASS** |
| `SEC-ROLE-04` | `/api/v1/cases/:id/status` | PATCH | STUDENT | Update Case Lifecycle Status | `403 Forbidden` | `RolesGuard` rejects non-LECTURER role | **PASS** |
| `SEC-ROLE-05` | `/api/v1/cases/:id/branching-attempts` | POST | LECTURER | Start Branching Attempt | `403 Forbidden` | `RolesGuard` rejects non-STUDENT role | **PASS** |
| `SEC-ROLE-06` | `/api/v1/branching-attempts/:id/step` | POST | LECTURER | Choose Decision Option | `403 Forbidden` | `RolesGuard` rejects non-STUDENT role | **PASS** |
| `SEC-ROLE-07` | `/api/v1/branching-attempts/:id/reasoning` | PUT | LECTURER | Submit Retrospective Reasoning | `403 Forbidden` | `RolesGuard` rejects non-STUDENT role | **PASS** |
| `SEC-ROLE-08` | `/api/v1/branching-attempts/:id/reflection` | POST | LECTURER | Submit Post-Outcome Reflection | `403 Forbidden` | `RolesGuard` rejects non-STUDENT role | **PASS** |
| `SEC-ROLE-09` | Query parameter spoofing | POST | STUDENT | `?role=LECTURER` on `/courses` & `/cases/generate` | `403 Forbidden` | RolesGuard evaluates cryptographic JWT claim, not query parameters | **PASS** |
| `SEC-ROLE-10` | Body payload spoofing | POST | STUDENT | `{ role: "LECTURER" }` in request body | `403 Forbidden` | RolesGuard relies strictly on authenticated context | **PASS** |
| `SEC-ROLE-11` | Case Lifecycle Policy Gate | GET | STUDENT | Student accessing `DRAFT` case | `403 Forbidden` | Students can only access `PUBLISHED` cases | **PASS** |

### 3.3. Suite 3: Ownership Leak Regression & Data Isolation Boundaries (AC-2)

| Test ID | Action | Caller | Target Resource | Expected Status | Verified Ownership Rule | Status |
|---|---|---|---|:---:|---|:---:|
| `SEC-OWN-01` | Update Course | Lecturer B (Intruder) | Course A (`lecturer_id = lecturer-owner-a`) | `403 Forbidden` | "You can only edit your own courses" | **PASS** |
| `SEC-OWN-02` | Delete Course | Lecturer B (Intruder) | Course A (`lecturer_id = lecturer-owner-a`) | `403 Forbidden` | "You can only delete your own courses" | **PASS** |
| `SEC-OWN-03` | Generate Case | Lecturer B (Intruder) | Course A (`lecturer_id = lecturer-owner-a`) | `403 Forbidden` | "You do not own this course" | **PASS** |
| `SEC-OWN-04` | Update Case | Lecturer B (Intruder) | Case of Lecturer A | `403 Forbidden` | "You can only edit cases in your own courses" | **PASS** |
| `SEC-OWN-05` | Update Course | Lecturer A (Owner) | Course A (`lecturer_id = lecturer-owner-a`) | `200 OK` | Legitimate owner update succeeds | **PASS** |
| `SEC-OWN-06` | Update Course | Student | Course A | `403 Forbidden` | Non-owner student forbidden | **PASS** |
| `SEC-OWN-07` | Delete Course | Student | Course A | `403 Forbidden` | Non-owner student forbidden | **PASS** |
| `SEC-OWN-08` | Read Branching Attempt | Student B (Intruder) | Attempt of Student A | `403 Forbidden` | "You do not have permission to view this attempt" | **PASS** |
| `SEC-OWN-09` | Submit Decision Step | Student B (Intruder) | Attempt of Student A | `403 Forbidden` | "You do not have permission to modify this attempt" | **PASS** |
| `SEC-OWN-10` | Submit Retrospective Reasoning | Student B (Intruder) | Attempt of Student A | `403 Forbidden` | "You do not have permission to modify this attempt" | **PASS** |
| `SEC-OWN-11` | Submit Reflection | Student B (Intruder) | Attempt of Student A | `403 Forbidden` | "You do not have permission to modify this attempt" | **PASS** |
| `SEC-OWN-12` | Read Branching Attempt | Student A (Owner) | Attempt of Student A | `200 OK` | Legitimate owner access succeeds | **PASS** |

---

## 4. Test Execution Evidence & Terminal Logs (AC-3)

### 4.1. Command Line Execution
```bash
cd backend
npm run test:regression
```

### 4.2. Raw Test Execution Output
```text
> edubranch-ai-backend@1.0.0 test:regression
> jest test/security-regression.spec.ts --config ./test/jest-e2e.json

PASS test/security-regression.spec.ts (14.514 s)
  [QA-002] Security Regression: Token Expiry, Role Denial & Ownership Leak
    1. Token Expiry & Cryptographic Signature Validation (AC-1)
      √ [SEC-EXP-01] Expired token (exp in past) -> 401 Unauthorized (59 ms)
      √ [SEC-EXP-02] Expired token on branching study attempt -> 401 Unauthorized (8 ms)
      √ [SEC-EXP-03] Invalid signature (signed with untrusted key) -> 401 Unauthorized (6 ms)
      √ [SEC-EXP-04] Tampered payload with original signature -> 401 Unauthorized (6 ms)
      √ [SEC-EXP-05] Malformed token format -> 401 Unauthorized (9 ms)
      √ [SEC-EXP-06] Missing Authorization header -> 401 Unauthorized (23 ms)
      √ [SEC-EXP-07] Non-Bearer Authorization scheme -> 401 Unauthorized (10 ms)
      √ [SEC-EXP-08] Missing sub claim in token payload -> 401 Unauthorized (7 ms)
      √ [SEC-EXP-09] Valid token with correct secret and unexpired claims -> 200 OK (10 ms)
    2. Role Denial & Privilege Escalation Regression (AC-2)
      2.1 Student calling Lecturer-only endpoints (@Roles('LECTURER'))
        √ [SEC-ROLE-01] Student calling POST /courses -> 403 Forbidden (8 ms)
        √ [SEC-ROLE-02] Student calling GET /courses -> 403 Forbidden (6 ms)
        √ [SEC-ROLE-03] Student calling POST /cases/generate -> 403 Forbidden (8 ms)
        √ [SEC-ROLE-04] Student calling PATCH /cases/:id/status -> 403 Forbidden (6 ms)
      2.2 Lecturer calling Student-only endpoints (@Roles('STUDENT'))
        √ [SEC-ROLE-05] Lecturer calling POST /cases/:id/branching-attempts -> 403 Forbidden (6 ms)
        √ [SEC-ROLE-06] Lecturer calling POST /branching-attempts/:id/step -> 403 Forbidden (6 ms)
        √ [SEC-ROLE-07] Lecturer calling PUT /branching-attempts/:id/reasoning -> 403 Forbidden (7 ms)
        √ [SEC-ROLE-08] Lecturer calling POST /branching-attempts/:id/reflection -> 403 Forbidden (9 ms)
      2.3 Role Spoofing & Lifecycle Policy Gates
        √ [SEC-ROLE-09] Student passing ?role=LECTURER cannot bypass RolesGuard (20 ms)
        √ [SEC-ROLE-10] Student injecting role: 'LECTURER' in body cannot escalate (7 ms)
        √ [SEC-ROLE-11] Student accessing DRAFT case receives 403 Forbidden (6 ms)
    3. Ownership Leak Regression & Data Isolation Boundaries (AC-2)
      3.1 Cross-Lecturer Resource Protection
        √ [SEC-OWN-01] Lecturer B updating Lecturer A's course receives 403 Forbidden (11 ms)
        √ [SEC-OWN-02] Lecturer B deleting Lecturer A's course receives 403 Forbidden (10 ms)
        √ [SEC-OWN-03] Lecturer B generating case in Lecturer A's course receives 403 Forbidden (8 ms)
        √ [SEC-OWN-04] Lecturer B updating Lecturer A's case receives 403 Forbidden (7 ms)
        √ [SEC-OWN-05] Lecturer Owner successfully updates their own course -> 200 OK (7 ms)
      3.2 Student Course Tampering Prevention
        √ [SEC-OWN-06] Student attempting to PUT course receives 403 Forbidden (6 ms)
        √ [SEC-OWN-07] Student attempting to DELETE course receives 403 Forbidden (6 ms)
      3.3 Cross-Student Branching Attempt Isolation
        √ [SEC-OWN-08] Student B reading Student A's attempt receives 403 Forbidden (5 ms)
        √ [SEC-OWN-09] Student B submitting step on Student A's attempt receives 403 Forbidden (5 ms)
        √ [SEC-OWN-10] Student B submitting reasoning on Student A's attempt receives 403 Forbidden (6 ms)
        √ [SEC-OWN-11] Student B submitting reflection on Student A's attempt receives 403 Forbidden (7 ms)
        √ [SEC-OWN-12] Student A (Owner) can successfully read their own attempt -> 200 OK (6 ms)

Test Suites: 1 passed, 1 total
Tests:       32 passed, 32 total
Snapshots:   0 total
Time:        14.857 s
Ran all test suites matching /test\\security-regression.spec.ts/i.
```

---

## 5. Security & Authorization Architecture Analysis

### 5.1. Cryptographic Authentication Hardening (AC-1)
- **Clock Skew & Expiration Enforcement**: `passport-jwt` enforces strict timestamp validation against `payload.exp`. Tokens past their expiry window are rejected immediately at the strategy layer with `401 Unauthorized` before any business logic or database query can execute.
- **HMAC Signature Integrity**: All tokens must be signed using the server-side secret key (`JWT_SECRET`). Any modification to the base64-encoded header or payload without the corresponding HMAC SHA-256 signature results in instant rejection (`401 Unauthorized`), neutralizing token tampering attacks.
- **Header Parsing Defense**: Requests lacking the `Bearer <token>` scheme (including `Basic`, raw strings, or missing headers) are immediately rejected by `JwtAuthGuard`.

### 5.2. Role-Based Access Control & Spoofing Defense (AC-2)
- **Two-Layer Guard Pipeline**:
  ```
  HTTP Request ──► JwtAuthGuard (validates Bearer token) ──► RolesGuard (enforces @Roles) ──► Controller Handler
  ```
- **Query & Body Spoofing Neutralization**: `RolesGuard` strictly examines `req.user.role` extracted from the validated JWT payload. Query parameters (e.g. `?role=LECTURER`) and body fields (e.g. `{ "role": "LECTURER" }`) are completely ignored by the guard, preventing client-side role manipulation.
- **Pedagogical Lifecycle Boundary**: In accordance with Rule 4 of the Project Foundation (`DRAFT -> REVIEWED -> APPROVED -> PUBLISHED`), students are barred from accessing cases not in `PUBLISHED` status (`403 Forbidden`).

### 5.3. Multi-Tenant Data Isolation & Ownership Protection (AC-2)
- **Lecturer Course & Case Ownership**: Every course mutation (`PUT /courses/:id`, `DELETE /courses/:id`) and case generation (`POST /cases/generate`) verifies that `course.lecturer_id === authenticatedUser.id`. Cross-lecturer access is denied with `403 Forbidden`.
- **Student Attempt Isolation**: Every branching study attempt is tied to `attempt.student_id === authenticatedUser.id`. Any attempt by another student to inspect steps, submit decision steps, add retrospective reasoning, or submit reflection is denied with `403 Forbidden`.

---

## 6. Conclusion & Sprint 1 Quality Sign-Off

The **[QA-002] Token Expiry, Role Denial & Ownership Leak Regression Suite** (`EBA-110`) has achieved:
- **100% Pass Rate (32/32 tests passed)** across all AC-1, AC-2, and AC-3 scenarios.
- **Zero Regression Defects**: Both `auth-matrix.spec.ts` (23 tests) and `security-regression.spec.ts` (32 tests) pass concurrently without interference.
- **Seamless CI/CD Integration**: Accessible via standard `npm run test:regression` in `backend/package.json`.
- **Sprint 1 Security Gate**: The foundation authentication, RBAC, and multi-tenant resource boundaries for Sprint 1 are verified and production-ready.
