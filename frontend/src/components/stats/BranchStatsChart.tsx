/**
 * EduBranch AI — BranchStatsChart Component (Deliverable FE-022, AC-2, Figma 05.5)
 * Visualizes student branch selection distribution across decision nodes
 * using lightweight CSS inline percentage bars (strictly no heavy chart libraries).
 *
 * Rules (feature-statistics.md & GLOBAL-DESIGN-SYSTEM.md §2.9):
 * - Monoline bars (h-2 rounded-full) in brand navy #2A4E7F / layered opacities.
 * - Zero green-vs-red coloring (never color decisions as right/wrong).
 * - Full WCAG AA contrast and progressbar ARIA semantics.
 */

import { useTranslation } from "react-i18next";
import { GitFork, Inbox } from "lucide-react";
import { cx } from "@/components/ds";
import {
  getOptionBarColor,
  truncateSituation,
} from "@/pages/statistics/statisticsHelpers";
import type { BranchingDecisionPointStat } from "@/services/statisticsService";

export interface BranchStatsChartProps {
  decisionPoints?: BranchingDecisionPointStat[];
  totalAttempts?: number;
  isLoading?: boolean;
}

export function BranchStatsChart({
  decisionPoints = [],
  totalAttempts = 0,
  isLoading = false,
}: BranchStatsChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={t("states.loading.label")}
        className="flex flex-col gap-4 p-4"
      >
        {[1, 2, 3].map((idx) => (
          <div key={idx} className="flex flex-col gap-2 rounded-eb-md bg-canvas/60 p-4">
            <div className="h-4 w-1/3 rounded bg-canvas motion-safe:animate-pulse" />
            <div className="h-3 w-full rounded bg-canvas motion-safe:animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-canvas motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (decisionPoints.length === 0 || totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-canvas text-ink-muted">
          <Inbox size={22} />
        </div>
        <p className="text-[13px] font-medium text-ink-secondary">
          {t("g4.stats.branchChart.noBranches")}
        </p>
        <p className="mt-1 text-[12px] text-ink-muted">
          {t("g4.stats.branchChart.emptyCase")}
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5 overflow-y-auto pr-1"
      role="region"
      aria-label={t("g4.stats.branchChart.title")}
    >
      {decisionPoints.map((point) => {
        const options = point.options || [];
        const maxPercent = Math.max(...options.map((o) => o.percentage), 0);
        const situationLabel = truncateSituation(point.situation, 80);
        const pointTitle = `${point.nodeIndex + 1} · ${situationLabel}`;

        return (
          <div
            key={point.nodeId || point.nodeIndex}
            className="flex flex-col gap-3 rounded-eb-lg border border-line bg-canvas/40 p-4"
          >
            {/* Decision Node Header */}
            <div className="flex items-start justify-between gap-3 border-b border-line pb-2">
              <div className="flex min-w-0 items-start gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-selected text-primary">
                  <GitFork size={14} />
                </div>
                <h4
                  className="min-w-0 text-[13px] leading-6 font-medium break-words text-ink"
                  title={point.situation}
                >
                  {t("g4.stats.branchChart.nodeTitle", { title: pointTitle })}
                </h4>
              </div>
              <span className="shrink-0 rounded-full border border-line bg-surface px-2 py-0.5 text-[12px] font-medium whitespace-nowrap text-ink-secondary">
                {t("g4.stats.branchChart.selections", { count: point.totalSelections })}
              </span>
            </div>

            {/* Options Distribution List */}
            <div className="flex flex-col gap-3 pt-1">
              {options.map((opt, optIdx) => {
                const isFocal = opt.percentage === maxPercent && maxPercent > 0;
                const barColor = getOptionBarColor(isFocal, optIdx);
                const percentVal = Math.round(opt.percentage);

                return (
                  <div key={opt.optionId || optIdx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-[12px] leading-4">
                      <span className="line-clamp-2 min-w-0 text-ink" title={opt.optionText}>
                        {opt.optionText}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[12px] text-ink-secondary">
                          {t("g4.stats.branchChart.selections", { count: opt.count })}
                        </span>
                        <span className="w-10 text-right font-medium text-ink">
                          {t("g4.stats.branchChart.percent", { percent: percentVal })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                      role="progressbar"
                      aria-valuenow={percentVal}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${opt.optionText}: ${percentVal}%`}
                    >
                      <div
                        className={cx("h-full rounded-full transition-all duration-300", barColor)}
                        style={{ width: `${Math.min(Math.max(opt.percentage, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
