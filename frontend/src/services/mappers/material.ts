import type { ProcessingStatus, TeachingMaterial } from "@/types";

/**
 * Wire format of a teaching material as the backend returns it today (raw SQL
 * rows of `teaching_materials`, snake_case; see
 * backend/src/modules/material/material.service.ts). Pages only see the
 * camelCase `TeachingMaterial` produced here.
 */
export interface MaterialRow {
  id: string;
  original_filename: string;
  stored_object_key?: string;
  mime_type: string;
  size_bytes: number | string;
  course_id: string;
  uploaded_by?: string;
  processing_status: ProcessingStatus;
  chunk_count: number | null;
  processing_error: string | null;
  uploaded_at: string;
  updated_at?: string;
}

/** `size_bytes` is BIGINT; node-postgres returns it as a string. */
function toNumber(value: number | string | null | undefined): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export function toMaterial(row: MaterialRow): TeachingMaterial {
  return {
    id: row.id,
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    sizeBytes: toNumber(row.size_bytes),
    courseId: row.course_id,
    processingStatus: row.processing_status,
    chunkCount: row.chunk_count ?? undefined,
    processingError: row.processing_error ?? undefined,
    uploadedAt: row.uploaded_at,
    updatedAt: row.updated_at,
  };
}
