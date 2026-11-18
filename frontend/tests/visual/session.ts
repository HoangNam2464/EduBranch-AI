import type { Page } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ScreenRole } from "./screens";

/**
 * Real sign-in for Visual QA: calls POST /auth/login on the running backend with
 * test accounts from environment variables, then stores the session the same
 * way the app does (zustand persist key "edubranch-auth").
 *
 *   VISUAL_API_URL            default http://localhost:8080/api/v1
 *   VISUAL_<ROLE>_EMAIL       e.g. VISUAL_LECTURER_EMAIL
 *   VISUAL_<ROLE>_PASSWORD
 *
 * Credentials are test accounts of the local/dev database only; never put real
 * user credentials here or in the repository.
 */
const API_URL = process.env.VISUAL_API_URL ?? "http://localhost:8080/api/v1";

export async function backendReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export function credentialsFor(role: Exclude<ScreenRole, null>): { email: string; password: string } | null {
  const email = process.env[`VISUAL_${role}_EMAIL`];
  const password = process.env[`VISUAL_${role}_PASSWORD`];
  return email && password ? { email, password } : null;
}

/** Written by global-setup.ts: one signed-in session per role for the whole run. */
export const SESSIONS_FILE = join(dirname(fileURLToPath(import.meta.url)), "../../test-results/visual/.sessions.json");

export async function signIn(role: Exclude<ScreenRole, null>): Promise<string> {
  const creds = credentialsFor(role);
  if (!creds) throw new Error(`Missing VISUAL_${role}_EMAIL / VISUAL_${role}_PASSWORD`);
  let res: Response;
  for (let attempt = 0; ; attempt++) {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(creds),
    });
    if (res.status !== 429 || attempt >= 6) break;
    const wait = Number(res.headers.get("retry-after")) || 15;
    await new Promise((r) => setTimeout(r, wait * 1000));
  }
  if (!res.ok) throw new Error(`Login as ${role} failed: HTTP ${res.status}`);
  const body = (await res.json()) as { data: { accessToken: string; user: unknown } };
  return JSON.stringify({
    state: { accessToken: body.data.accessToken, refreshToken: null, user: body.data.user, isAuthenticated: true },
    version: 0,
  });
}

/** Prepares storage before the first navigation: language, sidebar state, dev tools hidden, session. */
export async function prepareSession(page: Page, role: ScreenRole, opts: { collapsed?: boolean } = {}): Promise<void> {
  let auth: string | null = null;
  if (role) {
    const sessions = existsSync(SESSIONS_FILE) ? (JSON.parse(readFileSync(SESSIONS_FILE, "utf8")) as Record<string, string>) : {};
    auth = sessions[role] ?? null;
    if (!auth) throw new Error(`No session for ${role}: global setup could not sign in`);
  }
  await page.addInitScript(
    ([authJson, collapsed]) => {
      try {
        if (authJson) localStorage.setItem("edubranch-auth", authJson);
        else localStorage.removeItem("edubranch-auth");
        localStorage.setItem("edubranch-lang", "vi");
        localStorage.setItem("edubranch-hide-dev-tools", "1");
        sessionStorage.setItem("edubranch-sidebar-collapsed", collapsed ? "1" : "0");
      } catch {
        /* storage blocked: the page renders its defaults */
      }
    },
    [auth, Boolean(opts.collapsed)] as const,
  );
}

/**
 * Route placeholders, so screens.ts can name fixture records instead of database ids:
 *   {course:CS402}                                → id of the course with that code
 *   {material:CS402/Runbook_ung_cuu_su_co_DDoS.pdf} → id of that file in that course
 * Resolved through the real API with the role's session (GET /courses, GET /courses/:id/materials;
 * both LECTURER-only). Unknown placeholders or missing records throw, so the frame is reported as
 * an error instead of being compared against a 404 page.
 */
export async function resolveRoute(route: string, role: ScreenRole): Promise<string> {
  const placeholders = [...route.matchAll(/\{(\w+):([^}]+)\}/g)];
  if (placeholders.length === 0) return route;
  if (!role) throw new Error(`Route ${route} has placeholders but no role to resolve them with`);
  const sessions = existsSync(SESSIONS_FILE) ? (JSON.parse(readFileSync(SESSIONS_FILE, "utf8")) as Record<string, string>) : {};
  const token = sessions[role] ? (JSON.parse(sessions[role]) as { state: { accessToken: string } }).state.accessToken : null;
  if (!token) throw new Error(`No session for ${role} to resolve ${route}`);

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`GET ${path} failed: HTTP ${res.status}`);
    return ((await res.json()) as { data: T }).data;
  }
  async function courseId(code: string): Promise<string> {
    const courses = await get<Array<{ id: string; course_code?: string; courseCode?: string }>>("/courses");
    const course = courses.find((c) => (c.course_code ?? c.courseCode) === code);
    if (!course) throw new Error(`Fixture course ${code} not found (run tests/visual/seed-local.mjs)`);
    return course.id;
  }

  let resolved = route;
  for (const [token_, kind, value] of placeholders) {
    let id: string;
    if (kind === "course") {
      id = await courseId(value);
    } else if (kind === "material") {
      const [code, ...rest] = value.split("/");
      const file = rest.join("/");
      const materials = await get<Array<{ id: string; original_filename?: string; originalFilename?: string }>>(`/courses/${await courseId(code)}/materials`);
      const material = materials.find((m) => (m.original_filename ?? m.originalFilename) === file);
      if (!material) throw new Error(`Fixture material ${value} not found (run tests/visual/seed-local.mjs)`);
      id = material.id;
    } else {
      throw new Error(`Unknown route placeholder ${token_}`);
    }
    resolved = resolved.replace(token_, encodeURIComponent(id));
  }
  return resolved;
}
