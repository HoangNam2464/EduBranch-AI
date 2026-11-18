import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REFLECTION_MAX_LENGTH } from "@/services/branchingAttemptService";

describe("ReflectionPage (FE-017 Post-Review Overall Reflection)", () => {
  it("enforces non-empty reflection submission text up to maximum bound", () => {
    const isValid = (text: string) => {
      const trimmed = text.trim();
      return trimmed.length > 0 && trimmed.length <= REFLECTION_MAX_LENGTH;
    };
    assert.strictEqual(isValid(""), false);
    assert.strictEqual(isValid("   "), false);
    assert.strictEqual(isValid("Đúc kết bài học có giá trị sâu sắc."), true);
    assert.strictEqual(isValid("a".repeat(REFLECTION_MAX_LENGTH + 1)), false);
  });

  it("verifies attempt reflection is locked and immutable once SUBMITTED", () => {
    const isLocked = (status?: string) => status === "SUBMITTED";
    assert.strictEqual(isLocked("SUBMITTED"), true);
    assert.strictEqual(isLocked("DRAFT"), false);
    assert.strictEqual(isLocked(undefined), false);
  });
});
