/**
 * Drekaskip Wave Generator — Fan-In Synthesizer (Bushel 61A)
 * Aggregates all completed axes into a consolidated synthesis artifact.
 * merge_policy: fan_in_synthesize — no branch is discarded.
 *
 * K30 §10: Wave Generator never discards (discard_threshold=Infinity).
 * Even timed-out axes contribute their partial results.
 */

import type { AxisState, Wave, WaveReceipt } from "./types.js";

/**
 * Two-tier merge: per-axis triad consensus → fan-in synthesis.
 * Returns the consolidated markdown artifact.
 */
export function synthesize(wave: Wave): string {
  const sections: string[] = [
    `# Wave Synthesis: ${wave.wave_id}`,
    `**Saga:** ${wave.saga_id}`,
    `**Axes:** ${wave.axes.length}`,
    `**Completed at:** ${new Date().toISOString()}`,
    "",
  ];

  for (const axis of wave.axes) {
    const status = axis.status === "merged" ? "COMPLETE" : axis.status.toUpperCase();
    const completedSegs = axis.triad_segs.filter(s => s.status === "complete").length;

    sections.push(`## Axis: ${axis.axis_name} [${status}]`);
    sections.push(`*Triad: ${completedSegs}/3 SEGs complete*`);

    if (axis.merge_output) {
      sections.push(`\n${axis.merge_output}`);
    } else {
      sections.push(`*(partial result — axis timed out)*`);
    }

    sections.push("");
  }

  sections.push("---");
  sections.push("*Fan-in synthesis complete. All axes included per K30 §10 Wave Generator canon.*");

  return sections.join("\n");
}

/**
 * Compute the empirical receipt confirming K30 §10 dependent claim.
 * Claim: Wave wall-time < serial SEG wall-time for ≥3 axes.
 */
export function computeReceipt(wave: Wave, waveStartMs: number): WaveReceipt {
  const waveEndMs = Date.now();
  const tWaveMs = waveEndMs - waveStartMs;

  // Serial estimate: sum of each axis's actual duration
  let tSerialEstMs = 0;
  let segsTotal = 0;

  for (const axis of wave.axes) {
    const axisDuration = (axis.end_time_ms ?? waveEndMs) - (axis.start_time_ms ?? waveStartMs);
    tSerialEstMs += axisDuration;
    segsTotal += axis.triad_segs.filter(s => s.status === "complete").length;
  }

  const speedupRatio = tSerialEstMs > 0 ? tWaveMs / tSerialEstMs : 1;
  const k30ClaimConfirmed = speedupRatio < 1.0 && wave.axes.length >= 3;
  const partialResults = wave.axes.some(a => a.status === "timed_out");

  const receipt: WaveReceipt = {
    wave_id: wave.wave_id,
    saga_id: wave.saga_id,
    t_wave_ms: tWaveMs,
    t_serial_est_ms: tSerialEstMs,
    speedup_ratio: parseFloat(speedupRatio.toFixed(4)),
    axes_count: wave.axes.length,
    segs_fired: segsTotal,
    k30_claim_confirmed: k30ClaimConfirmed,
    k30_config: {
      discard_threshold: "Infinity",
      merge_policy: "fan_in_synthesize",
    },
    k30_commit_ref: "03e6337",
    partial_results: partialResults,
  };

  if (!k30ClaimConfirmed) {
    receipt.k30_claim_violated = true;
  }

  return receipt;
}

/** Count total SEGs fired across all axes in this wave. */
export function countSegs(axes: AxisState[]): number {
  return axes.reduce((sum, a) => sum + a.triad_segs.filter(s => s.status !== "pending").length, 0);
}
