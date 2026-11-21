/**
 * Pure helpers shared by the feedback states (Figma page EduBranch AI – Screens, frames 01.x).
 * No React imports here so the helpers can be unit-tested with node:test.
 */

/** Support mailbox shown in the error, 403 and 404 help lines. */
export const SUPPORT_EMAIL = "support@edubranch.ai";

const pad2 = (value: number): string => String(value).padStart(2, "0");

/** "09:42" — local 24-hour clock used in the load-error line (01.3). */
export function formatClockTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** "23/11/2026 09:42" — local date and time used in the incident line (01.7). */
export function formatDateTime(date: Date): string {
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${formatClockTime(date)}`;
}

/** True when a Date instance holds a real time value. */
export function isValidDate(date: Date | null | undefined): date is Date {
  return date instanceof Date && !Number.isNaN(date.getTime());
}
