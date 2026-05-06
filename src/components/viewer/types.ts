/** Types matching the CDG frontmatter schema from content.config.ts */

export interface IOSpec {
  name: string;
  type_desc: string;
  constraints: string;
  required: boolean;
}

export interface CdgStage {
  stage_id: string;
  name: string;
  description: string;
  dejargonized_description: string;
  concept_type: string;
  inputs: IOSpec[];
  outputs: IOSpec[];
  preconditions: string[];
  guarantees: string[];
  matched_primitive: string;
}

export interface CdgEdge {
  source_stage_id: string;
  target_stage_id: string;
  output_name: string;
  input_name: string;
  source_type: string;
  target_type: string;
  edge_kind: string;
  data_kind: string;
  provenance: string;
  loss_class: string;
}

export interface CdgBinding {
  stage_id: string;
  bound_atom_fqdn: string | null;
  binding_confidence: number;
  status: "active" | "gap" | "approximate";
  action_class: string;
  atom_code: string;
  atom_code_html: string;
  atom_summary: string;
  atom_type_sig: string;
  atom_github_path: string;
  swap_rationale: string;
  swap_candidates: SwapCandidate[];
}

export interface SwapCandidate {
  fqdn: string;
  stage_name: string;
  cdg_name: string;
  cdg_asset_id: string;
}

export interface CdgData {
  asset_id: string;
  name: string;
  stages: CdgStage[];
  edges: CdgEdge[];
  bindings: CdgBinding[];
  applicability?: {
    critical_stages?: string[];
    swappable_stages?: Record<string, string>;
  };
}
