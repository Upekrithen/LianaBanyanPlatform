/**
 * The Roll — /roll/
 * Cooperative-Class Peer-Mesh Ratification Roster
 * BP044 W1 · Supersedes /council/ (BP043 PEC Council)
 * Canon: the_roll_get_on_a_roll_cooperative_class_peer_mesh_ratification_bp044.eblet.md
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Star, Crown, Search, Vote, PlusCircle, Shield, Leaf, AlertCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RollMember {
  id: string;
  display_name: string;
  class: string;
  famous_class: boolean;
  prong_b_body_cam_class?: string;
  repentance_class_anchor: boolean;
  crown_initiative?: string;
  pedestal_vote_status: string;
  peer_witness_count: number;
  dual_veto_trigger: boolean;
  lb_not_suggesting: boolean;
  deceased_class: boolean;
  tribute_class: boolean;
  cross_stack_initiatives: string[];
  structurally_load_bearing: boolean;
  cinema_canon_anchor?: string;
  public_bio_summary?: string;
  body_cam_status_badge?: string;
  bp_session_ratified: string;
  created_at: string;
}

interface RollVoteTally {
  roll_member_id: string;
  yes_count: number;
  no_count: number;
  abstain_count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CLASS_LABELS: Record<string, string> = {
  founder_personal_anchor: "Founder Anchor",
  founder_reserved_20:     "Founder Reserved",
  captains_roll:           "Captain's Roll",
  crown_roll:              "Crown Roll",
  sleeper_roll:            "Sleeper Roll",
  the_roll_open:           "The Roll",
  pedestal_roll:           "Pedestal Roll",
};

const CLASS_COLORS: Record<string, string> = {
  founder_personal_anchor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  founder_reserved_20:     "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  captains_roll:           "bg-blue-500/20 text-blue-300 border-blue-500/30",
  crown_roll:              "bg-purple-500/20 text-purple-300 border-purple-500/30",
  sleeper_roll:            "bg-slate-500/20 text-slate-300 border-slate-500/30",
  the_roll_open:           "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  pedestal_roll:           "bg-rose-500/20 text-rose-300 border-rose-500/30",
};

const BODY_CAM_COLORS: Record<string, string> = {
  green:    "bg-emerald-500/20 text-emerald-300",
  yellow:   "bg-yellow-500/20 text-yellow-300",
  deferred: "bg-slate-500/20 text-slate-400",
  pending:  "bg-slate-500/10 text-slate-500",
};

function BodyCamBadge({ status }: { status?: string }) {
  if (!status || status === "pending") return null;
  const label = status === "green" ? "Body-Cam ✓" : status === "yellow" ? "Body-Cam ⚠" : `Body-Cam (${status})`;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${BODY_CAM_COLORS[status] ?? BODY_CAM_COLORS.pending}`}>
      {label}
    </span>
  );
}

function ClassBadge({ cls }: { cls: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CLASS_COLORS[cls] ?? "bg-slate-700 text-slate-300"}`}>
      {CLASS_LABELS[cls] ?? cls}
    </span>
  );
}

function VoteStatusBadge({ status, vetoActive }: { status: string; vetoActive: boolean }) {
  if (vetoActive) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 border border-red-800/40">Vetoed</span>;
  if (status === "accept") return <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 border border-emerald-800/40">Accepted</span>;
  if (status === "decline") return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400 border border-slate-600/40">Declined</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/30 text-sky-400 border border-sky-800/30">Pending</span>;
}

// ── RollMemberCard ────────────────────────────────────────────────────────────

function RollMemberCard({
  member,
  onVote,
  session,
}: {
  member: RollMember;
  onVote: (memberId: string, vote: "yes" | "no" | "abstain") => void;
  session: unknown;
}) {
  const [voting, setVoting] = useState(false);

  const handleVote = async (v: "yes" | "no" | "abstain") => {
    if (!session) return;
    setVoting(true);
    await onVote(member.id, v);
    setVoting(false);
  };

  return (
    <Card className="bg-card/60 border-border/40 hover:border-border/70 transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {member.display_name}
            </CardTitle>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ClassBadge cls={member.class} />
              {member.famous_class && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-800/30">
                  <Star className="inline w-2.5 h-2.5 mr-1" />Famous
                </span>
              )}
              {member.repentance_class_anchor && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/30 text-violet-400 border border-violet-800/30">
                  Repentance Anchor
                </span>
              )}
              {member.structurally_load_bearing && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-800/30">
                  <Shield className="inline w-2.5 h-2.5 mr-1" />Load-Bearing
                </span>
              )}
              <BodyCamBadge status={member.body_cam_status_badge} />
              <VoteStatusBadge status={member.pedestal_vote_status} vetoActive={member.dual_veto_trigger} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {member.public_bio_summary && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {member.public_bio_summary}
          </p>
        )}
        {member.crown_initiative && (
          <div className="flex items-center gap-1.5 text-xs text-purple-400">
            <Crown className="w-3 h-3" />
            <span>Crown: {member.crown_initiative.replace(/_/g, " ")}</span>
          </div>
        )}
        {member.cinema_canon_anchor && (
          <div className="text-xs text-slate-500 italic">
            Cinema anchor: {member.cinema_canon_anchor}
          </div>
        )}
        {member.cross_stack_initiatives.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.cross_stack_initiatives.map((i) => (
              <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                {i}
              </span>
            ))}
          </div>
        )}

        {/* Voting UI — member-class (authenticated only) */}
        {session && member.pedestal_vote_status === "pending" && !member.dual_veto_trigger && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/30">
            <span className="text-xs text-muted-foreground">Your vote:</span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20"
              disabled={voting}
              onClick={() => handleVote("yes")}
            >
              <Vote className="w-3 h-3 mr-1" />Yes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs border-red-700/50 text-red-400 hover:bg-red-900/20"
              disabled={voting}
              onClick={() => handleVote("no")}
            >
              No
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2 text-xs text-slate-400"
              disabled={voting}
              onClick={() => handleVote("abstain")}
            >
              Abstain
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── RollPage (main) ───────────────────────────────────────────────────────────

export default function RollPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<RollMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("roll_members")
        .select("*")
        // Suppress lb_not_suggesting from public display per cooperative-class governance restraint
        .eq("lb_not_suggesting", false)
        .eq("tribute_class", false)  // Tribute-class not displayed as roster members
        .order("bp_session_ratified", { ascending: false })
        .order("display_name");

      if (err) {
        setError(err.message);
      } else {
        setMembers(data ?? []);
      }
      setLoading(false);
    }
    fetchMembers();
  }, [supabase]);

  const handleVote = async (memberId: string, vote: "yes" | "no" | "abstain") => {
    if (!session) return;
    const { error: voteErr } = await supabase.from("roll_votes").insert({
      roll_member_id: memberId,
      voter_class: "member",
      voter_id: session.user.id,
      vote,
    });
    if (voteErr) console.error("Vote error:", voteErr.message);
  };

  // Filter by tab
  const filtered = members.filter((m) => {
    if (m.dual_veto_trigger) return false; // Don't show vetoed members publicly
    const matchSearch = !search || m.display_name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "famous") return m.famous_class;
    if (activeTab === "non_famous") return !m.famous_class;
    if (activeTab === "crown") return m.class === "crown_roll";
    if (activeTab === "pedestal") return m.class === "pedestal_roll";
    if (activeTab === "load_bearing") return m.structurally_load_bearing;
    return true;
  });

  const totalVisible = members.filter((m) => !m.dual_veto_trigger).length;
  const famousCount = members.filter((m) => !m.dual_veto_trigger && m.famous_class).length;
  const nonFamousCount = members.filter((m) => !m.dual_veto_trigger && !m.famous_class).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">The Roll</h1>
              <p className="text-sm text-muted-foreground">
                Cooperative-Class Peer-Mesh Ratification · Get on a Roll
              </p>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            The Roll is the cooperative-substrate authority roster. Cooperative-class authority
            figures are invited to <em>Get on a Roll</em> through cooperative-class peer-mesh
            ratification — 2 non-famous cooperative-class authorities for every 1 already-amplified
            voice. Substrate amplification flows to those who need it.
          </p>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">{totalVisible}</strong> on the Roll</span>
            <span><strong className="text-foreground">{famousCount}</strong> famous-class</span>
            <span><strong className="text-foreground">{nonFamousCount}</strong> non-famous-class
              {" "}<span className="text-xs text-muted-foreground/60">(2:1 ratio target)</span>
            </span>
          </div>

          {/* 2:1 ratio bar */}
          {totalVisible > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full bg-amber-500/60 rounded-full"
                  style={{ width: `${Math.round((famousCount / totalVisible) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {Math.round((nonFamousCount / Math.max(famousCount, 1)) * 10) / 10}:1
                non-famous ratio <span className="text-emerald-500">(target 2:1)</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Action bar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Roll members..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link to="/roll/nominate">
            <Button variant="outline" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Nominate (Open Nomination)
            </Button>
          </Link>
        </div>

        {/* ── Open Nomination callout ──────────────────────────────────────── */}
        <div className="mb-6 p-4 rounded-lg border border-emerald-800/30 bg-emerald-950/20">
          <div className="flex items-start gap-3">
            <Leaf className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-300">Open Nomination · Anyone can nominate</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Including self-nomination. The substrate self-limits via Body-Cam doctrine,
                3-prong cooperative-craft authority test, and cooperative-class peer-witness
                requirement. Non-famous candidates need ≥2 peer witnesses.
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({totalVisible})</TabsTrigger>
            <TabsTrigger value="famous">Famous-Class ({famousCount})</TabsTrigger>
            <TabsTrigger value="non_famous">Non-Famous ({nonFamousCount})</TabsTrigger>
            <TabsTrigger value="crown">Crown Roll</TabsTrigger>
            <TabsTrigger value="pedestal">Pedestal Roll</TabsTrigger>
            <TabsTrigger value="load_bearing">Load-Bearing</TabsTrigger>
          </TabsList>

          {["all", "famous", "non_famous", "crown", "pedestal", "load_bearing"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              {loading && (
                <div className="text-center py-12 text-muted-foreground">Loading Roll...</div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-950/20 border border-red-800/30 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error loading Roll: {error}</span>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {search ? `No Roll members matching "${search}"` : "No Roll members in this category yet."}
                </div>
              )}
              {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((m) => (
                    <RollMemberCard
                      key={m.id}
                      member={m}
                      onVote={handleVote}
                      session={session}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* ── Canon footer ────────────────────────────────────────────────── */}
        <div className="mt-12 pt-6 border-t border-border/30 text-xs text-muted-foreground/60 space-y-1">
          <p>The Roll · BP044 W1 · Supersedes BP043 PEC Council 100-cap · Cooperative-Class Peer-Mesh Ratification.</p>
          <p>Dual-veto: Founder OR Trinity either alone suffices · structural-inversion-class only · never political-class.</p>
          <p>Voting: Founder always supersedes · Pedestal Roll majority + Member majority + Founder non-veto = ratified.</p>
          <p>2:1 non-famous-to-famous ratio — cooperative-substrate identity-class invariant.</p>
        </div>
      </div>
    </div>
  );
}
