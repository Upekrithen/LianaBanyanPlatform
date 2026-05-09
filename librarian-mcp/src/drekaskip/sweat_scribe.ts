/**
 * Drekaskip Wave Generator — Sweat Scribe Integration (G11, BP034)
 * Emits effort signals when B80 has landed; otherwise buffers to pending file.
 *
 * Signals appended to:
 *   B80 LIVE:    ~/.claude/state/sweat_scribe/raw_signals.jsonl
 *   B80 PENDING: ~/.claude/state/drekaskip/effort_signals_pending.jsonl
 *
 * G11 deferred-gate: PENDING_DEPENDENCY:B80
 */

import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { Wave, WaveReceipt } from "./types.js";

function b80Landed(): boolean {
  return existsSync(resolve(homedir(), ".claude", "state", "sweat_scribe", "raw_signals.jsonl"));
}

function ensureDir(filePath: string): void {
  const dir = resolve(filePath, "..");
  mkdirSync(dir, { recursive: true });
}

function signalPath(): string {
  if (b80Landed()) {
    return resolve(homedir(), ".claude", "state", "sweat_scribe", "raw_signals.jsonl");
  }
  return resolve(homedir(), ".claude", "state", "drekaskip", "effort_signals_pending.jsonl");
}

/** Emit wave dispatch start signal. */
export function emitDispatchSignal(wave: Wave): void {
  try {
    const path = signalPath();
    ensureDir(path);
    const signal = JSON.stringify({
      source: "drekaskip",
      event: "wave_dispatch_fired",
      wave_id: wave.wave_id,
      saga_id: wave.saga_id,
      axes_count: wave.axes.length,
      b80_pending: !b80Landed(),
      ts: new Date().toISOString(),
    });
    appendFileSync(path, signal + "\n");
  } catch { /* non-fatal */ }
}

/** Emit wave merge complete signal with wall-time + speedup_ratio. */
export function emitMergeSignal(wave: Wave, receipt: WaveReceipt): void {
  try {
    const path = signalPath();
    ensureDir(path);
    const signal = JSON.stringify({
      source: "drekaskip",
      event: "wave_merge_complete",
      wave_id: wave.wave_id,
      saga_id: wave.saga_id,
      t_wave_ms: receipt.t_wave_ms,
      speedup_ratio: receipt.speedup_ratio,
      segs_fired: receipt.segs_fired,
      k30_claim_confirmed: receipt.k30_claim_confirmed,
      b80_pending: !b80Landed(),
      ts: new Date().toISOString(),
    });
    appendFileSync(path, signal + "\n");
  } catch { /* non-fatal */ }
}

/** Emit per-axis SEG completion timing. */
export function emitAxisSignal(wave: Wave, axisName: string, durationMs: number): void {
  try {
    const path = signalPath();
    ensureDir(path);
    const signal = JSON.stringify({
      source: "drekaskip",
      event: "axis_seg_complete",
      wave_id: wave.wave_id,
      axis_name: axisName,
      duration_ms: durationMs,
      b80_pending: !b80Landed(),
      ts: new Date().toISOString(),
    });
    appendFileSync(path, signal + "\n");
  } catch { /* non-fatal */ }
}
