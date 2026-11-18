import { ReasoningService } from "./reasoning.service";
import { DatabaseService } from "../../common/database/database.service";
import { ForbiddenException } from "@nestjs/common";

describe("ReasoningService published-only student access", () => {
  const mockDb = { query: jest.fn() };
  let service: ReasoningService;

  beforeEach(() => {
    service = new ReasoningService(mockDb as unknown as DatabaseService);
  });

  afterEach(() => {
    mockDb.query.mockReset();
  });

  it.each(["DRAFT", "REVIEWED", "APPROVED"])(
    "blocks direct reasoning ID access for %s cases before returning case content",
    async (status) => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ student_id: "student-1", status }] });

      await expect(service.getReasoningById("reason-1", { id: "student-1", role: "STUDENT" }))
        .rejects.toThrow(ForbiddenException);

      expect(mockDb.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    },
  );

  it("returns reasoning for a student only after a published Case and owner check", async () => {
    mockDb.query.mockResolvedValueOnce({ rows: [{ id: "reason-1", consequence: "Published consequence" }] });

    const result = await service.getReasoningById("reason-1", { id: "student-1", role: "STUDENT" });

    expect(result.consequence).toBe("Published consequence");
    expect(mockDb.query.mock.calls[0][0]).toContain("a.student_id = $2 AND c.status = 'PUBLISHED'");
    expect(mockDb.query).toHaveBeenCalledTimes(1);
  });

  it.each(["DRAFT", "REVIEWED", "APPROVED"])(
    "blocks direct attempt reasoning access for a %s Case",
    async (status) => {
      mockDb.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ student_id: "student-1", status }] });

      await expect(service.getReasoningsByAttempt("attempt-1", { id: "student-1", role: "STUDENT" }))
        .rejects.toThrow(ForbiddenException);

      expect(mockDb.query.mock.calls[0][0]).toContain("c.status = 'PUBLISHED'");
      expect(mockDb.query).toHaveBeenCalledTimes(2);
    },
  );

  it("returns attempt reasoning only after the attempt belongs to the student and is published", async () => {
    mockDb.query
      .mockResolvedValueOnce({ rows: [{ id: "attempt-1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "reason-1" }] });

    const result = await service.getReasoningsByAttempt("attempt-1", { id: "student-1", role: "STUDENT" });

    expect(result).toEqual([{ id: "reason-1" }]);
    expect(mockDb.query.mock.calls[0][0]).toContain("a.student_id = $2 AND c.status = 'PUBLISHED'");
    expect(mockDb.query.mock.calls[1][0]).toContain("c.status = 'PUBLISHED'");
  });
});
