import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { DatabaseService } from "../../common/database/database.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

describe("AuthService", () => {
  let service: AuthService;

  const mockDbService = {
    query: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mock-jwt-token-8h"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register (EBA-105 AC 1)", () => {
    const registerDto: RegisterDto = {
      email: "Lecturer@University.EDU.VN",
      password: "StrongPassword123!",
      fullName: "Dr. Nguyen Van A",
      role: "LECTURER",
    };

    it("should hash password with BCrypt (12 rounds), store user role, and return 8h JWT token", async () => {
      const bcryptHashSpy = jest.spyOn(bcrypt, "hash");

      // 1. Email check -> no existing user
      mockDbService.query
        .mockResolvedValueOnce({ rows: [] }) // SELECT id FROM users WHERE email = $1
        .mockResolvedValueOnce({
          // INSERT INTO users ... RETURNING id, email, full_name, role
          rows: [
            {
              id: "user-uuid-1",
              email: "lecturer@university.edu.vn",
              full_name: "Dr. Nguyen Van A",
              role: "LECTURER",
            },
          ],
        });

      const response = await service.register(registerDto);

      // Verify email check used lowercase
      expect(mockDbService.query).toHaveBeenNthCalledWith(
        1,
        "SELECT id FROM users WHERE email = $1",
        ["lecturer@university.edu.vn"],
      );

      // Verify BCrypt was called with exactly 12 rounds (AC 1)
      expect(bcryptHashSpy).toHaveBeenCalledWith("StrongPassword123!", 12);

      // Verify DB insertion stored user role and lowercased email
      expect(mockDbService.query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO users"),
        [
          expect.any(String), // UUID
          "lecturer@university.edu.vn",
          expect.any(String), // hashed password
          "Dr. Nguyen Van A",
          "LECTURER",
        ],
      );

      // Verify JWT sign options include 8 hours (28800 seconds)
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: "user-uuid-1",
          email: "lecturer@university.edu.vn",
          role: "LECTURER",
        },
        { expiresIn: 28800 },
      );

      // Verify AuthResponse structure
      expect(response).toEqual({
        accessToken: "mock-jwt-token-8h",
        tokenType: "Bearer",
        expiresIn: 28800,
        user: {
          id: "user-uuid-1",
          email: "lecturer@university.edu.vn",
          fullName: "Dr. Nguyen Van A",
          role: "LECTURER",
        },
      });

      bcryptHashSpy.mockRestore();
    });

    it("should allow registering with STUDENT role", async () => {
      const studentDto: RegisterDto = {
        email: "student@university.edu.vn",
        password: "StudentPass123!",
        fullName: "Tran Thi B",
        role: "STUDENT",
      };

      mockDbService.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "student-uuid-2",
              email: "student@university.edu.vn",
              full_name: "Tran Thi B",
              role: "STUDENT",
            },
          ],
        });

      const response = await service.register(studentDto);

      expect(response.user.role).toBe("STUDENT");
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: "STUDENT" }),
        { expiresIn: 28800 },
      );
    });

    it("should throw ConflictException if email is already registered", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [{ id: "existing-user-id" }],
      });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(mockDbService.query).toHaveBeenCalledTimes(1);
    });
  });

  describe("login (EBA-105 AC 2)", () => {
    const loginDto: LoginDto = {
      email: "User@University.edu.vn",
      password: "CorrectPassword123!",
    };

    it("should authenticate valid credentials and issue JWT token with 8 hours expiration", async () => {
      const hashedPassword = await bcrypt.hash("CorrectPassword123!", 10);

      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: "user-uuid-1",
            email: "user@university.edu.vn",
            password_hash: hashedPassword,
            full_name: "Nguyen Van A",
            role: "LECTURER",
          },
        ],
      });

      const response = await service.login(loginDto);

      expect(mockDbService.query).toHaveBeenCalledWith(
        "SELECT id, email, password_hash, full_name, role FROM users WHERE email = $1",
        ["user@university.edu.vn"],
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: "user-uuid-1",
          email: "user@university.edu.vn",
          role: "LECTURER",
        },
        { expiresIn: 28800 },
      );

      expect(response).toEqual({
        accessToken: "mock-jwt-token-8h",
        tokenType: "Bearer",
        expiresIn: 28800,
        user: {
          id: "user-uuid-1",
          email: "user@university.edu.vn",
          fullName: "Nguyen Van A",
          role: "LECTURER",
        },
      });
    });

    it("should throw UnauthorizedException when email does not exist", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Invalid email or password"),
      );
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      const differentHash = await bcrypt.hash("AnotherPassword456!", 10);

      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: "user-uuid-1",
            email: "user@university.edu.vn",
            password_hash: differentHash,
            full_name: "Nguyen Van A",
            role: "LECTURER",
          },
        ],
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Invalid email or password"),
      );
    });
  });

  describe("validateToken / Profile (EBA-105 AC 3)", () => {
    it("should return user profile including id, email, fullName, and role", async () => {
      mockDbService.query.mockResolvedValueOnce({
        rows: [
          {
            id: "user-uuid-1",
            email: "user@university.edu.vn",
            full_name: "Nguyen Van A",
            role: "LECTURER",
          },
        ],
      });

      const profile = await service.validateToken({
        sub: "user-uuid-1",
        email: "user@university.edu.vn",
        role: "LECTURER",
      });

      expect(mockDbService.query).toHaveBeenCalledWith(
        "SELECT id, email, full_name, role FROM users WHERE id = $1",
        ["user-uuid-1"],
      );

      expect(profile).toEqual({
        id: "user-uuid-1",
        email: "user@university.edu.vn",
        fullName: "Nguyen Van A",
        role: "LECTURER",
      });
    });

    it("should throw UnauthorizedException when user id is not found in database", async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.validateToken({
          sub: "non-existent-uuid",
          email: "ghost@university.edu.vn",
          role: "STUDENT",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
