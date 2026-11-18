import { useTranslation } from "react-i18next";
import { cx, FOCUS_RING } from "@/components/ds";

/**
 * "Change month" control of the page-08 calendars (07.1, 09.1, 04.3): two solid 12x6 carets
 * (#202124), previous ▼ / next ▲, 20px apart. Lucide has no solid caret, so the glyph is a path.
 */
function Caret({ up }: { up?: boolean }) {
  return (
    <svg aria-hidden="true" width="12" height="6" viewBox="0 0 12 6" className="text-ink">
      <path d={up ? "M0 6 6 0l6 6z" : "M0 0h12L6 6z"} fill="currentColor" />
    </svg>
  );
}

export function MonthStepper({ onPrevious, onNext, className }: { onPrevious: () => void; onNext: () => void; className?: string }) {
  const { t } = useTranslation();
  const button = cx("inline-flex size-6 cursor-pointer items-center justify-center rounded-eb-sm hover:bg-canvas", FOCUS_RING);
  return (
    <div className={cx("flex items-center gap-2", className)}>
      <button type="button" className={button} aria-label={t("g4.calendar.previousMonth")} onClick={onPrevious}>
        <Caret />
      </button>
      <button type="button" className={button} aria-label={t("g4.calendar.nextMonth")} onClick={onNext}>
        <Caret up />
      </button>
    </div>
  );
}
