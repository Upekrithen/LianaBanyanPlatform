/**
 * Cathedral file paths.
 *
 * Default roots point at the in-repo `librarian-mcp/stitchpunks/` directory.
 * Tests (and any sandboxed caller) can override by setting the
 * `LIBRARIAN_STITCHPUNKS_DIR` env var BEFORE importing this module — it
 * redirects all I/O (tablets, tidbits, fates_log) under that directory.
 */
export declare const STITCHPUNKS_DIR: string;
export declare const SCRIBES_DIR: string;
export declare const DATA_DIR: string;
export declare const TIDBITS_PATH: string;
export declare const FATES_LOG_PATH: string;
export type AgentName = "BISHOP" | "KNIGHT" | "ROOK" | "PAWN";
export type ScribeSource = "founder_dialogue" | "bishop_ship" | "knight_ship" | "bishop_read" | "bishop_thresh" | "bishop_design" | "scribe_thresh" | "fates_auto";
export interface TidbitRecord {
    ts: string;
    agent: AgentName;
    session: string;
    category: string;
    observation: string;
    artifact?: string;
    bridle_rule: 2;
}
export interface ScribeTabletEntry {
    ts: string;
    session: string;
    observation: string;
    source: ScribeSource;
    canonical_ref?: string;
    [key: string]: unknown;
}
export interface FatesLogRecord {
    ts: string;
    session: string;
    agent?: AgentName;
    clotho_themes: string[];
    lachesis_scores: Record<string, number>;
    atropos_dispatch: Array<{
        scribe_id: string;
        directive: string;
        suggested_observation?: string;
    }>;
    coverage_gaps: string[];
    source_exchange?: string;
}
export declare function appendTidbit(input: {
    agent: AgentName;
    session: string;
    category: string;
    observation: string;
    artifact?: string;
}): {
    ok: true;
    line_count: number;
    record: TidbitRecord;
};
export declare function readTidbits(filter?: {
    session?: string;
}): TidbitRecord[];
export declare function tabletExists(scribeId: string): boolean;
export declare function appendScribeEntry(input: {
    scribe_id: string;
    session: string;
    observation: string;
    source: ScribeSource;
    canonical_ref?: string;
}): {
    ok: true;
    tablet: string;
    line_count: number;
    record: ScribeTabletEntry;
};
export declare function readTablet(scribeId: string): ScribeTabletEntry[];
export declare function tabletStats(scribeId: string): {
    exists: boolean;
    total_entries: number;
    last_entry_ts: string | null;
};
export declare function appendFatesLog(record: Omit<FatesLogRecord, "ts">): {
    ok: true;
    line_count: number;
    record: FatesLogRecord;
};
export declare function readFatesLog(filter?: {
    session?: string;
}): FatesLogRecord[];
export declare function fileMtime(filePath: string): number;
