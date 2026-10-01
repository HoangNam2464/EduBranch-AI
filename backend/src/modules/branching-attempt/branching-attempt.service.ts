import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { DatabaseService } from "../../common/database/database.service";
import { randomUUID } from "crypto";

export interface ChooseOptionDto {
  nodeId: string;
  selectedOptionId: string;
}

export interface SaveReasoningDto {
  nodeId: string;
  reasoningText: string;
}

export interface SubmitReflectionDto {
  reflectionText: string;
}

@Injectable()
export class BranchingAttemptService {
  private readonly logger = new Logger(BranchingAttemptService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Resolve or create default student for dev/test if not authenticated
   */
  async resolveStudent(studentId?: string): Promise<string> {
    if (studentId) {
      const res = await this.db.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'STUDENT'",
        [studentId],
      );
      if (res.rows.length > 0) return res.rows[0].id;
    }

    const defaultStudent = await this.db.query(
      "SELECT id FROM users WHERE role = 'STUDENT' LIMIT 1",
    );
    if (defaultStudent.rows.length > 0) {
      return defaultStudent.rows[0].id;
    }

    const newId = randomUUID();
    await this.db.query(
      `INSERT INTO users (id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'STUDENT')
       ON CONFLICT DO NOTHING`,
      [newId, `student_${newId.slice(0, 8)}@university.edu`, "hash", "University Student"],
    );
    return newId;
  }

  /**
   * Flow 4: Start or Retry Branching Attempt
   * - Enforces PUBLISHED status invariant (students cannot start unpublished cases).
   * - Finds previous attempts, increments attempt_number.
   * - Sets initial current_node_id to case.root_node_id.
   */
  async startAttempt(caseId: string, studentId?: string) {
    const effectiveStudentId = await this.resolveStudent(studentId);

    const caseRes = await this.db.query(
      "SELECT id, title, status, root_node_id, learning_mode FROM cases WHERE id = $1",
      [caseId],
    );
    if (caseRes.rows.length === 0) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    const caseData = caseRes.rows[0];
    if (caseData.status !== "PUBLISHED") {
      throw new ForbiddenException("Cannot start attempt on an unpublished case");
    }

    if (caseData.learning_mode !== "BRANCHING_STUDY") {
      throw new BadRequestException("Case is not a BRANCHING_STUDY mode case");
    }

    if (!caseData.root_node_id) {
      throw new BadRequestException("Case does not have an active root node");
    }

    // Determine attempt number
    const prevAttemptsRes = await this.db.query(
      "SELECT COALESCE(MAX(attempt_number), 0) as max_num FROM branching_attempts WHERE case_id = $1 AND student_id = $2",
      [caseId, effectiveStudentId],
    );
    const attemptNumber = parseInt(prevAttemptsRes.rows[0].max_num, 10) + 1;

    const attemptId = randomUUID();
    await this.db.query(
      `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, current_node_id, is_completed, reflection_status)
       VALUES ($1, $2, $3, $4, $5, FALSE, 'NOT_STARTED')`,
      [attemptId, effectiveStudentId, caseId, attemptNumber, caseData.root_node_id],
    );

    return this.getAttempt(attemptId, effectiveStudentId);
  }

  /**
   * Get Attempt Details with Steps and Current Node
   */
  async getAttempt(attemptId: string, studentId?: string) {
    const attemptRes = await this.db.query(
      `SELECT a.*, c.title as case_title, c.description as case_description
       FROM branching_attempts a
       JOIN cases c ON a.case_id = c.id
       WHERE a.id = $1`,
      [attemptId],
    );
    if (attemptRes.rows.length === 0) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    const attempt = attemptRes.rows[0];

    // Fetch steps taken (with option and consequence)
    const stepsRes = await this.db.query(
      `SELECT r.id as reasoning_id, r.node_id, r.selected_option_id, r.reasoning_text, r.submitted_at,
              n.situation, n.is_terminal, n.node_index,
              o.option_text, o.consequence, o.next_node_id
       FROM student_reasoning r
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       WHERE r.attempt_id = $1
       ORDER BY r.submitted_at ASC`,
      [attemptId],
    );

    const steps = [];
    for (const step of stepsRes.rows) {
      // Find other options for this node for alternative review
      const otherOptionsRes = await this.db.query(
        "SELECT id, option_text as text FROM case_options WHERE node_id = $1 AND id != $2",
        [step.node_id, step.selected_option_id],
      );

      steps.push({
        nodeId: step.node_id,
        situation: step.situation,
        selectedOptionId: step.selected_option_id,
        selectedOptionText: step.option_text,
        // Consequences are revealed in Journey Review after reaching terminal outcome
        consequence: attempt.is_completed ? step.consequence : undefined,
        reasoningId: step.reasoning_id,
        reasoningText: step.reasoning_text,
        submittedAt: step.submitted_at,
        otherOptions: otherOptionsRes.rows,
      });
    }

    // Fetch current node info if not completed (no mid-flow consequence reveal)
    let currentNode = null;
    if (attempt.current_node_id && !attempt.is_completed) {
      const nodeRes = await this.db.query(
        "SELECT id, situation, is_terminal, node_index FROM case_nodes WHERE id = $1",
        [attempt.current_node_id],
      );
      if (nodeRes.rows.length > 0) {
        const node = nodeRes.rows[0];
        // Consequence is hidden during decisions; only revealed in Journey Review
        const optionsRes = await this.db.query(
          "SELECT id, option_text as text, next_node_id FROM case_options WHERE node_id = $1",
          [node.id],
        );
        currentNode = {
          ...node,
          options: optionsRes.rows,
        };
      }
    }

    // Fetch outcome node if completed
    let outcomeNode = null;
    if (attempt.outcome_node_id) {
      const outcomeRes = await this.db.query(
        "SELECT id, situation, is_terminal, node_index FROM case_nodes WHERE id = $1",
        [attempt.outcome_node_id],
      );
      if (outcomeRes.rows.length > 0) {
        outcomeNode = outcomeRes.rows[0];
      }
    }

    return {
      id: attempt.id,
      caseId: attempt.case_id,
      caseTitle: attempt.case_title,
      caseDescription: attempt.case_description,
      studentId: attempt.student_id,
      attemptNumber: attempt.attempt_number,
      currentNodeId: attempt.current_node_id,
      outcomeNodeId: attempt.outcome_node_id,
      outcomeNode,
      isCompleted: attempt.is_completed,
      reflectionText: attempt.reflection_text,
      reflectionStatus: attempt.reflection_status,
      reflectionSubmittedAt: attempt.reflection_submitted_at,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      currentNode,
      steps,
    };
  }

  /**
   * Flow 4: Experience-First Continuous Navigation
   * - Non-blocking: student picks option, recorded immediately in student_reasoning.
   * - Consequence hidden until REVIEW phase.
   * - Transitions to next_node_id.
   * - Automatically completes attempt when terminal node is reached.
   */
  async chooseOption(attemptId: string, dto: ChooseOptionDto) {
    const attemptRes = await this.db.query(
      "SELECT * FROM branching_attempts WHERE id = $1",
      [attemptId],
    );
    if (attemptRes.rows.length === 0) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    const attempt = attemptRes.rows[0];
    if (attempt.is_completed) {
      throw new BadRequestException("This attempt has already reached its terminal outcome");
    }

    if (attempt.current_node_id !== dto.nodeId) {
      throw new BadRequestException("Submitted node does not match attempt's current node");
    }

    // Validate that option belongs to node
    const optionRes = await this.db.query(
      "SELECT id, option_text, consequence, next_node_id FROM case_options WHERE id = $1 AND node_id = $2",
      [dto.selectedOptionId, dto.nodeId],
    );
    if (optionRes.rows.length === 0) {
      throw new BadRequestException("Selected option does not belong to the current node");
    }
    const option = optionRes.rows[0];

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // Record option selection into student_reasoning
      const reasoningId = randomUUID();
      await client.query(
        `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, submitted_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (attempt_id, node_id)
         DO UPDATE SET selected_option_id = $4, submitted_at = NOW()`,
        [reasoningId, attemptId, dto.nodeId, dto.selectedOptionId],
      );

      const nextNodeId = option.next_node_id;
      let isTerminalTransition = false;

      if (!nextNodeId) {
        // If next_node_id is null, current node is terminal for this path
        isTerminalTransition = true;
      } else {
        const nextNodeRes = await client.query(
          "SELECT is_terminal FROM case_nodes WHERE id = $1",
          [nextNodeId],
        );
        if (nextNodeRes.rows.length === 0 || nextNodeRes.rows[0].is_terminal) {
          isTerminalTransition = true;
        }
      }

      if (isTerminalTransition) {
        await client.query(
          `UPDATE branching_attempts
           SET current_node_id = $1, outcome_node_id = $1, is_completed = TRUE, completed_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [nextNodeId || dto.nodeId, attemptId],
        );
      } else {
        await client.query(
          `UPDATE branching_attempts
           SET current_node_id = $1, updated_at = NOW()
           WHERE id = $2`,
          [nextNodeId, attemptId],
        );
      }

      await client.query("COMMIT");
      return this.getAttempt(attemptId);
    } catch (e) {
      await client.query("ROLLBACK");
      this.logger.error(`Error choosing option: ${e.message}`, e.stack);
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Flow 4: Retrospective Reasoning in REVIEW Phase
   * Students reflect and write reasoning for decisions after reaching the outcome.
   */
  async saveRetrospectiveReasoning(attemptId: string, dto: SaveReasoningDto) {
    const reasoningRes = await this.db.query(
      "SELECT id FROM student_reasoning WHERE attempt_id = $1 AND node_id = $2",
      [attemptId, dto.nodeId],
    );
    if (reasoningRes.rows.length === 0) {
      throw new NotFoundException("Reasoning entry for this decision node does not exist in this attempt");
    }

    await this.db.query(
      "UPDATE student_reasoning SET reasoning_text = $1 WHERE attempt_id = $2 AND node_id = $3",
      [dto.reasoningText, attemptId, dto.nodeId],
    );

    return {
      attemptId,
      nodeId: dto.nodeId,
      reasoningText: dto.reasoningText,
      status: "SAVED",
    };
  }

  /**
   * Flow 4: Reflection Submission
   */
  async submitReflection(attemptId: string, dto: SubmitReflectionDto) {
    const attemptRes = await this.db.query(
      "SELECT is_completed FROM branching_attempts WHERE id = $1",
      [attemptId],
    );
    if (attemptRes.rows.length === 0) {
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    if (!attemptRes.rows[0].is_completed) {
      throw new BadRequestException("Cannot submit reflection before reaching a terminal outcome");
    }

    await this.db.query(
      `UPDATE branching_attempts
       SET reflection_text = $1, reflection_status = 'SUBMITTED', reflection_submitted_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [dto.reflectionText, attemptId],
    );

    return {
      attemptId,
      reflectionStatus: "SUBMITTED",
      reflectionText: dto.reflectionText,
    };
  }

  /**
   * List all attempts of a student for a case
   */
  async getAttemptsByCase(caseId: string, studentId?: string) {
    const effectiveStudentId = await this.resolveStudent(studentId);
    const res = await this.db.query(
      `SELECT id, attempt_number, is_completed, reflection_status, started_at, completed_at
       FROM branching_attempts
       WHERE case_id = $1 AND student_id = $2
       ORDER BY attempt_number DESC`,
      [caseId, effectiveStudentId],
    );
    return res.rows;
  }
}
