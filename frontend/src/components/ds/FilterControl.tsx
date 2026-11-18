import type { Ref, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Page-08 "Filter control" / "Dropdown" — the h32 #F3F6FC dropdown trigger of list toolbars
 * and of the Result count page-size picker. A native <select> styled to match, so keyboard,
 * screen-reader and mobile behaviour come from the platform. `field-sizing: content` makes the
 * box hug the selected label like the Figma hug frame.
 *  - default ("Filter control", 01.2 / 02.1 / 05.9 / 10.5): padding 0 12, gap 10,
 *    label Roboto Regular 12/16 #202124, chevron 16x16 (path 8x4) stroke 1.7 #4B5563, radius 8.
 *  - dense ("Dropdown", 03.1–03.3 / 10.6): gap 8, chevron 14x14 (path 7x3.5) stroke 1.7.
 */
export interface FilterOption {
  value: string;
  label: string;
}

export type FilterControlVariant = "default" | "dense";

export interface FilterControlProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "size" | "children" | "multiple"> {
  /** Accessible name; the control has no visible label. */
  label: string;
  options: FilterOption[];
  variant?: FilterControlVariant;
  /** Width/position classes for the outer box (the box hugs its label by default). */
  className?: string;
  ref?: Ref<HTMLSelectElement>;
}

const VARIANTS: Record<FilterControlVariant, { select: string; icon: string; size: number }> = {
  // right padding = gap + chevron + 12
  default: { select: "pr-[38px]", icon: "top-2", size: 16 },
  dense: { select: "pr-[34px]", icon: "top-[9px]", size: 14 },
};

export function FilterControl({ label, options, variant = "default", className, ref, ...selectProps }: FilterControlProps) {
  const v = VARIANTS[variant];
  return (
    <span className={cx("relative inline-flex h-8 shrink-0", className)}>
      <select
        {...selectProps}
        ref={ref}
        aria-label={label}
        className={cx(
          "h-8 w-full min-w-0 cursor-pointer appearance-none rounded-eb-md border-0 bg-canvas py-0 pl-3 text-[12px] leading-4 text-ink [field-sizing:content]",
          "disabled:cursor-not-allowed disabled:text-ink-muted",
          v.select,
          FOCUS_RING,
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={v.size}
        absoluteStrokeWidth
        strokeWidth={1.7}
        className={cx("pointer-events-none absolute right-3 text-control-icon", v.icon)}
      />
    </span>
  );
}
