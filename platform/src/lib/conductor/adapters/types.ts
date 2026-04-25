/**
 * Conductor Adapters — Shared Types
 * K446a · Phase 1.2 · Innovation #2277
 */

export type VendorName = "anthropic" | "openai" | "google" | "perplexity";

export interface ModelCallResult {
  response: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;     // Computed from vendor published pricing (see pricing.ts)
  vendor: VendorName;
  model: string;       // Exact model ID as passed to the vendor API
}

export interface ModelCallOptions {
  maxTokens?: number;        // Default: 1024
  temperature?: number;      // Default: 0.7
  systemPrompt?: string;     // System / instruction context
  timeoutMs?: number;        // Default: 60_000
}

/**
 * Common adapter signature — all four vendor adapters implement this shape.
 * The Conductor router calls exactly this function; vendor specifics are hidden.
 */
export type VendorAdapter = (
  modelId: string,
  prompt: string,
  options?: ModelCallOptions,
) => Promise<ModelCallResult>;
