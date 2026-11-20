import { Test, TestingModule } from "@nestjs/testing";
import { LecturerFeedbackController } from "./lecturer-feedback.controller";
import { LecturerFeedbackService } from "./lecturer-feedback.service";

describe("LecturerFeedbackController", () => {
  let controller: LecturerFeedbackController;

  const mockService = {
    create: jest.fn(),
    getQueue: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturerFeedbackController],
      providers: [
        {
          provide: LecturerFeedbackService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LecturerFeedbackController>(LecturerFeedbackController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create (E6)", () => {
    it("should call service.create and return SUCCESS envelope", async () => {
      const user = { id: "lec-1", role: "LECTURER" };
      const dto = {
        branchingAttemptId: "22222222-2222-2222-2222-222222222222",
        feedbackText: "Good logical argument in step 2.",
      };

      const mockData = { id: "fb-1", lecturerId: "lec-1", ...dto };
      mockService.create.mockResolvedValueOnce(mockData);

      const res = await controller.create(dto, user);
      expect(mockService.create).toHaveBeenCalledWith("lec-1", dto);
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });

  describe("getQueue (E7)", () => {
    it("should call service.getQueue and return SUCCESS envelope", async () => {
      const user = { id: "lec-1", role: "LECTURER" };
      const query = { courseId: "55555555-5555-5555-5555-555555555555" };
      const mockData = { items: [] };
      mockService.getQueue.mockResolvedValueOnce(mockData);

      const res = await controller.getQueue(query, user);
      expect(mockService.getQueue).toHaveBeenCalledWith("lec-1", query);
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });
});
