/**
 * Drekaskip Wave Generator — MCCI Thread Integration (G12, BP034)
 * When B82 (MoneyPenny MCCI) has landed, each wave gets an MCCI thread.
 * If B82 is not yet landed, emit handoff candidates to pending file.
 *
 * MCCI handoff candidates: ~/.claude/state/drekaskip/mcci_handoff_pending.jsonl
 * B82 backfills on landing.
 *
 * G12 deferred-gate: PENDING_DEPENDENCY:B82
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { Wave, WaveReceipt } from "./types.js";

function b82Landed(): boolean {
  return existsSync(resolve(homedir(), ".claude", "state", "mcci", "threads.jsonl"));
}

function ensureDir(filePath: string): void {
  mkdirSync(resolve(filePath, ".."), { recursive: true });
}

function pendingPath(): string {
  return resolve(homedir(), ".claude", "state", "drekaskip", "mcci_handoff_pending.jsonl");
}

/**
 * Emit MCCI handoff candidate for this wave.
 * Structure follows MoneyPenny MCCI thread spec (B82).
 */
export function emitMcciHandoff(wave: Wave, receipt: WaveReceipt): void {
  try {
    const candidate = {
      class: "project",
      wave_id: wave.wave_id,
      saga_id: wave.saga_id,
      anchor: wave.saga_id,
      axes: wave.axes.map(a => ({
        name: a.axis_name,
        status: a.status,
        output_preview: (a.merge_output ?? "").slice(0, 200),
      })),
      synthesis_preview: (wave.synthesis ?? "").slice(0, 3000),
      compressed_3k_summary: buildCompressed3kSummary(wave, receipt),
      receipt_speedup_ratio: receipt.speedup_ratio,
      k30_claim_confirmed: receipt.k30_claim_confirmed,
      b82_pending: !b82Landed(),
      ts: new Date().toISOString(),
    };

    if (b82Landed()) {
      // B82 live: write directly to MCCI thread store
      const threadPath = resolve(homedir(), ".claude", "state", "mcci", "threads.jsonl");
      appendFileSync(threadPath, JSON.stringify(candidate) + "\n");
    } else {
      // B82 pending: buffer for backfill
      const path = pendingPath();
      ensureDir(path);
      appendFileSync(path, JSON.stringify(candidate) + "\n");
    }
  } catch { /* non-fatal */ }
}

function buildCompressed3kSummary(wave: Wave, receipt: WaveReceipt): string {
  const axesSummary = wave.axes
    .map(a => `  - ${a.axis_name}: ${a.status}`)
    .join("\n");

  return [
    `## Wave: ${wave.wave_id}`,
    `Saga: ${wave.saga_id}`,
    `Status: ${wave.status}`,
    `Axes (${wave.axes.length}):\n${axesSummary}`,
    `Speedup: ${receipt.speedup_ratio.toFixed(3)}x (K30 §10: ${receipt.k30_claim_confirmed ? "CONFIRMED" : "ANOMALY"})`,
    `Wall-time: ${receipt.t_wave_ms}ms vs serial estimate ${receipt.t_serial_est_ms}ms`,
    `SEGs fired: ${receipt.segs_fired}`,
  ].join("\n");
}
