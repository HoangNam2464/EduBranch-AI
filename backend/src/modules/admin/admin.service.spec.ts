import { ConflictException, NotFoundException } from "@nestjs/common";
import { AdminService } from "./admin.service";

/** Spec 007 AC-A4 / AC-A13: account status and role changes. */
describe("AdminService — status and role (BE-032)", () => {
  function make(targetRows: any[], otherAdmins: any[] = [{ id: "a-2" }]) {
    const client = {
      query: jest.fn(async (sql: string) => {
        if (sql.startsWith("SELECT id, role, is_active, full_name")) return { rows: targetRows };
        if (sql.includes("role = 'ADMIN' AND is_active = TRUE")) return { rows: otherAdmins };
        return { rows: [] };
      }),
      release: jest.fn(),
    };
    const db = { query: jest.fn(), getClient: jest.fn().mockResolvedValue(client) };
    const audit = { record: jest.fn().mockResolvedValue(undefined) };
    const service = new AdminService(db as any, audit as any, { check: jest.fn() } as any);
    return { service, client, audit };
  }

  const target = (role: string, active = true) => [{ id: "t-1", role, is_active: active, full_name: "Tran B" }];

  it("refuses to lock the caller's own account, with the standard error fields", async () => {
    const { service } = make(target("ADMIN"));
    const err = await service.setUserStatus("t-1", "t-1", "LOCKED").catch((e) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect(err.getResponse()).toEqual({
      statusCode: 409,
      error: "Conflict",
      message: "You cannot lock or unlock your own account",
      code: "CANNOT_LOCK_SELF",
    });
  });

  it("locks admin rows in id order before the target row (no deadlock between two admins)", async () => {
    const { service, client } = make(target("STUDENT"));
    await service.setUserStatus("a-1", "t-1", "LOCKED");
    const sqls = client.query.mock.calls.map((c: any[]) => c[0] as string);
    const adminsLock = sqls.findIndex((q) => q.includes("ORDER BY id FOR UPDATE"));
    const targetLock = sqls.findIndex((q) => q.startsWith("SELECT id, role, is_active, full_name"));
    expect(adminsLock).toBeGreaterThan(-1);
    expect(adminsLock).toBeLessThan(targetLock);
  });

  it("refuses to lock the last active admin", async () => {
    const { service, client } = make(target("ADMIN"), []);
    await expect(service.setUserStatus("a-1", "t-1", "LOCKED")).rejects.toBeInstanceOf(ConflictException);
    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
  });

  it("locks a student, commits and logs USER_LOCKED", async () => {
    const { service, client, audit } = make(target("STUDENT"));
    await expect(service.setUserStatus("a-1", "t-1", "LOCKED")).resolves.toEqual({ id: "t-1", status: "LOCKED" });
    expect(client.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE users SET is_active"), ["t-1", false]);
    expect(client.query).toHaveBeenCalledWith("COMMIT");
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ type: "USER_LOCKED", targetId: "t-1" }));
  });

  it("does not log when the status does not change", async () => {
    const { service, audit } = make(target("STUDENT", true));
    await service.setUserStatus("a-1", "t-1", "ACTIVE");
    expect(audit.record).not.toHaveBeenCalled();
  });

  it("404 for an unknown user", async () => {
    const { service } = make([]);
    await expect(service.setUserStatus("a-1", "t-1", "LOCKED")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("refuses to change the caller's own role", async () => {
    const { service } = make(target("ADMIN"));
    await expect(service.setUserRole("t-1", "t-1", "STUDENT")).rejects.toBeInstanceOf(ConflictException);
  });

  it("refuses to demote the last active admin", async () => {
    const { service } = make(target("ADMIN"), []);
    await expect(service.setUserRole("a-1", "t-1", "LECTURER")).rejects.toBeInstanceOf(ConflictException);
  });

  it("changes a role and logs from/to", async () => {
    const { service, audit } = make(target("STUDENT"));
    await expect(service.setUserRole("a-1", "t-1", "LECTURER")).resolves.toEqual({ id: "t-1", role: "LECTURER" });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "USER_ROLE_CHANGED", meta: { targetName: "Tran B", from: "STUDENT", to: "LECTURER" } }),
    );
  });

  describe("listLogs translated event search (EBA-114)", () => {
    function makeLogDb() {
      const db = {
        query: jest.fn(async (sql: string, _params?: unknown[]) => {
          if (sql.includes("COUNT(*) FILTER")) {
            return { rows: [{ events_today: "0", logins: "0", generations: "0", errors: "0" }] };
          }
          if (sql.startsWith("SELECT COUNT(*) AS total")) {
            return { rows: [{ total: "0" }] };
          }
          return { rows: [] };
        }),
        getClient: jest.fn(),
      };
      const service = new AdminService(db as any, { record: jest.fn() } as any, { check: jest.fn() } as any);
      return { service, db };
    }

    it("matches Vietnamese event titles and login failure reasons in parameterized SQL", async () => {
      const { service, db } = makeLogDb();
      await service.listLogs({ search: "Đăng nhập thất bại" });
      const [listSql, listParams] = db.query.mock.calls[0] as [string, unknown[]];
      expect(listSql).toContain("ae.event_type = ANY($2::text[])");
      expect(listParams).toContainEqual(["LOGIN_FAILED"]);
    });

    it("matches Vietnamese reason label 'Sai mật khẩu' against meta->>'reason'", async () => {
      const { service, db } = makeLogDb();
      await service.listLogs({ search: "Sai mật khẩu" });
      const [listSql, listParams] = db.query.mock.calls[0] as [string, unknown[]];
      expect(listSql).toContain("ae.meta->>'reason' = ANY($2::text[])");
      expect(listParams).toContainEqual(["BAD_PASSWORD"]);
    });

    it("matches English event titles without adding redundant clauses when nothing matches", async () => {
      const { service, db } = makeLogDb();
      await service.listLogs({ search: "Case generated" });
      const [, params] = db.query.mock.calls[0] as [string, unknown[]];
      expect(params).toContainEqual(["CASE_GENERATED"]);

      db.query.mockClear();
      await service.listLogs({ search: "no_label_match_xyz" });
      const [sql] = db.query.mock.calls[0] as [string, unknown[]];
      expect(sql).not.toContain("ae.event_type = ANY");
      expect(sql).not.toContain("meta->>'reason'");
    });
  });
});
