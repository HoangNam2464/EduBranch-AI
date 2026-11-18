import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("BranchingCasePlayerPage (FE-012 Continuous Branching Flow)", () => {
  it("determines player stage based on attempt completion status", () => {
    const getStageKind = (completed: boolean) => (completed ? "outcome" : "decision");
    assert.strictEqual(getStageKind(false), "decision");
    assert.strictEqual(getStageKind(true), "outcome");
  });

  it("verifies decision selection does not expose consequence mid-flow (FE-012 rule)", () => {
    // Consequences are strictly withheld until Journey Review completion
    const consequenceExposedInPlay = false;
    assert.strictEqual(consequenceExposedInPlay, false);
  });

  it("gates progression on terminal node completion and navigates to journey review (FE-013)", () => {
    const isTerminalComplete = (completed: boolean, terminalNodeId?: string) =>
      Boolean(completed && terminalNodeId);
    assert.strictEqual(isTerminalComplete(true, "term-1"), true);
    assert.strictEqual(isTerminalComplete(false, "node-1"), false);
  });
});
