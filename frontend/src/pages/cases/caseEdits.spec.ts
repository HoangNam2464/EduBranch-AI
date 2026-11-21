import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { changedNodes, isNewOption, toNodeRequest } from "./caseEdits";
import type { CaseDetail, CaseNode } from "@/types";

const node = (id: string, options: Array<{ id: string; next?: string; text?: string }> = []): CaseNode => ({
  id,
  caseId: "c1",
  situation: `Situation ${id}`,
  isTerminal: options.length === 0,
  options: options.map((o) => ({ id: o.id, nodeId: id, text: o.text ?? `Text ${o.id}`, consequence: `Cons ${o.id}`, nextNodeId: o.next })),
});

const detail = (nodes: CaseNode[]): CaseDetail =>
  ({ id: "c1", courseId: "k1", title: "T", status: "DRAFT", learningMode: "BRANCHING_STUDY", rootNodeId: "r", nodes }) as unknown as CaseDetail;

const saved = detail([node("r", [{ id: "o1", next: "a" }, { id: "o2", next: "b" }]), node("a"), node("b")]);

describe("caseEdits (FE-009 / FE-010)", () => {
  it("reports no change for an identical draft", () => {
    assert.deepEqual(changedNodes(saved, saved), []);
  });

  it("detects a relinked option, an added option and a removed option on the edited node only", () => {
    const relinked = detail([node("r", [{ id: "o1", next: "b" }, { id: "o2", next: "b" }]), node("a"), node("b")]);
    assert.deepEqual(changedNodes(saved, relinked).map((n) => n.id), ["r"]);

    const added = detail([node("r", [{ id: "o1", next: "a" }, { id: "o2", next: "b" }, { id: "new-1", next: "a" }]), node("a"), node("b")]);
    assert.deepEqual(changedNodes(saved, added).map((n) => n.id), ["r"]);

    const removed = detail([node("r", [{ id: "o1", next: "a" }]), node("a"), node("b")]);
    assert.deepEqual(changedNodes(saved, removed).map((n) => n.id), ["r"]);
  });

  it("detects a text change", () => {
    const edited = detail([node("r", [{ id: "o1", next: "a", text: "New" }, { id: "o2", next: "b" }]), node("a"), node("b")]);
    assert.deepEqual(changedNodes(saved, edited).map((n) => n.id), ["r"]);
  });

  it("builds the PUT body: kept options keep their id, new ones have none", () => {
    const n = node("r", [{ id: "o1", next: "a" }, { id: "new-3", next: "b" }]);
    const body = toNodeRequest(n);
    assert.equal(body.situation, "Situation r");
    assert.deepEqual(body.options.map((o) => o.id), ["o1", undefined]);
    assert.deepEqual(body.options.map((o) => o.nextNodeId), ["a", "b"]);
    assert.equal(isNewOption("new-3"), true);
    assert.equal(isNewOption("o1"), false);
  });

  it("sends an ending node with no options", () => {
    assert.deepEqual(toNodeRequest(node("a")).options, []);
  });
});
