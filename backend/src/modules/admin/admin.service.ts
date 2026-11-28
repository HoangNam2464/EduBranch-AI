import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { DatabaseService } from "../../common/database/database.service";
import { AuditService } from "../../common/audit/audit.service";
import { AiHealthService } from "./ai-health.service";
import { MAX_SIZE_BYTES } from "../material/material.service";
import {
  APP_TIME_ZONE,
  describeEventMeta,
  eventCode,
  generationStatus,
  likePattern,
  matchingAuditEventTypes,
  matchingLoginFailureReasons,
  pageParams,
  percentages,
  toInt,
  toneOf,
} from "./admin-format";
import type {
  AdminCasesQueryDto,
  AdminCoursesQueryDto,
  AdminLogsQueryDto,
  AdminUsersQueryDto,
  UpdateSettingsDto,
} from "./dto/admin-query.dto";

/** Start of "today" and "this month" in the app time zone, as SQL fragments. */
const TODAY = `(date_trunc('day', NOW() AT TIME ZONE '${APP_TIME_ZONE}') AT TIME ZONE '${APP_TIME_ZONE}')`;
const MONTH = `(date_trunc('month', NOW() AT TIME ZONE '${APP_TIME_ZONE}') AT TIME ZONE '${APP_TIME_ZONE}')`;

const SETTINGS_DEFAULTS = {
  platformName: "EduBranch AI",
  operatorUnit: "",
  loginNotice: "",
  supportEmail: "",
  aiPolicyNote: "",
} as const;
type SettingKey = keyof typeof SETTINGS_DEFAULTS;
const SETTING_KEYS = Object.keys(SETTINGS_DEFAULTS) as SettingKey[];

/** 409 with the standard Nest error fields plus a stable code for the FE. */
function conflict(message: string, code: string) {
  return new ConflictException({ statusCode: 409, error: "Conflict", message, code });
}

function readPackageVersion(): string | null {
  try {
    const raw = fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf8");
    const version = JSON.parse(raw).version;
    return typeof version === "string" ? version : null;
  } catch {
    return null;
  }
}

/**
 * Admin read models and account actions (BE-032, spec 007 US3).
 * Never reads reasoning, submissions, reflections or Challenge Support messages (AC-A12).
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);
  private readonly version = readPackageVersion();

  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly aiHealth: AiHealthService,
  ) {}

  // ---------------------------------------------------------------------------
  // 10.2 Overview
  // ---------------------------------------------------------------------------
  async getOverview() {
    const [users, courses, cases, events, materials, weekly, byCourse, recent, ai] = await Promise.all([
      this.db.query(
        `SELECT COUNT(*)                                             AS total,
                COUNT(*) FILTER (WHERE created_at >= ${MONTH})        AS growth,
                COUNT(*) FILTER (WHERE role = 'STUDENT')             AS students,
                COUNT(*) FILTER (WHERE role = 'LECTURER')            AS lecturers,
                COUNT(*) FILTER (WHERE role = 'ADMIN')               AS admins,
                COUNT(*) FILTER (WHERE is_active = FALSE)            AS locked
           FROM users`,
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER (WHERE is_active = TRUE)                          AS open,
                COUNT(*) FILTER (WHERE is_active = TRUE AND created_at >= ${MONTH}) AS growth
           FROM courses`,
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'PUBLISHED')                          AS published,
                COUNT(*) FILTER (WHERE status = 'PUBLISHED' AND created_at >= ${MONTH}) AS growth
           FROM cases`,
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER (WHERE event_type = 'CASE_GENERATED'
                                   AND created_at >= NOW() - INTERVAL '30 days')        AS generations,
                COUNT(*) FILTER (WHERE event_type = 'CASE_GENERATION_FAILED'
                                   AND created_at >= NOW() - INTERVAL '30 days')        AS generation_failures,
                COUNT(*) FILTER (WHERE event_type = 'LOGIN_FAILED'
                                   AND created_at >= NOW() - INTERVAL '24 hours')       AS login_failures
           FROM audit_events`,
      ),
      this.db.query(
        `SELECT COUNT(*) FILTER (WHERE processing_status = 'FAILED')     AS failed,
                COUNT(*) FILTER (WHERE processing_status = 'PROCESSING') AS processing
           FROM teaching_materials`,
      ),
      this.db.query(
        `WITH weeks AS (
           SELECT generate_series(
                    date_trunc('week', NOW() AT TIME ZONE '${APP_TIME_ZONE}') - INTERVAL '7 weeks',
                    date_trunc('week', NOW() AT TIME ZONE '${APP_TIME_ZONE}'),
                    INTERVAL '1 week') AS week_start
         )
         SELECT to_char(w.week_start, 'YYYY-MM-DD') AS week_start,
                (SELECT COUNT(*) FROM users u
                  WHERE (u.created_at AT TIME ZONE '${APP_TIME_ZONE}') >= w.week_start
                    AND (u.created_at AT TIME ZONE '${APP_TIME_ZONE}') <  w.week_start + INTERVAL '1 week') AS count
           FROM weeks w
          ORDER BY w.week_start`,
      ),
      this.db.query(
        `SELECT co.course_code, co.name,
                COUNT(ca.id) FILTER (WHERE ca.status = 'PUBLISHED') AS published,
                COUNT(ca.id) FILTER (WHERE ca.status = 'DRAFT')     AS draft,
                COUNT(ca.id)                                        AS total
           FROM courses co
           JOIN cases ca ON ca.course_id = co.id
          GROUP BY co.id, co.course_code, co.name
          ORDER BY COUNT(ca.id) DESC, co.name
          LIMIT 8`,
      ),
      this.recentEvents(5),
      this.aiHealth.check(),
    ]);

    const u = users.rows[0];
    const students = toInt(u.students);
    const lecturers = toInt(u.lecturers);
    const admins = toInt(u.admins);
    const ev = events.rows[0];
    const mat = materials.rows[0];

    const alerts = [
      { id: "indexing_failure", type: "indexing_failure", message: "indexing_failure", count: toInt(mat.failed) },
      { id: "login_failure", type: "login_failure", message: "login_failure", count: toInt(ev.login_failures) },
      { id: "locked_account", type: "locked_account", message: "locked_account", count: toInt(u.locked) },
    ].filter((a) => a.count > 0);

    return {
      attentionAlerts: alerts,
      totalUsers: toInt(u.total),
      userGrowthThisMonth: toInt(u.growth),
      openCourses: toInt(courses.rows[0].open),
      courseGrowthThisMonth: toInt(courses.rows[0].growth),
      publishedCases: toInt(cases.rows[0].published),
      caseGrowthThisMonth: toInt(cases.rows[0].growth),
      aiCaseGenerations: toInt(ev.generations),
      aiCaseFailures: toInt(ev.generation_failures),
      studentsCount: students,
      lecturersCount: lecturers,
      adminsCount: admins,
      ...percentages(students, lecturers, admins),
      weeklySignups: weekly.rows.map((r) => ({ weekStart: r.week_start, count: toInt(r.count) })),
      casesByCourse: byCourse.rows.map((r) => ({
        courseCode: r.course_code ?? "",
        courseName: r.name,
        publishedCount: toInt(r.published),
        draftCount: toInt(r.draft),
        totalCount: toInt(r.total),
      })),
      recentLogs: recent.map((e) => ({
        id: e.id,
        description: e.eventTitle,
        meta: [e.actorName, e.eventMeta].filter(Boolean).join(" · "),
        tone: toneOf(e.status),
        occurredAt: e.timestamp,
      })),
      // snake_case: the merged FE mapper (toAdminOverview) reads only this key.
      system_health: {
        app_server: "UP",
        database: "UP",
        ai_service: ai.status,
        indexing: toInt(mat.failed) > 0 ? "DOWN" : "UP",
        indexing_processing_count: toInt(mat.processing),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // 10.3 / 10.4 Users
  // ---------------------------------------------------------------------------
  async listUsers(q: AdminUsersQueryDto) {
    const { page, size, offset } = pageParams(q.page, q.size);
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.search) {
      params.push(likePattern(q.search));
      where.push(`(u.full_name ILIKE $${params.length} ESCAPE '\\' OR u.email ILIKE $${params.length} ESCAPE '\\')`);
    }
    if (q.role) {
      params.push(q.role);
      where.push(`u.role = $${params.length}`);
    }
    if (q.status) where.push(q.status === "ACTIVE" ? "u.is_active = TRUE" : "u.is_active = FALSE");
    params.push(size, offset);

    const [rows, metrics] = await Promise.all([
      this.db.query(
        `SELECT u.id, u.full_name, u.email, u.role, u.is_active, u.created_at,
                CASE u.role
                  WHEN 'LECTURER' THEN (SELECT COUNT(*) FROM courses c WHERE c.lecturer_id = u.id)
                  WHEN 'STUDENT'  THEN (SELECT COUNT(*) FROM course_enrollments ce WHERE ce.student_id = u.id)
                  ELSE 0
                END AS courses_count,
                (SELECT COUNT(*) FROM branching_attempts ba WHERE ba.student_id = u.id) AS attempt_count,
                COUNT(*) OVER () AS total
           FROM users u
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY u.created_at DESC, u.id
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE role = 'LECTURER') AS lecturers,
                COUNT(*) FILTER (WHERE role = 'STUDENT')  AS students,
                COUNT(*) FILTER (WHERE is_active = FALSE) AS locked
           FROM users`,
      ),
    ]);

    const m = metrics.rows[0];
    return {
      users: rows.rows.map((r) => ({
        id: r.id,
        name: r.full_name,
        email: r.email,
        role: r.role,
        status: r.is_active ? "ACTIVE" : "LOCKED",
        createdAt: r.created_at,
        coursesInfo: String(toInt(r.courses_count)),
        attemptCount: toInt(r.attempt_count),
      })),
      metrics: {
        totalUsers: toInt(m.total),
        lecturers: toInt(m.lecturers),
        students: toInt(m.students),
        lockedUsers: toInt(m.locked),
      },
      total: await this.pageTotal(
        rows.rows,
        `FROM users u ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
        params.slice(0, -2),
      ),
      page,
      size,
    };
  }

  /**
   * Total for a paged list: read from `COUNT(*) OVER ()` on the page, or, when the page is
   * past the end (no rows), from a separate count over the same FROM/WHERE (QG2 M3).
   */
  private async pageTotal(rows: { total?: unknown }[], fromWhere: string, params: unknown[]) {
    if (rows.length) return toInt(rows[0].total);
    const res = await this.db.query(`SELECT COUNT(*) AS total ${fromWhere}`, params);
    return toInt(res.rows[0].total);
  }

  /** AC-A4: lock / unlock; never the caller, never the last active admin. */
  async setUserStatus(actorId: string, targetId: string, status: "ACTIVE" | "LOCKED") {
    if (actorId === targetId) {
      throw conflict("You cannot lock or unlock your own account", "CANNOT_LOCK_SELF");
    }
    const active = status === "ACTIVE";
    const target = await this.inUserTransaction(targetId, async (client, user) => {
      if (user.is_active === active) return { user, changed: false };
      if (!active && user.role === "ADMIN") await this.assertAnotherActiveAdmin(client, targetId);
      await client.query("UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1", [targetId, active]);
      return { user, changed: true };
    });

    if (target.changed) {
      await this.audit.record({
        type: active ? "USER_UNLOCKED" : "USER_LOCKED",
        outcome: "SUCCESS",
        actorId,
        targetId,
        meta: { targetName: target.user.full_name },
      });
    }
    return { id: targetId, status };
  }

  /** AC-A13 (PO 2026-11-21): change role; never the caller's own, never demote the last active admin. */
  async setUserRole(actorId: string, targetId: string, role: "STUDENT" | "LECTURER" | "ADMIN") {
    if (actorId === targetId) {
      throw conflict("You cannot change your own role", "CANNOT_CHANGE_OWN_ROLE");
    }
    const target = await this.inUserTransaction(targetId, async (client, user) => {
      if (user.role === role) return { user, changed: false };
      if (user.role === "ADMIN" && user.is_active) await this.assertAnotherActiveAdmin(client, targetId);
      await client.query("UPDATE users SET role = $2, updated_at = NOW() WHERE id = $1", [targetId, role]);
      return { user, changed: true };
    });

    if (target.changed) {
      await this.audit.record({
        type: "USER_ROLE_CHANGED",
        outcome: "SUCCESS",
        actorId,
        targetId,
        meta: { targetName: target.user.full_name, from: target.user.role, to: role },
      });
    }
    return { id: targetId, role };
  }

  private async inUserTransaction<T>(
    targetId: string,
    fn: (client: any, user: { id: string; role: string; is_active: boolean; full_name: string }) => Promise<T>,
  ): Promise<T> {
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");
      // Lock every active admin row in id order first, then the target: two admins
      // acting on each other at the same time serialise instead of deadlocking.
      await client.query("SELECT id FROM users WHERE role = 'ADMIN' AND is_active = TRUE ORDER BY id FOR UPDATE");
      const res = await client.query(
        "SELECT id, role, is_active, full_name FROM users WHERE id = $1 FOR UPDATE",
        [targetId],
      );
      if (res.rows.length === 0) throw new NotFoundException("User not found");
      const out = await fn(client, res.rows[0]);
      await client.query("COMMIT");
      return out;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  private async assertAnotherActiveAdmin(client: any, exceptId: string) {
    // Admin rows are already locked by inUserTransaction.
    const res = await client.query(
      "SELECT id FROM users WHERE role = 'ADMIN' AND is_active = TRUE AND id <> $1",
      [exceptId],
    );
    if (res.rows.length === 0) {
      throw conflict("At least one active admin must remain", "LAST_ACTIVE_ADMIN");
    }
  }

  // ---------------------------------------------------------------------------
  // 10.5 Courses (read-only)
  // ---------------------------------------------------------------------------
  async listCourses(q: AdminCoursesQueryDto) {
    const { page, size, offset } = pageParams(q.page, q.size);
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.search) {
      params.push(likePattern(q.search));
      const n = params.length;
      where.push(
        `(co.name ILIKE $${n} ESCAPE '\\' OR co.course_code ILIKE $${n} ESCAPE '\\' OR u.full_name ILIKE $${n} ESCAPE '\\')`,
      );
    }
    if (q.status) where.push(q.status === "ACTIVE" ? "co.is_active = TRUE" : "co.is_active = FALSE");
    params.push(size, offset);

    const res = await this.db.query(
      `SELECT co.id, co.name, co.course_code, co.description, co.is_active, co.created_at,
              u.full_name AS lecturer_name,
              (SELECT COUNT(*) FROM teaching_materials m WHERE m.course_id = co.id)                                    AS materials_count,
              (SELECT COUNT(*) FROM teaching_materials m WHERE m.course_id = co.id AND m.processing_status = 'COMPLETED') AS materials_ready,
              (SELECT COUNT(*) FROM teaching_materials m WHERE m.course_id = co.id AND m.processing_status = 'FAILED')    AS materials_failed,
              (SELECT COUNT(*) FROM cases ca WHERE ca.course_id = co.id)                                                AS cases_count,
              (SELECT COUNT(*) FROM branching_attempts ba JOIN cases ca ON ca.id = ba.case_id WHERE ca.course_id = co.id) AS attempts_count,
              COUNT(*) OVER () AS total
         FROM courses co
         JOIN users u ON u.id = co.lecturer_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY co.created_at DESC, co.id
        LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      courses: res.rows.map((r) => ({
        id: r.id,
        name: r.name,
        courseCode: r.course_code ?? "",
        lecturerName: r.lecturer_name,
        status: r.is_active ? "ACTIVE" : "ARCHIVED",
        materialsCount: toInt(r.materials_count),
        materialsReady: toInt(r.materials_ready),
        errorCount: toInt(r.materials_failed),
        casesCount: toInt(r.cases_count),
        attemptsCount: toInt(r.attempts_count),
        description: r.description ?? "",
        createdAt: r.created_at,
      })),
      total: await this.pageTotal(
        res.rows,
        `FROM courses co JOIN users u ON u.id = co.lecturer_id ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
        params.slice(0, -2),
      ),
      page,
      size,
    };
  }

  // ---------------------------------------------------------------------------
  // 10.6 Cases (read-only, no node/option content)
  // ---------------------------------------------------------------------------
  async listCases(q: AdminCasesQueryDto) {
    const { page, size, offset } = pageParams(q.page, q.size);
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.search) {
      params.push(likePattern(q.search));
      const n = params.length;
      where.push(`(ca.title ILIKE $${n} ESCAPE '\\' OR co.name ILIKE $${n} ESCAPE '\\' OR co.course_code ILIKE $${n} ESCAPE '\\')`);
    }
    if (q.status) {
      params.push(q.status);
      where.push(`ca.status = $${params.length}`);
    }
    if (q.learningMode) {
      params.push(q.learningMode);
      where.push(`ca.learning_mode = $${params.length}`);
    }
    if (q.courseId) {
      params.push(q.courseId);
      where.push(`ca.course_id = $${params.length}`);
    }
    params.push(size, offset);

    const [list, analytics, recent] = await Promise.all([
      this.db.query(
        `SELECT ca.id, ca.title, ca.course_id, ca.learning_mode, ca.status, ca.updated_at,
                co.name AS course_name, co.course_code,
                (SELECT COUNT(*) FROM case_nodes n WHERE n.case_id = ca.id) AS nodes_count,
                COUNT(*) OVER () AS total
           FROM cases ca
           JOIN courses co ON co.id = ca.course_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY ca.updated_at DESC, ca.id
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'DRAFT')     AS draft,
                COUNT(*) FILTER (WHERE status = 'REVIEWED')  AS reviewed,
                COUNT(*) FILTER (WHERE status = 'APPROVED')  AS approved,
                COUNT(*) FILTER (WHERE status = 'PUBLISHED') AS published,
                COUNT(*) FILTER (WHERE learning_mode = 'BRANCHING_STUDY') AS branching,
                COUNT(*) FILTER (WHERE learning_mode = 'REVIEW_STUDY')    AS review
           FROM cases`,
      ),
      this.db.query(
        `SELECT id, title, updated_at, learning_mode FROM cases ORDER BY updated_at DESC, id LIMIT 5`,
      ),
    ]);

    const a = analytics.rows[0];
    return {
      cases: list.rows.map((r) => ({
        id: r.id,
        title: r.title,
        courseId: r.course_id,
        courseName: r.course_name,
        courseCode: r.course_code ?? "",
        learningMode: r.learning_mode,
        status: r.status,
        nodesCount: toInt(r.nodes_count),
        updatedAt: r.updated_at,
      })),
      analytics: {
        totalCases: toInt(a.total),
        byStatus: {
          draft: toInt(a.draft),
          reviewed: toInt(a.reviewed),
          approved: toInt(a.approved),
          published: toInt(a.published),
        },
        byMode: { branching: toInt(a.branching), review: toInt(a.review) },
        recentUpdates: recent.rows.map((r) => ({
          id: r.id,
          title: r.title,
          updatedAt: r.updated_at,
          learningMode: r.learning_mode,
        })),
      },
      total: await this.pageTotal(
        list.rows,
        `FROM cases ca JOIN courses co ON co.id = ca.course_id ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
        params.slice(0, -2),
      ),
      page,
      size,
    };
  }

  // ---------------------------------------------------------------------------
  // 10.7 AI service (read-only, OPD-013)
  // ---------------------------------------------------------------------------
  async getAiService() {
    const [health, metrics, ready, generations, indexing] = await Promise.all([
      this.aiHealth.check(),
      this.db.query(
        `SELECT COUNT(*) AS total,
                AVG((meta->>'durationMs')::numeric) AS avg_ms
           FROM audit_events
          WHERE event_type = 'CASE_GENERATED'`,
      ),
      this.db.query(`SELECT COUNT(*) AS ready FROM teaching_materials WHERE processing_status = 'COMPLETED'`),
      this.db.query(
        `SELECT ae.id, ae.event_type, ae.meta, ae.created_at,
                u.full_name AS lecturer_name,
                COALESCE(ca.title, ae.meta->>'caseTitle') AS case_title,
                co.course_code
           FROM audit_events ae
           LEFT JOIN users u    ON u.id = ae.actor_id
           LEFT JOIN cases ca   ON ca.id = ae.target_id
           LEFT JOIN courses co ON co.id::text = ae.meta->>'courseId'
          WHERE ae.event_type IN ('CASE_GENERATED', 'CASE_GENERATION_FAILED')
          ORDER BY ae.created_at DESC
          LIMIT 10`,
      ),
      this.db.query(
        `SELECT m.id, m.original_filename, m.processing_status, m.chunk_count, m.processing_error, co.course_code
           FROM teaching_materials m
           JOIN courses co ON co.id = m.course_id
          ORDER BY m.updated_at DESC, m.id
          LIMIT 10`,
      ),
    ]);

    const avgMs = metrics.rows[0].avg_ms === null ? 0 : Number(metrics.rows[0].avg_ms);
    return {
      metrics: {
        totalGenerated: toInt(metrics.rows[0].total),
        avgDurationSeconds: Math.round(avgMs / 100) / 10,
        readyMaterials: toInt(ready.rows[0].ready),
      },
      config: {
        provider: health.provider,
        model: health.model,
        lastUpdated: null,
        status: health.status === "UP" ? "ACTIVE" : "DOWN",
      },
      recentGenerations: generations.rows.map((r) => ({
        id: r.id,
        caseTitle: r.case_title ?? "",
        courseCode: r.course_code ?? "",
        lecturerName: r.lecturer_name ?? "",
        createdAt: r.created_at,
        durationSeconds: typeof r.meta?.durationMs === "number" ? Math.round(r.meta.durationMs / 100) / 10 : 0,
        decisionsCount: typeof r.meta?.decisionsCount === "number" ? r.meta.decisionsCount : undefined,
        materialsCitedCount: typeof r.meta?.materialsCount === "number" ? r.meta.materialsCount : undefined,
        status: generationStatus(r.event_type, r.meta),
        learningMode: typeof r.meta?.learningMode === "string" ? r.meta.learningMode : undefined,
      })),
      indexingStatuses: indexing.rows.map((r) => ({
        id: r.id,
        filename: r.original_filename,
        courseCode: r.course_code ?? "",
        status: r.processing_status,
        chunksCount: r.chunk_count ?? undefined,
        errorMessage: r.processing_error ? String(r.processing_error).slice(0, 200) : undefined,
      })),
    };
  }

  // ---------------------------------------------------------------------------
  // 10.9 Logs
  // ---------------------------------------------------------------------------
  async listLogs(q: AdminLogsQueryDto) {
    const { page, size, offset } = pageParams(q.page, q.size);
    const where: string[] = [];
    const params: unknown[] = [];
    if (q.search) {
      params.push(likePattern(q.search));
      const n = params.length;
      const clauses = [
        `u.full_name ILIKE $${n} ESCAPE '\\'`,
        `u.email ILIKE $${n} ESCAPE '\\'`,
        `ae.event_type ILIKE $${n} ESCAPE '\\'`,
        `ae.meta->>'caseTitle' ILIKE $${n} ESCAPE '\\'`,
        `ae.meta->>'fileName' ILIKE $${n} ESCAPE '\\'`,
        `ae.meta->>'targetName' ILIKE $${n} ESCAPE '\\'`,
      ];
      const matchedTypes = matchingAuditEventTypes(q.search);
      if (matchedTypes.length > 0) {
        params.push(matchedTypes);
        clauses.push(`ae.event_type = ANY($${params.length}::text[])`);
      }
      const matchedReasons = matchingLoginFailureReasons(q.search);
      if (matchedReasons.length > 0) {
        params.push(matchedReasons);
        clauses.push(`ae.meta->>'reason' = ANY($${params.length}::text[])`);
      }
      where.push(`(${clauses.join(" OR ")})`);
    }
    // A filter group (e.g. sign-in = LOGIN_SUCCEEDED + LOGIN_FAILED) arrives as a list; one type still works.
    const eventTypes = q.eventType === undefined ? [] : Array.isArray(q.eventType) ? q.eventType : [q.eventType];
    if (eventTypes.length) {
      params.push(eventTypes);
      where.push(`ae.event_type = ANY($${params.length}::text[])`);
    }
    // Fixed SQL keywords chosen from the validated value, never the raw input.
    const direction = q.order === "oldest" ? "ASC" : "DESC";
    if (q.timeRange === "today") where.push(`ae.created_at >= ${TODAY}`);
    if (q.timeRange === "7d") where.push(`ae.created_at >= NOW() - INTERVAL '7 days'`);
    if (q.timeRange === "30d") where.push(`ae.created_at >= NOW() - INTERVAL '30 days'`);
    params.push(size, offset);

    const [list, metrics] = await Promise.all([
      this.db.query(
        `SELECT ae.id, ae.event_type, ae.outcome, ae.meta, ae.created_at,
                u.full_name AS actor_name, u.email AS actor_email,
                COUNT(*) OVER () AS total
           FROM audit_events ae
           LEFT JOIN users u ON u.id = ae.actor_id
          ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
          ORDER BY ae.created_at ${direction}, ae.id ${direction}
          LIMIT $${params.length - 1} OFFSET $${params.length}`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*)                                               AS events_today,
                COUNT(*) FILTER (WHERE event_type = 'LOGIN_SUCCEEDED') AS logins,
                COUNT(*) FILTER (WHERE event_type = 'CASE_GENERATED')  AS generations,
                COUNT(*) FILTER (WHERE outcome = 'ERROR')              AS errors
           FROM audit_events
          WHERE created_at >= ${TODAY}`,
      ),
    ]);

    const m = metrics.rows[0];
    return {
      logs: list.rows.map((r) => this.toLogItem(r)),
      metrics: {
        eventsToday: toInt(m.events_today),
        loginCount: toInt(m.logins),
        aiGenerationsCount: toInt(m.generations),
        errorsCount: toInt(m.errors),
      },
      total: await this.pageTotal(
        list.rows,
        `FROM audit_events ae LEFT JOIN users u ON u.id = ae.actor_id ${where.length ? `WHERE ${where.join(" AND ")}` : ""}`,
        params.slice(0, -2),
      ),
      page,
      size,
    };
  }

  private async recentEvents(limit: number) {
    const res = await this.db.query(
      `SELECT ae.id, ae.event_type, ae.outcome, ae.meta, ae.created_at,
              u.full_name AS actor_name, u.email AS actor_email
         FROM audit_events ae
         LEFT JOIN users u ON u.id = ae.actor_id
        ORDER BY ae.created_at DESC, ae.id
        LIMIT $1`,
      [limit],
    );
    return res.rows.map((r) => this.toLogItem(r));
  }

  private toLogItem(r: any) {
    return {
      id: r.id,
      code: eventCode(r.id),
      actorName: r.actor_name ?? "",
      actorEmail: r.actor_email ?? "",
      timestamp: r.created_at,
      eventTitle: r.event_type,
      eventMeta: describeEventMeta(r.meta),
      status: r.outcome as "SUCCESS" | "WARNING" | "ERROR",
    };
  }

  // ---------------------------------------------------------------------------
  // 10.10 Settings
  // ---------------------------------------------------------------------------
  async getSettings() {
    const res = await this.db.query(`SELECT key, value FROM system_settings`);
    const stored = new Map<string, string>(res.rows.map((r) => [r.key, r.value]));
    const values = Object.fromEntries(
      SETTING_KEYS.map((k) => [k, stored.get(k) ?? SETTINGS_DEFAULTS[k]]),
    ) as Record<SettingKey, string>;

    return {
      ...values,
      limits: {
        fileFormats: "PDF, DOCX",
        // The limit MaterialService enforces after upload (multer sets no early limit; spec 007 record §4).
        maxFileSize: `${MAX_SIZE_BYTES / (1024 * 1024)} MB`,
        registration: "OPEN_LECTURER_STUDENT",
        version: this.version,
        timezone: APP_TIME_ZONE,
      },
    };
  }

  async updateSettings(actorId: string, dto: UpdateSettingsDto) {
    const entries = SETTING_KEYS.filter((k) => dto[k] !== undefined).map((k) => [k, dto[k] as string] as const);
    if (entries.length > 0) {
      const client = await this.db.getClient();
      try {
        await client.query("BEGIN");
        for (const [key, value] of entries) {
          await client.query(
            `INSERT INTO system_settings (key, value, updated_by, updated_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
            [key, value, actorId],
          );
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
      await this.audit.record({
        type: "SETTINGS_UPDATED",
        outcome: "SUCCESS",
        actorId,
        meta: { fields: entries.map(([k]) => k).join(", ") },
      });
    }
    return this.getSettings();
  }
}
