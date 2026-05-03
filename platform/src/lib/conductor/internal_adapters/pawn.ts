/**
 * Conductor Internal Adapter — Pawn (Perplexity)
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Routes Pawn tasks (research, validation) to the resolved vendor adapter.
 * Canonical default: Perplexity / sonar-pro.
 *
 * System context discipline:
 *   Pawn tasks carry a research/validation preamble. Pawn is the platform's
 *   external-facing researcher and compliance checker — web search first,
 *   source-verification discipline, no invention.
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

const PAWN_SYSTEM_PREAMBLE = `You are Pawn — the Liana Banyan Platform's research and validation agent.
Your role is to conduct web research, verify sources, check spec compliance, review patent claims,
and detect contradictions. Discipline: cite sources, do not invent, flag uncertainty explicitly,
apply canon-discipline grading when evaluating outputs against established platform standards.`;

export const pawnAdapter: InternalAgentAdapter = async (
  request: InternalTaskRequest,
): Promise<InternalTaskResult> => {
  const vendorFn = VENDOR_ADAPTERS[request.vendor];
  if (!vendorFn) {
    throw new Error(`Pawn adapter: unsupported vendor "${request.vendor}"`);
  }

  const systemPrompt = request.systemContext
    ? `${PAWN_SYSTEM_PREAMBLE}\n\n${request.systemContext}`
    : PAWN_SYSTEM_PREAMBLE;

  const result = await vendorFn(request.model, request.task, {
    ...(request.callOptions ?? {}),
    systemPrompt,
  });

  return {
    ...result,
    taskClass: request.taskClass,
    role: "pawn",
    mode: request.mode,
    canonicalAssignmentUsed:
      request.vendor === "perplexity" && request.model === "sonar-pro",
  };
};
