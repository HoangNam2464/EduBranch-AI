import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../common/database/database.service";
import { StatisticsService } from "./statistics.service";

describe("StatisticsService", () => {
  let service: StatisticsService;

  const mockDbService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getCaseStatistics (E8 / FR-14..18)", () => {
    const caseId = "11111111-1111-1111-1111-111111111111";
    const lecturerId = "22222222-2222-2222-2222-222222222222";

    it("should throw NotFoundException if case does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getCaseStatistics(caseId, lecturerId)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if lecturer does not own the course", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: caseId, lecturer_id: "other-lecturer" }],
      });

      await expect(service.getCaseStatistics(caseId, lecturerId)).rejects.toThrow(ForbiddenException);
    });

    it("should handle an empty Branching Study case without division by zero errors", async () => {
      // 1. Case lookup
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: caseId,
            title: "Empty Branching Case",
            status: "PUBLISHED",
            learning_mode: "BRANCHING_STUDY",
            lecturer_id: lecturerId,
          },
        ],
      });
      // 2. Attempt counts
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ totalAttempts: 0, completedAttempts: 0 }],
      });
      // 3. Students distribution
      mockDbService.query.mockResolvedValueOnce({ rows: [] });
      // 4. Flow status
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ inProgress: 0, completed: 0, reflected: 0 }],
      });
      // 5. Decision points (empty case has non-terminal nodes with options having 0 selections)
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            nodeId: "node-1",
            nodeIndex: 0,
            situation: "Initial situation",
            optionId: "opt-1",
            optionText: "Option A",
            count: 0,
          },
          {
            nodeId: "node-1",
            nodeIndex: 0,
            situation: "Initial situation",
            optionId: "opt-2",
            optionText: "Option B",
            count: 0,
          },
        ],
      });
      // 6. Outcomes (terminal nodes with 0 selections)
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            nodeId: "node-term-1",
            situation: "Terminal outcome 1",
            count: 0,
          },
        ],
      });

      const res = await service.getCaseStatistics(caseId, lecturerId);

      expect(res.caseId).toBe(caseId);
      expect(res.learningMode).toBe("BRANCHING_STUDY");
      expect(res.branching).toBeDefined();
      expect(res.reviewStudy).toBeNull();

      const b = res.branching!;
      expect(b.totalAttempts).toBe(0);
      expect(b.completedAttempts).toBe(0);
      expect(b.completionRate).toBe(0);
      expect(b.participants).toBe(0);
      expect(b.singleAttemptStudents).toBe(0);
      expect(b.retryStudents).toBe(0);
      expect(b.attemptsPerStudent).toEqual([]);
      expect(b.flowStatus).toEqual({ inProgress: 0, completed: 0, reflected: 0 });

      // Decision points should have 0 selections and 0 percentage
      expect(b.decisionPoints).toHaveLength(1);
      expect(b.decisionPoints[0].totalSelections).toBe(0);
      expect(b.decisionPoints[0].options[0].percentage).toBe(0);
      expect(b.decisionPoints[0].options[1].percentage).toBe(0);

      // Outcomes should have 0 count and 0 percentage
      expect(b.outcomes).toHaveLength(1);
      expect(b.outcomes[0].count).toBe(0);
      expect(b.outcomes[0].percentage).toBe(0);

      // FR-18: Verify NO student identifying keys exist in DTO
      const jsonStr = JSON.stringify(res);
      expect(jsonStr).not.toContain("studentId");
      expect(jsonStr).not.toContain("student_id");
      expect(jsonStr).not.toContain("studentName");
      expect(jsonStr).not.toContain("studentEmail");
      expect(jsonStr).not.toContain("studentAnalysis");
    });

    it("should compute accurate statistics for hand-calculated Branching dataset (no double counting from JOINs)", async () => {
      // Hand-calculated dataset:
      // Total attempts = 3, Completed = 2
      // Completion rate = 2 / 3 * 100 = 66.7%
      // Student 1: 2 attempts (max attempt 2) -> retry
      // Student 2: 1 attempt (max attempt 1) -> single
      // Participants: 2. singleAttemptStudents: 1, retryStudents: 1
      // attemptsPerStudent: [{ attempts: 1, students: 1 }, { attempts: 2, students: 1 }]
      // flowStatus: inProgress = 1, completed = 1, reflected = 1
      // Decision Point 1 (nodeIndex: 0): option A has 2 selections, option B has 1 selection -> totalSelections = 3
      //   Option A: 2/3 * 100 = 66.7%
      //   Option B: 1/3 * 100 = 33.3%
      // Decision Point 2 (nodeIndex: null): option C has 1 selection, option D has 0 selections -> totalSelections = 1
      //   Option C: 1/1 * 100 = 100.0%
      //   Option D: 0/1 * 100 = 0.0%
      // Outcome 1: count = 2 -> 2/2 * 100 = 100.0%
      // Outcome 2: count = 0 -> 0/2 * 100 = 0.0%

      mockDbService.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: caseId,
              title: "Complex Ethics Case",
              status: "PUBLISHED",
              learning_mode: "BRANCHING_STUDY",
              lecturer_id: lecturerId,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ totalAttempts: 3, completedAttempts: 2 }],
        })
        .mockResolvedValueOnce({
          rows: [
            { student_id: "s-1", cnt: 2, max_att: 2 },
            { student_id: "s-2", cnt: 1, max_att: 1 },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ inProgress: 1, completed: 1, reflected: 1 }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              nodeId: "node-1",
              nodeIndex: 0,
              situation: "Situation 1",
              optionId: "opt-a",
              optionText: "Option A",
              count: 2,
            },
            {
              nodeId: "node-1",
              nodeIndex: 0,
              situation: "Situation 1",
              optionId: "opt-b",
              optionText: "Option B",
              count: 1,
            },
            {
              nodeId: "node-2",
              nodeIndex: null, // Test nullable nodeIndex
              situation: "Situation 2",
              optionId: "opt-c",
              optionText: "Option C",
              count: 1,
            },
            {
              nodeId: "node-2",
              nodeIndex: null,
              situation: "Situation 2",
              optionId: "opt-d",
              optionText: "Option D",
              count: 0,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            { nodeId: "out-1", situation: "Outcome 1", count: 2 },
            { nodeId: "out-2", situation: "Outcome 2", count: 0 },
          ],
        });

      const res = await service.getCaseStatistics(caseId, lecturerId);
      const b = res.branching!;

      expect(b.totalAttempts).toBe(3);
      expect(b.completedAttempts).toBe(2);
      expect(b.completionRate).toBe(66.7);
      expect(b.participants).toBe(2);
      expect(b.singleAttemptStudents).toBe(1);
      expect(b.retryStudents).toBe(1);
      expect(b.attemptsPerStudent).toEqual([
        { attempts: 1, students: 1 },
        { attempts: 2, students: 1 },
      ]);
      expect(b.flowStatus).toEqual({ inProgress: 1, completed: 1, reflected: 1 });

      // Verify decision points
      expect(b.decisionPoints).toHaveLength(2);

      const dp1 = b.decisionPoints[0];
      expect(dp1.nodeId).toBe("node-1");
      expect(dp1.nodeIndex).toBe(0);
      expect(dp1.totalSelections).toBe(3);
      expect(dp1.options[0]).toEqual({
        optionId: "opt-a",
        optionText: "Option A",
        count: 2,
        percentage: 66.7,
      });
      expect(dp1.options[1]).toEqual({
        optionId: "opt-b",
        optionText: "Option B",
        count: 1,
        percentage: 33.3,
      });

      const dp2 = b.decisionPoints[1];
      expect(dp2.nodeId).toBe("node-2");
      expect(dp2.nodeIndex).toBeNull();
      expect(dp2.totalSelections).toBe(1);
      expect(dp2.options[0]).toEqual({
        optionId: "opt-c",
        optionText: "Option C",
        count: 1,
        percentage: 100.0,
      });
      expect(dp2.options[1]).toEqual({
        optionId: "opt-d",
        optionText: "Option D",
        count: 0,
        percentage: 0,
      });

      // Verify outcomes
      expect(b.outcomes).toHaveLength(2);
      expect(b.outcomes[0]).toEqual({
        nodeId: "out-1",
        situation: "Outcome 1",
        count: 2,
        percentage: 100.0,
      });
      expect(b.outcomes[1]).toEqual({
        nodeId: "out-2",
        situation: "Outcome 2",
        count: 0,
        percentage: 0,
      });

      // Verify no student identifying keys in DTO
      const jsonStr = JSON.stringify(res);
      expect(jsonStr).not.toContain("studentId");
      expect(jsonStr).not.toContain("student_id");
      expect(jsonStr).not.toContain("studentName");
      expect(jsonStr).not.toContain("studentEmail");
    });

    it("should compute accurate statistics for Review Study case (FR-17)", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: caseId,
              title: "Review Study Contract Analysis",
              status: "PUBLISHED",
              learning_mode: "REVIEW_STUDY",
              lecturer_id: lecturerId,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              totalSubmissions: 5,
              submitted: 2,
              reviewed: 2,
              reflected: 1,
            },
          ],
        });

      const res = await service.getCaseStatistics(caseId, lecturerId);

      expect(res.learningMode).toBe("REVIEW_STUDY");
      expect(res.branching).toBeNull();
      expect(res.reviewStudy).toBeDefined();

      const rs = res.reviewStudy!;
      expect(rs.totalSubmissions).toBe(5);
      expect(rs.flowStatus).toEqual({
        submitted: 2,
        reviewed: 2,
        reflected: 1,
      });

      // Verify no student identifying keys
      const jsonStr = JSON.stringify(res);
      expect(jsonStr).not.toContain("studentId");
      expect(jsonStr).not.toContain("student_id");
      expect(jsonStr).not.toContain("studentName");
      expect(jsonStr).not.toContain("studentEmail");
    });
  });
});
