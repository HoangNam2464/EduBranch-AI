import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class ReasoningService {
  constructor(private readonly db: DatabaseService) {}

  async getReasoningById(id: string, user?: { id: string; role: string }) {
    if (user?.role === "STUDENT") {
      const publishedRes = await this.db.query(
        `SELECT r.*, n.situation, o.option_text, o.consequence, a.case_id, a.student_id
         FROM student_reasoning r
         JOIN case_nodes n ON r.node_id = n.id
         JOIN case_options o ON r.selected_option_id = o.id
         JOIN branching_attempts a ON r.attempt_id = a.id
         JOIN cases c ON c.id = a.case_id
         WHERE r.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`,
        [id, user.id],
      );
      if (publishedRes.rows.length > 0) return publishedRes.rows[0];

      const accessRes = await this.db.query(
        `SELECT a.student_id, c.status
         FROM student_reasoning r
         JOIN branching_attempts a ON a.id = r.attempt_id
         JOIN cases c ON c.id = a.case_id
         WHERE r.id = $1`,
        [id],
      );
      if (accessRes.rows.length === 0) throw new NotFoundException(`Reasoning record ${id} not found`);
      throw new ForbiddenException("Students can only access their own reasoning for PUBLISHED cases");
    }

    const res = await this.db.query(
      `SELECT r.*, n.situation, o.option_text, o.consequence, a.case_id, a.student_id
       FROM student_reasoning r
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       WHERE r.id = $1`,
      [id],
    );
    if (res.rows.length === 0) {
      throw new NotFoundException(`Reasoning record ${id} not found`);
    }
    return res.rows[0];
  }

  async getReasoningsByAttempt(attemptId: string, user?: { id: string; role: string }) {
    if (user?.role === "STUDENT") {
      const publishedAttemptRes = await this.db.query(
        `SELECT a.id
         FROM branching_attempts a
         JOIN cases c ON c.id = a.case_id
         WHERE a.id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'`,
        [attemptId, user.id],
      );
      if (publishedAttemptRes.rows.length === 0) {
        const accessRes = await this.db.query(
          `SELECT a.student_id, c.status
           FROM branching_attempts a JOIN cases c ON c.id = a.case_id
           WHERE a.id = $1`,
          [attemptId],
        );
        if (accessRes.rows.length === 0) throw new NotFoundException(`Attempt ${attemptId} not found`);
        throw new ForbiddenException("Students can only access their own reasoning for PUBLISHED cases");
      }

      const studentRows = await this.db.query(
        `SELECT r.*, n.situation, o.option_text, o.consequence
         FROM student_reasoning r
         JOIN case_nodes n ON r.node_id = n.id
         JOIN case_options o ON r.selected_option_id = o.id
         JOIN branching_attempts a ON a.id = r.attempt_id
         JOIN cases c ON c.id = a.case_id
         WHERE r.attempt_id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'
         ORDER BY r.submitted_at ASC`,
        [attemptId, user.id],
      );
      return studentRows.rows;
    }

    const res = await this.db.query(
      `SELECT r.*, n.situation, o.option_text, o.consequence
       FROM student_reasoning r
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       WHERE r.attempt_id = $1
       ORDER BY r.submitted_at ASC`,
      [attemptId],
    );
    return res.rows;
  }
}
