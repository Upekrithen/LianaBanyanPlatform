/** KN102: Librarian operating mode.
 *  brittle = batch-snapshot (npm-run-rebuild); Lone Wolf path.
 *  fluid   = direct-from-disk at every MCP call; Pied Piper / Federation / Excalibur path. */
export type LibrarianMode = "brittle" | "fluid";
export interface LibrarianModeContext {
    mode: LibrarianMode;
    cohortClass: "lone_wolf" | "pied_piper_tier_1" | "pied_piper_tier_2_plus" | "federation_member" | "excalibur_class_subscriber";
    cueCardRecencyState?: "inactive" | "active" | "expiring_warning" | "expired";
    /** Pied Piper Tier 1 only — ISO-8601 */
    fluidExpiryTimestamp?: string;
}
export interface FingerprintRecord {
    timestamp: string;
    elapsedMs: number;
    mode: "full" | "incremental";
    treeHash: string;
    fileCount: number;
    fileMtimes: Record<string, number>;
}
export interface FreshnessReport {
    status: "FRESH" | "DRIFT" | "UNKNOWN";
    lastBuild: string | null;
    lastBuildMode: string | null;
    ageMs: number | null;
    changedFiles: string[];
    newFiles: string[];
    deletedFiles: string[];
    totalDrift: number;
}
export declare function writeFingerprint(indexDir: string, workspaceRoot: string, elapsedMs: number, mode: "full" | "incremental"): Promise<FingerprintRecord>;
export declare function checkFreshness(indexDir: string, workspaceRoot: string): Promise<FreshnessReport>;
export declare function getChangedDropzoneFiles(report: FreshnessReport): string[];
/**
 * Fluid path (fix #4): direct-from-disk fingerprint at call-time.
 * Eliminates the snapshot concept for Pied Piper+ users.
 * Drift stops being a concept — there's no snapshot to drift from.
 * Pheromone substrate (sub-ms coverage) routes reads; this function
 * captures the current mtime-hash without writing any persistent file.
 *
 * Latency target: ≤5ms (Pheromone substrate sub-ms coverage).
 */
export declare function getDirectFromDiskFingerprint(workspaceRoot: string): Promise<{
    treeHash: string;
    fileCount: number;
    capturedAt: string;
    latencyMs: number;
}>;
/**
 * Dispatch to the appropriate fingerprint path based on librarian mode.
 *
 * - brittle: reads the persisted last_build_fingerprint.json (existing K441 path)
 * - fluid:   calls getDirectFromDiskFingerprint (no snapshot; always current)
 *
 * Returns a unified result shape consumable by brief_me / get_system_overview.
 */
export declare function getLibrarianFingerprint(modeCtx: LibrarianModeContext, indexDir: string, workspaceRoot: string): Promise<{
    mode: LibrarianMode;
    treeHash: string | null;
    fileCount: number;
    capturedAt: string | null;
    staleness: "fresh" | "drift" | "unknown" | "fluid_realtime";
    latencyMs?: number;
}>;
