import { CaseService } from "./case.service";

/** Spec 007 AC-A9: case generation and status changes are written to the activity log. */
describe("CaseService — activity log (BE-032)", () => {
  const owner = "lect-1";
  const audit = { record: jest.fn().mockResolvedValue(undefined) };

  beforeEach(() => audit.record.mockClear());

  /** Ownership read via db.query; the status write runs in a transaction that locks the case row (D5). */
  const statusDb = (row: { status: string }) => {
    const client = {
      query: jest.fn(async (sql: string) => (sql.includes("FOR UPDATE") ? { rows: [{ status: row.status }] } : { rows: [] })),
      release: jest.fn(),
    };
    return {
      query: jest.fn(async (sql: string) => (sql.startsWith("SELECT c.id") ? { rows: [row] } : { rows: [] })),
      getClient: jest.fn(async () => client),
    };
  };

  it("logs CASE_GENERATION_FAILED with duration and HTTP code when the AI call fails, then rethrows", async () => {
    const db = {
      query: jest.fn(async (sql: string) =>
        sql.includes("FROM users") ? { rows: [{ id: owner }] } : { rows: [{ id: "c-1", is_active: true }] },
      ),
    };
    const err = Object.assign(new Error("upstream"), { getStatus: () => 504 });
    const ai = { generateCase: jest.fn().mockRejectedValue(err) };
    const service = new CaseService(db as any, ai as any, audit as any);

    await expect(service.generateCase("c-1", owner, { materialIds: ["m-1"] })).rejects.toBe(err);
    expect(audit.record).toHaveBeenCalledTimes(1);
    const event = audit.record.mock.calls[0][0];
    expect(event).toMatchObject({ type: "CASE_GENERATION_FAILED", outcome: "ERROR", actorId: owner });
    expect(event.meta).toMatchObject({ courseId: "c-1", errorCode: "HTTP_504" });
    expect(typeof event.meta.durationMs).toBe("number");
  });

  it("logs CASE_STATUS_CHANGED only when the status really changes", async () => {
    const row = { id: "k-1", status: "DRAFT", learning_mode: "BRANCHING_STUDY", lecturer_id: owner };
    const db = statusDb(row);
    const service = new CaseService(db as any, {} as any, audit as any);

    await service.updateCaseStatus("k-1", owner, "REVIEWED");
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({ type: "CASE_STATUS_CHANGED", targetId: "k-1", meta: { from: "DRAFT", to: "REVIEWED" } }),
    );

    audit.record.mockClear();
    await service.updateCaseStatus("k-1", owner, "DRAFT");
    expect(audit.record).not.toHaveBeenCalled();
  });

  it("works without an audit service (existing module wiring and tests)", async () => {
    const row = { id: "k-1", status: "DRAFT", learning_mode: "BRANCHING_STUDY", lecturer_id: owner };
    const db = statusDb(row);
    await expect(new CaseService(db as any, {} as any).updateCaseStatus("k-1", owner, "REVIEWED")).resolves.toEqual({
      id: "k-1",
      status: "REVIEWED",
    });
  });
});
