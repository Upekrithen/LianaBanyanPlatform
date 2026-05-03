import { type ScribeTabletEntry } from "./cathedral.js";
export interface ConsultEntry extends ScribeTabletEntry {
    scribe_id: string;
}
export interface ConsultResult {
    topic: string;
    cathedral: string;
    scope: string;
    scribes_consulted: Array<{
        scribe_id: string;
        score: number;
        is_primary: boolean;
        /** K466: serving mode; K520.6 adds always_loaded */
        mode: "observational" | "corpus" | "always_loaded";
        entries_returned: number;
    }>;
    entries: ConsultEntry[];
    truncated: boolean;
    elapsed_ms: number;
}
export declare function consultScribes(input: {
    topic: string;
    max_entries?: number;
    since_ts?: string;
    include_adjacents?: boolean;
    /** Which Cathedral to consult. "bishop" = Bishop's Cathedral (default). "knight" = Knight's Cathedral. */
    cathedral?: "bishop" | "knight";
    /** Scope filter. Defaults to "public". Silent filter: non-matching entries are omitted. */
    scope?: string;
}): ConsultResult;
