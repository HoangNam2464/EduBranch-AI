import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { StateButton, type StateAction, type StateButtonVariant } from "@/components/feedback/StateButton";

/**
 * Figma "Feedback/Empty State" (frames 01.2 / 01.3 / 01.8):
 * 480 wide, white, radius 18, padding 32, vertical gap 12, centred.
 *  - Icon box 48x48, radius 12, fill #DFEDF9 (tone "empty") or #FFE5E5 (tone "error");
 *    icon 20px, stroke #2A4E7F (empty) or #D11F1F (error).
 *  - Title Roboto Regular 16/24 #202124 · Description Regular 14/20 #696A70, centred.
 *  - "Action" wrapper with padding-top 8 holding a SM button.
 */
export type StateTone = "empty" | "error";

const toneStyles: Record<StateTone, { box: string; icon: string }> = {
  empty: { box: "bg-selected", icon: "text-primary" },
  error: { box: "bg-error-bg", icon: "text-error-text" },
};

export interface StateCardProps {
  icon: LucideIcon;
  /** Icon stroke in px as measured in Figma (book-open 1.7, search 1.6, circle-alert 1.5). */
  iconStrokeWidth?: number;
  tone?: StateTone;
  title: ReactNode;
  description?: ReactNode;
  action?: StateAction;
  /** Button variant of the action (Figma: Primary SM for "create", Secondary SM for retry/clear). */
  actionVariant?: StateButtonVariant;
  /** Heading level of the title; defaults to h2. */
  titleAs?: "h2" | "h3" | "p";
  className?: string;
}

export function StateCard({
  icon: Icon,
  iconStrokeWidth = 1.7,
  tone = "empty",
  title,
  description,
  action,
  actionVariant = "primary",
  titleAs: Title = "h2",
  className = "",
}: StateCardProps) {
  const styles = toneStyles[tone];
  return (
    <div
      className={`flex w-fit min-w-[min(480px,100%)] max-w-full flex-col items-center gap-3 rounded-eb-xl bg-surface p-8 ${className}`}
    >
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-eb-lg ${styles.box}`}>
        <Icon
          aria-hidden="true"
          size={20}
          absoluteStrokeWidth
          strokeWidth={iconStrokeWidth}
          className={styles.icon}
        />
      </div>
      <Title className="max-w-[416px] text-center text-base leading-6 font-normal tracking-normal text-ink">{title}</Title>
      {description && (
        /* Figma lets the description hug its text past the 416px inner width
           (e.g. 504px in 01.8), centred on the card; w-max keeps one line up to 560px. */
        <p className="w-max max-w-[min(560px,100%)] text-center text-sm leading-5 text-ink-secondary">{description}</p>
      )}
      {action && (
        <div className="pt-2">
          <StateButton action={action} variant={actionVariant} size="sm" />
        </div>
      )}
    </div>
  );
}

/**
 * Figma "List state": the white panel that hosts a feedback state inside a
 * list area — radius 18, padding 64 top/bottom and 24 left/right, content
 * centred both ways. It grows to fill its parent (flex-1) like the Figma frame.
 */
export interface StatePanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function StatePanel({ children, className = "", ...rest }: StatePanelProps) {
  return (
    <div
      {...rest}
      className={`flex flex-1 flex-col items-center justify-center rounded-eb-xl bg-surface px-6 py-16 shadow-eb-card ${className}`}
    >
      {children}
    </div>
  );
}
