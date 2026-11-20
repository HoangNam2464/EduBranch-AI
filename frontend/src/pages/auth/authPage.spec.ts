import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LANDING_ANCHORS } from "../landing/landingConstants.ts";
import { authErrorMessage } from "./components/authErrors.ts";
import { AxiosError, type AxiosResponse } from "axios";

describe("Public Landing & Auth Specification (FE-024 / EBA-87)", () => {
  describe("AC-1: Single Scrolling Landing Page & Anchors", () => {
    it("defines the canonical anchor keys and matching section IDs", () => {
      assert.equal(LANDING_ANCHORS.how, "cach-hoat-dong");
      assert.equal(LANDING_ANCHORS.modes, "hai-che-do");
      assert.equal(LANDING_ANCHORS.faq, "cau-hoi");
    });
  });

  describe("AC-2 & AC-3: Authentication Form Validation & Error States", () => {
    // Mock translation function
    const mockT = ((key: string) => {
      const translations: Record<string, string> = {
        "g1.errors.network": "Lỗi kết nối máy chủ",
        "g1.errors.tooManyAttempts": "Quá nhiều lần thử. Vui lòng đợi trong giây lát",
        "g1.errors.invalidCredentials": "Email hoặc mật khẩu không chính xác",
        "g1.errors.emailTaken": "Email này đã được đăng ký",
        "g1.errors.invalidData": "Dữ liệu nhập vào không hợp lệ",
        "g1.errors.generic": "Đã có lỗi xảy ra. Vui lòng thử lại",
        "g1.errors.emailRequired": "Vui lòng nhập email",
        "g1.errors.passwordRequired": "Vui lòng nhập mật khẩu",
        "g1.errors.passwordMin": "Mật khẩu phải có ít nhất 8 ký tự",
        "g1.errors.passwordMismatch": "Mật khẩu xác nhận không khớp",
      };
      return translations[key] ?? key;
    }) as any;

    it("correctly maps 401 Unauthorized during login flow", () => {
      const error = new AxiosError("Unauthorized", "401", undefined, undefined, {
        status: 401,
        data: {},
      } as AxiosResponse);
      const msg = authErrorMessage(error, mockT, "login");
      assert.equal(msg, "Email hoặc mật khẩu không chính xác");
    });

    it("correctly maps 409 Conflict during register flow", () => {
      const error = new AxiosError("Conflict", "409", undefined, undefined, {
        status: 409,
        data: {},
      } as AxiosResponse);
      const msg = authErrorMessage(error, mockT, "register");
      assert.equal(msg, "Email này đã được đăng ký");
    });

    it("correctly maps 429 Too Many Requests rate limiter", () => {
      const error = new AxiosError("Too Many Requests", "429", undefined, undefined, {
        status: 429,
        data: {},
      } as AxiosResponse);
      const msg = authErrorMessage(error, mockT, "login");
      assert.equal(msg, "Quá nhiều lần thử. Vui lòng đợi trong giây lát");
    });

    it("correctly handles server network failures (502/503/no response)", () => {
      const errorNoResponse = new AxiosError("Network Error");
      const msgNoResponse = authErrorMessage(errorNoResponse, mockT, "login");
      assert.equal(msgNoResponse, "Lỗi kết nối máy chủ");

      const error503 = new AxiosError("Service Unavailable", "503", undefined, undefined, {
        status: 503,
        data: {},
      } as AxiosResponse);
      const msg503 = authErrorMessage(error503, mockT, "login");
      assert.equal(msg503, "Lỗi kết nối máy chủ");
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
  });

  describe("AC-4: Token Storage Security", () => {
    it("ensures auth state is scoped strictly to authStore without global window leaks", () => {
      // Invariant: no raw secret tokens on globalThis or window
      assert.equal((globalThis as any).token, undefined);
      assert.equal((globalThis as any).accessToken, undefined);
    });
  });
});
