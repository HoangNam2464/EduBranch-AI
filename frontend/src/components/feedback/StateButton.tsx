import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { SUPPORT_EMAIL } from "@/components/feedback/stateFormat";

/**
 * Figma "Actions/Button" as used by the shared states (frames 01.2–01.8).
 *  - Size SM: height 32, padding 0 12, gap 8, Roboto Medium 12/16, radius 8
 *  - Size MD: height 40, padding 0 16, gap 8, Roboto Medium 14/20, radius 8
 *  - Primary: fill #2A4E7F, white label · Secondary: fill #DFEDF9, label #202124
 *  - Leading icon 16x16 (Lucide). Figma strokes are absolute px, so icons use
 *    `absoluteStrokeWidth` with the stroke measured on each instance.
 */
export type StateButtonVariant = "primary" | "secondary";
export type StateButtonSize = "sm" | "md";

/** Where an action goes: a router link or a callback. */
export type StateActionTarget = { to: string; onClick?: () => void } | { to?: undefined; onClick: () => void };

export type StateAction = StateActionTarget & {
  label: string;
  icon?: LucideIcon;
  /** Stroke in px as measured in Figma (default 1.7). */
  iconStrokeWidth?: number;
  /** Extra classes for the icon, e.g. a colour that differs from the label. */
  iconClassName?: string;
};

export interface StateButtonProps {
  action: StateAction;
  variant?: StateButtonVariant;
  size?: StateButtonSize;
  /** Ref callback, used by the session dialog to focus its action on open. */
  buttonRef?: (element: HTMLElement | null) => void;
}

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-eb-md font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

const variants: Record<StateButtonVariant, string> = {
  primary: "bg-primary text-ink-inverse hover:bg-primary-hover active:bg-primary-active",
  secondary: "bg-primary-subtle text-ink hover:bg-primary-subtle-hover",
};

const sizes: Record<StateButtonSize, string> = {
  sm: "h-8 px-3 text-[12px] leading-4",
  md: "h-10 px-4 text-sm leading-5",
};

export function StateButton({ action, variant = "primary", size = "md", buttonRef }: StateButtonProps) {
  const { label, icon: Icon, iconStrokeWidth = 1.7, iconClassName = "", to, onClick } = action;
  const className = `${base} ${variants[variant]} ${sizes[size]}`;
  const content: ReactNode = (
    <>
      {Icon && (
        <Icon
          aria-hidden="true"
          size={16}
          absoluteStrokeWidth
          strokeWidth={iconStrokeWidth}
          className={`shrink-0 ${iconClassName}`}
        />
      )}
      <span>{label}</span>
    </>
  );

  if (to !== undefined) {
    return (
      <Link to={to} onClick={onClick} className={className} ref={buttonRef}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} ref={buttonRef}>
      {content}
    </button>
  );
}

/** Support mailbox link: Roboto Medium 12/16 #2A4E7F inside a 12/16 #909198 line. */
export function SupportEmailLink() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}`}
      className="rounded-eb-sm font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {SUPPORT_EMAIL}
    </a>
  );
}
