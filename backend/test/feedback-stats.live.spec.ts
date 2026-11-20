/**
 * Live SQL Integration Test for Review Study, Lecturer Feedback & Statistics (T041).
 * Opt-in with QA_LIVE=1; skipped otherwise.
 * Creates an isolated temporary database (zz_fs_live_<random>), applies migrations,
 * tests real constraints (UNIQUE, CHECK, concurrency race), and drops temporary DB in afterAll.
 */
import * as fs from "fs";
import * as path from "path";
import { randomBytes, randomUUID } from "crypto";
import { Pool } from "pg";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { ConflictException } from "@nestjs/common";

import { DatabaseService } from "../src/common/database/database.service";
import { ReviewStudyService } from "../src/modules/review-study/review-study.service";
import { LecturerFeedbackService } from "../src/modules/lecturer-feedback/lecturer-feedback.service";
import { StatisticsService } from "../src/modules/statistics/statistics.service";

const isLive = process.env.QA_LIVE === "1";
const describeLive = isLive ? describe : describe.skip;

describeLive("Feedback & Statistics Live SQL Integration (T041 / QA_LIVE=1)", () => {
  let adminPool: Pool;
  let testPool: Pool;
  let tempDbName: string;
  let moduleRef: TestingModule;

  let reviewStudyService: ReviewStudyService;
  let feedbackService: LecturerFeedbackService;
  let statisticsService: StatisticsService;

  const pgHost = process.env.POSTGRES_HOST || "localhost";
  const pgPort = Number(process.env.POSTGRES_PORT || "5432");
  const pgUser = process.env.POSTGRES_USER || "edubranch";
  const pgPassword = process.env.POSTGRES_PASSWORD || "changeme_db_password";

  // Seeded entity IDs
  const lecturerId = randomUUID();
  const student1Id = randomUUID();
  const student2Id = randomUUID();
  const courseId = randomUUID();
  const reviewCaseId = randomUUID();
  const branchingCaseId = randomUUID();

  beforeAll(async () => {
    tempDbName = `zz_fs_live_${randomBytes(4).toString("hex")}`;

    // 1. Connect to default maintenance database to create isolated temp DB
    adminPool = new Pool({
      host: pgHost,
      port: pgPort,
      user: pgUser,
      password: pgPassword,
      database: "postgres",
    });

    await adminPool.query(`CREATE DATABASE "${tempDbName}"`);

    // 2. Connect to the temp DB and apply migrations
    testPool = new Pool({
      host: pgHost,
      port: pgPort,
      user: pgUser,
      password: pgPassword,
      database: tempDbName,
    });

    const migrationsDir = path.join(__dirname, "..", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.startsWith("V") && f.endsWith(".sql"))
      .sort();

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      await testPool.query(sql);
    }

    // 3. Seed baseline users, course, and cases
    await testPool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role) VALUES
       ($1, 'lecturer@uni.edu', 'hash', 'Prof. Smith', 'LECTURER'),
       ($2, 'student1@uni.edu', 'hash', 'Student Alice', 'STUDENT'),
       ($3, 'student2@uni.edu', 'hash', 'Student Bob', 'STUDENT')`,
      [lecturerId, student1Id, student2Id],
    );

    await testPool.query(
      `INSERT INTO courses (id, lecturer_id, name, course_code) VALUES
       ($1, $2, 'Corporate Governance', 'CORP101')`,
      [courseId, lecturerId],
    );

    await testPool.query(
      `INSERT INTO cases (id, course_id, created_by, title, status, learning_mode) VALUES
       ($1, $3, $4, 'Whistleblower Dilemma', 'PUBLISHED', 'REVIEW_STUDY'),
       ($2, $3, $4, 'Boardroom Hostile Takeover', 'PUBLISHED', 'BRANCHING_STUDY')`,
      [reviewCaseId, branchingCaseId, courseId, lecturerId],
    );

    // 4. Initialize Nest testing module with real DatabaseService pointing to temp DB
    // Fixed config (no ConfigModule): ConfigService reads process.env first, which could
    // point the services at a real database. This stub can only ever reach the temp DB.
    const fixedConfig: Record<string, string | number> = {
      POSTGRES_HOST: pgHost,
      POSTGRES_PORT: pgPort,
      POSTGRES_USER: pgUser,
      POSTGRES_PASSWORD: pgPassword,
      POSTGRES_DB: tempDbName,
      AUTO_MIGRATE: "false",
      NODE_ENV: "test",
    };
    moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: { get: (key: string, fallback?: unknown) => fixedConfig[key] ?? fallback },
        },
        DatabaseService,
        ReviewStudyService,
        LecturerFeedbackService,
        StatisticsService,
      ],
    }).compile();
    await moduleRef.init();

    reviewStudyService = moduleRef.get<ReviewStudyService>(ReviewStudyService);
    feedbackService = moduleRef.get<LecturerFeedbackService>(LecturerFeedbackService);
    statisticsService = moduleRef.get<StatisticsService>(StatisticsService);
  }, 60000);

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
    if (testPool) {
      await testPool.end();
    }
    if (adminPool) {
      try {
        await adminPool.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
          [tempDbName],
        );
        await adminPool.query(`DROP DATABASE IF EXISTS "${tempDbName}"`);
      } finally {
        await adminPool.end();
      }
    }
  });

  describe("Scenario 1 & 2: Review Study Submission & UNIQUE Constraint (FR-01, FR-02)", () => {
    let createdSubmissionId: string;

    it("Scenario 1: Student submits review study successfully", async () => {
      const sub = await reviewStudyService.submit(reviewCaseId, student1Id, {
        studentAnalysis: "Company bylaws conflict with securities law",
        proposedSolution: "Disclose finding to independent audit committee",
        reasoningText: "Protects fiduciary duty and avoids personal liability",
      });

      expect(sub).toBeDefined();
      expect(sub.submissionStatus).toBe("SUBMITTED");
      expect(sub.studentAnalysis).toBe("Company bylaws conflict with securities law");
      createdSubmissionId = sub.id;
    });

    it("Scenario 2: Second submission by same student fails with 409 Conflict (uq_review_submission_per_student_case)", async () => {
      await expect(
        reviewStudyService.submit(reviewCaseId, student1Id, {
          proposedSolution: "Alternative proposal",
          reasoningText: "Alternative rationale",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Scenario 3 & 4: Lecturer Feedback & Single-Feedback Invariant (FR-09..11, C2-A)", () => {
    let submissionId: string;

    beforeAll(async () => {
      const res = await testPool.query(
        `SELECT id FROM review_study_submissions WHERE student_id = $1`,
        [student1Id],
      );
      submissionId = res.rows[0].id;
    });

    it("Scenario 3: Lecturer creates qualitative feedback and transitions status to REVIEWED", async () => {
      const fb = await feedbackService.create(lecturerId, {
        reviewSubmissionId: submissionId,
        feedbackText: "Outstanding legal reasoning and ethical posture.",
      });

      expect(fb).toBeDefined();
      expect(fb.feedbackText).toBe("Outstanding legal reasoning and ethical posture.");

      // Verify status transition in DB
      const subRes = await testPool.query(
        `SELECT submission_status FROM review_study_submissions WHERE id = $1`,
        [submissionId],
      );
      expect(subRes.rows[0].submission_status).toBe("REVIEWED");
    });

    it("Scenario 4: Second feedback on same target fails with 409 Conflict (C2-A)", async () => {
      await expect(
        feedbackService.create(lecturerId, {
          reviewSubmissionId: submissionId,
          feedbackText: "Second attempt to give feedback.",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("Scenario 5: Concurrent Reflection Race Condition (FR-03, FR-07)", () => {
    it("allows only ONE simultaneous reflection submission; the second fails with 409 Conflict", async () => {
      const subRes = await testPool.query(
        `SELECT id FROM review_study_submissions WHERE student_id = $1`,
        [student1Id],
      );
      const subId = subRes.rows[0].id;

      // Submit 2 reflections concurrently
      const results = await Promise.allSettled([
        reviewStudyService.submitReflection(subId, student1Id, {
          reflectionText: "Reflection from client connection A",
        }),
        reviewStudyService.submitReflection(subId, student1Id, {
          reflectionText: "Reflection from client connection B",
        }),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      const err = (rejected[0] as PromiseRejectedResult).reason;
      expect(err).toBeInstanceOf(ConflictException);

      // Verify final status in DB
      const finalRes = await testPool.query(
        `SELECT submission_status, reflection_status FROM review_study_submissions WHERE id = $1`,
        [subId],
      );
      expect(finalRes.rows[0].submission_status).toBe("REFLECTED");
      expect(finalRes.rows[0].reflection_status).toBe("SUBMITTED");
    });
  });

  describe("Scenario 6: Database Constraints & Statistics Integrity (FR-10, FR-18)", () => {
    it("rejects direct DB insert with 0 targets or 2 targets via chk_feedback_one_target", async () => {
      // 0 targets
      await expect(
        testPool.query(
          `INSERT INTO lecturer_feedback (id, lecturer_id, feedback_text) VALUES ($1, $2, 'text')`,
          [randomUUID(), lecturerId],
        ),
      ).rejects.toThrow();

      // 2 targets
      await expect(
        testPool.query(
          `INSERT INTO lecturer_feedback (id, lecturer_id, branching_attempt_id, review_submission_id, feedback_text)
           VALUES ($1, $2, $3, $4, 'text')`,
          [randomUUID(), lecturerId, randomUUID(), randomUUID()],
        ),
      ).rejects.toThrow();
    });

    it("Scenario 7: Case Statistics returns valid data without student identifying info", async () => {
      const stats = await statisticsService.getCaseStatistics(reviewCaseId, lecturerId);
      expect(stats.caseId).toBe(reviewCaseId);
      expect(stats.reviewStudy).toBeDefined();
      expect(stats.reviewStudy?.totalSubmissions).toBe(1);
      expect(stats.reviewStudy?.flowStatus.reflected).toBe(1);

      const serialized = JSON.stringify(stats);
      expect(serialized).not.toContain("studentId");
      expect(serialized).not.toContain("student_id");
      expect(serialized).not.toContain("studentName");
      expect(serialized).not.toContain("studentEmail");
    });
  });
});
