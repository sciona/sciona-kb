#!/usr/bin/env npx tsx
/**
 * Rename non-snake-case atom function names to snake_case across all
 * sciona-atoms* repos.
 *
 * Usage:
 *   npx tsx scripts/rename-atoms-to-snake-case.ts --dry-run
 *   npx tsx scripts/rename-atoms-to-snake-case.ts --apply
 */

import fs from "fs";
import path from "path";
import { globSync } from "glob";

const DRY_RUN = !process.argv.includes("--apply");
const BASE = "/Users/conrad/personal";

// ──────────────────────────────────────────────────────────────────
// 1. Curated rename mapping: old_name → new_name
//    Every non-snake-case atom function (>6 chars, no underscore)
//    must appear here. Names not in this map are skipped.
// ──────────────────────────────────────────────────────────────────

const RENAMES: Record<string, string> = {
  // ── sciona-atoms (inference, state_estimation) ──
  hamiltonianphasepointtransition: "hamiltonian_phase_point_transition",
  hamiltoniantransitionkernel: "hamiltonian_transition_kernel",
  buildnutstree: "build_nuts_tree",
  collectposteriorchain: "collect_posterior_chain",
  initializehmckernelstate: "initialize_hmc_kernel_state",
  initializehmcstate: "initialize_hmc_state",
  initializenutsstate: "initialize_nuts_state",
  initializesamplerrng: "initialize_sampler_rng",
  leapfrogproposalkernel: "leapfrog_proposal_kernel",
  meanfieldvariationalfit: "mean_field_variational_fit",
  metropolishastingstransitionkernel: "metropolis_hastings_transition_kernel",
  metropolishmctransition: "metropolis_hmc_transition",
  nutstransitionkernel: "nuts_transition_kernel",
  posteriordrawsampling: "posterior_draw_sampling",
  runsamplingloop: "run_sampling_loop",
  runnutstransitions: "run_nuts_transitions",
  targetlogkerneloracle: "target_log_kernel_oracle",
  temperingfactorcomputation: "tempering_factor_computation",
  exposecovariance: "expose_covariance",
  exposelatentmean: "expose_latent_mean",
  initializelineargaussianstatemodel: "initialize_linear_gaussian_state_model",
  predictlatentstate: "predict_latent_state",
  updatewithmeasurement: "update_with_measurement",
  pagerank: "pagerank", // single word — skip

  // ── sciona-atoms-bio ──
  adiabaticpulseassembler: "adiabatic_pulse_assembler",
  adiabaticquantumsampler: "adiabatic_quantum_sampler",
  assemblestaticmappingcontext: "assemble_static_mapping_context",
  initializefrontierfromstartnode: "initialize_frontier_from_start_node",
  interactionboundscomputer: "interaction_bounds_computer",
  quantumcircuitsampler: "quantum_circuit_sampler",
  quantumproblemdefinition: "quantum_problem_definition",
  quantumsolutionextractor: "quantum_solution_extractor",
  quantumsolverorchestrator: "quantum_solver_orchestrator",
  rungreedymappingpipeline: "run_greedy_mapping_pipeline",
  scoreandextendgreedycandidates: "score_and_extend_greedy_candidates",
  solutionextraction: "solution_extraction",
  validatecurrentmapping: "validate_current_mapping",

  // ── sciona-atoms-cs ──
  dirsign: "dirsign", // single word — skip
  combination: "combination", // single word — skip

  // ── sciona-atoms-dl ──
  objective: "objective", // single word — skip

  // ── sciona-atoms-fintech ──
  charfuncoption: "char_func_option",
  kalmanfilterinit: "kalman_filter_init",
  kalmanmeasurementupdate: "kalman_measurement_update",
  maxstep: "maxstep", // skip — too short / ambiguous
  computeinventoryadjustedquotes: "compute_inventory_adjusted_quotes",
  computeoptimaltrajectory: "compute_optimal_trajectory",
  initializemarketmakerstate: "initialize_market_maker_state",
  initializeorderstate: "initialize_order_state",
  marketmakerstateinit: "market_maker_state_init",
  optimalexecutiontrajectory: "optimal_execution_trajectory",
  optimalquotecalculation: "optimal_quote_calculation",
  riskaversioninit: "risk_aversion_init",
  updatequeueontrade: "update_queue_on_trade",
  insertcf: "insert_cf",
  insertcflist: "insert_cf_list",
  localvol: "local_vol",
  allfort: "allfort", // domain-specific name — skip
  addmod64: "add_mod_64",
  mulmod64: "mul_mod_64",
  powmod64: "pow_mod_64",
  randomdouble: "random_double",
  randomint: "random_int",
  randomint64: "random_int_64",
  randomword32: "random_word_32",
  randomword64: "random_word_64",
  quicksim: "quick_sim",
  quicksimanti: "quick_sim_anti",
  runsimulation: "run_simulation",
  runsimulationanti: "run_simulation_anti",
  simulatestate: "simulate_state",
  process: "process", // single word — skip

  // ── sciona-atoms-ml ──
  binarize: "binarize", // single word — skip
  normalize: "normalize", // single word — skip
  tokenize: "tokenize", // single word — skip
  levenshtein: "levenshtein", // proper noun — skip

  // ── sciona-atoms-physics ──
  calhms2jd: "cal_hms_to_jd",
  jd2calhms: "jd_to_cal_hms",
  fd2hmsf: "fd_to_hmsf",
  isleapyear: "is_leap_year",
  lastj2000dayofyear: "last_j2000_day_of_year",
  tai2utc: "tai_to_utc",
  utc2tai: "utc_to_tai",
  dedispersionkernel: "dedispersion_kernel",
  datetime: "datetime", // stdlib name — skip
  hms2fd: "hms_to_fd", // short but still concat

  // ── sciona-atoms-robotics ──
  computesideslipangle: "compute_side_slip_angle",
  constructgeometrymodel: "construct_geometry_model",
  computelinearizedstatematrices: "compute_linearized_state_matrices",
  controlinputsynthesis: "control_input_synthesis",
  dynamicsandlinearizationkernel: "dynamics_and_linearization_kernel",
  evaluateandinvertdynamics: "evaluate_and_invert_dynamics",
  kinematicgoalfeasibility: "kinematic_goal_feasibility",
  loadmodelfromfile: "load_model_from_file",
  modelspecloadingandsizing: "model_spec_loading_and_sizing",
  querygeometryparameters: "query_geometry_parameters",

  // ── sciona-atoms-signal ──
  averageqrstemplate: "average_qrs_template",
  filterstateinit: "filter_state_init",
  filterstep: "filter_step",
  normalizesignal: "normalize_signal",
  generatereconstructedppg: "generate_reconstructed_ppg",
  signalarraynormalization: "signal_array_normalization",
  templatefeaturecomputation: "template_feature_computation",
  wrapperevaluate: "wrapper_evaluate",
  wrapperpredictionsignalcomputation: "wrapper_prediction_signal_computation",
  assemblezz2018sqi: "assemble_zz2018_sqi",
  calculatebeatagreementsqi: "calculate_beat_agreement_sqi",
  calculatefrequencypowersqi: "calculate_frequency_power_sqi",
  calculatekurtosissqi: "calculate_kurtosis_sqi",
  christovqrsdetect: "christov_qrs_detect",
  computebeatagreementsqi: "compute_beat_agreement_sqi",
  computefrequencysqi: "compute_frequency_sqi",
  computekurtosissqi: "compute_kurtosis_sqi",
  thresholdbasedsignalsegmentation: "threshold_based_signal_segmentation",
  zhao2018hrvanalysis: "zhao_2018_hrv_analysis",
};

// Filter to only actual renames (where old !== new)
const activeRenames = Object.entries(RENAMES).filter(
  ([old, newName]) => old !== newName
);

console.log(
  `${DRY_RUN ? "DRY RUN" : "APPLYING"}: ${activeRenames.length} renames\n`
);

// ──────────────────────────────────────────────────────────────────
// 2. Find all files that may contain references
// ──────────────────────────────────────────────────────────────────

const filePatterns = [
  `${BASE}/sciona-atoms*/src/sciona/atoms/**/atoms.py`,
  `${BASE}/sciona-atoms*/src/sciona/atoms/**/witnesses.py`,
  `${BASE}/sciona-atoms*/src/sciona/atoms/**/matches.json`,
  `${BASE}/sciona-atoms*/src/sciona/atoms/**/cdg.json`,
  `${BASE}/sciona-atoms/data/solution_cdgs/*.json`,
];

const allFiles: string[] = [];
for (const pattern of filePatterns) {
  allFiles.push(...globSync(pattern));
}

// ──────────────────────────────────────────────────────────────────
// 3. Scan and (optionally) apply replacements
// ──────────────────────────────────────────────────────────────────

interface Change {
  file: string;
  oldName: string;
  newName: string;
  lineNumbers: number[];
  count: number;
}

const changes: Change[] = [];
const fileContents = new Map<string, string>();

// Load all files
for (const file of allFiles) {
  fileContents.set(file, fs.readFileSync(file, "utf8"));
}

// For each rename, find and replace across all files
for (const [oldName, newName] of activeRenames) {
  // Match as whole word to avoid partial replacements
  // In Python: function names, string references
  // In JSON: string values containing the name
  const patterns = [
    // Function def / witness function name
    new RegExp(`\\b${oldName}\\b`, "g"),
  ];

  for (const [file, content] of fileContents) {
    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length === 0) continue;

      // Find line numbers
      const lines = content.split("\n");
      const lineNumbers: number[] = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(oldName)) {
          lineNumbers.push(i + 1);
        }
      }

      changes.push({
        file: file.replace(BASE + "/", ""),
        oldName,
        newName,
        lineNumbers,
        count: matches.length,
      });

      // Apply replacement in memory
      const updated = content.replace(pattern, newName);
      fileContents.set(file, updated);
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 4. Report
// ──────────────────────────────────────────────────────────────────

// Group by repo
const byRepo = new Map<string, Change[]>();
for (const c of changes) {
  const repo = c.file.split("/")[0];
  const list = byRepo.get(repo) ?? [];
  list.push(c);
  byRepo.set(repo, list);
}

let totalFiles = new Set(changes.map((c) => c.file)).size;
let totalReplacements = changes.reduce((s, c) => s + c.count, 0);

for (const [repo, repoChanges] of [...byRepo.entries()].sort()) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`${repo} (${repoChanges.length} changes in ${new Set(repoChanges.map((c) => c.file)).size} files)`);
  console.log(`${"═".repeat(60)}`);

  // Group by rename
  const byRename = new Map<string, Change[]>();
  for (const c of repoChanges) {
    const key = `${c.oldName} → ${c.newName}`;
    const list = byRename.get(key) ?? [];
    list.push(c);
    byRename.set(key, list);
  }

  for (const [rename, renameChanges] of byRename) {
    console.log(`\n  ${rename}`);
    for (const c of renameChanges) {
      const shortFile = c.file.replace(repo + "/", "");
      console.log(
        `    ${shortFile} (${c.count}x, lines: ${c.lineNumbers.join(",")})`
      );
    }
  }
}

console.log(`\n${"─".repeat(60)}`);
console.log(`SUMMARY: ${activeRenames.length} renames, ${totalFiles} files, ${totalReplacements} replacements`);
console.log(`${"─".repeat(60)}`);

// ──────────────────────────────────────────────────────────────────
// 5. Apply if not dry run
// ──────────────────────────────────────────────────────────────────

if (!DRY_RUN) {
  let written = 0;
  const originalContents = new Map<string, string>();
  // Re-read originals to compare
  for (const file of allFiles) {
    originalContents.set(file, fs.readFileSync(file, "utf8"));
  }

  for (const [file, newContent] of fileContents) {
    const original = originalContents.get(file);
    if (original && original !== newContent) {
      fs.writeFileSync(file, newContent);
      written++;
    }
  }
  console.log(`\nWrote ${written} files.`);
} else {
  console.log(`\nDry run — no files modified. Run with --apply to execute.`);
}
