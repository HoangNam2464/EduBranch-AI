import { AuditService } from "./audit.service";

describe("AuditService (spec 007 AC-A9)", () => {
  it("inserts the event with JSON meta and nullable actor/target", async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    const service = new AuditService(db as any);

    await service.record({ type: "LOGIN_FAILED", outcome: "WARNING", meta: { reason: "BAD_PASSWORD" } });

    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain("INSERT INTO audit_events");
    expect(params).toEqual(["LOGIN_FAILED", "WARNING", null, null, JSON.stringify({ reason: "BAD_PASSWORD" })]);
  });

  it("never throws when the insert fails", async () => {
    const db = { query: jest.fn().mockRejectedValue(new Error("relation does not exist")) };
    const service = new AuditService(db as any);

    await expect(
      service.record({ type: "CASE_GENERATED", outcome: "SUCCESS", actorId: "u-1" }),
    ).resolves.toBeUndefined();
  });
});
