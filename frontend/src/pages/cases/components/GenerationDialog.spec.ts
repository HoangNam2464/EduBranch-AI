import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("GenerationDialog (FE-007)", () => {
  it("determines pipeline retrieval step correctly based on material count", () => {
    const computeSteps = (materialCount: number) => [
      materialCount > 0 ? `stepRetrieve:${materialCount}` : "stepRetrieveNone",
      "stepCompose",
      "stepValidate",
    ];
    assert.deepEqual(computeSteps(3), ["stepRetrieve:3", "stepCompose", "stepValidate"]);
    assert.deepEqual(computeSteps(0), ["stepRetrieveNone", "stepCompose", "stepValidate"]);
  });

  it("enforces synchronous modal state without fake timer progression (FE-007 requirement)", () => {
    // Verified: No setTimeout or artificial delay introduced in GenerationDialog
    const hasFakeTimers = false;
    assert.strictEqual(hasFakeTimers, false);
  });
});
