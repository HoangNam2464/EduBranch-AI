import { Logger } from "@nestjs/common";
import { Pool, PoolClient } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

export interface MigrationFile {
  version: string;
  name: string;
  filename: string;
  filepath: string;
}

export interface AppliedMigration {
  name: string;
  checksum: string | null;
}

/**
 * 64-bit Advisory Lock namespace split into two 32-bit integers:
 * KEY 1: 0x45445542 (1162106178, ASCII 'EDUB')
 * KEY 2: 0x52414e43 (1380011587, ASCII 'RANC')
 */
export const MIGRATION_LOCK_ID_1 = 0x45445542;
export const MIGRATION_LOCK_ID_2 = 0x52414e43;

export class MigrationRunner {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(private readonly pool: Pool) {}

  /**
   * Find migrations directory with candidate fallback
   */
  getMigrationsDirectory(): string {
    const candidates = [
      process.env.MIGRATIONS_DIR,
      path.resolve(process.cwd(), "migrations"),
      path.resolve(process.cwd(), "backend", "migrations"),
      path.resolve(__dirname, "../../../migrations"),
      path.resolve(__dirname, "../../../../migrations"),
    ];

    for (const candidate of candidates) {
      if (candidate && fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return path.resolve(process.cwd(), "migrations");
  }

  /**
   * Calculate SHA-256 checksum of migration SQL content
   */
  computeChecksum(content: string): string {
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
  }

  /**
   * Parse hierarchical numeric version parts (e.g. V1 -> [1], V2_1 -> [2, 1], V10 -> [10])
   */
  parseVersionParts(version: string): number[] {
    const clean = version.replace(/^V/i, "").trim();
    const parts = clean.split(/[._]/);
    return parts.map((p) => {
      const n = parseInt(p, 10);
      if (isNaN(n) || n < 0) {
        throw new Error(`Invalid migration version component "${p}" in version "${version}".`);
      }
      return n;
    });
  }

  /**
   * Compare two versions hierarchically (e.g. V1 < V2 < V2_1 < V2_2 < V3 < V10)
   */
  compareVersions(vA: string, vB: string): number {
    const partsA = this.parseVersionParts(vA);
    const partsB = this.parseVersionParts(vB);
    const maxLen = Math.max(partsA.length, partsB.length);
    for (let i = 0; i < maxLen; i++) {
      const numA = i < partsA.length ? partsA[i] : 0;
      const numB = i < partsB.length ? partsB[i] : 0;
      if (numA !== numB) {
        return numA - numB;
      }
    }
    return partsA.length - partsB.length;
  }

  /**
   * Parse migration files in order (e.g. V1__init_schema.sql, V2__...)
   * Detects duplicate versions and sorts hierarchically.
   */
  discoverMigrations(dir: string): MigrationFile[] {
    if (!fs.existsSync(dir)) {
      this.logger.warn(`Migrations directory not found at: ${dir}`);
      return [];
    }

    const files = fs.readdirSync(dir);
    const migrationPattern = /^(V(\d+(?:_\d+)*))__(.+)\.sql$/i;

    const migrations: MigrationFile[] = [];

    for (const file of files) {
      const match = file.match(migrationPattern);
      if (match) {
        migrations.push({
          version: match[1], // e.g. V1, V2_1
          name: match[3],    // e.g. init_schema
          filename: file,
          filepath: path.join(dir, file),
        });
      }
    }

    // Sort hierarchically by version components (V1 -> V2 -> V2_1 -> V2_2 -> V3 -> V10)
    migrations.sort((a, b) => this.compareVersions(a.version, b.version));

    // Duplicate version detection
    const seenVersions = new Map<string, string>();
    for (const m of migrations) {
      const norm = this.parseVersionParts(m.version).join(".");
      if (seenVersions.has(norm)) {
        throw new Error(
          `Duplicate migration version detected: "${m.version}" in file "${m.filename}" conflicts with "${seenVersions.get(norm)}".`
        );
      }
      seenVersions.set(norm, m.filename);
    }

    return migrations;
  }

  /**
   * Initialize schema_migrations table with checksum column
   * Backward-compatible with previous installations
   */
  async ensureMigrationsTable(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        checksum VARCHAR(64),
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Ensure checksum column exists for existing tables
    await client.query(`
      ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum VARCHAR(64);
    `);
  }

  /**
   * Get already applied migrations along with their stored checksums
   */
  async getAppliedMigrations(client: PoolClient): Promise<Map<string, AppliedMigration>> {
    const res = await client.query("SELECT version, name, checksum FROM schema_migrations ORDER BY version ASC");
    const map = new Map<string, AppliedMigration>();
    for (const row of res.rows) {
      map.set(row.version, { name: row.name, checksum: row.checksum });
    }
    return map;
  }

  /**
   * Execute migrations sequentially with PostgreSQL Advisory Lock and SHA-256 Checksum validation
   */
  async run(): Promise<{ applied: string[]; skipped: string[] }> {
    const migrationsDir = this.getMigrationsDirectory();
    const discovered = this.discoverMigrations(migrationsDir);

    // If migrations are required (AUTO_MIGRATE=true or REQUIRE_MIGRATIONS=true), empty directory is fatal
    const isMigrationRequired = process.env.AUTO_MIGRATE === "true" || process.env.REQUIRE_MIGRATIONS === "true";
    if (discovered.length === 0) {
      const emptyMsg = `Migration directory is empty or contains no valid SQL files: "${migrationsDir}".`;
      this.logger.warn(emptyMsg);
      if (isMigrationRequired) {
        throw new Error(`${emptyMsg} Deployment cannot proceed without migrations.`);
      }
      return { applied: [], skipped: [] };
    }

    const client = await this.pool.connect();
    let lockAcquired = false;
    let destroyClient = false;
    const applied: string[] = [];
    const skipped: string[] = [];

    try {
      // 1. Acquire PostgreSQL Advisory Lock (Blocks other instances until released)
      this.logger.log(`Acquiring PostgreSQL advisory lock (${MIGRATION_LOCK_ID_1}, ${MIGRATION_LOCK_ID_2})...`);
      await client.query("SELECT pg_advisory_lock($1, $2)", [MIGRATION_LOCK_ID_1, MIGRATION_LOCK_ID_2]);
      lockAcquired = true;
      this.logger.log("PostgreSQL advisory lock acquired successfully.");

      // 2. Ensure schema_migrations table exists and load current applied versions
      await this.ensureMigrationsTable(client);
      const appliedMap = await this.getAppliedMigrations(client);

      // 3. Verify integrity: every applied migration recorded in DB must exist on disk
      const discoveredVersions = new Set(discovered.map((m) => m.version));
      for (const appliedVersion of appliedMap.keys()) {
        if (!discoveredVersions.has(appliedVersion)) {
          const missingFileErr = `Integrity error: Migration ${appliedVersion} is recorded as applied in database, but its corresponding SQL file is missing from disk!`;
          this.logger.error(missingFileErr);
          throw new Error(missingFileErr);
        }
      }

      // 4. Process each discovered migration sequentially
      for (const migration of discovered) {
        const sql = fs.readFileSync(migration.filepath, "utf8");
        const fileChecksum = this.computeChecksum(sql);

        if (appliedMap.has(migration.version)) {
          const stored = appliedMap.get(migration.version)!;

          // Checksum policy:
          // A. Legacy unverified record (checksum IS NULL)
          if (stored.checksum === null) {
            this.logger.warn(
              `Migration ${migration.version} (${migration.filename}) exists without recorded checksum (legacy unverified). ` +
              `Skipping verification. Please certify via operational baseline procedure.`
            );
            skipped.push(migration.version);
            continue;
          }

          // B. Corrupted or invalid checksum format (must be 64-character hex)
          const trimmedChecksum = typeof stored.checksum === "string" ? stored.checksum.trim() : "";
          if (!/^[a-f0-9]{64}$/i.test(trimmedChecksum)) {
            const corruptMetaErr = `Corrupted migration metadata for ${migration.version}: Stored checksum "${stored.checksum}" is invalid or malformed. Expected a 64-character SHA-256 hex string.`;
            this.logger.error(corruptMetaErr);
            throw new Error(corruptMetaErr);
          }

          // C. Valid checksum mismatch
          if (trimmedChecksum.toLowerCase() !== fileChecksum.toLowerCase()) {
            const mismatchErr = `Migration checksum mismatch for ${migration.version} (${migration.filename})! ` +
              `Expected (stored): ${stored.checksum}, Actual (file): ${fileChecksum}. ` +
              `The migration file content has been altered after execution.`;
            this.logger.error(mismatchErr);
            throw new Error(mismatchErr);
          }

          skipped.push(migration.version);
          continue;
        }

        // Apply new migration inside isolated transaction
        this.logger.log(`Applying migration ${migration.filename}...`);
        try {
          await client.query("BEGIN");
          await client.query(sql);
          await client.query(
            "INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES ($1, $2, $3, NOW())",
            [migration.version, migration.name, fileChecksum],
          );
          await client.query("COMMIT");
          applied.push(migration.version);
          this.logger.log(`Migration ${migration.filename} applied successfully (SHA-256: ${fileChecksum.substring(0, 12)}...).`);
        } catch (err) {
          try {
            await client.query("ROLLBACK");
          } catch (rbErr) {
            this.logger.error(`ROLLBACK failed: ${rbErr.message}`, rbErr.stack);
          }
          this.logger.error(`Migration ${migration.filename} failed: ${err.message}`, err.stack);
          throw new Error(`Migration ${migration.filename} failed: ${err.message}`);
        }
      }

      this.logger.log(`Migration run complete: ${applied.length} applied, ${skipped.length} skipped.`);
      return { applied, skipped };
    } catch (error) {
      destroyClient = true;
      throw error;
    } finally {
      if (lockAcquired) {
        try {
          this.logger.log(`Releasing PostgreSQL advisory lock (${MIGRATION_LOCK_ID_1}, ${MIGRATION_LOCK_ID_2})...`);
          await client.query("SELECT pg_advisory_unlock($1, $2)", [MIGRATION_LOCK_ID_1, MIGRATION_LOCK_ID_2]);
          this.logger.log("PostgreSQL advisory lock released successfully.");
        } catch (unlockErr) {
          this.logger.error(`Failed to release advisory lock cleanly: ${unlockErr.message}. Destroying client.`, unlockErr.stack);
          destroyClient = true;
        }
      }

      // If connection state is uncertain or unlock failed, destroy client so PostgreSQL backend releases session locks.
      if (destroyClient) {
        try {
          client.release(true);
        } catch {
          // ignore
        }
      } else {
        client.release();
      }
    }
  }
}
