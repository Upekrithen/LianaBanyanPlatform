/**
 * Conductor Internal Adapters — Index
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Exports all three agent-role adapters + dispatch helper.
 * The dispatch helper routes an InternalTaskRequest to the correct adapter
 * based on the classified agent role.
 */

export { bishopAdapter } from "./bishop.js";
export { knightAdapter } from "./knight.js";
export { pawnAdapter } from "./pawn.js";
export type { InternalTaskRequest, InternalTaskResult, InternalAgentAdapter } from "./types.js";

import { bishopAdapter } from "./bishop.js";
import { knightAdapter } from "./knight.js";
import { pawnAdapter } from "./pawn.js";
import type { InternalTaskRequest, InternalTaskResult } from "./types.js";
import type { AgentRole } from "../internal_classifier.js";

const ROLE_ADAPTERS: Record<AgentRole, (req: InternalTaskRequest) => Promise<InternalTaskResult>> = {
  bishop: bishopAdapter,
  knight: knightAdapter,
  pawn:   pawnAdapter,
};

/**
 * Dispatch an internal task to the correct agent-role adapter.
 * Wraps the three-adapter map; caller does not need to inspect role manually.
 */
export async function dispatchInternalTask(
  request: InternalTaskRequest,
): Promise<InternalTaskResult> {
  const adapter = ROLE_ADAPTERS[request.role];
  if (!adapter) {
    throw new Error(`No internal adapter registered for role "${request.role}"`);
  }
  return adapter(request);
}
