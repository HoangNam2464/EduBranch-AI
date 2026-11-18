import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toMaterial, type MaterialRow } from "./material";

const row: MaterialRow = {
  id: "m1",
  original_filename: "Runbook_ung_cuu_su_co_DDoS.pdf",
  stored_object_key: "materials/c1/x/Runbook.pdf",
  mime_type: "application/pdf",
  size_bytes: "2516582",
  course_id: "c1",
  uploaded_by: "u1",
  processing_status: "COMPLETED",
  chunk_count: 48,
  processing_error: null,
  uploaded_at: "2026-10-20T08:00:00.000Z",
  updated_at: "2026-10-20T08:01:00.000Z",
};

describe("toMaterial (backend snake_case row → TeachingMaterial)", () => {
  it("maps every column to the camelCase domain field and parses BIGINT sizes", () => {
    assert.deepEqual(toMaterial(row), {
      id: "m1",
      originalFilename: "Runbook_ung_cuu_su_co_DDoS.pdf",
      mimeType: "application/pdf",
      sizeBytes: 2516582,
      courseId: "c1",
      processingStatus: "COMPLETED",
      chunkCount: 48,
      processingError: undefined,
      uploadedAt: "2026-10-20T08:00:00.000Z",
      updatedAt: "2026-10-20T08:01:00.000Z",
    });
  });

  it("keeps the failure reason and treats a null chunk count as absent", () => {
    const material = toMaterial({ ...row, processing_status: "FAILED", chunk_count: null, processing_error: "AI ingestion failed", size_bytes: 1024 });
    assert.equal(material.processingStatus, "FAILED");
    assert.equal(material.chunkCount, undefined);
    assert.equal(material.processingError, "AI ingestion failed");
    assert.equal(material.sizeBytes, 1024);
  });
});
