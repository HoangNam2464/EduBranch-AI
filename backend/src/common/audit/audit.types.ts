/** Event types stored in `audit_events` (migration V7; spec 007 AC-A9, AC-A13). */
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

export type AuditEventType = (typeof AUDIT_EVENT_TYPES)[number];
export type AuditOutcome = "SUCCESS" | "WARNING" | "ERROR";

export interface AuditEventInput {
  type: AuditEventType;
  outcome: AuditOutcome;
  /** User who performed the action, when known. */
  actorId?: string | null;
  /** Entity the action targeted (user, case, material). */
  targetId?: string | null;
  /** Non-sensitive context only: no passwords, tokens, typed e-mails or student text. */
  meta?: Record<string, string | number | boolean | null>;
}
