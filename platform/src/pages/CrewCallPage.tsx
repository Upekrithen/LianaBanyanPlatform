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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Wrench, ChevronDown, ChevronUp, Hexagon, Zap, Award, AlertTriangle, Target, Beaker, Cog, Droplets, FlaskConical, Leaf } from "lucide-react";
import { ProcessModuleCard } from "@/components/manufacturing/ProcessModuleCard";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";
import { toast } from "sonner";

interface HexIsleBounty {
  id: string;
  title: string;
  subtitle: string;
  credits: number;
  marks: number;
  xp: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  difficulty: string;
  skills: string[];
  problem: string;
  deliverables: string[];
  stampCriteria: { score: number; criteria: string }[];
  icon: React.ReactNode;
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
  HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  LOW: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const HEXISLE_BOUNTIES: HexIsleBounty[] = [
  {
    id: "CREW-HEXISLE-001",
    title: "Hydraulic Seal Design",
    subtitle: "Swan Neck Waterproof Seal at Production Scale",
    credits: 2000, marks: 50, xp: 200,
    priority: "CRITICAL", difficulty: "Advanced",
    skills: ["Fluid dynamics", "Seal engineering", "Injection mold design", "Waterproofing"],
    problem: "The Swan Neck inter-Hexel connector must maintain a watertight seal at 2.17 PSI across 420 connection points on a 60-inch Water Table. Current SLA seals work at low quantities but need validation for injection mold tolerances, thermal expansion (15-35°C), and 500+ assembly/disassembly cycles.",
    deliverables: [
      "Seal geometry specification — STEP + PDF, <0.1 mL/hr leak rate at 2.17 PSI",
      "Material recommendation — elastomer/TPE with data sheets (food-safe required)",
      "Tolerance analysis — statistical stackup for injection mold (6-sigma target)",
      "Assembly/disassembly cycle testing protocol — min 500 cycles",
      "Prototype validation — 3 test seals produced and tested",
    ],
    stampCriteria: [
      { score: 1, criteria: "Geometry spec only, no material data, no testing" },
      { score: 2, criteria: "Geometry + material recommendation, no prototype" },
      { score: 3, criteria: "Geometry + material + tolerance analysis, prototype in progress" },
      { score: 4, criteria: "All deliverables complete, prototype passes 500-cycle test" },
      { score: 5, criteria: "All deliverables + production-ready drawings + supplier quotes + cost-optimized alternatives" },
    ],
    icon: <Droplets className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-002",
    title: "42→60mm Dimensional Port",
    subtitle: "Football / Wave Generator Area Port",
    credits: 3000, marks: 75, xp: 300,
    priority: "HIGH", difficulty: "Advanced",
    skills: ["CAD (Fusion 360)", "Mechanical design", "Dimensional analysis", "Compliant mechanism design"],
    problem: "The original Hexel was 42mm flat-to-flat, later scaled to 60mm. The Football/wave generator area and Cradle mechanisms remain at 42mm geometry. These need porting while preserving cam follower geometry, rocking base clearance, Main Gear pusher tooth engagement, and variable amplitude behavior.",
    deliverables: [
      "Gap analysis report — every 42mm dimension flagged (linear scale vs. redesign)",
      "Ported CAD files — Fusion 360 + STEP for Football, Cradle, Main Gear at 60mm",
      "Interference check — verify against 60mm Sawtooth Coral, PGear, NeedleValve",
      "Variable amplitude validation — low-tide vs. high-tide ratio preserved at 60mm",
      "Print and test — SLA print, fit test in 60mm Hexel body, video of wave generation",
    ],
    stampCriteria: [
      { score: 1, criteria: "Gap analysis only" },
      { score: 2, criteria: "Gap analysis + ported CAD, not tested" },
      { score: 3, criteria: "Ported CAD + interference check, partial fit test" },
      { score: 4, criteria: "All deliverables, successful fit test, wave generation demonstrated" },
      { score: 5, criteria: "All deliverables + optimized geometry + community documentation" },
    ],
    icon: <Target className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-003",
    title: "Tesla Valve Optimization",
    subtitle: "Golden Lotus Geometry Validation for Injection Molding",
    credits: 2500, marks: 60, xp: 250,
    priority: "HIGH", difficulty: "Expert",
    skills: ["Fluid dynamics", "Injection mold design", "Tesla valve geometry", "CFD simulation"],
    problem: "The Golden Lotus's 6 Tesla Valve cups are validated only for SLA. For mass manufacturing, they must work in injection mold tooling. Concerns: minimum wall thickness at 30° exit angles, draft angles for cup interior, Rooster Teeth survival during ejection, and flow performance with injection mold finish.",
    deliverables: [
      "CFD simulation — flow analysis at 2.17 PSI for SLA vs. injection mold finish",
      "Draft angle analysis — minimum angles for cups, Rooster Teeth, exit channels",
      "Wall thickness audit — every sub-1.5mm wall assessed for mold fill/cooling",
      "Mold design recommendations — gate locations, venting, cost at 10K/100K/1M runs",
      "Alternative geometry — if any feature is unmoldable, preserve Tesla Valve function",
    ],
    stampCriteria: [
      { score: 1, criteria: "Visual inspection and qualitative assessment only" },
      { score: 2, criteria: "CFD simulation + draft angle analysis" },
      { score: 3, criteria: "CFD + draft + wall thickness with recommendations" },
      { score: 4, criteria: "All deliverables, mold recommendations backed by supplier quotes" },
      { score: 5, criteria: "All deliverables + working injection mold prototype OR validated alternative" },
    ],
    icon: <FlaskConical className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-004",
    title: "Reservoir Pressure Testing",
    subtitle: "Y/Z Reservoir Oscillation Test Protocol",
    credits: 1500, marks: 40, xp: 150,
    priority: "MEDIUM", difficulty: "Intermediate",
    skills: ["Fluid mechanics", "Test protocol design", "Instrumentation", "Data analysis"],
    problem: "The Water Table uses three reservoirs (X=outer, Y=middle oscillating, Z=inner counterweight). The critical weight relationship Y+Z > X must be validated. No full prototype exists. A scaled test protocol is needed before committing to full-scale manufacturing.",
    deliverables: [
      "Scaled test rig design — 1/4 or 1/10 scale, common materials, <$500 instrumentation",
      "Instrumentation spec — pressure sensors, flow meters with part numbers",
      "Test protocol — baseline oscillation, 6+ pressure points, escapement variation",
      "Data collection template — spreadsheet/schema for recording test runs",
      "Analysis guide — interpretation, pass/fail criteria, adjustment recommendations",
    ],
    stampCriteria: [
      { score: 1, criteria: "Protocol document only, no rig design" },
      { score: 2, criteria: "Protocol + rig design, not built" },
      { score: 3, criteria: "Protocol + rig built + baseline data collected" },
      { score: 4, criteria: "All deliverables, oscillation sustained 30+ minutes at scale" },
      { score: 5, criteria: "All deliverables + 3+ escapement settings + pressure loss curve across 10+ Hexels" },
    ],
    icon: <Beaker className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-005",
    title: "Ouralis Gear Train QC",
    subtitle: "Quality Control Spec for 20-Tooth Gear at SLS/Injection Scale",
    credits: 2000, marks: 50, xp: 200,
    priority: "MEDIUM", difficulty: "Intermediate-Advanced",
    skills: ["Gear design", "Metrology", "Quality control", "SLS/injection manufacturing"],
    problem: "The Ouralis 20-tooth dual-level gear with offset half-tooth works at SLA scale but needs QC specs for SLS and injection mold production. Production operators need measurable criteria without engineering expertise.",
    deliverables: [
      "Gear inspection spec — tooth profile, spacing, level offset, cam slope, bore tolerances",
      "Go/no-go gauge design — physical gauges with CAD files",
      "Incoming material spec — surface finish, density, shrinkage for PA12/ABS/PC-ABS/POM",
      "Batch sampling protocol — inspection count, sequence, recording format",
      "Failure mode catalog — renders of common defects with accept/reject criteria",
    ],
    stampCriteria: [
      { score: 1, criteria: "Dimensional tolerance spec only" },
      { score: 2, criteria: "Tolerances + gauge designs" },
      { score: 3, criteria: "Tolerances + gauges + material spec" },
      { score: 4, criteria: "All deliverables, validated against SLA prototype measurements" },
      { score: 5, criteria: "All deliverables + SLS/injection validation + SPC charting template" },
    ],
    icon: <Cog className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-006",
    title: "Compliant Mechanism Durability",
    subtitle: "SlottedTop Flex-Grip Snap Lock Fatigue Testing",
    credits: 1500, marks: 40, xp: 150,
    priority: "MEDIUM", difficulty: "Intermediate",
    skills: ["Materials science", "Mechanical testing", "Compliant mechanism design", "Fatigue analysis"],
    problem: "The SlottedTop's compliant mechanism arms (cyan flex-grip snap locks) must survive thousands of snap-on/snap-off cycles without permanent deformation, cracking, or retention force loss. Different production materials have different fatigue profiles.",
    deliverables: [
      "Test fixture design — repeatable cycle testing with force measurement",
      "Material comparison — SLA tough resin, ABS injection, TPU/PP flexible",
      "Creep assessment — permanent deformation at 100, 500, 1000, 5000 cycles",
      "Failure mode analysis — crack initiation, propagation, force degradation curve",
      "Material recommendation — best cost/durability tradeoff for production",
    ],
    stampCriteria: [
      { score: 1, criteria: "Test fixture design only" },
      { score: 2, criteria: "Fixture + data for 1 material" },
      { score: 3, criteria: "Fixture + 2 materials + creep assessment" },
      { score: 4, criteria: "All deliverables, 3 materials, clear recommendation" },
      { score: 5, criteria: "All deliverables + 5000-cycle data + production cost analysis + alternative geometries" },
    ],
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  {
    id: "CREW-HEXISLE-007",
    title: "Pneumatic Plant Growth",
    subtitle: "Telescoping Ratchet Prototype for Pneumatic Palm Tree",
    credits: 2500, marks: 60, xp: 250,
    priority: "LOW", difficulty: "Expert",
    skills: ["Mechanism design", "Ratchet engineering", "Pneumatic systems", "Miniature manufacturing"],
    problem: "The Telescoping Plant needs nested segments extending under air pressure with ratchet-click locking (irreversible during play). At miniature scale (8mm diameter, 40mm height), achieving reliable extension, audible click, and aesthetic quality is a significant challenge. No prototype exists at 60mm Hexel scale.",
    deliverables: [
      "Mechanism design — 3-segment telescoping ratchet CAD at 60mm scale (retracted <12mm)",
      "Pneumatic pressure analysis — extension force vs. 2.17 PSI system pressure",
      "Ratchet reliability testing — 100 extension cycles, force/engagement data",
      "Frond deployment mechanism — petal segments unfolding after trunk extension",
      "Palm-twist launch — detachable flower portion that launches when trunk twisted",
    ],
    stampCriteria: [
      { score: 1, criteria: "CAD design only, no prototype" },
      { score: 2, criteria: "CAD + prototype, ratchet unreliable" },
      { score: 3, criteria: "Working ratchet, 50+ cycles, no frond mechanism" },
      { score: 4, criteria: "All deliverables, 100-cycle reliability, frond deployment works" },
      { score: 5, criteria: "All deliverables + Flying Flower launch + production-ready + BOM with cost" },
    ],
    icon: <Leaf className="w-5 h-5" />,
  },
];

const MAX_PRIMARY = 3;
const MAX_SECONDARY = 5;

export default function CrewCallPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ["manufacturing-process-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manufacturing_process_modules")
        .select("*")
        .eq("is_active", true)
        .order("process_name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["crew-call-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_call_assignments")
        .select("process_module_id, user_id, role_level")
        .eq("status", "active");
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase
        .from("process_pioneer_ledger")
        .select("process_module_id");
      if (error) throw error;
      return new Set((data || []).map((p: { process_module_id: string }) => p.process_module_id));
    },
  });

  const claimMutation = useMutation({
    mutationFn: async ({
      processModuleId,
      roleLevel,
      isPioneer,
    }: { processModuleId: string; roleLevel: string; isPioneer: boolean }) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await supabase.from("crew_call_assignments").upsert({
        user_id: user.id,
        process_module_id: processModuleId,
        role_level: roleLevel,
        is_process_pioneer: isPioneer,
        status: "active",
      }, { onConflict: "user_id,process_module_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("You're on the crew.");
      queryClient.invalidateQueries({ queryKey: ["crew-call-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["process-pioneer-ledger"] });
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
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Sign in to join the crew.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-xray-id="crew-call-page">
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
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
        <HexIsleBountyBoard bounties={HEXISLE_BOUNTIES} />

        <section className="pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Know a maker with these skills? Send them a Cue Card.
          </p>
          <InviteCreatorCard />
        </section>
      </div>
    </div>
  );
}

function BountyCard({ bounty }: { bounty: HexIsleBounty }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-slate-700 bg-slate-900/50" data-xray-id={`bounty-${bounty.id.toLowerCase()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">{bounty.icon}</span>
            <div>
              <h3 className="font-semibold text-white">{bounty.title}</h3>
              <p className="text-xs text-slate-400">{bounty.subtitle}</p>
            </div>
          </div>
          <Badge className={PRIORITY_COLORS[bounty.priority]}>{bounty.priority}</Badge>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="text-amber-400 border-amber-500/30">
            <Zap className="w-3 h-3 mr-1" />{bounty.credits.toLocaleString()} Credits
          </Badge>
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
            {bounty.marks} Marks
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-500/30">
            {bounty.xp} XP
          </Badge>
          <Badge variant="secondary">{bounty.difficulty}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-300">{bounty.problem}</p>

        <div className="flex flex-wrap gap-1">
          {bounty.skills.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">{s}</span>
          ))}
        </div>

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
                {bounty.deliverables.map((d, i) => <li key={i}>{d}</li>)}
              </ol>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">STAMP Quality Criteria</h4>
              <div className="space-y-1">
                {bounty.stampCriteria.map((s) => (
                  <div key={s.score} className="flex gap-2 text-sm">
                    <span className="font-mono text-amber-400 w-4 shrink-0">{s.score}</span>
                    <span className="text-slate-300">{s.criteria}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">XP = {bounty.xp} × quality_score / 5.0</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

function HexIsleBountyBoard({ bounties }: { bounties: HexIsleBounty[] }) {
  const totalCredits = bounties.reduce((s, b) => s + b.credits, 0);
  const totalMarks = bounties.reduce((s, b) => s + b.marks, 0);
  const totalXP = bounties.reduce((s, b) => s + b.xp, 0);

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

      <div className="grid gap-6 sm:grid-cols-2">
        {bounties.map((b) => <BountyCard key={b.id} bounty={b} />)}
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
