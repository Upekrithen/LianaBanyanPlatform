export declare const SCRIBES_DIR: string;
export declare const REGISTRY_PATH: string;
export interface ScribeAdjacent {
    level: number;
    field: string;
}
export interface ScribeEntry {
    id: string;
    /**
     * Serving semantics for this Scribe's tablets (K466/B121).
     * - "observational" (default): tablets returned recency-sorted, top-K.
     *   Use for session logs, handoffs, BRIDLE memory — newer observations matter more.
     * - "corpus": static reference semantics; tablets returned in original (deterministic)
     *   order, all entries up to max_entries. Use for R11, canonical_values, rulebooks.
     * - "always_loaded": K520.6 / A&A #2310 — all tablets loaded into substrate cache at
     *   session start via First-Consult Edict. Also retrievable via consult_gotchas tool.
     *   Use for high-recurrence operational frictions (OperationalGotchas Scribe).
     */
    mode?: "observational" | "corpus" | "always_loaded";
    /**
     * Optional corpus provenance label (K472/B121 Fix 2).
     * Tags Scribes containing reference corpus material (e.g. "r11_reference") so
     * Lachesis can distinguish synthetic-corpus content from observational LB substrate.
     * Used by consultScribes corpus-mode priority boost (Fix 3).
     */
    corpus_label?: string;
    primary: {
        level: number;
        field: string;
        canonical_keepers?: string[];
    };
    adjacents: ScribeAdjacent[];
    keywords: string[];
    activation_threshold?: string;
}
export interface ScribesRegistry {
    version: string;
    opened: string;
    opener: string;
    spec: string;
    scribes: ScribeEntry[];
}
/** Returns the parsed registry. Re-reads from disk if the YAML mtime or keywords mode changed. */
export declare function getRegistry(forceReload?: boolean): ScribesRegistry;
/** Returns a single Scribe entry by id, or null if unknown. */
export declare function getScribe(id: string): ScribeEntry | null;
/** Returns the list of registered Scribe ids. */
export declare function listScribeIds(): string[];
/**
 * Computes a keyword rarity map: lowercased keyword → count of Scribes that list it
 * in their primary keyword array. Keywords appearing in only one Scribe are rare and
 * signal highly specific (often synthetic-proper-noun) queries (K472/B121 Fix 1).
 *
 * Rarity of a keyword = 1 − (count / totalScribes). Keywords in 1 Scribe out of 9
 * have rarity ≈ 0.89; keywords in 2 Scribes have rarity ≈ 0.78.
 */
export declare function computeKeywordRarityMap(): Map<string, number>;
/**
 * Lachesis scoring formula (per SP-22/23 spec + K436 prompt + K472 Fix 1):
 *   base score = (primary_matches * 1.0) + (adjacent_matches * 0.5)
 *   rare-token bonus = +1.0 per primary match via a keyword unique to this Scribe
 *
 * `themes` is the Clotho-extracted theme list (or a consult_scribes topic string).
 * Matching is case-insensitive substring against the Scribe's keyword library
 * (primary list) and adjacent-field text.
 *
 * `rarityMap` (optional, K472 Fix 1): maps lowercased keyword → Scribe count.
 * When provided, primary matches via keywords that appear in only one Scribe receive
 * an additive +1.0 bonus, boosting synthetic-proper-noun queries (e.g. "Verdania",
 * "Thornwick", "Reference Architecture") to score near-unity for the correct Scribe.
 * Natural-language queries are unaffected because their matching keywords are common.
 *
 * Returns 0 if the Scribe is unknown.
 */
export declare function scoreScribe(scribeId: string, themes: string[], rarityMap?: Map<string, number>): {
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
};
