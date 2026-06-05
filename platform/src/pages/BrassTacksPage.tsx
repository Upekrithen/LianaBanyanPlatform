/**
 * BrassTacksPage -- Wave 19 / BP073 W9 (real-data wired)
 * ========================================================
 * Practical skills + trades coordination mini-app.
 * "Get to brass tacks" -- real-world help, skilled trades matching, local service coordination.
 * Cost+20% pricing, Marks for skilled work, Guild Masters as Professionals concept.
 * LinkedIn OIDC for professional credential verification (held for founder -- staged, not live).
 *
 * Supabase: guild_master_profiles (real), brass_tacks_claims (real)
 * Migration: 20260603120001_bp073_w9_guild_master_profiles.sql
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Hammer, Wrench, Cog, Star, Shield, MapPin, Clock,
  DollarSign, Award, Users, Search, Plus, CheckCircle2,
  ArrowRight, HardHat, Zap, Droplets, TreePine, Factory,
  FileText, Lock, ChevronRight, Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import { COST_PLUS_CONSTANTS } from "@/lib/costPlusService";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Typed stubs (TODO: wire to Supabase tables) ─────────────────────────────

export type TradeCategory =
  | "plumbing"
  | "electrical"
  | "carpentry"
  | "hvac"
  | "masonry"
  | "landscaping"
  | "3d-printing"
  | "welding"
  | "general";

export type GuildMasterTier = "apprentice" | "journeyman" | "master";

export interface GuildMasterProfile {
  id: string;
  handle: string;
  displayName: string;
  trade: TradeCategory;
  tier: GuildMasterTier;
  /** Marks balance from cooperative participation */
  marksBalance: number;
  /** Average rating from completed jobs */
  rating: number;
  completedJobs: number;
  hourlyRateCost: number;
  location: string;
  verified: boolean;
  /** LinkedIn credential verified -- TODO: wire to LinkedIn OIDC when scope is live */
  linkedinVerified: boolean;
  specialties: string[];
  available: boolean;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  trade: TradeCategory;
  estimatedHours: number;
  budgetCredits: number;
  location: string;
  urgency: "flexible" | "this-week" | "urgent";
  postedBy: string;
  postedAt: string;
  status: "open" | "matched" | "in-progress" | "complete";
  marksForCompletion: number;
}

export interface ReputationRecord {
  memberId: string;
  jobId: string;
  rating: number;
  review: string;
  marksAwarded: number;
  tradeCategory: TradeCategory;
  completedAt: string;
}

// ─── Static stub data (TODO: replace with Supabase queries) ──────────────────

const TRADE_META: Record<TradeCategory, { label: string; icon: React.ElementType; color: string }> = {
  plumbing:     { label: "Plumbing",      icon: Droplets,  color: "text-blue-600" },
  electrical:   { label: "Electrical",    icon: Zap,       color: "text-yellow-600" },
  carpentry:    { label: "Carpentry",     icon: Hammer,    color: "text-amber-700" },
  hvac:         { label: "HVAC",          icon: Cog,       color: "text-slate-600" },
  masonry:      { label: "Masonry",       icon: HardHat,   color: "text-stone-600" },
  landscaping:  { label: "Landscaping",   icon: TreePine,  color: "text-green-600" },
  "3d-printing":{ label: "3D Printing",   icon: Factory,   color: "text-violet-600" },
  welding:      { label: "Welding",       icon: Wrench,    color: "text-orange-700" },
  general:      { label: "General",       icon: HardHat,   color: "text-gray-600" },
};

const GUILD_MASTERS: GuildMasterProfile[] = [
  {
    id: "gm-001", handle: "torres_plumbing", displayName: "Carlos Torres",
    trade: "plumbing", tier: "master",
    marksBalance: 1240, rating: 4.9, completedJobs: 87,
    hourlyRateCost: 45, location: "Austin, TX",
    verified: true, linkedinVerified: false, // TODO: LinkedIn OIDC
    specialties: ["Pipe repair", "Water heater install", "Leak detection"],
    available: true,
  },
  {
    id: "gm-002", handle: "watts_electric", displayName: "Priya Watts",
    trade: "electrical", tier: "master",
    marksBalance: 980, rating: 4.8, completedJobs: 64,
    hourlyRateCost: 55, location: "Austin, TX",
    verified: true, linkedinVerified: false,
    specialties: ["Panel upgrades", "EV charger install", "Code compliance"],
    available: true,
  },
  {
    id: "gm-003", handle: "build_with_sam", displayName: "Sam Okonkwo",
    trade: "carpentry", tier: "journeyman",
    marksBalance: 620, rating: 4.7, completedJobs: 38,
    hourlyRateCost: 35, location: "Round Rock, TX",
    verified: true, linkedinVerified: false,
    specialties: ["Deck building", "Interior framing", "Furniture repair"],
    available: false,
  },
  {
    id: "gm-004", handle: "cold_side_hvac", displayName: "Marcus Rivera",
    trade: "hvac", tier: "master",
    marksBalance: 1560, rating: 4.9, completedJobs: 112,
    hourlyRateCost: 60, location: "San Marcos, TX",
    verified: true, linkedinVerified: false,
    specialties: ["Mini-split install", "Duct cleaning", "AC diagnosis"],
    available: true,
  },
  {
    id: "gm-005", handle: "hexisle_prints", displayName: "Dana Zhao",
    trade: "3d-printing", tier: "journeyman",
    marksBalance: 430, rating: 4.6, completedJobs: 29,
    hourlyRateCost: 20, location: "Remote",
    verified: true, linkedinVerified: false,
    specialties: ["SLA prototyping", "FDM production runs", "HexIsle components"],
    available: true,
  },
];

const SERVICE_REQUESTS: ServiceRequest[] = [
  {
    id: "sr-001", title: "Kitchen faucet replacement + under-sink leak",
    description: "Dripping faucet in kitchen, small leak under sink around supply line. Need licensed plumber.",
    trade: "plumbing", estimatedHours: 2, budgetCredits: 120,
    location: "Austin, TX 78704", urgency: "this-week",
    postedBy: "member_harris", postedAt: "2026-06-01",
    status: "open", marksForCompletion: 40,
  },
  {
    id: "sr-002", title: "240V outlet for EV charger in garage",
    description: "Need a 240V/50A outlet installed in my attached garage for a Level 2 EV charger. Panel has capacity.",
    trade: "electrical", estimatedHours: 3, budgetCredits: 210,
    location: "Cedar Park, TX", urgency: "flexible",
    postedBy: "member_chen", postedAt: "2026-06-01",
    status: "open", marksForCompletion: 55,
  },
  {
    id: "sr-003", title: "100x HexIsle game tiles - SLA print run",
    description: "Need 100 sets of the small hex connector tile (STL file provided). High detail SLA preferred.",
    trade: "3d-printing", estimatedHours: 12, budgetCredits: 280,
    location: "Remote (ship to Austin, TX)", urgency: "flexible",
    postedBy: "hexisle_edu", postedAt: "2026-05-30",
    status: "matched", marksForCompletion: 80,
  },
  {
    id: "sr-004", title: "Backyard deck repair - several boards rotted",
    description: "8 deck boards need replacement, plus two joists showing rot. About 120 sq ft deck total.",
    trade: "carpentry", estimatedHours: 6, budgetCredits: 250,
    location: "Round Rock, TX", urgency: "this-week",
    postedBy: "member_vasquez", postedAt: "2026-05-29",
    status: "in-progress", marksForCompletion: 70,
  },
];

// ─── Cost+20% Calculator state ────────────────────────────────────────────────

function CostPlusCalculator() {
  const [costInput, setCostInput] = useState<number>(100);

  const price = Math.round(costInput * (1 + COST_PLUS_CONSTANTS.PLATFORM_MARGIN));
  const workerEarns = Math.round(price * COST_PLUS_CONSTANTS.CREATOR_CUT);
  const platformTake = price - workerEarns;

  return (
    <Card className="border-2 border-zinc-300 dark:border-zinc-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-5 w-5 text-zinc-500" /> Cost+20% Pricing Calculator
        </CardTitle>
        <CardDescription className="text-xs">
          Enter your actual cost; the platform enforces the 20% ceiling.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Your cost (labor + materials, in Credits)</label>
          <input
            type="number"
            min={1}
            value={costInput}
            onChange={(e) => setCostInput(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">Your Cost</p>
            <p className="font-mono font-bold text-lg">{costInput}</p>
            <p className="text-xs text-muted-foreground">Credits</p>
          </div>
          <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">Client Pays</p>
            <p className="font-mono font-bold text-lg text-zinc-700 dark:text-zinc-300">{price}</p>
            <p className="text-xs text-muted-foreground">cost + 20%</p>
          </div>
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900">
            <p className="text-xs text-muted-foreground">You Keep</p>
            <p className="font-mono font-bold text-lg text-emerald-600">{workerEarns}</p>
            <p className="text-xs text-muted-foreground">83.3%</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
          Platform overhead: <span className="font-mono">{platformTake}</span> Credits (16.7%) funds infrastructure + Harper audits.
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: GuildMasterTier }) {
  const colors = {
    apprentice: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300",
    journeyman: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300",
    master: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300",
  };
  const labels = { apprentice: "Apprentice", journeyman: "Journeyman", master: "Guild Master" };
  return (
    <Badge variant="outline" className={`text-xs ${colors[tier]}`}>
      {tier === "master" && <Shield className="h-2.5 w-2.5 mr-1" />}
      {labels[tier]}
    </Badge>
  );
}

function GuildMasterCard({ gm }: { gm: GuildMasterProfile }) {
  const TradeMeta = TRADE_META[gm.trade];
  const TradeIcon = TradeMeta.icon;
  const clientRate = Math.round(gm.hourlyRateCost * (1 + COST_PLUS_CONSTANTS.PLATFORM_MARGIN));

  return (
    <Card className={`transition-shadow hover:shadow-md ${!gm.available ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <TradeIcon className={`h-4 w-4 ${TradeMeta.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">{gm.displayName}</p>
              <p className="text-xs text-muted-foreground">@{gm.handle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TierBadge tier={gm.tier} />
            {gm.available
              ? <Badge className="text-xs bg-green-600 text-white">Available</Badge>
              : <Badge variant="outline" className="text-xs">Unavailable</Badge>
            }
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" /> {gm.rating}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> {gm.completedJobs} jobs
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3 text-indigo-500" /> {gm.marksBalance.toLocaleString()} Marks
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {gm.location}
        </div>
        <div className="flex flex-wrap gap-1">
          {gm.specialties.map((s) => (
            <Badge key={s} variant="outline" className="text-xs px-1.5 py-0">
              {s}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-muted-foreground">
            <span className="font-mono font-bold text-foreground">{clientRate}</span> Credits/hr (cost+20%)
          </span>
          {gm.linkedinVerified && (
            <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
              LinkedIn Verified
            </Badge>
          )}
        </div>
      </CardContent>
      {gm.available && (
        <CardFooter className="pt-0 pb-3">
          <Button size="sm" className="w-full bg-zinc-700 hover:bg-zinc-800 text-white text-xs">
            Request Service
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function UrgencyBadge({ urgency }: { urgency: ServiceRequest["urgency"] }) {
  const map = {
    flexible: { label: "Flexible", color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300" },
    "this-week": { label: "This Week", color: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300" },
    urgent: { label: "Urgent", color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300" },
  };
  const { label, color } = map[urgency];
  return <Badge variant="outline" className={`text-xs ${color}`}>{label}</Badge>;
}

function ServiceRequestCard({ req }: { req: ServiceRequest }) {
  const TradeMeta = TRADE_META[req.trade];
  const TradeIcon = TradeMeta.icon;
  const statusColors: Record<ServiceRequest["status"], string> = {
    open: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300",
    matched: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300",
    "in-progress": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300",
    complete: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <Card className={req.status === "open" ? "border-green-200 dark:border-green-900/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <TradeIcon className={`h-4 w-4 shrink-0 ${TradeMeta.color}`} />
            <CardTitle className="text-sm font-semibold leading-snug">{req.title}</CardTitle>
          </div>
          <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[req.status]}`}>
            {req.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {req.location}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{req.estimatedHours}h</span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Budget: <span className="font-mono font-bold text-foreground">{req.budgetCredits}</span> Credits
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3 text-indigo-500" />
            +{req.marksForCompletion} Marks
          </span>
          <UrgencyBadge urgency={req.urgency} />
        </div>
      </CardContent>
      {req.status === "open" && (
        <CardFooter className="pt-0 pb-3 gap-2">
          <Button size="sm" className="flex-1 bg-zinc-700 hover:bg-zinc-800 text-white text-xs">
            Claim This Job
          </Button>
          <Button size="sm" variant="outline" className="text-xs">Details</Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrassTacksPage() {
  usePageSEO({
    title: "Brass Tacks | Liana Banyan",
    description: "Cooperative legal documents, contracts, and resources for community businesses. Plain-language, member-governed.",
    canonical: "https://lianabanyan.com/initiatives/brass-tacks",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tradeFilter, setTradeFilter] = useState<TradeCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const cueCard = getCueCard("brass-tacks");
  const walkthrough = getWalkthrough("brass-tacks");

  const { data: liveGMs = [] } = useQuery({
    queryKey: ["guild_master_profiles"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("guild_master_profiles")
        .select("*")
        .order("rating", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const allGMs = liveGMs.length > 0
    ? liveGMs.map((gm: any) => ({
        id: gm.id,
        displayName: gm.display_name,
        trade: "general" as TradeCategory,
        specialties: [gm.specialty],
        location: "Network member",
        rating: gm.rating ?? 0,
        reviewCount: 0,
        completedJobs: 0,
        available: true,
        verified: true,
        linkedinVerified: gm.linkedin_verified,
        costPlusRate: 20,
        bio: gm.bio ?? "",
      }))
    : GUILD_MASTERS;

  const filteredGMs = allGMs.filter((gm: any) => {
    const matchTrade = tradeFilter === "all" || gm.trade === tradeFilter;
    const matchSearch = searchQuery === "" ||
      gm.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gm.specialties.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (gm.location ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchAvail = !availableOnly || gm.available;
    return matchTrade && matchSearch && matchAvail;
  });

  const openRequests = SERVICE_REQUESTS.filter((r) => r.status === "open").length;
  const totalPlatformJobs = allGMs.reduce((sum: number, gm: any) => sum + (gm.completedJobs ?? 0), 0);

  return (
    <LaunchConditionOverlay initiativeSlug="brass-tacks" initiativeName="Brass Tacks">
      <PortalPageLayout maxWidth="xl" xrayId="brass-tacks-page">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-zinc-600 rounded-full text-white">
            <Hammer className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground dark:text-white">Brass Tacks</h1>
            <p className="text-lg text-muted-foreground dark:text-slate-400">
              Real-world practical help. Skilled trades at Cost+20%.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Worker Keep", value: "83.3%", sub: "of every job", color: "text-emerald-600" },
            { label: "Pricing Model", value: "C+20%", sub: "locked ceiling", color: "text-zinc-600" },
            { label: "Open Jobs", value: String(openRequests), sub: "needing tradespeople", color: "text-amber-600" },
            { label: "Jobs Done", value: String(totalPlatformJobs), sub: "cooperative track record", color: "text-blue-600" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center p-3">
              <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="find-help" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="find-help" className="text-xs">
              <Search className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Find Help
            </TabsTrigger>
            <TabsTrigger value="job-board" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Jobs
            </TabsTrigger>
            <TabsTrigger value="offer-skills" className="text-xs">
              <HardHat className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Offer Skills
            </TabsTrigger>
            <TabsTrigger value="guild-masters" className="text-xs">
              <Shield className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Guild Masters
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs">
              <Factory className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> About
            </TabsTrigger>
          </TabsList>

          {/* FIND HELP TAB */}
          <TabsContent value="find-help" className="space-y-4">
            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by skill, name, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer self-center">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="rounded"
                />
                Available now
              </label>
            </div>

            {/* Trade filter chips */}
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={tradeFilter === "all" ? "default" : "outline"}
                onClick={() => setTradeFilter("all")}
                className="text-xs h-7"
              >
                All Trades
              </Button>
              {(Object.entries(TRADE_META) as [TradeCategory, typeof TRADE_META[TradeCategory]][]).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={tradeFilter === key ? "default" : "outline"}
                    onClick={() => setTradeFilter(key)}
                    className="text-xs h-7 gap-1"
                  >
                    <Icon className={`h-3 w-3 ${meta.color}`} />
                    {meta.label}
                  </Button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGMs.map((gm) => (
                <GuildMasterCard key={gm.id} gm={gm} />
              ))}
              {filteredGMs.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  No tradespeople match your filters.
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Showing {filteredGMs.length} of {allGMs.length} tradespeople
                {liveGMs.length > 0 ? " (live from database)" : " (sample data)"}
              </p>
              <Button variant="outline" size="sm">Load More</Button>
            </div>
          </TabsContent>

          {/* JOB BOARD TAB */}
          <TabsContent value="job-board" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Open Service Requests</h2>
                <p className="text-sm text-muted-foreground">
                  Members post jobs, tradespeople claim them. Cost+20% pricing, Marks for every completion.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white">{openRequests} Open</Badge>
                <Button size="sm" className="bg-zinc-700 hover:bg-zinc-800 text-white text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Post a Job
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICE_REQUESTS.map((req) => (
                <ServiceRequestCard key={req.id} req={req} />
              ))}
            </div>

            {/* Marks for skilled work */}
            <Card className="bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" /> Marks for Skilled Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { action: "Job completed + rated 5 stars", marks: "+40-80 Marks", note: "Per job, depends on complexity" },
                    { action: "10 jobs milestone", marks: "+100 Marks", note: "Milestone bonus" },
                    { action: "Journeyman to Master promotion", marks: "+250 Marks", note: "Guild tier advancement" },
                  ].map((item) => (
                    <div key={item.action} className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-sm">
                      <p className="font-semibold text-indigo-700 dark:text-indigo-300">{item.marks}</p>
                      <p className="font-medium text-foreground mt-0.5">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* OFFER SKILLS TAB */}
          <TabsContent value="offer-skills" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Registration card */}
              <Card className="border-2 border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardHat className="h-5 w-5 text-zinc-500" /> Register as a Tradesperson
                  </CardTitle>
                  <CardDescription>
                    Join the directory, claim jobs, earn 83.3% of every service fee.
                    Build reputation through the Marks system.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {[
                      "Select your trade categories and specialties",
                      "Upload proof of skill (certifications, portfolio, or references)",
                      "Guild review assigns your starting tier: Apprentice, Journeyman, or Master",
                      "Profile goes live in the directory",
                      "Claim jobs, complete them, collect 83.3%, earn Marks",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-zinc-700 hover:bg-zinc-800 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Register as a Tradesperson
                  </Button>
                </CardFooter>
              </Card>

              {/* Tier progression */}
              <div className="space-y-4">
                <CostPlusCalculator />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Guild Tier Progression</CardTitle>
                    <CardDescription className="text-xs">
                      Marks and job history determine your tier. Higher tiers unlock more visibility.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { tier: "Apprentice" as GuildMasterTier, marks: "0-499 Marks", jobs: "0-9 jobs", perks: "Listed in directory, can claim standard jobs" },
                      { tier: "Journeyman" as GuildMasterTier, marks: "500-999 Marks", jobs: "10-49 jobs", perks: "Priority listing, can post rates, unlocks Medallion sponsorship" },
                      { tier: "master" as GuildMasterTier, marks: "1000+ Marks", jobs: "50+ jobs", perks: "Top of directory, Guild voting rights, LinkedIn verified badge eligible" },
                    ].map((level) => (
                      <div key={level.tier} className="flex items-start gap-3 p-3 rounded-lg border text-sm">
                        <TierBadge tier={level.tier === "master" ? "master" : level.tier} />
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">{level.marks} · {level.jobs}</p>
                          <p className="text-xs">{level.perks}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-muted rounded">
                      <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        Guild Master LinkedIn credential verification is held for the LinkedIn OIDC
                        integration. Professional license verification will auto-populate on connect.
                        {/* TODO: wire to LinkedIn OIDC scope when live */}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* GUILD MASTERS TAB */}
          <TabsContent value="guild-masters" className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Guild Masters</h2>
              <p className="text-sm text-muted-foreground">
                Professionals concept from Brass Tacks: skilled tradespeople who have earned Master tier
                through Marks accumulation and job track record. Highest tier unlocks Guild voting rights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUILD_MASTERS.filter((gm) => gm.tier === "master").map((gm) => (
                <GuildMasterCard key={gm.id} gm={gm} />
              ))}
            </div>

            {/* Reputation system */}
            <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" /> Reputation System
                </CardTitle>
                <CardDescription className="text-xs">
                  Marks are permanent, public, and non-transferable. They are the only true reputation signal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-medium">How Marks accumulate:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" /> Job completion + client rating</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" /> Teaching a Didasko skill</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" /> Governance participation</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-green-500" /> Milestone bonuses at 10/50/100 jobs</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Why Marks matter:</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-zinc-500" /> Determines Guild tier (Apprentice to Master)</li>
                      <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-zinc-500" /> Voting multiplier in cooperative governance</li>
                      <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-zinc-500" /> Harper nomination eligibility at 1,000+</li>
                      <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3 text-zinc-500" /> LinkedIn professional verification badge</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">

                {/* Origin anecdote */}
                {walkthrough?.originAnecdote && (
                  <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-base">Why Brass Tacks Exists</CardTitle>
                      <CardDescription>Founder voice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{walkthrough.originAnecdote}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Crown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Crown: Manufacturing Mentor</CardTitle>
                    <CardDescription>Status: Seeking</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      We are seeking a Crown for Brass Tacks. We need an industrial engineer,
                      supply chain maverick, or logistics expert who understands how to coordinate
                      thousands of independent nodes into a cohesive manufacturing powerhouse.
                    </p>
                    <div className="p-2 bg-muted dark:bg-slate-800 rounded-lg border text-xs">
                      <strong>Status:</strong> Open. Evaluating candidates.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      Nominate a Crown <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Walkthrough */}
                {walkthrough && (
                  <InitiativeWalkthrough
                    steps={walkthrough.steps}
                    initiativeName="Brass Tacks"
                  />
                )}
              </div>

              <div className="space-y-4">
                {cueCard && <InitiativeCueCard card={cueCard} />}

                <CostPlusCalculator />

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">The Maker Portal</CardTitle>
                    <CardDescription className="text-xs">2nd Second Industrial Revolution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-zinc-700 hover:bg-zinc-800 text-white justify-start gap-2 text-sm"
                      onClick={() => navigate("/the-2nd-second")}
                    >
                      <Factory className="h-4 w-4" /> Go to The Maker Portal
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
