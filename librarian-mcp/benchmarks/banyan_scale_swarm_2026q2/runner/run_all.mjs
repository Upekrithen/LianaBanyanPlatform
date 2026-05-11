// runner/run_all.mjs
// Full matrix runner: all stacks × all workloads × N runs.
// Usage: node run_all.mjs --runs 5 --stacks S6 [--stacks S1]

import { parseArgs } from 'util';
import { spawnSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ALL_STACKS    = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const ALL_WORKLOADS = ['W1', 'W2', 'W3'];

const { values: args } = parseArgs({
  options: {
    runs:    { type: 'string',  short: 'n', default: '5' },
    stacks:  { type: 'string',  multiple: true, short: 's', default: ALL_STACKS },
    dry_run: { type: 'boolean', short: 'd', default: false },
  },
  strict: false,
});

const numRuns  = parseInt(args.runs ?? '5', 10);
const stacks   = (Array.isArray(args.stacks) ? args.stacks : [args.stacks]).map(s => s.toUpperCase());
const dryRun   = args.dry_run ?? false;
const runnerPath = join(__dirname, 'run_benchmark.mjs');

const results = [];
const total = stacks.length * ALL_WORKLOADS.length;
let done = 0;

for (const stackId of stacks) {
  for (const workloadId of ALL_WORKLOADS) {
    done++;
    console.log(`\n[${done}/${total}] Running ${stackId} × ${workloadId} (${numRuns} runs)...`);
    const dryFlag = dryRun ? ['--dry_run'] : [];
    const r = spawnSync(
      process.execPath,
      [runnerPath, '--stack', stackId, '--workload', workloadId, '--runs', String(numRuns), ...dryFlag],
      { encoding: 'utf8', stdio: 'inherit', timeout: 10 * 60 * 1000 },
    );
    results.push({ stackId, workloadId, exitCode: r.status });
  }
}

console.log('\n=== run_all summary ===');
for (const r of results) {
  const status = r.exitCode === 0 ? 'OK' : `FAIL(${r.exitCode})`;
  console.log(`  ${r.stackId} × ${r.workloadId}: ${status}`);
}
const failures = results.filter(r => r.exitCode !== 0);
if (failures.length > 0) {
  console.log(`\n${failures.length} run(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll runs completed.');
}
