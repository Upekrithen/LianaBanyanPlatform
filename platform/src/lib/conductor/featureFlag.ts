/**
 * Conductor Feature Flag Client
 * K525 · Phase D.1 · Innovation #2277
 *
 * Single-source feature-flag client for the Conductor's Baton rollout.
 *
 * Flags (canonical names):
 *   CONDUCTOR_BATON_ENABLED          — master kill switch (default FALSE)
 *   CONDUCTOR_RECEIPT_PUBLIC_SHARE   — public receipt URLs (default FALSE)
 *
 * Wave model:
 *   Wave 0 — Founder-only dogfood. Founder must flip CONDUCTOR_BATON_ENABLED=true
 *           in their own member row to opt in (per-member override below).
 *   Wave 1 — 10 selected members (locked B129; see rolloutWaves.ts). Awaits
 *           Prov 14 trigger before flag flips platform-wide.
 *   Wave 2 — full member rollout. Awaits Wave-1 telemetry green light + Founder
 *           ratification.
 *
 * Rollback: flip CONDUCTOR_BATON_ENABLED=false at the platform level. All
 * members fall back to single-vendor (default Anthropic) on next render.
 *
 * Implementation: reads `public.feature_flags` table via Supabase. Caches for
 * 30 seconds in the client to avoid hammering the DB on every Helm render.
 * Flag flips propagate within ~30s without a hard reload.
 */

import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Canonical flag keys
// ---------------------------------------------------------------------------

export const FEATURE_FLAGS = {
  CONDUCTOR_BATON_ENABLED: "CONDUCTOR_BATON_ENABLED",
  CONDUCTOR_RECEIPT_PUBLIC_SHARE: "CONDUCTOR_RECEIPT_PUBLIC_SHARE",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

// ---------------------------------------------------------------------------
// Cache (per-process, 30s TTL)
// ---------------------------------------------------------------------------

interface CacheEntry {
  enabled: boolean;
  rolloutWave: string | null;
  fetchedAt: number;
}

const CACHE_TTL_MS = 30_000;
const _cache = new Map<string, CacheEntry>();

function _isFresh(entry: CacheEntry): boolean {
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FeatureFlagState {
  enabled: boolean;
  rolloutWave: string | null;
  /** True if value came from cache; false if fetched live. */
  cached: boolean;
}

/**
 * Read a feature flag's current state.
 * Falls back to `false` on any read error (fail-closed for safety).
 */
export async function getFeatureFlag(
  key: FeatureFlagKey,
): Promise<FeatureFlagState> {
  const cached = _cache.get(key);
  if (cached && _isFresh(cached)) {
    return { enabled: cached.enabled, rolloutWave: cached.rolloutWave, cached: true };
  }

  try {
    const { data, error } = await (supabase as any)
      .from("feature_flags")
      .select("enabled, rollout_wave")
      .eq("flag_key", key)
      .maybeSingle();

    if (error || !data) {
      return { enabled: false, rolloutWave: null, cached: false };
    }

    const entry: CacheEntry = {
      enabled: !!data.enabled,
      rolloutWave: data.rollout_wave ?? null,
      fetchedAt: Date.now(),
    };
    _cache.set(key, entry);
    return { enabled: entry.enabled, rolloutWave: entry.rolloutWave, cached: false };
  } catch {
    return { enabled: false, rolloutWave: null, cached: false };
  }
}

/**
 * Read multiple flags in a single round-trip. Order of result matches input.
 */
export async function getFeatureFlags(
  keys: FeatureFlagKey[],
): Promise<Record<FeatureFlagKey, FeatureFlagState>> {
  // Deduplicate
  const unique = Array.from(new Set(keys));
  const result: Partial<Record<FeatureFlagKey, FeatureFlagState>> = {};

  // Try to satisfy from cache first; collect remaining for batch fetch
  const remaining: FeatureFlagKey[] = [];
  for (const k of unique) {
    const cached = _cache.get(k);
    if (cached && _isFresh(cached)) {
      result[k] = { enabled: cached.enabled, rolloutWave: cached.rolloutWave, cached: true };
    } else {
      remaining.push(k);
    }
  }

  if (remaining.length > 0) {
    try {
      const { data, error } = await (supabase as any)
        .from("feature_flags")
        .select("flag_key, enabled, rollout_wave")
        .in("flag_key", remaining);

      if (!error && data) {
        for (const row of data as Array<{
          flag_key: FeatureFlagKey;
          enabled: boolean;
          rollout_wave: string | null;
        }>) {
          const entry: CacheEntry = {
            enabled: !!row.enabled,
            rolloutWave: row.rollout_wave,
            fetchedAt: Date.now(),
          };
          _cache.set(row.flag_key, entry);
          result[row.flag_key] = {
            enabled: entry.enabled,
            rolloutWave: entry.rolloutWave,
            cached: false,
          };
        }
      }

      // Any flag not returned by the query → fail-closed default
      for (const k of remaining) {
        if (!(k in result)) {
          result[k] = { enabled: false, rolloutWave: null, cached: false };
        }
      }
    } catch {
      for (const k of remaining) {
        if (!(k in result)) {
          result[k] = { enabled: false, rolloutWave: null, cached: false };
        }
      }
    }
  }

  return result as Record<FeatureFlagKey, FeatureFlagState>;
}

/**
 * Test-only: clear the in-process cache.
 */
export function _resetFeatureFlagCacheForTests(): void {
  _cache.clear();
}
