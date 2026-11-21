import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ForbiddenStatusPage } from "@/components/feedback";
import { useAuthStore } from "@/stores/authStore";
import { PATHS, ROLE_HOME } from "@/routes/paths";
import { resolveTitleKey } from "@/layouts/shell/shellRoutes";
import type { Role } from "@/types";

const ROLE_KEY: Record<Role, string> = { LECTURER: "lecturer", STUDENT: "student", ADMIN: "admin" };

/**
 * 403 — full page, no app shell (Figma 01.4).
 * With `requiredRole` (wrong-role access from PrivateRoute) it names the page,
 * the role it is for and the role the user is signed in with.
 */
export function ForbiddenPage({ requiredRole }: { requiredRole?: Role }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const titleKey = resolveTitleKey(location);
  const userRole = user?.role;
  const roleDetail =
    requiredRole && userRole && titleKey
      ? {
          pageName: t(titleKey),
          allowedRole: t(`states.forbidden.roleFor.${ROLE_KEY[requiredRole]}`),
          currentRole: t(`shell.roles.${ROLE_KEY[userRole]}`),
        }
      : {};

  return (
    <ForbiddenStatusPage
      {...roleDetail}
      switchAccount={{
        onClick: () => {
          logout();
          navigate(PATHS.AUTH.LOGIN, { replace: true, state: { from: location } });
        },
      }}
      home={{ to: userRole ? ROLE_HOME[userRole] : PATHS.AUTH.LOGIN }}
    />
  );
}
