import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import type { Role } from "../../types";
import type { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
  role?: Role;
}

export function PrivateRoute({ children, role }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    const home = user?.role === "LECTURER" ? "/lecturer/courses" : "/student";
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
