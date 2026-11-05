/**
 * Local-development quick login (A13 of the midterm batch approval).
 *
 * Enabled only when ALL of these hold:
 *   - NODE_ENV is exactly "development" (never in production or test),
 *   - ENABLE_DEV_LOGIN is exactly "true",
 *   - the requested role maps to an email configured in DEV_LOGIN_LECTURER_EMAIL / DEV_LOGIN_STUDENT_EMAIL,
 *   - that account already exists with the same role (created by scripts/seed-demo.py).
 * Otherwise the endpoint answers 404 as if it did not exist. No password is involved.
 */
export type DevLoginRole = "LECTURER" | "STUDENT";

export function isDevLoginEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === "development" && env.ENABLE_DEV_LOGIN === "true";
}

export function devLoginEmailFor(role: unknown, env: NodeJS.ProcessEnv = process.env): string | null {
  if (role === "LECTURER") return (env.DEV_LOGIN_LECTURER_EMAIL || "").trim().toLowerCase() || null;
  if (role === "STUDENT") return (env.DEV_LOGIN_STUDENT_EMAIL || "").trim().toLowerCase() || null;
  return null;
}
