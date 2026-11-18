import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toCase, toCaseDetail, type CaseDetailRow, type CaseRow } from "./case";

const row: CaseRow = {
  id: "k1",
  title: "Sự cố triển khai phiên bản mới",
  description: null,
  course_id: "c1",
  created_by: "u1",
  status: "DRAFT",
  version: 1,
  root_node_id: null,
  learning_mode: "BRANCHING_STUDY",
  context_text: null,
  problem_text: null,
  created_at: "2026-11-14T15:07:14.474Z",
  updated_at: "2026-11-15T08:00:00.000Z",
};

describe("toCase (backend snake_case row → Case)", () => {
  it("maps every column to the camelCase domain field", () => {
    assert.deepEqual(toCase(row), {
      id: "k1",
      title: "Sự cố triển khai phiên bản mới",
      description: undefined,
      courseId: "c1",
      createdBy: "u1",
      learningMode: "BRANCHING_STUDY",
      contextText: undefined,
      problemText: undefined,
      status: "DRAFT",
      version: 1,
      rootNodeId: undefined,
      createdAt: "2026-11-14T15:07:14.474Z",
      updatedAt: "2026-11-15T08:00:00.000Z",
    });
  });

  it("defaults a missing learning_mode to the column default BRANCHING_STUDY", () => {
    assert.equal(toCase({ ...row, learning_mode: undefined }).learningMode, "BRANCHING_STUDY");
    assert.equal(toCase({ ...row, learning_mode: "REVIEW_STUDY" }).learningMode, "REVIEW_STUDY");
  });
});

describe("toCaseDetail (lecturer GET /cases/:id)", () => {
  const detail: CaseDetailRow = {
    ...row,
    root_node_id: "n1",
    lecturer_id: "u1",
    nodes: [
      {
        id: "n1",
        case_id: "k1",
        situation: "Lưu lượng vượt ngưỡng",
        is_terminal: false,
        node_index: 0,
        options: [
          { id: "o1", node_id: "n1", option_text: "Chặn tại biên", consequence: "Ổn định", next_node_id: "n2" },
          { id: "o2", node_id: "n1", option_text: "Cô lập", consequence: "Gián đoạn", next_node_id: null },
        ],
      },
      { id: "n2", case_id: "k1", situation: "Kết cục", is_terminal: true, node_index: 1 },
    ],
    all_options: [],
  };

  it("maps nodes and their options, keeping tree links", () => {
    const c = toCaseDetail(detail);
    assert.equal(c.rootNodeId, "n1");
    assert.equal(c.nodes.length, 2);
    assert.deepEqual(c.nodes[0].options[0], {
      id: "o1",
      nodeId: "n1",
      text: "Chặn tại biên",
      consequence: "Ổn định",
      nextNodeId: "n2",
    });
    assert.equal(c.nodes[0].options[1].nextNodeId, undefined);
    assert.deepEqual(c.nodes[1].options, []);
    assert.equal(c.nodes[1].isTerminal, true);
  });

  it("treats a row without nodes as an empty tree", () => {
    assert.deepEqual(toCaseDetail({ ...row }).nodes, []);
  });
});
