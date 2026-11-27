import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChartColumn,
  CircleCheck,
  FileCheck2,
  Flag,
  GitBranch,
  Inbox,
  RotateCcw,
  Users,
} from "lucide-react";
import {
  Avatar,
  Button,
  FilterControl,
  MetricCard,
  SectionHeading,
  StatusPill,
  cx,
} from "@/components/ds";
import {
  ErrorState,
  SkeletonLine,
  SkeletonRegion,
  StateCard,
} from "@/components/feedback";
import { BranchStatsChart } from "@/components/stats/BranchStatsChart";
import { MiniCalendar } from "@/pages/profile/components/MiniCalendar";
import {
  formatPercentage,
  isCaseStatisticsEmpty,
  mapStatisticsErrorStatus,
} from "@/pages/statistics/statisticsHelpers";
import {
  httpStatusOf,
  useLecturerCourseCases,
} from "@/pages/statistics/useLecturerCourseCases";
import {
  statisticsService,
  type CaseStatisticsDto,
} from "@/services/statisticsService";
import type { Case } from "@/types";
import { lecturerFeedbackService, type SubmissionReviewItem } from "@/services/lecturerFeedbackService";
import { getSubmissionQueueStatus } from "@/pages/feedback/lecturerFeedbackLogic";
import { initialsOf } from "@/layouts/shell/shellRoutes";
import { PATHS, buildPath } from "@/routes/paths";
import { formatDateTime, isValidDate } from "@/components/feedback";

const RECENT_LIMIT = 5;

/**
 * 04.3 "Bài nộp gần đây": the newest submissions of the selected case, from the lecturer feedback queue
 * (`GET /lecturer-feedback/submissions?caseId=`, already used by 04.1). Each row opens the case feedback queue.
 */
function RecentSubmissions({ caseId }: { caseId: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<{ status: "idle" | "loading" | "error" | "ready"; items: SubmissionReviewItem[] }>({
    status: "idle",
    items: [],
  });
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!caseId) {
      setState({ status: "idle", items: [] });
      return;
    }
    let cancelled = false;
    setState({ status: "loading", items: [] });
    lecturerFeedbackService
      .getQueueSubmissions({ caseId })
      .then((items) => {
        if (cancelled) return;
        const sorted = [...items].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setState({ status: "ready", items: sorted.slice(0, RECENT_LIMIT) });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [caseId, reload]);

  const note = (text: string) => <p className="rounded-[14px] bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">{text}</p>;
  if (state.status === "idle") return note(t("g4.stats.recentPickCase"));
  if (state.status === "loading") {
    return (
      <SkeletonRegion className="flex flex-col gap-2 rounded-[14px] bg-canvas p-3">
        <SkeletonLine width="70%" />
        <SkeletonLine width="45%" size="sm" />
      </SkeletonRegion>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert" className="flex flex-col items-start gap-2 rounded-[14px] bg-canvas p-3">
        <p className="text-[12px] leading-4 text-ink-secondary">{t("g4.stats.recentError")}</p>
        <Button variant="secondary" size="sm" onClick={() => setReload((k) => k + 1)}>
          {t("g2.common.retry")}
        </Button>
      </div>
    );
  }
  if (state.items.length === 0) return note(t("g4.stats.recentEmpty"));
  return (
    <ul className="flex flex-col gap-2">
      {state.items.map((item) => {
        const at = new Date(item.submittedAt);
        const status = getSubmissionQueueStatus(item);
        return (
          <li key={item.targetType + item.targetId}>
            <Link
              to={buildPath(PATHS.LECTURER.CASE_FEEDBACK, { caseId: item.caseId })}
              className="group flex items-center gap-3 rounded-[14px] bg-canvas p-3 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Avatar initials={initialsOf(item.studentName) || "—"} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[14px] leading-5 text-ink group-hover:text-primary" title={item.studentName}>
                  {item.studentName || "—"}
                </span>
                <span className="flex min-w-0 gap-1 text-[12px] leading-4 text-ink-secondary">
                  <span className="truncate">{t(`g4.queue.status.${status.toLowerCase()}`)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="shrink-0 whitespace-nowrap">{isValidDate(at) ? formatDateTime(at) : "—"}</span>
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 04.3 & 05.5 Thống kê luồng học tập — Figma page EduBranch AI – Screens, node 483:15369 & Frame 05.5 (FE-022, EBA-417).
 *
 * Rules:
 * - Read-only statistics aggregation (contract 002 §C E8).
 * - Simple descriptive statistics only: completion rate, branch selection frequency,
 *   single vs. retry attempts, terminal outcomes.
 * - Zero third-party chart libraries (CSS percentage bars).
 * - Zero student ranking or grading.
 * - Distinct loading, empty, prompt, error (with retry), and success states.
 */

function Panel({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cx(
        "flex min-w-0 flex-col gap-4 rounded-eb-xl bg-surface p-5 shadow-eb-card",
        className,
      )}
      aria-label={title}
    >
      <div className="flex flex-col gap-0.5">
        <SectionHeading title={title} className="h-7" />
        {subtitle && (
          <p className="text-[12px] leading-4 text-ink-secondary">{subtitle}</p>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
    </section>
  );
}

function OpenCaseRow({ item }: { item: Case }) {
  const { t, i18n } = useTranslation();
  const updated = new Date(item.updatedAt);
  const valid = !Number.isNaN(updated.getTime());
  const isEn = i18n.language?.startsWith("en");
  // EN shows the short month name ("Nov"); VI keeps the Figma "Th11" form.
  const monthLabel = !valid ? "" : isEn ? updated.toLocaleDateString("en-GB", { month: "short" }) : t("g4.calendar.monthShort", { month: updated.getMonth() + 1 });
  const mode =
    item.learningMode === "REVIEW_STUDY"
      ? t("g4.common.review")
      : item.learningMode === "BRANCHING_STUDY"
        ? t("g4.common.branching")
        : null;

  return (
    <li className="flex gap-3 rounded-[14px] bg-canvas p-3">
      <span
        className={cx(
          "flex h-14 w-[46px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-eb-md text-ink-inverse",
          item.learningMode === "REVIEW_STUDY" ? "bg-primary" : "bg-accent",
        )}
        aria-label={
          valid
            ? t("g4.stats.updatedOn", { date: updated.toLocaleDateString(isEn ? "en-GB" : "vi-VN") })
            : undefined
        }
      >
        <span className="text-[14px] font-medium leading-5">{valid ? updated.getDate() : "—"}</span>
        <span className="text-[12px] leading-[14px]">
          {monthLabel}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          {mode && (
            <StatusPill tone="info" size="xs">
              {mode}
            </StatusPill>
          )}
          <span className="text-[12px] leading-[14px] text-ink-muted">
            {t("g4.stats.published")}
          </span>
        </div>
        <p className="truncate text-[14px] leading-5 text-ink">{item.title}</p>
      </div>
    </li>
  );
}

export function StatisticsPage() {
  const { t } = useTranslation();
  const { state: coursesState, retry: retryCourses } = useLecturerCourseCases();

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedCaseId, setSelectedCaseId] = useState("");

  // Statistics data states
  const [caseStats, setCaseStats] = useState<CaseStatisticsDto | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<unknown | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Available courses and cases
  const courses =
    coursesState.status === "ready" ? coursesState.data.map(({ course: c }) => c) : [];

  const allCases = useMemo(() => {
    if (coursesState.status !== "ready") return [];
    return coursesState.data.flatMap(({ cases }) => cases);
  }, [coursesState]);

  const filteredCases = useMemo(() => {
    if (selectedCourse === "ALL") return allCases;
    const found =
      coursesState.status === "ready"
        ? coursesState.data.find(({ course: c }) => c.id === selectedCourse)
        : null;
    return found ? found.cases : [];
  }, [allCases, selectedCourse, coursesState]);

  // Handler functions update selection and state from events
  const handleCourseChange = (newCourseId: string) => {
    setSelectedCourse(newCourseId);
    setSelectedCaseId("");
    setCaseStats(null);
    setStatsError(null);
    setIsLoadingStats(false);
  };

  const handleCaseChange = (newCaseId: string) => {
    setSelectedCaseId(newCaseId);
    setCaseStats(null);
    setStatsError(null);
    if (newCaseId) {
      setIsLoadingStats(true);
    } else {
      setIsLoadingStats(false);
    }
  };

  const handleRetryStats = () => {
    if (selectedCaseId) {
      setIsLoadingStats(true);
      setStatsError(null);
      setReloadToken((prev) => prev + 1);
    }
  };

  // Fetch statistics when a specific case is chosen or on retry
  useEffect(() => {
    if (!selectedCaseId) {
      return;
    }

    let isCancelled = false;

    statisticsService
      .getCaseStatistics(selectedCaseId)
      .then((data) => {
        if (!isCancelled) {
          setCaseStats(data);
          setStatsError(null);
        }
      })
      .catch((err: unknown) => {
        if (!isCancelled) {
          setStatsError(err);
          setCaseStats(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingStats(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [selectedCaseId, reloadToken]);

  // Right column: published cases list
  let openCases: ReactNode;
  if (coursesState.status === "loading") {
    openCases = (
      <SkeletonRegion className="flex flex-col gap-2 rounded-[14px] bg-canvas p-3">
        <SkeletonLine width="40%" size="sm" />
        <SkeletonLine width="80%" />
      </SkeletonRegion>
    );
  } else if (coursesState.status === "error") {
    openCases = (
      <ErrorState
        framed={false}
        title={t("g4.stats.openCasesError")}
        onRetry={retryCourses}
        errorCode={coursesState.code}
        occurredAt={coursesState.at}
      />
    );
  } else {
    const published = coursesState.data.flatMap(({ cases }) =>
      cases.filter((c) => c.status === "PUBLISHED"),
    );
    openCases =
      published.length === 0 ? (
        <p className="rounded-[14px] bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">
          {t("g4.stats.openCasesEmpty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {published.map((c) => (
            <OpenCaseRow key={c.id} item={c} />
          ))}
        </ul>
      );
  }

  // Render main analytics content according to states
  let mainContent: ReactNode;

  if (!selectedCaseId) {
    // Prompt state: until a case is chosen, no numbers
    mainContent = (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-eb-xl bg-surface p-8 text-center shadow-eb-card">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-canvas text-primary">
          <ChartColumn size={28} />
        </div>
        <h3 className="text-[16px] font-medium text-ink">
          {t("g4.stats.prompt.title")}
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-5 text-ink-secondary">
          {t("g4.stats.prompt.description")}
        </p>
      </div>
    );
  } else if (isLoadingStats) {
    // Loading skeleton state
    mainContent = (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-24 flex-col justify-between rounded-eb-xl bg-surface p-4 shadow-eb-card"
            >
              <div className="h-4 w-1/2 rounded bg-canvas motion-safe:animate-pulse" />
              <div className="h-6 w-1/3 rounded bg-canvas motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-72 rounded-eb-xl bg-surface p-6 shadow-eb-card motion-safe:animate-pulse" />
      </div>
    );
  } else if (statsError) {
    // Distinct error state with retry
    const statusCode = httpStatusOf(statsError);
    const errorKey = mapStatisticsErrorStatus(statusCode);
    mainContent = (
      <div className="flex min-h-[380px] items-center justify-center rounded-eb-xl bg-surface p-6 shadow-eb-card">
        <ErrorState
          framed={false}
          title={t("states.error.title")}
          description={t(errorKey)}
          onRetry={handleRetryStats}
          errorCode={statusCode}
        />
      </div>
    );
  } else if (!caseStats || isCaseStatisticsEmpty(caseStats)) {
    // Empty case (all zeros): "no attempts yet", not zero-filled charts
    mainContent = (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-eb-xl bg-surface p-8 text-center shadow-eb-card">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-canvas text-ink-muted">
          <Inbox size={28} />
        </div>
        <h3 className="text-[16px] font-medium text-ink">
          {t("g4.stats.emptyCase.title")}
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-5 text-ink-secondary">
          {t("g4.stats.emptyCase.description")}
        </p>
      </div>
    );
  } else if (caseStats.learningMode === "REVIEW_STUDY" || caseStats.reviewStudy) {
    // Review Study case analytics
    const rs = caseStats.reviewStudy!;
    mainContent = (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            variant="compact"
            icon={CircleCheck}
            iconStrokeWidth={1.7}
            label={t("g4.stats.reviewStudy.totalSubmissions")}
            value={String(rs.totalSubmissions)}
          />
          <MetricCard
            variant="compact"
            icon={RotateCcw}
            iconStrokeWidth={1.5}
            label={t("g4.stats.reviewStudy.submitted")}
            value={String(rs.flowStatus.submitted)}
          />
          <MetricCard
            variant="compact"
            icon={GitBranch}
            iconStrokeWidth={1.5}
            label={t("g4.stats.reviewStudy.reviewed")}
            value={String(rs.flowStatus.reviewed)}
          />
          <MetricCard
            variant="compact"
            icon={FileCheck2}
            iconStrokeWidth={1.5}
            label={t("g4.stats.reviewStudy.reflected")}
            value={String(rs.flowStatus.reflected)}
          />
        </div>

        <Panel
          title={t("g4.stats.reviewStudy.title")}
          subtitle={t("g4.stats.reviewStudy.subtitle")}
          className="min-h-[300px]"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                <span>{t("g4.stats.reviewStudy.submitted")}</span>
                <span className="font-medium">{rs.flowStatus.submitted}</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuenow={rs.flowStatus.submitted}
                aria-valuemin={0}
                aria-valuemax={rs.totalSubmissions || 1}
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${rs.totalSubmissions > 0 ? (rs.flowStatus.submitted / rs.totalSubmissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                <span>{t("g4.stats.reviewStudy.reviewed")}</span>
                <span className="font-medium">{rs.flowStatus.reviewed}</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuenow={rs.flowStatus.reviewed}
                aria-valuemin={0}
                aria-valuemax={rs.totalSubmissions || 1}
              >
                <div
                  className="h-full rounded-full bg-primary/75"
                  style={{
                    width: `${rs.totalSubmissions > 0 ? (rs.flowStatus.reviewed / rs.totalSubmissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                <span>{t("g4.stats.reviewStudy.reflected")}</span>
                <span className="font-medium">{rs.flowStatus.reflected}</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                role="progressbar"
                aria-valuenow={rs.flowStatus.reflected}
                aria-valuemin={0}
                aria-valuemax={rs.totalSubmissions || 1}
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{
                    width: `${rs.totalSubmissions > 0 ? (rs.flowStatus.reflected / rs.totalSubmissions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Panel>
      </div>
    );
  } else if (caseStats.branching) {
    // Branching Study case analytics
    const b = caseStats.branching;
    const completionPercent = formatPercentage(b.completionRate);
    const singleVsRetry = `${b.singleAttemptStudents} / ${b.retryStudents}`;

    mainContent = (
      <div className="flex flex-col gap-5">
        {/* 4 KPI cards in a row from 1440px (Figma 04.3); 2 x 2 below so labels and values fit (R01). */}
        <div className="grid grid-cols-2 gap-4 min-[1440px]:grid-cols-4">
          <MetricCard
            variant="compact"
            icon={CircleCheck}
            iconStrokeWidth={1.7}
            label={t("g4.stats.kpi.completion")}
            value={completionPercent}
          />
          <MetricCard
            variant="compact"
            icon={RotateCcw}
            iconStrokeWidth={1.5}
            label={t("g4.stats.kpi.totalAttempts")}
            value={String(b.totalAttempts)}
          />
          <MetricCard
            variant="compact"
            icon={GitBranch}
            iconStrokeWidth={1.5}
            label={t("g4.stats.kpi.singleVsRetry")}
            value={singleVsRetry}
          />
          <MetricCard
            variant="compact"
            icon={FileCheck2}
            iconStrokeWidth={1.5}
            label={t("g4.stats.kpi.reflectionsSubmitted")}
            value={String(b.flowStatus.reflected)}
          />
        </div>

        {/* Branch Selection Distribution per decision point */}
        <Panel
          title={t("g4.stats.panels.choices")}
          subtitle={t("g4.stats.branchChart.subtitle")}
          className="min-h-[380px]"
        >
          <BranchStatsChart
            decisionPoints={b.decisionPoints}
            totalAttempts={b.totalAttempts}
            isLoading={isLoadingStats}
          />
        </Panel>

        {/* Attempts and outcomes side by side from 1440px; stacked below so headings never overlap. */}
        <div className="grid grid-cols-1 gap-5 min-[1440px]:grid-cols-2">
          {/* Attempts Statistics */}
          <Panel
            title={t("g4.stats.panels.attempts")}
            subtitle={t("g4.stats.attempts.subtitle")}
            className="min-h-[320px]"
          >
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                  <span>{t("g4.stats.attempts.singleLabel")}</span>
                  <span className="font-medium">
                    {b.singleAttemptStudents} (
                    {b.participants > 0
                      ? Math.round((b.singleAttemptStudents / b.participants) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                  role="progressbar"
                  aria-valuenow={
                    b.participants > 0
                      ? Math.round((b.singleAttemptStudents / b.participants) * 100)
                      : 0
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${b.participants > 0 ? (b.singleAttemptStudents / b.participants) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                  <span>{t("g4.stats.attempts.retryLabel")}</span>
                  <span className="font-medium">
                    {b.retryStudents} (
                    {b.participants > 0
                      ? Math.round((b.retryStudents / b.participants) * 100)
                      : 0}
                    %)
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                  role="progressbar"
                  aria-valuenow={
                    b.participants > 0
                      ? Math.round((b.retryStudents / b.participants) * 100)
                      : 0
                  }
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${b.participants > 0 ? (b.retryStudents / b.participants) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-2 rounded-eb-md border border-line bg-canvas/50 p-3 text-[12px] text-ink-secondary">
                <span>{t("g4.stats.attempts.totalLabel", { total: b.totalAttempts, participants: b.participants })}</span>
              </div>
            </div>
          </Panel>

          {/* Terminal Outcomes Distribution */}
          <Panel
            title={t("g4.stats.panels.outcomes")}
            subtitle={t("g4.stats.outcomes.subtitle")}
            className="min-h-[320px]"
          >
            {b.outcomes && b.outcomes.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto py-2">
                {b.outcomes.map((outcome, idx) => (
                  <div key={outcome.nodeId || idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Flag size={13} className="shrink-0 text-primary" />
                        <span className="truncate font-medium text-ink" title={outcome.situation}>
                          {outcome.situation}
                        </span>
                      </div>
                      <span className="shrink-0 text-ink-secondary">
                        {t("g4.stats.outcomes.reachCount", {
                          count: outcome.count,
                          percent: Math.round(outcome.percentage),
                        })}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                      role="progressbar"
                      aria-valuenow={Math.round(outcome.percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.round(outcome.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <StateCard
                  icon={ChartColumn}
                  titleAs="p"
                  title={t("g4.stats.outcomes.emptyOutcomes")}
                  className="m-auto"
                />
              </div>
            )}
          </Panel>
        </div>

        {/* Learning Flow Status Panel */}
        <Panel
          title={t("g4.stats.flow.title")}
          subtitle={t("g4.stats.flow.subtitle")}
          className="min-h-[220px]"
        >
          <div className="grid grid-cols-4 gap-4 py-2">
            <div className="flex flex-col gap-1 rounded-eb-lg border border-line bg-canvas/40 p-3">
              <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
                <Users size={14} className="text-primary" />
                {t("g4.stats.flow.participants")}
              </span>
              <span className="text-[16px] font-medium text-ink">{b.participants}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-eb-lg border border-line bg-canvas/40 p-3">
              <span className="text-[12px] text-ink-secondary">
                {t("g4.stats.flow.inProgress")}
              </span>
              <span className="text-[16px] font-medium text-ink">{b.flowStatus.inProgress}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-eb-lg border border-line bg-canvas/40 p-3">
              <span className="text-[12px] text-ink-secondary">
                {t("g4.stats.flow.completed")}
              </span>
              <span className="text-[16px] font-medium text-ink">{b.flowStatus.completed}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-eb-lg border border-line bg-canvas/40 p-3">
              <span className="text-[12px] text-ink-secondary">
                {t("g4.stats.flow.reflected")}
              </span>
              <span className="text-[16px] font-medium text-ink">{b.flowStatus.reflected}</span>
            </div>
          </div>
        </Panel>
      </div>
    );
  } else {
    mainContent = null;
  }

  return (
    <div className="flex items-start gap-5">
      {/* Main Workspace */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-eb-xl bg-surface p-4 shadow-eb-card">
          <div className="flex flex-wrap items-center gap-3">
            <FilterControl
              label={t("g4.stats.filters.course")}
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.stats.filters.allCourses") },
                ...courses.map((c) => ({
                  value: c.id,
                  label: c.courseCode ? `${c.courseCode} · ${c.name}` : c.name,
                })),
              ]}
            />
            <FilterControl
              label={t("g4.stats.filters.case")}
              value={selectedCaseId}
              onChange={(e) => handleCaseChange(e.target.value)}
              options={[
                { value: "", label: t("g4.stats.filters.selectCase") },
                ...filteredCases.map((c) => ({
                  value: c.id,
                  label: c.title,
                })),
              ]}
            />
          </div>
          {!selectedCaseId && (
            <span className="text-[12px] text-ink-secondary">
              {t("g4.stats.branchChart.subtitle")}
            </span>
          )}
        </div>

        {/* Dynamic Analytics Workspace Content */}
        {mainContent}
      </div>

      {/* Right Column: MiniCalendar & Published Cases */}
      <aside className="flex w-80 shrink-0 flex-col gap-5">
        <section
          className="flex flex-col gap-5 rounded-eb-xl bg-surface p-2 shadow-eb-card"
          aria-label={t("g4.stats.openCases")}
        >
          <MiniCalendar variant="stats" className="rounded-[14px] bg-selected p-3" />
          <div className="flex flex-col gap-5">
            <h2 className="px-3 pt-2.5 text-[16px] font-normal leading-6 text-ink">
              {t("g4.stats.openCases")}
            </h2>
            {openCases}
          </div>
        </section>
        <section
          className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card"
          aria-label={t("g4.stats.recent")}
        >
          <h2 className="text-[16px] font-normal leading-6 text-ink">{t("g4.stats.recent")}</h2>
          <RecentSubmissions caseId={selectedCaseId} />
        </section>
      </aside>
    </div>
  );
}
