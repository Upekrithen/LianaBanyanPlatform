/**
 * Tier-Config Probe — KN-H1 / BP017
 * ===================================
 * Reads and writes a member's LB Frame resource-config tier choice.
 * Called at LB Frame Handshake Phase 1 Discovery (Step 1.3), orthogonally
 * to the cohort-class probe (KN102/Step 1.2).
 *
 * Three tiers (Founder ratification BP017 turn 18):
 *   needs    — Tier A: whatever user has out-of-box; no upgrade required
 *   suggests — Tier B: recommended uplift; documented better experience
 *   founder  — Tier C: Founder-customized; empirical-receipt-source
 *
 * Anti-extraction by structural form: capital alone cannot purchase Tier C.
 * Tier C is self-attested — any user may select it regardless of Claude plan.
 * No fiat-bridge at this layer; plan-tier advisory is informational only.
 *
 * BRIDLE Rule 4: if DB unavailable, returns tier_state='not_chosen' (safe
 * fallback — Handshake surfaces the picker again; does NOT silently proceed).
 */
import { createClient } from "@supabase/supabase-js";
// ─── Supabase client (lazy-init, same pattern as probe.ts) ─────────────────
let _client = null;
function getSupabaseClient() {
    if (_client)
        return _client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key)
        return null;
    _client = createClient(url, key, { auth: { persistSession: false } });
    return _client;
}
// ─── Read: get tier ─────────────────────────────────────────────────────────
/**
 * Probe a member's current LB Frame resource-config tier.
 * Calls `get_lb_frame_resource_config_tier(member_id)` RPC.
 * Falls back gracefully if DB is unreachable (BRIDLE Rule 4).
 */
export async function probeTierConfig(memberId) {
    const probed_at = new Date().toISOString();
    const notChosenFallback = {
        user_id: memberId,
        tier: null,
        tier_chosen_at: null,
        tier_state: "not_chosen",
        tier_label: null,
        tier_metadata: null,
        fallback: true,
        error: "Supabase unavailable — tier not known; surface picker at Handshake (BRIDLE Rule 4)",
        probed_at,
    };
    const client = getSupabaseClient();
    if (!client)
        return notChosenFallback;
    try {
        const rpc = client.rpc;
        const { data, error } = await rpc("get_lb_frame_resource_config_tier", {
            p_user_id: memberId,
        });
        if (error) {
            return { ...notChosenFallback, error: `RPC error: ${String(error)}` };
        }
        const raw = data;
        return {
            user_id: memberId,
            tier: raw.tier ?? null,
            tier_chosen_at: typeof raw.tier_chosen_at === "string" ? raw.tier_chosen_at : null,
            tier_state: raw.tier_state ?? "not_chosen",
            tier_label: typeof raw.tier_label === "string" ? raw.tier_label : null,
            tier_metadata: raw.tier_metadata ?? null,
            fallback: false,
            probed_at,
        };
    }
    catch (err) {
        return { ...notChosenFallback, error: `Exception: ${String(err)}` };
    }
}
// ─── Write: set tier ────────────────────────────────────────────────────────
/**
 * Persists a member's tier selection to `user_preferences`.
 * Calls `set_lb_frame_resource_config_tier(user_id, tier)` RPC.
 * Returns success=false + error on any failure (BRIDLE Rule 8: surface error, don't silently proceed).
 */
export async function setTierConfig(userId, tier) {
    const client = getSupabaseClient();
    if (!client) {
        return {
            success: false,
            user_id: userId,
            tier,
            prev_tier: null,
            tier_chosen_at: null,
            reselection: false,
            error: "Supabase unavailable — tier not persisted",
        };
    }
    try {
        const rpc = client.rpc;
        const { data, error } = await rpc("set_lb_frame_resource_config_tier", {
            p_user_id: userId,
            p_tier: tier,
        });
        if (error) {
            return {
                success: false,
                user_id: userId,
                tier,
                prev_tier: null,
                tier_chosen_at: null,
                reselection: false,
                error: `RPC error: ${String(error)}`,
            };
        }
        const raw = data;
        return {
            success: raw.success === true,
            user_id: userId,
            tier,
            prev_tier: raw.prev_tier ?? null,
            tier_chosen_at: typeof raw.tier_chosen_at === "string" ? raw.tier_chosen_at : null,
            reselection: raw.reselection === true,
        };
    }
    catch (err) {
        return {
            success: false,
            user_id: userId,
            tier,
            prev_tier: null,
            tier_chosen_at: null,
            reselection: false,
            error: `Exception: ${String(err)}`,
        };
    }
}
// ─── Formatting helpers ─────────────────────────────────────────────────────
/** Tier labels for display in Handshake UI and MCP summaries */
export const TIER_DISPLAY = {
    needs: {
        short: "Tier A — NEEDS",
        long: "Whatever you have (no upgrade required)",
        tagline: "Anyone can run it. Default Claude Code plan. Full LB Frame at the floor.",
    },
    suggests: {
        short: "Tier B — SUGGESTS",
        long: "Recommended uplift — better experience",
        tagline: "Documented lift over Tier A. Claude Max or equivalent. Faster Reckoning velocity.",
    },
    founder: {
        short: "Tier C — FOUNDER",
        long: "Founder-customized — empirical-receipt-source",
        tagline: "Maximum-velocity. BP015→BP017 generated here. Self-attested plan tier — no fiat-bridge.",
    },
};
/**
 * One-line summary for brief_me / handshake phase output.
 */
export function formatTierSummary(result) {
    if (result.tier_state === "not_chosen") {
        if (result.fallback) {
            return `⚠ LB Frame tier: DB unavailable — surface picker at Handshake Step 1.3`;
        }
        return `LB Frame tier: NOT YET CHOSEN — surface picker at Handshake Step 1.3`;
    }
    const tier = result.tier;
    const display = TIER_DISPLAY[tier];
    return `LB Frame tier: ${display.short} — ${display.long}${result.fallback ? " ⚠ (fallback)" : ""}`;
}
/**
 * Plan-tier advisory (informational only — does NOT block).
 * Surface if Tier C is chosen but environment indicates a non-Founder plan.
 * Per Three-Tier canon: user sovereignty preserved; advisory is informational.
 */
export function buildPlanTierAdvisory(tier, detectedSurface) {
    if (tier !== "founder")
        return null;
    return (`Advisory (informational — does NOT block): You selected Tier C FOUNDER. ` +
        `This tier reflects Founder's customized Claude Code plan configuration. ` +
        `If your plan has lower token budgets or message-rate limits, some maximum-velocity ` +
        `features may be slower — but LB Frame will still run. ` +
        `Capital alone is not the gate. You have full sovereignty to run any tier.` +
        (detectedSurface ? ` Detected surface: ${detectedSurface}.` : ""));
}
//# sourceMappingURL=tier_config_probe.js.map
