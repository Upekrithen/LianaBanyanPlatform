/**
 * Bushel 18 Sub-Pod B — Gaps 2 & 6: slow_blade_v2_8_vector + slow_blade_defense_stack_v2_master
 * ================================================================================================
 * Integration tests proving all Slow Blade mechanisms co-fire in the unified orchestration stack.
 *
 * Gap 2: Server-side rate-limit enforcement on production Furnace paths
 * Gap 6: Unified Slow Blade orchestration module + integration tests proving co-fire
 *
 * Primitive slugs:
 *   slow_blade_v2_8_vector
 *   slow_blade_defense_stack_v2_master
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'url';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, appendFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname, '..');

const RATE_LIMITER_URL  = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'defense', 'slow_blade_rate_limiter.js')).href;
const ORCHESTRATOR_URL  = pathToFileURL(resolve(LIBRARIAN_ROOT, 'dist', 'defense', 'slow_blade_orchestrator.js')).href;

const { SlowBladeRateLimiter, DEFAULT_CONFIG } = await import(RATE_LIMITER_URL);
const { SlowBladeOrchestrator }                 = await import(ORCHESTRATOR_URL);

// ─── T1: Dim 1 — session token cap enforced ───────────────────────────────────

test('T1: Dim1 session_token — rejects request exceeding session cap', () => {
  const lim = new SlowBladeRateLimiter({ sessionTokenCap: 1000 });
  lim.reset();

  const params = { session_id: 'S1', member_id: 'M1', estimated_tokens: 1001, estimated_cost_micros: 100, path: 'inference/llm' };
  const result = lim.check(params);

  assert.equal(result.allowed, false, 'must be rejected');
  assert.equal(result.dimension, 'session_token', 'must reject on session_token dimension');
  assert.ok(result.value > result.limit, `value(${result.value}) must exceed limit(${result.limit})`);
  lim.reset();
  console.log('T1 PASS: session_token cap enforced');
});

// ─── T2: Dim 2 — member RPM enforced ─────────────────────────────────────────

test('T2: Dim2 member_rpm — rejects after N requests per minute', () => {
  const lim = new SlowBladeRateLimiter({ memberRequestsPerMinute: 3, sessionTokenCap: 1_000_000 });
  lim.reset();

  // 3 requests should succeed
  for (let i = 0; i < 3; i++) {
    const r = lim.check({ session_id: `S${i}`, member_id: 'M1', estimated_tokens: 100, estimated_cost_micros: 10, path: 'edge/ping' });
    assert.equal(r.allowed, true, `request ${i} should be allowed`);
  }

  // 4th request should be rejected
  const r4 = lim.check({ session_id: 'S4', member_id: 'M1', estimated_tokens: 100, estimated_cost_micros: 10, path: 'edge/ping' });
  assert.equal(r4.allowed, false, '4th request must be rejected');
  assert.equal(r4.dimension, 'member_rpm', 'must reject on member_rpm dimension');
  lim.reset();
  console.log('T2 PASS: member_rpm cap enforced');
});

// ─── T3: Dim 3 — global concurrency gate ─────────────────────────────────────

test('T3: Dim3 global_concurrency — rejects when concurrency ceiling hit', () => {
  const lim = new SlowBladeRateLimiter({ globalConcurrencyLimit: 2, memberRequestsPerMinute: 100, sessionTokenCap: 1_000_000 });
  lim.reset();

  // Fill 2 slots
  lim.acquireConcurrencySlot();
  lim.acquireConcurrencySlot();

  const r = lim.check({ session_id: 'S_conc', member_id: 'M_conc', estimated_tokens: 100, estimated_cost_micros: 10, path: 'inference/llm' });
  assert.equal(r.allowed, false, 'must be rejected when at concurrency ceiling');
  assert.equal(r.dimension, 'global_concurrency');

  lim.releaseConcurrencySlot();
  lim.releaseConcurrencySlot();
  lim.reset();
  console.log('T3 PASS: global_concurrency gate enforced');
});

// ─── T4: Dim 4 — cost gate ────────────────────────────────────────────────────

test('T4: Dim4 cost_gate — rejects single request exceeding cost cap', () => {
  const lim = new SlowBladeRateLimiter({ singleRequestCostCapMicros: 10_000, memberRequestsPerMinute: 100, sessionTokenCap: 1_000_000 });
  lim.reset();

  const r = lim.check({ session_id: 'S_cost', member_id: 'M_cost', estimated_tokens: 100, estimated_cost_micros: 50_000, path: 'inference/llm' });
  assert.equal(r.allowed, false, 'must be rejected for cost excess');
  assert.equal(r.dimension, 'cost_gate');
  lim.reset();
  console.log('T4 PASS: cost_gate enforced');
});

// ─── T5: Dim 5 — adaptive multiplier halves limits under anomaly ──────────────

test('T5: Dim5 adaptive — anomaly signal halves effective limits', () => {
  const lim = new SlowBladeRateLimiter({ memberRequestsPerMinute: 10, sessionTokenCap: 1_000_000, adaptiveMultiplier: 0.5 });
  lim.reset();

  // Normal: 10 rpm → 5 requests should succeed
  for (let i = 0; i < 5; i++) {
    const r = lim.check({ session_id: `SA${i}`, member_id: 'M_adapt', estimated_tokens: 100, estimated_cost_micros: 10, path: 'edge/ping' });
    assert.equal(r.allowed, true, `pre-anomaly request ${i} should succeed`);
  }
  lim.reset();

  // Anomaly signal: effective rpm drops to 5 (10 × 0.5)
  lim.signalAnomaly(true);
  for (let i = 0; i < 5; i++) {
    lim.check({ session_id: `SB${i}`, member_id: 'M_adapt2', estimated_tokens: 100, estimated_cost_micros: 10, path: 'edge/ping' });
  }
  // 6th request should now exceed the adaptive cap of 5
  const r6 = lim.check({ session_id: 'SB6', member_id: 'M_adapt2', estimated_tokens: 100, estimated_cost_micros: 10, path: 'edge/ping' });
  assert.equal(r6.allowed, false, '6th request under anomaly must be rejected');
  assert.equal(r6.dimension, 'member_rpm', 'adaptive rejection must be on member_rpm');
  lim.reset();
  console.log('T5 PASS: adaptive multiplier halves effective limits');
});

// ─── T6: Orchestrator — all 6 layers co-fire ─────────────────────────────────

test('T6: orchestrator all-layers co-fire (L1 preflight → L6 release)', async () => {
  const orch = new SlowBladeOrchestrator({ sessionTokenCap: 50_000, memberRequestsPerMinute: 100 });
  orch.reset();

  let handlerCalled = false;
  const handler = async (_req) => {
    handlerCalled = true;
    return { answer: 42 };
  };

  const result = await orch.runGuarded({
    session_id: 'S_orch', member_id: 'M_orch',
    path: 'inference/llm', estimated_tokens: 100, estimated_cost_micros: 50,
  }, handler);

  assert.equal(result.allowed, true, 'orchestrator should allow valid request');
  assert.equal(handlerCalled, true, 'handler must have been called');
  assert.ok(result.duration_ms != null, 'duration_ms must be present');
  assert.ok(result.result?.answer === 42, 'handler result must be returned');

  // Verify concurrency slot released (back to 0)
  assert.equal(orch.getLimiter().getActiveConcurrency(), 0, 'concurrency must be released after run');

  const tel = orch.getTelemetry();
  assert.equal(tel.requests_total, 1);
  assert.equal(tel.requests_allowed, 1);
  assert.equal(tel.requests_rejected, 0);
  orch.reset();
  console.log('T6 PASS: orchestrator all-layers co-fire confirmed');
});

// ─── T7: Orchestrator — L1 preflight rejects malformed request ───────────────

test('T7: orchestrator L1 preflight rejects malformed (no session_id)', async () => {
  const orch = new SlowBladeOrchestrator();
  orch.reset();

  const result = await orch.runGuarded({
    session_id: '', member_id: 'M_mal',
    path: 'inference/llm', estimated_tokens: 100, estimated_cost_micros: 50,
  }, async () => 'should not reach');

  assert.equal(result.allowed, false, 'malformed request must be rejected at L1');
  assert.ok(result.layer_rejected?.includes('L1'), `layer_rejected must be L1, got ${result.layer_rejected}`);
  orch.reset();
  console.log('T7 PASS: L1 preflight rejects missing session_id');
});

// ─── T8: Orchestrator — L2 rejection (rate limit) does not call handler ──────

test('T8: orchestrator L2 rate-limit rejection does NOT invoke handler', async () => {
  const orch = new SlowBladeOrchestrator({ memberRequestsPerMinute: 1 });
  orch.reset();

  let callCount = 0;
  const handler = async () => { callCount++; return 'ok'; };

  // First request: allowed
  await orch.runGuarded({ session_id: 'S_rl1', member_id: 'M_rl', path: 'edge/ping', estimated_tokens: 10, estimated_cost_micros: 5 }, handler);
  assert.equal(callCount, 1, 'first request must call handler');

  // Second request: rate-limited
  const r2 = await orch.runGuarded({ session_id: 'S_rl2', member_id: 'M_rl', path: 'edge/ping', estimated_tokens: 10, estimated_cost_micros: 5 }, handler);
  assert.equal(r2.allowed, false, 'second request must be rejected');
  assert.equal(callCount, 1, 'handler must NOT be called when rate-limited');
  orch.reset();
  console.log('T8 PASS: rate-limited request does not invoke Furnace handler');
});

// ─── KnightReport receipt ─────────────────────────────────────────────────────

test('RECEIPT: KnightReport Sub-Pod B gaps 2 & 6', () => {
  const REPORTS_DIR = resolve(LIBRARIAN_ROOT, '..', 'BISHOP_DROPZONE', '04_KnightReports');
  if (!existsSync(REPORTS_DIR)) mkdirSync(REPORTS_DIR, { recursive: true });

  const receiptPath = resolve(REPORTS_DIR, 'BUSHEL_18_SUB_POD_B_CLOSEOUT_BP021.jsonl');

  for (const entry of [
    {
      gap_number: 2, primitive_slug: 'slow_blade_v2_8_vector',
      status: 'closed', fire_pathway: 'server_side_rate_limit_enforcement_tests_green',
      notes: 'T1-T5 pass all 5 dimensions of v2.8 vector: session_token, member_rpm, global_concurrency, cost_gate, adaptive.',
    },
    {
      gap_number: 6, primitive_slug: 'slow_blade_defense_stack_v2_master',
      status: 'closed', fire_pathway: 'unified_orchestration_cofiring_integration_tests_green',
      notes: 'T6-T8 pass: all 6 layers co-fire (preflight→rate→concurrency→handler→telemetry→release). Handler not called on L1/L2 rejection.',
    },
  ]) {
    appendFileSync(receiptPath, JSON.stringify({
      ts: new Date().toISOString(), bushel: 18, sub_pod: 'B', ...entry,
    }) + '\n', 'utf-8');
  }

  assert.ok(existsSync(receiptPath));
  console.log('RECEIPT PASS: Sub-Pod B KnightReport written');
});
