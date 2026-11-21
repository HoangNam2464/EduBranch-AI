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
import { EvaluationService } from "../src/modules/evaluation/evaluation.service";

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
  let evaluation: EvaluationService;

  const id = {
    admin1: randomUUID(), admin2: randomUUID(),
    lect1: randomUUID(), lect2: randomUUID(),
    stu1: randomUUID(), stu2: randomUUID(),
    c1: randomUUID(), c2: randomUUID(), c3: randomUUID(),
    k1: randomUUID(), k2: randomUUID(), k3: randomUUID(), k4: randomUUID(),
    n1: randomUUID(), n2: randomUUID(), n3: randomUUID(), n4: randomUUID(), n5: randomUUID(),
    o1: randomUUID(), o2: randomUUID(), o3: randomUUID(),
    a1: randomUUID(), a2: randomUUID(), a3: randomUUID(), a4: randomUUID(),
    r1: randomUUID(), r2: randomUUID(), r3: randomUUID(),
    s1: randomUUID(), s2: randomUUID(),
  };
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
      q(`INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, is_completed, outcome_node_id, reflection_text, completed_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7, CASE WHEN $5 THEN NOW() - ($8::int * INTERVAL '1 hour') ELSE NULL END)`,
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

      const before = await admin.getSettings();
      expect(before.platformName).toBe("EduBranch AI");
      expect(before.limits.maxFileSize).toBeNull();
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

    itDb("activity export: only the lecturer's own courses, counts only, no PII (AC-R4, AC-R5)", async () => {
      const csv = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity" });
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      const lines = csv.slice(1).trim().split("\r\n");
      expect(lines[0]).toBe(
        "participant_code,course_code,case_id,learning_mode,attempt_number,completed,decision_count,choice_path,outcome_node_id,reasoning_word_count,reflection_word_count,challenge_rounds,started_at,completed_at",
      );
      const rows = lines.slice(1).map((l) => l.split(","));
      expect(rows).toHaveLength(5); // 3 attempts on K1 + 2 submissions on K2; nothing from lecturer 2
      expect(rows.every((r) => r[1] === "MKT301")).toBe(true);

      const a1 = rows.find((r) => r[7] === id.o1)!;
      expect(a1).toBeDefined();
      expect(a1[4]).toBe("1");
      expect(a1[6]).toBe("1");
      expect(a1[9]).toBe(String(3 + PII.stu1.name.split(" ").length));
      expect(a1[10]).toBe("5");
      expect(a1[11]).toBe("2");
      // A second decision on the same attempt with its own 2-round session stays within 0-2 (QG2 M2).
      const extraNode = randomUUID();
      const extraReasoning = randomUUID();
      await pool.query(`INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES ($1,$2,'s',FALSE,3)`, [extraNode, id.k1]);
      await pool.query(`INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id) VALUES ($1,$2,$3,$4)`, [extraReasoning, id.a1, extraNode, id.o2]);
      await pool.query(`INSERT INTO challenge_support_sessions (reasoning_id, current_round) VALUES ($1, 2)`, [extraReasoning]);
      const again = await evaluation.exportCsv(asUser(id.lect1, "LECTURER"), { dataset: "activity", caseId: id.k1 });
      const a1Again = again.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(",")).find((r) => r[4] === "1" && r[0] === a1[0])!;
      expect(a1Again[6]).toBe("2");
      expect(a1Again[11]).toBe("2");
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

    itDb("rubric export uses evaluator codes, never names or ids", async () => {
      const csv = await evaluation.exportCsv(asUser(id.admin1, "ADMIN"), { dataset: "rubrics" });
      const rows = csv.slice(1).trim().split("\r\n").slice(1).map((l) => l.split(","));
      expect(rows).toHaveLength(2);
      expect(rows.every((r) => /^P-[0-9a-f]{12}$/.test(r[3]))).toBe(true);
      for (const value of [PII.lect1.name, "Admin One", id.lect1, id.admin1, "Thuc te"]) expect(csv).not.toContain(value);
    });

    itDb("delete is limited to the evaluator", async () => {
      await expect(evaluation.remove(asUser(id.lect2, "LECTURER"), rubricId)).rejects.toBeInstanceOf(ForbiddenException);
      await expect(evaluation.remove(asUser(id.lect1, "LECTURER"), rubricId)).resolves.toEqual({ id: rubricId });
      await expect(evaluation.getById(asUser(id.lect1, "LECTURER"), rubricId)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
