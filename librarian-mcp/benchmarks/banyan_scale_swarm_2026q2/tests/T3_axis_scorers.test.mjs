// tests/T3_axis_scorers.test.mjs
// T3: Each axis scorer accepts a synthetic RunResult and emits valid score.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { scoreAxisA } from '../scoring/axis_a_acceleration.mjs';
import { scoreAxisB } from '../scoring/axis_b_burden.mjs';
import { scoreAxisC } from '../scoring/axis_c_concord.mjs';
import { scoreAxisD } from '../scoring/axis_d_durability.mjs';
import { scoreAxisE } from '../scoring/axis_e_evidence.mjs';
import { scoreAxisF } from '../scoring/axis_f_federation.mjs';
import { scoreAxisG, RUBRIC_DEFAULTS } from '../scoring/axis_g_governance.mjs';
import { scoreAxisH } from '../scoring/axis_h_hygiene.mjs';

function syntheticRun(overrides = {}) {
  const now = new Date();
  const start = new Date(now.getTime() - 90_000).toISOString(); // 90 seconds ago
  return {
    startTs: start,
    endTs: now.toISOString(),
    exitClass: 'pass',
    outputArtifactPaths: [],
    observedMessages: 6,
    observedTokens: { input: 1500, output: 2000 },
    observedCostUSD: 0.02,
    observedCostEquivalentUSD: 0.05,
    rawLogPath: '/tmp/test.log',
    ...overrides,
  };
}

const runs = [syntheticRun(), syntheticRun(), syntheticRun()];
const TIER = 4;

test('T3a: Axis A score is 0-100 and has wall_clock fields', () => {
  const s = scoreAxisA(runs, TIER);
  assert.ok(s.score >= 0 && s.score <= 100, `score out of range: ${s.score}`);
  assert.equal(s.tier, TIER);
  assert.equal(typeof s.wall_clock_p50_seconds, 'number');
  assert.equal(typeof s.wall_clock_p95_seconds, 'number');
});

test('T3b: Axis B score is 0-100 and has cost fields', () => {
  const s = scoreAxisB(runs, TIER);
  assert.ok(s.score >= 0 && s.score <= 100);
  assert.equal(typeof s.measured_usd_per_task, 'number');
  assert.equal(typeof s.equivalent_usd_per_task, 'number');
});

test('T3c: Axis C score is 0-100 and has concord fields', () => {
  const s = scoreAxisC(runs, { crossVerificationRate: 0.5, failureRecoveryObserved: false }, TIER);
  assert.ok(s.score >= 0 && s.score <= 100);
  assert.equal(typeof s.inter_agent_messages_p50, 'number');
  assert.equal(typeof s.cross_verification_rate, 'number');
});

test('T3d: Axis D score is 0-100 with crash_rate field', () => {
  const mixedRuns = [syntheticRun(), syntheticRun({ exitClass: 'crash' }), syntheticRun()];
  const s = scoreAxisD(mixedRuns, { soakRecovery: true }, TIER);
  assert.ok(s.score >= 0 && s.score <= 100);
  assert.equal(typeof s.crash_rate, 'number');
  assert.ok(s.crash_rate > 0);
});

test('T3e: Axis E score wraps evidence detail', () => {
  const ev = { pass: true, passingTests: 24, totalTests: 24, detail: 'ok' };
  const s = scoreAxisE(ev, TIER);
  assert.equal(s.score, 100);
  assert.equal(s.pass_rate, 1);
});

test('T3f: Axis F full cross-OS = 100', () => {
  const s = scoreAxisF({ win11: true, ubuntu: true }, TIER);
  assert.equal(s.score, 100);
  assert.ok(s.cross_os_verified);
});

test('T3f2: Axis F single OS = 50', () => {
  const s = scoreAxisF({ win11: true, ubuntu: null }, TIER);
  assert.equal(s.score, 50);
});

test('T3g: Axis G S6 rubric sum = 92', () => {
  const s = scoreAxisG(RUBRIC_DEFAULTS.S6, TIER);
  assert.equal(s.score, 92);
  assert.ok('rubric_breakdown' in s);
});

test('T3h: Axis H cross-vendor true = high score', () => {
  const s = scoreAxisH({ crossVendorContinuity: true, tokenLossPct: 0 }, TIER);
  assert.equal(s.score, 100);
});

test('T3h2: Axis H single-vendor = 0', () => {
  const s = scoreAxisH({ crossVendorContinuity: false }, TIER);
  assert.equal(s.score, 0);
});

test('T3 edge: empty runs returns score 0 for all axes', () => {
  assert.equal(scoreAxisA([], TIER).score, 0);
  assert.equal(scoreAxisB([], TIER).score, 0);
  assert.equal(scoreAxisC([], {}, TIER).score, 0);
  assert.equal(scoreAxisD([], {}, TIER).score, 0);
});
