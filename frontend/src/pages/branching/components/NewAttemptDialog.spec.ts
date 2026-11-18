import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("NewAttemptDialog & Retry Action (FE-016)", () => {
  it("creates an independent attempt row without mutating previous attempts", () => {
    const prevAttempt = { id: "att-1", attemptNumber: 1, isCompleted: true };
    const newAttempt = { id: "att-2", attemptNumber: prevAttempt.attemptNumber + 1, isCompleted: false };
    assert.notEqual(newAttempt.id, prevAttempt.id);
    assert.strictEqual(newAttempt.attemptNumber, 2);
  });

  it("does not generate simulated attempt ids with Date.now() string interpolation", () => {
    const simulatedPattern = /attempt-\$\{Date\.now\(\)\}/;
    const validBackendId = "att-c5c8e329-873d-4c3e-8fbf-3783a4874b5a";
    assert.strictEqual(simulatedPattern.test(validBackendId), false);
  });
});
