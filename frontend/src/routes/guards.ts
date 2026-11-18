/**
 * EduBranch AI — Pure route-guard decisions.
 *
 * Kept free of React so the same rules are unit-tested and used by
 * PrivateRoute, the 404 page and the route error page.
 * The backend still enforces authorization; these rules only steer the UI.
 */

import type { Role } from "@/types";
import { PATHS, ROLE_HOME } from "@/routes/paths";

export type GuardDecision =
  | { allowed: true }
  | { allowed: false; kind: "signIn"; redirectTo: string }
  | { allowed: false; kind: "forbidden"; home: string; requiredRole: Role; userRole: Role };

/**
 * - Not signed in → login page, remembering where the user wanted to go.
 * - Signed in with another role → 403 page (Figma 01.4) with a link to the user's own home.
 * - Otherwise → allowed.
 */
export function evaluateRouteGuard(
  isAuthenticated: boolean,
  userRole: Role | undefined,
  requiredRole?: Role,
): GuardDecision {
  if (!isAuthenticated || !userRole) {
    return { allowed: false, kind: "signIn", redirectTo: PATHS.AUTH.LOGIN };
  }
  if (requiredRole && userRole !== requiredRole) {
    return { allowed: false, kind: "forbidden", home: ROLE_HOME[userRole], requiredRole, userRole };
  }
  return { allowed: true };
}

/** i18n key suffix for the "back to portal" button on error pages. */
export type PortalLabelKey = "login" | "lecturer" | "student" | "admin";

/** Where the error pages send the user back to, and which label to show. */
export function resolvePortal(
  isAuthenticated: boolean,
  userRole: Role | undefined,
): { path: string; labelKey: PortalLabelKey } {
  if (!isAuthenticated || !userRole) {
    return { path: PATHS.AUTH.LOGIN, labelKey: "login" };
  }
  const labelKey: PortalLabelKey =
    userRole === "LECTURER" ? "lecturer" : userRole === "ADMIN" ? "admin" : "student";
  return { path: ROLE_HOME[userRole], labelKey };
}
