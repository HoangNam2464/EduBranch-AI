/**
 * Branching Study · Phase 3 (Reflection & Retry) — Figma 05.7 (form) and 05.8 (submitted).
 *
 * POST /branching-attempts/:id/reflection stores one `reflection_text` (allowed only when the
 * attempt is completed; immutable once SUBMITTED). Retry = a NEW attempt row (05.10 dialog).
 * Gaps (reported, not faked): no draft endpoint ("Lưu nháp" hidden), no lecturer-feedback
 * endpoint for branching attempts ("Phản hồi" row/card hidden), reflection is one text
 * (05.8 shows three labelled parts).
 */
import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, CircleCheck, Clock, Eye, GitBranch, PenLine, RotateCcw } from "lucide-react";
import { Button, StatusPill, cx, FOCUS_RING } from "@/components/ds";
import { ErrorState } from "@/components/feedback";
import { useShellTitle } from "@/layouts/shell/ShellTitleContext";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { PATHS, buildPath } from "@/routes/paths";
import { useAuthStore } from "@/stores/authStore";
import { REFLECTION_MAX_LENGTH, branchingAttemptService } from "@/services/branchingAttemptService";
import { ActionBar, Card, CardTitle, KeyValueList } from "@/pages/branching/components/parts";
import { errorCode, loadAttempt, useLoad, type AttemptContext } from "@/pages/branching/components/useStudentCase";
import { ActionError, PlayerError } from "@/pages/branching/BranchingCasePlayerPage";
import { NewAttemptDialog } from "@/pages/branching/components/NewAttemptDialog";

export function ReflectionPage() {
  const { t } = useTranslation();
  const { caseId = "", attemptId = "" } = useParams();
  const [state, reload] = useLoad(() => loadAttempt(caseId, attemptId), [caseId, attemptId]);
  useShellTitle(t("g5.reflection.pageTitle"));

  if (state.status === "loading") {
    return <div role="status" aria-label={t("g5.common.loading")} className="h-[412px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />;
  }
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;

  const ctx = state.data;
  if (!ctx.attempt.completed) {
    return (
      <ErrorState
        icon={GitBranch}
        title={t("g5.reflection.notCompletedTitle")}
        description={
          <>
            {t("g5.reflection.notCompletedDescription")}{" "}
            <Link to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId })} className={cx("rounded-sm text-link underline", FOCUS_RING)}>
              {t("g5.review.backToCase")}
            </Link>
          </>
        }
      />
    );
  }
  return ctx.attempt.reflectionStatus === "SUBMITTED" ? <Submitted ctx={ctx} /> : <ReflectionForm ctx={ctx} onSubmitted={reload} />;
}

/**
 * Hand-drawn buttons of the 05.7 / 06.1 "Page actions" bar (h44, padding 0 16, radius 8,
 * Roboto Regular 14/20): outline (#FFFFFF + 1px #E8EDF6), soft (#DFEDF9, #2A4E7F) and primary.
 */
export function BarButton({
  variant,
  children,
  ...rest
}: { variant: "outline" | "soft" | "primary"; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-eb-md px-4 text-[14px] leading-5 font-normal disabled:cursor-not-allowed",
        variant === "outline" && "border border-surface-hover bg-surface text-ink hover:bg-canvas",
        variant === "soft" && "bg-selected text-link hover:bg-primary-subtle-hover",
        variant === "primary" && "bg-primary text-ink-inverse hover:bg-primary-hover disabled:bg-primary-disabled",
        FOCUS_RING,
      )}
    >
      {children}
    </button>
  );
}

function ReflectionForm({ ctx, onSubmitted }: { ctx: AttemptContext; onSubmitted: () => void }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { attempt, course, caseData } = ctx;
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reviewDone = attempt.steps.length > 0 && attempt.steps.every((s) => Boolean(s.reasoningText));

  async function submit() {
    if (!text.trim()) {
      setError(t("g5.reflection.required"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await branchingAttemptService.submitReflection(attempt.id, text.trim());
      onSubmitted();
    } catch (e) {
      setError(t("g5.reflection.submitFailed", { code: errorCode(e) ?? "—" }));
      setSaving(false);
    }
  }

  const progress: Array<{ label: string; done: boolean }> = [
    { label: t("g5.reflection.progress.experience"), done: true },
    { label: t(reviewDone ? "g5.reflection.progress.reviewDone" : "g5.reflection.progress.reviewOpen"), done: reviewDone },
    { label: t("g5.reflection.progress.reflecting"), done: false },
  ];

  return (
    <>
      <div className="flex items-start gap-5">
        <Card className="min-w-0 flex-1 gap-6">
          <CardTitle>
            <label htmlFor="reflection-text">{t("g5.reflection.yourReflection")}</label>
          </CardTitle>
          <p id="reflection-hint" className="text-[14px] leading-5 text-ink-secondary">
            {t("g5.reflection.hint")}
          </p>
          <div className="flex flex-col gap-6">
            <textarea
              id="reflection-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={REFLECTION_MAX_LENGTH}
              required
              aria-describedby="reflection-hint reflection-count"
              aria-invalid={Boolean(error) || undefined}
              placeholder={t("g5.reflection.placeholder")}
              className="h-[220px] w-full resize-y rounded-eb-md border border-line-strong bg-surface px-4 py-3 text-[14px] leading-5 text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:shadow-eb-focus"
            />
            <span id="reflection-count" className="text-[12px] leading-4 text-ink-secondary">
              {t("g5.common.charCount", { count: text.length, max: REFLECTION_MAX_LENGTH })}
            </span>
          </div>
          <ActionError message={error} />
        </Card>

        <div className="flex w-[478px] shrink-0 flex-col gap-5">
          <Card className="gap-[23px]">
            <CardTitle>{t("g5.reflection.attemptCard")}</CardTitle>
            <KeyValueList
              rows={[
                { label: t("g5.common.course"), value: course.name },
                { label: t("g5.reflection.attempt"), value: `#${attempt.attemptNumber}` },
                { label: t("g5.reflection.decisions"), value: t("g5.common.stepsCount", { count: attempt.steps.length }) },
                { label: t("g5.reflection.status"), value: t("g5.reflection.awaiting") },
              ]}
            />
          </Card>
          <Card className="gap-[23px]">
            <CardTitle>{t("g5.reflection.progressCard")}</CardTitle>
            <ul className="flex flex-col gap-2">
              {progress.map((item) => (
                <li key={item.label} className="flex items-center gap-2 px-4 text-[14px] leading-5 text-ink">
                  {item.done ? (
                    <CircleCheck aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={0.85} className="shrink-0 text-success" />
                  ) : (
                    <Clock aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.51} className="shrink-0 text-link" />
                  )}
                  {item.label}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
      <ActionBar
        start={
          <BarButton
            variant="outline"
            onClick={() => navigate(buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: caseData.id, attemptId: attempt.id }))}
          >
            {t("g5.reflection.backToReview")}
          </BarButton>
        }
        note={t("g5.reflection.barNote")}
        end={
          <BarButton variant="primary" onClick={submit} disabled={saving}>
            {t("g5.reflection.submit")}
          </BarButton>
        }
      />
    </>
  );
}

function Submitted({ ctx }: { ctx: AttemptContext }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { attempt, course, caseData } = ctx;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startNew() {
    setStarting(true);
    setError(null);
    try {
      await branchingAttemptService.startAttempt(caseData.id);
      navigate(buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId: caseData.id }));
    } catch (e) {
      setError(t("g5.player.startFailed", { code: errorCode(e) ?? "—" }));
      setStarting(false);
      setDialogOpen(false);
    }
  }

  return (
    <div className="flex items-start gap-5 pb-1">
      <aside className="flex w-[379px] shrink-0 flex-col gap-2 rounded-eb-xl bg-primary p-2">
        <div className="relative flex flex-col items-center px-0 py-3 text-center">
          <StatusPill tone="success" icon={CircleCheck} iconStrokeWidth={0.85} className="absolute top-3 left-3">
            {t("g5.common.submitted")}
          </StatusPill>
          <span className="flex size-20 items-center justify-center rounded-full bg-selected text-[28px] leading-9 font-medium text-link">
            {initialsOf(user?.fullName)}
          </span>
          <span className="mt-[18px] text-[20px] leading-7 text-ink-inverse">{user?.fullName}</span>
          <span className="mt-2 text-[14px] leading-5 text-ink-inverse">
            {course.name} {"  •  "} {t("g5.common.attemptN", { n: attempt.attemptNumber })}
          </span>
        </div>
        <dl className="flex flex-col gap-4 rounded-eb-lg bg-surface p-4">
          <Contact icon={<BookOpen aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.7} />} label={t("g5.common.course")}>
            {course.name}
          </Contact>
          <Contact icon={<GitBranch aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.5} />} label={t("g5.reflection.attempt")}>
            {`#${attempt.attemptNumber} · ${attempt.caseTitle}`}
          </Contact>
        </dl>
        <section aria-labelledby="reflection-status" className="flex flex-col gap-2 rounded-eb-lg bg-surface p-2">
          <h2 id="reflection-status" className="px-3 pt-4 text-[16px] leading-6 font-normal text-ink">
            {t("g5.reflection.status")}
          </h2>
          <div className="flex flex-col items-center gap-2.5 px-4 py-5 text-center">
            <CircleCheck aria-hidden="true" size={32} absoluteStrokeWidth strokeWidth={0.85} className="text-success" />
            <p className="text-[14px] leading-5 font-medium text-status-published-text">{t("g5.reflection.doneTitle", { n: attempt.attemptNumber })}</p>
            <p className="text-[14px] leading-5 text-ink">{t("g5.reflection.doneBody")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="secondary"
              leadingIcon={Eye}
              className="w-full"
              to={buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: caseData.id, attemptId: attempt.id })}
            >
              {t("g5.reflection.viewReview")}
            </Button>
            <Button leadingIcon={RotateCcw} className="w-full" onClick={() => setDialogOpen(true)} disabled={starting}>
              {t("g5.reflection.newAttempt")}
            </Button>
            <ActionError message={error} />
          </div>
        </section>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <Card className="gap-4">
          <CardTitle className="py-1.5">{t("g5.reflection.submittedTitle")}</CardTitle>
          <div className="flex gap-4 rounded-eb-lg bg-canvas p-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-eb-lg bg-selected text-link">
              <PenLine aria-hidden="true" size={28} absoluteStrokeWidth strokeWidth={1.7} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
              <h3 className="text-[16px] leading-6 font-normal text-ink">{t("g5.reflection.yourReflectionPlain")}</h3>
              <p className="text-[14px] leading-5 whitespace-pre-line text-ink-secondary">{attempt.reflectionText}</p>
            </div>
          </div>
        </Card>
        <div className="flex items-start gap-5">
          <Card className="w-[379px] shrink-0 gap-5">
            <CardTitle>{t("g5.reflection.noScoreTitle")}</CardTitle>
            <p className="text-[14px] leading-5 text-ink-secondary">{t("g5.reflection.noScoreBody")}</p>
          </Card>
        </div>
      </div>

      <NewAttemptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={startNew}
        busy={starting}
        nextNumber={attempt.attemptNumber + 1}
        previous={{
          summary: {
            id: attempt.id,
            attemptNumber: attempt.attemptNumber,
            completed: attempt.completed,
            reflectionStatus: attempt.reflectionStatus,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
          },
          steps: attempt.steps.length,
        }}
      />
    </div>
  );
}

function Contact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-canvas text-link">{icon}</span>
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-[12px] leading-4 text-ink-secondary">{label}</dt>
        <dd className="text-[14px] leading-5 text-ink">{children}</dd>
      </div>
    </div>
  );
}
