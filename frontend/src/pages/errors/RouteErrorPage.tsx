import { useState } from "react";
import { useLocation, useRouteError } from "react-router-dom";
import { NotFoundStatusPage, ServerErrorStatusPage } from "@/components/feedback";
import { useAuthStore } from "@/stores/authStore";
import { resolvePortal } from "@/routes/guards";
import { describeRouteError } from "@/pages/errors/describeRouteError";

/**
 * Router error boundary — full page, no app shell.
 * A 404 response shows Figma 01.5; any other failure shows 01.7 (500).
 */
export function RouteErrorPage() {
  const view = describeRouteError(useRouteError());
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const portal = resolvePortal(isAuthenticated, user?.role);
  const [occurredAt] = useState(() => new Date());

  if (view.status === 404) {
    return <NotFoundStatusPage path={location.pathname} back={{ to: portal.path }} home={{ to: portal.path }} />;
  }

  return (
    <ServerErrorStatusPage
      home={{ to: portal.path }}
      reload={{ onClick: () => window.location.reload() }}
      occurredAt={occurredAt}
    />
  );
}
