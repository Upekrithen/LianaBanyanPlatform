/**
 * Drekaskip Wave Generator — Types (Bushel 61A / LB-STACK-0243)
 * Wave Generator is K30 (LB-STACK-0185, commit 03e6337) with:
 *   discard_threshold: Infinity  (never discard — race-to-finish)
 *   merge_policy: fan_in_synthesize (aggregate ALL completed axes)
 *
 * K30 §10 composability claim: Wave Generator is a K30 special case.
 */

/** Axis = one parallel research/build/discovery branch in the wave. */
export interface WaveAxis {
  name: string;
  triad_segs: 3;          // fixed per Skulk B36 P3 spec
  merge_strategy: "consensus";
}

/** Wave dispatch configuration. */
export interface WaveConfig {
  saga_id: string;
  axes: string[];
  budget: {
    max_segs: number;
    timeout_s: number;
  };
  beat_offset_ms?: number;  // stagger between axis launches (default 50ms)
}

/** Status of a single SEG (Synthetic Execution Group) instance. */
export type SegStatus = "pending" | "running" | "complete" | "timed_out";

/** One SEG instance inside a triad. */
export interface SegInstance {
  seg_id: string;
  axis_name: string;
  triad_slot: 0 | 1 | 2;
  status: SegStatus;
  start_time_ms: number | null;
  end_time_ms: number | null;
  output: string | null;
}

/** State of one axis (contains a triad of SEG instances). */
export interface AxisState {
  axis_name: string;
  triad_segs: [SegInstance, SegInstance, SegInstance];
  status: "pending" | "running" | "merged" | "timed_out";
  merge_output: string | null;
  start_time_ms: number | null;
  end_time_ms: number | null;
}

/** Overall wave status. */
export type WaveStatus = "pending" | "running" | "synthesizing" | "complete" | "aborted";

/** A Wave instance (K30 §10 special case). */
export interface Wave {
  wave_id: string;
  saga_id: string;
  config: WaveConfig;
  status: WaveStatus;
  axes: AxisState[];
  created_at: string;     // ISO timestamp
  launched_at: string | null;
  completed_at: string | null;
  synthesis: string | null;
  receipt: WaveReceipt | null;
  segs_fired: number;
  budget_exceeded: boolean;
  budget_exceeded_reason?: "max_segs" | "timeout";
}

/** Empirical receipt confirming K30 §10 dependent claim. */
export interface WaveReceipt {
  wave_id: string;
  saga_id: string;
  t_wave_ms: number;            // wall-time: launch → merge complete
  t_serial_est_ms: number;      // hypothetical serial: sum of axis durations
  speedup_ratio: number;        // t_wave / t_serial_est (< 1.0 confirms claim)
  axes_count: number;
  segs_fired: number;
  k30_claim_confirmed: boolean; // speedup_ratio < 1.0 for ≥3 axes
  k30_claim_violated?: boolean; // set if ratio >= 1.0
  k30_config: {
    discard_threshold: "Infinity";
    merge_policy: "fan_in_synthesize";
  };
  /** K30 commit ref per §10 composability claim. */
  k30_commit_ref: "03e6337";
  partial_results: boolean;     // true if some axes timed out
}

/** Saga lookup record. */
export interface SagaRecord {
  saga_id: string;
  wave_ids: string[];
  created_at: string;
  last_fire: string;
}

/** Beat event emitted during fan-out. */
export interface BeatEvent {
  event: "wave:beat:start" | "wave:beat:axis_launched" | "wave:beat:all_launched";
  wave_id: string;
  axis_name?: string;
  axis_index?: number;
  total_axes?: number;
  ts: string;
}

/** SSE stream event envelope. */
export interface WaveStreamEvent {
  event: string;
  data: Record<string, unknown>;
  ts: string;
}
