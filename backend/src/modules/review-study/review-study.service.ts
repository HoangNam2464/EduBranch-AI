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
import { LecturerFeedbackDto, mapLecturerFeedback } from "../lecturer-feedback/lecturer-feedback.service";
import { SubmitReflectionDto } from "./dto/submit-reflection.dto";
import { SubmitReviewStudyDto } from "./dto/submit-review-study.dto";

export interface ReviewStudySubmissionRow {
  id: string;
  student_id: string;
  case_id: string;
  student_analysis: string | null;
  proposed_solution: string;
  reasoning_text: string;
  submission_status: "SUBMITTED" | "REVIEWED" | "REFLECTED";
  reflection_text: string | null;
  reflection_status: "NOT_STARTED" | "SUBMITTED";
  reflection_submitted_at: Date | string | null;
  submitted_at: Date | string;
  updated_at: Date | string;
}

export interface ReviewStudySubmissionDto {
  id: string;
  caseId: string;
  studentId: string;
  studentAnalysis: string | null;
  proposedSolution: string;
  reasoningText: string;
  submissionStatus: "SUBMITTED" | "REVIEWED" | "REFLECTED";
  reflectionText: string | null;
  reflectionStatus: "NOT_STARTED" | "SUBMITTED";
  reflectionSubmittedAt: string | null;
  submittedAt: string;
  updatedAt: string;
}

export function mapReviewStudySubmission(row: ReviewStudySubmissionRow): ReviewStudySubmissionDto {
  return {
    id: row.id,
    caseId: row.case_id,
    studentId: row.student_id,
    studentAnalysis: row.student_analysis ?? null,
    proposedSolution: row.proposed_solution,
    reasoningText: row.reasoning_text,
    submissionStatus: row.submission_status,
    reflectionText: row.reflection_text ?? null,
    reflectionStatus: row.reflection_status,
    reflectionSubmittedAt: row.reflection_submitted_at
      ? new Date(row.reflection_submitted_at).toISOString()
      : null,
    submittedAt: new Date(row.submitted_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

@Injectable()
export class ReviewStudyService {
  private readonly logger = new Logger(ReviewStudyService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * E1: POST /cases/:caseId/review-study/submit
   * FR-01..05: Student submits initial Review Study response.
   * R-INV01: Case must be PUBLISHED (otherwise 404).
   * Case must have learning_mode = 'REVIEW_STUDY' (otherwise 400).
   * 23505 UQ violation -> 409 Conflict.
   */
  async submit(
    caseId: string,
    studentId: string,
    dto: SubmitReviewStudyDto,
  ): Promise<ReviewStudySubmissionDto> {
    const submissionId = randomUUID();
    const studentAnalysis =
      dto.studentAnalysis && typeof dto.studentAnalysis === "string" && dto.studentAnalysis.trim().length > 0
        ? dto.studentAnalysis.trim()
        : null;

    try {
      // Keep publication/mode gating in the INSERT statement. This prevents a
      // status change between a separate preflight SELECT and the write.
      const res = await this.db.query<ReviewStudySubmissionRow>(
        `INSERT INTO review_study_submissions (
           id, student_id, case_id, student_analysis, proposed_solution, reasoning_text, submission_status
         )
         SELECT $1, $2, c.id, $4, $5, $6, 'SUBMITTED'
         FROM cases c
         WHERE c.id = $3 AND c.status = 'PUBLISHED' AND c.learning_mode = 'REVIEW_STUDY'
         RETURNING *`,
        [
          submissionId,
          studentId,
          caseId,
          studentAnalysis,
          dto.proposedSolution,
          dto.reasoningText,
        ],
      );

      if (res.rows.length === 0) {
        const caseRes = await this.db.query(
          `SELECT status, learning_mode FROM cases WHERE id = $1`,
          [caseId],
        );
        if (caseRes.rows.length === 0 || caseRes.rows[0].status !== "PUBLISHED") {
          throw new NotFoundException("Case not found");
        }
        throw new BadRequestException("Case is not in REVIEW_STUDY mode");
      }

      return mapReviewStudySubmission(res.rows[0]);
    } catch (err: any) {
      if (err.code === "23505") {
        throw new ConflictException("You have already submitted a review study for this case");
      }
      if (err.code === "23514") {
        throw new BadRequestException("Submission violates data constraints");
      }
      throw err;
    }
  }

  /**
   * E2: GET /cases/:caseId/review-study/submissions/me
   * FR-06: Student retrieves own submission for case.
   * R-INV01: Case must be PUBLISHED (otherwise 404).
   * Distinguishes SUBMISSION_NOT_FOUND error code for frontend form toggling.
   */
  async getMine(caseId: string, studentId: string): Promise<ReviewStudySubmissionDto> {
    const caseRes = await this.db.query(
      `SELECT id FROM cases WHERE id = $1 AND status = 'PUBLISHED'`,
      [caseId],
    );

    if (caseRes.rows.length === 0) {
      throw new NotFoundException("Case not found");
    }

    const res = await this.db.query<ReviewStudySubmissionRow>(
      `SELECT s.*
       FROM review_study_submissions s
       JOIN cases c ON s.case_id = c.id
       WHERE s.case_id = $1 AND s.student_id = $2 AND c.status = 'PUBLISHED'`,
      [caseId, studentId],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException({
        statusCode: 404,
        error: "SUBMISSION_NOT_FOUND",
        message: "No submission found for this case",
      });
    }

    return mapReviewStudySubmission(res.rows[0]);
  }

  /**
   * E3: GET /review-study/submissions/:submissionId
   * FR-06: Submission detail by ID. Accessible to author (STUDENT, with R-INV01)
   * or course owner (LECTURER, even if case is DRAFT).
   */
  async getById(
    submissionId: string,
    user: { id: string; role: string },
  ): Promise<ReviewStudySubmissionDto> {
    if (user.role !== "STUDENT" && user.role !== "LECTURER") {
      throw new ForbiddenException("Only students and lecturers can view review study submissions");
    }

    const res = await this.db.query(
      `SELECT s.*, c.status AS case_status, co.lecturer_id
       FROM review_study_submissions s
       JOIN cases c ON s.case_id = c.id
       JOIN courses co ON c.course_id = co.id
       WHERE s.id = $1`,
      [submissionId],
    );

    if (res.rows.length === 0) {
      throw new NotFoundException("Review study submission not found");
    }

    const row = res.rows[0];

    if (user.role === "STUDENT") {
      if (row.case_status !== "PUBLISHED") {
        throw new NotFoundException("Review study submission not found");
      }
      if (row.student_id !== user.id) {
        throw new ForbiddenException("You do not have access to this submission");
      }
    } else if (user.role === "LECTURER") {
      if (row.lecturer_id !== user.id) {
        throw new ForbiddenException("You do not own the course for this submission");
      }
    }

    return mapReviewStudySubmission(row);
  }

  /**
   * E4: POST /review-study/submissions/:submissionId/reflection
   * FR-03, FR-07: Student submits reflection for REVIEWED submission.
   * Single conditional UPDATE protects against race conditions.
   */
  async submitReflection(
    submissionId: string,
    studentId: string,
    dto: SubmitReflectionDto,
  ): Promise<ReviewStudySubmissionDto> {
    const updateRes = await this.db.query<ReviewStudySubmissionRow>(
      `UPDATE review_study_submissions s
       SET reflection_text = $1,
           reflection_status = 'SUBMITTED',
           reflection_submitted_at = NOW(),
           submission_status = 'REFLECTED',
           updated_at = NOW()
       FROM cases c
       WHERE s.id = $2
         AND s.case_id = c.id
         AND s.student_id = $3
         AND c.status = 'PUBLISHED'
         AND s.submission_status = 'REVIEWED'
       RETURNING s.*`,
      [dto.reflectionText, submissionId, studentId],
    );

    if (updateRes.rows.length > 0) {
      return mapReviewStudySubmission(updateRes.rows[0]);
    }

    // Inspect failure reason
    const checkRes = await this.db.query(
      `SELECT s.id, s.student_id, s.submission_status, c.status AS case_status
       FROM review_study_submissions s
       JOIN cases c ON s.case_id = c.id
       WHERE s.id = $1`,
      [submissionId],
    );

    if (checkRes.rows.length === 0) {
      throw new NotFoundException("Review study submission not found");
    }

    const row = checkRes.rows[0];
    if (row.case_status !== "PUBLISHED") {
      throw new NotFoundException("Review study submission not found");
    }

    if (row.student_id !== studentId) {
      throw new ForbiddenException("You do not have permission to submit reflection for this submission");
    }

    if (row.submission_status === "SUBMITTED") {
      throw new ConflictException("Submission has not been reviewed by a lecturer yet");
    }

    if (row.submission_status === "REFLECTED") {
      throw new ConflictException("Reflection has already been submitted");
    }

    throw new ConflictException("Submission is not in REVIEWED status");
  }

  /**
   * E5: GET /review-study/submissions/:submissionId/feedback
   * FR-08: Student retrieves lecturer feedback on own submission.
   * R-INV01: Case must be PUBLISHED.
   * Returns { feedback: LecturerFeedbackDto | null }.
   */
  async getFeedback(
    submissionId: string,
    studentId: string,
  ): Promise<{ feedback: LecturerFeedbackDto | null }> {
    const checkRes = await this.db.query(
      `SELECT s.id, s.student_id, c.status AS case_status
       FROM review_study_submissions s
       JOIN cases c ON s.case_id = c.id
       WHERE s.id = $1`,
      [submissionId],
    );

    if (checkRes.rows.length === 0) {
      throw new NotFoundException("Review study submission not found");
    }

    const row = checkRes.rows[0];
    if (row.case_status !== "PUBLISHED") {
      throw new NotFoundException("Review study submission not found");
    }

    if (row.student_id !== studentId) {
      throw new ForbiddenException("You do not have access to this feedback");
    }

    const feedbackRes = await this.db.query(
      `SELECT * FROM lecturer_feedback WHERE review_submission_id = $1`,
      [submissionId],
    );

    if (feedbackRes.rows.length === 0) {
      return { feedback: null };
    }

    return { feedback: mapLecturerFeedback(feedbackRes.rows[0]) };
  }
}
