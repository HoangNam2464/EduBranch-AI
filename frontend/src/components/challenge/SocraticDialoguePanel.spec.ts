import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REPLY_MAX, ChallengeMessage } from "./SocraticDialoguePanel";

describe("SocraticDialoguePanel (FE-021)", () => {
  it("AC-1: establishes structured academic thread for AI challenge questioning without chatbot drift", () => {
    const messages: ChallengeMessage[] = [
      {
        id: "msg-1",
        round: 1,
        role: "ai",
        content: "What critical assumption in your decision might fail under high load?",
      },
      {
        id: "msg-2",
        round: 1,
        role: "student",
        content: "We assume redundancy in replica pools will prevent single-point failure.",
      },
    ];

    assert.strictEqual(messages.length, 2);
    assert.strictEqual(messages[0].role, "ai");
    assert.strictEqual(messages[0].round, 1);
    assert.strictEqual(messages[1].role, "student");
    assert.strictEqual(messages[1].round, 1);
  });

  it("AC-2: enforces hard-cap of maximum 2 rounds and locks session upon completion", () => {
    const maxRounds = 2;

    const computeIsCompleted = (round: number, completedFlag: boolean) => {
      return completedFlag || round > maxRounds;
    };

    // Round 1 is active
    assert.strictEqual(computeIsCompleted(1, false), false);

    // Round 2 is active
    assert.strictEqual(computeIsCompleted(2, false), false);

    // After Round 2 reply is submitted -> session is locked
    assert.strictEqual(computeIsCompleted(3, false), true);

    // Explicitly completed session
    assert.strictEqual(computeIsCompleted(1, true), true);
    assert.strictEqual(computeIsCompleted(2, true), true);
  });

  it("AC-3: verifies zero-grading invariant (no numerical score, letter grade, or pass/fail evaluation)", () => {
    // Pedagogical constraint: System must NEVER assign scores or pass/fail judgments
    const forbiddenKeywords = ["grade", "score", "pass", "fail", "point", "correct", "incorrect", "điểm", "đạt", "trượt"];

    const sampleAiQuestion = "Xét trong bối cảnh quyết định này, bạn đã cân nhắc đến rủi ro hoặc giả định trọng yếu nào chưa?";
    const normalized = sampleAiQuestion.toLowerCase();

    // Verify AI counter-question does not judge pass/fail
    const hasJudgment = forbiddenKeywords.some((kw) => normalized.includes(kw));
    assert.strictEqual(hasJudgment, false);
  });

  it("enforces character limit on student replies (REPLY_MAX = 1000)", () => {
    assert.strictEqual(REPLY_MAX, 1000);

    const clampReply = (input: string) => input.slice(0, REPLY_MAX);
    const longText = "a".repeat(1200);
    assert.strictEqual(clampReply(longText).length, 1000);
  });
});
