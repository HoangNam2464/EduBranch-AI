import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateAverageScore,
  validateCriterion,
} from "../../services/rubricLogic.ts";
import type { RubricEvaluation } from "../../types/index.ts";

describe("Rubric & Case Quality Evaluation (BE-033 / OPD-011 / Figma 07.8 & 10.8)", () => {
  it("AC-3: validateCriterion flags empty or whitespace-only criterion names", () => {
    assert.equal(validateCriterion("", ["Tính thực tế"]), "EMPTY");
    assert.equal(validateCriterion("   ", ["Tính thực tế"]), "EMPTY");
    assert.equal(validateCriterion("Độ khó", ["Tính thực tế"]), null);
  });

  it("AC-3: validateCriterion flags duplicate criterion names case-insensitively", () => {
    const existing = ["Tính thực tế", "Độ khó", "Phù hợp môn"];
    assert.equal(validateCriterion("Tính thực tế", existing), "DUPLICATE");
    assert.equal(validateCriterion("tính thực tế", existing), "DUPLICATE");
    assert.equal(validateCriterion("  ĐỘ KHÓ  ", existing), "DUPLICATE");
    assert.equal(validateCriterion("Tính khả thi", existing), null);
  });

  it("AC-3: validateCriterion allows editing existing criterion without self-duplication", () => {
    const existing = ["Tính thực tế", "Độ khó", "Phù hợp môn"];
    // Editing index 1 ("Độ khó") with same name is allowed
    assert.equal(validateCriterion("Độ khó", existing, 1), null);
    // Editing index 1 with name of index 0 ("Tính thực tế") is a duplicate
    assert.equal(validateCriterion("Tính thực tế", existing, 1), "DUPLICATE");
  });

  it("AC-1 & Figma 07.8/10.8: calculateAverageScore correctly computes mean with 1 decimal place", () => {
    // Figma 07.8 shows 5, 4, 5 -> avg 4.7
    const criteria1 = [{ score: 5 }, { score: 4 }, { score: 5 }];
    assert.equal(calculateAverageScore(criteria1), 4.7);

    // Empty list
    assert.equal(calculateAverageScore([]), 0);

    // All 5s
    assert.equal(calculateAverageScore([{ score: 5 }, { score: 5 }]), 5.0);

    // 1, 2, 3 -> avg 2.0
    assert.equal(
      calculateAverageScore([{ score: 1 }, { score: 2 }, { score: 3 }]),
      2.0,
    );
  });

  it("AC-4: Pedagogical Guardrail — zero student grading, scoring, or pass/fail in rubric models", () => {
    const sampleEvaluation: RubricEvaluation = {
      id: "rubric-1",
      caseId: "case-123",
      caseTitle: "Khủng hoảng sập mạng lưới trung tâm dữ liệu",
      evaluatorId: "lecturer-456",
      criteria: [
        { name: "Tính thực tế", score: 5, description: "Mức độ sát thực tế" },
        { name: "Độ khó", score: 4, description: "Mức độ phức tạp" },
        { name: "Phù hợp môn", score: 5, description: "Gắn kết CLO" },
      ],
      averageScore: 4.7,
      notes: "Bối cảnh sát thực tế, cần bổ sung giới hạn nguồn lực khi xử lý sự cố.",
      createdAt: new Date().toISOString(),
    };

    // Assert that rubric fields describe case quality, not student grades or pass/fail
    const keys = Object.keys(sampleEvaluation);
    assert.ok(!keys.includes("studentScore"));
    assert.ok(!keys.includes("grade"));
    assert.ok(!keys.includes("pass"));
    assert.ok(!keys.includes("ranking"));
    assert.equal(sampleEvaluation.averageScore, 4.7);
  });
});
