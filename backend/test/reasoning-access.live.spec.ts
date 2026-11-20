/**
 * Live SQL Integration Test for Reasoning Access Control (T006).
 * Opt-in with QA_LIVE=1; skipped otherwise.
 * Creates an isolated temporary database (zz_reasoning_live_<random>), applies migrations,
 * tests real SQL constraints, joins, INV-01, and consequence masking,
 * and drops temporary DB in afterAll.
 */
import * as fs from "fs";
import * as path from "path";
import { randomBytes, randomUUID } from "crypto";
import { Pool } from "pg";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

import { DatabaseService } from "../src/common/database/database.service";
import { ReasoningService } from "../src/modules/reasoning/reasoning.service";

const isLive = process.env.QA_LIVE === "1";
const describeLive = isLive ? describe : describe.skip;

describeLive("Reasoning Access Live SQL Integration (T006 / QA_LIVE=1)", () => {
  let adminPool: Pool;
  let testPool: Pool;
  let tempDbName: string;
  let moduleRef: TestingModule;

  let reasoningService: ReasoningService;

  const pgHost = process.env.POSTGRES_HOST || "localhost";
  const pgPort = Number(process.env.POSTGRES_PORT || "5432");
  const pgUser = process.env.POSTGRES_USER || "edubranch";
  const pgPassword = process.env.POSTGRES_PASSWORD || "changeme_db_password";

  // Seeded entity IDs
  const lecturerId = randomUUID();
  const student1Id = randomUUID();
  const student2Id = randomUUID();
  const courseId = randomUUID();

  const publishedCaseId = randomUUID();
  const draftCaseId = randomUUID();

  const node1Id = randomUUID();
  const node2TerminalId = randomUUID();
  const draftNodeId = randomUUID();

  const option1Id = randomUUID();
  const draftOptionId = randomUUID();

  const ongoingAttemptId = randomUUID();
  const completedAttemptId = randomUUID();
  const draftCaseAttemptId = randomUUID();
  const student2AttemptId = randomUUID();

  const ongoingReasoningId = randomUUID();
  const completedReasoningId = randomUUID();
  const draftReasoningId = randomUUID();
  const student2ReasoningId = randomUUID();

  beforeAll(async () => {
    tempDbName = `zz_reasoning_live_${randomBytes(4).toString("hex")}`;

    // 1. Connect to maintenance DB and create temp DB
    adminPool = new Pool({
      host: pgHost,
      port: pgPort,
      user: pgUser,
      password: pgPassword,
      database: "postgres",
    });

    await adminPool.query(`CREATE DATABASE "${tempDbName}"`);

    // 2. Connect to temp DB and apply migrations
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

    // 3. Seed users, course, cases, nodes, options, attempts, and reasonings
    await testPool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role) VALUES
       ($1, 'lecturer@uni.edu', 'hash', 'Prof. Smith', 'LECTURER'),
       ($2, 'student1@uni.edu', 'hash', 'Student Alice', 'STUDENT'),
       ($3, 'student2@uni.edu', 'hash', 'Student Bob', 'STUDENT')`,
      [lecturerId, student1Id, student2Id],
    );

    await testPool.query(
      `INSERT INTO courses (id, lecturer_id, name, course_code) VALUES
       ($1, $2, 'Strategic Management', 'STRAT101')`,
      [courseId, lecturerId],
    );

    // Seed Cases (including created_by)
    await testPool.query(
      `INSERT INTO cases (id, course_id, created_by, title, status, learning_mode) VALUES
       ($1, $3, $4, 'Hostile Takeover Case (Published)', 'PUBLISHED', 'BRANCHING_STUDY'),
       ($2, $3, $4, 'In-Development Dilemma (Draft)', 'DRAFT', 'BRANCHING_STUDY')`,
      [publishedCaseId, draftCaseId, courseId, lecturerId],
    );

    // Seed Nodes
    await testPool.query(
      `INSERT INTO case_nodes (id, case_id, node_index, situation, is_terminal) VALUES
       ($1, $3, 0, 'Initial board meeting dilemma', FALSE),
       ($2, $3, 1, 'Final board resolution', TRUE),
       ($4, $5, 0, 'Draft dilemma scenario', FALSE)`,
      [node1Id, node2TerminalId, publishedCaseId, draftNodeId, draftCaseId],
    );

    // Link root_node_id on cases
    await testPool.query(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [
      node1Id,
      publishedCaseId,
    ]);
    await testPool.query(`UPDATE cases SET root_node_id = $1 WHERE id = $2`, [
      draftNodeId,
      draftCaseId,
    ]);

    // Seed Options
    await testPool.query(
      `INSERT INTO case_options (id, node_id, option_text, consequence, next_node_id) VALUES
       ($1, $2, 'Reject buyout offer', 'Stock price surges and board retains control', $3),
       ($4, $5, 'Draft option A', 'Draft consequence text', NULL)`,
      [option1Id, node1Id, node2TerminalId, draftOptionId, draftNodeId],
    );

    // Seed Branching Attempts
    await testPool.query(
      `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, current_node_id, is_completed, reflection_status) VALUES
       ($1, $2, $3, 1, $4, FALSE, 'NOT_STARTED'),
       ($5, $2, $3, 2, $6, TRUE, 'SUBMITTED'),
       ($7, $2, $8, 1, $9, TRUE, 'SUBMITTED'),
       ($10, $11, $3, 1, $6, TRUE, 'SUBMITTED')`,
      [
        ongoingAttemptId,
        student1Id,
        publishedCaseId,
        node1Id,
        completedAttemptId,
        node2TerminalId,
        draftCaseAttemptId,
        draftCaseId,
        draftNodeId,
        student2AttemptId,
        student2Id,
      ],
    );

    // Seed Student Reasoning
    await testPool.query(
      `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text) VALUES
       ($1, $2, $3, $4, 'Ongoing rationale for rejecting buyout'),
       ($5, $6, $3, $4, 'Completed rationale for rejecting buyout'),
       ($7, $8, $9, $10, 'Draft case rationale'),
       ($11, $12, $3, $4, 'Student 2 rationale')`,
      [
        ongoingReasoningId,
        ongoingAttemptId,
        node1Id,
        option1Id,
        completedReasoningId,
        completedAttemptId,
        draftReasoningId,
        draftCaseAttemptId,
        draftNodeId,
        draftOptionId,
        student2ReasoningId,
        student2AttemptId,
      ],
    );

    // 4. Initialize Nest testing module with real DatabaseService pointing to temp DB
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
        ReasoningService,
      ],
    }).compile();

    await moduleRef.init();
    reasoningService = moduleRef.get<ReasoningService>(ReasoningService);
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

  describe("Scenario 1: Consequence hidden while attempt is ongoing (AC-R4 / FND §6)", () => {
    it("getReasoningById returns consequence = null when is_completed is FALSE", async () => {
      const res = await reasoningService.getReasoningById(ongoingReasoningId, student1Id);

      expect(res).toBeDefined();
      expect(res.id).toBe(ongoingReasoningId);
      expect(res.student_id).toBe(student1Id);
      expect(res.reasoning_text).toBe("Ongoing rationale for rejecting buyout");
      expect(res.situation).toBe("Initial board meeting dilemma");
      expect(res.option_text).toBe("Reject buyout offer");
      expect(res.consequence).toBeNull();
    });

    it("getReasoningsByAttempt returns consequence = null on all items when is_completed is FALSE", async () => {
      const list = await reasoningService.getReasoningsByAttempt(ongoingAttemptId, student1Id);

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(ongoingReasoningId);
      expect(list[0].consequence).toBeNull();
      expect(list[0].option_text).toBe("Reject buyout offer");
    });
  });

  describe("Scenario 2: Consequence revealed when attempt is completed (AC-R4 / REVIEW phase)", () => {
    it("getReasoningById returns real consequence when is_completed is TRUE", async () => {
      const res = await reasoningService.getReasoningById(completedReasoningId, student1Id);

      expect(res).toBeDefined();
      expect(res.id).toBe(completedReasoningId);
      expect(res.consequence).toBe("Stock price surges and board retains control");
    });

    it("getReasoningsByAttempt returns real consequences when is_completed is TRUE", async () => {
      const list = await reasoningService.getReasoningsByAttempt(completedAttemptId, student1Id);

      expect(list).toHaveLength(1);
      expect(list[0].id).toBe(completedReasoningId);
      expect(list[0].consequence).toBe("Stock price surges and board retains control");
    });
  });

  describe("Scenario 3: Unpublished/DRAFT Case Access Forbidden (AC-R3 / INV-01)", () => {
    it("getReasoningById throws ForbiddenException (403) for attempt on DRAFT case", async () => {
      await expect(
        reasoningService.getReasoningById(draftReasoningId, student1Id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("getReasoningsByAttempt throws ForbiddenException (403) for attempt on DRAFT case", async () => {
      await expect(
        reasoningService.getReasoningsByAttempt(draftCaseAttemptId, student1Id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Scenario 4: Cross-student Reasoning Access Forbidden (AC-R2 / Ownership)", () => {
    it("Student 1 accessing Student 2's reasoning by ID throws ForbiddenException (403)", async () => {
      await expect(
        reasoningService.getReasoningById(student2ReasoningId, student1Id),
      ).rejects.toThrow(ForbiddenException);
    });

    it("Student 1 accessing Student 2's attempt reasonings throws ForbiddenException (403)", async () => {
      await expect(
        reasoningService.getReasoningsByAttempt(student2AttemptId, student1Id),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe("Scenario 5: Non-existent IDs Return NotFoundException (AC-R2 / 404)", () => {
    it("getReasoningById throws NotFoundException (404) for non-existent reasoning UUID", async () => {
      await expect(
        reasoningService.getReasoningById(randomUUID(), student1Id),
      ).rejects.toThrow(NotFoundException);
    });

    it("getReasoningsByAttempt throws NotFoundException (404) for non-existent attempt UUID", async () => {
      await expect(
        reasoningService.getReasoningsByAttempt(randomUUID(), student1Id),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
