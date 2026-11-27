import { Pool } from "pg";
import { randomUUID } from "crypto";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import { MigrationRunner } from "../src/common/database/migration-runner";
import { AuditService } from "../src/common/audit/audit.service";
import { CaseService } from "../src/modules/case/case.service";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";
import { ChallengeSupportService } from "../src/modules/challenge-support/challenge-support.service";

/**
 * D5 / INV-01 (PO decision 2026-11-27), real PostgreSQL 16:
 * - a PUBLISHED case with at least one attempt cannot go back to DRAFT; without attempts it can;
 * - in-progress attempts continue to terminal, completed attempts and reflection stay readable;
 * - "start attempt" and "revert to DRAFT" never interleave (both lock the case row);
 * - students cannot act on attempts of a case that is not PUBLISHED (older data).
 * Uses its own throwaway database `edubranch_publish_lock_it` and drops it afterwards; CREATE/DROP go through the
 * `postgres` maintenance database, so this suite never connects to the dev database `edubranch_ai`.
 */
describe("D5 publish lock + INV-01 for attempts — real PostgreSQL", () => {
  const base = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
    connectionTimeoutMillis: 2000,
  };
  const DB_NAME = "edubranch_publish_lock_it";

  let pool: Pool | undefined;
  let reachable = false;
  let caseService: CaseService;
  let attemptService: BranchingAttemptService;
  let challengeService: ChallengeSupportService;
  const ai = { generateChallenge: jest.fn() };

  const lecturer = randomUUID();
  const students = Array.from({ length: 3 }, () => randomUUID());
  const course = randomUUID();

  const q = (t: string, p: unknown[] = []) => pool!.query(t, p);

  /** A published case: root --(go)--> terminal. Returns ids. */
  async function publishedCase(title: string, status = "PUBLISHED") {
    const caseId = randomUUID();
    const root = randomUUID();
    const term = randomUUID();
    const opt = randomUUID();
    await q(
      `INSERT INTO cases (id, title, description, course_id, created_by, status, learning_mode)
       VALUES ($1,$2,'d',$3,$4,$5,'BRANCHING_STUDY')`,
      [caseId, title, course, lecturer, status],
    );
    await q(
      `INSERT INTO case_nodes (id, case_id, situation, is_terminal, node_index) VALUES
         ($1,$3,'Root',FALSE,0), ($2,$3,'End',TRUE,1)`,
      [root, term, caseId],
    );
    await q(`INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES ($1,$2,'Go','Cons',$3)`, [
      opt,
      root,
      term,
    ]);
    await q(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [root, caseId]);
    return { caseId, root, term, opt };
  }
  const statusOf = async (caseId: string) => (await q(`SELECT status FROM cases WHERE id = $1`, [caseId])).rows[0].status;
  const attemptCount = async (caseId: string) =>
    Number((await q(`SELECT COUNT(*)::int AS n FROM branching_attempts WHERE case_id = $1`, [caseId])).rows[0].n);

  beforeAll(async () => {
    const admin0 = new Pool({ ...base, database: "postgres" });
    try {
      await admin0.query(`DROP DATABASE IF EXISTS ${DB_NAME}`);
      await admin0.query(`CREATE DATABASE ${DB_NAME}`);
      pool = new Pool({ ...base, database: DB_NAME, max: 20 });
      await new MigrationRunner(pool).run();
      reachable = true;
    } catch (err: any) {
      console.warn(`[publish-lock integration] PostgreSQL not available (${err.message}); skipping.`);
      return;
    } finally {
      await admin0.end().catch(() => undefined);
    }
    const db = { query: (t: string, p?: any[]) => pool!.query(t, p), getClient: () => pool!.connect() } as any;
    caseService = new CaseService(db, { generateCase: jest.fn() } as any, new AuditService(db));
    attemptService = new BranchingAttemptService(db);
    challengeService = new ChallengeSupportService(db, ai as any);

    await q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,'lect@uni.edu.vn','h','Lecturer','LECTURER')`, [
      lecturer,
    ]);
    for (const [i, s] of students.entries()) {
      await q(`INSERT INTO users (id, email, password_hash, full_name, role) VALUES ($1,$2,'h',$3,'STUDENT')`, [
        s,
        `stu${i}@student.edu.vn`,
        `Student ${i}`,
      ]);
    }
    await q(
      `INSERT INTO courses (id, name, description, course_code, lecturer_id, invite_code, invite_code_active, is_active)
       VALUES ($1,'Course','d','CRS-L',$2,'LOCKCODE',TRUE,TRUE)`,
      [course, lecturer],
    );
  }, 60000);

  afterAll(async () => {
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

  const itDb = (name: string, fn: () => Promise<void>, timeout?: number) =>
    it(
      name,
      async () => {
        if (!reachable) return console.warn(`[publish-lock integration] skipped: ${name}`);
        await fn();
      },
      timeout,
    );

  itDb("a PUBLISHED case with an attempt cannot return to DRAFT (409); status and attempt are unchanged", async () => {
    const c = await publishedCase("Locked");
    await attemptService.startAttempt(c.caseId, students[0]);
    await expect(caseService.updateCaseStatus(c.caseId, lecturer, "DRAFT")).rejects.toThrow(ConflictException);
    expect(await statusOf(c.caseId)).toBe("PUBLISHED");
    expect(await attemptCount(c.caseId)).toBe(1);
  });

  itDb("a PUBLISHED case without attempts can still return to DRAFT; then no attempt can start (403)", async () => {
    const c = await publishedCase("Editable");
    await expect(caseService.updateCaseStatus(c.caseId, lecturer, "DRAFT")).resolves.toEqual({ id: c.caseId, status: "DRAFT" });
    await expect(attemptService.startAttempt(c.caseId, students[0])).rejects.toThrow(ForbiddenException);
    expect(await attemptCount(c.caseId)).toBe(0);
  });

  itDb("D5: an in-progress attempt continues to terminal; the completed attempt and its reflection stay readable", async () => {
    const c = await publishedCase("Journey");
    const started = await attemptService.startAttempt(c.caseId, students[1]);
    const done = await attemptService.chooseOption(started.id, students[1], { nodeId: c.root, selectedOptionId: c.opt });
    expect(done.isCompleted).toBe(true);
    await attemptService.submitReflection(started.id, students[1], { reflectionText: "What I learned" });
    // The lecturer cannot unpublish it any more, so the history stays on published content.
    await expect(caseService.updateCaseStatus(c.caseId, lecturer, "DRAFT")).rejects.toThrow(ConflictException);
    const view = await attemptService.getAttempt(started.id, students[1]);
    expect(view.reflectionStatus).toBe("SUBMITTED");
    expect(view.steps[0].consequence).toBe("Cons");
    expect((await attemptService.getAttemptsByCase(c.caseId, students[1])).length).toBe(1);
  });

  itDb("older data: attempts of a case that is no longer PUBLISHED are closed to the student (403, list empty)", async () => {
    const c = await publishedCase("Legacy");
    const a = await attemptService.startAttempt(c.caseId, students[2]);
    // Simulate a case unpublished before this rule existed.
    await q(`UPDATE cases SET status = 'DRAFT' WHERE id = $1`, [c.caseId]);
    await expect(attemptService.getAttempt(a.id, students[2])).rejects.toThrow(ForbiddenException);
    await expect(
      attemptService.chooseOption(a.id, students[2], { nodeId: c.root, selectedOptionId: c.opt }),
    ).rejects.toThrow(ForbiddenException);
    expect(await attemptService.getAttemptsByCase(c.caseId, students[2])).toEqual([]);
    // Nothing was written by the rejected step.
    const steps = await q(`SELECT COUNT(*)::int AS n FROM student_reasoning WHERE attempt_id = $1`, [a.id]);
    expect(steps.rows[0].n).toBe(0);
    // Challenge Support on that attempt's reasoning is refused too, before any AI call.
    const r = randomUUID();
    await q(
      `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES ($1,$2,$3,$4,'why')`,
      [r, a.id, c.root, c.opt],
    );
    await expect(challengeService.createOrGetSession(students[2], { reasoningId: r } as any)).rejects.toThrow(ForbiddenException);
    expect(ai.generateChallenge).not.toHaveBeenCalled();
    // The lecturer's own view is not affected by the student-only rule.
    await expect(attemptService.getAttempt(a.id, undefined, true)).resolves.toMatchObject({ id: a.id });
  });

  itDb(
    "race: start attempt vs revert to DRAFT, run concurrently 25 times — never DRAFT with an attempt",
    async () => {
      const outcomes = { attemptWon: 0, revertWon: 0 };
      for (let i = 0; i < 25; i++) {
        const c = await publishedCase(`Race ${i}`);
        const [start, revert] = await Promise.allSettled([
          attemptService.startAttempt(c.caseId, students[i % students.length]),
          caseService.updateCaseStatus(c.caseId, lecturer, "DRAFT"),
        ]);
        const status = await statusOf(c.caseId);
        const n = await attemptCount(c.caseId);
        // Invariant: an attempt exists only on a PUBLISHED case.
        expect(status === "DRAFT" && n > 0).toBe(false);
        if (start.status === "fulfilled") {
          // The attempt committed first; the revert must have been refused.
          expect(revert.status).toBe("rejected");
          expect((revert as PromiseRejectedResult).reason).toBeInstanceOf(ConflictException);
          expect([status, n]).toEqual(["PUBLISHED", 1]);
          outcomes.attemptWon++;
        } else {
          // The revert committed first; starting on a DRAFT case must have been refused.
          expect((start as PromiseRejectedResult).reason).toBeInstanceOf(ForbiddenException);
          expect(revert.status).toBe("fulfilled");
          expect([status, n]).toEqual(["DRAFT", 0]);
          outcomes.revertWon++;
        }
      }
      expect(outcomes.attemptWon + outcomes.revertWon).toBe(25);
      console.log(`[publish-lock integration] race outcomes: ${JSON.stringify(outcomes)}`);
    },
    60000,
  );
});
