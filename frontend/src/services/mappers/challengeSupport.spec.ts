import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toChallengeSession } from "./challengeSupport";

describe("toChallengeSession", () => {
  it("maps camelCase backend response to ChallengeSession domain model", () => {
    const raw = {
      id: "session-1",
      reasoningId: "reasoning-1",
      reviewSubmissionId: null,
      currentRound: 1,
      isCompleted: false,
      createdAt: "2026-11-19T10:00:00Z",
      updatedAt: "2026-11-19T10:00:00Z",
      messages: [
        {
          id: "m-1",
          sessionId: "session-1",
          roundNumber: 1,
          role: "CHALLENGE_SUPPORT" as const,
          content: "What is your fallback plan?",
          createdAt: "2026-11-19T10:00:00Z",
        },
      ],
    };

    const session = toChallengeSession(raw);

    assert.equal(session.id, "session-1");
    assert.equal(session.reasoningId, "reasoning-1");
    assert.equal(session.currentRound, 1);
    assert.equal(session.isCompleted, false);
    assert.equal(session.messages.length, 1);
    assert.equal(session.messages[0].content, "What is your fallback plan?");
    assert.equal((session as any).score, undefined);
  });

  it("maps snake_case raw SQL row to ChallengeSession safely", () => {
    const raw = {
      id: "session-2",
      reasoning_id: "reasoning-2",
      review_submission_id: null,
      current_round: 2,
      is_completed: true,
      created_at: "2026-11-19T10:00:00Z",
      updated_at: "2026-11-19T10:05:00Z",
      messages: [
        {
          id: "m-1",
          session_id: "session-2",
          round_number: 1,
          role: "CHALLENGE_SUPPORT",
          content: "Q1?",
          created_at: "2026-11-19T10:00:00Z",
        },
        {
          id: "m-2",
          session_id: "session-2",
          round_number: 1,
          role: "STUDENT",
          content: "A1",
          created_at: "2026-11-19T10:02:00Z",
        },
        {
          id: "m-3",
          session_id: "session-2",
          round_number: 2,
          role: "CHALLENGE_SUPPORT",
          content: "Q2?",
          created_at: "2026-11-19T10:05:00Z",
        },
      ],
    };

    const session = toChallengeSession(raw as any);

    assert.equal(session.id, "session-2");
    assert.equal(session.reasoningId, "reasoning-2");
    assert.equal(session.currentRound, 2);
    assert.equal(session.isCompleted, true);
    assert.equal(session.messages.length, 3);
  });
});
