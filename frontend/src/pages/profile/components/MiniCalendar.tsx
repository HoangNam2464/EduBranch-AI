import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cx } from "@/components/ds";
import { addMonths, buildMonthWeeks, startOfMonth } from "@/pages/profile/components/calendar";
import { MonthStepper } from "@/pages/profile/components/MonthStepper";

/**
 * Page-08 mini calendars, 280 wide, 7 columns of 40.
 *  - profile (09.1 "Calendar"): month row h32 (Regular 16/20) · gap 20 · weekdays h32 (Regular 12/16
 *    #696A70) · gap 10 · week rows h42; date 32x32 radius 8 on white.
 *  - stats (04.3 "Calendar" on the #DFEDF9 card): month row h24 (Regular 16/24) · gap 20 ·
 *    weekdays h26 (padding-top 10) · gap 20 · week rows h36 with gap 6; date 32x32 fully rounded.
 * Out-of-month dates #909198; today #2A4E7F with a white label. Real dates only: the backend
 * has no dated items (deadlines, sessions) for these screens, so no event markers are drawn.
 */
export type MiniCalendarVariant = "profile" | "stats";

const VARIANTS: Record<MiniCalendarVariant, { month: string; title: string; th: string; tr: string; td: string; date: string; fill: string }> = {
  profile: {
    month: "h-8",
    title: "leading-5",
    th: "h-[62px] pt-7 pb-[18px]",
    tr: "h-[42px]",
    td: "align-middle",
    date: "rounded-eb-md",
    fill: "bg-surface",
  },
  stats: {
    month: "h-6",
    title: "leading-6",
    th: "h-[66px] pt-[30px] pb-5",
    tr: "h-[42px] last:h-9",
    td: "align-top pt-0.5",
    date: "rounded-full",
    fill: "",
  },
};

export function MiniCalendar({ variant = "profile", className }: { variant?: MiniCalendarVariant; className?: string }) {
  const { t } = useTranslation();
  const [today] = useState(() => new Date());
  const [month, setMonth] = useState(() => startOfMonth(today));
  const weeks = useMemo(() => buildMonthWeeks(month, today), [month, today]);
  const weekdays = t("g4.calendar.weekdays", { returnObjects: true }) as string[];
  const title = t("g4.calendar.monthTitle", { month: month.getMonth() + 1, year: month.getFullYear() });
  const v = VARIANTS[variant];

  return (
    <div className={cx("flex flex-col", className)}>
      <div className={cx("flex items-center justify-between", v.month)}>
        <p className={cx("text-[16px] text-ink", v.title)} aria-live="polite">
          {title}
        </p>
        <MonthStepper onPrevious={() => setMonth((m) => addMonths(m, -1))} onNext={() => setMonth((m) => addMonths(m, 1))} />
      </div>
      <table className="w-full table-fixed border-collapse" aria-label={title}>
        <thead>
          <tr>
            {weekdays.map((w) => (
              <th key={w} scope="col" className={cx("p-0 align-top text-center text-[12px] leading-4 font-normal text-ink-secondary", v.th)}>
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0].key} className={v.tr}>
              {week.map((d) => (
                <td key={d.key} className={cx("p-0 text-center", v.td)}>
                  <span
                    aria-current={d.isToday ? "date" : undefined}
                    className={cx(
                      "mx-auto inline-flex size-8 items-center justify-center text-[12px] leading-4",
                      v.date,
                      d.isToday ? "bg-primary text-ink-inverse" : cx(v.fill, d.inMonth ? "text-ink" : "text-ink-muted"),
                    )}
                  >
                    {d.day}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
