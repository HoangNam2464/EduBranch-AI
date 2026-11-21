import type { ReactNode } from "react";
import { BadgeBase } from "@/components/ds/BadgeBase";

/**
 * Figma `Data Display/Badge/Submission` (page EduBranch AI – Design System, node 225:347).
 *  - Submitted: every page-08 instance (frames 00.4, 05.1, 05.9) overrides it to green:
 *    bg #E1F7E9, dot #00B343, text #007A2D (the set itself draws it blue #DFEDF9/#00A5F5/#2A4E7F).
 *  - Reviewed:  bg #FFF1DE, dot #F58A00, text #B86800 (set values; not used on page EduBranch AI – Screens)
 *  - Reflected: bg #E1F7E9, dot #00B343, text #008A33 (set values; not used on page EduBranch AI – Screens)
 */
export type SubmissionStatus = "submitted" | "reviewed" | "reflected";

const TONES: Record<SubmissionStatus, { tone: string; dot: string }> = {
  submitted: { tone: "bg-success-bg text-success-text", dot: "bg-success" },
  reviewed: { tone: "bg-warning-bg text-status-approved-text", dot: "bg-warning" },
  reflected: { tone: "bg-success-bg text-status-published-text", dot: "bg-success" },
};

export interface SubmissionBadgeProps {
  status: SubmissionStatus;
  children: ReactNode;
  className?: string;
}

export function SubmissionBadge({ status, children, className }: SubmissionBadgeProps) {
  return (
    <BadgeBase toneClassName={TONES[status].tone} dotClassName={TONES[status].dot} className={className}>
      {children}
    </BadgeBase>
  );
}
