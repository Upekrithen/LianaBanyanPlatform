/**
 * CAI Hearth — Local Ollama Inference Layer
 * ==========================================
 * B36 Phase 5 (BP025) — AMPLIFY Product Foundation
 *
 * Implements the third tier in the query routing stack:
 *   Tier 1: Arm B substrate (pheromone, 0.000288ms, zero cost)
 *   Tier 2: CAI Hearth Ollama (local CPU/GPU, 100-500ms, zero API cost)
 *   Tier 3: Cloud API (Bishop/Knight/Pawn/Rook, 1-3s + API cost)
 *
 * The substrate-defined quality threshold determines whether Ollama output
 * is sufficient or needs cloud escalation. Low-certainty or frontier-class
 * queries escalate; within-domain substrate-augmented queries stay local.
 *
 * AMPLIFY product surface: tracks routing decisions (substrate/local/cloud)
 * and cumulative cost savings, surfacing hardware contribution to users.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname_h = dirname(__filename);
const LIBRARIAN_ROOT = resolve(__dirname_h, "..");

const HEARTH_LOG_PATH = resolve(LIBRARIAN_ROOT, "stitchpunks", "data", "hearth_routing_log.jsonl");
const AMPLIFY_LOG_PATH = resolve(LIBRARIAN_ROOT, "stitchpunks", "data", "amplify_telemetry.jsonl");
const HEARTH_CONFIG_PATH = resolve(LIBRARIAN_ROOT, "config", "hearth_config.json");

// ─── Config ──────────────────────────────────────────────────────────────────

export interface HearthConfig {
  enabled: boolean;
  default_model: string;
  ollama_base_url: string;
  quality_threshold: number;      // 0.0-1.0: below this, escalate to cloud
  substrate_boost: number;        // quality bonus when substrate hit augments the query
  max_tokens_local: number;       // cap for local inference
  cost_per_cloud_token_usd: number;
}

const DEFAULT_HEARTH_CONFIG: HearthConfig = {
  enabled: true,
  default_model: "llama3.1:8b-instruct-q4_K_M",
  ollama_base_url: "http://localhost:11434",
  quality_threshold: 0.72,
  substrate_boost: 0.15,
  max_tokens_local: 2048,
  cost_per_cloud_token_usd: 0.000003,  // ~$3 per 1M tokens (Sonnet average)
};

export function loadHearthConfig(): HearthConfig {
  try {
    if (existsSync(HEARTH_CONFIG_PATH)) {
      return { ...DEFAULT_HEARTH_CONFIG, ...JSON.parse(readFileSync(HEARTH_CONFIG_PATH, "utf-8")) };
    }
  } catch { /* fall through */ }
  return { ...DEFAULT_HEARTH_CONFIG };
}

export function saveHearthConfig(config: HearthConfig): void {
  const dir = dirname(HEARTH_CONFIG_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(HEARTH_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

// ─── Quality threshold detection ─────────────────────────────────────────────

export type RoutingDecision = "substrate_hit" | "local_ollama" | "cloud_escalation";

export interface QualityAssessment {
  score: number;                  // 0.0-1.0
  decision: RoutingDecision;
  signals: string[];
  substrate_augmented: boolean;
}

/** Heuristic quality assessment: can local Ollama handle this? */
export function assessQueryQuality(
  query: string,
  substrate_hit: boolean,
  config: HearthConfig,
): QualityAssessment {
  const q = query.trim().toLowerCase();
  const signals: string[] = [];
  let score = 0.6;  // baseline for local inference

  // Substrate augmentation gives a quality boost
  if (substrate_hit) {
    score += config.substrate_boost;
    signals.push("substrate_augmented");
  }

  // Short, factual queries — high confidence locally
  const wc = q.split(/\s+/).filter(Boolean).length;
  if (wc <= 20) { score += 0.08; signals.push("short_query"); }

  // Within-domain known topics — local model can handle
  if (/\b(hexisle|hexel|ouralis|golden.?lotus|sawtooth|ChannelLock|HollowLog|banyan)\b/i.test(q)) {
    score += 0.1; signals.push("domain_hexisle");
  }
  if (/\b(liana.?banyan|platform|member|creator|worker|initiative)\b/i.test(q)) {
    score += 0.08; signals.push("domain_platform");
  }

  // Complex reasoning — cloud escalation needed
  if (/\b(patent|legal|claim|formal|attorney|court|litigation)\b/i.test(q)) {
    score -= 0.25; signals.push("legal_complexity");
  }
  if (/\b(write|draft|compose|letter|article|paper|essay)\b/i.test(q) && wc > 30) {
    score -= 0.15; signals.push("long_form_writing");
  }
  if (/\b(code|implement|build|typescript|python|sql|function|class)\b/i.test(q)) {
    score -= 0.1; signals.push("code_generation");
  }
  if (/\b(multimodal|image|pdf|figure|chart|visual|photograph)\b/i.test(q)) {
    score -= 0.2; signals.push("multimodal_needed");
  }

  // Novel/frontier topics
  if (/\b(novel|unprecedented|never.?seen|breakthrough|cutting.?edge|frontier)\b/i.test(q)) {
    score -= 0.15; signals.push("frontier_query");
  }

  score = Math.max(0.0, Math.min(1.0, score));

  let decision: RoutingDecision;
  if (score >= config.quality_threshold) {
    decision = "local_ollama";
  } else {
    decision = "cloud_escalation";
  }

  return { score, decision, signals, substrate_augmented: substrate_hit };
}

// ─── Ollama inference ─────────────────────────────────────────────────────────

export interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
  total_duration_ms: number;
  prompt_eval_count: number;
  eval_count: number;
}

export interface HearthResult {
  routing: RoutingDecision;
  response?: string;
  model?: string;
  total_duration_ms?: number;
  tokens_used?: number;
  quality_score: number;
  quality_signals: string[];
  substrate_augmented: boolean;
  cloud_cost_avoided_usd?: number;
  error?: string;
}

/** Call Ollama API for local inference */
export async function callOllama(
  prompt: string,
  model: string,
  base_url: string,
  max_tokens: number,
): Promise<OllamaResponse | null> {
  try {
    const resp = await fetch(`${base_url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { num_predict: max_tokens },
      }),
      signal: AbortSignal.timeout(30000),  // 30s timeout
    });
    if (!resp.ok) return null;
    const data = await resp.json() as {
      response: string; model: string; done: boolean;
      total_duration: number; prompt_eval_count: number; eval_count: number;
    };
    return {
      response: data.response,
      model: data.model,
      done: data.done,
      total_duration_ms: Math.round(data.total_duration / 1_000_000),
      prompt_eval_count: data.prompt_eval_count || 0,
      eval_count: data.eval_count || 0,
    };
  } catch {
    return null;
  }
}

// ─── Hearth routing log ───────────────────────────────────────────────────────

function appendHearthLog(entry: object): void {
  try {
    const dir = dirname(HEARTH_LOG_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(HEARTH_LOG_PATH, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

function appendAmplifyLog(entry: object): void {
  try {
    const dir = dirname(AMPLIFY_LOG_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    appendFileSync(AMPLIFY_LOG_PATH, JSON.stringify(entry) + "\n", "utf-8");
  } catch { /* non-fatal */ }
}

// ─── Main hearth routing function ────────────────────────────────────────────

/**
 * Route a query through the 3-tier CAI Hearth stack:
 * 1. Substrate check (caller provides substrate_hit)
 * 2. Local Ollama if quality threshold met
 * 3. Cloud escalation signal if Ollama insufficient
 */
export async function hearthRoute(
  query: string,
  substrate_hit: boolean,
  substrate_context: string | null,
  config?: HearthConfig,
): Promise<HearthResult> {
  const cfg = config ?? loadHearthConfig();
  const ts = new Date().toISOString();
  const query_hash = "sha256:" + createHash("sha256").update(query, "utf-8").digest("hex");

  // Tier 1: substrate hit → already handled by caller, just log
  if (substrate_hit && substrate_context) {
    const result: HearthResult = {
      routing: "substrate_hit",
      response: substrate_context,
      quality_score: 1.0,
      quality_signals: ["substrate_hit"],
      substrate_augmented: true,
      cloud_cost_avoided_usd: cfg.cost_per_cloud_token_usd * 800,  // estimate 800 tokens saved
    };
    appendHearthLog({ ts, query_hash, routing: "substrate_hit", quality_score: 1.0 });
    appendAmplifyLog({ ts, routing: "substrate_hit", cloud_cost_avoided_usd: result.cloud_cost_avoided_usd, tokens_saved_est: 800 });
    return result;
  }

  // Tier 2: quality assessment for local Ollama
  if (!cfg.enabled) {
    return { routing: "cloud_escalation", quality_score: 0.0, quality_signals: ["hearth_disabled"], substrate_augmented: false };
  }

  const assessment = assessQueryQuality(query, substrate_hit, cfg);

  if (assessment.decision === "local_ollama") {
    // Build augmented prompt (substrate context if available)
    const augmented_prompt = substrate_context
      ? `Context from knowledge substrate:\n${substrate_context}\n\nQuery: ${query}`
      : query;

    const ollama_result = await callOllama(
      augmented_prompt,
      cfg.default_model,
      cfg.ollama_base_url,
      cfg.max_tokens_local,
    );

    if (ollama_result && ollama_result.done) {
      const tokens_used = ollama_result.eval_count + ollama_result.prompt_eval_count;
      const cost_avoided = cfg.cost_per_cloud_token_usd * tokens_used;
      const result: HearthResult = {
        routing: "local_ollama",
        response: ollama_result.response,
        model: ollama_result.model,
        total_duration_ms: ollama_result.total_duration_ms,
        tokens_used,
        quality_score: assessment.score,
        quality_signals: assessment.signals,
        substrate_augmented: substrate_hit,
        cloud_cost_avoided_usd: cost_avoided,
      };
      appendHearthLog({ ts, query_hash, routing: "local_ollama", model: ollama_result.model, total_duration_ms: ollama_result.total_duration_ms, tokens_used, quality_score: assessment.score });
      appendAmplifyLog({ ts, routing: "local_ollama", model: ollama_result.model, duration_ms: ollama_result.total_duration_ms, cloud_cost_avoided_usd: cost_avoided, tokens_saved_est: tokens_used });
      // Write back to substrate (same as Phase 1 mechanism)
      return result;
    }

    // Ollama failed — escalate to cloud
    appendHearthLog({ ts, query_hash, routing: "cloud_escalation", reason: "ollama_error", quality_score: assessment.score });
    return {
      routing: "cloud_escalation",
      quality_score: assessment.score,
      quality_signals: [...assessment.signals, "ollama_error"],
      substrate_augmented: substrate_hit,
      error: "Local Ollama inference failed — escalating to cloud API",
    };
  }

  // Tier 3: cloud escalation
  appendHearthLog({ ts, query_hash, routing: "cloud_escalation", reason: "quality_threshold", quality_score: assessment.score, signals: assessment.signals });
  return {
    routing: "cloud_escalation",
    quality_score: assessment.score,
    quality_signals: assessment.signals,
    substrate_augmented: substrate_hit,
  };
}

// ─── AMPLIFY telemetry ────────────────────────────────────────────────────────

export interface AmplifySnapshot {
  total_queries: number;
  substrate_hits: number;
  local_ollama_served: number;
  cloud_escalations: number;
  substrate_hit_ratio: number;
  local_ratio: number;
  cloud_ratio: number;
  total_cloud_cost_avoided_usd: number;
  total_tokens_saved_est: number;
  as_of: string;
}

export function computeAmplifySnapshot(): AmplifySnapshot {
  const snapshot: AmplifySnapshot = {
    total_queries: 0, substrate_hits: 0, local_ollama_served: 0, cloud_escalations: 0,
    substrate_hit_ratio: 0, local_ratio: 0, cloud_ratio: 0,
    total_cloud_cost_avoided_usd: 0, total_tokens_saved_est: 0,
    as_of: new Date().toISOString(),
  };
  try {
    if (!existsSync(AMPLIFY_LOG_PATH)) return snapshot;
    const lines = readFileSync(AMPLIFY_LOG_PATH, "utf-8").trim().split("\n").filter(Boolean);
    for (const line of lines) {
      try {
        const entry = JSON.parse(line) as { routing: string; cloud_cost_avoided_usd?: number; tokens_saved_est?: number };
        snapshot.total_queries++;
        if (entry.routing === "substrate_hit") snapshot.substrate_hits++;
        else if (entry.routing === "local_ollama") snapshot.local_ollama_served++;
        else snapshot.cloud_escalations++;
        snapshot.total_cloud_cost_avoided_usd += entry.cloud_cost_avoided_usd ?? 0;
        snapshot.total_tokens_saved_est += entry.tokens_saved_est ?? 0;
      } catch { /* skip malformed */ }
    }
    if (snapshot.total_queries > 0) {
      snapshot.substrate_hit_ratio = Math.round(snapshot.substrate_hits / snapshot.total_queries * 100) / 100;
      snapshot.local_ratio = Math.round(snapshot.local_ollama_served / snapshot.total_queries * 100) / 100;
      snapshot.cloud_ratio = Math.round(snapshot.cloud_escalations / snapshot.total_queries * 100) / 100;
    }
  } catch { /* non-fatal */ }
  return snapshot;
}
