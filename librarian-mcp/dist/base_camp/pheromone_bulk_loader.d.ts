export declare const BASE_CAMP_DIR: string;
export declare const PROGRESS_PATH: string;
export declare const WORKSPACE_ROOT: string;
export interface BulkLoadOptions {
    /** Shadow sub-task id (alpha|beta|gamma|delta|epsilon|zeta|eta|theta) */
    shadowId?: string;
    /** Cathedral to tag pheromone records with (default "bishop") */
    cathedral?: string;
    /** Decay constant in days (overrides per-path default) */
    decayConstantDays?: number;
    /** Dry-run: report what would be indexed without writing */
    dryRun?: boolean;
    /** Only process files modified after this timestamp (incremental mode) */
    sinceMs?: number;
    /** Max characters to extract per file (default 4000) */
    maxCharsPerFile?: number;
    /** Scribe ID to tag pheromone records with (default "MakeComfortable") */
    scribeId?: string;
}
export interface BulkLoadResult {
    shadowId: string;
    pathsProcessed: string[];
    filesIndexed: number;
    filesSkipped: number;
    pheromoneCount: number;
    errorCount: number;
    errors: string[];
    durationMs: number;
    ts: string;
}
/**
 * Extract trigger-relevant fragments from a file's content.
 * Returns a compact string: filename + first heading + named entities +
 * Wrasse triggers (frontmatter) + canonical references.
 */
export declare function extractFragments(filePath: string, content: string, maxChars?: number): string;
/**
 * Expand a glob-style path pattern into real file paths.
 * Supports simple * wildcards (no recursive **).
 * Resolves relative paths from WORKSPACE_ROOT.
 */
export declare function expandPath(pattern: string, workspaceRoot?: string): string[];
/**
 * Bulk-load a list of path patterns into the pheromone substrate.
 *
 * Idempotent: re-running picks up new/modified files since last run.
 * Chronos-signed: each write uses current ISO timestamp.
 * Iron Tablet integration: pheromone writes compose with tablet-layer per KN089.
 */
export declare function bulkLoadPaths(patterns: string[], options?: BulkLoadOptions): Promise<BulkLoadResult>;
