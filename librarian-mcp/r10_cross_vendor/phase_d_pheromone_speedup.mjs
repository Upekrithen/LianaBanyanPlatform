#!/usr/bin/env node
/**
 * K528 Phase D — Pheromone Substrate Speedup Empirical
 * =====================================================
 * Measures actual speedup of Pheromone Substrate (Phase 0) vs
 * RPC Detective sweep (all-scribes serial consult) on 50 investigation queries.
 *
 * Condition 1: RPC baseline — consult_scribes serially against all registered Scribes
 *              (simulates pre-#2317 Detective behavior: no Phase 0, scan all tablets)
 * Condition 2: Pheromone query — queryPheromone(topic) from production index
 *              (post-#2317: O(1) index lookup, sub-millisecond expected)
 *
 * TS-097 estimated conservative ~10^7 speedup. We'll measure empirically.
 *
 * Output: results_r11v2_K528/phase_d_pheromone.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, '..'); // librarian-mcp/

// Paths
const BANK_PATH = resolve(__dirname, 'R11v2_INVESTIGATION_BANK_K528.json');
const CONSULT_CLI = resolve(__dirname, 'consult_scribes_cli.mjs');
const OUT_DIR = resolve(__dirname, 'results_r11v2_K528');
const OUT_PATH = resolve(OUT_DIR, 'phase_d_pheromone.json');

// Load the pheromone module from dist
const PHEROMONE_URL = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'scribes', 'pheromone.js')).href;
let queryPheromone;
try {
  const mod = await import(PHEROMONE_URL);
  queryPheromone = mod.queryPheromone;
  console.log('  Pheromone module loaded OK.');
} catch (e) {
  console.error(`  FATAL: Cannot load pheromone module from ${PHEROMONE_URL}: ${e.message}`);
  console.error('  Run: cd librarian-mcp && npm run build');
  process.exit(1);
}

// Load investigation bank
const bank = JSON.parse(readFileSync(BANK_PATH, 'utf-8'));
const queries = bank.queries;
console.log(`  Investigation bank: ${queries.length} queries`);

// Ensure output dir exists
if (!existsSync(OUT_DIR)) {
  throw new Error(`Output directory not found: ${OUT_DIR}`);
}

// ─── ConsultClient for RPC baseline ──────────────────────────────────────────

class ConsultClient {
  constructor() {
    this.proc = spawn('node', [CONSULT_CLI], {
      stdin: 'pipe',
      stdout: 'pipe',
      stderr: 'pipe',
      cwd: __dirname,
      encoding: 'utf-8',
    });
    this._buf = '';
    this._pending = null;
    this.proc.stdout.on('data', (chunk) => {
      this._buf += chunk.toString();
      const nl = this._buf.indexOf('\n');
      if (nl !== -1 && this._pending) {
        const line = this._buf.slice(0, nl);
        this._buf = this._buf.slice(nl + 1);
        const resolve_ = this._pending;
        this._pending = null;
        resolve_(JSON.parse(line));
      }
    });
  }
  consult(topic, maxEntries = 100) {
    return new Promise((resolve_, reject) => {
      this._pending = resolve_;
      const payload = JSON.stringify({ topic, max_entries: maxEntries }) + '\n';
      this.proc.stdin.write(payload);
    });
  }
  close() {
    try { this.proc.stdin.end(); } catch {}
    try { this.proc.kill(); } catch {}
  }
}

// ─── RPC Baseline ─────────────────────────────────────────────────────────────

async function runRpcBaseline(queries, client) {
  console.log('\n--- Condition 1: RPC Detective sweep (pre-#2317 baseline) ---');
  const results = [];
  for (const q of queries) {
    const t0 = performance.now();
    let result;
    try {
      result = await client.consult(q.query, 100);
    } catch (e) {
      result = { ok: false, error: String(e) };
    }
    const latencyMs = performance.now() - t0;

    const entries = result?.result?.entries ?? [];
    const scribesConsulted = result?.result?.scribes_consulted ?? [];

    // Check if expected fragment found in any entry
    const found = entries.some(e => {
      const text = (e.observation || '') + (e.canonical_ref || '');
      return text.toLowerCase().includes((q.expected_fragment || '').toLowerCase());
    });

    results.push({
      query_id: q.id,
      domain: q.domain,
      query: q.query,
      latency_ms: Math.round(latencyMs * 1000) / 1000,
      entries_returned: entries.length,
      scribes_hit: scribesConsulted.length,
      expected_found: found,
      condition: 'rpc_baseline',
    });

    const foundTag = found ? '✓' : '✗';
    console.log(`  ${q.id.padEnd(8)} RPC  ${latencyMs.toFixed(1).padStart(7)}ms  ${entries.length} entries  ${foundTag}`);
  }
  return results;
}

// ─── Pheromone Baseline ───────────────────────────────────────────────────────

async function runPheromoneBaseline(queries) {
  console.log('\n--- Condition 2: Pheromone Substrate query (post-#2317) ---');
  const results = [];
  for (const q of queries) {
    const t0 = performance.now();
    let result;
    try {
      result = await queryPheromone(q.query);
    } catch (e) {
      result = { hits: [], query_ms: 0, error: String(e) };
    }
    const wallclockMs = performance.now() - t0;

    const hits = result?.hits ?? [];
    const queryMs = result?.query_ms ?? wallclockMs;

    // Check if expected scribe appears in hits
    const expectedScribeHit = hits.some(h =>
      h.scribe?.toLowerCase().includes((q.expected_scribe || '').toLowerCase())
    );

    results.push({
      query_id: q.id,
      domain: q.domain,
      query: q.query,
      latency_ms: Math.round(wallclockMs * 1000) / 1000,
      pheromone_query_ms: Math.round(queryMs * 1000) / 1000,
      hits_returned: hits.length,
      expected_scribe_hit: expectedScribeHit,
      index_age_seconds: result?.index_age_seconds ?? null,
      topic_count: result?.topic_count ?? null,
      record_count: result?.record_count ?? null,
      condition: 'pheromone',
    });

    const hitTag = expectedScribeHit ? '✓' : '✗';
    console.log(`  ${q.id.padEnd(8)} PHE  ${wallclockMs.toFixed(3).padStart(9)}ms  ${hits.length} hits  ${hitTag}`);
  }
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('K528 Phase D — Pheromone Substrate Speedup Empirical');
console.log('=====================================================');

const client = new ConsultClient();

// Warm up the consult client with one dummy query
try {
  await client.consult('warmup', 1);
  console.log('  consult_scribes_cli warm-up OK.');
} catch (e) {
  console.error(`  WARNING: consult_scribes_cli warm-up failed: ${e}`);
}

// Run RPC baseline
const rpcResults = await runRpcBaseline(queries, client);
client.close();

// Small delay between conditions
await new Promise(r => setTimeout(r, 500));

// Run Pheromone baseline
const pheromoneResults = await runPheromoneBaseline(queries);

// ─── Compute statistics ────────────────────────────────────────────────────

function stats(values) {
  if (!values.length) return { n: 0, mean: null, median: null, min: null, max: null, p95: null };
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n/2-1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
  const p95 = sorted[Math.floor(n * 0.95)];
  return { n, mean: Math.round(mean * 1000) / 1000, median: Math.round(median * 1000) / 1000, min: sorted[0], max: sorted[n-1], p95 };
}

const rpcLatencies = rpcResults.map(r => r.latency_ms);
const pheLatencies = pheromoneResults.map(r => r.latency_ms);
const pheQueryMs = pheromoneResults.map(r => r.pheromone_query_ms);

const rpcStats = stats(rpcLatencies);
const pheStats = stats(pheLatencies);
const pheQueryStats = stats(pheQueryMs);

const speedupMean = rpcStats.mean / Math.max(pheStats.mean, 0.001);
const speedupMedian = rpcStats.median / Math.max(pheStats.median, 0.001);
const speedupPureQuery = rpcStats.mean / Math.max(pheQueryStats.mean, 0.001);

// Accuracy comparison
const rpcAccuracy = rpcResults.filter(r => r.expected_found).length / rpcResults.length * 100;
const pheAccuracy = pheromoneResults.filter(r => r.expected_scribe_hit).length / pheromoneResults.length * 100;

console.log('\n=== PHASE D RESULTS ===');
console.log(`RPC latency:        mean=${rpcStats.mean}ms  median=${rpcStats.median}ms  min=${rpcStats.min}ms  max=${rpcStats.max}ms`);
console.log(`Pheromone latency:  mean=${pheStats.mean}ms  median=${pheStats.median}ms  min=${pheStats.min}ms  max=${pheStats.max}ms`);
console.log(`Pheromone queryMs:  mean=${pheQueryStats.mean}ms  (raw in-memory query time)`);
console.log(`Speedup (mean):     ${speedupMean.toFixed(1)}×`);
console.log(`Speedup (median):   ${speedupMedian.toFixed(1)}×`);
console.log(`Speedup (pure Q):   ${speedupPureQuery.toFixed(1)}×  (pheromone internal query_ms vs RPC mean)`);
console.log(`TS-097 estimate:    ~10^7 (10,000,000×)`);
console.log(`RPC accuracy:       ${rpcAccuracy.toFixed(1)}% (expected fragment found in entries)`);
console.log(`Pheromone accuracy: ${pheAccuracy.toFixed(1)}% (expected scribe appeared in hits)`);

const output = {
  phase: 'D',
  run_ts: new Date().toISOString(),
  bank: bank.bank_id,
  queries_run: queries.length,
  rpc_baseline: {
    condition: 'rpc_detective_sweep',
    description: 'Pre-#2317 baseline: serial consult_scribes across all Scribes',
    latency_stats_ms: rpcStats,
    accuracy_pct: Math.round(rpcAccuracy * 10) / 10,
    results: rpcResults,
  },
  pheromone: {
    condition: 'pheromone_substrate',
    description: 'Post-#2317 production: queryPheromone() O(1) index lookup',
    latency_stats_ms: pheStats,
    pure_query_stats_ms: pheQueryStats,
    accuracy_pct: Math.round(pheAccuracy * 10) / 10,
    results: pheromoneResults,
  },
  speedup: {
    mean: Math.round(speedupMean),
    median: Math.round(speedupMedian),
    pure_query: Math.round(speedupPureQuery),
    ts097_estimate: '~10^7',
    unit: 'RPC mean latency / pheromone mean latency (wallclock)',
  },
  notes: [
    'RPC baseline: single-node consult_scribes_cli.mjs (full scribe scan)',
    'Pheromone: in-process queryPheromone() from production dist/scribes/pheromone.js',
    'Speedup vs TS-097 estimate will diverge if pheromone index is much smaller than theoretical maximum',
    'For 10^7 speedup: requires pheromone query ~100ns vs RPC ~1s = 10^7 difference',
    'Actual RPC wallclock includes IPC overhead (stdin/stdout); real RPC in production is similar',
  ],
};

writeFileSync(OUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
console.log(`\nPhase D output written: ${OUT_PATH}`);
