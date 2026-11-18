/**
 * EduBranch AI — Case Service
 * Case generation, retrieval and lifecycle (backend `CaseController`, backend/src/modules/case).
 *
 *   POST  /cases/generate               LECTURER  body { courseId, materialIds, topicHint?, numNodes? }
 *   GET   /courses/:courseId/cases      LECTURER | STUDENT (students: PUBLISHED only)
 *   GET   /cases/:id                    lecturer: full tree · student: published metadata
 *   PUT   /cases/:id                    LECTURER owner, DRAFT/REVIEWED only
 *   PATCH /cases/:id/status             LECTURER owner, DRAFT→REVIEWED→APPROVED→PUBLISHED (+ back to DRAFT)
 */

import apiClient from "@/services/apiClient";
import type { Case, CaseDetail, CaseStatus } from "@/types";
import { toCase, toCaseDetail, type CaseDetailRow, type CaseRow } from "@/services/mappers/case";

type Envelope<T> = { status: string; data: T };

export interface GenerateCaseRequest {
  courseId: string;
  materialIds: string[];
  topicHint?: string;
  numNodes?: number;
}

/** Fields `PUT /cases/:id` actually persists (situation per node, text + consequence per option). */
export interface UpdateCaseRequest {
  title?: string;
  description?: string;
  nodes?: Array<{
    id: string;
    situation?: string;
    options?: Array<{ id: string; option_text: string; consequence: string }>;
  }>;
}

/** Fields `PUT /cases/:id/nodes/:nodeId` persists (situation, key decision flag, options). */
export interface UpdateNodeRequest {
  situation?: string;
  is_key_decision?: boolean;
  options?: Array<{
    id?: string;
    option_text: string;
    consequence: string;
    next_node_id?: string | null;
  }>;
}

export const caseService = {
  async getCasesByCourse(courseId: string): Promise<Case[]> {
    const res = await apiClient.get<Envelope<CaseRow[]>>(`/courses/${courseId}/cases`);
    return res.data.data.map(toCase);
  },

  /**
   * All cases of the given courses. The backend has no lecturer-wide case list yet,
   * so the lists of the lecturer's courses are fetched in parallel and merged
   * (newest update first, as each course list is).
   */
  async getCasesByCourses(courseIds: string[]): Promise<Case[]> {
    const lists = await Promise.all(courseIds.map((id) => caseService.getCasesByCourse(id)));
    return lists.flat().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getCaseById(caseId: string): Promise<CaseDetail> {
    const res = await apiClient.get<Envelope<CaseDetailRow>>(`/cases/${caseId}`);
    return toCaseDetail(res.data.data);
  },

  async generateCase(data: GenerateCaseRequest): Promise<CaseDetail> {
    const res = await apiClient.post<Envelope<CaseDetailRow>>("/cases/generate", data);
    return toCaseDetail(res.data.data);
  },

  async updateCase(caseId: string, data: UpdateCaseRequest): Promise<CaseDetail> {
    const res = await apiClient.put<Envelope<CaseDetailRow>>(`/cases/${caseId}`, data);
    return toCaseDetail(res.data.data);
  },

  async updateNode(caseId: string, nodeId: string, data: UpdateNodeRequest): Promise<CaseDetail> {
    const res = await apiClient.put<Envelope<CaseDetailRow>>(`/cases/${caseId}/nodes/${nodeId}`, data);
    return toCaseDetail(res.data.data);
  },

  async updateCaseStatus(caseId: string, status: CaseStatus): Promise<{ id: string; status: CaseStatus }> {
    const res = await apiClient.patch<Envelope<{ id: string; status: CaseStatus }>>(`/cases/${caseId}/status`, {
      status,
    });
    return res.data.data;
  },
};
