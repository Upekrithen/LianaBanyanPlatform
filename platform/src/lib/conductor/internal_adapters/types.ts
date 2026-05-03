/**
 * Conductor Internal Adapters — Shared Types
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Types for the Bishop/Knight/Pawn adapter layer.
 * Each agent-role adapter maps an internal task to the correct vendor adapter.
 */

import type { VendorName, ModelCallResult, ModelCallOptions } from "../adapters/types.js";
import type { InternalTaskClass, AgentRole } from "../internal_classifier.js";
import type { InternalConductorMode } from "../internal_router.js";

export type { VendorName, ModelCallResult, ModelCallOptions };

/**
 * An internal task request passed to an agent-role adapter.
 */
export interface InternalTaskRequest {
  /** The task description, prompt, or instruction for the agent. */
  task: string;
  /** Classified task class (pre-classified by the caller). */
  taskClass: InternalTaskClass;
  /** Agent role this request is for. */
  role: AgentRole;
  /** Resolved vendor (from internal_router.ts decision). */
  vendor: VendorName;
  /** Resolved model (from internal_router.ts decision). */
  model: string;
  /** Conductor mode used for this routing decision. */
  mode: InternalConductorMode;
  /** Optional system context injected by the caller. */
  systemContext?: string;
  /** Standard call options forwarded to the underlying vendor adapter. */
  callOptions?: ModelCallOptions;
}

/**
 * Result from an internal task execution via an agent-role adapter.
 * Extends ModelCallResult with routing provenance.
 */
export interface InternalTaskResult extends ModelCallResult {
  taskClass: InternalTaskClass;
  role: AgentRole;
  mode: InternalConductorMode;
  /** true = the canonical-lock/fallback assignment was used (not an auto-deviation). */
  canonicalAssignmentUsed: boolean;
}

/**
 * Agent-role adapter signature — bishop/knight/pawn adapters implement this shape.
 * The internal router calls exactly this function; vendor specifics are hidden.
 */
export type InternalAgentAdapter = (
  request: InternalTaskRequest,
) => Promise<InternalTaskResult>;
