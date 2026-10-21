import { Logger } from "@nestjs/common";

export interface EnvironmentConfig {
  NODE_ENV: string;
  SERVER_PORT: number;
  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  DB_POOL_MIN_SIZE?: number;
  DB_POOL_MAX_SIZE?: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  AI_SERVICE_BASE_URL?: string;
  MINIO_HOST?: string;
  MINIO_PORT?: number;
  [key: string]: any;
}

const logger = new Logger("EnvironmentValidation");

/**
 * Validates mandatory environment variables on application bootstrap.
 * Halts startup immediately with a clear, actionable error message if required variables are missing or invalid.
 */
export function validateEnvironment(config: Record<string, any>): EnvironmentConfig {
  const errors: string[] = [];
  const nodeEnv = (config.NODE_ENV || process.env.NODE_ENV || "development").toLowerCase();
  const isProduction = nodeEnv === "production";

  // 1. PostgreSQL Mandatory Configuration
  const pgHost = config.POSTGRES_HOST || process.env.POSTGRES_HOST;
  if (!pgHost || String(pgHost).trim() === "") {
    errors.push("POSTGRES_HOST is required but was not provided or is empty.");
  }

  const pgPortRaw = config.POSTGRES_PORT || process.env.POSTGRES_PORT;
  const pgPort = pgPortRaw !== undefined ? Number(pgPortRaw) : 5432;
  if (isNaN(pgPort) || pgPort < 1 || pgPort > 65535) {
    errors.push(`POSTGRES_PORT must be a valid port number between 1 and 65535 (received: "${pgPortRaw}").`);
  }

  const pgDb = config.POSTGRES_DB || process.env.POSTGRES_DB;
  if (!pgDb || String(pgDb).trim() === "") {
    errors.push("POSTGRES_DB is required but was not provided or is empty.");
  }

  const pgUser = config.POSTGRES_USER || process.env.POSTGRES_USER;
  if (!pgUser || String(pgUser).trim() === "") {
    errors.push("POSTGRES_USER is required but was not provided or is empty.");
  }

  const pgPassword = config.POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD;
  if (!pgPassword || String(pgPassword).trim() === "") {
    errors.push("POSTGRES_PASSWORD is required but was not provided or is empty.");
  } else if (isProduction && pgPassword === "changeme_db_password") {
    errors.push("POSTGRES_PASSWORD cannot use default 'changeme_db_password' in production.");
  }

  // 2. Redis Mandatory Configuration
  const redisHost = config.REDIS_HOST || process.env.REDIS_HOST;
  if (!redisHost || String(redisHost).trim() === "") {
    errors.push("REDIS_HOST is required but was not provided or is empty.");
  }

  const redisPortRaw = config.REDIS_PORT || process.env.REDIS_PORT;
  const redisPort = redisPortRaw !== undefined ? Number(redisPortRaw) : 6379;
  if (isNaN(redisPort) || redisPort < 1 || redisPort > 65535) {
    errors.push(`REDIS_PORT must be a valid port number between 1 and 65535 (received: "${redisPortRaw}").`);
  }

  // 3. JWT Mandatory Configuration
  const jwtSecret = config.JWT_SECRET || process.env.JWT_SECRET;
  if (!jwtSecret || String(jwtSecret).trim() === "") {
    errors.push("JWT_SECRET is required but was not provided or is empty.");
  } else if (String(jwtSecret).length < 16) {
    errors.push("JWT_SECRET must be at least 16 characters long for cryptographic security.");
  } else if (
    isProduction &&
    (jwtSecret === "changeme_generate_a_strong_random_jwt_secret_min_64_chars" ||
      jwtSecret === "edubranch-dev-secret-change-in-prod" ||
      jwtSecret === "edubranch_dev_jwt_secret_key_super_secure_32chars")
  ) {
    errors.push("JWT_SECRET cannot use insecure development placeholder in production.");
  }

  // 4. Server Port Validation
  const serverPortRaw = config.SERVER_PORT || process.env.SERVER_PORT;
  const serverPort = serverPortRaw !== undefined ? Number(serverPortRaw) : 8080;
  if (isNaN(serverPort) || serverPort < 1 || serverPort > 65535) {
    errors.push(`SERVER_PORT must be a valid port number between 1 and 65535 (received: "${serverPortRaw}").`);
  }

  if (errors.length > 0) {
    const header = "================================================================================";
    const errorDetails = errors.map((err) => `  ✖ ${err}`).join("\n");
    const fullMessage = `\n${header}\nFATAL: Environment validation failed! Missing or invalid required variables:\n${errorDetails}\n${header}\nApplication startup halted to prevent undefined runtime behavior.\n`;

    logger.error(fullMessage);
    throw new Error(fullMessage);
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    SERVER_PORT: serverPort,
    POSTGRES_HOST: String(pgHost),
    POSTGRES_PORT: pgPort,
    POSTGRES_DB: String(pgDb),
    POSTGRES_USER: String(pgUser),
    POSTGRES_PASSWORD: String(pgPassword),
    REDIS_HOST: String(redisHost),
    REDIS_PORT: redisPort,
    JWT_SECRET: String(jwtSecret),
  };
}
