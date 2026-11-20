/**
 * EduBranch AI — Review Study Service
 * Student Review Study submission and lecturer feedback.
 *
 * API contracts (002-feedback-stats-api):
 *   POST /cases/:caseId/review-study/submit           - Submit student analysis, proposed solution & reasoning (E1)
 *   GET  /cases/:caseId/review-study/submissions/me  - Retrieve current student submission (E2, or 404 SUBMISSION_NOT_FOUND)
 *   GET  /review-study/submissions/:id               - Retrieve submission by ID (E3)
 *   POST /review-study/submissions/:id/reflection    - Submit student reflection (E4)
 *   GET  /review-study/submissions/:id/feedback      - Retrieve qualitative lecturer feedback (E5, returns { feedback })
 */

import { isAxiosError } from "axios";
import apiClient from "@/services/apiClient";
import type { LecturerFeedback, ReviewStudySubmission } from "@/types";
import {
  toReviewStudySubmission,
  type ReviewStudySubmissionRow,
} from "@/services/mappers/reviewStudy";

export interface SubmitReviewStudyRequest {
  studentAnalysis?: string;
  proposedSolution: string;
  reasoningText: string;
}

export interface LecturerFeedbackResponse {
  feedback: LecturerFeedback | null;
}

export const PROPOSED_SOLUTION_MIN_LENGTH = 10;
export const PROPOSED_SOLUTION_MAX_LENGTH = 3000;
export const REASONING_MIN_LENGTH = 10;
export const REASONING_MAX_LENGTH = 3000;
export const STUDENT_ANALYSIS_MAX_LENGTH = 3000;
export const REFLECTION_MIN_LENGTH = 10;
export const REFLECTION_MAX_LENGTH = 3000;

type Envelope<T> = { status?: string; data: T };

function unwrap<T>(body: Envelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

export const reviewStudyService = {
  /**
   * Submit Review Study solution and reasoning (E1).
   * Forward-only lifecycle begins at 'SUBMITTED'.
   */
  async submitReviewStudy(caseId: string, data: SubmitReviewStudyRequest): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/cases/${caseId}/review-study/submit`,
      data,
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  /**
   * Check if the current signed-in student already has a submission for this case (E2).
   * Returns null if 404 (SUBMISSION_NOT_FOUND / no submission yet).
   * All other errors propagate.
   */
  async getMySubmission(caseId: string): Promise<ReviewStudySubmission | null> {
    try {
      const res = await apiClient.get<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
        `/cases/${caseId}/review-study/submissions/me`,
      );
      return toReviewStudySubmission(unwrap(res.data));
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Retrieve submission by ID (E3).
   */
  async getSubmissionById(submissionId: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.get<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/review-study/submissions/${submissionId}`,
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  /**
   * Submit post-feedback reflection (E4).
   */
  async submitReflection(submissionId: string, reflectionText: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/review-study/submissions/${submissionId}/reflection`,
      { reflectionText },
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  /**
   * Retrieve lecturer qualitative feedback for a Review Study submission (E5).
   * Contract returns 200 with `{ "feedback": LecturerFeedbackDto | null }`.
   * When no feedback has been authored yet, returns null.
   * HTTP errors (403, 404, 500, network) propagate without swallowing.
   */
  async getFeedback(submissionId: string): Promise<LecturerFeedback | null> {
    const res = await apiClient.get<Envelope<LecturerFeedbackResponse> | LecturerFeedbackResponse>(
      `/review-study/submissions/${submissionId}/feedback`,
    );
    const data = unwrap(res.data);
    if (data && typeof data === "object" && "feedback" in data) {
      return data.feedback ?? null;
    }
    // A response without the `feedback` field is a contract violation, not "no feedback yet".
    throw new Error("Invalid response for GET /review-study/submissions/:id/feedback");
  },
};
