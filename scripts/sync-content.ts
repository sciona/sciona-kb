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
import { createHighlighter, type Highlighter } from "shiki";

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
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf-8"));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read/parse JSON: ${filepath}\n  ${message}`);
  }
}

// ─── Sync Report ─────────────────────────────────────────────────

interface SyncReport {
  timestamp: string;
  workspace: string;
  repos_found: string[];
  atoms: { total: number; written: number };
  cdgs: { total: number; written: number };
  solutions: { total: number; written: number };
  atom_code: { extracted: number; total_bound: number };
  swap_candidates: { types_with_alternatives: number };
  warnings: string[];
  errors: string[];
}

const syncReport: SyncReport = {
  timestamp: new Date().toISOString(),
  workspace: WORKSPACE,
  repos_found: [],
  atoms: { total: 0, written: 0 },
  cdgs: { total: 0, written: 0 },
  solutions: { total: 0, written: 0 },
  atom_code: { extracted: 0, total_bound: 0 },
  swap_candidates: { types_with_alternatives: 0 },
  warnings: [],
  errors: [],
};

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
  if (fs.existsSync(core)) {
    repos.push(core);
  } else {
    syncReport.errors.push(`Core atom repo not found: ${core}`);
    console.error(`ERROR: Core atom repo not found at ${core}`);
    console.error(`  Set SCIONA_WORKSPACE or ensure sciona-atoms/ is a sibling directory.`);
  }
  // satellite repos
  const satellites = globSync(path.join(WORKSPACE, "sciona-atoms-*/"));
  repos.push(...satellites);
  syncReport.repos_found = repos.map((r) => path.basename(r));
  if (repos.length === 0) {
    throw new Error(
      `No atom repos found in workspace: ${WORKSPACE}\n` +
      `  Ensure sciona-atoms* repos exist as siblings, or set SCIONA_WORKSPACE.`
    );
  }
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
    try {
      const data = readJson(bf) as BindingFile;
      const assetId = data.solution_id;
      if (!assetId) {
        syncReport.warnings.push(`Binding file missing solution_id: ${path.basename(bf)}`);
        continue;
      }
      for (const b of data.bindings) {
        if (b.bound_artifact_fqdn && b.status === "active") {
          const existing = map.get(b.bound_artifact_fqdn) ?? [];
          if (!existing.includes(assetId)) existing.push(assetId);
          map.set(b.bound_artifact_fqdn, existing);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      syncReport.errors.push(`Failed to parse binding file ${path.basename(bf)}: ${message}`);
      console.error(`ERROR: ${message}`);
    }
  }
  return map;
}

// ─── Extract Python source for a bound atom FQDN ─────────────────

/**
 * Given "sciona.atoms.ml.gradient_attacks.momentum_gradient_accumulation",
 * find the atoms.py in the matching repo/directory and extract the full
 * decorated function definition.
 */
function extractAtomCode(fqdn: string): { code: string; githubPath: string } | null {
  // Parse FQDN: sciona.atoms.<segments...>.<function_name>
  const parts = fqdn.replace("sciona.atoms.", "").split(".");
  if (parts.length < 2) return null;
  const funcName = parts.pop()!;
  const dirPath = parts.join("/");

  const repos = discoverAtomRepos();
  for (const repo of repos) {
    const atomsFile = path.join(repo, "src/sciona/atoms", dirPath, "atoms.py");
    if (!fs.existsSync(atomsFile)) continue;

    const source = fs.readFileSync(atomsFile, "utf-8");
    const code = extractFunction(source, funcName);
    if (code) {
      const repoName = path.basename(repo);
      const relPath = `src/sciona/atoms/${dirPath}/atoms.py`;
      return { code, githubPath: `${repoName}/${relPath}` };
    }
  }
  return null;
}

/**
 * Extract a decorated Python function from source text.
 * Grabs from the first decorator (@) before `def funcName` through
 * the end of the function body (next unindented line or EOF).
 */
function extractFunction(source: string, funcName: string): string | null {
  const lines = source.split("\n");

  // Find `def funcName(`
  let defLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^def\\s+${funcName}\\s*\\(`))) {
      defLine = i;
      break;
    }
  }
  if (defLine === -1) return null;

  // Walk backwards to find first decorator
  let startLine = defLine;
  for (let i = defLine - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith("@") || trimmed.startsWith(")") || trimmed === "" || trimmed.startsWith("lambda") || trimmed.startsWith('"') || trimmed.startsWith("'")) {
      startLine = i;
      // keep going if it's a continuation
      if (trimmed.startsWith("@")) {
        startLine = i;
        // but check if previous line is also part of decorator
        continue;
      }
    } else {
      break;
    }
  }
  // Make sure we start at a decorator
  while (startLine < defLine && !lines[startLine].trim().startsWith("@")) {
    startLine++;
  }

  // Find end of function: next line at indent level 0 that isn't blank
  let endLine = lines.length;
  for (let i = defLine + 1; i < lines.length; i++) {
    const line = lines[i];
    // Non-empty line at indent 0 = new top-level definition
    if (line.length > 0 && !line.startsWith(" ") && !line.startsWith("\t") && line.trim() !== "") {
      endLine = i;
      break;
    }
  }

  // Trim trailing blank lines
  while (endLine > startLine && lines[endLine - 1].trim() === "") {
    endLine--;
  }

  return lines.slice(startLine, endLine).join("\n");
}

interface AtomCodeEntry {
  code: string;
  codeHtml: string;
  githubPath: string;
  summary: string;
  typeSig: string;
}

/** Build a map from atom FQDN -> { code, codeHtml, githubPath, summary, typeSig } */
function buildAtomCodeMap(): Map<string, AtomCodeEntry> {
  const map = new Map<string, AtomCodeEntry>();

  // Collect all bound FQDNs first
  const allFqdns = new Set<string>();
  const bindingFiles = globSync(path.join(CDG_DIR, "*_bindings.json"));
  for (const bf of bindingFiles) {
    const data = readJson(bf) as BindingFile;
    for (const b of data.bindings) {
      if (b.bound_artifact_fqdn && b.status === "active") {
        allFqdns.add(b.bound_artifact_fqdn);
      }
    }
  }

  // Extract code + metadata for each
  const repos = discoverAtomRepos();
  for (const fqdn of allFqdns) {
    const codeResult = extractAtomCode(fqdn);

    // Also get conceptual_summary and type_signature from matches.json
    const parts = fqdn.replace("sciona.atoms.", "").split(".");
    const funcName = parts.pop()!;
    const dirPath = parts.join("/");
    let summary = "";
    let typeSig = "";

    for (const repo of repos) {
      const matchesFile = path.join(repo, "src/sciona/atoms", dirPath, "matches.json");
      if (!fs.existsSync(matchesFile)) continue;
      const matches = readJson(matchesFile) as MatchEntry[];
      const match = matches.find((m) => m.pdg_node.predicate_id === funcName);
      if (match) {
        summary = match.verified_match.candidate.declaration.conceptual_summary;
        typeSig = match.pdg_node.statement;
        break;
      }
    }

    if (codeResult) {
      map.set(fqdn, { ...codeResult, codeHtml: "", summary, typeSig });
    }
  }

  // Report atoms with no extractable code
  const missingCode = [...allFqdns].filter((fqdn) => !map.has(fqdn));
  if (missingCode.length > 0) {
    for (const fqdn of missingCode) {
      syncReport.warnings.push(`No extractable code for bound atom: ${fqdn}`);
    }
  }
  syncReport.atom_code = { extracted: map.size, total_bound: allFqdns.size };
  console.log(`  atom code: extracted ${map.size}/${allFqdns.size} bound atom sources`);
  if (missingCode.length > 0) {
    console.warn(`  WARNING: ${missingCode.length} bound atoms have no extractable code`);
  }
  return map;
}

// ─── Build concept_type → candidate atoms map ────────────────────

interface SwapCandidate {
  fqdn: string;
  stage_name: string;
  cdg_name: string;
  cdg_asset_id: string;
}

function buildSwapCandidatesMap(): Map<string, SwapCandidate[]> {
  const map = new Map<string, SwapCandidate[]>();

  const cdgFiles = globSync(path.join(CDG_DIR, "*.json"))
    .filter((f) => !f.endsWith("_bindings.json"));

  for (const cdgFile of cdgFiles) {
    const cdg = readJson(cdgFile) as SolutionCdg;
    const baseName = path.basename(cdgFile, ".json");
    const bindingsPath = path.join(CDG_DIR, `${baseName}_bindings.json`);
    if (!fs.existsSync(bindingsPath)) continue;
    const bindingsData = readJson(bindingsPath) as BindingFile;
    const bindingsByStage = new Map(bindingsData.bindings.map((b) => [b.stage_id, b]));

    for (const stage of cdg.stages) {
      const ct = normalizeConcept(stage.concept_type as string);
      const binding = bindingsByStage.get(stage.stage_id as string);
      if (!binding?.bound_artifact_fqdn || binding.status !== "active") continue;

      const existing = map.get(ct) ?? [];
      // Deduplicate by fqdn
      if (!existing.some((c) => c.fqdn === binding.bound_artifact_fqdn)) {
        existing.push({
          fqdn: binding.bound_artifact_fqdn,
          stage_name: stage.name as string,
          cdg_name: cdg.name,
          cdg_asset_id: cdg.asset_id,
        });
        map.set(ct, existing);
      }
    }
  }

  const multiCount = [...map.values()].filter((v) => v.length >= 2).length;
  syncReport.swap_candidates.types_with_alternatives = multiCount;
  console.log(`  swap candidates: ${multiCount} concept_types with 2+ atoms`);
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
      let matches: MatchEntry[];
      try {
        matches = readJson(matchFile) as MatchEntry[];
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        syncReport.errors.push(`Failed to parse matches file: ${matchFile}\n  ${message}`);
        console.error(`ERROR: ${message}`);
        continue;
      }
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

  syncReport.atoms.written = count;
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

function syncCdgs(atomCodeMap: Map<string, AtomCodeEntry>, swapMap: Map<string, SwapCandidate[]>) {
  const cdgFiles = globSync(path.join(CDG_DIR, "*.json"))
    .filter((f) => !f.endsWith("_bindings.json"));

  let count = 0;
  syncReport.cdgs.total = cdgFiles.length;

  for (const cdgFile of cdgFiles) {
    const baseName = path.basename(cdgFile, ".json");
    let cdg: SolutionCdg;
    try {
      cdg = readJson(cdgFile) as SolutionCdg;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      syncReport.errors.push(`Failed to parse CDG: ${baseName} — ${message}`);
      console.error(`ERROR: ${message}`);
      continue;
    }

    if (!cdg.asset_id || !cdg.name || !Array.isArray(cdg.stages)) {
      syncReport.warnings.push(`CDG missing required fields (asset_id, name, or stages): ${baseName}`);
      console.warn(`  WARNING: Skipping CDG with missing required fields: ${baseName}`);
      continue;
    }

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
    const edges = (cdg.edges ?? []).map((e) => ({
      ...e,
      edge_kind: (e.edge_kind as string || "data_flow").toLowerCase(),
      loss_class: (e.loss_class as string || "preserving").toLowerCase(),
    }));

    // Build bindings array enriched with atom code + swap candidates
    const swappableStages = (cdg.applicability as Record<string, unknown>)?.swappable_stages as Record<string, string> | undefined ?? {};
    const stagesByIdMap = new Map((cdg.stages as Array<Record<string, unknown>>).map((s) => [s.stage_id as string, s]));

    const bindings = (bindingsData?.bindings ?? []).map((b) => {
      const fqdn = b.bound_artifact_fqdn ?? null;
      const atomInfo = fqdn ? atomCodeMap.get(fqdn) : undefined;
      const stage = stagesByIdMap.get(b.stage_id);
      const isSwappable = b.stage_id in swappableStages;
      const conceptType = stage ? normalizeConcept(stage.concept_type as string) : "";

      // Get swap candidates: other atoms of the same concept_type, excluding current
      let swapCandidates: Array<{ fqdn: string; stage_name: string; cdg_name: string; cdg_asset_id: string }> = [];
      if (isSwappable && conceptType) {
        swapCandidates = (swapMap.get(conceptType) ?? [])
          .filter((c) => c.fqdn !== fqdn);
      }

      return {
        stage_id: b.stage_id,
        bound_atom_fqdn: fqdn,
        binding_confidence: b.binding_confidence,
        status: b.status as "active" | "gap" | "approximate",
        action_class: b.action_class,
        atom_code: atomInfo?.code ?? "",
        atom_code_html: atomInfo?.codeHtml ?? "",
        atom_summary: atomInfo?.summary ?? "",
        atom_type_sig: atomInfo?.typeSig ?? "",
        atom_github_path: atomInfo?.githubPath ?? "",
        swap_rationale: swappableStages[b.stage_id] ?? "",
        swap_candidates: swapCandidates,
      };
    });

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

  syncReport.cdgs.written = count;
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
  syncReport.solutions.total = cdgFiles.length;

  for (const cdgFile of cdgFiles) {
    const baseName = path.basename(cdgFile, ".json");
    let cdg: SolutionCdg;
    try {
      cdg = readJson(cdgFile) as SolutionCdg;
    } catch (err) {
      // Already reported in syncCdgs, skip silently
      continue;
    }

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

  syncReport.solutions.written = count;
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

async function main() {
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
  const atomCodeMap = buildAtomCodeMap();
  const swapMap = buildSwapCandidatesMap();

  // Syntax-highlight all extracted Python code with shiki
  await highlightAllCode(atomCodeMap);

  syncAtoms(atomToCdg);
  syncCdgs(atomCodeMap, swapMap);
  syncSolutions();

  // Write sync report
  const reportPath = path.resolve(__dirname, "../sync-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(syncReport, null, 2), "utf-8");

  // Summary
  console.log("\n── Sync Report ──");
  console.log(`  Repos: ${syncReport.repos_found.join(", ")}`);
  console.log(`  Atoms: ${syncReport.atoms.written} | CDGs: ${syncReport.cdgs.written} | Solutions: ${syncReport.solutions.written}`);
  console.log(`  Atom code: ${syncReport.atom_code.extracted}/${syncReport.atom_code.total_bound} extracted`);
  if (syncReport.warnings.length > 0) {
    console.warn(`  Warnings: ${syncReport.warnings.length}`);
  }
  if (syncReport.errors.length > 0) {
    console.error(`  Errors: ${syncReport.errors.length}`);
  }
  console.log(`  Full report: ${reportPath}`);
  console.log("Done.");
}

async function highlightAllCode(codeMap: Map<string, AtomCodeEntry>) {
  const entries = [...codeMap.entries()].filter(([, v]) => v.code);
  if (entries.length === 0) return;

  const highlighter = await createHighlighter({
    themes: ["github-dark-default"],
    langs: ["python"],
  });

  for (const [fqdn, entry] of entries) {
    entry.codeHtml = highlighter.codeToHtml(entry.code, {
      lang: "python",
      theme: "github-dark-default",
    });
  }

  highlighter.dispose();
  console.log(`  syntax highlight: ${entries.length} snippets`);
}

main().catch((err) => {
  console.error("\nSync failed:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
