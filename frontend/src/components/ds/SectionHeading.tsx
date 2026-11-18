import type { ElementType, ReactNode } from "react";
import { cx } from "@/components/ds/shared";

/**
 * Page-08 "Section heading" (02.4–02.7, 04.2, 05.x) — card/section title row.
 *  - Row, centred, gap 18. Title Roboto Regular 16/24 #202124 fills the row.
 *  - Optional trailing `actions` (badges, counters, collapse chevron) keep their own size.
 * Padding differs per instance in Figma (0, 6/0, 16/12/0/12): pass it with `className`.
 */
export interface SectionHeadingProps {
  title: ReactNode;
  /** Heading element (default h2). */
  as?: ElementType;
  /** id for aria-labelledby on the section. */
  id?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeading({ title, as: Heading = "h2", id, actions, className }: SectionHeadingProps) {
  return (
    <div className={cx("flex min-w-0 items-center gap-[18px]", className)}>
      <Heading id={id} className="min-w-0 flex-1 text-[16px] leading-6 font-normal tracking-normal text-ink">
        {title}
      </Heading>
      {actions}
    </div>
  );
}
