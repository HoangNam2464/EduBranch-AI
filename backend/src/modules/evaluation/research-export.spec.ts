import {
  ACTIVITY_COLUMNS,
  RUBRIC_COLUMNS,
  attemptBand,
  averageScore,
  compareRows,
  csvCell,
  decisionCountBand,
  durationBand,
  pseudonymFactory,
  toCsv,
  wordCount,
  wordCountBand,
} from "./research-export";

describe("research-export (BE-033, spec 007 AC-R4/R5)", () => {
  const p = pseudonymFactory("unit-test-secret-at-least-32-characters-long");

  it("gives a stable pseudonym per user and different ones across users", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(p(id)).toBe(p(id));
    expect(p(id)).toMatch(/^P-[0-9a-f]{12}$/);
    expect(p(id)).not.toBe(p("22222222-2222-4222-8222-222222222222"));
    expect(p(id)).not.toContain(id.slice(0, 8));
  });

  it("depends on the secret", () => {
    const other = pseudonymFactory("another-secret-value-with-enough-length-0000");
    const id = "11111111-1111-4111-8111-111111111111";
    expect(other(id)).not.toBe(p(id));
  });

  it("refuses an empty secret", () => {
    expect(() => pseudonymFactory("")).toThrow();
  });

  it("neutralises formula cells and quotes per RFC 4180", () => {
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+1")).toBe("'+1");
    expect(csvCell("-2")).toBe("'-2");
    expect(csvCell("@x")).toBe("'@x");
    expect(csvCell("\tlead")).toBe("'\tlead");
    expect(csvCell("\rlead")).toBe('"\'\rlead"');
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(3)).toBe("3");
  });

  it("writes a BOM, header and CRLF rows", () => {
    const csv = toCsv(["a", "b"], [[1, "x"]]);
    expect(csv.startsWith("﻿a,b\r\n1,x\r\n")).toBe(true);
  });

  it("counts words and averages scores", () => {
    expect(wordCount("  một  hai\nba ")).toBe(3);
    expect(wordCount("")).toBe(0);
    expect(wordCount(null)).toBe(0);
    expect(averageScore(4, 3, 5)).toBe(4);
    expect(averageScore(4, 4, 5)).toBe(4.3);
  });

  it("exports no absolute time column and drops high-linkability fields (L3 option C + R-L3b option B)", () => {
    for (const col of [...ACTIVITY_COLUMNS, ...RUBRIC_COLUMNS]) {
      expect(col).not.toMatch(/(_at|_date|time|timestamp|date)$/);
    }
    expect(ACTIVITY_COLUMNS).toContain("duration_band");
    expect(ACTIVITY_COLUMNS).not.toContain("duration_seconds");
    expect(ACTIVITY_COLUMNS).not.toContain("choice_path");
    expect(ACTIVITY_COLUMNS).not.toContain("outcome_node_id");
    expect(ACTIVITY_COLUMNS).not.toContain("attempt_number");
    expect(ACTIVITY_COLUMNS).not.toContain("decision_count");
    expect(ACTIVITY_COLUMNS).not.toContain("reasoning_word_count");
    expect(ACTIVITY_COLUMNS).not.toContain("reflection_word_count");
    expect(RUBRIC_COLUMNS).not.toContain("created_at");
  });

  it("generalises attempt, decision count, word count and duration into coarse bands (R-L3b option B)", () => {
    expect(attemptBand(Number.NaN)).toBe("1");
    expect(attemptBand(1)).toBe("1");
    expect(attemptBand(2)).toBe("2+");
    expect(attemptBand(5)).toBe("2+");

    expect(decisionCountBand(Number.NaN)).toBe("0");
    expect(decisionCountBand(0)).toBe("0");
    expect(decisionCountBand(1)).toBe("1-2");
    expect(decisionCountBand(2)).toBe("1-2");
    expect(decisionCountBand(3)).toBe("3+");

    expect(wordCountBand(Number.NaN)).toBe("0");
    expect(wordCountBand(0)).toBe("0");
    expect(wordCountBand(1)).toBe("1-25");
    expect(wordCountBand(25)).toBe("1-25");
    expect(wordCountBand(26)).toBe("26-75");
    expect(wordCountBand(75)).toBe("26-75");
    expect(wordCountBand(76)).toBe("76-150");
    expect(wordCountBand(150)).toBe("76-150");
    expect(wordCountBand(151)).toBe("151+");

    expect(durationBand(null)).toBe("");
    expect(durationBand(undefined)).toBe("");
    expect(durationBand(-1)).toBe("");
    expect(durationBand(0)).toBe("0-59s");
    expect(durationBand(59)).toBe("0-59s");
    expect(durationBand(60)).toBe("1-5m");
    expect(durationBand(125)).toBe("1-5m");
    expect(durationBand(299)).toBe("1-5m");
    expect(durationBand(300)).toBe("5-15m");
    expect(durationBand(899)).toBe("5-15m");
    expect(durationBand(900)).toBe("15-30m");
    expect(durationBand(1799)).toBe("15-30m");
    expect(durationBand(1800)).toBe("30m+");
  });

  it("orders rows by the given keys only, numbers numerically", () => {
    const rows: unknown[][] = [
      ["k2", "P-b", 1],
      ["k1", "P-b", 10],
      ["k1", "P-b", 2],
      ["k1", "P-a", 3],
    ];
    expect(rows.sort(compareRows([0, 1, 2]))).toEqual([
      ["k1", "P-a", 3],
      ["k1", "P-b", 2],
      ["k1", "P-b", 10],
      ["k2", "P-b", 1],
    ]);
  });
});
