import { Pool } from "pg";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import {
  MigrationRunner,
  MIGRATION_LOCK_ID_1,
  MIGRATION_LOCK_ID_2,
} from "../src/common/database/migration-runner";

/**
 * PostgreSQL Real Integration Test Suite
 *
 * NOTE: This test suite executes against a real PostgreSQL 16 container with pgvector extension.
 * It provides empirical evidence for:
 * 1. Ordered execution of all migrations (V1 to V4)
 * 2. pgvector extension initialization & verification on PostgreSQL 16
 * 3. Idempotency on repeated execution (all applied migrations skipped)
 * 4. Multi-instance concurrency mutual exclusion using PostgreSQL Advisory Lock (0x45445542, 0x52414e43)
 * 5. Tampered migration checksum mismatch detection on real database
 */
describe("PostgreSQL Migration Runner & Advisory Lock (Real PostgreSQL 16 Integration)", () => {
  let pool: Pool;
  let runner: MigrationRunner;

  const dbConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || "edubranch_ai",
    user: process.env.POSTGRES_USER || "edubranch",
    password: process.env.POSTGRES_PASSWORD || "changeme_db_password",
  };

  beforeAll(async () => {
    pool = new Pool(dbConfig);

    // Verify connectivity to real PostgreSQL
    try {
      const res = await pool.query("SELECT version()");
      console.log(`[Real Integration Test] Connected to: ${res.rows[0].version}`);
    } catch (err: any) {
      console.warn(`[Real Integration Test] Skipping: PostgreSQL not reachable at ${dbConfig.host}:${dbConfig.port} (${err.message})`);
    }

    runner = new MigrationRunner(pool);
  });

  afterAll(async () => {
    if (pool) {
      await pool.end();
    }
  });

  it("1. should execute all migrations in order and verify pgvector on PostgreSQL 16", async () => {
    const result = await runner.run();

    console.log(`[Real Integration Test] Migration run result:`, result);
    expect(result.applied.length + result.skipped.length).toBeGreaterThanOrEqual(4);

    // Verify schema_migrations table contents
    const rows = await pool.query("SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version ASC");
    expect(rows.rows.length).toBeGreaterThanOrEqual(4);

    // Verify V1 to V4 are recorded with 64-char hex SHA-256 checksums
    const versions = rows.rows.map((r) => r.version);
    expect(versions).toContain("V1");
    expect(versions).toContain("V2");
    expect(versions).toContain("V3");
    expect(versions).toContain("V4");

    for (const row of rows.rows) {
      expect(row.checksum).toMatch(/^[a-f0-9]{64}$/i);
      expect(row.applied_at).toBeDefined();
    }

    // Verify pgvector extension is present in PostgreSQL
    const vectorExt = await pool.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
    expect(vectorExt.rows.length).toBe(1);
    expect(vectorExt.rows[0].extname).toBe("vector");
    console.log(`[Real Integration Test] pgvector extension verified: v${vectorExt.rows[0].extversion}`);
  });

  it("2. should be idempotent and skip all already applied migrations on subsequent run", async () => {
    const secondRun = await runner.run();

    expect(secondRun.applied).toEqual([]);
    expect(secondRun.skipped).toContain("V1");
    expect(secondRun.skipped).toContain("V2");
    expect(secondRun.skipped).toContain("V3");
    expect(secondRun.skipped).toContain("V4");
  });

  it("3. should prevent concurrent execution across multiple instances via PostgreSQL Advisory Lock", async () => {
    // Acquire two independent connections representing two separate backend instances
    const instanceA = await pool.connect();
    const instanceB = await pool.connect();

    try {
      // Instance A acquires advisory lock with the fixed key pair
      const lockA = await instanceA.query("SELECT pg_try_advisory_lock($1, $2)", [
        MIGRATION_LOCK_ID_1,
        MIGRATION_LOCK_ID_2,
      ]);
      expect(lockA.rows[0].pg_try_advisory_lock).toBe(true);

      // Instance B attempts to acquire the same advisory lock simultaneously -> MUST BE BLOCKED / RETURN FALSE
      const lockB = await instanceB.query("SELECT pg_try_advisory_lock($1, $2)", [
        MIGRATION_LOCK_ID_1,
        MIGRATION_LOCK_ID_2,
      ]);
      expect(lockB.rows[0].pg_try_advisory_lock).toBe(false);

      // Instance A finishes migration and releases the advisory lock
      const unlockA = await instanceA.query("SELECT pg_advisory_unlock($1, $2)", [
        MIGRATION_LOCK_ID_1,
        MIGRATION_LOCK_ID_2,
      ]);
      expect(unlockA.rows[0].pg_advisory_unlock).toBe(true);

      // Instance B now attempts to acquire the lock -> MUST SUCCEED
      const lockBAfterRelease = await instanceB.query("SELECT pg_try_advisory_lock($1, $2)", [
        MIGRATION_LOCK_ID_1,
        MIGRATION_LOCK_ID_2,
      ]);
      expect(lockBAfterRelease.rows[0].pg_try_advisory_lock).toBe(true);

      // Instance B releases lock
      const unlockB = await instanceB.query("SELECT pg_advisory_unlock($1, $2)", [
        MIGRATION_LOCK_ID_1,
        MIGRATION_LOCK_ID_2,
      ]);
      expect(unlockB.rows[0].pg_advisory_unlock).toBe(true);
    } finally {
      instanceA.release();
      instanceB.release();
    }
  });

  it("4. should detect tampered migration checksum and reject execution", async () => {
    // Read original checksum for V1
    const originalRes = await pool.query("SELECT checksum FROM schema_migrations WHERE version = 'V1'");
    const originalChecksum = originalRes.rows[0].checksum;

    // Tamper with V1 checksum in real database
    const tamperedChecksum = "a".repeat(64);
    await pool.query("UPDATE schema_migrations SET checksum = $1 WHERE version = 'V1'", [tamperedChecksum]);

    try {
      // Runner MUST detect the mismatch and throw an error immediately
      await expect(runner.run()).rejects.toThrow(/Migration checksum mismatch for V1/);
    } finally {
      // Restore valid original checksum
      await pool.query("UPDATE schema_migrations SET checksum = $1 WHERE version = 'V1'", [originalChecksum]);
    }

    // Verify recovery after restoring valid checksum
    const recoveryRun = await runner.run();
    expect(recoveryRun.skipped).toContain("V1");
  });
});
