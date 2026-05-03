/**
 * member_fates_route (K438b Phase D)
 * ==================================
 * Per-member Three Fates routing pipeline (#2269 Claim 1(e)).
 *
 *   - Clotho:   theme extraction over the member's own Scribe keywords +
 *               canonical-entity regexes (the regexes are identical to the
 *               K436 stitchpunks Clotho — innovation IDs, session IDs,
 *               provisional refs, SP-N spec refs, multi-word capitalized
 *               phrases).
 *   - Lachesis: Scribe scoring against the member's active Scribes
 *               (cathedral.member_scribes WHERE member_id = $1 AND active).
 *   - Atropos:  selects top-K dispatch directives, computes coverage gaps
 *               (themes that no Scribe captured on primary OR adjacent).
 *               Triple-redundant-witness threshold (#2270 Claim 4):
 *               coverage gap fires when fewer than 3 Scribes matched the
 *               theme set as a whole.
 *   - Persist:  one row in cathedral.fates_log per call.
 *
 * Behavioural choices vs. K436 stitchpunks Fates:
 *   - K436 fates.ts auto-appends to tablets when a dispatch's score is
 *     above the activation threshold. K438b explicitly does NOT — the
 *     member sees the routing suggestion in the UI and confirms before
 *     anything is appended to scribe_entries. Manual approval default
 *     for first ship per K438b prompt.
 *   - K436 reads from the global stitchpunks registry; K438b reads from
 *     cathedral.member_scribes scoped to one member.
 */
import { createHash } from "crypto";
import { getCathedralClient, getCathedralClientError, } from "./client.js";
import { scoreScribeAgainstThemes } from "./scoring.js";
const MAX_DISPATCH_DEFAULT = 5;
const MIN_PRIMARY_MATCHES = 1;
const MIN_ADJACENT_MATCHES = 2;
const TRIPLE_WITNESS_THRESHOLD = 3;
/**
 * Member-scoped Clotho. Identical entity regexes to K436's clothoExtract
 * but pulls keyword candidates from the member's own active Scribes
 * instead of the global stitchpunks registry.
 */
export function clothoExtractForMember(text, scribes) {
    const found = new Map();
    const entities = new Set();
    if (!text || text.trim().length === 0)
        return { themes: [], entities: [] };
    const lower = text.toLowerCase();
    for (const scribe of scribes) {
        for (const kw of scribe.keywords || []) {
            const k = kw.toLowerCase();
            if (k.length < 2)
                continue;
            if (lower.includes(k) && !found.has(k)) {
                found.set(k, kw);
            }
        }
    }
    for (const m of text.matchAll(/#?\b(22\d{2})\b/g)) {
        const tag = `#${m[1]}`;
        entities.add(tag);
        if (!found.has(tag.toLowerCase()))
            found.set(tag.toLowerCase(), tag);
    }
    for (const m of text.matchAll(/\b((?:BP|KP|KN|PP|RR|B|K|P|R)\d{2,4})\b/g)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
    for (const m of text.matchAll(/\b(Prov(?:isional)?\s*\d+)\b/gi)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
    for (const m of text.matchAll(/\b(SP-?\d+(?:\/\d+)?)\b/g)) {
        entities.add(m[1]);
        if (!found.has(m[1].toLowerCase()))
            found.set(m[1].toLowerCase(), m[1]);
    }
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
// ─── Top-level entry point ───────────────────────────────────────────────
export async function memberFatesRoute(input) {
    const t0 = Date.now();
    if (!isUuid(input.member_id)) {
        return { ok: false, error: "invalid_member_id", hint: "member_id must be a UUID." };
    }
    if (!input.content || input.content.trim().length < 10) {
        return { ok: false, error: "content_too_short", hint: "content must be ≥ 10 characters." };
    }
    const persist = input.persist ?? true;
    const client = input.client ?? (persist ? getCathedralClient() : null);
    if (persist && !client) {
        return {
            ok: false,
            error: "supabase_not_configured",
            hint: getCathedralClientError() ||
                "Cathedral Supabase client unavailable; pass persist:false to route without logging.",
        };
    }
    // Fetch the member's active Scribes. If client is null (persist=false +
    // no test client), we can't run the pipeline — Lachesis needs the
    // Scribes to score against. So even persist=false requires a client.
    if (!client) {
        return {
            ok: false,
            error: "supabase_not_configured",
            hint: "Cannot fetch member Scribes without Supabase client.",
        };
    }
    const scribesRes = await client
        .from("member_scribes")
        .select("scribe_id, member_id, name, primary_field, adjacents, keywords, active, share_level, share_target_id, created_at, updated_at")
        .eq("member_id", input.member_id)
        .eq("active", true);
    if (scribesRes.error) {
        return { ok: false, error: "member_scribes_query_failed", hint: scribesRes.error.message };
    }
    const scribes = (scribesRes.data ?? []);
    // Clotho
    const { themes, entities } = clothoExtractForMember(input.content, scribes);
    // Lachesis
    const scores = {};
    const details = [];
    for (const s of scribes) {
        const r = scoreScribeAgainstThemes(s, themes);
        scores[s.scribe_id] = round2(r.score);
        if (r.score > 0)
            details.push({ scribe: s, ...r });
    }
    // Atropos
    const dispatchCap = clamp(input.dispatch_cap ?? MAX_DISPATCH_DEFAULT, 1, 10);
    const eligible = [];
    for (const d of details) {
        const meetsPrimary = d.primaryMatches.length >= MIN_PRIMARY_MATCHES;
        const meetsAdjacent = d.adjacentMatches.length >= MIN_ADJACENT_MATCHES;
        if (!meetsPrimary && !meetsAdjacent)
            continue;
        if (d.score <= 0)
            continue;
        const matchSummary = d.primaryMatches.length
            ? `primary: ${d.primaryMatches.slice(0, 4).join(", ")}`
            : `adjacent: ${d.adjacentMatches.slice(0, 4).join(", ")}`;
        eligible.push({
            scribe_id: d.scribe.scribe_id,
            scribe_name: d.scribe.name,
            directive: `log observation re: ${d.scribe.primary_field} (matched ${matchSummary})`,
            suggested_observation: `Themes triggered (${themes.length}): ${themes
                .slice(0, 6)
                .join(", ")}${themes.length > 6 ? ", …" : ""}`,
            score: round2(d.score),
            primary_matches: d.primaryMatches,
            adjacent_matches: d.adjacentMatches,
        });
    }
    eligible.sort((a, b) => b.score - a.score);
    const dispatches = eligible.slice(0, dispatchCap);
    // Coverage gaps + triple-witness check
    const captured = new Set();
    for (const d of details) {
        for (const t of d.primaryMatches)
            captured.add(t.toLowerCase());
        for (const t of d.adjacentMatches)
            captured.add(t.toLowerCase());
    }
    const coverage_gaps = [];
    for (const t of themes) {
        const lo = t.toLowerCase();
        if (captured.has(lo))
            continue;
        if (lo.length < 4)
            continue;
        coverage_gaps.push(t);
    }
    // Triple-witness: at least TRIPLE_WITNESS_THRESHOLD distinct Scribes must
    // have matched something. If fewer, the routing is "thin" and the UI
    // should surface this as a coverage advisory (#2270 Claim 4).
    const triple_witness_met = details.length >= TRIPLE_WITNESS_THRESHOLD;
    if (!triple_witness_met && coverage_gaps.length === 0) {
        coverage_gaps.push(`triple-witness threshold not met (${details.length}/${TRIPLE_WITNESS_THRESHOLD} Scribes matched)`);
    }
    // Persist
    const content_hash = sha256(input.content);
    let fates_log_id = null;
    if (persist) {
        const insertRes = await client
            .from("fates_log")
            .insert({
            member_id: input.member_id,
            session_id: input.session_id ?? null,
            content_hash,
            themes,
            scores,
            dispatches,
            coverage_gaps,
        })
            .select("log_id")
            .single();
        if (insertRes.error) {
            return { ok: false, error: "fates_log_insert_failed", hint: insertRes.error.message };
        }
        fates_log_id = insertRes.data.log_id;
    }
    return {
        ok: true,
        member_id: input.member_id,
        session_id: input.session_id ?? null,
        content_hash,
        themes,
        named_entities: entities,
        scores,
        dispatches,
        coverage_gaps,
        triple_witness_met,
        fates_log_id,
        elapsed_ms: Date.now() - t0,
    };
}
function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}
function sha256(s) {
    return createHash("sha256").update(s, "utf-8").digest("hex");
}
//# sourceMappingURL=member_fates.js.map
