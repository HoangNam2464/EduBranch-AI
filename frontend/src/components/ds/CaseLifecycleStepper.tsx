import { Fragment, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cx } from "@/components/ds/shared";

/**
 * Figma `Learning/Case Lifecycle Stepper` (page EduBranch AI – Design System, node 228:279) — Current Draft | Reviewed | Approved | Published.
 *  - Card: white, 720 wide on page EduBranch AI – Screens (fills its column), padding 16 20, gap 12, radius 18, no stroke
 *  - Step = marker 28x28 (radius 999) + label, gap 8; connectors are 2px bars (radius 1) that fill the rest
 *  - Done:     marker #2A4E7F + Icon/check 14px stroke 2.092 white; label Regular 14/20 #202124
 *  - Current:  marker #DFEDF9 + 1.5px #2A4E7F stroke, number Medium 12/16 #2A4E7F; label Medium 14/20 #202124
 *  - Upcoming: marker #F3F6FC, number Medium 12/16 #909198; label Regular 14/20 #909198
 *  - Connector #2A4E7F after a done step, #E8EDF6 otherwise
 * "Published" shows all four steps done.
 */
export type CaseLifecycleStatus = "draft" | "reviewed" | "approved" | "published";

const ORDER: CaseLifecycleStatus[] = ["draft", "reviewed", "approved", "published"];

export interface CaseLifecycleStepperProps {
  status: CaseLifecycleStatus;
  /** Labels of the four steps, in order Draft, Reviewed, Approved, Published. */
  labels: [ReactNode, ReactNode, ReactNode, ReactNode];
  /** Accessible name of the list (e.g. "Tiến trình duyệt case"). */
  ariaLabel?: string;
  className?: string;
}

export function CaseLifecycleStepper({ status, labels, ariaLabel, className }: CaseLifecycleStepperProps) {
  // Published is the end of the lifecycle: every step is shown as done.
  const current = status === "published" ? ORDER.length : ORDER.indexOf(status);
  return (
    <ol aria-label={ariaLabel} className={cx("flex items-center gap-3 rounded-eb-xl bg-surface px-5 py-4", className)}>
      {labels.map((label, index) => {
        const state = index < current ? "done" : index === current ? "current" : "upcoming";
        return (
          <Fragment key={index}>
            {index > 0 && (
              <li aria-hidden="true" className={cx("h-0.5 min-w-4 flex-1 rounded-[1px]", index <= current ? "bg-primary" : "bg-line-soft")} />
            )}
            <li aria-current={state === "current" ? "step" : undefined} className="flex shrink-0 items-center gap-2">
              <StepMarker state={state} number={index + 1} />
              <span
                className={cx(
                  "text-[14px] leading-5 whitespace-nowrap",
                  state === "current" ? "font-medium text-ink" : state === "done" ? "font-normal text-ink" : "font-normal text-ink-muted",
                )}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

function StepMarker({ state, number }: { state: "done" | "current" | "upcoming"; number: number }) {
  if (state === "done") {
    return (
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary">
        <Check aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={2.092} className="text-ink-inverse" />
      </span>
    );
  }
  return (
    <span
      className={cx(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] leading-4 font-medium",
        state === "current"
          ? "bg-primary-subtle text-link shadow-[inset_0_0_0_1.5px_var(--color-primary)]"
          : "bg-canvas text-ink-muted",
      )}
    >
      {number}
    </span>
  );
}
