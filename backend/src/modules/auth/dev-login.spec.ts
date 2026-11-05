import { NotFoundException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { devLoginEmailFor, isDevLoginEnabled } from "./dev-login";

describe("dev quick login (A13)", () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  describe("isDevLoginEnabled", () => {
    it("is enabled only for NODE_ENV=development with ENABLE_DEV_LOGIN=true", () => {
      expect(isDevLoginEnabled({ NODE_ENV: "development", ENABLE_DEV_LOGIN: "true" } as any)).toBe(true);
    });

    it.each([
      [{ NODE_ENV: "production", ENABLE_DEV_LOGIN: "true" }],
      [{ NODE_ENV: "test", ENABLE_DEV_LOGIN: "true" }],
      [{ NODE_ENV: "development" }],
      [{ NODE_ENV: "development", ENABLE_DEV_LOGIN: "TRUE" }],
      [{ ENABLE_DEV_LOGIN: "true" }],
    ])("is disabled for %j", (env) => {
      expect(isDevLoginEnabled(env as any)).toBe(false);
    });
  });

  describe("devLoginEmailFor", () => {
    const env = { DEV_LOGIN_LECTURER_EMAIL: " Lecturer@Demo.test ", DEV_LOGIN_STUDENT_EMAIL: "" } as any;
    it("maps roles to configured emails, normalised", () => {
      expect(devLoginEmailFor("LECTURER", env)).toBe("lecturer@demo.test");
    });
    it("returns null for unknown roles or empty config", () => {
      expect(devLoginEmailFor("STUDENT", env)).toBeNull();
      expect(devLoginEmailFor("ADMIN", env)).toBeNull();
      expect(devLoginEmailFor(undefined, env)).toBeNull();
    });
  });

  describe("AuthService.devLogin", () => {
    const db = { query: jest.fn() };
    const jwt = { sign: jest.fn().mockReturnValue("signed-token") };
    const service = new AuthService(db as any, jwt as any);

    beforeEach(() => {
      db.query.mockReset();
      jwt.sign.mockClear();
    });

    it("answers 404 without touching the database when disabled", async () => {
      process.env.NODE_ENV = "production";
      process.env.ENABLE_DEV_LOGIN = "true";
      process.env.DEV_LOGIN_LECTURER_EMAIL = "lecturer@demo.test";
      await expect(service.devLogin("LECTURER")).rejects.toBeInstanceOf(NotFoundException);
      expect(db.query).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("answers 404 when the configured account does not exist with that role", async () => {
      process.env.NODE_ENV = "development";
      process.env.ENABLE_DEV_LOGIN = "true";
      process.env.DEV_LOGIN_STUDENT_EMAIL = "student@demo.test";
      db.query.mockResolvedValueOnce({ rows: [] });
      await expect(service.devLogin("STUDENT")).rejects.toBeInstanceOf(NotFoundException);
      expect(db.query.mock.calls[0][1]).toEqual(["student@demo.test", "STUDENT"]);
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("issues a normal token for the configured account when enabled", async () => {
      process.env.NODE_ENV = "development";
      process.env.ENABLE_DEV_LOGIN = "true";
      process.env.DEV_LOGIN_LECTURER_EMAIL = "lecturer@demo.test";
      db.query.mockResolvedValueOnce({
        rows: [{ id: "u1", email: "lecturer@demo.test", full_name: "GV Demo", role: "LECTURER" }],
      });
      const res = await service.devLogin("LECTURER");
      expect(res.accessToken).toBe("signed-token");
      expect(res.user.role).toBe("LECTURER");
    });
  });
});
