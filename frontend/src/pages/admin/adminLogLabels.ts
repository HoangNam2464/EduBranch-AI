/**
 * 10.9 System logs: turn the API's audit codes into translated labels.
 * The API sends `eventTitle` = audit event type (e.g. `LOGIN_FAILED`) and `eventMeta` = context parts joined
 * by " · " (case title, file name, `DRAFT → REVIEWED`, a login failure reason, …). Only known codes are
 * translated; names typed by users and technical details (error codes, setting keys) are shown as sent.
 */
type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Audit event types written by the backend (`backend/src/common/audit/audit.types.ts`). */
export const AUDIT_EVENT_TYPES = [
  "LOGIN_SUCCEEDED",
  "LOGIN_FAILED",
  "USER_LOCKED",
  "USER_UNLOCKED",
  "USER_ROLE_CHANGED",
  "CASE_GENERATED",
  "CASE_GENERATION_FAILED",
  "CASE_STATUS_CHANGED",
  "MATERIAL_UPLOADED",
  "SETTINGS_UPDATED",
] as const;

/** `meta.reason` values of LOGIN_FAILED (`backend/src/modules/auth/auth.service.ts`). */
export const LOGIN_FAILURE_REASONS = ["UNKNOWN_ACCOUNT", "BAD_PASSWORD", "ACCOUNT_LOCKED"] as const;

const CASE_STATUSES = ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"];
const has = (list: readonly string[], value: string) => list.includes(value);

/** Translated event name; an unknown future code is shown as sent rather than hidden. */
export function eventLabel(t: Translate, eventType: string): string {
  return has(AUDIT_EVENT_TYPES, eventType) ? t(`g6.logs.events.${eventType}`) : eventType;
}

/** Context line with login failure reasons and case status changes translated. */
export function eventMetaLabel(t: Translate, eventMeta: string | undefined): string {
  if (!eventMeta) return "";
  return eventMeta
    .split(" · ")
    .map((part) => {
      if (has(LOGIN_FAILURE_REASONS, part)) return t(`g6.logs.reasons.${part}`);
      const change = part.match(/^([A-Z]+) → ([A-Z]+)$/);
      if (change && has(CASE_STATUSES, change[1]) && has(CASE_STATUSES, change[2])) {
        return `${t(`g3.status.${change[1]}`)} → ${t(`g3.status.${change[2]}`)}`;
      }
      return part;
    })
    .join(" · ");
}
