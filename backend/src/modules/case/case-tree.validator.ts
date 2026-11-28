/**
 * Decision tree integrity for lecturer edits (FND §5, BE-017 AC-2):
 *  - every option leads to a node of the same case, or null if ending at that branch (FND §5, EBA-117);
 *  - every non-terminal node has 2–4 options; at least one ending node or null-target terminal branch exists;
 *  - no cycles (3-colour DFS); every node is reachable from the root.
 *
 * `checkedNodeId` limits the per-node rules (option count, option targets) to the node being
 * saved, so an older tree with a flaw elsewhere does not block every edit. The whole-tree rules
 * (root, an ending node/branch, no loop, reachability) always apply. Without it every node is checked.
 * Returns the first violation as a message, or null when the tree is valid.
 */
export interface TreeNode {
  id: string;
}

export function findTreeViolation(
  rootNodeId: string | null,
  nodes: TreeNode[],
  targetsByNode: Map<string, Array<string | null>>,
  checkedNodeId?: string,
): string | null {
  const ids = new Set(nodes.map((n) => n.id));
  if (!rootNodeId || !ids.has(rootNodeId)) return "The decision tree has no valid root node";

  let terminals = 0;
  let hasTerminalBranch = false;
  for (const node of nodes) {
    const targets = targetsByNode.get(node.id) ?? [];
    if (targets.length === 0) {
      terminals++;
      continue;
    }
    if (targets.some((t) => t === null)) {
      hasTerminalBranch = true;
    }
    if (checkedNodeId !== undefined && node.id !== checkedNodeId) continue;
    if (targets.length < 2 || targets.length > 4) {
      return "A decision node must have between 2 and 4 options, or none if it is an ending";
    }
    for (const target of targets) {
      if (target === null) continue;
      if (!ids.has(target)) return "Every option must lead to a node of this case";
    }
  }
  if (terminals === 0 && !hasTerminalBranch) return "The decision tree needs at least one ending node";

  // Edges used for the graph rules: only targets that exist (a dangling edge elsewhere is
  // reported by the per-node rule when that node is saved; null targets terminate that option branch).
  const edges = (id: string) =>
    (targetsByNode.get(id) ?? []).filter((t): t is string => t !== null && ids.has(t));

  // 0 = unvisited, 1 = on the current DFS path, 2 = done
  const colour = new Map<string, 0 | 1 | 2>();
  const hasCycleFrom = (start: string): boolean => {
    const stack: Array<{ id: string; next: number }> = [{ id: start, next: 0 }];
    colour.set(start, 1);
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      const targets = edges(top.id);
      if (top.next < targets.length) {
        const target = targets[top.next++];
        const c = colour.get(target) ?? 0;
        if (c === 1) return true;
        if (c === 0) {
          colour.set(target, 1);
          stack.push({ id: target, next: 0 });
        }
      } else {
        colour.set(top.id, 2);
        stack.pop();
      }
    }
    return false;
  };
  for (const node of nodes) {
    if ((colour.get(node.id) ?? 0) === 0 && hasCycleFrom(node.id)) {
      return "This change creates a loop in the decision tree";
    }
  }

  const reached = new Set<string>([rootNodeId]);
  const queue = [rootNodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const target of edges(current)) {
      if (!reached.has(target)) {
        reached.add(target);
        queue.push(target);
      }
    }
  }
  if (reached.size !== nodes.length) return "Every node must be reachable from the start node";
  return null;
}

/**
 * Graph validation for AI-generated trees at the Gateway boundary (QA-008):
 * verifies root index, option target indices, at least one terminal node or null-target path,
 * acyclicity (3-colour DFS), and reachability of every node from `rootNodeIndex`.
 * Does not impose strict 2-4 option counts per node so AI-service schema rules remain authoritative.
 */
export function findGeneratedTreeViolation(
  rootNodeIndex: unknown,
  nodes: Array<{ options?: Array<{ next_node_index?: unknown }> }>,
): string | null {
  if (!Number.isInteger(rootNodeIndex) || (rootNodeIndex as number) < 0 || (rootNodeIndex as number) >= nodes.length) {
    return "AI generated case has invalid root_node_index";
  }
  const n = nodes.length;
  const root = rootNodeIndex as number;
  let hasTerminal = false;
  const adj: number[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    const opts = Array.isArray(nodes[i]?.options) ? nodes[i].options! : [];
    if (opts.length === 0) hasTerminal = true;
    for (const opt of opts) {
      const next = opt?.next_node_index;
      if (next === null || next === undefined) {
        hasTerminal = true;
        continue;
      }
      if (!Number.isInteger(next) || (next as number) < 0 || (next as number) >= n) {
        return "AI generated case has invalid option next_node_index";
      }
      adj[i].push(next as number);
    }
  }

  if (!hasTerminal) {
    return "AI generated case has no terminal outcome";
  }

  const colour = new Uint8Array(n); // 0 = white, 1 = gray, 2 = black
  for (let start = 0; start < n; start++) {
    if (colour[start] !== 0) continue;
    const stack: Array<{ idx: number; next: number }> = [{ idx: start, next: 0 }];
    colour[start] = 1;
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      if (top.next < adj[top.idx].length) {
        const target = adj[top.idx][top.next++];
        if (colour[target] === 1) return "AI generated case contains a cycle";
        if (colour[target] === 0) {
          colour[target] = 1;
          stack.push({ idx: target, next: 0 });
        }
      } else {
        colour[top.idx] = 2;
        stack.pop();
      }
    }
  }

  const reached = new Set<number>([root]);
  const queue = [root];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const target of adj[cur]) {
      if (!reached.has(target)) {
        reached.add(target);
        queue.push(target);
      }
    }
  }
  if (reached.size !== n) {
    return "AI generated case contains unreachable nodes";
  }
  return null;
}
