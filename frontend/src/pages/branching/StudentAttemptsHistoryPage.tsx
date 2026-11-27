/**
 * Branching Study · attempt history — Figma 05.9 and 05.10 (new-attempt dialog).
 * Data: GET /cases/:caseId/attempts + GET /branching-attempts/:id per attempt (steps count, path).
 * Past attempts are immutable; a retry creates a new attempt (POST /cases/:caseId/branching-attempts).
 * PATHS.STUDENT.HISTORY (no case) has no backend list across cases yet → empty state + gap report.
 */
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CircleCheck, Clock, GitBranch, History, RotateCcw, Search } from "lucide-react";
import {
  Button,
  LearningModeBadge,
  MetricCard,
  Pagination,
  ProcessingBadge,
  ResultCount,
  SubmissionBadge,
  cx,
  FOCUS_RING,
} from "@/components/ds";
import { EmptyState, NoResultsState } from "@/components/feedback";
import { PATHS, buildPath } from "@/routes/paths";
import { branchingAttemptService } from "@/services/branchingAttemptService";
import type { AttemptSummary } from "@/types";
import { Card, CardTitle, JourneyPath } from "@/pages/branching/components/parts";
import {
  errorCode,
  formatAttemptTime,
  loadCaseAttempts,
  useLoad,
  type CaseAttemptsContext,
} from "@/pages/branching/components/useStudentCase";
import { ActionError, PlayerError } from "@/pages/branching/BranchingCasePlayerPage";
import { NewAttemptDialog } from "@/pages/branching/components/NewAttemptDialog";

const PAGE_SIZES = [10, 20, 50];

export function StudentAttemptsHistoryPage() {
  const { t } = useTranslation();
  const { caseId } = useParams();
  if (!caseId) {
    return (
      <EmptyState
        icon={History}
        title={t("g5.history.allTitle")}
        description={t("g5.history.allDescription")}
        action={{ label: t("g5.history.toCourses"), to: PATHS.STUDENT.COURSES }}
      />
    );
  }
  return <CaseHistory caseId={caseId} />;
}

function CaseHistory({ caseId }: { caseId: string }) {
  const [state, reload] = useLoad(() => loadCaseAttempts(caseId), [caseId]);
  if (state.status === "loading") return <HistorySkeleton />;
  if (state.status === "error") return <PlayerError code={state.code} at={state.at} onRetry={reload} />;
  return <HistoryContent ctx={state.data} />;
}

function HistorySkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("g5.common.loading")} className="flex flex-col gap-5">
      <div className="h-[290px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />
      <div className="h-[312px] rounded-eb-xl bg-surface motion-safe:animate-pulse" />
    </div>
  );
}

type SortKey = "completed" | "number" | "started" | "steps" | "status";

function HistoryContent({ ctx }: { ctx: CaseAttemptsContext }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { caseData, attempts, details } = ctx;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "number", dir: -1 });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepsOf = (a: AttemptSummary) => details[a.id]?.steps.length ?? 0;
  const statusLabel = (a: AttemptSummary) =>
    !a.completed ? t("g5.common.inProgress") : a.reflectionStatus === "SUBMITTED" ? t("g5.common.submitted") : t("g5.common.completed");
  const statusRank = (a: AttemptSummary) => (!a.completed ? 0 : a.reflectionStatus === "SUBMITTED" ? 2 : 1);

  const submitted = attempts.filter((a) => a.reflectionStatus === "SUBMITTED").length;
  const inProgress = attempts.filter((a) => !a.completed).length;
  const totalSteps = attempts.reduce((sum, a) => sum + stepsOf(a), 0);
  const chronological = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? attempts.filter((a) =>
          [caseData.title, t("g5.common.attemptN", { n: a.attemptNumber }), statusLabel(a)].some((s) => s.toLowerCase().includes(q)),
        )
      : attempts;
    const value = (a: AttemptSummary): number | string => {
      switch (sort.key) {
        case "completed":
          return a.completedAt ?? "";
        case "started":
          return a.startedAt;
        case "steps":
          return stepsOf(a);
        case "status":
          return statusRank(a);
        default:
          return a.attemptNumber;
      }
    };
    return [...list].sort((a, b) => (value(a) < value(b) ? -1 : value(a) > value(b) ? 1 : 0) * sort.dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, query, sort, caseData.title, t]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);
  const latest = attempts[0];

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

  const header = (key: SortKey | null, label: string, width: string) => (
    <th scope="col" className={cx("h-10 p-0 text-left font-normal", width)} aria-sort={key && sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
      {key ? (
        <button
          type="button"
          onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : 1 }))}
          className={cx("inline-flex cursor-pointer items-center gap-[5px] rounded-sm text-[12px] leading-4 text-ink-secondary", FOCUS_RING)}
        >
          {label}
          <span aria-hidden="true" className="text-[12px] leading-[14px]">
            ↕
          </span>
        </button>
      ) : (
        <span className="text-[12px] leading-4 text-ink-secondary">{label}</span>
      )}
    </th>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-5">
        <div className="grid w-[478px] shrink-0 grid-cols-2 gap-5">
          <MetricCard variant="tile" className="h-[135px]" icon={RotateCcw} iconStrokeWidth={1.7} label={t("g5.history.metricAttempts")} value={attempts.length} />
          <MetricCard variant="tile" className="h-[135px]" icon={CircleCheck} iconStrokeWidth={0.85} label={t("g5.history.metricSubmitted")} value={submitted} />
          <MetricCard variant="tile" className="h-[135px]" icon={Clock} iconStrokeWidth={1.51} label={t("g5.history.metricInProgress")} value={inProgress} />
          <MetricCard variant="tile" className="h-[135px]" icon={GitBranch} iconStrokeWidth={1.5} label={t("g5.history.metricSteps")} value={totalSteps} />
        </div>
        <Card className="min-w-0 flex-1 gap-5">
          <CardTitle className="py-1">{t("g5.history.chartTitle")}</CardTitle>
          <StepsChart
            attempts={chronological}
            stepsOf={stepsOf}
            statusLabel={statusLabel}
            label={t("g5.history.chartTitle")}
            attemptLabel={(n) => t("g5.common.attemptN", { n })}
            stepsLabel={(count) => t("g5.common.stepsCount", { count })}
          />
        </Card>
      </div>

      <Card className="gap-2.5">
        <div className="flex items-center gap-2">
          <CardTitle className="min-w-0 flex-1">{t("g5.history.pathsTitle")}</CardTitle>
          <span className="text-[12px] leading-4 text-ink-secondary">{t("g5.common.consequenceInReview")}</span>
        </div>
        {chronological.length === 0 ? (
          <p className="text-[14px] leading-5 text-ink-secondary">{t("g5.history.noAttempts")}</p>
        ) : (
          chronological.map((a) => {
            const d = details[a.id];
            return (
              <JourneyPath
                key={a.id}
                label={t("g5.common.attemptN", { n: a.attemptNumber })}
                number={a.attemptNumber}
                steps={(d?.steps ?? []).map((s) => s.selectedOptionText)}
                outcome={a.completed ? t("g5.player.outcomeChip") : undefined}
                note={a.completed ? undefined : t("g5.history.atPoint", { n: stepsOf(a) + 1 })}
                status={statusLabel(a)}
                statusTone={a.completed ? "success" : "info"}
                inProgress={!a.completed}
              />
            );
          })
        )}
      </Card>

      <Card className="gap-5">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="py-1">{t("g5.history.listTitle")}</CardTitle>
          <div className="flex items-center gap-3">
            <Button size="sm" leadingIcon={RotateCcw} onClick={() => setDialogOpen(true)} disabled={starting}>
              {t("g5.common.newAttempt")}
            </Button>
            <label className="flex h-8 w-[200px] items-center gap-2.5 rounded-eb-md bg-canvas px-3 focus-within:outline-2 focus-within:outline-focus">
              <span className="sr-only">{t("g5.history.search")}</span>
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("g5.history.searchPlaceholder")}
                className="min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-ink outline-none placeholder:text-ink-muted"
              />
              <Search aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.6} className="shrink-0 text-control-icon" />
            </label>
          </div>
        </div>
        <ActionError message={error} />

        {rows.length === 0 ? (
          attempts.length === 0 ? (
            <EmptyState icon={GitBranch} framed={false} title={t("g5.history.noAttempts")} className="self-center" />
          ) : (
            <NoResultsState keyword={query} onClear={() => setQuery("")} framed={false} />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-[1336px] border-separate border-spacing-0">
              <caption className="sr-only">{t("g5.history.listTitle")}</caption>
              <thead>
                <tr className="[&>th:first-child]:rounded-l-eb-md [&>th:first-child]:pl-4 [&>th]:bg-canvas">
                  {header("completed", t("g5.history.colCompleted"), "w-[156px]")}
                  {header("number", t("g5.history.colAttempt"), "w-[200px]")}
                  {header("started", t("g5.history.colStarted"), "w-[140px]")}
                  {header(null, t("g5.history.colCase"), "w-[300px]")}
                  {header(null, t("g5.history.colMode"), "w-[140px]")}
                  {header("steps", t("g5.history.colSteps"), "w-[90px]")}
                  {header("status", t("g5.history.colStatus"), "w-[130px]")}
                  {header(null, t("g5.history.colActions"), "w-[180px]")}
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id} className="h-16 [&>td]:border-b [&>td]:border-surface-hover">
                    <td className="pl-4 text-[12px] leading-4 text-ink-secondary">{a.completedAt ? formatAttemptTime(a.completedAt) : "—"}</td>
                    <td>
                      <span className="flex items-center gap-2">
                        <span
                          className={cx(
                            "flex size-8 shrink-0 items-center justify-center rounded-[7px] text-[12px] leading-4",
                            a.completed ? "bg-selected text-link" : "bg-warning-bg text-status-approved-text",
                          )}
                        >
                          #{a.attemptNumber}
                        </span>
                        <span className="flex flex-col gap-[3px] text-[12px] leading-4">
                          <span className="text-ink">{t("g5.common.attemptN", { n: a.attemptNumber })}</span>
                          <span className="text-ink-secondary">
                            {!a.completed
                              ? t("g5.common.inProgress")
                              : a.reflectionStatus === "SUBMITTED"
                                ? t("g5.history.reflectedSub")
                                : t("g5.history.awaitingReflection")}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="text-[12px] leading-4 text-ink-secondary">{formatAttemptTime(a.startedAt)}</td>
                    <td className="pr-5 text-[12px] leading-4 text-ink">
                      <span className="line-clamp-1">{caseData.title}</span>
                    </td>
                    <td>
                      <LearningModeBadge mode="branching">{t("g5.common.modeBranching")}</LearningModeBadge>
                    </td>
                    <td className="text-[12px] leading-4 text-ink">{t("g5.common.stepsCount", { count: stepsOf(a) })}</td>
                    <td>
                      {!a.completed ? (
                        <ProcessingBadge status="processing">{t("g5.history.processing")}</ProcessingBadge>
                      ) : a.reflectionStatus === "SUBMITTED" ? (
                        <SubmissionBadge status="submitted">{t("g5.common.submitted")}</SubmissionBadge>
                      ) : (
                        <SubmissionBadge status="reviewed">{t("g5.common.completed")}</SubmissionBadge>
                      )}
                    </td>
                    <td>
                      {a.completed ? (
                        <Button variant="secondary" size="sm" to={buildPath(PATHS.STUDENT.BRANCHING_REVIEW, { caseId: caseData.id, attemptId: a.id })}>
                          {t("g5.history.viewJourney")}
                        </Button>
                      ) : (
                        <Button size="sm" to={buildPath(PATHS.STUDENT.BRANCHING_PLAY, { caseId: caseData.id })}>
                          {t("g5.history.continue")}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between">
          <ResultCount
            leadingLabel={t("g5.history.resultLeading")}
            trailingLabel={t("g5.history.resultTrailing", { count: rows.length })}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeLabel={t("g5.history.pageSizeLabel")}
          />
          <Pagination
            page={current}
            pageCount={pageCount}
            onPageChange={setPage}
            labels={{
              nav: t("g5.history.paginationNav"),
              previous: t("g5.history.previousPage"),
              next: t("g5.history.nextPage"),
              page: (n) => t("g5.history.pageN", { page: n }),
            }}
          />
        </div>
      </Card>

      <NewAttemptDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={startNew}
        busy={starting}
        nextNumber={(latest?.attemptNumber ?? 0) + 1}
        previous={latest ? { summary: latest, steps: stepsOf(latest) } : undefined}
      />
    </div>
  );
}

/**
 * "Số bước đã đi qua theo lần làm" (05.9): grid 0–5 (32px per step, label column 34 + gap 8, guide #EEF2F9),
 * bars 79 wide radius 3 (#2A4E7F finished, #00A5F5 in progress), category labels 12/16; legend with a 4px stripe.
 */
function StepsChart({
  attempts,
  stepsOf,
  statusLabel,
  label,
  attemptLabel,
  stepsLabel,
}: {
  attempts: AttemptSummary[];
  stepsOf: (a: AttemptSummary) => number;
  statusLabel: (a: AttemptSummary) => string;
  label: string;
  attemptLabel: (n: number) => string;
  stepsLabel: (count: number) => string;
}) {
  const shown = attempts.slice(-4);
  const max = Math.max(5, ...shown.map(stepsOf));
  const unit = 160 / max;
  const ticks = Array.from({ length: 6 }, (_, i) => Math.round((max / 5) * (5 - i)));
  return (
    <div className="flex items-center gap-[26px]">
      <figure aria-label={label} className="relative h-[214px] w-[326px] shrink-0">
        {ticks.map((value, i) => (
          <div key={i} aria-hidden="true" className="absolute left-0 flex w-full items-center gap-2" style={{ top: 8 + i * 32 }}>
            <span className="w-[34px] text-[12px] leading-4 text-ink-secondary">{value}</span>
            <span className="h-px flex-1 bg-surface-muted" />
          </div>
        ))}
        {shown.map((a, i) => {
          const h = Math.max(2, stepsOf(a) * unit);
          const left = 50 + i * 95;
          return (
            <div key={a.id}>
              <div
                role="img"
                aria-label={`${attemptLabel(a.attemptNumber)}: ${stepsLabel(stepsOf(a))}`}
                className={cx("absolute w-[79px] rounded-[3px]", a.completed ? "bg-primary" : "bg-accent")}
                style={{ left, top: 176 - h, height: h }}
              />
              <span className="absolute top-[188px] w-[79px] text-center text-[12px] leading-4 text-ink-secondary" style={{ left }}>
                {attemptLabel(a.attemptNumber)}
              </span>
            </div>
          );
        })}
      </figure>
      <ul className="flex min-w-0 flex-1 flex-col gap-3">
        {shown.map((a) => (
          <li key={a.id} className="flex gap-3">
            <span aria-hidden="true" className={cx("w-1 shrink-0 rounded-[2px]", a.completed ? "bg-primary" : "bg-accent")} />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[12px] leading-4 text-ink-secondary">{attemptLabel(a.attemptNumber)}</span>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[16px] leading-6 text-ink">{statusLabel(a)}</span>
                <span className="text-[12px] leading-4 text-ink-secondary">{stepsLabel(stepsOf(a))}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
