/**
 * EduBranch AI — Case Service
 * Case generation, retrieval, and lifecycle management.
 */

import apiClient from "./apiClient";
import { Case, CaseStatus } from "../types";

interface GenerateCaseRequest {
  materialIds: string[];
  topicHint?: string;
  numNodes?: number;
}

export const caseService = {
  async getCasesByCourse(courseId: string): Promise<Case[]> {
    const res = await apiClient.get<{ status: string; data: Case[] }>(
      `/courses/${courseId}/cases`,
    );
    return res.data.data;
  },

  async getCaseById(caseId: string): Promise<Case> {
    const res = await apiClient.get<{ status: string; data: Case }>(`/cases/${caseId}`);
    return res.data.data;
  },

  async generateCase(courseId: string, data: GenerateCaseRequest): Promise<Case> {
    const res = await apiClient.post<{ status: string; data: Case }>(
      `/courses/${courseId}/cases/generate`,
      data,
    );
    return res.data.data;
  },

  async updateCaseStatus(caseId: string, status: CaseStatus): Promise<{ id: string; status: CaseStatus }> {
    const res = await apiClient.patch<{ status: string; data: { id: string; status: CaseStatus } }>(
      `/cases/${caseId}/status`,
      { status },
    );
    return res.data.data;
  },

  async updateCase(caseId: string, data: { title?: string; description?: string; nodes?: any[] }): Promise<Case> {
    const res = await apiClient.put<{ status: string; data: Case }>(`/cases/${caseId}`, data);
    return res.data.data;
  },
};
