# API Contracts: Materials [FE-026]

**Base URL**: `/api/v1` (configured via `VITE_API_BASE_URL`)  
**Authentication**: Bearer JWT in `Authorization` header  
**Role Required**: `LECTURER`  
**Ownership Invariant**: All operations restricted to materials/courses owned by `currentUser.id`.  
**Frontend Mapping Note**: The backend gateway returns response payloads in the envelope `{ "status": "SUCCESS", "data": ... }` with snake_case database fields. Mapping from snake_case to frontend camelCase domain models (`originalFilename`, `sizeBytes`, `processingStatus`, `chunkCount`, etc.) is handled in `frontend/src/services/mappers/material.ts` (FE-023 target structure).

---

## 1. Existing Backend Endpoints

### 1.1. List Materials of Course
- **Method / Endpoint**: `GET /courses/:courseId/materials`
- **Controller Source**: `backend/src/modules/material/material.controller.ts:50` (`MaterialController.getCourseMaterials`)
- **Path Parameters**:
  - `courseId`: UUID of the parent course
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": [
    {
      "id": "b3e51a22-9844-48d1-b51c-7033d5fef092",
      "original_filename": "Giao_trinh_Kinh_te_Vi_mo.pdf",
      "stored_object_key": "materials/e2b67f18-4235-4cb2-9386-b413000b925f/84a10e6a/Giao_trinh_Kinh_te_Vi_mo.pdf",
      "mime_type": "application/pdf",
      "size_bytes": 14205800,
      "course_id": "e2b67f18-4235-4cb2-9386-b413000b925f",
      "uploaded_by": "84a10e6a-7f28-4448-9366-419bca883731",
      "processing_status": "COMPLETED",
      "chunk_count": 84,
      "processing_error": null,
      "uploaded_at": "2026-10-02T09:15:00.000Z",
      "updated_at": "2026-10-02T09:16:30.000Z"
    },
    {
      "id": "c4f62b33-0955-49e2-c62d-8144e6fff103",
      "original_filename": "Tinh_huong_doc_quyen_nhom.docx",
      "stored_object_key": "materials/e2b67f18-4235-4cb2-9386-b413000b925f/93b21f7b/Tinh_huong_doc_quyen_nhom.docx",
      "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "size_bytes": 2048500,
      "course_id": "e2b67f18-4235-4cb2-9386-b413000b925f",
      "uploaded_by": "84a10e6a-7f28-4448-9366-419bca883731",
      "processing_status": "FAILED",
      "chunk_count": 0,
      "processing_error": "AI processing error: Corrupted document stream",
      "uploaded_at": "2026-10-05T14:30:00.000Z",
      "updated_at": "2026-10-05T14:30:45.000Z"
    }
  ]
}
```
- **Error Responses**:
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Course belongs to another lecturer.
  - `404 Not Found`: Course ID not found.

---

### 1.2. Upload Material to Course
- **Method / Endpoint**: `POST /courses/:courseId/materials`
- **Controller Source**: `backend/src/modules/material/material.controller.ts:33` (`MaterialController.uploadCourseMaterial`)
- **Content-Type**: `multipart/form-data`
- **Path Parameters**:
  - `courseId`: UUID of the parent course
- **Form Data Field**:
  - `file`: binary file (`application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `<= 50 * 1024 * 1024` bytes per `backend/src/modules/material/material.service.ts:19`).
- **Success Response (201 Created)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "d5a73c44-1066-4af3-d73e-9255f7000214",
    "original_filename": "Chien_luoc_dinh_gia.pdf",
    "stored_object_key": "materials/e2b67f18-4235-4cb2-9386-b413000b925f/d5a73c44/Chien_luoc_dinh_gia.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 8512300,
    "course_id": "e2b67f18-4235-4cb2-9386-b413000b925f",
    "uploaded_by": "84a10e6a-7f28-4448-9366-419bca883731",
    "processing_status": "COMPLETED",
    "chunk_count": 42,
    "processing_error": null,
    "uploaded_at": "2026-11-15T15:00:00.000Z",
    "updated_at": "2026-11-15T15:01:20.000Z"
  }
}
```
- **Error Responses**:
  - `400 Bad Request`: Missing file, empty file (`0 bytes`), or unsupported MIME type (only PDF and DOCX permitted).
  - `403 Forbidden`: Course belongs to another lecturer.
  - `404 Not Found`: Course ID not found.

---

### 1.3. Get Material Details
- **Method / Endpoint**: `GET /materials/:id`
- **Controller Source**: `backend/src/modules/material/material.controller.ts:65` (`MaterialController.getMaterialById`)
- **Path Parameters**:
  - `id`: UUID of the material
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "id": "b3e51a22-9844-48d1-b51c-7033d5fef092",
    "original_filename": "Giao_trinh_Kinh_te_Vi_mo.pdf",
    "stored_object_key": "materials/e2b67f18-4235-4cb2-9386-b413000b925f/84a10e6a/Giao_trinh_Kinh_te_Vi_mo.pdf",
    "mime_type": "application/pdf",
    "size_bytes": 14205800,
    "course_id": "e2b67f18-4235-4cb2-9386-b413000b925f",
    "uploaded_by": "84a10e6a-7f28-4448-9366-419bca883731",
    "processing_status": "COMPLETED",
    "chunk_count": 84,
    "processing_error": null,
    "uploaded_at": "2026-10-02T09:15:00.000Z",
    "updated_at": "2026-10-02T09:16:30.000Z"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: Material belongs to another lecturer's course.
  - `404 Not Found`: Material ID not found.

---

### 1.4. Delete Material (Canonical Backend Route)
- **Method / Endpoint**: `DELETE /materials/:id`
- **Controller Source**: `backend/src/modules/material/material.controller.ts:80` (`MaterialController.deleteMaterial`)
- **Note**: Fixed in FE-026 per PO Q5 (`[PO-ĐÃ-XÁC-NHẬN]`). Replaces erroneous legacy path `DELETE /courses/:courseId/materials/:id`.
- **Path Parameters**:
  - `id`: UUID of the material to delete
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "message": "Teaching material deleted successfully"
  }
}
```
- **Error Responses**:
  - `403 Forbidden`: Material does not belong to user's course.
  - `404 Not Found`: Material ID does not exist.

---

## 2. Proposed Endpoints [ĐỀ-XUẤT]

### 2.1. Get Material Chunks [ĐỀ-XUẤT] (PO Q2)
- **Method / Endpoint**: `GET /materials/:id/chunks` `[ĐỀ-XUẤT]`
- **Description**: Proposed backend endpoint to retrieve parsed pgvector chunks for RAG Source Inspector (02.7). Eliminates `MOCK_CHUNKS` and `OTHER_DOCUMENTS`.
- **Envelope**: Standard backend envelope `{ "status": "SUCCESS", "data": ... }`
- **Path Parameters**:
  - `id`: UUID of the material
- **Query Parameters**:
  - `page`: optional number (default: 1)
  - `limit`: optional number (default: 20)
- **Success Response (200 OK)**:
```json
{
  "status": "SUCCESS",
  "data": {
    "material_id": "b3e51a22-9844-48d1-b51c-7033d5fef092",
    "original_filename": "Giao_trinh_Kinh_te_Vi_mo.pdf",
    "total_chunks": 84,
    "page_count": 120,
    "size_bytes": 14205800,
    "page": 1,
    "limit": 20,
    "items": [
      {
        "id": "e6a84d55-2177-4ba4-e84f-0366a8111325",
        "chunk_index": 0,
        "page_number": 1,
        "content": "Chương 1: Tổng quan về kinh tế học vi mô. Kinh tế học là môn khoa học nghiên cứu cách thức xã hội quản lý các nguồn lực khan hiếm...",
        "token_count": 245
      },
      {
        "id": "f7b95e66-3288-4cb5-f95a-1477b9222436",
        "chunk_index": 1,
        "page_number": 2,
        "content": "Nguyên lý thứ nhất: Con người đối mặt với sự đánh đổi. Để có được một thứ ưa thích, chúng ta thường phải từ bỏ một thứ khác...",
        "token_count": 310
      }
    ]
  }
}
```
- **Empty / Pending Fallback in Frontend**: If endpoint returns 404 or pending status, UI renders authentic `EmptyState` explaining that chunk index inspection is awaiting backend integration (Zero Fake Data Policy).
