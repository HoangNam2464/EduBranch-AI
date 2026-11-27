import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { DatabaseService } from "../src/common/database/database.service";
import { CaseController } from "../src/modules/case/case.controller";
import { CaseService } from "../src/modules/case/case.service";
import { CourseController } from "../src/modules/course/course.controller";
import { CourseService } from "../src/modules/course/course.service";
import { BranchingAttemptController } from "../src/modules/branching-attempt/branching-attempt.controller";
import { BranchingAttemptService } from "../src/modules/branching-attempt/branching-attempt.service";

describe("Case Access Hardening — HTTP Pipes & DTO Validation (D, F, J)", () => {
  let app: INestApplication;
  const SECRET = "case-access-http-jwt-secret-key-at-least-32-chars";

  function token(sub: string, role: "STUDENT" | "LECTURER" | "ADMIN") {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({ sub, role, email: `${sub}@uni.edu.vn`, exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url");
    const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    return `Bearer ${header}.${body}.${sig}`;
  }

  const studentToken = token("student-1", "STUDENT");
  const lecturerToken = token("lecturer-1", "LECTURER");
  const uuid1 = "11111111-1111-4111-8111-111111111111";
  const uuid2 = "22222222-2222-4222-8222-222222222222";

  const mockCaseService = {
    generateCase: jest.fn(),
    getCasesByCourse: jest.fn(),
    getCaseById: jest.fn(),
    updateCase: jest.fn(),
    updateCaseNode: jest.fn(),
    updateCaseStatus: jest.fn(),
  };

  const mockCourseService = {
    createCourse: jest.fn(),
    getCoursesByLecturer: jest.fn(),
    getCourseById: jest.fn(),
    getCourseForViewer: jest.fn(),
    updateCourse: jest.fn(),
    archiveCourse: jest.fn(),
    enrollStudentByInviteCode: jest.fn(),
    getInviteCode: jest.fn(),
    rotateInviteCode: jest.fn(),
    disableInviteCode: jest.fn(),
  };

  const mockAttemptService = {
    startAttempt: jest.fn(),
    getAttemptsByCase: jest.fn(),
    getAttempt: jest.fn(),
    chooseOption: jest.fn(),
    saveRetrospectiveReasoning: jest.fn(),
    submitReflection: jest.fn(),
  };

  const mockAuthService = {
    validateToken: jest.fn(async (p: any) => {
      if (!p?.sub) throw new UnauthorizedException();
      return { id: p.sub, email: p.email, role: p.role };
    }),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [CaseController, CourseController, BranchingAttemptController],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => (k === "JWT_SECRET" ? SECRET : d) } },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CaseService, useValue: mockCaseService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: BranchingAttemptService, useValue: mockAttemptService },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
    await app.init();

    for (const svc of [mockCaseService, mockCourseService, mockAttemptService]) {
      for (const fn of Object.values(svc)) (fn as jest.Mock).mockResolvedValue({});
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("D: Malformed UUID route params -> 400", () => {
    it.each([
      ["get", "/api/v1/courses/not-a-uuid/cases", lecturerToken, undefined],
      ["get", "/api/v1/cases/not-a-uuid", studentToken, undefined],
      ["put", "/api/v1/cases/not-a-uuid", lecturerToken, { title: "Valid" }],
      ["put", `/api/v1/cases/not-a-uuid/nodes/${uuid1}`, lecturerToken, { situation: "S", options: [] }],
      ["put", `/api/v1/cases/${uuid1}/nodes/not-a-uuid`, lecturerToken, { situation: "S", options: [] }],
      ["patch", "/api/v1/cases/not-a-uuid/status", lecturerToken, { status: "REVIEWED" }],
      ["get", "/api/v1/courses/not-a-uuid", studentToken, undefined],
      ["put", "/api/v1/courses/not-a-uuid", lecturerToken, { name: "Updated" }],
      ["patch", "/api/v1/courses/not-a-uuid/archive", lecturerToken, undefined],
      ["get", "/api/v1/courses/not-a-uuid/invite-code", lecturerToken, undefined],
      ["post", "/api/v1/courses/not-a-uuid/invite-code", lecturerToken, undefined],
      ["delete", "/api/v1/courses/not-a-uuid/invite-code", lecturerToken, undefined],
      ["post", "/api/v1/cases/not-a-uuid/branching-attempts", studentToken, undefined],
      ["get", "/api/v1/cases/not-a-uuid/attempts", studentToken, undefined],
      ["get", "/api/v1/branching-attempts/not-a-uuid", studentToken, undefined],
      ["post", "/api/v1/branching-attempts/not-a-uuid/step", studentToken, { nodeId: uuid1, selectedOptionId: uuid2 }],
      ["put", "/api/v1/branching-attempts/not-a-uuid/reasoning", studentToken, { nodeId: uuid1, reasoningText: "ok" }],
      ["post", "/api/v1/branching-attempts/not-a-uuid/reflection", studentToken, { reflectionText: "ok" }],
    ] as const)("%s %s returns 400 for malformed UUID", async (method, path, auth, body) => {
      const req = request(app.getHttpServer())[method](path).set("Authorization", auth);
      if (body) req.send(body);
      await req.expect(400);
    });
  });

  describe("F: UpdateCaseStatusDto validation", () => {
    it("rejects invalid status and extra properties with 400, accepts valid status", async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/cases/${uuid1}/status`)
        .set("Authorization", lecturerToken)
        .send({ status: "ARCHIVED" })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/api/v1/cases/${uuid1}/status`)
        .set("Authorization", lecturerToken)
        .send({ status: "REVIEWED", extraField: true })
        .expect(400);

      await request(app.getHttpServer())
        .patch(`/api/v1/cases/${uuid1}/status`)
        .set("Authorization", lecturerToken)
        .send({ status: "REVIEWED" })
        .expect(200);
    });
  });

  describe("J: BranchingAttempt DTO validation", () => {
    it("rejects bad nodeId, bad selectedOptionId, unknown extra fields, and non-string text with 400", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/step`)
        .set("Authorization", studentToken)
        .send({ nodeId: "bad-node", selectedOptionId: uuid2 })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/step`)
        .set("Authorization", studentToken)
        .send({ nodeId: uuid1, selectedOptionId: uuid2, extraField: "x" })
        .expect(400);

      await request(app.getHttpServer())
        .put(`/api/v1/branching-attempts/${uuid1}/reasoning`)
        .set("Authorization", studentToken)
        .send({ nodeId: uuid1, reasoningText: 12345 })
        .expect(400);

      await request(app.getHttpServer())
        .put(`/api/v1/branching-attempts/${uuid1}/reasoning`)
        .set("Authorization", studentToken)
        .send({ nodeId: "not-uuid", reasoningText: "valid" })
        .expect(400);

      await request(app.getHttpServer())
        .put(`/api/v1/branching-attempts/${uuid1}/reasoning`)
        .set("Authorization", studentToken)
        .send({ nodeId: uuid1, reasoningText: "ok", extra: 1 })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/reflection`)
        .set("Authorization", studentToken)
        .send({ reflectionText: 999 })
        .expect(400);

      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/reflection`)
        .set("Authorization", studentToken)
        .send({ reflectionText: "ok", extra: 1 })
        .expect(400);
    });

    it("accepts valid minimal payloads with no artificial length bounds", async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/step`)
        .set("Authorization", studentToken)
        .send({ nodeId: uuid1, selectedOptionId: uuid2 })
        .expect(201);

      await request(app.getHttpServer())
        .put(`/api/v1/branching-attempts/${uuid1}/reasoning`)
        .set("Authorization", studentToken)
        .send({ nodeId: uuid1, reasoningText: "x" })
        .expect(200);

      await request(app.getHttpServer())
        .post(`/api/v1/branching-attempts/${uuid1}/reflection`)
        .set("Authorization", studentToken)
        .send({ reflectionText: "x" })
        .expect(201);
    });
  });
});
