import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileSearch } from "lucide-react";
import { EmptyState } from "@/components/feedback";
import { PATHS } from "@/routes/paths";

/*
 * 04.2 Chi tiết phản hồi lập luận sinh viên (node 483:15233) and 04.2b Chi tiết bài nộp
 * Review Study (node 517:6602), route /lecturer/feedback/:submissionId.
 *
 * The backend cannot serve this screen yet: there is no lecturer endpoint to read a
 * submission or save feedback (`lecturer-feedback` / `review-study` controllers are empty
 * skeletons; `GET /branching-attempts/:id` rejects lecturers because the controller never
 * passes `isLecturer`). Showing the Figma sample would be fake data, so the page states
 * that the submission cannot be shown and links back to the queue. The layout of 04.2 /
 * 04.2b is to be built when the endpoints exist (see the G4 report for the contract).
 */
export function StudentSubmissionFeedbackPage() {
  const { t } = useTranslation();
  const { submissionId = "" } = useParams<{ submissionId: string }>();

  return (
    <div className="flex flex-1 flex-col pb-5">
      <EmptyState
        icon={FileSearch}
        title={t("g4.detail.unavailableTitle")}
        description={t("g4.detail.unavailableDescription", { id: submissionId })}
        action={{ label: t("g4.detail.backToQueue"), to: PATHS.LECTURER.FEEDBACK, icon: ArrowLeft }}
        actionVariant="secondary"
      />
    </div>
  );
}
