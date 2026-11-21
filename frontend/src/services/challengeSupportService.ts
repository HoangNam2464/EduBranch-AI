/**
 * EduBranch AI — AI Reasoning / Challenge Support Service
 * Communicates exclusively with the NestJS Backend Gateway (/api/v1/challenge-support/*).
 *
 * Governance:
 *   - Max 2 rounds hard-capped.
 *   - Socratic counter-questions only.
 *   - Never simulates successful answers or grades.
 */

import apiClient from "@/services/apiClient";
import {
  toChallengeSession,
  type ChallengeSession,
  type ChallengeSessionRow,
} from "./mappers/challengeSupport";

type Envelope<T> = { status: string; data: T };

export const challengeSupportService = {
  /**
   * Creates or retrieves a Challenge Support session for a given reasoning ID.
   * On creation, generates Round 1 counter-question.
   */
  async createOrGetSession(reasoningId: string): Promise<ChallengeSession> {
    const res = await apiClient.post<Envelope<ChallengeSessionRow>>(
      "/challenge-support/sessions",
      { reasoningId },
    );
    return toChallengeSession(res.data.data);
  },

  /**
   * Submits student reply for Round 1, generates Round 2 counter-question,
   * advances round to 2, and marks session as isCompleted.
   * Throws 409 if session is already completed or at round 2.
   */
  async sendReply(sessionId: string, reply: string): Promise<ChallengeSession> {
    const res = await apiClient.post<Envelope<ChallengeSessionRow>>(
      `/challenge-support/sessions/${sessionId}/replies`,
      { reply },
    );
    return toChallengeSession(res.data.data);
  },

  /**
   * Fetches an existing session and all message exchanges.
   */
  async getSession(sessionId: string): Promise<ChallengeSession> {
    const res = await apiClient.get<Envelope<ChallengeSessionRow>>(
      `/challenge-support/sessions/${sessionId}`,
    );
    return toChallengeSession(res.data.data);
  },

  /**
   * Concludes the session early if the student skips Round 2.
   */
  async completeSession(sessionId: string): Promise<ChallengeSession> {
    const res = await apiClient.post<Envelope<ChallengeSessionRow>>(
      `/challenge-support/sessions/${sessionId}/complete`,
    );
    return toChallengeSession(res.data.data);
  },
};
