import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds/shared";

/** Pure decision helper for empty metric values (null, undefined, or empty string). */
export function isEmptyMetricValue(value: ReactNode): boolean {
  return value === null || value === undefined || value === "";
}

/**
 * Page-08 metric cards. Five layouts actually occur:
 *  - stacked (04.1 "Metric card" 279x122): white, radius 18, padding 20, column gap 22.
 *      Header row gap 12: icon tile 32x32 #DFEDF9 radius 8 (icon 16, #2A4E7F) + label Regular 15/22 #202124.
 *      Value Regular 22/28 #202124.
 *  - compact (04.3 / 07.2 "Metric card" 265x78): white, radius 16, padding 8, row gap 16, height 78.
 *      Icon tile 54x54 #F3F6FC radius 8 (icon 24). Text column gap 10: label 12/16 #909198, value 22/28.
 *  - tile (05.9 "Metric card" 229x135): white, radius 18, padding 20, column space-between, fills its row.
 *      Icon tile 42x42 #DFEDF9 radius 8 (icon 16). Bottom row: label 14/20 #696A70 · value 22/28 (bottom-aligned).
 *  - inline (07.1 "Metric card" 279x76): white, radius 18, padding 0 20, row gap 12, height 76.
 *      Icon tile 36x36 #DFEDF9 radius 8 (icon 18), label 14/20 #696A70 (fills), value 20/28 #202124.
 *  - kpi (10.2 "Metric" in the KPI band): no fill, padding 0 24, column gap 8; `divided` adds the
 *      1px #E1E8F5 left stroke. Label 15/22 #696A70, value Medium 28/36 #202124, optional delta pill
 *      (h28, padding 4/10, gap 6, radius 999, icon 14, Medium 14/20): info #DFEDF9/#2A4E7F, warning #FFF1DE/#9A5700.
 * Icon strokes are absolute: pass the stroke measured on the instance (default 1.7).
 */
export type MetricCardVariant = "stacked" | "compact" | "tile" | "inline" | "kpi";

export interface MetricDelta {
  label: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  tone?: "info" | "warning";
}

export interface MetricCardProps {
  variant?: MetricCardVariant;
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  /** kpi only: trend / alert pill under the value. */
  delta?: MetricDelta;
  /** kpi only: 1px left divider (every metric of the band after the first). */
  divided?: boolean;
  /** Optional reason shown when value is empty (null, undefined, or ""). */
  emptyReason?: string;
  className?: string;
}

const TILE: Record<Exclude<MetricCardVariant, "kpi">, { box: string; icon: number }> = {
  stacked: { box: "size-8 bg-selected", icon: 16 },
  compact: { box: "size-[54px] bg-canvas", icon: 24 },
  tile: { box: "size-[42px] bg-selected", icon: 16 },
  inline: { box: "size-9 bg-selected", icon: 18 },
};

function IconTile({ variant, icon: Icon, strokeWidth }: { variant: Exclude<MetricCardVariant, "kpi">; icon: LucideIcon; strokeWidth: number }) {
  return (
    <span aria-hidden="true" className={cx("inline-flex shrink-0 items-center justify-center rounded-eb-md", TILE[variant].box)}>
      <Icon size={TILE[variant].icon} absoluteStrokeWidth strokeWidth={strokeWidth} className="text-link" />
    </span>
  );
}

export function MetricCard({
  variant = "stacked",
  label,
  value,
  icon,
  iconStrokeWidth = 1.7,
  delta,
  divided = false,
  emptyReason,
  className,
}: MetricCardProps) {
  const autoId = useId();
  const reasonId = `metric-reason-${autoId}`;
  const isEmpty = isEmptyMetricValue(value);
  const showEmpty = Boolean(emptyReason) && isEmpty;

  const renderedValue = showEmpty ? (
    <>
      <span title={emptyReason} aria-describedby={reasonId}>
        —
      </span>
      <span id={reasonId} className="sr-only">
        {emptyReason}
      </span>
    </>
  ) : (
    value
  );

  if (variant === "kpi") {
    const DeltaIcon = delta?.icon;
    const warning = delta?.tone === "warning";
    return (
      <div className={cx("flex min-w-0 flex-col items-start gap-2 px-6", divided && "border-l border-line", className)}>
        <p className="text-[15px] leading-[22px] text-ink-secondary">{label}</p>
        <p className="text-[28px] leading-9 font-medium tabular-nums text-ink">{renderedValue}</p>
        {delta && (
          <p
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full py-1 px-2.5 text-[14px] leading-5 font-medium",
              warning ? "bg-warning-bg text-warning-text" : "bg-primary-subtle text-primary",
            )}
          >
            {DeltaIcon && (
              <DeltaIcon aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={delta.iconStrokeWidth ?? 1.5} className="shrink-0" />
            )}
            <span>{delta.label}</span>
          </p>
        )}
      </div>
    );
  }

  const tile = icon ? <IconTile variant={variant} icon={icon} strokeWidth={iconStrokeWidth} /> : null;

  if (variant === "compact") {
    return (
      <div className={cx("flex h-[78px] min-w-0 items-center gap-4 rounded-[16px] bg-surface p-2 shadow-eb-card", className)}>
        {tile}
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <p className="text-[12px] leading-4 text-ink-secondary">{label}</p>
          <p className="text-[22px] leading-7 tabular-nums text-ink">{renderedValue}</p>
        </div>
      </div>
    );
  }

  if (variant === "tile") {
    return (
      <div className={cx("flex h-full min-w-0 flex-col justify-between rounded-eb-xl bg-surface p-5 shadow-eb-card", className)}>
        {tile}
        <div className="flex items-end justify-between gap-2">
          <p className="text-[14px] leading-5 text-ink-secondary">{label}</p>
          <p className="text-[22px] leading-7 tabular-nums text-ink">{renderedValue}</p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cx("flex h-[76px] min-w-0 items-center gap-3 rounded-eb-xl bg-surface px-5 shadow-eb-card", className)}>
        {tile}
        <p className="min-w-0 flex-1 text-[14px] leading-5 text-ink-secondary">{label}</p>
        <p className="shrink-0 text-[20px] leading-7 tabular-nums text-ink">{renderedValue}</p>
      </div>
    );
  }

  return (
    <div className={cx("flex min-w-0 flex-col gap-[22px] rounded-eb-xl bg-surface p-5 shadow-eb-card", className)}>
      <div className="flex items-center gap-3">
        {tile}
        <p className="text-[15px] leading-[22px] text-ink">{label}</p>
      </div>
      <p className="text-[22px] leading-7 tabular-nums text-ink">{renderedValue}</p>
    </div>
  );
}
