import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
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
   * Verify student identity from authenticated token
   */
  async resolveStudent(studentId?: string): Promise<string> {
    if (!studentId) {
      throw new ForbiddenException("Authentication required: student identity missing");
    }

    const res = await this.db.query(
      "SELECT id FROM users WHERE id = $1 AND role = 'STUDENT'",
      [studentId],
    );
    if (res.rows.length === 0) {
      throw new ForbiddenException("Invalid student identity");
    }
    return res.rows[0].id;
  }

  /**
   * Flow 4: Start or Retry Branching Attempt
   * - Enforces PUBLISHED status invariant (students cannot start unpublished cases).
   * - Finds previous attempts, increments attempt_number.
   * - Sets initial current_node_id to case.root_node_id.
   */
  async startAttempt(caseId: string, studentId: string) {
    const effectiveStudentId = await this.resolveStudent(studentId);
    const attemptId = randomUUID();

    // Locking the published Case row serializes attempt-number allocation for
    // concurrent requests on this Case. The unique constraint on
    // (student_id, case_id, attempt_number) remains the final integrity guard.
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");
      const caseRes = await client.query(
        "SELECT id, title, status, root_node_id, learning_mode FROM cases WHERE id = $1 AND status = 'PUBLISHED' FOR UPDATE",
        [caseId],
      );
      if (caseRes.rows.length === 0) {
        const existenceRes = await client.query("SELECT id FROM cases WHERE id = $1", [caseId]);
        if (existenceRes.rows.length > 0) {
          throw new ForbiddenException("Cannot start attempt on an unpublished case");
        }
        throw new NotFoundException(`Case ${caseId} not found`);
      }

      const caseData = caseRes.rows[0];
      if (caseData.learning_mode !== "BRANCHING_STUDY") {
        throw new BadRequestException("Case is not a BRANCHING_STUDY mode case");
      }
      if (!caseData.root_node_id) {
        throw new BadRequestException("Case does not have an active root node");
      }

      const prevAttemptsRes = await client.query(
        "SELECT COALESCE(MAX(attempt_number), 0) as max_num FROM branching_attempts WHERE case_id = $1 AND student_id = $2",
        [caseId, effectiveStudentId],
      );
      const attemptNumber = parseInt(prevAttemptsRes.rows[0].max_num, 10) + 1;

      await client.query(
        `INSERT INTO branching_attempts (id, student_id, case_id, attempt_number, current_node_id, is_completed, reflection_status)
         VALUES ($1, $2, $3, $4, $5, FALSE, 'NOT_STARTED')`,
        [attemptId, effectiveStudentId, caseId, attemptNumber, caseData.root_node_id],
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }

    return this.getAttempt(attemptId, effectiveStudentId);
  }

  /**
   * Get Attempt Details with Steps and Current Node
   * - P0-SEC-02: For ongoing attempts, hides next_node_id and consequences.
   * - Consequences and alternative options are revealed ONLY when is_completed is TRUE (REVIEW phase).
   */
  async getAttempt(attemptId: string, studentId?: string, isLecturer = false) {
    const attemptRes = await this.db.query(
      `SELECT a.*, c.title as case_title, c.description as case_description
       FROM branching_attempts a
       JOIN cases c ON a.case_id = c.id
       WHERE a.id = $1
         AND ($2::boolean = TRUE OR (c.status = 'PUBLISHED' AND a.student_id = $3))`,
      [attemptId, isLecturer, studentId || null],
    );
    if (attemptRes.rows.length === 0) {
      if (!isLecturer) {
        const accessRes = await this.db.query(
          `SELECT a.student_id, c.status
           FROM branching_attempts a JOIN cases c ON c.id = a.case_id
           WHERE a.id = $1`,
          [attemptId],
        );
        if (accessRes.rows.length > 0) {
          if (!studentId || accessRes.rows[0].student_id !== studentId) {
            throw new ForbiddenException("You do not have permission to view this attempt");
          }
          if (accessRes.rows[0].status !== "PUBLISHED") {
            throw new ForbiddenException("Students can only access attempts for PUBLISHED cases");
          }
        }
      }
      throw new NotFoundException(`Attempt ${attemptId} not found`);
    }

    const attempt = attemptRes.rows[0];

    // Ownership check: If not lecturer, must be owner student
    if (!isLecturer && (!studentId || attempt.student_id !== studentId)) {
      throw new ForbiddenException("You do not have permission to view this attempt");
    }

    // Fetch steps taken
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
      let otherOptions = [];
      // Only reveal alternative options and consequences after completion (REVIEW phase)
      if (attempt.is_completed) {
        const otherOptionsRes = await this.db.query(
          "SELECT id, option_text as text FROM case_options WHERE node_id = $1 AND id != $2",
          [step.node_id, step.selected_option_id],
        );
        otherOptions = otherOptionsRes.rows;
      }

      steps.push({
        nodeId: step.node_id,
        situation: step.situation,
        selectedOptionId: step.selected_option_id,
        selectedOptionText: step.option_text,
        consequence: attempt.is_completed ? step.consequence : undefined,
        reasoningId: step.reasoning_id,
        reasoningText: step.reasoning_text,
        submittedAt: step.submitted_at,
        otherOptions,
      });
    }

    // Fetch current node info if not completed (P0-SEC-02: hide next_node_id and consequence)
    let currentNode = null;
    if (attempt.current_node_id && !attempt.is_completed) {
      const nodeRes = await this.db.query(
        "SELECT id, situation, is_terminal, node_index FROM case_nodes WHERE id = $1",
        [attempt.current_node_id],
      );
      if (nodeRes.rows.length > 0) {
        const node = nodeRes.rows[0];
        // Only return id and text; NO next_node_id, NO consequence
        const optionsRes = await this.db.query(
          "SELECT id, option_text as text FROM case_options WHERE node_id = $1",
          [node.id],
        );
        currentNode = {
          id: node.id,
          situation: node.situation,
          isTerminal: node.is_terminal,
          nodeIndex: node.node_index,
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
   * Assemble the post-completion Journey Review for the owning Student.
   * Authorization, Case publication, completion, and outcome checks happen
   * before any path or consequence rows are queried.
   */
  async getJourneyReview(caseId: string, attemptId: string, studentId?: string) {
    const effectiveStudentId = await this.resolveStudent(studentId);
    const reviewAccessRes = await this.db.query(
      `SELECT a.id, a.case_id, a.student_id, a.attempt_number, a.started_at,
              a.completed_at, a.outcome_node_id, c.title AS case_title,
              outcome.situation AS outcome_situation,
              outcome.node_index AS outcome_node_index
       FROM branching_attempts a
       JOIN cases c ON c.id = a.case_id
       JOIN case_nodes outcome ON outcome.id = a.outcome_node_id AND outcome.case_id = c.id
       WHERE a.id = $1 AND a.case_id = $2 AND a.student_id = $3
         AND c.status = 'PUBLISHED' AND a.is_completed = TRUE
         AND a.outcome_node_id IS NOT NULL AND outcome.is_terminal = TRUE`,
      [attemptId, caseId, effectiveStudentId],
    );

    if (reviewAccessRes.rows.length === 0) {
      const accessRes = await this.db.query(
        `SELECT a.case_id, a.student_id, a.is_completed, a.outcome_node_id, c.status
         FROM branching_attempts a JOIN cases c ON c.id = a.case_id
         WHERE a.id = $1`,
        [attemptId],
      );
      if (accessRes.rows.length === 0) {
        throw new NotFoundException(`Attempt ${attemptId} not found`);
      }

      const access = accessRes.rows[0];
      if (access.student_id !== effectiveStudentId || access.case_id !== caseId) {
        throw new ForbiddenException("You do not have permission to view this Journey Review");
      }
      if (access.status !== "PUBLISHED") {
        throw new ForbiddenException("Students can only access reviews for PUBLISHED cases");
      }
      if (!access.is_completed || !access.outcome_node_id) {
        throw new ForbiddenException("Journey Review is available only after the attempt is completed");
      }
      throw new BadRequestException("Attempt outcome is not a valid terminal node");
    }

    const attempt = reviewAccessRes.rows[0];
    const pathRes = await this.db.query(
      `SELECT r.node_id, r.selected_option_id, r.reasoning_text, r.submitted_at,
              n.situation, n.node_index,
              selected.option_text, selected.consequence, selected.next_node_id
       FROM student_reasoning r
       JOIN case_nodes n ON n.id = r.node_id AND n.case_id = $2
       JOIN case_options selected
         ON selected.id = r.selected_option_id AND selected.node_id = n.id
       WHERE r.attempt_id = $1
       ORDER BY r.submitted_at ASC, r.id ASC`,
      [attemptId, caseId],
    );

    const steps = pathRes.rows;
    for (let index = 0; index < steps.length; index += 1) {
      const expectedNextNodeId = steps[index].next_node_id || attempt.outcome_node_id;
      const actualNextNodeId = steps[index + 1]?.node_id || attempt.outcome_node_id;
      if (expectedNextNodeId !== actualNextNodeId) {
        throw new BadRequestException("Stored attempt path does not match its selected option links");
      }
    }
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const recordedOutcome = lastStep.next_node_id || lastStep.node_id;
      if (recordedOutcome !== attempt.outcome_node_id) {
        throw new BadRequestException("Stored path does not reach the recorded outcome node");
      }
    }

    const nodeIds = [...new Set(steps.map((step) => step.node_id))];
    const alternativesRes = nodeIds.length
      ? await this.db.query(
          `SELECT node_id, id, option_text
           FROM case_options
           WHERE node_id = ANY($1::uuid[])
           ORDER BY node_id, id`,
          [nodeIds],
        )
      : { rows: [] as any[] };
    const alternativesByNode = new Map<string, Array<{ id: string; text: string }>>();
    for (const option of alternativesRes.rows) {
      const options = alternativesByNode.get(option.node_id) || [];
      options.push({ id: option.id, text: option.option_text });
      alternativesByNode.set(option.node_id, options);
    }

    return {
      attemptId: attempt.id,
      caseId: attempt.case_id,
      caseTitle: attempt.case_title,
      attemptNumber: attempt.attempt_number,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      outcome: {
        nodeId: attempt.outcome_node_id,
        nodeIndex: attempt.outcome_node_index,
        situation: attempt.outcome_situation,
        outcomeText: steps[steps.length - 1]?.consequence || null,
      },
      path: steps.map((step, index) => ({
        step: index + 1,
        nodeId: step.node_id,
        nodeIndex: step.node_index,
        situation: step.situation,
        selectedOption: {
          id: step.selected_option_id,
          text: step.option_text,
          consequence: step.consequence,
          nextNodeId: step.next_node_id,
        },
        alternatives: (alternativesByNode.get(step.node_id) || [])
          .filter((option) => option.id !== step.selected_option_id),
        reasoningText: step.reasoning_text,
        submittedAt: step.submitted_at,
      })),
    };
  }

  /**
   * Flow 4: Experience-First Continuous Navigation
   * - P0-DATA-04: Protected by database transaction with SELECT ... FOR UPDATE.
   * - Enforces student ownership check.
   * - Non-blocking: student picks option, recorded immediately in student_reasoning.
   * - Consequence hidden until REVIEW phase.
   * - Transitions to next_node_id.
   * - Automatically completes attempt when terminal node is reached.
   */
  async chooseOption(attemptId: string, studentId: string, dto: ChooseOptionDto) {
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // Pessimistic lock on attempt row
      const attemptRes = await client.query(
        `SELECT a.*
         FROM branching_attempts a JOIN cases c ON c.id = a.case_id
         WHERE a.id = $1 AND c.status = 'PUBLISHED' FOR UPDATE OF a`,
        [attemptId],
      );
      if (attemptRes.rows.length === 0) {
        const accessRes = await client.query(
          `SELECT a.student_id, c.status
           FROM branching_attempts a JOIN cases c ON c.id = a.case_id
           WHERE a.id = $1`,
          [attemptId],
        );
        if (accessRes.rows.length > 0) {
          if (accessRes.rows[0].student_id !== studentId) {
            throw new ForbiddenException("You do not have permission to modify this attempt");
          }
          throw new ForbiddenException("Students can only access attempts for PUBLISHED cases");
        }
        throw new NotFoundException(`Attempt ${attemptId} not found`);
      }

      const attempt = attemptRes.rows[0];

      // Ownership enforcement
      if (attempt.student_id !== studentId) {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }

      if (attempt.is_completed) {
        throw new BadRequestException("This attempt has already reached its terminal outcome");
      }

      if (attempt.current_node_id !== dto.nodeId) {
        throw new BadRequestException("Submitted node does not match attempt's current node");
      }

      // Validate that option belongs to node
      const optionRes = await client.query(
        "SELECT id, option_text, consequence, next_node_id FROM case_options WHERE id = $1 AND node_id = $2",
        [dto.selectedOptionId, dto.nodeId],
      );
      if (optionRes.rows.length === 0) {
        throw new BadRequestException("Selected option does not belong to the current node");
      }
      const option = optionRes.rows[0];

      // Record option selection into student_reasoning
      const reasoningId = randomUUID();
      await client.query(
        `INSERT INTO student_reasoning (id, attempt_id, node_id, selected_option_id, reasoning_text, submitted_at)
         VALUES ($1, $2, $3, $4, NULL, NOW())
         ON CONFLICT (attempt_id, node_id)
         DO UPDATE SET selected_option_id = $4, reasoning_text = NULL, submitted_at = NOW()`,
        [reasoningId, attemptId, dto.nodeId, dto.selectedOptionId],
      );

      const nextNodeId = option.next_node_id;
      let isTerminalTransition = false;

      if (!nextNodeId) {
        // A null edge is valid only when the current node itself is terminal.
        const currentNodeRes = await client.query(
          "SELECT is_terminal FROM case_nodes WHERE id = $1 AND case_id = $2",
          [dto.nodeId, attempt.case_id],
        );
        if (currentNodeRes.rows.length === 0 || !currentNodeRes.rows[0].is_terminal) {
          throw new BadRequestException("Selected option does not lead to a valid terminal node");
        }
        isTerminalTransition = true;
      } else {
        const nextNodeRes = await client.query(
          "SELECT is_terminal FROM case_nodes WHERE id = $1 AND case_id = $2",
          [nextNodeId, attempt.case_id],
        );
        if (nextNodeRes.rows.length === 0) {
          throw new BadRequestException("Selected option points to an invalid node");
        }
        if (nextNodeRes.rows[0].is_terminal) {
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
      return this.getAttempt(attemptId, studentId);
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
   * - P0-DATA-04: Protected by FOR UPDATE transaction & ownership check.
   */
  async saveRetrospectiveReasoning(attemptId: string, studentId: string, dto: SaveReasoningDto) {
    const reasoningText = dto?.reasoningText?.trim();
    if (!reasoningText || reasoningText.length < 10 || reasoningText.length > 2000) {
      throw new BadRequestException("Reasoning must be between 10 and 2000 characters");
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      const attemptRes = await client.query(
        `SELECT a.student_id, a.is_completed, c.status AS case_status
         FROM branching_attempts a
         JOIN cases c ON c.id = a.case_id
         WHERE a.id = $1
         FOR UPDATE OF a`,
        [attemptId],
      );
      if (attemptRes.rows.length === 0) {
        throw new NotFoundException(`Attempt ${attemptId} not found`);
      }

      if (attemptRes.rows[0].student_id !== studentId) {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }
      if (attemptRes.rows[0].case_status !== "PUBLISHED") {
        throw new ForbiddenException("Students can only update reasoning for PUBLISHED cases");
      }
      if (!attemptRes.rows[0].is_completed) {
        throw new BadRequestException("Retrospective reasoning is available only after the attempt is completed");
      }

      const reasoningRes = await client.query(
        "SELECT id FROM student_reasoning WHERE attempt_id = $1 AND node_id = $2",
        [attemptId, dto.nodeId],
      );
      if (reasoningRes.rows.length === 0) {
        throw new NotFoundException("Reasoning entry for this decision node does not exist in this attempt");
      }

      const updatedRes = await client.query(
        `UPDATE student_reasoning SET reasoning_text = $1
         WHERE attempt_id = $2 AND node_id = $3
         RETURNING id`,
        [reasoningText, attemptId, dto.nodeId],
      );
      if (updatedRes.rows.length === 0) {
        throw new InternalServerErrorException("Reasoning could not be persisted");
      }

      await client.query("COMMIT");

      return {
        attemptId,
        nodeId: dto.nodeId,
        reasoningText,
        status: "SAVED",
      };
    } catch (e) {
      await Promise.resolve(client.query("ROLLBACK")).catch(() => undefined);
      this.logger.error(`Error saving retrospective reasoning: ${e.message}`, e.stack);
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * Flow 4: Reflection Submission
   * - P0-DATA-04: Protected by FOR UPDATE transaction.
   * - Checks ownership, checks is_completed.
   * - Prevents duplicate overwrite if already SUBMITTED.
   */
  async submitReflection(attemptId: string, studentId: string, dto: SubmitReflectionDto) {
    const reflectionText = dto?.reflectionText?.trim();
    if (!reflectionText || reflectionText.length > 2000) {
      throw new BadRequestException("Reflection must contain between 1 and 2000 characters");
    }

    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      const attemptRes = await client.query(
        `SELECT a.student_id, a.is_completed, a.reflection_status, c.status AS case_status
         FROM branching_attempts a
         JOIN cases c ON c.id = a.case_id
         WHERE a.id = $1
         FOR UPDATE OF a`,
        [attemptId],
      );
      if (attemptRes.rows.length === 0) {
        throw new NotFoundException(`Attempt ${attemptId} not found`);
      }

      const attempt = attemptRes.rows[0];

      if (attempt.student_id !== studentId) {
        throw new ForbiddenException("You do not have permission to modify this attempt");
      }
      if (attempt.case_status !== "PUBLISHED") {
        throw new ForbiddenException("Students can only submit reflections for PUBLISHED cases");
      }

      if (!attempt.is_completed) {
        throw new BadRequestException("Cannot submit reflection before reaching a terminal outcome");
      }

      if (attempt.reflection_status === "SUBMITTED") {
        throw new BadRequestException("Reflection has already been submitted and cannot be overwritten");
      }

      const updatedRes = await client.query(
        `UPDATE branching_attempts
         SET reflection_text = $1, reflection_status = 'SUBMITTED', reflection_submitted_at = NOW(), updated_at = NOW()
         WHERE id = $2
         RETURNING reflection_submitted_at`,
        [reflectionText, attemptId],
      );
      if (updatedRes.rows.length === 0) {
        throw new InternalServerErrorException("Reflection could not be persisted");
      }

      await client.query("COMMIT");

      return {
        attemptId,
        reflectionStatus: "SUBMITTED",
        reflectionText,
        reflectionSubmittedAt: updatedRes.rows[0].reflection_submitted_at,
      };
    } catch (e) {
      await Promise.resolve(client.query("ROLLBACK")).catch(() => undefined);
      this.logger.error(`Error submitting reflection: ${e.message}`, e.stack);
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * List all attempts of a student for a case
   */
  async getAttemptsByCase(caseId: string, studentId: string) {
    const effectiveStudentId = await this.resolveStudent(studentId);
    const publishedCaseRes = await this.db.query(
      "SELECT id FROM cases WHERE id = $1 AND status = 'PUBLISHED'",
      [caseId],
    );
    if (publishedCaseRes.rows.length === 0) {
      const existenceRes = await this.db.query("SELECT id FROM cases WHERE id = $1", [caseId]);
      if (existenceRes.rows.length > 0) {
        throw new ForbiddenException("Students can only access attempts for PUBLISHED cases");
      }
      throw new NotFoundException(`Case ${caseId} not found`);
    }
    const res = await this.db.query(
      `SELECT a.id, a.attempt_number, a.is_completed, a.reflection_status, a.started_at, a.completed_at
       FROM branching_attempts a
       JOIN cases c ON c.id = a.case_id
       WHERE a.case_id = $1 AND a.student_id = $2 AND c.status = 'PUBLISHED'
       ORDER BY attempt_number DESC`,
      [caseId, effectiveStudentId],
    );
    return res.rows;
  }
}
