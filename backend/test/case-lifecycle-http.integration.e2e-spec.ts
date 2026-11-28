import request from "supertest";
import { Pool } from "pg";
import { randomUUID } from "crypto";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import { MigrationRunner } from "../src/common/database/migration-runner";
import { DatabaseService } from "../src/common/database/database.service";
import { AuditService } from "../src/common/audit/audit.service";
import { AiClientService } from "../src/common/ai-client/ai-client.service";
import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { CaseController } from "../src/modules/case/case.controller";
import { CaseService } from "../src/modules/case/case.service";
import { CourseController } from "../src/modules/course/course.controller";
import { CourseService } from "../src/modules/course/course.service";
import { BranchingAttemptController } from "../src/modules/branching-attempt/branching-attempt.controller";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";

/**
 * QA-009 (EBA-48) case lifecycle state machine, QA-010 (EBA-49) student access to unpublished cases,
 * plus the HTTP parts of QA-007 (EBA-46, generation never persists a broken or non-DRAFT case) and
 * QA-008 (EBA-47, the node API refuses an invalid topology and leaves the graph unchanged).
 *
 * Real HTTP: supertest → global JwtAuthGuard + RolesGuard (real JwtStrategy and AuthService, tokens
 * signed with JwtService) → ValidationPipe → real controllers → real services → real SQL on PostgreSQL 16.
 * The real AiClientService is used too; only its outgoing HTTP call to the AI service (`fetch`) is stubbed, so the
 * status a lecturer gets when the AI service fails is the real one.
 * Uses its own throwaway database `edubranch_case_lifecycle_it`; CREATE/DROP go through the `postgres`
 * maintenance database, so this suite never connects to the dev database `edubranch_ai`.
 */
describe("Case lifecycle + student access gate — real HTTP on PostgreSQL (QA-007..QA-010)", () => {
  const base = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
    connectionTimeoutMillis: 2000,
  };
  const DB_NAME = "edubranch_case_lifecycle_it";
  const SECRET = "case-lifecycle-it-jwt-secret-at-least-32-characters";

  let pool: Pool | undefined;
  let app: INestApplication | undefined;
  let reachable = false;
  const realFetch = global.fetch;
  const fetchStub = jest.fn();
  const aiCalls = () => fetchStub.mock.calls.filter(([url]) => String(url).endsWith("/internal/v1/generation/generate-case")).length;
  const aiReturns = (body: unknown) =>
    fetchStub.mockImplementation(async () => ({ ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) }));
  const AI_TIMEOUT_MS = 300;
  const jwt = new JwtService({ secret: SECRET });

  const u = {
    lectA: randomUUID(),
    lectB: randomUUID(),
    stu: randomUUID(),
    admin: randomUUID(),
    stuOut: randomUUID(),
  };
  const courseA = randomUUID();
  const auth: Record<keyof typeof u, string> = { lectA: "", lectB: "", stu: "", admin: "", stuOut: "" };

  const q = (t: string, p: unknown[] = []) => pool!.query(t, p);
  const http = () => request(app!.getHttpServer());
  const statusOf = async (caseId: string) => (await q(`SELECT status FROM cases WHERE id = $1`, [caseId])).rows[0]?.status;
  const optionsOf = async (caseId: string) =>
    (
      await q(
        `SELECT o.id, o.node_id, o.option_text, o.consequence, o.next_node_id
         FROM case_options o JOIN case_nodes n ON n.id = o.node_id
         WHERE n.case_id = $1 ORDER BY o.id`,
        [caseId],
      )
    ).rows;

  /**
   * A Branching Study case: root -(2 options)-> mid, end; mid -(2 options)-> end.
   * Every text carries a marker so a response can be searched for leaked content.
   */
  async function seedCase(status: string, marker = `SECRET-${status}-${randomUUID().slice(0, 8)}`) {
    const caseId = randomUUID();
    const n = { root: randomUUID(), mid: randomUUID(), end: randomUUID() };
    const o = { rootToMid: randomUUID(), rootToEnd: randomUUID(), midToEnd1: randomUUID(), midToEnd2: randomUUID() };
    await q(
      `INSERT INTO cases (id, title, description, course_id, created_by, status, learning_mode)
       VALUES ($1, $2, $3, $4, $5, $6, 'BRANCHING_STUDY')`,
      [caseId, `${marker} title`, `${marker} description`, courseA, u.lectA, status],
    );
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
         ($1, $4, $5, FALSE, 0), ($2, $4, $6, FALSE, 1), ($3, $4, $7, TRUE, 2)`,
      [n.root, n.mid, n.end, caseId, `${marker} root situation`, `${marker} mid situation`, `${marker} ending`],
    );
    await q(
      `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
         ($1, $5, $8, $9, $6), ($2, $5, $8, $9, $7), ($3, $6, $8, $9, $7), ($4, $6, $8, $9, $7)`,
      [o.rootToMid, o.rootToEnd, o.midToEnd1, o.midToEnd2, n.root, n.mid, n.end, `${marker} option`, `${marker} consequence`],
    );
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [n.root, caseId]);
    return { caseId, marker, n, o };
  }

  beforeAll(async () => {
    const admin0 = new Pool({ ...base, database: "postgres" });
    try {
      await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      await admin0.query(`CREATE DATABASE ${DB_NAME}`);
      pool = new Pool({ ...base, database: DB_NAME, max: 10 });
      await new MigrationRunner(pool).run();
      reachable = true;
    } catch (err: any) {
      console.warn(`[case-lifecycle integration] PostgreSQL not available (${err.message}); skipping.`);
      return;
    } finally {
      await admin0.end().catch(() => undefined);
    }

    const db = { query: (t: string, p?: any[]) => pool!.query(t, p), getClient: () => pool!.connect() };
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [CaseController, CourseController, BranchingAttemptController],
      providers: [
        JwtStrategy,
        AuthService,
        AuditService,
        CaseService,
        CourseService,
        BranchingAttemptService,
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: { get: (k: string, d?: any) => (k === "JWT_SECRET" ? SECRET : k === "AI_SERVICE_TIMEOUT_MS" ? AI_TIMEOUT_MS : d) },
        },
        { provide: DatabaseService, useValue: db },
        AiClientService,
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
    await app.init();

    const people: Array<[keyof typeof u, string]> = [
      ["lectA", "LECTURER"],
      ["lectB", "LECTURER"],
      ["stu", "STUDENT"],
      ["admin", "ADMIN"],
      ["stuOut", "STUDENT"],
    ];
    for (const [key, role] of people) {
      await q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1, $2, 'h', $3, $4)`, [
        u[key],
        `${key}@uni.edu.vn`,
        key,
        role,
      ]);
      auth[key] = `Bearer ${jwt.sign({ sub: u[key], email: `${key}@uni.edu.vn`, role })}`;
    }
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1, 'Course A', 'd', 'CRS-A', $2, 'LIFECYC1', TRUE, TRUE)`,
      [courseA, u.lectA],
    );
    await q(`INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2)`, [courseA, u.stu]);
  }, 60000);

  afterAll(async () => {
    global.fetch = realFetch;
    await app?.close().catch(() => undefined);
    if (pool) await pool.end().catch(() => undefined);
    if (reachable) {
      const admin0 = new Pool({ ...base, database: "postgres" });
      try {
        await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      } finally {
        await admin0.end().catch(() => undefined);
      }
    }
  });

  beforeEach(() => {
    fetchStub.mockReset();
    global.fetch = fetchStub as any;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!reachable) return console.warn(`[case-lifecycle integration] skipped: ${name}`);
      await fn();
    });

  // ---------------------------------------------------------------- QA-010
  describe("QA-010: a student reaches only PUBLISHED cases, over real HTTP", () => {
    for (const status of ["DRAFT", "REVIEWED", "APPROVED"]) {
      itDb(`${status}: GET /cases/:id and starting an attempt are 403, and nothing of the case leaks`, async () => {
        const c = await seedCase(status);
        const view = await http().get(`/api/v1/cases/${c.caseId}`).set("Authorization", auth.stu);
        expect(view.status).toBe(403);
        expect(JSON.stringify(view.body)).not.toContain(c.marker);

        const start = await http().post(`/api/v1/cases/${c.caseId}/branching-attempts`).set("Authorization", auth.stu);
        expect(start.status).toBe(403);
        expect(JSON.stringify(start.body)).not.toContain(c.marker);
        const attempts = await q(`SELECT COUNT(*)::int AS n FROM branching_attempts WHERE case_id = $1`, [c.caseId]);
        expect(attempts.rows[0].n).toBe(0);

        const mine = await http().get(`/api/v1/cases/${c.caseId}/attempts`).set("Authorization", auth.stu);
        expect(mine.status).toBe(200);
        expect(mine.body.data).toEqual([]);
        expect(JSON.stringify(mine.body)).not.toContain(c.marker);
        expect(await statusOf(c.caseId)).toBe(status);
      });
    }

    itDb("PUBLISHED: 200 with the student projection only (no nodes, options or consequences); an attempt starts", async () => {
      const c = await seedCase("PUBLISHED");
      const view = await http().get(`/api/v1/cases/${c.caseId}`).set("Authorization", auth.stu);
      expect(view.status).toBe(200);
      expect(view.body.data).toMatchObject({ id: c.caseId, status: "PUBLISHED" });
      expect(view.body.data.nodes).toBeUndefined();
      expect(view.body.data.all_options).toBeUndefined();
      const text = JSON.stringify(view.body);
      for (const hidden of ["root situation", "mid situation", "option", "consequence", "ending"]) {
        expect(text).not.toContain(`${c.marker} ${hidden}`);
      }
      const start = await http().post(`/api/v1/cases/${c.caseId}/branching-attempts`).set("Authorization", auth.stu);
      expect(start.status).toBe(201);
    });

    itDb("a student who did not join the course: a direct link to a PUBLISHED case works, a DRAFT one is 403", async () => {
      const pub = await seedCase("PUBLISHED");
      const draft = await seedCase("DRAFT");
      expect((await http().get(`/api/v1/cases/${pub.caseId}`).set("Authorization", auth.stuOut)).status).toBe(200);
      const denied = await http().get(`/api/v1/cases/${draft.caseId}`).set("Authorization", auth.stuOut);
      expect(denied.status).toBe(403);
      expect(JSON.stringify(denied.body)).not.toContain(draft.marker);
    });

    itDb("the course case list shows the student PUBLISHED cases only", async () => {
      const shown = await seedCase("PUBLISHED");
      const hidden = await seedCase("APPROVED");
      const list = await http().get(`/api/v1/courses/${courseA}/cases`).set("Authorization", auth.stu);
      expect(list.status).toBe(200);
      const ids = (list.body.data as Array<{ id: string; status: string }>).map((x) => x.id);
      expect(ids).toContain(shown.caseId);
      expect(ids).not.toContain(hidden.caseId);
      expect((list.body.data as Array<{ status: string }>).every((x) => x.status === "PUBLISHED")).toBe(true);
      expect(JSON.stringify(list.body)).not.toContain(hidden.marker);
    });

    itDb("changing the id in the URL does not pass the gate: unknown id 404, malformed id 400, no token 401", async () => {
      const unknown = await http().get(`/api/v1/cases/${randomUUID()}`).set("Authorization", auth.stu);
      expect(unknown.status).toBe(404);
      const malformed = await http().get(`/api/v1/cases/not-a-uuid`).set("Authorization", auth.stu);
      expect(malformed.status).toBe(400);
      const c = await seedCase("DRAFT");
      const anonymous = await http().get(`/api/v1/cases/${c.caseId}`);
      expect(anonymous.status).toBe(401);
      expect(JSON.stringify(anonymous.body)).not.toContain(c.marker);
    });

    itDb("access follows the backend status: APPROVED is 403, after a valid publish over HTTP it is 200", async () => {
      const c = await seedCase("APPROVED");
      expect((await http().get(`/api/v1/cases/${c.caseId}`).set("Authorization", auth.stu)).status).toBe(403);
      const publish = await http()
        .patch(`/api/v1/cases/${c.caseId}/status`)
        .set("Authorization", auth.lectA)
        .send({ status: "PUBLISHED" });
      expect(publish.status).toBe(200);
      expect((await http().get(`/api/v1/cases/${c.caseId}`).set("Authorization", auth.stu)).status).toBe(200);
    });
  });

  // ---------------------------------------------------------------- QA-009
  describe("QA-009: lifecycle transitions over real HTTP", () => {
    const patch = (caseId: string, who: string, status: unknown) =>
      http().patch(`/api/v1/cases/${caseId}/status`).set("Authorization", who).send({ status });

    itDb("happy path DRAFT → REVIEWED → APPROVED → PUBLISHED: 200 each, persisted, one audit row per change", async () => {
      const c = await seedCase("DRAFT");
      for (const next of ["REVIEWED", "APPROVED", "PUBLISHED"]) {
        const res = await patch(c.caseId, auth.lectA, next);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: "SUCCESS", data: { id: c.caseId, status: next } });
        expect(await statusOf(c.caseId)).toBe(next);
      }
      const audit = await q(
        `SELECT meta->>'from' AS f, meta->>'to' AS t FROM audit_events
         WHERE event_type = 'CASE_STATUS_CHANGED' AND target_id = $1 ORDER BY created_at`,
        [c.caseId],
      );
      expect(audit.rows).toEqual([
        { f: "DRAFT", t: "REVIEWED" },
        { f: "REVIEWED", t: "APPROVED" },
        { f: "APPROVED", t: "PUBLISHED" },
      ]);
    });

    const skips: Array<[string, string]> = [
      ["DRAFT", "APPROVED"],
      ["DRAFT", "PUBLISHED"],
      ["REVIEWED", "PUBLISHED"],
      ["APPROVED", "REVIEWED"],
      ["PUBLISHED", "REVIEWED"],
      ["PUBLISHED", "APPROVED"],
    ];
    for (const [from, to] of skips) {
      itDb(`refuses ${from} → ${to} with 400 and leaves the status and audit log unchanged`, async () => {
        const c = await seedCase(from);
        const res = await patch(c.caseId, auth.lectA, to);
        expect(res.status).toBe(400);
        expect(res.body.message).toContain(`from ${from} to ${to}`);
        expect(await statusOf(c.caseId)).toBe(from);
        const audit = await q(`SELECT COUNT(*)::int AS n FROM audit_events WHERE target_id = $1`, [c.caseId]);
        expect(audit.rows[0].n).toBe(0);
      });
    }

    for (const from of ["REVIEWED", "APPROVED"]) {
      itDb(`allows the revert ${from} → DRAFT (200), persisted and audited`, async () => {
        const c = await seedCase(from);
        const res = await patch(c.caseId, auth.lectA, "DRAFT");
        expect(res.status).toBe(200);
        expect(await statusOf(c.caseId)).toBe("DRAFT");
        const audit = await q(`SELECT meta->>'from' AS f, meta->>'to' AS t FROM audit_events WHERE target_id = $1`, [c.caseId]);
        expect(audit.rows).toEqual([{ f: from, t: "DRAFT" }]);
      });
    }

    itDb("a request for the current status is a no-op: 200, unchanged, no audit row", async () => {
      for (const status of ["DRAFT", "REVIEWED", "APPROVED", "PUBLISHED"]) {
        const c = await seedCase(status);
        const res = await patch(c.caseId, auth.lectA, status);
        expect(res.status).toBe(200);
        expect(await statusOf(c.caseId)).toBe(status);
        const audit = await q(`SELECT COUNT(*)::int AS n FROM audit_events WHERE target_id = $1`, [c.caseId]);
        expect(audit.rows[0].n).toBe(0);
      }
    });

    itDb("refuses an unknown status value (400) before any service code runs", async () => {
      const c = await seedCase("DRAFT");
      for (const bad of ["ARCHIVED", "published", "", null, 1]) {
        expect((await patch(c.caseId, auth.lectA, bad)).status).toBe(400);
      }
      expect(await statusOf(c.caseId)).toBe("DRAFT");
    });

    itDb("a lecturer who does not own the course gets 403; the status is unchanged", async () => {
      const c = await seedCase("DRAFT");
      const res = await patch(c.caseId, auth.lectB, "REVIEWED");
      expect(res.status).toBe(403);
      expect(JSON.stringify(res.body)).not.toContain(c.marker);
      expect(await statusOf(c.caseId)).toBe("DRAFT");
    });

    itDb("a student and an admin cannot run lecturer lifecycle actions (403); the status is unchanged", async () => {
      const c = await seedCase("APPROVED");
      expect((await patch(c.caseId, auth.stu, "PUBLISHED")).status).toBe(403);
      expect((await patch(c.caseId, auth.admin, "PUBLISHED")).status).toBe(403);
      expect((await patch(c.caseId, "Bearer not-a-token", "PUBLISHED")).status).toBe(401);
      expect(await statusOf(c.caseId)).toBe("APPROVED");
    });

    itDb("an unknown case id is 404", async () => {
      expect((await patch(randomUUID(), auth.lectA, "REVIEWED")).status).toBe(404);
    });

    itDb("saving a node keeps the case status (DRAFT stays DRAFT, REVIEWED stays REVIEWED)", async () => {
      for (const status of ["DRAFT", "REVIEWED"]) {
        const c = await seedCase(status);
        const res = await http()
          .put(`/api/v1/cases/${c.caseId}/nodes/${c.n.mid}`)
          .set("Authorization", auth.lectA)
          .send({
            situation: "Edited mid situation",
            options: [
              { id: c.o.midToEnd1, text: "Edited A", consequence: "Edited consequence A", nextNodeId: c.n.end },
              { id: c.o.midToEnd2, text: "Edited B", consequence: "Edited consequence B", nextNodeId: c.n.end },
            ],
          });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe(status);
        expect(await statusOf(c.caseId)).toBe(status);
      }
    });

    itDb("an APPROVED or PUBLISHED case cannot be edited through the node API (403); nothing changes", async () => {
      for (const status of ["APPROVED", "PUBLISHED"]) {
        const c = await seedCase(status);
        const before = await optionsOf(c.caseId);
        const res = await http()
          .put(`/api/v1/cases/${c.caseId}/nodes/${c.n.mid}`)
          .set("Authorization", auth.lectA)
          .send({ situation: "Changed", options: [] });
        expect(res.status).toBe(403);
        expect(await optionsOf(c.caseId)).toEqual(before);
        expect(await statusOf(c.caseId)).toBe(status);
      }
    });
  });

  // ---------------------------------------------------------------- QA-008 (HTTP part)
  describe("QA-008: the node API refuses an invalid topology before persisting it", () => {
    const putNode = (caseId: string, nodeId: string, options: unknown[]) =>
      http()
        .put(`/api/v1/cases/${caseId}/nodes/${nodeId}`)
        .set("Authorization", auth.lectA)
        .send({ situation: "Attempted change", options });

    itDb("a cycle (mid → root) is refused with 400 and the graph is unchanged", async () => {
      const c = await seedCase("DRAFT");
      const before = await optionsOf(c.caseId);
      const res = await putNode(c.caseId, c.n.mid, [
        { id: c.o.midToEnd1, text: "Back", consequence: "Loop", nextNodeId: c.n.root },
        { id: c.o.midToEnd2, text: "On", consequence: "End", nextNodeId: c.n.end },
      ]);
      expect(res.status).toBe(400);
      expect(await optionsOf(c.caseId)).toEqual(before);
    });

    itDb("an option to a node that does not exist, or to a node of another case, is refused; graph unchanged", async () => {
      const c = await seedCase("DRAFT");
      const other = await seedCase("DRAFT");
      const before = await optionsOf(c.caseId);
      for (const target of [randomUUID(), other.n.end]) {
        const res = await putNode(c.caseId, c.n.mid, [
          { id: c.o.midToEnd1, text: "Away", consequence: "Nowhere", nextNodeId: target },
          { id: c.o.midToEnd2, text: "On", consequence: "End", nextNodeId: c.n.end },
        ]);
        expect(res.status).toBe(400);
      }
      expect(await optionsOf(c.caseId)).toEqual(before);
    });

    itDb("cutting the only path to a node (mid becomes unreachable) is refused; graph unchanged", async () => {
      const c = await seedCase("DRAFT");
      const before = await optionsOf(c.caseId);
      const res = await putNode(c.caseId, c.n.root, [
        { id: c.o.rootToMid, text: "End now", consequence: "Done", nextNodeId: c.n.end },
        { id: c.o.rootToEnd, text: "End too", consequence: "Done", nextNodeId: c.n.end },
      ]);
      expect(res.status).toBe(400);
      expect(await optionsOf(c.caseId)).toEqual(before);
    });

    itDb("a decision node with a single option is refused by the topology check (400); graph unchanged", async () => {
      const c = await seedCase("DRAFT");
      const before = await optionsOf(c.caseId);
      const res = await putNode(c.caseId, c.n.mid, [{ id: c.o.midToEnd1, text: "Only", consequence: "One", nextNodeId: c.n.end }]);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("between 2 and 4 options");
      expect(await optionsOf(c.caseId)).toEqual(before);
    });

    itDb("more than 4 options is refused by validation (400); graph unchanged", async () => {
      const c = await seedCase("DRAFT");
      const before = await optionsOf(c.caseId);
      const five = Array.from({ length: 5 }, (_, i) => ({ text: `O${i}`, consequence: `C${i}`, nextNodeId: c.n.end }));
      expect((await putNode(c.caseId, c.n.mid, five)).status).toBe(400);
      expect(await optionsOf(c.caseId)).toEqual(before);
    });

    itDb("a valid change with several branches and endings is accepted and persisted", async () => {
      const c = await seedCase("DRAFT");
      const res = await putNode(c.caseId, c.n.root, [
        { id: c.o.rootToMid, text: "Go mid", consequence: "Mid", nextNodeId: c.n.mid },
        { id: c.o.rootToEnd, text: "Go end", consequence: "End", nextNodeId: c.n.end },
        { text: "Also mid", consequence: "Mid again", nextNodeId: c.n.mid },
      ]);
      expect(res.status).toBe(200);
      const rootOptions = (await optionsOf(c.caseId)).filter((o: any) => o.node_id === c.n.root);
      expect(rootOptions).toHaveLength(3);
    });

    itDb("EBA-117: an option with nextNodeId = null is accepted over HTTP and persisted as a terminal branch", async () => {
      const c = await seedCase("DRAFT");
      const res = await putNode(c.caseId, c.n.mid, [
        { id: c.o.midToEnd1, text: "Go end", consequence: "End", nextNodeId: c.n.end },
        { id: c.o.midToEnd2, text: "End directly", consequence: "Direct end", nextNodeId: null },
      ]);
      expect(res.status).toBe(200);
      const midOptions = (await optionsOf(c.caseId)).filter((o: any) => o.node_id === c.n.mid);
      expect(midOptions.some((o: any) => o.next_node_id === null)).toBe(true);
    });
  });

  // ---------------------------------------------------------------- QA-007 (gateway part)
  describe("QA-007: case generation never persists a broken case or a non-DRAFT case", () => {
    const generate = () =>
      http()
        .post(`/api/v1/cases/generate`)
        .set("Authorization", auth.lectA)
        .send({ courseId: courseA, materialIds: [randomUUID()], idempotencyKey: randomUUID() });
    const caseCount = async () => (await q(`SELECT COUNT(*)::int AS n FROM cases WHERE course_id = $1`, [courseA])).rows[0].n;

    // Root is index 0, so its options point forward: before the fix this failed with a 500
    // (case_options.next_node_id FK) and no AI-generated tree with a forward link could be stored.
    itDb("a valid AI tree is stored as DRAFT, even if the AI payload claims another status", async () => {
      aiReturns({
        title: "Generated",
        description: "d",
        status: "PUBLISHED",
        root_node_index: 0,
        nodes: [
          {
            situation: "Start",
            options: [
              { text: "A", consequence: "ca", next_node_index: 1 },
              { text: "B", consequence: "cb", next_node_index: 1 },
            ],
          },
          { situation: "End", options: [] },
        ],
      });
      const res = await generate();
      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe("DRAFT");
      expect(await statusOf(res.body.data.id)).toBe("DRAFT");
      // Both options of the root point to the stored ending node.
      const links = await q(
        `SELECT n.node_index AS from_index, t.node_index AS to_index FROM case_options o
         JOIN case_nodes n ON n.id = o.node_id JOIN case_nodes t ON t.id = o.next_node_id
         WHERE n.case_id = $1`,
        [res.body.data.id],
      );
      expect(links.rows).toEqual([
        { from_index: 0, to_index: 1 },
        { from_index: 0, to_index: 1 },
      ]);
      expect(aiCalls()).toBe(1);
    });

    itDb("an AI service error (503) gives the lecturer 502 without the AI detail, stores no case, one call", async () => {
      const before = await caseCount();
      fetchStub.mockImplementation(async () => ({ ok: false, status: 503, text: async () => "provider overloaded: secret detail" }));
      const res = await generate();
      expect(res.status).toBe(502);
      expect(JSON.stringify(res.body)).not.toContain("secret detail");
      expect(await caseCount()).toBe(before);
      expect(aiCalls()).toBe(1);
    });

    itDb("an AI service that does not answer in time gives 504 and stores no case", async () => {
      const before = await caseCount();
      fetchStub.mockImplementation(
        (_url: string, init: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) =>
            init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" }))),
          ),
      );
      const res = await generate();
      expect(res.status).toBe(504);
      expect(await caseCount()).toBe(before);
    });

    itDb("an unreachable AI service gives 502 and stores no case", async () => {
      const before = await caseCount();
      fetchStub.mockRejectedValue(new TypeError("fetch failed"));
      expect((await generate()).status).toBe(502);
      expect(await caseCount()).toBe(before);
    });

    itDb("an AI tree with an invalid root, option index, cycle, or unreachable node is refused (502) and nothing is stored", async () => {
      for (const bad of [
        { root_node_index: 5, nodes: [{ situation: "Only", options: [] }] },
        {
          root_node_index: 0,
          nodes: [
            { situation: "Start", options: [{ text: "A", consequence: "c", next_node_index: 9 }] },
            { situation: "End", options: [] },
          ],
        },
        {
          root_node_index: 0,
          nodes: [
            { situation: "Start", options: [{ text: "A", consequence: "c", next_node_index: 1 }, { text: "B", consequence: "d", next_node_index: null }] },
            { situation: "Loop", options: [{ text: "Back", consequence: "l", next_node_index: 0 }] },
          ],
        },
        {
          root_node_index: 0,
          nodes: [
            { situation: "Start", options: [{ text: "A", consequence: "c", next_node_index: 1 }] },
            { situation: "End", options: [] },
            { situation: "Orphan", options: [] },
          ],
        },
      ]) {
        const before = await caseCount();
        aiReturns({ title: "Broken", description: "d", ...bad });
        const res = await generate();
        expect(res.status).toBe(502);
        expect(await caseCount()).toBe(before);
        const nodes = await q(`SELECT COUNT(*)::int AS n FROM case_nodes n JOIN cases c ON c.id = n.case_id WHERE c.title = 'Broken'`);
        expect(nodes.rows[0].n).toBe(0);
      }
    });

    itDb("null-target leaf options allow generating and publishing a case without empty-option nodes (EBA-117)", async () => {
      aiReturns({
        title: "Null-Edge Terminal Case",
        description: "Ends via next_node_index: null",
        root_node_index: 0,
        nodes: [
          {
            situation: "Initial choice",
            options: [
              { text: "End immediately A", consequence: "Done A", next_node_index: null },
              { text: "End immediately B", consequence: "Done B", next_node_index: null },
            ],
          },
        ],
      });
      const gen = await generate();
      expect(gen.status).toBe(201);
      const caseId = gen.body.data.id;
      expect((await http().patch(`/api/v1/cases/${caseId}/status`).set("Authorization", auth.lectA).send({ status: "REVIEWED" })).status).toBe(200);
      expect((await http().patch(`/api/v1/cases/${caseId}/status`).set("Authorization", auth.lectA).send({ status: "APPROVED" })).status).toBe(200);
      const pub = await http().patch(`/api/v1/cases/${caseId}/status`).set("Authorization", auth.lectA).send({ status: "PUBLISHED" });
      expect(pub.status).toBe(200);
      expect(pub.body.data.status).toBe("PUBLISHED");
    });

    itDb("a student or a non-owner lecturer cannot generate (403); the AI service is not called", async () => {
      const send = (who: string) =>
        http().post(`/api/v1/cases/generate`).set("Authorization", who).send({ courseId: courseA, materialIds: [randomUUID()] });
      // Student: refused by the role guard. Other lecturer: the course is not theirs and is reported as not found.
      expect((await send(auth.stu)).status).toBe(403);
      expect((await send(auth.lectB)).status).toBe(404);
      expect(aiCalls()).toBe(0);
    });
  });
});
