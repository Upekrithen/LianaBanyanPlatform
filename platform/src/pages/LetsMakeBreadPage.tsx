/**
 * LetsMakeBreadPage — Wave 17 Mini-App / BP073 W8 (real-data wired)
 * ==================================================================
 * Let's Make Bread: Community baking, food production coordination,
 * group ingredient purchasing, skill-sharing, and recipe corpus.
 *
 * Supabase: bread_bounties, bread_bounty_bids, bread_skill_sessions,
 *           bread_skill_registrations, bread_recipes, bread_group_buy_listings,
 *           bread_group_buy_orders
 * Migration: 20260603110003_bp073_w8_bread_tables.sql
 *
 * Canon: 83.3%/Cost+20%. Marks = participation credits, not equity.
 * No em-dashes. Human punctuation.
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Wheat,
  ShoppingCart,
  BookOpen,
  Zap,
  Star,
  Heart,
  ChevronRight,
  Plus,
  CheckCircle2,
  Users,
  TrendingUp,
  DollarSign,
  Info,
  ChefHat,
  Flame,
  Package,
  Search,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { getCueCard } from "@/data/initiativeWalkthroughs";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ──────────────────────────────────────────────────────────────────

type BreadTab =
  | "overview"
  | "simulator"
  | "bounties"
  | "group-buy"
  | "skill-share"
  | "recipe-vault"
  | "cue-card";

interface BreadBounty {
  id: string;
  title: string;
  description: string;
  quantity: string;
  postedBy: string;
  neighborhood: string;
  pricePerUnit: number;
  daysLeft: number;
  bids: number;
}

interface GroupBuyListing {
  id: string;
  ingredient: string;
  unit: string;
  baseCost: number;
  /** Cost+20% price members pay */
  memberPrice: number;
  currentOrders: number;
  minimumOrders: number;
  organizer: string;
  closeDate: string;
}

interface SkillSession {
  id: string;
  title: string;
  instructor: string;
  skill: string;
  duration: string;
  marksEarned: number;
  spotsLeft: number;
  date: string;
}

interface RecipeContribution {
  id: string;
  title: string;
  contributor: string;
  category: string;
  marksAwarded: number;
  harperVerified: boolean;
  uses: number;
}

// ─── Stub Data (TODO: wire to Supabase bread_* tables) ──────────────────────

const STUB_BOUNTIES: BreadBounty[] = [
  {
    id: "bb-1",
    title: "Sourdough loaves for Saturday market",
    description:
      "Need 24 sourdough loaves for the neighborhood farmers market, standard 1.5lb. Crust preferred but not required.",
    quantity: "24 loaves",
    postedBy: "Maria L.",
    neighborhood: "East Side",
    pricePerUnit: 8.40,
    daysLeft: 3,
    bids: 2,
  },
  {
    id: "bb-2",
    title: "Corn tortillas -- bulk order for Let's Make Dinner node",
    description:
      "Our cooking node needs 200 corn tortillas per week for the meal service. Ongoing contract, Cost+20% pricing.",
    quantity: "200/week",
    postedBy: "Carlos M.",
    neighborhood: "Westview",
    pricePerUnit: 0.36,
    daysLeft: 7,
    bids: 1,
  },
  {
    id: "bb-3",
    title: "Whole grain bread for school lunch program",
    description:
      "12 loaves whole grain sandwich bread for the cooperative school's weekly lunch program. Allergen-free kitchen preferred.",
    quantity: "12 loaves/week",
    postedBy: "Parent Cooperative",
    neighborhood: "North Park",
    pricePerUnit: 9.60,
    daysLeft: 5,
    bids: 4,
  },
];

const STUB_GROUP_BUYS: GroupBuyListing[] = [
  {
    id: "gb-1",
    ingredient: "King Arthur Bread Flour (50lb bag)",
    unit: "bag",
    baseCost: 38.00,
    memberPrice: 45.60,
    currentOrders: 14,
    minimumOrders: 20,
    organizer: "James K.",
    closeDate: "June 10, 2026",
  },
  {
    id: "gb-2",
    ingredient: "Himalayan Pink Salt (25lb)",
    unit: "bag",
    baseCost: 18.00,
    memberPrice: 21.60,
    currentOrders: 31,
    minimumOrders: 25,
    organizer: "Priya N.",
    closeDate: "June 8, 2026",
  },
  {
    id: "gb-3",
    ingredient: "Active Dry Yeast (1lb)",
    unit: "pack",
    baseCost: 6.50,
    memberPrice: 7.80,
    currentOrders: 9,
    minimumOrders: 30,
    organizer: "Devon M.",
    closeDate: "June 15, 2026",
  },
];

const STUB_SKILL_SESSIONS: SkillSession[] = [
  {
    id: "ss-1",
    title: "Sourdough Fundamentals: Starter to Loaf",
    instructor: "Maria T.",
    skill: "Sourdough",
    duration: "3 hours",
    marksEarned: 25,
    spotsLeft: 4,
    date: "June 7, 2026",
  },
  {
    id: "ss-2",
    title: "Cost+20% Pricing for Bakers: Running the Numbers",
    instructor: "James K.",
    skill: "Business",
    duration: "90 min",
    marksEarned: 15,
    spotsLeft: 8,
    date: "June 9, 2026",
  },
  {
    id: "ss-3",
    title: "Fermentation Science: Bread, Beer, and Kombucha",
    instructor: "Dr. Aisha R.",
    skill: "Fermentation",
    duration: "2 hours",
    marksEarned: 20,
    spotsLeft: 2,
    date: "June 12, 2026",
  },
];

const STUB_RECIPES: RecipeContribution[] = [
  {
    id: "rc-1",
    title: "72-Hour Cold-Ferment Country Loaf",
    contributor: "Marcus B.",
    category: "Sourdough",
    marksAwarded: 40,
    harperVerified: true,
    uses: 312,
  },
  {
    id: "rc-2",
    title: "Grandmother's Corn Pone (Appalachian)",
    contributor: "Della F.",
    category: "Quick Bread",
    marksAwarded: 30,
    harperVerified: true,
    uses: 148,
  },
  {
    id: "rc-3",
    title: "Whole Wheat Sandwich Loaf for High Volume",
    contributor: "Priya N.",
    category: "Commercial",
    marksAwarded: 35,
    harperVerified: false,
    uses: 87,
  },
];

// ─── Simulator ───────────────────────────────────────────────────────────────

interface SimState {
  day: number;
  revenue: number;
  costs: number;
  customerSatisfaction: number;
  breadPrice: number;
  loavesPerDay: number;
  marketingSpend: number;
  breadBadgeEarned: boolean;
}

const SIM_INITIAL: SimState = {
  day: 0,
  revenue: 0,
  costs: 0,
  customerSatisfaction: 70,
  breadPrice: 8,
  loavesPerDay: 5,
  marketingSpend: 0,
  breadBadgeEarned: false,
};

function BusinessSimulator() {
  const [sim, setSim] = useState<SimState>(SIM_INITIAL);
  const [started, setStarted] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const ingredientCostPerLoaf = 3.0;
  const costPlusTwenty = ingredientCostPerLoaf * 1.2;
  const minViablePrice = costPlusTwenty;
  const memberKeep = 0.833;

  const advanceDay = () => {
    if (sim.day >= 30) return;

    const dailyCost =
      sim.loavesPerDay * ingredientCostPerLoaf + sim.marketingSpend;
    const demandMultiplier =
      sim.breadPrice <= minViablePrice * 1.5
        ? 1.0
        : sim.breadPrice <= minViablePrice * 2
        ? 0.7
        : 0.4;
    const actualSales = Math.floor(
      sim.loavesPerDay *
        demandMultiplier *
        (1 + (sim.customerSatisfaction - 70) / 200)
    );
    const grossRevenue = actualSales * sim.breadPrice;
    const memberRevenue = grossRevenue * memberKeep;
    const newSatisfaction = Math.min(
      100,
      Math.max(
        40,
        sim.customerSatisfaction +
          (actualSales >= sim.loavesPerDay ? 2 : -3) +
          (sim.marketingSpend > 0 ? 1 : 0)
      )
    );

    const newDay = sim.day + 1;
    const totalRevenue = sim.revenue + memberRevenue;
    const totalCosts = sim.costs + dailyCost;
    const profit = totalRevenue - totalCosts;
    const badgeEarned = newDay === 30 && profit > 0 && newSatisfaction >= 65;

    const entry =
      `Day ${newDay}: Baked ${sim.loavesPerDay}, sold ${actualSales} @ $${sim.breadPrice} = ` +
      `$${memberRevenue.toFixed(2)} in pocket. Satisfaction: ${newSatisfaction.toFixed(0)}.`;

    setSim({
      day: newDay,
      revenue: totalRevenue,
      costs: totalCosts,
      customerSatisfaction: newSatisfaction,
      breadPrice: sim.breadPrice,
      loavesPerDay: sim.loavesPerDay,
      marketingSpend: sim.marketingSpend,
      breadBadgeEarned: badgeEarned,
    });
    setLog((prev) => [entry, ...prev].slice(0, 10));
  };

  const resetSim = () => {
    setSim(SIM_INITIAL);
    setLog([]);
    setStarted(false);
  };

  const profit = sim.revenue - sim.costs;

  if (!started) {
    return (
      <div className="max-w-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            $5 Business Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            Run a simulated micro-bakery for 30 days. Learn Cost+20% pricing,
            demand curves, and cooperative economics before you risk real money.
          </p>
        </div>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4 flex gap-3">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900 space-y-1">
              <p>
                <strong>Your starting parameters:</strong>
              </p>
              <p>Ingredient cost per loaf: $3.00</p>
              <p>
                Cost+20% minimum viable price: $
                {costPlusTwenty.toFixed(2)} per loaf
              </p>
              <p>You keep 83.3% of every dollar of revenue.</p>
              <p className="text-xs mt-2">
                Earn the Bread Badge by running a profitable 30-day simulation
                with customer satisfaction above 65%.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => setStarted(true)}
        >
          <Zap className="h-4 w-4 mr-2" />
          Start 30-Day Simulation
          {/* TODO: gate behind $5 membership payment (Stripe) or active membership check */}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            $5 Business Simulator
          </h2>
          <p className="text-sm text-muted-foreground">
            Day {sim.day} / 30
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSim}>
          Reset
        </Button>
      </div>

      {sim.breadBadgeEarned && (
        <Card className="bg-emerald-50 border-emerald-400 border-2">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-800">Bread Badge Earned!</p>
              <p className="text-sm text-emerald-700">
                Profitable 30-day run with satisfied customers. You are ready
                for real incubation resources and mentorship.
                {/* TODO: POST bread_badge_earned to Supabase member_achievements + trigger Marks award */}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue (yours)",
            value: `$${sim.revenue.toFixed(2)}`,
            icon: DollarSign,
            color: "text-emerald-600",
          },
          {
            label: "Total Costs",
            value: `$${sim.costs.toFixed(2)}`,
            icon: Package,
            color: "text-red-500",
          },
          {
            label: "Net Profit",
            value: `$${profit.toFixed(2)}`,
            icon: TrendingUp,
            color: profit >= 0 ? "text-emerald-600" : "text-red-500",
          },
          {
            label: "Satisfaction",
            value: `${sim.customerSatisfaction.toFixed(0)}%`,
            icon: Star,
            color: sim.customerSatisfaction >= 65 ? "text-amber-500" : "text-red-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border border-border">
            <CardContent className="pt-4">
              <Icon className={`h-4 w-4 mb-1 ${color}`} />
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily Decisions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Price per loaf: ${sim.breadPrice.toFixed(2)}
            </label>
            <input
              type="range"
              min={costPlusTwenty}
              max={20}
              step={0.5}
              value={sim.breadPrice}
              onChange={(e) =>
                setSim((s) => ({ ...s, breadPrice: parseFloat(e.target.value) }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min (Cost+20%): ${costPlusTwenty.toFixed(2)}</span>
              <span>$20.00</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Loaves per day: {sim.loavesPerDay}
            </label>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={sim.loavesPerDay}
              onChange={(e) =>
                setSim((s) => ({
                  ...s,
                  loavesPerDay: parseInt(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">
              Marketing spend/day: ${sim.marketingSpend.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={sim.marketingSpend}
              onChange={(e) =>
                setSim((s) => ({
                  ...s,
                  marketingSpend: parseFloat(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={advanceDay}
          disabled={sim.day >= 30}
        >
          {sim.day < 30 ? `Advance to Day ${sim.day + 1}` : "Simulation Complete"}
        </Button>
        {sim.day > 0 && sim.day < 30 && (
          <Button
            variant="outline"
            onClick={() => {
              for (let i = 0; i < Math.min(7, 30 - sim.day); i++) advanceDay();
            }}
          >
            Skip 7 Days
          </Button>
        )}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-4 space-y-1 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
          {log.map((entry, i) => (
            <p key={i} className={i === 0 ? "text-emerald-400" : ""}>
              {entry}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Tab Panels ──────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      <Card className="border-l-4 border-l-amber-500 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Wheat className="h-5 w-5 text-amber-500" />
            The Business Incubator for Makers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-foreground text-sm">
          <p>
            The first Industrial Revolution centralized manufacturing. Factories.
            Assembly lines. Scale at the cost of craft. The second one is
            supposed to decentralize it -- but so far, it has been a promise
            without infrastructure.
          </p>
          <p>
            <strong>Let's Make Bread</strong> is that infrastructure. We are not
            building one factory. We are enabling thousands of tiny ones, each
            owned by the person running it.
          </p>
          <p>
            It is not just for physical products. Service businesses and the Gig
            Economy are a huge part of this incubator. Whether you are making
            physical goods, running a restaurant, or starting a local service
            node, Let's Make Bread helps you turn ideas into prototypes,
            products, services, and sustainable cooperative businesses.
          </p>
        </CardContent>
      </Card>

      {/* Feature tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {[
          {
            icon: Zap,
            title: "$5 Simulator",
            body: "Learn cooperative business economics with a 30-day simulation before you risk real capital.",
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
          {
            icon: Flame,
            title: "Bread Bounties",
            body: "Local production needs posted by community members and nodes. Fill a bounty, earn 83.3%.",
            color: "text-orange-600",
            bg: "bg-orange-50",
          },
          {
            icon: ShoppingCart,
            title: "Group Buying",
            body: "Aggregate ingredient orders with other bakers. Cost+20% pricing, minimum runs unlocked by volume.",
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            icon: ChefHat,
            title: "Skill Share",
            body: "Teach what you know, earn Marks. Learn from members with verified technique and Harper audit stamps.",
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            icon: BookOpen,
            title: "Recipe Vault",
            body: "Contribute recipes to the community corpus. Verified recipes earn Marks and are freely used by the network.",
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            icon: TrendingUp,
            title: "83.3% to You",
            body: "Every sale, every bounty, every skill session: you keep 83.3% from day one. Cost+20% pricing locks in fairness.",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
        ].map(({ icon: Icon, title, body, color, bg }) => (
          <Card key={title} className={`${bg} border-none`}>
            <CardHeader className="pb-2">
              <Icon className={`h-6 w-6 ${color} mb-1`} />
              <CardTitle className="text-sm font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-foreground/80">{body}</CardContent>
          </Card>
        ))}
      </div>

      {/* HexIsle / Crown */}
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
        <Badge className="bg-amber-500 text-white mb-4">Crown: Industry Chancellor</Badge>
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Why We Wrote to Dale Dougherty
        </h2>
        <p className="text-muted-foreground text-sm max-w-2xl mb-4">
          He coined the word "makers." He started Make: Magazine and Maker
          Faire. He gave the movement a name and a home. We asked him to be
          the Industry Chancellor because Let's Make Bread is the economic
          infrastructure that makes the Maker Movement sustainable.
        </p>
      </div>

      {/* Origin */}
      <Card className="bg-muted border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500" />
            Origin: The Food Truck That Didn't Have to Fail
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          I watched a young woman spend $12,000 on a food truck only to close
          in 90 days because she had not modeled what a slow Tuesday actually
          costs. The idea was solid. The food was good. The financial education
          gap killed it. She did not understand what Cost+20% and an 83.3% labor
          split do to your actual numbers before the money was gone. The $5
          simulator exists because the difference between a failed business and
          a successful one is almost never the idea -- it is whether the founder
          ran the math before writing the check.
        </CardContent>
      </Card>
    </div>
  );
}

function BountiesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [biddingId, setBiddingId] = useState<string | null>(null);
  const [wonIds, setWonIds] = useState<Set<string>>(new Set());

  const { data: liveBounties = [] } = useQuery({
    queryKey: ["bread_bounties", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("bread_bounties")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const bounties = liveBounties.length > 0 ? liveBounties : STUB_BOUNTIES;

  const handleBid = async (id: string, bidPrice: number = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to bid");
      const { error } = await (supabase as any).from("bread_bounty_bids").insert({
        bounty_id: id,
        member_id: user.id,
        bid_price: bidPrice,
        status: "pending",
      });
      if (error && error.code !== "23505") throw error;
      queryClient.invalidateQueries({ queryKey: ["bread_bounties", "open"] });
      setWonIds((prev) => new Set([...prev, id]));
      setBiddingId(null);
      toast({ title: "Bid placed!", description: "Your bid is submitted." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Bread Bounties
          </h2>
          <p className="text-sm text-muted-foreground">
            Local production needs posted by community members and cooperative
            nodes. Fill a bounty, earn 83.3% of the payout.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={() => {
            /* TODO: open post-bounty modal */
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Post Bounty
        </Button>
      </div>

      <div className="space-y-4">
        {STUB_BOUNTIES.map((b) =>
          wonIds.has(b.id) ? (
            <Card key={b.id} className="border-emerald-300 bg-emerald-50">
              <CardContent className="pt-4 flex items-center gap-3 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">
                  Bid submitted for "{b.title}". The poster will be notified.
                </span>
              </CardContent>
            </Card>
          ) : (
            <Card key={b.id} className="border border-border hover:border-amber-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{b.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      b.daysLeft <= 3
                        ? "border-red-400 text-red-700"
                        : "border-amber-400 text-amber-700"
                    }`}
                  >
                    {b.daysLeft}d left
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Posted by {b.postedBy} -- {b.neighborhood}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-foreground">{b.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    <Package className="inline h-3.5 w-3.5 mr-1" />
                    {b.quantity}
                  </span>
                  <span>
                    <DollarSign className="inline h-3.5 w-3.5 mr-1" />
                    ${b.pricePerUnit.toFixed(2)}/unit
                  </span>
                  <span>
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    {b.bids} bid{b.bids !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleBid(b.id)}
                  >
                    Bid on This Bounty
                  </Button>
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {liveBounties.length === 0 ? "Showing sample bounties. Live bounties appear after launch." : `${liveBounties.length} live bounties from your community.`}
      </p>
    </div>
  );
}

function GroupBuyTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const { data: liveListings = [] } = useQuery({
    queryKey: ["bread_group_buy_listings", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("bread_group_buy_listings")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleJoin = async (id: string, unitPrice: number = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to join a group buy");
      const { error } = await (supabase as any).from("bread_group_buy_orders").insert({
        listing_id: id,
        member_id: user.id,
        quantity: 1,
        total_cost: unitPrice,
      });
      if (error && error.code !== "23505") throw error;
      queryClient.invalidateQueries({ queryKey: ["bread_group_buy_listings", "open"] });
      setJoinedIds((prev) => new Set([...prev, id]));
      toast({ title: "Joined!", description: "Your order is registered." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Group Ingredient Purchasing
        </h2>
        <p className="text-sm text-muted-foreground">
          Aggregate orders with other bakers to unlock bulk pricing.
          All prices are Cost+20% -- transparent before you commit.
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Cost+20% means the platform adds exactly 20% to the organizer's
            verified wholesale cost. No hidden markup. You see the math before
            you order.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {STUB_GROUP_BUYS.map((listing) => {
          const progress = Math.min(
            100,
            (listing.currentOrders / listing.minimumOrders) * 100
          );
          const isLive = listing.currentOrders >= listing.minimumOrders;
          const joined = joinedIds.has(listing.id);

          return (
            <Card
              key={listing.id}
              className={`border ${isLive ? "border-emerald-400" : "border-border"} hover:border-green-400 transition-colors`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{listing.ingredient}</CardTitle>
                  {isLive && (
                    <Badge className="bg-emerald-500 text-white text-xs shrink-0">
                      LIVE
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  Organized by {listing.organizer} -- closes {listing.closeDate}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Wholesale cost
                    </span>
                    <span className="font-medium">${listing.baseCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Your price (Cost+20%)
                    </span>
                    <span className="font-bold text-emerald-700">
                      ${listing.memberPrice.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Orders
                    </span>
                    <span className="font-medium">
                      {listing.currentOrders} / {listing.minimumOrders} min
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isLive ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLive
                      ? "Minimum reached! Order is live."
                      : `${listing.minimumOrders - listing.currentOrders} more orders needed to go live.`}
                  </p>
                </div>

                {joined ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    You are in this order.
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleJoin(listing.id)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Join This Order
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {liveListings.length === 0 ? "Showing sample group buys. Live orders appear after launch." : `${liveListings.length} live group buys open.`}
      </p>
    </div>
  );
}

function SkillShareTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  const { data: liveSessions = [] } = useQuery({
    queryKey: ["bread_skill_sessions", "open"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("bread_skill_sessions")
        .select("*")
        .eq("status", "open")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const handleRegister = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to register");
      const { error } = await (supabase as any).from("bread_skill_registrations").insert({
        session_id: id,
        member_id: user.id,
      });
      if (error && error.code !== "23505") throw error;
      queryClient.invalidateQueries({ queryKey: ["bread_skill_sessions", "open"] });
      setRegisteredIds((prev) => new Set([...prev, id]));
      toast({ title: "Registered!", description: "You are signed up for this skill session." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Skill Share
          </h2>
          <p className="text-sm text-muted-foreground">
            Teach what you know, earn participation credits (Marks). Learn from
            members with verified skills and Harper audit stamps.
          </p>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            /* TODO: open teach-a-session modal */
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Offer a Session
        </Button>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 flex gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Marks earned for teaching are participation credits only. They are
            not financial instruments and carry no guaranteed monetary value.
            {/* TODO (pawn): surface Marks rates from marksPayoutWiring after Founder rate-lock */}
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {STUB_SKILL_SESSIONS.map((session) => {
          const registered = registeredIds.has(session.id);
          return (
            <Card key={session.id} className="border border-border hover:border-blue-400 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{session.title}</CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 text-xs shrink-0">
                    {session.marksEarned} Marks
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {session.instructor} -- {session.date} -- {session.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    <ChefHat className="inline h-3.5 w-3.5 mr-1" />
                    Skill: {session.skill}
                  </span>
                  <span>
                    <Users className="inline h-3.5 w-3.5 mr-1" />
                    {session.spotsLeft} spot{session.spotsLeft !== 1 ? "s" : ""}{" "}
                    left
                  </span>
                </div>
                {registered ? (
                  <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    You are registered.
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleRegister(session.id)}
                    disabled={session.spotsLeft === 0}
                  >
                    Register
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {liveSessions.length === 0 ? "Showing sample sessions. Live sessions appear after launch." : `${liveSessions.length} sessions open for registration.`}
      </p>
    </div>
  );
}

function RecipeVaultTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitCategory, setSubmitCategory] = useState("");
  const [submitBody, setSubmitBody] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to submit a recipe");
      const { error } = await (supabase as any).from("bread_recipes").insert({
        author_id: user.id,
        title: submitTitle,
        category: submitCategory || "bread",
        body: submitBody,
        marks_reward: 30,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["bread_recipes"] });
      setSubmitted(true);
      toast({ title: "Recipe submitted!", description: "+30 Marks will be awarded after Harper verification." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          Community Recipe Vault
        </h2>
        <p className="text-sm text-muted-foreground">
          Contribute recipes to the community corpus. Harper-verified recipes
          earn participation Marks and are freely available to the network.
        </p>
      </div>

      {/* Existing recipes */}
      <div className="space-y-3">
        {STUB_RECIPES.map((r) => (
          <Card key={r.id} className="border border-border">
            <CardContent className="pt-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm text-foreground">{r.title}</p>
                  {r.harperVerified && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      Harper Verified
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {r.contributor} -- {r.category} -- {r.uses} uses
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-blue-700">
                  {r.marksAwarded} Marks
                </p>
                <p className="text-xs text-muted-foreground">awarded</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contribute form */}
      <div className="border-t border-border pt-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Contribute a Recipe
        </h3>
        {submitted ? (
          <Card className="bg-emerald-50 border-emerald-400">
            <CardContent className="pt-4 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium text-sm">Recipe submitted for Harper review.</p>
                <p className="text-xs">
                  If verified, you will earn Marks as a participation credit.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmitRecipe} className="space-y-4 max-w-xl">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Recipe title
              </label>
              <Input
                placeholder="e.g., Classic No-Knead Sourdough"
                value={submitTitle}
                onChange={(e) => setSubmitTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Category
              </label>
              <Input
                placeholder="e.g., Sourdough, Quick Bread, Flatbread, Pastry"
                value={submitCategory}
                onChange={(e) => setSubmitCategory(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">
                Recipe (ingredients + instructions)
              </label>
              <Textarea
                placeholder="Provide complete ingredients and step-by-step instructions..."
                value={submitBody}
                onChange={(e) => setSubmitBody(e.target.value)}
                rows={8}
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!submitTitle.trim() || !submitBody.trim()}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Submit for Harper Review
            </Button>
            <p className="text-xs text-muted-foreground">
              Marks are awarded after Harper verification. Marks = participation
              credits, not financial instruments.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const TABS: { id: BreadTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Wheat },
  { id: "simulator", label: "$5 Simulator", icon: Zap },
  { id: "bounties", label: "Bread Bounties", icon: Flame },
  { id: "group-buy", label: "Group Buying", icon: ShoppingCart },
  { id: "skill-share", label: "Skill Share", icon: ChefHat },
  { id: "recipe-vault", label: "Recipe Vault", icon: BookOpen },
  { id: "cue-card", label: "Cue Card", icon: Star },
];

export default function LetsMakeBreadPage() {
  usePageSEO({
    title: "Let's Make Bread | Liana Banyan",
    description: "Cooperative artisan bread baking circles. Share recipes, coordinate baking runs, and sell locally with 83.3% kept by the baker.",
    canonical: "https://lianabanyan.com/initiatives/lets-make-bread",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<BreadTab>("overview");
  const cueCard = getCueCard("lets-make-bread");

  return (
    <LaunchConditionOverlay
      initiativeSlug="lets-make-bread"
      initiativeName="Let's Make Bread"
    >
      <PortalPageLayout maxWidth="xl" xrayId="lets-make-bread-page">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge
              variant="outline"
              className="text-amber-600 border-amber-600"
            >
              Initiative #11
            </Badge>
            <Badge variant="outline" className="text-slate-500 border-slate-400 text-xs">
              Business Incubator for Makers
            </Badge>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Wheat className="h-8 w-8 text-amber-600" />
            Let's Make Bread
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            From the $5 business simulator to real cooperative enterprises.
            Bakers, makers, and food producers building together.
          </p>
        </div>

        {/* Tab Nav */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={tab === id ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(id)}
              className={tab === id ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              <Icon className="h-4 w-4 mr-1.5" />
              {label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {tab === "overview" && <OverviewTab />}
          {tab === "simulator" && <BusinessSimulator />}
          {tab === "bounties" && <BountiesTab />}
          {tab === "group-buy" && <GroupBuyTab />}
          {tab === "skill-share" && <SkillShareTab />}
          {tab === "recipe-vault" && <RecipeVaultTab />}
          {tab === "cue-card" && cueCard && (
            <div className="max-w-md">
              <InitiativeCueCard card={cueCard} />
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Share this card with a maker who has a business idea.
              </p>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/cephas/founder-proof")}
          >
            Read the Founder's Writings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/initiatives")}
          >
            All Initiatives
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
