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
import { CourseController } from "../src/modules/course/course.controller";
import { CourseService } from "../src/modules/course/course.service";
import { CaseController } from "../src/modules/case/case.controller";
import { CaseService } from "../src/modules/case/case.service";
import { BranchingAttemptController } from "../src/modules/branching-attempt/branching-attempt.controller";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";
import { HealthController } from "../src/common/health/health.controller";
import { DatabaseService } from "../src/common/database/database.service";

/**
 * [QA-002] Security Regression Suite: Token Expiry, Role Denial & Ownership Leak
 * Master Task ID: EBA-110
 * Sprint 1 - Foundation
 *
 * Verifies Acceptance Criteria AC-1 through AC-3:
 * - AC-1: Expired or invalid signature token rejected with HTTP 401.
 * - AC-2: Cross-user or cross-role resource access rejected with HTTP 403.
 * - AC-3: Automated test execution evidence and pass/fail logging.
 */
describe("[QA-002] Security Regression: Token Expiry, Role Denial & Ownership Leak", () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = "qa002-regression-jwt-secret-key-at-least-32-chars";
  const UNTRUSTED_JWT_SECRET = "untrusted-attacker-secret-key-32-chars-long";

  function signJwt(payload: {
    sub?: string;
    email?: string;
    role: "STUDENT" | "LECTURER";
    exp?: number;
    secret?: string;
  }): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: Record<string, any> = {
      exp: payload.exp !== undefined ? payload.exp : now + 3600,
      email: payload.email || `${payload.sub || "user"}@university.edu.vn`,
      role: payload.role,
    };
    if (payload.sub !== undefined) {
      fullPayload.sub = payload.sub;
    }
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
    validateToken: jest.fn().mockImplementation(async (payload: any) => {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException("Invalid token payload: missing sub claim");
      }
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }),
  };

  const mockCourseService = {
    createCourse: jest.fn().mockImplementation(async (lecturerId: string, dto: any) => ({
      id: "course-regression-1",
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
        name: "Học phần Kinh tế vĩ mô",
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
      return { id: "case-gen-1", courseId, status: "DRAFT" };
    }),
    getCasesByCourse: jest.fn().mockResolvedValue([]),
    getCaseById: jest.fn().mockImplementation(async (caseId: string, role: string, userId?: string) => {
      if (caseId === "case-draft-1" && role === "STUDENT") {
        throw new ForbiddenException("Students can only access PUBLISHED cases");
      }
      return { id: caseId, status: caseId === "case-draft-1" ? "DRAFT" : "PUBLISHED" };
    }),
    updateCase: jest.fn().mockImplementation(async (caseId: string, lecturerId: string, dto: any) => {
      if (caseId === "case-of-lecturer-a" && lecturerId !== "lecturer-owner-a") {
        throw new ForbiddenException("You can only edit cases in your own courses");
      }
      return { id: caseId, ...dto };
    }),
    updateCaseStatus: jest.fn().mockImplementation(async (caseId: string, lecturerId: string, status: string) => {
      if (caseId === "case-of-lecturer-a" && lecturerId !== "lecturer-owner-a") {
        throw new ForbiddenException("You can only edit cases in your own courses");
      }
      return { id: caseId, status };
    }),
  };

  const mockAttemptService = {
    startAttempt: jest.fn().mockImplementation(async (caseId: string, studentId: string) => ({
      id: "attempt-1",
      caseId,
      studentId,
      attemptNumber: 1,
      currentNodeId: "node-root",
    })),
    getAttemptsByCase: jest.fn().mockResolvedValue([]),
    getAttempt: jest.fn().mockImplementation(async (attemptId: string, studentId: string) => {
      if (attemptId === "attempt-of-student-a" && studentId !== "student-owner-a") {
        throw new ForbiddenException("You do not have permission to view this attempt");
      }
      return { id: attemptId, studentId: "student-owner-a" };
    }),
    chooseOption: jest.fn().mockImplementation(async (attemptId: string, studentId: string, body: any) => {
      if (attemptId === "attempt-of-student-a" && studentId !== "student-owner-a") {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }
      return { nextNodeId: body.nodeId, isTerminal: false };
    }),
    saveRetrospectiveReasoning: jest.fn().mockImplementation(async (attemptId: string, studentId: string, body: any) => {
      if (attemptId === "attempt-of-student-a" && studentId !== "student-owner-a") {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }
      return { success: true, savedNodeId: body.nodeId };
    }),
    submitReflection: jest.fn().mockImplementation(async (attemptId: string, studentId: string, body: any) => {
      if (attemptId === "attempt-of-student-a" && studentId !== "student-owner-a") {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }
      return { success: true, attemptId };
    }),
  };

  const mockDbService = {
    query: jest.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    getClient: jest.fn(),
  };

  const mockRateLimiterService = {
    consume: jest.fn().mockResolvedValue({ isAllowed: true, remainingPoints: 59 }),
    reset: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [
        HealthController,
        CourseController,
        CaseController,
        BranchingAttemptController,
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

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

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
  // SECTION 1: TOKEN EXPIRY & CRYPTOGRAPHIC INTEGRITY (AC-1)
  // ============================================================================
  describe("1. Token Expiry & Cryptographic Signature Validation (AC-1)", () => {
    it("[SEC-EXP-01] Expired token (exp in past) -> 401 Unauthorized", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 1800; // 30 minutes expired
      const expiredToken = signJwt({
        sub: "user-expired-1",
        role: "LECTURER",
        exp: pastTime,
      });

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);
    });

    it("[SEC-EXP-02] Expired token on branching study attempt -> 401 Unauthorized", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 60; // 1 minute expired
      const expiredStudentToken = signJwt({
        sub: "student-expired-1",
        role: "STUDENT",
        exp: pastTime,
      });

      await request(app.getHttpServer())
        .post("/api/v1/cases/case-1/branching-attempts")
        .set("Authorization", `Bearer ${expiredStudentToken}`)
        .expect(401);
    });

    it("[SEC-EXP-03] Invalid signature (signed with untrusted key) -> 401 Unauthorized", async () => {
      const untrustedToken = signJwt({
        sub: "attacker-1",
        role: "LECTURER",
        secret: UNTRUSTED_JWT_SECRET,
      });

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${untrustedToken}`)
        .expect(401);
    });

    it("[SEC-EXP-04] Tampered payload with original signature -> 401 Unauthorized", async () => {
      const legitimateToken = signJwt({
        sub: "student-1",
        role: "STUDENT",
      });

      // Split token and alter payload without recomputing HMAC
      const [header, body, signature] = legitimateToken.split(".");
      const decodedBody = JSON.parse(Buffer.from(body, "base64url").toString());
      decodedBody.role = "LECTURER"; // Attacker attempts privilege tampering
      const tamperedBody = Buffer.from(JSON.stringify(decodedBody)).toString("base64url");
      const tamperedToken = `${header}.${tamperedBody}.${signature}`;

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${tamperedToken}`)
        .expect(401);
    });

    it("[SEC-EXP-05] Malformed token format -> 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Bearer invalid-token-string")
        .expect(401);

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Bearer header.body") // missing signature
        .expect(401);
    });

    it("[SEC-EXP-06] Missing Authorization header -> 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .expect(401);

      await request(app.getHttpServer())
        .post("/api/v1/courses")
        .send({ name: "Unauthenticated Course" })
        .expect(401);
    });

    it("[SEC-EXP-07] Non-Bearer Authorization scheme -> 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Basic dXNlcjpwYXNzd29yZA==")
        .expect(401);

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", "Token abcdef123456")
        .expect(401);
    });

    it("[SEC-EXP-08] Missing sub claim in token payload -> 401 Unauthorized", async () => {
      const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
      const body = Buffer.from(
        JSON.stringify({
          role: "LECTURER",
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString("base64url");
      const signature = crypto
        .createHmac("sha256", TEST_JWT_SECRET)
        .update(`${header}.${body}`)
        .digest("base64url");
      const tokenWithoutSub = `${header}.${body}.${signature}`;

      await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${tokenWithoutSub}`)
        .expect(401);
    });

    it("[SEC-EXP-09] Valid token with correct secret and unexpired claims -> 200 OK", async () => {
      const validToken = signJwt({
        sub: "lecturer-owner-a",
        role: "LECTURER",
      });

      const res = await request(app.getHttpServer())
        .get("/api/v1/courses")
        .set("Authorization", `Bearer ${validToken}`)
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(mockCourseService.getCoursesByLecturer).toHaveBeenCalledWith("lecturer-owner-a");
    });
  });

  // ============================================================================
  // SECTION 2: ROLE DENIAL & PRIVILEGE ESCALATION REGRESSION (AC-2)
  // ============================================================================
  describe("2. Role Denial & Privilege Escalation Regression (AC-2)", () => {
    const studentToken = signJwt({ sub: "student-reg-1", role: "STUDENT" });
    const lecturerToken = signJwt({ sub: "lecturer-reg-1", role: "LECTURER" });

    describe("2.1 Student calling Lecturer-only endpoints (@Roles('LECTURER'))", () => {
      it("[SEC-ROLE-01] Student calling POST /courses -> 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Student Course Attempt" })
          .expect(403);

        expect(res.body.message).toContain("Forbidden resource");
        expect(mockCourseService.createCourse).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-02] Student calling GET /courses -> 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .get("/api/v1/courses")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);

        expect(mockCourseService.getCoursesByLecturer).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-03] Student calling POST /cases/generate -> 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/cases/generate")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ courseId: "course-1", materialIds: ["mat-1"] })
          .expect(403);

        expect(mockCaseService.generateCase).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-04] Student calling PATCH /cases/:id/status -> 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .patch("/api/v1/cases/case-1/status")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ status: "PUBLISHED" })
          .expect(403);

        expect(mockCaseService.updateCaseStatus).not.toHaveBeenCalled();
      });
    });

    describe("2.2 Lecturer calling Student-only endpoints (@Roles('STUDENT'))", () => {
      it("[SEC-ROLE-05] Lecturer calling POST /cases/:id/branching-attempts -> 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/cases/case-1/branching-attempts")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(403);

        expect(res.body.message).toContain("Forbidden resource");
        expect(mockAttemptService.startAttempt).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-06] Lecturer calling POST /branching-attempts/:id/step -> 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/step")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ nodeId: "n1", optionId: "o1" })
          .expect(403);

        expect(mockAttemptService.chooseOption).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-07] Lecturer calling PUT /branching-attempts/:id/reasoning -> 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .put("/api/v1/branching-attempts/att-1/reasoning")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ nodeId: "n1", reasoningText: "Lecturer reasoning forbidden" })
          .expect(403);

        expect(mockAttemptService.saveRetrospectiveReasoning).not.toHaveBeenCalled();
      });

      it("[SEC-ROLE-08] Lecturer calling POST /branching-attempts/:id/reflection -> 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/att-1/reflection")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send({ reflectionText: "Lecturer reflection forbidden" })
          .expect(403);

        expect(mockAttemptService.submitReflection).not.toHaveBeenCalled();
      });
    });

    describe("2.3 Role Spoofing & Lifecycle Policy Gates", () => {
      it("[SEC-ROLE-09] Student passing ?role=LECTURER cannot bypass RolesGuard", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/courses?role=LECTURER")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Spoofed Course" })
          .expect(403);

        await request(app.getHttpServer())
          .post("/api/v1/cases/generate?role=LECTURER")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ courseId: "c1", materialIds: ["m1"] })
          .expect(403);
      });

      it("[SEC-ROLE-10] Student injecting role: 'LECTURER' in body cannot escalate", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/courses")
          .set("Authorization", `Bearer ${studentToken}`)
          .send({ name: "Escalated Course", role: "LECTURER" })
          .expect(403);
      });

      it("[SEC-ROLE-11] Student accessing DRAFT case receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .get("/api/v1/cases/case-draft-1")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);

        expect(res.body.message).toBe("Students can only access PUBLISHED cases");
      });
    });
  });

  // ============================================================================
  // SECTION 3: OWNERSHIP LEAK REGRESSION & DATA ISOLATION (AC-2)
  // ============================================================================
  describe("3. Ownership Leak Regression & Data Isolation Boundaries (AC-2)", () => {
    const ownerLecturerToken = signJwt({ sub: "lecturer-owner-a", role: "LECTURER" });
    const intruderLecturerToken = signJwt({ sub: "lecturer-intruder-b", role: "LECTURER" });
    const ownerStudentToken = signJwt({ sub: "student-owner-a", role: "STUDENT" });
    const intruderStudentToken = signJwt({ sub: "student-intruder-b", role: "STUDENT" });

    describe("3.1 Cross-Lecturer Resource Protection", () => {
      it("[SEC-OWN-01] Lecturer B updating Lecturer A's course receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${intruderLecturerToken}`)
          .send({ name: "Hacked Course Name" })
          .expect(403);

        expect(res.body.message).toBe("You can only edit your own courses");
      });

      it("[SEC-OWN-02] Lecturer B deleting Lecturer A's course receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .delete("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${intruderLecturerToken}`)
          .expect(403);

        expect(res.body.message).toBe("You can only delete your own courses");
      });

      it("[SEC-OWN-03] Lecturer B generating case in Lecturer A's course receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/cases/generate")
          .set("Authorization", `Bearer ${intruderLecturerToken}`)
          .send({ courseId: "course-of-lecturer-a", materialIds: ["mat-1"] })
          .expect(403);

        expect(res.body.message).toBe("You do not own this course");
      });

      it("[SEC-OWN-04] Lecturer B updating Lecturer A's case receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/cases/case-of-lecturer-a")
          .set("Authorization", `Bearer ${intruderLecturerToken}`)
          .send({ title: "Tampered Case Title" })
          .expect(403);

        expect(res.body.message).toBe("You can only edit cases in your own courses");
      });

      it("[SEC-OWN-05] Lecturer Owner successfully updates their own course -> 200 OK", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${ownerLecturerToken}`)
          .send({ name: "Cập nhật hợp lệ bởi Giảng viên A" })
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });
    });

    describe("3.2 Student Course Tampering Prevention", () => {
      it("[SEC-OWN-06] Student attempting to PUT course receives 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .put("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${ownerStudentToken}`)
          .send({ name: "Student Tamper Attempt" })
          .expect(403);
      });

      it("[SEC-OWN-07] Student attempting to DELETE course receives 403 Forbidden", async () => {
        await request(app.getHttpServer())
          .delete("/api/v1/courses/course-of-lecturer-a")
          .set("Authorization", `Bearer ${ownerStudentToken}`)
          .expect(403);
      });
    });

    describe("3.3 Cross-Student Branching Attempt Isolation", () => {
      it("[SEC-OWN-08] Student B reading Student A's attempt receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .get("/api/v1/branching-attempts/attempt-of-student-a")
          .set("Authorization", `Bearer ${intruderStudentToken}`)
          .expect(403);

        expect(res.body.message).toBe("You do not have permission to view this attempt");
      });

      it("[SEC-OWN-09] Student B submitting step on Student A's attempt receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/attempt-of-student-a/step")
          .set("Authorization", `Bearer ${intruderStudentToken}`)
          .send({ nodeId: "node-2", optionId: "opt-1" })
          .expect(403);

        expect(res.body.message).toBe("You do not have permission to modify this attempt");
      });

      it("[SEC-OWN-10] Student B submitting reasoning on Student A's attempt receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .put("/api/v1/branching-attempts/attempt-of-student-a/reasoning")
          .set("Authorization", `Bearer ${intruderStudentToken}`)
          .send({ nodeId: "node-1", reasoningText: "Tampered reasoning" })
          .expect(403);

        expect(res.body.message).toBe("You do not have permission to modify this attempt");
      });

      it("[SEC-OWN-11] Student B submitting reflection on Student A's attempt receives 403 Forbidden", async () => {
        const res = await request(app.getHttpServer())
          .post("/api/v1/branching-attempts/attempt-of-student-a/reflection")
          .set("Authorization", `Bearer ${intruderStudentToken}`)
          .send({ reflectionText: "Tampered reflection" })
          .expect(403);

        expect(res.body.message).toBe("You do not have permission to modify this attempt");
      });

      it("[SEC-OWN-12] Student A (Owner) can successfully read their own attempt -> 200 OK", async () => {
        const res = await request(app.getHttpServer())
          .get("/api/v1/branching-attempts/attempt-of-student-a")
          .set("Authorization", `Bearer ${ownerStudentToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
        expect(res.body.data.id).toBe("attempt-of-student-a");
      });
    });
  });
});
