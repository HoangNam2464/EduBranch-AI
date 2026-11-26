import { Pool } from "pg";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { MigrationRunner } from "../src/common/database/migration-runner";
import { AuditService } from "../src/common/audit/audit.service";
import { AuthService } from "../src/modules/auth/auth.service";
import { UserService } from "../src/modules/user/user.service";
import { AdminService } from "../src/modules/admin/admin.service";
import { LecturerDashboardService } from "../src/modules/course/lecturer-dashboard.service";
import { LecturerFeedbackService } from "../src/modules/lecturer-feedback/lecturer-feedback.service";
import { EvaluationService } from "../src/modules/evaluation/evaluation.service";
import { attemptBand, decisionCountBand, pseudonymFactory, wordCount, wordCountBand } from "../src/modules/evaluation/research-export";

/**
 * Spec 007 on a real PostgreSQL 16 database (migrations V1-V8 applied to a fresh
 * database). Covers what mocks cannot: count correctness over joins (AC-D3),
 * ownership in SQL, account lock end to end (AC-A5), last-admin guard, and that the
 * research export carries no PII (AC-R5). Skips when PostgreSQL is not reachable,
 * like migration.integration.e2e-spec.ts (CI has no database service).
 */
describe("Spec 007 MVP completion — real PostgreSQL integration", () => {
  const base = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
    connectionTimeoutMillis: 2000,
  };
  const DB_NAME = "edubranch_spec007_it";
  const JWT_SECRET = "spec007-integration-jwt-secret-at-least-32-characters";

  let pool: Pool;
  let reachable = false;
  let auth: AuthService;
  let users: UserService;
  let admin: AdminService;
  let dashboard: LecturerDashboardService;
  let feedback: LecturerFeedbackService;
  let evaluation: EvaluationService;

  const id = {
    admin1: randomUUID(), admin2: randomUUID(),
    lect1: randomUUID(), lect2: randomUUID(),
    stu1: randomUUID(), stu2: randomUUID(), stu3: randomUUID(),
    c1: randomUUID(), c2: randomUUID(), c3: randomUUID(),
    k1: randomUUID(), k2: randomUUID(), k3: randomUUID(), k4: randomUUID(),
    n1: randomUUID(), n2: randomUUID(), n3: randomUUID(), n4: randomUUID(), n5: randomUUID(),
    o1: randomUUID(), o2: randomUUID(), o3: randomUUID(),
    a1: randomUUID(), a2: randomUUID(), a3: randomUUID(), a4: randomUUID(),
    r1: randomUUID(), r2: randomUUID(), r3: randomUUID(),
    s1: randomUUID(), s2: randomUUID(),
  };
  // L3 option C: pick ids so the expected CSV order (case, pseudonym) is the reverse of raw-id order
  // and of insertion order. A missing sort, a time sort or a raw-id sort then fail on every run.
  const code = pseudonymFactory(JWT_SECRET);
  const before = (a: string, b: string) => a.localeCompare(b, "en") < 0;
  type Uuid = ReturnType<typeof randomUUID>;
  // Roles come from the code order of a random triple; the triple is kept only when its raw-id order
  // fits. That holds with a fixed chance per try (1/3 students, 2/3 evaluators), so the loop ends fast.
  const byCode = (fits: (low: Uuid, mid: Uuid, high: Uuid) => boolean): [Uuid, Uuid, Uuid] => {
    for (let i = 0; i < 1000; i++) {
      const [low, mid, high] = [randomUUID(), randomUUID(), randomUUID()].sort((a, b) => code(a).localeCompare(code(b), "en"));
      if (fits(low, mid, high)) return [low, mid, high];
    }
    throw new Error("spec 007 integration: could not pick test ids");
  };
  const between = (x: string, a: string, b: string) => (before(a, x) && before(x, b)) || (before(b, x) && before(x, a));
  // Students, expected code order stu2 < stu3 < stu1. Raw ids: stu1 < stu2 and stu3 outside them, so
  // raw-id order (either direction), insertion order and time order (either direction) all differ.
  [id.stu2, id.stu3, id.stu1] = byCode((s2, s3, s1) => before(s1, s2) && !between(s3, s1, s2));
  // Evaluators, expected code order admin1 < admin2 < lect1. Creation order is lect1, admin1, admin2;
  // raw-id order is neither the expected order nor its reverse.
  [id.admin1, id.admin2, id.lect1] = byCode(
    (a1, a2, l1) => !(before(a1, a2) && before(a2, l1)) && !(before(l1, a2) && before(a2, a1)),
  );
  if (before(id.k1, id.k2)) [id.k1, id.k2] = [id.k2, id.k1]; // K2 (submissions, queried last) sorts first
  // Distinctive personal data: none of it may appear in a research export.
  const PII = {
    stu1: { name: "Pham Thi Bich Ngoc", email: "bichngoc.pham@student.edu.vn" },
    stu2: { name: "Hoang Van Quyet", email: "quyet.hoang@student.edu.vn" },
    lect1: { name: "TS Le Minh Tam", email: "tam.le@uni.edu.vn" },
  };
  const PASSWORD = "Spec007#Pass";

  const asUser = (uid: string, role: string) => ({ id: uid, role });

  beforeAll(async () => {
    const admin0 = new Pool({ ...base, database: process.env.POSTGRES_DB || "edubranch_ai" });
    try {
      await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      await admin0.query(`CREATE DATABASE ${DB_NAME}`);
      pool = new Pool({ ...base, database: DB_NAME });
      await new MigrationRunner(pool).run();
      reachable = true;
    } catch (err: any) {
      console.warn(`[spec 007 integration] PostgreSQL not available (${err.message}); skipping.`);
      return;
    } finally {
      await admin0.end().catch(() => undefined);
    }

    const db = { query: (t: string, p?: any[]) => pool.query(t, p), getClient: () => pool.connect() } as any;
    const config = { get: (k: string, d?: any) => (k === "JWT_SECRET" ? JWT_SECRET : k === "AI_SERVICE_BASE_URL" ? "http://127.0.0.1:9" : d) } as any;
    const audit = new AuditService(db);
    auth = new AuthService(db, new JwtService({ secret: JWT_SECRET }), audit);
    users = new UserService(db);
    admin = new AdminService(db, audit, { check: async () => ({ status: "DOWN", provider: null, model: null, version: null }) } as any);
    dashboard = new LecturerDashboardService(db);
    feedback = new LecturerFeedbackService(db);
    evaluation = new EvaluationService(db, config);

    const hash = await bcrypt.hash(PASSWORD, 4);
    const q = (t: string, p: any[]) => pool.query(t, p);
    const insUser = (uid: string, email: string, name: string, role: string) =>
      q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,$3,$4,$5)`, [uid, email, hash, name, role]);
    await insUser(id.admin1, "admin1@uni.edu.vn", "Admin One", "ADMIN");
    await insUser(id.admin2, "admin2@uni.edu.vn", "Admin Two", "ADMIN");
    await insUser(id.lect1, PII.lect1.email, PII.lect1.name, "LECTURER");
    await insUser(id.lect2, "lect2@uni.edu.vn", "Lecturer Two", "LECTURER");
    await insUser(id.stu1, PII.stu1.email, PII.stu1.name, "STUDENT");
    await insUser(id.stu2, PII.stu2.email, PII.stu2.name, "STUDENT");

    await q(`INSERT INTO courses (id, name, course_code, lecturer_id, is_active) VALUES ($1,'Marketing','MKT301',$2,TRUE)`, [id.c1, id.lect1]);
    await q(`INSERT INTO courses (id, name, course_code, lecturer_id, is_active) VALUES ($1,'Old course','OLD100',$2,FALSE)`, [id.c2, id.lect1]);
    await q(`INSERT INTO courses (id, name, course_code, lecturer_id, is_active) VALUES ($1,'Finance','FIN201',$2,TRUE)`, [id.c3, id.lect2]);
    await q(`INSERT INTO course_enrollments (course_id, student_id) VALUES ($1,$2),($1,$3)`, [id.c1, id.stu1, id.stu2]);

    const insCase = (cid: string, course: string, status: string, mode: string, title: string) =>
      q(`INSERT INTO cases (id, title, course_id, created_by, status, learning_mode, context_text, problem_text)
         VALUES ($1,$2,$3,$4,$5,$6,'ctx','prob')`, [cid, title, course, course === id.c3 ? id.lect2 : id.lect1, status, mode]);
    await insCase(id.k1, id.c1, "PUBLISHED", "BRANCHING_STUDY", "Launch decision");
    await insCase(id.k2, id.c1, "PUBLISHED", "REVIEW_STUDY", "Budget review");
    await insCase(id.k3, id.c1, "DRAFT", "BRANCHING_STUDY", "Draft case");
    await insCase(id.k4, id.c3, "PUBLISHED", "BRANCHING_STUDY", "Finance case");

    const insNode = (nid: string, cid: string, terminal: boolean, idx: number) =>
      q(`INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES ($1,$2,'s',$3,$4)`, [nid, cid, terminal, idx]);
    await insNode(id.n1, id.k1, false, 0);
    await insNode(id.n2, id.k1, true, 1);
    await insNode(id.n3, id.k1, true, 2);
    await insNode(id.n4, id.k4, false, 0);
    await insNode(id.n5, id.k4, true, 1);
    const insOpt = (oid: string, nid: string, next: string) =>
      q(`INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES ($1,$2,'o','c',$3)`, [oid, nid, next]);
    await insOpt(id.o1, id.n1, id.n2);
    await insOpt(id.o2, id.n1, id.n3);
    await insOpt(id.o3, id.n4, id.n5);

    const insAttempt = (aid: string, stu: string, cid: string, no: number, done: boolean, outcome: string | null, reflection: string | null) =>
      q(`INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, started_at, completed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, NOW() - ($8::int * INTERVAL '1 hour') - INTERVAL '125 seconds',
                 CASE WHEN $5 THEN NOW() - ($8::int * INTERVAL '1 hour') ELSE NULL END)`,
        [aid, stu, cid, no, done, outcome, reflection, no]);
    await insAttempt(id.a1, id.stu1, id.k1, 1, true, id.n2, "Toi da hoc duoc nhieu");
    await insAttempt(id.a2, id.stu1, id.k1, 2, true, id.n3, null);
    await insAttempt(id.a3, id.stu2, id.k1, 1, false, null, null);
    await insAttempt(id.a4, id.stu2, id.k4, 1, true, id.n5, null);

    await q(`INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES ($1,$2,$3,$4,$5)`,
      [id.r1, id.a1, id.n1, id.o1, `ba từ thôi ${PII.stu1.name}`]);
    await q(`INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES ($1,$2,$3,$4,NULL)`,
      [id.r2, id.a2, id.n1, id.o2]);
    await q(`INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id) VALUES ($1,$2,$3,$4)`,
      [id.r3, id.a4, id.n4, id.o3]);
    await q(`INSERT INTO challenge_support_sessions (reasoning_id, current_round) VALUES ($1, 2)`, [id.r1]);

    // Two feedback rows on the same attempt: must not double any count (AC-D3).
    await q(`INSERT INTO lecturer_feedback (lecturer_id, branching_attempt_id, feedback_text) VALUES ($1,$2,'good'),($1,$2,'more')`,
      [id.lect1, id.a1]);

    await q(`INSERT INTO review_study_submissions (id, student_id, case_id, proposed_solution, reasoning_text, submission_status, reflection_text)
             VALUES ($1,$2,$3,'Giai phap mot hai','Ly do ${PII.stu1.email}','SUBMITTED',NULL)`, [id.s1, id.stu1, id.k2]);
    await q(`INSERT INTO review_study_submissions (id, student_id, case_id, proposed_solution, reasoning_text, submission_status, reflection_text)
             VALUES ($1,$2,$3,'Mot','Hai ba','REVIEWED','Phan tu ngan')`, [id.s2, id.stu2, id.k2]);
    await q(`INSERT INTO challenge_support_sessions (review_submission_id, current_round) VALUES ($1, 1)`, [id.s2]);

    await q(`INSERT INTO teaching_materials (original_filename, stored_object_key, mime_type, course_id, uploaded_by, processing_status)
             VALUES ('a.pdf','k/a','application/pdf',$1,$2,'FAILED'),('b.pdf','k/b','application/pdf',$1,$2,'COMPLETED')`, [id.c1, id.lect1]);
  }, 60000);

  afterAll(async () => {
    if (pool) await pool.end();
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!reachable) return console.warn(`[spec 007 integration] skipped: ${name}`);
      await fn();
    });

  // ---------------------------------------------------------------------------
  describe("BE-031 profile", () => {
    itDb("defaults to vi, updates only the caller, and the DB rejects other languages", async () => {
      expect((await users.getProfile(id.stu1)).language).toBe("vi");
      const updated = await users.updateProfile(id.stu1, { fullName: "Ngoc P", language: "en" });
      expect(updated).toMatchObject({ id: id.stu1, fullName: "Ngoc P", language: "en", email: PII.stu1.email });
      expect((await users.getProfile(id.stu2)).fullName).toBe(PII.stu2.name);
      await expect(pool.query(`UPDATE users SET preferred_language = 'fr' WHERE id = $1`, [id.stu2])).rejects.toThrow();
      await users.updateProfile(id.stu1, { fullName: PII.stu1.name, language: "vi" });
    });
  });

  // ---------------------------------------------------------------------------
  describe("BE-030 lecturer dashboard", () => {
    itDb("counts each item once despite multiple attempts and feedback rows (AC-D1, AC-D3)", async () => {
      const d = await dashboard.getDashboard(id.lect1);
      expect(d.courses).toEqual({ total: 2, active: 1, archived: 1 });
      expect(d.cases.total).toBe(3);
      expect(d.cases.byStatus).toEqual({ DRAFT: 1, REVIEWED: 0, APPROVED: 0, PUBLISHED: 2 });
      expect(d.cases.byMode).toEqual({ BRANCHING_STUDY: 2, REVIEW_STUDY: 1 });
      expect(d.pendingReviews.count).toBe(1);
      expect(d.pendingReviews.items.map((i) => i.submissionId)).toEqual([id.s1]);
      expect(d.recentCompletedAttempts.countLast7Days).toBe(2);
      expect(d.recentCompletedAttempts.items.map((i) => i.attemptId)).toEqual([id.a1, id.a2]);
      expect(d.recentCompletedAttempts.items.find((i) => i.attemptId === id.a1)?.hasFeedback).toBe(true);
      expect(d.recentCompletedAttempts.items.find((i) => i.attemptId === id.a2)?.hasFeedback).toBe(false);
      const json = JSON.stringify(d);
      expect(json).not.toContain(PII.stu1.email);
      expect(json).not.toMatch(/score|rank|pass/i);
    });

    itDb("shows another lecturer only their own data and refuses foreign/unknown course filters (AC-D2)", async () => {
      const d = await dashboard.getDashboard(id.lect2);
      expect(d.courses.total).toBe(1);
      expect(d.cases.total).toBe(1);
      expect(d.pendingReviews.count).toBe(0);
      expect(d.recentCompletedAttempts.items.map((i) => i.attemptId)).toEqual([id.a4]);
      await expect(dashboard.getDashboard(id.lect1, id.c3)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(dashboard.getDashboard(id.lect1, randomUUID())).rejects.toBeInstanceOf(NotFoundException);
      const filtered = await dashboard.getDashboard(id.lect1, id.c2);
      expect(filtered.cases.total).toBe(0);
    });

    itDb("returns zeros for a lecturer without data (AC-D4)", async () => {
      const lone = randomUUID();
      await pool.query(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'x','Lone','LECTURER')`, [lone, `${lone}@x.vn`]);
      const d = await dashboard.getDashboard(lone);
      expect(d.courses.total).toBe(0);
      expect(d.pendingReviews).toEqual({ count: 0, items: [] });
      expect(d.recentCompletedAttempts).toEqual({ countLast7Days: 0, items: [] });
      await pool.query(`DELETE FROM users WHERE id = $1`, [lone]);
    });
  });

  // ---------------------------------------------------------------------------
  describe("BE-032 admin", () => {
    itDb("locking takes effect at login and on an issued token; unlocking restores both (AC-A5)", async () => {
      const issued = await auth.login({ email: PII.stu2.email, password: PASSWORD });
      expect(issued).toBeDefined();
      await admin.setUserStatus(id.admin1, id.stu2, "LOCKED");
      await expect(auth.login({ email: PII.stu2.email, password: PASSWORD })).rejects.toThrow(
        new UnauthorizedException("Invalid email or password"),
      );
      await expect(auth.validateToken({ sub: id.stu2 } as any)).rejects.toBeInstanceOf(UnauthorizedException);
      await admin.setUserStatus(id.admin1, id.stu2, "ACTIVE");
      await expect(auth.validateToken({ sub: id.stu2 } as any)).resolves.toMatchObject({ id: id.stu2 });
      await expect(auth.login({ email: PII.stu2.email, password: PASSWORD })).resolves.toBeDefined();

      const events = await pool.query(
        `SELECT event_type, outcome, meta FROM audit_events WHERE target_id = $1 OR actor_id = $1 ORDER BY created_at`,
        [id.stu2],
      );
      const types = events.rows.map((r) => r.event_type);
      expect(types).toEqual(["LOGIN_SUCCEEDED", "USER_LOCKED", "LOGIN_FAILED", "USER_UNLOCKED", "LOGIN_SUCCEEDED"]);
      expect(events.rows[2].meta).toEqual({ reason: "ACCOUNT_LOCKED" });
    });

    itDb("never stores the e-mail typed for an unknown account", async () => {
      await expect(auth.login({ email: "nobody.typed@evil.vn", password: "whatever1" })).rejects.toBeInstanceOf(UnauthorizedException);
      const leak = await pool.query(`SELECT COUNT(*) AS n FROM audit_events WHERE meta::text ILIKE '%nobody.typed%'`);
      expect(Number(leak.rows[0].n)).toBe(0);
    });

    itDb("keeps at least one active admin and refuses self-changes (AC-A4, AC-A13)", async () => {
      await expect(admin.setUserStatus(id.admin1, id.admin1, "LOCKED")).rejects.toBeInstanceOf(ConflictException);
      await admin.setUserStatus(id.admin1, id.admin2, "LOCKED");
      await expect(admin.setUserStatus(id.admin2, id.admin1, "LOCKED")).rejects.toBeInstanceOf(ConflictException);
      await expect(admin.setUserRole(id.admin2, id.admin1, "LECTURER")).rejects.toBeInstanceOf(ConflictException);
      await expect(admin.setUserRole(id.admin1, id.admin1, "STUDENT")).rejects.toBeInstanceOf(ConflictException);
      await admin.setUserStatus(id.admin1, id.admin2, "ACTIVE");
      await expect(admin.setUserStatus(id.admin1, randomUUID(), "LOCKED")).rejects.toBeInstanceOf(NotFoundException);
    });

    itDb("role change is effective on the next request and logged (AC-A13)", async () => {
      await admin.setUserRole(id.admin1, id.stu2, "LECTURER");
      await expect(auth.validateToken({ sub: id.stu2 } as any)).resolves.toMatchObject({ role: "LECTURER" });
      await admin.setUserRole(id.admin1, id.stu2, "STUDENT");
      const ev = await pool.query(`SELECT meta FROM audit_events WHERE event_type = 'USER_ROLE_CHANGED' ORDER BY created_at`);
      expect(ev.rows.map((r) => [r.meta.from, r.meta.to])).toEqual([["STUDENT", "LECTURER"], ["LECTURER", "STUDENT"]]);
    });

    itDb("overview reflects real data, no invented numbers (AC-A2)", async () => {
      const o = await admin.getOverview();
      expect(o.totalUsers).toBe(6);
      expect([o.studentsCount, o.lecturersCount, o.adminsCount]).toEqual([2, 2, 2]);
      expect(o.studentPercent + o.lecturerPercent + o.adminPercent).toBe(100);
      expect(o.openCourses).toBe(2);
      expect(o.publishedCases).toBe(3);
      expect(o.aiCaseGenerations).toBe(0);
      expect(o.weeklySignups).toHaveLength(8);
      expect(o.weeklySignups.reduce((s, w) => s + w.count, 0)).toBe(6);
      expect(o.casesByCourse[0]).toMatchObject({ courseCode: "MKT301", publishedCount: 2, draftCount: 1, totalCount: 3 });
      expect(o.attentionAlerts.map((a) => a.type).sort()).toEqual(["indexing_failure", "login_failure"]);
      expect(o.system_health).toMatchObject({ database: "UP", ai_service: "DOWN", indexing: "DOWN" });
      expect(o.recentLogs.length).toBeGreaterThan(0);
    });

    itDb("users, courses and cases lists filter and page; counts are not inflated (AC-A3, AC-A6, AC-A7)", async () => {
      const u = await admin.listUsers({ role: "STUDENT", page: 1, size: 1 });
      expect(u.total).toBe(2);
      expect(u.users).toHaveLength(1);
      expect(u.metrics).toEqual({ totalUsers: 6, lecturers: 2, students: 2, lockedUsers: 0 });
      expect(JSON.stringify(u)).not.toContain("password");
      const s = await admin.listUsers({ search: "quyet" });
      expect(s.users.map((x) => x.id)).toEqual([id.stu2]);
      expect(s.users[0]).toMatchObject({ coursesInfo: "1", attemptCount: 2, status: "ACTIVE" });
      const wild = await admin.listUsers({ search: "%" });
      expect(wild.total).toBe(0);

      const c = await admin.listCourses({ search: "MKT" });
      expect(c.courses).toHaveLength(1);
      expect(c.courses[0]).toMatchObject({
        courseCode: "MKT301", lecturerName: PII.lect1.name, materialsCount: 2, materialsReady: 1, errorCount: 1,
        casesCount: 3, attemptsCount: 3, status: "ACTIVE",
      });
      expect((await admin.listCourses({ status: "ARCHIVED" })).courses.map((x) => x.id)).toEqual([id.c2]);

      const k = await admin.listCases({ learningMode: "REVIEW_STUDY" });
      expect(k.cases.map((x) => x.id)).toEqual([id.k2]);
      expect(k.analytics).toMatchObject({ totalCases: 4, byStatus: { draft: 1, published: 3 }, byMode: { branching: 3, review: 1 } });
      const kNodes = await admin.listCases({ courseId: id.c1, status: "PUBLISHED", learningMode: "BRANCHING_STUDY" });
      expect(kNodes.cases[0]).toMatchObject({ id: id.k1, nodesCount: 3 });
      expect(JSON.stringify(k)).not.toMatch(/situation|option_text|consequence|reasoning|proposed_solution/);
    });

    itDb("logs filter by type, search and time; settings persist and are validated by the DB (AC-A10, AC-A11)", async () => {
      const failed = await admin.listLogs({ eventType: "LOGIN_FAILED", timeRange: "today" });
      expect(failed.total).toBe(2);
      expect(failed.logs.every((l) => l.eventTitle === "LOGIN_FAILED" && l.status === "WARNING")).toBe(true);
      const byName = await admin.listLogs({ search: "Quyet" });
      expect(byName.total).toBeGreaterThan(0);
      expect(failed.metrics.loginCount).toBe(2);

      // 10.9 "Đăng nhập" group: succeeded + failed, total and pages exact across both types.
      const succeeded = await admin.listLogs({ eventType: ["LOGIN_SUCCEEDED"] });
      const anyFailed = await admin.listLogs({ eventType: ["LOGIN_FAILED"] });
      const signIns = await admin.listLogs({ eventType: ["LOGIN_SUCCEEDED", "LOGIN_FAILED"], size: 1 });
      expect(signIns.total).toBe(succeeded.total + anyFailed.total);
      expect(signIns.total).toBeGreaterThan(anyFailed.total);
      expect(signIns.logs).toHaveLength(1);
      const allPages = [];
      for (let page = 1; page <= signIns.total; page++) {
        allPages.push(...(await admin.listLogs({ eventType: ["LOGIN_SUCCEEDED", "LOGIN_FAILED"], size: 1, page })).logs);
      }
      expect(new Set(allPages.map((l) => l.id)).size).toBe(signIns.total);
      expect(allPages.every((l) => l.eventTitle === "LOGIN_SUCCEEDED" || l.eventTitle === "LOGIN_FAILED")).toBe(true);

      // Order is applied in SQL, so the oldest-first list is the newest-first list reversed.
      const newest = await admin.listLogs({ order: "newest", size: 100 });
      const oldest = await admin.listLogs({ order: "oldest", size: 100 });
      expect(oldest.total).toBe(newest.total);
      expect(oldest.logs.map((l) => l.id)).toEqual([...newest.logs].reverse().map((l) => l.id));

      const before = await admin.getSettings();
      expect(before.platformName).toBe("EduBranch AI");
      expect(before.limits.maxFileSize).toBe("50 MB");
      const after = await admin.updateSettings(id.admin1, { loginNotice: "Bảo trì 22h", supportEmail: "help@uni.edu.vn" });
      expect(after).toMatchObject({ platformName: "EduBranch AI", loginNotice: "Bảo trì 22h", supportEmail: "help@uni.edu.vn" });
      const ev = await pool.query(`SELECT meta FROM audit_events WHERE event_type = 'SETTINGS_UPDATED'`);
      expect(ev.rows[0].meta).toEqual({ fields: "loginNotice, supportEmail" });
      await expect(pool.query(`INSERT INTO system_settings (key, value) VALUES ('adminPassword','x')`)).rejects.toThrow();
    });

    itDb("totals stay correct on a page past the end (QG2 M3)", async () => {
      expect((await admin.listUsers({ page: 50 })).total).toBe(6);
      expect((await admin.listCourses({ page: 50 })).total).toBe(3);
      expect((await admin.listCases({ page: 50, courseId: id.c1 })).total).toBe(3);
      const logs = await admin.listLogs({ page: 999 });
      expect(logs.logs).toHaveLength(0);
      expect(logs.total).toBeGreaterThan(0);
    });

    itDb("two admins acting on each other at once: one wins, the other gets 409, never a deadlock (QG2 L1)", async () => {
      const results = await Promise.allSettled([
        admin.setUserStatus(id.admin1, id.admin2, "LOCKED"),
        admin.setUserStatus(id.admin2, id.admin1, "LOCKED"),
      ]);
      const errors = results.filter((r) => r.status === "rejected").map((r) => (r as PromiseRejectedResult).reason);
      expect(errors.every((e) => e instanceof ConflictException)).toBe(true);
      const active = await pool.query(`SELECT COUNT(*) AS n FROM users WHERE role = 'ADMIN' AND is_active = TRUE`);
      expect(Number(active.rows[0].n)).toBeGreaterThanOrEqual(1);
      await pool.query(`UPDATE users SET is_active = TRUE WHERE role = 'ADMIN'`);
    });

    itDb("AI service view works with the AI service down and lists indexing statuses (AC-A8)", async () => {
      const ai = await admin.getAiService();
      expect(ai.config).toMatchObject({ status: "DOWN", provider: null, model: null });
      expect(ai.metrics).toEqual({ totalGenerated: 0, avgDurationSeconds: 0, readyMaterials: 1 });
      expect(ai.indexingStatuses.map((m) => m.status).sort()).toEqual(["COMPLETED", "FAILED"]);
      expect(JSON.stringify(ai)).not.toMatch(/api[_-]?key/i);
    });
  });

  // ---------------------------------------------------------------------------
  describe("BE-033 rubric and research export", () => {
    let rubricId: string;

    itDb("CRUD with ownership, one evaluation per evaluator and case (AC-R1..R3)", async () => {
      const r = await evaluation.create(asUser(id.lect1, "LECTURER"), {
        caseId: id.k1, realismScore: 4, difficultyScore: 3, alignmentScore: 5, notes: "Thuc te",
      });
      rubricId = r.id;
      expect(r).toMatchObject({ averageScore: 4, evaluatorName: PII.lect1.name, criteria: [{ key: "REALISM", score: 4 }, { key: "DIFFICULTY", score: 3 }, { key: "ALIGNMENT", score: 5 }] });
      await expect(
        evaluation.create(asUser(id.lect1, "LECTURER"), { caseId: id.k1, realismScore: 1, difficultyScore: 1, alignmentScore: 1 }),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        evaluation.create(asUser(id.lect2, "LECTURER"), { caseId: id.k1, realismScore: 1, difficultyScore: 1, alignmentScore: 1 }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        evaluation.create(asUser(id.lect1, "LECTURER"), { caseId: randomUUID(), realismScore: 1, difficultyScore: 1, alignmentScore: 1 }),
      ).rejects.toBeInstanceOf(NotFoundException);
      await evaluation.create(asUser(id.admin1, "ADMIN"), { caseId: id.k1, realismScore: 2, difficultyScore: 4, alignmentScore: 4 });

      expect(await evaluation.list(asUser(id.lect1, "LECTURER"), id.k1)).toHaveLength(2);
      expect(await evaluation.list(asUser(id.lect2, "LECTURER"))).toHaveLength(0);
      await expect(evaluation.list(asUser(id.lect2, "LECTURER"), id.k1)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(evaluation.getById(asUser(id.lect2, "LECTURER"), rubricId)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(evaluation.update(asUser(id.admin1, "ADMIN"), rubricId, { realismScore: 1 })).rejects.toBeInstanceOf(ForbiddenException);

      const u = await evaluation.update(asUser(id.lect1, "LECTURER"), rubricId, { realismScore: 5, notes: "" });
      expect(u).toMatchObject({ realismScore: 5, difficultyScore: 3, notes: "", averageScore: 4.3 });
      await expect(
        pool.query(`UPDATE case_rubric_evaluations SET realism_score = 6 WHERE id = $1`, [rubricId]),
      ).rejects.toThrow();
    });

    itDb("activity export: only the lecturer's own courses, coarsened bands only, no PII or tree paths (AC-R4, AC-R5, R-L3b B)", async () => {
      const csv = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity" });
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      const lines = csv.slice(1).trim().split("\r\n");
      expect(lines[0]).toBe(
        "participant_code,course_code,case_id,learning_mode,attempt_band,completed,decision_count_band,reasoning_word_band,reflection_word_band,challenge_rounds,duration_band",
      );
      const rows = lines.slice(1).map((l) => l.split(","));
      expect(rows).toHaveLength(5); // 3 attempts on K1 + 2 submissions on K2; nothing from lecturer 2
      expect(rows.every((r) => r[1] === "MKT301")).toBe(true);

      const a1 = rows.find((r) => r[2] === id.k1 && r[0] === code(id.stu1) && r[4] === "1")!;
      expect(a1).toBeDefined();
      expect(a1[4]).toBe("1");
      expect(a1[6]).toBe("1-2");
      expect(a1[7]).toBe("1-25"); // 3 + 3 = 6 words -> 1-25 band
      expect(a1[8]).toBe("1-25"); // 5 words -> 1-25 band
      expect(a1[9]).toBe("2");
      // L3 option C + R-L3b option B: coarse duration band, no absolute time anywhere,
      // no option/outcome node UUIDs, rows ordered solely by exported columns.
      expect(a1[10]).toBe("1-5m");
      expect(rows.filter((r) => r[5] === "false").every((r) => r[10] === "")).toBe(true);
      expect(rows.filter((r) => r[3] === "REVIEW_STUDY").every((r) => r[10] === "" && r[6] === "0")).toBe(true);
      expect(csv).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      for (const treeUuid of [id.o1, id.o2, id.o3, id.n2, id.n3, id.n5]) {
        expect(csv).not.toContain(treeUuid);
      }
      expect(rows.map((r) => `${r[2]}|${r[0]}|${r[4]}`)).toEqual([
        `${id.k2}|${code(id.stu2)}|1`,
        `${id.k2}|${code(id.stu1)}|1`,
        `${id.k1}|${code(id.stu2)}|1`,
        `${id.k1}|${code(id.stu1)}|1`,
        `${id.k1}|${code(id.stu1)}|2+`,
      ]);
      // A third student on K1 (created last) lands between the other two by code. Completed 90 min ago,
      // between a1 (1 h) and a2 (2 h), so no started_at/completed_at order in either direction, with
      // NULLs first or last, gives the expected sequence.
      const extraAttempt = randomUUID();
      await pool.query(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,'stu3@student.edu.vn','x','Student Three','STUDENT')`, [id.stu3]);
      await pool.query(
        `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, started_at, completed_at)
         VALUES ($1,$2,$3,1,TRUE, NOW() - INTERVAL '90 minutes' - INTERVAL '125 seconds', NOW() - INTERVAL '90 minutes')`,
        [extraAttempt, id.stu3, id.k1],
      );
      const three = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: id.k1 });
      await pool.query(`DELETE FROM branching_attempts WHERE id = $1`, [extraAttempt]);
      await pool.query(`DELETE FROM users WHERE id = $1`, [id.stu3]);
      expect(three.slice(1).trim().split("\r\n").slice(1).map((l) => { const r = l.split(","); return `${r[0]}|${r[4]}`; })).toEqual([
        `${code(id.stu2)}|1`, `${code(id.stu3)}|1`, `${code(id.stu1)}|1`, `${code(id.stu1)}|2+`,
      ]);
      // A second decision on the same attempt with its own 2-round session stays within 0-2 (QG2 M2) and remains in 1-2 band.
      const extraNode = randomUUID();
      const extraReasoning = randomUUID();
      await pool.query(`INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES ($1,$2,'s',FALSE,3)`, [extraNode, id.k1]);
      await pool.query(`INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id) VALUES ($1,$2,$3,$4)`, [extraReasoning, id.a1, extraNode, id.o2]);
      await pool.query(`INSERT INTO challenge_support_sessions (reasoning_id, current_round) VALUES ($1, 2)`, [extraReasoning]);
      const again = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: id.k1 });
      const a1Again = again.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(",")).find((r) => r[4] === "1" && r[0] === a1[0])!;
      expect(a1Again[6]).toBe("1-2");
      expect(a1Again[9]).toBe("2");
      await pool.query(`DELETE FROM challenge_support_sessions WHERE reasoning_id = $1`, [extraReasoning]);
      await pool.query(`DELETE FROM student_reasoning WHERE id = $1`, [extraReasoning]);
      await pool.query(`DELETE FROM case_nodes WHERE id = $1`, [extraNode]);
      const stu1Codes = new Set(rows.filter((r) => r[0] === a1[0]).map((r) => r[0]));
      expect(stu1Codes.size).toBe(1);
      expect(rows.filter((r) => r[0] === a1[0])).toHaveLength(3); // stu1: 2 attempts + 1 submission, same code

      for (const value of [PII.stu1.name, PII.stu1.email, PII.stu2.name, PII.stu2.email, PII.lect1.name,
        "Pham", "bichngoc", id.stu1, id.stu2, id.lect1, id.admin1, "Giai phap", "Ly do"]) {
        expect(csv).not.toContain(value);
      }

      await expect(evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", courseId: id.c3 }))
        .rejects.toBeInstanceOf(ForbiddenException);
      await expect(evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: id.k4 }))
        .rejects.toBeInstanceOf(ForbiddenException);
      const all = await evaluation.exportCsv(asUser(id.admin1, "ADMIN"), { dataset: "activity" });
      expect(all.slice(1).trim().split("\r\n")).toHaveLength(7);
      const one = await evaluation.exportCsv(asUser(id.admin1, "ADMIN"), { dataset: "activity", caseId: id.k4 });
      expect(one.slice(1).trim().split("\r\n")).toHaveLength(2);
    });

    itDb("R-L3b option B: realistic cohort resists feedback-queue multi-field linkage while documenting outliers and cross-export stability", async () => {
      const kCohort = randomUUID();
      const kReviewCohort = randomUUID();
      const nodes = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()]; // 0=root, 1=mid1, 2=termA, 3=termB, 4=mid2
      const opts = [randomUUID(), randomUUID(), randomUUID(), randomUUID(), randomUUID()];
      const cohortStudents = Array.from({ length: 10 }, (_, idx) => ({
        uid: randomUUID(),
        email: `cohort-${idx}@student.edu.vn`,
        name: `Cohort Student ${idx}`,
      }));
      const wordsOfLen = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(" ");

      try {
        await pool.query(
          `INSERT INTO cases (id, title, course_id, created_by, status, learning_mode, context_text, problem_text)
           VALUES ($1,'Cohort Case',$2,$3,'PUBLISHED','BRANCHING_STUDY','ctx','prob'),
                  ($4,'Cohort Review Case',$2,$3,'PUBLISHED','REVIEW_STUDY','ctx','prob')`,
          [kCohort, id.c1, id.lect1, kReviewCohort],
        );
        await pool.query(
          `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
             ($1,$6,'Root',FALSE,0), ($2,$6,'Mid',FALSE,1), ($3,$6,'TermA',TRUE,2), ($4,$6,'TermB',TRUE,3), ($5,$6,'Mid2',FALSE,4)`,
          [nodes[0], nodes[1], nodes[2], nodes[3], nodes[4], kCohort],
        );
        await pool.query(
          `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
             ($1,$6,'Opt0A','c',$7), ($2,$6,'Opt0B','c',$8), ($3,$7,'Opt1A','c',$8), ($4,$7,'Opt1B','c',$9), ($5,$10,'Opt2A','c',$9)`,
          [opts[0], opts[1], opts[2], opts[3], opts[4], nodes[0], nodes[1], nodes[2], nodes[3], nodes[4]],
        );

        for (const s of cohortStudents) {
          await pool.query(
            `INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'x',$3,'STUDENT')`,
            [s.uid, s.email, s.name],
          );
          await pool.query(`INSERT INTO course_enrollments (course_id, student_id) VALUES ($1,$2)`, [id.c1, s.uid]);
        }

        // 8 normal-band students (4 in 1-25/1-25, 4 in 26-75/26-75), every student having a UNIQUE exact
        // (path, outcome, reasoningWords, reflectionWords) tuple in the feedback queue.
        const normalConfigs = [
          { idx: 0, rw: 8, fw: 5, dur: 90, path: [0, 2], term: 2, rounds: 0 },
          { idx: 1, rw: 12, fw: 9, dur: 140, path: [0, 3], term: 3, rounds: 1 },
          { idx: 2, rw: 17, fw: 14, dur: 200, path: [1], term: 2, rounds: 2 },
          { idx: 3, rw: 22, fw: 20, dur: 250, path: [0, 2], term: 2, rounds: 1 },
          { idx: 4, rw: 30, fw: 28, dur: 350, path: [0, 3], term: 3, rounds: 0 },
          { idx: 5, rw: 41, fw: 39, dur: 480, path: [1], term: 2, rounds: 1 },
          { idx: 6, rw: 55, fw: 51, dur: 610, path: [0, 2], term: 2, rounds: 2 },
          { idx: 7, rw: 69, fw: 64, dur: 790, path: [0, 3], term: 3, rounds: 0 },
        ];

        for (const cfg of normalConfigs) {
          const aid = randomUUID();
          await pool.query(
            `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, started_at, completed_at)
             VALUES ($1,$2,$3,1,TRUE,$4,$5, NOW() - INTERVAL '2 hours' - ($6::int * INTERVAL '1 second'), NOW() - INTERVAL '2 hours')`,
            [aid, cohortStudents[cfg.idx].uid, kCohort, nodes[cfg.term], wordsOfLen(cfg.fw), cfg.dur],
          );
          for (let stepIdx = 0; stepIdx < cfg.path.length; stepIdx++) {
            const rid = randomUUID();
            const nodeId = stepIdx === 0 ? nodes[0] : nodes[1];
            const text = stepIdx === 0 ? wordsOfLen(cfg.rw) : null;
            await pool.query(
              `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES ($1,$2,$3,$4,$5)`,
              [rid, aid, nodeId, opts[cfg.path[stepIdx]], text],
            );
            if (stepIdx === 0 && cfg.rounds > 0) {
              await pool.query(`INSERT INTO challenge_support_sessions (reasoning_id, current_round) VALUES ($1,$2)`, [rid, cfg.rounds]);
            }
          }
        }

        // Realistic retries: student 4 does attempt 2; student 5 does sequential attempts 2 and 3.
        for (const retry of [
          { uid: cohortStudents[4].uid, attNo: 2, rw: 33, fw: 31, dur: 410 },
          { uid: cohortStudents[5].uid, attNo: 2, rw: 38, fw: 36, dur: 460 },
          { uid: cohortStudents[5].uid, attNo: 3, rw: 48, fw: 44, dur: 520 },
        ]) {
          const aid = randomUUID();
          await pool.query(
            `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, started_at, completed_at)
             VALUES ($1,$2,$3,$4,TRUE,$5,$6, NOW() - INTERVAL '3 hours' - ($7::int * INTERVAL '1 second'), NOW() - INTERVAL '3 hours')`,
            [aid, retry.uid, kCohort, retry.attNo, nodes[2], wordsOfLen(retry.fw), retry.dur],
          );
          await pool.query(
            `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES ($1,$2,$3,$4,$5)`,
            [randomUUID(), aid, nodes[0], opts[1], wordsOfLen(retry.rw)],
          );
        }

        // Deliberate extreme outlier (idx 8): sole 3+ steps & 151+ word counts & 30m+ duration.
        const outAttempt = randomUUID();
        await pool.query(
          `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, started_at, completed_at)
           VALUES ($1,$2,$3,1,TRUE,$4,$5, NOW() - INTERVAL '4 hours' - INTERVAL '2000 seconds', NOW() - INTERVAL '4 hours')`,
          [outAttempt, cohortStudents[8].uid, kCohort, nodes[3], wordsOfLen(160)],
        );
        await pool.query(
          `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES
             ($1,$2,$3,$4,$5), ($6,$2,$7,$8,NULL), ($9,$2,$10,$11,NULL)`,
          [randomUUID(), outAttempt, nodes[0], opts[0], wordsOfLen(160), randomUUID(), nodes[1], opts[2], randomUUID(), nodes[4], opts[4]],
        );

        // REVIEW_STUDY cohort (students 0..5): exercises multiline/tabbed/whitespace-only SQL WORDS parity + 2-band collisions.
        const reviewSubs = [
          { uid: cohortStudents[0].uid, ana: "\n  alpha\tbeta \r\n", sol: "gamma\ndelta", rsn: "epsilon", ref: "\t zeta \n" }, // 5 + 1 words -> 1-25, 1-25
          { uid: cohortStudents[1].uid, ana: null, sol: wordsOfLen(6), rsn: wordsOfLen(8), ref: wordsOfLen(4) }, // 14 + 4 words -> 1-25, 1-25
          { uid: cohortStudents[2].uid, ana: "  \n\t  ", sol: wordsOfLen(10), rsn: wordsOfLen(10), ref: wordsOfLen(12) }, // whitespace-only ana=0 -> 20 + 12 -> 1-25, 1-25
          { uid: cohortStudents[3].uid, ana: wordsOfLen(2), sol: wordsOfLen(11), rsn: wordsOfLen(11), ref: wordsOfLen(24) }, // 24 + 24 -> 1-25, 1-25
          { uid: cohortStudents[4].uid, ana: wordsOfLen(10), sol: wordsOfLen(10), rsn: wordsOfLen(10), ref: "  \n\t\r  " }, // 30 + 0 (whitespace-only ref -> "0"!) -> 26-75, 0
          { uid: cohortStudents[5].uid, ana: wordsOfLen(15), sol: wordsOfLen(15), rsn: wordsOfLen(15), ref: null }, // 45 + 0 -> 26-75, 0
        ];
        for (const sub of reviewSubs) {
          await pool.query(
            `INSERT INTO review_study_submissions (id, student_id, case_id, student_analysis, proposed_solution, reasoning_text, submission_status, reflection_status, reflection_text)
             VALUES ($1,$2,$3,$4,$5,$6,'SUBMITTED',$7,$8)`,
            [randomUUID(), sub.uid, kReviewCohort, sub.ana, sub.sol, sub.rsn, sub.ref && sub.ref.trim() ? "SUBMITTED" : "NOT_STARTED", sub.ref],
          );
        }

        const queue = await feedback.getQueue(id.lect1, { caseId: kCohort });
        const csv1 = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: kCohort });
        expect(csv1).not.toMatch(/\d{4}-\d{2}-\d{2}/);
        const csvRows1 = csv1.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(","));
        expect(csvRows1).toHaveLength(12); // 8 normal + 3 retry rows + 1 outlier

        // Verify all 12 queue entries had unique exact fingerprints, yet normal/retry per-row bands share pools >= 3.
        const exactQueueSigs = queue.items.map((item) => {
          const rWords = (item.steps ?? []).reduce((acc, st) => acc + wordCount(st.reasoningText), 0);
          const fWords = wordCount(item.reflectionText);
          const optPath = (item.steps ?? []).map((st) => st.selectedOptionText).join(">");
          return `${item.attemptNumber}|${item.stepsCount}|${optPath}|${item.outcomeSituation}|${rWords}|${fWords}`;
        });
        expect(new Set(exactQueueSigs).size).toBe(queue.items.length);

        const normalAttemptQueueItems = queue.items.filter(
          (i) => i.attemptNumber === 1 && !i.studentName.endsWith(" 8"),
        );
        expect(normalAttemptQueueItems).toHaveLength(8);
        for (const item of normalAttemptQueueItems) {
          const rWords = (item.steps ?? []).reduce((acc, st) => acc + wordCount(st.reasoningText), 0);
          const fWords = wordCount(item.reflectionText);
          const sig = [
            attemptBand(item.attemptNumber ?? 1),
            decisionCountBand(item.stepsCount ?? 0),
            wordCountBand(rWords),
            wordCountBand(fWords),
          ].join("|");
          const matchingRows = csvRows1.filter((r) => [r[4], r[6], r[7], r[8]].join("|") === sig);
          expect(matchingRows.length).toBe(4);
        }

        // Retries (student 4 attempt 2; student 5 attempt 2 & 3) all share the same per-row 2+ band pool (3 rows).
        const retryQueueItems = queue.items.filter((i) => (i.attemptNumber ?? 1) >= 2);
        expect(retryQueueItems).toHaveLength(3);
        for (const item of retryQueueItems) {
          const rWords = (item.steps ?? []).reduce((acc, st) => acc + wordCount(st.reasoningText), 0);
          const fWords = wordCount(item.reflectionText);
          const sig = [
            attemptBand(item.attemptNumber ?? 1),
            decisionCountBand(item.stepsCount ?? 0),
            wordCountBand(rWords),
            wordCountBand(fWords),
          ].join("|");
          const matchingRows = csvRows1.filter((r) => [r[4], r[6], r[7], r[8]].join("|") === sig);
          expect(matchingRows.length).toBe(3);
        }
        // Documented residual boundary: per-student row multiplicity still distinguishes 3 attempts (stu 5) from 2 (stu 4).
        const rowCountsByCode = new Map<string, number>();
        for (const r of csvRows1) rowCountsByCode.set(r[0], (rowCountsByCode.get(r[0]) ?? 0) + 1);
        expect(rowCountsByCode.get(code(cohortStudents[5].uid))).toBe(3);
        expect(rowCountsByCode.get(code(cohortStudents[4].uid))).toBe(2);

        // Documented residual boundary: a unique extreme outlier (3+ decisions, 151+ words) still matches 1-to-1.
        const outlierItem = queue.items.find((i) => i.studentName.endsWith(" 8"))!;
        const outlierMatches = csvRows1.filter(
          (r) =>
            r[4] === attemptBand(outlierItem.attemptNumber ?? 1) &&
            r[6] === decisionCountBand(outlierItem.stepsCount ?? 0) &&
            r[7] === "151+" &&
            r[8] === "151+",
        );
        expect(outlierMatches).toHaveLength(1);
        expect(outlierMatches[0][10]).toBe("30m+");

        // REVIEW_STUDY export + queue parity check: SQL WORDS matches JS wordCount on multiline/whitespace-only text,
        // and each band bucket holds >= 2 rows while demonstrating low-entropy 2-band & cross-case intersection limits.
        const reviewQueue = await feedback.getQueue(id.lect1, { caseId: kReviewCohort });
        const reviewCsv = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: kReviewCohort });
        expect(reviewCsv).not.toMatch(/\d{4}-\d{2}-\d{2}/);
        const reviewRows = reviewCsv.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(","));
        expect(reviewRows).toHaveLength(6);
        expect(reviewRows.every((r) => r[4] === "1" && r[5] === "true" && r[6] === "0" && r[10] === "")).toBe(true);
        const stu0Review = reviewRows.find((r) => r[0] === code(cohortStudents[0].uid))!;
        const stu4Review = reviewRows.find((r) => r[0] === code(cohortStudents[4].uid))!;
        expect([stu0Review[7], stu0Review[8]]).toEqual(["1-25", "1-25"]); // multiline/tabbed SQL WORDS === JS wordCount
        expect([stu4Review[7], stu4Review[8]]).toEqual(["26-75", "0"]); // whitespace-only "\n\t\r" reflection === "0", not "1-25"
        for (const item of reviewQueue.items) {
          const rBand = wordCountBand(wordCount(item.studentAnalysis) + wordCount(item.proposedSolution) + wordCount(item.reasoningText));
          const fBand = wordCountBand(wordCount(item.reflectionText));
          const matches = reviewRows.filter((r) => r[7] === rBand && r[8] === fBand);
          expect(matches.length).toBeGreaterThanOrEqual(2);
        }
        // Cross-case intersection example: students 0..3 are in the 1-25|1-25 REVIEW_STUDY pool AND in 1-25|1-25
        // BRANCHING_STUDY pool (students 0..3), whereas intersection narrows students 4..5 vs 6..7 (6..7 absent from review case).
        const reviewPoolCodes = new Set(reviewRows.map((r) => r[0]));
        const b2675Codes = csvRows1.filter((r) => r[4] === "1" && r[7] === "26-75" && r[8] === "26-75").map((r) => r[0]);
        expect(b2675Codes).toHaveLength(4);
        expect(b2675Codes.filter((c) => reviewPoolCodes.has(c))).toHaveLength(2); // cross-case presence cuts pool in half

        // Analytical utility: challenge_rounds (0,1,2), attempt bands (1, 2+), word bands, and duration bands remain analyzable.
        expect(new Set(csvRows1.map((r) => r[9]))).toEqual(new Set(["0", "1", "2"]));
        expect(new Set(csvRows1.map((r) => r[4]))).toEqual(new Set(["1", "2+"]));
        expect(new Set(csvRows1.map((r) => r[10]))).toEqual(new Set(["1-5m", "5-15m", "30m+"]));

        // Cross-export stability (AC-R5) + known differencing trade-off:
        // Add 1 late student (idx 9), re-export -> prior codes stay identical; delta isolates new row.
        const lateAttempt = randomUUID();
        await pool.query(
          `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, started_at, completed_at)
           VALUES ($1,$2,$3,1,TRUE,$4,$5, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '9 minutes')`,
          [lateAttempt, cohortStudents[9].uid, kCohort, nodes[2], wordsOfLen(10)],
        );
        const csv2 = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: kCohort });
        const csvRows2 = csv2.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(","));
        expect(csvRows2).toHaveLength(13);
        const priorCodes = new Set(csvRows1.map((r) => r[0]));
        const nextCodes = new Set(csvRows2.map((r) => r[0]));
        for (const c of priorCodes) expect(nextCodes.has(c)).toBe(true);
        const deltaCodes = [...nextCodes].filter((c) => !priorCodes.has(c));
        expect(deltaCodes).toEqual([code(cohortStudents[9].uid)]);
      } finally {
        await pool.query(
          `DELETE FROM challenge_support_sessions WHERE reasoning_id IN (SELECT sr.id FROM student_reasoning sr JOIN branching_attempts ba ON ba.id = sr.attempt_id WHERE ba.case_id = $1)`,
          [kCohort],
        );
        await pool.query(
          `DELETE FROM student_reasoning WHERE attempt_id IN (SELECT id FROM branching_attempts WHERE case_id = $1)`,
          [kCohort],
        );
        await pool.query(`DELETE FROM branching_attempts WHERE case_id = $1`, [kCohort]);
        await pool.query(`DELETE FROM review_study_submissions WHERE case_id = $1`, [kReviewCohort]);
        await pool.query(
          `DELETE FROM case_options WHERE node_id IN (SELECT id FROM case_nodes WHERE case_id = $1)`,
          [kCohort],
        );
        await pool.query(`DELETE FROM cases WHERE id IN ($1, $2)`, [kCohort, kReviewCohort]);
        for (const s of cohortStudents) {
          await pool.query(`DELETE FROM course_enrollments WHERE student_id = $1`, [s.uid]);
          await pool.query(`DELETE FROM users WHERE id = $1`, [s.uid]);
        }
      }
    });

    itDb("rubric export uses evaluator codes, never names or ids", async () => {
      const extra = randomUUID();
      await pool.query(
        `INSERT INTO case_rubric_evaluations (id, case_id, evaluator_id, realism_score, difficulty_score, alignment_score)
         VALUES ($1,$2,$3,3,3,3)`,
        [extra, id.k1, id.admin2],
      );
      const withThird = await evaluation.exportCsv(asUser(id.admin1, "ADMIN"), { dataset: "rubrics" });
      await pool.query(`DELETE FROM case_rubric_evaluations WHERE id = $1`, [extra]);
      // L3 option C: case → evaluator code; not creation order, table order or raw id order.
      expect(withThird.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(",")[3])).toEqual([
        code(id.admin1), code(id.admin2), code(id.lect1),
      ]);

      const csv = await evaluation.exportCsv(asUser(id.admin1, "ADMIN"), { dataset: "rubrics" });
      const lines = csv.slice(1).trim().split("\r\n");
      expect(lines[0]).toBe(
        "case_id,course_code,learning_mode,evaluator_code,realism_score,difficulty_score,alignment_score,average_score",
      );
      const rows = lines.slice(1).map((l) => l.split(","));
      expect(rows).toHaveLength(2);
      expect(rows.every((r) => /^P-[0-9a-f]{12}$/.test(r[3]))).toBe(true);
      expect(csv).not.toMatch(/\d{4}-\d{2}-\d{2}/); // L3 option C: no created_at
      expect(rows.map((r) => `${r[0]}|${r[3]}`)).toEqual([`${id.k1}|${code(id.admin1)}`, `${id.k1}|${code(id.lect1)}`]);
      for (const value of [PII.lect1.name, "Admin One", id.lect1, id.admin1, "Thuc te"]) expect(csv).not.toContain(value);
    });

    itDb("delete is limited to the evaluator", async () => {
      await expect(evaluation.remove(asUser(id.lect2, "LECTURER"), rubricId)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(evaluation.remove(asUser(id.lect1, "LECTURER"), rubricId)).resolves.toEqual({ id: rubricId });
      await expect(evaluation.getById(asUser(id.lect1, "LECTURER"), rubricId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
