import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { ReasoningService } from "./reasoning.service";
import { DatabaseService } from "../../common/database/database.service";

describe("ReasoningService", () => {
  let service: ReasoningService;

  const mockDb = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReasoningService,
        {
          provide: DatabaseService,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<ReasoningService>(ReasoningService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getReasoningById", () => {
    const reasoningId = "11111111-1111-1111-1111-111111111111";
    const studentId = "student-123";

    it("should return reasoning record with consequence when attempt is completed", async () => {
      const mockRow = {
        id: reasoningId,
        attempt_id: "att-1",
        node_id: "n-1",
        selected_option_id: "opt-1",
        reasoning_text: "Clear reasoning",
        submitted_at: new Date().toISOString(),
        situation: "Critical situation",
        option_text: "Option A",
        consequence: "Consequence revealed",
        case_id: "c-1",
        student_id: studentId,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await service.getReasoningById(reasoningId, studentId);

      expect(result).toEqual(mockRow);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
      const [sql, params] = mockDb.query.mock.calls[0];
      expect(sql).toContain("a.student_id = $2");
      expect(sql).toContain("c.status = 'PUBLISHED'");
      expect(sql).toContain("CASE WHEN a.is_completed THEN o.consequence ELSE NULL END AS consequence");
      expect(params).toEqual([reasoningId, studentId]);
    });

    it("should return reasoning record with null consequence when attempt is ongoing", async () => {
      const mockRow = {
        id: reasoningId,
        attempt_id: "att-1",
        node_id: "n-1",
        selected_option_id: "opt-1",
        reasoning_text: "Draft reasoning",
        submitted_at: new Date().toISOString(),
        situation: "Critical situation",
        option_text: "Option A",
        consequence: null,
        case_id: "c-1",
        student_id: studentId,
      };

      mockDb.query.mockResolvedValueOnce({ rows: [mockRow] });

      const result = await service.getReasoningById(reasoningId, studentId);

      expect(result.consequence).toBeNull();
    });

    it("should throw NotFoundException (404) when reasoning record does not exist", async () => {
      // 1st query: main query returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // 2nd query: classification query returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getReasoningById(reasoningId, studentId)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockDb.query).toHaveBeenCalledTimes(2);
      const [classSql, classParams] = mockDb.query.mock.calls[1];
      expect(classSql).toContain("SELECT r.id, a.student_id, c.status");
      expect(classSql).not.toContain("consequence");
      expect(classSql).not.toContain("reasoning_text");
      expect(classParams).toEqual([reasoningId]);
    });

    it("should throw ForbiddenException (403) when record exists but belongs to another student", async () => {
      // 1st query: main query with studentId filter returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // 2nd query: classification query finds record exists
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: reasoningId, student_id: "other-student", status: "PUBLISHED" }],
      });

      await expect(service.getReasoningById(reasoningId, studentId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockDb.query).toHaveBeenCalledTimes(2);
    });

    it("should throw ForbiddenException (403) when record exists and belongs to student but case is not PUBLISHED", async () => {
      // 1st query: main query with c.status = 'PUBLISHED' returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // 2nd query: classification query finds record exists with DRAFT status
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: reasoningId, student_id: studentId, status: "DRAFT" }],
      });

      await expect(service.getReasoningById(reasoningId, studentId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe("getReasoningsByAttempt", () => {
    const attemptId = "22222222-2222-2222-2222-222222222222";
    const studentId = "student-123";

    it("should return reasoning list with consequences when attempt is completed", async () => {
      // 1. Attempt check query
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: attemptId, is_completed: true, student_id: studentId, status: "PUBLISHED" }],
      });
      // 2. Reasonings query
      const mockList = [
        {
          id: "r-1",
          attempt_id: attemptId,
          situation: "Node 1",
          option_text: "Option 1",
          consequence: "Consequence 1",
        },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockList });

      const result = await service.getReasoningsByAttempt(attemptId, studentId);

      expect(result).toEqual(mockList);
      expect(mockDb.query).toHaveBeenCalledTimes(2);

      const [attemptSql, attemptParams] = mockDb.query.mock.calls[0];
      expect(attemptSql).toContain("a.student_id = $2");
      expect(attemptSql).toContain("c.status = 'PUBLISHED'");
      expect(attemptParams).toEqual([attemptId, studentId]);

      const [listSql, listParams] = mockDb.query.mock.calls[1];
      expect(listSql).toContain("a.student_id = $2");
      expect(listSql).toContain("c.status = 'PUBLISHED'");
      expect(listSql).toContain("CASE WHEN a.is_completed THEN o.consequence ELSE NULL END AS consequence");
      expect(listSql).toContain("ORDER BY r.submitted_at ASC");
      expect(listParams).toEqual([attemptId, studentId]);
    });

    it("should return empty array when attempt exists and belongs to student but has no reasonings yet", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: attemptId, is_completed: false, student_id: studentId, status: "PUBLISHED" }],
      });
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const result = await service.getReasoningsByAttempt(attemptId, studentId);

      expect(result).toEqual([]);
    });

    it("should throw NotFoundException (404) when attempt does not exist", async () => {
      // 1st query: attempt with ownership check returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      // 2nd query: classification query returns 0 rows
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getReasoningsByAttempt(attemptId, studentId)).rejects.toThrow(
        NotFoundException,
      );

      const [classSql, classParams] = mockDb.query.mock.calls[1];
      expect(classSql).toContain("SELECT a.id, a.student_id, c.status");
      expect(classSql).not.toContain("consequence");
      expect(classParams).toEqual([attemptId]);
    });

    it("should throw ForbiddenException (403) when attempt belongs to another student", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: attemptId, student_id: "other-student", status: "PUBLISHED" }],
      });

      await expect(service.getReasoningsByAttempt(attemptId, studentId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw ForbiddenException (403) when attempt belongs to student but case is not PUBLISHED", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });
      mockDb.query.mockResolvedValueOnce({
        rows: [{ id: attemptId, student_id: studentId, status: "DRAFT" }],
      });

      await expect(service.getReasoningsByAttempt(attemptId, studentId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
