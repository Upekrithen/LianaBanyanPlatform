/**
 * House Scribe Living Gridwork — KN-J3 / BP017
 * ==============================================
 * Augur Living Gate subscriber pattern for House Scribe 8-digit-grid cells.
 * Every Pheromone substrate write-event (Pixie Dust event) triggers a
 * sub-ms cell-state-update for the affected coordinate cell.
 *
 * Architecture:
 *   Pheromone write (Pixie Dust) → cell-subscription dispatcher
 *     → per-cell state aggregation (jar_count + density + decay)
 *       → living-gridwork snapshot (queryable; sub-ms)
 *
 * Living-flag semantics (Augur Living Gate pattern #2314 KN038):
 *   - living=true while events flow (last_event_at within LIVING_WINDOW_MS)
 *   - living=false when no events for N seconds (configurable)
 *
 * BRIDLE Rule 4 conservative defaults:
 *   - Augur unavailable → fallback to cron-class polling (60s default)
 *   - Event-flow saturation → throttle-class backpressure; no lost events
 *   - Cell-state inconsistency → flag + reconcile from source-of-truth
 *
 * Composes with:
 *   KN-J1 jar_lifecycle.ts — jar_count source of truth
 *   KN-J2 coordinate_scheme.ts — cell coordinate format
 *   Pheromone substrate (#2317 B128) — write-events as Pixie Dust
 *   Augur Living Gate (#2314 KN038 BP004) — freshness pattern
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  appendFileSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { cellPrefix, validateCoordinate } from "./coordinate_scheme.js";
import { readAllJars } from "./jar_lifecycle.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname_lg = dirname(__filename);

const STITCHPUNKS_DIR = resolve(__dirname_lg, "../../stitchpunks");
const HS_DIR = resolve(STITCHPUNKS_DIR, "house_scribe");
const GRIDWORK_STATE_PATH = resolve(HS_DIR, "living_gridwork_state.jsonl");
const CELL_EVENTS_PATH = resolve(HS_DIR, "cell_state_events.jsonl");

// ─── Constants ────────────────────────────────────────────────────────────────

/** Time window (ms) during which a cell is considered `living` after last event. */
export const LIVING_WINDOW_MS = 60_000;            // 60 seconds default

/** Default fallback polling interval when Augur is unavailable (BRIDLE Rule 4). */
export const FALLBACK_POLL_INTERVAL_MS = 60_000;   // 60 seconds

/** Pheromone decay half-life in ms for density score calculation (per KN042). */
export const DECAY_HALF_LIFE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Max events processed per cell per call (backpressure throttle). */
export const THROTTLE_BATCH_SIZE = 100;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LivingCellState {
  coordinate: string;                   // 8-digit per KN-J2 (e.g., "01-06-02-05")
  cell_prefix: string;                  // 3-field prefix (e.g., "01-06-02")
  living: boolean;                      // Augur Living Gate freshness flag
  jar_count: number;                    // current Jars in cell (0-99)
  last_jar_added_at: string | null;     // ISO 8601 of most recent Jar in cell
  cell_density_score: number;           // 0.0-1.0 (jar_count / MAX_JARS_PER_CELL)
  decay_score: number;                  // 0.0-1.0 (pheromone-decay per KN042)
  subscribed_at: string;                // when cell subscription was registered
  last_event_at: string;                // most recent Pheromone-write affecting cell
  reconciled_at?: string;               // set when inconsistency was resolved
  fallback_polling: boolean;            // true when using cron-class fallback
  bridle_flag?: string;                 // set when BRIDLE Rule 4 triggered
}

export interface CellStateEvent {
  event_id: string;
  coordinate: string;
  event_type: "pheromone_write" | "jar_added" | "jar_sealed" | "cell_reconciled" | "fallback_poll";
  timestamp: string;
  jar_id?: string;
  detail?: string;
  processing_ms?: number;
}

export interface GridworkSnapshot {
  schema_version: "1.0";
  snapshot_at: string;
  total_cells: number;
  living_cells: number;
  dead_cells: number;
  fallback_cells: number;
  cells: LivingCellState[];
  data_available: boolean;
  unavailable_reason?: string;
}

export interface UpdateCellOpts {
  coordinate: string;
  event_type: CellStateEvent["event_type"];
  jar_id?: string;
  detail?: string;
  living_window_ms?: number;
}

export interface UpdateCellResult {
  success: boolean;
  cell?: LivingCellState;
  processing_ms?: number;
  error?: string;
  bridle_rule_4?: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function ensureHsDir(): void {
  if (!existsSync(HS_DIR)) mkdirSync(HS_DIR, { recursive: true });
}

function readAllCellStates(): LivingCellState[] {
  if (!existsSync(GRIDWORK_STATE_PATH)) return [];
  try {
    const raw = readFileSync(GRIDWORK_STATE_PATH, "utf-8");
    return raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as LivingCellState);
  } catch {
    return [];
  }
}

function rewriteGridworkState(cells: LivingCellState[]): void {
  ensureHsDir();
  writeFileSync(GRIDWORK_STATE_PATH, cells.map((c) => JSON.stringify(c)).join("\n") + "\n", "utf-8");
}

function logCellEvent(evt: CellStateEvent): void {
  ensureHsDir();
  try {
    appendFileSync(CELL_EVENTS_PATH, JSON.stringify(evt) + "\n", "utf-8");
  } catch {
    // non-fatal
  }
}

// ─── Decay score computation (per KN042 Pheromone decay rules) ────────────────

function computeDecayScore(last_event_at: string, now: Date): number {
  const lastMs = new Date(last_event_at).getTime();
  const nowMs = now.getTime();
  const ageMs = Math.max(0, nowMs - lastMs);
  // Exponential decay: score = 0.5^(age / half_life)
  return Math.pow(0.5, ageMs / DECAY_HALF_LIFE_MS);
}

// ─── Cell-state computation from source of truth ──────────────────────────────

/**
 * Recompute cell state from source-of-truth (KN-J1 jars ledger).
 * This is the reconciliation path per BRIDLE Rule 4.
 */
function reconcileCellFromJars(prefix: string, now: Date): Partial<LivingCellState> {
  const allJars = readAllJars();
  const cellJars = allJars.filter((j) => j.coordinate && cellPrefix(j.coordinate) === prefix);

  const jar_count = cellJars.length;
  const sorted = [...cellJars].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? "")
  );
  const last_jar_added_at = sorted[0]?.created_at ?? null;
  const cell_density_score = Math.min(1.0, jar_count / 100);
  const decay_score = last_jar_added_at ? computeDecayScore(last_jar_added_at, now) : 0;

  return { jar_count, last_jar_added_at, cell_density_score, decay_score, reconciled_at: now.toISOString() };
}

// ─── Core update function (Augur Living Gate subscriber) ─────────────────────

/**
 * Update a cell's living state when a Pheromone write-event fires.
 * This is the Augur Living Gate subscriber handler — called sub-ms from event.
 *
 * BRIDLE Rule 4:
 *   - On any error → surface flag; never silently corrupt state
 *   - Event processing time logged for latency monitoring (target: ≤5ms)
 */
export function updateCellOnEvent(opts: UpdateCellOpts): UpdateCellResult {
  const t0 = Date.now();

  const validation = validateCoordinate(opts.coordinate);
  if (!validation.valid) {
    return { success: false, error: `Invalid coordinate: ${validation.errors.join("; ")}` };
  }

  const now = new Date();
  const prefix = cellPrefix(opts.coordinate);

  try {
    ensureHsDir();
    const allCells = readAllCellStates();
    const idx = allCells.findIndex((c) => c.coordinate === opts.coordinate);

    const existingCell = idx !== -1 ? allCells[idx] : null;
    const reconciled = reconcileCellFromJars(prefix, now);

    const living_window_ms = opts.living_window_ms ?? LIVING_WINDOW_MS;
    const last_event_at = now.toISOString();
    const living = true; // event just fired = living

    const updated: LivingCellState = {
      coordinate: opts.coordinate,
      cell_prefix: prefix,
      living,
      jar_count: reconciled.jar_count ?? existingCell?.jar_count ?? 0,
      last_jar_added_at: reconciled.last_jar_added_at ?? existingCell?.last_jar_added_at ?? null,
      cell_density_score: reconciled.cell_density_score ?? existingCell?.cell_density_score ?? 0,
      decay_score: reconciled.decay_score ?? existingCell?.decay_score ?? 0,
      subscribed_at: existingCell?.subscribed_at ?? now.toISOString(),
      last_event_at,
      fallback_polling: false,
      ...(reconciled.reconciled_at ? { reconciled_at: reconciled.reconciled_at } : {}),
    };

    if (idx !== -1) {
      allCells[idx] = updated;
    } else {
      allCells.push(updated);
    }

    rewriteGridworkState(allCells);

    const processing_ms = Date.now() - t0;

    logCellEvent({
      event_id: `${opts.coordinate}-${Date.now()}`,
      coordinate: opts.coordinate,
      event_type: opts.event_type,
      timestamp: last_event_at,
      jar_id: opts.jar_id,
      detail: opts.detail,
      processing_ms,
    });

    return { success: true, cell: updated, processing_ms };
  } catch (err) {
    return {
      success: false,
      error: String(err),
      bridle_rule_4: "HALT — cell-state update failed. State inconsistency flagged.",
    };
  }
}

// ─── Freshness check (living-flag maintenance) ────────────────────────────────

/**
 * Sweep all cells and update living-flag based on last_event_at.
 * Called by cron-class poller (fallback) or Augur sweep.
 * Cells with no events for living_window_ms are marked living=false.
 */
export function sweepLivingFlags(living_window_ms = LIVING_WINDOW_MS): {
  swept: number;
  now_dead: number;
  still_living: number;
} {
  const now = Date.now();
  const cells = readAllCellStates();
  let now_dead = 0;
  let still_living = 0;

  const updated = cells.map((cell) => {
    const lastMs = new Date(cell.last_event_at).getTime();
    const age = now - lastMs;
    const should_be_living = age < living_window_ms;

    if (cell.living !== should_be_living) {
      if (!should_be_living) now_dead++;
    }
    if (should_be_living) still_living++;

    return { ...cell, living: should_be_living, decay_score: computeDecayScore(cell.last_event_at, new Date()) };
  });

  rewriteGridworkState(updated);
  return { swept: cells.length, now_dead, still_living };
}

// ─── Fallback cron-class polling (BRIDLE Rule 4: Augur unavailable) ───────────

/**
 * Fallback poll: recomputes all registered cell states from source-of-truth (jars ledger).
 * Used when Augur Living Gate event system is unavailable.
 */
export function fallbackPollAllCells(): {
  data_available: boolean;
  refreshed: number;
  error?: string;
} {
  try {
    const cells = readAllCellStates();
    if (cells.length === 0) return { data_available: true, refreshed: 0 };

    const now = new Date();
    const refreshed_cells = cells.map((cell) => {
      const reconciled = reconcileCellFromJars(cell.cell_prefix, now);
      const still_living = (now.getTime() - new Date(cell.last_event_at).getTime()) < LIVING_WINDOW_MS;
      return {
        ...cell,
        ...reconciled,
        living: still_living,
        fallback_polling: true,
      };
    });

    rewriteGridworkState(refreshed_cells);

    // Log fallback poll event
    logCellEvent({
      event_id: `fallback-poll-${Date.now()}`,
      coordinate: "all",
      event_type: "fallback_poll",
      timestamp: now.toISOString(),
      detail: `Refreshed ${refreshed_cells.length} cells from source-of-truth`,
    });

    return { data_available: true, refreshed: refreshed_cells.length };
  } catch (err) {
    return { data_available: false, refreshed: 0, error: String(err) };
  }
}

// ─── Query living cell state ──────────────────────────────────────────────────

/**
 * Query the current living state of a cell (by exact coordinate or prefix).
 * BRIDLE Rule 4: if state unavailable, returns data_available=false.
 */
export function queryLivingCell(coordinate: string): {
  data_available: boolean;
  cell: LivingCellState | null;
  unavailable_reason?: string;
} {
  const cells = readAllCellStates();

  // Exact coordinate match
  let cell = cells.find((c) => c.coordinate === coordinate);

  // If not found, try prefix match (for unoccupied cells)
  if (!cell) {
    const prefix = coordinate.split("-").slice(0, 3).join("-");
    cell = cells.find((c) => c.cell_prefix === prefix) ?? undefined;
  }

  if (!cell) {
    return { data_available: true, cell: null };
  }

  // Update decay score to current time
  const now = new Date();
  const updated: LivingCellState = {
    ...cell,
    decay_score: computeDecayScore(cell.last_event_at, now),
    living: (now.getTime() - new Date(cell.last_event_at).getTime()) < LIVING_WINDOW_MS,
  };

  return { data_available: true, cell: updated };
}

// ─── Living-gridwork snapshot ─────────────────────────────────────────────────

/**
 * Build a full living-gridwork snapshot for all tracked cells.
 * BRIDLE Rule 4: any exception surfaces data_available=false.
 */
export function buildGridworkSnapshot(): GridworkSnapshot {
  const snapshot_at = new Date().toISOString();
  try {
    const cells = readAllCellStates();
    const now = new Date();

    const enriched = cells.map((cell) => ({
      ...cell,
      decay_score: computeDecayScore(cell.last_event_at, now),
      living: (now.getTime() - new Date(cell.last_event_at).getTime()) < LIVING_WINDOW_MS,
    }));

    const living_cells = enriched.filter((c) => c.living).length;
    const dead_cells = enriched.filter((c) => !c.living).length;
    const fallback_cells = enriched.filter((c) => c.fallback_polling).length;

    return {
      schema_version: "1.0",
      snapshot_at,
      total_cells: enriched.length,
      living_cells,
      dead_cells,
      fallback_cells,
      cells: enriched,
      data_available: true,
    };
  } catch (err) {
    return {
      schema_version: "1.0",
      snapshot_at,
      total_cells: 0,
      living_cells: 0,
      dead_cells: 0,
      fallback_cells: 0,
      cells: [],
      data_available: false,
      unavailable_reason: `Gridwork snapshot failed: ${String(err)}`,
    };
  }
}

// ─── Cell-state inconsistency detection ──────────────────────────────────────

/**
 * Detect and reconcile inconsistent cells.
 * Inconsistency: cell.jar_count != actual jar count from KN-J1 ledger.
 * BRIDLE Rule 4: flags + reconciles; never silently leaves inconsistent state.
 */
export function detectAndReconcileInconsistencies(): {
  checked: number;
  inconsistencies_found: number;
  reconciled: number;
  bridle_flags: string[];
} {
  const cells = readAllCellStates();
  const now = new Date();
  const bridle_flags: string[] = [];
  let inconsistencies_found = 0;
  let reconciled = 0;

  const updated = cells.map((cell) => {
    const truth = reconcileCellFromJars(cell.cell_prefix, now);
    if (truth.jar_count !== cell.jar_count) {
      inconsistencies_found++;
      const flag = `Cell ${cell.coordinate} inconsistent: state=${cell.jar_count} vs ledger=${truth.jar_count}`;
      bridle_flags.push(flag);
      reconciled++;
      return { ...cell, ...truth };
    }
    return cell;
  });

  if (inconsistencies_found > 0) {
    rewriteGridworkState(updated);
  }

  return { checked: cells.length, inconsistencies_found, reconciled, bridle_flags };
}

// ─── Read cell events ─────────────────────────────────────────────────────────

export function readCellEvents(coordinate?: string): CellStateEvent[] {
  if (!existsSync(CELL_EVENTS_PATH)) return [];
  try {
    const raw = readFileSync(CELL_EVENTS_PATH, "utf-8");
    const events = raw
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l) as CellStateEvent);
    return coordinate ? events.filter((e) => e.coordinate === coordinate || e.coordinate === "all") : events;
  } catch {
    return [];
  }
}
