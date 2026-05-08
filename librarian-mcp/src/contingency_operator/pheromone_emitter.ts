/**
 * Contingency Operator — Pheromone Emitter
 * Emits K30 operator events (DISCARD/PURSUE/MERGE) to pheromone substrate.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import type { OperatorCommand } from "./types.js";
import { emitPheromone } from "../scribes/pheromone.js";

export function emitContingencyPheromone(
  command: OperatorCommand,
  branchId: string,
  accuracy: number,
): void {
  try {
    const content = [
      `contingency_${command.toLowerCase()}`,
      `branch:${branchId}`,
      `accuracy:${accuracy.toFixed(3)}`,
    ].join(" | ");

    emitPheromone("contingency_operator", branchId, content, {
      cathedral: "knight",
      synthesisClass: `contingency_${command.toLowerCase()}`,
      ts: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}
