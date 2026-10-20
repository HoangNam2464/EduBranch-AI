import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock localStorage and window
const mockStorage = new Map<string, string>();
const fakeLocalStorage = {
  getItem: (key: string) => mockStorage.get(key) ?? null,
  setItem: (key: string, value: string) => mockStorage.set(key, value),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
  key: (i: number) => Array.from(mockStorage.keys())[i] ?? null,
  get length() {
    return mockStorage.size;
  },
};

(globalThis as any).localStorage = fakeLocalStorage;
if (typeof (globalThis as any).window === "undefined") {
  (globalThis as any).window = globalThis;
}
(globalThis as any).window.localStorage = fakeLocalStorage;

const { useAuthStore } = await import("../stores/authStore");
const { default: apiClient } = await import("./apiClient");

describe("apiClient (HTTP 401 Handling & Authentication Contract)", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
    mockStorage.clear();
  });

  it("should inject Bearer token into outgoing requests when user is authenticated", async () => {
    useAuthStore.getState().login(
      {
        id: "u-1",
        email: "test@university.edu.vn",
        fullName: "Test User",
        role: "LECTURER",
      },
      "active-session-jwt-token"
    );

    const config: any = { headers: {} };
    // Run request interceptor handlers
    const requestHandler = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
    assert.ok(requestHandler, "Request interceptor should be registered");

    const modifiedConfig = await requestHandler(config);
    assert.equal(modifiedConfig.headers.Authorization, "Bearer active-session-jwt-token");
  });

  it("should not inject Authorization header when user is unauthenticated", async () => {
    useAuthStore.getState().logout();

    const config: any = { headers: {} };
    const requestHandler = (apiClient.interceptors.request as any).handlers[0]?.fulfilled;
    const modifiedConfig = await requestHandler(config);
    assert.equal(modifiedConfig.headers.Authorization, undefined);
  });

  it("should handle HTTP 401 by immediately calling logout without hanging on refresh endpoint", async () => {
    useAuthStore.getState().login(
      {
        id: "u-1",
        email: "student@university.edu.vn",
        fullName: "Student User",
        role: "STUDENT",
      },
      "expired-jwt-token"
    );
    assert.equal(useAuthStore.getState().isAuthenticated, true);

    const responseErrorHandler = (apiClient.interceptors.response as any).handlers[0]?.rejected;
    assert.ok(responseErrorHandler, "Response error interceptor should be registered");

    const error401 = {
      response: { status: 401, data: { message: "Unauthorized token" } },
      config: {},
    };

    await assert.rejects(
      async () => {
        await responseErrorHandler(error401);
      },
      (err: any) => {
        assert.equal(err.response.status, 401);
        return true;
      }
    );

    // Verify session was terminated
    const state = useAuthStore.getState();
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.accessToken, null);
    assert.equal(state.user, null);
  });
});
