import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, MessageSquare, Send, ShieldCheck, ArrowRight } from "lucide-react";
import { AiOriginBadge, Button, Field, cx, FOCUS_RING } from "@/components/ds";

export const REPLY_MAX = 1000;

export interface ChallengeMessage {
  id: string;
  round: number; // 1 or 2
  role: "ai" | "student";
  content: string;
  createdAt?: string;
}

export interface SocraticDialoguePanelProps {
  caseTitle?: string;
  stepNumber?: number;
  decisionText?: string;
  originalReasoning?: string;
  currentRound: number; // 1 or 2
  maxRounds?: number; // default 2
  isCompleted?: boolean;
  messages: ChallengeMessage[];
  onSubmitReply: (replyText: string) => Promise<void> | void;
  onConcludeSession: () => void;
  isLoading?: boolean;
}

/**
 * SocraticDialoguePanel — AI Reasoning & Challenge Support Component (FE-021).
 *
 * NON-NEGOTIABLE INVARIANTS (FND §6.1, feature-challenge-support.md):
 * 1. Hard cap: Maximum 2 rounds (Round 1 & Round 2). After Round 2 or conclusion, session is locked.
 * 2. Absolute zero grading: Never display scores, ratings, letter grades, or pass/fail decisions.
 * 3. Structured academic thread layout, not an open-ended chatbot.
 */
export function SocraticDialoguePanel({
  stepNumber = 1,
  decisionText,
  originalReasoning,
  currentRound,
  maxRounds = 2,
  isCompleted = false,
  messages,
  onSubmitReply,
  onConcludeSession,
  isLoading = false,
}: SocraticDialoguePanelProps) {
  const { t } = useTranslation();
  const [replyInput, setReplyInput] = useState("");

  const effectivelyCompleted = isCompleted || currentRound > maxRounds;

  const handleSubmit = async () => {
    const trimmed = replyInput.trim();
    if (!trimmed || effectivelyCompleted || isLoading) return;
    await onSubmitReply(trimmed);
    setReplyInput("");
  };

  return (
    <div className="flex w-full flex-col gap-5 rounded-eb-xl border border-line-subtle bg-surface p-5 shadow-eb-card md:p-6">
      {/* Header & Two-Round Progress Tracker */}
      <div className="flex flex-col gap-3 border-b border-line-subtle pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] leading-6 font-semibold text-ink">
              {t("g5.challenge.title")}
            </h2>
            <AiOriginBadge type="assisted">
              {effectivelyCompleted
                ? t("g5.challenge.completedBadge")
                : t("g5.challenge.roundStatus", { current: Math.min(currentRound, maxRounds), max: maxRounds })}
            </AiOriginBadge>
          </div>
          <p className="text-[13px] leading-5 text-ink-secondary">
            {t("g5.challenge.description")}
          </p>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={cx(
              "flex items-center gap-1.5 rounded-eb-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
              currentRound === 1 && !effectivelyCompleted
                ? "bg-accent-subtle text-accent-text ring-1 ring-accent"
                : currentRound > 1 || effectivelyCompleted
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-canvas text-ink-secondary"
            )}
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-surface text-[10px] font-bold">1</span>
            <span>{t("g5.challenge.roundStatus", { current: 1, max: maxRounds })}</span>
          </div>

          <ArrowRight size={14} className="text-ink-secondary" />

          <div
            className={cx(
              "flex items-center gap-1.5 rounded-eb-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
              currentRound === 2 && !effectivelyCompleted
                ? "bg-accent-subtle text-accent-text ring-1 ring-accent"
                : effectivelyCompleted
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-canvas text-ink-secondary"
            )}
          >
            <span className="flex size-4 items-center justify-center rounded-full bg-surface text-[10px] font-bold">2</span>
            <span>{t("g5.challenge.roundStatus", { current: 2, max: maxRounds })}</span>
          </div>
        </div>
      </div>

      {/* Pedagogical Grounding Notice: Zero-grading enforcement banner */}
      <div className="flex items-start gap-2.5 rounded-eb-md bg-canvas px-3.5 py-2.5 text-[12px] leading-4 text-ink-secondary">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-accent" />
        <span>{t("g5.challenge.noGradingNotice")}</span>
      </div>

      {/* Decision & Original Reasoning Card */}
      {(decisionText || originalReasoning) && (
        <div className="flex flex-col gap-2 rounded-eb-lg bg-canvas px-4 py-3.5 border border-line-subtle">
          <span className="text-[12px] leading-4 font-semibold uppercase tracking-wider text-ink-secondary">
            {t("g5.challenge.decisionAt", { n: stepNumber })}
          </span>
          {decisionText && <p className="text-[14px] leading-5 font-medium text-ink">{decisionText}</p>}
          {originalReasoning && (
            <div className="mt-1 border-t border-line-subtle pt-2">
              <span className="text-[11px] font-medium text-ink-secondary">{t("g5.challenge.originalReasoning")}:</span>
              <p className="mt-0.5 text-[13px] leading-5 text-ink-secondary italic">{originalReasoning}</p>
            </div>
          )}
        </div>
      )}

      {/* Structured Academic Dialogue Thread */}
      <div className="flex flex-col gap-4">
        {messages.map((msg) => {
          const isAi = msg.role === "ai";
          const isFinalRound = msg.round >= maxRounds;
          return (
            <div
              key={msg.id}
              className={cx(
                "flex flex-col gap-2 rounded-eb-lg p-4 border transition-all",
                isAi
                  ? "border-line-subtle bg-surface shadow-xs"
                  : "border-line-subtle bg-canvas ml-4 sm:ml-8"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isAi ? (
                    <AiOriginBadge type="assisted">
                      {isFinalRound
                        ? t("g5.challenge.roundFinalBadge", { round: msg.round, max: maxRounds })
                        : t("g5.challenge.roundBadge", { round: msg.round, max: maxRounds })}
                    </AiOriginBadge>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                      <MessageSquare size={14} className="text-accent" />
                      {t("g5.challenge.studentResponseLabel", { round: msg.round })}
                    </span>
                  )}
                </div>
                {msg.createdAt && (
                  <span className="text-[11px] text-ink-secondary">{msg.createdAt}</span>
                )}
              </div>
              <p className="text-[14px] leading-relaxed text-ink whitespace-pre-wrap">{msg.content}</p>
            </div>
          );
        })}
      </div>

      {/* Footer Area: Active Reply Form vs Hard-Cap Locked Banner */}
      {effectivelyCompleted ? (
        /* Hard-Cap / Completed State (Session Complete Footer Banner) */
        <div
          role="region"
          aria-label={t("g5.challenge.sessionCompletedTitle")}
          className="flex flex-col items-center gap-3 rounded-eb-lg border border-line-subtle bg-canvas p-6 text-center"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={24} absoluteStrokeWidth strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-[15px] font-semibold text-ink">
              {t("g5.challenge.sessionCompletedTitle")}
            </h3>
            <p className="max-w-md text-[13px] leading-5 text-ink-secondary">
              {t("g5.challenge.sessionCompletedBody")}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onConcludeSession} className="mt-2">
            {t("g5.challenge.returnToReview")}
          </Button>
        </div>
      ) : (
        /* Active Reply Form (Round 1 or Round 2) */
        <div className="flex flex-col gap-3 border-t border-line-subtle pt-4">
          <Field
            multiline
            rows={4}
            disabled={isLoading}
            label={t("g5.challenge.replyLabel")}
            placeholder={t("g5.challenge.replyPlaceholder")}
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value.slice(0, REPLY_MAX))}
            helper={t("g5.common.charCount", { count: replyInput.length, max: REPLY_MAX })}
            maxLength={REPLY_MAX}
          />
          <div className="flex items-center justify-between gap-3 pt-1">
            <Button
              variant="secondary"
              size="md"
              disabled={isLoading}
              onClick={onConcludeSession}
            >
              {t("g5.challenge.concludeEarly")}
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={!replyInput.trim() || isLoading}
              onClick={handleSubmit}
            >
              <Send size={16} className="mr-1.5" />
              {isLoading
                ? t("g5.challenge.submitting")
                : t("g5.challenge.send", { round: currentRound })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
