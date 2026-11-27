import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  Lock,
  MessageSquareText,
  UserCheck,
} from "lucide-react";
import { Button, Field, SubmissionBadge, cx } from "@/components/ds";
import { formatDateTime } from "@/components/feedback/stateFormat";
import {
  canWriteReflection,
  mapErrorToI18nKey,
} from "@/pages/feedback/reviewFeedbackLogic";
import {
  REFLECTION_MAX_LENGTH,
  REFLECTION_MIN_LENGTH,
  reviewStudyService,
} from "@/services/reviewStudyService";
import type { LecturerFeedback, ReviewStudySubmission } from "@/types";

export interface StudentReviewFeedbackViewProps {
  submission: ReviewStudySubmission;
  feedback: LecturerFeedback | null;
  caseTitle: string;
  courseName?: string;
  courseCode?: string;
  onReflectionSubmitted: (updatedSubmission: ReviewStudySubmission) => void;
  onBack?: () => void;
  feedbackLoading?: boolean;
  feedbackError?: boolean;
  feedbackErrorCode?: string | number;
  onRetryFeedback?: () => void;
}

/**
 * StudentReviewFeedbackView Component (Deliverable FE-020, Figma Frame 05.4 / 06.3)
 * Displays:
 * 1. Read-only summary of student's own Review Study submission.
 * 2. Lecturer qualitative feedback block (strictly qualitative, zero scores / AI grading).
 * 3. Lifecycle-gated post-feedback reflection block (locked until REVIEWED with feedback, editable in REVIEWED, read-only in REFLECTED).
 */
export function StudentReviewFeedbackView({
  submission,
  feedback,
  caseTitle,
  courseName,
  courseCode,
  onReflectionSubmitted,
  onBack,
  feedbackLoading = false,
  feedbackError = false,
  feedbackErrorCode,
  onRetryFeedback,
}: StudentReviewFeedbackViewProps) {
  const { t } = useTranslation();

  const [reflectionText, setReflectionText] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  const isReviewed = submission.submissionStatus === "REVIEWED";
  const isReflected =
    submission.submissionStatus === "REFLECTED" || submission.reflectionStatus === "SUBMITTED";
  const isPendingReview = submission.submissionStatus === "SUBMITTED";

  // Reflection form is unlocked ONLY when submission is REVIEWED, feedback loaded successfully and non-null, and not yet REFLECTED
  const isReflectionUnlocked = canWriteReflection(
    submission.submissionStatus,
    submission.reflectionStatus,
    feedback,
    feedbackError,
  );

  const submittedDate = submission.submittedAt ? new Date(submission.submittedAt) : null;
  const formattedSubmittedDate =
    submittedDate && !Number.isNaN(submittedDate.getTime())
      ? formatDateTime(submittedDate)
      : submission.submittedAt;

  const handleSubmitReflection = async () => {
    const trimmed = reflectionText.trim();
    if (trimmed.length < REFLECTION_MIN_LENGTH) {
      setValidationError(t("g5.feedback.reflectionMin"));
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage(null);
    setSubmitSuccessMessage(null);

    try {
      const updated = await reviewStudyService.submitReflection(submission.id, trimmed);
      setSubmitSuccessMessage(t("g5.feedback.reflectionSuccess"));
      setReflectionText("");
      onReflectionSubmitted(updated);
    } catch (err: unknown) {
      const errorKey = mapErrorToI18nKey(err);
      setSubmitErrorMessage(t(errorKey));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl border border-line bg-surface p-5 shadow-eb-card">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-eb-sm border border-selected/20 bg-selected px-2 py-0.5 text-[12px] font-medium text-link">
              <FileCheck2 size={13} />
              <span>{t("g5.common.modeReview")}</span>
            </span>
            <span className="text-[12px] text-ink-secondary">·</span>
            <span className="text-[13px] text-ink-secondary">
              {courseCode ? `${courseCode} · ` : ""}
              {courseName}
            </span>
          </div>
          <h1 className="text-[20px] leading-7 font-medium text-ink">{caseTitle}</h1>
          <div className="flex items-center gap-1.5 text-[12px] leading-4 text-ink-secondary">
            <Clock size={13} className="text-ink-muted" />
            <span>{t("g5.feedback.submittedAt", { time: formattedSubmittedDate })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPendingReview && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 text-[12px] font-medium text-warning-text">
              <span className="size-2 rounded-full bg-warning" />
              {t("g5.feedback.submittedBadge")}
            </span>
          )}
          {isReviewed && (
            <SubmissionBadge status="reviewed">
              {t("g5.feedback.reviewedBadge")}
            </SubmissionBadge>
          )}
          {isReflected && (
            <SubmissionBadge status="reflected">
              {t("g5.feedback.reflectedBadge")}
            </SubmissionBadge>
          )}
          {onBack && (
            <Button variant="secondary" size="sm" onClick={onBack}>
              {t("g5.feedback.backToCase")}
            </Button>
          )}
        </div>
      </div>

      {/* Global Success / Error Banners */}
      {submitSuccessMessage && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-eb-xl border border-success-border bg-success-bg p-4 text-success-text"
        >
          <CheckCircle2 size={20} className="shrink-0 text-success" />
          <p className="text-[14px] leading-5 font-medium">{submitSuccessMessage}</p>
        </div>
      )}

      {submitErrorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-eb-xl border border-error-border bg-error-bg p-4 text-error-text"
        >
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-error" />
          <div className="flex-1 text-[14px] leading-5">
            <p className="font-medium">{submitErrorMessage}</p>
          </div>
        </div>
      )}

      {/* Section 1: Student Submitted Work Summary */}
      <section
        className="flex flex-col gap-4 rounded-eb-xl border border-line bg-surface p-5 shadow-eb-card"
        aria-label={t("g5.feedback.submissionDetailsTitle")}
      >
        <div className="border-b border-line pb-3">
          <h2 className="text-[16px] font-medium text-ink">
            {t("g5.feedback.submissionDetailsTitle")}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {/* Situation Analysis */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-secondary">
              {t("g5.feedback.analysisTitle")}
            </span>
            <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
              {submission.studentAnalysis || (
                <span className="italic text-ink-muted">
                  {t("g5.feedback.emptyAnalysis")}
                </span>
              )}
            </div>
          </div>

          {/* Proposed Solution */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-secondary">
              {t("g5.feedback.solutionTitle")}
            </span>
            <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
              {submission.proposedSolution}
            </div>
          </div>

          {/* Supporting Reasoning */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-secondary">
              {t("g5.feedback.reasoningTitle")}
            </span>
            <div className="rounded-eb-md border border-line bg-canvas/60 p-3.5 text-[14px] leading-5 text-ink">
              {submission.reasoningText}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Lecturer Qualitative Feedback Block */}
      <section
        className={cx(
          "flex flex-col gap-3.5 rounded-eb-xl border p-5 shadow-eb-card transition-colors",
          feedback || isReviewed
            ? "border-line bg-surface"
            : "border-warning-border bg-warning-bg/40",
        )}
        aria-label={t("g5.feedback.lecturerFeedbackTitle")}
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-primary" />
            <h2 className="text-[16px] font-medium text-ink">
              {t("g5.feedback.lecturerFeedbackTitle")}
            </h2>
          </div>
          {isReviewed && (
            <SubmissionBadge status="reviewed">
              {t("g5.feedback.reviewedBadge")}
            </SubmissionBadge>
          )}
        </div>

        {/* Guardrail notice */}
        <p className="text-[12px] leading-4 text-ink-secondary">
          {t("g5.feedback.lecturerFeedbackNotice")}
        </p>

        {feedbackLoading ? (
          <div className="flex flex-col gap-2 rounded-eb-md border border-line bg-canvas/70 p-4 motion-safe:animate-pulse">
            <div className="h-4 w-3/4 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
          </div>
        ) : feedbackError ? (
          <div className="flex flex-col gap-3 rounded-eb-md border border-error-border bg-error-bg p-4 text-error-text">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-error" />
              <div className="flex flex-col gap-1 text-[13px] leading-5">
                <p className="font-medium">{t("states.error.title")}</p>
                <p className="opacity-90">{t("states.error.description")}</p>
                {feedbackErrorCode !== undefined && (
                  <p className="text-[12px] opacity-75">
                    {t("states.error.codeLineNoTime", { code: feedbackErrorCode })}
                  </p>
                )}
              </div>
            </div>
            {onRetryFeedback && (
              <div className="self-start pl-8">
                <Button variant="secondary" size="sm" onClick={onRetryFeedback}>
                  {t("states.error.retry")}
                </Button>
              </div>
            )}
          </div>
        ) : feedback ? (
          <div className="flex flex-col gap-2 rounded-eb-md border border-line bg-canvas/70 p-4">
            <p className="whitespace-pre-wrap text-[14px] leading-6 text-ink">
              {feedback.feedbackText}
            </p>
            {feedback.createdAt && (
              <span className="text-right text-[12px] text-ink-muted">
                {t("g5.feedback.feedbackSentAt", {
                  time: formatDateTime(new Date(feedback.createdAt)),
                })}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-eb-md border border-warning-border bg-warning-bg p-4 text-warning-text">
            <Clock size={18} className="mt-0.5 shrink-0 text-warning" />
            <div className="flex flex-col gap-1 text-[13px] leading-5">
              <p className="font-medium">{t("g5.feedback.pendingTitle")}</p>
              <p className="opacity-90">{t("g5.feedback.pendingBody")}</p>
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Post-Feedback Reflection Section */}
      <section
        className="flex flex-col gap-4 rounded-eb-xl border border-line bg-surface p-5 shadow-eb-card"
        aria-label={t("g5.feedback.reflectionTitle")}
      >
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <MessageSquareText size={18} className="text-primary" />
            <h2 className="text-[16px] font-medium text-ink">
              {t("g5.feedback.reflectionTitle")}
            </h2>
          </div>
          {isReflected && (
            <SubmissionBadge status="reflected">
              {t("g5.feedback.reflectedBadge")}
            </SubmissionBadge>
          )}
        </div>

        {/* Case A: Reflection is locked (either SUBMITTED or awaiting feedback / error) */}
        {!isReflected && !isReflectionUnlocked && (
          <div className="flex items-start gap-3 rounded-eb-md border border-line bg-canvas/60 p-4 text-ink-secondary">
            <Lock size={18} className="mt-0.5 shrink-0 text-ink-muted" />
            <div className="flex flex-col gap-1 text-[13px] leading-5">
              <p className="font-medium text-ink">{t("g5.feedback.reflectionLockedTitle")}</p>
              <p className="text-[12px]">{t("g5.feedback.reflectionLockedNotice")}</p>
            </div>
          </div>
        )}

        {/* Case B: Reflection is unlocked (submission is REVIEWED with feedback, student can compose reflection) */}
        {isReflectionUnlocked && (
          <div className="flex flex-col gap-4">
            <p className="text-[13px] leading-5 text-ink-secondary">
              {t("g5.feedback.reflectionDescription")}
            </p>

            <Field
              multiline
              rows={5}
              placeholder={t("g5.feedback.reflectionPlaceholder")}
              value={reflectionText}
              onChange={(e) => {
                setReflectionText(e.target.value);
                if (validationError) setValidationError(null);
              }}
              helper={t("g5.feedback.reflectionHelper", {
                current: reflectionText.length,
                max: REFLECTION_MAX_LENGTH,
              })}
              error={validationError}
              maxLength={REFLECTION_MAX_LENGTH}
            />

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitReflection}
                disabled={isSubmitting || reflectionText.trim().length < REFLECTION_MIN_LENGTH}
                className="inline-flex items-center gap-2"
              >
                <MessageSquareText size={16} />
                <span>
                  {isSubmitting
                    ? t("g5.feedback.submittingReflection")
                    : t("g5.feedback.submitReflection")}
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Case C: Reflection is completed (REFLECTED, read-only immutable view) */}
        {isReflected && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-eb-md bg-success-bg p-3 text-[13px] font-medium text-success-text">
              <CheckCircle2 size={16} className="text-success" />
              <span>{t("g5.feedback.reflectionSubmittedNotice")}</span>
            </div>

            <div className="flex flex-col gap-1.5 rounded-eb-md border border-line bg-canvas/60 p-4">
              <p className="whitespace-pre-wrap text-[14px] leading-6 text-ink">
                {submission.reflectionText || "—"}
              </p>
              {submission.reflectionSubmittedAt && (
                <span className="text-right text-[12px] text-ink-muted">
                  {t("g5.feedback.reflectionSubmittedAt", {
                    time: formatDateTime(new Date(submission.reflectionSubmittedAt)),
                  })}
                </span>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
