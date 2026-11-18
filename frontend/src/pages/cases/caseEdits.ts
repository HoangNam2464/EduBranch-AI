import type { CaseDetail, CaseNode } from "@/types";
import type { UpdateCaseNodeRequest } from "@/services/caseService";

/** Local id prefix of an option added in the editor and not saved yet. */
export const NEW_OPTION_PREFIX = "new-";

export const MAX_OPTIONS = 4;

export function isNewOption(id: string): boolean {
  return id.startsWith(NEW_OPTION_PREFIX);
}

function sameNode(a: CaseNode, b: CaseNode): boolean {
  if (a.situation !== b.situation || a.options.length !== b.options.length) return false;
  return a.options.every((o, i) => {
    const p = b.options[i];
    return o.id === p.id && o.text === p.text && o.consequence === p.consequence && (o.nextNodeId ?? null) === (p.nextNodeId ?? null);
  });
}

/** Draft nodes that differ from the saved case (situation, options, next nodes), in the given order. */
export function changedNodes(saved: CaseDetail, draft: CaseDetail, order: CaseNode[] = draft.nodes): CaseNode[] {
  const before = new Map(saved.nodes.map((n) => [n.id, n]));
  return order.filter((n) => {
    const prev = before.get(n.id);
    return prev !== undefined && !sameNode(n, prev);
  });
}

/** Body of PUT /cases/:id/nodes/:nodeId (BE-017). New options are sent without an id. */
export function toNodeRequest(node: CaseNode): UpdateCaseNodeRequest {
  return {
    situation: node.situation,
    options: node.options.map((o) => ({
      ...(isNewOption(o.id) ? {} : { id: o.id }),
      text: o.text,
      consequence: o.consequence,
      nextNodeId: o.nextNodeId ?? "",
    })),
  };
}
