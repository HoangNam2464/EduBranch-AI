import type { MouseEvent, ReactNode } from "react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Figma `Learning/Option Card` (page EduBranch AI – Design System, node 228:191) — State Default | Hover | Selected.
 *  - Row: padding 16, gap 12, radius 12, items centred, fills its column (640 in the set)
 *  - Default:  white, 1px inside stroke #D1D9E8, key box #F3F6FC
 *  - Hover:    #F3F6FC, 1px stroke #D1D9E8, key box white
 *  - Selected: #DFEDF9, 1.5px stroke #2A4E7F, key box #2A4E7F with a white key (row grows to 63px)
 *  - Key box 28x28 radius 8, key Roboto Medium 14/20 · Option text Roboto Regular 15/22 #202124
 * Behaves as a radio: put several inside an element with role="radiogroup".
 */
export interface OptionCardProps {
  /** Letter in the key box, e.g. "A". */
  optionKey: ReactNode;
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function OptionCard({ optionKey, children, selected = false, disabled, onSelect, className }: OptionCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cx(
        "group flex w-full cursor-pointer items-center gap-3 rounded-eb-lg border text-left transition-colors disabled:cursor-not-allowed",
        selected
          ? "border-primary bg-selected p-[16.5px] shadow-[inset_0_0_0_0.5px_var(--color-primary)]"
          : "border-line-strong bg-surface p-4 enabled:hover:bg-canvas",
        FOCUS_RING,
        className,
      )}
    >
      <span
        className={cx(
          "flex size-7 shrink-0 items-center justify-center rounded-eb-md text-[14px] leading-5 font-medium",
          selected ? "bg-primary text-ink-inverse" : "bg-canvas text-ink group-enabled:group-hover:bg-surface",
        )}
      >
        {optionKey}
      </span>
      <span className="min-w-0 flex-1 text-[15px] leading-[22px] font-normal text-ink">{children}</span>
    </button>
  );
}
