import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { CaseNode } from "@/types";
import { analyzeTree } from "./caseTree";
import { orderNodes } from "./CaseReviewParts";

const node = (id: string, next: Array<string | undefined>, isTerminal = next.length === 0): CaseNode => ({
  id,
  caseId: "k",
  situation: id,
  isTerminal,
  options: next.map((n, i) => ({ id: `${id}-${i}`, nodeId: id, text: "t", consequence: "c", nextNodeId: n })),
});

describe("analyzeTree (FND §5 display checks)", () => {
  it("accepts a valid tree and counts situations / outcomes", () => {
    const nodes = [node("r", ["a", "b"]), node("a", ["t1", "t2"]), node("b", ["t2", "t3"]), node("t1", []), node("t2", []), node("t3", [])];
    const s = analyzeTree(nodes, "r");
    assert.deepEqual(s.issues, []);
    assert.equal(s.nodeCount, 6);
    assert.equal(s.situations, 3);
    assert.equal(s.outcomes, 3);
    assert.equal(s.depth.get("r"), 0);
    assert.equal(s.depth.get("t2"), 2);
  });

  it("flags a cycle, an orphan, a missing root and bad option counts", () => {
    assert.ok(analyzeTree([node("r", ["a", "t"]), node("a", ["r", "t"]), node("t", [])], "r").issues.includes("cycle"));
    assert.ok(analyzeTree([node("r", ["t", "t"]), node("t", []), node("x", [])], "r").issues.includes("orphan"));
    assert.ok(analyzeTree([node("r", ["t", "t"]), node("t", [])], undefined).issues.includes("noRoot"));
    assert.ok(analyzeTree([node("r", ["t"]), node("t", [])], "r").issues.includes("optionCount"));
    assert.ok(analyzeTree([node("r", ["zz", "t"]), node("t", [])], "r").issues.includes("danglingNext"));
  });

  it("reports an empty tree without issues", () => {
    assert.deepEqual(analyzeTree([], undefined).issues, []);
  });

  it("orders nodes breadth-first from the root following option connections (orderNodes for DecisionTreeCanvas)", () => {
    const nodes = [
      node("n2", []),
      node("root", ["n1", "n2"]),
      node("n1", []),
    ];
    const ordered = orderNodes(nodes, "root");
    assert.deepEqual(ordered.map((n) => n.id), ["root", "n1", "n2"]);
  });
});
