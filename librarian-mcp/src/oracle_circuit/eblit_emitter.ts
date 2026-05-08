/**
 * Oracle Circuit — Eblit Emitter
 * Emits Eblit snapshots to A+F Ledger on flip-the-script actions.
 * K29 (LB-STACK-0184) — Bushel 73 BP032.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir as getHomedir } from "node:os";

const AF_LEDGER_DIR = resolve(getHomedir(), ".lb-session", "af_ledger");
const AF_LEDGER_PATH = resolve(AF_LEDGER_DIR, "oracle_circuit_flips.jsonl");

/**
 * Emit an Eblit snapshot to the A+F Ledger on Oracle Circuit flip.
 * Every flip-the-script action MUST produce an Eblit snapshot per G5.
 */
export function emitEblit(
  circuitId: string,
  taskId: string,
  outputs: Record<number, unknown>,
): void {
  try {
    mkdirSync(AF_LEDGER_DIR, { recursive: true });
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      kind: "oracle_circuit_flip",
      circuit_id: circuitId,
      task_id: taskId,
      axes_fired: Object.keys(outputs).map(Number),
      eblit_class: "K29_OracleCircuit_flip",
      stack_row: "LB-STACK-0184",
    }) + "\n";
    appendFileSync(AF_LEDGER_PATH, entry, "utf-8");
  } catch {
    // Non-fatal; ledger write best-effort
  }
}
