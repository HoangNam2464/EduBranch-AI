# Data Model: Courses & Materials Rework [FE-026]

**Feature Directory**: `specs/001-fe026-courses-materials`  
**Date**: 2026-11-15  
**Status**: Completed  
**Domain**: Higher-Education Course & Material Management (Lecturer Portal)

---

## 1. Entity Definitions & Schemas

### 1.1. Course (`Khóa học`)
The root container for teaching materials and case studies belonging to a lecturer.

| Field | Type | Required | Constraints & Validation | Description |
|---|---|:---:|---|---|
| `id` | `UUID` | Yes | Primary key, UUID v4 | Unique identifier of the course |
| `name` | `string` | Yes | `min(1)`, `max(255)`, trimmed | Official name of the course |
| `courseCode` | `string` | No | `max(20)`, alphanumeric & dashes | Course catalog identifier (e.g. "CS101", "MKT302") |
| `description` | `string` | No | `max(1000)` | Syllabus or overview summary |
| `coverImageUrl` | `string` | No | Valid URL | Visual thumbnail / banner image |
| `is_active` | `boolean` | Yes | Default: `true` | Active status; set to `false` when soft-archived (OPD-014) |
| `lecturerId` | `UUID` | Yes | Foreign key → `users.id` | Owner of the course (`LECTURER` role) |
| `createdAt` | `timestamp` | Yes | ISO 8601 | Record creation timestamp |
| `updatedAt` | `timestamp` | Yes | ISO 8601 | Last modification timestamp |

#### Derived / Aggregate Client Fields (via Course Overview / Mappers)
- `materialCount`: `number` (count of materials linked to this course)
- `caseCount`: `number` (count of case studies linked to this course)
- `readyMaterialCount`: `number` (count of materials with `processingStatus === 'COMPLETED'`)

---

### 1.2. Material (`Tài liệu môn học`)
An uploaded academic document (PDF or DOCX) ingested into MinIO and processed through the RAG pipeline into pgvector.

| Field | Type | Required | Constraints & Validation | Description |
|---|---|:---:|---|---|
| `id` | `UUID` | Yes | Primary key, UUID v4 | Unique identifier of the material record |
| `courseId` | `UUID` | Yes | Foreign key → `courses.id` | Associated course |
| `originalFilename` | `string` | Yes | `min(1)`, `max(255)` | Original client filename |
| `storageKey` | `string` | Yes | Unique path | Object key in MinIO storage bucket |
| `mimeType` | `string` | Yes | `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Normalized MIME type |
| `sizeBytes` | `number` | Yes | `min(1)`, `max(52428800)` (50MB) | File size in bytes (`MAX_SIZE_BYTES`) |
| `processingStatus` | `enum` | Yes | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` | Current state of RAG vectorization pipeline |
| `chunkCount` | `number` | Yes | `min(0)`, default: `0` | Number of extracted text chunks in pgvector |
| `processingError` | `string` | No | Text | Error message if processing failed |
| `uploadedAt` | `timestamp` | Yes | ISO 8601 | Upload timestamp |
| `indexedAt` | `timestamp` | No | ISO 8601 | Completion timestamp of vector indexing |

---

### 1.3. Chunk (`Đoạn trích RAG`)
A parsed and embedded text segment stored in `material_chunks` (pgvector) used for grounded case generation.

| Field | Type | Required | Constraints & Validation | Description |
|---|---|:---:|---|---|
| `id` | `UUID` | Yes | Primary key, UUID v4 | Unique identifier of the chunk |
| `materialId` | `UUID` | Yes | Foreign key → `materials.id` | Source material record |
| `chunkIndex` | `number` | Yes | `min(0)` | Sequential index of chunk in document |
| `pageNumber` | `number` | Yes | `min(1)` | Document page number where chunk originated |
| `content` | `string` | Yes | Non-empty | Clean normalized text content |
| `tokenCount` | `number` | No | `min(0)` | Estimated token length |

---

## 2. State Machines & Lifecycle Transitions

### 2.1. Material Processing Lifecycle
```
                 Upload Accepted
[Client File] ─────────────────────► PENDING
                                        │
                                        │ AI Service Ingestion Started
                                        ▼
                                   PROCESSING (polling 3s)
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                    COMPLETED                       FAILED
                 (✓ chunkCount)             (processingError displayed)
                         │                             │
                         │                             │ User clicks "Tải lên lại"
                         ▼                             ▼
                 RAG Inspector (02.7)          Upload Modal (02.5)
                 Active Knowledge Base         (new upload record initiated)
```

- **PENDING**: Initial state upon successful upload to MinIO and database record creation.
- **PROCESSING**: AI service is actively normalizing, chunking, and embedding document vectors into pgvector. Frontend polls every 3 seconds.
- **COMPLETED**: Pipeline succeeded. `chunkCount > 0`. Material is ready for case generation and inspection in RAG Source Inspector (02.7).
- **FAILED**: Pipeline encountered an error (e.g. unreadable scanned PDF, corruption). Error message stored in `processingError`. The action button displays "Tải lên lại" (PO Q3), opening the upload dialog with the error context.

### 2.2. Course Lifecycle (Soft Archive OPD-014)
```
[Course Drafted] ──► ACTIVE (`is_active = TRUE`)
                          │
                          │ Lecturer confirms archive (Dialog 02.3)
                          ▼
                     ARCHIVED (`is_active = FALSE`)
```
- When `is_active = TRUE`, course appears in active lists and navigation.
- When `is_active = FALSE`, course is hidden from active courses view. All child materials, chunks, and MinIO objects are completely preserved.

---

## 3. Client-Side Validation Rules

| Entity / Action | Input Field | Validation Rule | Error Message (Vietnamese) |
|---|---|---|---|
| Course Create/Edit | `name` | `string`, `trim().length >= 1 && <= 255` | "Tên khóa học không được để trống" |
| Course Create/Edit | `courseCode` | Optional, `length <= 20`, alphanumeric & dashes | "Mã khóa học tối đa 20 ký tự" |
| Course Create/Edit | `description` | Optional, `length <= 1000` | "Mô tả khóa học tối đa 1000 ký tự" |
| Material Upload | `file` (format) | Extension must be `.pdf` or `.docx` | "Hệ thống chỉ hỗ trợ định dạng PDF hoặc DOCX" |
| Material Upload | `file` (size) | `sizeBytes <= 50 * 1024 * 1024` (50MB) | "Dung lượng tệp vượt quá giới hạn tối đa 50MB" |
| Material Upload | `file` (empty) | `sizeBytes > 0` | "Tệp không có nội dung (0 bytes)" |
| Material Delete | Confirmation | Explicit user confirmation click in dialog (02.6) | "Hành động này sẽ xóa vĩnh viễn tài liệu và các đoạn trích dẫn liên quan" |
