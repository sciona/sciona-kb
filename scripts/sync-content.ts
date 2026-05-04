/**
 * sync-content.ts
 *
 * Reads source-of-truth data from sciona-atoms* repos and generates
 * MDX files with YAML frontmatter into src/content/{atoms,cdgs,solutions}/.
 *
 * Usage: tsx scripts/sync-content.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";
import YAML from "yaml";

// ─── Config ───────────────────────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE = process.env.SCIONA_WORKSPACE ?? path.resolve(__dirname, "../..");
const OUT_DIR = path.resolve(__dirname, "../src/content");
const CDG_DIR = path.join(WORKSPACE, "sciona-atoms/data/solution_cdgs");

// ─── Helpers ──────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function writeMdx(dir: string, filename: string, frontmatter: Record<string, unknown>, body: string) {
  fs.mkdirSync(dir, { recursive: true });
  const fm = YAML.stringify(frontmatter, { lineWidth: 0 });
  const content = `---\n${fm}---\n\n${body}\n`;
  fs.writeFileSync(path.join(dir, filename), content, "utf-8");
}

function readJson(filepath: string): unknown {
  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
}

// Escape content that could be interpreted as JSX in MDX.
// MDX treats { } and < > as JSX. We must escape them in prose while
// preserving {/* comments */} and code fences.
function escapeMdx(s: string): string {
  const lines = s.split("\n");
  let inCodeBlock = false;
  const escaped = lines.map((line) => {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      return line;
    }
    if (inCodeBlock) return line;

    // Preserve {/* ... */} MDX comments (our own generated comments)
    const trimmed = line.trim();
    if (trimmed.startsWith("{/*") && trimmed.endsWith("*/}")) return line;

    // Escape all bare < except in our allowed MDX component tags
    let out = line.replace(/<(?!\/?(?:ScionaViewerPlaceholder|PlatformCTA|Fragment)\b)/g, "&lt;");
    // Escape { } outside backtick spans
    out = escapeOutsideBackticks(out);
    return out;
  });
  return escaped.join("\n");
}

function escapeOutsideBackticks(line: string): string {
  // Split by backtick spans, escape only outside them
  const parts = line.split("`");
  return parts.map((part, i) => {
    if (i % 2 === 1) return part; // Inside backticks
    return part.replace(/\{/g, "&#123;").replace(/\}/g, "&#125;");
  }).join("`");
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "\u2026";
}

// Normalize concept_type from UPPER_CASE source to lower_case for Zod enum
function normalizeConcept(raw: string): string {
  return raw.toLowerCase();
}

// ─── Discover Atom Repos ──────────────────────────────────────────

function discoverAtomRepos(): string[] {
  const repos: string[] = [];
  // core repo
  const core = path.join(WORKSPACE, "sciona-atoms");
  if (fs.existsSync(core)) repos.push(core);
  // satellite repos
  const satellites = globSync(path.join(WORKSPACE, "sciona-atoms-*/"));
  repos.push(...satellites);
  return repos;
}

// ─── Build reverse lookup: atom FQDN -> CDG asset_ids ─────────────

interface BindingFile {
  solution_id: string;
  bindings: Array<{
    stage_id: string;
    bound_artifact_fqdn: string | null;
    binding_confidence: number;
    binding_source?: string;
    status: string;
    action_class: string;
    evidence_summary?: Record<string, string>;
  }>;
  binding_summary?: Record<string, unknown>;
  solution_metadata?: Record<string, unknown>;
}

function buildAtomToCdgMap(): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const bindingFiles = globSync(path.join(CDG_DIR, "*_bindings.json"));
  for (const bf of bindingFiles) {
    const data = readJson(bf) as BindingFile;
    const assetId = data.solution_id;
    for (const b of data.bindings) {
      if (b.bound_artifact_fqdn && b.status === "active") {
        const existing = map.get(b.bound_artifact_fqdn) ?? [];
        if (!existing.includes(assetId)) existing.push(assetId);
        map.set(b.bound_artifact_fqdn, existing);
      }
    }
  }
  return map;
}

// ─── Sync Atoms ───────────────────────────────────────────────────

interface MatchEntry {
  pdg_node: {
    predicate_id: string;
    statement: string;
    informal_desc: string;
  };
  verified_match: {
    candidate: {
      declaration: {
        name: string;
        type_signature: string;
        docstring: string;
        conceptual_summary: string;
      };
    };
    verified: boolean;
    verification_level: string;
  };
}

interface CdgNode {
  node_id: string;
  parent_id: string | null;
  name: string;
  description: string;
  concept_type: string;
  inputs: Array<Record<string, unknown>>;
  outputs: Array<Record<string, unknown>>;
  status: string;
  matched_primitive: string | null;
}

interface AtomCdg {
  nodes: CdgNode[];
  edges: unknown[];
  metadata: Record<string, unknown>;
}

interface ReferenceEntry {
  title: string;
  citation: string;
  url?: string;
  note?: string;
}

function fqdnFromPath(repoPath: string, matchesPath: string): { fqdn: string; domain: string; repo: string } {
  // Extract repo name
  const repo = path.basename(repoPath);

  // Extract the path after src/sciona/atoms/
  const atomsRoot = path.join(repoPath, "src/sciona/atoms");
  const relDir = path.dirname(matchesPath).replace(atomsRoot + "/", "");

  // Build FQDN segments
  const segments = relDir.split("/").filter(Boolean);
  const domain = segments[0] ?? "core";
  const fqdn = `sciona.atoms.${segments.join(".")}`;

  return { fqdn, domain, repo };
}

function extractRefs(refsPath: string): ReferenceEntry[] {
  if (!fs.existsSync(refsPath)) return [];
  try {
    const raw = readJson(refsPath) as Record<string, unknown>;
    // references.json uses schema_version 1.1 with nested atoms.{fqdn}.references[].ref_id
    // Extract unique ref_ids and convert to our ReferenceSchema
    const atoms = raw.atoms as Record<string, { references: Array<{ ref_id: string; match_metadata?: { notes?: string } }> }> | undefined;
    if (!atoms) return [];
    const seen = new Set<string>();
    const refs: ReferenceEntry[] = [];
    for (const atomData of Object.values(atoms)) {
      for (const r of atomData.references ?? []) {
        if (!seen.has(r.ref_id)) {
          seen.add(r.ref_id);
          refs.push({
            title: r.ref_id,
            citation: r.match_metadata?.notes ?? r.ref_id,
          });
        }
      }
    }
    return refs;
  } catch {
    return [];
  }
}

function syncAtoms(atomToCdg: Map<string, string[]>) {
  const repos = discoverAtomRepos();
  let count = 0;

  for (const repoPath of repos) {
    const matchFiles = globSync(path.join(repoPath, "src/sciona/atoms/**/matches.json"));

    for (const matchFile of matchFiles) {
      const dir = path.dirname(matchFile);
      const matches = readJson(matchFile) as MatchEntry[];
      if (!matches.length) continue;

      // Read sibling files
      const cdgPath = path.join(dir, "cdg.json");
      const refsPath = path.join(dir, "references.json");
      const atomCdg: AtomCdg | null = fs.existsSync(cdgPath) ? (readJson(cdgPath) as AtomCdg) : null;
      const refs: ReferenceEntry[] = extractRefs(refsPath);

      const { fqdn: groupFqdn, domain, repo } = fqdnFromPath(repoPath, matchFile);

      for (const match of matches) {
        const predicateId = match.pdg_node.predicate_id;
        const atomFqdn = `${groupFqdn}.${predicateId}`;
        const decl = match.verified_match.candidate.declaration;

        // Find matching node in CDG for inputs/outputs/concept_type
        const cdgNode = atomCdg?.nodes.find(
          (n) => n.node_id === predicateId || n.matched_primitive === predicateId
        );

        const conceptType = normalizeConcept(cdgNode?.concept_type ?? "custom");
        const inputs = cdgNode?.inputs ?? [];
        const outputs = cdgNode?.outputs ?? [];

        const usedByCdgs = atomToCdg.get(atomFqdn) ?? [];

        // Human-readable title from predicate_id
        const title = predicateId
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
          .replace(/^./, (c) => c.toUpperCase());

        const frontmatter = {
          fqdn: atomFqdn,
          predicate_id: predicateId,
          repo,
          domain,
          type_signature: decl.type_signature,
          informal_desc: decl.docstring || match.pdg_node.informal_desc,
          conceptual_summary: decl.conceptual_summary,
          inputs,
          outputs,
          concept_type: conceptType,
          verification_level: match.verified_match.verification_level || "type_checked",
          used_by_cdgs: usedByCdgs,
          references: refs,
          title,
          description: truncate(decl.docstring || match.pdg_node.informal_desc, 160),
        };

        // Build slug path mirroring FQDN
        const slugSegments = atomFqdn
          .replace("sciona.atoms.", "")
          .split(".")
          .map(slugify);
        const outDir = path.join(OUT_DIR, "atoms", ...slugSegments.slice(0, -1));
        const filename = `${slugSegments.at(-1)}.mdx`;

        const body = escapeMdx(generateAtomBody(frontmatter));
        writeMdx(outDir, filename, frontmatter, body);
        count++;
      }
    }
  }

  console.log(`  atoms: ${count} files written`);
}

function generateAtomBody(fm: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push(`# ${fm.title}`);
  lines.push("");
  lines.push(`> ${fm.informal_desc}`);
  lines.push("");
  lines.push(`## Conceptual Summary`);
  lines.push("");
  lines.push(fm.conceptual_summary as string);
  lines.push("");
  lines.push(`## Type Signature`);
  lines.push("");
  lines.push("```");
  lines.push(fm.type_signature as string);
  lines.push("```");
  lines.push("");
  lines.push(`## Deep Dive`);
  lines.push("");
  lines.push("{/* Community contributions welcome -- click \"Edit this page on GitHub\" above. */}");
  return lines.join("\n");
}

// ─── Sync CDGs ────────────────────────────────────────────────────

interface SolutionCdg {
  asset_id: string;
  asset_version: string;
  family: string;
  paradigm: string;
  name: string;
  summary: string;
  dejargonized_summary: string;
  canonical_for_paradigm: boolean;
  variant_hints: string[];
  inputs: unknown[];
  outputs: unknown[];
  applicability: Record<string, unknown>;
  planning_constraints: unknown[];
  stages: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
  audit: Record<string, unknown>;
}

function syncCdgs() {
  const cdgFiles = globSync(path.join(CDG_DIR, "*.json"))
    .filter((f) => !f.endsWith("_bindings.json"));

  let count = 0;

  for (const cdgFile of cdgFiles) {
    const cdg = readJson(cdgFile) as SolutionCdg;
    const baseName = path.basename(cdgFile, ".json");

    // Load bindings
    const bindingsPath = path.join(CDG_DIR, `${baseName}_bindings.json`);
    const bindingsData = fs.existsSync(bindingsPath)
      ? (readJson(bindingsPath) as BindingFile)
      : null;

    // Normalize concept_types in stages
    const stages = cdg.stages.map((s) => ({
      ...s,
      concept_type: normalizeConcept(s.concept_type as string),
    }));

    // Normalize edge_kind and loss_class
    const edges = cdg.edges.map((e) => ({
      ...e,
      edge_kind: (e.edge_kind as string || "data_flow").toLowerCase(),
      loss_class: (e.loss_class as string || "preserving").toLowerCase(),
    }));

    // Build bindings array
    const bindings = (bindingsData?.bindings ?? []).map((b) => ({
      stage_id: b.stage_id,
      bound_atom_fqdn: b.bound_artifact_fqdn ?? null,
      binding_confidence: b.binding_confidence,
      status: b.status as "active" | "gap" | "approximate",
      action_class: b.action_class,
    }));

    const summary = bindingsData?.binding_summary as Record<string, unknown> | undefined;
    const bindingSummary = summary
      ? {
          total_stages: (summary.total_stages as number) ?? stages.length,
          bound_active: (summary.bound_active as number) ?? 0,
          gaps: (summary.gaps as number) ?? stages.length,
        }
      : undefined;

    const rawMeta = bindingsData?.solution_metadata as Record<string, unknown> | undefined;
    const solutionMetadata = rawMeta
      ? {
          competition: String(rawMeta.competition ?? cdg.name),
          placement: String(rawMeta.placement ?? ""),
          team: String(rawMeta.team ?? ""),
          year: typeof rawMeta.year === "number" ? rawMeta.year : 0,
          metric: String(rawMeta.metric ?? ""),
          problem_domain: String(rawMeta.problem_domain ?? cdg.family),
          source_url: String(rawMeta.source_url ?? ""),
          source_license: typeof rawMeta.source_license === "string" ? rawMeta.source_license : null,
        }
      : undefined;

    // Normalize applicability swappable_stages to Record<string, string>
    const applicability = { ...cdg.applicability };
    if (applicability.scaling_notes === undefined) applicability.scaling_notes = "";

    const frontmatter: Record<string, unknown> = {
      asset_id: cdg.asset_id,
      asset_version: cdg.asset_version,
      family: cdg.family,
      paradigm: cdg.paradigm,
      name: cdg.name,
      summary: cdg.summary,
      dejargonized_summary: cdg.dejargonized_summary,
      canonical_for_paradigm: cdg.canonical_for_paradigm ?? false,
      variant_hints: cdg.variant_hints ?? [],
      inputs: cdg.inputs,
      outputs: cdg.outputs,
      stages,
      edges,
      applicability,
      planning_constraints: cdg.planning_constraints ?? [],
      audit: cdg.audit,
      bindings,
      binding_summary: bindingSummary,
      solution_metadata: solutionMetadata,
      title: cdg.name,
      description: truncate(cdg.dejargonized_summary || cdg.summary, 160),
    };

    const slug = slugify(baseName);
    const body = escapeMdx(generateCdgBody(cdg, bindings));
    writeMdx(path.join(OUT_DIR, "cdgs"), `${slug}.mdx`, frontmatter, body);
    count++;
  }

  console.log(`  cdgs: ${count} files written`);
}

function generateCdgBody(
  cdg: SolutionCdg,
  bindings: Array<{ stage_id: string; bound_atom_fqdn: string | null; status: string }>
): string {
  const lines: string[] = [];
  lines.push(`# ${cdg.name}`);
  lines.push("");
  lines.push(`> ${cdg.dejargonized_summary || cdg.summary}`);
  lines.push("");
  lines.push(`{/* <ScionaViewerPlaceholder cdgId="${cdg.asset_id}" readOnly={true} /> */}`);
  lines.push("");
  lines.push(`## When to Use This`);
  lines.push("");
  const app = cdg.applicability as Record<string, unknown>;
  if (Array.isArray(app.use_when)) {
    for (const cond of app.use_when) {
      lines.push(`- ${cond}`);
    }
  }
  lines.push("");
  lines.push(`## Key Insight`);
  lines.push("");
  lines.push(String(app.key_insight ?? ""));
  lines.push("");
  lines.push(`## Pipeline Stages`);
  lines.push("");
  for (const stage of cdg.stages) {
    const s = stage as Record<string, unknown>;
    const binding = bindings.find((b) => b.stage_id === s.stage_id);
    const badge = binding?.status === "active" ? " :white_check_mark:" : binding?.status === "approximate" ? " :warning:" : " :red_circle:";
    lines.push(`### ${s.name}${badge}`);
    lines.push("");
    lines.push(String(s.dejargonized_description || s.description));
    if (binding?.bound_atom_fqdn) {
      lines.push("");
      lines.push(`**Bound atom:** \`${binding.bound_atom_fqdn}\``);
    }
    lines.push("");
  }
  lines.push(`## Deep Dive`);
  lines.push("");
  lines.push("{/* Community contributions welcome -- click \"Edit this page on GitHub\" above. */}");
  return lines.join("\n");
}

// ─── Sync Solutions ───────────────────────────────────────────────

function syncSolutions() {
  const cdgFiles = globSync(path.join(CDG_DIR, "*.json"))
    .filter((f) => !f.endsWith("_bindings.json"));

  let count = 0;

  for (const cdgFile of cdgFiles) {
    const cdg = readJson(cdgFile) as SolutionCdg;
    const baseName = path.basename(cdgFile, ".json");

    const bindingsPath = path.join(CDG_DIR, `${baseName}_bindings.json`);
    const bindingsData = fs.existsSync(bindingsPath)
      ? (readJson(bindingsPath) as BindingFile)
      : null;

    const meta = bindingsData?.solution_metadata as Record<string, unknown> | undefined;
    const app = cdg.applicability as Record<string, unknown>;

    // Infer platform from asset_id
    let platform = "kaggle";
    if (cdg.asset_id.includes("drivendata")) platform = "drivendata";
    else if (cdg.asset_id.includes("neurips")) platform = "neurips";
    else if (cdg.asset_id.includes("kdd")) platform = "kdd";
    else if (cdg.asset_id.includes("leetcode")) platform = "leetcode";

    const frontmatter: Record<string, unknown> = {
      cdg_asset_id: cdg.asset_id,
      title: cdg.name,
      description: truncate(cdg.dejargonized_summary || cdg.summary, 160),
      problem_statement: cdg.summary,
      platform,
      competition_name: String(meta?.competition ?? cdg.name),
      placement: String(meta?.placement ?? ""),
      year: typeof meta?.year === "number" ? meta.year : 0,
      domain: String(meta?.problem_domain ?? cdg.family),
      paradigm: cdg.paradigm,
      family: cdg.family,
      tags: cdg.variant_hints ?? [],
      key_insight: String(app.key_insight ?? ""),
      failure_modes: (app.failure_modes as string[]) ?? [],
      source_url: String(meta?.source_url ?? ""),
      source_license: (meta?.source_license as string) ?? null,
    };

    const slug = slugify(baseName);
    const body = escapeMdx(generateSolutionBody(cdg, meta));
    writeMdx(path.join(OUT_DIR, "solutions"), `${slug}.mdx`, frontmatter, body);
    count++;
  }

  console.log(`  solutions: ${count} files written`);
}

function generateSolutionBody(cdg: SolutionCdg, meta?: Record<string, unknown>): string {
  const app = cdg.applicability as Record<string, unknown>;
  const lines: string[] = [];
  lines.push(`# ${cdg.name}`);
  lines.push("");
  lines.push(`## Problem`);
  lines.push("");
  lines.push(cdg.summary);
  lines.push("");
  lines.push(`## Approach`);
  lines.push("");
  lines.push(cdg.dejargonized_summary || cdg.summary);
  lines.push("");
  lines.push(`## CDG Walkthrough`);
  lines.push("");
  lines.push(`{/* <ScionaViewerPlaceholder cdgId="${cdg.asset_id}" readOnly={true} /> */}`);
  lines.push("");
  for (const stage of cdg.stages) {
    const s = stage as Record<string, unknown>;
    lines.push(`1. **${s.name}** -- ${s.dejargonized_description || s.description}`);
  }
  lines.push("");
  lines.push(`## Key Insight`);
  lines.push("");
  lines.push(String(app.key_insight ?? ""));
  lines.push("");
  if (Array.isArray(app.failure_modes) && app.failure_modes.length) {
    lines.push(`## Failure Modes`);
    lines.push("");
    for (const fm of app.failure_modes) {
      lines.push(`- ${fm}`);
    }
    lines.push("");
  }
  lines.push(`## Try It`);
  lines.push("");
  lines.push(`{/* <PlatformCTA cdgId="${cdg.asset_id}" label="Reproduce this solution in Sciona" /> */}`);
  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────

function main() {
  console.log(`Syncing content from ${WORKSPACE}...`);

  // Clean output dirs
  for (const sub of ["atoms", "cdgs", "solutions"]) {
    const dir = path.join(OUT_DIR, sub);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  }

  const atomToCdg = buildAtomToCdgMap();
  syncAtoms(atomToCdg);
  syncCdgs();
  syncSolutions();

  console.log("Done.");
}

main();
