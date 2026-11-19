import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { DatabaseService } from "../../common/database/database.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SendReplyDto } from "./dto/send-reply.dto";

export interface ChallengeMessage {
  id: string;
  sessionId: string;
  roundNumber: number;
  role: "CHALLENGE_SUPPORT" | "STUDENT";
  content: string;
  createdAt: string;
}

export interface ChallengeSession {
  id: string;
  reasoningId: string | null;
  reviewSubmissionId: string | null;
  currentRound: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ChallengeMessage[];
}

@Injectable()
export class ChallengeSupportService {
  private readonly logger = new Logger(ChallengeSupportService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly aiClient: AiClientService,
  ) {}

  /**
   * Helper to format DB rows into clean camelCase domain model.
   * Absolutely NO scoring, grading, or academic judgment attributes.
   */
  private formatSession(sessionRow: any, messageRows: any[] = []): ChallengeSession {
    return {
      id: sessionRow.id,
      reasoningId: sessionRow.reasoning_id ?? null,
      reviewSubmissionId: sessionRow.review_submission_id ?? null,
      currentRound: sessionRow.current_round,
      isCompleted: sessionRow.is_completed,
      createdAt: sessionRow.created_at,
      updatedAt: sessionRow.updated_at,
      messages: messageRows.map((m) => ({
        id: m.id,
        sessionId: m.session_id,
        roundNumber: m.round_number,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
      })),
    };
  }

  /**
   * POST /api/v1/challenge-support/sessions
   * Create a new Challenge Support session or retrieve the existing one.
   * Initiates Round 1 question generation via AI service.
   */
  async createOrGetSession(
    studentId: string,
    dto: CreateSessionDto,
  ): Promise<ChallengeSession> {
    const reasoningRes = await this.db.query(
      `SELECT r.id, r.attempt_id, r.node_id, r.selected_option_id, r.reasoning_text,
              n.situation, o.option_text, a.student_id, a.is_completed as attempt_completed, a.case_id
       FROM student_reasoning r
       JOIN branching_attempts a ON r.attempt_id = a.id
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       WHERE r.id = $1`,
      [dto.reasoningId],
    );

    if (reasoningRes.rows.length === 0) {
      throw new NotFoundException("Student reasoning not found");
    }

    const reasoning = reasoningRes.rows[0];

    if (reasoning.student_id !== studentId) {
      throw new ForbiddenException("You do not have permission to access this reasoning");
    }

    if (!reasoning.reasoning_text || reasoning.reasoning_text.trim().length === 0) {
      throw new BadRequestException(
        "Reasoning text is required before starting challenge support",
      );
    }

    // Check if session already exists for this reasoning_id (UNIQUE)
    const existingSessionRes = await this.db.query(
      `SELECT id, reasoning_id, review_submission_id, current_round, is_completed, created_at, updated_at
       FROM challenge_support_sessions
       WHERE reasoning_id = $1`,
      [dto.reasoningId],
    );

    if (existingSessionRes.rows.length > 0) {
      const existingSession = existingSessionRes.rows[0];
      const msgRes = await this.db.query(
        `SELECT id, session_id, round_number, role, content, created_at
         FROM challenge_messages
         WHERE session_id = $1
         ORDER BY round_number ASC, created_at ASC`,
        [existingSession.id],
      );
      return this.formatSession(existingSession, msgRes.rows);
    }

    // New session: Call AI service first before creating any records
    const sessionId = randomUUID();
    const caseContext = `Situation: ${reasoning.situation}\nChosen Option: ${reasoning.option_text}`;

    let aiResult;
    try {
      aiResult = await this.aiClient.generateChallenge({
        session_id: sessionId,
        reasoning_id: reasoning.id,
        student_reasoning: reasoning.reasoning_text,
        case_context: caseContext,
        round_number: 1,
        previous_exchange: [],
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to generate round 1 challenge question for session ${sessionId}: ${err.message}`,
      );
      throw new BadGatewayException({
        statusCode: 502,
        error: "Bad Gateway",
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI Challenge Support service is temporarily unavailable. Please retry.",
      });
    }

    // Transaction: Persist session and round 1 message atomically
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      const sessionInsert = await client.query(
        `INSERT INTO challenge_support_sessions (id, reasoning_id, current_round, is_completed)
         VALUES ($1, $2, 1, FALSE)
         RETURNING id, reasoning_id, review_submission_id, current_round, is_completed, created_at, updated_at`,
        [sessionId, reasoning.id],
      );

      const msgInsert = await client.query(
        `INSERT INTO challenge_messages (session_id, round_number, role, content)
         VALUES ($1, 1, 'CHALLENGE_SUPPORT', $2)
         RETURNING id, session_id, round_number, role, content, created_at`,
        [sessionId, aiResult.counter_question],
      );

      await client.query("COMMIT");
      return this.formatSession(sessionInsert.rows[0], msgInsert.rows);
    } catch (err: any) {
      await client.query("ROLLBACK");
      // Concurrent requests race: if another request created the session first (error code 23505),
      // reload the created session and return it (R1-H1)
      if (err?.code === "23505" || err?.message?.includes("23505")) {
        this.logger.warn(
          `Concurrent session creation detected for reasoning ${reasoning.id} (23505). Returning existing session.`,
        );
        const existingSessionRes = await this.db.query(
          `SELECT id, reasoning_id, review_submission_id, current_round, is_completed, created_at, updated_at
           FROM challenge_support_sessions
           WHERE reasoning_id = $1`,
          [reasoning.id],
        );
        if (existingSessionRes.rows.length > 0) {
          const existingSession = existingSessionRes.rows[0];
          const msgRes = await this.db.query(
            `SELECT id, session_id, round_number, role, content, created_at
             FROM challenge_messages
             WHERE session_id = $1
             ORDER BY round_number ASC, created_at ASC`,
            [existingSession.id],
          );
          return this.formatSession(existingSession, msgRes.rows);
        }
      }
      this.logger.error(`Database transaction failed creating session ${sessionId}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * POST /api/v1/challenge-support/sessions/:id/replies
   * Submits student reply for Round 1, generates Round 2 counter-question,
   * increments current_round to 2, and marks session as is_completed = TRUE.
   * If session is already completed or at round 2, rejects with 409 Conflict.
   */
  async sendReply(
    studentId: string,
    sessionId: string,
    dto: SendReplyDto,
  ): Promise<ChallengeSession> {
    const sessionRes = await this.db.query(
      `SELECT s.id, s.reasoning_id, s.review_submission_id, s.current_round, s.is_completed, s.created_at, s.updated_at,
              r.reasoning_text, n.situation, o.option_text, a.student_id
       FROM challenge_support_sessions s
       JOIN student_reasoning r ON s.reasoning_id = r.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       JOIN case_nodes n ON r.node_id = n.id
       JOIN case_options o ON r.selected_option_id = o.id
       WHERE s.id = $1`,
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      throw new NotFoundException("Challenge support session not found");
    }

    const session = sessionRes.rows[0];

    if (session.student_id !== studentId) {
      throw new ForbiddenException("You do not have permission to modify this session");
    }

    // Hard cap enforcement: reject round 3 or replies on completed sessions
    if (session.is_completed || session.current_round >= 2) {
      throw new ConflictException({
        statusCode: 409,
        error: "Conflict",
        code: "MAX_ROUNDS_REACHED",
        message: "Challenge support session has reached the maximum of 2 rounds",
      });
    }

    if (session.current_round !== 1) {
      throw new BadRequestException("Invalid round state for reply");
    }

    // Retrieve previous messages to build context
    const msgRes = await this.db.query(
      `SELECT id, session_id, round_number, role, content, created_at
       FROM challenge_messages
       WHERE session_id = $1
       ORDER BY round_number ASC, created_at ASC`,
      [sessionId],
    );

    const q1 = msgRes.rows.find(
      (m) => m.round_number === 1 && m.role === "CHALLENGE_SUPPORT",
    );

    const previousExchange = [
      { role: "CHALLENGE_SUPPORT", content: q1 ? q1.content : "" },
      { role: "STUDENT", content: dto.reply },
    ];

    const caseContext = `Situation: ${session.situation}\nChosen Option: ${session.option_text}`;

    // Call AI Service for Round 2 FIRST. If it fails, database state remains untouched.
    let aiResult;
    try {
      aiResult = await this.aiClient.generateChallenge({
        session_id: sessionId,
        reasoning_id: session.reasoning_id,
        student_reasoning: session.reasoning_text,
        case_context: caseContext,
        round_number: 2,
        previous_exchange: previousExchange,
      });
    } catch (err: any) {
      this.logger.error(
        `Failed to generate round 2 challenge question for session ${sessionId}: ${err.message}`,
      );
      throw new BadGatewayException({
        statusCode: 502,
        error: "Bad Gateway",
        code: "AI_SERVICE_UNAVAILABLE",
        message: "AI Challenge Support service is temporarily unavailable. Please retry.",
      });
    }

    // Atomically advance session to completed and persist messages
    // Concurrency protection (R1-H1): UPDATE first with current_round = 1 AND is_completed = FALSE.
    // If 0 rows updated (race condition with another concurrent request), ROLLBACK and throw 409.
    const client = await this.db.getClient();
    try {
      await client.query("BEGIN");

      // 1. Advance session to completed atomically
      const updatedSessionRes = await client.query(
        `UPDATE challenge_support_sessions
         SET current_round = 2, is_completed = TRUE, updated_at = NOW()
         WHERE id = $1 AND current_round = 1 AND is_completed = FALSE
         RETURNING id, reasoning_id, review_submission_id, current_round, is_completed, created_at, updated_at`,
        [sessionId],
      );

      if (updatedSessionRes.rows.length === 0) {
        await client.query("ROLLBACK");
        throw new ConflictException({
          statusCode: 409,
          error: "Conflict",
          code: "MAX_ROUNDS_REACHED",
          message: "Challenge support session has reached the maximum of 2 rounds",
        });
      }

      // 2. Insert student reply for round 1
      await client.query(
        `INSERT INTO challenge_messages (session_id, round_number, role, content)
         VALUES ($1, 1, 'STUDENT', $2)`,
        [sessionId, dto.reply],
      );

      // 3. Insert AI counter-question for round 2
      await client.query(
        `INSERT INTO challenge_messages (session_id, round_number, role, content)
         VALUES ($1, 2, 'CHALLENGE_SUPPORT', $2)`,
        [sessionId, aiResult.counter_question],
      );

      await client.query("COMMIT");

      // Fetch all messages for the response
      const allMsgsRes = await this.db.query(
        `SELECT id, session_id, round_number, role, content, created_at
         FROM challenge_messages
         WHERE session_id = $1
         ORDER BY round_number ASC, created_at ASC`,
        [sessionId],
      );

      return this.formatSession(updatedSessionRes.rows[0], allMsgsRes.rows);
    } catch (err) {
      await client.query("ROLLBACK");
      if (err instanceof ConflictException) {
        throw err;
      }
      this.logger.error(`Database transaction failed sending reply for session ${sessionId}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * GET /api/v1/challenge-support/sessions/:id
   * Retrieves an existing session and all associated messages.
   */
  async getSession(studentId: string, sessionId: string): Promise<ChallengeSession> {
    const sessionRes = await this.db.query(
      `SELECT s.id, s.reasoning_id, s.review_submission_id, s.current_round, s.is_completed, s.created_at, s.updated_at,
              a.student_id
       FROM challenge_support_sessions s
       JOIN student_reasoning r ON s.reasoning_id = r.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       WHERE s.id = $1`,
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      throw new NotFoundException("Challenge support session not found");
    }

    const session = sessionRes.rows[0];

    if (session.student_id !== studentId) {
      throw new ForbiddenException("You do not have permission to view this session");
    }

    const msgRes = await this.db.query(
      `SELECT id, session_id, round_number, role, content, created_at
       FROM challenge_messages
       WHERE session_id = $1
       ORDER BY round_number ASC, created_at ASC`,
      [sessionId],
    );

    return this.formatSession(session, msgRes.rows);
  }

  /**
   * POST /api/v1/challenge-support/sessions/:id/complete
   * Concludes a session early if the student chooses not to continue.
   */
  async completeSession(
    studentId: string,
    sessionId: string,
  ): Promise<ChallengeSession> {
    const sessionRes = await this.db.query(
      `SELECT s.id, s.reasoning_id, s.review_submission_id, s.current_round, s.is_completed, s.created_at, s.updated_at,
              a.student_id
       FROM challenge_support_sessions s
       JOIN student_reasoning r ON s.reasoning_id = r.id
       JOIN branching_attempts a ON r.attempt_id = a.id
       WHERE s.id = $1`,
      [sessionId],
    );

    if (sessionRes.rows.length === 0) {
      throw new NotFoundException("Challenge support session not found");
    }

    const session = sessionRes.rows[0];

    if (session.student_id !== studentId) {
      throw new ForbiddenException("You do not have permission to modify this session");
    }

    let updatedSession = session;
    if (!session.is_completed) {
      const updateRes = await this.db.query(
        `UPDATE challenge_support_sessions
         SET is_completed = TRUE, updated_at = NOW()
         WHERE id = $1
         RETURNING id, reasoning_id, review_submission_id, current_round, is_completed, created_at, updated_at`,
        [sessionId],
      );
      updatedSession = updateRes.rows[0];
    }

    const msgRes = await this.db.query(
      `SELECT id, session_id, round_number, role, content, created_at
       FROM challenge_messages
       WHERE session_id = $1
       ORDER BY round_number ASC, created_at ASC`,
      [sessionId],
    );

    return this.formatSession(updatedSession, msgRes.rows);
  }
}
