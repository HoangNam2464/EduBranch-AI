import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds/shared";

/**
 * Shared shape of the Figma `Data Display/Badge/*` sets (page EduBranch AI – Design System):
 * auto-layout row, padding 3/8 (3/8/3/4 with an icon), gap 4, radius 999,
 * label Roboto Medium 12/16, so 22px tall (24px with the 1px stroke of Learning Mode).
 * Dot = 6x6 ellipse; icon = 14x14 Lucide with the stroke measured in Figma.
 * `metricsClassName` replaces the default padding/gap/radius/typography for
 * pills measured elsewhere (see StatusPill.tsx).
 */
export interface BadgeBaseProps {
  children: ReactNode;
  /** Background, text and (optional) border classes of the variant. */
  toneClassName: string;
  /** Colour class of the 6px dot; omit for no dot. */
  dotClassName?: string;
  icon?: LucideIcon;
  iconStrokeWidth?: number;
  iconClassName?: string;
  /** Padding, gap, radius and typography; defaults to the page-02 badge metrics. */
  metricsClassName?: string;
  className?: string;
}

export function BadgeBase({
  children,
  toneClassName,
  dotClassName,
  icon: Icon,
  iconStrokeWidth = 1.333,
  iconClassName,
  metricsClassName,
  className,
}: BadgeBaseProps) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center whitespace-nowrap",
        metricsClassName ??
          cx("gap-1 rounded-full py-[3px] pr-2 text-[12px] leading-4 font-medium", Icon ? "pl-1" : "pl-2"),
        toneClassName,
        className,
      )}
    >
      {dotClassName && <span aria-hidden="true" className={cx("size-1.5 shrink-0 rounded-full", dotClassName)} />}
      {Icon && (
        <Icon
          aria-hidden="true"
          size={14}
          absoluteStrokeWidth
          strokeWidth={iconStrokeWidth}
          className={cx("shrink-0", iconClassName)}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
