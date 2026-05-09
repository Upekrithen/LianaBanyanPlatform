/**
 * Drekaskip Wave Generator — MCP Tool Implementations (Bushel 61A)
 * Exposes three MCP tools:
 *   mcp__drekaskip__wave_dispatch — fire a wave with saga naming
 *   mcp__drekaskip__saga_query   — query all wave instances under a saga
 *   mcp__drekaskip__saga_list    — list all sagas
 *
 * These tools integrate with the running Drekaskip daemon (port 7461)
 * or operate directly against the saga registry if the daemon is down.
 */

import { dispatchWave, getWave, loadSaga, listAllSagas } from "./wave_generator.js";
import type { WaveConfig } from "./types.js";

export interface McciWaveDispatchInput {
  saga_id: string;
  axes: string[];
  budget: { max_segs: number; timeout_s: number };
  beat_offset_ms?: number;
}

export interface McciSagaQueryInput {
  saga_id: string;
}

/** mcp__drekaskip__wave_dispatch — Fire a wave with saga naming. */
export async function tool_wave_dispatch(input: McciWaveDispatchInput): Promise<{
  wave_id: string;
  saga_id: string;
  status: string;
  message: string;
}> {
  const config: WaveConfig = {
    saga_id: input.saga_id,
    axes: input.axes,
    budget: input.budget,
    beat_offset_ms: input.beat_offset_ms,
  };

  const wave = await dispatchWave(config);

  return {
    wave_id: wave.wave_id,
    saga_id: wave.saga_id,
    status: wave.status,
    message: wave.budget_exceeded
      ? `Wave aborted: budget exceeded (${wave.budget_exceeded_reason})`
      : `Wave dispatched. ${wave.axes.length} axes × 3 SEGs = ${wave.axes.length * 3} total SEGs. K30 §10 race-to-finish mode active.`,
  };
}

/** mcp__drekaskip__saga_query — Query all wave instances under a saga. */
export async function tool_saga_query(input: McciSagaQueryInput): Promise<{
  saga_id: string;
  wave_count: number;
  waves: Array<{
    wave_id: string;
    fire_time: string;
    complete_time: string | null;
    speedup_ratio: number | null;
    segs_fired: number;
    status: string;
  }>;
}> {
  const saga = loadSaga(input.saga_id);

  const waves = saga.wave_ids.map(waveId => {
    const wave = getWave(waveId);
    return {
      wave_id: waveId,
      fire_time: wave?.launched_at ?? wave?.created_at ?? "unknown",
      complete_time: wave?.completed_at ?? null,
      speedup_ratio: wave?.receipt?.speedup_ratio ?? null,
      segs_fired: wave?.segs_fired ?? 0,
      status: wave?.status ?? "unknown",
    };
  });

  return {
    saga_id: saga.saga_id,
    wave_count: waves.length,
    waves,
  };
}

/** mcp__drekaskip__saga_list — List all sagas. */
export async function tool_saga_list(): Promise<Array<{
  saga_id: string;
  wave_count: number;
  last_fire: string;
}>> {
  const sagas = listAllSagas();
  return sagas.map(s => ({
    saga_id: s.saga_id,
    wave_count: s.wave_ids.length,
    last_fire: s.last_fire,
  }));
}
