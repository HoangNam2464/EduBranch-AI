/**
 * EduBranch AI — AI Reasoning / Challenge Support (Figma 05.5 / 05.6: modal on Journey Review).
 *
 * NON-NEGOTIABLE (feature-challenge-support.md, FND §6.1): Socratic counter-questions only,
 * 1–2 rounds hard cap, the AI never grades, scores or judges correctness.
 *
 * Real Gateway Integration (FE-021 + BE-027):
 *   - Round 1 (05.5): fetches or creates session via POST /api/v1/challenge-support/sessions,
 *     displays AI counter-question, allows 1 student reply (up to 1000 chars).
 *   - Round 2 (05.6): sends student reply via POST /api/v1/challenge-support/sessions/:id/replies,
 *     displays Round 1 exchange and final Round 2 counter-question.
 *   - After Round 2: session is completed; no reply box in Round 2; subsequent attempts rejected with 409.
 *   - Never simulates successful answers. Real loading and error states with retry capability.
 */
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleAlert, Loader2, MessageSquare, X } from "lucide-react";
import { AiOriginBadge, Button, Dialog, Field, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { challengeSupportService } from "@/services/challengeSupportService";
import type { ChallengeSession } from "@/services/mappers/challengeSupport";

/** Maximum length of a student's challenge reply in Figma 05.5 ("0 / 1000 ký tự"). */
export const REPLY_MAX = 1000;

export interface ChallengeDialogProps {
  open: boolean;
  onClose: () => void;
  stepNumber: number;
  decision: string;
  reasoningId?: string;
  reasoning?: string;
  reviewSubmissionId?: string;
  caseContext?: string;
}

/** Maps API error status/code to localized user-friendly message (AGENTS rule 12, R1-M3) */
function getChallengeErrorMessage(err: any, t: (key: string) => string): string {
  const status = err?.response?.status;
  const code = err?.response?.data?.code;

  if (status === 409 || code === "MAX_ROUNDS_REACHED") {
    return t("g5.challenge.errors.maxRoundsReached");
  }
  if (status === 502 || code === "AI_SERVICE_UNAVAILABLE") {
    return t("g5.challenge.errors.aiUnavailable");
  }
  if (status === 403) {
    return t("g5.challenge.errors.forbidden");
  }
  if (status === 404) {
    return t("g5.challenge.errors.notFound");
  }
  return t("g5.challenge.errors.generic");
}

export function ChallengeDialog({
  open,
  onClose,
  stepNumber,
  decision,
  reasoningId,
  reasoning = "",
}: ChallengeDialogProps) {
  const { t } = useTranslation();
  const [session, setSession] = useState<ChallengeSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadSession = useCallback(async () => {
    if (!reasoningId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await challengeSupportService.createOrGetSession(reasoningId);
      setSession(data);
    } catch (err: any) {
      setError(getChallengeErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [reasoningId, t]);

  useEffect(() => {
    if (open && reasoningId) {
      loadSession();
    } else if (!open) {
      setSession(null);
      setError(null);
      setReplyText("");
    }
  }, [open, reasoningId, loadSession]);

  const handleSendReply = async () => {
    if (!session || !replyText.trim()) return;
    setSending(true);
    setError(null);
    try {
      const updated = await challengeSupportService.sendReply(
        session.id,
        replyText.trim(),
      );
      setSession(updated);
      setReplyText("");
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.code;
      // Over the limit or completed (R1-M3): reload session so completed view is rendered
      if (status === 409 || code === "MAX_ROUNDS_REACHED") {
        try {
          const reloaded = await challengeSupportService.getSession(session.id);
          setSession(reloaded);
        } catch {
          setSession((prev) =>
            prev ? { ...prev, isCompleted: true, currentRound: 2 } : null,
          );
        }
      }
      setError(getChallengeErrorMessage(err, t));
    } finally {
      setSending(false);
    }
  };

  const q1 = session?.messages.find(
    (m) => m.roundNumber === 1 && m.role === "CHALLENGE_SUPPORT",
  );
  const a1 = session?.messages.find(
    (m) => m.roundNumber === 1 && m.role === "STUDENT",
  );
  const q2 = session?.messages.find(
    (m) => m.roundNumber === 2 && m.role === "CHALLENGE_SUPPORT",
  );

  const isCompleted = Boolean(
    session && (session.isCompleted || session.currentRound >= 2 || (a1 && q2)),
  );

  // Render actions depending on state
  const renderActions = () => {
    if (loading) return null;

    if (error && !session) {
      return (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("g5.common.close")}
          </Button>
          <Button size="md" onClick={loadSession}>
            {t("g5.challenge.retry")}
          </Button>
        </div>
      );
    }

    if (isCompleted) {
      return (
        <div className="flex w-full items-center justify-between">
          <span className="text-[12px] leading-4 text-ink-secondary">
            {t("g5.challenge.completedFooter")}
          </span>
          <Button size="md" onClick={onClose}>
            {t("g5.challenge.backToReview")}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="md" onClick={onClose} disabled={sending}>
          {t("g5.challenge.skip")}
        </Button>
        <Button
          size="md"
          onClick={handleSendReply}
          disabled={!replyText.trim() || sending}
        >
          {sending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="animate-spin" size={16} />
              {t("g5.challenge.sending")}
            </span>
          ) : (
            t("g5.challenge.send", { round: 1 })
          )}
        </Button>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={600}
      title={t("g5.challenge.title")}
      description={
        isCompleted
          ? t("g5.challenge.completedSubtitle", { n: stepNumber })
          : t("g5.challenge.description")
      }
      actions={renderActions()}
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
        {/* Figma 05.5 shows the AI-assisted badge; the completed state 05.6 does not. */}
        {!isCompleted && (
          <AiOriginBadge type="assisted" className="self-start">
            {t("g5.common.aiAssisted")}
          </AiOriginBadge>
        )}

        {/* Decision Block */}
        <div className="flex flex-col gap-1.5 rounded-eb-lg bg-canvas px-4 py-3.5">
          <span className="text-[12px] font-medium leading-4 text-ink-secondary">
            {t("g5.challenge.decisionAt", { n: stepNumber })}
          </span>
          <p className="text-[14px] leading-5 text-ink">{decision}</p>
          {reasoning && (
            <p className="text-[13px] leading-4 text-ink-secondary mt-1 whitespace-pre-line border-t border-border/50 pt-2">
              {reasoning}
            </p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-ink-secondary">
            <Loader2 className="animate-spin text-link" size={28} />
            <span className="text-[14px] leading-5 font-medium">
              {t("g5.challenge.loading")}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-eb-lg bg-error-bg px-4 py-3.5"
          >
            <span className="flex items-center gap-1.5 text-[12px] font-medium leading-4 text-error-text">
              <CircleAlert aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.5} />
              {t("g5.challenge.errorTitle")}
            </span>
            <p className="text-[14px] leading-5 text-ink">{error}</p>
            {session && (
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleSendReply}>
                  {t("g5.challenge.retry")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Missing reasoning error */}
        {!reasoningId && !loading && !error && (
          <div
            role="alert"
            className="flex flex-col gap-1.5 rounded-eb-lg bg-error-bg px-4 py-3.5"
          >
            <span className="flex items-center gap-1.5 text-[12px] font-medium leading-4 text-error-text">
              <CircleAlert aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={1.5} />
              {t("g5.challenge.unavailableTitle")}
            </span>
            <p className="text-[14px] leading-5 text-ink">
              {t("g5.challenge.unavailableBody")}
            </p>
          </div>
        )}

        {/* Active Flow: Round 1 (Figma 05.5) */}
        {session && !isCompleted && !loading && (
          <>
            {q1 && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-selected px-4 py-3.5">
                <span className="text-[12px] font-medium leading-4 text-link">
                  {t("g5.challenge.counterQuestionLabel")}
                </span>
                <p className="text-[14px] leading-5 text-ink">
                  "{q1.content}"
                </p>
              </div>
            )}

            <Field
              multiline
              label={t("g5.challenge.replyLabel")}
              placeholder={t("g5.challenge.replyPlaceholder")}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              helper={t("g5.common.charCount", {
                count: replyText.length,
                max: REPLY_MAX,
              })}
              maxLength={REPLY_MAX}
              disabled={sending}
            />
          </>
        )}

        {/* Completed Flow: Round 2 (Figma 05.6) */}
        {session && isCompleted && !loading && (
          <div className="flex flex-col gap-3">
            {/* Round 1 AI Counter-Question */}
            {q1 && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-selected px-4 py-3.5">
                <span className="text-[12px] font-medium leading-4 text-link">
                  {t("g5.challenge.r1Question")}
                </span>
                <p className="text-[14px] leading-5 text-ink">
                  "{q1.content}"
                </p>
              </div>
            )}

            {/* Round 1 Student Reply */}
            {a1 && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-canvas px-4 py-3.5">
                <span className="text-[12px] font-medium leading-4 text-ink-secondary">
                  {t("g5.challenge.r1Answer")}
                </span>
                <p className="text-[14px] leading-5 text-ink whitespace-pre-line">
                  {a1.content}
                </p>
              </div>
            )}

            {/* Round 2 AI Counter-Question */}
            {q2 && (
              <div className="flex flex-col gap-1.5 rounded-eb-lg bg-selected px-4 py-3.5">
                <span className="text-[12px] font-medium leading-4 text-link">
                  {t("g5.challenge.r2Question")}
                </span>
                <p className="text-[14px] leading-5 text-ink">
                  "{q2.content}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** Standalone route PATHS.STUDENT.CHALLENGE — retrieves existing session by sessionId */
export function ChallengeSupportPage() {
  const { t } = useTranslation();
  const { caseId = "", sessionId = "" } = useParams();
  const [session, setSession] = useState<ChallengeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useShellTitle(t("g5.challenge.title"));

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    challengeSupportService
      .getSession(sessionId)
      .then((data) => {
        setSession(data);
      })
      .catch((err: any) => {
        setError(getChallengeErrorMessage(err, t));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, t]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <Loader2 className="animate-spin text-link" size={32} />
        <span className="text-[14px] font-medium text-ink-secondary">
          {t("g5.challenge.loading")}
        </span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-1 flex-col items-center gap-4">
        <ErrorState
          icon={MessageSquare}
          title={error ? t("g5.challenge.errorTitle") : t("g5.challenge.unavailableTitle")}
          description={error || t("g5.challenge.unavailableBody")}
          className="self-stretch"
        />
        <Button variant="secondary" to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })}>
          {t("g5.review.backToCase")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-semibold text-ink">{t("g5.challenge.title")}</h1>
        <AiOriginBadge type="assisted">{t("g5.common.aiAssisted")}</AiOriginBadge>
      </div>

      <div className="flex flex-col gap-3 rounded-eb-lg bg-canvas p-4">
        {session.messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-1 border-b border-border/50 pb-2 last:border-b-0">
            <span className="text-[12px] font-medium text-ink-secondary">
              {m.role === "CHALLENGE_SUPPORT"
                ? t("g5.challenge.counterQuestionLabel")
                : t("g5.challenge.replyLabel")}{" "}
              ({t("g5.challenge.roundLabel", { round: m.roundNumber })})
            </span>
            <p className={cx("text-[14px] leading-5", m.role === "CHALLENGE_SUPPORT" && "text-ink")}>
              {m.content}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="secondary" to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })}>
          {t("g5.review.backToCase")}
        </Button>
      </div>
    </div>
  );
}
