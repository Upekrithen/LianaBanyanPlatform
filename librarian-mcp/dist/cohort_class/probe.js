/**
 * Cohort-Class Probe (KN102 / BP016)
 * ===================================
 * Detects a member's cohort class and assigns the corresponding Librarian mode.
 * Called at LB Frame Handshake Phase 1 Discovery.
 *
 * Priority order (highest wins):
 *   1. federation_member       — profiles.membership_status = 'active' ($5/year)
 *   2. excalibur_class_subscriber — entity_memberships.status = 'active'
 *   3. pied_piper_tier_2_plus  — ≥3 qualifying Cue Cards in last 7 days
 *   4. pied_piper_tier_1       — ≥1 qualifying Cue Card in last 7 days
 *   5. lone_wolf               — no qualifying pathway (default)
 *
 * Mode assignment:
 *   lone_wolf                 → "brittle"   (batch-snapshot; npm-run-rebuild)
 *   pied_piper_tier_1+        → "fluid"     (direct-from-disk via Pheromone)
 *   federation_member         → "fluid"     (permanent; no recency gate)
 *   excalibur_class_subscriber → "fluid"   (permanent; no recency gate)
 *
 * BRIDLE Rule 4: if detection is ambiguous or DB unreachable, default to brittle.
 */
import { createClient } from "@supabase/supabase-js";
import { calculateVestingState, validateVestingContext, } from "./cue_card_recency.js";
// ─── Supabase client (lazy-init) ────────────────────────────────────────────
let _client = null;
function getSupabaseClient() {
    if (_client)
        return _client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        return null;
    _client = createClient(url, key, {
        auth: { persistSession: false },
    });
    return _client;
}
// ─── Core probe ─────────────────────────────────────────────────────────────
/**
 * Probe cohort class from Supabase for a given member_id.
 * Calls `get_member_cohort_class(member_id)` RPC (defined in KN102/KN103 migration).
 * Falls back to brittle/lone_wolf if DB is unavailable.
 */
export async function probeCohortClass(memberId) {
    const probed_at = new Date().toISOString();
    const brittle_fallback = {
        cohort_class: "lone_wolf",
        librarian_mode: "brittle",
        membership_status: null,
        cue_card_vesting: null,
        probed_at,
        fallback_brittle: true,
        error: "Supabase unavailable — defaulting to brittle (BRIDLE Rule 4)",
    };
    const client = getSupabaseClient();
    if (!client)
        return brittle_fallback;
    let raw;
    try {
        // Cast through unknown to avoid strict Supabase generic typing on unknown DB schema
        const rpc = client.rpc;
        const { data, error } = await rpc("get_member_cohort_class", { p_member_id: memberId });
        if (error) {
            return { ...brittle_fallback, error: `RPC error: ${String(error)}` };
        }
        raw = data;
    }
    catch (err) {
        return { ...brittle_fallback, error: `Exception: ${String(err)}` };
    }
    const cohort_class = raw.cohort_class ?? "lone_wolf";
    const librarian_mode = raw.librarian_mode === "fluid" ? "fluid" : "brittle";
    const membership_status = typeof raw.membership_status === "string" ? raw.membership_status : null;
    // Parse cue card vesting if present
    let cue_card_vesting = null;
    if (raw.cue_card_vesting && typeof raw.cue_card_vesting === "object") {
        const ctx = validateVestingContext(raw.cue_card_vesting);
        if (ctx) {
            cue_card_vesting = calculateVestingState(ctx);
        }
    }
    return {
        cohort_class,
        librarian_mode,
        membership_status,
        cue_card_vesting,
        probed_at,
        fallback_brittle: false,
    };
}
/**
 * Lightweight cohort-class probe for session metadata.
 * Returns a plain summary string for brief_me / get_system_overview output.
 */
export function formatCohortSummary(result) {
    const mode = result.librarian_mode.toUpperCase();
    const tier = result.cohort_class.replace(/_/g, " ").toUpperCase();
    const lines = [
        `Librarian mode: ${mode} (${tier})`,
    ];
    if (result.cue_card_vesting && result.cue_card_vesting.state !== "inactive") {
        const v = result.cue_card_vesting;
        lines.push(`Cue Card vesting: ${v.state} — ${v.reason}`);
    }
    if (result.fallback_brittle) {
        lines.push(`⚠ Cohort probe failed — brittle fallback active. Error: ${result.error}`);
    }
    return lines.join("\n");
}
/**
 * Quick check: does a given mode string map to fluid?
 * Used by fingerprint.ts to gate direct-from-disk reads.
 */
export function isFluidMode(mode) {
    return mode === "fluid";
}
//# sourceMappingURL=probe.js.map
