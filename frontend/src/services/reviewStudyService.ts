/**
 * EduBranch AI — Review Study Service
 * Student Review Study submission and lecturer feedback.
 *
 * NOT CALLABLE YET: backend/src/modules/review-study/review-study.controller.ts is an
 * empty skeleton, so none of the routes below exist on the gateway (they return 404).
 * Screens must not call these methods until the backend implements them; 06.1–06.3
 * render the case (GET /cases/:id) and state the missing submission API instead.
 */

import apiClient from "@/services/apiClient";
import { ReviewStudySubmission } from "@/types";

interface SubmitReviewStudyRequest {
  studentAnalysis?: string;
  proposedSolution: string;
  reasoningText: string;
}

export const reviewStudyService = {
  async submitReviewStudy(caseId: string, data: SubmitReviewStudyRequest): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<{ status: string; data: ReviewStudySubmission }>(
      `/cases/${caseId}/review-study`,
      data,
    );
    return res.data.data;
  },

  async getMySubmission(caseId: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.get<{ status: string; data: ReviewStudySubmission }>(
      `/cases/${caseId}/review-study/my-submission`,
    );
    return res.data.data;
  },

  async getSubmissionById(submissionId: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.get<{ status: string; data: ReviewStudySubmission }>(
      `/review-study-submissions/${submissionId}`,
    );
    return res.data.data;
  },

  async submitReflection(submissionId: string, reflectionText: string): Promise<ReviewStudySubmission> {
    const res = await apiClient.post<{ status: string; data: ReviewStudySubmission }>(
      `/review-study-submissions/${submissionId}/reflection`,
      { reflectionText },
    );
    return res.data.data;
  },

  // Lecturer endpoints
  async getSubmissionsByCourse(courseId: string, caseId: string): Promise<ReviewStudySubmission[]> {
    const res = await apiClient.get<{ status: string; data: ReviewStudySubmission[] }>(
      `/courses/${courseId}/cases/${caseId}/review-study-submissions`,
    );
    return res.data.data;
  },
};
