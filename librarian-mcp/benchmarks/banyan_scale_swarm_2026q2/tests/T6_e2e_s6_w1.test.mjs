// tests/T6_e2e_s6_w1.test.mjs
// T6: End-to-end dry-run S6 × W1 produces results directory with all expected artifacts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES  = join(__dirname, '..', 'fixtures');

import * as s6 from '../adapters/s6_lb_substrate.mjs';

test('T6: S6 preflight returns ok=true on this machine', async () => {
  const pf = await s6.preflight();
  assert.equal(pf.ok, true, `S6 preflight failed: ${pf.error}`);
  assert.equal(typeof pf.version, 'string');
});

test('T6: S6 runWorkload W1 produces output artifacts', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'banyan-s6-w1-'));
  const fixturePath = join(FIXTURES, 'w1-multi-file-refactor');
  const result = await s6.runWorkload('W1', fixturePath, outDir);

  assert.ok(['pass', 'partial'].includes(result.exitClass),
    `Expected pass/partial, got ${result.exitClass} (${result.extra?.error ?? ''})`);
  assert.ok(result.outputArtifactPaths.length > 0, 'No output artifacts produced');
  assert.ok(existsSync(result.rawLogPath), 'rawLogPath not found');
  assert.ok(typeof result.startTs === 'string');
  assert.ok(typeof result.endTs === 'string');
  assert.ok(result.observedMessages > 0);
  console.log(`  T6 W1: exitClass=${result.exitClass} artifacts=${result.outputArtifactPaths.length}`);
});

test('T6: S6 runWorkload W2 produces documentation artifacts', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'banyan-s6-w2-'));
  const fixturePath = join(FIXTURES, 'w2-doc-test-gen');
  const result = await s6.runWorkload('W2', fixturePath, outDir);

  assert.ok(['pass', 'partial'].includes(result.exitClass),
    `W2 unexpected exit: ${result.exitClass}`);
  const hasDocs = result.outputArtifactPaths.some(p => p.includes('inventory_documented.py'));
  const hasTest = result.outputArtifactPaths.some(p => p.includes('test_inventory.py'));
  const hasReadme = result.outputArtifactPaths.some(p => p.includes('README.md'));
  assert.ok(hasDocs, 'inventory_documented.py not produced');
  assert.ok(hasTest, 'test_inventory.py not produced');
  assert.ok(hasReadme, 'README.md not produced');
  console.log(`  T6 W2: exitClass=${result.exitClass} artifacts=${result.outputArtifactPaths.length}`);
});

test('T6: S6 runWorkload W3 produces cleaned CSV + report', async () => {
  const outDir = mkdtempSync(join(tmpdir(), 'banyan-s6-w3-'));
  const fixturePath = join(FIXTURES, 'w3-data-cleaning');
  const result = await s6.runWorkload('W3', fixturePath, outDir);

  assert.ok(['pass', 'partial'].includes(result.exitClass),
    `W3 unexpected exit: ${result.exitClass}`);
  const hasCsv    = result.outputArtifactPaths.some(p => p.includes('cleaned_orders.csv'));
  const hasReport = result.outputArtifactPaths.some(p => p.includes('cleaning_report.json'));
  assert.ok(hasCsv,    'cleaned_orders.csv not produced');
  assert.ok(hasReport, 'cleaning_report.json not produced');
  console.log(`  T6 W3: exitClass=${result.exitClass} artifacts=${result.outputArtifactPaths.length}`);
});

test('T6: Full run_benchmark produces results.json in results dir', async () => {
  // Run via the runner and verify results dir is created
  const { spawnSync } = await import('child_process');
  const runnerPath = join(__dirname, '..', 'runner', 'run_benchmark.mjs');
  const result = spawnSync(
    process.execPath,
    [runnerPath, '--stack', 'S6', '--workload', 'W1', '--runs', '1', '--dry_run'],
    { encoding: 'utf8', timeout: 120_000 },
  );
  if (result.status !== 0) {
    console.log('stdout:', result.stdout?.slice(0, 1000));
    console.log('stderr:', result.stderr?.slice(0, 500));
  }
  assert.equal(result.status, 0, `run_benchmark exited ${result.status}`);
  // results.json is written somewhere under results/
  const resultsRoot = join(__dirname, '..', 'results');
  const { readdirSync, statSync } = await import('fs');
  const entries = existsSync(resultsRoot) ? readdirSync(resultsRoot) : [];
  const hasResults = entries.some(e => statSync(join(resultsRoot, e)).isDirectory());
  assert.ok(hasResults, 'No results directory found after run_benchmark');
});
