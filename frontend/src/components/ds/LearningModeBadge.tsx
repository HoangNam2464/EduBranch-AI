import type { ReactNode } from "react";
import { BadgeBase } from "@/components/ds/BadgeBase";

/**
 * Figma `Data Display/Badge/Learning Mode` (page 02, node 225:313): 1px inside stroke, no dot.
 *  - Branching Study: bg #DFEDF9, stroke #D1D9E8, text #2A4E7F
 *  - Review Study:    bg #E6F6FE, stroke #B3E4FC, text #0087C9
 */
export type LearningMode = "branching" | "review";

const TONES: Record<LearningMode, string> = {
  branching: "border border-line-strong bg-selected text-primary",
  review: "border border-mode-review-border bg-mode-review-bg text-mode-review-text",
};

export interface LearningModeBadgeProps {
  mode: LearningMode;
  children: ReactNode;
  className?: string;
}

export function LearningModeBadge({ mode, children, className }: LearningModeBadgeProps) {
  return (
    <BadgeBase toneClassName={TONES[mode]} className={className}>
      {children}
    </BadgeBase>
  );
}
