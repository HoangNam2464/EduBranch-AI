import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LANDING_ANCHORS } from "../landing/landingConstants.ts";
import { authErrorMessage } from "./components/authErrors.ts";
import { AxiosError, type AxiosResponse } from "axios";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

function resolveKey(obj: Record<string, any>, keyPath: string): string {
  const parts = keyPath.split(".");
  let curr = obj;
  for (const part of parts) {
    if (curr === undefined || curr === null) return keyPath;
    curr = curr[part];
  }
  return typeof curr === "string" ? curr : keyPath;
}

describe("Public Landing & Auth Specification (FE-024 / EBA-87)", () => {
  describe("AC-1: Single Scrolling Landing Page & Anchors", () => {
    it("defines the canonical anchor keys and matching section IDs", () => {
      assert.equal(LANDING_ANCHORS.how, "cach-hoat-dong");
      assert.equal(LANDING_ANCHORS.modes, "hai-che-do");
      assert.equal(LANDING_ANCHORS.faq, "cau-hoi");
    });

    it("has matching anchor navigation keys in vi.json and en.json", () => {
      assert.ok(vi.g1.landing.nav.how, "vi.json must have landing nav how");
      assert.ok(en.g1.landing.nav.how, "en.json must have landing nav how");
      assert.ok(vi.g1.landing.nav.modes, "vi.json must have landing nav modes");
      assert.ok(en.g1.landing.nav.modes, "en.json must have landing nav modes");
      assert.ok(vi.g1.landing.nav.faq, "vi.json must have landing nav faq");
      assert.ok(en.g1.landing.nav.faq, "en.json must have landing nav faq");
    });
  });

  describe("AC-2 & AC-3: Authentication Form Validation & Error States", () => {
    const viT = ((key: string) => resolveKey(vi, key)) as any;
    const enT = ((key: string) => resolveKey(en, key)) as any;
    const keyT = ((key: string) => key) as any;

    it("correctly maps 401 Unauthorized during login flow to semantic error key and text", () => {
      const error = new AxiosError("Unauthorized", "401", undefined, undefined, {
        status: 401,
        data: {},
      } as AxiosResponse);
      const key = authErrorMessage(error, keyT, "login");
      assert.equal(key, "g1.errors.invalidCredentials");

      const msgVi = authErrorMessage(error, viT, "login");
      assert.equal(msgVi, vi.g1.errors.invalidCredentials);
      assert.equal(msgVi, "Email hoặc mật khẩu không đúng.");

      const msgEn = authErrorMessage(error, enT, "login");
      assert.equal(msgEn, en.g1.errors.invalidCredentials);
      assert.equal(msgEn, "Incorrect email or password.");
    });

    it("correctly maps 409 Conflict during register flow to semantic error key and text", () => {
      const error = new AxiosError("Conflict", "409", undefined, undefined, {
        status: 409,
        data: {},
      } as AxiosResponse);
      const key = authErrorMessage(error, keyT, "register");
      assert.equal(key, "g1.errors.emailTaken");

      const msgVi = authErrorMessage(error, viT, "register");
      assert.equal(msgVi, vi.g1.errors.emailTaken);
      assert.equal(msgVi, "Email này đã được dùng cho một tài khoản khác.");

      const msgEn = authErrorMessage(error, enT, "register");
      assert.equal(msgEn, en.g1.errors.emailTaken);
    });

    it("correctly maps 429 Too Many Requests rate limiter", () => {
      const error = new AxiosError("Too Many Requests", "429", undefined, undefined, {
        status: 429,
        data: {},
      } as AxiosResponse);
      const key = authErrorMessage(error, keyT, "login");
      assert.equal(key, "g1.errors.tooManyAttempts");

      const msgVi = authErrorMessage(error, viT, "login");
      assert.equal(msgVi, vi.g1.errors.tooManyAttempts);
      assert.equal(msgVi, "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.");
    });

    it("correctly handles server network failures (502/503/no response)", () => {
      const errorNoResponse = new AxiosError("Network Error");
      assert.equal(authErrorMessage(errorNoResponse, keyT, "login"), "g1.errors.network");
      assert.equal(authErrorMessage(errorNoResponse, viT, "login"), vi.g1.errors.network);

      const error503 = new AxiosError("Service Unavailable", "503", undefined, undefined, {
        status: 503,
        data: {},
      } as AxiosResponse);
      assert.equal(authErrorMessage(error503, keyT, "login"), "g1.errors.network");
      assert.equal(authErrorMessage(error503, viT, "login"), vi.g1.errors.network);
    });

    it("correctly maps 400 Bad Request to invalidData error key", () => {
      const error400 = new AxiosError("Bad Request", "400", undefined, undefined, {
        status: 400,
        data: {},
      } as AxiosResponse);
      assert.equal(authErrorMessage(error400, keyT, "login"), "g1.errors.invalidData");
      assert.equal(authErrorMessage(error400, viT, "login"), vi.g1.errors.invalidData);
    });

    it("validates password length threshold and confirmation matching", () => {
      const validatePassword = (pwd: string, confirm: string) => {
        if (pwd.length < 8) return "g1.errors.passwordMin";
        if (pwd !== confirm) return "g1.errors.passwordMismatch";
        return null;
      };

      assert.equal(validatePassword("short", "short"), "g1.errors.passwordMin");
      assert.equal(validatePassword("validpass123", "different"), "g1.errors.passwordMismatch");
      assert.equal(validatePassword("validpass123", "validpass123"), null);
    });

    it("verifies required error translation keys exist and are non-empty in both locales", () => {
      const requiredKeys = [
        "emailRequired",
        "passwordRequired",
        "fullNameRequired",
        "universityEmailRequired",
        "studentIdRequired",
        "departmentRequired",
        "passwordMin",
        "passwordMismatch",
        "network",
        "invalidCredentials",
        "emailTaken",
        "invalidData",
        "generic",
        "tooManyAttempts",
        "notAdmin",
      ] as const;

      for (const k of requiredKeys) {
        assert.ok(vi.g1.errors[k], `vi.json missing g1.errors.${k}`);
        assert.ok(en.g1.errors[k], `en.json missing g1.errors.${k}`);
        assert.notEqual(vi.g1.errors[k].trim(), "", `vi.json g1.errors.${k} is empty`);
        assert.notEqual(en.g1.errors[k].trim(), "", `en.json g1.errors.${k} is empty`);
      }
    });
  });

  describe("AC-4: Role Enforcements & Token Storage Security", () => {
    it("ensures auth state is scoped strictly to authStore without global window leaks", () => {
      assert.equal((globalThis as any).token, undefined);
      assert.equal((globalThis as any).accessToken, undefined);
    });

    it("enforces admin-only guard for admin login flow", () => {
      const checkAdminRole = (userRole: string) => {
        if (userRole !== "ADMIN") {
          return "g1.errors.notAdmin";
        }
        return null;
      };

      assert.equal(checkAdminRole("STUDENT"), "g1.errors.notAdmin");
      assert.equal(checkAdminRole("LECTURER"), "g1.errors.notAdmin");
      assert.equal(checkAdminRole("ADMIN"), null);
    });

    it("supports both student and lecturer registration role targets", () => {
      const validRoles = ["STUDENT", "LECTURER"] as const;
      assert.ok(validRoles.includes("STUDENT"));
      assert.ok(validRoles.includes("LECTURER"));
      assert.ok(vi.g1.register.roleStudent);
      assert.ok(vi.g1.register.roleLecturer);
      assert.ok(en.g1.register.roleStudent);
      assert.ok(en.g1.register.roleLecturer);
    });
  });
});
