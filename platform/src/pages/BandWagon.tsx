import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CurrencyAmount, CurrencyGlyph } from "@/components/CreditSymbol";
import { useToast } from "@/hooks/use-toast";
import {
  Rocket,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  Target,
  ChevronRight,
  Megaphone,
  Star,
  CircleDot,
  UserPlus,
  Armchair,
} from "lucide-react";
import {
  SAMPLE_PROJECTS,
  SAMPLE_BACKINGS,
  SAMPLE_TASTE_RANGER,
  SAMPLE_SAA,
  TASTE_RANGER_TIERS,
  fetchActiveProjects,
  fetchUserBackings,
  fetchTasteRangerProfile,
  fetchSAA,
  type BandWagonProject,
  type Backing,
  type ProjectStatus,
  type TasteRangerTierName,
  type TasteRangerProfile,
  type ServiceAllocationAuthority,
} from "@/lib/bandWagonService";

// ============================================================================
// HELPERS
// ============================================================================

function statusBadge(status: ProjectStatus) {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Active</Badge>;
    case "funded":
      return <Badge className="bg-green-600 text-white">Funded</Badge>;
    case "succeeded":
      return <Badge className="bg-emerald-600 text-white">Succeeded</Badge>;
    case "failed":
      return <Badge variant="outline" className="border-red-500/50 text-red-400">Failed</Badge>;
  }
}

function categoryBadge(category: string) {
  const colors: Record<string, string> = {
    Production: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    Education: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    "Food & Dining": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    Craftsmanship: "bg-amber-500/20 text-amber-300 border-primary/30",
    Technology: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    Services: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  };
  return (
    <Badge variant="outline" className={colors[category] || "bg-muted text-muted-foreground"}>
      {category}
    </Badge>
  );
}

function tierColor(tierName: TasteRangerTierName): string {
  const tier = TASTE_RANGER_TIERS.find((t) => t.name === tierName);
  return tier?.color ?? "bg-stone-600";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Stats bar across the top */
function StatsBar({ projects, backings, tasteRanger }: {
  projects: BandWagonProject[];
  backings: Backing[];
  tasteRanger: TasteRangerProfile;
}) {
  const activeCount = projects.filter((p) => p.status === "active").length;
  const totalBacked = backings.reduce((sum, b) => sum + b.pledgeAmount, 0);
  const successRate = backings.length > 0
    ? Math.round(
        (backings.filter((b) => b.status === "funded" || b.status === "succeeded").length /
          backings.length) *
          100
      )
    : 0;

  const stats = [
    { label: "Active Projects", value: activeCount, icon: Rocket },
    { label: "Total Backed", value: totalBacked, icon: Target, isCurrency: true },
    { label: "Your SAA Level", value: tasteRanger.currentTier, icon: Award },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <Card key={s.label} className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">
                {s.isCurrency ? (
                  <CurrencyAmount amount={s.value as number} currency="mark" simple={false} size={16} />
                ) : (
                  String(s.value)
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Individual project card */
function ProjectCard({ project }: { project: BandWagonProject }) {
  const pct = Math.min(Math.round((project.backedMarks / project.goalMarks) * 100), 100);
  const isAlmostFunded = pct >= 90 && project.status === "active";
  const isFirst100 = project.backerCount <= 100;

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground">{project.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              Steward: {project.stewardName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {categoryBadge(project.category)}
            {statusBadge(project.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

        {/* Funding progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              <CurrencyAmount amount={project.backedMarks} currency="mark" simple={false} size={12} />
              {" / "}
              <CurrencyAmount amount={project.goalMarks} currency="mark" simple={false} size={12} />
            </span>
            <span className={isAlmostFunded ? "text-green-400 font-semibold" : "text-muted-foreground"}>
              {pct}%
            </span>
          </div>
          <Progress
            value={pct}
            className="h-2 bg-muted"
          />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {isFirst100 ? (
                <span className="text-primary">{project.backerCount}/100 first backers</span>
              ) : (
                <span>{project.backerCount}+ backers</span>
              )}
            </span>
            {project.status === "active" && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {project.daysRemaining}d left
              </span>
            )}
          </div>

          {project.status === "active" ? (
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Back This Project
            </Button>
          ) : (
            <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Funded
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Active projects grid */
function ActiveProjectsGrid({ projects }: { projects: BandWagonProject[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-primary" />
        Active Projects
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

/** Your backed projects with tab filters */
function YourBackedProjects({ backings }: { backings: Backing[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered =
    filter === "all"
      ? backings
      : backings.filter((b) => b.status === filter);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        Your Backed Projects
      </h2>
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-card border border-border mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="funded">Succeeded</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>
        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground/70 text-sm py-4">No projects in this category yet.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((b) => (
                <Card key={b.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">{b.projectName}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Pledged: <CurrencyAmount amount={b.pledgeAmount} currency="mark" simple={false} size={12} /></span>
                        {b.saaEarned > 0 && (
                          <span className="text-green-400">+{b.saaEarned} SAA</span>
                        )}
                      </div>
                    </div>
                    {statusBadge(b.status)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

/** Taste Ranger progression display */
function TasteRangerProgression({ profile }: { profile: TasteRangerProfile }) {
  const currentIndex = TASTE_RANGER_TIERS.findIndex((t) => t.name === profile.currentTier);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-primary" />
        Taste Ranger Progression
      </h2>
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {/* Tier progression bar */}
          <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
            {TASTE_RANGER_TIERS.map((tier, i) => {
              const isCurrent = tier.name === profile.currentTier;
              const isPast = i < currentIndex;
              const isFuture = i > currentIndex;

              return (
                <div key={tier.name} className="flex items-center">
                  <div
                    className={`
                      flex flex-col items-center px-3 py-2 rounded-lg min-w-[80px] transition-all
                      ${isCurrent ? `${tier.color} shadow-lg ${tier.glowColor} ring-2 ring-amber-400/50` : ""}
                      ${isPast ? "opacity-60" : ""}
                      ${isFuture ? "opacity-30" : ""}
                    `}
                  >
                    <span className={`text-xs font-bold ${isCurrent ? "text-foreground" : "text-muted-foreground"}`}>
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {tier.minBackings}+ backings
                    </span>
                  </div>
                  {i < TASTE_RANGER_TIERS.length - 1 && (
                    <ChevronRight className={`h-4 w-4 mx-1 ${i < currentIndex ? "text-green-500" : "text-muted-foreground/70"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Current Tier</p>
              <p className="text-lg font-bold text-foreground">{profile.currentTier}</p>
              <p className="text-xs text-muted-foreground/70">
                {profile.successfulBackings} successful backing{profile.successfulBackings !== 1 ? "s" : ""}
              </p>
            </div>
            {profile.nextTierName && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Next Tier: {profile.nextTierName}</p>
                <p className="text-xs text-primary">
                  {profile.nextTierRequirement - profile.successfulBackings} more successful backings needed
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/** Service Allocation Authority card */
function SAACard({ saa }: { saa: ServiceAllocationAuthority }) {
  const usedPct = Math.round((saa.allocationUsed / saa.allocationBudget) * 100);

  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        Service Allocation Authority
      </h2>
      <Card className="bg-card border-primary/20">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">SAA Score</p>
              <p className="text-3xl font-bold text-primary">{saa.score}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Allocation Budget</p>
              <p className="text-3xl font-bold text-foreground">
                <CurrencyAmount amount={saa.allocationBudget} currency="mark" simple={false} size={20} />
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Budget Used</p>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-foreground">
                  <CurrencyAmount amount={saa.allocationUsed} currency="mark" simple={false} size={20} />
                </p>
                <Progress value={usedPct} className="h-1.5 bg-muted" />
                <p className="text-xs text-muted-foreground/70">{usedPct}% allocated</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic border-t border-border pt-4">
            Your demonstrated judgment earns you the authority to direct cooperative resources.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

/** How BandWagon Works accordion */
function HowItWorks() {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4">How BandWagon Works</h2>
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-sm text-primary font-medium mb-4">
            This is not an investment return. This is earned authority to allocate cooperative
            resources based on demonstrated judgment.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="backing" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-primary">
                Back Projects with Marks
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Browse active projects and pledge your Marks to the ones you believe will succeed.
                When a project reaches its funding goal and delivers, you earn Service Allocation
                Authority (SAA) — increasing your future ability to direct cooperative resources
                toward projects you trust.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="first100" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-primary">
                The First-100 Rule
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                The first 100 backers of any project share influence proportionally. Early
                conviction matters — those who identify promising projects before the crowd
                earn more SAA. After 100 backers, returns diminish so the system rewards
                genuine discernment, not herd following.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="positive" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-primary">
                Positive-Only QA
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                BandWagon promotes — it does not ding. There are no downvotes and no public
                failure shaming. Absence of backing is sufficient signal. Projects that do
                not attract support simply do not fund. This protects creators while still
                allowing the community to collectively surface the best ideas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="trustchain" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-primary">
                TasteMaker Trust Chain
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                When you back a project, your recommendation creates an attributed daisy chain.
                The originator who first spotted the project, the first follower who validated it,
                and subsequent chain followers (up to 5 links, with branching supported) all share
                in the SAA reward. Great taste is recognized and amplified through the network.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tiers" className="border-border">
              <AccordionTrigger className="text-foreground hover:text-primary">
                Taste Ranger Progression
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Your track record of successful backings earns you higher Taste Ranger tiers:
                Scout, Ranger, Curator, TasteMaker, Patron, and Luminary. Each tier unlocks
                greater allocation authority and recognition within the cooperative. A Patron
                or Luminary can execute a Business Swoop — fully funding a project through
                their accumulated allocation authority.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}

// ============================================================================
// CREW TABLES SECTION
// ============================================================================

interface CrewTable {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  template_type: string | null;
  stage_current: number;
  min_seats_to_activate: number;
  is_active: boolean;
  created_at: string;
}

interface CrewSeat {
  id: string;
  table_id: string;
  role_name: string;
  slot_type: string;
  member_id: string | null;
  seated_at: string | null;
  payment_amount: number | null;
  is_required: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  designer: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  photographer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  writer: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  printer: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  runner: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function CrewTablesSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: crewTables } = useQuery({
    queryKey: ["crew-tables"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_tables" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12) as { data: CrewTable[] | null };
      return (data || []) as CrewTable[];
    },
  });

  const { data: allSeats } = useQuery({
    queryKey: ["crew-table-seats"],
    queryFn: async () => {
      const tableIds = crewTables?.map(t => t.id) || [];
      if (tableIds.length === 0) return [] as CrewSeat[];
      const { data } = await supabase
        .from("crew_table_seats" as never)
        .select("*")
        .in("table_id", tableIds as never) as { data: CrewSeat[] | null };
      return (data || []) as CrewSeat[];
    },
    enabled: (crewTables?.length || 0) > 0,
  });

  const joinSeatMutation = useMutation({
    mutationFn: async (seatId: string) => {
      if (!user) throw new Error("Must be logged in");
      const { error } = await supabase
        .from("crew_table_seats" as never)
        .update({ member_id: user.id, seated_at: new Date().toISOString() } as never)
        .eq("id", seatId as never)
        .is("member_id", null);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Seat Claimed!", description: "You've joined the Crew Table." });
      queryClient.invalidateQueries({ queryKey: ["crew-table-seats"] });
    },
    onError: (err: Error) => {
      toast({ title: "Could not join", description: err.message, variant: "destructive" });
    },
  });

  const seatsForTable = (tableId: string) =>
    allSeats?.filter(s => s.table_id === tableId) || [];

  const openPrimaryCount = (tableId: string) =>
    seatsForTable(tableId).filter(s => s.is_required && !s.member_id).length;

  const stageLabel = (n: number) =>
    n === 1 ? "PREP" : n === 2 ? "BUILD" : n === 3 ? "DELIVER" : `Stage ${n}`;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Armchair className="h-5 w-5 text-primary" />
          Open Crew Tables
        </h2>
        {user && (
          <Link to="/crew/new">
            <Button variant="outline" size="sm" className="gap-1">
              <CircleDot className="h-4 w-4" /> Create Table
            </Button>
          </Link>
        )}
      </div>

      {!crewTables || crewTables.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <Armchair className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No Crew Tables Yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Create one to assemble a team for your next project
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {crewTables.map(table => {
            const seats = seatsForTable(table.id);
            const openPrimary = openPrimaryCount(table.id);
            const filledCount = seats.filter(s => s.member_id).length;

            return (
              <Card key={table.id} className={`${table.is_active ? "border-emerald-500/30" : "border-border"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{table.title}</CardTitle>
                      {table.description && (
                        <CardDescription className="text-xs mt-1">{table.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={table.is_active ? "default" : "outline"}>
                        {table.is_active ? "Active" : stageLabel(table.stage_current)}
                      </Badge>
                      {table.template_type && (
                        <Badge variant="secondary" className="text-xs">
                          {table.template_type.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Seats display — round table visual */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {seats.map(seat => (
                      <div
                        key={seat.id}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium
                          ${seat.member_id
                            ? "bg-muted/50 border-border text-foreground"
                            : ROLE_COLORS[seat.role_name] || "bg-muted/30 border-dashed border-muted-foreground/30 text-muted-foreground"
                          }`}
                      >
                        {seat.member_id ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <UserPlus className="h-3 w-3" />
                        )}
                        <span>{seat.role_name}</span>
                        {!seat.member_id && seat.payment_amount && (
                          <span className="text-[10px] opacity-70">${seat.payment_amount}</span>
                        )}
                        {!seat.is_required && (
                          <span className="text-[9px] opacity-50">opt</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Seat count + join */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {filledCount}/{seats.length} seated
                      {openPrimary > 0 && (
                        <span className="text-primary ml-1">({openPrimary} open)</span>
                      )}
                    </p>
                    {user && openPrimary > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={joinSeatMutation.isPending}
                        onClick={() => {
                          const openSeat = seats.find(s => !s.member_id && s.is_required);
                          if (openSeat) joinSeatMutation.mutate(openSeat.id);
                        }}
                      >
                        <UserPlus className="h-3 w-3" /> Join Seat
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function BandWagon() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<BandWagonProject[]>(SAMPLE_PROJECTS);
  const [backings, setBackings] = useState<Backing[]>(SAMPLE_BACKINGS);
  const [tasteRanger, setTasteRanger] = useState<TasteRangerProfile>(SAMPLE_TASTE_RANGER);
  const [saa, setSaa] = useState<ServiceAllocationAuthority>(SAMPLE_SAA);

  useEffect(() => {
    fetchActiveProjects().then(setProjects);
    if (user?.id) {
      fetchUserBackings(user.id).then(setBackings);
      fetchTasteRangerProfile(user.id).then(setTasteRanger);
      fetchSAA(user.id).then(setSaa);
    }
  }, [user?.id]);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="bandwagon">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">BandWagon</h1>
          </div>
          <p className="text-muted-foreground text-lg ml-14">Back What You Believe In</p>
        </div>

        <StatsBar projects={projects} backings={backings} tasteRanger={tasteRanger} />
        <CrewTablesSection />
        <ActiveProjectsGrid projects={projects} />
        <YourBackedProjects backings={backings} />
        <TasteRangerProgression profile={tasteRanger} />
        <SAACard saa={saa} />
        <HowItWorks />
    </PortalPageLayout>
  );
}
