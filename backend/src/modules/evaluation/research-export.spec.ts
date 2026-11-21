import { averageScore, csvCell, pseudonymFactory, toCsv, wordCount } from "./research-export";

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
});
