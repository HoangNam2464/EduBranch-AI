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
/** `meta.from` / `meta.to` of USER_ROLE_CHANGED (`admin.service.ts` changeRole). */
const USER_ROLES = ["STUDENT", "LECTURER", "ADMIN"];
const has = (list: readonly string[], value: string) => list.includes(value);

/** "A → B" where both sides are case statuses or both are user roles; anything else stays as sent. */
function changeLabel(t: Translate, from: string, to: string): string | null {
  if (has(CASE_STATUSES, from) && has(CASE_STATUSES, to)) return `${t(`g3.status.${from}`)} → ${t(`g3.status.${to}`)}`;
  if (has(USER_ROLES, from) && has(USER_ROLES, to)) {
    return `${t(`g6.users.role.${from.toLowerCase()}`)} → ${t(`g6.users.role.${to.toLowerCase()}`)}`;
  }
  return null;
}

/** Translated event name; an unknown future code is shown as sent rather than hidden. */
export function eventLabel(t: Translate, eventType: string): string {
  return has(AUDIT_EVENT_TYPES, eventType) ? t(`g6.logs.events.${eventType}`) : eventType;
}

/** Context line with login failure reasons, case status changes and role changes translated. */
export function eventMetaLabel(t: Translate, eventMeta: string | undefined): string {
  if (!eventMeta) return "";
  return eventMeta
    .split(" · ")
    .map((part) => {
      if (has(LOGIN_FAILURE_REASONS, part)) return t(`g6.logs.reasons.${part}`);
      const change = part.match(/^([A-Z]+) → ([A-Z]+)$/);
      return (change && changeLabel(t, change[1], change[2])) ?? part;
    })
    .join(" · ");
}
