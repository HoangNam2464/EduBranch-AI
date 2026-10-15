import { MigrationRunner, MIGRATION_LOCK_ID_1, MIGRATION_LOCK_ID_2 } from './migration-runner';
import { Pool } from 'pg';
import * as fs from 'fs';

describe('MigrationRunner Hardened', () => {
  let runner: MigrationRunner;

  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
  } as unknown as Pool;

  beforeEach(() => {
    runner = new MigrationRunner(mockPool);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Version ordering & Duplicate detection', () => {
    it('should sort hierarchical versions correctly (V1, V2, V2_1, V2_2, V3, V10)', () => {
      const versions = ['V10', 'V2_2', 'V1', 'V3', 'V2', 'V2_1'];
      versions.sort((a, b) => runner.compareVersions(a, b));

      expect(versions).toEqual(['V1', 'V2', 'V2_1', 'V2_2', 'V3', 'V10']);
    });

    it('should correctly discover migrations in numerical order', () => {
      const dir = runner.getMigrationsDirectory();
      const migrations = runner.discoverMigrations(dir);

      expect(migrations.length).toBeGreaterThanOrEqual(4);
      expect(migrations[0].version).toBe('V1');
      expect(migrations[1].version).toBe('V2');
      expect(migrations[2].version).toBe('V3');
      expect(migrations[3].version).toBe('V4');
    });

    it('should throw error on duplicate migration versions', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readdirSync').mockReturnValue([
        'V1__init.sql',
        'V2__flow.sql',
        'V2_1__sub.sql',
        'V2_1__duplicate.sql',
      ] as any);

      expect(() => runner.discoverMigrations('/mock/dir')).toThrow(
        /Duplicate migration version detected: "V2_1"/,
      );
    });

    it('should throw error on invalid version component', () => {
      expect(() => runner.parseVersionParts('Vabc')).toThrow(/Invalid migration version component/);
    });
  });

  describe('Checksum computation & Validation', () => {
    it('should calculate consistent SHA-256 checksums', () => {
      const content = 'CREATE TABLE test (id INT);';
      const checksum1 = runner.computeChecksum(content);
      const checksum2 = runner.computeChecksum(content);

      expect(checksum1).toBe(checksum2);
      expect(checksum1).toHaveLength(64);
    });

    it('should reject corrupted or malformed checksum format in database', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({
          // V1 applied with corrupted non-hex checksum
          rows: [{ version: 'V1', name: 'init_schema', checksum: '   ' }],
        })
        .mockResolvedValueOnce({}); // unlock

      await expect(runner.run()).rejects.toThrow(/Corrupted migration metadata for V1/);
      expect(mockClient.release).toHaveBeenCalledWith(true);
    });

    it('should detect checksum mismatch and halt execution immediately', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({
          // V1 already applied but with WRONG valid-hex checksum
          rows: [{ version: 'V1', name: 'init_schema', checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' }],
        })
        .mockResolvedValueOnce({}); // unlock in finally

      await expect(runner.run()).rejects.toThrow('Migration checksum mismatch for V1');
      expect(mockClient.release).toHaveBeenCalledWith(true);
    });

    it('should warn and skip for legacy records with NULL checksum without falsifying', async () => {
      const dir = runner.getMigrationsDirectory();
      const migrations = runner.discoverMigrations(dir);

      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({
          // V1 already applied with NULL checksum (legacy)
          rows: [{ version: 'V1', name: 'init_schema', checksum: null }],
        });

      // Mock remaining migrations
      for (let i = 1; i < migrations.length; i++) {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // SQL execution
          .mockResolvedValueOnce({}) // INSERT schema_migrations
          .mockResolvedValueOnce({}); // COMMIT
      }

      mockClient.query.mockResolvedValueOnce({}); // unlock

      const result = await runner.run();
      expect(result.skipped).toContain('V1');
    });
  });

  describe('Integrity & Edge cases', () => {
    it('should detect when applied migration recorded in DB is missing from disk', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({
          // Database says V99 was applied, but V99 is not in migrations dir
          rows: [{ version: 'V99', name: 'ghost_migration', checksum: 'a'.repeat(64) }],
        })
        .mockResolvedValueOnce({}); // unlock

      await expect(runner.run()).rejects.toThrow(/Migration V99 is recorded as applied in database, but its corresponding SQL file is missing/);
      expect(mockClient.release).toHaveBeenCalledWith(true);
    });

    it('should throw if migration directory is empty and migrations are required', async () => {
      jest.spyOn(runner, 'discoverMigrations').mockReturnValue([]);
      const oldAuto = process.env.AUTO_MIGRATE;
      process.env.AUTO_MIGRATE = 'true';

      try {
        await expect(runner.run()).rejects.toThrow(/Migration directory is empty or contains no valid SQL files/);
      } finally {
        process.env.AUTO_MIGRATE = oldAuto;
      }
    });

    it('should preserve original error even if ROLLBACK fails, and destroy client', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [] }) // no applied versions
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Root SQL Syntax Failure')) // SQL execution fails
        .mockRejectedValueOnce(new Error('Rollback network disconnect error')) // ROLLBACK also fails!
        .mockResolvedValueOnce({}); // unlock in finally

      await expect(runner.run()).rejects.toThrow(/Root SQL Syntax Failure/);
      expect(mockClient.release).toHaveBeenCalledWith(true);
    });

    it('should destroy client if advisory unlock fails', async () => {
      const dir = runner.getMigrationsDirectory();
      const migrations = runner.discoverMigrations(dir);

      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [] }); // getAppliedMigrations: none applied

      for (let i = 0; i < migrations.length; i++) {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // SQL execution
          .mockResolvedValueOnce({}) // INSERT schema_migrations
          .mockResolvedValueOnce({}); // COMMIT
      }

      // Unlock fails!
      mockClient.query.mockRejectedValueOnce(new Error('Database lock manager socket dead'));

      await runner.run();
      expect(mockClient.release).toHaveBeenCalledWith(true);
    });
  });
});
