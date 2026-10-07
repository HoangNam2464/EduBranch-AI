/**
 * EduBranch AI — Review Study Service
 * Student Review Study submission and lecturer feedback.
 */

import apiClient from "./apiClient";
import { ReviewStudySubmission } from "../types";

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
