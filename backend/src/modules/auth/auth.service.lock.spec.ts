import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";

/** Spec 007 AC-A5 / AC-A9: locked accounts and login audit events. */
describe("AuthService — account lock and login audit (BE-032)", () => {
  const jwt = { sign: jest.fn().mockReturnValue("token") };
  let hash: string;

  beforeAll(async () => {
    hash = await bcrypt.hash("Correct#Pass1", 4);
  });

  function make(rows: any[]) {
    const db = { query: jest.fn().mockResolvedValue({ rows }) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    return { service: new AuthService(db as any, jwt as any, audit as any), db, audit };
  }

  const user = (isActive: boolean) => ({
    id: "u-1",
    email: "a@uni.edu.vn",
    password_hash: hash,
    full_name: "A",
    role: "STUDENT",
    is_active: isActive,
  });

  it("refuses a locked account with the generic message and logs ACCOUNT_LOCKED", async () => {
    const { service, audit } = make([user(false)]);
    await expect(service.login({ email: "a@uni.edu.vn", password: "Correct#Pass1" })).rejects.toThrow(
      new UnauthorizedException("Invalid email or password"),
    );
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "LOGIN_FAILED", actorId: "u-1", meta: { reason: "ACCOUNT_LOCKED" } }),
    );
  });

  it("logs LOGIN_SUCCEEDED for an active account", async () => {
    const { service, audit } = make([user(true)]);
    await service.login({ email: "a@uni.edu.vn", password: "Correct#Pass1" });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ type: "LOGIN_SUCCEEDED", actorId: "u-1" }));
  });

  it("does not store the typed e-mail for an unknown account", async () => {
    const { service, audit } = make([]);
    await expect(service.login({ email: "ghost@x.vn", password: "whatever1" })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    const event = audit.record.mock.calls[0][0];
    expect(event).toEqual({ type: "LOGIN_FAILED", outcome: "WARNING", meta: { reason: "UNKNOWN_ACCOUNT" } });
    expect(JSON.stringify(event)).not.toContain("ghost");
  });

  it("rejects an already-issued token once the account is locked", async () => {
    const { service } = make([user(false)]);
    await expect(service.validateToken({ sub: "u-1" } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("still validates a token of an active account and reads the role from the DB", async () => {
    const { service } = make([{ ...user(true), role: "LECTURER" }]);
    await expect(service.validateToken({ sub: "u-1", role: "STUDENT" } as any)).resolves.toMatchObject({
      id: "u-1",
      role: "LECTURER",
    });
  });
});
