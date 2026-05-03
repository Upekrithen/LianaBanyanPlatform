import type { SessionEntry } from "../types.js";
export interface ParsedCloseout extends SessionEntry {
    sourcePath: string;
    bNumber: number;
}
export declare function parseSessionCloseouts(workspaceRoot: string): Promise<ParsedCloseout[]>;
/**
 * Knight session-report ingestion — DOCUMENTED GAP (K441).
 *
 * No `K<NNN>_REPORT_*.md` convention exists yet in this repo. Knight reports
 * are currently embedded in commit messages and Bishop closeout files. When
 * a Knight-report folder convention is established (e.g.
 * `KNIGHT_DROPZONE/03_KnightReports/K<NNN>_REPORT.md`), add a parallel
 * parser here and merge into the SessionEntry stream with id="K<NNN>".
 */
export declare function parseKnightReports(_workspaceRoot: string): Promise<SessionEntry[]>;
/** Pick the highest B-number from a list of SessionEntry-like values. */
export declare function pickHighestBSession(sessions: SessionEntry[]): string | undefined;
/**
 * Merge two session lists, preferring entries from `closeouts` over `legacy`
 * when IDs collide. Closeout files are the authoritative source for B-sessions.
 * Returns the merged list sorted by B-number ascending; non-B IDs preserve
 * their relative order at the front.
 */
export declare function mergeSessionStreams(legacy: SessionEntry[], closeouts: SessionEntry[]): SessionEntry[];
