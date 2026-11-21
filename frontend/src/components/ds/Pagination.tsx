import { ChevronLeft, ChevronRight } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Page-08 "Pages" / "Page controls" (02.1, 03.1, 04.1, 05.9, 10.5) — page buttons of list footers.
 *  - Row: gap 8. Button 32x32, radius 8, label Roboto Regular 12/16.
 *  - Current page: #2A4E7F (action/primary) + white label, aria-current="page".
 *  - Other pages and enabled arrows: #DFEDF9 (bg/selected), label #202124.
 *  - Disabled arrow (first/last page): #F3F6FC (bg/canvas), as the "‹" of 02.1 / 03.1 / 05.9.
 *  - Arrows: Lucide chevron-left/right 16x16 (path 4x8), stroke 1.14 / 1.33, #4B5563.
 * Figma only shows a single page; with more than 7 pages the list collapses to
 * 1 … p-1 p p+1 … N (ellipsis = 32x32 non-interactive cell).
 */
export interface PaginationLabels {
  /** aria-label of the <nav>, e.g. "Phân trang". */
  nav: string;
  previous: string;
  next: string;
  /** Accessible name of a page button, e.g. (n) => `Trang ${n}`. */
  page: (page: number) => string;
}

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  labels: PaginationLabels;
  className?: string;
}

type PageItem = number | "start-ellipsis" | "end-ellipsis";

function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  let start = Math.max(2, Math.min(page - 1, pageCount - 4));
  let end = Math.min(pageCount - 1, Math.max(page + 1, 5));
  // An ellipsis never hides a single page.
  if (start === 3) start = 2;
  if (end === pageCount - 2) end = pageCount - 1;
  const items: PageItem[] = [1];
  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < pageCount - 1) items.push("end-ellipsis");
  items.push(pageCount);
  return items;
}

const CELL = "inline-flex size-8 shrink-0 items-center justify-center rounded-eb-md text-[12px] leading-4";

export function Pagination({ page, pageCount, onPageChange, labels, className }: PaginationProps) {
  const count = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), count);
  const arrow = (disabled: boolean) =>
    cx(CELL, FOCUS_RING, disabled ? "cursor-not-allowed bg-canvas" : "cursor-pointer bg-selected hover:bg-primary-subtle-hover");

  return (
    <nav aria-label={labels.nav} className={className}>
      <ul className="flex items-center gap-2">
        <li>
          <button
            type="button"
            className={arrow(current <= 1)}
            disabled={current <= 1}
            aria-label={labels.previous}
            onClick={() => onPageChange(current - 1)}
          >
            <ChevronLeft aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.143} className="text-control-icon" />
          </button>
        </li>
        {getPageItems(current, count).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                aria-label={labels.page(item)}
                aria-current={item === current ? "page" : undefined}
                onClick={() => item !== current && onPageChange(item)}
                className={cx(
                  CELL,
                  FOCUS_RING,
                  "cursor-pointer",
                  item === current ? "bg-primary text-ink-inverse" : "bg-selected text-ink hover:bg-primary-subtle-hover",
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} aria-hidden="true" className={cx(CELL, "text-ink-muted")}>
              …
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            className={arrow(current >= count)}
            disabled={current >= count}
            aria-label={labels.next}
            onClick={() => onPageChange(current + 1)}
          >
            <ChevronRight aria-hidden="true" size={16} absoluteStrokeWidth strokeWidth={1.333} className="text-control-icon" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
