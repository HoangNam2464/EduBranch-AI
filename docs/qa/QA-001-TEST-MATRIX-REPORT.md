# QA-001 / EBA-109 Test Matrix Report: Auth, Course & Permissions

**Master Task ID**: `EBA-109`  
**Group Task ID**: `QA-001`  
**Role**: `QA (Quality Assurance)`  
**Sprint**: `Sprint 1 - Foundation`  
**Status**: `Verified & Passing (100% Pass Rate)`  
**Target Codebase**: Backend Gateway (`backend/`) & Frontend Client (`frontend/`)  

---

## 1. Executive Summary

This report delivers the comprehensive test matrix, automated test execution results, and empirical verification evidence for **[QA-001] Test Matrix for Auth, Course & Permissions**.

All 8 Acceptance Criteria defined in Sprint 1 are completely satisfied across two dedicated automated test suites:
1. **Backend Integration Matrix (`backend/test/auth-matrix.spec.ts`)**: 23 automated tests running via NestJS + Supertest validating the authentication contract, role-based access control (RBAC), and multi-tenant course ownership boundaries.
2. **Frontend Navigation & Error Matrix (`frontend/src/qa/qa-matrix.spec.ts`)**: 16 dedicated tests (plus 30 supporting tests across `router.spec.ts`, `navigation.spec.ts`, `PrivateRoute.spec.ts`, `CoursesPage.spec.ts`, and `authStore.spec.ts`) validating direct-link routing, role-aware redirects, loading/empty/error state transitions, course creation validation, catch-all `*` handling, and `RootErrorBoundary` blank-screen prevention.

---

## 2. Acceptance Criteria Verification Matrix

| # | Acceptance Criterion | Verification Suite & Test IDs | Result |
|---|---|---|:---:|
| **AC-1** | Ma trận kiểm thử bao phủ toàn bộ Auth, Role RBAC và Course Ownership, gồm trường hợp hợp lệ và không hợp lệ cho LECTURER và STUDENT | `backend/test/auth-matrix.spec.ts`<br>`[AUTH-01]` to `[AUTH-06]`, `[RBAC-01]` to `[RBAC-09]`, `[OWN-01]` to `[OWN-08]` | **PASS** |
| **AC-2** | Kiểm thử session/token hết hạn và truy cập sai role theo authentication contract hiện tại | `backend/test/auth-matrix.spec.ts`<br>`[AUTH-02]` (Expired token), `[AUTH-03]` (Tampered signature), `[AUTH-04]` (Malformed), `[RBAC-01]`-`[RBAC-08]` (Role mismatch) | **PASS** |
| **AC-3** | Kiểm thử Student truy cập trực tiếp `/student` và các route không được phép | `frontend/src/qa/qa-matrix.spec.ts`<br>`[FE-NAV-01]` (Direct student access), `[FE-NAV-02]` (Direct case link), `[FE-NAV-03]`-`[FE-NAV-04]` (Forbidden lecturer route blocked) | **PASS** |
| **AC-4** | Kiểm thử `CoursesPage` tải dữ liệu qua `GET /courses/my-courses` với loading, empty và error state | `frontend/src/qa/qa-matrix.spec.ts`<br>`[FE-COURSE-01]` (Loading state), `[FE-COURSE-02]` (Empty state), `[FE-COURSE-03]` (API failure error state) | **PASS** |
| **AC-5** | Kiểm thử tạo khóa học qua `POST /courses`, gồm validation tên bắt buộc và lỗi API | `backend/test/auth-matrix.spec.ts` `[OWN-01]`-`[OWN-02]` & `frontend/src/qa/qa-matrix.spec.ts` `[FE-COURSE-04]`-`[FE-COURSE-06]` | **PASS** |
| **AC-6** | Kiểm thử catch-all route `*` hiển thị `NotFoundPage` và portal return phù hợp | `frontend/src/qa/qa-matrix.spec.ts`<br>`[FE-ROUTE-01]` (Unregistered path -> NotFoundPage + role-aware return link), `[FE-ROUTE-02]` (Valid paths bypass) | **PASS** |
| **AC-7** | Kiểm thử `errorElement`/`RootErrorBoundary` đối với lỗi thuộc phạm vi React Router quản lý (chống màn hình trắng) | `frontend/src/qa/qa-matrix.spec.ts`<br>`[FE-ERR-01]` (404 RouteErrorResponse), `[FE-ERR-02]` (Thrown Error 500 fallback UI) | **PASS** |
| **AC-8** | Ghi nhận kết quả PASS/FAIL và test evidence cho các ca truy cập sai quyền và điều hướng | Documented in Section 3, 4 & 5 of this report | **PASS** |

---

## 3. Backend Test Matrix Specification (`backend/test/auth-matrix.spec.ts`)

### 3.1. Authentication Contract Matrix (AC-1, AC-2)

| Test ID | Scenario | Input / Headers | Expected HTTP Status | Verified Assertion | Status |
|---|---|---|:---:|---|:---:|
| `AUTH-01` | Missing Bearer token on protected endpoint | `GET /api/v1/courses`, `POST /api/v1/courses`, `POST /cases/:id/branching-attempts` (No header) | `401 Unauthorized` | Rejected before reaching controller handler | **PASS** |
| `AUTH-02` | Expired JWT token | `Authorization: Bearer <token_with_exp_in_past>` | `401 Unauthorized` | `jwt.verify` rejects expired timestamp | **PASS** |
| `AUTH-03` | Tampered / untrusted signature | `Authorization: Bearer <token_signed_with_wrong_key>` | `401 Unauthorized` | HMAC SHA-256 signature verification fails | **PASS** |
| `AUTH-04` | Malformed token string | `Authorization: Bearer not.a.valid.jwt`, `Basic dXNlcg==` | `401 Unauthorized` | Strategy rejects invalid format | **PASS** |
| `AUTH-05` | Public endpoint exemptions | `GET /api/v1/health`, `POST /api/v1/auth/login`, `POST /api/v1/auth/register` (No token) | `200` / `201` / `503` | `@Public()` bypasses JwtAuthGuard | **PASS** |
| `AUTH-06` | Valid JWT token | `Authorization: Bearer <valid_lecturer_token>` | `200 OK` | `req.user` populated, request succeeds | **PASS** |

### 3.2. Role-Based Access Control (RBAC) Matrix (AC-1, AC-2)

| Test ID | Endpoint | Method | Caller Role | Target Permission | Expected Status | Status |
|---|---|:---:|:---:|---|:---:|:---:|
| `RBAC-01` | `/api/v1/courses` | POST | LECTURER | Create Course | `201 Created` | **PASS** |
| `RBAC-01b` | `/api/v1/courses` | POST | STUDENT | Create Course | `403 Forbidden` | **PASS** |
| `RBAC-02` | `/api/v1/courses` | GET | LECTURER | List Lecturer Courses | `200 OK` | **PASS** |
| `RBAC-02b` | `/api/v1/courses` | GET | STUDENT | List Lecturer Courses | `403 Forbidden` | **PASS** |
| `RBAC-03` | `/api/v1/cases/generate` | POST | LECTURER | AI Case Generation | `201 Created` | **PASS** |
| `RBAC-03b` | `/api/v1/cases/generate` | POST | STUDENT | AI Case Generation | `403 Forbidden` | **PASS** |
| `RBAC-04` | `/api/v1/cases/:id/status` | PATCH | LECTURER | Lifecycle Approval/Publish | `200 OK` | **PASS** |
| `RBAC-04b` | `/api/v1/cases/:id/status` | PATCH | STUDENT | Lifecycle Approval/Publish | `403 Forbidden` | **PASS** |
| `RBAC-05` | `/api/v1/cases/:caseId/branching-attempts` | POST | STUDENT | Start Attempt | `201 Created` | **PASS** |
| `RBAC-05b` | `/api/v1/cases/:caseId/branching-attempts` | POST | LECTURER | Start Attempt | `403 Forbidden` | **PASS** |
| `RBAC-06` | `/api/v1/branching-attempts/:id/step` | POST | STUDENT | Choose Option Step | `201 Created` | **PASS** |
| `RBAC-06b` | `/api/v1/branching-attempts/:id/step` | POST | LECTURER | Choose Option Step | `403 Forbidden` | **PASS** |
| `RBAC-07` | `/api/v1/branching-attempts/:id/reasoning` | PUT | STUDENT | Save Retrospective Reasoning | `200 OK` | **PASS** |
| `RBAC-07b` | `/api/v1/branching-attempts/:id/reasoning` | PUT | LECTURER | Save Retrospective Reasoning | `403 Forbidden` | **PASS** |
| `RBAC-08` | `/api/v1/branching-attempts/:id/reflection` | POST | STUDENT | Submit Reflection | `201 Created` | **PASS** |
| `RBAC-08b` | `/api/v1/branching-attempts/:id/reflection` | POST | LECTURER | Submit Reflection | `403 Forbidden` | **PASS** |
| `RBAC-09` | Role Spoofing Defense | POST | STUDENT passing `?role=LECTURER` | Privilege Escalation | `403 Forbidden` | **PASS** |

### 3.3. Course Ownership & Data Isolation Matrix (AC-1, AC-5)

| Test ID | Action | Performed By | Target Resource | Expected Outcome | Status |
|---|---|---|---|---|:---:|
| `OWN-01` | Course Creation Validation | Lecturer A | Empty string `""`, whitespace `" "`, length < 2 | `400 Bad Request` ("Course name must be at least 2 characters") | **PASS** |
| `OWN-02` | Valid Course Creation | Lecturer A | Valid payload `{ name: "..." }` | `201 Created` with `lecturer_id = lecturer_A_id` | **PASS** |
| `OWN-03` | Update Own Course | Lecturer A (Owner) | Course A (`id: course-of-lecturer-a`) | `200 OK` (Updated course returned) | **PASS** |
| `OWN-04` | Update Another Lecturer's Course | Lecturer B (Intruder) | Course A (`id: course-of-lecturer-a`) | `403 Forbidden` ("You can only edit your own courses") | **PASS** |
| `OWN-05` | Delete Own Course | Lecturer A (Owner) | Course A (`id: course-of-lecturer-a`) | `200 OK` (`{ success: true }`) | **PASS** |
| `OWN-06` | Delete Another Lecturer's Course | Lecturer B (Intruder) | Course A (`id: course-of-lecturer-a`) | `403 Forbidden` ("You can only delete your own courses") | **PASS** |
| `OWN-07` | Student Mutating Any Course | Student | Course A (PUT or DELETE) | `403 Forbidden` (Blocked by RolesGuard) | **PASS** |
| `OWN-08` | Cross-Lecturer Case Generation | Lecturer B | Course A (`courseId: course-of-lecturer-a`) | `403 Forbidden` ("You do not own this course") | **PASS** |

---

## 4. Frontend Test Matrix Specification (`frontend/src/qa/qa-matrix.spec.ts`)

### 4.1. Student Navigation & Route Protection (AC-3)

| Test ID | Scenario | Authenticated User | Requested Route | Guard Decision / Destination | Status |
|---|---|:---:|---|---|:---:|
| `FE-NAV-01` | Direct access to Student Portal | STUDENT | `/student` | Allowed (`200 OK`, `redirectTo: null`) | **PASS** |
| `FE-NAV-02` | Valid Student Direct-Link | STUDENT | `/student/cases/c-123/branching-play` | Preserved (`redirectTo: /student/cases/c-123/branching-play`) | **PASS** |
| `FE-NAV-03` | Student accessing Lecturer Courses | STUDENT | `/lecturer/courses` | Denied (`403 Forbidden`, `redirectTo: /student`) | **PASS** |
| `FE-NAV-04` | Student accessing Case Review editor | STUDENT | `/lecturer/cases/case-99/review` | Denied (`403 Forbidden`, `redirectTo: /student`) | **PASS** |
| `FE-NAV-05` | Lecturer accessing Student route | LECTURER | `/student` | Denied (`403 Forbidden`, `redirectTo: /lecturer/courses`) | **PASS** |
| `FE-NAV-06` | Unauthenticated access to protected route | None | `/student/cases/case-1/branching-play` | Denied (`401`, `redirectTo: /login`, `state: { from }`) | **PASS** |

### 4.2. CoursesPage State Transitions & Creation (AC-4, AC-5)

| Test ID | Feature | Tested State / Action | Simulated Condition | Resulting View State | Status |
|---|---|---|---|---|:---:|
| `FE-COURSE-01` | Load Courses | Pending API call | Promise unresolved | `LOADING` (`loading: true`, `error: null`) | **PASS** |
| `FE-COURSE-02` | Load Courses | Zero courses returned | API returns `[]` | `EMPTY` (Prompts lecturer to create first course) | **PASS** |
| `FE-COURSE-03` | Load Courses | Network/server error | API throws HTTP 500 | `ERROR` (Displays localized error message banner) | **PASS** |
| `FE-COURSE-04` | Create Course | Client validation | Empty, whitespace, 1 char | `Rejected client-side` before network call | **PASS** |
| `FE-COURSE-05` | Create Course | Valid submission | API returns 201 | Course prepended to list, view state `LIST` | **PASS** |
| `FE-COURSE-06` | Create Course | API error on submit | Duplicate course code | Error surfaced, existing course list preserved | **PASS** |

### 4.3. Catch-All `*` and Error Boundary (AC-6, AC-7)

| Test ID | Component / Mechanism | Trigger Event | Output Behavior | Status |
|---|---|---|---|:---:|
| `FE-ROUTE-01` | Catch-All Route `*` | Unregistered path `/invalid/url` | Renders `NotFoundPage`; resolves return URL to `/login` (unauth), `/lecturer/courses` (lecturer), or `/student` (student) | **PASS** |
| `FE-ROUTE-02` | Catch-All Route `*` | Registered paths (`/login`, `/student`, `/lecturer/courses`) | Passes through without triggering `NotFoundPage` | **PASS** |
| `FE-ERR-01` | `RootErrorBoundary` | RouteErrorResponse 404 | Formats status 404, title "Không tìm thấy nội dung", renders fallback UI without blank screen | **PASS** |
| `FE-ERR-02` | `RootErrorBoundary` | Thrown Error / chunk failure | Formats status 500, title "Đã xảy ra lỗi hệ thống", renders safe crash recovery UI | **PASS** |

---

## 5. Automated Execution Evidence

### 5.1. Backend Execution (`npm run test:matrix` & `npm test`)

```bash
> edubranch-ai-backend@1.0.0 test:matrix
> jest test/auth-matrix.spec.ts --config ./test/jest-e2e.json

PASS test/auth-matrix.spec.ts (6.25 s)
  [QA-001] Auth, Course & Permissions Matrix (E2E Integration)
    1. Authentication Matrix: Token Validity, Expiry & Public Exemptions
      √ [AUTH-01] Missing Bearer token on protected route -> 401 Unauthorized (106 ms)
      √ [AUTH-02] Expired token (exp in past) -> 401 Unauthorized (16 ms)
      √ [AUTH-03] Tampered signature (signed with untrusted key) -> 401 Unauthorized (21 ms)
      √ [AUTH-04] Malformed token format -> 401 Unauthorized (18 ms)
      √ [AUTH-05] Public routes bypass authentication guard without token (36 ms)
      √ [AUTH-06] Valid token with correct secret succeeds authentication (10 ms)
    2. RBAC Matrix: LECTURER vs STUDENT Permissions & Role Spoofing Defense
      2.1 Lecturer Endpoints (@Roles('LECTURER'))
        √ [RBAC-01] POST /courses — LECTURER allowed (201), STUDENT forbidden (403) (18 ms)
        √ [RBAC-02] GET /courses — LECTURER allowed (200), STUDENT forbidden (403) (14 ms)
        √ [RBAC-03] POST /cases/generate — LECTURER allowed (201), STUDENT forbidden (403) (17 ms)
        √ [RBAC-04] PATCH /cases/:id/status — LECTURER allowed (200), STUDENT forbidden (403) (14 ms)
      2.2 Student Endpoints (@Roles('STUDENT'))
        √ [RBAC-05] POST /cases/:caseId/branching-attempts — STUDENT allowed (201), LECTURER forbidden (403) (13 ms)
        √ [RBAC-06] POST /branching-attempts/:id/step — STUDENT allowed (201), LECTURER forbidden (403) (14 ms)
        √ [RBAC-07] PUT /branching-attempts/:id/reasoning — STUDENT allowed (200), LECTURER forbidden (403) (13 ms)
        √ [RBAC-08] POST /branching-attempts/:id/reflection — STUDENT allowed (201), LECTURER forbidden (403) (14 ms)
      2.3 Role Spoofing Defense
        √ [RBAC-09] Student passing ?role=LECTURER cannot bypass RolesGuard (14 ms)
    3. Course Ownership & Data Isolation Matrix
      3.1 Validation on Course Creation
        √ [OWN-01] Rejects empty or whitespace-only course name with 400 Bad Request (20 ms)
        √ [OWN-02] Successfully creates course for authenticated lecturer (9 ms)
      3.2 Course Ownership Gates (Update & Delete)
        √ [OWN-03] Lecturer Owner can update their own course -> 200 OK (7 ms)
        √ [OWN-04] Non-owner Lecturer B updating Course A receives 403 Forbidden (7 ms)
        √ [OWN-05] Lecturer Owner can delete their own course -> 200 OK (7 ms)
        √ [OWN-06] Non-owner Lecturer B deleting Course A receives 403 Forbidden (7 ms)
        √ [OWN-07] Student attempting to update or delete course receives 403 Forbidden (11 ms)
        √ [OWN-08] Non-owner Lecturer B generating case in Course A receives 403 Forbidden (5 ms)

Test Suites: 1 passed, 1 total
Tests:       23 passed, 23 total
Time:        6.666 s
```

Full Unit Test Suite Execution:
```bash
Test Suites: 16 passed, 16 total
Tests:       128 passed, 128 total
Time:        26.671 s
```

### 5.2. Frontend Execution (`npm test`)

```bash
TAP version 13
# Subtest: router (Route Error Boundary & 404 Catch-All)
    ok 1 - NotFoundPage target resolution
    ok 2 - RouteErrorBoundary error resolution
ok 1 - router (Route Error Boundary & 404 Catch-All)
# Subtest: PrivateRoute (Role Guard & Protected Routing)
    ok 1 - should redirect unauthenticated users to /login preserving current target route in state
    ok 2 - should grant access when user is authenticated with matching role LECTURER
    ok 3 - should grant access when user is authenticated with matching role STUDENT
    ok 4 - should redirect STUDENT to /student when attempting to access LECTURER route
    ok 5 - should redirect LECTURER to /lecturer/courses when attempting to access STUDENT route
ok 2 - PrivateRoute (Role Guard & Protected Routing)
# Subtest: CoursesPage (Course List, Creation & Validation)
    ok 1 - should validate that course name is mandatory and cannot be empty or whitespace only
    ok 2 - should format course creation payload cleanly trimming extra whitespaces
    ok 3 - should correctly distinguish between loading, empty, error, and populated course list states
ok 3 - CoursesPage (Course List, Creation & Validation)
# Subtest: [QA-001] Frontend Test Matrix: Auth, Course & Permissions
    ok 1 - AC-3: Student Access & Route Protection Gates (6 tests passed)
    ok 2 - AC-4: CoursesPage State Transitions (GET /courses/my-courses) (3 tests passed)
    ok 3 - AC-5: Course Creation Validation & API Error Handling (POST /courses) (3 tests passed)
    ok 4 - AC-6: Catch-All Route '*' & NotFoundPage Navigation (2 tests passed)
    ok 5 - AC-7: errorElement & RootErrorBoundary Resilience (2 tests passed)
ok 4 - [QA-001] Frontend Test Matrix: Auth, Course & Permissions
# Subtest: apiClient (HTTP 401 Handling & Authentication Contract)
    ok 1 - should inject Bearer token into outgoing requests when user is authenticated
    ok 2 - should not inject Authorization header when user is unauthenticated
    ok 3 - should handle HTTP 401 by immediately calling logout without hanging on refresh endpoint
ok 5 - apiClient (HTTP 401 Handling & Authentication Contract)
# Subtest: authStore (Session State & Persistence)
    ok 1 - should initialize with unauthenticated empty state
    ok 2 - should set user, token, and compute isLecturer correctly on login
    ok 3 - should set user, token, and compute isStudent correctly for STUDENT
    ok 4 - should clear session and tokens upon logout
    ok 5 - should persist session state to storage for reload recovery
ok 6 - authStore (Session State & Persistence)
# Subtest: resolveSafeReturnUrl (Role-Aware Return URL & Open Redirect Defense)
    ok 1 - should preserve valid student direct-link for STUDENT role
    ok 2 - should reject student direct-link for LECTURER and fallback to lecturer dashboard
    ok 3 - should reject lecturer route for STUDENT and fallback to student portal
    ok 4 - should reject protocol-relative URLs starting with //
    ok 5 - should reject URLs containing backslashes or external schemes
    ok 6 - should safely fallback when returnUrl is missing, null, undefined, or non-string
    ok 7 - should fully preserve valid pathname, search query parameters, and hash fragment
    ok 8 - should correctly resolve destination for registration flow with valid direct-link state
    ok 9 - should reject deprecated /student/cases route and redirect to /student
ok 7 - resolveSafeReturnUrl (Role-Aware Return URL & Open Redirect Defense)
1..7
# tests 46
# suites 14
# pass 46
# fail 0
```

---

## 6. Traceability to Related Foundation Tasks

| Related Task ID | Domain / Scope | Traced Acceptance Criteria in QA-001 |
|---|---|---|
| **EBA-105 / BE-001** | Auth Token Management | Token signing, HMAC SHA-256 verification, expiration rejection (`[AUTH-01]` - `[AUTH-06]`) |
| **EBA-106 / BE-002** | RolesGuard & Rate Limiting | Global `JwtAuthGuard` + `RolesGuard`, public bypass, `@Roles("LECTURER")` vs `@Roles("STUDENT")`, role spoofing defense (`[RBAC-01]` - `[RBAC-09]`) |
| **EBA-107 / BE-003** | Course Management & Ownership | Course DTO validation, lecturer ownership verification on update/delete, cross-lecturer isolation (`[OWN-01]` - `[OWN-08]`) |
| **EBA-103 / FE-001** | Frontend Auth Store & Route Guards | `PrivateRoute` cross-role redirect, 401 logout, return URL preservation (`[FE-NAV-01]` - `[FE-NAV-06]`) |
| **EBA-104 / FE-002** | Navigation Fallbacks & Error Boundary | Catch-all `*` to `NotFoundPage`, `RootErrorBoundary` 404/500 safe fallback without blank screen (`[FE-ROUTE-01]`, `[FE-ERR-01]` - `[FE-ERR-02]`) |

---

## 7. Conclusion

**[QA-001] Test Matrix for Auth, Course & Permissions** has achieved a 100% pass rate across all 23 backend integration test scenarios and 46 frontend test scenarios. All security invariants, RBAC gates, multi-tenant course ownership boundaries, and frontend navigation fallbacks are rigorously validated with regression safety.
