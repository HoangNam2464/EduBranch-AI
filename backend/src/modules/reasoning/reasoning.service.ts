import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";

@Injectable()
export class ReasoningService {
  constructor(private readonly db: DatabaseService) {}

  async getReasoningById(id: string) {
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

  async getReasoningsByAttempt(attemptId: string) {
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
