import type { CdgStage, CdgBinding } from "./types";

interface SwapPanelProps {
  stage: CdgStage;
  binding: CdgBinding;
  onClose: () => void;
}

function atomFqdnToPath(fqdn: string): string {
  const parts = fqdn.replace("sciona.atoms.", "").split(".");
  return `/atoms/${parts.map((p) => p.replace(/_/g, "-")).join("/")}`;
}

function atomShortName(fqdn: string): string {
  return fqdn.split(".").pop()?.replace(/_/g, " ") ?? fqdn;
}

export default function SwapPanel({ stage, binding, onClose }: SwapPanelProps) {
  const candidates = binding.swap_candidates;
  const currentFqdn = binding.bound_atom_fqdn;

  return (
    <div
      className="absolute top-0 right-0 z-20 h-full flex"
      style={{ maxWidth: "min(480px, 50%)" }}
    >
      {/* Collapse strip */}
      <button
        onClick={onClose}
        className="w-8 h-full bg-transparent cursor-pointer flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors group"
        aria-label="Close panel"
      >
        <svg className="w-4 h-4 text-[#8b8fa4] group-hover:text-[#e2e4ea] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Panel body */}
      <div
        className="flex-1 overflow-y-auto border-l border-[#2a2e3a]"
        style={{ backgroundColor: "#13151d" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 py-3 border-b border-[#2a2e3a]" style={{ backgroundColor: "#13151d" }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 text-sm">↻</span>
                <h3 className="text-sm font-semibold text-[#e2e4ea]">Swappable Stage</h3>
              </div>
              <p className="text-xs text-[#8b8fa4]">{stage.name}</p>
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
          {/* Swap rationale */}
          {binding.swap_rationale && (
            <section className="bg-amber-400/5 border border-amber-400/15 rounded-lg p-3">
              <h4 className="text-[10px] uppercase tracking-wider text-amber-400 mb-1 font-medium">
                Why this is swappable
              </h4>
              <p className="text-xs text-[#c8cad0] leading-relaxed">{binding.swap_rationale}</p>
            </section>
          )}

          {/* Current atom */}
          {currentFqdn && (
            <section>
              <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-2 font-medium">
                Current Atom
              </h4>
              <div className="bg-[#6c8cff]/8 border border-[#6c8cff]/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#6c8cff]" />
                  <span className="text-xs font-medium text-[#e2e4ea]">
                    {atomShortName(currentFqdn)}
                  </span>
                </div>
                <code className="block mt-1 text-[10px] font-mono text-[#6c8cff]/70 break-all">
                  {currentFqdn}
                </code>
              </div>
            </section>
          )}

          {/* Candidate atoms */}
          <section>
            <h4 className="text-[10px] uppercase tracking-wider text-[#8b8fa4] mb-2 font-medium">
              Alternative Atoms ({candidates.length})
            </h4>
            {candidates.length === 0 ? (
              <p className="text-xs text-[#8b8fa4] italic">
                No alternative atoms of type <code className="text-[#6c8cff]">{stage.concept_type}</code> found in the catalog.
              </p>
            ) : (
              <div className="space-y-2">
                {candidates.map((c) => (
                  <a
                    key={c.fqdn}
                    href={atomFqdnToPath(c.fqdn)}
                    className="block bg-[#181b24] border border-[#2a2e3a] rounded-lg p-3 hover:border-[#6c8cff]/30 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#e2e4ea] group-hover:text-[#6c8cff] transition-colors truncate">
                          {atomShortName(c.fqdn)}
                        </p>
                        <code className="block mt-0.5 text-[10px] font-mono text-[#8b8fa4] break-all">
                          {c.fqdn}
                        </code>
                      </div>
                      <svg className="w-3.5 h-3.5 text-[#8b8fa4] group-hover:text-[#6c8cff] transition-colors shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#8b8fa4]">
                      <span className="truncate" title={c.cdg_name}>
                        used as <span className="text-[#c8cad0]">{c.stage_name}</span>
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-[#8b8fa4] truncate" title={c.cdg_name}>
                      in {c.cdg_name}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Concept type context */}
          <section className="border-t border-[#2a2e3a] pt-3">
            <p className="text-[10px] text-[#8b8fa4]">
              Showing atoms classified as <code className="text-[#6c8cff]">{stage.concept_type.replace(/_/g, " ")}</code> that
              are actively bound in other CDGs. These are verified, working implementations that could replace this stage
              if the I/O contract is preserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
