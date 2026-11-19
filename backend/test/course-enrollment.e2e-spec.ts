import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  GoneException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { CourseController } from "../src/modules/course/course.controller";
import { StudentController } from "../src/modules/course/student.controller";
import { CourseService } from "../src/modules/course/course.service";
import { DatabaseService } from "../src/common/database/database.service";

describe("Course Enrollment & Invite Code E2E (BE-029 / FE-028)", () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = "supertest-course-enrollment-secret-32-chars";

  function signJwt(payload: {
    sub: string;
    email?: string;
    role: "STUDENT" | "LECTURER";
  }): string {
    const header = Buffer.from(
      JSON.stringify({ alg: "HS256", typ: "JWT" }),
    ).toString("base64url");
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      exp: now + 3600,
      email: payload.email || `${payload.sub}@university.edu.vn`,
      ...payload,
    };
    const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", TEST_JWT_SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    return `${header}.${body}.${signature}`;
  }

  const mockCourseService = {
    createCourse: jest.fn(),
    getCoursesByLecturer: jest.fn(),
    getCourseById: jest.fn(),
    updateCourse: jest.fn(),
    archiveCourse: jest.fn(),
    enrollStudentByInviteCode: jest.fn(),
    getInviteCode: jest.fn(),
    getOrGenerateInviteCode: jest.fn(),
    rotateInviteCode: jest.fn(),
    disableInviteCode: jest.fn(),
    getStudentEnrolledCourses: jest.fn(),
    getStudentDashboard: jest.fn(),
  };

  const mockDbService = {
    query: jest.fn(),
  };

  const mockAuthService = {
    validateToken: jest.fn().mockImplementation(async (payload: any) => {
      if (!payload || !payload.sub) throw new UnauthorizedException();
      return {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [CourseController, StudentController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal?: any) => {
              if (key === "JWT_SECRET") return TEST_JWT_SECRET;
              return defaultVal;
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  const studentToken = signJwt({ sub: "student-1", role: "STUDENT" });
  const lecturerToken = signJwt({ sub: "lecturer-1", role: "LECTURER" });

  describe("POST /api/v1/courses/enroll", () => {
    it("returns 401 when no token is provided", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .send({ inviteCode: "ABC12345" })
        .expect(401);
    });

    it("returns 403 when called by LECTURER", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({ inviteCode: "ABC12345" })
        .expect(403);
    });

    it("returns 400 when invite code is empty or missing", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({})
        .expect(400);
    });

    it("returns 404 when invite code does not exist", async () => {
      mockCourseService.enrollStudentByInviteCode.mockRejectedValueOnce(
        new NotFoundException("Invalid invite code"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ inviteCode: "UNKNOWN1" })
        .expect(404);
    });

    it("returns 410 when invite code is expired or disabled", async () => {
      mockCourseService.enrollStudentByInviteCode.mockRejectedValueOnce(
        new GoneException("Invite code has expired or is disabled"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ inviteCode: "DISABLED1" })
        .expect(410);
    });

    it("returns 409 when already enrolled", async () => {
      mockCourseService.enrollStudentByInviteCode.mockRejectedValueOnce(
        new ConflictException("Already enrolled in this course"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ inviteCode: "ENROLLED1" })
        .expect(409);
    });

    it("returns 409 when course is archived", async () => {
      mockCourseService.enrollStudentByInviteCode.mockRejectedValueOnce(
        new ConflictException("Course is archived"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ inviteCode: "ARCHIVED1" })
        .expect(409);
    });

    it("returns 200 with course data when enrollment succeeds", async () => {
      const mockCourse = {
        id: "c-1",
        name: "Corporate Law",
        course_code: "LAW-301",
      };
      mockCourseService.enrollStudentByInviteCode.mockResolvedValueOnce(
        mockCourse,
      );

      const res = await request(app.getHttpServer())
        .post("/api/v1/courses/enroll")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ inviteCode: "VALID123" })
        .expect(200);

      expect(res.body).toEqual({
        status: "SUCCESS",
        data: mockCourse,
      });
    });
  });

  describe("Lecturer Invite Code API", () => {
    it("GET /api/v1/courses/:courseId/invite-code rejects student with 403", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/courses/c-1/invite-code")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(403);
    });

    it("GET /api/v1/courses/:courseId/invite-code allows lecturer", async () => {
      mockCourseService.getInviteCode.mockResolvedValueOnce({
        inviteCode: "CODE1234",
        isActive: true,
      });

      const res = await request(app.getHttpServer())
        .get("/api/v1/courses/c-1/invite-code")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.data).toEqual({ inviteCode: "CODE1234", isActive: true });
    });

    it("GET /api/v1/courses/:courseId/invite-code returns null code when not created yet (Fix 8)", async () => {
      mockCourseService.getInviteCode.mockResolvedValueOnce({
        inviteCode: null,
        isActive: false,
      });

      const res = await request(app.getHttpServer())
        .get("/api/v1/courses/c-1/invite-code")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.data).toEqual({ inviteCode: null, isActive: false });
    });

    it("GET /api/v1/courses/:courseId does not expose invite_code or invite_code_active (Fix 2)", async () => {
      const safeCourse = {
        id: "c-1",
        name: "Corporate Law",
        description: "Desc",
        course_code: "LAW-301",
        lecturer_id: "lecturer-1",
        active: true,
        is_active: true,
      };
      mockCourseService.getCourseById.mockResolvedValueOnce(safeCourse);

      const res = await request(app.getHttpServer())
        .get("/api/v1/courses/c-1")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toEqual(safeCourse);
      expect(res.body.data.invite_code).toBeUndefined();
      expect(res.body.data.invite_code_active).toBeUndefined();
    });

    it("POST /api/v1/courses/:courseId/invite-code rotates code", async () => {
      mockCourseService.rotateInviteCode.mockResolvedValueOnce({
        inviteCode: "NEWCODE1",
        isActive: true,
      });

      const res = await request(app.getHttpServer())
        .post("/api/v1/courses/c-1/invite-code")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(201);

      expect(res.body.data).toEqual({
        inviteCode: "NEWCODE1",
        isActive: true,
      });
    });

    it("DELETE /api/v1/courses/:courseId/invite-code disables code", async () => {
      mockCourseService.disableInviteCode.mockResolvedValueOnce({
        inviteCode: "CODE1234",
        isActive: false,
      });

      const res = await request(app.getHttpServer())
        .delete("/api/v1/courses/c-1/invite-code")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(200);

      expect(res.body.data).toEqual({
        inviteCode: "CODE1234",
        isActive: false,
      });
    });
  });

  describe("Student Portal API (StudentController)", () => {
    it("GET /api/v1/student/courses returns enrolled courses for student", async () => {
      mockCourseService.getStudentEnrolledCourses.mockResolvedValueOnce([
        { id: "c-1", name: "Corporate Law" },
      ]);

      const res = await request(app.getHttpServer())
        .get("/api/v1/student/courses")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toEqual([{ id: "c-1", name: "Corporate Law" }]);
    });

    it("GET /api/v1/student/courses rejects lecturer with 403", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/student/courses")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(403);
    });

    it("GET /api/v1/student/dashboard returns dashboard data for student", async () => {
      const mockDashboard = {
        enrolledCourses: [],
        recentCases: [],
        activeCases: [],
        stats: { totalEnrolled: 0, totalActiveCases: 0, totalPublishedCases: 0 },
      };
      mockCourseService.getStudentDashboard.mockResolvedValueOnce(mockDashboard);

      const res = await request(app.getHttpServer())
        .get("/api/v1/student/dashboard")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.data).toEqual(mockDashboard);
    });

    it("GET /api/v1/student/dashboard rejects lecturer with 403", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/student/dashboard")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(403);
    });
  });
});
