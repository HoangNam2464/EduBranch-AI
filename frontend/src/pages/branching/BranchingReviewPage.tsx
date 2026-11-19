/**
 * Branching Study · Phase 2 (REVIEW) — Figma 05.4 Journey Review, 05.5/05.6 AI Challenge Support dialog.
 *
 * Consequences of each chosen option are revealed only here, after the attempt is completed
 * (the backend sends `consequence` only when is_completed = TRUE). The student writes
 * retrospective reasoning per decision (10–2000 chars, PUT /branching-attempts/:id/reasoning).
 * No ReactFlow on this student screen (PO decision).
 *
 * Known gaps (reported, not faked): the backend has no "pivotal" flag on case_nodes (OPD-002),
 * so the screen cannot mark "Quyết định then chốt" nor require reasoning on pivotal decisions;
 * the gateway has no Challenge Support endpoint, so the dialog states that the AI is unavailable.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CircleCheck, Flag, GitBranch, PenLine } from "lucide-react";
import { AiOriginBadge, Button, Field, StatusPill, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import {
  REASONING_MAX_LENGTH,
  REASONING_MIN_LENGTH,
  branchingAttemptService,
} from "@/services/branchingAttemptService";
import type { AttemptDetail, AttemptStep } from "@/types";
import {
  AccordionSection,
  Card,
  CardTitle,
  CaseCover,
  InfoPanel,
  SectionPill,
  SubPanel,
} from "@/pages/branching/components/parts";
import { errorCode, formatAttemptTime, loadAttempt, useLoad } from "@/pages/branching/components/useStudentCase";
import { PlayerError } from "@/pages/branching/BranchingCasePlayerPage";
import { ChallengeDialog } from "@/pages/challenge/ChallengeSupportPage";

export function BranchingReviewPage() {
  const { t } = useTranslation();
  const { caseId = "", attemptId = "" } = useParams();
  const [state, reload] = useLoad(() => loadAttempt(caseId, attemptId), [caseId, attemptId]);
  useShellTitle(t("g5.review.pageTitle"));

  if (state.status === "loading") return <ReviewSkeleton />;
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;

  const { attempt, course } = state.data;
  if (!attempt.completed) {
    return (
      <ErrorState
        icon={GitBranch}
        title={t("g5.review.notCompletedTitle")}
        description={
          <>
            {t("g5.review.notCompletedDescription")}{" "}
            <Link to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })} className={cx("rounded-sm text-link underline", FOCUS_RING)}>
              {t("g5.review.backToCase")}
            </Link>
          </>
        }
      />
    );
  }
  return <ReviewContent caseId={caseId} attempt={attempt} courseCode={course.courseCode} onSaved={reload} />;
}

function ReviewSkeleton() {
  const { t } = useTranslation();
  return <div role="status" aria-label={t("g5.common.loading")} className="h-[600px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />;
}

function ReviewContent({
  caseId,
  attempt,
  courseCode,
  onSaved,
}: {
  caseId: string;
  attempt: AttemptDetail;
  courseCode?: string;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const steps = attempt.steps;
  const [open, setOpen] = useState<number | null>(steps.length > 0 ? 0 : null);
  const [challengeStep, setChallengeStep] = useState<number | null>(null);
  const reasoned = steps.filter((s) => Boolean(s.reasoningText)).length;
  const goReflect = () => navigate(buildPath(PATHS.STUDENT.REFLECTION, { caseId, attemptId: attempt.id }));
  const outcomeIndex = steps.length;

  return (
    <div className="flex items-start gap-5">
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <Card className="gap-4">
          <CaseCover badge={t("g5.common.attemptN", { n: attempt.attemptNumber })} icon={GitBranch} strokeWidth={1.5} />
          <h2 className="text-[16px] leading-6 font-normal text-ink">{t("g5.review.mapTitle")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            {courseCode && <StatusPill tone="success-strong">{courseCode}</StatusPill>}
            <StatusPill tone="info">{t("g5.common.stepsCount", { count: steps.length })}</StatusPill>
          </div>
          <InfoPanel
            tone="selected"
            rows={[
              [
                { label: t("g5.review.stepsPassed"), value: steps.length },
                { label: t("g5.review.reasoningWritten"), value: `${reasoned}/${steps.length}` },
              ],
              { label: t("g5.review.finishedAt"), value: formatAttemptTime(attempt.completedAt) },
            ]}
          />
          <div className="flex flex-col gap-4 rounded-[13px] bg-canvas p-4 text-[14px] leading-5">
            <h3 className="text-[14px] leading-5 font-normal text-ink">{t("g5.review.outcomeTitle")}</h3>
            <p className="text-ink-secondary">{t("g5.review.outcomeNote")}</p>
          </div>
          <Button leadingIcon={ArrowRight} className="w-full" onClick={goReflect}>
            {t("g5.review.toReflection")}
          </Button>
        </Card>

        <Card className="gap-[18px]">
          <CardTitle>{t("g5.review.stepsTitle")}</CardTitle>
          <InfoPanel
            rows={[
              ...steps.map((step, index) => ({
                label: <span className="line-clamp-1">{t("g5.review.stepLabel", { n: index + 1, situation: step.situation })}</span>,
                value: t("g5.review.chose", { option: step.selectedOptionText }),
              })),
              ...(attempt.outcome
                ? [
                    {
                      label: <span className="line-clamp-1">{t("g5.review.stepLabel", { n: steps.length + 1, situation: attempt.outcome.situation })}</span>,
                      value: t("g5.player.outcomeChip"),
                    },
                  ]
                : []),
            ]}
          />
        </Card>
      </div>

      <Card className="min-w-0 flex-1 gap-4">
        <CardTitle>{t("g5.review.detailsTitle")}</CardTitle>
        <div className="flex flex-col gap-2">
          {steps.map((step, index) => {
            const title = `${index + 1} · ${step.situation}`;
            const expanded = open === index;
            return (
              <AccordionSection
                key={step.nodeId}
                expanded={expanded}
                onToggle={() => setOpen(expanded ? null : index)}
                toggleLabel={t(expanded ? "g5.common.collapse" : "g5.common.expand", { title })}
                title={title}
                meta={
                  step.reasoningText ? (
                    <SectionPill icon={CircleCheck} strokeWidth={0.85} muted={!expanded}>
                      {t("g5.review.hasReasoning")}
                    </SectionPill>
                  ) : (
                    <SectionPill icon={PenLine} strokeWidth={1.5} muted={!expanded}>
                      {t("g5.review.noReasoning")}
                    </SectionPill>
                  )
                }
              >
                <StepBody
                  attemptId={attempt.id}
                  step={step}
                  onSaved={onSaved}
                  onChallenge={() => setChallengeStep(index)}
                />
              </AccordionSection>
            );
          })}
          {attempt.outcome && (
            <AccordionSection
              expanded={open === outcomeIndex}
              onToggle={() => setOpen(open === outcomeIndex ? null : outcomeIndex)}
              toggleLabel={t(open === outcomeIndex ? "g5.common.collapse" : "g5.common.expand", { title: t("g5.player.outcomeChip") })}
              title={`${outcomeIndex + 1} · ${attempt.outcome.situation}`}
              meta={
                <SectionPill icon={Flag} strokeWidth={1.94} muted={open !== outcomeIndex}>
                  {t("g5.review.outcomePill")}
                </SectionPill>
              }
            >
              <Panel label={t("g5.player.outcomeChip")} tone="selected">
                {attempt.outcome.situation}
              </Panel>
            </AccordionSection>
          )}
        </div>
      </Card>

      {challengeStep !== null && steps[challengeStep] && (
        <ChallengeDialog
          open
          onClose={() => setChallengeStep(null)}
          stepNumber={challengeStep + 1}
          decision={steps[challengeStep].selectedOptionText}
          reasoningId={steps[challengeStep].reasoningId}
          reasoning={steps[challengeStep].reasoningText ?? ""}
          caseContext={steps[challengeStep].situation}
        />
      )}
    </div>
  );
}

/** "Phương án bạn đã chọn" (#F3F6FC) / "Hậu quả thực tế" (#DFEDF9): radius 12, padding 14/16, gap 6. */
function Panel({ label, tone, children }: { label: string; tone: "canvas" | "selected"; children: React.ReactNode }) {
  return (
    <div className={cx("flex flex-col gap-1.5 rounded-eb-lg px-4 py-3.5", tone === "selected" ? "bg-selected" : "bg-canvas")}>
      <span className={cx("text-[12px] leading-4 font-medium", tone === "selected" ? "text-link" : "text-ink-secondary")}>{label}</span>
      <p className="text-[14px] leading-5 whitespace-pre-line text-ink">{children}</p>
    </div>
  );
}

function StepBody({
  attemptId,
  step,
  onSaved,
  onChallenge,
}: {
  attemptId: string;
  step: AttemptStep;
  onSaved: () => void;
  onChallenge: () => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(!step.reasoningText);
  const [text, setText] = useState(step.reasoningText ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setText(step.reasoningText ?? "");
    setEditing(!step.reasoningText);
  }, [step.reasoningText]);

  const length = text.trim().length;
  const invalid = length < REASONING_MIN_LENGTH || text.length > REASONING_MAX_LENGTH;

  async function save() {
    if (invalid) {
      setError(t("g5.review.reasoningLength", { min: REASONING_MIN_LENGTH, max: REASONING_MAX_LENGTH }));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await branchingAttemptService.saveReasoning(attemptId, step.nodeId, text.trim());
      onSaved();
    } catch (e) {
      setError(t("g5.review.saveFailed", { code: errorCode(e) ?? "—" }));
      setSaving(false);
    }
  }

  return (
    <>
      <Panel label={t("g5.review.chosenOption")} tone="canvas">
        {step.selectedOptionText}
      </Panel>
      <Panel label={t("g5.review.consequence")} tone="selected">
        {step.consequence ?? "—"}
      </Panel>
      <div className="flex flex-col gap-3">
        <SubPanel title={t("g5.review.yourReasoning")}>
          <div className="flex flex-col gap-0 px-2 py-3">
            {editing ? (
              <div className="flex flex-col gap-3">
                <Field
                  multiline
                  label={t("g5.review.reasoningLabel")}
                  value={text}
                  maxLength={REASONING_MAX_LENGTH}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("g5.review.reasoningPlaceholder")}
                  helper={t("g5.common.charCount", { count: text.length, max: REASONING_MAX_LENGTH })}
                  error={error ?? undefined}
                />
                <div className="flex justify-end gap-2">
                  {step.reasoningText && (
                    <Button variant="secondary" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                      {t("g5.common.cancel")}
                    </Button>
                  )}
                  <Button size="sm" onClick={save} disabled={saving}>
                    {t("g5.review.saveReasoning")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <span className="text-[12px] leading-4 font-medium text-ink-secondary">{t("g5.review.reasoningLabel")}</span>
                <p className="text-[14px] leading-5 whitespace-pre-line text-ink">{step.reasoningText}</p>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={cx("mt-2 self-start cursor-pointer rounded-sm text-[12px] leading-4 font-medium text-link", FOCUS_RING)}
                >
                  {t("g5.review.editReasoning")}
                </button>
              </>
            )}
          </div>
        </SubPanel>
        <div className="flex items-center gap-3 rounded-[9px] bg-surface p-4">
          <AiOriginBadge type="assisted">{t("g5.common.aiAssisted")}</AiOriginBadge>
          <span className="min-w-0 flex-1 text-[12px] leading-4 text-ink-secondary">{t("g5.review.challengeNote")}</span>
          <button
            type="button"
            onClick={onChallenge}
            disabled={!step.reasoningText}
            title={step.reasoningText ? undefined : t("g5.review.challengeNeedsReasoning")}
            className={cx(
              "shrink-0 rounded-sm text-[12px] leading-4 font-medium",
              step.reasoningText ? "cursor-pointer text-link" : "cursor-not-allowed text-ink-muted",
              FOCUS_RING,
            )}
          >
            {t("g5.review.openChallenge")}
          </button>
        </div>
      </div>
    </>
  );
}
