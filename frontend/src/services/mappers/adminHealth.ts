/**
 * Wire format of `GET /health` (backend `common/health/health.controller.ts`, @Public).
 * The endpoint answers 200 when every dependency is UP and 503 with the same
 * body when one is DOWN, so both are valid answers for the admin dashboard.
 * Only the dependencies the backend really checks are mapped (database, redis);
 * the AI service and the document indexing queue are not part of this endpoint.
 */
export type HealthState = "UP" | "DOWN";

export interface HealthResponseBody {
  status: "UP" | "DEGRADED" | string;
  services?: {
    database?: string;
    redis?: string;
  };
  timestamp?: string;
}

/** Domain model used by the admin dashboard "Tình trạng hệ thống" card (Figma 10.2). */
export interface SystemHealth {
  /** The API answered the health check (200 or 503), so the application server is running. */
  appServer: HealthState;
  database: HealthState;
  /** Server time of the check (ISO string), or undefined when the body has none. */
  checkedAt?: string;
}

const toState = (value: string | undefined): HealthState => (value === "UP" ? "UP" : "DOWN");

export function toSystemHealth(body: HealthResponseBody): SystemHealth {
  return {
    appServer: "UP",
    database: toState(body.services?.database),
    checkedAt: body.timestamp || undefined,
  };
}
