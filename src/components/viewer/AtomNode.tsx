import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AtomNodeData } from "./transform";

function BindingDot({ status }: { status: "active" | "gap" | "approximate" }) {
  const colors: Record<string, string> = {
    active: "#4ade80",
    approximate: "#facc15",
    gap: "#f87171",
  };
  return (
    <span
      style={{ backgroundColor: colors[status] }}
      className="inline-block w-2 h-2 rounded-full"
      title={`Binding: ${status}`}
    />
  );
}

function AtomNode({ data }: NodeProps) {
  const d = data as unknown as AtomNodeData;

  return (
    <div
      className="relative group"
      style={{ width: 280 }}
    >
      {/* Target handle (left/top) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-[#2a2e3a] !bg-[#6c8cff]"
      />

      {/* Card */}
      <div
        className="rounded-lg overflow-hidden"
        style={{
          backgroundColor: "#181b24",
          border: `1px solid ${d.isCritical ? d.conceptColor : "#2a2e3a"}`,
          boxShadow: d.isCritical
            ? `0 0 12px ${d.conceptColor}33`
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header strip */}
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ backgroundColor: `${d.conceptColor}18` }}
        >
          <span
            className="w-2.5 h-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: d.conceptColor }}
          />
          <span
            className="text-[10px] font-mono uppercase tracking-wider truncate"
            style={{ color: d.conceptColor }}
          >
            {d.conceptType.replace(/_/g, " ")}
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            {d.isSwappable && (
              <span
                className="text-[10px] text-amber-400 cursor-pointer hover:text-amber-300 hover:scale-125 transition-all"
                title="View swap candidates"
                data-swap-trigger="true"
              >
                ↻
              </span>
            )}
            {d.binding && <BindingDot status={d.binding.status} />}
          </span>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5">
          <h3 className="text-xs font-semibold text-[#e2e4ea] leading-tight mb-1 line-clamp-2">
            {d.label}
          </h3>
          {d.dejargonized && (
            <p className="text-[10px] text-[#8b8fa4] leading-snug line-clamp-2">
              {d.dejargonized}
            </p>
          )}
        </div>

        {/* Footer - ports */}
        <div className="flex items-center justify-between px-3 py-1 border-t border-[#2a2e3a]">
          <span className="text-[9px] font-mono text-[#8b8fa4]">
            {d.inputCount > 0 && `${d.inputCount} in`}
          </span>
          {d.binding?.bound_atom_fqdn && (
            <span className="text-[9px] font-mono text-[#6c8cff] truncate max-w-[160px]" title={d.binding.bound_atom_fqdn}>
              {d.binding.bound_atom_fqdn.split(".").pop()}
            </span>
          )}
          <span className="text-[9px] font-mono text-[#8b8fa4]">
            {d.outputCount > 0 && `${d.outputCount} out`}
          </span>
        </div>
      </div>

      {/* Source handle (right/bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !rounded-full !border-2 !border-[#2a2e3a] !bg-[#4ade80]"
      />
    </div>
  );
}

export default memo(AtomNode);
