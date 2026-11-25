import {
  ACTIVITY_COLUMNS,
  RUBRIC_COLUMNS,
  averageScore,
  compareRows,
  csvCell,
  pseudonymFactory,
  toCsv,
  wordCount,
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

  it("exports no absolute time column in any dataset (L3 option C, PO 2026-11-25)", () => {
    for (const col of [...ACTIVITY_COLUMNS, ...RUBRIC_COLUMNS]) {
      expect(col).not.toMatch(/(_at|_date|time|timestamp|date)$/);
    }
    expect(ACTIVITY_COLUMNS).toContain("duration_seconds");
    expect(RUBRIC_COLUMNS).not.toContain("created_at");
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
