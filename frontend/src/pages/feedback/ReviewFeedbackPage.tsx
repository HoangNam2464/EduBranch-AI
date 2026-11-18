/**
 * Review Study · lecturer feedback + student reflection — Figma 06.3.
 *
 * Gap (reported, not faked): the gateway has no endpoint to read a Review Study submission or
 * its lecturer feedback (backend/src/modules/review-study and lecturer-feedback are empty
 * skeletons), and none to post the student's reflection. The screen loads the real case for its
 * title and states that the feedback cannot be shown yet.
 */
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ds";
import { EmptyState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { loadStudentCase, useLoad } from "@/pages/branching/components/useStudentCase";
import { PlayerError } from "@/pages/branching/BranchingCasePlayerPage";

export function ReviewFeedbackPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  const [state, reload] = useLoad(() => loadStudentCase(caseId), [caseId]);
  useShellTitle(state.status === "ready" ? state.data.caseData.title : null);

  if (state.status === "loading") {
    return <div role="status" aria-label={t("g5.common.loading")} className="h-[480px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />;
  }
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;

  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <EmptyState
        icon={MessageSquare}
        title={t("g5.feedback.unavailableTitle")}
        description={t("g5.feedback.unavailableBody")}
        className="self-stretch"
      />
      <Button variant="secondary" to={buildPath(PATHS.STUDENT.REVIEW_STUDY, { caseId })}>
        {t("g5.feedback.backToWork")}
      </Button>
    </div>
  );
}
