import type { ReactNode } from "react";
import { BadgeBase } from "@/components/ds/BadgeBase";

/**
 * Figma `Data Display/Badge/Case Status` (page 02, node 225:308). Not instanced on page 08;
 * colours follow the component set (status/* variables).
 *  - Draft     bg #EEF2F9 dot #909198 text #696A70
 *  - Reviewed  bg #DFEDF9 dot #00A5F5 text #2A4E7F
 *  - Approved  bg #FFF1DE dot #F58A00 text #B86800
 *  - Published bg #E1F7E9 dot #00B343 text #008A33
 */
export type CaseStatus = "draft" | "reviewed" | "approved" | "published";

const TONES: Record<CaseStatus, { tone: string; dot: string }> = {
  draft: { tone: "bg-surface-muted text-ink-secondary", dot: "bg-ink-muted" },
  reviewed: { tone: "bg-selected text-link", dot: "bg-accent" },
  approved: { tone: "bg-warning-bg text-status-approved-text", dot: "bg-warning" },
  published: { tone: "bg-success-bg text-status-published-text", dot: "bg-success" },
};

export interface CaseStatusBadgeProps {
  status: CaseStatus;
  children: ReactNode;
  className?: string;
}

export function CaseStatusBadge({ status, children, className }: CaseStatusBadgeProps) {
  return (
    <BadgeBase toneClassName={TONES[status].tone} dotClassName={TONES[status].dot} className={className}>
      {children}
    </BadgeBase>
  );
}
