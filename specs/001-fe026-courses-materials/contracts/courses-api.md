# API Contracts: Courses [FE-026]

**Base URL**: `/api/v1` (configured via `VITE_API_BASE_URL`)  
**Authentication**: Bearer JWT in `Authorization` header  
**Role Required**: `LECTURER`  
**Ownership Invariant**: All operations restricted to courses where `lecturer_id = currentUser.id`.  
**Frontend Mapping Note**: The backend gateway returns response payloads in the envelope `{ "status": "SUCCESS", "data": ... }` with snake_case database fields. Mapping from snake_case to frontend camelCase domain models (and derivation of client counts like `materialCount`, `caseCount`) is handled cleanly in `frontend/src/services/mappers/course.ts` (FE-023 target structure (expected; not on develop `273f1fc`; verified by T028)).

---

## 1. Existing Backend Endpoints

### 1.1. List Lecturer Courses
- **Method / Endpoint**: `GET /courses`
- **Controller Source**: `backend/src/modules/course/course.controller.ts:44` (`CourseController.getMyCourses`)
- **Query Parameters**: None. The backend endpoint returns all active/created courses for the authenticated lecturer ordered by `created_at DESC`. Search and filtering on the Courses Page (02.1) are executed client-side over this dataset.
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "e2b67f18-4235-4cb2-9386-b413000b925f",
      "name": "Kinh tế vi mô ứng dụng",
      "description": "Nghiên cứu hành vi ra quyết định của các chủ thể kinh tế",
      "course_code": "ECO201",
      "lecturer_id": "84a10e6a-7f28-4448-9366-419bca883731",
      "active": true,
      "is_active": true,
      "created_at": "2026-10-01T08:00:00.000Z",
      "updated_at": "2026-10-15T10:30:00.000Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT token.
  - `403 Forbidden`: Authenticated user does not possess the `LECTURER` role.

---

### 1.2. Create Course
- **Method / Endpoint**: `POST /courses`
- **Controller Source**: `backend/src/modules/course/course.controller.ts:33` (`CourseController.createCourse`)
- **Request Body (`application/json`)**:
```json
{
  "name": "Luật Thương mại Quốc tế",
  "courseCode": "LAW301",
  "description": "Các quy chế pháp lý và tranh chấp trong hoạt động xuất nhập khẩu"
}
```
- **Validation Rules (`CreateCourseDto`)**:
  - `name`: string, required, trimmed, min 2, max 200 (`MinLength(2)`, `MaxLength(200)`)
  - `courseCode`: string, optional, max 20 (`MaxLength(20)`)
  - `description`: string, optional, max 1000 (`MaxLength(1000)`)
- **Success Response (201 Created)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "7a3e81d4-8d91-49b2-a43b-6f81a71ef084",
    "name": "Luật Thương mại Quốc tế",
    "description": "Các quy chế pháp lý và tranh chấp trong hoạt động xuất nhập khẩu",
    "course_code": "LAW301",
    "lecturer_id": "84a10e6a-7f28-4448-9366-419bca883731",
    "active": true,
    "is_active": true,
    "created_at": "2026-11-15T14:00:00.000Z",
    "updated_at": "2026-11-15T14:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure (name < 2 chars, name > 200 chars, description > 1000 chars, invalid types).
  - `401 Unauthorized`: Missing or invalid JWT token.

---

### 1.3. Get Course Details
- **Method / Endpoint**: `GET /courses/:courseId`
- **Controller Source**: `backend/src/modules/course/course.controller.ts:51` (`CourseController.getCourse`)
- **Path Parameters**:
  - `courseId`: UUID of the course
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "e2b67f18-4235-4cb2-9386-b413000b925f",
    "name": "Kinh tế vi mô ứng dụng",
    "description": "Nghiên cứu hành vi ra quyết định của các chủ thể kinh tế",
    "course_code": "ECO201",
    "lecturer_id": "84a10e6a-7f28-4448-9366-419bca883731",
    "active": true,
    "is_active": true,
    "created_at": "2026-10-01T08:00:00.000Z",
    "updated_at": "2026-10-15T10:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `404 Not Found`: Course ID not found in database.

---

### 1.4. Update Course
- **Method / Endpoint**: `PUT /courses/:courseId`
- **Controller Source**: `backend/src/modules/course/course.controller.ts:60` (`CourseController.updateCourse`)
- **Path Parameters**:
  - `courseId`: UUID of the course to update
- **Request Body (`application/json`)**:
```json
{
  "name": "Luật Thương mại Quốc tế (Nâng cao)",
  "courseCode": "LAW301-A",
  "description": "Cập nhật các tình huống tranh chấp theo CISG"
}
```
- **Validation Rules (`UpdateCourseDto`)**:
  - `name`: string, optional, min 2, max 200
  - `courseCode`: string, optional, max 20
  - `description`: string, optional, max 1000
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "7a3e81d4-8d91-49b2-a43b-6f81a71ef084",
    "name": "Luật Thương mại Quốc tế (Nâng cao)",
    "description": "Cập nhật các tình huống tranh chấp theo CISG",
    "course_code": "LAW301-A",
    "lecturer_id": "84a10e6a-7f28-4448-9366-419bca883731",
    "active": true,
    "is_active": true,
    "created_at": "2026-11-15T14:00:00.000Z",
    "updated_at": "2026-11-15T14:30:00.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Course belongs to another lecturer.
  - `404 Not Found`: Course ID does not exist.

---

### 1.5. Delete Course (Legacy Endpoint)
- **Method / Endpoint**: `DELETE /courses/:courseId`
- **Controller Source**: `backend/src/modules/course/course.controller.ts:71` (`CourseController.deleteCourse`)
- **Path Parameters**:
  - `courseId`: UUID of the course
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "message": "Course deleted successfully"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: Course belongs to another lecturer.
  - `404 Not Found`: Course ID does not exist.
  - `500 Internal Server Error`: Thrown when course contains materials/cases due to foreign key cascade restrictions. (Conflict C1: C1-A Figma 02.3 hard delete vs C1-B PO Q4 soft archive; `BLOCKED-ON-C1 — pending PO`).

---

## 2. Proposed Endpoints [ĐỀ-XUẤT]

### 2.1. Archive Course [ĐỀ-XUẤT] (BE-PROP-2, PO Q4 & OPD-014, BLOCKED-ON-C1: C1-B)
- **Status**: PROPOSED — not created in Jira (see `specs/001-fe026-courses-materials/be-dependencies.md`, task `BE-PROP-2`). Requires PO approval.
- **Method / Endpoint**: `PATCH /courses/:courseId/archive` `[ĐỀ-XUẤT]`
- **Description**: Soft-archives a course by updating the existing database column `is_active = FALSE` (`backend/migrations/V1__init_schema.sql:39`). Retains all child materials in `teaching_materials`, vector chunks in pgvector, and raw objects in MinIO storage without foreign key cascade failures. Active course queries filter `WHERE is_active = TRUE`. Blocks frontend tasks `T005`, `T011`, `T029`.
- **Envelope**: Standard backend envelope `{ "status": "SUCCESS", "data": ... }`
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "e2b67f18-4235-4cb2-9386-b413000b925f",
    "name": "Kinh tế vi mô ứng dụng",
    "description": "Nghiên cứu hành vi ra quyết định của các chủ thể kinh tế",
    "course_code": "ECO201",
    "lecturer_id": "84a10e6a-7f28-4448-9366-419bca883731",
    "active": false,
    "is_active": false,
    "created_at": "2026-10-01T08:00:00.000Z",
    "updated_at": "2026-11-15T16:00:00.000Z"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: Caller does not own the course (`lecturer_id !== currentUser.id`).
  - `404 Not Found`: Course ID does not exist.

---

### 2.2. Server-Side Pagination & Filtering [ĐỀ-XUẤT] (Future Consideration)
- If the backend is enhanced in a future sprint to support server-side pagination and query parameters (`page`, `limit`, `search`, `status`), the envelope must remain standard:
```json
{
  "status": "SUCCESS",
  "data": {
    "items": [
      {
        "id": "e2b67f18-4235-4cb2-9386-b413000b925f",
        "name": "Kinh tế vi mô ứng dụng",
        "course_code": "ECO201",
        "is_active": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```
Currently in FE-026, existing endpoint `GET /courses` returns `{ "status": "SUCCESS", "data": [...] }` directly without pagination parameters.
