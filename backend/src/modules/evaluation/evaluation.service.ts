import { ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "../../common/database/database.service";
import type { CreateRubricDto, ExportQueryDto, UpdateRubricDto } from "./dto/rubric.dto";
import {
  ACTIVITY_COLUMNS,
  RUBRIC_COLUMNS,
  averageScore,
  compareRows,
  pseudonymFactory,
  toCsv,
} from "./research-export";

type Actor = { id: string; role: string };

const WORDS = (col: string) =>
  `CASE WHEN ${col} IS NULL OR btrim(${col}) = '' THEN 0
        ELSE array_length(regexp_split_to_array(btrim(${col}), '\\s+'), 1) END`;

const RUBRIC_SELECT = `
  SELECT r.id, r.case_id, r.evaluator_id, r.realism_score, r.difficulty_score, r.alignment_score,
         r.notes, r.created_at, r.updated_at, ca.title AS case_title, u.full_name AS evaluator_name
    FROM case_rubric_evaluations r
    JOIN cases ca   ON ca.id = r.case_id
    JOIN courses co ON co.id = ca.course_id
    JOIN users u    ON u.id = r.evaluator_id`;

/**
 * Case quality rubric and anonymised research export (BE-033, spec 007 US4;
 * FR-EVAL-01/04/05, OPD-011 -> A). A rubric rates the case, never a student (BR-EVAL-02).
 */
@Injectable()
export class EvaluationService {
  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  // ---------------------------------------------------------------------------
  // Rubric CRUD (AC-R1..R3)
  // ---------------------------------------------------------------------------
  async list(actor: Actor, caseId?: string) {
    if (caseId) await this.assertCaseAccess(actor, caseId);
    const params: unknown[] = [];
    const where: string[] = [];
    if (actor.role === "LECTURER") {
      params.push(actor.id);
      where.push(`co.lecturer_id = $${params.length}`);
    }
    if (caseId) {
      params.push(caseId);
      where.push(`r.case_id = $${params.length}`);
    }
    const res = await this.db.query(
      `${RUBRIC_SELECT} ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY r.created_at DESC, r.id`,
      params,
    );
    return res.rows.map((r) => this.toRubric(r));
  }

  async getById(actor: Actor, id: string) {
    const row = await this.findRubric(id);
    await this.assertCaseAccess(actor, row.case_id);
    return this.toRubric(row);
  }

  async create(actor: Actor, dto: CreateRubricDto) {
    await this.assertCaseAccess(actor, dto.caseId);
    try {
      const res = await this.db.query(
        `INSERT INTO case_rubric_evaluations
           (case_id, evaluator_id, realism_score, difficulty_score, alignment_score, notes)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [dto.caseId, actor.id, dto.realismScore, dto.difficultyScore, dto.alignmentScore, dto.notes || null],
      );
      return this.toRubric(await this.findRubric(res.rows[0].id));
    } catch (err) {
      if ((err as { code?: string })?.code === "23505") {
        throw new ConflictException("You already evaluated this case; update your evaluation instead");
      }
      throw err;
    }
  }

  async update(actor: Actor, id: string, dto: UpdateRubricDto) {
    const row = await this.findRubric(id);
    this.assertEvaluator(actor, row);
    await this.db.query(
      `UPDATE case_rubric_evaluations
          SET realism_score    = COALESCE($2, realism_score),
              difficulty_score = COALESCE($3, difficulty_score),
              alignment_score  = COALESCE($4, alignment_score),
              notes            = CASE WHEN $5::boolean THEN NULLIF($6, '') ELSE notes END,
              updated_at       = NOW()
        WHERE id = $1`,
      [
        id,
        dto.realismScore ?? null,
        dto.difficultyScore ?? null,
        dto.alignmentScore ?? null,
        dto.notes !== undefined,
        dto.notes ?? null,
      ],
    );
    return this.toRubric(await this.findRubric(id));
  }

  async remove(actor: Actor, id: string) {
    const row = await this.findRubric(id);
    this.assertEvaluator(actor, row);
    await this.db.query("DELETE FROM case_rubric_evaluations WHERE id = $1", [id]);
    return { id };
  }

  // ---------------------------------------------------------------------------
  // Research export (AC-R4, AC-R5)
  // ---------------------------------------------------------------------------
  async exportCsv(actor: Actor, q: ExportQueryDto): Promise<string> {
    if (q.courseId) await this.assertCourseAccess(actor, q.courseId);
    if (q.caseId) await this.assertCaseAccess(actor, q.caseId);

    const pseudonym = pseudonymFactory(this.config.get<string>("JWT_SECRET") ?? "");
    // $1 lecturer (NULL for admin), $2 course, $3 case
    const params = [actor.role === "LECTURER" ? actor.id : null, q.courseId ?? null, q.caseId ?? null];
    const scope = `($1::uuid IS NULL OR co.lecturer_id = $1::uuid)
               AND ($2::uuid IS NULL OR co.id = $2::uuid)
               AND ($3::uuid IS NULL OR ca.id = $3::uuid)`;

    if (q.dataset === "rubrics") {
      const res = await this.db.query(
        `SELECT r.case_id, co.course_code, ca.learning_mode, r.evaluator_id,
                r.realism_score, r.difficulty_score, r.alignment_score
           FROM case_rubric_evaluations r
           JOIN cases ca   ON ca.id = r.case_id
           JOIN courses co ON co.id = ca.course_id
          WHERE ${scope}`,
        params,
      );
      // L3 option C: no timestamp column, no time order (case, evaluator code, scores).
      const rubricRows: unknown[][] = res.rows.map((r) => [
        r.case_id,
        r.course_code ?? "",
        r.learning_mode,
        pseudonym(r.evaluator_id),
        r.realism_score,
        r.difficulty_score,
        r.alignment_score,
        averageScore(r.realism_score, r.difficulty_score, r.alignment_score),
      ]);
      return toCsv(RUBRIC_COLUMNS, rubricRows.sort(compareRows([0, 3, 4, 5, 6])));
    }

    // Only counts and ids of case content leave the database; no free text (FR-EVAL-05).
    const [attempts, submissions] = await Promise.all([
      this.db.query(
        `SELECT ba.student_id, co.course_code, ca.id AS case_id, ca.learning_mode, ba.attempt_number,
                ba.is_completed, ba.outcome_node_id,
                EXTRACT(EPOCH FROM (ba.completed_at - ba.started_at))::integer AS duration_seconds,
                ${WORDS("ba.reflection_text")} AS reflection_words,
                (SELECT COUNT(*) FROM student_reasoning sr WHERE sr.attempt_id = ba.id) AS decision_count,
                (SELECT string_agg(sr.selected_option_id::text, '>' ORDER BY sr.submitted_at, sr.id)
                   FROM student_reasoning sr WHERE sr.attempt_id = ba.id) AS choice_path,
                (SELECT COALESCE(SUM(${WORDS("sr.reasoning_text")}), 0)
                   FROM student_reasoning sr WHERE sr.attempt_id = ba.id) AS reasoning_words,
                -- FR-EVAL-04 "rounds engaged (0, 1 or 2)": deepest session of the attempt (QG2 M2)
                (SELECT COALESCE(MAX(cs.current_round), 0)
                   FROM challenge_support_sessions cs
                   JOIN student_reasoning sr ON sr.id = cs.reasoning_id
                  WHERE sr.attempt_id = ba.id) AS challenge_rounds
           FROM branching_attempts ba
           JOIN cases ca   ON ca.id = ba.case_id
           JOIN courses co ON co.id = ca.course_id
          WHERE ${scope}`,
        params,
      ),
      this.db.query(
        `SELECT s.student_id, co.course_code, ca.id AS case_id, ca.learning_mode,
                (${WORDS("s.student_analysis")}) + (${WORDS("s.proposed_solution")}) + (${WORDS("s.reasoning_text")}) AS reasoning_words,
                ${WORDS("s.reflection_text")} AS reflection_words,
                (SELECT COALESCE(MAX(cs.current_round), 0)
                   FROM challenge_support_sessions cs WHERE cs.review_submission_id = s.id) AS challenge_rounds
           FROM review_study_submissions s
           JOIN cases ca   ON ca.id = s.case_id
           JOIN courses co ON co.id = ca.course_id
          WHERE ${scope}`,
        params,
      ),
    ]);

    const rows: unknown[][] = [
      ...attempts.rows.map((r) => [
        pseudonym(r.student_id),
        r.course_code ?? "",
        r.case_id,
        r.learning_mode,
        r.attempt_number,
        r.is_completed ? "true" : "false",
        Number(r.decision_count),
        r.choice_path ?? "",
        r.outcome_node_id ?? "",
        Number(r.reasoning_words),
        Number(r.reflection_words),
        Number(r.challenge_rounds),
        r.duration_seconds !== null && r.duration_seconds !== undefined ? Number(r.duration_seconds) : "",
      ]),
      ...submissions.rows.map((r) => [
        pseudonym(r.student_id),
        r.course_code ?? "",
        r.case_id,
        r.learning_mode,
        1,
        "true",
        0,
        "",
        "",
        Number(r.reasoning_words),
        Number(r.reflection_words),
        Number(r.challenge_rounds),
        "",
      ]),
    ];
    // L3 option C: order by case, participant code, attempt number; never by time or raw id.
    return toCsv(ACTIVITY_COLUMNS, rows.sort(compareRows([2, 0, 4])));
  }

  // ---------------------------------------------------------------------------
  // Access helpers
  // ---------------------------------------------------------------------------
  private async assertCaseAccess(actor: Actor, caseId: string) {
    const res = await this.db.query(
      `SELECT co.lecturer_id FROM cases ca JOIN courses co ON co.id = ca.course_id WHERE ca.id = $1`,
      [caseId],
    );
    if (res.rows.length === 0) throw new NotFoundException("Case not found");
    if (actor.role === "LECTURER" && res.rows[0].lecturer_id !== actor.id) {
      throw new ForbiddenException("You can only evaluate cases in your own courses");
    }
  }

  private async assertCourseAccess(actor: Actor, courseId: string) {
    const res = await this.db.query("SELECT lecturer_id FROM courses WHERE id = $1", [courseId]);
    if (res.rows.length === 0) throw new NotFoundException("Course not found");
    if (actor.role === "LECTURER" && res.rows[0].lecturer_id !== actor.id) {
      throw new ForbiddenException("You can only export your own courses");
    }
  }

  private assertEvaluator(actor: Actor, row: { evaluator_id: string }) {
    if (row.evaluator_id !== actor.id) {
      throw new ForbiddenException("Only the evaluator can change this evaluation");
    }
  }

  private async findRubric(id: string) {
    const res = await this.db.query(`${RUBRIC_SELECT} WHERE r.id = $1`, [id]);
    if (res.rows.length === 0) throw new NotFoundException("Evaluation not found");
    return res.rows[0];
  }

  private toRubric(r: any) {
    return {
      id: r.id,
      caseId: r.case_id,
      caseTitle: r.case_title,
      evaluatorId: r.evaluator_id,
      evaluatorName: r.evaluator_name,
      realismScore: r.realism_score,
      difficultyScore: r.difficulty_score,
      alignmentScore: r.alignment_score,
      averageScore: averageScore(r.realism_score, r.difficulty_score, r.alignment_score),
      criteria: [
        { key: "REALISM", score: r.realism_score },
        { key: "DIFFICULTY", score: r.difficulty_score },
        { key: "ALIGNMENT", score: r.alignment_score },
      ],
      notes: r.notes ?? "",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}
