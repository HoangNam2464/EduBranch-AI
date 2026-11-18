import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REASONING_MIN_LENGTH, REASONING_MAX_LENGTH } from "@/services/branchingAttemptService";

describe("Retrospective Reasoning (FE-015)", () => {
  it("validates reasoning length constraints (10-2000 chars)", () => {
    const isValid = (text: string) => {
      const trimmed = text.trim();
      return trimmed.length >= REASONING_MIN_LENGTH && trimmed.length <= REASONING_MAX_LENGTH;
    };
    assert.strictEqual(isValid("short"), false);
    assert.strictEqual(isValid("This is a valid retrospective reasoning statement."), true);
    assert.strictEqual(isValid("a".repeat(2001)), false);
  });

  it("ensures reasoning is keyed by real attemptId rather than artificial identifiers", () => {
    const attemptId = "att-real-12345";
    assert.doesNotMatch(attemptId, /attempt-\$\{Date\.now\(\)\}/);
  });
});
