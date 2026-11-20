import { isAxiosError } from "axios";
import type { SubmissionReviewItem } from "@/services/lecturerFeedbackService";

export interface SubmissionFilters {
  search: string;
  course: string;
  learningMode?: "ALL" | "BRANCHING_STUDY" | "REVIEW_STUDY";
  status: string;
  sort: "NEWEST" | "OLDEST";
}

export type QueueStatus = "PENDING" | "REVIEWED" | "REFLECTED";

/**
 * Status rule (derived only from contract E7 fields, no new data).
 * - existingFeedback == null -> "PENDING" ("Chờ phản hồi")
 * - existingFeedback != null and reflection submitted -> "REFLECTED" ("Đã suy ngẫm")
 *   Reflection submitted means reflectionStatus === "SUBMITTED" for branching items,
 *   or submissionStatus === "REFLECTED" for Review Study items.
 * - existingFeedback != null otherwise -> "REVIEWED" ("Đã phản hồi")
 */
export function getSubmissionQueueStatus(item: SubmissionReviewItem): QueueStatus {
  if (!item.existingFeedback) {
    return "PENDING";
  }
  const isReflectionSubmitted =
    item.targetType === "REVIEW_STUDY"
      ? item.submissionStatus === "REFLECTED"
      : item.reflectionStatus === "SUBMITTED";

  if (isReflectionSubmitted) {
    return "REFLECTED";
  }
  return "REVIEWED";
}

/**
 * Counts submissions waiting for lecturer qualitative feedback (existingFeedback == null).
 */
export function countPendingSubmissions(submissions: SubmissionReviewItem[]): number {
  return submissions.filter((s) => getSubmissionQueueStatus(s) === "PENDING").length;
}

/**
 * Extracts 2-letter uppercase initials for student avatars, e.g. "Nguyễn Minh Anh" -> "NA".
 */
export function initialsOf(fullName: string | undefined | null): string {
  const words = (fullName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !/^(TS|ThS|PGS|GS|CN|KS)\.?$/i.test(w.replace(/\.$/, "")) && !/\.$/.test(w));
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Formats ISO date string to "DD/MM/YYYY · HH:mm" matching Figma 04.1.
 */
export function formatSubmissionDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
  const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return `${date} · ${time}`;
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
  const { search, course, learningMode = "ALL", status, sort } = filters;
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
        if (status === "PENDING" || status === "REVIEWED" || status === "REFLECTED") {
          if (getSubmissionQueueStatus(item) !== status) {
            return false;
          }
        } else if (status === "COMPLETED") {
          if (!item.isCompleted) return false;
        } else if (status === "REFLECTION_SUBMITTED") {
          if (item.reflectionStatus !== "SUBMITTED") return false;
        } else if (status === "REFLECTION_PENDING") {
          if (item.reflectionStatus === "SUBMITTED") return false;
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
