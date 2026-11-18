import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { SCREENS } from "./screens";
import { SESSIONS_FILE, backendReachable, credentialsFor, signIn } from "./session";

/** Signs in once per role (the login API is rate limited) and shares the sessions with all tests. */
const REUSE_MS = 20 * 60 * 1000; // several agents run the suite in parallel; reuse fresh sessions

export default async function globalSetup(): Promise<void> {
  const fresh = existsSync(SESSIONS_FILE) && Date.now() - statSync(SESSIONS_FILE).mtimeMs < REUSE_MS;
  const previous: Record<string, string> = fresh ? JSON.parse(readFileSync(SESSIONS_FILE, "utf8")) : {};
  const sessions: Record<string, string> = {};
  if (await backendReachable()) {
    const roles = [...new Set(SCREENS.map((s) => s.role).filter((r) => r !== null))];
    for (const role of roles) {
      if (!credentialsFor(role)) continue;
      sessions[role] = previous[role] ?? (await signIn(role));
    }
  }
  if (fresh && JSON.stringify(previous) === JSON.stringify(sessions)) return; // keep mtime: no new sign-in
  mkdirSync(dirname(SESSIONS_FILE), { recursive: true });
  writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
}
