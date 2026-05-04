import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// ─── Shared Sub-schemas ───────────────────────────────────────────

const IOSpecSchema = z.object({
  name: z.string(),
  type_desc: z.string(),
  constraints: z.string().default(""),
  data_kind: z.string().default(""),
  required: z.boolean().default(true),
  default_value_repr: z.string().default(""),
  dim_signature: z.string().default(""),
});

// concept_type is a free-form string -- the source data has 300+ granular types
// from sklearn decomposition alongside the ~40 canonical CDG-level types.
const ConceptType = z.string();

const ReferenceSchema = z.object({
  title: z.string(),
  citation: z.string(),
  url: z.string().optional(),
  note: z.string().optional(),
});

// ─── Atoms Collection ─────────────────────────────────────────────

const atoms = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "src/content/atoms" }),
  schema: z.object({
    fqdn: z.string(),
    predicate_id: z.string(),
    repo: z.string(),
    domain: z.string(),

    type_signature: z.string(),
    informal_desc: z.string(),
    conceptual_summary: z.string(),
    inputs: z.array(IOSpecSchema).default([]),
    outputs: z.array(IOSpecSchema).default([]),

    concept_type: ConceptType,
    verification_level: z.string().default("type_checked"),

    used_by_cdgs: z.array(z.string()).default([]),
    references: z.array(ReferenceSchema).default([]),

    title: z.string(),
    description: z.string(),
  }),
});

// ─── CDGs Collection ──────────────────────────────────────────────

const StageSchema = z.object({
  stage_id: z.string(),
  name: z.string(),
  description: z.string(),
  dejargonized_description: z.string().default(""),
  concept_type: ConceptType,
  inputs: z.array(IOSpecSchema).default([]),
  outputs: z.array(IOSpecSchema).default([]),
  preconditions: z.array(z.string()).default([]),
  guarantees: z.array(z.string()).default([]),
  matched_primitive: z.string().default(""),
});

const EdgeSchema = z.object({
  source_stage_id: z.string(),
  target_stage_id: z.string(),
  output_name: z.string(),
  input_name: z.string(),
  source_type: z.string().default(""),
  target_type: z.string().default(""),
  edge_kind: z.enum(["data_flow", "callable_injection"]).default("data_flow"),
  data_kind: z.string().default(""),
  provenance: z.string().default(""),
  loss_class: z.enum(["preserving", "lossy_but_allowed", "irreversible"]).default("preserving"),
});

const ApplicabilitySchema = z.object({
  use_when: z.array(z.string()).default([]),
  do_not_use_when: z.array(z.string()).default([]),
  key_insight: z.string().default(""),
  critical_stages: z.array(z.string()).default([]),
  swappable_stages: z.record(z.string(), z.string()).default({}),
  scaling_notes: z.string().default(""),
  failure_modes: z.array(z.string()).default([]),
});

const ConstraintSchema = z.object({
  category: z.string(),
  subject: z.string(),
  statement: z.string(),
  rationale: z.string().default(""),
  confidence: z.number().default(1.0),
  source_stage: z.string().default(""),
  source_reference: z.string().default(""),
});

const AuditSchema = z.object({
  source_kind: z.string(),
  review_status: z.enum(["draft", "reviewed", "published"]).default("draft"),
  rationale: z.string().default(""),
  provenance_notes: z.array(z.string()).default([]),
  uncertainty_notes: z.array(z.string()).default([]),
  references: z.array(ReferenceSchema).default([]),
  maintainers: z.array(z.string()).default([]),
});

const BindingSchema = z.object({
  stage_id: z.string(),
  bound_atom_fqdn: z.string().nullable().default(null),
  binding_confidence: z.number().default(0),
  status: z.enum(["active", "gap", "approximate"]).default("gap"),
  action_class: z.string().default(""),
});

const SolutionMetadataSchema = z.object({
  competition: z.string(),
  placement: z.string(),
  team: z.string().default(""),
  year: z.number(),
  metric: z.string().default(""),
  problem_domain: z.string(),
  source_url: z.string().default(""),
  source_license: z.string().nullable().default(null),
});

const cdgs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "src/content/cdgs" }),
  schema: z.object({
    asset_id: z.string(),
    asset_version: z.string().default("v1"),
    family: z.string(),
    paradigm: z.string(),

    name: z.string(),
    summary: z.string(),
    dejargonized_summary: z.string().default(""),
    canonical_for_paradigm: z.boolean().default(false),
    variant_hints: z.array(z.string()).default([]),

    inputs: z.array(IOSpecSchema).default([]),
    outputs: z.array(IOSpecSchema).default([]),

    stages: z.array(StageSchema),
    edges: z.array(EdgeSchema).default([]),

    applicability: ApplicabilitySchema,
    planning_constraints: z.array(ConstraintSchema).default([]),
    audit: AuditSchema,

    bindings: z.array(BindingSchema).default([]),
    binding_summary: z.object({
      total_stages: z.number(),
      bound_active: z.number(),
      gaps: z.number(),
    }).optional(),

    solution_metadata: SolutionMetadataSchema.optional(),

    title: z.string(),
    description: z.string(),
  }),
});

// ─── Solutions Collection ─────────────────────────────────────────

const solutions = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "src/content/solutions" }),
  schema: z.object({
    cdg_asset_id: z.string(),

    title: z.string(),
    description: z.string(),
    problem_statement: z.string(),
    platform: z.enum(["kaggle", "leetcode", "drivendata", "neurips", "kdd", "open_web"]),
    competition_name: z.string(),
    placement: z.string(),
    year: z.number(),
    domain: z.string(),

    paradigm: z.string(),
    family: z.string(),
    tags: z.array(z.string()).default([]),

    key_insight: z.string(),
    failure_modes: z.array(z.string()).default([]),
    source_url: z.string().default(""),
    source_license: z.string().nullable().default(null),
  }),
});

// ─── Export ───────────────────────────────────────────────────────

export const collections = { atoms, cdgs, solutions };
