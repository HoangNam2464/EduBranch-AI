import { Test, TestingModule } from "@nestjs/testing";
import { ReviewStudyController } from "./review-study.controller";
import { ReviewStudyService } from "./review-study.service";

describe("ReviewStudyController", () => {
  let controller: ReviewStudyController;

  const mockService = {
    submit: jest.fn(),
    getMine: jest.fn(),
    getById: jest.fn(),
    submitReflection: jest.fn(),
    getFeedback: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewStudyController],
      providers: [
        {
          provide: ReviewStudyService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReviewStudyController>(ReviewStudyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("submit (E1)", () => {
    it("should call service.submit and return SUCCESS envelope", async () => {
      const caseId = "11111111-1111-1111-1111-111111111111";
      const user = { id: "student-1", role: "STUDENT" };
      const dto = {
        proposedSolution: "Proposed solution text",
        reasoningText: "Reasoning argument text",
      };

      const mockData = { id: "sub-1", ...dto, submissionStatus: "SUBMITTED" };
      mockService.submit.mockResolvedValueOnce(mockData);

      const res = await controller.submit(caseId, dto, user);
      expect(mockService.submit).toHaveBeenCalledWith(caseId, "student-1", dto);
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });

  describe("getMine (E2)", () => {
    it("should call service.getMine and return SUCCESS envelope", async () => {
      const caseId = "11111111-1111-1111-1111-111111111111";
      const user = { id: "student-1", role: "STUDENT" };
      const mockData = { id: "sub-1", caseId, studentId: "student-1" };
      mockService.getMine.mockResolvedValueOnce(mockData);

      const res = await controller.getMine(caseId, user);
      expect(mockService.getMine).toHaveBeenCalledWith(caseId, "student-1");
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });

  describe("getById (E3)", () => {
    it("should call service.getById and return SUCCESS envelope", async () => {
      const submissionId = "22222222-2222-2222-2222-222222222222";
      const user = { id: "student-1", role: "STUDENT" };
      const mockData = { id: submissionId, studentId: "student-1" };
      mockService.getById.mockResolvedValueOnce(mockData);

      const res = await controller.getById(submissionId, user);
      expect(mockService.getById).toHaveBeenCalledWith(submissionId, user);
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });

  describe("submitReflection (E4)", () => {
    it("should call service.submitReflection and return SUCCESS envelope", async () => {
      const submissionId = "22222222-2222-2222-2222-222222222222";
      const user = { id: "student-1", role: "STUDENT" };
      const dto = { reflectionText: "Reflective learning thoughts" };
      const mockData = { id: submissionId, reflectionStatus: "SUBMITTED" };
      mockService.submitReflection.mockResolvedValueOnce(mockData);

      const res = await controller.submitReflection(submissionId, dto, user);
      expect(mockService.submitReflection).toHaveBeenCalledWith(submissionId, "student-1", dto);
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });

  describe("getFeedback (E5)", () => {
    it("should call service.getFeedback and return SUCCESS envelope", async () => {
      const submissionId = "22222222-2222-2222-2222-222222222222";
      const user = { id: "student-1", role: "STUDENT" };
      const mockData = { feedback: null };
      mockService.getFeedback.mockResolvedValueOnce(mockData);

      const res = await controller.getFeedback(submissionId, user);
      expect(mockService.getFeedback).toHaveBeenCalledWith(submissionId, "student-1");
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });
});
