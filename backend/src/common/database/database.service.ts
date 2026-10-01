import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, QueryResult, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.get<string>("POSTGRES_HOST", "localhost"),
      port: Number(this.configService.get<number>("POSTGRES_PORT", 5432)),
      database: this.configService.get<string>("POSTGRES_DB", "edubranch_ai"),
      user: this.configService.get<string>("POSTGRES_USER", "edubranch"),
      password: this.configService.get<string>("POSTGRES_PASSWORD", "changeme_db_password"),
      min: Number(this.configService.get<number>("DB_POOL_MIN_SIZE", 2)),
      max: Number(this.configService.get<number>("DB_POOL_MAX_SIZE", 10)),
    });

    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log("Connected to PostgreSQL successfully");
    } catch (error) {
      this.logger.error("Failed to connect to PostgreSQL:", error);
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
}
