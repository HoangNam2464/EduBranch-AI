import { useMemo } from "react";
import ReactFlow, { Background, Controls, Edge, Handle, MarkerType, Node, Position } from "reactflow";
import "reactflow/dist/style.css";
import type { NodeRow } from "../../services/lecturerApi";

/**
 * Decision-tree canvas (FE-008, ReactFlow). Read-only view opened from the editor's "Sơ đồ cây" panel.
 * Layout: breadth-first levels from the root; nodes never coloured by "correctness" (R01/GDS guardrail).
 */
function GraphNode({ data }: { data: { label: string; text: string; terminal: boolean; selected: boolean } }) {
  return (
    <div
      className={`w-60 rounded-lg border bg-white px-3 py-2.5 text-left ${data.selected ? "border-blue-600 ring-2 ring-blue-600/20" : data.terminal ? "border-gray-400" : "border-gray-200"}`}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-gray-400" />
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{data.label}</p>
      <p className="line-clamp-3 text-xs leading-5 text-gray-800">{data.text}</p>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-gray-400" />
    </div>
  );
}

const nodeTypes = { case: GraphNode };

export function TreeGraph({
  nodes,
  rootId,
  labels,
  selectedId,
  onSelect,
}: {
  nodes: NodeRow[];
  rootId?: string | null;
  labels: Record<string, string>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { rfNodes, rfEdges } = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const level = new Map<string, number>();
    const start = rootId && byId.has(rootId) ? rootId : nodes[0]?.id;
    const queue: string[] = start ? [start] : [];
    if (start) level.set(start, 0);
    while (queue.length) {
      const id = queue.shift()!;
      for (const o of byId.get(id)?.options ?? []) {
        if (o.next_node_id && byId.has(o.next_node_id) && !level.has(o.next_node_id)) {
          level.set(o.next_node_id, (level.get(id) ?? 0) + 1);
          queue.push(o.next_node_id);
        }
      }
    }
    let maxLevel = Math.max(0, ...level.values());
    for (const n of nodes) if (!level.has(n.id)) level.set(n.id, ++maxLevel); // unreachable nodes shown last
    const perLevel = new Map<number, number>();
    const rfNodes: Node[] = nodes.map((n) => {
      const l = level.get(n.id)!;
      const i = perLevel.get(l) ?? 0;
      perLevel.set(l, i + 1);
      return {
        id: n.id,
        type: "case",
        position: { x: i * 290, y: l * 170 },
        data: { label: labels[n.id] ?? "Tình huống", text: n.situation, terminal: n.is_terminal || n.options.length === 0, selected: n.id === selectedId },
      };
    });
    const rfEdges: Edge[] = nodes.flatMap((n) =>
      n.options
        .filter((o) => o.next_node_id)
        .map((o) => ({
          id: o.id,
          source: n.id,
          target: o.next_node_id as string,
          label: o.option_text.length > 28 ? o.option_text.slice(0, 28) + "…" : o.option_text,
          labelStyle: { fontSize: 10, fill: "#4B5563" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#9CA3AF" },
          style: { stroke: "#9CA3AF" },
        })),
    );
    return { rfNodes, rfEdges };
  }, [nodes, rootId, labels, selectedId]);

  return (
    <div className="h-[560px] w-full rounded-lg border border-gray-200 bg-gray-50">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeClick={(_, n) => onSelect?.(n.id)}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} color="#E5E7EB" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
