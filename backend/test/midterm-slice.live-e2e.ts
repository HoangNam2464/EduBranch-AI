import { randomBytes } from "crypto";

/**
 * Midterm slice — live end-to-end API test (WP-7).
 *
 * Runs J1 (lecturer: course → material → generate → review → publish) and J2 (student:
 * attempt → decisions → Journey Review → reasoning → reflection) against a RUNNING stack:
 * backend (`npm run start:dev`), AI service and Postgres/MinIO. Every run creates its own users,
 * course and case, so it never depends on or changes the demo seed.
 *
 *   npm run test:slice                     # base URL from E2E_API_BASE_URL, default below
 *
 * If the backend is unreachable the suite fails with a clear message (it is an opt-in suite and
 * is not matched by `npm test` / `npm run test:e2e`).
 */
const BASE = process.env.E2E_API_BASE_URL || "http://localhost:8080/api/v1";
const RUN = randomBytes(3).toString("hex");
const genPassword = () => `E2e-${randomBytes(9).toString("base64url")}`;

jest.setTimeout(420_000);

type Res = { status: number; body: any };

async function call(method: string, path: string, token?: string, body?: unknown, form?: FormData): Promise<Res> {
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  return { status: res.status, body: parsed && typeof parsed === "object" && "data" in parsed ? parsed.data : parsed };
}

/** Minimal single-page PDF (ASCII text, correct xref offsets) used as course material. */
function makePdf(lines: string[]): Buffer {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const stream = ["BT", "/F1 11 Tf", "14 TL", "50 780 Td", ...lines.map((l) => `(${esc(l)}) '`), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((n) => `${String(n).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const MATERIAL = [
  "Conflict management in software project teams.",
  "Conflict appears when team members have different goals, values or ways of working.",
  "A project manager should listen to every side before deciding, to avoid bias.",
  "There are five strategies: avoiding, accommodating, competing, compromising and collaborating.",
  "Collaboration takes time but usually produces durable solutions and builds trust.",
  "When the deadline is close, compromise helps the team move on, but the trade-offs must be recorded.",
  "A short retrospective after the sprint helps the team learn from the conflict.",
];

/** Auth routes are rate limited per IP (AUTH_RATE_LIMIT_*, default 5 per 60 s): wait out a 429. */
async function callAuth(path: string, body: unknown): Promise<Res> {
  for (let i = 0; ; i++) {
    const res = await call("POST", path, undefined, body);
    if (res.status !== 429 || i >= 2) return res;
    await new Promise((r) => setTimeout(r, 61_000));
  }
}

async function registerAndLogin(role: "LECTURER" | "STUDENT", tag: string): Promise<string> {
  const email = `${tag}_${RUN}@example.test`;
  const password = genPassword();
  const reg = await callAuth("/auth/register", { email, password, fullName: `E2E ${tag}`, role });
  expect([200, 201]).toContain(reg.status);
  const login = await callAuth("/auth/login", { email, password });
  expect(login.status).toBe(200);
  const token = login.body?.accessToken;
  expect(typeof token).toBe("string");
  return token;
}

describe("Midterm slice J1 + J2 (live stack)", () => {
  let lecturer: string;
  let otherLecturer: string;
  let student: string;
  let courseId: string;
  let materialId: string;
  let caseId: string;
  let attemptId: string;

  beforeAll(async () => {
    try {
      await fetch(BASE.replace(/\/api\/v1$/, "") + "/api/v1/health");
    } catch (err) {
      throw new Error(`Backend not reachable at ${BASE}. Start the stack first (see CLAUDE.md Commands). ${String(err)}`);
    }
    lecturer = await registerAndLogin("LECTURER", "lect");
    otherLecturer = await registerAndLogin("LECTURER", "other");
    student = await registerAndLogin("STUDENT", "stud");
  });

  // ── J1: lecturer ─────────────────────────────────────────────────────────
  it("J1.1 lecturer creates a course that only the owner sees", async () => {
    const created = await call("POST", "/courses", lecturer, { name: `E2E Quan ly du an ${RUN}`, courseCode: `E2E${RUN}`.toUpperCase() });
    expect(created.status).toBe(201);
    courseId = created.body.id;

    const mine = await call("GET", "/courses", lecturer);
    expect(mine.status).toBe(200);
    expect(mine.body.map((c: any) => c.id)).toContain(courseId);

    const theirs = await call("GET", "/courses", otherLecturer);
    expect(theirs.body.map((c: any) => c.id)).not.toContain(courseId);
  });

  it("J1.2 material upload is processed into chunks; reads are owner-only", async () => {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(makePdf(MATERIAL))], { type: "application/pdf" }), "conflict.pdf");
    const up = await call("POST", `/courses/${courseId}/materials`, lecturer, undefined, form);
    expect(up.status).toBe(201);
    materialId = up.body.id;
    expect(up.body.processing_status).toBe("COMPLETED");

    const chunks = await call("GET", `/materials/${materialId}/chunks`, lecturer);
    expect(chunks.status).toBe(200);
    expect(chunks.body.chunks.length).toBeGreaterThan(0);
    expect(chunks.body.chunks[0]).not.toHaveProperty("embedding");

    expect((await call("GET", `/courses/${courseId}/materials`, otherLecturer)).status).toBe(403);
    expect((await call("GET", `/courses/${courseId}/materials`, student)).status).toBe(403);
    expect((await call("GET", `/materials/${materialId}`, student)).status).toBe(403);
  });

  it("J1.3 generated case is a valid DRAFT tree, hidden from students and other lecturers", async () => {
    const gen = await call("POST", "/cases/generate", lecturer, {
      courseId,
      materialIds: [materialId],
      topicHint: "Conflict in a project team",
      numNodes: 5,
    });
    expect([200, 201]).toContain(gen.status);
    caseId = gen.body.id ?? gen.body.caseId;
    expect(caseId).toBeTruthy();

    const full = await call("GET", `/cases/${caseId}`, lecturer);
    expect(full.status).toBe(200);
    expect(full.body.status).toBe("DRAFT");
    const nodes: any[] = full.body.nodes;
    expect(nodes.length).toBeGreaterThanOrEqual(2);
    const ids = new Set(nodes.map((n) => n.id));
    expect(ids.has(full.body.root_node_id)).toBe(true);
    for (const n of nodes) {
      for (const o of n.options) {
        if (o.next_node_id) expect(ids.has(o.next_node_id)).toBe(true);
      }
      if (!n.is_terminal) expect(n.options.length).toBeGreaterThanOrEqual(2);
    }
    expect(nodes.some((n) => n.is_terminal)).toBe(true);

    expect((await call("GET", `/cases/${caseId}`, otherLecturer)).status).toBe(403);
    expect([403, 404]).toContain((await call("GET", `/cases/${caseId}`, student)).status);

    const list = await call("GET", `/courses/${courseId}/cases`, lecturer);
    expect(list.status).toBe(200);
    const row = list.body.find((c: any) => c.id === caseId);
    expect(row.node_count).toBe(nodes.length);
    expect((await call("GET", `/courses/${courseId}/cases`, otherLecturer)).status).toBe(403);
  });

  it("J1.4 lifecycle DRAFT → REVIEWED → APPROVED → PUBLISHED; other lecturers cannot change it", async () => {
    expect((await call("PATCH", `/cases/${caseId}/status`, otherLecturer, { status: "REVIEWED" })).status).toBe(403);
    for (const status of ["REVIEWED", "APPROVED", "PUBLISHED"]) {
      const res = await call("PATCH", `/cases/${caseId}/status`, lecturer, { status });
      expect(res.status).toBe(200);
    }
    const after = await call("GET", `/cases/${caseId}`, lecturer);
    expect(after.body.status).toBe("PUBLISHED");
  });

  // ── J2: student ──────────────────────────────────────────────────────────
  it("J2.1 student sees the published case without the decision tree", async () => {
    const res = await call("GET", `/cases/${caseId}`, student);
    expect(res.status).toBe(200);
    const json = JSON.stringify(res.body);
    expect(json).not.toContain("next_node_id");
    expect(json).not.toContain("consequence");
  });

  it("J2.2 decisions advance without revealing consequences or next nodes mid-flow", async () => {
    const start = await call("POST", `/cases/${caseId}/branching-attempts`, student);
    expect([200, 201]).toContain(start.status);
    attemptId = start.body.id;
    let attempt = start.body;
    let guard = 0;
    while (!attempt.isCompleted && attempt.currentNode && guard++ < 20) {
      const leaked = JSON.stringify(attempt.currentNode);
      expect(leaked).not.toContain("next_node_id");
      expect(leaked).not.toContain("consequence");
      for (const s of attempt.steps) expect(s.consequence).toBeUndefined();

      const step = await call("POST", `/branching-attempts/${attemptId}/step`, student, {
        nodeId: attempt.currentNode.id,
        selectedOptionId: attempt.currentNode.options[0].id,
      });
      expect([200, 201]).toContain(step.status);
      attempt = step.body;
    }
    expect(attempt.isCompleted).toBe(true);
    expect(attempt.steps.length).toBeGreaterThan(0);
  });

  it("J2.3 Journey Review reveals consequences only after completion; other users are blocked", async () => {
    const review = await call("GET", `/branching-attempts/${attemptId}`, student);
    expect(review.status).toBe(200);
    for (const s of review.body.steps) expect(typeof s.consequence).toBe("string");
    expect(review.body.outcomeNode).toBeTruthy();

    expect([403, 404]).toContain((await call("GET", `/branching-attempts/${attemptId}`, otherLecturer)).status);
  });

  it("J2.4 reasoning and reflection are saved; a retry is a new attempt and history is kept", async () => {
    const review = await call("GET", `/branching-attempts/${attemptId}`, student);
    const nodeId = review.body.steps[0].nodeId;
    const reasoning = await call("PUT", `/branching-attempts/${attemptId}/reasoning`, student, {
      nodeId,
      reasoningText: "Chose to act quickly because the deadline was close.",
    });
    expect([200, 201]).toContain(reasoning.status);

    const reflection = await call("POST", `/branching-attempts/${attemptId}/reflection`, student, {
      reflectionText: "Next time I would hear both sides before deciding.",
    });
    expect([200, 201]).toContain(reflection.status);

    const reread = await call("GET", `/branching-attempts/${attemptId}`, student);
    expect(reread.body.reflectionStatus).toBe("SUBMITTED");
    expect(reread.body.steps.find((s: any) => s.nodeId === nodeId).reasoningText).toContain("deadline");

    const retry = await call("POST", `/cases/${caseId}/branching-attempts`, student);
    expect([200, 201]).toContain(retry.status);
    expect(retry.body.id).not.toBe(attemptId);
    expect(retry.body.attemptNumber).toBe(2);

    const history = await call("GET", `/cases/${caseId}/attempts`, student);
    expect(history.status).toBe(200);
    expect(history.body.length).toBe(2);
  });

  it("J1.5 unpublish hides the case from students again", async () => {
    // case.service ALLOWED_TRANSITIONS: PUBLISHED → DRAFT is allowed; DRAFT → PUBLISHED is not.
    expect((await call("PATCH", `/cases/${caseId}/status`, lecturer, { status: "DRAFT" })).status).toBe(200);
    expect([403, 404]).toContain((await call("GET", `/cases/${caseId}`, student)).status);
    expect((await call("PATCH", `/cases/${caseId}/status`, lecturer, { status: "PUBLISHED" })).status).toBe(400);
  });
});
