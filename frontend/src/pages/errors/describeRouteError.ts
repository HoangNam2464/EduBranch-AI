import { isRouteErrorResponse } from "react-router-dom";

export interface RouteErrorView {
  status: number | string;
  /** Message to show; null means "use the default i18n message". */
  message: string | null;
  titleKey: "errors.route.titleNotFound" | "errors.route.titleGeneric";
}

/** Turns whatever the router caught into what the error page shows. */
export function describeRouteError(error: unknown): RouteErrorView {
  let status: number | string = "500";
  let message: string | null = null;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || error.data?.message || null;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return {
    status,
    message,
    titleKey: status === 404 ? "errors.route.titleNotFound" : "errors.route.titleGeneric",
  };
}
