/**
 * Month grid helpers shared by the G4 calendars (07.1 month view, 09.1 / 04.3 mini calendar).
 * Weeks start on Sunday ("CN") as in Figma page 08. Pure functions, no data access.
 */
export interface CalendarDay {
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  key: string;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Weeks of `month` padded with the trailing/leading days of the neighbour months.
 * `minWeeks` keeps a fixed height (the 07.1 month view always draws 5 rows when they fit).
 */
export function buildMonthWeeks(month: Date, today: Date, minWeeks = 0): CalendarDay[][] {
  const first = startOfMonth(month);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weekCount = Math.max(minWeeks, Math.ceil((first.getDay() + daysInMonth) / 7));
  const weeks: CalendarDay[][] = [];
  for (let w = 0; w < weekCount; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
      week.push({
        date,
        day: date.getDate(),
        inMonth: date.getMonth() === first.getMonth(),
        isToday: sameDay(date, today),
        key: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

/** "dd/MM/yyyy" (Figma uses this format on 04.x / 09.x). */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
