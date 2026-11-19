import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadGatewayException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { ChallengeSupportController } from "../src/modules/challenge-support/challenge-support.controller";
import { ChallengeSupportService } from "../src/modules/challenge-support/challenge-support.service";
import { DatabaseService } from "../src/common/database/database.service";

describe("Challenge Support E2E (BE-027 / FE-021 / EBA-74)", () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = "supertest-challenge-support-secret-32-chars";

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

  const mockService = {
    createOrGetSession: jest.fn(),
    sendReply: jest.fn(),
    getSession: jest.fn(),
    completeSession: jest.fn(),
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
      controllers: [ChallengeSupportController],
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
        { provide: ChallengeSupportService, useValue: mockService },
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

  describe("Authentication & RBAC Enforcement", () => {
    it("rejects unauthenticated requests with 401 Unauthorized", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions")
        .send({ reasoningId: "11111111-1111-1111-1111-111111111111" })
        .expect(401);
    });

    it("rejects non-student (LECTURER) requests with 403 Forbidden", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions")
        .set("Authorization", `Bearer ${lecturerToken}`)
        .send({ reasoningId: "11111111-1111-1111-1111-111111111111" })
        .expect(403);
    });
  });

  describe("ValidationPipe Guardrails", () => {
    it("rejects invalid UUID reasoningId with 400 Bad Request", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reasoningId: "not-a-valid-uuid" })
        .expect(400);
    });

    it("rejects non-UUID :id parameter with 400 Bad Request (R1-M2)", async () => {
      // POST replies
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions/not-a-valid-uuid/replies")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: "Valid reply" })
        .expect(400);

      // GET session
      await request(app.getHttpServer())
        .get("/api/v1/challenge-support/sessions/not-a-valid-uuid")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(400);

      // POST complete
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions/not-a-valid-uuid/complete")
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(400);
    });

    it("rejects empty reply with 400 Bad Request", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions/11111111-1111-1111-1111-111111111111/replies")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: "" })
        .expect(400);
    });

    it("rejects reply exceeding 1000 characters with 400 Bad Request", async () => {
      const longReply = "A".repeat(1001);
      await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions/11111111-1111-1111-1111-111111111111/replies")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: longReply })
        .expect(400);
    });
  });

  describe("Full Challenge Support Flow & Two-Round Cap", () => {
    const reasoningId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const sessionId = "b1ffcd88-8d1c-4fe9-aa7e-7cc8ce491b22";

    it("creates session, generates Round 1 question, and returns structured session", async () => {
      const mockSession = {
        id: sessionId,
        reasoningId,
        reviewSubmissionId: null,
        currentRound: 1,
        isCompleted: false,
        createdAt: "2026-11-19T10:00:00Z",
        updatedAt: "2026-11-19T10:00:00Z",
        messages: [
          {
            id: "msg-1",
            sessionId,
            roundNumber: 1,
            role: "CHALLENGE_SUPPORT",
            content: "What contingency plan exists if the primary server fails?",
            createdAt: "2026-11-19T10:00:00Z",
          },
        ],
      };

      mockService.createOrGetSession.mockResolvedValueOnce(mockSession);

      const res = await request(app.getHttpServer())
        .post("/api/v1/challenge-support/sessions")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reasoningId })
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.data.id).toBe(sessionId);
      expect(res.body.data.currentRound).toBe(1);
      expect(res.body.data.isCompleted).toBe(false);
      expect(res.body.data.messages[0].content).toContain("contingency plan");
      // Assert no grading, scoring or evaluation
      expect(res.body.data.score).toBeUndefined();
      expect(res.body.data.grade).toBeUndefined();
      expect(res.body.data.passFail).toBeUndefined();
    });

    it("sends reply for Round 1, generates Round 2 question, and marks session is_completed", async () => {
      const mockSessionR2 = {
        id: sessionId,
        reasoningId,
        reviewSubmissionId: null,
        currentRound: 2,
        isCompleted: true,
        createdAt: "2026-11-19T10:00:00Z",
        updatedAt: "2026-11-19T10:05:00Z",
        messages: [
          {
            id: "msg-1",
            sessionId,
            roundNumber: 1,
            role: "CHALLENGE_SUPPORT",
            content: "What contingency plan exists if the primary server fails?",
            createdAt: "2026-11-19T10:00:00Z",
          },
          {
            id: "msg-2",
            sessionId,
            roundNumber: 1,
            role: "STUDENT",
            content: "We use a cold standby cluster with replicated storage.",
            createdAt: "2026-11-19T10:04:00Z",
          },
          {
            id: "msg-3",
            sessionId,
            roundNumber: 2,
            role: "CHALLENGE_SUPPORT",
            content: "How will you prevent split-brain during the cold-standby promotion?",
            createdAt: "2026-11-19T10:05:00Z",
          },
        ],
      };

      mockService.sendReply.mockResolvedValueOnce(mockSessionR2);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/challenge-support/sessions/${sessionId}/replies`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: "We use a cold standby cluster with replicated storage." })
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.data.currentRound).toBe(2);
      expect(res.body.data.isCompleted).toBe(true);
      expect(res.body.data.messages).toHaveLength(3);
    });

    it("rejects round 3 with 409 Conflict (MAX_ROUNDS_REACHED) when service throws ConflictException", async () => {
      mockService.sendReply.mockRejectedValueOnce(
        new ConflictException({
          statusCode: 409,
          error: "Conflict",
          code: "MAX_ROUNDS_REACHED",
          message: "Challenge support session has reached the maximum of 2 rounds",
        }),
      );

      const res = await request(app.getHttpServer())
        .post(`/api/v1/challenge-support/sessions/${sessionId}/replies`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: "Attempting third round" })
        .expect(409);

      expect(res.body.message).toContain("maximum of 2 rounds");
    });

    it("returns 502 Bad Gateway with AI_SERVICE_UNAVAILABLE when service throws BadGatewayException", async () => {
      mockService.sendReply.mockRejectedValueOnce(
        new BadGatewayException({
          statusCode: 502,
          error: "Bad Gateway",
          code: "AI_SERVICE_UNAVAILABLE",
          message: "AI Challenge Support service is temporarily unavailable. Please retry.",
        }),
      );

      const res = await request(app.getHttpServer())
        .post(`/api/v1/challenge-support/sessions/${sessionId}/replies`)
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ reply: "Valid reply under error test" })
        .expect(502);

      expect(res.body.message).toContain("temporarily unavailable");
    });

    it("retrieves session details via GET /api/v1/challenge-support/sessions/:id", async () => {
      const mockSession = {
        id: sessionId,
        reasoningId,
        reviewSubmissionId: null,
        currentRound: 1,
        isCompleted: false,
        messages: [],
      };
      mockService.getSession.mockResolvedValueOnce(mockSession);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/challenge-support/sessions/${sessionId}`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.data.id).toBe(sessionId);
    });

    it("completes session early via POST /api/v1/challenge-support/sessions/:id/complete", async () => {
      const mockSession = {
        id: sessionId,
        reasoningId,
        currentRound: 1,
        isCompleted: true,
        messages: [],
      };
      mockService.completeSession.mockResolvedValueOnce(mockSession);

      const res = await request(app.getHttpServer())
        .post(`/api/v1/challenge-support/sessions/${sessionId}/complete`)
        .set("Authorization", `Bearer ${studentToken}`)
        .expect(200);

      expect(res.body.status).toBe("SUCCESS");
      expect(res.body.data.isCompleted).toBe(true);
    });
  });
});
