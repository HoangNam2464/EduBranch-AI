import type { Case } from "@/types";

/**
 * Groups cases by local date key (YYYY-M-D) matching `buildMonthWeeks`.
 * Cases with a missing or invalid `createdAt` are skipped.
 */
export function groupCasesByDay(cases: Case[]): Map<string, Case[]> {
  const map = new Map<string, Case[]>();
  for (const c of cases) {
    if (!c.createdAt) continue;
    const date = new Date(c.createdAt);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const list = map.get(key) ?? [];
    list.push(c);
    map.set(key, list);
  }
  return map;
}
