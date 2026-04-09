import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LOCK_COUNT = 12;
const LOCK_NAMES = [
  "The Lighthouse",
  "The Four Judges",
  "The Cornerstone",
  "The Spyglass",
  "The Forge",
  "The Bridge",
  "The Labyrinth Key",
  "The Beacon Trail",
  "The Durin Door",
  "The Candle Complete",
  "The Mirror Room",
  "The Two Mirrors",
] as const;

export function useSnowGateProgress() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["snow-gate-progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const userId = user!.id;

      const safeCount = async (
        promise: Promise<{ count: number | null; error: unknown }>,
      ): Promise<number> => {
        try {
          const { count, error } = await promise;
          if (error) return 0;
          return Number(count ?? 0);
        } catch {
          return 0;
        }
      };

      const existingLocks = await supabase
        .from("snow_gate_progress" as never)
        .select("lock_number")
        .eq("user_id", userId);

      const papers = await safeCount(
        supabase
          .from("paper_read_completions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      );
      const verdicts = await safeCount(
        supabase
          .from("star_chamber_verdicts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      );
      const discoveries = await safeCount(
        supabase
          .from("discovery_gates")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      );
      const production = await safeCount(
        supabase
          .from("production_campaigns")
          .select("id", { count: "exact", head: true })
          .eq("captain_user_id", userId),
      );
      const peerAsCreator = await safeCount(
        supabase
          .from("peer_contracts")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", userId),
      );
      const peerAsAcceptor = await safeCount(
        supabase
          .from("peer_contracts")
          .select("id", { count: "exact", head: true })
          .eq("acceptor_id", userId),
      );
      const candleFragments = await safeCount(
        supabase
          .from("babylon_candle_fragments" as never)
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId),
      );

      const sponsorProfilesRes = await supabase
        .from("sponsor_profiles")
        .select("id")
        .eq("user_id", userId);
      const sponsorIds = ((sponsorProfilesRes.data as { id: string }[] | null) ?? []).map((x) => x.id);
      const sponsorCount =
        sponsorIds.length > 0
          ? await safeCount(
              supabase
                .from("sponsorships")
                .select("id", { count: "exact", head: true })
                .in("sponsor_id", sponsorIds),
            )
          : 0;
      const sponsorRecipientCount =
        sponsorIds.length > 0
          ? await safeCount(
              supabase
                .from("sponsorships")
                .select("id", { count: "exact", head: true })
                .in("sponsor_id", sponsorIds)
                .not("recipient_id", "is", null),
            )
          : 0;

      const reportsVerified = await safeCount(
        supabase
          .from("arena_reports")
          .select("id", { count: "exact", head: true })
          .eq("reporter_id", userId)
          .in("status", ["verified", "reviewed", "resolved"]),
      );

      const beaconsRes = await supabase
        .from("beacons")
        .select("beacon_color")
        .eq("user_id", userId);
      const distinctBeaconColors = new Set(
        ((beaconsRes.data as { beacon_color: string | null }[] | null) ?? [])
          .map((b) => b.beacon_color)
          .filter(Boolean),
      ).size;

      const durinUnlocksRes = await supabase
        .from("durin_door_unlocks")
        .select("door_id")
        .eq("user_id", userId);
      const durinDoorCount = new Set(
        ((durinUnlocksRes.data as { door_id: string }[] | null) ?? []).map((d) => d.door_id),
      ).size;

      const userCandlesRes = await supabase
        .from("user_candles")
        .select("babylon_amount")
        .eq("user_id", userId)
        .maybeSingle();
      const babylonAmount = Number(userCandlesRes.data?.babylon_amount ?? 0);

      const ambassadorRes = await supabase
        .from("ambassadors")
        .select("id")
        .eq("user_id", userId);
      const ambassadorIds = ((ambassadorRes.data as { id: string }[] | null) ?? []).map((a) => a.id);
      const ambassadorAssessments =
        ambassadorIds.length > 0
          ? await safeCount(
              supabase
                .from("ambassador_certifications")
                .select("id", { count: "exact", head: true })
                .in("ambassador_id", ambassadorIds),
            )
          : 0;

      const lockSet = new Set<number>(
        ((existingLocks.data as { lock_number: number }[] | null) ?? []).map((x) => x.lock_number),
      );

      const conditionMet: boolean[] = [
        papers >= 1, // Lock 1: Lighthouse
        verdicts >= 4, // Lock 2: Four Judges
        sponsorCount >= 1, // Lock 3: Cornerstone (contribution behavior)
        discoveries >= 20, // Lock 4: Spyglass
        production >= 1, // Lock 5: Forge
        sponsorRecipientCount >= 1, // Lock 6: Bridge (sponsor someone)
        reportsVerified >= 3, // Lock 7: Labyrinth Key
        distinctBeaconColors >= 6, // Lock 8: Beacon Trail
        durinDoorCount >= 3, // Lock 9: Durin Door
        candleFragments >= 7 || babylonAmount >= 1, // Lock 10: Candle Complete
        ambassadorAssessments >= 1, // Lock 11: Mirror Room (assessment)
        peerAsCreator >= 1 && peerAsAcceptor >= 1, // Lock 12: Two Mirrors
      ];

      conditionMet.forEach((ok, idx) => {
        if (ok) lockSet.add(idx + 1);
      });

      const unlockRows = conditionMet
        .map((ok, idx) => ({ ok, lock_number: idx + 1 }))
        .filter((x) => x.ok)
        .filter((x) => !((existingLocks.data as { lock_number: number }[] | null) ?? []).some((l) => l.lock_number === x.lock_number))
        .map((x) => ({
          user_id: userId,
          lock_number: x.lock_number,
          lock_name: LOCK_NAMES[x.lock_number - 1],
          reward_claimed: false,
        }));

      if (unlockRows.length > 0) {
        await supabase
          .from("snow_gate_progress" as never)
          .upsert(unlockRows as never, { onConflict: "user_id,lock_number" });
      }

      const locks = Array.from({ length: LOCK_COUNT }, (_, i) => lockSet.has(i + 1));
      const totalCompleted = locks.filter(Boolean).length;
      const fragments = candleFragments;

      return {
        locks,
        totalCompleted,
        candleFragments: fragments,
        hasAccess: totalCompleted >= LOCK_COUNT,
      };
    },
    staleTime: 30_000,
  });

  return useMemo(
    () =>
      data ?? {
        locks: Array.from({ length: LOCK_COUNT }, () => false),
        totalCompleted: 0,
        candleFragments: 0,
        hasAccess: false,
      },
    [data, isLoading],
  );
}

