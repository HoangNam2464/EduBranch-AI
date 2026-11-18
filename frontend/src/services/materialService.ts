/**
 * EduBranch AI — Material Service
 * Teaching material upload, listing and deletion (backend `MaterialController`).
 * Rows are mapped to the camelCase `TeachingMaterial` in `mappers/material.ts`.
 */

import apiClient from "@/services/apiClient";
import { TeachingMaterial } from "@/types";
import { toMaterial, type MaterialRow } from "@/services/mappers/material";

type Envelope<T> = { status: string; data: T };

export const materialService = {
  /** `GET /courses/:courseId/materials` (course owner only), newest first. */
  async getMaterialsByCourse(courseId: string): Promise<TeachingMaterial[]> {
    const res = await apiClient.get<Envelope<MaterialRow[]>>(`/courses/${courseId}/materials`);
    return res.data.data.map(toMaterial);
  },

  /** `GET /materials/:id` (course owner only). */
  async getMaterialById(materialId: string): Promise<TeachingMaterial> {
    const res = await apiClient.get<Envelope<MaterialRow>>(`/materials/${materialId}`);
    return toMaterial(res.data.data);
  },

  /**
   * `POST /courses/:courseId/materials` (multipart, field `file`). The backend runs AI ingestion
   * synchronously and returns the row as COMPLETED or FAILED.
   */
  async uploadMaterial(
    courseId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<TeachingMaterial> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<Envelope<MaterialRow>>(`/courses/${courseId}/materials`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
    return toMaterial(res.data.data);
  },

  /** `DELETE /materials/:id` — removes the file and its indexed chunks. */
  async deleteMaterial(materialId: string): Promise<void> {
    await apiClient.delete(`/materials/${materialId}`);
  },
};
