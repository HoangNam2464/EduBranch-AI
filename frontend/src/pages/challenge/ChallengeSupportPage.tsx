/**
 * EduBranch AI — AI Reasoning / Challenge Support (Figma 05.5 / 05.6: modal on Journey Review).
 *
 * NON-NEGOTIABLE (feature-challenge-support.md, FND §6.1): Socratic counter-questions only,
 * 1–2 rounds hard cap, the AI never grades, scores or judges correctness.
 *
 * STATUS: the backend gateway has no Challenge Support endpoint yet
 * (backend/src/modules/challenge-support/challenge-support.controller.ts is an empty skeleton;
 * the AI service route POST /internal/v1/challenge-support/generate is internal and must only be
 * called by the gateway). The dialog therefore shows the student's decision and states that the
 * AI challenge is unavailable instead of inventing questions. The former client-side generator in
 * caseStudyStore produced fake AI text and is no longer used here.
 */
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleAlert, MessageSquare, X } from "lucide-react";
import { AiOriginBadge, Button, Dialog, Field, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";

/** Maximum length of a student's challenge reply in Figma 05.5 ("0 / 1000 ký tự"). */
const REPLY_MAX = 1000;

export function ChallengeDialog({
  open,
  onClose,
  stepNumber,
  decision,
}: {
  open: boolean;
  onClose: () => void;
  stepNumber: number;
  decision: string;
}) {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={600}
      title={t("g5.challenge.title")}
      description={t("g5.challenge.description")}
      actions={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("g5.challenge.skip")}
          </Button>
          <Button size="md" disabled>
            {t("g5.challenge.send", { round: 1 })}
          </Button>
        </>
      }
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={t("g5.common.close")}
        className={cx("absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary", FOCUS_RING)}
      >
        <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
      </button>
      <div className="flex flex-col gap-3 pt-3">
        <AiOriginBadge type="assisted" className="self-start">
          {t("g5.common.aiAssisted")}
        </AiOriginBadge>
        <div className="flex flex-col gap-1.5 rounded-eb-lg bg-canvas px-4 py-3.5">
          <span className="text-[12px] leading-4 font-medium text-ink-secondary">{t("g5.challenge.decisionAt", { n: stepNumber })}</span>
          <p className="text-[14px] leading-5 text-ink">{decision}</p>
        </div>
        <div role="alert" className="flex flex-col gap-1.5 rounded-eb-lg bg-error-bg px-4 py-3.5">
          <span className="flex items-center gap-1.5 text-[12px] leading-4 font-medium text-error-text">
            <CircleAlert aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.5} />
            {t("g5.challenge.unavailableTitle")}
          </span>
          <p className="text-[14px] leading-5 text-ink">{t("g5.challenge.unavailableBody")}</p>
        </div>
        <Field
          multiline
          disabled
          label={t("g5.challenge.replyLabel")}
          placeholder={t("g5.challenge.replyPlaceholder")}
          helper={t("g5.common.charCount", { count: 0, max: REPLY_MAX })}
          maxLength={REPLY_MAX}
        />
      </div>
    </Dialog>
  );
}

/** Standalone route PATHS.STUDENT.CHALLENGE — no Figma frame; challenge lives in the 05.4 dialog. */
export function ChallengeSupportPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  useShellTitle(t("g5.challenge.title"));
  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <ErrorState icon={MessageSquare} title={t("g5.challenge.unavailableTitle")} description={t("g5.challenge.unavailableBody")} className="self-stretch" />
      <Button variant="secondary" to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })}>
        {t("g5.review.backToCase")}
      </Button>
    </div>
  );
}
