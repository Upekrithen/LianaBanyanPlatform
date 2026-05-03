/**
 * Three Fates Router (SP-22 / K436)
 * =================================
 * Clotho-Lachesis-Atropos pipeline. Pure function over `text` + the registry —
 * no I/O. The caller (the `fates_route` MCP tool handler) decides what to do
 * with the dispatch directives and is responsible for appending the routing
 * record to `data/fates_log.jsonl`.
 */
import { getRegistry, scoreScribe, computeKeywordRarityMap } from "./registry.js";
const MAX_DISPATCH = 5;
const MIN_PRIMARY_MATCHES = 1;
const MIN_ADJACENT_MATCHES = 2;
// ─── Clotho — theme extraction ────────────────────────────────────────────
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
export function clothoExtract(text) {
    const found = new Map(); // lower -> original
    const entities = new Set();
    if (!text || text.trim().length === 0) {
        return { themes: [], entities: [] };
    }
    const lower = text.toLowerCase();
    const reg = getRegistry();
    // (1) keyword matches against registered Scribes
    for (const scribe of reg.scribes) {
        for (const kw of scribe.keywords) {
            const k = kw.toLowerCase();
            if (k.length < 2)
                continue;
            if (lower.includes(k) && !found.has(k)) {
                found.set(k, kw);
            }
        }
    }
    // (2) Named-entity regexes
    // Innovation IDs: #22xx (4 digits starting with 22)
    for (const m of text.matchAll(/#?\b(22\d{2})\b/g)) {
        const tag = `#${m[1]}`;
        entities.add(tag);
        if (!found.has(tag.toLowerCase()))
            found.set(tag.toLowerCase(), tag);
    }
    // Session IDs: B116, K432, R34, P12, BP009, KN076, KP024 (KN076 BP009 fix)
    for (const m of text.matchAll(/\b((?:BP|KP|KN|PP|RR|B|K|P|R)\d{2,4})\b/g)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
    // Provisional refs: "Prov 14", "Prov14", "Provisional 14"
    for (const m of text.matchAll(/\b(Prov(?:isional)?\s*\d+)\b/gi)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
    // SP-N spec refs: "SP-21", "SP-22/23"
    for (const m of text.matchAll(/\b(SP-?\d+(?:\/\d+)?)\b/g)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
    // (3) Multi-word capitalized phrases (limit 4 words)
    for (const m of text.matchAll(/\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})\b/g)) {
        const phrase = m[1];
        if (phrase.split(/\s+/).length < 2)
            continue;
        const key = phrase.toLowerCase();
        if (!found.has(key))
            found.set(key, phrase);
    }
    return { themes: Array.from(found.values()), entities: Array.from(entities) };
}
// ─── Lachesis — Scribe scoring ────────────────────────────────────────────
/**
 * Score all registered Scribes against `themes`.
 * K472 Fix 1: passes the keyword rarity map so that synthetic-proper-noun queries
 * (rare tokens like "Verdania", "Thornwick", "Reference Architecture") receive a
 * +1.0 bonus per matching rare keyword, ensuring correct Scribe routing over
 * generic Scribes like Architecture that match on common terms.
 */
export function lachesisScore(themes) {
    const reg = getRegistry();
    const rarityMap = computeKeywordRarityMap();
    const scores = {};
    const details = new Map();
    for (const scribe of reg.scribes) {
        const result = scoreScribe(scribe.id, themes, rarityMap);
        scores[scribe.id] = round2(result.score);
        details.set(scribe.id, result);
    }
    return { scores, details };
}
// ─── Atropos — dispatch ───────────────────────────────────────────────────
/**
 * For each Scribe meeting the activation threshold, produce a dispatch directive
 * and a suggested observation. Cap at MAX_DISPATCH (top-score wins ties).
 *
 * The directive language is intentionally generic — the caller (an agent or a
 * hook) decides whether to call `scribe_log` with the suggested observation,
 * tighten it, or skip.
 */
export function atroposDispatch(themes, details) {
    const eligible = [];
    const reg = getRegistry();
    const byId = new Map(reg.scribes.map((s) => [s.id, s]));
    for (const [scribeId, d] of details) {
        const meetsPrimary = d.primaryMatches.length >= MIN_PRIMARY_MATCHES;
        const meetsAdjacent = d.adjacentMatches.length >= MIN_ADJACENT_MATCHES;
        if (!meetsPrimary && !meetsAdjacent)
            continue;
        if (d.score <= 0)
            continue;
        const scribe = byId.get(scribeId);
        const matchSummary = d.primaryMatches.length
            ? `primary: ${d.primaryMatches.slice(0, 4).join(", ")}`
            : `adjacent: ${d.adjacentMatches.slice(0, 4).join(", ")}`;
        eligible.push({
            scribe_id: scribeId,
            directive: `log observation re: ${scribe.primary.field} (matched ${matchSummary})`,
            suggested_observation: `Themes triggered (${themes.length}): ${themes
                .slice(0, 6)
                .join(", ")}${themes.length > 6 ? ", …" : ""}`,
            score: round2(d.score),
            primary_matches: d.primaryMatches,
            adjacent_matches: d.adjacentMatches,
        });
    }
    eligible.sort((a, b) => b.score - a.score);
    return eligible.slice(0, MAX_DISPATCH);
}
// ─── Coverage gap detection ──────────────────────────────────────────────
/**
 * A coverage gap is a theme that no awakened Scribe matched on its primary OR
 * adjacent keyword set. We report only themes that look "load-bearing" —
 * skipping bare common words. Dispatch list is the post-cap top-N, so a theme
 * captured by the 6th-place Scribe still counts as "captured".
 */
export function findCoverageGaps(themes, details) {
    if (themes.length === 0)
        return [];
    const captured = new Set();
    for (const d of details.values()) {
        for (const t of d.primaryMatches)
            captured.add(t.toLowerCase());
        for (const t of d.adjacentMatches)
            captured.add(t.toLowerCase());
    }
    const gaps = [];
    for (const t of themes) {
        const lower = t.toLowerCase();
        if (captured.has(lower))
            continue;
        // Skip very short / generic themes — they are noise, not gaps.
        if (lower.length < 4)
            continue;
        gaps.push(t);
    }
    return gaps;
}
// ─── Top-level: run all three Fates ──────────────────────────────────────
export function runFates(text) {
    const { themes, entities } = clothoExtract(text);
    const { scores, details } = lachesisScore(themes);
    const dispatch = atroposDispatch(themes, details);
    const gaps = findCoverageGaps(themes, details);
    return {
        clotho_themes: themes,
        named_entities: entities,
        lachesis_scores: scores,
        atropos_dispatch: dispatch,
        coverage_gaps: gaps,
    };
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
//# sourceMappingURL=fates.js.map
