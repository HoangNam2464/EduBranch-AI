import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { DatabaseService } from "../src/common/database/database.service";

import { ReviewStudyController } from "../src/modules/review-study/review-study.controller";
import { ReviewStudyService } from "../src/modules/review-study/review-study.service";
import { LecturerFeedbackController } from "../src/modules/lecturer-feedback/lecturer-feedback.controller";
import { LecturerFeedbackService } from "../src/modules/lecturer-feedback/lecturer-feedback.service";
import { StatisticsController } from "../src/modules/statistics/statistics.controller";
import { StatisticsService } from "../src/modules/statistics/statistics.service";

describe("Feedback and Statistics API E2E (BE-025 / BE-026 / BE-028 / E1–E8)", () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = "feedback-stats-supertest-jwt-secret-32-chars";

  function signJwt(payload: {
    sub: string;
    email?: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
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

  const mockReviewStudyService = {
    submit: jest.fn(),
    getMine: jest.fn(),
    getById: jest.fn(),
    submitReflection: jest.fn(),
    getFeedback: jest.fn(),
  };

  const mockLecturerFeedbackService = {
    create: jest.fn(),
    getQueue: jest.fn(),
  };

  const mockStatisticsService = {
    getCaseStatistics: jest.fn(),
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
      controllers: [
        ReviewStudyController,
        LecturerFeedbackController,
        StatisticsController,
      ],
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
        { provide: ReviewStudyService, useValue: mockReviewStudyService },
        { provide: LecturerFeedbackService, useValue: mockLecturerFeedbackService },
        { provide: StatisticsService, useValue: mockStatisticsService },
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
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

  // Test identities
  const studentToken = signJwt({ sub: "student-1", role: "STUDENT" });
  const otherStudentToken = signJwt({ sub: "student-2", role: "STUDENT" });
  const lecturerToken = signJwt({ sub: "lecturer-1", role: "LECTURER" });
  const otherLecturerToken = signJwt({ sub: "lecturer-2", role: "LECTURER" });
  const adminToken = signJwt({ sub: "admin-1", role: "ADMIN" });

  const validUuid = "11111111-1111-4111-8111-111111111111";
  const validUuid2 = "22222222-2222-4222-8222-222222222222";

  describe("6-Role Permission Matrix & Endpoint Access (SC-02)", () => {
    // E1: POST /api/v1/cases/:caseId/review-study/submit (STUDENT only)
    describe("E1: POST /api/v1/cases/:caseId/review-study/submit", () => {
      const validBody = {
        proposedSolution: "Viable business solution proposal",
        reasoningText: "Solid rationale grounded in market analysis",
      };

      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/cases/${validUuid}/review-study/submit`)
          .send(validBody)
          .expect(401);
      });

      it("rejects ADMIN role with 403 (R-ROLE)", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/cases/${validUuid}/review-study/submit`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(validBody)
          .expect(403);
      });

      it("rejects LECTURER role with 403 (R-ROLE)", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/cases/${validUuid}/review-study/submit`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send(validBody)
          .expect(403);
      });

      it("allows STUDENT role with 201", async () => {
        mockReviewStudyService.submit.mockResolvedValueOnce({
          id: validUuid2,
          submissionStatus: "SUBMITTED",
        });

        const res = await request(app.getHttpServer())
          .post(`/api/v1/cases/${validUuid}/review-study/submit`)
          .set("Authorization", `Bearer ${studentToken}`)
          .send(validBody)
          .expect(201);

        expect(res.body.status).toBe("SUCCESS");
        expect(res.body.data.id).toBe(validUuid2);
      });
    });

    // E2: GET /api/v1/cases/:caseId/review-study/submissions/me (STUDENT only)
    describe("E2: GET /api/v1/cases/:caseId/review-study/submissions/me", () => {
      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/review-study/submissions/me`)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/review-study/submissions/me`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(403);
      });

      it("rejects LECTURER role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/review-study/submissions/me`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(403);
      });

      it("allows STUDENT role with 200", async () => {
        mockReviewStudyService.getMine.mockResolvedValueOnce({
          id: validUuid2,
          submissionStatus: "SUBMITTED",
        });

        const res = await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/review-study/submissions/me`)
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });
    });

    // E3: GET /api/v1/review-study/submissions/:submissionId (STUDENT author or LECTURER owner)
    describe("E3: GET /api/v1/review-study/submissions/:submissionId", () => {
      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(403);
      });

      it("allows STUDENT author with 200", async () => {
        mockReviewStudyService.getById.mockResolvedValueOnce({ id: validUuid, studentId: "student-1" });

        const res = await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });

      it("rejects other STUDENT when service returns 403", async () => {
        mockReviewStudyService.getById.mockRejectedValueOnce(
          new ForbiddenException("You do not have access to this submission"),
        );

        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .set("Authorization", `Bearer ${otherStudentToken}`)
          .expect(403);
      });

      it("allows LECTURER course owner with 200", async () => {
        mockReviewStudyService.getById.mockResolvedValueOnce({ id: validUuid, studentId: "student-1" });

        const res = await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });

      it("rejects other LECTURER when service returns 403", async () => {
        mockReviewStudyService.getById.mockRejectedValueOnce(
          new ForbiddenException("You do not own the course for this submission"),
        );

        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}`)
          .set("Authorization", `Bearer ${otherLecturerToken}`)
          .expect(403);
      });
    });

    // E4: POST /api/v1/review-study/submissions/:submissionId/reflection (STUDENT only)
    describe("E4: POST /api/v1/review-study/submissions/:submissionId/reflection", () => {
      const validBody = { reflectionText: "Thoughtful reflection on peer feedback" };

      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
          .send(validBody)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
          .set("Authorization", `Bearer ${adminToken}`)
          .send(validBody)
          .expect(403);
      });

      it("rejects LECTURER role with 403", async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send(validBody)
          .expect(403);
      });

      it("allows STUDENT author with 200", async () => {
        mockReviewStudyService.submitReflection.mockResolvedValueOnce({
          id: validUuid,
          reflectionStatus: "SUBMITTED",
        });

        const res = await request(app.getHttpServer())
          .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
          .set("Authorization", `Bearer ${studentToken}`)
          .send(validBody)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });
    });

    // E5: GET /api/v1/review-study/submissions/:submissionId/feedback (STUDENT only)
    describe("E5: GET /api/v1/review-study/submissions/:submissionId/feedback", () => {
      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}/feedback`)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}/feedback`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(403);
      });

      it("rejects LECTURER role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}/feedback`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(403);
      });

      it("allows STUDENT author with 200", async () => {
        mockReviewStudyService.getFeedback.mockResolvedValueOnce({ feedback: null });

        const res = await request(app.getHttpServer())
          .get(`/api/v1/review-study/submissions/${validUuid}/feedback`)
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
        expect(res.body.data).toEqual({ feedback: null });
      });
    });

    // E6: POST /api/v1/lecturer-feedback (LECTURER only)
    describe("E6: POST /api/v1/lecturer-feedback", () => {
      const validBody = {
        branchingAttemptId: validUuid,
        feedbackText: "Detailed qualitative feedback for attempt",
      };

      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/lecturer-feedback")
          .send(validBody)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/lecturer-feedback")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(validBody)
          .expect(403);
      });

      it("rejects STUDENT role with 403", async () => {
        await request(app.getHttpServer())
          .post("/api/v1/lecturer-feedback")
          .set("Authorization", `Bearer ${studentToken}`)
          .send(validBody)
          .expect(403);
      });

      it("allows LECTURER owner with 201", async () => {
        mockLecturerFeedbackService.create.mockResolvedValueOnce({
          id: validUuid2,
          feedbackText: validBody.feedbackText,
        });

        const res = await request(app.getHttpServer())
          .post("/api/v1/lecturer-feedback")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .send(validBody)
          .expect(201);

        expect(res.body.status).toBe("SUCCESS");
      });
    });

    // E7: GET /api/v1/lecturer-feedback/submissions (LECTURER only)
    describe("E7: GET /api/v1/lecturer-feedback/submissions", () => {
      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .get("/api/v1/lecturer-feedback/submissions")
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .get("/api/v1/lecturer-feedback/submissions")
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(403);
      });

      it("rejects STUDENT role with 403", async () => {
        await request(app.getHttpServer())
          .get("/api/v1/lecturer-feedback/submissions")
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);
      });

      it("allows LECTURER owner with 200", async () => {
        mockLecturerFeedbackService.getQueue.mockResolvedValueOnce({ items: [] });

        const res = await request(app.getHttpServer())
          .get("/api/v1/lecturer-feedback/submissions")
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
        expect(res.body.data).toEqual({ items: [] });
      });
    });

    // E8: GET /api/v1/cases/:caseId/statistics (LECTURER only)
    describe("E8: GET /api/v1/cases/:caseId/statistics", () => {
      it("rejects unauthenticated request with 401", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/statistics`)
          .expect(401);
      });

      it("rejects ADMIN role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/statistics`)
          .set("Authorization", `Bearer ${adminToken}`)
          .expect(403);
      });

      it("rejects STUDENT role with 403", async () => {
        await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/statistics`)
          .set("Authorization", `Bearer ${studentToken}`)
          .expect(403);
      });

      it("allows LECTURER owner with 200", async () => {
        mockStatisticsService.getCaseStatistics.mockResolvedValueOnce({
          caseId: validUuid,
          learningMode: "BRANCHING_STUDY",
        });

        const res = await request(app.getHttpServer())
          .get(`/api/v1/cases/${validUuid}/statistics`)
          .set("Authorization", `Bearer ${lecturerToken}`)
          .expect(200);

        expect(res.body.status).toBe("SUCCESS");
      });
    });
  });

  describe("Validation & Negative Error Paths (400, 404, 409)", () => {
    it("E1: rejects non-UUID caseId with 400", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/cases/not-a-uuid/review-study/submit")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ proposedSolution: "1234567890", reasoningText: "1234567890" })
        .expect(400);
    });

    it("E1: rejects body with proposedSolution < 10 characters with 400", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/cases/${validUuid}/review-study/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ proposedSolution: "short", reasoningText: "valid reasoning argument" })
        .expect(400);
    });

    it("E1: rejects body with reasoningText < 10 characters with 400", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/cases/${validUuid}/review-study/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ proposedSolution: "valid proposed solution text", reasoningText: "short" })
        .expect(400);
    });

    it("E1: rejects body with unknown property with 400 (forbidNonWhitelisted)", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/cases/${validUuid}/review-study/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          proposedSolution: "valid proposed solution text",
          reasoningText: "valid reasoning argument",
          hackerField: "malicious input",
        })
        .expect(400);
    });

    it("E1: maps duplicate submission to 409 Conflict", async () => {
      mockReviewStudyService.submit.mockRejectedValueOnce(
        new ConflictException("You have already submitted a review study for this case"),
      );

      await request(app.getHttpServer())
        .post(`/api/v1/cases/${validUuid}/review-study/submit`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          proposedSolution: "valid proposed solution text",
          reasoningText: "valid reasoning argument",
        })
        .expect(409);
    });

    it("E2: returns 404 when no submission found (SUBMISSION_NOT_FOUND)", async () => {
      mockReviewStudyService.getMine.mockRejectedValueOnce(
        new NotFoundException({ statusCode: 404, error: "SUBMISSION_NOT_FOUND" }),
      );

      const res = await request(app.getHttpServer())
        .get(`/api/v1/cases/${validUuid}/review-study/submissions/me`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(404);

      expect(res.body.error).toBe("SUBMISSION_NOT_FOUND");
    });

    it("E4: rejects reflectionText < 10 chars with 400", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reflectionText: "short" })
        .expect(400);
    });

    it("E4: returns 409 Conflict when submission not in REVIEWED status", async () => {
      mockReviewStudyService.submitReflection.mockRejectedValueOnce(
        new ConflictException("Submission has not been reviewed by a lecturer yet"),
      );

      await request(app.getHttpServer())
        .post(`/api/v1/review-study/submissions/${validUuid}/reflection`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reflectionText: "Sufficient length reflection text" })
        .expect(409);
    });

    it("E6: rejects feedback with 0 targets with 400", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/lecturer-feedback")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({ feedbackText: "Constructive feedback text" })
        .expect(400);
    });

    it("E6: rejects feedback with both targets with 400 (XOR violation)", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/lecturer-feedback")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          branchingAttemptId: validUuid,
          reviewSubmissionId: validUuid2,
          feedbackText: "Constructive feedback text",
        })
        .expect(400);
    });

    it("E6: returns 409 Conflict when attempt is not completed", async () => {
      mockLecturerFeedbackService.create.mockRejectedValueOnce(
        new ConflictException("Cannot give feedback on an incomplete branching attempt"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/lecturer-feedback")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          branchingAttemptId: validUuid,
          feedbackText: "Constructive feedback text",
        })
        .expect(409);
    });

    it("E6: returns 409 Conflict when feedback already exists (C2-A)", async () => {
      mockLecturerFeedbackService.create.mockRejectedValueOnce(
        new ConflictException("Feedback already exists for this branching attempt"),
      );

      await request(app.getHttpServer())
        .post("/api/v1/lecturer-feedback")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({
          branchingAttemptId: validUuid,
          feedbackText: "Constructive feedback text",
        })
        .expect(409);
    });

    it("E8: rejects non-UUID caseId with 400", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/cases/not-uuid/statistics")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .expect(400);
    });
  });
});
