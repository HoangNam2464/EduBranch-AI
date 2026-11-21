import type { Role } from "@/types";
import { PATHS, ROLE_HOME, ROLE_ROOT } from "@/routes/paths";

/**
 * Default landing page by role (alias of ROLE_HOME, kept for existing callers).
 */
export const DEFAULT_ROLE_REDIRECT: Record<Role, string> = ROLE_HOME;

/**
 * True when `pathname` is the role's route tree root or inside it
 * ("/lecturer" or "/lecturer/..."), never a lookalike such as "/lecturerX".
 * A returnUrl from another role's area (e.g. a student link opened by a
 * lecturer) is rejected and replaced by the role's home.
 */
function isInsideRoleTree(pathname: string, role: Role): boolean {
  const root = ROLE_ROOT[role];
  return pathname === root || pathname.startsWith(`${root}/`);
}

/** Paths that must never be used as a return target (removed from MVP scope). */
const PROHIBITED_RETURN_PATHS = new Set([`${PATHS.STUDENT.ROOT}/cases`, `${PATHS.STUDENT.ROOT}/cases/`]);

/**
 * Validates and resolves a safe internal destination URL based on the authenticated user's role.
 *
 * Strict Security Rules:
 * 1. Must be a non-empty string.
 * 2. Must begin with exactly one leading slash '/' and NOT '//' or '/\'.
 * 3. Must not contain backslashes '\' anywhere in the string.
 * 4. Must not contain URI schemes (e.g., http:, https:, javascript:, data:, file:, etc.).
 * 5. Must parse cleanly via URL parser with origin matching the dummy local base.
 * 6. Pathname must match the role-allowed route tree (Lecturers cannot use student direct-links, students cannot access lecturer routes).
 * 7. Pathname must NOT be a prohibited/unregistered route (such as /student/cases).
 * 8. Preserves valid pathname, search parameters, and URL hash fragment.
 */
export function resolveSafeReturnUrl(
  rawReturnUrl: unknown,
  role: Role,
): string {
  const fallback = ROLE_HOME[role] || PATHS.STUDENT.ROOT;

  if (!rawReturnUrl || typeof rawReturnUrl !== "string") {
    return fallback;
  }

  const trimmed = rawReturnUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // Reject scheme/protocol (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return fallback;
  }

  // Reject protocol-relative URLs (e.g., //evil.example, //google.com)
  if (trimmed.startsWith("//")) {
    return fallback;
  }

  // Reject backslashes anywhere in the URL (browsers normalize \ to / in unexpected ways)
  if (trimmed.includes("\\")) {
    return fallback;
  }

  // Must start with exactly one forward slash
  if (!trimmed.startsWith("/")) {
    return fallback;
  }

  // Parse via standard URL with dummy base to safely extract pathname, search, and hash
  let parsed: URL;
  try {
    parsed = new URL(trimmed, "http://localhost");
    // Ensure origin was not spoofed
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
  } catch {
    return fallback;
  }

  const pathname = parsed.pathname;

  // Prohibited routes check: e.g. /student/cases (removed from MVP scope in Phase 3.3)
  if (PROHIBITED_RETURN_PATHS.has(pathname)) {
    return fallback;
  }

  // Role-aware authorization check (unknown roles fall back too)
  if (!ROLE_ROOT[role] || !isInsideRoleTree(pathname, role)) {
    return fallback;
  }

  // Safely rebuild return URL preserving pathname, search, and hash
  return `${pathname}${parsed.search}${parsed.hash}`;
}
