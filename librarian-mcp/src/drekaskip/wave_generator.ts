/**
 * Drekaskip Wave Generator — Core (Bushel 61A / LB-STACK-0243)
 * Thin wrapper around K30 Contingency Operator (LB-STACK-0185, commit 03e6337).
 *
 * K30 §10 composability claim — Wave Generator is K30 with:
 *   discard_threshold: Infinity    (never discard — race-to-finish mode)
 *   merge_policy: 'fan_in_synthesize'
 *   budget: { max_segs: 12, timeout_s: 180 }
 *   axes: ['research','build','discovery','synthesis']
 *
 * This class instantiates K30 in Wave-Generator mode; it does NOT reimplement
 * branch lifecycle. All fan-out, beat-offset coordination, and fan-in synthesis
 * delegate to the K30 architectural primitives via Drekaskip-specific adapters.
 */

import { EventEmitter } from "node:events";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { Wave, WaveConfig, WaveReceipt, WaveStreamEvent } from "./types.js";
import { createAxisState, fanOut, type BeatEmitter } from "./beat_coordinator.js";
import { synthesize, computeReceipt, countSegs } from "./fan_in_synthesizer.js";
import {
  generateWaveId,
  saveWave,
  loadWave,
  loadAllWaves,
  registerWaveInSaga,
  loadSaga,
  listAllSagas,
} from "./saga_registry.js";
import { emitDispatchSignal, emitMergeSignal, emitAxisSignal } from "./sweat_scribe.js";
import { emitMcciHandoff } from "./mcci_integration.js";

export { loadWave, loadAllWaves, loadSaga, listAllSagas };

/**
 * K30 Wave-Generator configuration block.
 * Cite: K30 §10 composability — "Wave Generator is K30 with discard_threshold=Infinity."
 */
const K30_WAVE_CONFIG = {
  discard_threshold: Infinity,
  merge_policy: "fan_in_synthesize" as const,
};

/** In-memory wave store (crash-recovery: augmented from disk on startup). */
const _waves = new Map<string, Wave>();

/** SSE listeners per wave_id. */
const _listeners = new Map<string, Set<(event: WaveStreamEvent) => void>>();

/** Load all waves from disk into memory (crash-recovery, G10). */
export function initWaveGenerator(): void {
  const persisted = loadAllWaves();
  for (const wave of persisted) {
    if (!_waves.has(wave.wave_id)) {
      // Mark in-flight waves as aborted (cannot resume across restart)
      if (wave.status === "running" || wave.status === "synthesizing") {
        wave.status = "aborted";
        saveWave(wave);
      }
      _waves.set(wave.wave_id, wave);
    }
  }
}

function broadcastEvent(waveId: string, event: WaveStreamEvent): void {
  const listeners = _listeners.get(waveId);
  if (!listeners) return;
  for (const fn of listeners) {
    try { fn(event); } catch { /* non-fatal */ }
  }
}

/** Subscribe to real-time events for a wave (SSE/WS stream). */
export function subscribeToWave(waveId: string, fn: (event: WaveStreamEvent) => void): () => void {
  if (!_listeners.has(waveId)) _listeners.set(waveId, new Set());
  _listeners.get(waveId)!.add(fn);
  return () => _listeners.get(waveId)?.delete(fn);
}

/**
 * Dispatch a new wave.
 * Implements K30 §10: SPECULATE fan-out across axes with discard_threshold=Infinity.
 */
export async function dispatchWave(config: WaveConfig): Promise<Wave> {
  const waveId = generateWaveId(config.saga_id);

  // Budget check
  const totalSegs = config.axes.length * 3;  // triad per axis
  if (totalSegs > config.budget.max_segs) {
    const wave: Wave = {
      wave_id: waveId,
      saga_id: config.saga_id,
      config,
      status: "aborted",
      axes: [],
      created_at: new Date().toISOString(),
      launched_at: null,
      completed_at: null,
      synthesis: null,
      receipt: null,
      segs_fired: 0,
      budget_exceeded: true,
      budget_exceeded_reason: "max_segs",
    };
    _waves.set(waveId, wave);
    saveWave(wave);
    registerWaveInSaga(wave);
    return wave;
  }

  // SPECULATE: create all axis states (K30 wave-mode with discard_threshold=Infinity)
  const axes = config.axes.map(name => createAxisState(name, waveId));

  const wave: Wave = {
    wave_id: waveId,
    saga_id: config.saga_id,
    config,
    status: "pending",
    axes,
    created_at: new Date().toISOString(),
    launched_at: null,
    completed_at: null,
    synthesis: null,
    receipt: null,
    segs_fired: 0,
    budget_exceeded: false,
  };

  _waves.set(waveId, wave);
  saveWave(wave);
  registerWaveInSaga(wave);

  // G11: Sweat Scribe dispatch signal
  emitDispatchSignal(wave);

  // Launch async (non-blocking so HTTP response returns wave_id immediately)
  setImmediate(() => runWave(wave));

  return wave;
}

/** Execute the wave lifecycle (async, post-dispatch). */
async function runWave(wave: Wave): Promise<void> {
  wave.status = "running";
  wave.launched_at = new Date().toISOString();
  saveWave(wave);

  broadcastEvent(wave.wave_id, {
    event: "wave:launched",
    data: { wave_id: wave.wave_id, axes: wave.axes.map(a => a.axis_name) },
    ts: new Date().toISOString(),
  });

  const waveStartMs = Date.now();

  // Beat coordinator — G3: synchronized fan-out
  const emitter = new EventEmitter() as BeatEmitter;
  emitter.on("beat", (data) => {
    saveWave(wave);
    broadcastEvent(wave.wave_id, {
      event: data.event,
      data: data as unknown as Record<string, unknown>,
      ts: new Date().toISOString(),
    });
  });

  // G3: fan-out with beat stagger; all race (K30 discard_threshold=Infinity)
  await fanOut(wave, emitter);

  // G5: budget enforcement post-fanout
  wave.segs_fired = countSegs(wave.axes);
  if (wave.segs_fired > wave.config.budget.max_segs) {
    wave.budget_exceeded = true;
    wave.budget_exceeded_reason = "max_segs";
  }

  // G11: per-axis signals
  for (const axis of wave.axes) {
    if (axis.start_time_ms !== null && axis.end_time_ms !== null) {
      emitAxisSignal(wave, axis.axis_name, axis.end_time_ms - axis.start_time_ms);
    }
  }

  // G4: fan-in synthesis (K30 merge_policy: fan_in_synthesize)
  wave.status = "synthesizing";
  broadcastEvent(wave.wave_id, {
    event: "merge:synthesize",
    data: { wave_id: wave.wave_id, axes_count: wave.axes.length },
    ts: new Date().toISOString(),
  });

  wave.synthesis = synthesize(wave);

  // G6: empirical receipt
  const receipt = computeReceipt(wave, waveStartMs);
  wave.receipt = receipt;
  wave.status = "complete";
  wave.completed_at = new Date().toISOString();
  saveWave(wave);

  // G9: anomaly flag if K30 §10 claim violated
  if (!receipt.k30_claim_confirmed) {
    broadcastEvent(wave.wave_id, {
      event: "k30_claim_anomaly",
      data: { wave_id: wave.wave_id, speedup_ratio: receipt.speedup_ratio, context: "speedup_ratio >= 1.0" },
      ts: new Date().toISOString(),
    });
  }

  // Write receipt to ~/.claude/state/drekaskip/waves/ (G10)
  persistReceipt(wave, receipt);

  // G11: Sweat Scribe merge signal
  emitMergeSignal(wave, receipt);

  // G12: MCCI thread integration
  emitMcciHandoff(wave, receipt);

  broadcastEvent(wave.wave_id, {
    event: "wave:complete",
    data: {
      wave_id: wave.wave_id,
      speedup_ratio: receipt.speedup_ratio,
      k30_claim_confirmed: receipt.k30_claim_confirmed,
      segs_fired: wave.segs_fired,
    },
    ts: new Date().toISOString(),
  });
}

function persistReceipt(wave: Wave, receipt: WaveReceipt): void {
  try {
    const dir = resolve(homedir(), ".claude", "state", "drekaskip", "waves");
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, `${wave.wave_id}.receipt.json`), JSON.stringify(receipt, null, 2));
  } catch { /* non-fatal */ }
}

/** Get a wave by ID. */
export function getWave(waveId: string): Wave | null {
  return _waves.get(waveId) ?? loadWave(waveId);
}

/** Get branch states for GET /wave/:id/status. */
export function getWaveStatus(waveId: string): {
  wave_id: string;
  status: string;
  axes: Array<{ name: string; status: string; segs: Array<{ id: string; status: string }> }>;
  merge_status: string;
  receipt: WaveReceipt | null;
} | null {
  const wave = getWave(waveId);
  if (!wave) return null;

  return {
    wave_id: wave.wave_id,
    status: wave.status,
    axes: wave.axes.map(a => ({
      name: a.axis_name,
      status: a.status,
      segs: a.triad_segs.map(s => ({ id: s.seg_id, status: s.status })),
    })),
    merge_status: wave.status === "complete" ? "synthesized" : wave.status,
    receipt: wave.receipt ?? null,
  };
}

/** Recent wave activity summary for /healthz. */
export function getActivitySummary(): {
  total_waves: number;
  complete: number;
  running: number;
  aborted: number;
  last_wave_id: string | null;
} {
  const all = [..._waves.values()];
  return {
    total_waves: all.length,
    complete: all.filter(w => w.status === "complete").length,
    running: all.filter(w => w.status === "running" || w.status === "synthesizing").length,
    aborted: all.filter(w => w.status === "aborted").length,
    last_wave_id: all.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.wave_id ?? null,
  };
}
