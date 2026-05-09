# Sciona Algorithm Atlas -- Architecture Notes

## What this is

A static-site pSEO engine that renders Sciona's 142 CDGs, 459 atoms, and 142 solution guides as an interconnected educational encyclopedia. Built with Astro SSG, Tailwind v4, MDX, and React islands. Deploys to Cloudflare Pages.

## Data pipeline

Source-of-truth data lives outside this repo in the `sciona-atoms*` family of repos.

```
sciona-atoms/data/solution_cdgs/*.json        CDG definitions (stages, edges, applicability)
sciona-atoms/data/solution_cdgs/*_bindings.json  Atom bindings per CDG (fqdn, confidence, status)
sciona-atoms*/src/sciona/atoms/**/matches.json   Atom metadata (type sig, conceptual summary)
sciona-atoms*/src/sciona/atoms/**/cdg.json       Atom-level node graphs
sciona-atoms*/src/sciona/atoms/**/atoms.py       Python implementations
sciona-atoms*/src/sciona/atoms/**/references.json Academic citations
```

`scripts/sync-content.ts` (run via `npm run sync` or automatically as `prebuild`) reads all of the above and generates MDX files into `src/content/{atoms,cdgs,solutions}/`. The generated MDX files are not committed -- they're rebuilt from source data each time.

### What the sync script does

1. **Discovers atom repos** -- globs `sciona-atoms*/` in the workspace.
2. **Builds reverse lookups** -- atom FQDN to CDG asset_ids, atom FQDN to code/metadata.
3. **Extracts Python source** -- for each actively-bound atom, finds the decorated function in `atoms.py` and extracts it (119/134 atoms have code). Also pulls `conceptual_summary` and `type_signature` from `matches.json`.
4. **Builds swap candidate map** -- for each `concept_type`, collects all distinct bound atoms across all CDGs. 16 concept types have 2+ alternatives.
5. **Syntax highlights** -- runs all extracted Python through shiki (`github-dark-default` theme) and stores the HTML alongside the raw code.
6. **Generates MDX** -- writes atoms, CDGs, and solutions as `.mdx` files with YAML frontmatter. Body content is auto-generated with MDX-safe escaping (HTML entities for `<`, `{`, `}`).

### Known gaps in sync

- **15 bound atoms have no extractable code** -- their FQDN doesn't resolve to a filesystem path (likely renamed or restructured atoms).
- **Wave 2 atoms lack `matches.json`** -- atoms in satellite repos (sciona-atoms-ml, sciona-atoms-dl, etc.) that were created via Codex often have `cdg.json` and `atoms.py` but no `matches.json`. The sync script only generates atom pages from `matches.json`, so these atoms don't get their own pages. CDG pages still reference them via bindings, and concept pages synthesize entries from binding data.
- **`concept_type` mismatch** -- atom-level `cdg.json` files use 300+ granular concept types from sklearn decomposition. CDG stages use ~27 canonical types. The schema uses `z.string()` (not an enum) to accommodate both.

## Content collections (src/content.config.ts)

Three Astro content collections using the glob loader:

- **atoms** -- keyed by nested slug mirroring FQDN. Fields: `fqdn`, `predicate_id`, `type_signature`, `informal_desc`, `conceptual_summary`, `inputs/outputs` (IOSpec), `concept_type`, `used_by_cdgs[]`, `references[]`.
- **cdgs** -- keyed by slugified asset_id tail. Fields: full CDG schema (`stages[]`, `edges[]`, `applicability`, `audit`, `planning_constraints[]`) plus merged binding data (`bindings[]` with `atom_code`, `atom_code_html`, `atom_summary`, `atom_type_sig`, `atom_github_path`, `swap_rationale`, `swap_candidates[]`) and `solution_metadata`.
- **solutions** -- keyed by slugified name. Fields: `cdg_asset_id`, `platform`, `competition_name`, `placement`, `year`, `key_insight`, `failure_modes[]`, `tags[]`.

## Routing

| URL pattern | Source | Count |
|---|---|---|
| `/` | `pages/index.astro` | 1 |
| `/atoms/` | Catalog index | 1 |
| `/atoms/[...slug]` | Per-atom detail | 459 |
| `/cdgs/` | Catalog index | 1 |
| `/cdgs/[...slug]` | Per-CDG detail | 142 |
| `/solutions/` | Catalog index | 1 |
| `/solutions/[...slug]` | Per-solution guide | 142 |
| `/paradigm/[paradigm]` | CDGs by paradigm | ~8 |
| `/family/[family]` | CDGs by problem family | ~60 |
| `/concept/[concept_type]` | Educational page + atom catalog | ~50 |
| `/viewer-test` | ScionaViewer integration test | 1 |

Concept pages are generated from the union of atom concept types and CDG stage concept types. For types with no direct atom matches, entries are synthesized from CDG binding data.

## Interactive viewer (React island)

`src/components/viewer/` contains a React Flow-based CDG visualizer hydrated via `client:visible`:

- **ScionaViewer.tsx** -- main container. Receives `CdgData` as props, transforms to React Flow nodes/edges, applies dagre auto-layout, renders canvas with controls, minimap, and legend. Manages panel state (detail vs. swap).
- **AtomNode.tsx** -- custom React Flow node styled as an IDE card. Shows concept type (color-coded header), name, dejargonized description, binding status dot (green/yellow/red), swappable icon (clickable), port counts, bound atom FQDN.
- **DetailPanel.tsx** -- right-side slide-out on node click. Shows type signature, conceptual summary, syntax-highlighted Python source (pre-rendered HTML via shiki), I/O specs, pre/postconditions, "View on GitHub" link. Concept type badge links to `/concept/[type]` educational page.
- **SwapPanel.tsx** -- right-side slide-out on swap icon click. Shows swap rationale from CDG applicability, current atom, and candidate alternatives (other atoms of the same concept_type bound in other CDGs).
- **transform.ts** -- `transformCdgToFlowData()` maps CDG schema to React Flow nodes/edges. `getLayoutedElements()` runs dagre for hierarchical layout (TB or LR). Concept type color mapping, edge styling by loss_class.
- **types.ts** -- TypeScript interfaces matching CDG frontmatter.

### Viewer data flow

```
CDG frontmatter (YAML) → Astro reads at build → passes as props to ScionaViewer
  → transformCdgToFlowData() maps stages/edges/bindings to React Flow format
  → getLayoutedElements() runs dagre for x/y positions
  → ReactFlow renders with custom AtomNode components
  → onClick dispatches to DetailPanel or SwapPanel based on click target
```

## Educational concept pages

`src/data/concept-descriptions.ts` has handwritten descriptions for 27 concept types targeting a high-school reading level. Each entry has: `title`, `emoji`, `oneLiner`, `explanation`, `realWorldAnalogy`, `whyItMatters`, `exampleUses[]`. Unknown types get a generic fallback.

## Conversion loop

Every page type includes platform CTAs:
- Atom pages: "Use this atom in Sciona" → `app.sciona.dev/atom/{fqdn}`
- CDG pages: "Open and modify this CDG in Sciona" → `app.sciona.dev/cdg/{asset_id}`
- Solution pages: "Reproduce this solution in Sciona" + "View CDG Breakdown"
- Viewer canvas: persistent "Open & Modify in Sciona" button (bottom-right overlay)
- All content pages: "Edit this page on GitHub" link mapping to source MDX

## Potential next steps

### Content quality

- **Enrich solution guides** -- the 142 solution MDX files are auto-generated stubs. 5-10 flagship solutions (adversarial attacks, trackml, amex default) should get manually-written walkthroughs with diagrams and key decision explanations.
- **Generate matches.json for Wave 2 atoms** -- running the matcher on satellite repo atoms would give them proper pages with type signatures and conceptual summaries instead of synthesized stubs.
- **Atom code for gap stages** -- stages with `status: "gap"` could show a stub/pseudocode template with the expected I/O contract, inviting contributions.

### Viewer

- **Embed viewer in CDG pages** -- replace the current `ScionaViewerPlaceholder.astro` (static placeholder) with the real `ScionaViewer` React component on each CDG detail page. Requires passing the CDG frontmatter as props to the island.
- **Edge routing per-port** -- currently uses single default handles. Adding per-port handles (one per input/output) would let edges connect to specific ports, making the data flow more precise for CDGs with many cross-connections.
- **Viewer for atom-level CDGs** -- atoms with `cdg.json` have their own sub-graphs (parent → children decomposition). A mini-viewer on atom pages would show this hierarchy.
- **Keyboard navigation** -- arrow keys to move between nodes, Enter to open detail panel, Escape to close.

### SEO and performance

- **Pagefind integration** -- static client-side search indexing atoms by FQDN + conceptual_summary, CDGs by name + variant_hints, solutions by competition name + tags.
- **OG image generation** -- build-time OG images via satori for each page type (CDG graph thumbnail, atom type signature, solution competition banner).
- **Sitemap + robots.txt** -- Astro sitemap integration for search engine discovery.
- **JSON-LD structured data** -- Article schema on concept pages, SoftwareSourceCode on atom pages, HowTo on solution guides.

### Infrastructure

- **CI/CD pipeline** -- GitHub Actions: on push to sciona-kb run `npm run build`; on push to sciona-atoms trigger a webhook that re-syncs and rebuilds.
- **Cloudflare Pages deployment** -- connect the repo, set build command to `npm run build`, output dir to `dist/`.
- **Preview deploys** -- Cloudflare Pages automatically creates preview URLs for PRs.
- **Content validation** -- a CI check that runs `npm run sync` and verifies the Astro build succeeds, catching schema drift between source repos and the site.
