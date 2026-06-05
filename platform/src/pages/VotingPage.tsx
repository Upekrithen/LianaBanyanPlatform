/**
 * VotingPage -- /governance/voting
 * Wave 12 / Phase beta (W12 depth pass)
 *
 * Member voting interface: open proposals, cast vote, council elections.
 * The 5% cap: no single member/entity may cast more than 5% of total
 * available votes on any single item (attention cap, not financial).
 *
 * W12 changes:
 *   - cast_vote_with_cap_check RPC instead of direct insert (5% cap server-side)
 *   - Supabase Realtime subscription on vote_allocations for live count updates
 *   - capEnforcement.ts used for pre-flight client check + UI feedback
 *
 * Securities-clean: voting = governance participation only.
 * Marks are participation records, not securities.
 */
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useA11yAnnouncer } from "@/hooks/useA11yAnnouncer";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Vote,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Crown,
  Shield,
  Info,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import { checkVoteCap, capStatusLabel } from "@/lib/governance/capEnforcement";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Proposal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  vote_count?: number;
  vote_class?: string;
}

interface CouncilCycle {
  id: string;
  cycle_label: string;
  status: string;
  cycle_start: string;
  cycle_end: string;
}

interface MemberVote {
  id: string;
  votable_item_id: string;
  vote_class: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIVE_PCT_CAP_LABEL =
  "The 5% Participation Cap: No member or coordinated group may represent more than 5% of total votes cast on any governance item. This protects cooperative decision-making from concentration of influence.";

const CAP_PCT = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: "bg-green-500/10 text-green-600 border-green-500/20",
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    closed: "bg-slate-500/10 text-slate-500 border-slate-500/20",
    passed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    failed: "bg-red-500/10 text-red-600 border-red-500/20",
  };
  return map[status] ?? "bg-slate-500/10 text-slate-500";
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CapBanner() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">
            Governance Participation Cap:{" "}
          </span>
          {FIVE_PCT_CAP_LABEL}
        </p>
      </CardContent>
    </Card>
  );
}

interface VotePanelProps {
  itemId: string;
  totalVotes: number;
  myVoteCount: number;
  myVoteClass: string | null;
  onVote: (itemId: string, voteClass: string) => void;
  isLoading: boolean;
}

function VotePanel({
  itemId,
  totalVotes,
  myVoteCount,
  myVoteClass,
  onVote,
  isLoading,
}: VotePanelProps) {
  const capCheck = checkVoteCap(myVoteCount, totalVotes);
  const statusLabel = capStatusLabel(myVoteCount, totalVotes);

  return (
    <div className="space-y-2">
      {myVoteClass ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>
            You voted:{" "}
            <span className="font-medium text-foreground capitalize">
              {myVoteClass}
            </span>
          </span>
        </div>
      ) : !capCheck.allowed ? (
        <div className="flex items-center gap-2 text-xs text-amber-500">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>5% cap reached -- contact a Steward to review</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-2 flex-wrap">
            {["support", "abstain", "reject"].map((vc) => (
              <Button
                key={vc}
                size="sm"
                variant={vc === "support" ? "default" : "outline"}
                disabled={isLoading}
                className="capitalize text-xs"
                onClick={() => onVote(itemId, vc)}
              >
                {vc === "support" && <CheckCircle className="w-3 h-3 mr-1" />}
                {vc === "reject" && <XCircle className="w-3 h-3 mr-1" />}
                {vc}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{statusLabel}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function VotingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [castingId, setCastingId] = useState<string | null>(null);
  const { announce } = useA11yAnnouncer();

  // Open votable items
  const { data: votableItems = [], isLoading: loadingItems } = useQuery({
    queryKey: ["governance-voting-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("votable_items")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      return (data ?? []) as Array<{
        id: string;
        title: string;
        description: string | null;
        item_type: string;
        status: string;
        total_credits: number | null;
        created_at: string;
      }>;
    },
  });

  // My votes on votable items
  const { data: myVotes = [] } = useQuery({
    queryKey: ["governance-my-votes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("vote_allocations")
        .select("id, votable_item_id, vote_class, created_at")
        .eq("member_id", user!.id);
      return (data ?? []) as MemberVote[];
    },
  });

  // Council voting cycles
  const { data: cycles = [] } = useQuery({
    queryKey: ["governance-council-cycles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("council_voting_cycles")
        .select("*")
        .order("starts_at", { ascending: false })
        .limit(10);
      return (data ?? []) as CouncilCycle[];
    },
  });

  // My council votes
  const { data: myCouncilVotes = [] } = useQuery({
    queryKey: ["governance-council-votes-mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("council_votes")
        .select("id, cycle_id, vote_class, cast_at")
        .eq("voter_member_id", user!.id);
      return (data ?? []) as Array<{
        id: string;
        cycle_id: string;
        vote_class: string;
        cast_at: string;
      }>;
    },
  });

  // Proposals (open)
  const { data: proposals = [] } = useQuery({
    queryKey: ["governance-proposals-open"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("id, title, description, status, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Proposal[];
    },
  });

  // Cast vote mutation -- uses server-side RPC with 5% cap enforcement
  const castVoteMut = useMutation({
    mutationFn: async ({
      itemId,
      voteClass,
    }: {
      itemId: string;
      voteClass: string;
    }) => {
      if (!user) throw new Error("Must be signed in to vote");
      const { data, error } = await supabase.rpc("cast_vote_with_cap_check" as never, {
        p_item_id: itemId,
        p_vote_class: voteClass,
      } as never);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Vote recorded");
      announce("Vote recorded successfully.", "assertive");
      qc.invalidateQueries({ queryKey: ["governance-my-votes"] });
      qc.invalidateQueries({ queryKey: ["governance-voting-items"] });
      setCastingId(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not record vote");
      announce(`Vote failed: ${err.message || "Could not record vote"}`, "assertive");
    },
  });

  // Supabase Realtime: subscribe to vote_allocations changes for live count updates
  useEffect(() => {
    const channel = supabase
      .channel("governance-votes-realtime")
      .on(
        "postgres_changes" as never,
        {
          event: "INSERT",
          schema: "public",
          table: "vote_allocations",
        } as never,
        () => {
          qc.invalidateQueries({ queryKey: ["governance-voting-items"] });
          qc.invalidateQueries({ queryKey: ["governance-my-votes"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  const myVoteMap = useMemo(() => {
    const m: Record<string, string> = {};
    myVotes.forEach((v) => {
      m[v.votable_item_id] = v.vote_class;
    });
    return m;
  }, [myVotes]);

  const activeCycles = cycles.filter((c) => c.status === "open");
  const pastCycles = cycles.filter((c) => c.status !== "open");

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance-voting">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/governance")}
            className="gap-2 -ml-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Governance
          </Button>
          <div className="flex items-center gap-3">
            <Vote className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                Member Voting
                <span className="flex items-center gap-1 text-xs font-normal text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  <Wifi className="w-3 h-3" />
                  Live
                </span>
              </h1>
              <p className="text-muted-foreground">
                Cast votes on open governance proposals and council elections.
                Voting is a governance participation right, not a financial
                instrument.
              </p>
            </div>
          </div>
        </div>

        <CapBanner />

        {/* Stats row -- aria-live: counts update via Realtime subscription */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" role="region" aria-label="Voting statistics">
          <Card>
            <CardContent className="pt-4 text-center">
              <Vote className="w-5 h-5 mx-auto mb-1 text-primary" aria-hidden="true" />
              <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">{votableItems.length}</div>
              <div className="text-xs text-muted-foreground" id="open-items-label">Open Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Crown className="w-5 h-5 mx-auto mb-1 text-amber-500" aria-hidden="true" />
              <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">{activeCycles.length}</div>
              <div className="text-xs text-muted-foreground">Active Elections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" aria-hidden="true" />
              <div className="text-2xl font-bold" aria-live="polite" aria-atomic="true">{myVotes.length}</div>
              <div className="text-xs text-muted-foreground">Your Votes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Shield className="w-5 h-5 mx-auto mb-1 text-blue-500" aria-hidden="true" />
              <div className="text-2xl font-bold">{CAP_PCT}%</div>
              <div className="text-xs text-muted-foreground">Participation Cap</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="proposals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposals">Open Proposals</TabsTrigger>
            <TabsTrigger value="elections">Council Elections</TabsTrigger>
            <TabsTrigger value="history">Your Vote History</TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------------------- */}
          {/* OPEN PROPOSALS */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="proposals" className="space-y-4">
            {loadingItems ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading proposals...
              </p>
            ) : votableItems.length === 0 && proposals.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Vote className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No open proposals at this time. Proposals are submitted by
                    members of The 300.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {votableItems.map((item) => (
                  <Card key={item.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <CardDescription className="mt-1">
                              {item.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs capitalize">
                            {item.item_type}
                          </Badge>
                          <Badge
                            className={`text-xs ${statusBadge(item.status)}`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.created_at)}
                        </span>
                        {item.total_credits != null && (
                          <span>{item.total_credits} credits allocated</span>
                        )}
                      </div>
                      {user && (
                        <VotePanel
                          itemId={item.id}
                          totalVotes={item.total_credits ?? 0}
                          myVoteCount={myVoteMap[item.id] !== undefined ? 1 : 0}
                          myVoteClass={myVoteMap[item.id] ?? null}
                          onVote={(id, vc) => {
                            setCastingId(id);
                            castVoteMut.mutate({ itemId: id, voteClass: vc });
                          }}
                          isLoading={
                            castVoteMut.isPending && castingId === item.id
                          }
                        />
                      )}
                      {!user && (
                        <p className="text-xs text-muted-foreground">
                          Sign in to cast a vote.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Proposals from proposals table */}
                {proposals.map((prop) => (
                  <Card key={prop.id} className="hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {prop.title}
                          </CardTitle>
                          {prop.description && (
                            <CardDescription className="mt-1">
                              {prop.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge className={`text-xs ${statusBadge(prop.status)}`}>
                          {prop.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(prop.created_at)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* COUNCIL ELECTIONS */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="elections" className="space-y-4">
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="py-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  Council Elections
                </p>
                <p>
                  Councils elect Board representatives through structured voting
                  cycles. Each council nominates candidates; members of that
                  council cast one vote per open seat. The 5% participation cap
                  applies to council elections as well.
                </p>
              </CardContent>
            </Card>

            {activeCycles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active Elections
                </h2>
                {activeCycles.map((cycle) => {
                  const myVote = myCouncilVotes.find(
                    (v) => v.cycle_id === cycle.id
                  );
                  return (
                    <Card key={cycle.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">
                            {cycle.cycle_label}
                          </CardTitle>
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            Open
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatDate(cycle.cycle_start)} --{" "}
                          {formatDate(cycle.cycle_end)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {myVote ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>
                              Voted:{" "}
                              <span className="capitalize font-medium text-foreground">
                                {myVote.vote_class}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate("/roll")}
                          >
                            <Users className="w-3.5 h-3.5 mr-1.5" />
                            View Candidates
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {pastCycles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Past Elections
                </h2>
                {pastCycles.slice(0, 5).map((cycle) => (
                  <Card key={cycle.id} className="opacity-70">
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="text-sm">{cycle.cycle_label}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {cycle.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {cycles.length === 0 && (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Crown className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No election cycles yet.</p>
                </CardContent>
              </Card>
            )}

            {/* Nomination info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">How Council Elections Work</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">1. Nomination</p>
                  <p>
                    Any council member in good standing may be nominated. Self-nominations
                    require a second from another council member.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">2. Voting Window</p>
                  <p>
                    Elections run for 14 days. Each eligible member casts one vote
                    per open seat. The 5% participation cap ensures no bloc can
                    dominate the outcome.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">3. Tally and Seat</p>
                  <p>
                    The candidate with the most support votes earns the Board seat
                    for a 1-year term. Ties are resolved by the current Board
                    through a runoff vote.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">4. Audit</p>
                  <p>
                    All votes are recorded in the governance audit trail and the
                    IP Ledger. Records are immutable once finalized.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------------------------- */}
          {/* VOTE HISTORY */}
          {/* ---------------------------------------------------------------- */}
          <TabsContent value="history" className="space-y-4">
            {!user ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <p className="text-sm">Sign in to view your vote history.</p>
                </CardContent>
              </Card>
            ) : myVotes.length === 0 && myCouncilVotes.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  <Vote className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    You have not cast any votes yet. Open proposals appear in the
                    "Open Proposals" tab.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {myVotes.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Proposal vote</span>
                        <span className="ml-2 font-medium capitalize">
                          {v.vote_class}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(v.created_at)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
                {myCouncilVotes.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <div className="text-sm">
                        <Crown className="inline w-3.5 h-3.5 text-amber-500 mr-1.5" />
                        <span className="text-muted-foreground">Council vote</span>
                        <span className="ml-2 font-medium capitalize">
                          {v.vote_class}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(v.cast_at)}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground border-t pt-4">
          Voting is a cooperative governance participation right. It confers no
          financial interest, ownership claim, or economic entitlement. Marks
          earned through participation are cooperative credit records, not
          securities. Consult the operating agreement for full governance terms.
        </p>
      </div>
    </PortalPageLayout>
  );
}
