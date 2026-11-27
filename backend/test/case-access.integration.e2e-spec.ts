import { Pool } from "pg";
import { randomUUID } from "crypto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { MigrationRunner } from "../src/common/database/migration-runner";
import { AuditService } from "../src/common/audit/audit.service";
import { CaseService } from "../src/modules/case/case.service";
import { CourseService } from "../src/modules/course/course.service";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";

/**
 * Real PostgreSQL 16 integration tests for CASE-ACCESS-HARDENING (H1–H3, G, H, I).
 * Uses a dedicated throwaway database `edubranch_case_access_it` (never writes to `edubranch_ai`),
 * runs MigrationRunner V1–V8, and drops the throwaway database in afterAll.
 */
describe("Case Access Hardening — real PostgreSQL integration (H1–H3, G, H, I)", () => {
  const base = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
    connectionTimeoutMillis: 2000,
  };
  const DB_NAME = "edubranch_case_access_it";

  let pool: Pool | undefined;
  let reachable = false;
  let caseService: CaseService;
  let courseService: CourseService;
  let attemptService: BranchingAttemptService;

  const id = {
    admin: randomUUID(),
    lectA: randomUUID(),
    lectB: randomUUID(),
    stuS: randomUUID(),
    stuT: randomUUID(),
    cA: randomUUID(),
    cB: randomUUID(),
    cC: randomUUID(),
    dA: randomUUID(),
    pA: randomUUID(),
    dB: randomUUID(),
    pB: randomUUID(),
    dC: randomUUID(),
    dANode: randomUUID(),
    dAOpt: randomUUID(),
    nRoot: randomUUID(),
    nMid: randomUUID(),
    nTerm: randomUUID(),
    optToMid: randomUUID(),
    optNullTerm: randomUUID(),
    optToTerm: randomUUID(),
    optCrossCase: randomUUID(),
    nOtherCase: randomUUID(),
  };

  beforeAll(async () => {
    const admin0 = new Pool({ ...base, database: process.env.POSTGRES_DB || "edubranch_ai" });
    try {
      await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      await admin0.query(`CREATE DATABASE ${DB_NAME}`);
      pool = new Pool({ ...base, database: DB_NAME });
      await new MigrationRunner(pool).run();
      reachable = true;
    } catch (err: any) {
      console.warn(`[case-access integration] PostgreSQL not available (${err.message}); skipping.`);
      return;
    } finally {
      await admin0.end().catch(() => undefined);
    }

    const db = { query: (t: string, p?: any[]) => pool!.query(t, p), getClient: () => pool!.connect() } as any;
    const audit = new AuditService(db);
    caseService = new CaseService(db, { generateCase: jest.fn() } as any, audit);
    courseService = new CourseService(db);
    attemptService = new BranchingAttemptService(db);

    const q = (t: string, p: any[]) => pool!.query(t, p);

    // Users
    const insUser = (uid: string, email: string, name: string, role: string) =>
      q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'hash',$3,$4)`, [
        uid,
        email,
        name,
        role,
      ]);
    await insUser(id.admin, "admin@uni.edu.vn", "Admin User", "ADMIN");
    await insUser(id.lectA, "lectA@uni.edu.vn", "Lecturer A", "LECTURER");
    await insUser(id.lectB, "lectB@uni.edu.vn", "Lecturer B", "LECTURER");
    await insUser(id.stuS, "stuS@student.edu.vn", "Student S", "STUDENT");
    await insUser(id.stuT, "stuT@student.edu.vn", "Student T", "STUDENT");

    // Courses: A (owned by A), B (owned by B), C (owned by B)
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1,'Course A','Desc A','CRS-A',$2,'INVITEA1',TRUE,TRUE)`,
      [id.cA, id.lectA],
    );
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1,'Course B','Desc B','CRS-B',$2,'INVITEB1',TRUE,TRUE)`,
      [id.cB, id.lectB],
    );
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1,'Course C','Desc C','CRS-C',$2,'INVITEC1',TRUE,TRUE)`,
      [id.cC, id.lectB],
    );

    // Enrollment: Student S in Course A only; Student T enrolled nowhere
    await q(`INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2)`, [id.cA, id.stuS]);

    // Cases
    const insCase = (cid: string, courseId: string, creator: string, status: string, title: string) =>
      q(
        `INSERT INTO cases (id, title, description, course_id, created_by, status, learning_mode, context_text, problem_text)
         VALUES ($1,$2,'Description',$3,$4,$5,'BRANCHING_STUDY','ctx','prob')`,
        [cid, title, courseId, creator, status],
      );
    await insCase(id.dA, id.cA, id.lectA, "DRAFT", "Draft A");
    await insCase(id.pA, id.cA, id.lectA, "PUBLISHED", "Published A");
    await insCase(id.dB, id.cB, id.lectB, "DRAFT", "Draft B");
    await insCase(id.pB, id.cB, id.lectB, "PUBLISHED", "Published B");
    await insCase(id.dC, id.cC, id.lectB, "DRAFT", "Draft C");

    // Draft A small tree
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES ($1,$2,'Draft root',FALSE,0)`,
      [id.dANode, id.dA],
    );
    await q(
      `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES ($1,$2,'Draft opt','Draft cons',NULL)`,
      [id.dAOpt, id.dANode],
    );
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [id.dANode, id.dA]);

    // Published B node (also target of cross-case bad edge test in H)
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES ($1,$2,'Other case node',TRUE,0)`,
      [id.nOtherCase, id.pB],
    );
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [id.nOtherCase, id.pB]);

    // Published A tree: nRoot -> (optToMid -> nMid, optNullTerm -> NULL); nMid -> (optToTerm -> nTerm, optCrossCase -> nOtherCase)
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
         ($1,$4,'Root situation',FALSE,0),
         ($2,$4,'Middle situation',FALSE,1),
         ($3,$4,'Terminal situation',TRUE,2)`,
      [id.nRoot, id.nMid, id.nTerm, id.pA],
    );
    await q(
      `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
         ($1,$5,'Go mid','Cons mid',$6),
         ($2,$5,'End at root','Cons null',NULL),
         ($3,$6,'Go terminal','Cons term',$7),
         ($4,$6,'Bad cross-case','Cons bad',$8)`,
      [id.optToMid, id.optNullTerm, id.optToTerm, id.optCrossCase, id.nRoot, id.nMid, id.nTerm, id.nOtherCase],
    );
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [id.nRoot, id.pA]);
  }, 60000);

  afterAll(async () => {
    if (pool) {
      await pool.end().catch(() => undefined);
    }
    if (reachable) {
      const admin0 = new Pool({ ...base, database: process.env.POSTGRES_DB || "edubranch_ai" });
      try {
        await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      } finally {
        await admin0.end().catch(() => undefined);
      }
    }
  });

  const itDb = (name: string, fn: () => Promise<void>) =>
    it(name, async () => {
      if (!reachable) return console.warn(`[case-access integration] skipped: ${name}`);
      await fn();
    });

  describe("H1: getCaseById ownership & visibility", () => {
    itDb("H1: lecturer A reads dA with full tree; lecturer B gets 403 on dA and pA", async () => {
      const owned = await caseService.getCaseById(id.dA, "LECTURER", id.lectA);
      expect(owned.id).toBe(id.dA);
      expect(owned.nodes).toHaveLength(1);
      expect(owned.nodes[0].options).toHaveLength(1);

      await expect(caseService.getCaseById(id.dA, "LECTURER", id.lectB)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      await expect(caseService.getCaseById(id.pA, "LECTURER", id.lectB)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    itDb("H1: ADMIN reads dA with full tree", async () => {
      const adminView = await caseService.getCaseById(id.dA, "ADMIN", id.admin);
      expect(adminView.id).toBe(id.dA);
      expect(adminView.nodes).toHaveLength(1);
    });

    itDb("H1: student S reads pA without tree/consequence; T reads pB via direct link; S gets 403 on dA", async () => {
      const sView = await caseService.getCaseById(id.pA, "STUDENT", id.stuS);
      expect(sView.id).toBe(id.pA);
      expect(sView.status).toBe("PUBLISHED");
      expect(sView.nodes).toBeUndefined();
      expect(sView.all_options).toBeUndefined();
      expect(JSON.stringify(sView)).not.toContain("consequence");

      const tView = await caseService.getCaseById(id.pB, "STUDENT", id.stuT);
      expect(tView.id).toBe(id.pB);
      expect(tView.nodes).toBeUndefined();

      await expect(caseService.getCaseById(id.dA, "STUDENT", id.stuS)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    itDb("H1: random uuid returns 404 and undefined role returns 403", async () => {
      await expect(caseService.getCaseById(randomUUID(), "STUDENT", id.stuS)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      await expect(caseService.getCaseById(id.pA, undefined, id.stuS)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe("H2: getCasesByCourse ownership & enrollment", () => {
    itDb("H2: A and ADMIN see both cases of course A; lecturer B gets 403", async () => {
      const aCases = await caseService.getCasesByCourse(id.cA, { id: id.lectA, role: "LECTURER" });
      expect(aCases.map((c: any) => c.id).sort()).toEqual([id.dA, id.pA].sort());

      const adminCases = await caseService.getCasesByCourse(id.cA, { id: id.admin, role: "ADMIN" });
      expect(adminCases.map((c: any) => c.id).sort()).toEqual([id.dA, id.pA].sort());

      await expect(
        caseService.getCasesByCourse(id.cA, { id: id.lectB, role: "LECTURER" }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    itDb("H2: enrolled student S sees only pA with exact student columns; un-enrolled gets 403; unknown course gets 404", async () => {
      const sCases = await caseService.getCasesByCourse(id.cA, { id: id.stuS, role: "STUDENT" });
      expect(sCases).toHaveLength(1);
      expect(sCases[0].id).toBe(id.pA);
      expect(Object.keys(sCases[0]).sort()).toEqual(
        ["id", "title", "description", "course_id", "status", "learning_mode", "created_at", "updated_at"].sort(),
      );

      await expect(
        caseService.getCasesByCourse(id.cB, { id: id.stuS, role: "STUDENT" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await expect(
        caseService.getCasesByCourse(id.cA, { id: id.stuT, role: "STUDENT" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      await expect(
        caseService.getCasesByCourse(randomUUID(), { id: id.stuS, role: "STUDENT" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe("H3: getCourseForViewer ownership & student access", () => {
    itDb("H3: A and ADMIN see full row of course A; B gets 403; unknown gets 404", async () => {
      const aRow = await courseService.getCourseForViewer(id.cA, { id: id.lectA, role: "LECTURER" });
      expect(aRow.id).toBe(id.cA);
      expect(aRow.lecturer_id).toBe(id.lectA);

      await expect(
        courseService.getCourseForViewer(id.cA, { id: id.lectB, role: "LECTURER" }),
      ).rejects.toBeInstanceOf(ForbiddenException);

      const adminRow = await courseService.getCourseForViewer(id.cA, { id: id.admin, role: "ADMIN" });
      expect(adminRow.id).toBe(id.cA);
      expect(adminRow.lecturer_id).toBe(id.lectA);

      await expect(
        courseService.getCourseForViewer(randomUUID(), { id: id.admin, role: "ADMIN" }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    itDb("H3: student S sees course A projection without lecturer_id/invite; T sees course B (has pB) but gets 403 on course C (no PUBLISHED)", async () => {
      const sCourse = await courseService.getCourseForViewer(id.cA, { id: id.stuS, role: "STUDENT" });
      expect(sCourse.id).toBe(id.cA);
      expect(sCourse.lecturer_id).toBeUndefined();
      expect(sCourse.invite_code).toBeUndefined();
      expect(sCourse.invite_code_active).toBeUndefined();
      expect(Object.keys(sCourse).sort()).toEqual(
        ["id", "name", "description", "course_code", "active", "is_active", "created_at", "updated_at"].sort(),
      );

      const tCourseB = await courseService.getCourseForViewer(id.cB, { id: id.stuT, role: "STUDENT" });
      expect(tCourseB.id).toBe(id.cB);
      expect(tCourseB.lecturer_id).toBeUndefined();

      await expect(
        courseService.getCourseForViewer(id.cC, { id: id.stuT, role: "STUDENT" }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe("G: concurrent startAttempt allocation", () => {
    itDb("G: two concurrent startAttempt calls allocate distinct attempt numbers {1, 2}", async () => {
      const [first, second] = await Promise.all([
        attemptService.startAttempt(id.pA, id.stuS),
        attemptService.startAttempt(id.pA, id.stuS),
      ]);
      expect([first.attemptNumber, second.attemptNumber].sort((a, b) => a - b)).toEqual([1, 2]);
    });
  });

  describe("H: chooseOption cross-case guard & NULL terminal path", () => {
    itDb("H: cross-case next_node_id returns 400 and leaves attempt unchanged; NULL terminal path completes attempt with outcome = current node", async () => {
      // 1. Cross-case next_node_id test
      const att1 = await attemptService.startAttempt(id.pA, id.stuT);
      await attemptService.chooseOption(att1.id, id.stuT, {
        nodeId: id.nRoot,
        selectedOptionId: id.optToMid,
      });

      await expect(
        attemptService.chooseOption(att1.id, id.stuT, {
          nodeId: id.nMid,
          selectedOptionId: id.optCrossCase,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      const persisted = await pool!.query(
        "SELECT current_node_id, is_completed, outcome_node_id FROM branching_attempts WHERE id = $1",
        [att1.id],
      );
      expect(persisted.rows[0]).toEqual({
        current_node_id: id.nMid,
        is_completed: false,
        outcome_node_id: null,
      });
      const midReasoning = await pool!.query(
        "SELECT id FROM student_reasoning WHERE attempt_id = $1 AND node_id = $2",
        [att1.id, id.nMid],
      );
      expect(midReasoning.rows).toHaveLength(0);

      // 2. NULL terminal path test
      const att2 = await attemptService.startAttempt(id.pA, id.stuT);
      const completed = await attemptService.chooseOption(att2.id, id.stuT, {
        nodeId: id.nRoot,
        selectedOptionId: id.optNullTerm,
      });
      expect(completed.isCompleted).toBe(true);
      expect(completed.outcomeNodeId).toBe(id.nRoot);
    });
  });

  describe("I: saveRetrospectiveReasoning completion gate", () => {
    itDb("I: rejects reasoning on in-progress attempt with 400, succeeds after completion", async () => {
      const att = await attemptService.startAttempt(id.pA, id.stuT);
      await attemptService.chooseOption(att.id, id.stuT, {
        nodeId: id.nRoot,
        selectedOptionId: id.optToMid,
      });

      await expect(
        attemptService.saveRetrospectiveReasoning(att.id, id.stuT, {
          nodeId: id.nRoot,
          reasoningText: "Premature reasoning",
        }),
      ).rejects.toThrow(
        new BadRequestException("Retrospective reasoning is available only after the attempt is completed"),
      );

      await attemptService.chooseOption(att.id, id.stuT, {
        nodeId: id.nMid,
        selectedOptionId: id.optToTerm,
      });

      const saved = await attemptService.saveRetrospectiveReasoning(att.id, id.stuT, {
        nodeId: id.nRoot,
        reasoningText: "Retrospective justification",
      });
      expect(saved.status).toBe("SAVED");

      const dbRow = await pool!.query(
        "SELECT reasoning_text FROM student_reasoning WHERE attempt_id = $1 AND node_id = $2",
        [att.id, id.nRoot],
      );
      expect(dbRow.rows[0].reasoning_text).toBe("Retrospective justification");
    });
  });
});
