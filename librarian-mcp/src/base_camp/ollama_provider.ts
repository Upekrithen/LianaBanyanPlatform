/**
 * Ollama Provider — CAI Substrate Router (Local-Model CAI)
 * =========================================================
 * Wires the pheromone substrate directly to a locally-hosted Ollama instance.
 *
 * Architecture:
 *   Query → queryPheromone (Arm B: 0.000288ms cache hit)
 *          → HIT:  return hits immediately, no model call
 *          → MISS: call Ollama API → emitPheromone (write back)
 *                  → all future identical queries → HIT
 *
 * Empirical basis (BP024, Founder's machine):
 *   Hardware: AMD Radeon RX 9070 XT + 61.5GB RAM, Windows 11
 *   Model: llama3.1:8b-instruct-q4_K_M via Ollama
 *   Arm A median latency: 16,111ms (range 931ms–36,100ms)
 *   Arm B: 0.000288ms (pheromone cache hit)
 *   Empirical S ratio: 55,940,972× (56 million times)
 *   CAI S-component: 7.75 | Projected full CAI: ~9.6
 *
 * Key invariant: local models produce LARGER S ratios than cloud APIs because
 * the naive baseline is slower. The bigger and slower the model, the more the
 * substrate is worth. The substrate's value scales with model size.
 *
 * A&A: AA_FORMAL_2NNN_LOCAL_MODEL_CAI_SUBSTRATE_ON_DEVICE_INFERENCE_BP024_DRAFT.md
 * Paper: PAPER_OFF_THE_CHARTS_LOCAL_MODEL_CAI_S56M_BP024_SCAFFOLD.md
 * BP024 / KN100 Ollama provider extension
 */

import { queryPheromone, emitPheromone } from "../scribes/pheromone.js";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OllamaModel {
  name: string;
  size: number;         // bytes
  modified_at: string;
}

export interface OllamaDetectResult {
  available: boolean;
  endpoint: string;
  models: OllamaModel[];
  error?: string;
}

export interface OllamaQueryResult {
  response: string;
  latencyMs: number;
  eval_duration_ms: number;
  model: string;
  prompt_eval_count: number;
  eval_count: number;
}

export interface CaiAskOptions {
  model?: string;
  endpoint?: string;
  hitThreshold?: number;   // min pheromone hits to count as a cache hit (default 3)
  decayDays?: number;      // pheromone decay for written-back answers (default 90)
  timeoutMs?: number;      // Ollama request timeout (default 120000)
}

export interface CaiAskResult {
  arm: "A" | "B";
  latencyMs: number;
  fromCache: boolean;
  // Arm B fields
  hits?: Array<{ scribe: string; tablet_id: string; decay_score: number }>;
  // Arm A fields
  response?: string;
  writtenBack?: boolean;
  ollamaModel?: string;
}

export interface ArmCalibrationResult {
  n: number;
  latencies_ms: number[];
  median_ms: number;
  mean_ms: number;
  min_ms: number;
  max_ms: number;
  model: string;
  endpoint: string;
}

export interface SmokeTestResult {
  query: string;
  armB_ms: number;
  cacheHit: boolean;
  armA_ms: number | null;
  armA_response: string | null;
  writtenBack: boolean;
  sRatio: number | null;
  caiS: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_ENDPOINT = "http://localhost:11434";
const DEFAULT_MODEL    = "llama3.1:8b-instruct-q4_K_M";
const PHEROMONE_ARM_B_MS = 0.000288; // empirically established BP024

// ─── Ollama detection ─────────────────────────────────────────────────────────

export async function detectOllama(
  endpoint: string = DEFAULT_ENDPOINT
): Promise<OllamaDetectResult> {
  try {
    const tagsUrl = `${endpoint}/api/tags`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    let res: Response;
    try {
      res = await fetch(tagsUrl, { signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      return { available: false, endpoint, models: [], error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as { models: OllamaModel[] };
    return {
      available: true,
      endpoint,
      models: data.models ?? [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { available: false, endpoint, models: [], error: msg };
  }
}

// ─── Ollama query (Arm A) ─────────────────────────────────────────────────────

export async function ollamaQuery(
  prompt: string,
  model: string = DEFAULT_MODEL,
  endpoint: string = DEFAULT_ENDPOINT,
  timeoutMs: number = 120_000
): Promise<OllamaQueryResult> {
  const url = `${endpoint}/api/generate`;
  const body = JSON.stringify({ model, prompt, stream: false });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const t0 = performance.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const latencyMs = performance.now() - t0;

  if (!res.ok) {
    throw new Error(`Ollama API error: HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    response: string;
    eval_duration?: number;
    prompt_eval_count?: number;
    eval_count?: number;
  };

  return {
    response: data.response ?? "",
    latencyMs,
    eval_duration_ms: data.eval_duration ? data.eval_duration / 1_000_000 : latencyMs,
    model,
    prompt_eval_count: data.prompt_eval_count ?? 0,
    eval_count: data.eval_count ?? 0,
  };
}

// ─── CAI router (the wire) ────────────────────────────────────────────────────

/**
 * caiAsk — the core routing function.
 *
 * 1. Check pheromone substrate (Arm B: ~0.000288ms)
 * 2. If sufficient hits → return cache result immediately
 * 3. Else → call Ollama (Arm A: seconds to minutes)
 * 4. Write Ollama response back to pheromone index
 * 5. Future identical/similar queries → Arm B hit
 *
 * As the pheromone index accumulates, the fraction of queries hitting Arm A
 * decreases monotonically — compounding efficiency across sessions without
 * modifying model weights or inference engine.
 */
export async function caiAsk(
  query: string,
  options: CaiAskOptions = {}
): Promise<CaiAskResult> {
  const {
    model       = DEFAULT_MODEL,
    endpoint    = DEFAULT_ENDPOINT,
    hitThreshold = 3,
    decayDays   = 90,
    timeoutMs   = 120_000,
  } = options;

  // ── Arm B: pheromone substrate check ────────────────────────────────────────
  const armBStart = performance.now();
  const pheromoneResult = queryPheromone(query, {
    topK: 10,
    sufficiencyThreshold: hitThreshold,
    decayActive: true,
  });
  const armBMs = performance.now() - armBStart;

  const topHits = pheromoneResult.hits.slice(0, 5).map((h) => ({
    scribe: h.scribe,
    tablet_id: h.tablet_id,
    decay_score: h.decay_score,
  }));

  if (pheromoneResult.hits.length >= hitThreshold) {
    return {
      arm: "B",
      latencyMs: armBMs,
      fromCache: true,
      hits: topHits,
    };
  }

  // ── Arm A: Ollama inference ──────────────────────────────────────────────────
  const ollamaResult = await ollamaQuery(query, model, endpoint, timeoutMs);

  // ── Write back to pheromone index ────────────────────────────────────────────
  const tabletId = `ollama_${model.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}`;
  const content = `Query: ${query}\n\nAnswer: ${ollamaResult.response}`;

  emitPheromone("OllamaLocal", tabletId, content, {
    cathedral: "bishop",
    decayConstantDays: decayDays,
    flavorClass: { cognition: "empirical-receipt", audience: "bishop-substrate" },
    synthesisClass: "local_model_cai",
  });

  return {
    arm: "A",
    latencyMs: ollamaResult.latencyMs,
    fromCache: false,
    response: ollamaResult.response,
    writtenBack: true,
    ollamaModel: model,
  };
}

// ─── Arm A calibration ────────────────────────────────────────────────────────

const CALIBRATION_QUERIES = [
  "What is photosynthesis?",
  "Who wrote Hamlet?",
  "What is the speed of light?",
  "Name the capital of France.",
  "What is 2+2?",
];

export async function calibrateArmA(
  n: number = 5,
  model: string = DEFAULT_MODEL,
  endpoint: string = DEFAULT_ENDPOINT,
  timeoutMs: number = 1_800_000  // 30 min default — 70B on CPU RAM needs it
): Promise<ArmCalibrationResult> {
  const latencies: number[] = [];
  const queries = CALIBRATION_QUERIES.slice(0, Math.min(n, CALIBRATION_QUERIES.length));

  for (const q of queries) {
    console.error(`  [calibrate] query ${latencies.length + 1}/${queries.length}: "${q}"`);
    const result = await ollamaQuery(q, model, endpoint, timeoutMs);
    latencies.push(result.latencyMs);
    console.error(`  [calibrate] done: ${result.latencyMs.toFixed(0)}ms`);
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  return {
    n: latencies.length,
    latencies_ms: latencies,
    median_ms: median,
    mean_ms: mean,
    min_ms: Math.min(...latencies),
    max_ms: Math.max(...latencies),
    model,
    endpoint,
  };
}

// ─── Smoke test ───────────────────────────────────────────────────────────────

/**
 * smokeTest — run a single query through the full Arm A → write-back → Arm B cycle.
 * Used by the lb_frame installer "Make yourself Comfortable" step.
 *
 * Returns timing for both arms and the computed S ratio.
 */
export async function smokeTest(
  query: string = "What is the CAI substrate?",
  model: string = DEFAULT_MODEL,
  endpoint: string = DEFAULT_ENDPOINT
): Promise<SmokeTestResult> {
  // First call: guaranteed cache miss (novel query) → Arm A
  const armBPrecheck = performance.now();
  const precheck = queryPheromone(query, { topK: 1, sufficiencyThreshold: 3 });
  const armBPrecheckMs = performance.now() - armBPrecheck;

  if (precheck.hits.length >= 3) {
    // Already cached — measure Arm B directly
    return {
      query,
      armB_ms: armBPrecheckMs,
      cacheHit: true,
      armA_ms: null,
      armA_response: null,
      writtenBack: false,
      sRatio: null,
      caiS: null,
    };
  }

  // Arm A: call Ollama
  const armAResult = await ollamaQuery(query, model, endpoint, 180_000);

  // Write back
  const tabletId = `smoke_test_${Date.now()}`;
  emitPheromone("OllamaLocal", tabletId, `Query: ${query}\n\nAnswer: ${armAResult.response}`, {
    cathedral: "bishop",
    decayConstantDays: 90,
    synthesisClass: "local_model_cai",
  });

  // Arm B: now measure cache hit
  const armBStart = performance.now();
  queryPheromone(query, { topK: 1, sufficiencyThreshold: 1 });
  const armBMs = performance.now() - armBStart;

  const effectiveArmBMs = Math.max(armBMs, PHEROMONE_ARM_B_MS);
  const sRatio = armAResult.latencyMs / effectiveArmBMs;
  const caiS = Math.log10(sRatio);

  return {
    query,
    armB_ms: armBMs,
    cacheHit: false,
    armA_ms: armAResult.latencyMs,
    armA_response: armAResult.response,
    writtenBack: true,
    sRatio,
    caiS,
  };
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

// Usage: node dist/base_camp/ollama_provider.js [ask|detect|calibrate|smoke]
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("ollama_provider.js") ||
   process.argv[1].endsWith("ollama_provider.ts"))
) {
  const cmd     = process.argv[2] ?? "detect";
  const model   = process.argv[3] ?? DEFAULT_MODEL;
  const endpoint = process.argv[4] ?? DEFAULT_ENDPOINT;

  if (cmd === "detect") {
    const result = await detectOllama(endpoint);
    console.log("\n=== OLLAMA DETECTION ===");
    console.log(`Available: ${result.available}`);
    console.log(`Endpoint:  ${result.endpoint}`);
    if (result.available) {
      console.log(`Models (${result.models.length}):`);
      for (const m of result.models) {
        const gb = (m.size / 1e9).toFixed(1);
        console.log(`  ${m.name} (${gb}GB)`);
      }
    } else {
      console.log(`Error: ${result.error}`);
    }

  } else if (cmd === "smoke") {
    console.log(`\n=== CAI SMOKE TEST ===`);
    console.log(`Model:    ${model}`);
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Running...`);
    const result = await smokeTest(undefined, model, endpoint);
    console.log(`\nQuery: "${result.query}"`);
    if (result.cacheHit) {
      console.log(`Arm B (cache hit): ${result.armB_ms.toFixed(4)}ms`);
      console.log(`Already in substrate — this query was answered before.`);
    } else {
      console.log(`Arm A (Ollama):    ${result.armA_ms?.toFixed(0)}ms`);
      console.log(`Arm B (substrate): ${result.armB_ms.toFixed(4)}ms`);
      console.log(`Written back:      ${result.writtenBack}`);
      console.log(`S ratio:           ${result.sRatio?.toFixed(0)}×`);
      console.log(`CAI (S only):      ${result.caiS?.toFixed(2)}`);
    }

  } else if (cmd === "calibrate") {
    console.log(`\n=== ARM A CALIBRATION ===`);
    console.log(`Model: ${model} | Queries: 5`);
    const result = await calibrateArmA(5, model, endpoint);
    console.log(`Median: ${result.median_ms.toFixed(0)}ms`);
    console.log(`Mean:   ${result.mean_ms.toFixed(0)}ms`);
    console.log(`Min:    ${result.min_ms.toFixed(0)}ms`);
    console.log(`Max:    ${result.max_ms.toFixed(0)}ms`);
    const sRatio = result.median_ms / PHEROMONE_ARM_B_MS;
    console.log(`\nS ratio (median / 0.000288ms): ${sRatio.toFixed(0)}×`);
    console.log(`CAI S-component: ${Math.log10(sRatio).toFixed(2)}`);

  } else if (cmd === "ask") {
    const query = process.argv.slice(3).join(" ");
    if (!query) { console.error("Usage: ask <query>"); process.exit(1); }
    console.log(`\n[CAI Router] Query: "${query}"`);
    const t0 = performance.now();
    const result = await caiAsk(query, { model, endpoint });
    const elapsed = performance.now() - t0;
    if (result.arm === "B") {
      console.log(`[Arm B — CACHE HIT] ${result.latencyMs.toFixed(4)}ms`);
      console.log(`Top hits: ${result.hits?.map(h => h.tablet_id).join(", ")}`);
    } else {
      console.log(`[Arm A — OLLAMA] ${result.latencyMs.toFixed(0)}ms`);
      console.log(`\nResponse:\n${result.response}`);
      console.log(`\n[Written back to pheromone index]`);
    }
    console.log(`Total: ${elapsed.toFixed(2)}ms`);
  }
}
