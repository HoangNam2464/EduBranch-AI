import { validateEnvironment } from "./env.validation";

describe("validateEnvironment", () => {
  const validBaseConfig = {
    NODE_ENV: "development",
    SERVER_PORT: 8080,
    POSTGRES_HOST: "localhost",
    POSTGRES_PORT: 5432,
    POSTGRES_DB: "edubranch_ai",
    POSTGRES_USER: "edubranch",
    POSTGRES_PASSWORD: "changeme_db_password",
    REDIS_HOST: "localhost",
    REDIS_PORT: 6379,
    JWT_SECRET: "strong_test_secret_with_more_than_16_characters",
  };

  const originalEnv = process.env;

  beforeEach(() => {
    // Clear process.env variables that could interfere with isolated unit tests
    process.env = { ...originalEnv };
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_USER;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.JWT_SECRET;
    delete process.env.SERVER_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should succeed with a valid complete configuration", () => {
    const validated = validateEnvironment(validBaseConfig);

    expect(validated.POSTGRES_HOST).toBe("localhost");
    expect(validated.POSTGRES_PORT).toBe(5432);
    expect(validated.POSTGRES_DB).toBe("edubranch_ai");
    expect(validated.POSTGRES_USER).toBe("edubranch");
    expect(validated.POSTGRES_PASSWORD).toBe("changeme_db_password");
    expect(validated.REDIS_HOST).toBe("localhost");
    expect(validated.REDIS_PORT).toBe(6379);
    expect(validated.JWT_SECRET).toBe("strong_test_secret_with_more_than_16_characters");
  });

  it("should reject and list all missing mandatory variables on empty config", () => {
    expect(() => validateEnvironment({})).toThrow(/Environment validation failed/);

    try {
      validateEnvironment({});
    } catch (err: any) {
      expect(err.message).toContain("POSTGRES_HOST is required");
      expect(err.message).toContain("POSTGRES_DB is required");
      expect(err.message).toContain("POSTGRES_USER is required");
      expect(err.message).toContain("POSTGRES_PASSWORD is required");
      expect(err.message).toContain("REDIS_HOST is required");
      expect(err.message).toContain("JWT_SECRET is required");
    }
  });

  it("should reject invalid POSTGRES_PORT", () => {
    const invalidConfig = {
      ...validBaseConfig,
      POSTGRES_PORT: 999999, // Out of valid port range
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      /POSTGRES_PORT must be a valid port number between 1 and 65535/,
    );
  });

  it("should reject invalid REDIS_PORT", () => {
    const invalidConfig = {
      ...validBaseConfig,
      REDIS_PORT: "not-a-number",
    };

    expect(() => validateEnvironment(invalidConfig as any)).toThrow(
      /REDIS_PORT must be a valid port number between 1 and 65535/,
    );
  });

  it("should reject JWT_SECRET that is too short (< 16 chars)", () => {
    const invalidConfig = {
      ...validBaseConfig,
      JWT_SECRET: "too_short",
    };

    expect(() => validateEnvironment(invalidConfig)).toThrow(
      /JWT_SECRET must be at least 16 characters long/,
    );
  });

  it("should reject default changeme_db_password in production mode", () => {
    const prodConfig = {
      ...validBaseConfig,
      NODE_ENV: "production",
      POSTGRES_PASSWORD: "changeme_db_password",
      JWT_SECRET: "production_super_secret_key_minimum_64_characters_random_hex_string_12345",
    };

    expect(() => validateEnvironment(prodConfig)).toThrow(
      /POSTGRES_PASSWORD cannot use default 'changeme_db_password' in production/,
    );
  });

  it("should reject insecure JWT_SECRET placeholder in production mode", () => {
    const prodConfig = {
      ...validBaseConfig,
      NODE_ENV: "production",
      POSTGRES_PASSWORD: "real_production_db_password_123456",
      JWT_SECRET: "changeme_generate_a_strong_random_jwt_secret_min_64_chars",
    };

    expect(() => validateEnvironment(prodConfig)).toThrow(
      /JWT_SECRET cannot use insecure development placeholder in production/,
    );
  });
});
