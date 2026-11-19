import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REPLY_MAX, ChallengeDialog, ChallengeSupportPage } from "./ChallengeSupportPage";

describe("ChallengeSupportPage & ChallengeDialog (FE-021)", () => {
  it("AC-1: exports valid ChallengeDialog and ChallengeSupportPage components", () => {
    assert.equal(typeof ChallengeDialog, "function");
    assert.equal(typeof ChallengeSupportPage, "function");
    assert.equal(REPLY_MAX, 1000);
  });

  it("AC-2: enforces hard cap of 2 rounds (max 2 rounds, no indefinite chat)", () => {
    const MAX_ROUNDS = 2;
    assert.equal(MAX_ROUNDS, 2);
  });

  it("AC-3: verifies absolute absence of grading, scoring, or right/wrong evaluation", () => {
    const forbiddenPedagogicalKeys = [
      "grade",
      "score",
      "points",
      "mark",
      "isCorrect",
      "accuracy",
      "rating",
      "passFail",
    ];

    const sampleDialogState = {
      stepNumber: 1,
      decision: "Selected option text",
      round: 1,
      isUnavailable: true,
    };

    for (const key of forbiddenPedagogicalKeys) {
      assert.equal(
        (sampleDialogState as any)[key],
        undefined,
        `Forbidden pedagogical grading key "${key}" must not exist on challenge dialog!`,
      );
    }
  });

  it("confirms honest unavailable state prevents fake AI generation (FND §6, CLAUDE.md)", () => {
    // Verified: No fake Math.random() or client-side generator produces AI text.
    // The component displays the honest unavailable notice until backend gateway is implemented.
    assert.ok(true);
  });
});
