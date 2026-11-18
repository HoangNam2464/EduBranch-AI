import type { ElementType } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ds/Breadcrumb";
import { cx } from "@/components/ds/shared";

/**
 * Page-08 "Page context" (02.4–02.6, 03.4–03.7, 05.1–05.6) — title + breadcrumb in the shell header.
 *  - Column gap 3. Title Roboto Regular 22/28 #202124, truncated with an ellipsis when it does not fit.
 *  - Breadcrumb: see Breadcrumb.tsx.
 */
export interface PageContextProps {
  title: string;
  breadcrumb: BreadcrumbItem[];
  /** aria-label of the breadcrumb <nav>. */
  breadcrumbLabel: string;
  /** Heading element for the title (default h1). */
  titleAs?: ElementType;
  className?: string;
}

export function PageContext({ title, breadcrumb, breadcrumbLabel, titleAs: Title = "h1", className }: PageContextProps) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-[3px]", className)}>
      <Title className="truncate text-[22px] leading-7 font-normal tracking-normal text-ink">{title}</Title>
      <Breadcrumb label={breadcrumbLabel} items={breadcrumb} />
    </div>
  );
}
