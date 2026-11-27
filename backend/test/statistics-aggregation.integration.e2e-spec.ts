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
import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { StatisticsController } from "../src/modules/statistics/statistics.controller";
import { StatisticsService } from "../src/modules/statistics/statistics.service";

/**
 * BE-028 (Jira EBA-75) AC: aggregation checked on a defined sample dataset on real PostgreSQL 16 —
 * completion rate, option frequency per decision point, attempts per student, terminal outcomes,
 * no double counting from JOINs, course scope and authorization, empty data without errors.
 * Real HTTP: supertest → global JwtAuthGuard + RolesGuard (real JwtStrategy/AuthService) → ValidationPipe →
 * StatisticsController → StatisticsService → SQL. Own throwaway database `edubranch_statistics_it`, created and
 * dropped through the `postgres` maintenance database (never the dev database `edubranch_ai`).
 */
describe("BE-028 statistics aggregation — real HTTP on PostgreSQL", () => {
  const base = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
    connectionTimeoutMillis: 2000,
  };
  const DB_NAME = "edubranch_statistics_it";
  const SECRET = "statistics-it-jwt-secret-at-least-32-characters";
  const jwt = new JwtService({ secret: SECRET });

  let pool: Pool | undefined;
  let app: INestApplication | undefined;
  let reachable = false;

  const u = { lect: randomUUID(), lectB: randomUUID(), s1: randomUUID(), s2: randomUUID(), s3: randomUUID(), admin: randomUUID() };
  const auth: Record<keyof typeof u, string> = { lect: "", lectB: "", s1: "", s2: "", s3: "", admin: "" };
  const course = randomUUID();
  const q = (t: string, p: unknown[] = []) => pool!.query(t, p);
  const http = () => request(app!.getHttpServer());
  const stats = (caseId: string, who: string) => http().get(`/api/v1/cases/${caseId}/statistics`).set("Authorization", who);

  /** root -(A)-> mid, root -(B)-> endB; mid -(C)-> endC, mid -(D)-> endD. */
  async function tree(courseId = course, owner = u.lect, status = "PUBLISHED") {
    const id = randomUUID();
    const n = { root: randomUUID(), mid: randomUUID(), endB: randomUUID(), endC: randomUUID(), endD: randomUUID() };
    const o = { a: randomUUID(), b: randomUUID(), c: randomUUID(), d: randomUUID() };
    await q(
      `INSERT INTO cases (id, title, description, course_id, created_by, status, learning_mode)
       VALUES ($1,'Stats case','d',$2,$3,$4,'BRANCHING_STUDY')`,
      [id, courseId, owner, status],
    );
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
       ($1,$6,'Root',FALSE,0), ($2,$6,'Mid',FALSE,1), ($3,$6,'End B',TRUE,2), ($4,$6,'End C',TRUE,3), ($5,$6,'End D',TRUE,4)`,
      [n.root, n.mid, n.endB, n.endC, n.endD, id],
    );
    await q(
      `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
       ($1,$5,'A','ca',$6), ($2,$5,'B','cb',$7), ($3,$6,'C','cc',$8), ($4,$6,'D','cd',$9)`,
      [o.a, o.b, o.c, o.d, n.root, n.mid, n.endB, n.endC, n.endD],
    );
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [n.root, id]);
    return { id, n, o };
  }

  /** An attempt with its stored path; terminal = outcome node when completed. */
  async function attempt(
    caseId: string,
    student: string,
    number: number,
    path: Array<[string, string]>,
    outcome: string | null,
    reflected = false,
    currentNode?: string,
  ) {
    const id = randomUUID();
    await q(
      `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, current_node_id, outcome_node_id, is_completed,
                                       completed_at, reflection_status, reflection_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        student,
        caseId,
        number,
        outcome ?? currentNode ?? path[path.length - 1][0],
        outcome,
        outcome !== null,
        outcome !== null ? new Date() : null,
        reflected ? "SUBMITTED" : "NOT_STARTED",
        reflected ? "reflection" : null,
      ],
    );
    const reasoningIds: string[] = [];
    for (const [i, [node, option]] of path.entries()) {
      const rid = randomUUID();
      reasoningIds.push(rid);
      await q(
        `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text, submitted_at)
         VALUES ($1,$2,$3,$4,$5, NOW() + ($6 || ' seconds')::interval)`,
        [rid, id, node, option, outcome !== null ? `why ${i}` : null, String(i)],
      );
    }
    return { id, reasoningIds };
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
      console.warn(`[statistics integration] PostgreSQL not available (${err.message}); skipping.`);
      return;
    } finally {
      await admin0.end().catch(() => undefined);
    }
    const db = { query: (t: string, p?: any[]) => pool!.query(t, p), getClient: () => pool!.connect() };
    const moduleRef = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [StatisticsController],
      providers: [
        JwtStrategy,
        AuthService,
        StatisticsService,
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => (k === "JWT_SECRET" ? SECRET : d) } },
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
    await app.init();

    const people: Array<[keyof typeof u, string]> = [
      ["lect", "LECTURER"],
      ["lectB", "LECTURER"],
      ["s1", "STUDENT"],
      ["s2", "STUDENT"],
      ["s3", "STUDENT"],
      ["admin", "ADMIN"],
    ];
    for (const [key, role] of people) {
      await q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'h',$3,$4)`, [u[key], `${key}@uni.edu.vn`, key, role]);
      auth[key] = `Bearer ${jwt.sign({ sub: u[key], email: `${key}@uni.edu.vn`, role })}`;
    }
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1,'Course','d','CRS-ST',$2,'STATSCOD',TRUE,TRUE)`,
      [course, u.lect],
    );
  }, 60000);

  afterAll(async () => {
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

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!reachable) return console.warn(`[statistics integration] skipped: ${name}`);
      await fn();
    });

  itDb("sample dataset: every aggregate equals the hand-computed value, with rows that could double count through JOINs", async () => {
    const c = await tree();
    // s1: #1 A→C (completed, reflected), #2 B (completed); s2: #1 A→D (completed); s3: #1 A (still at mid).
    const s1a1 = await attempt(c.id, u.s1, 1, [[c.n.root, c.o.a], [c.n.mid, c.o.c]], c.n.endC, true);
    await attempt(c.id, u.s1, 2, [[c.n.root, c.o.b]], c.n.endB);
    const s2a1 = await attempt(c.id, u.s2, 1, [[c.n.root, c.o.a], [c.n.mid, c.o.d]], c.n.endD);
    await attempt(c.id, u.s3, 1, [[c.n.root, c.o.a]], null, false, c.n.mid);
    // Regression guard: the service does not join these tables today. Several rows per attempt/reasoning make any
    // future un-aggregated JOIN on feedback, Challenge Support sessions or messages visible as inflated counts.
    // The DB has no unique key on lecturer_feedback per attempt (one-per-target is enforced in the service), so two
    // rows on the same attempt are possible in data and must not double that attempt.
    await q(`INSERT INTO lecturer_feedback (lecturer_id, branching_attempt_id, feedback_text) VALUES ($1,$3,'Good'), ($2,$3,'Also good'), ($1,$4,'Fine')`, [
      u.lect,
      u.lectB,
      s1a1.id,
      s2a1.id,
    ]);
    for (const rid of [...s1a1.reasoningIds, ...s2a1.reasoningIds]) {
      const sid = randomUUID();
      await q(`INSERT INTO challenge_support_sessions (id, reasoning_id, current_round, is_completed) VALUES ($1,$2,2,TRUE)`, [sid, rid]);
      await q(
        `INSERT INTO challenge_messages (session_id, round_number, role, content) VALUES
         ($1,1,'CHALLENGE_SUPPORT','q1'), ($1,1,'STUDENT','a1'), ($1,2,'CHALLENGE_SUPPORT','q2')`,
        [sid],
      );
    }
    // Another case in the same course: covers the case filter of the attempt-level counts (option and outcome rows
    // are keyed by this case's own node/option ids).
    const other = await tree();
    await attempt(other.id, u.s2, 1, [[other.n.root, other.o.b]], other.n.endB);

    const res = await stats(c.id, auth.lect);
    expect(res.status).toBe(200);
    const b = res.body.data.branching;
    expect(res.body.data).toMatchObject({ caseId: c.id, learningMode: "BRANCHING_STUDY", reviewStudy: null });
    expect(b).toMatchObject({
      totalAttempts: 4,
      completedAttempts: 3,
      completionRate: 75,
      participants: 3,
      singleAttemptStudents: 2,
      retryStudents: 1,
      flowStatus: { inProgress: 1, completed: 2, reflected: 1 },
    });
    // Attempt numbers are sequential and immutable, so MAX(attempt_number) and COUNT(*) agree here (MAX is not pinned).
    const perStudent = Object.fromEntries(b.attemptsPerStudent.map((x: { attempts: number; students: number }) => [x.attempts, x.students]));
    expect(perStudent).toEqual({ 1: 2, 2: 1 });

    const point = (nodeId: string) => b.decisionPoints.find((d: { nodeId: string }) => d.nodeId === nodeId);
    const counts = (nodeId: string) =>
      Object.fromEntries(point(nodeId).options.map((o: { optionId: string; count: number; percentage: number }) => [o.optionId, [o.count, o.percentage]]));
    expect(point(c.n.root).totalSelections).toBe(4);
    expect(counts(c.n.root)).toEqual({ [c.o.a]: [3, 75], [c.o.b]: [1, 25] });
    expect(point(c.n.mid).totalSelections).toBe(2);
    expect(counts(c.n.mid)).toEqual({ [c.o.c]: [1, 50], [c.o.d]: [1, 50] });
    // Terminal nodes are not decision points.
    expect(b.decisionPoints.map((d: { nodeId: string }) => d.nodeId).sort()).toEqual([c.n.root, c.n.mid].sort());

    expect(b.outcomes.map((o: { nodeId: string }) => o.nodeId).sort()).toEqual([c.n.endB, c.n.endC, c.n.endD].sort());
    const outcome = (nodeId: string) => b.outcomes.find((o: { nodeId: string }) => o.nodeId === nodeId);
    for (const end of [c.n.endB, c.n.endC, c.n.endD]) expect([outcome(end).count, outcome(end).percentage]).toEqual([1, 33.3]);

    // No grading or identifying student data in the response.
    const text = JSON.stringify(res.body);
    expect(text).not.toMatch(/"(score|grade|rank|ranking|pass|passed|fail|failed|points)"\s*:/i);
    for (const s of [u.s1, u.s2, u.s3]) expect(text).not.toContain(s);
    expect(text).not.toMatch(/@uni\.edu\.vn/);
  });

  itDb("a case without attempts returns zeros and empty lists, not an error", async () => {
    const c = await tree();
    const res = await stats(c.id, auth.lect);
    expect(res.status).toBe(200);
    const b = res.body.data.branching;
    expect(b).toMatchObject({
      totalAttempts: 0,
      completedAttempts: 0,
      completionRate: 0,
      participants: 0,
      singleAttemptStudents: 0,
      retryStudents: 0,
      attemptsPerStudent: [],
      flowStatus: { inProgress: 0, completed: 0, reflected: 0 },
    });
    // The tree is still described: 2 decision points with 2 options each, 3 possible endings, all at zero.
    expect(b.decisionPoints.map((d: { nodeId: string }) => d.nodeId).sort()).toEqual([c.n.root, c.n.mid].sort());
    expect(b.decisionPoints.every((d: { options: unknown[] }) => d.options.length === 2)).toBe(true);
    expect(b.outcomes.map((o: { nodeId: string }) => o.nodeId).sort()).toEqual([c.n.endB, c.n.endC, c.n.endD].sort());
    for (const d of b.decisionPoints) {
      expect(d.totalSelections).toBe(0);
      for (const o of d.options) expect([o.count, o.percentage]).toEqual([0, 0]);
    }
    for (const o of b.outcomes) expect([o.count, o.percentage]).toEqual([0, 0]);
  });

  itDb("authorization and scope: other lecturer 403, student 403, no token 401, unknown case 404, malformed id 400", async () => {
    const c = await tree();
    expect((await stats(c.id, auth.lectB)).status).toBe(403);
    expect((await stats(c.id, auth.s1)).status).toBe(403);
    expect((await http().get(`/api/v1/cases/${c.id}/statistics`)).status).toBe(401);
    expect((await stats(randomUUID(), auth.lect)).status).toBe(404);
    expect((await stats("not-a-uuid", auth.lect)).status).toBe(400);
    // Role guard: an ADMIN token is refused even though the role is valid (the route is LECTURER-only).
    expect((await stats(c.id, auth.admin)).status).toBe(403);
    // The owner sees statistics for a case in any lifecycle status (contract §C).
    const draft = await tree(course, u.lect, "DRAFT");
    expect((await stats(draft.id, auth.lect)).status).toBe(200);
  });
});
