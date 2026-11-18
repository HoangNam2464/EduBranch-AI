/**
 * Branching Study · Phase 1 (Experience) — Figma 05.1 (case intro), 05.2 (decision point), 05.3 (journey ended).
 *
 * Rules (feature-branching-attempt.md, FND §6.2): only PUBLISHED BRANCHING_STUDY cases; the student
 * picks an option and moves on — no reasoning form and no consequence text mid-flow; consequences
 * and reasoning belong to Journey Review (05.4). No ReactFlow on student screens.
 */
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  CircleCheck,
  Clock,
  Compass,
  Eye,
  Flag,
  GitBranch,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { Button, Dialog, LearningModeBadge, StatusPill, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState, SkeletonBlock, SkeletonLine } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { PATHS, buildPath } from "@/routes/paths";
import { branchingAttemptService } from "@/services/branchingAttemptService";
import type { AttemptDetail, AttemptSummary } from "@/types";
import {
  AccordionSection,
  Card,
  CardTitle,
  CaseCover,
  InfoPanel,
  JourneyPath,
  LessonRow,
  ListRow,
  SectionPill,
  SubPanel,
  TextPanel,
} from "@/pages/branching/components/parts";
import {
  errorCode,
  formatAttemptTime,
  loadCaseAttempts,
  optionKey,
  useLoad,
  type CaseAttemptsContext,
} from "@/pages/branching/components/useStudentCase";
import { NewAttemptDialog } from "@/pages/branching/components/NewAttemptDialog";

type Stage = { kind: "overview" } | { kind: "decision"; attempt: AttemptDetail } | { kind: "outcome"; attempt: AttemptDetail };

export function BranchingCasePlayerPage() {
  const { caseId = "" } = useParams();
  const [state, reload] = useLoad(() => loadCaseAttempts(caseId), [caseId]);
  const [stage, setStage] = useState<Stage>({ kind: "overview" });

  // A different case resets the flow to its introduction.
  useEffect(() => setStage({ kind: "overview" }), [caseId]);

  if (state.status === "loading") return <PlayerSkeleton />;
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;

  const ctx = state.data;
  if (ctx.caseData.learningMode === "REVIEW_STUDY") {
    return <Navigate to={buildPath(PATHS.STUDENT.REVIEW_STUDY, { caseId })} replace />;
  }

  if (stage.kind === "decision") {
    return (
      <DecisionStage
        ctx={ctx}
        attempt={stage.attempt}
        onAdvance={(next) => setStage(next.completed ? { kind: "outcome", attempt: next } : { kind: "decision", attempt: next })}
      />
    );
  }
  if (stage.kind === "outcome") return <OutcomeStage ctx={ctx} attempt={stage.attempt} />;
  return (
    <OverviewStage
      ctx={ctx}
      onPlay={(attempt) => setStage(attempt.completed ? { kind: "outcome", attempt } : { kind: "decision", attempt })}
    />
  );
}

/* ───────────────────────── shared states ───────────────────────── */

function PlayerSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("g5.common.loading")} className="flex items-start gap-5">
      <div className="flex w-[379px] shrink-0 flex-col gap-4 rounded-eb-xl bg-surface p-5">
        <SkeletonBlock height={204} className="rounded-[13px] bg-selected" />
        <SkeletonLine width="80%" />
        <SkeletonLine width="40%" size="sm" />
        <SkeletonBlock height={160} className="rounded-[13px] bg-canvas" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-eb-xl bg-surface p-5">
        <SkeletonLine width={240} />
        <SkeletonBlock height={56} className="rounded-eb-lg bg-canvas" />
        <SkeletonBlock height={56} className="rounded-eb-lg bg-canvas" />
      </div>
    </div>
  );
}

/** 403 = case not published / not a student case; 404 = unknown case; anything else = load error. */
export function PlayerError({ code, at, onRetry }: { code?: number | string; at: Date; onRetry: () => void }) {
  const { t } = useTranslation();
  if (code === 403 || code === 404) {
    return (
      <ErrorState
        title={t(code === 403 ? "g5.common.caseForbiddenTitle" : "g5.common.caseNotFoundTitle")}
        description={t(code === 403 ? "g5.common.caseForbiddenDescription" : "g5.common.caseNotFoundDescription")}
        errorCode={code}
        occurredAt={at}
      />
    );
  }
  return <ErrorState onRetry={onRetry} errorCode={code} occurredAt={at} />;
}

/** Inline error under an action (start attempt, choose option, …). */
export function ActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-[12px] leading-4 text-error-text">
      {message}
    </p>
  );
}

/* ───────────────────────── 05.1 · introduction ───────────────────────── */

function OverviewStage({ ctx, onPlay }: { ctx: CaseAttemptsContext; onPlay: (attempt: AttemptDetail) => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseData, course, attempts, details } = ctx;
  useShellTitle(caseData.title);

  const inProgress = attempts.find((a) => !a.completed);
  const [openId, setOpenId] = useState<string | null>(inProgress?.id ?? null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const courseLabel = course.courseCode ? `${course.name} (${course.courseCode})` : course.name;

  async function start() {
    setStarting(true);
    setError(null);
    try {
      onPlay(await branchingAttemptService.startAttempt(caseData.id));
    } catch (e) {
      setError(t("g5.player.startFailed", { code: errorCode(e) ?? "—" }));
      setStarting(false);
      setDialogOpen(false);
    }
  }

  const latest = attempts[0];

  return (
    <div className="flex items-start gap-5">
      {/* Course information · 379 */}
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <Card className="gap-4">
          <CaseCover badge={t("g5.common.modeBranching")} icon={GitBranch} strokeWidth={1.5} />
          <h2 className="text-[16px] leading-6 font-normal text-ink">{caseData.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="success">{t("g5.player.open")}</StatusPill>
            {course.courseCode && <StatusPill tone="info">{course.courseCode}</StatusPill>}
          </div>
          <InfoPanel
            tone="selected"
            rows={[
              { label: t("g5.player.attemptsDone"), value: t("g5.player.attemptsCount", { count: attempts.length }) },
              { label: t("g5.common.grading"), value: t("g5.common.notGraded") },
            ]}
          />
          {caseData.description && <TextPanel title={t("g5.player.contextTitle")}>{caseData.description}</TextPanel>}
        </Card>

        <Card className="gap-[18px]">
          <CardTitle>{t("g5.player.courseInfo")}</CardTitle>
          <InfoPanel
            rows={[
              { label: t("g5.common.course"), value: courseLabel },
              { label: t("g5.player.learningMode"), value: t("g5.player.learningModeValue") },
            ]}
          />
        </Card>
      </div>

      {/* Learning content · 777 */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Card className="gap-4">
          <CardTitle>{t("g5.player.historyTitle", { count: attempts.length })}</CardTitle>
          <div className="flex flex-col gap-2">
            {attempts.length === 0 && (
              <StartPanel
                title={t("g5.player.firstTitle")}
                description={t("g5.player.firstDescription")}
                action={
                  <Button size="sm" leadingIcon={ArrowRight} disabled={starting} onClick={start}>
                    {t("g5.player.startFirst")}
                  </Button>
                }
              />
            )}
            {attempts.map((summary) => (
              <AttemptSection
                key={summary.id}
                summary={summary}
                detail={details[summary.id]}
                open={openId === summary.id}
                onToggle={() => setOpenId(openId === summary.id ? null : summary.id)}
                onContinue={() => onPlay(details[summary.id])}
                onRestart={() => setDialogOpen(true)}
                onReview={() =>
                  navigate(buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: caseData.id, attemptId: summary.id }))
                }
                busy={starting}
              />
            ))}
            {attempts.length > 0 && !inProgress && (
              <div className="flex justify-end pt-2">
                <Button size="sm" leadingIcon={RotateCcw} onClick={() => setDialogOpen(true)} disabled={starting}>
                  {t("g5.common.newAttempt")}
                </Button>
              </div>
            )}
            <ActionError message={error} />
          </div>
        </Card>

        <Card className="gap-4">
          <CardTitle>{t("g5.player.howTitle")}</CardTitle>
          <ol className="flex gap-3">
            {(["decide", "review", "reflect"] as const).map((key, index) => (
              <li key={key} className="flex flex-1 flex-col gap-2 self-start rounded-eb-lg bg-surface-muted p-4">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[14px] leading-5 font-medium text-ink-inverse">
                  {index + 1}
                </span>
                <span className="pt-1 text-[14px] leading-5 font-medium text-ink">{t(`g5.player.how.${key}.title`)}</span>
                <span className="text-[12px] leading-4 text-ink-secondary">{t(`g5.player.how.${key}.body`)}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] leading-4 text-ink-muted">{t("g5.player.howNote")}</p>
        </Card>
      </div>

      <NewAttemptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={start}
        busy={starting}
        nextNumber={(latest?.attemptNumber ?? 0) + 1}
        previous={latest ? { summary: latest, steps: details[latest.id]?.steps.length ?? 0 } : undefined}
      />
    </div>
  );
}

function StartPanel({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-eb-lg bg-canvas p-6 text-center">
      <GitBranch aria-hidden="true" size={32} absoluteStrokeWidth strokeWidth={1.5} className="text-link" />
      <p className="text-[14px] leading-5 font-medium text-ink">{title}</p>
      <p className="text-[12px] leading-4 text-ink-secondary">{description}</p>
      <div className="flex items-center gap-2">{action}</div>
    </div>
  );
}

function AttemptSection({
  summary,
  detail,
  open,
  onToggle,
  onContinue,
  onRestart,
  onReview,
  busy,
}: {
  summary: AttemptSummary;
  detail: AttemptDetail | undefined;
  open: boolean;
  onToggle: () => void;
  onContinue: () => void;
  onRestart: () => void;
  onReview: () => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const n = summary.attemptNumber;
  const steps = detail?.steps ?? [];
  const status = !summary.completed
    ? t("g5.common.inProgress")
    : summary.reflectionStatus === "SUBMITTED"
      ? t("g5.common.submitted")
      : t("g5.common.completed");
  const title = t("g5.player.attemptTitle", { n, status });

  const progress = (
    <SubPanel title={t("g5.player.progressTitle")} className="w-[284px] shrink-0 self-start">
      <ul className="flex flex-col gap-1 py-2">
        {steps.map((_, index) => (
          <li key={index}>
            <LessonRow
              icon={CircleCheck}
              strokeWidth={0.85}
              title={t("g5.common.decisionPoint", { n: index + 1 })}
              meta={t("g5.player.passed")}
              active
            />
          </li>
        ))}
        {!summary.completed ? (
          <li>
            <LessonRow icon={Clock} strokeWidth={1.51} title={t("g5.player.nextPoint")} meta={t("g5.player.waiting")} />
          </li>
        ) : (
          <li>
            <LessonRow icon={Flag} strokeWidth={1.94} title={t("g5.player.outcomeReached")} meta={t("g5.player.passed")} />
          </li>
        )}
      </ul>
    </SubPanel>
  );

  if (summary.completed) {
    return (
      <AccordionSection
        expanded={open}
        onToggle={onToggle}
        toggleLabel={t(open ? "g5.common.collapse" : "g5.common.expand", { title })}
        title={title}
        meta={
          <SectionPill icon={CircleCheck} strokeWidth={0.85} muted={!open}>
            {t("g5.player.completedAt", { time: formatAttemptTime(summary.completedAt) })}
          </SectionPill>
        }
        actions={
          <Button variant="secondary" size="sm" leadingIcon={Eye} onClick={onReview}>
            {t("g5.player.viewReview")}
          </Button>
        }
      >
        <div className="flex gap-4">{progress}</div>
      </AccordionSection>
    );
  }

  return (
    <AccordionSection
      expanded={open}
      onToggle={onToggle}
      toggleLabel={t(open ? "g5.common.collapse" : "g5.common.expand", { title })}
      title={title}
      meta={
        <SectionPill icon={Clock} strokeWidth={1.5} muted={!open}>
          {t("g5.player.startedAt", { time: formatAttemptTime(summary.startedAt) })}
        </SectionPill>
      }
    >
      <div className="flex gap-4">
        {progress}
        <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-[9px] bg-surface p-4">
          <span className="text-[12px] leading-4 text-ink-secondary">{t("g5.player.continueTitle")}</span>
          <div aria-hidden="true" className="h-px bg-canvas" />
          <div className="flex h-[248px] flex-col items-center justify-center gap-3 rounded-eb-lg bg-canvas p-6 text-center">
            <GitBranch aria-hidden="true" size={32} absoluteStrokeWidth strokeWidth={1.5} className="text-link" />
            <p className="text-[14px] leading-5 font-medium text-ink">{t("g5.player.midAttempt", { n })}</p>
            <p className="text-[12px] leading-4 text-ink-secondary">{t("g5.player.midAttemptNote")}</p>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" leadingIcon={RotateCcw} onClick={onRestart} disabled={busy}>
                {t("g5.player.restart")}
              </Button>
              <Button size="sm" leadingIcon={ArrowRight} onClick={onContinue} disabled={!detail || busy}>
                {t("g5.player.continue")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
}

/* ───────────────────────── 05.2 · decision point ───────────────────────── */

function DecisionStage({
  ctx,
  attempt,
  onAdvance,
}: {
  ctx: CaseAttemptsContext;
  attempt: AttemptDetail;
  onAdvance: (next: AttemptDetail) => void;
}) {
  const { t } = useTranslation();
  const node = attempt.currentNode;
  const pointNumber = attempt.steps.length + 1;
  useShellTitle(t("g5.common.decisionPoint", { n: pointNumber }));
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [moreContext, setMoreContext] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New decision point → nothing selected yet.
  useEffect(() => {
    setSelected(null);
    setMoreContext(false);
  }, [node?.id]);

  if (!node) {
    return <ErrorState title={t("g5.player.noNodeTitle")} description={t("g5.player.noNodeDescription")} />;
  }

  const options = node.options;
  const selectedIndex = options.findIndex((o) => o.id === selected);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const longContext = node.situation.length > 360;

  async function choose() {
    if (!selectedOption || !node) return;
    setSaving(true);
    setError(null);
    try {
      onAdvance(await branchingAttemptService.chooseOption(attempt.id, node.id, selectedOption.id));
    } catch (e) {
      setError(t("g5.player.chooseFailed", { code: errorCode(e) ?? "—" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-start gap-5">
      <div className="flex w-[379px] shrink-0 flex-col gap-5">
        <Card className="gap-4">
          <CaseCover badge={t("g5.common.attemptN", { n: attempt.attemptNumber })} icon={TriangleAlert} strokeWidth={1.33} />
          <h2 className="text-[16px] leading-6 font-normal text-ink">{ctx.caseData.title}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="success-strong">{t("g5.common.decisionPoint", { n: pointNumber })}</StatusPill>
            <StatusPill tone="info">{t("g5.common.modeBranching")}</StatusPill>
          </div>
          <div className="flex flex-col gap-4 rounded-[13px] bg-canvas p-4 text-[14px] leading-5">
            <h3 className="text-[14px] leading-5 font-normal text-ink">{t("g5.player.situation")}</h3>
            <p id="decision-context" className={cx("whitespace-pre-line text-ink-secondary", longContext && !moreContext && "line-clamp-5")}>
              {node.situation}
            </p>
            {longContext && (
              <button
                type="button"
                aria-controls="decision-context"
                aria-expanded={moreContext}
                onClick={() => setMoreContext((v) => !v)}
                className={cx("self-start cursor-pointer rounded-sm text-[12px] leading-4 font-medium text-link", FOCUS_RING)}
              >
                {t(moreContext ? "g5.common.showLess" : "g5.common.showMore")}
              </button>
            )}
          </div>
        </Card>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Card className="gap-4">
          <CardTitle>{t("g5.player.chooseTitle")}</CardTitle>
          <AccordionSection
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
            toggleLabel={t(expanded ? "g5.common.collapse" : "g5.common.expand", { title: t("g5.player.chooseSubtitle") })}
            title={t("g5.player.chooseSubtitle")}
            meta={
              <SectionPill icon={GitBranch} strokeWidth={1.5} muted={!expanded}>
                {t("g5.player.optionCount", { count: options.length })}
              </SectionPill>
            }
          >
            <div className="flex gap-4">
              <SubPanel title={t("g5.player.optionsHeading")} className="w-[284px] shrink-0 self-start">
                <div role="radiogroup" aria-label={t("g5.player.optionsHeading")} className="flex flex-col gap-1 py-2">
                  {options.map((option, index) => {
                    const isSelected = option.id === selected;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelected(option.id)}
                        className={cx("cursor-pointer rounded-eb-md hover:bg-canvas", FOCUS_RING)}
                      >
                        <LessonRow
                          icon={isSelected ? CircleCheck : Compass}
                          strokeWidth={isSelected ? 0.85 : 1.36}
                          title={<span className="line-clamp-2">{`${optionKey(index)} · ${option.text}`}</span>}
                          meta={isSelected ? t("g5.player.selected") : undefined}
                          active={isSelected}
                          activeTone="selected"
                        />
                      </button>
                    );
                  })}
                </div>
              </SubPanel>

              <div className="flex min-w-0 flex-1 flex-col gap-4 self-stretch rounded-[9px] bg-surface p-4">
                <span className="text-[12px] leading-4 text-ink-secondary">
                  {selectedOption ? t("g5.player.optionN", { key: optionKey(selectedIndex) }) : t("g5.player.optionsHeading")}
                </span>
                <div aria-hidden="true" className="h-px bg-canvas" />
                <div className="flex min-h-[248px] flex-col gap-3 rounded-eb-lg bg-canvas p-4">
                  {selectedOption ? (
                    <>
                      <p className="text-[14px] leading-5 font-medium text-ink">{selectedOption.text}</p>
                      <p className="text-[12px] leading-4 text-ink-muted">{t("g5.player.commitNote")}</p>
                      <Button leadingIcon={ArrowRight} className="w-full" onClick={choose} disabled={saving}>
                        {t("g5.player.chooseOption", { key: optionKey(selectedIndex) })}
                      </Button>
                      <ActionError message={error} />
                    </>
                  ) : (
                    <p className="text-[14px] leading-5 text-ink-secondary">{t("g5.player.pickPrompt")}</p>
                  )}
                </div>
              </div>
            </div>
          </AccordionSection>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── 05.3 · journey ended ───────────────────────── */

function OutcomeStage({ ctx, attempt }: { ctx: CaseAttemptsContext; attempt: AttemptDetail }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useShellTitle(t("g5.player.outcomeTitle"));
  const { caseData, course } = ctx;
  const reviewDone = attempt.steps.length > 0 && attempt.steps.every((s) => Boolean(s.reasoningText));
  const reflected = attempt.reflectionStatus === "SUBMITTED";
  const goReview = () => navigate(buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: caseData.id, attemptId: attempt.id }));

  const phases: Array<{ key: string; status: "done" | "waiting" | "locked" }> = [
    { key: "experience", status: "done" },
    { key: "review", status: reviewDone ? "done" : "waiting" },
    { key: "reflection", status: reflected ? "done" : reviewDone ? "waiting" : "locked" },
  ];
  const phaseBadge = { done: "success", waiting: "warning", locked: "neutral" } as const;

  return (
    <div className="flex items-start gap-5">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Card as="div" className="flex-row gap-5">
          <div className="flex size-48 shrink-0 flex-col items-center justify-center gap-2 rounded-eb-xl bg-primary">
            <Flag aria-hidden="true" size={56} absoluteStrokeWidth strokeWidth={1.94} className="text-ink-inverse" />
            <span className="text-[14px] leading-5 font-medium text-ink-inverse">{t("g5.common.attemptRun", { n: attempt.attemptNumber })}</span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[11px] leading-4 font-medium tracking-normal text-link uppercase">{t("g5.player.outcomeLabel")}</span>
            <p className="line-clamp-4 text-[14px] leading-5 whitespace-pre-line text-ink-secondary">{attempt.outcome?.situation ?? "—"}</p>
            <div className="mt-auto flex gap-3">
              <Fact label={t("g5.player.decisionCount")} value={t("g5.common.stepsCount", { count: attempt.steps.length })} />
              <Fact label={t("g5.player.attemptLabel")} value={`#${attempt.attemptNumber}`} />
            </div>
          </div>
        </Card>

        <Card className="gap-2.5">
          <div className="flex items-center gap-2">
            <CardTitle className="min-w-0 flex-1">{t("g5.player.pathTitle")}</CardTitle>
            <span className="text-[12px] leading-4 text-ink-secondary">{t("g5.common.consequenceInReview")}</span>
          </div>
          <JourneyPath
            label={t("g5.common.attemptN", { n: attempt.attemptNumber })}
            number={attempt.attemptNumber}
            steps={attempt.steps.map((s) => s.selectedOptionText)}
            outcome={attempt.outcome ? t("g5.player.outcomeChip") : undefined}
            status={t("g5.player.ended")}
            statusTone="success"
          />
        </Card>

        <div className="flex items-start gap-5">
          <Card className="flex-1 gap-5">
            <CardTitle className="py-1">{t("g5.player.progressCard")}</CardTitle>
            {phases.map((phase, index) => (
              <ListRow
                key={phase.key}
                tile={<span className="text-[16px] leading-6">{index + 1}</span>}
                title={t(`g5.common.phase.${phase.key}`)}
                trailing={
                  <StatusPill tone={phaseBadge[phase.status]} weight="medium">
                    {t(`g5.common.phaseStatus.${phase.status}`)}
                  </StatusPill>
                }
              />
            ))}
          </Card>
          <Card className="flex-1 gap-5">
            <CardTitle className="py-1">{t("g5.player.nextStep")}</CardTitle>
            <p className="text-[14px] leading-5 text-ink-secondary">{t("g5.player.nextStepBody", { n: attempt.attemptNumber })}</p>
            <Button leadingIcon={ArrowRight} className="w-full" onClick={goReview}>
              {t("g5.player.toReview")}
            </Button>
          </Card>
        </div>
      </div>

      <div className="flex w-80 shrink-0 flex-col gap-5">
        <Card as="aside" className="gap-5">
          <CardTitle>{t("g5.common.caseCard")}</CardTitle>
          <ListRow
            tile={<GitBranch aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.5} />}
            title={caseData.title}
            subtitle={[course.name, course.courseCode].filter(Boolean).join(" · ")}
          />
          <div className="flex flex-wrap items-center gap-2">
            <LearningModeBadge mode="branching">{t("g5.common.modeBranching")}</LearningModeBadge>
            <StatusPill weight="medium">{t("g5.common.notGraded")}</StatusPill>
          </div>
        </Card>
        <Card as="aside" className="gap-2.5">
          <CardTitle>{t("g5.player.noteTitle")}</CardTitle>
          <p className="text-[14px] leading-5 text-ink-secondary">{t("g5.player.noteBody")}</p>
        </Card>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 rounded-eb-lg bg-canvas px-3.5 py-2.5">
      <span className="text-[12px] leading-4 text-ink-secondary">{label}</span>
      <span className="text-[14px] leading-5 font-medium text-ink">{value}</span>
    </div>
  );
}
