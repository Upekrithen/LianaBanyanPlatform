/**
 * Prophet Circuit — Pheromone Emitter
 * Emits Prophet Circuit events to pheromone substrate for SCR-compliant trail.
 * K31 (LB-STACK-0195) — Bushel 79 BP034.
 */

import { emitPheromone } from "../scribes/pheromone.js";

export type ProphetEvent =
  | "DETECT"
  | "PROJECT"
  | "CLASSIFY"
  | "FORECAST";

export function emitProphetPheromone(
  event: ProphetEvent,
  entityId: string,
  confidence: number,
): void {
  try {
    const content = [
      `prophet_${event.toLowerCase()}`,
      `entity:${entityId}`,
      `confidence:${confidence.toFixed(3)}`,
    ].join(" | ");

    emitPheromone("prophet_circuit", entityId, content, {
      cathedral: "knight",
      synthesisClass: `prophet_${event.toLowerCase()}`,
      ts: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}
