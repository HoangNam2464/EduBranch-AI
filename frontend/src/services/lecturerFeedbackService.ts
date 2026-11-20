/**
 * EduBranch AI — Lecturer Feedback Service
 * Handles lecturer inspection and qualitative feedback for student submissions
 * (both Branching Study attempts and Review Study submissions).
 *
 * API contracts (contract-002-api.md):
 *   POST /lecturer-feedback               - Author qualitative feedback (E6)
 *   GET  /lecturer-feedback/submissions   - Queue of student submissions across lecturer's courses (E7)
 */

import apiClient from "@/services/apiClient";
import type {
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

export interface LecturerFeedbackDto {
  id: string;
  lecturerId: string;
  branchingAttemptId: string | null;
  reviewSubmissionId: string | null;
  feedbackText: string;
  createdAt: string;
  updatedAt: string;
}

export interface BranchingStepItem {
  nodeId: string;
  situation: string;
  selectedOptionText: string;
  reasoningText: string | null;
}

export interface SubmissionReviewItem {
  targetType: "BRANCHING_STUDY" | "REVIEW_STUDY";
  targetId: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  courseId: string;
  courseName: string;
  courseCode?: string | null;
  caseId: string;
  caseTitle: string;
  submittedAt: string;
  feedbackStatus: "PENDING" | "REVIEWED";
  existingFeedback: LecturerFeedbackDto | null;
  reflectionStatus?: ReflectionStatus;
  reflectionText?: string | null;

  // Review Study specific
  submissionStatus?: SubmissionStatus;
  studentAnalysis?: string | null;
  proposedSolution?: string;
  reasoningText?: string;

  // Branching Study specific
  attemptNumber?: number;
  isCompleted?: boolean;
  outcomeSituation?: string | null;
  stepsCount?: number;
  steps?: BranchingStepItem[];
}

export interface SubmissionQueueResponse {
  items: SubmissionReviewItem[];
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
   * Submit qualitative feedback for a student attempt or Review Study submission (E6).
   */
  async submitFeedback(dto: CreateFeedbackDto): Promise<LecturerFeedbackDto> {
    const res = await apiClient.post<Envelope<LecturerFeedbackDto> | LecturerFeedbackDto>(
      "/lecturer-feedback",
      dto,
    );
    return unwrap(res.data);
  },

  /**
   * Fetch submission queue for the lecturer (E7).
   * Parses data.items; throws parsing error if not an array.
   * Propagates any HTTP/network error (404/501 must not be swallowed into empty array).
   */
  async getQueueSubmissions(params?: { courseId?: string; caseId?: string }): Promise<SubmissionReviewItem[]> {
    const res = await apiClient.get<Envelope<SubmissionQueueResponse> | SubmissionQueueResponse>(
      "/lecturer-feedback/submissions",
      { params },
    );
    const data = unwrap(res.data);
    const items = (data as SubmissionQueueResponse)?.items;
    if (!Array.isArray(items)) {
      throw new Error("Invalid response format: expected items array in /lecturer-feedback/submissions");
    }
    return items;
  },
};
