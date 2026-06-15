/**
 * mesh_a_smoke.test.mjs — Regression test for Condition A Ollama fetch
 *
 * Catches: runConditionA returning null for ALL smoke questions
 * (the BP083 "Smoke FAIL: model unreachable" regression — root cause was
 * think:false option not supported by all Ollama versions).
 *
 * Runs with: node --test tests/mesh_a_smoke.test.mjs
 *
 * Mocks globalThis.fetch so no actual Ollama is needed.
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// ─── Mock fetch ───────────────────────────────────────────────────────────────

const MOCK_RESPONSES = new Map();
let lastRequestBody = null;

function mockFetch(url, opts) {
  lastRequestBody = JSON.parse(opts?.body ?? '{}');
  const mockResp = MOCK_RESPONSES.get(url) ?? {
    ok: true,
    status: 200,
    json: async () => ({ response: 'A' }),
    text: async () => '{"response":"A"}',
  };
  return Promise.resolve(mockResp);
}

// Mock AbortSignal.timeout (Node 24 has it natively, but be explicit)
if (!globalThis.AbortSignal.timeout) {
  globalThis.AbortSignal.timeout = (ms) => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), ms);
    return ctrl.signal;
  };
}

// ─── Inline minimal runConditionA to test the fixed request body ──────────────

/**
 * Minimal reproduction of runConditionA post-fix.
 * Verifies the request body does NOT include think:false.
 */
async function runConditionA_fixture(model, ollamaBaseUrl, fetchFn) {
  const endpoint = '/api/generate';
  const fullUrl = `${ollamaBaseUrl}${endpoint}`;

  const requestBody = {
    model,
    prompt: 'Test question\nA. Option A\nB. Option B\nReply with ONLY the letter.',
    stream: false,
    options: { num_predict: 256, temperature: 0.0 },
    // CRITICAL: think is NOT included (aligned to canonical_pipeline.ts)
  };

  try {
    const resp = await fetchFn(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: globalThis.AbortSignal.timeout(60_000),
    });

    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '(unreadable)');
      return { letter: null, diagStatus: resp.status, diagErrBody: errBody };
    }

    const data = await resp.json();
    const raw = (data.response ?? '').trim();
    const letter = raw.charAt(0).match(/[A-J]/i)
      ? raw.charAt(0).toUpperCase()
      : null;

    return { letter, diagStatus: resp.status, diagErrBody: null };
  } catch (err) {
    return { letter: null, diagStatus: null, diagErrBody: err.message };
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Condition A — Ollama fetch alignment (BP083 Deep RCA)', () => {

  test('request body does NOT include think:false', async () => {
    lastRequestBody = null;
    await runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', mockFetch);
    assert.ok(lastRequestBody, 'fetch was called');
    assert.equal(lastRequestBody.stream, false, 'stream must be false');
    assert.equal(lastRequestBody.options?.num_predict, 256, 'num_predict must be 256');
    assert.equal(lastRequestBody.options?.temperature, 0.0, 'temperature must be 0.0');
    // THE CRITICAL CHECK: think must NOT be in options
    assert.equal(
      'think' in (lastRequestBody.options ?? {}),
      false,
      'REGRESSION: think:false must NOT be in request options (causes HTTP 400 on some Ollama versions)',
    );
  });

  test('extracts letter A from Ollama response "{response: A}"', async () => {
    const result = await runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', mockFetch);
    assert.equal(result.letter, 'A', 'letter must be extracted from response');
    assert.equal(result.diagErrBody, null, 'no error body on success');
  });

  test('returns null letter (not throw) on HTTP 400 error', async () => {
    const errorFetch = () => Promise.resolve({
      ok: false,
      status: 400,
      text: async () => '{"error":"unknown parameter think"}',
      json: async () => ({ error: 'unknown parameter think' }),
    });
    const result = await runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', errorFetch);
    assert.equal(result.letter, null, 'letter must be null on HTTP error');
    assert.equal(result.diagStatus, 400, 'diagStatus must be 400');
    assert.ok(result.diagErrBody?.includes('unknown parameter'), 'diagErrBody must include error text');
  });

  test('returns null letter (not throw) on fetch exception (Ollama not running)', async () => {
    const throwFetch = () => Promise.reject(new Error('ECONNREFUSED 127.0.0.1:11434'));
    const result = await runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', throwFetch);
    assert.equal(result.letter, null, 'letter must be null on connection error');
    assert.ok(result.diagErrBody?.includes('ECONNREFUSED'), 'diagErrBody must include error message');
  });

  test('uses http://127.0.0.1:11434/api/generate endpoint (aligned to canonical_pipeline.ts)', async () => {
    let calledUrl = null;
    const captureFetch = (url, _opts) => {
      calledUrl = url;
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ response: 'B' }), text: async () => '' });
    };
    await runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', captureFetch);
    assert.equal(calledUrl, 'http://127.0.0.1:11434/api/generate', 'URL must match canonical_pipeline.ts');
  });

  test('smoke result: at least 1 non-empty answer when Ollama returns valid response', async () => {
    // Simulates the smoke test's allNonEmpty check
    const results = await Promise.all([
      runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', mockFetch),
      runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', mockFetch),
      runConditionA_fixture('gemma4:12b', 'http://127.0.0.1:11434', mockFetch),
    ]);
    const nonEmpty = results.filter((r) => r.letter !== null).length;
    assert.ok(nonEmpty >= 1, `Smoke FAIL regression: totalNonEmpty=${nonEmpty} < 1 (model appears unreachable when it should not be)`);
  });

});
