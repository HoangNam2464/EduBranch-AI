/**
 * Student desk — Figma 07.2 "Bàn học".
 *
 * Gap (reported, not faked): the backend has no student-wide endpoints — no enrolment, no list
 * of assigned cases across courses, no study-time tracking, no notifications (notification
 * module is a skeleton). Metric cards, the four charts, "Học phần của tôi", "Case được giao",
 * "Case mới mở" and "Thông báo" therefore have no data source. The page keeps the Figma frame
 * (836 content column + 320 side column) with an empty state, and the calendar, which only
 * needs today's date.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { cx, FOCUS_RING } from "@/components/ds";
import { EmptyState } from "@/components/feedback";
import { PATHS } from "@/routes/paths";

export function StudentDeskPage() {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-5 pt-2">
      <div className="flex min-w-0 flex-1 flex-col self-stretch">
        <EmptyState
          icon={BookOpen}
          title={t("g5.desk.emptyTitle")}
          description={t("g5.desk.emptyBody")}
          action={{ label: t("g5.desk.toCourses"), to: PATHS.STUDENT.COURSES }}
        />
      </div>
      <aside className="flex w-80 shrink-0 flex-col gap-5 rounded-eb-xl bg-surface p-2 shadow-eb-card">
        <MonthCalendar />
        <div className="px-3 pt-2.5">
          <h2 className="text-[16px] leading-6 font-normal text-ink">{t("g5.desk.newCases")}</h2>
        </div>
        <p className="px-3 pb-3 text-[14px] leading-5 text-ink-secondary">{t("g5.desk.newCasesEmpty")}</p>
      </aside>
    </div>
  );
}

/**
 * "Calendar" (07.2): #DFEDF9, radius 14, padding 12, gap 20. Month 16/24 + two carets (gap 16);
 * weekday row 12/16 #696A70 (padding-top 10); 6 weeks of 40x36 cells, gap 6; today = 32px #2A4E7F circle.
 */
function MonthCalendar() {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1).getDay(); // 0 = Sunday ("CN") — Figma weeks start on Sunday
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - first + i));
  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
  const weekdays = t("g5.desk.weekdays", { returnObjects: true }) as string[];
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const monthLabel = t("g5.desk.month", { month: month + 1, year });
  const caret = "inline-flex h-[7px] w-3 cursor-pointer items-center justify-center rounded-sm text-ink";

  return (
    <section aria-label={t("g5.desk.calendar")} className="flex flex-col gap-5 rounded-[14px] bg-selected p-3">
      <div className="flex items-center justify-between">
        <h2 aria-live="polite" className="text-[16px] leading-6 font-normal text-ink">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-4">
          <button type="button" aria-label={t("g5.desk.nextMonth")} onClick={() => setView(new Date(year, month + 1, 1))} className={cx(caret, FOCUS_RING)}>
            <ChevronDown aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={3} />
          </button>
          <button type="button" aria-label={t("g5.desk.previousMonth")} onClick={() => setView(new Date(year, month - 1, 1))} className={cx(caret, FOCUS_RING)}>
            <ChevronUp aria-hidden="true" size={14} absoluteStrokeWidth strokeWidth={3} />
          </button>
        </div>
      </div>
      <table className="w-full table-fixed border-separate border-spacing-y-1.5" lang={i18n.language}>
        <thead>
          <tr>
            {weekdays.map((d) => (
              <th key={d} scope="col" className="h-[26px] pt-2.5 text-center text-[12px] leading-4 font-normal text-ink-secondary">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day) => {
                const isToday = sameDay(day, today);
                const outside = day.getMonth() !== month;
                return (
                  <td key={day.toISOString()} className="h-9 p-0 text-center">
                    <span
                      aria-current={isToday ? "date" : undefined}
                      className={cx(
                        "inline-flex size-8 items-center justify-center rounded-full text-[12px] leading-4",
                        isToday ? "bg-primary text-ink-inverse" : outside ? "text-ink-muted" : "text-ink",
                      )}
                    >
                      {day.getDate()}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
