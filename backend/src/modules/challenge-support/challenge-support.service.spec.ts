import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  BadGatewayException,
} from "@nestjs/common";
import {
  ChallengeSupportService,
} from "./challenge-support.service";
import { DatabaseService } from "../../common/database/database.service";
import { AiClientService } from "../../common/ai-client/ai-client.service";

describe("ChallengeSupportService (BE-027 / EBA-74)", () => {
  let service: ChallengeSupportService;
  let mockDb: any;
  let mockClient: any;
  let mockAiClient: any;

  const STUDENT_ID = "student-uuid-1111";
  const OTHER_STUDENT_ID = "student-uuid-9999";
  const REASONING_ID = "reasoning-uuid-2222";
  const SESSION_ID = "session-uuid-3333";

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockDb = {
      query: jest.fn(),
      getClient: jest.fn().mockResolvedValue(mockClient),
    };

    mockAiClient = {
      generateChallenge: jest.fn(),
    };

    service = new ChallengeSupportService(
      mockDb as unknown as DatabaseService,
      mockAiClient as unknown as AiClientService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrGetSession", () => {
    it("creates a new session and round 1 question atomically", async () => {
      // 1. Mock finding reasoning
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: REASONING_ID,
              attempt_id: "attempt-1",
              node_id: "node-1",
              selected_option_id: "option-1",
              reasoning_text: "We should isolate the host immediately to stop malware spreading.",
              situation: "Hospital network compromised by ransomware.",
              option_text: "Isolate infected servers.",
              student_id: STUDENT_ID,
              attempt_completed: true,
              case_id: "case-1",
            },
          ],
        })
        // 2. Mock checking existing session (none)
        .mockResolvedValueOnce({ rows: [] });

      // 3. Mock AI service success
      mockAiClient.generateChallenge.mockResolvedValue({
        counter_question: "How do you ensure vital patient monitoring remains online during isolation?",
        round_number: 1,
        is_final_round: false,
      });

      // 4. Mock client transaction
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              review_submission_id: null,
              current_round: 1,
              is_completed: false,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:00:00Z",
            },
          ],
        }) // INSERT session
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "How do you ensure vital patient monitoring remains online during isolation?",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        }) // INSERT message
        .mockResolvedValueOnce({}); // COMMIT

      const result = await service.createOrGetSession(STUDENT_ID, {
        reasoningId: REASONING_ID,
      });

      expect(result.id).toBe(SESSION_ID);
      expect(result.currentRound).toBe(1);
      expect(result.isCompleted).toBe(false);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe("CHALLENGE_SUPPORT");
      expect(result.messages[0].content).toContain("vital patient monitoring");
      // Verify no scoring/grading
      expect((result as any).score).toBeUndefined();
      expect((result as any).grade).toBeUndefined();
      expect((result as any).passFail).toBeUndefined();

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });

    it("returns existing session without extra AI call if already created", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: REASONING_ID,
              attempt_id: "attempt-1",
              reasoning_text: "Existing reasoning text.",
              situation: "Situation",
              option_text: "Option",
              student_id: STUDENT_ID,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              review_submission_id: null,
              current_round: 1,
              is_completed: false,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:00:00Z",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Existing counter question?",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      const result = await service.createOrGetSession(STUDENT_ID, {
        reasoningId: REASONING_ID,
      });

      expect(result.id).toBe(SESSION_ID);
      expect(result.messages).toHaveLength(1);
      expect(mockAiClient.generateChallenge).not.toHaveBeenCalled();
      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it("throws NotFoundException if reasoning does not exist", async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      await expect(
        service.createOrGetSession(STUDENT_ID, { reasoningId: REASONING_ID }),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException if student does not own attempt", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: REASONING_ID,
            student_id: OTHER_STUDENT_ID,
            reasoning_text: "Valid text",
          },
        ],
      });

      await expect(
        service.createOrGetSession(STUDENT_ID, { reasoningId: REASONING_ID }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("throws BadRequestException if reasoning_text is missing or empty", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: REASONING_ID,
            student_id: STUDENT_ID,
            reasoning_text: "   ",
          },
        ],
      });

      await expect(
        service.createOrGetSession(STUDENT_ID, { reasoningId: REASONING_ID }),
      ).rejects.toThrow(BadRequestException);
    });

    it("leaves database state untouched when AI provider fails on round 1", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: REASONING_ID,
              attempt_id: "attempt-1",
              reasoning_text: "Reasoning for failure test.",
              situation: "Situation",
              option_text: "Option",
              student_id: STUDENT_ID,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // No existing session

      mockAiClient.generateChallenge.mockRejectedValue(
        new Error("AI Service provider timeout"),
      );

      await expect(
        service.createOrGetSession(STUDENT_ID, { reasoningId: REASONING_ID }),
      ).rejects.toThrow(BadGatewayException);

      // Verify that no database transaction was initiated
      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it("handles race condition 23505 by rolling back and returning existing session (R1-H1)", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: REASONING_ID,
              attempt_id: "attempt-1",
              node_id: "node-1",
              selected_option_id: "option-1",
              reasoning_text: "Reasoning for race test.",
              situation: "Situation",
              option_text: "Option",
              student_id: STUDENT_ID,
              attempt_completed: true,
              case_id: "case-1",
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }); // Initial check found no session

      mockAiClient.generateChallenge.mockResolvedValue({
        counter_question: "Race question",
        round_number: 1,
        is_final_round: false,
      });

      // Transaction fails with unique violation (23505) because another concurrent request won
      const uniqueErr: any = new Error("duplicate key value violates unique constraint");
      uniqueErr.code = "23505";
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockRejectedValueOnce(uniqueErr); // INSERT fails

      // Service catches 23505, rolls back, and fetches the existing session + messages
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              review_submission_id: null,
              current_round: 1,
              is_completed: false,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:00:00Z",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Concurrent question",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      const result = await service.createOrGetSession(STUDENT_ID, {
        reasoningId: REASONING_ID,
      });

      expect(result.id).toBe(SESSION_ID);
      expect(result.messages).toHaveLength(1);
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    });
  });

  describe("sendReply (Round 2 and Two-Round Cap)", () => {
    it("submits round 1 reply, generates round 2 question, and marks session completed", async () => {
      // 1. Mock finding active session at round 1
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              review_submission_id: null,
              current_round: 1,
              is_completed: false,
              reasoning_text: "Initial reasoning",
              situation: "Situation",
              option_text: "Option",
              student_id: STUDENT_ID,
            },
          ],
        })
        // 2. Mock previous messages
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Round 1 question?",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      // 3. Mock AI service round 2 success
      mockAiClient.generateChallenge.mockResolvedValue({
        counter_question: "Round 2 final counter question?",
        round_number: 2,
        is_final_round: true,
      });

      // 4. Mock client transaction
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              review_submission_id: null,
              current_round: 2,
              is_completed: true,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:05:00Z",
            },
          ],
        }) // UPDATE session
        .mockResolvedValueOnce({}) // INSERT student reply
        .mockResolvedValueOnce({}) // INSERT AI round 2 question
        .mockResolvedValueOnce({}); // COMMIT

      // 5. Mock fetching updated messages
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: "msg-1",
            session_id: SESSION_ID,
            round_number: 1,
            role: "CHALLENGE_SUPPORT",
            content: "Round 1 question?",
            created_at: "2026-11-19T10:00:00Z",
          },
          {
            id: "msg-2",
            session_id: SESSION_ID,
            round_number: 1,
            role: "STUDENT",
            content: "Student reply clarifying telemetry backup.",
            created_at: "2026-11-19T10:04:00Z",
          },
          {
            id: "msg-3",
            session_id: SESSION_ID,
            round_number: 2,
            role: "CHALLENGE_SUPPORT",
            content: "Round 2 final counter question?",
            created_at: "2026-11-19T10:05:00Z",
          },
        ],
      });

      const result = await service.sendReply(STUDENT_ID, SESSION_ID, {
        reply: "Student reply clarifying telemetry backup.",
      });

      expect(result.currentRound).toBe(2);
      expect(result.isCompleted).toBe(true);
      expect(result.messages).toHaveLength(3);
      expect(mockAiClient.generateChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          round_number: 2,
          student_reasoning: "Initial reasoning",
          previous_exchange: [
            { role: "CHALLENGE_SUPPORT", content: "Round 1 question?" },
            { role: "STUDENT", content: "Student reply clarifying telemetry backup." },
          ],
        }),
      );
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
    });

    it("refuses a third round with 409 Conflict when current_round >= 2 or is_completed", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: SESSION_ID,
            reasoning_id: REASONING_ID,
            current_round: 2,
            is_completed: true,
            student_id: STUDENT_ID,
          },
        ],
      });

      await expect(
        service.sendReply(STUDENT_ID, SESSION_ID, { reply: "Attempting round 3" }),
      ).rejects.toThrow(ConflictException);

      expect(mockAiClient.generateChallenge).not.toHaveBeenCalled();
      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it("leaves current_round and messages unchanged when provider fails during round 2", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              current_round: 1,
              is_completed: false,
              student_id: STUDENT_ID,
              situation: "Situation",
              option_text: "Option",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Round 1 question?",
            },
          ],
        });

      mockAiClient.generateChallenge.mockRejectedValue(
        new Error("AI Service 500 error"),
      );

      await expect(
        service.sendReply(STUDENT_ID, SESSION_ID, { reply: "My reply" }),
      ).rejects.toThrow(BadGatewayException);

      // Verify no DB changes were made
      expect(mockClient.query).not.toHaveBeenCalled();
    });

    it("throws ForbiddenException when another student attempts to reply", async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [
          {
            id: SESSION_ID,
            current_round: 1,
            is_completed: false,
            student_id: OTHER_STUDENT_ID,
          },
        ],
      });

      await expect(
        service.sendReply(STUDENT_ID, SESSION_ID, { reply: "Hi" }),
      ).rejects.toThrow(ForbiddenException);
    });

    it("handles race condition with 0-row UPDATE, rolls back, throws 409 and inserts zero messages (R1-H1)", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              current_round: 1,
              is_completed: false,
              reasoning_text: "Initial reasoning",
              situation: "Situation",
              option_text: "Option",
              student_id: STUDENT_ID,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Round 1 question?",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      mockAiClient.generateChallenge.mockResolvedValue({
        counter_question: "Round 2 question",
        round_number: 2,
        is_final_round: true,
      });

      // In transaction: UPDATE returns 0 rows because another concurrent request already updated it
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }); // UPDATE returned 0 rows!

      await expect(
        service.sendReply(STUDENT_ID, SESSION_ID, { reply: "Concurrent reply" }),
      ).rejects.toThrow(ConflictException);

      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
      expect(mockClient.query).not.toHaveBeenCalledWith("COMMIT");
      // Check that INSERT was never executed
      const insertCalls = mockClient.query.mock.calls.filter(
        (call: any[]) => typeof call[0] === "string" && call[0].includes("INSERT INTO challenge_messages"),
      );
      expect(insertCalls).toHaveLength(0);
    });
  });

  describe("getSession & completeSession", () => {
    it("retrieves session and message history for owner", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              current_round: 1,
              is_completed: false,
              student_id: STUDENT_ID,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:00:00Z",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Q1",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      const session = await service.getSession(STUDENT_ID, SESSION_ID);
      expect(session.id).toBe(SESSION_ID);
      expect(session.messages).toHaveLength(1);
    });

    it("completes session early if student concludes before round 2", async () => {
      mockDb.query
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              current_round: 1,
              is_completed: false,
              student_id: STUDENT_ID,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:00:00Z",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: SESSION_ID,
              reasoning_id: REASONING_ID,
              current_round: 1,
              is_completed: true,
              created_at: "2026-11-19T10:00:00Z",
              updated_at: "2026-11-19T10:05:00Z",
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: "msg-1",
              session_id: SESSION_ID,
              round_number: 1,
              role: "CHALLENGE_SUPPORT",
              content: "Q1",
              created_at: "2026-11-19T10:00:00Z",
            },
          ],
        });

      const session = await service.completeSession(STUDENT_ID, SESSION_ID);
      expect(session.isCompleted).toBe(true);
    });
  });
});
