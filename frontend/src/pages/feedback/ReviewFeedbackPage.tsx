/**
 * Review Study · Student Lecturer Feedback & Post-Feedback Reflection
 * Figma page EduBranch AI – Screens, Frames 05.4 & 06.3 (Deliverable FE-020, EBA-415).
 *
 * Route: /student/cases/:caseId/review-study/:submissionId/feedback
 *
 * Acceptance Criteria & Invariants:
 * 1. Displays qualitative lecturer feedback after submission transitions to REVIEWED.
 * 2. Access control: Unauthorized access or foreign student submissions are rejected (403 Forbidden).
 * 3. Lifecycle-gated reflection: reflection form only unlocks when submission is REVIEWED.
 * 4. Submitting reflection via API updates state to REFLECTED.
 * 5. If API fails, reflection content is never shown as saved (no fake success).
 * 6. Completely isolated from Branching Study attempts.
 * 7. Strictly no scoring, grades, points, or AI evaluation.
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { ArrowLeft, FileSearch, ShieldAlert } from "lucide-react";
import { EmptyState, ErrorState, StudentReviewFeedbackView } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { caseService } from "@/services/caseService";
import { courseService } from "@/services/courseService";
import { reviewStudyService } from "@/services/reviewStudyService";
import { useAuthStore } from "@/stores/authStore";
import type { Case, Course, LecturerFeedback, ReviewStudySubmission } from "@/types";

type PageState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "notFound" }
  | { status: "error"; errorCode?: number | string }
  | {
      status: "ready";
      caseData: Case;
      course?: Course;
      submission: ReviewStudySubmission;
      feedback: LecturerFeedback | null;
      feedbackLoading?: boolean;
      feedbackError?: boolean;
      feedbackErrorCode?: number | string;
    };

export function ReviewFeedbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseId = "", submissionId } = useParams<{ caseId: string; submissionId?: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [state, setState] = useState<PageState>({ status: "loading" });
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        // 1. Load Case
        const caseData = await caseService.getCaseById(caseId);

        // 2. Load Course
        let course: Course | undefined;
        try {
          course = await courseService.getCourseById(caseData.courseId);
        } catch {
          // Non-fatal if course metadata fetch fails
        }

        // 3. Load Submission
        const submission = submissionId
          ? await reviewStudyService.getSubmissionById(submissionId)
          : await reviewStudyService.getMySubmission(caseId);

        if (!alive) return;

        if (!submission) {
          setState({ status: "notFound" });
          return;
        }

        // 4. Ownership / Authorization Check (AC: Student cannot view unauthorized feedback)
        if (currentUserId && submission.studentId && submission.studentId !== currentUserId) {
          setState({ status: "unauthorized" });
          return;
        }

        // 5. Load Feedback (do not swallow feedback errors; pass errors to the view)
        let feedback: LecturerFeedback | null = null;
        let feedbackError = false;
        let feedbackErrorCode: number | string | undefined;

        try {
          feedback = await reviewStudyService.getFeedback(submission.id);
        } catch (fbErr: unknown) {
          feedbackError = true;
          feedbackErrorCode = isAxiosError(fbErr) ? fbErr.response?.status : undefined;
        }

        if (!alive) return;

        setState({
          status: "ready",
          caseData,
          course,
          submission,
          feedback,
          feedbackError,
          feedbackErrorCode,
        });
      } catch (err: unknown) {
        if (!alive) return;
        if (isAxiosError(err)) {
          if (err.response?.status === 403) {
            setState({ status: "unauthorized" });
            return;
          }
          if (err.response?.status === 404) {
            setState({ status: "notFound" });
            return;
          }
        }
        const code = isAxiosError(err) ? err.response?.status : undefined;
        setState({ status: "error", errorCode: code });
      }
    }

    void run();

    return () => {
      alive = false;
    };
  }, [caseId, submissionId, currentUserId, reloadTrigger]);

  const handleRetryFeedback = async () => {
    if (state.status !== "ready") return;
    const subId = state.submission.id;
    setState((prev) =>
      prev.status === "ready"
        ? { ...prev, feedbackLoading: true, feedbackError: false }
        : prev,
    );
    try {
      const feedback = await reviewStudyService.getFeedback(subId);
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              feedback,
              feedbackLoading: false,
              feedbackError: false,
              feedbackErrorCode: undefined,
            }
          : prev,
      );
    } catch (fbErr: unknown) {
      const code = isAxiosError(fbErr) ? fbErr.response?.status : undefined;
      setState((prev) =>
        prev.status === "ready"
          ? {
              ...prev,
              feedbackLoading: false,
              feedbackError: true,
              feedbackErrorCode: code,
            }
          : prev,
      );
    }
  };

  const handleReload = () => {
    setState({ status: "loading" });
    setReloadTrigger((n) => n + 1);
  };

  useShellTitle(state.status === "ready" ? state.caseData.title : null);

  // Loading State
  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label={t("states.loading.label")}
        className="flex flex-col gap-5"
      >
        <div className="h-28 w-full rounded-eb-xl bg-surface shadow-eb-card motion-safe:animate-pulse" />
        <div className="h-64 w-full rounded-eb-xl bg-surface shadow-eb-card motion-safe:animate-pulse" />
        <div className="h-48 w-full rounded-eb-xl bg-surface shadow-eb-card motion-safe:animate-pulse" />
      </div>
    );
  }

  // Unauthorized Access State (403 Forbidden)
  if (state.status === "unauthorized") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <EmptyState
          icon={ShieldAlert}
          title={t("g5.feedback.unauthorizedTitle")}
          description={t("g5.feedback.unauthorizedBody")}
          action={{
            label: t("g5.feedback.backToDesk"),
            to: PATHS.STUDENT.DESK,
            icon: ArrowLeft,
          }}
          actionVariant="primary"
          className="max-w-md self-center"
        />
      </div>
    );
  }

  // Submission Not Found State (404)
  if (state.status === "notFound") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <EmptyState
          icon={FileSearch}
          title={t("g5.feedback.notFoundTitle")}
          description={t("g5.feedback.notFoundBody")}
          action={{
            label: t("g5.feedback.backToDesk"),
            to: PATHS.STUDENT.DESK,
            icon: ArrowLeft,
          }}
          actionVariant="secondary"
          className="max-w-md self-center"
        />
      </div>
    );
  }

  // Unexpected Error State
  if (state.status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-12">
        <ErrorState
          errorCode={state.errorCode}
          onRetry={handleReload}
          className="max-w-md self-center"
        />
      </div>
    );
  }

  // Ready State: Render StudentReviewFeedbackView
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col pb-10">
      <StudentReviewFeedbackView
        submission={state.submission}
        feedback={state.feedback}
        caseTitle={state.caseData.title}
        courseName={state.course?.name}
        courseCode={state.course?.courseCode}
        feedbackLoading={state.feedbackLoading}
        feedbackError={state.feedbackError}
        feedbackErrorCode={state.feedbackErrorCode}
        onRetryFeedback={handleRetryFeedback}
        onReflectionSubmitted={(updated) => {
          setState((prev) => (prev.status === "ready" ? { ...prev, submission: updated } : prev));
        }}
        onBack={() => navigate(buildPath(PATHS.STUDENT.REVIEW_STUDY, { caseId }))}
      />
    </div>
  );
}
