/**
 * useConductorMode — Conductor Mode Preference Hook
 * K446a · Phase 1.4 · Innovation #2277
 *
 * Provides access to the member's Conductor mode preference and per-query override.
 *
 * - `mode` persists to the `members` table via `conductor_mode` column
 *   (added by migration 20260425000001_k446a_conductor_mode_column.sql)
 * - `override` is per-query-session state, NOT persisted (intentional)
 *
 * Automatic-transmission metaphor for end-user-facing strings (per K446a spec):
 *   "auto"        → "Automatic (recommended)"
 *   "manual"      → "Manual (I'll choose each time)"
 *   "vendor-lock" → "Fixed Gear (always use one provider)"
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ConductorMode, MemberOverride } from "@/lib/conductor/router";

export type { ConductorMode, MemberOverride };

/** Human-readable label for each mode (automatic-transmission metaphor). */
export const CONDUCTOR_MODE_LABELS: Record<ConductorMode, string> = {
  auto: "Automatic (recommended)",
  manual: "Manual (choose each time)",
  "vendor-lock": "Fixed Gear (always use one provider)",
};

const QUERY_KEY = "conductor-mode";
const DEFAULT_MODE: ConductorMode = "auto";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function _fetchMode(userId: string): Promise<ConductorMode> {
  const { data, error } = await (supabase as any)
    .from("members")
    .select("conductor_mode")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULT_MODE;
  const raw = data.conductor_mode as string | null;
  if (raw === "manual" || raw === "vendor-lock" || raw === "auto") return raw;
  return DEFAULT_MODE;
}

async function _persistMode(userId: string, mode: ConductorMode): Promise<void> {
  await (supabase as any)
    .from("members")
    .update({ conductor_mode: mode })
    .eq("id", userId);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useConductorMode(): {
  mode: ConductorMode;
  setMode: (m: ConductorMode) => void;
  override: MemberOverride | null;
  setOverride: (o: MemberOverride | null) => void;
  clearOverride: () => void;
  isLoading: boolean;
} {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Persisted mode from Supabase
  const { data: persistedMode, isLoading } = useQuery({
    queryKey: [QUERY_KEY, user?.id],
    queryFn: () => (user ? _fetchMode(user.id) : Promise.resolve(DEFAULT_MODE)),
    enabled: !!user,
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ mode }: { mode: ConductorMode }) => {
      if (!user) return Promise.resolve();
      return _persistMode(user.id, mode);
    },
    onSuccess: (_data, { mode }) => {
      queryClient.setQueryData([QUERY_KEY, user?.id], mode);
    },
  });

  const setMode = useCallback(
    (m: ConductorMode) => {
      mutation.mutate({ mode: m });
    },
    [mutation],
  );

  // Per-query-session override — NOT persisted
  const [override, setOverride] = useState<MemberOverride | null>(null);
  const clearOverride = useCallback(() => setOverride(null), []);

  return {
    mode: persistedMode ?? DEFAULT_MODE,
    setMode,
    override,
    setOverride,
    clearOverride,
    isLoading,
  };
}
