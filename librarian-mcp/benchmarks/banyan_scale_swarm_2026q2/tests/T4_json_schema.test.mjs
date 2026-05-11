// tests/T4_json_schema.test.mjs
// T4: JSON emitter output validates against schema.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { emitJSON, validateSchema } from '../reporting/json_emitter.mjs';

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
      scores: {
        A: { tier: 4, score: 75 },
        B: { tier: 4, score: 90 },
        C: { tier: 4, score: 50 },
        D: { tier: 4, score: 80 },
        E: { tier: 4, score: 100 },
        F: { tier: 4, score: 50 },
        G: { tier: 5, score: 92 },
        H: { tier: 4, score: 0 },
      },
    }],
  };
}

test('T4a: validateSchema passes on minimal valid bundle', () => {
  const result = validateSchema(buildMinimalBundle());
  assert.ok(result.valid, `Schema errors: ${result.errors.join(', ')}`);
  assert.equal(result.errors.length, 0);
});

test('T4b: validateSchema fails when results is missing', () => {
  const bundle = buildMinimalBundle();
  delete bundle.results;
  const result = validateSchema(bundle);
  assert.ok(!result.valid);
  assert.ok(result.errors.some(e => e.includes('results')));
});

test('T4c: validateSchema fails when an axis is missing', () => {
  const bundle = buildMinimalBundle();
  delete bundle.results[0].scores.H;
  const result = validateSchema(bundle);
  assert.ok(!result.valid);
  assert.ok(result.errors.some(e => e.includes('axis: H')));
});

test('T4d: emitJSON writes valid JSON file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'banyan-test-'));
  const outPath = join(dir, 'results.json');
  const { outputPath, validation } = emitJSON(buildMinimalBundle(), outPath);
  assert.ok(existsSync(outputPath));
  const parsed = JSON.parse(readFileSync(outputPath, 'utf8'));
  assert.equal(parsed.version, 'v0.1');
  assert.ok(validation.valid);
});
