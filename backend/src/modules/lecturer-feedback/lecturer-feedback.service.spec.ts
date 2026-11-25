import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { DatabaseService } from "../../common/database/database.service";
import { LecturerFeedbackService } from "./lecturer-feedback.service";

describe("LecturerFeedbackService", () => {
  let service: LecturerFeedbackService;

  const mockDbClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockDbService = {
    getClient: jest.fn().mockResolvedValue(mockDbClient),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturerFeedbackService,
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    service = module.get<LecturerFeedbackService>(LecturerFeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create (E6 / FR-09..12, FR-20, C2-A)", () => {
    const lecturerId = "11111111-1111-1111-1111-111111111111";
    const attemptId = "22222222-2222-2222-2222-222222222222";
    const submissionId = "33333333-3333-3333-3333-333333333333";

    it("should throw BadRequestException if neither target is provided (FR-10)", async () => {
      await expect(
        service.create(lecturerId, {
          feedbackText: "Feedback with at least 10 chars",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if both targets are provided (FR-10)", async () => {
      await expect(
        service.create(lecturerId, {
          branchingAttemptId: attemptId,
          reviewSubmissionId: submissionId,
          feedbackText: "Feedback with at least 10 chars",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    describe("Branching Attempt target", () => {
      it("should throw NotFoundException if attempt does not exist", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [] }); // lock attempt lookup

        await expect(
          service.create(lecturerId, {
            branchingAttemptId: attemptId,
            feedbackText: "Constructive feedback on strategy",
          }),
        ).rejects.toThrow(NotFoundException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
        expect(mockDbClient.release).toHaveBeenCalled();
      });

      it("should throw ForbiddenException if lecturer does not own the course", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: attemptId, is_completed: true, lecturer_id: "other-lecturer" }],
          });

        await expect(
          service.create(lecturerId, {
            branchingAttemptId: attemptId,
            feedbackText: "Constructive feedback on strategy",
          }),
        ).rejects.toThrow(ForbiddenException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should throw ConflictException if branching attempt is not completed (FR-12)", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: attemptId, is_completed: false, lecturer_id: lecturerId }],
          });

        await expect(
          service.create(lecturerId, {
            branchingAttemptId: attemptId,
            feedbackText: "Constructive feedback on strategy",
          }),
        ).rejects.toThrow(ConflictException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should throw ConflictException if feedback already exists for attempt (C2-A, FR-20)", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: attemptId, is_completed: true, lecturer_id: lecturerId }],
          })
          .mockResolvedValueOnce({
            rows: [{ id: "existing-fb" }],
          });

        await expect(
          service.create(lecturerId, {
            branchingAttemptId: attemptId,
            feedbackText: "Second feedback attempt",
          }),
        ).rejects.toThrow(ConflictException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should successfully create feedback and commit transaction for completed attempt", async () => {
        const createdRow = {
          id: "fb-1",
          lecturer_id: lecturerId,
          branching_attempt_id: attemptId,
          review_submission_id: null,
          feedback_text: "Great decision journey!",
          created_at: new Date("2026-11-20T14:00:00Z"),
          updated_at: new Date("2026-11-20T14:00:00Z"),
        };

        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: attemptId, is_completed: true, lecturer_id: lecturerId }],
          }) // SELECT FOR UPDATE
          .mockResolvedValueOnce({ rows: [] }) // check existing feedback
          .mockResolvedValueOnce({ rows: [createdRow] }) // INSERT RETURNING *
          .mockResolvedValueOnce({ rows: [] }); // COMMIT

        const res = await service.create(lecturerId, {
          branchingAttemptId: attemptId,
          feedbackText: "Great decision journey!",
        });

        expect(res.id).toBe("fb-1");
        expect(res.branchingAttemptId).toBe(attemptId);
        expect(res.reviewSubmissionId).toBeNull();
        expect(res.feedbackText).toBe("Great decision journey!");
        expect(mockDbClient.query).toHaveBeenCalledWith("COMMIT");
        expect(mockDbClient.release).toHaveBeenCalled();
      });
    });

    describe("Review Study Submission target", () => {
      it("should throw NotFoundException if submission does not exist", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({ rows: [] }); // lock submission lookup

        await expect(
          service.create(lecturerId, {
            reviewSubmissionId: submissionId,
            feedbackText: "Good problem solving approach",
          }),
        ).rejects.toThrow(NotFoundException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should throw ForbiddenException if lecturer does not own the course", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, lecturer_id: "other-lecturer" }],
          });

        await expect(
          service.create(lecturerId, {
            reviewSubmissionId: submissionId,
            feedbackText: "Good problem solving approach",
          }),
        ).rejects.toThrow(ForbiddenException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should throw ConflictException if feedback already exists for submission (C2-A, FR-20)", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, submission_status: "SUBMITTED", lecturer_id: lecturerId }],
          })
          .mockResolvedValueOnce({
            rows: [{ id: "existing-fb" }],
          });

        await expect(
          service.create(lecturerId, {
            reviewSubmissionId: submissionId,
            feedbackText: "Duplicate feedback attempt",
          }),
        ).rejects.toThrow(ConflictException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should create feedback and transition submission to REVIEWED (FR-11)", async () => {
        const createdRow = {
          id: "fb-2",
          lecturer_id: lecturerId,
          branching_attempt_id: null,
          review_submission_id: submissionId,
          feedback_text: "Very strong legal argument.",
          created_at: new Date("2026-11-20T15:00:00Z"),
          updated_at: new Date("2026-11-20T15:00:00Z"),
        };

        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, submission_status: "SUBMITTED", lecturer_id: lecturerId }],
          }) // SELECT FOR UPDATE
          .mockResolvedValueOnce({ rows: [] }) // check existing feedback
          .mockResolvedValueOnce({ rows: [createdRow] }) // INSERT
          .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // UPDATE submission_status to REVIEWED
          .mockResolvedValueOnce({ rows: [] }); // COMMIT

        const res = await service.create(lecturerId, {
          reviewSubmissionId: submissionId,
          feedbackText: "Very strong legal argument.",
        });

        expect(res.id).toBe("fb-2");
        expect(res.reviewSubmissionId).toBe(submissionId);
        expect(mockDbClient.query).toHaveBeenCalledWith(
          expect.stringContaining("SET submission_status = 'REVIEWED'"),
          [submissionId],
        );
        expect(mockDbClient.query).toHaveBeenCalledWith("COMMIT");
      });

      it("rejects a submission outside SUBMITTED without creating feedback", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, submission_status: "REFLECTED", lecturer_id: lecturerId }],
          });

        await expect(service.create(lecturerId, {
          reviewSubmissionId: submissionId,
          feedbackText: "Feedback text for reviewed work",
        })).rejects.toThrow(ConflictException);

        expect(mockDbClient.query).not.toHaveBeenCalledWith(
          expect.stringContaining("INSERT INTO lecturer_feedback"),
          expect.anything(),
        );
        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should rollback and map 23505 to ConflictException", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, submission_status: "SUBMITTED", lecturer_id: lecturerId }],
          })
          .mockResolvedValueOnce({ rows: [] })
          .mockRejectedValueOnce({ code: "23505" }); // INSERT fails with unique violation

        await expect(
          service.create(lecturerId, {
            reviewSubmissionId: submissionId,
            feedbackText: "Feedback text",
          }),
        ).rejects.toThrow(ConflictException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });

      it("should rollback and map 23514 to BadRequestException", async () => {
        mockDbClient.query
          .mockResolvedValueOnce({ rows: [] }) // BEGIN
          .mockResolvedValueOnce({
            rows: [{ id: submissionId, submission_status: "SUBMITTED", lecturer_id: lecturerId }],
          })
          .mockResolvedValueOnce({ rows: [] })
          .mockRejectedValueOnce({ code: "23514" }); // check constraint violation

        await expect(
          service.create(lecturerId, {
            reviewSubmissionId: submissionId,
            feedbackText: "Feedback text",
          }),
        ).rejects.toThrow(BadRequestException);

        expect(mockDbClient.query).toHaveBeenCalledWith("ROLLBACK");
      });
    });
  });

  describe("getQueue (E7 / FR-13, C3-A)", () => {
    const lecturerId = "11111111-1111-1111-1111-111111111111";
    const courseId = "55555555-5555-5555-5555-555555555555";
    const caseId = "66666666-6666-6666-6666-666666666666";

    it("should throw NotFoundException if queried course does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getQueue(lecturerId, { courseId })).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if lecturer does not own the queried course", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: courseId, lecturer_id: "other-lecturer" }],
      });

      await expect(service.getQueue(lecturerId, { courseId })).rejects.toThrow(ForbiddenException);
    });

    it("should throw NotFoundException if queried case does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.getQueue(lecturerId, { caseId })).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if lecturer does not own the queried case", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: caseId, lecturer_id: "other-lecturer" }],
      });

      await expect(service.getQueue(lecturerId, { caseId })).rejects.toThrow(ForbiddenException);
    });

    it("should return merged and sorted queue with steps for Branching Study (C3-A)", async () => {
      const reviewRow = {
        targetId: "sub-1",
        targetType: "REVIEW_STUDY",
        studentId: "s-1",
        studentName: "Nguyen Van A",
        studentEmail: "a@uni.edu.vn",
        courseId,
        courseName: "Commercial Law",
        courseCode: "LAW101",
        caseId,
        caseTitle: "Contract Dispute Case",
        submittedAt: new Date("2026-11-20T10:00:00Z"),
        submissionStatus: "SUBMITTED",
        reflectionStatus: "NOT_STARTED",
        reflectionText: null,
        studentAnalysis: "Preliminary analysis",
        proposedSolution: "Remedy breach of contract",
        reasoningText: "Pursuant to Article 300",
        feedbackId: null,
      };

      const branchingRow = {
        targetId: "att-1",
        targetType: "BRANCHING_STUDY",
        studentId: "s-2",
        studentName: "Tran Thi B",
        studentEmail: "b@uni.edu.vn",
        courseId,
        courseName: "Commercial Law",
        courseCode: "LAW101",
        caseId: "case-branching",
        caseTitle: "Ethics Decision Case",
        submittedAt: new Date("2026-11-20T12:00:00Z"), // Later timestamp -> should appear first
        attemptNumber: 1,
        isCompleted: true,
        reflectionStatus: "SUBMITTED",
        reflectionText: "I learned to think defensively.",
        outcomeSituation: "The board approved the audit.",
        feedbackId: "fb-att-1",
        feedbackLecturerId: lecturerId,
        feedbackBranchingAttemptId: "att-1",
        feedbackReviewSubmissionId: null,
        feedbackText: "Solid analysis.",
        feedbackCreatedAt: new Date("2026-11-20T13:00:00Z"),
        feedbackUpdatedAt: new Date("2026-11-20T13:00:00Z"),
      };

      const stepRow = {
        attempt_id: "att-1",
        nodeId: "node-1",
        situation: "Client requests confidential info disclosure",
        selectedOptionText: "Refuse and report to ethics committee",
        reasoningText: "Professional ethics mandate compliance",
        submitted_at: new Date("2026-11-20T11:30:00Z"),
      };

      mockDbService.query
        .mockResolvedValueOnce({ rows: [reviewRow] }) // Review submissions
        .mockResolvedValueOnce({ rows: [branchingRow] }) // Branching attempts
        .mockResolvedValueOnce({ rows: [stepRow] }); // Steps batch query

      const res = await service.getQueue(lecturerId, {});
      expect(res.items).toHaveLength(2);

      // Verify sort order: att-1 (12:00) should be before sub-1 (10:00)
      expect(res.items[0].targetId).toBe("att-1");
      expect(res.items[0].targetType).toBe("BRANCHING_STUDY");
      expect(res.items[0].feedbackStatus).toBe("REVIEWED");
      expect(res.items[0].existingFeedback?.id).toBe("fb-att-1");
      expect(res.items[0].stepsCount).toBe(1);
      expect(res.items[0].steps).toEqual([
        {
          nodeId: "node-1",
          situation: "Client requests confidential info disclosure",
          selectedOptionText: "Refuse and report to ethics committee",
          reasoningText: "Professional ethics mandate compliance",
        },
      ]);
      // Verify NO consequence field exists in steps (C3-A)
      expect((res.items[0].steps![0] as any).consequence).toBeUndefined();

      expect(res.items[1].targetId).toBe("sub-1");
      expect(res.items[1].targetType).toBe("REVIEW_STUDY");
      expect(res.items[1].feedbackStatus).toBe("PENDING");
      expect(res.items[1].existingFeedback).toBeNull();
    });
  });
});
