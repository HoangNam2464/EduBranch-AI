/**
 * EduBranch AI — Material Service
 * Teaching material upload and retrieval.
 */

import apiClient from "./apiClient";
import { TeachingMaterial } from "../types";

export const materialService = {
  async getMaterialsByCourse(courseId: string): Promise<TeachingMaterial[]> {
    const res = await apiClient.get<{ status: string; data: TeachingMaterial[] }>(
      `/courses/${courseId}/materials`,
    );
    return res.data.data;
  },

  async getMaterialById(materialId: string): Promise<TeachingMaterial> {
    const res = await apiClient.get<{ status: string; data: TeachingMaterial }>(
      `/materials/${materialId}`,
    );
    return res.data.data;
  },

  async uploadMaterial(courseId: string, file: File): Promise<TeachingMaterial> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<{ status: string; data: TeachingMaterial }>(
      `/courses/${courseId}/materials`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data;
  },
};
