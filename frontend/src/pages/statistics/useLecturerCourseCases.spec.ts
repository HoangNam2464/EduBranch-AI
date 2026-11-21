import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock localStorage and window before initializing Zustand authStore
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

const { useAuthStore } = await import("@/stores/authStore");
const {
  getFreshCache,
  setLecturerCourseCasesCache,
  invalidateLecturerCourseCases,
} = await import("@/pages/statistics/useLecturerCourseCases");
import type { CourseWithCases } from "@/pages/statistics/useLecturerCourseCases";
import type { Course, User } from "@/types";

describe("useLecturerCourseCases cache security & lifecycle", () => {
  const dummyCourse: Course = {
    id: "course-101",
    name: "Quản trị Chiến lược",
    courseCode: "STRAT101",
    lecturerId: "lec-1",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleData: CourseWithCases[] = [
    {
      course: dummyCourse,
      cases: [],
      materials: [],
    },
  ];

  const lecturerA: User = {
    id: "user-A",
    email: "lecturerA@dtu.edu.vn",
    fullName: "TS. Nguyen Van A",
    role: "LECTURER",
  };

  const _lecturerB: User = {
    id: "user-B",
    email: "lecturerB@dtu.edu.vn",
    fullName: "TS. Tran Thi B",
    role: "LECTURER",
  };

  beforeEach(() => {
    invalidateLecturerCourseCases();
    useAuthStore.getState().logout();
    mockStorage.clear();
  });

  it("(a) a different user never gets the cached data from another user", () => {
    // Populate cache for User A
    setLecturerCourseCasesCache("user-A", "no-mat", sampleData);

    // User A can access fresh cache
    const cachedA = getFreshCache("user-A", "no-mat");
    assert.deepEqual(cachedA, sampleData);

    // User B must get null, preventing cross-user data leakage
    const cachedB = getFreshCache("user-B", "no-mat");
    assert.equal(cachedB, null, "User B should not see User A's cached courses");

    // Different subKey also returns null
    const cachedWithMat = getFreshCache("user-A", "with-mat");
    assert.equal(cachedWithMat, null, "Different subKey should not return stale data");
  });

  it("(b) authStore.logout() clears the cache immediately", () => {
    useAuthStore.getState().login(lecturerA, "token-a");
    setLecturerCourseCasesCache("user-A", "no-mat", sampleData);

    assert.ok(getFreshCache("user-A", "no-mat"), "Cache should exist before logout");

    // Execute logout
    useAuthStore.getState().logout();

    // Cache must be invalidated
    const postLogoutCache = getFreshCache("user-A", "no-mat");
    assert.equal(postLogoutCache, null, "Cache must be wiped on logout");
  });

  it("(c) an expired cache is rejected and returns null", () => {
    const expiredTimestamp = Date.now() - 61000; // 61 seconds ago (> 60s TTL)
    setLecturerCourseCasesCache("user-A", "no-mat", sampleData, expiredTimestamp);

    // Cache is expired, so getFreshCache returns null
    const result = getFreshCache("user-A", "no-mat");
    assert.equal(result, null, "Expired cache entries must return null so error state is displayed");
  });

  it("(d) invalidateLecturerCourseCases() clears cache immediately upon data mutation", () => {
    setLecturerCourseCasesCache("user-A", "no-mat", sampleData);
    assert.deepEqual(getFreshCache("user-A", "no-mat"), sampleData);

    // Call invalidation as triggered by courseService / caseService / materialService mutations
    invalidateLecturerCourseCases();

    assert.equal(getFreshCache("user-A", "no-mat"), null, "Cache must be empty after mutation invalidation");
  });
});
