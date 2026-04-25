/**
 * Conductor Adapters — Vendor Pricing Table
 * K446a · Phase 1.2 · Innovation #2277
 *
 * Pricing as of 2026-04-25. Prices in USD per million tokens (input / output).
 * Sources:
 *   Anthropic: https://www.anthropic.com/pricing
 *   OpenAI:    https://platform.openai.com/docs/pricing
 *   Google:    https://ai.google.dev/gemini-api/docs/pricing
 *   Perplexity: https://docs.perplexity.ai/docs/pricing
 *
 * IMPORTANT: Prices shift frequently. Update this table when vendors announce
 * changes. Include the date in the comment for each row. The router uses
 * `costUsd` from ModelCallResult for member-facing cost-delta visibility (#2272).
 */

export interface ModelPricing {
  vendor: string;
  modelId: string;         // Exact model ID used in API calls
  inputPerMillion: number; // USD per 1M input tokens
  outputPerMillion: number;// USD per 1M output tokens
  note?: string;
}

/** Canonical pricing table (2026-04-25). */
export const PRICING_TABLE: ModelPricing[] = [
  // ── Anthropic ─────────────────────────────────────────────────────────────
  {
    vendor: "anthropic",
    modelId: "claude-haiku-4-5",
    inputPerMillion: 0.80,
    outputPerMillion: 4.00,
    note: "Haiku 4.5 — R13 HOT% 90%; cost-per-HOT $0.0157 (cheapest Anthropic tier)",
  },
  {
    vendor: "anthropic",
    modelId: "claude-sonnet-4-6",
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    note: "Sonnet 4.6 — R13 HOT% 86%; mid-tier",
  },
  {
    vendor: "anthropic",
    modelId: "claude-opus-4-7",
    inputPerMillion: 15.00,
    outputPerMillion: 75.00,
    note: "Opus 4.7 — R13 HOT% 98%; cost-per-HOT $0.3140 (flagship Anthropic)",
  },

  // ── OpenAI ────────────────────────────────────────────────────────────────
  {
    vendor: "openai",
    modelId: "gpt-5-4-mini",
    inputPerMillion: 0.30,
    outputPerMillion: 1.20,
    note: "GPT-5.4-mini — R13 HOT% 82%; mid-tier",
  },
  {
    vendor: "openai",
    modelId: "gpt-5-5",
    inputPerMillion: 2.50,
    outputPerMillion: 10.00,
    note: "GPT-5.5 — R13 HOT% 88%; top-tier OpenAI",
  },

  // ── Google ────────────────────────────────────────────────────────────────
  {
    vendor: "google",
    modelId: "gemini-2-5-flash",
    inputPerMillion: 0.075,
    outputPerMillion: 0.30,
    note: "Gemini Flash — R13 HOT% 80%; cost-per-HOT $0.0040 (cheapest cross-vendor)",
  },
  {
    vendor: "google",
    modelId: "gemini-2-5-pro",
    inputPerMillion: 3.50,
    outputPerMillion: 10.50,
    note: "Gemini Pro — R13 HOT% 74%; top-tier Google",
  },

  // ── Perplexity ────────────────────────────────────────────────────────────
  {
    vendor: "perplexity",
    modelId: "sonar-pro",
    inputPerMillion: 3.00,
    outputPerMillion: 15.00,
    note: "Sonar Pro — R13 HOT% 94% (with web search); includes real-time retrieval",
  },
];

/** Look up pricing for a model. Returns null if not in table (caller should handle). */
export function getPricing(modelId: string): ModelPricing | null {
  // Normalize: vendor APIs sometimes return slightly different model ID strings
  const normalized = modelId.toLowerCase().replace(/[_\s]/g, "-");
  return (
    PRICING_TABLE.find(
      (p) =>
        p.modelId === modelId ||
        p.modelId === normalized ||
        normalized.includes(p.modelId),
    ) ?? null
  );
}

/**
 * Compute cost for a model call given token counts.
 * Returns 0 if model not in pricing table (unknown model).
 */
export function computeCostUsd(
  modelId: string,
  tokensIn: number,
  tokensOut: number,
): number {
  const pricing = getPricing(modelId);
  if (!pricing) return 0;
  return (
    (tokensIn * pricing.inputPerMillion + tokensOut * pricing.outputPerMillion) /
    1_000_000
  );
}

/**
 * Compute the dollar-delta between two routing decisions for a given token budget.
 * Used by Phase 4 cost-visibility surface (#2272 Cost-Slasher).
 */
export function computeCostDelta(
  chosenModel: string,
  baselineModel: string,
  tokensIn: number,
  tokensOut: number,
): { chosenCost: number; baselineCost: number; savingsUsd: number } {
  const chosenCost = computeCostUsd(chosenModel, tokensIn, tokensOut);
  const baselineCost = computeCostUsd(baselineModel, tokensIn, tokensOut);
  return {
    chosenCost,
    baselineCost,
    savingsUsd: baselineCost - chosenCost,
  };
}
