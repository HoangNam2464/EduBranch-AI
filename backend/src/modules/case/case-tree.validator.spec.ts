import { findTreeViolation } from "./case-tree.validator";

const nodes = (...ids: string[]) => ids.map((id) => ({ id }));
const edges = (entries: Array<[string, string[]]>) => new Map(entries);

describe("findTreeViolation (FND §5)", () => {
  it("accepts a root with two branches that end in terminal nodes", () => {
    expect(findTreeViolation("r", nodes("r", "a", "b"), edges([["r", ["a", "b"]]]))).toBeNull();
  });

  it("rejects a missing root", () => {
    expect(findTreeViolation(null, nodes("r"), edges([]))).toMatch(/root/);
    expect(findTreeViolation("x", nodes("r"), edges([]))).toMatch(/root/);
  });

  it("rejects a non-terminal node with one option or more than four", () => {
    expect(findTreeViolation("r", nodes("r", "a"), edges([["r", ["a"]]]))).toMatch(/between 2 and 4/);
    const many = nodes("r", "a", "b", "c", "d", "e");
    expect(findTreeViolation("r", many, edges([["r", ["a", "b", "c", "d", "e"]]]))).toMatch(/between 2 and 4/);
  });

  it("rejects an option that leads outside the case or has no next node", () => {
    expect(findTreeViolation("r", nodes("r", "a"), edges([["r", ["a", "zz"]]]))).toMatch(/node of this case/);
    expect(findTreeViolation("r", nodes("r", "a"), edges([["r", ["a", ""]]]))).toMatch(/node of this case/);
  });

  it("rejects a loop", () => {
    const tree = edges([
      ["r", ["a", "b"]],
      ["a", ["r", "b"]],
    ]);
    expect(findTreeViolation("r", nodes("r", "a", "b"), tree)).toMatch(/loop/);
  });

  it("rejects a self loop", () => {
    expect(findTreeViolation("r", nodes("r", "a"), edges([["r", ["r", "a"]]]))).toMatch(/loop/);
  });

  it("rejects a node that cannot be reached from the root", () => {
    expect(findTreeViolation("r", nodes("r", "a", "b", "orphan"), edges([["r", ["a", "b"]]]))).toMatch(/reachable/);
  });

  it("checks option rules only on the saved node when checkedNodeId is given", () => {
    // older flaw on node a (one option, dangling target) must not block saving r
    const tree = edges([
      ["r", ["a", "b"]],
      ["a", ["b"]],
    ]);
    expect(findTreeViolation("r", nodes("r", "a", "b"), tree)).toMatch(/between 2 and 4/);
    expect(findTreeViolation("r", nodes("r", "a", "b"), tree, "r")).toBeNull();
    expect(findTreeViolation("r", nodes("r", "a", "b"), tree, "a")).toMatch(/between 2 and 4/);
  });

  it("rejects a tree without an ending node", () => {
    // every node has options, so there is no terminal node (and therefore a loop or a dangling edge)
    const tree = edges([
      ["r", ["a", "b"]],
      ["a", ["b", "r"]],
      ["b", ["a", "r"]],
    ]);
    expect(findTreeViolation("r", nodes("r", "a", "b"), tree)).toMatch(/ending node/);
  });
});
