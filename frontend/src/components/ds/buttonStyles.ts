import { cx, FOCUS_RING } from "@/components/ds/shared";

/** Class builders for `Actions/Button` and `EB/Button` (see Button.tsx / PublicButton.tsx). */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-eb-md font-medium transition-colors select-none " +
  FOCUS_RING;

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12px] leading-4",
  md: "h-10 px-4 text-[14px] leading-5",
};

const ENABLED: Record<ButtonVariant, string> = {
  primary: "cursor-pointer bg-primary text-ink-inverse hover:bg-primary-hover active:bg-primary-active",
  // Figma hover = 1px inside stroke #2A4E7F; drawn as an inset ring so the width does not jump.
  secondary: "cursor-pointer bg-primary-subtle text-ink hover:shadow-[inset_0_0_0_1px_var(--color-primary)]",
  ghost: "cursor-pointer bg-transparent text-link hover:bg-canvas",
  danger: "cursor-pointer bg-error text-ink-inverse hover:bg-danger",
};

const DISABLED: Record<ButtonVariant, string> = {
  primary: "cursor-not-allowed bg-primary-disabled text-ink-inverse",
  secondary: "cursor-not-allowed bg-canvas text-ink-muted",
  ghost: "cursor-not-allowed bg-transparent text-ink-muted",
  danger: "cursor-not-allowed bg-error-bg text-error",
};

export function buttonClassName(variant: ButtonVariant, size: ButtonSize, disabled = false): string {
  return cx(BASE, SIZES[size], disabled ? DISABLED[variant] : ENABLED[variant]);
}

export type PublicButtonVariant = "primary" | "secondary" | "tonal" | "danger" | "ghost";
export type PublicButtonSize = "sm" | "md";

const PUBLIC_BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-eb-sm font-medium transition-colors select-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 " +
  FOCUS_RING;

const PUBLIC_SIZES: Record<PublicButtonSize, string> = {
  sm: "h-8 px-3 text-[12px] leading-4",
  md: "h-10 px-4 text-[14px] leading-5",
};

const PUBLIC_VARIANTS: Record<PublicButtonVariant, string> = {
  primary: "bg-primary text-ink-inverse hover:bg-primary-hover",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-muted",
  tonal: "bg-primary-subtle text-primary hover:bg-primary-subtle-hover",
  danger: "bg-danger text-ink-inverse hover:bg-danger-hover",
  ghost: "bg-transparent text-ink-secondary hover:bg-surface-muted",
};

export function publicButtonClassName(variant: PublicButtonVariant, size: PublicButtonSize): string {
  return cx(PUBLIC_BASE, PUBLIC_SIZES[size], PUBLIC_VARIANTS[variant]);
}
