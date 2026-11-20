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
import { AlertCircle, ArrowLeft, FileSearch, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ds";
import { EmptyState, StudentReviewFeedbackView } from "@/components/feedback";
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
  | { status: "error"; message: string }
  | {
      status: "ready";
      caseData: Case;
      course?: Course;
      submission: ReviewStudySubmission;
      feedback: LecturerFeedback | null;
    };

export function ReviewFeedbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseId = "", submissionId } = useParams<{ caseId: string; submissionId?: string }>();
  const currentUser = useAuthStore((s) => s.user);

  const [state, setState] = useState<PageState>({ status: "loading" });

  const loadData = async () => {
    setState({ status: "loading" });
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
      let submission: ReviewStudySubmission | null = null;
      if (submissionId) {
        submission = await reviewStudyService.getSubmissionById(submissionId);
      } else {
        submission = await reviewStudyService.getMySubmission(caseId);
      }

      if (!submission) {
        setState({ status: "notFound" });
        return;
      }

      // 4. Ownership / Authorization Check (AC: Student cannot view unauthorized feedback)
      if (currentUser?.id && submission.studentId && submission.studentId !== currentUser.id) {
        setState({ status: "unauthorized" });
        return;
      }

      // 5. Load Feedback (if submission is in REVIEWED or REFLECTED status)
      let feedback: LecturerFeedback | null = null;
      try {
        feedback = await reviewStudyService.getFeedback(submission.id);
      } catch {
        feedback = null;
      }

      setState({
        status: "ready",
        caseData,
        course,
        submission,
        feedback,
      });
    } catch (err: unknown) {
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
      const msg = err instanceof Error ? err.message : String(err);
      setState({ status: "error", message: msg });
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, submissionId]);

  useShellTitle(state.status === "ready" ? state.caseData.title : null);

  // Loading State
  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label={t("common.loading", "Đang tải...")}
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-eb-xl border border-error-border bg-error-bg p-6 text-center text-error-text">
          <AlertCircle size={32} className="text-error" />
          <p className="text-[15px] font-medium">{t("common.error", "Đã xảy ra lỗi")}</p>
          <p className="text-[13px] opacity-90">{state.message}</p>
          <div className="pt-2">
            <Button variant="secondary" size="sm" onClick={() => void loadData()}>
              {t("common.retry", "Thử lại")}
            </Button>
          </div>
        </div>
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
        onReflectionSubmitted={(updated) => {
          setState((prev) => (prev.status === "ready" ? { ...prev, submission: updated } : prev));
        }}
        onBack={() => navigate(buildPath(PATHS.STUDENT.REVIEW_STUDY, { caseId }))}
      />
    </div>
  );
}
