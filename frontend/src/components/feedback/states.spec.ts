import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SUPPORT_EMAIL, formatClockTime, formatDateTime, isValidDate } from "@/components/feedback/stateFormat";

describe("feedback state formatting", () => {
  it("formats the load-error clock time as HH:mm with zero padding", () => {
    assert.equal(formatClockTime(new Date(2026, 10, 23, 9, 42)), "09:42");
    assert.equal(formatClockTime(new Date(2026, 0, 1, 0, 5)), "00:05");
    assert.equal(formatClockTime(new Date(2026, 0, 1, 23, 59)), "23:59");
  });

  it("formats the incident timestamp as dd/MM/yyyy HH:mm", () => {
    assert.equal(formatDateTime(new Date(2026, 10, 23, 9, 42)), "23/11/2026 09:42");
    assert.equal(formatDateTime(new Date(2027, 0, 3, 7, 8)), "03/01/2027 07:08");
  });

  it("detects invalid dates", () => {
    assert.equal(isValidDate(new Date(2026, 10, 23)), true);
    assert.equal(isValidDate(new Date("not a date")), false);
    assert.equal(isValidDate(undefined), false);
    assert.equal(isValidDate(null), false);
  });

  it("uses the support mailbox from the Figma help lines", () => {
    assert.equal(SUPPORT_EMAIL, "support@edubranch.ai");
  });
});
