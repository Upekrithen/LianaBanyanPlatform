/**
 * Crew Call — "We Need You To Do What You're Already Good At"
 * Route: /crew-call (protected). Grid of manufacturing process modules, claim Primary/Secondary/Backup.
 * Plus: HexIsle Engineering Bounties (7 bounties from Bishop Session 012).
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wrench, ChevronDown, ChevronUp, Hexagon, Zap, Award, AlertTriangle, Target, Beaker, Cog, Droplets, FlaskConical, Leaf, Send, CheckCircle, XCircle, Star } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { ProcessModuleCard } from "@/components/manufacturing/ProcessModuleCard";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";
import { toast } from "sonner";

interface DBBounty {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  category: string;
  priority: string;
  difficulty: string | null;
  required_skills: string[];
  reward_credits: number;
  reward_marks: number;
  reward_xp: number;
  reward_joules: number;
  stamp_criteria: Record<string, string>;
  deliverables: string[];
  status: string;
  max_claimants: number;
  created_at: string;
}

interface DBBountyClaim {
  id: string;
  bounty_id: string;
  user_id: string;
  role_level: string;
  status: string;
  submission_notes: string | null;
  submission_url: string | null;
  stamp_rating: number | null;
  reviewed_by: string | null;
  claimed_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const MAX_PRIMARY = 3;
const MAX_SECONDARY = 5;

export default function CrewCallPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ["manufacturing-process-modules"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("manufacturing_process_modules")
          .select("*")
          .eq("is_active", true)
          .order("process_name");
        if (!error && data && data.length > 0) return data;
      } catch { /* fall through */ }
      try {
        const { data, error } = await supabase
          .from("crew_call_roles")
          .select("*")
          .order("role_name");
        if (error) throw error;
        return (data || []).map((r: any) => ({
          id: r.id,
          process_name: r.role_name,
          process_type: r.category ?? "general",
          description: r.description,
          equipment_needed: null,
          skill_level: r.commitment_tier ?? "primary",
          is_active: true,
        }));
      } catch {
        return [];
      }
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["crew-call-assignments"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("crew_call_assignments")
          .select("process_module_id, user_id, role_level")
          .eq("status", "active");
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    },
  });

  const userIds = [...new Set((assignments || []).map((a: { user_id: string }) => a.user_id))];
  const { data: profileNames } = useQuery({
    queryKey: ["crew-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data } = await supabase.from("profiles").select("user_id, display_name, full_name").in("user_id", userIds);
      const map: Record<string, string> = {};
      (data || []).forEach((p: { user_id: string; display_name?: string; full_name?: string }) => {
        map[p.user_id] = p.display_name || p.full_name || "Crew";
      });
      return map;
    },
    enabled: userIds.length > 0,
  });

  const { data: pioneers } = useQuery({
    queryKey: ["process-pioneer-ledger"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("process_pioneer_ledger")
          .select("process_module_id");
        if (error) throw error;
        return new Set((data || []).map((p: { process_module_id: string }) => p.process_module_id));
      } catch {
        return new Set<string>();
      }
    },
  });

  // Bounties from DB
  const { data: bounties = [] } = useQuery({
    queryKey: ["hexisle-bounties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bounties" as never)
        .select("*")
        .eq("category", "hexisle_engineering")
        .neq("status", "cancelled")
        .order("priority");
      if (error) { console.error("Bounties fetch:", error); return []; }
      return (data || []) as DBBounty[];
    },
  });

  const { data: bountyClaims = [] } = useQuery({
    queryKey: ["bounty-claims"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bounty_claims" as never)
        .select("*");
      if (error) { console.error("Claims fetch:", error); return []; }
      return (data || []) as DBBountyClaim[];
    },
  });

  const claimMutation = useMutation({
    mutationFn: async ({
      processModuleId,
      roleLevel,
      isPioneer,
    }: { processModuleId: string; roleLevel: string; isPioneer: boolean }) => {
      if (!user) throw new Error("Sign in required");
      try {
        const { error } = await supabase.from("crew_call_assignments").upsert({
          user_id: user.id,
          process_module_id: processModuleId,
          role_level: roleLevel,
          is_process_pioneer: isPioneer,
          status: "active",
        }, { onConflict: "user_id,process_module_id" });
        if (error) throw error;
      } catch {
        const { error } = await supabase.from("crew_call_roles").update({
          claimed_by: user.id,
        }).eq("id", processModuleId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("You're on the crew.");
      queryClient.invalidateQueries({ queryKey: ["crew-call-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["manufacturing-process-modules"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to claim"),
  });

  const rosterByProcess: Record<string, { role: string; name: string }[]> = {};
  const countsByProcess: Record<string, { primary: number; secondary: number; backup: number }> = {};

  modules?.forEach((m: { id: string }) => {
    countsByProcess[m.id] = { primary: 0, secondary: 0, backup: 0 };
    rosterByProcess[m.id] = [];
  });

  assignments?.forEach((a: { process_module_id: string; role_level: string; user_id: string }) => {
    const c = countsByProcess[a.process_module_id];
    if (c) {
      if (a.role_level === "primary") c.primary++;
      else if (a.role_level === "secondary") c.secondary++;
      else c.backup++;
    }
    const name = profileNames?.[a.user_id] ?? "Crew";
    rosterByProcess[a.process_module_id] = rosterByProcess[a.process_module_id] || [];
    rosterByProcess[a.process_module_id].push({ role: a.role_level, name });
  });

  if (!user) {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="crew-call-page">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sign in to join the crew.
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="crew-call-page">
      <div className="space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold">Crew Call</h1>
          <p className="text-xl text-muted-foreground mt-2">
            We need you to do what you&apos;re already good at.
          </p>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><div className="h-6 bg-muted rounded" /></CardHeader>
                <CardContent><div className="h-20 bg-muted rounded" /></CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {modules?.map((mod: {
              id: string;
              process_name: string;
              process_type: string;
              description?: string;
              equipment_needed?: string[];
              skill_level: string;
            }) => {
              const counts = countsByProcess[mod.id] ?? { primary: 0, secondary: 0, backup: 0 };
              const primaryOpen = counts.primary < MAX_PRIMARY;
              const secondaryOpen = counts.secondary < MAX_SECONDARY;
              const isFirstPrimary = counts.primary === 0;
              return (
                <ProcessModuleCard
                  key={mod.id}
                  id={mod.id}
                  process_name={mod.process_name}
                  process_type={mod.process_type}
                  description={mod.description}
                  equipment_needed={mod.equipment_needed}
                  skill_level={mod.skill_level}
                  primaryCount={counts.primary}
                  secondaryCount={counts.secondary}
                  backupCount={counts.backup}
                  maxPrimary={MAX_PRIMARY}
                  maxSecondary={MAX_SECONDARY}
                  hasPioneer={pioneers?.has(mod.id) ?? false}
                  crewNames={rosterByProcess[mod.id] || []}
                  canClaim={!!user}
                  onClaimPrimary={primaryOpen ? () => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "primary",
                    isPioneer: isFirstPrimary,
                  }) : undefined}
                  onClaimSecondary={secondaryOpen ? () => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "secondary",
                    isPioneer: false,
                  }) : undefined}
                  onClaimBackup={() => claimMutation.mutate({
                    processModuleId: mod.id,
                    roleLevel: "backup",
                    isPioneer: false,
                  })}
                />
              );
            })}
          </div>
        )}

        {/* ── HexIsle Engineering Bounties ── */}
        <HexIsleBountyBoard bounties={bounties} claims={bountyClaims} userId={user?.id} />

        <section className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Know a maker with these skills? Send them a Cue Card.
          </p>
          <InviteCreatorCard />
        </section>
      </div>
    </PortalPageLayout>
  );
}

function BountyCard({ bounty, claims, userId }: { bounty: DBBounty; claims: DBBountyClaim[]; userId?: string }) {
  const [expanded, setExpanded] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitNotes, setSubmitNotes] = useState("");
  const [submitUrl, setSubmitUrl] = useState("");
  const queryClient = useQueryClient();

  const myClaim = claims.find(c => c.user_id === userId);
  const claimCount = claims.length;
  const stampEntries = Object.entries(bounty.stamp_criteria || {}).sort(([a], [b]) => Number(a) - Number(b));

  const claimMut = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Sign in required");
      const roleLevel = claimCount === 0 ? "primary" : claimCount === 1 ? "secondary" : "backup";
      const { error } = await supabase.from("bounty_claims" as never).insert({
        bounty_id: bounty.id,
        user_id: userId,
        role_level: roleLevel,
        status: "claimed",
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Bounty claimed!"); queryClient.invalidateQueries({ queryKey: ["bounty-claims"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Claim failed"),
  });

  const submitMut = useMutation({
    mutationFn: async () => {
      if (!myClaim) throw new Error("No claim");
      const { error } = await supabase.from("bounty_claims" as never).update({
        status: "submitted",
        submission_notes: submitNotes || null,
        submission_url: submitUrl || null,
      }).eq("id", myClaim.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Submission sent for review!"); setSubmitOpen(false); queryClient.invalidateQueries({ queryKey: ["bounty-claims"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Submit failed"),
  });

  return (
    <Card className="border-slate-700 bg-slate-900/50" data-xray-id={`bounty-${bounty.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-white">{bounty.title}</h3>
            {bounty.subtitle && <p className="text-xs text-slate-400">{bounty.subtitle}</p>}
          </div>
          <Badge className={PRIORITY_COLORS[bounty.priority] || PRIORITY_COLORS.medium}>{bounty.priority.toUpperCase()}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-amber-400 border-amber-500/30">
            <Zap className="w-3 h-3 mr-1" />{bounty.reward_credits.toLocaleString()} Credits
          </Badge>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
            {bounty.reward_marks} Marks
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">
            {bounty.reward_xp} XP
          </Badge>
          {bounty.difficulty && <Badge variant="secondary">{bounty.difficulty}</Badge>}
          <Badge variant="secondary" className="text-slate-400">{claimCount}/{bounty.max_claimants} claimed</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-300">{bounty.description}</p>

        <div className="flex flex-wrap gap-1">
          {(bounty.required_skills || []).map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{s}</span>
          ))}
        </div>

        {/* Claim / Submit actions */}
        <div className="flex gap-2 flex-wrap">
          {!myClaim && claimCount < bounty.max_claimants && userId && (
            <Button size="sm" onClick={() => claimMut.mutate()} disabled={claimMut.isPending}>
              {claimMut.isPending ? "Claiming..." : "Claim Bounty"}
            </Button>
          )}
          {myClaim && myClaim.status === "claimed" && (
            <Button size="sm" variant="outline" onClick={() => setSubmitOpen(!submitOpen)}>
              <Send className="w-3.5 h-3.5 mr-1" /> Submit Work
            </Button>
          )}
          {myClaim && myClaim.status === "submitted" && (
            <Badge className="bg-amber-500/20 text-amber-400">Submitted — awaiting review</Badge>
          )}
          {myClaim && myClaim.status === "approved" && (
            <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Approved ({myClaim.stamp_rating}/5)</Badge>
          )}
        </div>

        {/* Submission form */}
        {submitOpen && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2">
            <Input placeholder="Submission URL (Drive, GitHub, etc.)" value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} className="bg-slate-900" />
            <Textarea placeholder="Notes about your submission..." value={submitNotes} onChange={e => setSubmitNotes(e.target.value)} rows={2} className="bg-slate-900" />
            <Button size="sm" onClick={() => submitMut.mutate()} disabled={submitMut.isPending}>
              {submitMut.isPending ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        )}

        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-white">
              Deliverables & STAMP
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Deliverables</h4>
              <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                {(bounty.deliverables || []).map((d, i) => <li key={i}>{d}</li>)}
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">STAMP Quality Criteria</h4>
              <div className="space-y-1">
                {stampEntries.map(([score, criteria]) => (
                  <div key={score} className="flex gap-2 text-sm">
                    <span className="font-mono text-amber-400 w-4 shrink-0">{score}</span>
                    <span className="text-slate-300">{criteria}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">XP = {bounty.reward_xp} × quality_score / 5.0</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function BountyReviewCard({ claim, bounty }: { claim: DBBountyClaim; bounty: DBBounty }) {
  const [rating, setRating] = useState(3);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const reviewMut = useMutation({
    mutationFn: async (action: "approved" | "rejected") => {
      const { error } = await supabase.from("bounty_claims" as never).update({
        status: action,
        stamp_rating: action === "approved" ? rating : null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        completed_at: action === "approved" ? new Date().toISOString() : null,
      }).eq("id", claim.id);
      if (error) throw error;

      if (action === "approved") {
        await supabase.from("bounties" as never).update({
          status: "completed",
          completed_at: new Date().toISOString(),
        }).eq("id", bounty.id);
      }
    },
    onSuccess: () => {
      toast.success("Review complete");
      queryClient.invalidateQueries({ queryKey: ["bounty-claims"] });
      queryClient.invalidateQueries({ queryKey: ["hexisle-bounties"] });
    },
  });

  return (
    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-2">
      <p className="text-sm text-white font-medium">{bounty.title} — {claim.role_level}</p>
      {claim.submission_url && (
        <a href={claim.submission_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 underline">{claim.submission_url}</a>
      )}
      {claim.submission_notes && <p className="text-xs text-slate-400">{claim.submission_notes}</p>}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">STAMP Rating:</span>
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => setRating(n)} className={`w-6 h-6 rounded ${n <= rating ? "bg-amber-500 text-black" : "bg-slate-700 text-slate-500"} text-xs font-bold`}>{n}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => reviewMut.mutate("approved")} disabled={reviewMut.isPending}>
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
        </Button>
        <Button size="sm" variant="destructive" onClick={() => reviewMut.mutate("rejected")} disabled={reviewMut.isPending}>
          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
        </Button>
      </div>
    </div>
  );
}

function HexIsleBountyBoard({ bounties, claims, userId }: { bounties: DBBounty[]; claims: DBBountyClaim[]; userId?: string }) {
  const totalCredits = bounties.reduce((s, b) => s + b.reward_credits, 0);
  const totalMarks = bounties.reduce((s, b) => s + b.reward_marks, 0);
  const totalXP = bounties.reduce((s, b) => s + b.reward_xp, 0);

  const submittedClaims = claims.filter(c => c.status === "submitted");
  const isAdmin = false; // TODO: wire to is_admin() check

  return (
    <section className="pt-8 border-t border-slate-700" data-xray-id="hexisle-bounty-board">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Hexagon className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">HexIsle Engineering Bounties</h2>
        </div>
        <p className="text-slate-400 max-w-lg mx-auto">
          The Tereno Water Table needs hydraulic engineers, mechanical designers, and manufacturing experts.
          Earn Credits, Marks, and XP for solving real engineering challenges.
        </p>
        <div className="flex justify-center gap-4 mt-3">
          <span className="text-sm text-amber-400">{totalCredits.toLocaleString()} Credits</span>
          <span className="text-sm text-emerald-400">{totalMarks} Marks</span>
          <span className="text-sm text-purple-400">{totalXP.toLocaleString()} XP</span>
          <span className="text-sm text-slate-500">{bounties.length} bounties</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          All compensation is deferred payment for services rendered — not investment, not equity.
        </p>
      </div>

      {/* Admin review section */}
      {submittedClaims.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider">Submitted for Review ({submittedClaims.length})</h3>
          {submittedClaims.map(c => {
            const b = bounties.find(b => b.id === c.bounty_id);
            return b ? <BountyReviewCard key={c.id} claim={c} bounty={b} /> : null;
          })}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        {bounties.map((b) => (
          <BountyCard key={b.id} bounty={b} claims={claims.filter(c => c.bounty_id === b.id)} userId={userId} />
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-400" /> Assignment Rules
        </h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>Each bounty accepts up to 3 claimants: Primary (does the work), Secondary (assists), Backup (steps in if Primary drops).</li>
          <li><span className="text-amber-400">Process Pioneer:</span> First person to complete a bounty earns permanent Pioneer status + 25 bonus Marks.</li>
          <li>Successful bounty completion is the first step toward Factory Node operation.</li>
        </ul>
      </div>
    </section>
  );
}
