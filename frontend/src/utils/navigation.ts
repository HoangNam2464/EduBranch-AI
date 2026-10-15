import { Role } from "../types";

/**
 * Default fallback landing pages by user role.
 */
export const DEFAULT_ROLE_REDIRECT: Record<Role, string> = {
  LECTURER: "/lecturer/courses",
  STUDENT: "/student",
  ADMIN: "/lecturer/courses",
};

/**
 * Whitelist route prefix patterns permitted for each user role.
 * Ensures cross-role returnUrl injection (e.g., student navigating to lecturer management or vice-versa) is rejected.
 */
const ROLE_ALLOWED_ROUTE_PATTERNS: Record<Role, RegExp[]> = {
  LECTURER: [
    /^\/lecturer(?:\/|$)/,
  ],
  STUDENT: [
    /^\/student(?:\/|$)/,
  ],
  ADMIN: [
    /^\/lecturer(?:\/|$)/,
    /^\/student(?:\/|$)/,
  ],
};

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
  const fallback = DEFAULT_ROLE_REDIRECT[role] || "/student";

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
  if (pathname === "/student/cases" || pathname === "/student/cases/") {
    return fallback;
  }

  // Role-aware authorization check
  const allowedPatterns = ROLE_ALLOWED_ROUTE_PATTERNS[role];
  if (!allowedPatterns) {
    return fallback;
  }

  const isRoleAllowed = allowedPatterns.some((pattern) => pattern.test(pathname));
  if (!isRoleAllowed) {
    return fallback;
  }

  // Safely rebuild return URL preserving pathname, search, and hash
  return `${pathname}${parsed.search}${parsed.hash}`;
}
