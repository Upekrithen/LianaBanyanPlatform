import { getCathedralClient, getCathedralClientError, } from "./client.js";
import { scoreScribeAgainstThemes } from "./scoring.js";
/**
 * #2270 Claim 1(c) primary-first retrieval. The per-Scribe entry cap
 * keeps any one specialist from monopolising the response when the query
 * matches several Scribes' adjacent fields equally.
 */
const PER_SCRIBE_ENTRY_CAP = 5;
export async function memberConsultScribes(input) {
    const t0 = Date.now();
    const client = input.client ?? getCathedralClient();
    if (!client) {
        return {
            ok: false,
            error: "supabase_not_configured",
            hint: getCathedralClientError() ||
                "Cathedral Supabase client unavailable. See librarian-mcp/src/cathedral_supabase/client.ts.",
        };
    }
    if (!isUuid(input.member_id)) {
        return { ok: false, error: "invalid_member_id", hint: "member_id must be a UUID." };
    }
    const top_k = clamp(input.top_k ?? 10, 1, 50);
    const include_shared = input.include_shared ?? true;
    // 1. Fetch member's own active Scribes.
    const ownRes = await client
        .from("member_scribes")
        .select("scribe_id, member_id, name, primary_field, adjacents, keywords, active, share_level, share_target_id, created_at, updated_at")
        .eq("member_id", input.member_id)
        .eq("active", true);
    if (ownRes.error) {
        return { ok: false, error: "member_scribes_query_failed", hint: ownRes.error.message };
    }
    const ownScribes = (ownRes.data ?? []);
    // 2. Fetch shared Scribes from other members (commons by default; guild/tribe
    //    deferred to K438c when the membership join exists).
    let sharedScribes = [];
    if (include_shared) {
        const sharedRes = await client
            .from("member_scribes")
            .select("scribe_id, member_id, name, primary_field, adjacents, keywords, active, share_level, share_target_id, created_at, updated_at")
            .eq("active", true)
            .eq("share_level", "commons")
            .neq("member_id", input.member_id);
        if (sharedRes.error) {
            return { ok: false, error: "shared_scribes_query_failed", hint: sharedRes.error.message };
        }
        sharedScribes = (sharedRes.data ?? []);
    }
    // 3. Score every candidate. Treat the query as the single theme — Lachesis
    //    handles substring matching in both directions for keyword tolerance.
    const themes = [input.query];
    const ranked = [];
    for (const s of ownScribes) {
        const r = scoreScribeAgainstThemes(s, themes);
        if (r.score > 0)
            ranked.push({ scribe: s, ...r, is_own: true });
    }
    for (const s of sharedScribes) {
        const r = scoreScribeAgainstThemes(s, themes);
        if (r.score > 0)
            ranked.push({ scribe: s, ...r, is_own: false });
    }
    // Member's own Scribes always rank ahead of equivalent-score shared Scribes
    // (#2268 promise: a member's own specialists are never crowded out by
    // commons noise on their own queries).
    ranked.sort((a, b) => {
        if (a.is_own !== b.is_own)
            return a.is_own ? -1 : 1;
        return b.score - a.score;
    });
    if (ranked.length === 0) {
        return {
            ok: true,
            member_id: input.member_id,
            query: input.query,
            scribes_consulted: [],
            entries: [],
            truncated: false,
            elapsed_ms: Date.now() - t0,
        };
    }
    // 4. Bulk-fetch entries for ranked Scribes in one round-trip.
    const ownScribeIds = new Set(ranked.filter((r) => r.is_own).map((r) => r.scribe.scribe_id));
    const sharedScribeIds = new Set(ranked.filter((r) => !r.is_own).map((r) => r.scribe.scribe_id));
    const allScribeIds = [...ownScribeIds, ...sharedScribeIds];
    let entriesQuery = client
        .from("scribe_entries")
        .select("entry_id, scribe_id, member_id, ts, session_id, observation, source, canonical_ref, tags, shared_level, shared")
        .in("scribe_id", allScribeIds)
        .order("ts", { ascending: false })
        // Generous over-fetch so per-Scribe capping has fresh entries to choose from.
        .limit(top_k * 5 + PER_SCRIBE_ENTRY_CAP * allScribeIds.length);
    if (input.since_ts) {
        entriesQuery = entriesQuery.gt("ts", input.since_ts);
    }
    const entriesRes = await entriesQuery;
    if (entriesRes.error) {
        return { ok: false, error: "scribe_entries_query_failed", hint: entriesRes.error.message };
    }
    const allEntries = (entriesRes.data ?? []);
    // 5. Partition by Scribe, drop entries from shared Scribes that aren't
    //    materialized as shared (defense in depth; RLS already enforces this
    //    for non-service-role callers).
    const byScribe = new Map();
    for (const e of allEntries) {
        if (sharedScribeIds.has(e.scribe_id) && !e.shared)
            continue;
        const arr = byScribe.get(e.scribe_id) ?? [];
        if (arr.length < PER_SCRIBE_ENTRY_CAP)
            arr.push(e);
        byScribe.set(e.scribe_id, arr);
    }
    // 6. Assemble response in Scribe-rank order, capping at top_k entries.
    const scribesConsulted = [];
    const entries = [];
    for (const r of ranked) {
        if (entries.length >= top_k)
            break;
        const ents = byScribe.get(r.scribe.scribe_id) ?? [];
        if (ents.length === 0)
            continue;
        const taken = ents.slice(0, Math.max(0, top_k - entries.length));
        for (const e of taken) {
            entries.push({
                scribe_id: r.scribe.scribe_id,
                scribe_name: r.scribe.name,
                observation: e.observation,
                ts: e.ts,
                source: e.source,
                canonical_ref: e.canonical_ref,
                tags: e.tags ?? [],
                relevance_score: round2(r.score),
                is_own: r.is_own,
                shared_level: e.shared_level,
            });
        }
        scribesConsulted.push({
            scribe_id: r.scribe.scribe_id,
            scribe_name: r.scribe.name,
            score: round2(r.score),
            is_own: r.is_own,
            is_primary: r.primaryMatches.length > 0,
            entries_returned: taken.length,
        });
    }
    return {
        ok: true,
        member_id: input.member_id,
        query: input.query,
        scribes_consulted: scribesConsulted,
        entries,
        truncated: entries.length >= top_k,
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
//# sourceMappingURL=member_consult.js.map
