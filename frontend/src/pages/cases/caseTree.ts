import type { CaseNode } from "@/types";

/**
 * Read-only checks of a Branching Study decision tree, mirroring FND §5
 * (.agents/rules/00-project-foundation.md): valid next-node references, a root,
 * no cycles, no orphan nodes, 2–4 options per non-terminal node, at least one
 * terminal node. Used to *display* the tree state on 03.4 / 03.7; the backend
 * and AI service remain the enforcing layers.
 */
export type TreeIssue = "noRoot" | "danglingNext" | "cycle" | "orphan" | "optionCount" | "noTerminal";

export interface TreeSummary {
  nodeCount: number;
  /** Non-terminal nodes (decision points). */
  situations: number;
  /** Terminal nodes (outcomes). */
  outcomes: number;
  issues: TreeIssue[];
  /** Depth (0 = root) of every node reachable from the root. */
  depth: Map<string, number>;
}

export function analyzeTree(nodes: CaseNode[], rootNodeId?: string): TreeSummary {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const issues = new Set<TreeIssue>();
  const outcomes = nodes.filter((n) => n.isTerminal).length;

  if (nodes.length > 0 && (!rootNodeId || !byId.has(rootNodeId))) issues.add("noRoot");
  if (nodes.length > 0 && outcomes === 0) issues.add("noTerminal");

  for (const node of nodes) {
    for (const option of node.options) {
      if (option.nextNodeId && !byId.has(option.nextNodeId)) issues.add("danglingNext");
    }
    if (!node.isTerminal && (node.options.length < 2 || node.options.length > 4)) issues.add("optionCount");
  }

  // Iterative 3-colour DFS from the root: cycle detection + reachability + BFS-like depth.
  const depth = new Map<string, number>();
  if (rootNodeId && byId.has(rootNodeId)) {
    const colour = new Map<string, 1 | 2>();
    const visit = (id: string, d: number) => {
      const stack: Array<{ id: string; d: number; next: number }> = [{ id, d, next: 0 }];
      colour.set(id, 1);
      depth.set(id, d);
      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        const options = byId.get(top.id)?.options ?? [];
        if (top.next >= options.length) {
          colour.set(top.id, 2);
          stack.pop();
          continue;
        }
        const target = options[top.next++].nextNodeId;
        if (!target || !byId.has(target)) continue;
        const c = colour.get(target);
        if (c === 1) {
          issues.add("cycle");
        } else if (c === undefined) {
          colour.set(target, 1);
          depth.set(target, top.d + 1);
          stack.push({ id: target, d: top.d + 1, next: 0 });
        } else if ((depth.get(target) ?? 0) < top.d + 1) {
          // Keep the longest distance so a node shared by two branches sits below both parents.
          depth.set(target, top.d + 1);
        }
      }
    };
    visit(rootNodeId, 0);
    if (depth.size < nodes.length) issues.add("orphan");
  }

  return { nodeCount: nodes.length, situations: nodes.length - outcomes, outcomes, issues: [...issues], depth };
}
