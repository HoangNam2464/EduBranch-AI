import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../common/database/database.service";
import { ReviewStudyService } from "./review-study.service";

describe("ReviewStudyService", () => {
  let service: ReviewStudyService;

  const mockDbService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewStudyService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<ReviewStudyService>(ReviewStudyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("submit (E1 / FR-01, FR-02, FR-04, FR-05)", () => {
    const caseId = "11111111-1111-1111-1111-111111111111";
    const studentId = "22222222-2222-2222-2222-222222222222";

    it("should successfully submit review study response with trimmed studentAnalysis", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "REVIEW_STUDY" }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "sub-1",
              student_id: studentId,
              case_id: caseId,
              student_analysis: "Detailed analysis here",
              proposed_solution: "My solution approach",
              reasoning_text: "Rationale behind solution",
              submission_status: "SUBMITTED",
              reflection_text: null,
              reflection_status: "NOT_STARTED",
              reflection_submitted_at: null,
              submitted_at: new Date("2026-11-20T10:00:00Z"),
              updated_at: new Date("2026-11-20T10:00:00Z"),
            },
          ],
        });

      const result = await service.submit(caseId, studentId, {
        studentAnalysis: "  Detailed analysis here  ",
        proposedSolution: "My solution approach",
        reasoningText: "Rationale behind solution",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("sub-1");
      expect(result.studentAnalysis).toBe("Detailed analysis here");
      expect(result.submissionStatus).toBe("SUBMITTED");
      expect(result.reflectionStatus).toBe("NOT_STARTED");
      expect(result.reflectionSubmittedAt).toBeNull();
      expect(result.submittedAt).toBe("2026-11-20T10:00:00.000Z");

      // Verify parameters sent to DB query (check studentAnalysis was trimmed)
      const insertCallArgs = mockDbService.query.mock.calls[1][1];
      expect(insertCallArgs[3]).toBe("Detailed analysis here");
    });

    it("should store studentAnalysis as NULL when empty or whitespace only", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "REVIEW_STUDY" }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "sub-2",
              student_id: studentId,
              case_id: caseId,
              student_analysis: null,
              proposed_solution: "My solution approach",
              reasoning_text: "Rationale behind solution",
              submission_status: "SUBMITTED",
              reflection_text: null,
              reflection_status: "NOT_STARTED",
              reflection_submitted_at: null,
              submitted_at: new Date(),
              updated_at: new Date(),
            },
          ],
        });

      await service.submit(caseId, studentId, {
        studentAnalysis: "    ",
        proposedSolution: "My solution approach",
        reasoningText: "Rationale behind solution",
      });

      const insertCallArgs = mockDbService.query.mock.calls[1][1];
      expect(insertCallArgs[3]).toBeNull();
    });

    it("should throw NotFoundException if case does not exist or is not PUBLISHED (R-INV01)", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.submit(caseId, studentId, {
          proposedSolution: "My solution",
          reasoningText: "My rationale",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if case learning_mode is not REVIEW_STUDY", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "BRANCHING_STUDY" }],
      });

      await expect(
        service.submit(caseId, studentId, {
          proposedSolution: "My solution",
          reasoningText: "My rationale",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException on 23505 unique constraint violation (FR-02)", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "REVIEW_STUDY" }],
        })
        .mockRejectedValueOnce({ code: "23505" });

      await expect(
        service.submit(caseId, studentId, {
          proposedSolution: "My solution",
          reasoningText: "My rationale",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw BadRequestException on 23514 check constraint error", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "REVIEW_STUDY" }],
        })
        .mockRejectedValueOnce({ code: "23514" });

      await expect(
        service.submit(caseId, studentId, {
          proposedSolution: "My solution",
          reasoningText: "My rationale",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should rethrow unexpected DB errors", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: caseId, status: "PUBLISHED", learning_mode: "REVIEW_STUDY" }],
        })
        .mockRejectedValueOnce(new Error("DB connection lost"));

      await expect(
        service.submit(caseId, studentId, {
          proposedSolution: "My solution",
          reasoningText: "My rationale",
        }),
      ).rejects.toThrow("DB connection lost");
    });
  });

  describe("getMine (E2 / FR-06)", () => {
    const caseId = "11111111-1111-1111-1111-111111111111";
    const studentId = "22222222-2222-2222-2222-222222222222";

    it("should throw NotFoundException if case is not PUBLISHED", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getMine(caseId, studentId)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException with SUBMISSION_NOT_FOUND when student has no submission", async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: caseId }] })
        .mockResolvedValueOnce({ rows: [] });

      try {
        await service.getMine(caseId, studentId);
        fail("Expected NotFoundException");
      } catch (err: any) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.getResponse()).toMatchObject({
          error: "SUBMISSION_NOT_FOUND",
        });
      }
    });

    it("should return mapped DTO when submission exists", async () => {
      mockDbService.query
        .mockResolvedValueOnce({ rows: [{ id: caseId }] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "sub-1",
              student_id: studentId,
              case_id: caseId,
              student_analysis: "Analysis",
              proposed_solution: "Solution",
              reasoning_text: "Reasoning",
              submission_status: "SUBMITTED",
              reflection_text: null,
              reflection_status: "NOT_STARTED",
              reflection_submitted_at: null,
              submitted_at: new Date("2026-11-20T10:00:00Z"),
              updated_at: new Date("2026-11-20T10:00:00Z"),
            },
          ],
        });

      const res = await service.getMine(caseId, studentId);
      expect(res.id).toBe("sub-1");
      expect(res.studentId).toBe(studentId);
      expect(res.submissionStatus).toBe("SUBMITTED");
    });
  });

  describe("getById (E3 / FR-06)", () => {
    const subId = "33333333-3333-3333-3333-333333333333";
    const studentId = "22222222-2222-2222-2222-222222222222";
    const lecturerId = "44444444-4444-4444-4444-444444444444";

    it("should reject users with roles other than STUDENT or LECTURER (R-ROLE)", async () => {
      await expect(
        service.getById(subId, { id: "admin-1", role: "ADMIN" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if submission does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.getById(subId, { id: studentId, role: "STUDENT" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException for STUDENT if case is not PUBLISHED (R-INV01)", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: studentId,
            case_id: "c-1",
            case_status: "DRAFT",
            lecturer_id: lecturerId,
          },
        ],
      });

      await expect(
        service.getById(subId, { id: studentId, role: "STUDENT" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if STUDENT is not the author", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: "other-student",
            case_id: "c-1",
            case_status: "PUBLISHED",
            lecturer_id: lecturerId,
          },
        ],
      });

      await expect(
        service.getById(subId, { id: studentId, role: "STUDENT" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return submission for author STUDENT", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: studentId,
            case_id: "c-1",
            case_status: "PUBLISHED",
            lecturer_id: lecturerId,
            student_analysis: null,
            proposed_solution: "Solution",
            reasoning_text: "Reasoning",
            submission_status: "SUBMITTED",
            reflection_text: null,
            reflection_status: "NOT_STARTED",
            reflection_submitted_at: null,
            submitted_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const res = await service.getById(subId, { id: studentId, role: "STUDENT" });
      expect(res.id).toBe(subId);
      expect(res.studentId).toBe(studentId);
    });

    it("should throw ForbiddenException for LECTURER who does not own the course", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: studentId,
            case_id: "c-1",
            case_status: "PUBLISHED",
            lecturer_id: "other-lecturer",
          },
        ],
      });

      await expect(
        service.getById(subId, { id: lecturerId, role: "LECTURER" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should return submission for LECTURER course owner even if case is DRAFT", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: studentId,
            case_id: "c-1",
            case_status: "DRAFT",
            lecturer_id: lecturerId,
            student_analysis: null,
            proposed_solution: "Solution",
            reasoning_text: "Reasoning",
            submission_status: "SUBMITTED",
            reflection_text: null,
            reflection_status: "NOT_STARTED",
            reflection_submitted_at: null,
            submitted_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });

      const res = await service.getById(subId, { id: lecturerId, role: "LECTURER" });
      expect(res.id).toBe(subId);
    });
  });

  describe("submitReflection (E4 / FR-03, FR-07)", () => {
    const subId = "33333333-3333-3333-3333-333333333333";
    const studentId = "22222222-2222-2222-2222-222222222222";

    it("should successfully submit reflection when submission is in REVIEWED status", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: subId,
            student_id: studentId,
            case_id: "c-1",
            student_analysis: null,
            proposed_solution: "Solution",
            reasoning_text: "Reasoning",
            submission_status: "REFLECTED",
            reflection_text: "My retrospective reflection",
            reflection_status: "SUBMITTED",
            reflection_submitted_at: new Date("2026-11-20T12:00:00Z"),
            submitted_at: new Date("2026-11-20T10:00:00Z"),
            updated_at: new Date("2026-11-20T12:00:00Z"),
          },
        ],
      });

      const res = await service.submitReflection(subId, studentId, {
        reflectionText: "My retrospective reflection",
      });

      expect(res.submissionStatus).toBe("REFLECTED");
      expect(res.reflectionStatus).toBe("SUBMITTED");
      expect(res.reflectionText).toBe("My retrospective reflection");
      expect(res.reflectionSubmittedAt).toBe("2026-11-20T12:00:00.000Z");
    });

    describe("race conditions / failure inspection", () => {
      it("should throw NotFoundException if submission does not exist", async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] }) // UPDATE returned 0 rows
          .mockResolvedValueOnce({ rows: [] }); // inspection lookup

        await expect(
          service.submitReflection(subId, studentId, {
            reflectionText: "My retrospective reflection",
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw NotFoundException if case is not PUBLISHED", async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({
            rows: [
              {
                id: subId,
                student_id: studentId,
                submission_status: "REVIEWED",
                case_status: "DRAFT",
              },
            ],
          });

        await expect(
          service.submitReflection(subId, studentId, {
            reflectionText: "My retrospective reflection",
          }),
        ).rejects.toThrow(NotFoundException);
      });

      it("should throw ForbiddenException if student is not author", async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({
            rows: [
              {
                id: subId,
                student_id: "other-student",
                submission_status: "REVIEWED",
                case_status: "PUBLISHED",
              },
            ],
          });

        await expect(
          service.submitReflection(subId, studentId, {
            reflectionText: "My retrospective reflection",
          }),
        ).rejects.toThrow(ForbiddenException);
      });

      it("should throw ConflictException if submission is still in SUBMITTED status (not reviewed yet)", async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({
            rows: [
              {
                id: subId,
                student_id: studentId,
                submission_status: "SUBMITTED",
                case_status: "PUBLISHED",
              },
            ],
          });

        await expect(
          service.submitReflection(subId, studentId, {
            reflectionText: "My retrospective reflection",
          }),
        ).rejects.toThrow(ConflictException);
      });

      it("should throw ConflictException if reflection was already submitted (status REFLECTED)", async () => {
        mockDbService.query
          .mockResolvedValueOnce({ rows: [] })
          .mockResolvedValueOnce({
            rows: [
              {
                id: subId,
                student_id: studentId,
                submission_status: "REFLECTED",
                case_status: "PUBLISHED",
              },
            ],
          });

        await expect(
          service.submitReflection(subId, studentId, {
            reflectionText: "My retrospective reflection",
          }),
        ).rejects.toThrow(ConflictException);
      });
    });
  });

  describe("getFeedback (E5 / FR-08)", () => {
    const subId = "33333333-3333-3333-3333-333333333333";
    const studentId = "22222222-2222-2222-2222-222222222222";

    it("should throw NotFoundException if submission does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getFeedback(subId, studentId)).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if case is not PUBLISHED", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: subId, student_id: studentId, case_status: "DRAFT" }],
      });

      await expect(service.getFeedback(subId, studentId)).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if student is not author", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: subId, student_id: "other-student", case_status: "PUBLISHED" }],
      });

      await expect(service.getFeedback(subId, studentId)).rejects.toThrow(ForbiddenException);
    });

    it("should return { feedback: null } when no feedback has been submitted", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: subId, student_id: studentId, case_status: "PUBLISHED" }],
        })
        .mockResolvedValueOnce({ rows: [] });

      const res = await service.getFeedback(subId, studentId);
      expect(res).toEqual({ feedback: null });
    });

    it("should return { feedback: LecturerFeedbackDto } when feedback exists", async () => {
      mockDbService.query
        .mockResolvedValueOnce({
          rows: [{ id: subId, student_id: studentId, case_status: "PUBLISHED" }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "fb-1",
              lecturer_id: "lec-1",
              branching_attempt_id: null,
              review_submission_id: subId,
              feedback_text: "Excellent legal analysis.",
              created_at: new Date("2026-11-20T11:00:00Z"),
              updated_at: new Date("2026-11-20T11:00:00Z"),
            },
          ],
        });

      const res = await service.getFeedback(subId, studentId);
      expect(res.feedback).toBeDefined();
      expect(res.feedback?.id).toBe("fb-1");
      expect(res.feedback?.feedbackText).toBe("Excellent legal analysis.");
      expect(res.feedback?.createdAt).toBe("2026-11-20T11:00:00.000Z");
    });
  });
});
