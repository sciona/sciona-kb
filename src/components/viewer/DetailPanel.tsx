import type { CdgStage, CdgBinding } from "./types";

interface DetailPanelProps {
  stage: CdgStage;
  binding: CdgBinding | undefined;
  onClose: () => void;
}

export default function DetailPanel({ stage, binding, onClose }: DetailPanelProps) {
  const hasCode = !!binding?.atom_code;
  const githubUrl = binding?.atom_github_path
    ? `https://github.com/sciona/${binding.atom_github_path.split("/")[0]}/blob/main/${binding.atom_github_path.split("/").slice(1).join("/")}`
    : null;

  return (
    <div
      className="absolute top-0 right-0 z-20 h-full flex"
      style={{ maxWidth: "min(480px, 50%)" }}
    >
      {/* Backdrop click-to-close strip */}
      <button
        onClick={onClose}
        className="w-8 h-full bg-transparent cursor-pointer flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors group"
        aria-label="Close panel"
      >
        <svg className="w-4 h-4 text-[#8b8fa4] group-hover:text-[#e2e4ea] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel */}
      <div
        className="flex-1 overflow-y-auto border-l border-[#2a2e3a]"
        style={{ backgroundColor: "#13151d" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 py-3 border-b border-[#2a2e3a]" style={{ backgroundColor: "#13151d" }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#e2e4ea]">{stage.name}</h3>
              <span
                className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{
                  color: "#8b8fa4",
                  backgroundColor: "#1f2330",
                }}
              >
                {stage.concept_type.replace(/_/g, " ")}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#8b8fa4] hover:text-[#e2e4ea] transition-colors p-1 cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-4 py-3 space-y-4">
          {/* Description */}
          <section>
            <p className="text-xs text-[#8b8fa4] leading-relaxed">
              {stage.dejargonized_description || stage.description}
            </p>
          </section>

          {/* Binding status */}
          {binding && (
            <section>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  binding.status === "active" ? "bg-[#4ade80]" :
                  binding.status === "approximate" ? "bg-[#facc15]" : "bg-[#f87171]"
                }`} />
                <span className="text-xs text-[#8b8fa4]">
                  {binding.status === "active" ? "Bound" : binding.status === "approximate" ? "Approximate" : "Unbound"} atom
                  {binding.binding_confidence > 0 && ` (${Math.round(binding.binding_confidence * 100)}%)`}
                </span>
              </div>
              {binding.bound_atom_fqdn && (
                <code className="block mt-1 text-[10px] font-mono text-[#6c8cff] break-all">
                  {binding.bound_atom_fqdn}
                </code>
              )}
            </section>
          )}

          {/* Type signature */}
          {binding?.atom_type_sig && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Type Signature
              </h4>
              <div className="bg-[#0f1117] rounded border border-[#2a2e3a] p-2.5 overflow-x-auto">
                <code className="text-[11px] font-mono text-[#6c8cff] whitespace-pre-wrap break-all leading-relaxed">
                  {binding.atom_type_sig}
                </code>
              </div>
            </section>
          )}

          {/* Conceptual summary */}
          {binding?.atom_summary && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Mathematical Explanation
              </h4>
              <p className="text-xs text-[#c8cad0] leading-relaxed">
                {binding.atom_summary}
              </p>
            </section>
          )}

          {/* Python source code */}
          {hasCode && (
            <section>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] font-medium">
                  Python Source
                </h4>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-[10px] text-[#6c8cff] hover:text-[#8aa4ff] transition-colors flex items-center gap-1"
                  >
                    View on GitHub
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              {binding!.atom_code_html ? (
                <div
                  className="rounded border border-[#2a2e3a] overflow-x-auto text-[11px] leading-relaxed [&_pre]:!p-3 [&_pre]:!m-0 [&_pre]:!bg-[#0f1117] [&_code]:!text-[11px] [&_code]:!leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: binding!.atom_code_html }}
                />
              ) : (
                <div className="bg-[#0f1117] rounded border border-[#2a2e3a] overflow-x-auto">
                  <pre className="p-3 text-[11px] font-mono leading-relaxed text-[#c8cad0]">
                    <code>{binding!.atom_code}</code>
                  </pre>
                </div>
              )}
            </section>
          )}

          {/* I/O specs */}
          {stage.inputs.length > 0 && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Inputs
              </h4>
              <div className="space-y-1">
                {stage.inputs.map((io) => (
                  <div key={io.name} className="flex items-baseline gap-2 text-[11px]">
                    <code className="font-mono text-[#6c8cff] shrink-0">{io.name}</code>
                    <span className="font-mono text-[#8b8fa4]">{io.type_desc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {stage.outputs.length > 0 && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Outputs
              </h4>
              <div className="space-y-1">
                {stage.outputs.map((io) => (
                  <div key={io.name} className="flex items-baseline gap-2 text-[11px]">
                    <code className="font-mono text-[#4ade80] shrink-0">{io.name}</code>
                    <span className="font-mono text-[#8b8fa4]">{io.type_desc}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contracts */}
          {stage.preconditions.length > 0 && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Preconditions
              </h4>
              <ul className="space-y-0.5">
                {stage.preconditions.map((p, i) => (
                  <li key={i} className="text-[11px] text-[#8b8fa4] flex gap-1.5">
                    <span className="text-[#facc15] shrink-0">require</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {stage.guarantees.length > 0 && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-1.5 font-medium">
                Guarantees
              </h4>
              <ul className="space-y-0.5">
                {stage.guarantees.map((g, i) => (
                  <li key={i} className="text-[11px] text-[#8b8fa4] flex gap-1.5">
                    <span className="text-[#4ade80] shrink-0">ensure</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
