import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import { evaluateRouteGuard } from "@/routes/guards";
import { ForbiddenPage } from "@/pages/errors/ForbiddenPage";
import type { Role } from "@/types";

interface PrivateRouteProps {
  children: ReactNode;
  /** Role required to enter the wrapped route tree. Omit to only require sign-in. */
  role?: Role;
}

/**
 * Shared role guard for the Lecturer, Student and Admin route trees.
 * UI-only: every protected API call is still authorized by the backend.
 */
export function PrivateRoute({ children, role }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const decision = evaluateRouteGuard(isAuthenticated, user?.role, role);

  if (decision.allowed) return <>{children}</>;

  if (decision.kind === "signIn") {
    return <Navigate to={decision.redirectTo} state={{ from: location }} replace />;
  }

  return <ForbiddenPage requiredRole={decision.requiredRole} />;
}
