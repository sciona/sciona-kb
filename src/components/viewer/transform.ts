import Dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";
import type { CdgData, CdgBinding } from "./types";

// ─── Concept type → color mapping ──────────────────────────────────

const CONCEPT_COLORS: Record<string, string> = {
  data_assembly: "#6366f1",     // indigo
  conditional_routing: "#f59e0b", // amber
  optimization: "#10b981",      // emerald
  fixed_point: "#8b5cf6",       // violet
  neural_network: "#ec4899",    // pink
  loss_function: "#ef4444",     // red
  searching: "#06b6d4",         // cyan
  clustering: "#14b8a6",        // teal
  signal_transform: "#3b82f6",  // blue
  signal_filter: "#6366f1",     // indigo
  analysis: "#64748b",          // slate
  data_extraction: "#f97316",   // orange
  external_knowledge: "#a855f7", // purple
  sampler: "#22d3ee",           // cyan-light
  dimensionality_reduction: "#0ea5e9", // sky
  graph_traversal: "#a3e635",   // lime
  posterior_update: "#c084fc",  // purple-light
};

function getConceptColor(type: string): string {
  return CONCEPT_COLORS[type] ?? "#64748b";
}

// ─── Edge kind → style mapping ─────────────────────────────────────

const LOSS_CLASS_STYLES: Record<string, { stroke: string; strokeDasharray?: string }> = {
  preserving: { stroke: "#4ade80" },
  lossy_but_allowed: { stroke: "#facc15", strokeDasharray: "6 3" },
  irreversible: { stroke: "#f87171", strokeDasharray: "3 3" },
};

// ─── Node dimensions ───────────────────────────────────────────────

export const NODE_WIDTH = 280;
export const NODE_HEIGHT = 120;

// ─── Data types for custom node ────────────────────────────────────

export interface AtomNodeData {
  label: string;
  conceptType: string;
  conceptColor: string;
  inputCount: number;
  outputCount: number;
  binding: CdgBinding | undefined;
  isCritical: boolean;
  isSwappable: boolean;
  dejargonized: string;
  [key: string]: unknown;
}

// ─── Transform CDG → React Flow ────────────────────────────────────

export function transformCdgToFlowData(cdg: CdgData): {
  nodes: Node<AtomNodeData>[];
  edges: Edge[];
} {
  const bindingMap = new Map(cdg.bindings.map((b) => [b.stage_id, b]));
  const criticalSet = new Set(cdg.applicability?.critical_stages ?? []);
  const swappableSet = new Set(
    Object.keys(cdg.applicability?.swappable_stages ?? {})
  );

  const nodes: Node<AtomNodeData>[] = cdg.stages.map((stage, i) => ({
    id: stage.stage_id,
    type: "atomNode",
    position: { x: 0, y: 0 }, // dagre will set these
    data: {
      label: stage.name,
      conceptType: stage.concept_type,
      conceptColor: getConceptColor(stage.concept_type),
      inputCount: stage.inputs.length,
      outputCount: stage.outputs.length,
      binding: bindingMap.get(stage.stage_id),
      isCritical: criticalSet.has(stage.stage_id),
      isSwappable: swappableSet.has(stage.stage_id),
      dejargonized: stage.dejargonized_description,
    },
  }));

  const edges: Edge[] = cdg.edges.map((e, i) => {
    const style = LOSS_CLASS_STYLES[e.loss_class] ?? LOSS_CLASS_STYLES.preserving;
    const isCallable = e.edge_kind === "callable_injection";

    return {
      id: `e-${i}`,
      source: e.source_stage_id,
      target: e.target_stage_id,
      animated: true,
      label: e.data_kind || e.output_name,
      labelStyle: { fontSize: 10, fill: "#8b8fa4" },
      labelBgStyle: { fill: "#181b24", fillOpacity: 0.9 },
      labelBgPadding: [4, 2] as [number, number],
      style: {
        stroke: isCallable ? "#ec4899" : style.stroke,
        strokeWidth: 2,
        strokeDasharray: isCallable ? "8 4" : style.strokeDasharray,
      },
      type: "smoothstep",
    };
  });

  return { nodes, edges };
}

// ─── Dagre auto-layout ─────────────────────────────────────────────

export function getLayoutedElements(
  nodes: Node<AtomNodeData>[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): { nodes: Node<AtomNodeData>[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 100,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
