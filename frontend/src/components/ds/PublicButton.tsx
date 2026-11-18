import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { ButtonContent } from "@/components/ds/Button";
import { cx } from "@/components/ds/shared";
import { publicButtonClassName, type PublicButtonSize, type PublicButtonVariant } from "@/components/ds/buttonStyles";

export type { PublicButtonSize, PublicButtonVariant };

/**
 * Figma `EB/Button` (page 05, node 447:278) — the public-site button (landing, public nav).
 * It is NOT identical to `Actions/Button`: radius 6 (not 8), Secondary is white with a
 * 1px #D1D9E8 stroke, Ghost label is #696A70, Danger is #D11F1F, and there is a Tonal variant.
 *  - MD: h40, padding 0 16, gap 8, Roboto Medium 14/20 · SM: h32, padding 0 12, gap 8, Medium 12/16
 *  - Primary #2A4E7F white · Secondary #FFFFFF + stroke #D1D9E8, label #202124
 *  - Tonal #DFEDF9 label #2A4E7F · Danger #D11F1F white · Ghost transparent label #696A70
 * The set defines no hover/disabled variants; hovers use the EduBranch action tokens.
 */
type NativeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className" | "onClick">;

export interface PublicButtonProps extends NativeButtonProps {
  variant?: PublicButtonVariant;
  size?: PublicButtonSize;
  /** Render as a router link instead of a <button>. */
  to?: string;
  /** Leading icon (Figma "Show icon" + "Icon" swap). */
  icon?: LucideIcon;
  /** Absolute stroke (px) measured on the Figma icon instance. */
  iconStrokeWidth?: number;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLButtonElement | HTMLAnchorElement>;
}

export function PublicButton({
  variant = "primary",
  size = "md",
  to,
  icon,
  iconStrokeWidth,
  children,
  className,
  type = "button",
  onClick,
  ref,
  ...rest
}: PublicButtonProps) {
  const classes = cx(publicButtonClassName(variant, size), className);
  const content = (
    <ButtonContent leadingIcon={icon} iconStrokeWidth={iconStrokeWidth}>
      {children}
    </ButtonContent>
  );
  if (to !== undefined) {
    return (
      <Link to={to} className={classes} onClick={onClick} ref={ref as Ref<HTMLAnchorElement>} aria-label={rest["aria-label"]}>
        {content}
      </Link>
    );
  }
  return (
    <button {...rest} ref={ref as Ref<HTMLButtonElement>} type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
