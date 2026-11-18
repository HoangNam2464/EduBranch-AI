import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { StateCard, StatePanel } from "@/components/feedback/StateCard";
import type { StateAction, StateButtonVariant } from "@/components/feedback/StateButton";

/**
 * 01.2 — empty list ("Chưa có khóa học nào"). Screens pass their own icon,
 * title, description and action; the course list preset strings live under
 * `states.empty.courses.*`. Figma uses Icon/book-open (stroke 1.7) and a
 * Primary SM button with Icon/plus (stroke 1.7).
 */
export interface EmptyStateProps {
  icon: LucideIcon;
  iconStrokeWidth?: number;
  title: ReactNode;
  description?: ReactNode;
  action?: StateAction;
  actionVariant?: StateButtonVariant;
  /** Wrap the card in the "List state" panel (default true). */
  framed?: boolean;
  className?: string;
}

export function EmptyState({ framed = true, className = "", ...card }: EmptyStateProps) {
  if (!framed) return <StateCard tone="empty" className={className} {...card} />;
  return (
    <StatePanel className={className}>
      <StateCard tone="empty" {...card} />
    </StatePanel>
  );
}
