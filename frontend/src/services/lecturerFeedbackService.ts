/**
 * EduBranch AI — Lecturer Feedback Service
 * Handles lecturer inspection and qualitative feedback for student submissions
 * (both Branching Study attempts and Review Study submissions).
 *
 * API contracts:
 *   POST /lecturer-feedback               - Author qualitative feedback (enforces chk_feedback_one_target)
 *   GET  /lecturer-feedback/submissions   - Queue of student submissions across lecturer's courses
 */

import { isAxiosError } from "axios";
import apiClient from "@/services/apiClient";
import type {
  LecturerFeedback,
  ReflectionStatus,
  SubmissionStatus,
} from "@/types";

export const FEEDBACK_MIN_LENGTH = 10;
export const FEEDBACK_MAX_LENGTH = 3000;

export interface CreateFeedbackDto {
  branchingAttemptId?: string;
  reviewSubmissionId?: string;
  feedbackText: string;
}

export interface SubmissionReviewItem {
  id: string;
  targetType: "BRANCHING_STUDY" | "REVIEW_STUDY";
  submissionId?: string;
  attemptId?: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  courseId: string;
  courseName: string;
  courseCode?: string;
  caseId: string;
  caseTitle: string;
  attemptNumber?: number;
  isCompleted?: boolean;
  reflectionStatus?: ReflectionStatus;
  submissionStatus?: SubmissionStatus;
  feedbackStatus: "PENDING" | "REVIEWED";
  submittedAt: string;
  studentAnalysis?: string;
  proposedSolution?: string;
  reasoningText?: string;
  outcomeTitle?: string;
  reflectionText?: string;
  stepsCount?: number;
  existingFeedback?: {
    id: string;
    feedbackText: string;
    createdAt: string;
  };
}

type Envelope<T> = { status?: string; data: T };

function unwrap<T>(body: Envelope<T> | T): T {
  if (body && typeof body === "object" && "data" in body && body.data !== undefined) {
    return body.data as T;
  }
  return body as T;
}

export const lecturerFeedbackService = {
  /**
   * Submit qualitative feedback for a student attempt or Review Study submission.
   * Advancing Review Study submission_status from SUBMITTED to REVIEWED.
   */
  async submitFeedback(dto: CreateFeedbackDto): Promise<LecturerFeedback> {
    const res = await apiClient.post<Envelope<LecturerFeedback> | LecturerFeedback>(
      "/lecturer-feedback",
      dto,
    );
    return unwrap(res.data);
  },

  /**
   * Fetch submission queue for the lecturer.
   * Returns empty array if backend endpoint is not yet mounted (404/501).
   */
  async getQueueSubmissions(params?: { courseId?: string; caseId?: string }): Promise<SubmissionReviewItem[]> {
    try {
      const res = await apiClient.get<Envelope<SubmissionReviewItem[]> | SubmissionReviewItem[]>(
        "/lecturer-feedback/submissions",
        { params },
      );
      const data = unwrap(res.data);
      return Array.isArray(data) ? data : [];
    } catch (err: unknown) {
      if (isAxiosError(err) && (err.response?.status === 404 || err.response?.status === 501)) {
        return [];
      }
      throw err;
    }
  },
};

