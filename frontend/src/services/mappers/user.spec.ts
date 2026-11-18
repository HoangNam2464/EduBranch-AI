import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toUserProfile, type UserProfileRow } from "./user";

const row: UserProfileRow = {
  id: "u1",
  email: "an.nguyen@duytan.edu.vn",
  fullName: "TS. Nguyễn Văn An",
  role: "LECTURER",
  createdAt: "2026-11-14T15:06:43.672Z",
};

describe("toUserProfile (GET /users/me → UserProfile)", () => {
  it("maps every field and exposes createdAt as joinedAt", () => {
    assert.deepEqual(toUserProfile(row), {
      id: "u1",
      email: "an.nguyen@duytan.edu.vn",
      fullName: "TS. Nguyễn Văn An",
      role: "LECTURER",
      joinedAt: "2026-11-14T15:06:43.672Z",
    });
  });

  it("rejects a role the frontend does not know", () => {
    assert.throws(() => toUserProfile({ ...row, role: "GUEST" }), /Unknown role/);
  });
});
