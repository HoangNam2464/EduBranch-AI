import { isAxiosError } from "axios";
import type { LecturerFeedback, ReflectionStatus, SubmissionStatus } from "@/types";

/**
 * Evaluates whether student can compose and submit a post-feedback reflection.
 *
 * Rules (FE-020 Fix 3):
 * 1. submissionStatus MUST be "REVIEWED".
 * 2. reflectionStatus MUST NOT be "SUBMITTED" (cannot re-reflect once completed).
 * 3. feedback MUST be loaded successfully and be non-null.
 * 4. feedbackError MUST NOT be true (error state keeps reflection locked).
 */
export function canWriteReflection(
  submissionStatus: SubmissionStatus,
  reflectionStatus: ReflectionStatus,
  feedback: LecturerFeedback | null,
  hasFeedbackError = false,
): boolean {
  if (hasFeedbackError) return false;
  if (submissionStatus !== "REVIEWED") return false;
  if (reflectionStatus === "SUBMITTED") return false;
  return feedback !== null;
}

/**
 * Pure mapping of HTTP error or exception to localized i18n key.
 * Prevents raw server/exception messages in the UI (Rule 2).
 */
export function mapErrorToI18nKey(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 400) return "g5.feedback.errors.validation";
    if (status === 403) return "g5.feedback.errors.forbidden";
    if (status === 404) return "g5.feedback.errors.notFound";
    if (status === 409) return "g5.feedback.errors.conflict";
    if (!err.response) return "g5.feedback.errors.network";
    return "g5.feedback.errors.generic";
  }
  return "g5.feedback.errors.generic";
}

/**
 * Returns HTTP status code if Axios error, else undefined.
 */
export function getHttpStatus(err: unknown): number | undefined {
  if (isAxiosError(err)) {
    return err.response?.status;
  }
  return undefined;
}
