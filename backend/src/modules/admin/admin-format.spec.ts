import {
  describeEventMeta,
  eventCode,
  generationStatus,
  likePattern,
  pageParams,
  percentages,
  toneOf,
} from "./admin-format";

describe("admin-format (spec 007)", () => {
  it("clamps paging to page >= 1 and size 1..100, default 20", () => {
    expect(pageParams()).toEqual({ page: 1, size: 20, offset: 0 });
    expect(pageParams(3, 10)).toEqual({ page: 3, size: 10, offset: 20 });
    expect(pageParams(0, 1000)).toEqual({ page: 1, size: 100, offset: 0 });
  });

  it("escapes LIKE wildcards so search is literal", () => {
    expect(likePattern("50%_a\\b")).toBe("%50\\%\\_a\\\\b%");
  });

  it("role percentages sum to 100 and are 0 without users", () => {
    expect(percentages(0, 0, 0)).toEqual({ studentPercent: 0, lecturerPercent: 0, adminPercent: 0 });
    const p = percentages(2, 1, 0);
    expect(p.studentPercent + p.lecturerPercent + p.adminPercent).toBe(100);
  });

  it("describes only known, non-sensitive meta keys", () => {
    expect(describeEventMeta({ caseTitle: "Ca A", durationMs: 12340 })).toBe("Ca A · 12.3s");
    expect(describeEventMeta({ from: "DRAFT", to: "REVIEWED" })).toBe("DRAFT → REVIEWED");
    expect(describeEventMeta({ password: "x", token: "y" })).toBe("");
    expect(describeEventMeta(null)).toBe("");
  });

  it("maps outcomes and generation status", () => {
    expect(toneOf("ERROR")).toBe("error");
    expect(toneOf("WARNING")).toBe("warning");
    expect(toneOf("SUCCESS")).toBe("success");
    expect(generationStatus("CASE_GENERATED", {})).toBe("COMPLETED");
    expect(generationStatus("CASE_GENERATION_FAILED", { errorCode: "HTTP_504" })).toBe("TIMEOUT");
    expect(generationStatus("CASE_GENERATION_FAILED", { errorCode: "HTTP_500" })).toBe("FAILED");
  });

  it("derives a stable short event code", () => {
    expect(eventCode("0a1b2c3d-0000-4000-8000-000000000000")).toBe("EV-0A1B2C3D");
  });
});
