/**
 * useFeatureFlag — React Hook for Feature Flag State
 * K525 · Phase D.1 · Innovation #2277
 *
 * Wraps the `getFeatureFlag()` client with `@tanstack/react-query` so the
 * Conductor tab and other gated UI surfaces can render conditionally with
 * minimal boilerplate.
 *
 * Usage:
 *   const { enabled, isLoading } = useFeatureFlag("CONDUCTOR_BATON_ENABLED");
 *   if (!enabled) return null;
 */

import { useQuery } from "@tanstack/react-query";
import {
  getFeatureFlag,
  type FeatureFlagKey,
  type FeatureFlagState,
} from "@/lib/conductor/featureFlag";

const STALE_MS = 30_000;

export function useFeatureFlag(key: FeatureFlagKey): {
  enabled: boolean;
  rolloutWave: string | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery<FeatureFlagState>({
    queryKey: ["feature-flag", key],
    queryFn: () => getFeatureFlag(key),
    staleTime: STALE_MS,
  });

  return {
    enabled: data?.enabled ?? false,
    rolloutWave: data?.rolloutWave ?? null,
    isLoading,
  };
}
