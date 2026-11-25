import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { DatabaseService } from "../../common/database/database.service";
import { CreateLecturerFeedbackDto } from "./dto/create-lecturer-feedback.dto";
import { SubmissionQueueQueryDto } from "./dto/submission-queue-query.dto";

export interface LecturerFeedbackRow {
  id: string;
  lecturer_id: string;
  branching_attempt_id: string | null;
  review_submission_id: string | null;
  feedback_text: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface LecturerFeedbackDto {
  id: string;
  lecturerId: string;
  branchingAttemptId: string | null;
  reviewSubmissionId: string | null;
  feedbackText: string;
  createdAt: string;
  updatedAt: string;
}

export function mapLecturerFeedback(row: LecturerFeedbackRow): LecturerFeedbackDto {
  return {
    id: row.id,
    lecturerId: row.lecturer_id,
    branchingAttemptId: row.branching_attempt_id ?? null,
    reviewSubmissionId: row.review_submission_id ?? null,
    feedbackText: row.feedback_text,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export interface StepDto {
  nodeId: string;
  situation: string;
  selectedOptionText: string;
  reasoningText: string | null;
}

export interface SubmissionQueueItemDto {
  targetType: "REVIEW_STUDY" | "BRANCHING_STUDY";
  targetId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseCode: string | null;
  caseId: string;
  caseTitle: string;
  submittedAt: string;
  feedbackStatus: "PENDING" | "REVIEWED";
  existingFeedback: LecturerFeedbackDto | null;
  reflectionStatus: "NOT_STARTED" | "SUBMITTED";
  reflectionText: string | null;

  // REVIEW_STUDY specific
  submissionStatus?: "SUBMITTED" | "REVIEWED" | "REFLECTED";
  studentAnalysis?: string | null;
  proposedSolution?: string;
  reasoningText?: string;

  // BRANCHING_STUDY specific
  attemptNumber?: number;
  isCompleted?: boolean;
  outcomeSituation?: string | null;
  stepsCount?: number;
  steps?: StepDto[];
}

@Injectable()
export class LecturerFeedbackService {
  private readonly logger = new Logger(LecturerFeedbackService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * E6: POST /lecturer-feedback
   * FR-09..12, FR-20: Lecturer leaves qualitative feedback for a student attempt or submission.
   * C2-A: Max 1 feedback per target. Second attempt -> 409 Conflict.
   * Transactional with FOR UPDATE row-locking on target.
   * For Review Study SUBMITTED -> transitions submission_status to REVIEWED.
   * For Branching Study -> is_completed must be true (FR-12).
   */
  async create(lecturerId: string, dto: CreateLecturerFeedbackDto): Promise<LecturerFeedbackDto> {
    const hasBranching = !!dto.branchingAttemptId;
    const hasReview = !!dto.reviewSubmissionId;

    if ((hasBranching && hasReview) || (!hasBranching && !hasReview)) {
      throw new BadRequestException("Exactly one of branchingAttemptId or reviewSubmissionId must be provided");
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      let createdRow: LecturerFeedbackRow;

      if (dto.branchingAttemptId) {
        // Lock target branching attempt
        const attemptRes = await client.query(
          `SELECT a.id, a.is_completed, a.case_id, co.lecturer_id
           FROM branching_attempts a
           JOIN cases c ON a.case_id = c.id
           JOIN courses co ON c.course_id = co.id
           WHERE a.id = $1
           FOR UPDATE OF a`,
          [dto.branchingAttemptId],
        );

        if (attemptRes.rows.length === 0) {
          throw new NotFoundException("Branching attempt not found");
        }

        const attempt = attemptRes.rows[0];
        if (attempt.lecturer_id !== lecturerId) {
          throw new ForbiddenException("You do not own the course for this branching attempt");
        }

        if (!attempt.is_completed) {
          throw new ConflictException("Cannot give feedback on an incomplete branching attempt");
        }

        // C2-A: Check if feedback already exists for this attempt
        const existingFeedback = await client.query(
          `SELECT id FROM lecturer_feedback WHERE branching_attempt_id = $1`,
          [dto.branchingAttemptId],
        );
        if (existingFeedback.rows.length > 0) {
          throw new ConflictException("Feedback already exists for this branching attempt");
        }

        const feedbackId = randomUUID();
        const insertRes = await client.query<LecturerFeedbackRow>(
          `INSERT INTO lecturer_feedback (
             id, lecturer_id, branching_attempt_id, review_submission_id, feedback_text
           ) VALUES ($1, $2, $3, NULL, $4)
           RETURNING *`,
          [feedbackId, lecturerId, dto.branchingAttemptId, dto.feedbackText],
        );

        createdRow = insertRes.rows[0];
      } else {
        // Lock target review submission
        const subRes = await client.query(
          `SELECT s.id, s.submission_status, s.case_id, co.lecturer_id
           FROM review_study_submissions s
           JOIN cases c ON s.case_id = c.id
           JOIN courses co ON c.course_id = co.id
           WHERE s.id = $1
           FOR UPDATE OF s`,
          [dto.reviewSubmissionId],
        );

        if (subRes.rows.length === 0) {
          throw new NotFoundException("Review study submission not found");
        }

        const sub = subRes.rows[0];
        if (sub.lecturer_id !== lecturerId) {
          throw new ForbiddenException("You do not own the course for this review study submission");
        }

        if (sub.submission_status !== "SUBMITTED") {
          throw new ConflictException("Only SUBMITTED review study work can be reviewed");
        }

        // C2-A: Check if feedback already exists for this submission
        const existingFeedback = await client.query(
          `SELECT id FROM lecturer_feedback WHERE review_submission_id = $1`,
          [dto.reviewSubmissionId],
        );
        if (existingFeedback.rows.length > 0) {
          throw new ConflictException("Feedback already exists for this review study submission");
        }

        const feedbackId = randomUUID();
        const insertRes = await client.query<LecturerFeedbackRow>(
          `INSERT INTO lecturer_feedback (
             id, lecturer_id, branching_attempt_id, review_submission_id, feedback_text
           ) VALUES ($1, $2, NULL, $3, $4)
           RETURNING *`,
          [feedbackId, lecturerId, dto.reviewSubmissionId, dto.feedbackText],
        );

        createdRow = insertRes.rows[0];

        // FR-11: Transition SUBMITTED -> REVIEWED
        const transitionRes = await client.query(
          `UPDATE review_study_submissions
           SET submission_status = 'REVIEWED', updated_at = NOW()
           WHERE id = $1 AND submission_status = 'SUBMITTED'`,
          [dto.reviewSubmissionId],
        );
        if (transitionRes.rowCount !== 1) {
          throw new ConflictException("Review study submission is no longer SUBMITTED");
        }
      }

      await client.query("COMMIT");
      return mapLecturerFeedback(createdRow);
    } catch (err: any) {
      await client.query("ROLLBACK");
      if (err.code === "23505") {
        throw new ConflictException("Feedback already exists for this target");
      }
      if (err.code === "23514") {
        throw new BadRequestException("Feedback data violates constraints");
      }
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * E7: GET /lecturer-feedback/submissions?courseId&caseId
   * FR-13: Submissions queue for courses owned by lecturer.
   * Includes Review Study submissions and completed Branching Study attempts.
   * C3-A: Branching Study items include ordered steps without consequence.
   */
  async getQueue(
    lecturerId: string,
    query: SubmissionQueueQueryDto,
  ): Promise<{ items: SubmissionQueueItemDto[] }> {
    // Validate course ownership if courseId is specified
    if (query.courseId) {
      const courseRes = await this.db.query(
        `SELECT id, lecturer_id FROM courses WHERE id = $1`,
        [query.courseId],
      );
      if (courseRes.rows.length === 0) {
        throw new NotFoundException("Course not found");
      }
      if (courseRes.rows[0].lecturer_id !== lecturerId) {
        throw new ForbiddenException("You do not own this course");
      }
    }

    // Validate case ownership if caseId is specified
    if (query.caseId) {
      const caseRes = await this.db.query(
        `SELECT c.id, co.lecturer_id
         FROM cases c
         JOIN courses co ON c.course_id = co.id
         WHERE c.id = $1`,
        [query.caseId],
      );
      if (caseRes.rows.length === 0) {
        throw new NotFoundException("Case not found");
      }
      if (caseRes.rows[0].lecturer_id !== lecturerId) {
        throw new ForbiddenException("You do not own this case");
      }
    }

    // 1. Fetch Review Study submissions
    const reviewRes = await this.db.query(
      `SELECT
         s.id AS "targetId",
         'REVIEW_STUDY' AS "targetType",
         s.student_id AS "studentId",
         u.full_name AS "studentName",
         u.email AS "studentEmail",
         co.id AS "courseId",
         co.name AS "courseName",
         co.course_code AS "courseCode",
         c.id AS "caseId",
         c.title AS "caseTitle",
         s.submitted_at AS "submittedAt",
         s.submission_status AS "submissionStatus",
         s.reflection_status AS "reflectionStatus",
         s.reflection_text AS "reflectionText",
         s.student_analysis AS "studentAnalysis",
         s.proposed_solution AS "proposedSolution",
         s.reasoning_text AS "reasoningText",
         f.id AS "feedbackId",
         f.lecturer_id AS "feedbackLecturerId",
         f.branching_attempt_id AS "feedbackBranchingAttemptId",
         f.review_submission_id AS "feedbackReviewSubmissionId",
         f.feedback_text AS "feedbackText",
         f.created_at AS "feedbackCreatedAt",
         f.updated_at AS "feedbackUpdatedAt"
       FROM review_study_submissions s
       JOIN users u ON s.student_id = u.id
       JOIN cases c ON s.case_id = c.id
       JOIN courses co ON c.course_id = co.id
       LEFT JOIN lecturer_feedback f ON f.review_submission_id = s.id
       WHERE co.lecturer_id = $1
         AND ($2::uuid IS NULL OR co.id = $2::uuid)
         AND ($3::uuid IS NULL OR c.id = $3::uuid)`,
      [lecturerId, query.courseId ?? null, query.caseId ?? null],
    );

    const reviewItems: SubmissionQueueItemDto[] = reviewRes.rows.map((row) => ({
      targetType: "REVIEW_STUDY",
      targetId: row.targetId,
      studentId: row.studentId,
      studentName: row.studentName,
      studentEmail: row.studentEmail,
      courseId: row.courseId,
      courseName: row.courseName,
      courseCode: row.courseCode ?? null,
      caseId: row.caseId,
      caseTitle: row.caseTitle,
      submittedAt: new Date(row.submittedAt).toISOString(),
      feedbackStatus: row.feedbackId ? "REVIEWED" : "PENDING",
      existingFeedback: row.feedbackId
        ? {
            id: row.feedbackId,
            lecturerId: row.feedbackLecturerId,
            branchingAttemptId: row.feedbackBranchingAttemptId ?? null,
            reviewSubmissionId: row.feedbackReviewSubmissionId ?? null,
            feedbackText: row.feedbackText,
            createdAt: new Date(row.feedbackCreatedAt).toISOString(),
            updatedAt: new Date(row.feedbackUpdatedAt).toISOString(),
          }
        : null,
      reflectionStatus: row.reflectionStatus,
      reflectionText: row.reflectionText ?? null,
      submissionStatus: row.submissionStatus,
      studentAnalysis: row.studentAnalysis ?? null,
      proposedSolution: row.proposedSolution,
      reasoningText: row.reasoningText,
    }));

    // 2. Fetch completed Branching Study attempts
    const branchingRes = await this.db.query(
      `SELECT
         a.id AS "targetId",
         'BRANCHING_STUDY' AS "targetType",
         a.student_id AS "studentId",
         u.full_name AS "studentName",
         u.email AS "studentEmail",
         co.id AS "courseId",
         co.name AS "courseName",
         co.course_code AS "courseCode",
         c.id AS "caseId",
         c.title AS "caseTitle",
         COALESCE(a.completed_at, a.updated_at) AS "submittedAt",
         a.attempt_number AS "attemptNumber",
         a.is_completed AS "isCompleted",
         a.reflection_status AS "reflectionStatus",
         a.reflection_text AS "reflectionText",
         cn.situation AS "outcomeSituation",
         f.id AS "feedbackId",
         f.lecturer_id AS "feedbackLecturerId",
         f.branching_attempt_id AS "feedbackBranchingAttemptId",
         f.review_submission_id AS "feedbackReviewSubmissionId",
         f.feedback_text AS "feedbackText",
         f.created_at AS "feedbackCreatedAt",
         f.updated_at AS "feedbackUpdatedAt"
       FROM branching_attempts a
       JOIN users u ON a.student_id = u.id
       JOIN cases c ON a.case_id = c.id
       JOIN courses co ON c.course_id = co.id
       LEFT JOIN case_nodes cn ON a.outcome_node_id = cn.id
       LEFT JOIN lecturer_feedback f ON f.branching_attempt_id = a.id
       WHERE a.is_completed = TRUE
         AND co.lecturer_id = $1
         AND ($2::uuid IS NULL OR co.id = $2::uuid)
         AND ($3::uuid IS NULL OR c.id = $3::uuid)`,
      [lecturerId, query.courseId ?? null, query.caseId ?? null],
    );

    // 3. Batch query steps for all branching attempts (C3-A)
    const branchingAttemptIds: string[] = branchingRes.rows.map((r) => r.targetId);
    const stepsByAttemptId = new Map<string, StepDto[]>();

    if (branchingAttemptIds.length > 0) {
      const stepsRes = await this.db.query(
        `SELECT
           sr.attempt_id,
           sr.node_id AS "nodeId",
           cn.situation,
           co.option_text AS "selectedOptionText",
           sr.reasoning_text AS "reasoningText",
           sr.submitted_at
         FROM student_reasoning sr
         JOIN case_nodes cn ON sr.node_id = cn.id
         JOIN case_options co ON sr.selected_option_id = co.id
         WHERE sr.attempt_id = ANY($1::uuid[])
         ORDER BY sr.submitted_at ASC`,
        [branchingAttemptIds],
      );

      for (const stepRow of stepsRes.rows) {
        const attemptId = stepRow.attempt_id;
        if (!stepsByAttemptId.has(attemptId)) {
          stepsByAttemptId.set(attemptId, []);
        }
        stepsByAttemptId.get(attemptId)!.push({
          nodeId: stepRow.nodeId,
          situation: stepRow.situation,
          selectedOptionText: stepRow.selectedOptionText,
          reasoningText: stepRow.reasoningText ?? null,
        });
      }
    }

    const branchingItems: SubmissionQueueItemDto[] = branchingRes.rows.map((row) => {
      const steps = stepsByAttemptId.get(row.targetId) ?? [];
      return {
        targetType: "BRANCHING_STUDY",
        targetId: row.targetId,
        studentId: row.studentId,
        studentName: row.studentName,
        studentEmail: row.studentEmail,
        courseId: row.courseId,
        courseName: row.courseName,
        courseCode: row.courseCode ?? null,
        caseId: row.caseId,
        caseTitle: row.caseTitle,
        submittedAt: new Date(row.submittedAt).toISOString(),
        feedbackStatus: row.feedbackId ? "REVIEWED" : "PENDING",
        existingFeedback: row.feedbackId
          ? {
              id: row.feedbackId,
              lecturerId: row.feedbackLecturerId,
              branchingAttemptId: row.feedbackBranchingAttemptId ?? null,
              reviewSubmissionId: row.feedbackReviewSubmissionId ?? null,
              feedbackText: row.feedbackText,
              createdAt: new Date(row.feedbackCreatedAt).toISOString(),
              updatedAt: new Date(row.feedbackUpdatedAt).toISOString(),
            }
          : null,
        reflectionStatus: row.reflectionStatus,
        reflectionText: row.reflectionText ?? null,
        attemptNumber: row.attemptNumber,
        isCompleted: row.isCompleted,
        outcomeSituation: row.outcomeSituation ?? null,
        stepsCount: steps.length,
        steps,
      };
    });

    // 4. Merge and sort descending by submittedAt
    const items = [...reviewItems, ...branchingItems].sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return { items };
  }
}
