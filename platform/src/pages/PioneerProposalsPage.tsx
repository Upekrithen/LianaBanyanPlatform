/**
 * PIONEER PROPOSALS — /pioneer
 * Innovation #2235, Crown Jewel #208
 * K388, B093
 *
 * Diminishing-priority reward system for proposing vendors/creators.
 * ONE LEVEL ONLY (anti-MLM). Marks rewards, never cashable to fiat.
 *
 * Tab 1: "My Proposals" — view your submitted proposals
 * Tab 2: "Propose Someone" — submit a new proposal
 * Tab 3: "Recent Joins" — celebrate successful proposals
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { Rocket, Send, Trophy, ChevronDown, Clock, Award } from "lucide-react";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { useToast } from "@/components/ui/use-toast";

/* ─── Types ─── */

interface PioneerProposal {
  id: string;
  proposer_id: string;
  proposed_name: string;
  proposed_email: string | null;
  proposed_url: string | null;
  description: string;
  business_plan_json: BusinessPlan;
  status: "proposed" | "contacted" | "joined" | "expired";
  proposed_at: string;
  joined_at: string | null;
  proposal_order: number;
  created_at: string;
}

interface BusinessPlan {
  storefront_description: string;
  target_audience: string;
  recommended_connections: string[];
  spice_categories: string[];
  cold_start_path: string;
  estimated_first_month: string;
}

/* ─── Constants ─── */

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  joined: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expired: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const ORDER_LABELS: Record<number, string> = {
  1: "#1 first to propose",
  2: "#2 second",
  3: "#3 third",
};

const SPICE_CATEGORIES = [
  "Garlic", "Paprika", "Cumin", "Sage", "Cinnamon",
  "Turmeric", "Basil", "Oregano", "Saffron", "Salt",
] as const;

const COLD_START_PATHS = [
  "Food", "Manufacturing", "Service", "Local Business", "Guild", "Tribe",
] as const;

function getOrderPercent(order: number): number {
  if (order === 1) return 100;
  if (order === 2) return 50;
  if (order === 3) return 25;
  return 10;
}

function getTimeDecayPercent(proposedAt: string): number {
  const days = Math.floor((Date.now() - new Date(proposedAt).getTime()) / 86400000);
  if (days <= 7) return 100;
  if (days <= 30) return 25;
  return 10;
}

function relativeTime(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/* ─── WildFire Tour mock data ─── */

const WILDFIRE_PROPOSALS: PioneerProposal[] = [
  {
    id: "wf-p1", proposer_id: "wf-user", proposed_name: "Chef Maria's Kitchen",
    proposed_email: "maria@example.com", proposed_url: "https://example.com/maria",
    description: "Amazing local chef — her tamales would sell out on day one.",
    business_plan_json: { storefront_description: "Authentic Mexican cuisine", target_audience: "Foodies and families", recommended_connections: [], spice_categories: ["Garlic", "Cumin"], cold_start_path: "Food", estimated_first_month: "$800" },
    status: "proposed", proposed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    joined_at: null, proposal_order: 1, created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "wf-p2", proposer_id: "wf-user", proposed_name: "Jake's Woodworking",
    proposed_email: null, proposed_url: "https://example.com/jake-wood",
    description: "Custom furniture maker. His cutting boards are already a local hit.",
    business_plan_json: { storefront_description: "Handcrafted furniture", target_audience: "Homeowners", recommended_connections: [], spice_categories: ["Basil", "Oregano"], cold_start_path: "Manufacturing", estimated_first_month: "$400" },
    status: "joined", proposed_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    joined_at: new Date(Date.now() - 86400000 * 2).toISOString(), proposal_order: 1, created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

const WILDFIRE_RECENT_JOINS: PioneerProposal[] = [
  {
    id: "wf-rj1", proposer_id: "wf-pioneer", proposed_name: "Jake's Woodworking",
    proposed_email: null, proposed_url: null, description: "",
    business_plan_json: { storefront_description: "", target_audience: "", recommended_connections: [], spice_categories: [], cold_start_path: "", estimated_first_month: "" },
    status: "joined", proposed_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    joined_at: new Date(Date.now() - 86400000 * 2).toISOString(), proposal_order: 1, created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
];

/* ─── Component ─── */

export default function PioneerProposalsPage() {
  const { user } = useAuth();
  const { isRunning: isWildfireTour } = useWildfireRun();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [businessPlanOpen, setBusinessPlanOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", url: "", description: "",
    storefrontDescription: "", targetAudience: "", recommendedConnections: "",
    spiceCategories: [] as string[], coldStartPath: "", estimatedFirstMonth: "",
  });

  /* ─── Queries ─── */

  const proposalsQuery = useQuery({
    queryKey: ["pioneer-proposals", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("pioneer_proposals")
        .select("*")
        .eq("proposer_id", user!.id)
        .order("proposed_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PioneerProposal[];
    },
    enabled: !!user?.id && !isWildfireTour,
  });

  const recentJoinsQuery = useQuery({
    queryKey: ["pioneer-recent-joins"],
    queryFn: async () => {
      const { data, error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("pioneer_proposals")
        .select("*")
        .eq("status", "joined")
        .order("joined_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as unknown as PioneerProposal[];
    },
    enabled: !isWildfireTour,
  });

  const submitMutation = useMutation({
    mutationFn: async (proposal: {
      proposed_name: string;
      proposed_email?: string;
      proposed_url?: string;
      description: string;
      business_plan_json: BusinessPlan;
    }) => {
      const { data, error } = await (supabase as ReturnType<typeof supabase.from>)
        .from("pioneer_proposals")
        .insert({ ...proposal, proposer_id: user!.id })
        .select("proposal_order")
        .single();
      if (error) throw error;
      return data as unknown as { proposal_order: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pioneer-proposals"] });
      toast({
        title: "Proposal submitted!",
        description: `You're #${data.proposal_order} to propose this person.`,
      });
      setForm({
        name: "", email: "", url: "", description: "",
        storefrontDescription: "", targetAudience: "", recommendedConnections: "",
        spiceCategories: [], coldStartPath: "", estimatedFirstMonth: "",
      });
      setBusinessPlanOpen(false);
    },
  });

  const handleSubmit = () => {
    if (!form.name || !form.description) return;

    if (isWildfireTour) {
      toast({ title: "Proposal submitted!", description: "You're #1 to propose this person. (WildFire Tour)" });
      return;
    }

    submitMutation.mutate({
      proposed_name: form.name,
      proposed_email: form.email || undefined,
      proposed_url: form.url || undefined,
      description: form.description,
      business_plan_json: {
        storefront_description: form.storefrontDescription,
        target_audience: form.targetAudience,
        recommended_connections: form.recommendedConnections.split(",").map((s) => s.trim()).filter(Boolean),
        spice_categories: form.spiceCategories,
        cold_start_path: form.coldStartPath,
        estimated_first_month: form.estimatedFirstMonth,
      },
    });
  };

  const handleSpiceToggle = (spice: string) => {
    setForm((f) => ({
      ...f,
      spiceCategories: f.spiceCategories.includes(spice)
        ? f.spiceCategories.filter((s) => s !== spice)
        : [...f.spiceCategories, spice],
    }));
  };

  /* ─── Derived data ─── */

  const proposals = isWildfireTour ? WILDFIRE_PROPOSALS : (proposalsQuery.data ?? []);
  const recentJoins = isWildfireTour ? WILDFIRE_RECENT_JOINS : (recentJoinsQuery.data ?? []);

  /* ─── Render ─── */

  return (
    <PortalPageLayout
      maxWidth="sm"
      xrayId="pioneer-proposals"
      title="Pioneer Proposals"
      subtitle="Spot talent. Earn rewards. Build the Rolodex."
    >
      {/* Reward tier banner */}
      <Card className="mb-4">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-muted-foreground">
              <strong>1st: 100%</strong> | 2nd: 50% | 3rd: 25% | 4th+: 10% — No effort is wasted!
            </span>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-proposals">My Proposals</TabsTrigger>
          <TabsTrigger value="propose">Propose</TabsTrigger>
          <TabsTrigger value="recent">Recent Joins</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: MY PROPOSALS ═══ */}
        <TabsContent value="my-proposals" className="mt-4">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Rocket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>You haven't proposed anyone yet.</p>
                <p className="text-sm mt-1">Be the first to spot talent!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {proposals.map((p, index) => {
                const orderPct = getOrderPercent(p.proposal_order);
                const decayPct = getTimeDecayPercent(p.proposed_at);
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-semibold">{p.proposed_name}</CardTitle>
                          <Badge className={STATUS_STYLES[p.status]}>{p.status}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{p.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-3 text-xs">
                          <Badge variant="outline">
                            {ORDER_LABELS[p.proposal_order] || `#${p.proposal_order} in line`}
                          </Badge>
                          <span className="text-muted-foreground">
                            Order: {orderPct}% | Decay: {decayPct}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Proposed {relativeTime(p.proposed_at)}</span>
                        </div>
                        {p.status === "joined" && (
                          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                            <Trophy className="w-3 h-3" />
                            <span>Earned {Math.min(orderPct, decayPct)} Marks reward!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 2: PROPOSE SOMEONE ═══ */}
        <TabsContent value="propose" className="mt-4">
          <Card>
            <CardContent className="py-6 space-y-4">
              <div>
                <Label htmlFor="p-name">Who should join Liana Banyan? *</Label>
                <Input id="p-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Person or business name" />
              </div>
              <div>
                <Label htmlFor="p-email">Their email if you have it</Label>
                <Input id="p-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div>
                <Label htmlFor="p-url">Their website or social profile</Label>
                <Input id="p-url" type="url" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="p-desc">What would they bring to the platform? *</Label>
                <Textarea id="p-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Why they'd be great..." rows={3} />
              </div>

              {/* Collapsible business plan template */}
              <Collapsible open={businessPlanOpen} onOpenChange={setBusinessPlanOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-xs">
                    Business Plan Template (optional)
                    <ChevronDown className={`w-4 h-4 transition-transform ${businessPlanOpen ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-2">
                  <div>
                    <Label htmlFor="bp-storefront">Storefront Description</Label>
                    <Textarea id="bp-storefront" value={form.storefrontDescription} onChange={(e) => setForm((f) => ({ ...f, storefrontDescription: e.target.value }))} placeholder="What could their storefront look like?" rows={2} />
                  </div>
                  <div>
                    <Label htmlFor="bp-audience">Target Audience</Label>
                    <Textarea id="bp-audience" value={form.targetAudience} onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))} placeholder="Who would be their natural customers?" rows={2} />
                  </div>
                  <div>
                    <Label htmlFor="bp-connections">Recommended Connections (comma-separated)</Label>
                    <Input id="bp-connections" value={form.recommendedConnections} onChange={(e) => setForm((f) => ({ ...f, recommendedConnections: e.target.value }))} placeholder="Jake's Woodworking, Sarah's Kitchen" />
                  </div>
                  <div>
                    <Label>Spice Categories</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {SPICE_CATEGORIES.map((spice) => (
                        <Badge
                          key={spice}
                          variant={form.spiceCategories.includes(spice) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleSpiceToggle(spice)}
                        >
                          {spice}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Cold Start Path</Label>
                    <Select value={form.coldStartPath} onValueChange={(v) => setForm((f) => ({ ...f, coldStartPath: v }))}>
                      <SelectTrigger><SelectValue placeholder="How would they start?" /></SelectTrigger>
                      <SelectContent>
                        {COLD_START_PATHS.map((path) => (
                          <SelectItem key={path} value={path}>{path}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button onClick={handleSubmit} disabled={!form.name || !form.description} className="w-full gap-2">
                <Send className="w-4 h-4" /> Submit Proposal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TAB 3: RECENT JOINS ═══ */}
        <TabsContent value="recent" className="mt-4">
          {recentJoins.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No recent joins yet.</p>
                <p className="text-sm mt-1">Be the pioneer who brings the first one!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentJoins.map((p, index) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold">{p.proposed_name}</h3>
                          {p.joined_at && (
                            <span className="text-xs text-muted-foreground">
                              Joined {relativeTime(p.joined_at)}
                            </span>
                          )}
                        </div>
                        {p.proposal_order === 1 && (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1">
                            <Trophy className="w-3 h-3" /> Pioneer
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
