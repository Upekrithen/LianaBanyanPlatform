import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BushelChapter {
  shadow: number;
  componentClass: string;
  filePath: string;
  lineCount: number;
  testPath: string | null;
  testPass: boolean;
  ts: string;
  hmac: string;
  salt: string;
  buildStatus: "shipped" | "partial" | "blocked";
  blockers: string[];
}

export interface BushelScorecard {
  bushelId: string;
  label: string;
  session: string;
  totalUnits: number;
  shippedUnits: number;
  partialUnits: number;
  blockedUnits: number;
  testPassRate: number;
  costReceiptUsd: number | null;
  wallClockMinutes: number | null;
  candlePower: number | null;
  codexId: string | null;
  codexBound: boolean;
  chapters: BushelChapter[];
  landedAt: string | null;
}

// Static scorecard data derived from substrate manifests
// In productized form this would read via read-substrate-ledger edge fn
const BUSHEL_SCORECARDS: BushelScorecard[] = [
  {
    bushelId: "bushel_1",
    label: "Bushel 1 — The Reckoning",
    session: "BP020",
    totalUnits: 516,
    shippedUnits: 508,
    partialUnits: 5,
    blockedUnits: 3,
    testPassRate: 0.983,
    costReceiptUsd: null,
    wallClockMinutes: null,
    candlePower: 8,
    codexId: null,
    codexBound: false,
    chapters: [],
    landedAt: "2026-05-02T23:30:00Z",
  },
  {
    bushelId: "bushel_2",
    label: "Bushel 2 — Scaling Showcase",
    session: "BP020",
    totalUnits: 64,
    shippedUnits: 62,
    partialUnits: 2,
    blockedUnits: 0,
    testPassRate: 0.97,
    costReceiptUsd: null,
    wallClockMinutes: null,
    candlePower: 64,
    codexId: null,
    codexBound: false,
    chapters: [],
    landedAt: "2026-05-02T22:00:00Z",
  },
  {
    bushelId: "bushel_7",
    label: "Bushel 7 — 3-Layer Taxonomy Coverage Audit",
    session: "BP021",
    totalUnits: 64,
    shippedUnits: 61,
    partialUnits: 2,
    blockedUnits: 1,
    testPassRate: 0.953,
    costReceiptUsd: 12.0,
    wallClockMinutes: 14,
    candlePower: 64,
    codexId: "LB-CODEX-0025",
    codexBound: true,
    chapters: [],
    landedAt: "2026-05-03T10:52:00Z",
  },
  {
    bushelId: "bushel_8",
    label: "Bushel 8 — LB Frame Substrate UI",
    session: "BP021",
    totalUnits: 0,
    shippedUnits: 0,
    partialUnits: 0,
    blockedUnits: 0,
    testPassRate: 0,
    costReceiptUsd: null,
    wallClockMinutes: null,
    candlePower: 64,
    codexId: "LB-CODEX-0026",
    codexBound: false,
    chapters: [],
    landedAt: null,
  },
  {
    bushelId: "bushel_10",
    label: "Bushel 10 — Patent Applications",
    session: "BP021",
    totalUnits: 13,
    shippedUnits: 13,
    partialUnits: 0,
    blockedUnits: 0,
    testPassRate: 1.0,
    costReceiptUsd: null,
    wallClockMinutes: null,
    candlePower: 13,
    codexId: null,
    codexBound: false,
    chapters: [],
    landedAt: "2026-04-20T00:00:00Z",
  },
  {
    bushelId: "bushel_14",
    label: "Bushel 14 — Phase Mimic Trunk",
    session: "BP021",
    totalUnits: 0,
    shippedUnits: 0,
    partialUnits: 0,
    blockedUnits: 0,
    testPassRate: 0,
    costReceiptUsd: null,
    wallClockMinutes: null,
    candlePower: 0,
    codexId: null,
    codexBound: false,
    chapters: [],
    landedAt: null,
  },
];

export function useBushelScorecard(bushelId?: string) {
  const { user } = useAuth();

  return useQuery<BushelScorecard[]>({
    queryKey: ["bushel-scorecard", bushelId ?? "all", user?.id],
    queryFn: async () => {
      if (bushelId) {
        const found = BUSHEL_SCORECARDS.find((b) => b.bushelId === bushelId);
        return found ? [found] : [];
      }
      return BUSHEL_SCORECARDS;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
