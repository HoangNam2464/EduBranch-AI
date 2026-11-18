import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  toAttemptDetail,
  toAttemptSummary,
  type AttemptDetailRow,
  type AttemptSummaryRow,
} from "./branchingAttempt";

describe("toAttemptSummary (GET /cases/:caseId/attempts row → AttemptSummary)", () => {
  const row: AttemptSummaryRow = {
    id: "a1",
    attempt_number: 2,
    is_completed: false,
    reflection_status: "NOT_STARTED",
    started_at: "2026-11-18T02:15:00.000Z",
    completed_at: null,
  };

  it("maps snake_case columns and turns null into undefined", () => {
    assert.deepEqual(toAttemptSummary(row), {
      id: "a1",
      attemptNumber: 2,
      completed: false,
      reflectionStatus: "NOT_STARTED",
      startedAt: "2026-11-18T02:15:00.000Z",
      completedAt: undefined,
    });
  });

  it("keeps the completion time of a finished attempt", () => {
    const done = toAttemptSummary({ ...row, is_completed: true, completed_at: "2026-11-18T03:00:00.000Z" });
    assert.equal(done.completed, true);
    assert.equal(done.completedAt, "2026-11-18T03:00:00.000Z");
  });
});

describe("toAttemptDetail (GET /branching-attempts/:id → AttemptDetail)", () => {
  const inProgress: AttemptDetailRow = {
    id: "a2",
    caseId: "c1",
    caseTitle: "Case",
    caseDescription: null,
    studentId: "s1",
    attemptNumber: 1,
    currentNodeId: "n2",
    outcomeNodeId: null,
    outcomeNode: null,
    isCompleted: false,
    reflectionText: null,
    reflectionStatus: "NOT_STARTED",
    reflectionSubmittedAt: null,
    startedAt: "2026-11-18T02:15:00.000Z",
    completedAt: null,
    currentNode: {
      id: "n2",
      situation: "Situation 2",
      isTerminal: false,
      nodeIndex: 1,
      options: [
        { id: "o3", text: "Option A" },
        { id: "o4", text: "Option B" },
      ],
    },
    steps: [
      {
        nodeId: "n1",
        situation: "Situation 1",
        selectedOptionId: "o1",
        selectedOptionText: "Chosen",
        reasoningId: "r1",
        reasoningText: null,
        submittedAt: "2026-11-18T02:16:00.000Z",
        otherOptions: [],
      },
    ],
  };

  it("maps the current node and hides absent consequence / reasoning as undefined", () => {
    const detail = toAttemptDetail(inProgress);
    assert.equal(detail.completed, false);
    assert.equal(detail.caseDescription, undefined);
    assert.equal(detail.outcome, undefined);
    assert.deepEqual(detail.currentNode, {
      id: "n2",
      situation: "Situation 2",
      isTerminal: false,
      nodeIndex: 1,
      options: [
        { id: "o3", text: "Option A" },
        { id: "o4", text: "Option B" },
      ],
    });
    assert.equal(detail.steps[0].consequence, undefined);
    assert.equal(detail.steps[0].reasoningText, undefined);
  });

  it("maps the snake_case outcome node of a completed attempt", () => {
    const detail = toAttemptDetail({
      ...inProgress,
      isCompleted: true,
      currentNode: null,
      outcomeNodeId: "n9",
      outcomeNode: { id: "n9", situation: "End", is_terminal: true, node_index: 4 },
      steps: [{ ...inProgress.steps![0], consequence: "Result", reasoningText: "Because", otherOptions: [{ id: "o2", text: "Other" }] }],
    });
    assert.deepEqual(detail.outcome, { id: "n9", situation: "End", nodeIndex: 4 });
    assert.equal(detail.currentNode, undefined);
    assert.equal(detail.steps[0].consequence, "Result");
    assert.equal(detail.steps[0].reasoningText, "Because");
    assert.deepEqual(detail.steps[0].otherOptions, [{ id: "o2", text: "Other" }]);
  });

  it("tolerates a missing steps array", () => {
    const { steps: _steps, ...noSteps } = inProgress;
    assert.deepEqual(toAttemptDetail(noSteps).steps, []);
  });
});
