import type { ReactNode } from "react";
import { BadgeBase } from "@/components/ds/BadgeBase";

/**
 * Figma `Data Display/Badge/AI Origin` (page EduBranch AI – Design System, node 225:320).
 *  - AI Draft:    bg #EEF2F9, dot #909198, text #696A70
 *  - AI-assisted: bg #EEF2F9, dot #00A5F5, text #696A70
 */
export type AiOrigin = "draft" | "assisted";

const DOTS: Record<AiOrigin, string> = {
  draft: "bg-ink-muted",
  assisted: "bg-accent",
};

export interface AiOriginBadgeProps {
  type: AiOrigin;
  children: ReactNode;
  className?: string;
}

export function AiOriginBadge({ type, children, className }: AiOriginBadgeProps) {
  return (
    <BadgeBase toneClassName="bg-surface-muted text-ink-secondary" dotClassName={DOTS[type]} className={className}>
      {children}
    </BadgeBase>
  );
}
