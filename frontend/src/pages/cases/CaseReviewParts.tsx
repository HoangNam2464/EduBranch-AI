/**
 * Building blocks of the case editor (Figma page 08 · 03.4 / 03.5), measured on the frames:
 *  - Card: bg/surface, radius 18, padding 20; title Eduva/H3 (Roboto Regular 16/24, text/primary).
 *  - Row list ("Resource file"): rows 36 high, padding 8 0, gap 8, 1px bottom border/default,
 *    16px icon + Eduva/Body 14/20; rows are 8 apart.
 *  - Decision tree canvas (03.4 "Canvas"): bg/canvas 438 wide, radius 8; 128-wide node cards,
 *    1.5px curved edges with 20px A/B labels.
 */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Flag } from "lucide-react";
import type { CaseNode } from "@/types";
import { cx, FOCUS_RING } from "@/components/ds";

// ── Card ────────────────────────────────────────────────────────────────────

export function EditorCard({ className, children, labelledBy }: { className?: string; children: ReactNode; labelledBy?: string }) {
  return (
    <section aria-labelledby={labelledBy} className={cx("flex flex-col rounded-eb-xl bg-surface p-5", className)}>
      {children}
    </section>
  );
}

/** Eduva/H3 card title. */
export const CARD_TITLE = "text-[16px] leading-6 font-normal text-ink";
/** Eduva/Caption field label. */
export const FIELD_LABEL = "text-[12px] leading-4 font-normal text-ink";
/** Eduva/Caption helper text (text/secondary). */
export const CAPTION = "text-[12px] leading-4 font-normal text-ink-secondary";

/** "Field box": 1px border/strong inside, radius 8, padding 12, Eduva/Body. Stroke is part of the layout box. */
export const FIELD_BOX =
  "w-full rounded-eb-md border border-line-strong bg-surface p-3 text-[14px] leading-5 font-normal text-ink outline-none " +
  "focus-visible:border-focus focus-visible:shadow-eb-focus disabled:cursor-not-allowed disabled:text-ink-secondary read-only:cursor-default";
/** "Course description editor": 1px border/strong, radius 8, padding 12/16 measured from the outer edge. */
export const EDITOR_BOX =
  "w-full resize-y rounded-eb-md border border-line-strong bg-surface px-[15px] py-[11px] text-[14px] leading-5 font-normal text-ink outline-none field-sizing-content " +
  "focus-visible:border-focus focus-visible:shadow-eb-focus disabled:cursor-not-allowed disabled:resize-none disabled:text-ink-secondary read-only:resize-none";

// ── Row list ────────────────────────────────────────────────────────────────

export function RowList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-col gap-2">
      {children}
    </ul>
  );
}

export function Row({ icon, children, className }: { icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <li className={cx("flex min-h-9 items-center gap-2 border-b border-line-soft py-2 text-[14px] leading-5 font-normal", className)}>
      {icon}
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}

// ── Tree order / numbering ──────────────────────────────────────────────────

/**
 * Nodes in breadth-first order from the root, following option order, then any node
 * the root does not reach (in API order). Gives stable "Điểm N" / "Kết cục N" numbers.
 */
export function orderNodes(nodes: CaseNode[], rootId?: string): CaseNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const order: CaseNode[] = [];
  const queue: string[] = rootId && byId.has(rootId) ? [rootId] : [];
  if (rootId) seen.add(rootId);
  while (queue.length > 0) {
    const node = byId.get(queue.shift()!)!;
    order.push(node);
    for (const option of node.options) {
      const next = option.nextNodeId;
      if (next && byId.has(next) && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }
  }
  for (const node of nodes) if (!seen.has(node.id)) order.push(node);
  return order;
}

// ── Decision tree canvas ────────────────────────────────────────────────────

const CANVAS_WIDTH = 438;
const NODE_WIDTH = 128;
const EDGE_PAD = 8;
const MAX_SPACING = 230;
const MIN_SPACING = NODE_WIDTH + 8;
const DEFAULT_NODE_HEIGHT = 78;

function rowTop(depth: number): number {
  return depth === 0 ? 16 : 150 + (depth - 1) * 140;
}

export interface TreeCanvasProps {
  /** Nodes in display order (see orderNodes). */
  order: CaseNode[];
  rootId?: string;
  /** Depth of every node reachable from the root (analyzeTree). */
  depth: Map<string, number>;
  selectedId?: string;
  /** Option of the selected node whose edge is highlighted. */
  activeOptionId?: string;
  onSelect: (nodeId: string) => void;
  /** Badge text of a node ("Bắt đầu", "Điểm 2", "Kết cục"). */
  badge: (node: CaseNode) => string;
  /** Accessible name of a node button. */
  nodeLabel: (node: CaseNode) => string;
  /** Letter of the n-th option (A, B, …). */
  optionLetter: (index: number) => string;
  ariaLabel: string;
}

export function DecisionTreeCanvas({
  order,
  rootId,
  depth,
  selectedId,
  activeOptionId,
  onSelect,
  badge,
  nodeLabel,
  optionLetter,
  ariaLabel,
}: TreeCanvasProps) {
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const [heights, setHeights] = useState<Record<string, number>>({});

  // Edges start at the real bottom of each card (1 or 2 text lines, 1px or 2px border).
  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    refs.current.forEach((el, id) => (next[id] = el.offsetHeight));
    setHeights((prev) => (Object.keys(next).every((k) => prev[k] === next[k]) && Object.keys(prev).length === Object.keys(next).length ? prev : next));
  });

  // Rows by depth; nodes the root does not reach go to one extra row below.
  const maxDepth = Math.max(-1, ...[...depth.values()]);
  const rows = new Map<number, CaseNode[]>();
  for (const node of order) {
    const d = depth.get(node.id) ?? maxDepth + 1;
    rows.set(d, [...(rows.get(d) ?? []), node]);
  }
  const widest = Math.max(1, ...[...rows.values()].map((r) => r.length));
  const spacingFor = (n: number) => (n > 1 ? Math.min(MAX_SPACING, (CANVAS_WIDTH - 2 * EDGE_PAD - NODE_WIDTH) / (n - 1)) : 0);
  const contentWidth =
    widest > 1 && spacingFor(widest) < MIN_SPACING ? 2 * EDGE_PAD + NODE_WIDTH + (widest - 1) * MIN_SPACING : CANVAS_WIDTH;

  const pos = new Map<string, { left: number; top: number }>();
  rows.forEach((nodes, d) => {
    const n = nodes.length;
    const s = Math.max(spacingFor(n), contentWidth > CANVAS_WIDTH ? MIN_SPACING : 0);
    nodes.forEach((node, i) => {
      const center = contentWidth / 2 + (i - (n - 1) / 2) * s;
      pos.set(node.id, { left: Math.round(center - NODE_WIDTH / 2), top: rowTop(d) });
    });
  });
  const heightOf = (id: string) => heights[id] ?? DEFAULT_NODE_HEIGHT;
  const bottom = Math.max(0, ...order.map((n) => (pos.get(n.id)?.top ?? 0) + heightOf(n.id)));
  const canvasHeight = Math.max(420, bottom + 52);

  const edges: Array<{ key: string; d: string; mx: number; my: number; letter: string; active: boolean }> = [];
  for (const node of order) {
    const from = pos.get(node.id);
    if (!from) continue;
    node.options.forEach((option, index) => {
      const to = option.nextNodeId ? pos.get(option.nextNodeId) : undefined;
      if (!to) return;
      const x1 = from.left + NODE_WIDTH / 2;
      const y1 = from.top + heightOf(node.id);
      const x2 = to.left + NODE_WIDTH / 2;
      const y2 = to.top;
      const ym = (y1 + y2) / 2;
      edges.push({
        key: option.id,
        d: `M ${x1} ${y1} C ${x1} ${ym}, ${x2} ${ym}, ${x2} ${y2}`,
        mx: (x1 + x2) / 2,
        my: ym,
        letter: optionLetter(index),
        active: node.id === selectedId && option.id === activeOptionId,
      });
    });
  }
  // Highlighted edge drawn last so it sits above the others.
  edges.sort((a, b) => Number(a.active) - Number(b.active));

  return (
    <div className="overflow-x-auto rounded-eb-md bg-canvas" role="group" aria-label={ariaLabel}>
      <div className="relative" style={{ width: contentWidth, height: canvasHeight }}>
        <svg aria-hidden="true" width={contentWidth} height={canvasHeight} className="absolute inset-0" fill="none">
          {edges.map((e) => (
            <path key={e.key} d={e.d} strokeWidth={1.5} className={e.active ? "stroke-primary" : "stroke-primary-disabled"} />
          ))}
        </svg>
        {edges.map((e) => (
          <span
            key={`label-${e.key}`}
            aria-hidden="true"
            style={{ left: Math.round(e.mx - 9), top: Math.round(e.my - 9) }}
            className="absolute flex size-5 items-center justify-center rounded-full border border-line-soft bg-surface text-[12px] leading-4 font-medium text-ink-secondary"
          >
            {e.letter}
          </span>
        ))}
        {order.map((node) => {
          const p = pos.get(node.id)!;
          const selected = node.id === selectedId;
          const isRoot = node.id === rootId;
          return (
            <button
              key={node.id}
              ref={(el) => {
                if (el) refs.current.set(node.id, el);
                else refs.current.delete(node.id);
              }}
              type="button"
              onClick={() => onSelect(node.id)}
              aria-pressed={selected}
              aria-label={nodeLabel(node)}
              style={{ left: p.left, top: p.top, width: NODE_WIDTH }}
              className={cx(
                "absolute flex cursor-pointer flex-col items-start gap-1 rounded-eb-md bg-surface p-2.5 text-left",
                selected ? "border-2 border-primary" : cx("border hover:border-primary", node.isTerminal ? "border-line-strong" : "border-line-soft"),
                FOCUS_RING,
              )}
            >
              <span
                className={cx(
                  "inline-flex items-center gap-1 rounded-[4px] px-1.5 py-0.5 text-[12px] leading-4 font-medium",
                  isRoot ? "bg-selected text-link" : "bg-canvas text-ink-secondary",
                )}
              >
                {node.isTerminal && <Flag aria-hidden="true" size={11} absoluteStrokeWidth strokeWidth={1.943} />}
                {badge(node)}
              </span>
              <span className="line-clamp-2 w-full text-[12px] leading-4 font-normal text-ink">{node.situation}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
