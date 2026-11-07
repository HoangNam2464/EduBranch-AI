import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { RateLimiterGuard } from "../src/modules/auth/guards/rate-limiter.guard";
import { RateLimiterService } from "../src/modules/auth/rate-limiter/rate-limiter.service";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { AuthController } from "../src/modules/auth/auth.controller";
import { CourseController } from "../src/modules/course/course.controller";
import { CourseService } from "../src/modules/course/course.service";
import { CaseController } from "../src/modules/case/case.controller";
import { CaseService } from "../src/modules/case/case.service";
import { BranchingAttemptController } from "../src/modules/branching-attempt/branching-attempt.controller";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";
import { HealthController } from "../src/common/health/health.controller";
import { DatabaseService } from "../src/common/database/database.service";

/**
 * [QA-001] Test Matrix for Auth, Course & Permissions
 * Master Task ID: EBA-109
 * Sprint 1 - Foundation
 *
 * Verifies the complete matrix of:
 * 1. Authentication Contract (missing, expired, tampered, malformed tokens & public exemptions)
 * 2. Role-Based Access Control (RBAC) (LECTURER vs STUDENT valid & negative permissions)
 * 3. Course Ownership Enforcement (cross-lecturer boundary, validation, isolation)
 */
describe("[QA-001] Auth, Course & Permissions Matrix (E2E Integration)", () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = "qa001-matrix-jwt-secret-key-at-least-32-chars-long";
  const WRONG_JWT_SECRET = "wrong-untrusted-signature-key-32-characters";

  function signJwt(payload: {
    sub: string;
    email?: string;
    role: "STUDENT" | "LECTURER";
    exp?: number;
    secret?: string;
  }): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      exp: payload.exp !== undefined ? payload.exp : now + 3600,
      email: payload.email || `${payload.sub}@university.edu.vn`,
      sub: payload.sub,
      role: payload.role,
    };
    const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const secret = payload.secret || TEST_JWT_SECRET;
    const signature = crypto
      .createHmac("sha256", secret)
      .update(`${header}.${body}`)
      .digest("base64url");
    return `${header}.${body}.${signature}`;
  }

  // Mock services
  const mockAuthService = {
    register: jest.fn().mockResolvedValue({
      user: { id: "u-new", email: "new@uni.edu", role: "STUDENT" },
      token: "dummy-token",
    }),
    login: jest.fn().mockResolvedValue({
      user: { id: "u-1", email: "test@uni.edu", role: "LECTURER" },
      token: "dummy-token",
    }),
    validateToken: jest.fn().mockImplementation(async (payload: any) => {
      if (!payload || !payload.sub) throw new UnauthorizedException("Invalid token payload");
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }),
  };

  const mockCourseService = {
    createCourse: jest.fn().mockImplementation(async (lecturerId: string, dto: any) => ({
      id: "course-created-1",
      name: dto.name,
      description: dto.description || null,
      courseCode: dto.courseCode || null,
      lecturer_id: lecturerId,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    getCoursesByLecturer: jest.fn().mockImplementation(async (lecturerId: string) => [
      {
        id: "course-1",
        name: "Kinh tế vi mô",
        lecturer_id: lecturerId,
        active: true,
      },
    ]),
    getCourseById: jest.fn().mockImplementation(async (courseId: string, requesterId?: string) => {
      if (courseId === "non-existent") throw new NotFoundException("Course not found");
      return {
        id: courseId,
        name: "Quản trị chiến lược",
        lecturer_id: "lecturer-owner-a",
        active: true,
      };
    }),
    updateCourse: jest.fn().mockImplementation(async (courseId: string, lecturerId: string, dto: any) => {
      if (lecturerId !== "lecturer-owner-a") {
        throw new ForbiddenException("You can only edit your own courses");
      }
      return {
        id: courseId,
        name: dto.name || "Quản trị chiến lược",
        lecturer_id: "lecturer-owner-a",
        updated_at: new Date().toISOString(),
      };
    }),
    deleteCourse: jest.fn().mockImplementation(async (courseId: string, lecturerId: string) => {
      if (lecturerId !== "lecturer-owner-a") {
        throw new ForbiddenException("You can only delete your own courses");
      }
      return { success: true, deletedCourseId: courseId };
    }),
  };

  const mockCaseService = {
    generateCase: jest.fn().mockImplementation(async (courseId: string, lecturerId: string, dto: any) => {
      if (courseId === "course-of-lecturer-a" && lecturerId !== "lecturer-owner-a") {
        throw new ForbiddenException("You do not own this course");
      }
      return { id: "case-generated-1", courseId, status: "DRAFT" };
    }),
    getCasesByCourse: jest.fn().mockResolvedValue([]),
    getCaseById: jest.fn(),
    updateCase: jest.fn(),
    updateCaseStatus: jest.fn().mockResolvedValue({ id: "case-1", status: "PUBLISHED" }),
  };

  const mockAttemptService = {
    startAttempt: jest.fn().mockResolvedValue({
      id: "attempt-1",
      caseId: "case-pub-1",
      attemptNumber: 1,
      currentNodeId: "node-root",
    }),
    getAttemptsByCase: jest.fn().mockResolvedValue([]),
    getAttempt: jest.fn().mockResolvedValue({ id: "attempt-1" }),
    chooseOption: jest.fn().mockResolvedValue({ nextNodeId: "node-2", isTerminal: false }),
    saveRetrospectiveReasoning: jest.fn().mockResolvedValue({ success: true }),
    submitReflection: jest.fn().mockResolvedValue({ success: true, isCompleted: true }),
  };

  const mockDbService = {
    query: jest.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
  };

  const mockRateLimiterService = {
    checkLimit: jest.fn().mockReturnValue({
      allowed: true,
      count: 1,
      limit: 5,
      remaining: 4,
      resetTime: Date.now() + 60000,
    }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [
        AuthController,
        CourseController,
        CaseController,
        BranchingAttemptController,
        HealthController,
      ],
      providers: [
        JwtStrategy,
        RateLimiterGuard,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal?: any) => {
              if (key === "JWT_SECRET") return TEST_JWT_SECRET;
              if (key === "REDIS_HOST") return "127.0.0.1";
              if (key === "REDIS_PORT") return 6379;
              return defaultVal;
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: CaseService, useValue: mockCaseService },
        { provide: BranchingAttemptService, useValue: mockAttemptService },
        { provide: DatabaseService, useValue: mockDbService },
        { provide: RateLimiterService, useValue: mockRateLimiterService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");

    // Global ValidationPipe (matches main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Global Guards (matches main.ts: JwtAuthGuard then RolesGuard)
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // SECTION 1: AUTHENTICATION MATRIX (AC-1, AC-2)
  // ============================================================================
  describe("1. Authentication Matrix: Token Validity, Expiry & Public Exemptions", () => {
    it("[AUTH-01] Missing Bearer token on protected route -> 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .expect(401);

      await request(app.getHttpServer())
        .post("/api/v1/courses")
        .send({ name: "Khóa học thử nghiệm" })
        .expect(401);

      await request(app.getHttpServer())
        .post("/api/v1/cases/case-123/branching-attempts")
        .expect(401);
    });

    it("[AUTH-02] Expired token (exp in past) -> 401 Unauthorized", async () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = signJwt({
        sub: "user-expired",
        role: "LECTURER",
        exp: pastTimestamp,
      });

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });

    it("[AUTH-03] Tampered signature (signed with untrusted key) -> 401 Unauthorized", async () => {
      const tamperedToken = signJwt({
        sub: "attacker",
        role: "LECTURER",
        secret: WRONG_JWT_SECRET,
      });

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${tamperedToken}`)
        .expect(401);
    });

    it("[AUTH-04] Malformed token format -> 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Bearer not.a.valid.jwt.string")
        .expect(401);

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Basic dXNlcjpwYXNz")
        .expect(401);
    });

    it("[AUTH-05] Public routes bypass authentication guard without token", async () => {
      // 1. Health check endpoint
      const healthRes = await request(app.getHttpServer()).get("/api/v1/health");
      expect(healthRes.status).not.toBe(401);
      expect([200, 503]).toContain(healthRes.status);

      // 2. Auth register endpoint
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({
          email: "student@uni.edu",
          password: "SecurePassword123!",
          fullName: "Pham Van A",
          role: "STUDENT",
        })
        .expect(201);

      // 3. Auth login endpoint
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({
          email: "student@uni.edu",
          password: "SecurePassword123!",
        })
        .expect(200);
    });

    it("[AUTH-06] Valid token with correct secret succeeds authentication", async () => {
      const validLecturerToken = signJwt({
        sub: "lecturer-owner-a",
        role: "LECTURER",
      });

      const res = await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${validLecturerToken}`)
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(mockCourseService.getCoursesByLecturer).toHaveBeenCalledWith("lecturer-owner-a");
    });
  });

  // ============================================================================
  // SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) MATRIX (AC-1, AC-2)
  // ============================================================================
  describe("2. RBAC Matrix: LECTURER vs STUDENT Permissions & Role Spoofing Defense", () => {
    const lecturerToken = signJwt({ sub: "lecturer-1", role: "LECTURER" });
    const studentToken = signJwt({ sub: "student-1", role: "STUDENT" });

    // 2.1 Lecturer Endpoints: LECTURER allowed, STUDENT denied
    describe("2.1 Lecturer Endpoints (@Roles('LECTURER'))", () => {
      it("[RBAC-01] POST /courses — LECTURER allowed (201), STUDENT forbidden (403)", async () => {
        // LECTURER
        await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ name: "Kinh tế vĩ mô" })
          .expect(201);

        // STUDENT
        const res = await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Kinh tế vĩ mô" })
          .expect(403);

        expect(res.body.message).toContain("Forbidden resource");
      });

      it("[RBAC-02] GET /courses — LECTURER allowed (200), STUDENT forbidden (403)", async () => {
        await request(app.getHttpServer())
          .get("/api/v1/courses")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(200);

        await request(app.getHttpServer())
          .get("/api/v1/courses")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);
      });

      it("[RBAC-03] POST /cases/generate — LECTURER allowed (201), STUDENT forbidden (403)", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/cases/generate")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ courseId: "c1", materialIds: ["m1"] })
          .expect(201);

        await request(app.getHttpServer())
          .post("/api/v1/cases/generate")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ courseId: "c1", materialIds: ["m1"] })
          .expect(403);
      });

      it("[RBAC-04] PATCH /cases/:id/status — LECTURER allowed (200), STUDENT forbidden (403)", async () => {
        await request(app.getHttpServer())
          .patch("/api/v1/cases/case-1/status")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ status: "PUBLISHED" })
          .expect(200);

        await request(app.getHttpServer())
          .patch("/api/v1/cases/case-1/status")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ status: "PUBLISHED" })
          .expect(403);
      });
    });

    // 2.2 Student Endpoints: STUDENT allowed, LECTURER denied
    describe("2.2 Student Endpoints (@Roles('STUDENT'))", () => {
      it("[RBAC-05] POST /cases/:caseId/branching-attempts — STUDENT allowed (201), LECTURER forbidden (403)", async () => {
        // STUDENT
        await request(app.getHttpServer())
          .post("/api/v1/cases/case-1/branching-attempts")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(201);

        // LECTURER
        const res = await request(app.getHttpServer())
          .post("/api/v1/cases/case-1/branching-attempts")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(403);

        expect(res.body.message).toContain("Forbidden resource");
      });

      it("[RBAC-06] POST /branching-attempts/:id/step — STUDENT allowed (201), LECTURER forbidden (403)", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/step")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ nodeId: "n1", optionId: "o1" })
          .expect(201);

        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/step")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ nodeId: "n1", optionId: "o1" })
          .expect(403);
      });

      it("[RBAC-07] PUT /branching-attempts/:id/reasoning — STUDENT allowed (200), LECTURER forbidden (403)", async () => {
        await request(app.getHttpServer())
          .put("/api/v1/branching-attempts/att-1/reasoning")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ nodeId: "n1", reasoningText: "Reasoning for strategic option" })
          .expect(200);

        await request(app.getHttpServer())
          .put("/api/v1/branching-attempts/att-1/reasoning")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ nodeId: "n1", reasoningText: "Reasoning for strategic option" })
          .expect(403);
      });

      it("[RBAC-08] POST /branching-attempts/:id/reflection — STUDENT allowed (201), LECTURER forbidden (403)", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/reflection")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ reflectionText: "Self-reflection on the outcome" })
          .expect(201);

        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/reflection")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ reflectionText: "Self-reflection on the outcome" })
          .expect(403);
      });
    });

    // 2.3 Role Spoofing Defense
    describe("2.3 Role Spoofing Defense", () => {
      it("[RBAC-09] Student passing ?role=LECTURER cannot bypass RolesGuard", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/courses?role=LECTURER")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Hacked Course" })
          .expect(403);

        await request(app.getHttpServer())
          .post("/api/v1/cases/generate?role=LECTURER")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ courseId: "c1", materialIds: ["m1"] })
          .expect(403);
      });
    });
  });

  // ============================================================================
  // SECTION 3: COURSE OWNERSHIP & DATA ISOLATION (AC-1)
  // ============================================================================
  describe("3. Course Ownership & Data Isolation Matrix", () => {
    const ownerToken = signJwt({ sub: "lecturer-owner-a", role: "LECTURER" });
    const intruderToken = signJwt({ sub: "lecturer-intruder-b", role: "LECTURER" });
    const studentToken = signJwt({ sub: "student-1", role: "STUDENT" });

    describe("3.1 Validation on Course Creation", () => {
      it("[OWN-01] Rejects empty or whitespace-only course name with 400 Bad Request", async () => {
        // Missing name
        await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${ownerToken}`)
          .send({})
          .expect(400);

        // Empty string name
        await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${ownerToken}`)
          .send({ name: "" })
          .expect(400);

        // Name with length < 2
        await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${ownerToken}`)
          .send({ name: "A" })
          .expect(400);
      });

      it("[OWN-02] Successfully creates course for authenticated lecturer", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${ownerToken}`)
          .send({
            name: "Phân tích tài chính doanh nghiệp",
            description: "Khóa học cao cấp",
            courseCode: "FIN-401",
          })
          .expect(201);

        expect(res.body.status).toBe("SUCCESS");
        expect(res.body.data.lecturer_id).toBe("lecturer-owner-a");
        expect(mockCourseService.createCourse).toHaveBeenCalledWith(
          "lecturer-owner-a",
          expect.objectContaining({ name: "Phân tích tài chính doanh nghiệp" }),
        );
      });
    });

    describe("3.2 Course Ownership Gates (Update & Delete)", () => {
      it("[OWN-03] Lecturer Owner can update their own course -> 200 OK", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${ownerToken}`)
          .send({ name: "Tên khóa học đã cập nhật" })
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
        expect(mockCourseService.updateCourse).toHaveBeenCalledWith(
          "course-of-lecturer-a",
          "lecturer-owner-a",
          expect.objectContaining({ name: "Tên khóa học đã cập nhật" }),
        );
      });

      it("[OWN-04] Non-owner Lecturer B updating Course A receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${intruderToken}`)
          .send({ name: "Tên bị giả mạo" })
          .expect(403);

        expect(res.body.message).toBe("You can only edit your own courses");
      });

      it("[OWN-05] Lecturer Owner can delete their own course -> 200 OK", async () => {
        const res = await request(app.getHttpServer())
          .delete("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${ownerToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
        expect(mockCourseService.deleteCourse).toHaveBeenCalledWith(
          "course-of-lecturer-a",
          "lecturer-owner-a",
        );
      });

      it("[OWN-06] Non-owner Lecturer B deleting Course A receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .delete("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${intruderToken}`)
          .expect(403);

        expect(res.body.message).toBe("You can only delete your own courses");
      });

      it("[OWN-07] Student attempting to update or delete course receives 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Student Hacked Course" })
          .expect(403);

        await request(app.getHttpServer())
          .delete("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);
      });

      it("[OWN-08] Non-owner Lecturer B generating case in Course A receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/cases/generate")
          .set("Authorization", `Bearer ${intruderToken}`)
          .send({ courseId: "course-of-lecturer-a", materialIds: ["mat-1"] })
          .expect(403);

        expect(res.body.message).toBe("You do not own this course");
      });
    });
  });
});
