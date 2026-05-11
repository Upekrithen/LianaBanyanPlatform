// generate_consolidated_report.mjs
// Merges all dry-run results bundles into one consolidated report + emits PDF.

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { emitJSON } from './reporting/json_emitter.mjs';
import { emitPDF } from './reporting/pdf_emitter.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS_ROOT = join(__dirname, 'results');

// Collect all results.json files
function findResultFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      const rp = join(p, 'results.json');
      if (existsSync(rp)) out.push(rp);
    }
  }
  return out.sort();
}

const resultFiles = findResultFiles(RESULTS_ROOT);
if (resultFiles.length === 0) {
  console.error('No results.json files found under results/');
  process.exit(1);
}

const allResults = [];
for (const f of resultFiles) {
  const bundle = JSON.parse(readFileSync(f, 'utf8'));
  allResults.push(...(bundle.results ?? []));
}

const consolidated = {
  benchmark: 'Banyan Scale Swarm Substrate Benchmark 2026Q2',
  version: 'v0.1',
  edition: 'LB-EDITION-09 (BP036)',
  pretty_good_caveat: 'v0.1 — counsel + Founder iterate',
  run_ts: new Date().toISOString(),
  hardware_profile: {
    ram_gb: 16,
    cpu: process.env.BENCHMARK_CPU ?? 'AMD/Intel Tier-1 commodity',
    os: 'Win11',
  },
  results: allResults,
};

const outJson = join(RESULTS_ROOT, 'consolidated_dry_run_s6.json');
const { validation } = emitJSON(consolidated, outJson);
console.log(`Consolidated JSON: ${outJson} (valid=${validation.valid})`);

const outPdf = await emitPDF(consolidated, RESULTS_ROOT);
console.log(`Report HTML: ${outPdf.htmlPath} engine=${outPdf.engine}`);
