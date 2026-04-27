/**
 * Conductor Context Windows — Token-Budget Overflow Handling
 * K525 · Phase A.3 · Innovation #2277
 *
 * Models have finite context windows. If a member query (with substrate
 * attached) exceeds the model's context window, the call will fail or be
 * truncated. The router needs to know which models can fit which prompt sizes
 * BEFORE routing, then demote the unfit ones from the candidate set.
 *
 * This module is a pure registry: hand-curated context-window sizes for every
 * model in the rankings table, plus a `getModelsThatFit()` helper.
 *
 * Sources (verified 2026-04-27):
 *   Anthropic Claude 4.x family   — 200K input, 64K output (200K context)
 *   OpenAI GPT-5 family           — 1M input (announced; 200K conservative used)
 *   OpenAI GPT-5-4-mini           — 128K context window
 *   Google Gemini 2.5 Pro/Flash   — 1M context window
 *   Perplexity sonar-pro          — 200K context window (with web-augmented retrieval)
 *
 * NOTE: Vendor docs sometimes distinguish "context window" (input + output) vs
 * "input window". This registry uses TOTAL context window (the conservative
 * figure for routing decisions). When R15 lands, treat these as defaults that
 * can be overridden per-call by adapter telemetry.
 */

import type { ModelVendorPair } from "./rankings.js";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export interface ContextWindow {
  modelId: string;
  /** Max input + output tokens (whichever is the binding constraint). */
  maxTokens: number;
  /** Conservative output reservation; the router subtracts this from maxTokens
   *  when checking input-fit so that responses don't get truncated.            */
  outputReserve: number;
  note?: string;
}

export const CONTEXT_WINDOWS: ContextWindow[] = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  { modelId: "claude-haiku-4-5",   maxTokens: 200_000, outputReserve: 4_000,
    note: "200K context, 4K output reserve" },
  { modelId: "claude-sonnet-4-6",  maxTokens: 200_000, outputReserve: 8_000,
    note: "200K context, 8K output reserve" },
  { modelId: "claude-opus-4-7",    maxTokens: 200_000, outputReserve: 16_000,
    note: "200K context, 16K output reserve" },

  // ── OpenAI ────────────────────────────────────────────────────────────────
  { modelId: "gpt-5-4-mini",       maxTokens: 128_000, outputReserve: 4_000,
    note: "128K context (smaller than flagship)" },
  { modelId: "gpt-5-5",            maxTokens: 200_000, outputReserve: 8_000,
    note: "200K conservative (vendor advertises larger)" },
  { modelId: "gpt-4o",             maxTokens: 128_000, outputReserve: 4_000,
    note: "128K context (legacy/R11 condition only)" },

  // ── Google ────────────────────────────────────────────────────────────────
  { modelId: "gemini-2-5-flash",   maxTokens: 1_000_000, outputReserve: 8_000,
    note: "1M context window" },
  { modelId: "gemini-2-5-pro",     maxTokens: 1_000_000, outputReserve: 8_000,
    note: "1M context window" },

  // ── Perplexity ────────────────────────────────────────────────────────────
  { modelId: "sonar-pro",          maxTokens: 200_000, outputReserve: 4_000,
    note: "200K context plus web-augmented retrieval" },
];

const MODEL_LOOKUP = new Map(CONTEXT_WINDOWS.map((cw) => [cw.modelId, cw]));

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Conservative fallback context window when a model is missing from registry. */
const FALLBACK_WINDOW: ContextWindow = {
  modelId: "_unknown",
  maxTokens: 128_000,
  outputReserve: 4_000,
  note: "Fallback for models missing from registry",
};

/** Look up the context window for a model. Falls back to a conservative
 *  128K window if the model is unknown — caller should still treat the
 *  result as advisory, since the actual API call will reject overflow. */
export function getContextWindow(modelId: string): ContextWindow {
  return MODEL_LOOKUP.get(modelId) ?? FALLBACK_WINDOW;
}

/** True if a model can fit `inputTokens` of input given its outputReserve. */
export function modelFits(modelId: string, inputTokens: number): boolean {
  const cw = getContextWindow(modelId);
  return inputTokens + cw.outputReserve <= cw.maxTokens;
}

/**
 * Filter a ranking list to models whose context windows can accommodate the
 * given input-token budget. Preserves original ordering. Returns:
 *
 *   - `fit`: models that fit, in original ranking order
 *   - `demoted`: models that did NOT fit, with their context window for logging
 *
 * The router uses this to apply token-budget overflow demotion before the
 * cost-optimization step. If `fit` is empty, the router falls back to
 * the conservative default and logs `mode: "token_overflow_no_fit"`.
 */
export function filterByTokenBudget(
  ranking: ModelVendorPair[],
  inputTokens: number,
): {
  fit: ModelVendorPair[];
  demoted: Array<{ vendor: string; model: string; maxTokens: number }>;
} {
  const fit: ModelVendorPair[] = [];
  const demoted: Array<{ vendor: string; model: string; maxTokens: number }> = [];

  for (const m of ranking) {
    if (modelFits(m.model, inputTokens)) {
      fit.push(m);
    } else {
      const cw = getContextWindow(m.model);
      demoted.push({ vendor: m.vendor, model: m.model, maxTokens: cw.maxTokens });
    }
  }
  return { fit, demoted };
}
