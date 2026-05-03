export interface FatesDispatch {
    scribe_id: string;
    directive: string;
    suggested_observation: string;
    score: number;
    primary_matches: string[];
    adjacent_matches: string[];
}
export interface FatesResult {
    clotho_themes: string[];
    named_entities: string[];
    lachesis_scores: Record<string, number>;
    atropos_dispatch: FatesDispatch[];
    coverage_gaps: string[];
}
/**
 * Extract candidate themes from `text`. Strategy:
 *   1. Pull every Scribe keyword that appears in `text` (case-insensitive
 *      substring match). These are the highest-signal themes.
 *   2. Pull named entities via regex: canonical innovation IDs (#22xx),
 *      session IDs (B116, K432, R34, P12), patent provisional refs (Prov 14),
 *      Sweet-Sixteen-style decimal refs.
 *   3. Pull notable multi-word capitalized phrases (e.g., "Three Fates",
 *      "Scribes Cathedral").
 * Themes are de-duplicated case-preservingly (first occurrence wins).
 */
export declare function clothoExtract(text: string): {
    themes: string[];
    entities: string[];
};
/**
 * Score all registered Scribes against `themes`.
 * K472 Fix 1: passes the keyword rarity map so that synthetic-proper-noun queries
 * (rare tokens like "Verdania", "Thornwick", "Reference Architecture") receive a
 * +1.0 bonus per matching rare keyword, ensuring correct Scribe routing over
 * generic Scribes like Architecture that match on common terms.
 */
export declare function lachesisScore(themes: string[]): {
    scores: Record<string, number>;
    details: Map<string, {
        score: number;
        primaryMatches: string[];
        adjacentMatches: string[];
    }>;
};
/**
 * For each Scribe meeting the activation threshold, produce a dispatch directive
 * and a suggested observation. Cap at MAX_DISPATCH (top-score wins ties).
 *
 * The directive language is intentionally generic — the caller (an agent or a
 * hook) decides whether to call `scribe_log` with the suggested observation,
 * tighten it, or skip.
 */
export declare function atroposDispatch(themes: string[], details: Map<string, {
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
}>): FatesDispatch[];
/**
 * A coverage gap is a theme that no awakened Scribe matched on its primary OR
 * adjacent keyword set. We report only themes that look "load-bearing" —
 * skipping bare common words. Dispatch list is the post-cap top-N, so a theme
 * captured by the 6th-place Scribe still counts as "captured".
 */
export declare function findCoverageGaps(themes: string[], details: Map<string, {
    score: number;
    primaryMatches: string[];
    adjacentMatches: string[];
}>): string[];
export declare function runFates(text: string): FatesResult;
