// tests/T5_pdf_emitter.test.mjs
// T5: PDF emitter produces non-empty HTML (and PDF if tooling available).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { emitPDF } from '../reporting/pdf_emitter.mjs';

function buildMinimalBundle() {
  return {
    benchmark: 'Banyan Scale Swarm Substrate Benchmark 2026Q2',
    version: 'v0.1',
    edition: 'LB-EDITION-09 (BP036)',
    pretty_good_caveat: 'v0.1 — counsel + Founder iterate',
    run_ts: new Date().toISOString(),
    hardware_profile: { ram_gb: 16, cpu: 'Test', os: 'Win11' },
    results: [{
      stack_id: 'S6',
      stack_name: 'LB Substrate',
      workload: 'W1',
      runs: 1,
      implementation_status: 'dry_run_capable',
      scores: {
        A: { tier: 4, score: 75 }, B: { tier: 4, score: 90 },
        C: { tier: 4, score: 50 }, D: { tier: 4, score: 80 },
        E: { tier: 4, score: 100 }, F: { tier: 4, score: 50 },
        G: { tier: 5, score: 92 }, H: { tier: 4, score: 0 },
      },
    }],
  };
}

test('T5: PDF emitter produces non-empty HTML report', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'banyan-pdf-test-'));
  const result = await emitPDF(buildMinimalBundle(), dir);
  assert.ok(result.htmlPath, 'htmlPath should be set');
  assert.ok(existsSync(result.htmlPath), 'HTML file should exist');
  const size = statSync(result.htmlPath).size;
  assert.ok(size > 1000, `HTML file too small: ${size} bytes`);
  console.log(`  T5: engine=${result.engine} html=${size} bytes`);
});
