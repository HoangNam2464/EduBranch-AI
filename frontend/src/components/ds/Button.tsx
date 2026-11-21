import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cx } from "@/components/ds/shared";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/ds/buttonStyles";

export type { ButtonSize, ButtonVariant };

/**
 * Figma `Actions/Button` (page EduBranch AI – Design System, node 225:287) — the app button used on page EduBranch AI – Screens.
 *  - MD: h40, padding 0 16, gap 8, Roboto Medium 14/20, radius 8
 *  - SM: h32, padding 0 12, gap 8, Roboto Medium 12/16, radius 8
 *  - Primary  #2A4E7F / hover #223F68 / disabled #94A7C0, label white
 *  - Secondary #DFEDF9 label #202124 / hover adds a 1px #2A4E7F stroke / disabled #F3F6FC label #909198
 *  - Ghost     transparent label #2A4E7F / hover #F3F6FC / disabled label #909198
 *  - Danger    #FF3535 / hover #D11F1F / disabled #FFE5E5 label #FF3535
 *  - Icons 16x16 (Lucide). Figma strokes are absolute px, so icons use
 *    `absoluteStrokeWidth`; pass the stroke measured on the instance (default 1.7).
 */
export interface ButtonContentProps {
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  /** Absolute stroke (px) measured on the Figma icon instance. */
  iconStrokeWidth?: number;
  /** Classes for the icon(s), e.g. a colour that differs from the label. */
  iconClassName?: string;
  children: ReactNode;
}

export function ButtonContent({ leadingIcon: Leading, trailingIcon: Trailing, iconStrokeWidth = 1.7, iconClassName, children }: ButtonContentProps) {
  const iconClass = cx("shrink-0", iconClassName);
  return (
    <>
      {Leading && <Leading aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={iconStrokeWidth} className={iconClass} />}
      <span>{children}</span>
      {Trailing && <Trailing aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={iconStrokeWidth} className={iconClass} />}
    </>
  );
}

type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "onClick">;

export interface ButtonProps extends NativeButtonProps, Omit<ButtonContentProps, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render as a router link instead of a <button>. */
  to?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
}

export function Button({
  variant = "primary",
  size = "md",
  to,
  disabled = false,
  leadingIcon,
  trailingIcon,
  iconStrokeWidth,
  iconClassName,
  children,
  className,
  type = "button",
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const classes = cx(buttonClassName(variant, size, disabled), className);
  const content = (
    <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} iconStrokeWidth={iconStrokeWidth} iconClassName={iconClassName}>
      {children}
    </ButtonContent>
  );

  if (to !== undefined) {
    if (disabled) {
      return (
        <span aria-disabled="true" className={classes}>
          {content}
        </span>
      );
    }
    return (
      <Link
        to={to}
        className={classes}
        onClick={onClick}
        ref={ref as Ref<HTMLAnchorElement>}
        aria-label={rest["aria-label"]}
      >
        {content}
      </Link>
    );
  }

  return (
    <button {...rest} ref={ref as Ref<HTMLButtonElement>} type={type} disabled={disabled} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
