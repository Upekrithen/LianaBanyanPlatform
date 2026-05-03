/**
 * Conductor Internal Adapter — Knight (Sonnet)
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Routes Knight tasks (authoring, audit, implementation) to the resolved
 * vendor adapter. Canonical default: Anthropic / claude-sonnet-4-6.
 *
 * System context discipline:
 *   Knight tasks carry an engineering-discipline preamble that enforces
 *   platform conventions (TypeScript patterns, no mocks, real adapters).
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

const VENDOR_ADAPTERS: Record<VendorName, typeof anthropicAdapter> = {
  anthropic:  anthropicAdapter,
  openai:     openaiAdapter,
  google:     googleAdapter,
  perplexity: perplexityAdapter,
};

const KNIGHT_SYSTEM_PREAMBLE = `You are Knight — the Liana Banyan Platform's engineering implementation agent.
Your role is to author TypeScript/Python code, build features, audit diffs, run migrations, and deploy.
Platform conventions: no mocks in tests (use real vendor adapters), surgical edits over full rewrites,
read before editing, check lints after changes. Follow existing patterns in platform/src/lib/conductor/.`;

export const knightAdapter: InternalAgentAdapter = async (
  request: InternalTaskRequest,
): Promise<InternalTaskResult> => {
  const vendorFn = VENDOR_ADAPTERS[request.vendor];
  if (!vendorFn) {
    throw new Error(`Knight adapter: unsupported vendor "${request.vendor}"`);
  }

  const systemPrompt = request.systemContext
    ? `${KNIGHT_SYSTEM_PREAMBLE}\n\n${request.systemContext}`
    : KNIGHT_SYSTEM_PREAMBLE;

  const result = await vendorFn(request.model, request.task, {
    ...(request.callOptions ?? {}),
    systemPrompt,
  });

  return {
    ...result,
    taskClass: request.taskClass,
    role: "knight",
    mode: request.mode,
    canonicalAssignmentUsed:
      request.vendor === "anthropic" && request.model === "claude-sonnet-4-6",
  };
};
