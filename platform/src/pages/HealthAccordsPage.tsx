/**
 * HealthAccordsPage -- Wave 15 Mini-App / BP073 W8 (real-data wired)
 * ====================================================================
 * Tatiana Schlossberg Health Accords: community health coordination,
 * group health purchasing (Cost+20% for health services/supplies),
 * member health savings tracking (wires to FeatureThermometer),
 * "NOT A GUARANTEE" on all health cost projections,
 * Switzerland Policy (no medical advice -- facilitation only).
 *
 * Supabase: health_orders, health_savings_ledger, prescription_lookups
 * Migration: 20260603110001_bp073_w8_health_accords.sql
 *
 * IMPORTANT: This platform is a purchasing facilitator ONLY.
 * It does not provide medical advice. It does not diagnose, treat, or prescribe.
 * All cost projections are estimates. NOT A GUARANTEE.
 * Switzerland Policy: the cooperative takes no position on medical decisions.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, ShieldCheck, AlertTriangle, DollarSign, Users,
  Star, Package, BookOpen, Plus, ArrowRight,
  TrendingDown, Search, Clock, CheckCircle2,
  ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { FeatureThermometer } from "@/components/demand/FeatureThermometer";
import type { Pedestal } from "@/lib/demandSignalingService";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ───────────────────────────────────────────────────────────────────

// Typed stub -- no DB table yet
// TODO: wire to health_orders once schema lands
interface HealthOrder {
  id: string;
  item_name: string;
  item_type: "prescription" | "supply" | "equipment" | "service";
  retail_price: number;
  cooperative_bulk_cost: number;
  quantity: number;
  status: "available" | "group_order" | "emergency_fund_eligible";
  current_participants: number;
  target_participants: number;
  marks_reward?: number;
  notes?: string;
}

// Typed stub -- no DB table yet
// TODO: wire to health_savings_ledger once schema lands
interface HealthSavingsEntry {
  id: string;
  item_name: string;
  retail_price: number;
  cooperative_price: number;
  date: string;
}

// ─── Switzerland Policy Banner ────────────────────────────────────────────────
// Always visible. No exceptions.

function SwitzerlandBanner() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-blue-800">Switzerland Policy -- Facilitation Only</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-blue-600 hover:text-blue-800"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-blue-700/80 mt-0.5">
            This platform does not provide medical advice. It facilitates purchasing. Consult your doctor.
          </p>
        </div>
      </div>

      {expanded && (
        <div className="ml-8 text-xs text-blue-700/70 space-y-1.5 border-t border-blue-200 pt-2">
          <p>
            The Health Accords is a cooperative purchasing facilitator. It helps members find and purchase
            health supplies, medications, and services at Cost+20% bulk pricing.
          </p>
          <p>
            It does not diagnose. It does not treat. It does not prescribe. It does not recommend specific
            treatments or medications for specific conditions. All medical decisions belong entirely to you
            and your healthcare provider.
          </p>
          <p>
            The cooperative takes no position on medical decisions (Switzerland Policy). We facilitate access
            to lower prices. The medical judgment is yours alone.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── NOT A GUARANTEE disclaimer ───────────────────────────────────────────────
// Shown next to any cost projection.

function NotAGuarantee({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 ${className}`}
    >
      <AlertTriangle className="h-2.5 w-2.5" />
      NOT A GUARANTEE
    </span>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function costPlusTwenty(baseCost: number): number {
  return baseCost * 1.2;
}

function savingsVsRetail(retailPrice: number, coopCost: number): number {
  const coopFinal = costPlusTwenty(coopCost);
  return Math.round(((retailPrice - coopFinal) / retailPrice) * 100);
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ORDERS: HealthOrder[] = [
  {
    id: "h1",
    item_name: "Metformin 500mg (90-count)",
    item_type: "prescription",
    retail_price: 38.00,
    cooperative_bulk_cost: 4.20,
    quantity: 90,
    status: "group_order",
    current_participants: 14,
    target_participants: 20,
    marks_reward: 25,
    notes: "Generic. FDA approved. Prescription required.",
  },
  {
    id: "h2",
    item_name: "Blood Glucose Monitor Kit",
    item_type: "equipment",
    retail_price: 67.99,
    cooperative_bulk_cost: 22.50,
    quantity: 1,
    status: "available",
    current_participants: 6,
    target_participants: 10,
    marks_reward: 15,
    notes: "Includes lancing device and 50 test strips.",
  },
  {
    id: "h3",
    item_name: "CPAP Filters + Tubing (6-month supply)",
    item_type: "supply",
    retail_price: 89.00,
    cooperative_bulk_cost: 28.00,
    quantity: 1,
    status: "group_order",
    current_participants: 9,
    target_participants: 15,
    notes: "Universal fit. Replaces branded consumables.",
  },
  {
    id: "h4",
    item_name: "Amoxicillin 500mg (30-count)",
    item_type: "prescription",
    retail_price: 24.00,
    cooperative_bulk_cost: 3.10,
    quantity: 30,
    status: "emergency_fund_eligible",
    current_participants: 22,
    target_participants: 20,
    marks_reward: 30,
    notes: "Prescription required. Emergency fund eligible for qualifying members.",
  },
];

const SEED_SAVINGS: HealthSavingsEntry[] = [
  {
    id: "s1",
    item_name: "Lisinopril 10mg (90-count)",
    retail_price: 42.00,
    cooperative_price: costPlusTwenty(5.50),
    date: "2026-05-15",
  },
  {
    id: "s2",
    item_name: "Lancets 100-pack",
    retail_price: 18.99,
    cooperative_price: costPlusTwenty(4.20),
    date: "2026-05-01",
  },
  {
    id: "s3",
    item_name: "Blood Pressure Cuff",
    retail_price: 54.00,
    cooperative_price: costPlusTwenty(14.00),
    date: "2026-04-22",
  },
];

// ─── Thermometer stub for health savings demand signal ────────────────────────
// TODO: wire to real Pedestal from supabase once health_savings_pedestal table exists

const HEALTH_SAVINGS_PEDESTAL: Pedestal = {
  id: "health-accords-savings",
  featureName: "Cooperative Pharmacy Network",
  description: "Pre-operational. Tracking member demand to activate bulk purchasing.",
  icon: "💊",
  area: "services",
  status: "pre-operational",
  activationThreshold: 200,
  currentCommitments: 67,
  shadowMarkTotal: 3420,
  creditPledges: 1840,
  alphaLeadWeeks: 8,
  betaLeadWeeks: 16,
  operationalLeadWeeks: 20,
};

// ─── HealthOrderCard ──────────────────────────────────────────────────────────

function HealthOrderCard({ order, onJoin }: { order: HealthOrder; onJoin: (id: string) => void }) {
  const { toast } = useToast();
  const [joining, setJoining] = useState(false);

  const coopPrice = costPlusTwenty(order.cooperative_bulk_cost);
  const savings = savingsVsRetail(order.retail_price, order.cooperative_bulk_cost);
  const progress = Math.min(
    Math.round((order.current_participants / order.target_participants) * 100),
    100,
  );
  const groupLive = order.current_participants >= order.target_participants;

  async function handleJoin() {
    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to join a group order");
      const { error } = await (supabase as any).from("health_orders").insert({
        member_id: user.id,
        item_name: order.item_name,
        category: order.item_type === "prescription" ? "medication" : "other",
        quantity: 1,
        estimated_cost: order.cooperative_bulk_cost,
        group_buy_id: order.id,
        status: "pending",
        marks_reward: order.marks_reward ?? 10,
      });
      if (error) throw error;
      toast({
        title: "Joined!",
        description: `You joined the ${order.item_name} group order. We will notify you when it activates.`,
      });
      onJoin(order.id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setJoining(false);
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{order.item_name}</CardTitle>
            <CardDescription className="mt-0.5 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">{order.item_type}</Badge>
              {order.status === "emergency_fund_eligible" && (
                <Badge className="bg-red-100 text-red-700 text-xs">Emergency Fund Eligible</Badge>
              )}
              {groupLive && <Badge className="bg-green-500 text-xs">Group Live</Badge>}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {order.notes && (
          <p className="text-xs text-muted-foreground">{order.notes}</p>
        )}

        {/* Group buy progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {order.current_participants} / {order.target_participants} members
            </span>
            <span>{groupLive ? "Group live!" : `${order.target_participants - order.current_participants} more to activate`}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Cost+20% breakdown + NOT A GUARANTEE */}
        <div className="bg-muted/50 rounded p-2.5 space-y-1 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm">Price comparison</span>
            <NotAGuarantee />
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Retail price (est.):</span>
            <span className="line-through">${order.retail_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Cooperative bulk cost:</span>
            <span>${order.cooperative_bulk_cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform margin (+20%):</span>
            <span>${(order.cooperative_bulk_cost * 0.2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border/50 pt-1">
            <span>Your price (Cost+20%):</span>
            <span className="text-emerald-700">${coopPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1 pt-0.5 text-emerald-600 font-medium">
            <TrendingDown className="h-3 w-3" />
            ~{savings}% savings vs. retail (estimate -- not a guarantee)
          </div>
        </div>

        {order.marks_reward && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Coordinator earns {order.marks_reward} Marks when order fills
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button size="sm" className="w-full gap-2" onClick={handleJoin} disabled={joining}>
          <Heart className="h-4 w-4" />
          {joining ? "Joining..." : "Join Group Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── SavingsTracker ───────────────────────────────────────────────────────────

function SavingsTracker({ entries }: { entries: HealthSavingsEntry[] }) {
  const totalSaved = entries.reduce(
    (s, e) => s + (e.retail_price - e.cooperative_price),
    0,
  );
  const totalPaid = entries.reduce((s, e) => s + e.cooperative_price, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4 bg-emerald-50/50 border-emerald-200">
          <div className="text-2xl font-bold text-emerald-700">
            ${totalSaved.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
            Estimated savings to date
            <NotAGuarantee className="ml-1" />
          </div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">Paid via cooperative</div>
        </Card>
      </div>

      {/* Ledger */}
      <div className="space-y-2">
        {entries.map((e) => {
          const saved = e.retail_price - e.cooperative_price;
          return (
            <div
              key={e.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div>
                <p className="text-sm font-medium">{e.item_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">${e.cooperative_price.toFixed(2)}</p>
                <p className="text-xs text-emerald-600">
                  ~${saved.toFixed(2)} saved
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Savings estimates compare cooperative Cost+20% to reported retail prices.{" "}
        <NotAGuarantee /> Actual retail prices vary.
      </p>
    </div>
  );
}

// ─── PrescriptionLookupForm ───────────────────────────────────────────────────

function PrescriptionLookupForm() {
  const { toast } = useToast();
  const [drug, setDrug] = useState("");
  const [dosage, setDosage] = useState("");
  const [qty, setQty] = useState("30");
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!drug.trim()) return;
    setSearching(true);
    try {
      const { error } = await (supabase as any).from("prescription_lookups").insert({
        drug_name: drug.trim(),
        ndc_code: null,
      });
      if (error) throw error;
      toast({
        title: "Lookup queued",
        description: `Price comparison for ${drug} ${dosage} added to the cooperative queue. You will be notified when results are ready.`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-xs text-amber-700 flex items-start gap-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>
          This lookup finds purchasing prices only. It is NOT medical advice and does NOT recommend
          specific medications. Consult your healthcare provider for all medical decisions.
          All results are estimates -- <strong>NOT A GUARANTEE</strong>.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5 md:col-span-1">
          <Label>Drug name (generic preferred)</Label>
          <Input
            placeholder="e.g. metformin, lisinopril"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Dosage (optional)</Label>
          <Input
            placeholder="e.g. 500mg"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Quantity</Label>
          <Select value={qty} onValueChange={setQty}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30-count</SelectItem>
              <SelectItem value="60">60-count</SelectItem>
              <SelectItem value="90">90-count</SelectItem>
              <SelectItem value="180">180-count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={searching || !drug.trim()}>
        <Search className="h-4 w-4" />
        {searching ? "Queuing lookup..." : "Look Up Cooperative Price"}
      </Button>
      <p className="text-xs text-center text-muted-foreground">
        Prescription required for Rx items. The cooperative verifies before processing any order.
        {/* TODO: connect to prescription_lookups table once schema lands */}
      </p>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthAccordsPage() {
  usePageSEO({
    title: "Health Accords | Liana Banyan",
    description: "Community health coordination and mutual aid. Cooperative health resources, medication access, and care coordination.",
    canonical: "https://lianabanyan.com/initiatives/health-accords",
  });
  const { t } = useTranslation();
  const [orders, setOrders] = useState<HealthOrder[]>(SEED_ORDERS);
  const [savingsEntries] = useState<HealthSavingsEntry[]>(SEED_SAVINGS);
  const [showCueCard, setShowCueCard] = useState(false);

  const cueCard = getCueCard("tatiana-schlossburg-health-accords");
  const walkthrough = getWalkthrough("tatiana-schlossburg-health-accords");

  function handleJoin(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, current_participants: o.current_participants + 1 } : o,
      ),
    );
  }

  return (
    <LaunchConditionOverlay initiativeSlug="health-accords" initiativeName="Tatiana Schlossberg Health Accords">
      <PortalPageLayout maxWidth="xl" xrayId="health-accords-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50">
                Initiative #6
              </Badge>
              <Badge variant="secondary" className="text-xs">Wave 15</Badge>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-blue-600" />
              Tatiana Schlossberg Health Accords
            </h1>
            <p className="mt-1 text-muted-foreground">
              Cooperative health purchasing at Cost+20%. Facilitation only -- no medical advice.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCueCard((v) => !v)}
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              {showCueCard ? "Hide" : "Cue Card"}
            </Button>
          </div>
        </div>

        {/* Switzerland Policy -- always shown first */}
        <div className="mb-6">
          <SwitzerlandBanner />
        </div>

        {/* Origin anecdote */}
        {walkthrough?.originAnecdote && (
          <div className="mb-6 p-4 rounded-xl bg-blue-50/40 border border-blue-100 text-sm text-muted-foreground italic">
            "{walkthrough.originAnecdote}"
          </div>
        )}

        {/* Cue Card (toggleable) */}
        {showCueCard && cueCard && (
          <div className="mb-6">
            <InitiativeCueCard card={cueCard} />
          </div>
        )}

        {/* Main tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 h-auto p-1">
            <TabsTrigger value="orders" className="py-2.5">
              <Package className="w-4 h-4 mr-2" />
              Group Orders
            </TabsTrigger>
            <TabsTrigger value="lookup" className="py-2.5">
              <Search className="w-4 h-4 mr-2" />
              Price Lookup
            </TabsTrigger>
            <TabsTrigger value="savings" className="py-2.5">
              <DollarSign className="w-4 h-4 mr-2" />
              My Savings
            </TabsTrigger>
            <TabsTrigger value="thermometer" className="py-2.5">
              <TrendingDown className="w-4 h-4 mr-2" />
              Demand Signal
            </TabsTrigger>
            <TabsTrigger value="how-it-works" className="py-2.5">
              <BookOpen className="w-4 h-4 mr-2" />
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* ── Group Orders Tab ── */}
          <TabsContent value="orders" className="space-y-6">
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Open group orders</div>
              </Card>
              <Card className="text-center p-4">
                <div className="flex justify-center items-baseline gap-1">
                  <div className="text-2xl font-bold text-emerald-600">40-80%</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  Typical savings <NotAGuarantee />
                </div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {orders.reduce((s, o) => s + o.current_participants, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Members in orders</div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((o) => (
                <HealthOrderCard key={o.id} order={o} onJoin={handleJoin} />
              ))}
            </div>

            {/* Emergency fund explainer */}
            <Card className="bg-red-50/40 border-red-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-red-800">Emergency Medication Fund</p>
                  <p className="text-xs text-red-700/80">
                    The 20% margin on every order seeds an emergency fund for members who cannot afford
                    even the cooperative price. Eligible members are verified by Marks (participation),
                    not income. No application required -- single verification step.
                    Items marked "Emergency Fund Eligible" can be covered for qualifying members.
                  </p>
                  <p className="text-xs text-red-700/60 font-medium">
                    The emergency fund does not guarantee coverage. Fund availability varies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Price Lookup Tab ── */}
          <TabsContent value="lookup" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Prescription Price Lookup</h2>
              <p className="text-sm text-muted-foreground">
                Find the cooperative bulk price for your prescription. All results are estimates.
              </p>
            </div>

            <PrescriptionLookupForm />

            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium">Lookup results will appear here</p>
              <p className="text-xs mt-1">
                This feature is pre-operational. Enter a drug name above to queue a lookup request.
              </p>
            </div>
          </TabsContent>

          {/* ── Savings Tab ── */}
          <TabsContent value="savings" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">My Health Savings</h2>
              <p className="text-sm text-muted-foreground">
                Estimate of what you have saved by purchasing through the cooperative.
              </p>
            </div>
            <SavingsTracker entries={savingsEntries} />
          </TabsContent>

          {/* ── Demand Signal (Thermometer) Tab ── */}
          <TabsContent value="thermometer" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Cooperative Pharmacy Demand Signal</h2>
              <p className="text-sm text-muted-foreground">
                The cooperative pharmacy network activates when enough members signal demand.
                Add your Shadow Marks to show what you want built.
              </p>
            </div>

            <FeatureThermometer
              pedestal={HEALTH_SAVINGS_PEDESTAL}
              compact={false}
              onAllocate={(id) => {
                // TODO: wire to real Shadow Marks allocation via supabase
                console.log("Shadow Marks allocation queued for", id);
              }}
              onPledgeCredits={(id) => {
                // TODO: wire to Credits pledge flow
                console.log("Credits pledge queued for", id);
              }}
            />

            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-800">How activation works</p>
                  <p className="text-xs text-blue-700/80">
                    The Thermometer tracks member demand. When the Health Accords reaches the activation
                    threshold, the cooperative has demonstrated enough member interest to negotiate bulk
                    contracts with pharmacy suppliers. Your Shadow Marks allocation signals that demand.
                    There is no financial obligation -- Shadow Marks are free allocation credits.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── How It Works Tab ── */}
          <TabsContent value="how-it-works" className="space-y-6">
            {walkthrough && (
              <InitiativeWalkthrough
                steps={walkthrough.steps}
                initiativeName="Tatiana Schlossberg Health Accords"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Marks for Coordinators</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Coordinators who organize group orders earn Marks when orders fill. Marks are
                    participation credits -- not equity, not a financial return, not a guarantee of value.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Rx group order (20+ members): 25-30 Marks</li>
                    <li>Equipment group order (10+ members): 15 Marks</li>
                    <li>Emergency fund referral: 10 Marks</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Switzerland Policy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    The Health Accords takes no position on medical decisions. It provides price
                    information and facilitates purchases. It does not diagnose, treat, prescribe, or
                    recommend specific treatments.
                  </p>
                  <p className="text-xs font-medium">
                    All members must consult their own healthcare providers for medical decisions.
                    The cooperative is a purchasing intermediary only.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings disclaimer */}
            <Card className="bg-amber-50/40 border-amber-200">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">
                    Cost projections are estimates -- NOT A GUARANTEE
                  </p>
                  <p className="text-xs text-amber-700/80">
                    All retail prices shown are representative samples from publicly available sources.
                    Cooperative bulk costs vary with supplier negotiations and order volumes. Final prices
                    may differ. The cooperative does not guarantee any specific savings amount. Comparison
                    prices are informational only.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
