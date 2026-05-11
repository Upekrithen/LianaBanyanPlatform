// runner/run_benchmark.mjs
// Main benchmark entry point.
// Usage: node run_benchmark.mjs --stack S6 --workload W1 --runs 5

import { parseArgs } from 'util';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BENCH_ROOT = join(__dirname, '..');
const FIXTURES_ROOT = join(BENCH_ROOT, 'fixtures');
const RESULTS_ROOT = join(BENCH_ROOT, 'results');

// Adapter registry
const ADAPTERS = {
  S1: () => import('../adapters/s1_ruflo.mjs'),
  S2: () => import('../adapters/s2_wshobson.mjs'),
  S3: () => import('../adapters/s3_hive.mjs'),
  S4: () => import('../adapters/s4_composio.mjs'),
  S5: () => import('../adapters/s5_maestro.mjs'),
  S6: () => import('../adapters/s6_lb_substrate.mjs'),
};

const FIXTURE_PATHS = {
  W1: join(FIXTURES_ROOT, 'w1-multi-file-refactor'),
  W2: join(FIXTURES_ROOT, 'w2-doc-test-gen'),
  W3: join(FIXTURES_ROOT, 'w3-data-cleaning'),
};

import { scoreAxisA } from '../scoring/axis_a_acceleration.mjs';
import { scoreAxisB } from '../scoring/axis_b_burden.mjs';
import { scoreAxisC } from '../scoring/axis_c_concord.mjs';
import { scoreAxisD } from '../scoring/axis_d_durability.mjs';
import { scoreAxisE, evaluateW1, evaluateW2, evaluateW3 } from '../scoring/axis_e_evidence.mjs';
import { scoreAxisF } from '../scoring/axis_f_federation.mjs';
import { scoreAxisG, RUBRIC_DEFAULTS } from '../scoring/axis_g_governance.mjs';
import { scoreAxisH } from '../scoring/axis_h_hygiene.mjs';
import { emitJSON } from '../reporting/json_emitter.mjs';

const WORKLOAD_TIERS = { W1: 4, W2: 5, W3: 6 };

async function runBenchmark(stackId, workloadId, numRuns, dryRun = false) {
  const adapterLoader = ADAPTERS[stackId];
  if (!adapterLoader) throw new Error(`Unknown stack: ${stackId}`);
  const adapter = await adapterLoader();
  console.log(`\n=== Banyan Scale Benchmark 2026Q2 ===`);
  console.log(`Stack: ${adapter.STACK_NAME} (${stackId}) [${adapter.IMPLEMENTATION_STATUS}]`);
  console.log(`Workload: ${workloadId}  Runs: ${numRuns}\n`);

  // Preflight
  const pf = await adapter.preflight();
  console.log(`Preflight: ok=${pf.ok} version=${pf.version}`);
  if (pf.warnings?.length) pf.warnings.forEach(w => console.log(`  WARN: ${w}`));
  if (!pf.ok && !dryRun) {
    console.log('Preflight failed and not dry-run. Aborting.');
    return null;
  }

  const runDate = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const runLabel = `${runDate}_${stackId}_${workloadId}`;
  const runDir = join(RESULTS_ROOT, runLabel);
  mkdirSync(runDir, { recursive: true });

  const fixturePath = FIXTURE_PATHS[workloadId];
  const runs = [];

  for (let i = 0; i < numRuns; i++) {
    console.log(`  Run ${i + 1}/${numRuns}...`);
    const outputDir = join(runDir, `run_${String(i + 1).padStart(2, '0')}`);
    mkdirSync(outputDir, { recursive: true });
    const result = await adapter.runWorkload(workloadId, fixturePath, outputDir);
    runs.push(result);
    const ms = new Date(result.endTs).getTime() - new Date(result.startTs).getTime();
    console.log(`    exit=${result.exitClass} elapsed=${ms}ms`);
  }

  const tier = WORKLOAD_TIERS[workloadId] ?? 4;

  // Evaluate pass criteria (Axis E) from last run output
  const lastRunDir = join(runDir, `run_${String(numRuns).padStart(2, '0')}`);
  let evidenceDetail;
  if (workloadId === 'W1') evidenceDetail = evaluateW1(lastRunDir, fixturePath);
  else if (workloadId === 'W2') evidenceDetail = evaluateW2(lastRunDir);
  else evidenceDetail = evaluateW3(lastRunDir, fixturePath);

  const metrics = adapter.observeMetrics();

  const scores = {
    A: scoreAxisA(runs, tier),
    B: scoreAxisB(runs, tier),
    C: scoreAxisC(runs, {
      crossVerificationRate: metrics.crossVerificationCount / Math.max(runs.length, 1),
      failureRecoveryObserved: metrics.failureRecoveryObserved,
    }, tier),
    D: scoreAxisD(runs, { soakRecovery: false }, tier),
    E: scoreAxisE(evidenceDetail, tier),
    F: scoreAxisF({ win11: evidenceDetail.pass, ubuntu: null }, tier),
    G: scoreAxisG(RUBRIC_DEFAULTS[stackId] ?? RUBRIC_DEFAULTS.S1, tier),
    H: scoreAxisH({ crossVendorContinuity: stackId === 'S6' }, tier),
  };

  const resultBundle = {
    benchmark: 'Banyan Scale Swarm Substrate Benchmark 2026Q2',
    version: 'v0.1',
    edition: 'LB-EDITION-09 (BP036)',
    pretty_good_caveat: 'v0.1 — counsel + Founder iterate',
    run_ts: new Date().toISOString(),
    hardware_profile: {
      ram_gb: 16,
      cpu: process.env.BENCHMARK_CPU ?? 'unknown (set BENCHMARK_CPU env var)',
      os: process.platform === 'win32' ? 'Win11' : 'Ubuntu22.04',
    },
    results: [{
      stack_id: stackId,
      stack_name: adapter.STACK_NAME,
      implementation_status: adapter.IMPLEMENTATION_STATUS,
      workload: workloadId,
      runs: numRuns,
      scores,
      subscription_extension_factor: null,
      failure_modes_observed: runs
        .filter(r => r.exitClass !== 'pass')
        .map((r, i) => ({
          run: i + 1,
          exit_class: r.exitClass,
          note: r.extra?.note ?? r.extra?.error ?? '',
        })),
    }],
  };

  const jsonPath = join(runDir, 'results.json');
  emitJSON(resultBundle, jsonPath);
  console.log(`\nResults written: ${jsonPath}`);
  console.log(`Scores: A=${scores.A.score} B=${scores.B.score} C=${scores.C.score} D=${scores.D.score} E=${scores.E.score} F=${scores.F.score} G=${scores.G.score} H=${scores.H.score}`);

  await adapter.cleanup();
  return resultBundle;
}

// --- CLI ---
const { values: args } = parseArgs({
  options: {
    stack:    { type: 'string', short: 's', default: 'S6' },
    workload: { type: 'string', short: 'w', default: 'W1' },
    runs:     { type: 'string', short: 'n', default: '1' },
    dry_run:  { type: 'boolean', short: 'd', default: false },
  },
  strict: false,
});

const stackId   = (args.stack ?? 'S6').toUpperCase();
const workloadId = (args.workload ?? 'W1').toUpperCase();
const numRuns   = parseInt(args.runs ?? '1', 10);
const dryRun    = args.dry_run ?? false;

runBenchmark(stackId, workloadId, numRuns, dryRun).catch(err => {
  console.error('Benchmark failed:', err.message);
  process.exit(1);
});
