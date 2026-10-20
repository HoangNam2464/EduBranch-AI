import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock localStorage and window for Node test environment
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

// Dynamic import so authStore initializes after localStorage and window are available
const { useAuthStore } = await import("./authStore");
import type { User } from "../types";

describe("authStore (Session State & Persistence)", () => {
  const dummyLecturer: User = {
    id: "lec-1",
    email: "lecturer@university.edu.vn",
    fullName: "TS. Nguyen Van A",
    role: "LECTURER",
  };

  const dummyStudent: User = {
    id: "stu-1",
    email: "student@university.edu.vn",
    fullName: "Tran Van Sinh Vien",
    role: "STUDENT",
  };

  beforeEach(() => {
    useAuthStore.getState().logout();
    mockStorage.clear();
  });

  it("should initialize with unauthenticated empty state", () => {
    const state = useAuthStore.getState();
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.user, null);
    assert.equal(state.accessToken, null);
    assert.equal(state.isLecturer(), false);
    assert.equal(state.isStudent(), false);
  });

  it("should set user, token, and compute isLecturer correctly on login", () => {
    useAuthStore.getState().login(dummyLecturer, "valid-jwt-token");

    const state = useAuthStore.getState();
    assert.equal(state.isAuthenticated, true);
    assert.equal(state.accessToken, "valid-jwt-token");
    assert.deepEqual(state.user, dummyLecturer);
    assert.equal(state.isLecturer(), true);
    assert.equal(state.isStudent(), false);
  });

  it("should set user, token, and compute isStudent correctly for STUDENT", () => {
    useAuthStore.getState().login(dummyStudent, "student-jwt-token");

    const state = useAuthStore.getState();
    assert.equal(state.isAuthenticated, true);
    assert.equal(state.accessToken, "student-jwt-token");
    assert.deepEqual(state.user, dummyStudent);
    assert.equal(state.isLecturer(), false);
    assert.equal(state.isStudent(), true);
  });

  it("should clear session and tokens upon logout", () => {
    useAuthStore.getState().login(dummyLecturer, "token-to-clear");
    assert.equal(useAuthStore.getState().isAuthenticated, true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    assert.equal(state.isAuthenticated, false);
    assert.equal(state.user, null);
    assert.equal(state.accessToken, null);
    assert.equal(state.refreshToken, null);
    assert.equal(state.isLecturer(), false);
    assert.equal(state.isStudent(), false);
  });

  it("should persist session state to storage for reload recovery", () => {
    useAuthStore.getState().login(dummyLecturer, "persisted-token");

    const persistedRaw = mockStorage.get("edubranch-auth");
    assert.ok(persistedRaw, "edubranch-auth localStorage key should exist");

    const parsed = JSON.parse(persistedRaw);
    assert.equal(parsed.state.accessToken, "persisted-token");
    assert.equal(parsed.state.isAuthenticated, true);
    assert.deepEqual(parsed.state.user, dummyLecturer);
  });
});
