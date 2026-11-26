import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { MigrationRunner } from "./migration-runner";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  private validateEnvironment() {
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const password = this.configService.get<string>("POSTGRES_PASSWORD");

    if (!password) {
      const msg = "POSTGRES_PASSWORD environment variable is missing.";
      this.logger.error(msg);
      if (isProduction) {
        throw new Error(msg);
      }
    }

    if (isProduction && password === "changeme_db_password") {
      const msg = "Production deployment cannot use default changeme_db_password.";
      this.logger.error(msg);
      throw new Error(msg);
    }
  }

  async onModuleInit() {
    this.validateEnvironment();

    const host = this.configService.get<string>("POSTGRES_HOST", "localhost");
    const port = Number(this.configService.get<number>("POSTGRES_PORT", 5432));
    const database = this.configService.get<string>("POSTGRES_DB", "edubranch_ai");
    const user = this.configService.get<string>("POSTGRES_USER", "edubranch");
    const password = this.configService.get<string>("POSTGRES_PASSWORD", "");

    this.pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      min: Number(this.configService.get<number>("DB_POOL_MIN_SIZE", 2)),
      max: Number(this.configService.get<number>("DB_POOL_MAX_SIZE", 10)),
    });

    // An idle connection that PostgreSQL closes (restart, admin termination, network drop) makes the
    // pool emit "error". Without a listener Node treats it as unhandled and the whole backend exits.
    // The pool already discards that client and opens a new one on the next query, so only log it.
    this.pool.on("error", (error) => {
      this.logger.error(`PostgreSQL idle connection lost: ${error.message}`);
    });

    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log("Connected to PostgreSQL successfully");

      // Run database migrations if enabled or by default
      const autoMigrate = this.configService.get<string>("AUTO_MIGRATE", "true") === "true";
      if (autoMigrate) {
        const runner = new MigrationRunner(this.pool);
        await runner.run();
      }
    } catch (error) {
      this.logger.error("Failed to connect or migrate PostgreSQL:", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log("PostgreSQL connection pool closed");
    }
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  /**
   * Checks out a client for a transaction. While checked out the pool's idle listener is detached,
   * so a connection lost between two queries would emit an unhandled "error" and exit the process.
   * The listener below keeps the process alive; the next query on that client rejects and the
   * caller's rollback/release path runs as usual (pg drops a broken client instead of reusing it).
   */
  async getClient(): Promise<PoolClient> {
    const client = await this.pool.connect();
    const onError = (error: Error) => {
      this.logger.error(`PostgreSQL connection lost during a transaction: ${error.message}`);
    };
    client.on("error", onError);
    const release = client.release.bind(client);
    client.release = (destroy?: Error | boolean) => {
      client.removeListener("error", onError);
      return release(destroy);
    };
    return client;
  }

  getPool(): Pool {
    return this.pool;
  }
}
