/**
 * Conductor Adapter — Google (Gemini)
 * K446a · Phase 1.2 · Innovation #2277
 *
 * Wraps @google/genai. API key from env: GEMINI_API_KEY.
 */

import type { ModelCallResult, ModelCallOptions, VendorAdapter } from "./types.js";
import { computeCostUsd } from "./pricing.js";

const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TIMEOUT_MS = 60_000;

export const googleAdapter: VendorAdapter = async (
  modelId: string,
  prompt: string,
  options: ModelCallOptions = {},
): Promise<ModelCallResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }

  const { GoogleGenAI } = await import("@google/genai");
  const genAI = new GoogleGenAI({ apiKey });

  const startMs = Date.now();

  const fullPrompt = options.systemPrompt
    ? `${options.systemPrompt}\n\n${prompt}`
    : prompt;

  const response = await genAI.models.generateContent({
    model: modelId,
    contents: fullPrompt,
    config: {
      maxOutputTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    },
  });

  const latencyMs = Date.now() - startMs;

  const responseText = response.text ?? "";
  const tokensIn = response.usageMetadata?.promptTokenCount ?? 0;
  const tokensOut = response.usageMetadata?.candidatesTokenCount ?? 0;

  return {
    response: responseText,
    latencyMs,
    tokensIn,
    tokensOut,
    costUsd: computeCostUsd(modelId, tokensIn, tokensOut),
    vendor: "google",
    model: modelId,
  };
};
