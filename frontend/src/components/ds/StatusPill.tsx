import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeBase } from "@/components/ds/BadgeBase";
import { cx } from "@/components/ds/shared";

/**
 * Ad-hoc status / level / difficulty pills drawn by hand on page 08 (not instances of the
 * page-02 badge sets). Measured on 02.1, 02.4, 03.1, 04.1, 04.2, 05.3, 05.8, 07.3, 09.1, 10.3.
 *
 * Sizes (label Roboto Regular unless `weight="medium"`):
 *  - xs  h20  padding 2/8            12/16  radius 20   (09.1 "Badge")
 *  - sm  h22  padding 3/8 (3/8/3/4 + icon, gap 4)  12/16  radius ≥11 = pill
 *        (02.1 "Badge" CS402 / Đang dạy, 02.4 "Difficulty badge", 05.8 "Status badge")
 *        weight medium → padding 3/10 (04.2 / 05.3 "Badge")
 *  - md  h26  padding 5/8, gap 5     12/16  radius 99   (03.1 / 07.3 "Status badge", 03.1 "AI badge")
 *  - lg  h26  padding 3/8/3/4, gap 4 14/20  radius 12   (04.1 / 10.3 "Status badge" with icon)
 * Icon: 14x14 Lucide, stroke as measured (clock 1.51, circle-check 0.85, lock 1.7).
 *
 * Tones (fill / label / default icon):
 *  - neutral        #EEF2F9 / #696A70 / label   (status/draft-*, ai/*)
 *  - info           #DFEDF9 / #2A4E7F / #00A5F5 (bg/selected + text/link, status/reviewed-*)
 *  - success        #E1F7E9 / #007A2D / label   (status/published-*, semantic/success-*)
 *  - success-strong #E1F7E9 / #00B343 / label   (05.2–05.6 "Status": status/published-dot text)
 *  - warning        #FFF1DE / #9A5700 / #F58A00 (status/approved-*, semantic/warning-*)
 *  - error          #FFE5E5 / #D11F1F / label   (semantic/error-*)
 */
export type StatusPillTone = "neutral" | "info" | "success" | "success-strong" | "warning" | "error";
export type StatusPillSize = "xs" | "sm" | "md" | "lg";

const TONES: Record<StatusPillTone, { tone: string; icon: string }> = {
  neutral: { tone: "bg-surface-muted text-ink-secondary", icon: "" },
  info: { tone: "bg-selected text-link", icon: "text-accent" },
  success: { tone: "bg-success-bg text-success-text", icon: "" },
  "success-strong": { tone: "bg-success-bg text-success", icon: "" },
  warning: { tone: "bg-warning-bg text-warning-text", icon: "text-warning" },
  error: { tone: "bg-error-bg text-error-text", icon: "" },
};

function metrics(size: StatusPillSize, hasIcon: boolean, medium: boolean): string {
  const weight = medium ? "font-medium" : "font-normal";
  switch (size) {
    case "xs":
      return cx("gap-1 rounded-full py-0.5 px-2 text-[12px] leading-4", weight);
    case "md":
      return cx("gap-[5px] rounded-full py-[5px] px-2 text-[12px] leading-4", weight);
    case "lg":
      return cx("gap-1 rounded-eb-lg py-[3px] pr-2 text-[14px] leading-5", hasIcon ? "pl-1" : "pl-2", weight);
    case "sm":
    default:
      return cx(
        "gap-1 rounded-full py-[3px] text-[12px] leading-4",
        medium ? "px-2.5" : hasIcon ? "pl-1 pr-2" : "px-2",
        weight,
      );
  }
}

export interface StatusPillProps {
  children: ReactNode;
  tone?: StatusPillTone;
  size?: StatusPillSize;
  /** "medium" = Roboto Medium label with 10px side padding (04.2 / 05.3 "Badge"). */
  weight?: "regular" | "medium";
  icon?: LucideIcon;
  /** Absolute stroke (px) measured on the Figma icon instance. */
  iconStrokeWidth?: number;
  /** Overrides the tone's icon colour (e.g. `text-success` on 05.8). */
  iconClassName?: string;
  className?: string;
}

export function StatusPill({
  children,
  tone = "neutral",
  size = "sm",
  weight = "regular",
  icon,
  iconStrokeWidth = 1.5,
  iconClassName,
  className,
}: StatusPillProps) {
  return (
    <BadgeBase
      toneClassName={TONES[tone].tone}
      metricsClassName={metrics(size, Boolean(icon), weight === "medium")}
      icon={icon}
      iconStrokeWidth={iconStrokeWidth}
      iconClassName={iconClassName ?? TONES[tone].icon}
      className={className}
    >
      {children}
    </BadgeBase>
  );
}
