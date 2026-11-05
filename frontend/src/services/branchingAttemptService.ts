/**
 * EduBranch AI — Branching Attempt Service
 * Student Branching Study flow: start attempt, navigate nodes, save reasoning, reflect.
 * Response shapes mirror backend BranchingAttemptService.getAttempt().
 */

import apiClient from "./apiClient";

export interface AttemptOption {
  id: string;
  text: string;
}

export interface AttemptCurrentNode {
  id: string;
  situation: string;
  isTerminal: boolean;
  nodeIndex: number;
  options: AttemptOption[];
}

export interface AttemptStep {
  nodeId: string;
  situation: string;
  selectedOptionId: string;
  selectedOptionText: string;
  /** Revealed only after the attempt is completed (REVIEW phase). */
  consequence?: string;
  reasoningId: string;
  reasoningText: string | null;
  submittedAt: string;
  /** Alternatives not taken; filled only after completion. */
  otherOptions: AttemptOption[];
}

export interface AttemptDetail {
  id: string;
  caseId: string;
  caseTitle: string;
  caseDescription: string | null;
  studentId: string;
  attemptNumber: number;
  currentNodeId: string | null;
  outcomeNodeId: string | null;
  outcomeNode: { id: string; situation: string; is_terminal: boolean; node_index: number } | null;
  isCompleted: boolean;
  reflectionText: string | null;
  reflectionStatus: "NOT_STARTED" | "SUBMITTED" | string;
  reflectionSubmittedAt: string | null;
  startedAt: string;
  completedAt: string | null;
  currentNode: AttemptCurrentNode | null;
  steps: AttemptStep[];
}

export interface AttemptSummary {
  id: string;
  attemptNumber: number;
  isCompleted: boolean;
  reflectionStatus?: string;
  startedAt: string;
  completedAt?: string | null;
}

type Envelope<T> = { status: string; data: T };

export const branchingAttemptService = {
  async startAttempt(caseId: string): Promise<AttemptDetail> {
    const res = await apiClient.post<Envelope<AttemptDetail>>(`/cases/${caseId}/branching-attempts`);
    return res.data.data;
  },

  async getAttempt(attemptId: string): Promise<AttemptDetail> {
    const res = await apiClient.get<Envelope<AttemptDetail>>(`/branching-attempts/${attemptId}`);
    return res.data.data;
  },

  async getAttemptsByCase(caseId: string): Promise<AttemptSummary[]> {
    const res = await apiClient.get<Envelope<any[]>>(`/cases/${caseId}/attempts`);
    return (res.data.data || []).map((a) => ({
      id: a.id,
      attemptNumber: a.attemptNumber ?? a.attempt_number,
      isCompleted: a.isCompleted ?? a.is_completed ?? false,
      reflectionStatus: a.reflectionStatus ?? a.reflection_status,
      startedAt: a.startedAt ?? a.started_at,
      completedAt: a.completedAt ?? a.completed_at ?? null,
    }));
  },

  /** Backend returns the full attempt after the step. */
  async chooseOption(attemptId: string, nodeId: string, selectedOptionId: string): Promise<AttemptDetail> {
    const res = await apiClient.post<Envelope<AttemptDetail>>(`/branching-attempts/${attemptId}/step`, {
      nodeId,
      selectedOptionId,
    });
    return res.data.data;
  },

  async saveReasoning(attemptId: string, nodeId: string, reasoningText: string): Promise<void> {
    await apiClient.put(`/branching-attempts/${attemptId}/reasoning`, { nodeId, reasoningText });
  },

  async submitReflection(attemptId: string, reflectionText: string): Promise<void> {
    await apiClient.post(`/branching-attempts/${attemptId}/reflection`, { reflectionText });
  },
};
