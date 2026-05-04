# Sciona Algorithm Atlas -- Architecture Plan

> **Status:** Draft -- awaiting review before execution.
> **Generated:** 2026-05-04
> **Source-of-truth data:** 125 solution CDGs, ~100+ atoms across 10 repos, 127 binding files.

---

## 1. Local Data Discovery Summary

### Atom Structure (source: `sciona-atoms/src/sciona/atoms/**/` + 9 satellite repos)

Each atom is a **directory** containing:

| File | Purpose |
|---|---|
| `atoms.py` | Implementation with `@register_atom`, icontract pre/postconditions, typed signatures |
| `witnesses.py` | Shape/type witness functions for static analysis |
| `matches.json` | Formal metadata: `predicate_id`, `statement` (type sig), `informal_desc`, `conceptual_summary`, `verification_level` |
| `cdg.json` | Atom-level CDG: nodes (with `node_id`, `parent_id`, `concept_type`, `inputs`/`outputs` as IOSpec, `status`, `matched_primitive`), edges, metadata |
| `references.json` | Academic/technical citations |
| `state_models.py` | *(optional)* Pydantic/dataclass state definitions |

**Key atom metadata fields (from `matches.json`):**
- `predicate_id` -- function name (e.g., `initializelineargaussianstatemodel`)
- `statement` -- formal type signature (e.g., `(initial_state: Vector[float], ...) -> StateModelSpec{x, P, F, Q, H, R}`)
- `informal_desc` -- one-line plain English
- `conceptual_summary` -- multi-sentence algorithmic explanation with application examples
- `verification_level` -- `type_checked` | etc.
- `source_lib` -- `ingester` | library name

**FQDN convention:** `sciona.atoms.<domain>.<subdomain>.<atom_group>` (e.g., `sciona.atoms.ml.gradient_attacks.momentum_gradient_accumulation`)

**Atom repos:** `sciona-atoms` (core), `sciona-atoms-{ml,dl,cs,signal,physics,geo,bio,fintech,robotics}`

### CDG Structure (source: `sciona-atoms/data/solution_cdgs/*.json`)

125 solution CDG JSON files. Top-level keys:

```
asset_id          string    "solution.kaggle.adversarial_attacks_1st"
asset_version     string    "v1"
family            string    "adversarial" | "time_series_classification" | ...
paradigm          string    "optimization" | "searching" | "neural_network" | ...
name              string    Human-readable title
summary           string    Technical summary
dejargonized_summary  string    Plain-English explanation
canonical_for_paradigm  bool
variant_hints     string[]  SEO-relevant synonyms/keywords
inputs            IOSpec[]  Root-level inputs
outputs           IOSpec[]  Root-level outputs
applicability     object    { use_when, do_not_use_when, key_insight, critical_stages, swappable_stages, scaling_notes, failure_modes }
planning_constraints  Constraint[]
stages            Stage[]   The algorithmic steps
edges             Edge[]    Data-flow dependencies
audit             object    { source_kind, review_status, rationale, provenance_notes, uncertainty_notes, references[], maintainers[] }
```

**Stage fields:** `stage_id`, `name`, `description`, `dejargonized_description`, `concept_type` (39 enum values), `inputs[]`, `outputs[]`, `preconditions[]`, `guarantees[]`, `matched_primitive`

**Edge fields:** `source_stage_id`, `target_stage_id`, `output_name`, `input_name`, `source_type`, `target_type`, `edge_kind` (`DATA_FLOW` | `CALLABLE_INJECTION`), `data_kind`, `provenance`, `loss_class` (`preserving` | `lossy_allowed` | `irreversible`)

**IOSpec fields:** `name`, `type_desc`, `constraints`, `data_kind`, `time_basis`, `provenance`, `required`, `default_value_repr`, `dim_signature`

### Solution-to-CDG Bindings (source: `*_bindings.json`)

127 binding files alongside CDGs. Schema:

```
schema_version        string
solution_id           string    matches asset_id
solution_metadata     object    { competition, placement, team, year, metric, problem_domain, source_url, source_license }
bindings              Binding[] per-stage binding records
binding_summary       object    { total_stages, bound_active, bound_approximate, gaps, atoms_used_by_repo, novel_atoms_needed[], orchestration_resolved[], external_knowledge_resolved[] }
```

**Binding fields:** `stage_id`, `bound_artifact_fqdn` (atom FQDN or null), `binding_confidence` (0.0-1.0), `binding_source`, `status` (`active` | `gap` | `approximate`), `action_class` (`replace_stage` | `orchestration` | `external_knowledge` | `gate_or_validate`), `evidence_summary`

### ConceptType Enum (used for category taxonomy)
`SORTING`, `SEARCHING`, `DIVIDE_AND_CONQUER`, `GREEDY`, `DYNAMIC_PROGRAMMING`, `GRAPH_TRAVERSAL`, `GRAPH_OPTIMIZATION`, `STRING_MATCHING`, `GEOMETRY`, `ARITHMETIC`, `NUMBER_THEORY`, `COMBINATORICS`, `ALGEBRA`, `OPTIMIZATION`, `ANALYSIS`, `SET_THEORY`, `SIGNAL_TRANSFORM`, `SIGNAL_FILTER`, `NEURAL_NETWORK`, `CLUSTERING`, `DIMENSIONALITY_REDUCTION`, `ODE_SOLVER`, `QUADRATURE`, `RANDOMIZED`, `INFORMATION_THEORY`, `COMPRESSION`, `SAMPLER`, `LOG_PROB`, `POSTERIOR_UPDATE`, `VARIATIONAL_INFERENCE`, `MCMC_KERNEL`, `MESSAGE_PASSING`, `CONJUGATE_UPDATE`, `ML_MODEL_SELECTION`, `STATE_INIT`, `DATA_ASSEMBLY`, `CONDITIONAL_ROUTING`, `DATA_EXTRACTION`, `VISUALIZATION`, `LOSS_FUNCTION`, `EXTERNAL_KNOWLEDGE`, `CUSTOM`, `EXTERNAL_TOOL`, `FIXED_POINT`

---

## 2. Content Collection Schemas (`src/content/config.ts`)

```typescript
import { z, defineCollection } from "astro:content";

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

const ConceptType = z.enum([
  "sorting", "searching", "divide_and_conquer", "greedy",
  "dynamic_programming", "graph_traversal", "graph_optimization",
  "string_matching", "geometry", "arithmetic", "number_theory",
  "combinatorics", "algebra", "optimization", "analysis",
  "set_theory", "signal_transform", "signal_filter", "neural_network",
  "clustering", "dimensionality_reduction", "ode_solver", "quadrature",
  "randomized", "information_theory", "compression", "sampler",
  "log_prob", "posterior_update", "variational_inference", "mcmc_kernel",
  "message_passing", "conjugate_update", "ml_model_selection",
  "state_init", "data_assembly", "conditional_routing", "data_extraction",
  "visualization", "loss_function", "external_knowledge", "custom",
  "external_tool", "fixed_point",
]);

const ReferenceSchema = z.object({
  title: z.string(),
  citation: z.string(),
  url: z.string().optional(),
  note: z.string().optional(),
});

// ─── Atoms Collection ─────────────────────────────────────────────
// Source: matches.json + cdg.json per atom directory
// Slug = FQDN with dots replaced by slashes (e.g., state-estimation/kalman-filters/static-kf/initializelineargaussianstatemodel)

const atoms = defineCollection({
  type: "content", // .mdx files
  schema: z.object({
    // Identity
    fqdn: z.string(),                          // "sciona.atoms.state_estimation.kalman_filters.static_kf.initializelineargaussianstatemodel"
    predicate_id: z.string(),                   // "initializelineargaussianstatemodel"
    repo: z.string(),                           // "sciona-atoms" | "sciona-atoms-ml" | ...
    domain: z.string(),                         // top-level domain: "state_estimation", "ml", "dl", ...

    // Content
    type_signature: z.string(),                 // formal sig from matches.json .statement
    informal_desc: z.string(),                  // one-liner
    conceptual_summary: z.string(),             // multi-sentence explanation
    inputs: z.array(IOSpecSchema),              // from cdg.json node inputs
    outputs: z.array(IOSpecSchema),             // from cdg.json node outputs

    // Classification
    concept_type: ConceptType,                  // from cdg.json node concept_type
    verification_level: z.string().default("type_checked"),

    // Reverse lookups (populated by sync script)
    used_by_cdgs: z.array(z.string()).default([]),  // asset_ids of CDGs that bind this atom

    // References
    references: z.array(ReferenceSchema).default([]),

    // SEO
    title: z.string(),                          // derived: human-readable name
    description: z.string(),                    // derived: truncated conceptual_summary
  }),
});

// ─── CDGs Collection ──────────────────────────────────────────────
// Source: solution_cdgs/*.json
// Slug = asset_id tail (e.g., "adversarial-attacks-1st")

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
  loss_class: z.enum(["preserving", "lossy_allowed", "irreversible"]).default("preserving"),
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

const cdgs = defineCollection({
  type: "content",
  schema: z.object({
    // Identity
    asset_id: z.string(),                       // "solution.kaggle.adversarial_attacks_1st"
    asset_version: z.string().default("v1"),
    family: z.string(),                         // "adversarial", "time_series_classification", ...
    paradigm: z.string(),                       // "optimization", "searching", ...

    // Content
    name: z.string(),
    summary: z.string(),
    dejargonized_summary: z.string().default(""),
    canonical_for_paradigm: z.boolean().default(false),
    variant_hints: z.array(z.string()).default([]),

    // I/O
    inputs: z.array(IOSpecSchema).default([]),
    outputs: z.array(IOSpecSchema).default([]),

    // Graph structure (kept in frontmatter for component access)
    stages: z.array(StageSchema),
    edges: z.array(EdgeSchema).default([]),

    // Guidance
    applicability: ApplicabilitySchema,
    planning_constraints: z.array(ConstraintSchema).default([]),
    audit: AuditSchema,

    // Bindings (merged from _bindings.json by sync script)
    bindings: z.array(z.object({
      stage_id: z.string(),
      bound_atom_fqdn: z.string().nullable().default(null),
      binding_confidence: z.number().default(0),
      status: z.enum(["active", "gap", "approximate"]).default("gap"),
      action_class: z.string().default(""),
    })).default([]),
    binding_summary: z.object({
      total_stages: z.number(),
      bound_active: z.number(),
      gaps: z.number(),
    }).optional(),

    // Solution metadata (merged from _bindings.json)
    solution_metadata: z.object({
      competition: z.string(),
      placement: z.string(),
      team: z.string().default(""),
      year: z.number(),
      metric: z.string().default(""),
      problem_domain: z.string(),
      source_url: z.string().default(""),
      source_license: z.string().nullable().default(null),
    }).optional(),

    // SEO
    title: z.string(),                          // derived from name
    description: z.string(),                    // derived from dejargonized_summary
  }),
});

// ─── Solutions Collection ─────────────────────────────────────────
// Application-layer guides: practical walkthroughs of a CDG applied to a specific problem.
// Initially 1:1 with CDGs, but can diverge (multiple solutions per CDG, or LeetCode/open-web).
// Slug = kebab-case (e.g., "adversarial-attacks-nips-2017-1st")

const solutions = defineCollection({
  type: "content",
  schema: z.object({
    // Identity
    slug: z.string(),
    cdg_asset_id: z.string(),                   // links to CDGs collection

    // Content
    title: z.string(),                          // "How MI-FGSM Won NIPS 2017 Adversarial Attacks"
    description: z.string(),                    // SEO meta description
    problem_statement: z.string(),              // What was the challenge?
    platform: z.enum(["kaggle", "leetcode", "drivendata", "neurips", "kdd", "open_web"]),
    competition_name: z.string(),
    placement: z.string(),
    year: z.number(),
    domain: z.string(),                         // "adversarial_ml", "nlp_span_detection", ...

    // Taxonomy
    paradigm: z.string(),
    family: z.string(),
    tags: z.array(z.string()).default([]),       // from variant_hints + manual

    // Key takeaways (for the guide body)
    key_insight: z.string(),                    // from applicability.key_insight
    failure_modes: z.array(z.string()).default([]),
    source_url: z.string().default(""),
    source_license: z.string().nullable().default(null),

    // Dates
    publishedAt: z.date().optional(),
    updatedAt: z.date().optional(),
  }),
});

// ─── Export ───────────────────────────────────────────────────────

export const collections = { atoms, cdgs, solutions };
```

---

## 3. Data Pipeline Strategy

### Source-of-Truth Flow

```
sciona-atoms/data/solution_cdgs/*.json    ──┐
sciona-atoms/data/solution_cdgs/*_bindings.json ──┤
sciona-atoms*/src/**/matches.json         ──┤──▶  sync-content.ts  ──▶  src/content/{atoms,cdgs,solutions}/*.mdx
sciona-atoms*/src/**/cdg.json             ──┤
sciona-atoms*/src/**/references.json      ──┘
```

### Script: `scripts/sync-content.ts`

A single Node/Bun script (run at build time or via `npm run sync`) that:

1. **Scan atom repos** -- Walk each `sciona-atoms*/src/sciona/atoms/**/matches.json`. For each atom:
   - Read `matches.json` -> extract `predicate_id`, `statement`, `informal_desc`, `conceptual_summary`, `verification_level`
   - Read sibling `cdg.json` -> extract the leaf node matching this predicate for `concept_type`, `inputs`, `outputs`
   - Read sibling `references.json` -> extract citations
   - Compute FQDN from directory path (e.g., `sciona-atoms-ml/src/sciona/atoms/ml/gradient_attacks/...` -> `sciona.atoms.ml.gradient_attacks.<predicate_id>`)
   - Compute `used_by_cdgs[]` via reverse-lookup from CDG bindings

2. **Scan CDG files** -- For each `*.json` (non-bindings) in `solution_cdgs/`:
   - Parse CDG JSON -> map all top-level fields to frontmatter
   - Parse matching `*_bindings.json` -> merge `bindings[]`, `binding_summary`, `solution_metadata` into frontmatter
   - Generate MDX body with structured sections (auto-generated prose + `<ScionaViewer>` placeholder)

3. **Generate solution stubs** -- For each CDG, generate an initial solution MDX file:
   - Pull `solution_metadata` from bindings file
   - Pull `key_insight`, `failure_modes` from CDG `applicability`
   - Scaffold MDX body with `## Problem`, `## Approach`, `## CDG Walkthrough`, `## Key Insight`, `## Try It` sections

4. **Output** -- Write `.mdx` files with YAML frontmatter + MDX body into `src/content/`.

### Invocation

```jsonc
// package.json
{
  "scripts": {
    "sync": "tsx scripts/sync-content.ts",
    "prebuild": "npm run sync",
    "dev": "npm run sync && astro dev",
    "build": "npm run sync && astro build"
  }
}
```

### Environment Config

```env
# .env (or astro.config.mjs)
SCIONA_WORKSPACE=/Users/conrad/personal   # parent dir containing all sciona-atoms* repos
```

The sync script reads `SCIONA_WORKSPACE` and auto-discovers all atom repos by globbing `sciona-atoms*/`.

---

## 4. Directory Tree & Routing

```
sciona-kb/
├── astro.config.mjs              # SSG output, Cloudflare Pages adapter
├── package.json
├── tsconfig.json
├── .env                          # SCIONA_WORKSPACE path
├── scripts/
│   └── sync-content.ts           # Data pipeline: JSON -> MDX
│
├── src/
│   ├── content/
│   │   ├── config.ts             # Zod schemas (Section 2)
│   │   ├── atoms/
│   │   │   ├── state-estimation/
│   │   │   │   └── kalman-filters/
│   │   │   │       └── static-kf/
│   │   │   │           └── initializelineargaussianstatemodel.mdx
│   │   │   ├── ml/
│   │   │   │   └── gradient-attacks/
│   │   │   │       └── momentum-gradient-accumulation.mdx
│   │   │   └── ...
│   │   ├── cdgs/
│   │   │   ├── adversarial-attacks-1st.mdx
│   │   │   ├── amex-default-1st.mdx
│   │   │   └── ...  (125 files)
│   │   └── solutions/
│   │       ├── adversarial-attacks-nips-2017-1st.mdx
│   │       ├── amex-default-prediction-2022-1st.mdx
│   │       └── ...
│   │
│   ├── pages/
│   │   ├── index.astro                       # Landing: hero + search + featured CDGs
│   │   ├── atoms/
│   │   │   ├── index.astro                   # Atom catalog: filterable by domain, concept_type
│   │   │   └── [...slug].astro               # Dynamic: renders one atom MDX
│   │   ├── cdgs/
│   │   │   ├── index.astro                   # CDG catalog: filterable by family, paradigm
│   │   │   └── [...slug].astro               # Dynamic: renders one CDG MDX
│   │   ├── solutions/
│   │   │   ├── index.astro                   # Solutions catalog: filterable by platform, domain
│   │   │   └── [...slug].astro               # Dynamic: renders one solution MDX
│   │   ├── paradigm/
│   │   │   └── [paradigm].astro              # Taxonomy page: all CDGs with this paradigm
│   │   ├── family/
│   │   │   └── [family].astro                # Taxonomy page: all CDGs in this family
│   │   ├── concept/
│   │   │   └── [concept_type].astro          # Taxonomy page: all atoms of this concept_type
│   │   └── 404.astro
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro                  # HTML shell, <head>, nav, footer, OG tags
│   │   ├── AtomLayout.astro                  # Atom detail page layout
│   │   ├── CDGLayout.astro                   # CDG detail page layout
│   │   ├── SolutionLayout.astro              # Solution guide layout
│   │   └── CatalogLayout.astro               # List/index page layout with filters
│   │
│   ├── components/
│   │   ├── seo/
│   │   │   ├── SEOHead.astro                 # Meta tags, JSON-LD structured data
│   │   │   └── Breadcrumbs.astro             # Schema.org breadcrumb + internal links
│   │   ├── nav/
│   │   │   ├── Navbar.astro                  # Top nav with search
│   │   │   ├── Sidebar.astro                 # Section navigation (atoms tree, CDG list)
│   │   │   └── TableOfContents.astro         # On-page anchor nav
│   │   ├── graph/
│   │   │   └── ScionaViewerPlaceholder.astro # Static CDG diagram (SVG/canvas, client:idle)
│   │   ├── content/
│   │   │   ├── StageCard.astro               # Renders a single CDG stage
│   │   │   ├── EdgeList.astro                # Data-flow edge table
│   │   │   ├── IOSpecTable.astro             # Input/output spec table
│   │   │   ├── TypeSignature.astro           # Formatted type signature display
│   │   │   ├── ApplicabilityPanel.astro      # use_when / do_not_use_when display
│   │   │   ├── BindingStatusBadge.astro      # active/gap/approximate pill
│   │   │   └── AtomReverseLinks.astro        # "Used in these CDGs" list
│   │   ├── cta/
│   │   │   ├── PlatformCTA.astro             # "Open in Sciona" button
│   │   │   └── GitHubEditLink.astro          # "Edit this page on GitHub"
│   │   └── catalog/
│   │       ├── FilterBar.astro               # Client-side filter (client:idle)
│   │       ├── CatalogGrid.astro             # Card grid for catalog pages
│   │       └── SearchInput.astro             # Client-side search (client:idle)
│   │
│   └── styles/
│       └── global.css                        # Tailwind / design tokens
│
├── public/
│   ├── favicon.svg
│   └── og/                                   # Generated OG images (build-time)
│
└── ARCHITECTURE_PLAN.md                      # This file
```

### Routing & Internal Linking Strategy

**URL structure:**
| Layer | URL Pattern | Example |
|---|---|---|
| Atom | `/atoms/<domain>/<path>/<predicate_id>` | `/atoms/ml/gradient-attacks/momentum-gradient-accumulation` |
| CDG | `/cdgs/<slug>` | `/cdgs/adversarial-attacks-1st` |
| Solution | `/solutions/<slug>` | `/solutions/adversarial-attacks-nips-2017-1st` |
| Paradigm taxonomy | `/paradigm/<paradigm>` | `/paradigm/optimization` |
| Family taxonomy | `/family/<family>` | `/family/adversarial` |
| Concept taxonomy | `/concept/<concept_type>` | `/concept/neural-network` |

**3-Layer Flywheel Linking:**

```
Solution page
  ├── links DOWN to its CDG         (/cdgs/adversarial-attacks-1st)
  └── links to related solutions    (same family/paradigm)

CDG page
  ├── links DOWN to each bound atom (/atoms/ml/gradient-attacks/...)
  ├── links UP to its solution(s)   (/solutions/adversarial-attacks-...)
  ├── links ACROSS to related CDGs  (same paradigm or family)
  └── links to taxonomy pages       (/paradigm/optimization, /family/adversarial)

Atom page
  ├── links UP to every CDG using it (used_by_cdgs reverse lookup)
  ├── links ACROSS to sibling atoms  (same parent in cdg.json tree)
  └── links to concept taxonomy       (/concept/fixed-point)
```

**SEO link juice flow:**
- Taxonomy pages (`/paradigm/*`, `/family/*`, `/concept/*`) act as **hub pages** that concentrate authority and distribute it to the 3 content layers.
- Every atom page links up to CDGs; every CDG links up to solutions. This creates a **pyramid of internal links** where the most-searched terms (solution names, competition names) sit at the top with maximum inbound links.
- `variant_hints` on CDGs are used to generate additional keyword-rich anchor text in internal links.
- Breadcrumbs on every page provide structured navigation back to catalogs and taxonomy hubs.

**`getStaticPaths()` strategy:**
Each `[...slug].astro` page uses `getCollection()` at build time. Astro SSG pre-renders all pages. No runtime JS needed for routing.

```typescript
// src/pages/atoms/[...slug].astro
export async function getStaticPaths() {
  const atoms = await getCollection("atoms");
  return atoms.map((atom) => ({
    params: { slug: atom.slug },       // nested slug from content dir structure
    props: { atom },
  }));
}
```

---

## 5. Component Skeleton

### Layouts

#### `BaseLayout.astro`
```typescript
// Props
interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  jsonLd?: Record<string, unknown>;   // Schema.org structured data
}
```
Responsibilities: `<!DOCTYPE html>`, `<head>` with SEO, nav, footer, skip-to-content, theme.

#### `AtomLayout.astro`
```typescript
interface Props {
  atom: CollectionEntry<"atoms">;
}
```
Sections rendered:
1. Breadcrumbs (domain > group > atom)
2. Title + informal_desc
3. Type signature block (`<TypeSignature>`)
4. Conceptual summary (from MDX body)
5. Inputs/Outputs table (`<IOSpecTable>`)
6. References
7. "Used in these CDGs" reverse links (`<AtomReverseLinks>`)
8. `<PlatformCTA>` -- "Use this atom in Sciona"
9. `<GitHubEditLink>`

#### `CDGLayout.astro`
```typescript
interface Props {
  cdg: CollectionEntry<"cdgs">;
}
```
Sections rendered:
1. Breadcrumbs (paradigm > family > CDG)
2. Title + dejargonized_summary
3. `<ScionaViewerPlaceholder cdgId={cdg.data.asset_id} />`
4. Applicability panel (`<ApplicabilityPanel>`)
5. Stage cards (for each stage: `<StageCard>` with `<BindingStatusBadge>` + link to bound atom)
6. Edge list (`<EdgeList>`)
7. Planning constraints
8. Audit & references
9. `<PlatformCTA>` -- "Open and modify this CDG in Sciona"
10. `<GitHubEditLink>`

#### `SolutionLayout.astro`
```typescript
interface Props {
  solution: CollectionEntry<"solutions">;
  cdg: CollectionEntry<"cdgs">;          // resolved from cdg_asset_id
}
```
Sections rendered:
1. Breadcrumbs (platform > domain > solution)
2. Title + problem_statement
3. Key insight callout
4. MDX body (the walkthrough guide)
5. Embedded CDG viewer (`<ScionaViewerPlaceholder>`)
6. Failure modes
7. `<PlatformCTA>` -- "Reproduce this solution in Sciona"
8. Related solutions (same family)
9. `<GitHubEditLink>`

#### `CatalogLayout.astro`
```typescript
interface Props {
  title: string;
  description: string;
  items: Array<{ slug: string; title: string; description: string; tags: string[] }>;
  filterOptions: Record<string, string[]>;  // e.g., { paradigm: [...], family: [...] }
}
```

### Components

#### `<ScionaViewerPlaceholder />`
```typescript
// Props
interface Props {
  cdgId: string;       // asset_id
  readOnly?: boolean;  // default true
  height?: string;     // default "400px"
}
```
Renders a static SVG representation of the CDG graph at build time (nodes + edges). Optionally hydrates with `client:idle` for pan/zoom. Falls back to a stage-list if JS is disabled. Links each node to its atom page if bound.

#### `<GitHubEditLink />`
```typescript
interface Props {
  contentPath: string; // relative path within src/content/, e.g., "cdgs/adversarial-attacks-1st.mdx"
}
```
Renders: `<a href="https://github.com/<org>/sciona-kb/edit/main/src/content/${contentPath}">Edit this page on GitHub</a>`

#### `<PlatformCTA />`
```typescript
interface Props {
  cdgId?: string;      // deep-link to CDG in Sciona platform
  atomFqdn?: string;   // deep-link to atom in Sciona platform
  label?: string;      // CTA button text override
  variant?: "primary" | "secondary";
}
```
Renders a styled button/link that opens the Sciona platform with the relevant CDG or atom pre-loaded. Primary variant is a full-width banner CTA; secondary is an inline button.

#### `<StageCard />`
```typescript
interface Props {
  stage: z.infer<typeof StageSchema>;
  binding?: { bound_atom_fqdn: string | null; status: string; confidence: number };
}
```
Renders: stage name, dejargonized description, concept_type badge, binding status badge, and a link to the bound atom page (if active).

#### `<IOSpecTable />`
```typescript
interface Props {
  specs: z.infer<typeof IOSpecSchema>[];
  direction: "input" | "output";
}
```

#### `<TypeSignature />`
```typescript
interface Props {
  signature: string;   // e.g., "(Vector[float], Matrix[float]) -> StateModelSpec{...}"
}
```
Renders the type signature with syntax highlighting (monospace, color-coded types).

#### `<ApplicabilityPanel />`
```typescript
interface Props {
  applicability: z.infer<typeof ApplicabilitySchema>;
}
```
Renders: use_when (green checks), do_not_use_when (red crosses), key_insight (callout box), failure_modes (warning list).

#### `<BindingStatusBadge />`
```typescript
interface Props {
  status: "active" | "gap" | "approximate";
  confidence?: number;
}
```
Renders a colored pill: green (active), yellow (approximate), red (gap).

#### `<AtomReverseLinks />`
```typescript
interface Props {
  cdgAssetIds: string[];  // from used_by_cdgs
}
```
Renders a list of CDG cards that reference this atom, with links to each CDG page.

#### `<Breadcrumbs />`
```typescript
interface Props {
  segments: Array<{ label: string; href: string }>;
}
```
Renders breadcrumb navigation with Schema.org BreadcrumbList JSON-LD.

#### `<SEOHead />`
```typescript
interface Props {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown>;
  keywords?: string[];
}
```

#### `<FilterBar />` (client:idle)
```typescript
interface Props {
  filters: Record<string, string[]>;  // { paradigm: ["optimization", ...], family: [...] }
}
```
Minimal JS: reads URL search params, filters items client-side. Falls back to showing all items with no JS.

---

## 6. Build & Deploy

- **Astro SSG** generates static HTML/CSS/JS at build time.
- **Cloudflare Pages** serves the static output. Zero server cost at scale.
- **Build trigger:** GitHub Actions on push to `main` of `sciona-kb`. Also triggered by a webhook from `sciona-atoms` repo on content changes (re-syncs + rebuilds).
- **Core Web Vitals target:** Zero JS by default. Only `<ScionaViewerPlaceholder>`, `<FilterBar>`, and `<SearchInput>` hydrate via `client:idle` (deferred, non-blocking).
- **OG images:** Generated at build time via `@vercel/og` or `satori` for each page type.

---

## 7. Open Questions for Review

1. **Atom slug depth:** Atoms have deep FQDN paths. Should we flatten to `/atoms/<predicate_id>` (simpler URLs, possible collisions) or keep nested paths (SEO-friendly hierarchy, matches FQDN)?
   - **Recommendation:** Keep nested. The hierarchy IS the taxonomy and aids SEO.

2. **CDG viewer fidelity:** Should the static SVG be a full DAG layout (requires build-time graph layout like dagre/ELK) or a simplified stage-list with arrows?
   - **Recommendation:** Start with stage-list + arrows (simpler, faster). Add full DAG layout in v2.

3. **Solution content depth:** Initial solutions will be auto-generated stubs. How much manual editorial content should we plan for before launch?
   - **Recommendation:** Auto-generate all 125 stubs with structured sections. Manually edit 5-10 flagship solutions for launch. The rest get progressively enriched.

4. **Atom body content:** `matches.json` has `conceptual_summary` but no long-form explanation. Should the MDX body be auto-generated from conceptual_summary + docstring, or left as a stub for manual authoring?
   - **Recommendation:** Auto-generate a structured body (summary, type sig, I/O table). Leave a `## Deep Dive` section as a stub for community contributions via "Edit on GitHub".

5. **Search:** Client-side search (Pagefind / Fuse.js) or Algolia?
   - **Recommendation:** Pagefind (static, zero-cost, Cloudflare-friendly). Index atoms by FQDN + informal_desc + conceptual_summary, CDGs by name + summary + variant_hints.
