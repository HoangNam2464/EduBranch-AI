import { isAxiosError } from "axios";
import type { SubmissionReviewItem } from "@/services/lecturerFeedbackService";

export interface SubmissionFilters {
  search: string;
  course: string;
  learningMode: "ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY";
  status: string;
  sort: "NEWEST" | "OLDEST";
}

/**
 * Maps HTTP and network errors to i18n translation keys.
 * Ensures raw server/exception strings never render directly in the UI.
 */
export function mapErrorToI18nKey(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 400) return "g4.queue.errors.validation";
    if (status === 403) return "g4.queue.errors.forbidden";
    if (status === 404) return "g4.queue.errors.notFound";
    if (status === 409) return "g4.queue.errors.conflict";
    if (!err.response) return "g4.queue.errors.network";
    if (status !== undefined && status >= 500) return "g4.queue.errors.generic";
  }
  return "g4.queue.errors.generic";
}

/**
 * Extracts HTTP status code if error is an Axios error with response.
 */
export function getHttpStatus(err: unknown): number | undefined {
  if (isAxiosError(err)) {
    return err.response?.status;
  }
  return undefined;
}

/**
 * Client-side filter and sort logic for FE-019 AC-2.
 */
export function filterSubmissions(
  submissions: SubmissionReviewItem[],
  filters: SubmissionFilters,
): SubmissionReviewItem[] {
  const { search, course, learningMode, status, sort } = filters;
  const q = search.trim().toLowerCase();

  return submissions
    .filter((item) => {
      // Search filter
      if (q) {
        const matchesStudent =
          item.studentName.toLowerCase().includes(q) ||
          (item.studentEmail?.toLowerCase().includes(q) ?? false);
        const matchesCase = item.caseTitle.toLowerCase().includes(q);
        const matchesCourse =
          item.courseName.toLowerCase().includes(q) ||
          (item.courseCode?.toLowerCase().includes(q) ?? false);
        if (!matchesStudent && !matchesCase && !matchesCourse) {
          return false;
        }
      }

      // Course filter
      if (course !== "ALL" && item.courseId !== course) {
        return false;
      }

      // Learning mode filter
      if (learningMode !== "ALL" && item.targetType !== learningMode) {
        return false;
      }

      // Status filter
      if (status !== "ALL") {
        if (learningMode === "REVIEW_STUDY") {
          if (status === "PENDING" && item.submissionStatus !== "SUBMITTED") return false;
          if (status === "REVIEWED" && item.submissionStatus !== "REVIEWED") return false;
          if (status === "REFLECTED" && item.submissionStatus !== "REFLECTED") return false;
        } else if (learningMode === "BRANCHING_STUDY") {
          if (status === "PENDING" && item.feedbackStatus !== "PENDING") return false;
          if (status === "REVIEWED" && item.feedbackStatus !== "REVIEWED") return false;
          if (status === "COMPLETED" && !item.isCompleted) return false;
          if (status === "REFLECTION_SUBMITTED" && item.reflectionStatus !== "SUBMITTED") return false;
          if (status === "REFLECTION_PENDING" && item.reflectionStatus === "SUBMITTED") return false;
        } else {
          // Mode ALL
          if (status === "PENDING" && item.feedbackStatus !== "PENDING") return false;
          if (status === "REVIEWED" && item.feedbackStatus !== "REVIEWED") return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.submittedAt).getTime() || 0;
      const timeB = new Date(b.submittedAt).getTime() || 0;
      return sort === "NEWEST" ? timeB - timeA : timeA - timeB;
    });
}
