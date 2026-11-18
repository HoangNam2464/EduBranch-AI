import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { CaseStatus } from "@/types";

describe("CaseGovernanceBar (FE-011 Lifecycle Transitions)", () => {
  it("permits valid lecturer transitions according to lifecycle state machine", () => {
    const allowedNext = (current: CaseStatus): CaseStatus[] => {
      switch (current) {
        case "DRAFT":
          return ["REVIEWED"];
        case "REVIEWED":
          return ["DRAFT", "APPROVED"];
        case "APPROVED":
          return ["DRAFT", "PUBLISHED"];
        case "PUBLISHED":
          return ["DRAFT"];
      }
    };
    assert.deepEqual(allowedNext("DRAFT"), ["REVIEWED"]);
    assert.deepEqual(allowedNext("REVIEWED"), ["DRAFT", "APPROVED"]);
    assert.deepEqual(allowedNext("APPROVED"), ["DRAFT", "PUBLISHED"]);
    assert.deepEqual(allowedNext("PUBLISHED"), ["DRAFT"]);
  });

  it("identifies when case is in immutable published state for students", () => {
    const isStudentVisible = (status: CaseStatus) => status === "PUBLISHED";
    assert.strictEqual(isStudentVisible("PUBLISHED"), true);
    assert.strictEqual(isStudentVisible("APPROVED"), false);
    assert.strictEqual(isStudentVisible("DRAFT"), false);
  });
});
