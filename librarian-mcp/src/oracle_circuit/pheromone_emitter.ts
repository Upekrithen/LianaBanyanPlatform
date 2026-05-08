/**
 * Oracle Circuit — Pheromone Emitter
 * Emits pheromone signals on oracle_flip events.
 * K29 (LB-STACK-0184) — Bushel 73 BP032.
 */

import type { OracleFlipEvent } from "./types.js";
import { emitPheromone } from "../scribes/pheromone.js";

/**
 * Emit a pheromone signal when an Oracle Circuit fires a flip-the-script action.
 * Content format: oracle_flip | circuit:<id> | axis:<n> | new_state summary
 */
export function emitOracleFlip(event: OracleFlipEvent): void {
  try {
    const content = [
      "oracle_flip",
      `circuit_id:${event.circuit_id}`,
      `axis_triggered:${event.axis_triggered}`,
      `new_state:${JSON.stringify(event.new_state).slice(0, 200)}`,
    ].join(" | ");
    emitPheromone("oracle_circuit", event.circuit_id, content, {
      cathedral: "knight",
      synthesisClass: "oracle_flip",
      ts: event.timestamp,
    });
  } catch {
    // Non-fatal; pheromone emission best-effort
  }
}
