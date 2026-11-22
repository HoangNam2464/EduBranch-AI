import { Test, TestingModule } from "@nestjs/testing";
import { StatisticsController } from "./statistics.controller";
import { StatisticsService } from "./statistics.service";

describe("StatisticsController", () => {
  let controller: StatisticsController;

  const mockService = {
    getCaseStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getStatistics (E8)", () => {
    it("should call service.getCaseStatistics and return SUCCESS envelope", async () => {
      const caseId = "11111111-1111-1111-1111-111111111111";
      const user = { id: "lec-1", role: "LECTURER" };
      const mockData = {
        caseId,
        caseTitle: "Ethics Case",
        learningMode: "BRANCHING_STUDY",
        caseStatus: "PUBLISHED",
        branching: { totalAttempts: 10 },
        reviewStudy: null,
      };

      mockService.getCaseStatistics.mockResolvedValueOnce(mockData);

      const res = await controller.getStatistics(caseId, user);
      expect(mockService.getCaseStatistics).toHaveBeenCalledWith(caseId, "lec-1");
      expect(res).toEqual({
        status: "SUCCESS",
        data: mockData,
      });
    });
  });
});
