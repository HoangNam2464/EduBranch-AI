import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toReviewStudySubmission, type ReviewStudySubmissionRow } from "./reviewStudy";

describe("toReviewStudySubmission", () => {
  it("maps snake_case database row to camelCase domain model", () => {
    const row: ReviewStudySubmissionRow = {
      id: "sub-101",
      student_id: "stu-202",
      case_id: "case-303",
      student_analysis: "Key finding from operational data",
      proposed_solution: "Implement decentralized quality assurance checkpoints",
      reasoning_text: "Historical data indicates 45% variance at central node",
      submission_status: "SUBMITTED",
      reflection_text: null,
      reflection_status: "NOT_STARTED",
      reflection_submitted_at: null,
      submitted_at: "2026-11-18T10:00:00.000Z",
    };

    const result = toReviewStudySubmission(row);
    assert.deepEqual(result, {
      id: "sub-101",
      studentId: "stu-202",
      caseId: "case-303",
      studentAnalysis: "Key finding from operational data",
      proposedSolution: "Implement decentralized quality assurance checkpoints",
      reasoningText: "Historical data indicates 45% variance at central node",
      submissionStatus: "SUBMITTED",
      reflectionText: undefined,
      reflectionStatus: "NOT_STARTED",
      reflectionSubmittedAt: undefined,
      submittedAt: "2026-11-18T10:00:00.000Z",
    });
  });

  it("handles camelCase DTO input and empty optional analysis", () => {
    const row: ReviewStudySubmissionRow = {
      id: "sub-102",
      studentId: "stu-202",
      caseId: "case-303",
      studentAnalysis: null,
      proposedSolution: "Policy revision",
      reasoningText: "Regulatory compliance required",
      submissionStatus: "REVIEWED",
      reflectionText: "Insightful feedback",
      reflectionStatus: "SUBMITTED",
      reflectionSubmittedAt: "2026-11-18T12:00:00.000Z",
      submittedAt: "2026-11-18T09:00:00.000Z",
    };

    const result = toReviewStudySubmission(row);
    assert.equal(result.id, "sub-102");
    assert.equal(result.studentAnalysis, undefined);
    assert.equal(result.submissionStatus, "REVIEWED");
    assert.equal(result.reflectionStatus, "SUBMITTED");
    assert.equal(result.reflectionText, "Insightful feedback");
  });
});

