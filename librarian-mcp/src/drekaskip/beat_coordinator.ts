/**
 * Drekaskip Wave Generator — Beat Coordinator (Bushel 61A)
 * Synchronized fan-out: stagger axis launches by beat_offset_ms.
 * Each axis launches a triad (3 SEG instances) per Skulk B36 P3 spec.
 *
 * K30 §10 composability: K30 with discard_threshold=Infinity (Wave Generator).
 * Commit ref: 03e6337 (K30 Contingency Operator, LB-STACK-0185).
 */

import { EventEmitter } from "node:events";
import type { AxisState, BeatEvent, SegInstance, Wave } from "./types.js";

export type BeatEmitter = EventEmitter & {
  emit(event: "beat", data: BeatEvent): boolean;
  on(event: "beat", listener: (data: BeatEvent) => void): BeatEmitter;
};

/** Create a fresh SEG instance for a triad slot. */
function createSeg(axisName: string, slot: 0 | 1 | 2, waveId: string): SegInstance {
  return {
    seg_id: `${waveId}:${axisName}:seg${slot}`,
    axis_name: axisName,
    triad_slot: slot,
    status: "pending",
    start_time_ms: null,
    end_time_ms: null,
    output: null,
  };
}

/** Create an axis state with 3 SEG instances. */
export function createAxisState(axisName: string, waveId: string): AxisState {
  return {
    axis_name: axisName,
    triad_segs: [
      createSeg(axisName, 0, waveId),
      createSeg(axisName, 1, waveId),
      createSeg(axisName, 2, waveId),
    ],
    status: "pending",
    merge_output: null,
    start_time_ms: null,
    end_time_ms: null,
  };
}

/**
 * Simulate a single SEG execution.
 * In production, this would dispatch to a real AI API.
 * Execution time models realistic async I/O variance.
 */
async function runSeg(seg: SegInstance, timeoutMs: number): Promise<void> {
  seg.status = "running";
  seg.start_time_ms = Date.now();

  // Simulate SEG work: normally distributed execution time
  const baseMs = 80 + Math.random() * 120;  // 80–200ms per SEG
  const actualMs = Math.min(baseMs, timeoutMs);

  await new Promise<void>(resolve => setTimeout(resolve, actualMs));

    if ((seg.status as string) !== "running") return;  // cancelled by timeout guard

  seg.status = "complete";
  seg.end_time_ms = Date.now();
  seg.output = `[${seg.axis_name}:slot${seg.triad_slot}] research synthesis complete at ${new Date().toISOString()}`;
}

/**
 * Run a full axis triad: launch 3 SEG instances in parallel.
 * Applies per-axis timeout from wave budget.
 * Returns when all 3 SEGs complete or timeout fires.
 */
async function runAxisTriad(axis: AxisState, timeoutMs: number): Promise<void> {
  axis.status = "running";
  axis.start_time_ms = Date.now();

  const timeoutHandle = setTimeout(() => {
    for (const seg of axis.triad_segs) {
      if (seg.status === "running" || seg.status === "pending") {
        seg.status = "timed_out";
        seg.end_time_ms = Date.now();
      }
    }
    axis.status = "timed_out";
    axis.end_time_ms = Date.now();
  }, timeoutMs);

  await Promise.allSettled(axis.triad_segs.map(seg => runSeg(seg, timeoutMs)));

  clearTimeout(timeoutHandle);
  if ((axis.status as string) !== "timed_out") {
    axis.status = "merged";
    axis.end_time_ms = Date.now();
    const completedOutputs = axis.triad_segs
      .filter(s => s.output !== null)
      .map(s => s.output!);
    axis.merge_output = completedOutputs.join(" | ");
  }
}

/**
 * Synchronized fan-out across all axes.
 * Stagger axis launches by beat_offset_ms; all race to finish.
 * K30 §10 wave config: discard_threshold=Infinity (never discard).
 */
export async function fanOut(
  wave: Wave,
  emitter: BeatEmitter,
): Promise<void> {
  const beatOffset = wave.config.beat_offset_ms ?? 50;
  const timeoutMs = wave.config.budget.timeout_s * 1000;
  const axes = wave.axes;

  // Beat: start
  emitter.emit("beat", {
    event: "wave:beat:start",
    wave_id: wave.wave_id,
    total_axes: axes.length,
    ts: new Date().toISOString(),
  });

  const axisPromises: Promise<void>[] = [];

  for (let i = 0; i < axes.length; i++) {
    const axis = axes[i];

    // Staggered launch
    const staggeredPromise = new Promise<void>(resolve => {
      setTimeout(() => {
        emitter.emit("beat", {
          event: "wave:beat:axis_launched",
          wave_id: wave.wave_id,
          axis_name: axis.axis_name,
          axis_index: i,
          total_axes: axes.length,
          ts: new Date().toISOString(),
        });
        runAxisTriad(axis, timeoutMs).then(resolve);
      }, i * beatOffset);
    });

    axisPromises.push(staggeredPromise);
  }

  // All axes race to finish (discard_threshold: Infinity — never drop any)
  await Promise.all(axisPromises);

  emitter.emit("beat", {
    event: "wave:beat:all_launched",
    wave_id: wave.wave_id,
    total_axes: axes.length,
    ts: new Date().toISOString(),
  });
}
