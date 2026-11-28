import { AUDIT_EVENT_TYPES, type AuditEventType } from "../../common/audit/audit.types";

/**
 * Pure helpers for the admin module (spec 007). No I/O, unit-tested in admin-format.spec.ts.
 */

const EVENT_SEARCH_LABELS: Record<AuditEventType, string[]> = {
  LOGIN_SUCCEEDED: ["đăng nhập thành công", "sign in succeeded", "signed in"],
  LOGIN_FAILED: ["đăng nhập thất bại", "sign in failed", "login failed"],
  USER_LOCKED: ["khóa tài khoản", "account locked"],
  USER_UNLOCKED: ["mở khóa tài khoản", "account unlocked"],
  USER_ROLE_CHANGED: ["đổi vai trò người dùng", "user role changed"],
  CASE_GENERATED: ["sinh case bằng ai", "ai case generated", "case generated"],
  CASE_GENERATION_FAILED: ["sinh case bằng ai thất bại", "ai case generation failed", "case generation failed"],
  CASE_STATUS_CHANGED: ["đổi trạng thái case", "case status changed"],
  MATERIAL_UPLOADED: ["tải lên tài liệu", "material uploaded"],
  SETTINGS_UPDATED: ["cập nhật cài đặt hệ thống", "system settings updated"],
};

const LOGIN_REASON_SEARCH_LABELS: Record<string, string[]> = {
  UNKNOWN_ACCOUNT: ["tài khoản không tồn tại", "unknown account"],
  BAD_PASSWORD: ["sai mật khẩu", "wrong password", "bad password"],
  ACCOUNT_LOCKED: ["tài khoản đang bị khóa", "account locked"],
};

/** Audit event types whose Vietnamese or English label contains `search` (case-insensitive, EBA-114). */
export function matchingAuditEventTypes(search: string): AuditEventType[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return [];
  return AUDIT_EVENT_TYPES.filter((code) =>
    EVENT_SEARCH_LABELS[code].some((label) => label.includes(needle)),
  );
}

/** Login failure reason codes whose Vietnamese or English label contains `search` (case-insensitive, EBA-114). */
export function matchingLoginFailureReasons(search: string): string[] {
  const needle = search.trim().toLowerCase();
  if (!needle) return [];
  return Object.entries(LOGIN_REASON_SEARCH_LABELS)
    .filter(([, labels]) => labels.some((label) => label.includes(needle)))
    .map(([code]) => code);
}

/** Time zone used for "today" / "this month" boundaries (INFERENCE: the product runs at a Vietnamese university). */
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

export function pageParams(page?: number, size?: number) {
  const p = page && page > 0 ? Math.floor(page) : 1;
  const s = size && size > 0 ? Math.min(Math.floor(size), 100) : 20;
  return { page: p, size: s, offset: (p - 1) * s };
}

/** Escapes LIKE wildcards so a search term is matched literally (used with `ESCAPE '\'`). */
export function likePattern(term: string): string {
  return `%${term.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function toInt(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
}

export function percentages(students: number, lecturers: number, admins: number) {
  const total = students + lecturers + admins;
  if (total === 0) return { studentPercent: 0, lecturerPercent: 0, adminPercent: 0 };
  const studentPercent = Math.round((students / total) * 100);
  const lecturerPercent = Math.round((lecturers / total) * 100);
  return { studentPercent, lecturerPercent, adminPercent: Math.max(0, 100 - studentPercent - lecturerPercent) };
}

type Meta = Record<string, unknown>;

/**
 * Short, non-sensitive description of an audit event's context for tables (10.2 / 10.9).
 * Only keys written by the services are read; anything else in meta is ignored.
 */
export function describeEventMeta(meta: Meta | null | undefined): string {
  if (!meta) return "";
  const parts: string[] = [];
  if (typeof meta.caseTitle === "string") parts.push(meta.caseTitle);
  if (typeof meta.fileName === "string") parts.push(meta.fileName);
  if (typeof meta.from === "string" && typeof meta.to === "string") parts.push(`${meta.from} → ${meta.to}`);
  if (typeof meta.targetName === "string") parts.push(meta.targetName);
  if (Array.isArray(meta.fields)) parts.push(meta.fields.join(", "));
  else if (typeof meta.fields === "string") parts.push(meta.fields);
  if (typeof meta.reason === "string") parts.push(meta.reason);
  if (typeof meta.errorCode === "string") parts.push(meta.errorCode);
  if (typeof meta.durationMs === "number") parts.push(`${(meta.durationMs / 1000).toFixed(1)}s`);
  return parts.join(" · ");
}

export function toneOf(outcome: string): "success" | "warning" | "error" {
  if (outcome === "ERROR") return "error";
  if (outcome === "WARNING") return "warning";
  return "success";
}

export function generationStatus(eventType: string, meta: Meta | null | undefined): "COMPLETED" | "TIMEOUT" | "FAILED" {
  if (eventType === "CASE_GENERATED") return "COMPLETED";
  const code = typeof meta?.errorCode === "string" ? meta.errorCode : "";
  return code === "HTTP_504" || code === "HTTP_408" || code === "AbortError" ? "TIMEOUT" : "FAILED";
}

/** Stable short code shown in the log table, derived from the event UUID. */
export function eventCode(id: string): string {
  return `EV-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}
