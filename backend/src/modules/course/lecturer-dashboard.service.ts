import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

const toInt = (v: unknown) => {
  const n = parseInt(String(v ?? "0"), 10);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Lecturer dashboard aggregates (BE-030, spec 007 US2), limited to courses the
 * lecturer owns. Every count is its own aggregate (FILTER / sub-query), never a
 * count over a multi-table JOIN, so attempts and feedback rows cannot inflate it (AC-D3).
 * No scores, ranks or pass/fail; students appear by name only (AC-D5).
 */
@Injectable()
export class LecturerDashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getDashboard(lecturerId: string, courseId?: string) {
    if (courseId) await this.assertOwnCourse(lecturerId, courseId);

    // $1 = lecturer, $2 = optional course filter
    const params = [lecturerId, courseId ?? null];
    const ownCourses = `SELECT id FROM courses WHERE lecturer_id = $1 AND ($2::uuid IS NULL OR id = $2::uuid)`;

    const [courses, cases, pendingCount, pending, recentCount, recent] = await Promise.all([
      this.db.query(
        `SELECT COUNT(*)                                  AS total,
                COUNT(*) FILTER (WHERE is_active = TRUE)  AS active,
                COUNT(*) FILTER (WHERE is_active = FALSE) AS archived
           FROM courses
          WHERE lecturer_id = $1 AND ($2::uuid IS NULL OR id = $2::uuid)`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*)                                                  AS total,
                COUNT(*) FILTER (WHERE status = 'DRAFT')                  AS draft,
                COUNT(*) FILTER (WHERE status = 'REVIEWED')               AS reviewed,
                COUNT(*) FILTER (WHERE status = 'APPROVED')               AS approved,
                COUNT(*) FILTER (WHERE status = 'PUBLISHED')              AS published,
                COUNT(*) FILTER (WHERE learning_mode = 'BRANCHING_STUDY') AS branching,
                COUNT(*) FILTER (WHERE learning_mode = 'REVIEW_STUDY')    AS review
           FROM cases
          WHERE course_id IN (${ownCourses})`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*) AS count
           FROM review_study_submissions s
          WHERE s.submission_status = 'SUBMITTED'
            AND s.case_id IN (SELECT id FROM cases WHERE course_id IN (${ownCourses}))`,
        params,
      ),
      this.db.query(
        `SELECT s.id AS submission_id, s.submitted_at, ca.id AS case_id, ca.title AS case_title,
                co.id AS course_id, co.name AS course_name, u.full_name AS student_name
           FROM review_study_submissions s
           JOIN cases ca   ON ca.id = s.case_id
           JOIN courses co ON co.id = ca.course_id
           JOIN users u    ON u.id = s.student_id
          WHERE s.submission_status = 'SUBMITTED'
            AND co.lecturer_id = $1 AND ($2::uuid IS NULL OR co.id = $2::uuid)
          ORDER BY s.submitted_at ASC, s.id
          LIMIT 5`,
        params,
      ),
      this.db.query(
        `SELECT COUNT(*) AS count
           FROM branching_attempts ba
          WHERE ba.is_completed = TRUE
            AND ba.completed_at >= NOW() - INTERVAL '7 days'
            AND ba.case_id IN (SELECT id FROM cases WHERE course_id IN (${ownCourses}))`,
        params,
      ),
      this.db.query(
        `SELECT ba.id AS attempt_id, ba.attempt_number, ba.completed_at,
                ca.id AS case_id, ca.title AS case_title,
                co.id AS course_id, co.name AS course_name, u.full_name AS student_name,
                EXISTS (SELECT 1 FROM lecturer_feedback lf WHERE lf.branching_attempt_id = ba.id) AS has_feedback
           FROM branching_attempts ba
           JOIN cases ca   ON ca.id = ba.case_id
           JOIN courses co ON co.id = ca.course_id
           JOIN users u    ON u.id = ba.student_id
          WHERE ba.is_completed = TRUE
            AND co.lecturer_id = $1 AND ($2::uuid IS NULL OR co.id = $2::uuid)
          ORDER BY ba.completed_at DESC NULLS LAST, ba.id
          LIMIT 5`,
        params,
      ),
    ]);

    const c = courses.rows[0];
    const k = cases.rows[0];
    return {
      courses: { total: toInt(c.total), active: toInt(c.active), archived: toInt(c.archived) },
      cases: {
        total: toInt(k.total),
        byStatus: {
          DRAFT: toInt(k.draft),
          REVIEWED: toInt(k.reviewed),
          APPROVED: toInt(k.approved),
          PUBLISHED: toInt(k.published),
        },
        byMode: { BRANCHING_STUDY: toInt(k.branching), REVIEW_STUDY: toInt(k.review) },
      },
      pendingReviews: {
        count: toInt(pendingCount.rows[0].count),
        items: pending.rows.map((r) => ({
          submissionId: r.submission_id,
          caseId: r.case_id,
          caseTitle: r.case_title,
          courseId: r.course_id,
          courseName: r.course_name,
          studentName: r.student_name,
          submittedAt: r.submitted_at,
        })),
      },
      recentCompletedAttempts: {
        countLast7Days: toInt(recentCount.rows[0].count),
        items: recent.rows.map((r) => ({
          attemptId: r.attempt_id,
          caseId: r.case_id,
          caseTitle: r.case_title,
          courseId: r.course_id,
          courseName: r.course_name,
          studentName: r.student_name,
          attemptNumber: toInt(r.attempt_number),
          completedAt: r.completed_at,
          hasFeedback: r.has_feedback === true,
        })),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private async assertOwnCourse(lecturerId: string, courseId: string) {
    const res = await this.db.query("SELECT lecturer_id FROM courses WHERE id = $1", [courseId]);
    if (res.rows.length === 0) throw new NotFoundException("Course not found");
    if (res.rows[0].lecturer_id !== lecturerId) {
      throw new ForbiddenException("You can only view your own courses");
    }
  }
}
