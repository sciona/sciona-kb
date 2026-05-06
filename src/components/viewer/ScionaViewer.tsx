import { useMemo, useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
  type ColorMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import AtomNode from "./AtomNode";
import DetailPanel from "./DetailPanel";
import SwapPanel from "./SwapPanel";
import {
  transformCdgToFlowData,
  getLayoutedElements,
  type AtomNodeData,
} from "./transform";
import type { CdgData, CdgStage, CdgBinding } from "./types";

type PanelState =
  | { kind: "detail"; stage: CdgStage; binding: CdgBinding | undefined }
  | { kind: "swap"; stage: CdgStage; binding: CdgBinding }
  | null;

// ─── Custom node types registry ────────────────────────────────────

const nodeTypes = { atomNode: AtomNode };

// ─── Props ─────────────────────────────────────────────────────────

interface ScionaViewerProps {
  cdgData: CdgData;
  readOnly?: boolean;
  direction?: "TB" | "LR";
  height?: string;
}

// ─── Component ─────────────────────────────────────────────────────

export default function ScionaViewer({
  cdgData,
  readOnly = true,
  direction = "TB",
  height = "600px",
}: ScionaViewerProps) {
  const [dir, setDir] = useState(direction);
  const [panel, setPanel] = useState<PanelState>(null);

  const stageMap = useMemo(
    () => new Map(cdgData.stages.map((s) => [s.stage_id, s])),
    [cdgData]
  );
  const bindingMap = useMemo(
    () => new Map(cdgData.bindings.map((b) => [b.stage_id, b])),
    [cdgData]
  );

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    const { nodes: rawNodes, edges: rawEdges } = transformCdgToFlowData(cdgData);
    const { nodes: ln, edges: le } = getLayoutedElements(rawNodes, rawEdges, dir);
    return { layoutedNodes: ln, layoutedEdges: le };
  }, [cdgData, dir]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const toggleDirection = useCallback(() => {
    const newDir = dir === "TB" ? "LR" : "TB";
    setDir(newDir);
    const { nodes: rawNodes, edges: rawEdges } = transformCdgToFlowData(cdgData);
    const { nodes: ln, edges: le } = getLayoutedElements(rawNodes, rawEdges, newDir);
    setNodes(ln);
    setEdges(le);
  }, [dir, cdgData, setNodes, setEdges]);

  // Node click → open detail or swap panel
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      const stage = stageMap.get(node.id);
      if (!stage) return;
      const binding = bindingMap.get(node.id);

      // Check if the click target was the swap trigger
      const target = event.target as HTMLElement;
      const isSwapClick = target.closest("[data-swap-trigger]") !== null;

      if (isSwapClick && binding) {
        setPanel({ kind: "swap", stage, binding });
      } else {
        setPanel({ kind: "detail", stage, binding });
      }
    },
    [stageMap, bindingMap]
  );

  const closePanel = useCallback(() => setPanel(null), []);

  // Legend data
  const bindingStats = useMemo(() => {
    const bound = cdgData.bindings.filter((b) => b.status === "active").length;
    const gaps = cdgData.bindings.filter((b) => b.status === "gap").length;
    return { bound, gaps, total: cdgData.stages.length };
  }, [cdgData]);

  const platformUrl = `https://app.sciona.dev/cdg/${cdgData.asset_id}`;

  return (
    <div
      className="relative rounded-lg overflow-hidden border border-[#2a2e3a]"
      style={{ height, backgroundColor: "#0f1117" }}
    >
      {/* Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="bg-[#181b24] border border-[#2a2e3a] rounded-md px-3 py-1.5 flex items-center gap-3">
          <span className="text-[11px] text-[#8b8fa4] font-medium">
            {cdgData.stages.length} stages
          </span>
          <span className="w-px h-3 bg-[#2a2e3a]" />
          <span className="text-[11px] text-[#8b8fa4]">
            {cdgData.edges.length} edges
          </span>
          <span className="w-px h-3 bg-[#2a2e3a]" />
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
            <span className="text-[#8b8fa4]">{bindingStats.bound}</span>
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
            <span className="text-[#8b8fa4]">{bindingStats.gaps}</span>
          </span>
        </div>
        <button
          onClick={toggleDirection}
          className="bg-[#181b24] border border-[#2a2e3a] rounded-md px-2.5 py-1.5 text-[11px] text-[#8b8fa4] hover:text-[#6c8cff] hover:border-[#6c8cff33] transition-colors cursor-pointer"
          title={`Switch to ${dir === "TB" ? "Left-to-Right" : "Top-to-Bottom"} layout`}
        >
          {dir === "TB" ? "↕ TB" : "↔ LR"}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        panOnDrag
        zoomOnScroll
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1.2 }}
        minZoom={0.2}
        maxZoom={2}
        colorMode={"dark" as ColorMode}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          gap={20}
          size={1}
          color="#1f2330"
        />
        <Controls
          showInteractive={false}
          className="!bg-[#181b24] !border-[#2a2e3a] !rounded-md [&>button]:!bg-[#181b24] [&>button]:!border-[#2a2e3a] [&>button]:!text-[#8b8fa4] [&>button:hover]:!text-[#6c8cff]"
        />
        <MiniMap
          nodeColor={(n: Node) => {
            const d = n.data as AtomNodeData;
            return d.conceptColor;
          }}
          maskColor="#0f111799"
          className="!bg-[#181b24] !border-[#2a2e3a] !rounded-md"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Edge legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-[#181b24] border border-[#2a2e3a] rounded-md px-3 py-2 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[10px] text-[#8b8fa4]">
          <span className="w-4 h-0.5 bg-[#4ade80]" /> preserving
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#8b8fa4]">
          <span className="w-4 h-0.5 bg-[#facc15]" style={{ borderBottom: "1px dashed #facc15" }} /> lossy
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#8b8fa4]">
          <span className="w-4 h-0.5 bg-[#ec4899]" style={{ borderBottom: "1px dashed #ec4899" }} /> callable
        </span>
      </div>

      {/* CTA button */}
      <a
        href={platformUrl}
        target="_blank"
        rel="noopener"
        className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-[#6c8cff]/20"
        style={{ backgroundColor: "#6c8cff" }}
      >
        Open &amp; Modify in Sciona
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>

      {/* Panels */}
      {panel?.kind === "detail" && (
        <DetailPanel
          stage={panel.stage}
          binding={panel.binding}
          onClose={closePanel}
        />
      )}
      {panel?.kind === "swap" && (
        <SwapPanel
          stage={panel.stage}
          binding={panel.binding}
          onClose={closePanel}
        />
      )}
    </div>
  );
}
