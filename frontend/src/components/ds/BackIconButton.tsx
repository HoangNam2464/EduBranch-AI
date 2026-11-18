import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Page-08 "Back to courses" — 40x40 icon-only back control left of the Page context.
 *  - Box 40x40, radius 8, no fill (hover #F3F6FC).
 *  - arrow   (02.4–02.6, 05.1–05.6): Lucide arrow-left 18x18, stroke 1.94, #808080.
 *  - chevron (03.4–03.7): Lucide chevron-left 20x20, stroke 1.14, #202124.
 * Renders a router link with `to`, otherwise a button.
 */
export interface BackIconButtonProps {
  /** Accessible name, e.g. "Quay lại danh sách khóa học". */
  label: string;
  to?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  icon?: "arrow" | "chevron";
  className?: string;
}

export function BackIconButton({ label, to, onClick, icon = "arrow", className }: BackIconButtonProps) {
  const classes = cx(
    "inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-eb-md bg-transparent hover:bg-canvas",
    FOCUS_RING,
    className,
  );
  const glyph =
    icon === "chevron" ? (
      <ChevronLeft aria-hidden="true" size={20} absoluteStrokeWidth strokeWidth={1.143} className="text-ink" />
    ) : (
      <ArrowLeft aria-hidden="true" size={18} absoluteStrokeWidth strokeWidth={1.943} className="text-back-icon" />
    );

  if (to !== undefined) {
    return (
      <Link to={to} aria-label={label} title={label} onClick={onClick} className={classes}>
        {glyph}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={classes}>
      {glyph}
    </button>
  );
}
