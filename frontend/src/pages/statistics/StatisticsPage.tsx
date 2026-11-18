import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChartColumn, CircleCheck, GitBranch, RotateCcw } from "lucide-react";
import { MetricCard, SectionHeading, StatusPill, cx } from "@/components/ds";
import { ErrorState, SkeletonLine, SkeletonRegion, StateCard } from "@/components/feedback";
import { MiniCalendar } from "@/pages/profile/components/MiniCalendar";
import { useLecturerCourseCases } from "@/pages/statistics/useLecturerCourseCases";
import type { Case } from "@/types";

/*
 * 04.3 Thống kê luồng học tập — Figma page 08, node 483:15369.
 * Layout: chart section (fills, column gap 20) + right column 320 wide (gap 20).
 *  - KPIs: 3 × "compact" MetricCard (265x78), gap 20.
 *  - Chart panels: white, radius 18, padding 20, heading row h32; rows of 2 × 408 (h370, h336)
 *    and 478 + 338 (h428).
 *  - Right column: "Calendar and schedules" card (padding 8, gap 20) holding the #DFEDF9
 *    calendar card (radius 14, padding 12) and "Case đang mở" rows; "Bài nộp gần đây" card.
 * Data (feature-statistics rule: basic, descriptive, lecturer-owned only): the backend
 * `statistics` controller is an empty skeleton and no lecturer endpoint exposes attempts,
 * choices or outcomes. KPIs therefore show "—" and every chart panel shows its empty state;
 * no figure is computed or invented. "Case đang mở" lists the lecturer's real PUBLISHED
 * cases (`GET /courses` + `GET /courses/:id/cases`).
 */

function Panel({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={cx("flex min-w-0 flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card", className)} aria-label={title}>
      <SectionHeading title={title} className="h-8" />
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </section>
  );
}

function NoData() {
  const { t } = useTranslation();
  return <StateCard icon={ChartColumn} titleAs="p" title={t("g4.stats.noData")} />;
}

function OpenCaseRow({ item }: { item: Case }) {
  const { t } = useTranslation();
  const updated = new Date(item.updatedAt);
  const valid = !Number.isNaN(updated.getTime());
  const mode = item.learningMode === "REVIEW_STUDY" ? t("g4.common.review") : item.learningMode === "BRANCHING_STUDY" ? t("g4.common.branching") : null;
  return (
    <li className="flex gap-3 rounded-[14px] bg-canvas p-3">
      <span
        className={cx(
          "flex h-14 w-[46px] shrink-0 flex-col items-center justify-center gap-[3px] rounded-eb-md text-ink-inverse",
          item.learningMode === "REVIEW_STUDY" ? "bg-primary" : "bg-accent",
        )}
        aria-label={valid ? t("g4.stats.updatedOn", { date: updated.toLocaleDateString("vi-VN") }) : undefined}
      >
        <span className="text-[14px] leading-5 font-medium">{valid ? updated.getDate() : "—"}</span>
        <span className="text-[10px] leading-[14px]">{valid ? t("g4.calendar.monthShort", { month: updated.getMonth() + 1 }) : ""}</span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center gap-2">
          {mode && (
            <StatusPill tone="info" size="xs">
              {mode}
            </StatusPill>
          )}
          <span className="text-[10px] leading-[14px] text-ink-muted">{t("g4.stats.published")}</span>
        </div>
        <p className="truncate text-[14px] leading-5 text-ink">{item.title}</p>
      </div>
    </li>
  );
}

export function StatisticsPage() {
  const { t } = useTranslation();
  const { state, retry } = useLecturerCourseCases();
  const unknown = t("g4.common.unknownValue");

  const kpis = [
    { icon: CircleCheck, stroke: 0.85, label: t("g4.stats.kpi.completion") },
    { icon: RotateCcw, stroke: 1.7, label: t("g4.stats.kpi.avgAttempts") },
    { icon: GitBranch, stroke: 1.5, label: t("g4.stats.kpi.inProgress") },
  ];

  let openCases: ReactNode;
  if (state.status === "loading") {
    openCases = (
      <SkeletonRegion className="flex flex-col gap-2 rounded-[14px] bg-canvas p-3">
        <SkeletonLine width="40%" size="sm" />
        <SkeletonLine width="80%" />
      </SkeletonRegion>
    );
  } else if (state.status === "error") {
    openCases = <ErrorState framed={false} title={t("g4.stats.openCasesError")} onRetry={retry} errorCode={state.code} occurredAt={state.at} />;
  } else {
    const published = state.data.flatMap(({ cases }) => cases.filter((c) => c.status === "PUBLISHED"));
    openCases =
      published.length === 0 ? (
        <p className="rounded-[14px] bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">{t("g4.stats.openCasesEmpty")}</p>
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
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="grid grid-cols-3 gap-5">
          {kpis.map((k) => (
            <MetricCard key={k.label} variant="compact" icon={k.icon} iconStrokeWidth={k.stroke} label={k.label} value={unknown} />
          ))}
        </div>
        <div className="grid h-[370px] grid-cols-2 gap-5">
          <Panel title={t("g4.stats.panels.choices")}>
            <NoData />
          </Panel>
          <Panel title={t("g4.stats.panels.attempts")}>
            <NoData />
          </Panel>
        </div>
        <div className="grid h-[336px] grid-cols-2 gap-5">
          <Panel title={t("g4.stats.panels.outcomes")}>
            <NoData />
          </Panel>
          <Panel title={t("g4.stats.panels.timing")}>
            <NoData />
          </Panel>
        </div>
        <div className="grid h-[428px] grid-cols-[478fr_338fr] gap-5">
          <Panel title={t("g4.stats.panels.progress")}>
            <NoData />
          </Panel>
          <Panel title={t("g4.stats.panels.popular")}>
            <NoData />
          </Panel>
        </div>
      </div>

      <aside className="flex w-80 shrink-0 flex-col gap-5">
        <section className="flex flex-col gap-5 rounded-eb-xl bg-surface p-2 shadow-eb-card" aria-label={t("g4.stats.openCases")}>
          <MiniCalendar variant="stats" className="rounded-[14px] bg-selected p-3" />
          <div className="flex flex-col gap-5">
            <h2 className="px-3 pt-2.5 text-[16px] leading-6 font-normal text-ink">{t("g4.stats.openCases")}</h2>
            {openCases}
          </div>
        </section>
        <section className="flex flex-col gap-5 rounded-eb-xl bg-surface p-5 shadow-eb-card" aria-label={t("g4.stats.recent")}>
          <h2 className="text-[16px] leading-6 font-normal text-ink">{t("g4.stats.recent")}</h2>
          <p className="rounded-[14px] bg-canvas p-3 text-[12px] leading-4 text-ink-secondary">{t("g4.stats.recentUnavailable")}</p>
        </section>
      </aside>
    </div>
  );
}
