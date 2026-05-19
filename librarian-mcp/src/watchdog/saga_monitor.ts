import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

/**
 * Saga Health Signal - AMPLIFY cooperative substrate
 * Monitors saga execution health across all quality gates
 */
export interface SagaHealthSignal {
  saga_id: string;
  waves_total: number;
  waves_complete: number;
  waves_errored: number;
  segs_done: number;
  segs_errored: number;
  saga_wall_clock_seconds: number;
  wave_wall_clock_seconds?: number; // Average per-wave wall-clock (derived)
  g_saga_1_ok: boolean; // All waves G1-G5 pass
  g_saga_2_ok: boolean; // Wall-clock < 30min
  g_saga_3_ok: boolean; // 0 errors
  g_saga_4_ok: boolean; // Bishop curated synthesis
  health: 'green' | 'yellow' | 'red';
  status?: string; // e.g. 'complete' when all waves done and G-Saga-4 curated
  completed_at?: string; // ISO timestamp when saga reached complete status
  timestamp?: string; // ISO timestamp of last signal update
}

interface WaveMetadata {
  wave_id: string;
  saga_id: string;
  timestamp: number;
  g1_ok?: boolean;
  g2_ok?: boolean;
  g3_ok?: boolean;
  g4_ok?: boolean;
  g5_ok?: boolean;
  segments_done?: number;
  segments_errored?: number;
  errored?: boolean;
}

interface SagaSynthesis {
  saga_id: string;
  bishop_curated: boolean;
  timestamp: number;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_SAGA_WALL_CLOCK_SECONDS = 30 * 60; // 30 minutes
const WAVE_ARCHIVE_PATH = join(homedir(), '.lb_substrate', 'wave_archive');

let sagaHealthCache: Map<string, SagaHealthSignal> = new Map();
let monitorInterval: NodeJS.Timeout | null = null;

/**
 * Parse wave metadata from wave archive files
 */
async function parseWaveMetadata(filePath: string): Promise<WaveMetadata | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data as WaveMetadata;
  } catch (error) {
    console.error(`Failed to parse wave metadata from ${filePath}:`, error);
    return null;
  }
}

/**
 * Parse saga synthesis metadata
 */
async function parseSagaSynthesis(filePath: string): Promise<SagaSynthesis | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data as SagaSynthesis;
  } catch (error) {
    console.error(`Failed to parse saga synthesis from ${filePath}:`, error);
    return null;
  }
}

/**
 * Calculate saga health based on collected metrics
 */
function calculateSagaHealth(
  wavesTotal: number,
  wavesComplete: number,
  wavesErrored: number,
  segsErrored: number,
  wallClockSeconds: number,
  allWavesPassGates: boolean,
  bishopCurated: boolean
): 'green' | 'yellow' | 'red' {
  // Red conditions: errors or wall clock exceeded
  if (wavesErrored > 0 || segsErrored > 0 || wallClockSeconds > MAX_SAGA_WALL_CLOCK_SECONDS) {
    return 'red';
  }

  // Yellow conditions: incomplete or gates failing
  if (!allWavesPassGates || !bishopCurated || wavesComplete < wavesTotal) {
    return 'yellow';
  }

  // Green: all healthy
  return 'green';
}

/**
 * Check if all waves pass G1-G5 gates
 */
function checkAllWavesPassGates(waves: WaveMetadata[]): boolean {
  if (waves.length === 0) return false;

  for (const wave of waves) {
    if (
      !wave.g1_ok ||
      !wave.g2_ok ||
      !wave.g3_ok ||
      !wave.g4_ok ||
      !wave.g5_ok
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Scan wave archive and compute saga health signals
 */
async function scanWaveArchive(): Promise<void> {
  try {
    // Ensure wave archive directory exists
    const dirStat = await stat(WAVE_ARCHIVE_PATH).catch(() => null);
    if (!dirStat || !dirStat.isDirectory()) {
      console.warn(`Wave archive directory not found: ${WAVE_ARCHIVE_PATH}`);
      return;
    }

    const files = await readdir(WAVE_ARCHIVE_PATH);
    const sagaMap: Map<string, WaveMetadata[]> = new Map();
    const sagaSynthesisMap: Map<string, SagaSynthesis> = new Map();

    // Parse all wave files and group by saga_id
    for (const file of files) {
      const filePath = join(WAVE_ARCHIVE_PATH, file);
      const fileStat = await stat(filePath);

      if (!fileStat.isFile()) continue;

      if (file.endsWith('_wave.json')) {
        const metadata = await parseWaveMetadata(filePath);
        if (metadata && metadata.saga_id) {
          if (!sagaMap.has(metadata.saga_id)) {
            sagaMap.set(metadata.saga_id, []);
          }
          sagaMap.get(metadata.saga_id)!.push(metadata);
        }
      } else if (file.endsWith('_synthesis.json')) {
        const synthesis = await parseSagaSynthesis(filePath);
        if (synthesis && synthesis.saga_id) {
          sagaSynthesisMap.set(synthesis.saga_id, synthesis);
        }
      }
    }

    // Compute health signals for each saga
    const newHealthCache: Map<string, SagaHealthSignal> = new Map();

    for (const [sagaId, waves] of sagaMap.entries()) {
      const wavesTotal = waves.length;
      let wavesComplete = 0;
      let wavesErrored = 0;
      let segsTotal = 0;
      let segsErrored = 0;
      let minTimestamp = Infinity;
      let maxTimestamp = 0;

      for (const wave of waves) {
        // Track completion
        if (wave.g5_ok) {
          wavesComplete++;
        }

        // Track errors
        if (wave.errored) {
          wavesErrored++;
        }

        // Track segments
        if (wave.segments_done) {
          segsTotal += wave.segments_done;
        }
        if (wave.segments_errored) {
          segsErrored += wave.segments_errored;
        }

        // Track time range
        if (wave.timestamp < minTimestamp) {
          minTimestamp = wave.timestamp;
        }
        if (wave.timestamp > maxTimestamp) {
          maxTimestamp = wave.timestamp;
        }
      }

      // Calculate wall clock time
      const wallClockSeconds =
        minTimestamp !== Infinity ? (maxTimestamp - minTimestamp) / 1000 : 0;

      // Check quality gates
      const gSaga1Ok = checkAllWavesPassGates(waves);
      const gSaga2Ok = wallClockSeconds < MAX_SAGA_WALL_CLOCK_SECONDS;
      const gSaga3Ok = wavesErrored === 0 && segsErrored === 0;

      // Check Bishop curation
      const synthesis = sagaSynthesisMap.get(sagaId);
      const gSaga4Ok = synthesis?.bishop_curated ?? false;

      // Calculate overall health
      const health = calculateSagaHealth(
        wavesTotal,
        wavesComplete,
        wavesErrored,
        segsErrored,
        wallClockSeconds,
        gSaga1Ok,
        gSaga4Ok
      );

      const waveWallClockSeconds =
        wavesTotal > 0 ? Math.round(wallClockSeconds / wavesTotal) : 0;
      const isComplete = gSaga4Ok && wavesComplete === wavesTotal && wavesTotal > 0;
      const nowIso = new Date().toISOString();

      const signal: SagaHealthSignal = {
        saga_id: sagaId,
        waves_total: wavesTotal,
        waves_complete: wavesComplete,
        waves_errored: wavesErrored,
        segs_done: segsTotal,
        segs_errored: segsErrored,
        saga_wall_clock_seconds: Math.round(wallClockSeconds),
        wave_wall_clock_seconds: waveWallClockSeconds,
        g_saga_1_ok: gSaga1Ok,
        g_saga_2_ok: gSaga2Ok,
        g_saga_3_ok: gSaga3Ok,
        g_saga_4_ok: gSaga4Ok,
        health,
        status: isComplete ? 'complete' : 'in_progress',
        completed_at: isComplete ? synthesis?.timestamp ? new Date(synthesis.timestamp * 1000).toISOString() : nowIso : undefined,
        timestamp: nowIso,
      };

      newHealthCache.set(sagaId, signal);
    }

    // Update cache
    sagaHealthCache = newHealthCache;

    console.log(
      `[SagaMonitor] Scanned ${files.length} files, monitoring ${sagaHealthCache.size} sagas`
    );
  } catch (error) {
    console.error('[SagaMonitor] Error scanning wave archive:', error);
  }
}

/**
 * Initialize saga monitor with periodic polling
 */
export function initSagaMonitor(): void {
  console.log('[SagaMonitor] Initializing saga health monitoring...');

  // Initial scan
  scanWaveArchive().catch((error) => {
    console.error('[SagaMonitor] Initial scan failed:', error);
  });

  // Set up periodic polling
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }

  monitorInterval = setInterval(() => {
    scanWaveArchive().catch((error) => {
      console.error('[SagaMonitor] Periodic scan failed:', error);
    });
  }, POLL_INTERVAL_MS);

  console.log(
    `[SagaMonitor] Monitoring active with ${POLL_INTERVAL_MS / 1000}s poll interval`
  );
}

/**
 * Get health signal for a specific saga
 */
export function getSagaHealth(saga_id: string): SagaHealthSignal | null {
  return sagaHealthCache.get(saga_id) ?? null;
}

/**
 * Get all saga health signals
 */
export function getAllSagaHealthSignals(): SagaHealthSignal[] {
  return Array.from(sagaHealthCache.values());
}

/**
 * Stop saga monitoring
 */
export function stopSagaMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
    console.log('[SagaMonitor] Monitoring stopped');
  }
}
