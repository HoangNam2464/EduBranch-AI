import type { ReflectionStatus, ReviewStudySubmission, SubmissionStatus } from "@/types";

/**
 * Raw wire format for review_study_submissions row / API payload.
 * Supports both snake_case (direct DB projection) and camelCase (DTO projection).
 */
export interface ReviewStudySubmissionRow {
  id: string;
  student_id?: string;
  studentId?: string;
  case_id?: string;
  caseId?: string;
  student_analysis?: string | null;
  studentAnalysis?: string | null;
  proposed_solution?: string;
  proposedSolution?: string;
  reasoning_text?: string;
  reasoningText?: string;
  submission_status?: SubmissionStatus;
  submissionStatus?: SubmissionStatus;
  reflection_text?: string | null;
  reflectionText?: string | null;
  reflection_status?: ReflectionStatus;
  reflectionStatus?: ReflectionStatus;
  reflection_submitted_at?: string | null;
  reflectionSubmittedAt?: string | null;
  submitted_at?: string;
  submittedAt?: string;
}

/**
 * Converts a backend Review Study submission row to the domain model.
 * Never invents submittedAt; missing required submittedAt throws an error.
 */
export function toReviewStudySubmission(row: ReviewStudySubmissionRow): ReviewStudySubmission {
  const submittedAt = row.submittedAt ?? row.submitted_at;
  if (!submittedAt) {
    throw new Error("Missing required field: submittedAt");
  }

  return {
    id: row.id,
    studentId: row.studentId ?? row.student_id ?? "",
    caseId: row.caseId ?? row.case_id ?? "",
    studentAnalysis: (row.studentAnalysis ?? row.student_analysis) ?? undefined,
    proposedSolution: row.proposedSolution ?? row.proposed_solution ?? "",
    reasoningText: row.reasoningText ?? row.reasoning_text ?? "",
    submissionStatus: row.submissionStatus ?? row.submission_status ?? "SUBMITTED",
    reflectionText: (row.reflectionText ?? row.reflection_text) ?? undefined,
    reflectionStatus: row.reflectionStatus ?? row.reflection_status ?? "NOT_STARTED",
    reflectionSubmittedAt: (row.reflectionSubmittedAt ?? row.reflection_submitted_at) ?? undefined,
    submittedAt,
  };
}
