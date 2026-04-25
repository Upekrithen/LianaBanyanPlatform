/**
 * Conductor Adapter — Anthropic (Claude)
 * K446a · Phase 1.2 · Innovation #2277
 *
 * Wraps @anthropic-ai/sdk. API key from env: ANTHROPIC_API_KEY.
 * For edge functions, key comes from Supabase edge-function secrets.
 * For local dev, key comes from .env.
 */

import type { ModelCallResult, ModelCallOptions, VendorAdapter } from "./types.js";
import { computeCostUsd } from "./pricing.js";

const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TIMEOUT_MS = 60_000;

export const anthropicAdapter: VendorAdapter = async (
  modelId: string,
  prompt: string,
  options: ModelCallOptions = {},
): Promise<ModelCallResult> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment");
  }

  // Dynamic import to avoid hard dependency when running in environments
  // that don't have @anthropic-ai/sdk installed
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey, timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS });

  const startMs = Date.now();

  const message = await client.messages.create({
    model: modelId,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
    messages: [{ role: "user", content: prompt }],
  });

  const latencyMs = Date.now() - startMs;
  const tokensIn = message.usage.input_tokens;
  const tokensOut = message.usage.output_tokens;
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  return {
    response: responseText,
    latencyMs,
    tokensIn,
    tokensOut,
    costUsd: computeCostUsd(modelId, tokensIn, tokensOut),
    vendor: "anthropic",
    model: modelId,
  };
};
