import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("ProfileEditPage & FE-030 Acceptance Criteria", () => {
  it("AC-3: supports switching language dynamically between vi and en", async () => {
    const { default: i18n } = await import("@/lib/i18n");

    await i18n.changeLanguage("en");
    assert.equal(i18n.language, "en");
    assert.equal(i18n.t("g4.profile.editProfile"), "Edit Profile");

    await i18n.changeLanguage("vi");
    assert.equal(i18n.language, "vi");
    assert.equal(i18n.t("g4.profile.editProfile"), "Chỉnh sửa hồ sơ");
  });

  it("AC-4: user profile data is bound strictly to /users/me without user id parameter", async () => {
    const { userService } = await import("@/services/userService");
    const { default: apiClient } = await import("@/services/apiClient");

    let requestedEndpoint = "";
    const originalGet = apiClient.get;
    try {
      apiClient.get = (async (url: string) => {
        requestedEndpoint = url;
        return {
          data: {
            status: "SUCCESS",
            data: {
              id: "me-id",
              email: "student@duytan.edu.vn",
              fullName: "Nguyễn Đức Bảo Hy",
              role: "STUDENT",
              createdAt: "2026-11-19T00:00:00Z",
            },
          },
        };
      }) as any;

      await userService.getMyProfile();
      assert.equal(requestedEndpoint, "/users/me");
      // Guarantee no other user ID can be injected into the path
      assert.equal(requestedEndpoint.includes("/users/other"), false);
    } finally {
      apiClient.get = originalGet;
    }
  });

  it("AC-2: profile translation keys for fixed-column details exist for both VI and EN", async () => {
    const { default: i18n } = await import("@/lib/i18n");

    const requiredKeys = [
      "g4.profile.email",
      "g4.profile.role",
      "g4.profile.joined",
      "g4.profile.editProfile",
      "g4.profile.fullName",
      "g4.profile.language",
      "g4.profile.saveChanges",
    ];

    for (const lang of ["vi", "en"]) {
      await i18n.changeLanguage(lang);
      for (const key of requiredKeys) {
        const text = i18n.t(key);
        assert.ok(text && text !== key, `Translation key ${key} must exist in ${lang}`);
      }
    }
  });
});
