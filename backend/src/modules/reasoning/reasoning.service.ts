import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class ReasoningService {
  constructor(private readonly db: DatabaseService) {}

  async getReasoningById(id: string, studentId: string) {
    const res = await this.db.query(
      `SELECT r.*, n.situation, o.option_text,
              CASE WHEN a.is_completed THEN o.consequence ELSE NULL END AS consequence,
              a.case_id, a.student_id
       FROM student_reasoning r
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       JOIN cases c ON a.case_id = c.id
       WHERE r.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`,
      [id, studentId],
    );

    if (res.rows.length === 0) {
      // Classification query: checks existence without returning sensitive reasoning content
      const checkRes = await this.db.query(
        `SELECT r.id, a.student_id, c.status
         FROM student_reasoning r
         JOIN branching_attempts a ON r.attempt_id = a.id
         JOIN cases c ON a.case_id = c.id
         WHERE r.id = $1`,
        [id],
      );

      if (checkRes.rows.length === 0) {
        throw new NotFoundException(`Reasoning record ${id} not found`);
      }

      throw new ForbiddenException("You do not have permission to view this reasoning record");
    }

    return res.rows[0];
  }

  async getReasoningsByAttempt(attemptId: string, studentId: string) {
    // 1. Verify attempt ownership and published status
    const attemptRes = await this.db.query(
      `SELECT a.id, a.is_completed, a.student_id, c.status
       FROM branching_attempts a
       JOIN cases c ON a.case_id = c.id
       WHERE a.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`,
      [attemptId, studentId],
    );

    if (attemptRes.rows.length === 0) {
      // Classification query: checks attempt existence without returning sensitive content
      const checkAttemptRes = await this.db.query(
        `SELECT a.id, a.student_id, c.status
         FROM branching_attempts a
         JOIN cases c ON a.case_id = c.id
         WHERE a.id = $1`,
        [attemptId],
      );

      if (checkAttemptRes.rows.length === 0) {
        throw new NotFoundException(`Attempt ${attemptId} not found`);
      }

      throw new ForbiddenException("You do not have permission to view reasonings for this attempt");
    }

    // 2. Fetch student reasoning list with ownership, PUBLISHED and consequence hidden if not completed
    const res = await this.db.query(
      `SELECT r.*, n.situation, o.option_text,
              CASE WHEN a.is_completed THEN o.consequence ELSE NULL END AS consequence
       FROM student_reasoning r
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       JOIN cases c ON a.case_id = c.id
       WHERE r.attempt_id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'
       ORDER BY r.submitted_at ASC`,
      [attemptId, studentId],
    );

    return res.rows;
  }
}
