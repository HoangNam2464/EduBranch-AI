import { Test, TestingModule } from "@nestjs/testing";
import { ReasoningController } from "./reasoning.controller";
import { ReasoningService } from "./reasoning.service";

describe("ReasoningController", () => {
  let controller: ReasoningController;

  const mockReasoningService = {
    getReasoningById: jest.fn(),
    getReasoningsByAttempt: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReasoningController],
      providers: [
        {
          provide: ReasoningService,
          useValue: mockReasoningService,
        },
      ],
    }).compile();

    controller = module.get<ReasoningController>(ReasoningController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getReasoningById", () => {
    it("should pass user.id to service and wrap in SUCCESS envelope", async () => {
      const mockResult = {
        id: "11111111-1111-1111-1111-111111111111",
        student_id: "student-123",
        reasoning_text: "Strategic justification",
        consequence: null,
      };
      mockReasoningService.getReasoningById.mockResolvedValueOnce(mockResult);

      const response = await controller.getReasoningById(
        "11111111-1111-1111-1111-111111111111",
        { id: "student-123", role: "STUDENT" },
      );

      expect(mockReasoningService.getReasoningById).toHaveBeenCalledWith(
        "11111111-1111-1111-1111-111111111111",
        "student-123",
      );
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockResult,
      });
    });
  });

  describe("getReasoningsByAttempt", () => {
    it("should pass user.id to service and wrap in SUCCESS envelope", async () => {
      const mockList = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          attempt_id: "22222222-2222-2222-2222-222222222222",
          reasoning_text: "Step 1 reasoning",
          consequence: null,
        },
      ];
      mockReasoningService.getReasoningsByAttempt.mockResolvedValueOnce(mockList);

      const response = await controller.getReasoningsByAttempt(
        "22222222-2222-2222-2222-222222222222",
        { id: "student-123", role: "STUDENT" },
      );

      expect(mockReasoningService.getReasoningsByAttempt).toHaveBeenCalledWith(
        "22222222-2222-2222-2222-222222222222",
        "student-123",
      );
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockList,
      });
    });
  });
});
