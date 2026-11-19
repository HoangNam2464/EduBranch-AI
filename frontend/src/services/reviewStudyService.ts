/**
 * EduBranch AI — Review Study Service
 * Student Review Study submission and lecturer feedback.
 *
 * API contracts:
 *   POST /cases/:caseId/review-study           - Submit student analysis, proposed solution & reasoning
 *   GET  /cases/:caseId/review-study/my-submission - Retrieve current student submission (or 404 if none)
 *   GET  /review-study-submissions/:id         - Retrieve submission by ID
 *   POST /review-study-submissions/:id/reflection - Submit student reflection
 *   GET  /courses/:courseId/cases/:caseId/review-study-submissions - Lecturer view
 */

import { isAxiosError } from "axios";
import apiClient from "@/services/apiClient";
import type { ReviewStudySubmission } from "@/types";
import {
  toReviewStudySubmission,
  type ReviewStudySubmissionRow,
} from "@/services/mappers/reviewStudy";

export interface SubmitReviewStudyRequest {
  studentAnalysis?: string;
  proposedSolution: string;
  reasoningText: string;
}

export const PROPOSED_SOLUTION_MIN_LENGTH = 10;
export const PROPOSED_SOLUTION_MAX_LENGTH = 3000;
export const REASONING_MIN_LENGTH = 10;
export const REASONING_MAX_LENGTH = 3000;
export const STUDENT_ANALYSIS_MAX_LENGTH = 3000;

type Envelope<T> = { status?: string; data: T };

function unwrap<T>(body: Envelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

export const reviewStudyService = {
  /**
   * Submit Review Study solution and reasoning.
   * Forward-only lifecycle begins at 'SUBMITTED'.
   */
  async submitReviewStudy(caseId: string, data: SubmitReviewStudyRequest): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/cases/${caseId}/review-study`,
      data,
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  /**
   * Check if the current signed-in student already has a submission for this case.
   * Returns null if 404 (no submission yet).
   */
  async getMySubmission(caseId: string): Promise<ReviewStudySubmission | null> {
    try {
      const res = await apiClient.get<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
        `/cases/${caseId}/review-study/my-submission`,
      );
      return toReviewStudySubmission(unwrap(res.data));
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  async getSubmissionById(submissionId: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.get<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/review-study-submissions/${submissionId}`,
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  async submitReflection(submissionId: string, reflectionText: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<Envelope<ReviewStudySubmissionRow> | ReviewStudySubmissionRow>(
      `/review-study-submissions/${submissionId}/reflection`,
      { reflectionText },
    );
    return toReviewStudySubmission(unwrap(res.data));
  },

  // Lecturer endpoints
  async getSubmissionsByCourse(courseId: string, caseId: string): Promise<ReviewStudySubmission[]> {
    const res = await apiClient.get<Envelope<ReviewStudySubmissionRow[]> | ReviewStudySubmissionRow[]>(
      `/courses/${courseId}/cases/${caseId}/review-study-submissions`,
    );
    const rows = unwrap(res.data);
    return Array.isArray(rows) ? rows.map(toReviewStudySubmission) : [];
  },
};
