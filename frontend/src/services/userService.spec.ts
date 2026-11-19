import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { default: apiClient } = await import("@/services/apiClient");
const { userService } = await import("@/services/userService");

describe("userService (BE-031 / FE-030 User Profile)", () => {
  it("getMyProfile calls GET /users/me and returns mapped UserProfile (AC-1, AC-4)", async () => {
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        assert.equal(url, "/users/me");
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "user-123",
              email: "student@duytan.edu.vn",
              fullName: "Nguyễn Đức Bảo Hy",
              role: "STUDENT",
              createdAt: "2026-11-19T00:00:00Z",
            },
          },
        };
      }) as any;

      const profile = await userService.getMyProfile();
      assert.equal(profile.id, "user-123");
      assert.equal(profile.email, "student@duytan.edu.vn");
      assert.equal(profile.fullName, "Nguyễn Đức Bảo Hy");
      assert.equal(profile.role, "STUDENT");
      assert.equal(profile.joinedAt, "2026-11-19T00:00:00Z");
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("updateMyProfile calls PATCH /users/me with payload and returns updated profile (AC-1)", async () => {
    const originalPatch = apiClient.patch;
    try {
      apiClient.patch = (async (url: string, payload: any) => {
        assert.equal(url, "/users/me");
        assert.deepEqual(payload, {
          fullName: "TS. Nguyễn Đức Bảo Hy",
          language: "vi",
        });
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "user-123",
              email: "student@duytan.edu.vn",
              fullName: "TS. Nguyễn Đức Bảo Hy",
              role: "STUDENT",
              createdAt: "2026-11-19T00:00:00Z",
            },
          },
        };
      }) as any;

      const updated = await userService.updateMyProfile({
        fullName: "TS. Nguyễn Đức Bảo Hy",
        language: "vi",
      });
      assert.equal(updated.fullName, "TS. Nguyễn Đức Bảo Hy");
      assert.equal(updated.id, "user-123");
    } finally {
      apiClient.patch = originalPatch;
    }
  });
});
