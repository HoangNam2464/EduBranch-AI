import { Test, TestingModule } from "@nestjs/testing";
import { ForbiddenException } from "@nestjs/common";
import { ChallengeSupportController } from "./challenge-support.controller";
import { ChallengeSupportService } from "./challenge-support.service";

describe("ChallengeSupportController", () => {
  let controller: ChallengeSupportController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      createOrGetSession: jest.fn(),
      sendReply: jest.fn(),
      getSession: jest.fn(),
      completeSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallengeSupportController],
      providers: [
        {
          provide: ChallengeSupportService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ChallengeSupportController>(
      ChallengeSupportController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("createOrGetSession delegates to service for student", async () => {
    const mockSession = { id: "s1", currentRound: 1, isCompleted: false, messages: [] };
    mockService.createOrGetSession.mockResolvedValue(mockSession);

    const result = await controller.createOrGetSession(
      { reasoningId: "22222222-2222-2222-2222-222222222222" },
      { id: "student-1", role: "STUDENT" },
    );

    expect(result).toEqual({ status: "SUCCESS", data: mockSession });
    expect(mockService.createOrGetSession).toHaveBeenCalledWith(
      "student-1",
      { reasoningId: "22222222-2222-2222-2222-222222222222" },
    );
  });

  it("createOrGetSession throws ForbiddenException for non-students", async () => {
    await expect(
      controller.createOrGetSession(
        { reasoningId: "22222222-2222-2222-2222-222222222222" },
        { id: "lecturer-1", role: "LECTURER" },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("sendReply delegates to service for student", async () => {
    const mockSession = { id: "s1", currentRound: 2, isCompleted: true, messages: [] };
    mockService.sendReply.mockResolvedValue(mockSession);

    const result = await controller.sendReply(
      "s1",
      { reply: "Student clarification" },
      { id: "student-1", role: "STUDENT" },
    );

    expect(result).toEqual({ status: "SUCCESS", data: mockSession });
    expect(mockService.sendReply).toHaveBeenCalledWith(
      "student-1",
      "s1",
      { reply: "Student clarification" },
    );
  });

  it("sendReply throws ForbiddenException for non-students", async () => {
    await expect(
      controller.sendReply(
        "s1",
        { reply: "Student clarification" },
        { id: "lecturer-1", role: "LECTURER" },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("getSession returns session data", async () => {
    const mockSession = { id: "s1", currentRound: 1, isCompleted: false, messages: [] };
    mockService.getSession.mockResolvedValue(mockSession);

    const result = await controller.getSession("s1", {
      id: "student-1",
      role: "STUDENT",
    });

    expect(result).toEqual({ status: "SUCCESS", data: mockSession });
  });

  it("completeSession concludes session early", async () => {
    const mockSession = { id: "s1", currentRound: 1, isCompleted: true, messages: [] };
    mockService.completeSession.mockResolvedValue(mockSession);

    const result = await controller.completeSession("s1", {
      id: "student-1",
      role: "STUDENT",
    });

    expect(result).toEqual({ status: "SUCCESS", data: mockSession });
  });
});
