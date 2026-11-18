import { useLocation, useNavigate } from "react-router-dom";
import { NotFoundStatusPage } from "@/components/feedback";
import { useAuthStore } from "@/stores/authStore";
import { resolvePortal } from "@/routes/guards";

/** 404 — full page, no app shell (Figma 01.5). */
export function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const portal = resolvePortal(isAuthenticated, user?.role);
  const canGoBack = typeof window !== "undefined" && window.history.length > 1;

  return (
    <NotFoundStatusPage
      path={location.pathname}
      back={canGoBack ? { onClick: () => navigate(-1) } : { to: portal.path }}
      home={{ to: portal.path }}
    />
  );
}
