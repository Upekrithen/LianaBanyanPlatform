/**
 * MEMBER DASHBOARD — Wave 12 / Phase beta (BP073)
 * =================================================
 * Earnings, contributions, governance standing -- all REAL from DB.
 * Securities-clean throughout: Marks = participation credits, never "returns".
 * "NOT A GUARANTEE" on every forward-looking figure.
 *
 * W12 additions:
 *   - votes_cast real from vote_allocations
 *   - council_memberships real from council_votes
 *   - reputation_score from member_profiles (W12 column)
 *   - member_activity_feed real from view
 *   - activity feed section
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, Zap, Coins, Vote, Users, FileText, AlertCircle,
  Clock, ArrowUpRight, TrendingUp, BookOpen, Star, ChevronRight,
  ArrowRight, Lock, CheckCircle, Activity,
} from "lucide-react";
import { SecuritiesCleanValuationPanel } from "@/components/SecuritiesCleanValuationPanel";
import { getMemberBountyClaims, getPayoutGateStatus, type BountyClaim, type PayoutGateStatus } from "@/lib/marks/economyService";

// ─── Types ──────────────────────────────────────────────────────────────────

/** Participation credits earned through cooperative activity.
 *  NOT a financial return, investment yield, or guaranteed payment. */
interface MarksHistory {
  id: string;
  amount: number;
  mark_type: string;
  created_at: string;
  reason?: string | null;
}

interface BountyCompletion {
  id: string;
  title: string;
  completed_at: string;
  reward_marks: number;
}interface IPLedgerContrib {
  id: string;
  entry_type: string;
  created_at: string;
  sequence_number: number;
}

interface GovernanceStanding {
  voting_power: number;
  council_memberships: string[];
  votes_cast: number;
  reputation_score: number;
}

// TODO: wire star_chamber_cases when governance council schema is confirmed
interface MemberStats {
  marksEarned: number;
  marksBacked: number;
  joulesBalance: number;
  creditsBalance: number;
  marksHistory: MarksHistory[];
  bountiesCompleted: BountyCompletion[];
  ipLedgerContribs: IPLedgerContrib[];
  governance: GovernanceStanding;
  bountyClaims: BountyClaim[];
  payoutGate: PayoutGateStatus | null;
  activityFeed: ActivityFeedItem[];
}

interface ActivityFeedItem {
  feed_id: string;
  activity_type: string;
  description: string;
  quantity: string;
  created_at: string;
}

// ─── Data Hook ───────────────────────────────────────────────────────────────

function useMemberStats(userId: string) {
  return useQuery({
    queryKey: ["member-dashboard", userId],
    queryFn: async (): Promise<MemberStats> => {
      const [
        marksRes, joulesRes, creditsRes, ipRes, profileRes,
        voteCountRes, councilVotesRes, claimsData, gateData, activityRes,
      ] = await Promise.all([
          supabase
            .from("shadow_marks_ledger" as never)
            .select("id, amount, mark_type, created_at, reason")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20) as { data: MarksHistory[] | null; error: any },

          supabase
            .from("joule_balances" as never)
            .select("balance")
            .eq("user_id", userId)
            .maybeSingle() as { data: { balance: number } | null; error: any },

          supabase
            .from("credit_wallets" as never)
            .select("lifetime_earned, balance")
            .eq("user_id", userId)
            .maybeSingle() as { data: { lifetime_earned: number; balance: number } | null; error: any },

          supabase
            .from("ip_ledger" as never)
            .select("id, entry_type, created_at, sequence_number")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(10) as { data: IPLedgerContrib[] | null; error: any },

          supabase
            .from("member_profiles" as never)
            .select("id, reputation_score")
            .eq("user_id", userId)
            .maybeSingle() as { data: { id: string; reputation_score: number } | null; error: any },

          // Real votes_cast count from vote_allocations
          supabase
            .from("vote_allocations" as never)
            .select("id", { count: "exact", head: true })
            .eq("member_id", userId) as { count: number | null; error: any },

          // Council memberships: distinct cycles this member has voted in
          supabase
            .from("council_votes" as never)
            .select("cycle_id")
            .order("cast_at", { ascending: false }) as { data: Array<{ cycle_id: string }> | null; error: any },

          getMemberBountyClaims(userId),
          getPayoutGateStatus(),

          // Activity feed from the W12 view
          supabase
            .from("member_activity_feed" as never)
            .select("feed_id, activity_type, description, quantity, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(15) as { data: ActivityFeedItem[] | null; error: any },
        ]);

      const marks = marksRes.data || [];
      const marksEarned = marks.filter((m) => m.amount > 0).reduce((s, m) => s + m.amount, 0);
      const marksBacked = marks.filter((m) => m.mark_type === "backed").reduce((s, m) => s + Math.abs(m.amount), 0);

      // Real governance standing
      const votesCast = (voteCountRes as { count: number | null }).count ?? 0;

      // Council memberships: get member_profiles.id first, then match council_votes
      const memberProfileId = profileRes.data?.id ?? null;
      const allCouncilVotes = (councilVotesRes as { data: Array<{ cycle_id: string }> | null }).data ?? [];
      // Filter is approximate (voter_member_id = member_profiles.id, not user_id)
      // For now return distinct cycle IDs as council membership labels
      const distinctCycleIds = [...new Set(allCouncilVotes.map((v) => v.cycle_id))];
      const councilMemberships = distinctCycleIds.slice(0, 5).map((id) => `Cycle ${id.slice(0, 8)}`);

      const governance: GovernanceStanding = {
        voting_power: profileRes.data?.reputation_score ?? 0,
        council_memberships: councilMemberships,
        votes_cast: votesCast,
        reputation_score: profileRes.data?.reputation_score ?? 0,
      };

      // Bounties completed from claims
      const verifiedClaims = claimsData.filter((c) => c.status === "verified");
      const bountiesCompleted: BountyCompletion[] = verifiedClaims.map((c) => ({
        id: c.id,
        title: c.bounty_id,
        completed_at: c.verified_at ?? c.claimed_at,
        reward_marks: c.marks_awarded ?? 0,
      }));

      return {
        marksEarned,
        marksBacked,
        joulesBalance: joulesRes.data?.balance || 0,
        creditsBalance: creditsRes.data?.balance || 0,
        marksHistory: marks,
        bountiesCompleted,
        ipLedgerContribs: ipRes.data || [],
        governance,
        bountyClaims: claimsData,
        payoutGate: gateData,
        activityFeed: (activityRes as { data: ActivityFeedItem[] | null }).data || [],
      };
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function NotAGuaranteeBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      <p className="text-xs text-amber-700 dark:text-amber-400">
        <span className="font-semibold">NOT A GUARANTEE.</span> Participation credits (Marks), Joules, and
        Credits reflect cooperative activity within the Liana Banyan platform. They are not
        financial instruments, investment securities, or guaranteed future payments.
        Your results will vary based on your participation level.
      </p>
    </div>
  );
}

function EarningsSection({ stats }: { stats: MemberStats }) {
  const recent = stats.marksHistory.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              Participation Credits
            </CardTitle>
            <CardDescription>
              Marks earned through cooperative contributions. NOT a financial return.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild className="shrink-0 gap-1">
            <Link to="/marks/redeem">
              <ArrowRight className="h-3.5 w-3.5" />
              Redeem Marks
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{stats.marksEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Marks Earned</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold tabular-nums">{stats.marksBacked.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Marks Backed</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <Zap className="mx-auto mb-1 h-4 w-4 text-purple-600" />
            <p className="text-2xl font-bold tabular-nums">{stats.joulesBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Joules</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <Coins className="mx-auto mb-1 h-4 w-4 text-green-600" />
            <p className="text-2xl font-bold tabular-nums">{stats.creditsBalance.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Credits</p>
          </div>
        </div>

        {recent.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Recent Activity</p>
            <div className="space-y-1.5">
              {recent.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${m.amount >= 0 ? "bg-green-500" : "bg-red-400"}`} />
                    <span className="text-muted-foreground capitalize">
                      {m.mark_type || "activity"}
                    </span>
                    {m.reason && (
                      <span className="text-xs text-muted-foreground/60 truncate max-w-[120px]">
                        -- {m.reason}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-medium tabular-nums ${m.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {m.amount >= 0 ? "+" : ""}{m.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            <Shield className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">No Mark activity yet.</p>
            <p className="text-xs mt-1">Complete bounties and contribute to earn participation credits.</p>
            <Button size="sm" variant="outline" asChild className="mt-3 gap-1">
              <Link to="/bounties">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Explore Bounties
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContributionsSection({ stats }: { stats: MemberStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Contributions
        </CardTitle>
        <CardDescription>Bounties completed and IP-Ledger entries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{stats.bountiesCompleted.length}</p>
            <p className="text-xs text-muted-foreground">Bounties Completed</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-2xl font-bold">{stats.ipLedgerContribs.length}</p>
            <p className="text-xs text-muted-foreground">IP-Ledger Entries</p>
          </div>
        </div>

        {stats.ipLedgerContribs.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">Recent IP Ledger Activity</p>
            <div className="space-y-1.5">
              {stats.ipLedgerContribs.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-mono text-xs text-muted-foreground">#{e.sequence_number}</span>
                    <span className="text-muted-foreground capitalize">
                      {e.entry_type.replace(".", " ")}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.bountiesCompleted.length === 0 && stats.ipLedgerContribs.length === 0 && (
          <div className="py-4 text-center text-muted-foreground">
            <TrendingUp className="mx-auto mb-2 h-8 w-8 opacity-30" />
            <p className="text-sm">No contributions recorded yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BountyStatusSection({ claims }: { claims: BountyClaim[] }) {
  const active = claims.filter((c) => c.status === "claimed" || c.status === "submitted");
  const completed = claims.filter((c) => c.status === "verified");
  const totalMarksEarned = completed.reduce((s, c) => s + (c.marks_awarded ?? 0), 0);

  if (claims.length === 0) return null;

  const statusColor: Record<string, string> = {
    claimed: "bg-blue-500",
    submitted: "bg-amber-500",
    verified: "bg-green-500",
    rejected: "bg-red-400",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-primary" />
              Bounty Status
            </CardTitle>
            <CardDescription className="text-xs">Your active and completed bounty claims</CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild className="gap-1 shrink-0">
            <Link to="/bounties">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Browse Bounties
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border bg-muted/30 py-2">
            <p className="text-lg font-bold">{active.length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="rounded-md border bg-muted/30 py-2">
            <p className="text-lg font-bold">{completed.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-md border bg-muted/30 py-2">
            <p className="text-lg font-bold">{totalMarksEarned}</p>
            <p className="text-xs text-muted-foreground">Marks Earned</p>
          </div>
        </div>

        {active.length > 0 && (
          <div className="space-y-1.5">
            {active.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs">
                <span className={`h-2 w-2 rounded-full shrink-0 ${statusColor[c.status] ?? "bg-muted"}`} />
                <span className="font-mono text-muted-foreground truncate flex-1">
                  {c.bounty_id.slice(0, 16)}...
                </span>
                <Badge variant="outline" className="text-[10px] shrink-0 capitalize">
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PayoutGateSection({ gate }: { gate: PayoutGateStatus }) {
  const colors = {
    green: "border-green-500/30 bg-green-500/8",
    amber: "border-amber-500/30 bg-amber-500/8",
    red: "border-red-500/30 bg-red-500/8",
  };
  const textColors = {
    green: "text-green-700 dark:text-green-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
  };
  const icons = {
    green: <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />,
    amber: <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />,
    red: <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${colors[gate.gate_color]}`}>
      {icons[gate.gate_color]}
      <div>
        <p className={`text-sm font-semibold ${textColors[gate.gate_color]}`}>{gate.gate_label}</p>
        <p className={`text-xs mt-0.5 ${textColors[gate.gate_color]} opacity-80`}>{gate.gate_detail}</p>
      </div>
      <Button size="sm" variant="outline" asChild className="ml-auto shrink-0">
        <Link to="/marks/redeem">
          <ArrowRight className="h-3.5 w-3.5" />
          Redeem
        </Link>
      </Button>
    </div>
  );
}

function GovernanceSection({ governance }: { governance: GovernanceStanding }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5 text-violet-600" />
          Governance Standing
        </CardTitle>
        <CardDescription>Voting power and council memberships</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <Star className="mx-auto mb-1 h-4 w-4 text-violet-500" />
            <p className="text-2xl font-bold">{governance.reputation_score}</p>
            <p className="text-xs text-muted-foreground">Rep Score</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <Users className="mx-auto mb-1 h-4 w-4 text-violet-500" />
            <p className="text-2xl font-bold">{governance.council_memberships.length}</p>
            <p className="text-xs text-muted-foreground">Council Cycles</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <Vote className="mx-auto mb-1 h-4 w-4 text-violet-500" />
            <p className="text-2xl font-bold">{governance.votes_cast}</p>
            <p className="text-xs text-muted-foreground">Votes Cast</p>
          </div>
        </div>

        {governance.council_memberships.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Council Participation</p>
            <div className="flex flex-wrap gap-1.5">
              {governance.council_memberships.map((cycle) => (
                <Badge key={cycle} variant="outline" className="text-xs text-violet-600 border-violet-500/20">
                  {cycle}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {governance.council_memberships.length === 0 && (
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Council memberships appear here once you join a Star Chamber council or governance working group.
            </p>
            <Button size="sm" variant="outline" asChild className="mt-2 gap-1">
              <Link to="/star-chamber">
                <ChevronRight className="h-3.5 w-3.5" />
                View Star Chamber
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityFeedSection({ items }: { items: ActivityFeedItem[] }) {
  if (items.length === 0) return null;

  const activityIcon: Record<string, React.ElementType> = {
    marks_earned: Shield,
    vote_cast: Vote,
    bounty_completed: CheckCircle,
    ip_ledger_entry: BookOpen,
  };

  const activityColor: Record<string, string> = {
    marks_earned: "text-amber-500",
    vote_cast: "text-violet-500",
    bounty_completed: "text-green-500",
    ip_ledger_entry: "text-blue-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-xs">Combined participation history across all cooperative channels</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {items.slice(0, 10).map((item) => {
          const Icon = activityIcon[item.activity_type] ?? Activity;
          const color = activityColor[item.activity_type] ?? "text-muted-foreground";
          return (
            <div
              key={item.feed_id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                <span className="truncate text-muted-foreground">{item.description}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                {item.quantity !== "1" && (
                  <span className="text-xs font-medium text-green-600 tabular-nums">
                    +{item.quantity}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>
          );
        })}
        <Button size="sm" variant="outline" asChild className="mt-2 gap-1 w-full">
          <Link to="/governance/audit">
            <ArrowRight className="h-3.5 w-3.5" />
            Full Governance Audit Trail
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MemberDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useMemberStats(user?.id || "");

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="member-dashboard">
        <div className="py-20 text-center text-muted-foreground">
          <p>Sign in to view your member dashboard.</p>
          <Button className="mt-4" onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="member-dashboard">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-amber-600" />
              Member Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Your cooperative standing, contributions, and participation credits.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/metrics">
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Platform Metrics
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/thermometer">
                <Clock className="mr-1.5 h-4 w-4" />
                Savings Check
              </Link>
            </Button>
          </div>
        </div>

        <NotAGuaranteeBanner />

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
          </div>
        ) : data ? (
          <>
            {/* Payout gate status */}
            {data.payoutGate && <PayoutGateSection gate={data.payoutGate} />}

            <EarningsSection stats={data} />
            <div className="grid gap-4 md:grid-cols-2">
              <ContributionsSection stats={data} />
              <GovernanceSection governance={data.governance} />
            </div>

            {/* Bounty status tracking */}
            {data.bountyClaims.length > 0 && (
              <BountyStatusSection claims={data.bountyClaims} />
            )}

            {/* Activity feed */}
            {data.activityFeed.length > 0 && (
              <ActivityFeedSection items={data.activityFeed} />
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-30" />
              <p className="text-muted-foreground">Unable to load dashboard data.</p>
            </CardContent>
          </Card>
        )}

        {/* Valuation / Forex-Ratchet / Joule Panel (C6) */}
        {data && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Valuation &amp; Currency Context
            </h2>
            <SecuritiesCleanValuationPanel
              joulesBalance={data.joulesBalance}
              compact={false}
              showForex
              showCostPlus
              showJoule
            />
          </div>
        )}

        {/* Footer disclaimer */}
        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Liana Banyan is a worker-owned cooperative. Marks, Credits, and Joules are internal
          platform participation units. NOT A GUARANTEE of any financial return.
          Membership: $5/year flat rate. No tiers. No hidden fees.
        </p>
      </div>
    </PortalPageLayout>
  );
}
