/**
 * Contingency Operator — Eblit Emitter
 * Writes discard/pursue/merge events to the A+F Ledger.
 * K30 (LB-STACK-0185) — Bushel 74 BP032.
 */

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

function ebletDir(): string {
  const dir = resolve(homedir(), ".lb-session", "contingency_operator");
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function emitDiscardEblit(branchId: string, accuracy: number, session: string): void {
  try {
    const entry = JSON.stringify({
      event: "branch_discard",
      branch_id: branchId,
      accuracy_at_discard: accuracy,
      session,
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ebletDir(), "discard_ledger.jsonl"), entry + "\n");
  } catch { /* non-fatal */ }
}

export function emitPursueEblit(branchId: string, bonusSteps: number, session: string): void {
  try {
    const entry = JSON.stringify({
      event: "branch_pursue",
      branch_id: branchId,
      bonus_steps: bonusSteps,
      session,
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ebletDir(), "pursue_ledger.jsonl"), entry + "\n");
  } catch { /* non-fatal */ }
}

export function emitMergeEblit(winnerId: string, loserId: string, session: string): void {
  try {
    const entry = JSON.stringify({
      event: "branch_merge",
      winner_id: winnerId,
      loser_id: loserId,
      session,
      ts: new Date().toISOString(),
    });
    appendFileSync(resolve(ebletDir(), "merge_ledger.jsonl"), entry + "\n");
  } catch { /* non-fatal */ }
}
