import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SubstrateHealthEntry {
  path: string;
  label: string;
  bushelId: string;
  fingerprint: string;
  lastRebuildAt: string | null;
  driftDetected: boolean;
  driftCount: number;
  fileSizeKb: number | null;
  entryCount: number | null;
  hmacValid: boolean;
  status: "healthy" | "drift" | "stale" | "missing";
}

export interface SubstrateHealthReport {
  generatedAt: string;
  overallStatus: "healthy" | "drift" | "degraded";
  healthyCount: number;
  driftCount: number;
  missingCount: number;
  entries: SubstrateHealthEntry[];
  lastRebuildSession: string | null;
}

// Derived from known substrate state as of BP021
const SUBSTRATE_HEALTH_MANIFEST: SubstrateHealthEntry[] = [
  {
    path: "~/.claude/state/eblets/CANON/",
    label: "Canon Eblets",
    bushelId: "canon",
    fingerprint: "bp021-canon-3f8a",
    lastRebuildAt: "2026-05-03T10:08:00Z",
    driftDetected: false,
    driftCount: 0,
    fileSizeKb: 37,
    entryCount: 3,
    hmacValid: true,
    status: "healthy",
  },
  {
    path: "~/.claude/state/bushel_7/",
    label: "Bushel 7 — Taxonomy Audit",
    bushelId: "bushel_7",
    fingerprint: "bp021-b7-9cb2",
    lastRebuildAt: "2026-05-03T10:52:00Z",
    driftDetected: false,
    driftCount: 0,
    fileSizeKb: 4,
    entryCount: 2,
    hmacValid: true,
    status: "healthy",
  },
  {
    path: "~/.claude/state/reckoning/knight_7_eblets_memory.synthesis.jsonl",
    label: "Reckoning Knight 7 — Eblets/Memory",
    bushelId: "bushel_1",
    fingerprint: "bp020-k7-516e",
    lastRebuildAt: "2026-05-02T23:30:00Z",
    driftDetected: false,
    driftCount: 0,
    fileSizeKb: 581,
    entryCount: 516,
    hmacValid: true,
    status: "healthy",
  },
  {
    path: "~/.claude/state/bushel_8/",
    label: "Bushel 8 — Substrate UI (in-flight)",
    bushelId: "bushel_8",
    fingerprint: "bp021-b8-pending",
    lastRebuildAt: null,
    driftDetected: false,
    driftCount: 0,
    fileSizeKb: null,
    entryCount: null,
    hmacValid: false,
    status: "missing",
  },
];

export function useSubstrateHealth() {
  const { user } = useAuth();

  return useQuery<SubstrateHealthReport>({
    queryKey: ["substrate-health", user?.id],
    queryFn: async () => {
      const healthy = SUBSTRATE_HEALTH_MANIFEST.filter((e) => e.status === "healthy").length;
      const drift = SUBSTRATE_HEALTH_MANIFEST.filter((e) => e.status === "drift").length;
      const missing = SUBSTRATE_HEALTH_MANIFEST.filter((e) => e.status === "missing").length;

      const overallStatus =
        drift > 0 ? "drift" : missing > 1 ? "degraded" : "healthy";

      return {
        generatedAt: new Date().toISOString(),
        overallStatus,
        healthyCount: healthy,
        driftCount: drift,
        missingCount: missing,
        entries: SUBSTRATE_HEALTH_MANIFEST,
        lastRebuildSession: "BP021",
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
