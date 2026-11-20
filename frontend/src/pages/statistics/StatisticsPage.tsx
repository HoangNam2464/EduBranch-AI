import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  ChartColumn,
  CircleCheck,
  FileCheck2,
  Flag,
  GitBranch,
  RotateCcw,
} from "lucide-react";
import {
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
import { useLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";
import {
  statisticsService,
  type CaseStatistics,
  type StatisticsOverview,
} from "@/services/statisticsService";
import type { Case } from "@/types";

/**
 * 04.3 & 05.5 Thống kê luồng học tập — Figma page EduBranch AI – Screens, node 483:15369 & Frame 05.5 (FE-022, EBA-417).
 *
 * Acceptance Criteria:
 * - AC-1: Màn hình StatisticsPage hiển thị tỷ lệ hoàn thành (Completion rate) & KPIs.
 * - AC-2: Biểu đồ phân bổ nhánh quyết định sinh viên lựa chọn (Branch selection distribution).
 * - AC-3: Thống kê số lượt thử (Single vs. Retry attempts) và kết cục cuối cùng (Terminal outcomes).
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
      <div className="flex flex-1 flex-col justify-center min-h-0">{children}</div>
    </section>
  );
}

function NoData({ message }: { message?: string }) {
  const { t } = useTranslation();
  return (
    <StateCard
      icon={ChartColumn}
      titleAs="p"
      title={message || t("g4.stats.noData")}
      className="m-auto"
    />
  );
}

function OpenCaseRow({ item }: { item: Case }) {
  const { t } = useTranslation();
  const updated = new Date(item.updatedAt);
  const valid = !Number.isNaN(updated.getTime());
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
            ? t("g4.stats.updatedOn", { date: updated.toLocaleDateString("vi-VN") })
            : undefined
        }
      >
        <span className="text-[14px] leading-5 font-medium">{valid ? updated.getDate() : "—"}</span>
        <span className="text-[10px] leading-[14px]">
          {valid ? t("g4.calendar.monthShort", { month: updated.getMonth() + 1 }) : ""}
        </span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 justify-center">
        <div className="flex items-center gap-2">
          {mode && (
            <StatusPill tone="info" size="xs">
              {mode}
            </StatusPill>
          )}
          <span className="text-[10px] leading-[14px] text-ink-muted">
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
  const { state: coursesState, retry } = useLecturerCourseCases();
  const unknown = t("g4.common.unknownValue");

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedCaseId, setSelectedCaseId] = useState("ALL");

  // Statistics data states
  const [caseStats, setCaseStats] = useState<CaseStatistics | null>(null);
  const [overviewStats, setOverviewStats] = useState<StatisticsOverview | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Available courses and cases
  const courses =
    coursesState.status === "ready" ? coursesState.data.map(({ course: c }) => c) : [];

  const allCases = useMemo(() => {
    if (coursesState.status !== "ready") return [];
    return coursesState.data.flatMap(({ cases }) => cases);
  }, [coursesState]);

  const filteredCases = useMemo(() => {
    if (selectedCourse === "ALL") return allCases;
    const found = coursesState.status === "ready" ? coursesState.data.find(({ course: c }) => c.id === selectedCourse) : null;
    return found ? found.cases : [];
  }, [allCases, selectedCourse, coursesState]);

  // Fetch statistics when course or case filter changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingStats(true);

    if (selectedCaseId !== "ALL") {
      statisticsService
        .getCaseStatistics(selectedCaseId)
        .then((data) => {
          if (isMounted) {
            setCaseStats(data);
            setIsLoadingStats(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCaseStats(null);
            setIsLoadingStats(false);
          }
        });
    } else {
      statisticsService
        .getStatisticsOverview(selectedCourse)
        .then((data) => {
          if (isMounted) {
            setOverviewStats(data);
            setCaseStats(null);
            setIsLoadingStats(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setOverviewStats(null);
            setCaseStats(null);
            setIsLoadingStats(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCourse, selectedCaseId]);

  // Dynamic KPI calculation (AC-1)
  const kpis = useMemo(() => {
    const total = caseStats
      ? String(caseStats.totalAttempts)
      : overviewStats && overviewStats.totalAttempts > 0
        ? String(overviewStats.totalAttempts)
        : unknown;

    const completionRate = caseStats
      ? `${Math.round(caseStats.completionRate)}%`
      : overviewStats && overviewStats.completionRate > 0
        ? `${Math.round(overviewStats.completionRate)}%`
        : unknown;

    const singleVsRetry = caseStats
      ? `${caseStats.singleAttempts} / ${caseStats.retryAttempts}`
      : overviewStats && overviewStats.singleAttempts > 0
        ? `${overviewStats.singleAttempts} / ${overviewStats.retryAttempts}`
        : unknown;

    const reflections = caseStats
      ? String(caseStats.reflectionsSubmitted)
      : overviewStats && overviewStats.reflectionsSubmitted > 0
        ? String(overviewStats.reflectionsSubmitted)
        : unknown;

    return [
      { icon: CircleCheck, stroke: 1.7, label: t("g4.stats.kpi.completion"), value: completionRate },
      { icon: RotateCcw, stroke: 1.5, label: t("g4.stats.kpi.totalAttempts"), value: total },
      { icon: GitBranch, stroke: 1.5, label: t("g4.stats.kpi.singleVsRetry"), value: singleVsRetry },
      { icon: FileCheck2, stroke: 1.5, label: t("g4.stats.kpi.reflectionsSubmitted"), value: reflections },
    ];
  }, [caseStats, overviewStats, unknown, t]);

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
        onRetry={retry}
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
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSelectedCaseId("ALL");
              }}
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
              onChange={(e) => setSelectedCaseId(e.target.value)}
              options={[
                { value: "ALL", label: t("g4.stats.filters.allCases") },
                ...filteredCases.map((c) => ({
                  value: c.id,
                  label: `${c.learningMode === "BRANCHING_STUDY" ? "🌿 " : ""}${c.title}`,
                })),
              ]}
            />
          </div>
          {selectedCaseId === "ALL" && (
            <span className="text-[12px] text-ink-secondary">
              {t("g4.stats.branchChart.subtitle")}
            </span>
          )}
        </div>

        {/* 4 MetricCards across the top (AC-1) */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k) => (
            <MetricCard
              key={k.label}
              variant="compact"
              icon={k.icon}
              iconStrokeWidth={k.stroke}
              label={k.label}
              value={k.value}
            />
          ))}
        </div>

        {/* Branch Selection Distribution (AC-2) */}
        <Panel
          title={t("g4.stats.panels.choices")}
          subtitle={t("g4.stats.branchChart.subtitle")}
          className="min-h-[380px]"
        >
          {caseStats ? (
            <BranchStatsChart
              nodeDistributions={caseStats.nodeDistributions}
              totalAttempts={caseStats.totalAttempts}
              isLoading={isLoadingStats}
            />
          ) : (
            <NoData message={t("g4.stats.branchChart.emptyCase")} />
          )}
        </Panel>

        {/* Row of 2 panels: Attempts Statistics & Terminal Outcomes (AC-3) */}
        <div className="grid grid-cols-2 gap-5">
          {/* Attempts Statistics (Single vs. Retry Attempts) */}
          <Panel
            title={t("g4.stats.panels.attempts")}
            subtitle={t("g4.stats.attempts.subtitle")}
            className="min-h-[320px]"
          >
            {caseStats && caseStats.totalAttempts > 0 ? (
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                    <span>{t("g4.stats.attempts.singleLabel")}</span>
                    <span className="font-medium">
                      {caseStats.singleAttempts} (
                      {Math.round((caseStats.singleAttempts / caseStats.totalAttempts) * 100)}%)
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                    role="progressbar"
                    aria-valuenow={Math.round((caseStats.singleAttempts / caseStats.totalAttempts) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.round((caseStats.singleAttempts / caseStats.totalAttempts) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[13px] leading-5 text-ink">
                    <span>{t("g4.stats.attempts.retryLabel")}</span>
                    <span className="font-medium">
                      {caseStats.retryAttempts} (
                      {Math.round((caseStats.retryAttempts / caseStats.totalAttempts) * 100)}%)
                    </span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                    role="progressbar"
                    aria-valuenow={Math.round((caseStats.retryAttempts / caseStats.totalAttempts) * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.round((caseStats.retryAttempts / caseStats.totalAttempts) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-2 rounded-eb-md border border-default bg-canvas/50 p-3 text-[12px] text-ink-secondary">
                  <span>{t("g4.stats.attempts.totalLabel", { total: caseStats.totalAttempts })}</span>
                </div>
              </div>
            ) : overviewStats && overviewStats.totalAttempts > 0 ? (
              <div className="flex flex-col gap-3 py-2">
                <div className="flex items-center justify-between text-[13px]">
                  <span>{t("g4.stats.attempts.singleLabel")}</span>
                  <span className="font-medium">{overviewStats.singleAttempts}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span>{t("g4.stats.attempts.retryLabel")}</span>
                  <span className="font-medium">{overviewStats.retryAttempts}</span>
                </div>
              </div>
            ) : (
              <NoData message={t("g4.stats.attempts.emptyAttempts")} />
            )}
          </Panel>

          {/* Terminal Outcomes Distribution */}
          <Panel
            title={t("g4.stats.panels.outcomes")}
            subtitle={t("g4.stats.outcomes.subtitle")}
            className="min-h-[320px]"
          >
            {caseStats && caseStats.outcomeDistributions.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto py-2">
                {caseStats.outcomeDistributions.map((outcome, idx) => (
                  <div key={outcome.nodeId || idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[12px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Flag size={13} className="shrink-0 text-primary" />
                        <span className="truncate font-medium text-ink" title={outcome.title}>
                          {outcome.title}
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
              <NoData message={t("g4.stats.outcomes.emptyOutcomes")} />
            )}
          </Panel>
        </div>

        {/* Learning Timing and Progress Panels */}
        <div className="grid grid-cols-[478fr_338fr] gap-5">
          <Panel title={t("g4.stats.panels.progress")}>
            <NoData />
          </Panel>
          <Panel title={t("g4.stats.panels.timing")}>
            <NoData />
          </Panel>
        </div>
      </div>

      {/* Right Column: MiniCalendar & Real Published Cases */}
      <aside className="flex w-80 shrink-0 flex-col gap-5">
        <section
          className="flex flex-col gap-5 rounded-eb-xl bg-surface p-2 shadow-eb-card"
          aria-label={t("g4.stats.openCases")}
        >
          <MiniCalendar variant="stats" className="rounded-[14px] bg-selected p-3" />
          <div className="flex flex-col gap-5">
            <h2 className="px-3 pt-2.5 text-[16px] leading-6 font-normal text-ink">
              {t("g4.stats.openCases")}
            </h2>
            {openCases}
          </div>
        </section>
        <section
          className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card"
          aria-label={t("g4.stats.recent")}
        >
          <h2 className="text-[16px] leading-6 font-normal text-ink">{t("g4.stats.recent")}</h2>
          <p className="rounded-[14px] bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">
            {t("g4.stats.recentUnavailable")}
          </p>
        </section>
      </aside>
    </div>
  );
}
