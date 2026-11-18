import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "@/components/ds";

/*
 * Pieces of the AI Studio wizard (07.5–07.7) drawn by hand on page 08.
 */

/** White card radius 18, padding 20, column gap `gap` (24 in "Course Information", 23 elsewhere). */
export function StudioCard({ title, gap = "gap-[23px]", children, className }: { title: ReactNode; gap?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cx("flex flex-col rounded-eb-xl bg-surface p-5", gap, className)}>
      <h2 className="text-[16px] leading-6 font-normal text-ink">{title}</h2>
      {children}
    </section>
  );
}

export type StepState = "done" | "current" | "upcoming";

/**
 * "Step" row: h52, padding 12/14, gap 12, radius 12. Number tile 28x28 radius 999, Medium 12/16.
 *  - current:  #DFEDF9 row, #2A4E7F tile + white number, label Medium 14/20 #2A4E7F
 *  - done:     #F3F6FC row, #DFEDF9 tile + check 14 (stroke 2.09) #2A4E7F, label Regular #696A70
 *  - upcoming: #F3F6FC row, white tile + number #696A70, label Regular #696A70
 *  - plain ("Sau khi bấm tạo"): #F3F6FC row, #DFEDF9 tile + number #2A4E7F, label Regular #202124
 */
export function StepRow({ index, state, children }: { index: number; state: StepState | "plain"; children: ReactNode }) {
  const tile =
    state === "current" ? "bg-primary text-ink-inverse" : state === "upcoming" ? "bg-surface text-ink-secondary" : "bg-selected text-link";
  return (
    <li
      aria-current={state === "current" ? "step" : undefined}
      className={cx("flex items-center gap-3 rounded-eb-lg px-3.5 py-3", state === "current" ? "bg-selected" : "bg-canvas")}
    >
      <span aria-hidden="true" className={cx("inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] leading-4 font-medium", tile)}>
        {state === "done" ? <Check size={14} absoluteStrokeWidth strokeWidth={2.09} /> : index}
      </span>
      <span
        className={cx(
          "min-w-0 flex-1 text-[14px] leading-5",
          state === "current" ? "font-medium text-link" : state === "plain" ? "text-ink" : "text-ink-secondary",
        )}
      >
        {children}
      </span>
    </li>
  );
}

/** Label/value row of "Cấu hình sinh case" / "Xác nhận thông số": gap 12, label 120 wide 12/16 #696A70, value Medium 14/20. */
export function ConfigRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-[120px] shrink-0 text-[12px] leading-4 text-ink-secondary">{label}</dt>
      <dd className="min-w-0 flex-1 text-[14px] leading-5 font-medium break-words text-ink">{children}</dd>
    </div>
  );
}

/**
 * "Page actions" bar of the wizard: white card radius 18, padding 20, space-between.
 * Buttons h44, padding 0 16, Regular 14/20, radius 8: secondary white with a 1px #E8EDF6 stroke,
 * primary #2A4E7F. (Drawn by hand on 07.5–07.7, not instances of Actions/Button.)
 */
export function WizardActions({
  status,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  status: ReactNode;
  secondaryLabel: ReactNode;
  onSecondary: () => void;
  primaryLabel: ReactNode;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-eb-md px-4 text-[14px] leading-5 font-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
  return (
    <div className="flex items-center justify-between rounded-eb-xl bg-surface p-5">
      <p className="text-[14px] leading-5 text-ink-secondary">{status}</p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onSecondary} className={cx(base, "cursor-pointer border border-line-soft bg-surface text-ink hover:bg-canvas")}>
          {secondaryLabel}
        </button>
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className={cx(
            base,
            primaryDisabled ? "cursor-not-allowed bg-primary-disabled text-ink-inverse" : "cursor-pointer bg-primary text-ink-inverse hover:bg-primary-hover",
          )}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
