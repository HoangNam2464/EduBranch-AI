import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds/shared";

/**
 * Page-08 "Breadcrumb" (02.4–02.6, 03.4–03.7, 05.1–05.6) — trail under the page title.
 *  - Row gap 6, centred. Labels Roboto Regular 12/16.
 *  - Ancestors #909198 (text/muted, links); current page #2A4E7F (text/link).
 *  - Separator: Lucide chevron-right 10x10, stroke 1.33, #696A70 (text/secondary).
 * The last item is the current page (aria-current="page"); items with `to` render router links.
 */
export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  /** aria-label of the <nav>, e.g. "Đường dẫn". */
  label: string;
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ label, items, className }: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={className}>
      <ol className="flex min-w-0 items-center gap-1.5 text-[12px] leading-4">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <Fragment key={`${index}-${item.label}`}>
              {index > 0 && (
                <li aria-hidden="true" className="inline-flex shrink-0">
                  <ChevronRight size={10} absoluteStrokeWidth strokeWidth={1.333} className="text-ink-secondary" />
                </li>
              )}
              <li className={cx("whitespace-nowrap", last && "min-w-0 truncate")}>
                {last ? (
                  <span aria-current="page" className="text-link">
                    {item.label}
                  </span>
                ) : item.to !== undefined ? (
                  <Link to={item.to} className={cx("rounded-sm text-ink-secondary hover:text-link", FOCUS_RING)}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-ink-secondary">{item.label}</span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
