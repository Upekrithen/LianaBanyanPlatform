import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DesignEntry,
  DesignGallery,
  DesignerAttributionDrawer,
  FourStagePipelineTracker,
  HistoricalWinnersArchive,
  LiveRoundCountdownBanner,
  MarkWeightVotingExplainer,
  SubmitDesignCTA,
  WinnerArchiveItem,
} from "@/components/v2/design-democracy";

function frameLabel(score: number, highest: number): DesignEntry["label"] {
  if (highest <= 0) return "Needs votes";
  const ratio = score / highest;
  if (ratio >= 0.85) return "Leading";
  if (ratio >= 0.45) return "Strong contender";
  return "Needs votes";
}

export default function DesignDemocracyV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("design-democracy");
  const queryClient = useQueryClient();
  const [designerDrawerOpen, setDesignerDrawerOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DesignEntry | null>(null);

  const roundsQuery = useQuery({
    queryKey: ["design-democracy-rounds"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battles" as any)
        .select("id,bounty_title,status,starts_at,ends_at,winner_id,updated_at,winner_payout")
        .order("ends_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        bounty_title: string;
        status: string;
        starts_at: string;
        ends_at: string;
        winner_id: string | null;
        updated_at: string;
        winner_payout: number;
      }>;
    },
  });

  const activeRound = useMemo(
    () =>
      (roundsQuery.data ?? []).find((round) => ["pending", "active", "voting"].includes((round.status || "").toLowerCase())) ??
      null,
    [roundsQuery.data],
  );

  const participantsQuery = useQuery({
    queryKey: ["design-democracy-participants", activeRound?.id],
    enabled: !!activeRound?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battle_participants")
        .select("id,battle_id,user_id,display_name,submission_url,vote_count,submitted_at")
        .eq("battle_id", activeRound!.id);
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        battle_id: string;
        user_id: string;
        display_name: string;
        submission_url: string | null;
        vote_count: number;
        submitted_at: string | null;
      }>;
    },
  });

  const votesQuery = useQuery({
    queryKey: ["design-democracy-votes", activeRound?.id],
    enabled: !!activeRound?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_battle_votes")
        .select("participant_id,vote_credits")
        .eq("battle_id", activeRound!.id);
      if (error) throw error;
      return (data ?? []) as Array<{ participant_id: string; vote_credits: number }>;
    },
  });

  const creditsBalanceQuery = useQuery({
    queryKey: ["design-democracy-credit-balance", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_ledger" as any)
        .select("amount")
        .eq("user_id", user!.id)
        .in("ledger_category", ["project_funder_credit", "commerce_creator", "project_funding"]);
      if (error) throw error;
      return (data ?? []) as Array<{ amount: number }>;
    },
  });

  const completedRounds = useMemo(
    () => (roundsQuery.data ?? []).filter((round) => (round.status || "").toLowerCase() === "completed"),
    [roundsQuery.data],
  );

  const completedParticipantsQuery = useQuery({
    queryKey: ["design-democracy-completed-participants", completedRounds.map((round) => round.id).join(",")],
    enabled: completedRounds.length > 0,
    queryFn: async () => {
      const battleIds = completedRounds.map((round) => round.id);
      const { data, error } = await supabase
        .from("design_battle_participants")
        .select("battle_id,user_id,display_name")
        .in("battle_id", battleIds);
      if (error) throw error;
      return (data ?? []) as Array<{ battle_id: string; user_id: string; display_name: string }>;
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ participantId, credits }: { participantId: string; credits: number }) => {
      if (!user?.id) throw new Error("Sign in required.");
      if (!activeRound?.id) throw new Error("No active round.");
      const safeCredits = Math.max(1, Math.floor(credits));
      const { error } = await supabase.from("design_battle_votes").insert({
        battle_id: activeRound.id,
        participant_id: participantId,
        voter_id: user.id,
        vote_credits: safeCredits,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vote recorded.");
      queryClient.invalidateQueries({ queryKey: ["design-democracy-votes"] });
      queryClient.invalidateQueries({ queryKey: ["design-democracy-rounds"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not cast vote."),
  });

  const voteByParticipant = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of votesQuery.data ?? []) {
      map.set(row.participant_id, (map.get(row.participant_id) ?? 0) + Number(row.vote_credits ?? 0));
    }
    return map;
  }, [votesQuery.data]);

  const maxVotes = useMemo(() => {
    let max = 0;
    for (const total of voteByParticipant.values()) {
      max = Math.max(max, total);
    }
    return max;
  }, [voteByParticipant]);

  const entries = useMemo<DesignEntry[]>(
    () =>
      (participantsQuery.data ?? []).map((participant) => {
        const score = voteByParticipant.get(participant.id) ?? Number(participant.vote_count ?? 0);
        return {
          id: participant.id,
          battleId: participant.battle_id,
          designerId: participant.user_id,
          designerName: participant.display_name || "Designer",
          submissionUrl: participant.submission_url,
          votes: score,
          label: frameLabel(score, maxVotes),
        };
      }),
    [participantsQuery.data, voteByParticipant, maxVotes],
  );

  const winnersArchive = useMemo<WinnerArchiveItem[]>(
    () =>
      completedRounds
        .slice(0, 8)
        .map((round) => {
          const winner = (completedParticipantsQuery.data ?? []).find(
            (entry) => entry.battle_id === round.id && entry.user_id === round.winner_id,
          );
          return {
            battleId: round.id,
            title: round.bounty_title,
            completedAt: round.updated_at,
            winnerName: winner?.display_name || "Winner recorded",
          };
        }),
    [completedParticipantsQuery.data, completedRounds],
  );

  const creditBalance = useMemo(
    () => (creditsBalanceQuery.data ?? []).reduce((sum, row) => sum + Number(row.amount || 0), 0),
    [creditsBalanceQuery.data],
  );

  const pipelineStats = useMemo(() => {
    const voted = entries.length;
    const prototyped = entries.filter((entry) => Boolean(entry.submissionUrl)).length;
    const produced = winnersArchive.length;
    const shipped = (roundsQuery.data ?? []).filter((round) => Number(round.winner_payout || 0) > 0).length;
    return { voted, prototyped, produced, shipped };
  }, [entries, winnersArchive.length, roundsQuery.data]);

  return (
    <AppShell
      xrayBase="design-democracy"
      pageTitle="Design Democracy"
      breadcrumbs="Member workspace / Product pipeline"
      hero={
        <Hero
          variant="app"
          eyebrow="Design Democracy"
          headline="Vote the community's next real product into existence."
          body="Submit a design for free. Use Credits to vote. Winners move through a 4-stage pipeline to shipped goods, with designers keeping 83.3% of revenue."
          primaryCTA={{ label: "See active round", href: "#design-democracy-gallery" }}
          secondaryCTA={{ label: "Submit a design", href: "#design-democracy-submit-cta" }}
          proofStrip={["Live rounds", "4-stage pipeline", "Designer keeps 83.3%"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <LiveRoundCountdownBanner
          round={
            activeRound
              ? {
                  id: activeRound.id,
                  title: activeRound.bounty_title,
                  status: activeRound.status,
                  startsAt: activeRound.starts_at,
                  endsAt: activeRound.ends_at,
                }
              : null
          }
        />

        <div id="design-democracy-gallery" data-xray-id="design-democracy-gallery-anchor">
          <DesignGallery
            entries={entries}
            maxCredits={creditBalance}
            onVote={async (participantId, credits) => voteMutation.mutateAsync({ participantId, credits })}
            onViewDesigner={(entry) => {
              setSelectedEntry(entry);
              setDesignerDrawerOpen(true);
            }}
          />
        </div>

        <MarkWeightVotingExplainer />

        <FourStagePipelineTracker
          voted={pipelineStats.voted}
          prototyped={pipelineStats.prototyped}
          produced={pipelineStats.produced}
          shipped={pipelineStats.shipped}
        />

        <div id="design-democracy-submit-cta">
          <SubmitDesignCTA
            onSubmit={() => {
              window.location.href = "/arena";
            }}
            onSeeRound={() => {
              document.getElementById("design-democracy-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>

        <HistoricalWinnersArchive items={winnersArchive} />

        <StickyMobileCTA primary={{ label: "See active round", href: "#design-democracy-gallery" }} />
      </div>

      <DesignerAttributionDrawer open={designerDrawerOpen} onOpenChange={setDesignerDrawerOpen} entry={selectedEntry} />
    </AppShell>
  );
}
