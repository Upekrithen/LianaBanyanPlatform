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
/** Time window (ms) during which a cell is considered `living` after last event. */
export declare const LIVING_WINDOW_MS = 60000;
/** Default fallback polling interval when Augur is unavailable (BRIDLE Rule 4). */
export declare const FALLBACK_POLL_INTERVAL_MS = 60000;
/** Pheromone decay half-life in ms for density score calculation (per KN042). */
export declare const DECAY_HALF_LIFE_MS: number;
/** Max events processed per cell per call (backpressure throttle). */
export declare const THROTTLE_BATCH_SIZE = 100;
export interface LivingCellState {
    coordinate: string;
    cell_prefix: string;
    living: boolean;
    jar_count: number;
    last_jar_added_at: string | null;
    cell_density_score: number;
    decay_score: number;
    subscribed_at: string;
    last_event_at: string;
    reconciled_at?: string;
    fallback_polling: boolean;
    bridle_flag?: string;
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
/**
 * Update a cell's living state when a Pheromone write-event fires.
 * This is the Augur Living Gate subscriber handler — called sub-ms from event.
 *
 * BRIDLE Rule 4:
 *   - On any error → surface flag; never silently corrupt state
 *   - Event processing time logged for latency monitoring (target: ≤5ms)
 */
export declare function updateCellOnEvent(opts: UpdateCellOpts): UpdateCellResult;
/**
 * Sweep all cells and update living-flag based on last_event_at.
 * Called by cron-class poller (fallback) or Augur sweep.
 * Cells with no events for living_window_ms are marked living=false.
 */
export declare function sweepLivingFlags(living_window_ms?: number): {
    swept: number;
    now_dead: number;
    still_living: number;
};
/**
 * Fallback poll: recomputes all registered cell states from source-of-truth (jars ledger).
 * Used when Augur Living Gate event system is unavailable.
 */
export declare function fallbackPollAllCells(): {
    data_available: boolean;
    refreshed: number;
    error?: string;
};
/**
 * Query the current living state of a cell (by exact coordinate or prefix).
 * BRIDLE Rule 4: if state unavailable, returns data_available=false.
 */
export declare function queryLivingCell(coordinate: string): {
    data_available: boolean;
    cell: LivingCellState | null;
    unavailable_reason?: string;
};
/**
 * Build a full living-gridwork snapshot for all tracked cells.
 * BRIDLE Rule 4: any exception surfaces data_available=false.
 */
export declare function buildGridworkSnapshot(): GridworkSnapshot;
/**
 * Detect and reconcile inconsistent cells.
 * Inconsistency: cell.jar_count != actual jar count from KN-J1 ledger.
 * BRIDLE Rule 4: flags + reconciles; never silently leaves inconsistent state.
 */
export declare function detectAndReconcileInconsistencies(): {
    checked: number;
    inconsistencies_found: number;
    reconciled: number;
    bridle_flags: string[];
};
export declare function readCellEvents(coordinate?: string): CellStateEvent[];
