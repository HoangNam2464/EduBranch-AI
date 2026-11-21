import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  RUBRIC_CRITERIA,
  calculateAverageScore,
  fromRubricRow,
  toRubricScores,
} from "../../services/rubricLogic.ts";
import type { RubricCriterionItem } from "../../types/index.ts";

const form = (realism: number, difficulty: number, fit: number): RubricCriterionItem[] => [
  { id: "realism", name: "Tính thực tế", score: realism },
  { id: "difficulty", name: "Độ khó", score: difficulty },
  { id: "curriculumFit", name: "Phù hợp môn", score: fit },
];

describe("Case quality rubric (BE-033 / OPD-011 / FR-EVAL-01 / Figma 07.8 & 10.8)", () => {
  it("has exactly the three fixed criteria of FR-EVAL-01", () => {
    assert.deepEqual(
      RUBRIC_CRITERIA.map((c) => c.apiKey),
      ["REALISM", "DIFFICULTY", "ALIGNMENT"],
    );
  });

  it("calculateAverageScore uses one decimal (Figma 07.8: 5, 4, 5 -> 4.7)", () => {
    assert.equal(calculateAverageScore([{ score: 5 }, { score: 4 }, { score: 5 }]), 4.7);
    assert.equal(calculateAverageScore([]), 0);
    assert.equal(calculateAverageScore([{ score: 1 }, { score: 2 }, { score: 3 }]), 2);
  });

  it("toRubricScores builds the API payload from the form", () => {
    assert.deepEqual(toRubricScores(form(5, 4, 3)), {
      realismScore: 5,
      difficultyScore: 4,
      alignmentScore: 3,
    });
  });

  it("toRubricScores refuses a missing criterion or a score outside 1-5", () => {
    assert.throws(() => toRubricScores(form(5, 4, 3).slice(0, 2)));
    assert.throws(() => toRubricScores(form(0, 4, 3)));
    assert.throws(() => toRubricScores(form(5, 6, 3)));
    assert.throws(() => toRubricScores(form(5, 4, 3.5)));
  });

  it("fromRubricRow maps the API row to the three UI criteria in order", () => {
    const ev = fromRubricRow({
      id: "r-1",
      caseId: "k-1",
      caseTitle: "Case",
      evaluatorId: "u-1",
      evaluatorName: "Lecturer",
      realismScore: 4,
      difficultyScore: 3,
      alignmentScore: 5,
      averageScore: 4,
      notes: "",
      createdAt: "2026-11-21T00:00:00Z",
    });
    assert.deepEqual(
      ev.criteria.map((c) => [c.id, c.score]),
      [["realism", 4], ["difficulty", 3], ["curriculumFit", 5]],
    );
    assert.equal(ev.averageScore, 4);
    assert.equal(ev.notes, undefined);
  });

  it("rates the case only: no student grade, rank or pass/fail field", () => {
    const keys = Object.keys(toRubricScores(form(5, 5, 5)));
    for (const k of ["studentScore", "grade", "pass", "ranking", "studentId"]) {
      assert.ok(!keys.includes(k));
    }
  });
});
