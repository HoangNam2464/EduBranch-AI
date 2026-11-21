import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, INestApplication, UnauthorizedException, ValidationPipe } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "../src/modules/auth/guards/roles.guard";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { AuthService } from "../src/modules/auth/auth.service";
import { DatabaseService } from "../src/common/database/database.service";
import { UserController } from "../src/modules/user/user.controller";
import { UserService } from "../src/modules/user/user.service";
import { AdminController } from "../src/modules/admin/admin.controller";
import { AdminService } from "../src/modules/admin/admin.service";
import { LecturerDashboardController } from "../src/modules/course/lecturer-dashboard.controller";
import { LecturerDashboardService } from "../src/modules/course/lecturer-dashboard.service";
import { EvaluationController } from "../src/modules/evaluation/evaluation.controller";
import { EvaluationService } from "../src/modules/evaluation/evaluation.service";

/**
 * Spec 007 HTTP layer: role matrix (401/403), validation (400) and error mapping
 * for every new route (BE-030, BE-031, BE-032, BE-033). Services are mocked; SQL
 * behaviour is covered by mvp-completion.integration.e2e-spec.ts on a real database.
 */
describe("Spec 007 MVP completion API — HTTP layer", () => {
  let app: INestApplication;
  const SECRET = "spec007-supertest-jwt-secret-at-least-32-chars";

  function token(sub: string, role: "STUDENT" | "LECTURER" | "ADMIN") {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({ sub, role, email: `${sub}@uni.edu.vn`, exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url");
    const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
    return `Bearer ${header}.${body}.${sig}`;
  }

  const student = token("student-1", "STUDENT");
  const lecturer = token("lecturer-1", "LECTURER");
  const admin = token("admin-1", "ADMIN");
  const uuid = "11111111-1111-4111-8111-111111111111";

  const userService = { getProfile: jest.fn(), updateProfile: jest.fn() };
  const adminService = {
    getOverview: jest.fn(),
    listUsers: jest.fn(),
    setUserStatus: jest.fn(),
    setUserRole: jest.fn(),
    listCourses: jest.fn(),
    listCases: jest.fn(),
    getAiService: jest.fn(),
    listLogs: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  };
  const dashboardService = { getDashboard: jest.fn() };
  const evaluationService = {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    exportCsv: jest.fn(),
  };
  const authService = {
    validateToken: jest.fn(async (p: any) => {
      if (!p?.sub) throw new UnauthorizedException();
      return { id: p.sub, email: p.email, role: p.role };
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: "jwt" })],
      controllers: [UserController, AdminController, LecturerDashboardController, EvaluationController],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: (k: string, d?: any) => (k === "JWT_SECRET" ? SECRET : d) } },
        { provide: AuthService, useValue: authService },
        { provide: UserService, useValue: userService },
        { provide: AdminService, useValue: adminService },
        { provide: LecturerDashboardService, useValue: dashboardService },
        { provide: EvaluationService, useValue: evaluationService },
        { provide: DatabaseService, useValue: { query: jest.fn() } },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));
    await app.init();

    for (const svc of [userService, adminService, dashboardService, evaluationService]) {
      for (const fn of Object.values(svc)) (fn as jest.Mock).mockResolvedValue({});
    }
    evaluationService.exportCsv.mockResolvedValue("﻿a,b\r\n");
  });

  afterAll(async () => {
    await app?.close();
  });

  type Route = { method: "get" | "patch" | "put" | "post" | "delete"; path: string; body?: object };
  const call = (r: Route, auth?: string) => {
    const req = request(app.getHttpServer())[r.method](`/api/v1${r.path}`);
    if (auth) req.set("Authorization", auth);
    return r.body ? req.send(r.body) : req;
  };

  // ---------------------------------------------------------------------------
  // Role matrix (AC-A1, AC-D6, AC-R3, AC-P5)
  // ---------------------------------------------------------------------------
  const adminRoutes: Route[] = [
    { method: "get", path: "/admin/overview" },
    { method: "get", path: "/admin/users" },
    { method: "patch", path: `/admin/users/${uuid}/status`, body: { status: "LOCKED" } },
    { method: "patch", path: `/admin/users/${uuid}/role`, body: { role: "LECTURER" } },
    { method: "get", path: "/admin/courses" },
    { method: "get", path: "/admin/cases" },
    { method: "get", path: "/admin/ai-service" },
    { method: "get", path: "/admin/logs" },
    { method: "get", path: "/admin/settings" },
    { method: "put", path: "/admin/settings", body: { platformName: "EduBranch AI" } },
  ];
  const evaluationRoutes: Route[] = [
    { method: "get", path: "/evaluation/rubrics" },
    { method: "get", path: `/evaluation/rubrics/${uuid}` },
    {
      method: "post",
      path: "/evaluation/rubrics",
      body: { caseId: uuid, realismScore: 4, difficultyScore: 3, alignmentScore: 5 },
    },
    { method: "put", path: `/evaluation/rubrics/${uuid}`, body: { realismScore: 2 } },
    { method: "delete", path: `/evaluation/rubrics/${uuid}` },
    { method: "get", path: "/evaluation/export?dataset=activity" },
  ];
  const dashboardRoute: Route = { method: "get", path: "/lecturer/dashboard" };

  describe.each(adminRoutes)("ADMIN only: $method $path", (r) => {
    it("401 without token", () => call(r).expect(401));
    it("403 for STUDENT", () => call(r, student).expect(403));
    it("403 for LECTURER", () => call(r, lecturer).expect(403));
    it("200 for ADMIN", () => call(r, admin).expect(200));
  });

  describe.each(evaluationRoutes)("LECTURER/ADMIN: $method $path", (r) => {
    it("401 without token", () => call(r).expect(401));
    it("403 for STUDENT", () => call(r, student).expect(403));
    const okStatus = r.method === "post" ? 201 : 200;
    it(`${okStatus} for LECTURER`, () => call(r, lecturer).expect(okStatus));
    it(`${okStatus} for ADMIN`, () => call(r, admin).expect(okStatus));
  });

  describe("LECTURER only: GET /lecturer/dashboard", () => {
    it("401 without token", () => call(dashboardRoute).expect(401));
    it("403 for STUDENT", () => call(dashboardRoute, student).expect(403));
    it("403 for ADMIN", () => call(dashboardRoute, admin).expect(403));
    it("200 for LECTURER, scoped to the caller", async () => {
      await call(dashboardRoute, lecturer).expect(200);
      expect(dashboardService.getDashboard).toHaveBeenLastCalledWith("lecturer-1", undefined);
    });
    it("400 for a malformed courseId", () => call({ method: "get", path: "/lecturer/dashboard?courseId=abc" }, lecturer).expect(400));
  });

  // ---------------------------------------------------------------------------
  // BE-031 profile (AC-P2..P5)
  // ---------------------------------------------------------------------------
  describe("PATCH /users/me", () => {
    const patch = (body: object, auth = student) =>
      request(app.getHttpServer()).patch("/api/v1/users/me").set("Authorization", auth).send(body);

    it("401 without token", () => request(app.getHttpServer()).patch("/api/v1/users/me").send({ fullName: "Ab" }).expect(401));

    it.each(["STUDENT", "LECTURER", "ADMIN"] as const)("200 for %s, always the token owner", async (role) => {
      await patch({ fullName: "Nguyen B", language: "en" }, token(`${role}-x`, role)).expect(200);
      expect(userService.updateProfile).toHaveBeenLastCalledWith(`${role}-x`, { fullName: "Nguyen B", language: "en" });
    });

    it.each([
      [{ email: "x@y.vn" }],
      [{ role: "ADMIN" }],
      [{ password: "NewPass123" }],
      [{ id: uuid, fullName: "Other User" }],
      [{ isActive: false }],
      [{ fullName: "A" }],
      [{ fullName: "x".repeat(101) }],
      [{ language: "fr" }],
      [{ fullName: 123 }],
      [{ fullName: null }],
      [{ language: null }],
    ])("400 for %j", (body) => patch(body).expect(400));

    it("trims the full name before validation", async () => {
      await patch({ fullName: "   Le C   " }).expect(200);
      expect(userService.updateProfile).toHaveBeenLastCalledWith("student-1", { fullName: "Le C" });
    });
  });

  // ---------------------------------------------------------------------------
  // BE-032 validation and error mapping
  // ---------------------------------------------------------------------------
  describe("admin validation", () => {
    it.each([
      `/admin/users?size=0`,
      `/admin/users?size=101`,
      `/admin/users?page=0`,
      `/admin/users?role=ROOT`,
      `/admin/users?status=DELETED`,
      `/admin/courses?status=GONE`,
      `/admin/cases?courseId=nope`,
      `/admin/cases?learningMode=QUIZ`,
      `/admin/logs?timeRange=year`,
      `/admin/logs?eventType=DROP_TABLE`,
    ])("400 for GET %s", (path) => call({ method: "get", path }, admin).expect(400));

    it("400 for a malformed user id", () =>
      call({ method: "patch", path: "/admin/users/abc/status", body: { status: "LOCKED" } }, admin).expect(400));
    it("400 for an unknown status", () =>
      call({ method: "patch", path: `/admin/users/${uuid}/status`, body: { status: "BANNED" } }, admin).expect(400));
    it("400 for an unknown role", () =>
      call({ method: "patch", path: `/admin/users/${uuid}/role`, body: { role: "ROOT" } }, admin).expect(400));
    it("400 for an extra field on status", () =>
      call({ method: "patch", path: `/admin/users/${uuid}/status`, body: { status: "LOCKED", role: "ADMIN" } }, admin).expect(400));

    it.each([
      [{ platformName: "" }],
      [{ platformName: "x".repeat(121) }],
      [{ supportEmail: "not-an-email" }],
      [{ loginNotice: "x".repeat(501) }],
      [{ maxFileSize: "1GB" }],
      [{ platformName: null }],
      [{ supportEmail: null }],
      [{ aiPolicyNote: null }],
    ])("400 for PUT /admin/settings %j", (body) => call({ method: "put", path: "/admin/settings", body }, admin).expect(400));

    it("accepts an empty support e-mail (clears it)", () =>
      call({ method: "put", path: "/admin/settings", body: { supportEmail: "" } }, admin).expect(200));

    it("passes the caller as actor and maps a 409 from the service", async () => {
      adminService.setUserStatus.mockRejectedValueOnce(
        new ConflictException({ message: "x", code: "CANNOT_LOCK_SELF" }),
      );
      const res = await call({ method: "patch", path: `/admin/users/${uuid}/status`, body: { status: "LOCKED" } }, admin);
      expect(res.status).toBe(409);
      expect(adminService.setUserStatus).toHaveBeenLastCalledWith("admin-1", uuid, "LOCKED");
    });
  });

  // ---------------------------------------------------------------------------
  // BE-033 validation and CSV response
  // ---------------------------------------------------------------------------
  describe("evaluation validation", () => {
    const post = (body: object) => call({ method: "post", path: "/evaluation/rubrics", body }, lecturer);
    const ok = { caseId: uuid, realismScore: 4, difficultyScore: 3, alignmentScore: 5 };

    it.each([
      [{ ...ok, realismScore: 0 }],
      [{ ...ok, difficultyScore: 6 }],
      [{ ...ok, alignmentScore: 3.5 }],
      [{ ...ok, caseId: "nope" }],
      [{ ...ok, notes: "x".repeat(2001) }],
      [{ ...ok, studentId: uuid }],
      [{ ...ok, criteria: [{ name: "Other", score: 5 }] }],
      [{ caseId: uuid, realismScore: 4 }],
    ])("400 for POST %j", (body) => post(body).expect(400));

    it.each([[{ realismScore: null }], [{ notes: null }], [{ alignmentScore: "5" }]])(
      "400 for PUT rubric %j",
      (body) => call({ method: "put", path: `/evaluation/rubrics/${uuid}`, body }, lecturer).expect(400),
    );

    it.each(["/evaluation/export", "/evaluation/export?dataset=students", "/evaluation/export?dataset=activity&caseId=x"])(
      "400 for GET %s",
      (path) => call({ method: "get", path }, admin).expect(400),
    );

    it("returns CSV as an attachment", async () => {
      const res = await call({ method: "get", path: "/evaluation/export?dataset=rubrics" }, admin).expect(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toMatch(/^attachment; filename="edubranch-rubrics-\d{8}\.csv"$/);
      expect(res.headers["cache-control"]).toBe("no-store");
      expect(evaluationService.exportCsv).toHaveBeenLastCalledWith(
        { id: "admin-1", email: "admin-1@uni.edu.vn", role: "ADMIN" },
        { dataset: "rubrics" },
      );
    });
  });
});
