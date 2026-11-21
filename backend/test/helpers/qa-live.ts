/**
 * EduBranch AI — Sprint 2 QA Shared Live Test Helpers.
 *
 * Provides shared fixtures, environment loading, HTTP client, MinIO client,
 * rate-limited user registration/reuse, and database verification for:
 *   - QA-003: backend/test/material-upload.spec.ts
 *   - QA-004: backend/test/material-storage-security.spec.ts
 *   - QA-005: backend/test/ingestion-pipeline-integration.spec.ts
 *
 * Opt-in: All live suites run only when QA_LIVE=1.
 */
import * as fs from "fs";
import * as path from "path";
import * as Minio from "minio";
import { Pool } from "pg";

export const API = process.env.QA_API_URL || "http://localhost:8080/api/v1";
export const FIXTURES = path.join(__dirname, "..", "fixtures", "qa");
export const PDF = "application/pdf";
export const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const MB = 1024 * 1024;

/**
 * Loads backend/.env and strips surrounding single or double quotes (M2).
 */
export function loadDotEnv(): Record<string, string> {
  const file = path.join(__dirname, "..", "..", ".env");
  if (!fs.existsSync(file)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[m[1]] = val;
    }
  }
  return out;
}

const dotenv = loadDotEnv();
export const env = (k: string, d = "") => process.env[k] ?? dotenv[k] ?? d;

export const BUCKET = env("MINIO_BUCKET_MATERIALS", "edubranch-materials");
export const MINIO_BASE = `${env("MINIO_SECURE") === "true" ? "https" : "http"}://${env("MINIO_HOST", "localhost")}:${env("MINIO_PORT", "9000")}`;
export const AI_SERVICE_BASE_URL = env("AI_SERVICE_BASE_URL", "http://localhost:8000");

export const minio = new Minio.Client({
  endPoint: env("MINIO_HOST", "localhost"),
  port: Number(env("MINIO_PORT", "9000")),
  useSSL: env("MINIO_SECURE") === "true",
  accessKey: env("MINIO_ROOT_USER"),
  secretKey: env("MINIO_ROOT_PASSWORD"),
});

/**
 * Checks whether an object exists in MinIO.
 * Returns false ONLY for NotFound/NoSuchKey errors; rethrows any other error (M2).
 */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await minio.statObject(BUCKET, key);
    return true;
  } catch (err: any) {
    if (
      err?.code === "NotFound" ||
      err?.code === "NoSuchKey" ||
      err?.name === "NotFound" ||
      err?.message?.includes("Not Found")
    ) {
      return false;
    }
    throw err;
  }
}

/**
 * Lists all MinIO objects matching an optional prefix (L1).
 */
export async function listMinioObjects(prefix = ""): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const stream = minio.listObjectsV2(BUCKET, prefix, true);
    const objects: string[] = [];
    stream.on("data", (obj) => {
      if (obj.name) objects.push(obj.name);
    });
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(objects));
  });
}

export type Res = { status: number; body: any; text: string; headers: Headers };

export async function call(method: string, url: string, token?: string, body?: unknown): Promise<Res> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload: any;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const r = await fetch(`${API}${url}`, { method, headers, body: payload });
  const text = await r.text();
  let parsed: any = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  return { status: r.status, body: parsed, text, headers: r.headers };
}

export function form(name: string, data: Buffer, type: string): FormData {
  const fd = new FormData();
  fd.append("file", new Blob([new Uint8Array(data)], { type }), name);
  return fd;
}

export const live = process.env.QA_LIVE === "1";
export const t = (name: string, fn: () => Promise<void>, timeout = 120000) =>
  (live ? it : it.skip)(name, fn, timeout);

export interface TestUser {
  token: string;
  id: string;
  email: string;
  role: "LECTURER" | "STUDENT";
}

// In-process cache of users across tests/spec files in the same runner process (M3)
const inProcessUserCache = new Map<string, TestUser>();

/**
 * Test run identifier for user isolation and cross-worker reuse (Review run 2 Item 2).
 * Across Jest worker processes, each module registry is isolated. Setting QA_RUN_ID in
 * the environment (e.g. QA_RUN_ID=1116) allows all worker processes to derive the exact
 * same 3 test user identities and reuse them via login (409 conflict on register)
 * without exceeding the /auth/register rate limit (5/min).
 * If unset, defaults to Date.now().
 */
export const RUN_ID = process.env.QA_RUN_ID || `${Date.now()}`;

export type IdentitySlot = "lecA" | "lecB" | "student";

/**
 * Derives one of 3 standard test identities from explicit slot and RUN_ID (Review run 3 item 6):
 *   - "lecA": Primary course owner and material author
 *   - "lecB": Secondary lecturer for multi-tenant isolation tests
 *   - "student": Student role for permission and access rejection tests
 *
 * Password is deterministic (`Qa-${RUN_ID}-Passw0rd!`) so no credentials need to be stored on disk.
 */
export function getTestIdentity(
  slot: IdentitySlot
): { slot: IdentitySlot; role: "LECTURER" | "STUDENT"; email: string; fullName: string; password: string } {
  const role: "LECTURER" | "STUDENT" = slot === "student" ? "STUDENT" : "LECTURER";
  const email = `qa.s2.${slot}.${RUN_ID}@test.edubranch.local`;
  const fullName = slot === "student" ? "QA Student" : slot === "lecB" ? "QA Lecturer B" : "QA Lecturer A";
  const password = `Qa-${RUN_ID}-Passw0rd!`;
  return { slot, role, email, fullName, password };
}

/**
 * Gets or registers a test user with rate-limit handling and cross-worker reuse (M3, Item 2).
 * If the user already exists (409), logs in instead with the deterministic password.
 * If 429 is encountered on register or login, parses Retry-After header or waits 61s and retries once.
 */
export async function getOrCreateTestUser(
  slot: IdentitySlot
): Promise<TestUser> {
  const identity = getTestIdentity(slot);
  const cacheKey = identity.slot;
  const cached = inProcessUserCache.get(cacheKey);
  if (cached) return cached;

  const { email, password, fullName, role } = identity;

  let r = await call("POST", "/auth/register", undefined, {
    email,
    password,
    fullName,
    role,
  });

  if (r.status === 429) {
    const retryAfterHeader = r.headers.get("retry-after");
    const waitSec = retryAfterHeader ? Math.max(1, parseInt(retryAfterHeader, 10) || 61) : 61;
    // eslint-disable-next-line no-console
    console.warn(`[qa-live] /auth/register returned 429. Waiting ${waitSec}s for rate-limit reset...`);
    await new Promise((res) => setTimeout(res, waitSec * 1000));
    r = await call("POST", "/auth/register", undefined, {
      email,
      password,
      fullName,
      role,
    });
  }

  if (r.status === 409 || (r.status === 400 && r.text?.includes("already exists"))) {
    // Already registered in this run -> login instead
    let loginRes = await call("POST", "/auth/login", undefined, { email, password });
    if (loginRes.status === 429) {
      const retryAfterHeader = loginRes.headers.get("retry-after");
      const waitSec = retryAfterHeader ? Math.max(1, parseInt(retryAfterHeader, 10) || 61) : 61;
      // eslint-disable-next-line no-console
      console.warn(`[qa-live] /auth/login returned 429. Waiting ${waitSec}s for rate-limit reset...`);
      await new Promise((res) => setTimeout(res, waitSec * 1000));
      loginRes = await call("POST", "/auth/login", undefined, { email, password });
    }
    if (loginRes.status === 200) {
      const user: TestUser = {
        token: loginRes.body.data.accessToken,
        id: loginRes.body.data.user?.id,
        email,
        role,
      };
      inProcessUserCache.set(cacheKey, user);
      return user;
    }
    throw new Error(`login existing user ${email} failed: ${loginRes.status} ${loginRes.text}`);
  }

  if (r.status !== 201) {
    throw new Error(`register ${slot} (${email}) -> ${r.status} ${r.text}`);
  }

  const user: TestUser = {
    token: r.body.data.accessToken,
    id: r.body.data.user?.id,
    email,
    role,
  };
  inProcessUserCache.set(cacheKey, user);
  return user;
}

const activePools = new Set<Pool>();

/**
 * Establishes a database connection pool for assertions and cleanup (H2, M4).
 * Tracks all created pools to guarantee closure in teardown (Review run 2 Item 3).
 */
export function createPgPool(): Pool {
  const pool = new Pool({
    host: env("POSTGRES_HOST", "localhost"),
    port: Number(env("POSTGRES_PORT", "5432")),
    database: env("POSTGRES_DB", "edubranch_ai"),
    user: env("POSTGRES_USER", "edubranch"),
    password: env("POSTGRES_PASSWORD", "changeme_db_password"),
  });
  activePools.add(pool);
  const origEnd = pool.end.bind(pool);
  pool.end = async () => {
    activePools.delete(pool);
    return origEnd();
  };
  return pool;
}

/**
 * Closes all active PostgreSQL pools created during the test run (Review run 2 Item 3).
 */
export async function closeAllPgPools(): Promise<void> {
  const pools = Array.from(activePools);
  for (const p of pools) {
    try {
      await p.end();
    } catch {
      // ignore
    }
  }
  activePools.clear();
}

/**
 * Closes MinIO client HTTP transport agent so no keep-alive socket handles remain (Review run 2 Item 3).
 */
export function closeMinioClient(): void {
  try {
    const agent = (minio as any).transportAgent;
    if (agent && typeof agent.destroy === "function") {
      agent.destroy();
    }
  } catch {
    // ignore
  }
}

/**
 * Teardown helper for afterAll blocks across all QA live spec files.
 * Closes open PostgreSQL connection pools and MinIO agent sockets,
 * guaranteeing clean process exit with zero open handles.
 */
export async function teardownQaLive(): Promise<void> {
  await closeAllPgPools();
  closeMinioClient();
}

/**
 * Deletes database entities directly in PostgreSQL (M4).
 * Handles FK dependencies: teaching_materials -> courses -> users.
 */
export async function cleanupDatabaseEntities(courseIds: string[], userIds: string[] = []): Promise<void> {
  if (courseIds.length === 0 && userIds.length === 0) return;
  const pool = createPgPool();
  try {
    if (courseIds.length > 0) {
      await pool.query("DELETE FROM document_chunks WHERE course_id = ANY($1::uuid[])", [courseIds]);
      await pool.query("DELETE FROM teaching_materials WHERE course_id = ANY($1::uuid[])", [courseIds]);
      // QA-004 AC-3 inserts a bare case row (no nodes) into its archived course
      await pool.query("DELETE FROM cases WHERE course_id = ANY($1::uuid[]) AND root_node_id IS NULL", [courseIds]);
      await pool.query("DELETE FROM courses WHERE id = ANY($1::uuid[])", [courseIds]);
    }
    // Documented (Review run 3 item 6): with QA_RUN_ID, users are kept in the local test DB
    // across workers to avoid registration rate limits. They are removed only when QA_RUN_ID is unset.
    if (userIds.length > 0 && !process.env.QA_RUN_ID) {
      await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [userIds]);
    }
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.warn(`[qa-live cleanup] database cleanup warning: ${err?.message}`);
  } finally {
    await pool.end();
  }
}
