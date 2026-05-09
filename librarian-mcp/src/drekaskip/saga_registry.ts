/**
 * Drekaskip Wave Generator — Saga Registry (Bushel 61A)
 * Persists wave instances and saga records to ~/.claude/state/drekaskip/.
 * Supports crash-recovery on daemon restart (G10).
 *
 * Naming convention (LB-STACK-0196 Drekaskip Wave Riders Canon):
 *   Class:    Drekaskip
 *   Instance: WaveRider-<SagaName>-<ISO>
 *   Saga:     Saga-<Campaign>
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { Wave, SagaRecord } from "./types.js";

function stateDir(): string {
  const dir = resolve(homedir(), ".claude", "state", "drekaskip");
  mkdirSync(resolve(dir, "waves"), { recursive: true });
  mkdirSync(resolve(dir, "sagas"), { recursive: true });
  return dir;
}

function waveFile(waveId: string): string {
  return resolve(stateDir(), "waves", `${waveId}.json`);
}

function sagaFile(sagaId: string): string {
  const safe = sagaId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return resolve(stateDir(), "sagas", `${safe}.json`);
}

/** Generate a wave instance ID per LB-STACK-0196 naming canon. */
export function generateWaveId(sagaId: string): string {
  const sagaShort = sagaId.replace(/^Saga-/, "").replace(/[^a-zA-Z0-9]/g, "-").slice(0, 20);
  const iso = new Date().toISOString().replace(/[:.]/g, "-").replace("Z", "Z");
  return `WaveRider-${sagaShort}-${iso}`;
}

/** Persist a wave to disk (idempotent). */
export function saveWave(wave: Wave): void {
  try {
    stateDir(); // ensure dirs exist
    writeFileSync(waveFile(wave.wave_id), JSON.stringify(wave, null, 2));
  } catch { /* non-fatal */ }
}

/** Load a wave from disk. */
export function loadWave(waveId: string): Wave | null {
  try {
    const path = waveFile(waveId);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as Wave;
  } catch {
    return null;
  }
}

/** Load all waves from disk (crash-recovery). */
export function loadAllWaves(): Wave[] {
  try {
    const dir = resolve(stateDir(), "waves");
    const files = readdirSync(dir).filter(f => f.endsWith(".json"));
    return files.flatMap(f => {
      try {
        return [JSON.parse(readFileSync(resolve(dir, f), "utf8")) as Wave];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}

/** Get or create a saga record. */
export function loadSaga(sagaId: string): SagaRecord {
  try {
    const path = sagaFile(sagaId);
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf8")) as SagaRecord;
    }
  } catch { /* fall through */ }

  return {
    saga_id: sagaId,
    wave_ids: [],
    created_at: new Date().toISOString(),
    last_fire: new Date().toISOString(),
  };
}

/** Register a wave under its saga. */
export function registerWaveInSaga(wave: Wave): void {
  try {
    const saga = loadSaga(wave.saga_id);
    if (!saga.wave_ids.includes(wave.wave_id)) {
      saga.wave_ids.push(wave.wave_id);
    }
    saga.last_fire = wave.created_at;
    writeFileSync(sagaFile(wave.saga_id), JSON.stringify(saga, null, 2));
  } catch { /* non-fatal */ }
}

/** List all saga records. */
export function listAllSagas(): SagaRecord[] {
  try {
    const dir = resolve(stateDir(), "sagas");
    const files = readdirSync(dir).filter(f => f.endsWith(".json"));
    return files.flatMap(f => {
      try {
        return [JSON.parse(readFileSync(resolve(dir, f), "utf8")) as SagaRecord];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
