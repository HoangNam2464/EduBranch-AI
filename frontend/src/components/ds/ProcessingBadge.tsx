import type { ReactNode } from "react";
import { CircleCheck, CircleX, Clock, LoaderCircle, type LucideIcon } from "lucide-react";
import { BadgeBase } from "@/components/ds/BadgeBase";

/**
 * Figma `Data Display/Badge/Processing` (page 02, node 225:337), with the colour
 * overrides every page-08 instance applies (frames 02.7, 05.1, 05.9, 10.7):
 *  - Pending    bg #FFF1DE, clock 14px stroke 1.511 #F58A00, text #9A5700
 *  - Processing bg #DFEDF9, loader-circle stroke 1.333 #00A5F5, text #2A4E7F
 *  - Completed  bg #E1F7E9, circle-check stroke 0.85 #00B343, text #007A2D
 *  - Failed     bg #FFE5E5, circle-x stroke 1.143 #FF3535, text #D11F1F
 * Padding 3/8/3/4, gap 4.
 */
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";

const TONES: Record<ProcessingStatus, { tone: string; icon: LucideIcon; stroke: number; iconColor: string }> = {
  pending: { tone: "bg-warning-bg text-warning-text", icon: Clock, stroke: 1.511, iconColor: "text-warning" },
  processing: { tone: "bg-selected text-link", icon: LoaderCircle, stroke: 1.333, iconColor: "text-accent" },
  completed: { tone: "bg-success-bg text-success-text", icon: CircleCheck, stroke: 0.85, iconColor: "text-success" },
  failed: { tone: "bg-error-bg text-error-text", icon: CircleX, stroke: 1.143, iconColor: "text-error" },
};

export interface ProcessingBadgeProps {
  status: ProcessingStatus;
  children: ReactNode;
  className?: string;
}

export function ProcessingBadge({ status, children, className }: ProcessingBadgeProps) {
  const t = TONES[status];
  return (
    <BadgeBase toneClassName={t.tone} icon={t.icon} iconStrokeWidth={t.stroke} iconClassName={t.iconColor} className={className}>
      {children}
    </BadgeBase>
  );
}
