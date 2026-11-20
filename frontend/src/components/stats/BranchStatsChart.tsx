/**
 * EduBranch AI — BranchStatsChart Component (Deliverable FE-022, AC-2, Figma 05.5)
 * Visualizes student branch selection distribution across decision nodes
 * using lightweight CSS/SVG inline percentage bars (strictly no heavy chart libraries).
 *
 * Rules (feature-statistics.md & GLOBAL-DESIGN-SYSTEM.md §2.9):
 * - Monoline bars (h-2 rounded-full) in brand navy #2A4E7F / sky #00A5F5 / neutral shades.
 * - Zero green-vs-red coloring (never color decisions as right/wrong).
 * - Full WCAG AA contrast and progressbar ARIA semantics.
 */

import { useTranslation } from "react-i18next";
import { GitFork, Inbox } from "lucide-react";
import { cx } from "@/components/ds";
import type { NodeBranchStat } from "@/services/statisticsService";

export interface BranchStatsChartProps {
  nodeDistributions: NodeBranchStat[];
  totalAttempts?: number;
  isLoading?: boolean;
}

export function BranchStatsChart({
  nodeDistributions,
  totalAttempts = 0,
  isLoading = false,
}: BranchStatsChartProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={t("common.loading", "Đang tải...")}
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

  if (nodeDistributions.length === 0 || totalAttempts === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-canvas text-ink-muted mb-2">
          <Inbox size={22} />
        </div>
        <p className="text-[13px] font-medium text-ink-secondary">
          {t("g4.stats.branchChart.noBranches")}
        </p>
        <p className="text-[11px] text-ink-muted mt-1">
          {t("g4.stats.branchChart.emptyCase")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-1" role="region" aria-label={t("g4.stats.branchChart.title")}>
      {nodeDistributions.map((node, nodeIdx) => {
        // Find max percentage to highlight the focal choice in brand primary
        const maxPercent = Math.max(...node.options.map((o) => o.percentage), 0);

        return (
          <div
            key={node.nodeId || nodeIdx}
            className="flex flex-col gap-3 rounded-eb-lg border border-default bg-canvas/40 p-4"
          >
            {/* Decision Node Header */}
            <div className="flex items-center justify-between gap-3 border-b border-default pb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded bg-selected text-primary">
                  <GitFork size={14} />
                </div>
                <h4 className="truncate text-[13px] font-medium text-ink">
                  {t("g4.stats.branchChart.nodeTitle", { title: node.nodeTitle })}
                </h4>
              </div>
              <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-secondary border border-default">
                {t("g4.stats.branchChart.selections", { count: node.totalSelections })}
              </span>
            </div>

            {/* Options Distribution List */}
            <div className="flex flex-col gap-3 pt-1">
              {node.options.map((opt, optIdx) => {
                const isFocal = opt.percentage === maxPercent && maxPercent > 0;
                // Layered shades per design system: focal = primary #2A4E7F, others = layered opacities
                const barColor = isFocal
                  ? "bg-primary"
                  : optIdx === 1
                    ? "bg-primary/75"
                    : "bg-primary/50";

                return (
                  <div key={opt.optionId || optIdx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-[12px] leading-4">
                      <span className="line-clamp-2 min-w-0 text-ink" title={opt.text}>
                        {opt.text}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[11px] text-ink-secondary">
                          {opt.count} lượt
                        </span>
                        <span className="w-10 text-right font-medium text-ink">
                          {t("g4.stats.branchChart.percent", { percent: Math.round(opt.percentage) })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Track */}
                    <div
                      className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
                      role="progressbar"
                      aria-valuenow={Math.round(opt.percentage)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${opt.text}: ${Math.round(opt.percentage)}%`}
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

