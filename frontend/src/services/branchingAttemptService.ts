/**
 * EduBranch AI — Branching Attempt Service
 * Student Branching Study flow (backend `BranchingAttemptController`, backend/src/modules/branching-attempt).
 *
 *   POST /cases/:caseId/branching-attempts   STUDENT   start a new attempt (PUBLISHED + BRANCHING_STUDY only)
 *   GET  /cases/:caseId/attempts             signed-in the caller's attempts for the case
 *   GET  /branching-attempts/:id             owner     attempt + steps (consequences only once completed)
 *   POST /branching-attempts/:id/step        STUDENT   body { nodeId, selectedOptionId } → updated attempt
 *   PUT  /branching-attempts/:id/reasoning   STUDENT   body { nodeId, reasoningText }   (REVIEW phase)
 *   POST /branching-attempts/:id/reflection  STUDENT   body { reflectionText }          (completed attempts)
 */

import apiClient from "@/services/apiClient";
import type { AttemptDetail, AttemptSummary } from "@/types";
import {
  toAttemptDetail,
  toAttemptSummary,
  type AttemptDetailRow,
  type AttemptSummaryRow,
} from "@/services/mappers/branchingAttempt";

type Envelope<T> = { status: string; data: T };

/** Length rules of retrospective reasoning (feature-reasoning.md: 10–2000 chars). */
export const REASONING_MIN_LENGTH = 10;
export const REASONING_MAX_LENGTH = 2000;
/** Reflection textarea limit shown in Figma 05.7 ("0 / 2000 ký tự"). */
export const REFLECTION_MAX_LENGTH = 2000;

export const branchingAttemptService = {
  async startAttempt(caseId: string): Promise<AttemptDetail> {
    const res = await apiClient.post<Envelope<AttemptDetailRow>>(`/cases/${caseId}/branching-attempts`);
    return toAttemptDetail(res.data.data);
  },

  async getAttempt(attemptId: string): Promise<AttemptDetail> {
    const res = await apiClient.get<Envelope<AttemptDetailRow>>(`/branching-attempts/${attemptId}`);
    return toAttemptDetail(res.data.data);
  },

  /** Newest attempt first (the backend orders by attempt_number DESC). */
  async getAttemptsByCase(caseId: string): Promise<AttemptSummary[]> {
    const res = await apiClient.get<Envelope<AttemptSummaryRow[]>>(`/cases/${caseId}/attempts`);
    return res.data.data.map(toAttemptSummary);
  },

  /** Records the chosen option and advances; returns the attempt after the move. */
  async chooseOption(attemptId: string, nodeId: string, selectedOptionId: string): Promise<AttemptDetail> {
    const res = await apiClient.post<Envelope<AttemptDetailRow>>(`/branching-attempts/${attemptId}/step`, {
      nodeId,
      selectedOptionId,
    });
    return toAttemptDetail(res.data.data);
  },

  async saveReasoning(attemptId: string, nodeId: string, reasoningText: string): Promise<void> {
    await apiClient.put(`/branching-attempts/${attemptId}/reasoning`, { nodeId, reasoningText });
  },

  async submitReflection(attemptId: string, reflectionText: string): Promise<void> {
    await apiClient.post(`/branching-attempts/${attemptId}/reflection`, { reflectionText });
  },
};
