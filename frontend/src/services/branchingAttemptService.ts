/**
 * EduBranch AI — Branching Attempt Service
 * Student Branching Study flow: start attempt, navigate nodes, save reasoning, reflect.
 */

import apiClient from "./apiClient";
import { BranchingAttempt, StudentReasoning } from "../types";

export const branchingAttemptService = {
  async startAttempt(caseId: string): Promise<BranchingAttempt> {
    const res = await apiClient.post<{ status: string; data: BranchingAttempt }>(
      `/cases/${caseId}/branching-attempts`,
    );
    return res.data.data;
  },

  async getAttempt(attemptId: string): Promise<BranchingAttempt & { steps: StudentReasoning[] }> {
    const res = await apiClient.get<{ status: string; data: BranchingAttempt & { steps: StudentReasoning[] } }>(
      `/branching-attempts/${attemptId}`,
    );
    return res.data.data;
  },

  async getAttemptsByCase(caseId: string): Promise<BranchingAttempt[]> {
    const res = await apiClient.get<{ status: string; data: BranchingAttempt[] }>(
      `/cases/${caseId}/attempts`,
    );
    return res.data.data;
  },

  async chooseOption(attemptId: string, nodeId: string, selectedOptionId: string): Promise<{ currentNodeId: string; isCompleted: boolean }> {
    const res = await apiClient.post<{ status: string; data: { currentNodeId: string; isCompleted: boolean } }>(
      `/branching-attempts/${attemptId}/step`,
      { nodeId, selectedOptionId },
    );
    return res.data.data;
  },

  async saveReasoning(attemptId: string, nodeId: string, reasoningText: string): Promise<StudentReasoning> {
    const res = await apiClient.put<{ status: string; data: StudentReasoning }>(
      `/branching-attempts/${attemptId}/reasoning`,
      { nodeId, reasoningText },
    );
    return res.data.data;
  },

  async submitReflection(attemptId: string, reflectionText: string): Promise<BranchingAttempt> {
    const res = await apiClient.post<{ status: string; data: BranchingAttempt }>(
      `/branching-attempts/${attemptId}/reflection`,
      { reflectionText },
    );
    return res.data.data;
  },
};
