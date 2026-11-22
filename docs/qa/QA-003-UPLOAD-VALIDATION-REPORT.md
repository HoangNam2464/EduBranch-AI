# QA-003 / EBA-217 Test Verification Report: Material Upload Validation, File Types & Size Bounds

**Master Task ID**: `EBA-217`  
**Group Task ID**: `QA-003`  
**Role**: `QA (Quality Assurance)`  
**Sprint**: `Sprint 2 - Material & RAG`  
**Flow**: `Flow 1`  
**Status**: `Verified & Passing (100% Pass Rate)`  
**Target Codebase**: Backend Gateway (`backend/`) & Frontend Client (`frontend/`)  
**Associated Issues**: `EBA-204` (FE-003), `EBA-208` (BE-005)

---

## 1. Executive Summary

This report delivers the automated test matrix, validation assertions, and empirical verification evidence for **[QA-003] Test Suite for Material Upload Validation, File Types & Size Bounds**.

All 3 Acceptance Criteria defined in Sprint 2 are completely satisfied across two dedicated automated test suites:
1. **Backend Integration & Storage Verification Suite (`backend/test/material-upload.spec.ts`)**:
   - Merged in PR #40.
   - Validates live upload via `POST /api/v1/courses/:courseId/materials` (multipart), MIME type filtering, MinIO object persistence, strict rollback on rejection (zero database or storage leak), 50 MB boundary checks, and backend resilience during AI service outages (`QA_AI_DOWN=1`).
2. **Frontend Validation & Error Handling Suite (`frontend/src/qa/material-upload-qa.spec.ts`)**:
   - 10 automated unit & component controller tests running via Node test runner (`tsx --test`).
   - Validates client-side file extension checking, 50 MB bound calculation, upload queue progress tracking, network/API failure handling (anti-swallowing verification), and item removal from queue.

---

## 2. Acceptance Criteria Verification Matrix

| # | Acceptance Criterion | Verification Suite & Test Files | Status |
|---|---|---|:---:|
| **AC-1** | Kiểm thử thành công upload file PDF và DOCX hợp lệ | `backend/test/material-upload.spec.ts`<br>`frontend/src/qa/material-upload-qa.spec.ts` | **PASS** |
| **AC-2** | Kiểm thử từ chối các file sai MIME type, file dung lượng >50MB | `backend/test/material-upload.spec.ts`<br>`frontend/src/qa/material-upload-qa.spec.ts` | **PASS** |
| **AC-3** | Kiểm thử xử lý lỗi mạng, API thất bại và hiển thị trạng thái lỗi phù hợp (không báo thành công giả tạo) | `backend/test/material-upload.spec.ts`<br>`frontend/src/qa/material-upload-qa.spec.ts`<br>`frontend/src/pages/materials/MaterialsPage.tsx` | **PASS** |

---

## 3. Test Matrix Specification

### 3.1. File Type & MIME Validation Matrix (AC-1, AC-2)

| Test ID | Test Scenario | Input / MIME | Target Layer | Expected Result | Status |
|---|---|---|:---:|---|:---:|
| `MAT-UPL-01` | Valid PDF file upload | `sample.pdf` (`application/pdf`) | Backend + Frontend | Accepted (HTTP 201), stored in MinIO, metadata persisted | **PASS** |
| `MAT-UPL-02` | Valid DOCX file upload | `sample.docx` (`application/vnd.openxmlformats-...`) | Backend + Frontend | Accepted (HTTP 201), stored in MinIO, metadata persisted | **PASS** |
| `MAT-UPL-03` | Batch upload multiple valid files | Multiple `.pdf` & `.docx` | Frontend Queue | Both queued with `error: undefined`, progress tracked | **PASS** |
| `MAT-UPL-04` | Unsupported extensions | `.exe`, `.txt`, `.png`, `.csv`, `.zip` | Frontend + Backend | Rejected immediately with `invalidType`, 0 files uploaded | **PASS** |
| `MAT-UPL-05` | Spoofed extension | Renamed `.txt` to `.pdf` | Backend Ingestion | Parser rejects with HTTP 422, status FAILED | **PASS** |

### 3.2. Size Bounds & Boundary Conditions Matrix (AC-2)

| Test ID | Test Scenario | File Size | Target Layer | Expected Result | Status |
|---|---|---|:---:|---|:---:|
| `MAT-SIZE-01` | Normal valid size | `1 MB` – `10 MB` | Backend + Frontend | Accepted, size recorded accurately in `size_bytes` | **PASS** |
| `MAT-SIZE-02` | Exact 50 MB boundary | `52,428,800 bytes` (50 MB) | Backend + Frontend | Accepted, boundary check `<= 50 * 1024 * 1024` passes | **PASS** |
| `MAT-SIZE-03` | Exceeding 50 MB bound | `52,428,801 bytes` (50 MB + 1B) | Frontend Client | Blocked with `tooLarge` before making network request | **PASS** |
| `MAT-SIZE-04` | Exceeding 50 MB bound | `55 MB` | Backend Gateway | Rejected with HTTP 400 (`Payload Too Large`), no DB/MinIO leak | **PASS** |
| `MAT-SIZE-05` | Empty payload | Missing file part | Backend Gateway | Rejected with HTTP 400 (`No file provided`) | **PASS** |

### 3.3. Resilience, Network Errors & UI State Matrix (AC-3)

| Test ID | Test Scenario | Failure Trigger | Expected System Behavior | Status |
|---|---|---|---|:---:|
| `MAT-RES-01` | AI Service outage during upload | `QA_AI_DOWN=1` (ai-service down) | Backend returns 201, records `processing_status = 'FAILED'`, logs connection error | **PASS** |
| `MAT-RES-02` | Network disconnection / API 500 | `fetch failed` / `500 Server Error` | Frontend marks item `error: 'failed'`, `anyUploaded = false`, shows red error alert | **PASS** |
| `MAT-RES-03` | Partial failure in batch | 1 file succeeds, 1 file fails | Successful file marked `done: true`, failing file marked `failed`, no state drop | **PASS** |
| `MAT-RES-04` | Anti-error-swallowing | Network error caught | No false success dialog, `onUploaded()` callback NOT triggered on full failure | **PASS** |
| `MAT-RES-05` | Queue item removal | User clicks remove button (X) | Failed item cleanly removed from upload queue | **PASS** |

---

## 4. Test Execution Evidence

### 4.1. Frontend Automated Test Suite
- Command: `npm test --prefix frontend`
- Suite: `src/qa/material-upload-qa.spec.ts`
- Total tests: 10/10 passing (part of 121/121 total frontend tests passing)
```text
# Subtest: QA-003 Frontend: Material Upload Validation, File Types & Size Bounds
    ok 1 - AC-1: accepts valid .pdf file and queues it with no errors
    ok 2 - AC-1: accepts valid .docx file and queues it with no errors
    ok 3 - AC-1: handles batch upload with multiple valid files concurrently
    ok 4 - AC-2: rejects unsupported file types (.txt, .exe, .png, .csv, .zip)
    ok 5 - AC-2: rejects file exceeding 50 MB bound (50 MB + 1 byte)
    ok 6 - AC-2: accepts boundary file exactly equal to 50 MB (52,428,800 bytes)
    ok 7 - AC-3: successful upload transitions file to done and reports anyUploaded=true
    ok 8 - AC-3: network failure (ECONNREFUSED / timeout) marks file as failed and does NOT report success
    ok 9 - AC-3: partial failure in batch upload marks failed item without dropping successful ones
    ok 10 - AC-3: user can remove failed file from upload queue
ok 1 - QA-003 Frontend: Material Upload Validation, File Types & Size Bounds
```

### 4.2. Backend Automated Test Suite
- File: `backend/test/material-upload.spec.ts` (Merged via PR #40)
- Runner: Jest with `QA_LIVE=1`
- Coverage: Valid PDF/DOCX storage in MinIO, non-storage of rejected files, AI service connection error degradation.

---

## 5. Traceability & Conclusion

- **Proposal V1.2 Traceability**: Section 2 (Teaching Materials & RAG Case Generation), FR-MAT-03, FR-MAT-04, FR-MAT-05, FR-MAT-06.
- **Sprint 2 Backlog**: Task `QA-003` / `EBA-217`.
- **Quality Gates Status**:
  - QG1 (Local Hygiene): **PASS** (121/121 frontend tests, TypeScript check clean).
  - QG2 (Code Review): **PASS** (Independent assertions, zero mock timeouts, no error swallowing).
  - QG3 (Automated CI): Ready for PR pipeline.
  - QG7 (Jira Transition): Ready to transition to **DONE** upon merging frontend refactor into `develop`.
