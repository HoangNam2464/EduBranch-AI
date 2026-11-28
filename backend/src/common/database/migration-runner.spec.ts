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
    // Drop queued mockResolvedValueOnce values a previous (rejected) run left unused.
    mockClient.query.mockReset();
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

    it('treats CRLF and LF forms of the same SQL as equivalent, but not a content change', () => {
      const lf = 'CREATE TABLE a (id INT);\nCREATE TABLE b (id INT);\n';
      const crlf = lf.replace(/\n/g, '\r\n');
      const fromLf = runner.equivalentChecksums(lf);
      const fromCrlf = runner.equivalentChecksums(crlf);

      expect(fromLf.has(runner.computeChecksum(crlf))).toBe(true);
      expect(fromCrlf.has(runner.computeChecksum(lf))).toBe(true);
      expect(fromLf.has(runner.computeChecksum(lf.replace('b (id INT)', 'b (id BIGINT)')))).toBe(false);
      expect(fromLf.has(runner.computeChecksum(lf + ' '))).toBe(false);
    });

    const runWithStoredV1 = async (storedChecksum: string) => {
      const migrations = runner.discoverMigrations(runner.getMigrationsDirectory());
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [{ version: 'V1', name: 'init_schema', checksum: storedChecksum }] });
      for (let i = 1; i < migrations.length; i++) {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // SQL execution
          .mockResolvedValueOnce({}) // INSERT schema_migrations
          .mockResolvedValueOnce({}); // COMMIT
      }
      mockClient.query.mockResolvedValueOnce({}); // unlock
      return { migrations, result: runner.run() };
    };

    it('accepts a V1 checksum recorded from a CRLF checkout when the file on disk is LF (and vice versa)', async () => {
      const v1 = fs.readFileSync(runner.discoverMigrations(runner.getMigrationsDirectory())[0].filepath, 'utf8');
      const lf = runner.normalizeLineEndings(v1);
      for (const recorded of [lf.replace(/\n/g, '\r\n'), lf]) {
        mockClient.query.mockReset();
        const { result } = await runWithStoredV1(runner.computeChecksum(recorded));
        await expect(result).resolves.toMatchObject({ skipped: ['V1'] });
      }
    });

    it('still rejects a V1 whose recorded checksum belongs to different SQL content', async () => {
      const v1 = fs.readFileSync(runner.discoverMigrations(runner.getMigrationsDirectory())[0].filepath, 'utf8');
      const tampered = runner.normalizeLineEndings(v1) + '\n-- altered after execution\n';
      const { result } = await runWithStoredV1(runner.computeChecksum(tampered.replace(/\n/g, '\r\n')));
      await expect(result).rejects.toThrow('Migration checksum mismatch for V1');
    });

    it('records new migrations with the LF-normalized checksum', async () => {
      const v1 = fs.readFileSync(runner.discoverMigrations(runner.getMigrationsDirectory())[0].filepath, 'utf8');
      const { migrations, result } = await runWithStoredV1(runner.computeChecksum(runner.normalizeLineEndings(v1)));
      await result;
      const inserts = mockClient.query.mock.calls.filter(([q]) => typeof q === 'string' && q.startsWith('INSERT INTO schema_migrations'));
      expect(inserts).toHaveLength(migrations.length - 1);
      for (const [, params] of inserts) {
        const file = migrations.find((m) => m.version === params[0])!;
        const lfSql = runner.normalizeLineEndings(fs.readFileSync(file.filepath, 'utf8'));
        expect(params[2]).toBe(runner.computeChecksum(lfSql));
      }
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

  describe('PostgreSQL Advisory Lock (0x45445542, 0x52414e43)', () => {
    it('should use fixed 32-bit integer keys 0x45445542 and 0x52414e43', () => {
      expect(MIGRATION_LOCK_ID_1).toBe(0x45445542);
      expect(MIGRATION_LOCK_ID_1).toBe(1162106178);
      expect(MIGRATION_LOCK_ID_2).toBe(0x52414e43);
      expect(MIGRATION_LOCK_ID_2).toBe(1380011587);
    });

    it('should acquire and release advisory lock using the exact key pair', async () => {
      const dir = runner.getMigrationsDirectory();
      const migrations = runner.discoverMigrations(dir);

      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [] }); // getAppliedMigrations

      for (let i = 0; i < migrations.length; i++) {
        mockClient.query
          .mockResolvedValueOnce({}) // BEGIN
          .mockResolvedValueOnce({}) // SQL execution
          .mockResolvedValueOnce({}) // INSERT schema_migrations
          .mockResolvedValueOnce({}); // COMMIT
      }

      mockClient.query.mockResolvedValueOnce({}); // pg_advisory_unlock

      await runner.run();

      expect(mockClient.query).toHaveBeenNthCalledWith(
        1,
        'SELECT pg_advisory_lock($1, $2)',
        [0x45445542, 0x52414e43],
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT pg_advisory_unlock($1, $2)',
        [0x45445542, 0x52414e43],
      );
    });

    it('should release advisory lock even when migration execution encounters an error', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // pg_advisory_lock
        .mockResolvedValueOnce({}) // CREATE TABLE IF NOT EXISTS
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [] }) // getAppliedMigrations
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(new Error('Syntax error in migration SQL file')) // SQL execution fails
        .mockResolvedValueOnce({}) // ROLLBACK
        .mockResolvedValueOnce({}); // pg_advisory_unlock in finally

      await expect(runner.run()).rejects.toThrow('Syntax error in migration SQL file');

      expect(mockClient.query).toHaveBeenCalledWith(
        'SELECT pg_advisory_unlock($1, $2)',
        [0x45445542, 0x52414e43],
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('Checked-out client error listener (EBA-115)', () => {
    it('attaches an error listener during run, detaches it cleanly, and destroys client if error fires', async () => {
      const listeners = new Map<string, Array<(err: Error) => void>>();
      const emitterClient = {
        query: jest.fn(),
        release: jest.fn(),
        on: jest.fn((event: string, fn: (err: Error) => void) => {
          listeners.set(event, [...(listeners.get(event) ?? []), fn]);
        }),
        removeListener: jest.fn((event: string, fn: (err: Error) => void) => {
          listeners.set(
            event,
            (listeners.get(event) ?? []).filter((f) => f !== fn),
          );
        }),
        emit: (event: string, err: Error) => {
          for (const fn of listeners.get(event) ?? []) fn(err);
        },
      };
      const emitterPool = { connect: jest.fn().mockResolvedValue(emitterClient) } as unknown as Pool;
      const emitterRunner = new MigrationRunner(emitterPool);

      const dir = emitterRunner.getMigrationsDirectory();
      const migrations = emitterRunner.discoverMigrations(dir);
      emitterClient.query
        .mockResolvedValueOnce({}) // lock
        .mockResolvedValueOnce({}) // CREATE TABLE
        .mockResolvedValueOnce({}) // ALTER TABLE
        .mockResolvedValueOnce({ rows: [] }); // applied
      // Fail after emitting a connection error mid-run
      emitterClient.query.mockImplementationOnce(async () => {
        emitterClient.emit('error', new Error('terminating connection due to administrator command'));
        throw new Error('Connection terminated unexpectedly');
      });
      emitterClient.query.mockResolvedValueOnce({}); // ROLLBACK
      emitterClient.query.mockResolvedValueOnce({}); // unlock

      await expect(emitterRunner.run()).rejects.toThrow(/Connection terminated unexpectedly/);
      expect(migrations.length).toBeGreaterThan(0);
      expect(emitterClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(emitterClient.removeListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(listeners.get('error')).toHaveLength(0);
      expect(emitterClient.release).toHaveBeenCalledWith(true);
    });
  });
});
