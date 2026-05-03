/**
 * Conductor Internal Adapter — Bishop (Opus)
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Routes Bishop tasks (canon substrate keeping, foreman coordination) to the
 * resolved vendor adapter. Canonical default: Anthropic / claude-opus-4-7.
 *
 * System context discipline:
 *   Bishop tasks carry an LB canon preamble in the system prompt to ensure
 *   the model has the appropriate canon-discipline context for substrate writes.
 */

import type {
  InternalTaskRequest,
  InternalTaskResult,
  InternalAgentAdapter,
} from "./types.js";
import { anthropicAdapter } from "../adapters/anthropic.js";
import { openaiAdapter } from "../adapters/openai.js";
import { googleAdapter } from "../adapters/google.js";
import { perplexityAdapter } from "../adapters/perplexity.js";
import type { VendorName } from "../adapters/types.js";

const VENDOR_ADAPTERS: Record<VendorName, Parameters<typeof anthropicAdapter>[2] extends infer _O
  ? (modelId: string, prompt: string, options?: Parameters<typeof anthropicAdapter>[2]) => ReturnType<typeof anthropicAdapter>
  : never> = {
  anthropic:  anthropicAdapter,
  openai:     openaiAdapter,
  google:     googleAdapter,
  perplexity: perplexityAdapter,
};

const BISHOP_SYSTEM_PREAMBLE = `You are Bishop — the Liana Banyan Platform's canon steward and foreman agent.
Your role is to maintain canonical substrate integrity, author A&A formals, coordinate Knight/Pawn dispatch,
and close sessions with accurate handoff records. Apply cathedral-discipline: every output must be
consistent with established canon numbers, precedents, and architectural decisions. When in doubt, do not guess — say so.`;

export const bishopAdapter: InternalAgentAdapter = async (
  request: InternalTaskRequest,
): Promise<InternalTaskResult> => {
  const vendorFn = VENDOR_ADAPTERS[request.vendor];
  if (!vendorFn) {
    throw new Error(`Bishop adapter: unsupported vendor "${request.vendor}"`);
  }

  const systemPrompt = request.systemContext
    ? `${BISHOP_SYSTEM_PREAMBLE}\n\n${request.systemContext}`
    : BISHOP_SYSTEM_PREAMBLE;

  const result = await vendorFn(request.model, request.task, {
    ...(request.callOptions ?? {}),
    systemPrompt,
  });

  return {
    ...result,
    taskClass: request.taskClass,
    role: "bishop",
    mode: request.mode,
    canonicalAssignmentUsed:
      request.vendor === "anthropic" && request.model === "claude-opus-4-7",
  };
};
