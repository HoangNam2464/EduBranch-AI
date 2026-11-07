import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

import { RateLimiterGuard } from "./guards/rate-limiter.guard";
import { RateLimiterService } from "./rate-limiter/rate-limiter.service";

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    validateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: RateLimiterService,
          useValue: { checkLimit: jest.fn().mockReturnValue({ allowed: true }) },
        },
      ],
    })
      .overrideGuard(RateLimiterGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should call authService.register and wrap response in SUCCESS envelope", async () => {
      const dto: RegisterDto = {
        email: "lecturer@university.edu.vn",
        password: "ValidPassword123!",
        fullName: "Dr. Nguyen Van A",
        role: "LECTURER",
      };

      const mockResult = {
        accessToken: "jwt-token-example",
        tokenType: "Bearer",
        expiresIn: 28800,
        user: {
          id: "u-1",
          email: "lecturer@university.edu.vn",
          fullName: "Dr. Nguyen Van A",
          role: "LECTURER" as const,
        },
      };

      mockAuthService.register.mockResolvedValueOnce(mockResult);

      const response = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockResult,
      });
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should call authService.login and return SUCCESS envelope with access token", async () => {
      const dto: LoginDto = {
        email: "lecturer@university.edu.vn",
        password: "ValidPassword123!",
      };

      const mockResult = {
        accessToken: "jwt-token-example",
        tokenType: "Bearer",
        expiresIn: 28800,
        user: {
          id: "u-1",
          email: "lecturer@university.edu.vn",
          fullName: "Dr. Nguyen Van A",
          role: "LECTURER" as const,
        },
      };

      mockAuthService.login.mockResolvedValueOnce(mockResult);

      const response = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockResult,
      });
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return the profile of the current authenticated user", async () => {
      const currentUser = {
        id: "u-1",
        email: "lecturer@university.edu.vn",
        role: "LECTURER",
      };

      const mockProfile = {
        id: "u-1",
        email: "lecturer@university.edu.vn",
        fullName: "Dr. Nguyen Van A",
        role: "LECTURER",
      };

      mockAuthService.validateToken.mockResolvedValueOnce(mockProfile);

      const response = await controller.getProfile(currentUser);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith({ sub: "u-1" });
      expect(response).toEqual({
        status: "SUCCESS",
        data: mockProfile,
      });
    });
  });
});
