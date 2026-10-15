import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../src/modules/auth/jwt-auth.guard';
import { JwtStrategy } from '../src/modules/auth/jwt.strategy';
import { AuthService } from '../src/modules/auth/auth.service';
import { CaseController } from '../src/modules/case/case.controller';
import { CaseService } from '../src/modules/case/case.service';
import { BranchingAttemptController } from '../src/modules/branching-attempt/branching-attempt.controller';
import { BranchingAttemptService } from '../src/modules/branching-attempt/branching-attempt.service';
import { HealthController } from '../src/common/health/health.controller';
import { DatabaseService } from '../src/common/database/database.service';

/**
 * Pre-Merge HTTP Security E2E Test Suite (Phase 3.6)
 *
 * Verifies over the HTTP pipeline with Supertest against live NestJS application:
 * 1. Missing Bearer token on protected endpoint -> 401 Unauthorized
 * 2. STUDENT sending ?role=LECTURER cannot escalate privileges -> 403 Forbidden
 * 3. STUDENT accessing non-PUBLISHED (DRAFT) case -> 403 Forbidden
 * 4. STUDENT calling lecturer-only endpoints (generate / update status) -> 403 Forbidden
 * 5. Lecturer B editing Lecturer A's case -> 403 Forbidden
 * 6. Student B reading or updating Student A's attempt -> 403 Forbidden
 * 7. /api/v1/health accessible without Bearer token -> 200 or 503 per health contract
 */
describe('HTTP Security & RBAC Enforcement (E2E with Supertest)', () => {
  let app: INestApplication;

  const TEST_JWT_SECRET = 'supertest-e2e-secret-key-32chars-minimum-len';

  function signJwt(payload: { sub: string; email?: string; role: 'STUDENT' | 'LECTURER'; exp?: number }): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      exp: now + 3600,
      email: payload.email || `${payload.sub}@university.edu.vn`,
      ...payload,
    };
    const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', TEST_JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    return `${header}.${body}.${signature}`;
  }

  const mockCaseService = {
    generateCase: jest.fn(),
    getCasesByCourse: jest.fn(),
    getCaseById: jest.fn(),
    updateCase: jest.fn(),
    updateCaseStatus: jest.fn(),
  };

  const mockAttemptService = {
    startAttempt: jest.fn(),
    getAttemptsByCase: jest.fn(),
    getAttempt: jest.fn(),
    chooseOption: jest.fn(),
    saveRetrospectiveReasoning: jest.fn(),
    submitReflection: jest.fn(),
  };

  const mockDbService = {
    query: jest.fn(),
    getClient: jest.fn(),
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
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
      ],
      controllers: [HealthController, CaseController, BranchingAttemptController],
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultVal?: any) => {
              if (key === 'JWT_SECRET') return TEST_JWT_SECRET;
              if (key === 'REDIS_HOST') return '127.0.0.1';
              if (key === 'REDIS_PORT') return 9999;
              return defaultVal;
            },
          },
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: CaseService, useValue: mockCaseService },
        { provide: BranchingAttemptService, useValue: mockAttemptService },
        { provide: DatabaseService, useValue: mockDbService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    const reflector = app.get(Reflector);
    app.useGlobalGuards(new JwtAuthGuard(reflector));

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

  // ─── 1. Missing Bearer Token ────────────────────────────────────────────────
  describe('1. Missing Bearer token protection', () => {
    it('should return 401 Unauthorized when accessing protected case route without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/cases/case-123')
        .expect(401);
    });

    it('should return 401 Unauthorized when accessing protected branching route without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/branching-attempts/attempt-456')
        .expect(401);
    });
  });

  // ─── 2. Role Spoofing Prevention (?role=LECTURER) ───────────────────────────
  describe('2. Role spoofing prevention (?role=LECTURER bypass)', () => {
    it('should reject student attempting to spoof lecturer role via query params on POST /cases/generate', async () => {
      const studentToken = signJwt({
        sub: 'student-attacker-1',
        email: 'attacker@student.edu.vn',
        role: 'STUDENT',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cases/generate?role=LECTURER')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: 'course-1', materialIds: ['mat-1'] })
        .expect(403);

      expect(res.body.message).toBe('Only lecturers can generate cases');
      expect(mockCaseService.generateCase).not.toHaveBeenCalled();
    });

    it('should reject student attempting to spoof lecturer role on status update', async () => {
      const studentToken = signJwt({
        sub: 'student-attacker-1',
        email: 'attacker@student.edu.vn',
        role: 'STUDENT',
      });

      await request(app.getHttpServer())
        .patch('/api/v1/cases/case-1/status?role=LECTURER')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'PUBLISHED' })
        .expect(403);

      expect(mockCaseService.updateCaseStatus).not.toHaveBeenCalled();
    });
  });

  // ─── 3. Student Accessing DRAFT Case ────────────────────────────────────────
  describe('3. Student access restriction to non-PUBLISHED cases', () => {
    it('should reject student accessing DRAFT case with 403 Forbidden', async () => {
      const studentToken = signJwt({
        sub: 'student-legit-1',
        role: 'STUDENT',
      });

      mockCaseService.getCaseById.mockRejectedValueOnce(
        new ForbiddenException('Students can only access PUBLISHED cases'),
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/cases/case-draft-999')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(res.body.message).toBe('Students can only access PUBLISHED cases');
      expect(mockCaseService.getCaseById).toHaveBeenCalledWith(
        'case-draft-999',
        'STUDENT',
        'student-legit-1',
      );
    });
  });

  // ─── 4. Student Calling Lecturer-Only Endpoints ─────────────────────────────
  describe('4. Student calling lecturer endpoints (generate / update status)', () => {
    it('should return 403 Forbidden when student calls POST /api/v1/cases/generate', async () => {
      const studentToken = signJwt({
        sub: 'student-normal-1',
        role: 'STUDENT',
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cases/generate')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ courseId: 'c1', materialIds: ['m1'] })
        .expect(403);

      expect(res.body.message).toBe('Only lecturers can generate cases');
    });

    it('should return 403 Forbidden when student calls PATCH /api/v1/cases/:id/status', async () => {
      const studentToken = signJwt({
        sub: 'student-normal-1',
        role: 'STUDENT',
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/cases/c1/status')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'PUBLISHED' })
        .expect(403);

      expect(res.body.message).toBe('Only lecturers can change case lifecycle status');
    });
  });

  // ─── 5. Cross-Lecturer Unauthorized Case Modification ───────────────────────
  describe('5. Cross-lecturer authorization boundary', () => {
    it('should reject Lecturer B attempting to edit Lecturer A\'s case with 403 Forbidden', async () => {
      const lecturerBToken = signJwt({
        sub: 'lecturer-intruder-b',
        role: 'LECTURER',
      });

      mockCaseService.updateCase.mockRejectedValueOnce(
        new ForbiddenException('You can only edit cases in your own courses'),
      );

      const res = await request(app.getHttpServer())
        .put('/api/v1/cases/case-of-lecturer-a')
        .set('Authorization', `Bearer ${lecturerBToken}`)
        .send({ title: 'Tampered Title' })
        .expect(403);

      expect(res.body.message).toBe('You can only edit cases in your own courses');
      expect(mockCaseService.updateCase).toHaveBeenCalledWith(
        'case-of-lecturer-a',
        'lecturer-intruder-b',
        { title: 'Tampered Title' },
      );
    });
  });

  // ─── 6. Cross-Student Attempt Boundary ──────────────────────────────────────
  describe('6. Cross-student attempt boundary', () => {
    it('should reject Student B reading Student A\'s attempt with 403 Forbidden', async () => {
      const studentBToken = signJwt({
        sub: 'student-b',
        role: 'STUDENT',
      });

      mockAttemptService.getAttempt.mockRejectedValueOnce(
        new ForbiddenException('You do not have permission to view this attempt'),
      );

      const res = await request(app.getHttpServer())
        .get('/api/v1/branching-attempts/attempt-of-student-a')
        .set('Authorization', `Bearer ${studentBToken}`)
        .expect(403);

      expect(res.body.message).toBe('You do not have permission to view this attempt');
      expect(mockAttemptService.getAttempt).toHaveBeenCalledWith(
        'attempt-of-student-a',
        'student-b',
      );
    });

    it('should reject Student B submitting a decision step on Student A\'s attempt with 403 Forbidden', async () => {
      const studentBToken = signJwt({
        sub: 'student-b',
        role: 'STUDENT',
      });

      mockAttemptService.chooseOption.mockRejectedValueOnce(
        new ForbiddenException('You do not have permission to modify this attempt'),
      );

      await request(app.getHttpServer())
        .post('/api/v1/branching-attempts/attempt-of-student-a/step')
        .set('Authorization', `Bearer ${studentBToken}`)
        .send({ nodeId: 'node-1', optionId: 'opt-1' })
        .expect(403);

      expect(mockAttemptService.chooseOption).toHaveBeenCalledWith(
        'attempt-of-student-a',
        'student-b',
        { nodeId: 'node-1', optionId: 'opt-1' },
      );
    });
  });

  // ─── 7. Public /health Endpoint Accessibility ───────────────────────────────
  describe('7. Public /health contract accessibility', () => {
    it('should allow access to /api/v1/health without Bearer token', async () => {
      mockDbService.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });

      const res = await request(app.getHttpServer())
        .get('/api/v1/health');

      // Health endpoint must NOT reject with 401 Unauthorized
      expect(res.status).not.toBe(401);
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('services');
      expect(res.body.services.database).toBe('UP');
    });
  });
});
