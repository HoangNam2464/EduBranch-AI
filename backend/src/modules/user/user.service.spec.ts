import { BadRequestException, NotFoundException } from "@nestjs/common";
import { UserService } from "./user.service";

const row = {
  id: "u-1",
  email: "a@uni.edu.vn",
  full_name: "Nguyen Van A",
  role: "STUDENT",
  created_at: new Date("2026-11-01T00:00:00Z"),
  preferred_language: "vi",
  password_hash: "$2b$should-never-leak",
};

describe("UserService (BE-031, spec 007)", () => {
  it("returns the profile with language and without password hash (AC-P1)", async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [row] }) };
    const profile = await new UserService(db as any).getProfile("u-1");
    expect(profile).toEqual({
      id: "u-1",
      email: "a@uni.edu.vn",
      fullName: "Nguyen Van A",
      role: "STUDENT",
      createdAt: row.created_at,
      language: "vi",
    });
    expect(JSON.stringify(profile)).not.toContain("should-never-leak");
  });

  it("updates only the token owner's row (AC-P2, AC-P4)", async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [{ ...row, full_name: "B", preferred_language: "en" }] }) };
    const profile = await new UserService(db as any).updateProfile("u-1", { fullName: "B", language: "en" });
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain("WHERE id = $1");
    expect(params).toEqual(["u-1", "B", "en"]);
    expect(profile.fullName).toBe("B");
    expect(profile.language).toBe("en");
  });

  it("keeps the other field when only one is sent", async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [row] }) };
    await new UserService(db as any).updateProfile("u-1", { language: "en" });
    expect(db.query.mock.calls[0][1]).toEqual(["u-1", null, "en"]);
  });

  it("rejects an empty update (AC-P3)", async () => {
    const db = { query: jest.fn() };
    await expect(new UserService(db as any).updateProfile("u-1", {})).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query).not.toHaveBeenCalled();
  });

  it("404 when the user no longer exists", async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    await expect(new UserService(db as any).updateProfile("u-x", { fullName: "Abc" })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
