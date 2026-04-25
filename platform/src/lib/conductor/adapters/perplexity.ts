/**
 * Conductor Adapter — Perplexity (Sonar)
 * K446a · Phase 1.2 · Innovation #2277
 *
 * Uses openai-compat Sonar endpoint at https://api.perplexity.ai.
 * API key from env: PERPLEXITY_API_KEY.
 * Sonar Pro has real-time web retrieval; cost includes search overhead.
 */

import type { ModelCallResult, ModelCallOptions, VendorAdapter } from "./types.js";
import { computeCostUsd } from "./pricing.js";

const PERPLEXITY_BASE_URL = "https://api.perplexity.ai";
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TIMEOUT_MS = 60_000;

export const perplexityAdapter: VendorAdapter = async (
  modelId: string,
  prompt: string,
  options: ModelCallOptions = {},
): Promise<ModelCallResult> => {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("PERPLEXITY_API_KEY is not set in environment");
  }

  // Perplexity is OpenAI-API-compatible — reuse `openai` package with custom base URL
  const { default: OpenAI } = await import("openai");
  const client = new OpenAI({
    apiKey,
    baseURL: PERPLEXITY_BASE_URL,
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  });

  const startMs = Date.now();

  const completion = await client.chat.completions.create({
    model: modelId,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    messages: [
      ...(options.systemPrompt
        ? [{ role: "system" as const, content: options.systemPrompt }]
        : []),
      { role: "user" as const, content: prompt },
    ],
  });

  const latencyMs = Date.now() - startMs;
  const tokensIn = completion.usage?.prompt_tokens ?? 0;
  const tokensOut = completion.usage?.completion_tokens ?? 0;
  const responseText = completion.choices[0]?.message?.content ?? "";

  return {
    response: responseText,
    latencyMs,
    tokensIn,
    tokensOut,
    costUsd: computeCostUsd(modelId, tokensIn, tokensOut),
    vendor: "perplexity",
    model: modelId,
  };
};
