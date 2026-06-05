/**
 * PedestalVotePage -- Wave 11 / S15
 * =====================================
 * Real Pedestal voting pipeline.
 * Lists nominees from pedestal_vote_canon.
 * Members cast 1 vote per pedestal (server-side guard via cast_pedestal_vote RPC).
 * IP-Ledger entry logged on vote (branch.vote type).
 *
 * SECURITIES-CLEAN: Votes are cooperative participation. NOT equity or financial return.
 * BP073-W11 / S15 / S24
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Crown,
  Star,
  AlertCircle,
  CheckCircle,
  Vote,
  BookOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addToIPLedger } from "@/lib/nervous-system/ipLedger";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PedestalNominee {
  id: string;
  recipient_name: string;
  recipient_slug: string;
  pedestal_class: string;
  vote_status: string;
  notes: string | null;
  created_at: string;
}

interface MemberVote {
  pedestal_id: string;
}

// ─── Pedestal class badge ─────────────────────────────────────────────────────

const CLASS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  honorary: "default",
  active: "secondary",
  nominated: "outline",
  legacy: "outline",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PedestalVotePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [votingId, setVotingId] = useState<string | null>(null);

  // Fetch all nominees from pedestal_vote_canon
  const { data: nominees = [], isLoading } = useQuery({
    queryKey: ["pedestal-nominees"],
    queryFn: async (): Promise<PedestalNominee[]> => {
      const { data, error } = await supabase
        .from("pedestal_vote_canon" as never)
        .select("id, recipient_name, recipient_slug, pedestal_class, vote_status, notes, created_at")
        .order("created_at" as never, { ascending: false })
        .limit(50) as any;

      if (error) throw new Error(error.message);
      return (data ?? []) as PedestalNominee[];
    },
    staleTime: 60_000,
  });

  // Fetch member's existing votes
  const { data: myVotes = [] } = useQuery({
    queryKey: ["my-pedestal-votes", user?.id],
    queryFn: async (): Promise<MemberVote[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("pedestal_member_votes" as never)
        .select("pedestal_id")
        .eq("voter_id" as never, user.id) as any;

      if (error) return [];
      return (data ?? []) as MemberVote[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });

  const votedSet = new Set(myVotes.map((v) => v.pedestal_id));

  const voteMutation = useMutation({
    mutationFn: async (pedestalId: string) => {
      if (!user) throw new Error("Must be signed in to vote.");

      // S24: cast_pedestal_vote RPC (1-per-member guard)
      const { data, error } = await (supabase.rpc as any)(
        "cast_pedestal_vote",
        { p_pedestal_id: pedestalId, p_voter_id: user.id },
      );

      if (error) throw new Error(error.message);
      if (!data?.ok) {
        if (data?.reason === "already_voted") {
          throw new Error("You have already voted for this nominee.");
        }
        throw new Error("Vote failed.");
      }

      // Log to IP Ledger (branch.vote type)
      await addToIPLedger("branch.vote", {
        fork_competition_seq: 0,
        voted_branch_id: pedestalId,
        voted_by: user.id,
        rationale: "Pedestal nomination vote",
        voted_at: new Date().toISOString(),
        securities_note: "Vote = cooperative participation. NOT equity or financial return.",
      });

      return { ok: true, pedestalId };
    },
    onSuccess: (result) => {
      toast({
        title: "Vote cast!",
        description: "Your vote has been recorded and logged to the IP Ledger.",
      });
      qc.invalidateQueries({ queryKey: ["my-pedestal-votes"] });
      qc.invalidateQueries({ queryKey: ["pedestal-nominees"] });
      setVotingId(null);
    },
    onError: (err: Error) => {
      toast({ title: "Vote failed", description: err.message, variant: "destructive" });
      setVotingId(null);
    },
  });

  const handleVote = (pedestalId: string) => {
    if (!user || votingId) return;
    setVotingId(pedestalId);
    voteMutation.mutate(pedestalId);
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="pedestal-vote">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-7 w-7 text-amber-500" />
            Pedestal Nominations
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Vote for outstanding cooperative contributions. One vote per nomination per member.
          </p>
        </div>

        {/* IP Ledger tie */}
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-4 py-3">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Every vote is logged to the IP Ledger for provenance and attribution.
            "Provenance, not legal patent grant."
          </p>
        </div>

        {/* Securities disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">NOT A GUARANTEE.</span> Pedestal votes are
            cooperative participation -- not equity, not financial instruments, not guaranteed
            financial return. Pedestals recognize cooperative contribution.
          </p>
        </div>

        {/* Nominees grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : nominees.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Crown className="mx-auto mb-3 h-10 w-10 opacity-25" />
              <p className="text-sm">No nominations yet.</p>
              <p className="text-xs mt-1">
                <a href="/pedestal/nominate" className="underline">Nominate outstanding work</a> to start the vote.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {nominees.map((nominee) => {
              const hasVoted = votedSet.has(nominee.id);
              const isVoting = votingId === nominee.id;

              return (
                <Card
                  key={nominee.id}
                  className={`flex flex-col transition-colors ${
                    hasVoted ? "border-green-500/30 bg-green-500/5" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge
                        variant={CLASS_VARIANT[nominee.pedestal_class] ?? "outline"}
                        className="text-xs capitalize"
                      >
                        {nominee.pedestal_class}
                      </Badge>
                      {hasVoted && (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Voted
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm mt-2 leading-snug flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-500 shrink-0" />
                      {nominee.recipient_name}
                    </CardTitle>
                    {nominee.notes && (
                      <CardDescription className="text-xs line-clamp-2">
                        {nominee.notes}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="mt-auto">
                    {user ? (
                      hasVoted ? (
                        <div className="text-center text-xs text-green-700 font-medium py-2">
                          <CheckCircle className="inline h-3.5 w-3.5 mr-1" />
                          Vote recorded in IP Ledger
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-1.5"
                          onClick={() => handleVote(nominee.id)}
                          disabled={!!votingId}
                        >
                          <Vote className="h-3.5 w-3.5" />
                          {isVoting ? "Casting vote..." : "Cast Vote"}
                        </Button>
                      )
                    ) : (
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href="/login">Sign in to vote</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Pedestal votes = cooperative participation. NOT equity or financial return.
          IP: contributor retains attribution. Platform: non-exclusive license.
        </p>
      </div>
    </PortalPageLayout>
  );
}
