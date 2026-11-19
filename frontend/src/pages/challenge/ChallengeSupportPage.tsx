/**
 * EduBranch AI — AI Reasoning / Challenge Support (Figma 05.5 / 05.6: modal on Journey Review).
 *
 * NON-NEGOTIABLE (FND §6.1, Proposal V1.2):
 * - Socratic counter-questions only (probing assumptions & trade-offs)
 * - 1–2 rounds hard cap enforced by server gateway and PostgreSQL schema
 * - The AI never grades, scores, or judges correctness
 *
 * STATUS (FND §6, CLAUDE.md):
 * The backend gateway does not have a Challenge Support endpoint yet (controller is an empty skeleton;
 * the AI service route is internal and called exclusively by the gateway).
 * Per PO directive, the UI strictly maintains an honest "unavailable / in-progress" state rather
 * than fabricating fake AI counter-questions or holding round state in client-side memory.
 */

import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleAlert, MessageSquare, X } from "lucide-react";
import {
  AiOriginBadge,
  Button,
  Dialog,
  Field,
  StatusPill,
  cx,
  FOCUS_RING,
} from "@/components/ds";
import { ErrorState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";

/** Maximum length of a student's challenge reply in Figma 05.5 ("0 / 1000 ký tự"). */
export const REPLY_MAX = 1000;

export interface ChallengeDialogProps {
  open: boolean;
  onClose: () => void;
  stepNumber: number;
  decision: string;
  reasoning?: string;
  reasoningId?: string;
  reviewSubmissionId?: string;
  caseContext?: string;
}

export function ChallengeDialog({
  open,
  onClose,
  stepNumber,
  decision,
  reasoning = "",
}: ChallengeDialogProps) {
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
        className={cx(
          "absolute top-6 right-6 flex size-5 cursor-pointer items-center justify-center rounded-eb-sm text-ink-secondary",
          FOCUS_RING,
        )}
      >
        <X aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.33} />
      </button>

      <div className="flex flex-col gap-3 pt-3">
        {/* Round status indicator & AI Badge */}
        <div className="flex items-center justify-between">
          <AiOriginBadge type="assisted" className="self-start">
            {t("g5.common.aiAssisted")}
          </AiOriginBadge>
          <StatusPill tone="info">
            {t("g5.challenge.roundIndicator", { round: 1 })}
          </StatusPill>
        </div>

        {/* Student decision & reasoning context */}
        <div className="flex flex-col gap-1.5 rounded-eb-lg bg-canvas px-4 py-3.5 border border-line-soft">
          <span className="text-[12px] leading-4 font-medium text-ink-secondary">
            {t("g5.challenge.decisionAt", { n: stepNumber })}
          </span>
          <p className="text-[14px] leading-5 font-medium text-ink">{decision}</p>
          {reasoning && (
            <p className="text-[13px] leading-4 text-ink-secondary mt-1 whitespace-pre-line border-t border-line-soft pt-2">
              {reasoning}
            </p>
          )}
        </div>

        {/* Honest unavailable notice (PO directive: no fake AI data) */}
        <div
          role="alert"
          className="flex flex-col gap-1.5 rounded-eb-lg bg-error-bg px-4 py-3.5 border border-line-soft"
        >
          <span className="flex items-center gap-1.5 text-[12px] leading-4 font-medium text-error-text">
            <CircleAlert aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.5} />
            {t("g5.challenge.unavailableTitle")}
          </span>
          <p className="text-[14px] leading-5 text-ink">{t("g5.challenge.unavailableBody")}</p>
        </div>

        {/* Reply field — disabled while gateway endpoint is pending */}
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

/** Standalone route PATHS.STUDENT.CHALLENGE: /student/cases/:caseId/challenge/:sessionId */
export function ChallengeSupportPage() {
  const { t } = useTranslation();
  const { caseId = "" } = useParams();
  useShellTitle(t("g5.challenge.title"));

  return (
    <div className="flex flex-1 flex-col items-center gap-4">
      <ErrorState
        icon={MessageSquare}
        title={t("g5.challenge.unavailableTitle")}
        description={t("g5.challenge.unavailableBody")}
        className="self-stretch"
      />
      <Button variant="secondary" to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })}>
        {t("g5.review.backToCase")}
      </Button>
    </div>
  );
}
