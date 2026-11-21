/**
 * Decision tree integrity for lecturer edits (FND §5, BE-017 AC-2):
 *  - every option leads to a node of the same case (a terminal node has no options);
 *  - every non-terminal node has 2–4 options; at least one terminal node exists;
 *  - no cycles (3-colour DFS); every node is reachable from the root.
 *
 * `checkedNodeId` limits the per-node rules (option count, option targets) to the node being
 * saved, so an older tree with a flaw elsewhere does not block every edit. The whole-tree rules
 * (root, an ending node, no loop, reachability) always apply. Without it every node is checked.
 * Returns the first violation as a message, or null when the tree is valid.
 */
export interface TreeNode {
  id: string;
}

export function findTreeViolation(
  rootNodeId: string | null,
  nodes: TreeNode[],
  targetsByNode: Map<string, string[]>,
  checkedNodeId?: string,
): string | null {
  const ids = new Set(nodes.map((n) => n.id));
  if (!rootNodeId || !ids.has(rootNodeId)) return "The decision tree has no valid root node";

  let terminals = 0;
  for (const node of nodes) {
    const targets = targetsByNode.get(node.id) ?? [];
    if (targets.length === 0) {
      terminals++;
      continue;
    }
    if (checkedNodeId !== undefined && node.id !== checkedNodeId) continue;
    if (targets.length < 2 || targets.length > 4) {
      return "A decision node must have between 2 and 4 options, or none if it is an ending";
    }
    for (const target of targets) {
      if (!ids.has(target)) return "Every option must lead to a node of this case";
    }
  }
  if (terminals === 0) return "The decision tree needs at least one ending node";

  // Edges used for the graph rules: only targets that exist (a dangling edge elsewhere is
  // reported by the per-node rule when that node is saved).
  const edges = (id: string) => (targetsByNode.get(id) ?? []).filter((t) => ids.has(t));

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
