import { useId } from "react";
import { FilterControl } from "@/components/ds/FilterControl";
import { cx } from "@/components/ds/shared";

/**
 * Page-08 "Result count" (01.2, 01.3, 01.6, 01.8, 02.1, 03.1, 05.9, 10.5) — "Hiển thị [10 ▾] trên 8 khóa học".
 *  - Row: gap 8, centred. Labels Roboto Regular 14/20 #73807F (unbound fill, see --color-result-count).
 *  - Page-size picker = FilterControl default (64x32 for "10").
 * All text comes from props; `leadingLabel` / `trailingLabel` are the localized halves of the sentence.
 */
export interface ResultCountProps {
  /** Text before the picker, e.g. "Hiển thị". */
  leadingLabel: string;
  /** Text after the picker, e.g. "trên 8 khóa học". */
  trailingLabel: string;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (pageSize: number) => void;
  /** Accessible name of the page-size picker, e.g. "Số dòng mỗi trang". */
  pageSizeLabel: string;
  className?: string;
}

export function ResultCount({
  leadingLabel,
  trailingLabel,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageSizeLabel,
  className,
}: ResultCountProps) {
  const statusId = useId();
  return (
    <div className={cx("flex items-center gap-2 text-[14px] leading-5 text-result-count", className)}>
      <span>{leadingLabel}</span>
      <FilterControl
        label={pageSizeLabel}
        aria-describedby={statusId}
        value={String(pageSize)}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
      />
      <span id={statusId} aria-live="polite">
        {trailingLabel}
      </span>
    </div>
  );
}
