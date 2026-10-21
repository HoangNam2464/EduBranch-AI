import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, QueryResult, QueryResultRow } from "pg";
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

  async getClient() {
    return this.pool.connect();
  }

  getPool(): Pool {
    return this.pool;
  }
}
