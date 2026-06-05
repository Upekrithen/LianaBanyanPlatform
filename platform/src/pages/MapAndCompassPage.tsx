/**
 * MapAndCompassPage -- Wave 22 Phase B
 * =======================================
 * Deep-build landing for the Map & Compass spinout at /spinouts/map-and-compass.
 * Map & Compass = the wayfinding spinout: onboarding path visualization,
 * community resource mapping, integration with unTech and initiative pages.
 *
 * Key features:
 *   - Onboarding path visualization (where am I, where am I going)
 *   - Community resource map (member skills, local services)
 *   - Integrates with unTech onboarding and initiative pages
 *   - External cooperative wayfinding API (Cost+20%)
 *   - $5/year flat membership (no tiers) gates member wayfinding
 *
 * Securities-clean: Marks = cooperative participation, NOT A FINANCIAL RETURN.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Compass,
  Map,
  CheckCircle,
  Circle,
  ArrowRight,
  Users,
  AlertCircle,
  Wrench,
  Leaf,
  ChefHat,
  Zap,
  BookOpen,
  ShoppingCart,
  Navigation,
  Star,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Onboarding path data ─────────────────────────────────────────────────────

interface OnboardingStep {
  id: number;
  label: string;
  description: string;
  link?: { label: string; href: string };
  status: "done" | "current" | "upcoming";
}

const ONBOARDING_PATH: OnboardingStep[] = [
  {
    id: 1,
    label: "Learn what LianaBanyan is",
    description:
      "Understand the cooperative model, Cost+20%, and the 16 Sweet Sixteen Initiatives. How It All Works is the starting point.",
    link: { label: "How It All Works", href: "/how-it-all-works" },
    status: "done",
  },
  {
    id: 2,
    label: "Install Mnemosyne (unTech)",
    description:
      "Download Mnemosyne v0.1.25 -- your family's private AI assistant. One installer, runs on your hardware, no cloud required.",
    link: { label: "unTech Onboarding", href: "/untech-onboarding" },
    status: "done",
  },
  {
    id: 3,
    label: "Join as a member",
    description:
      "Annual membership is $5/year, flat. No tiers. Full platform access for you and your household. Activate your Marks account.",
    status: "current",
  },
  {
    id: 4,
    label: "Find your first initiative",
    description:
      "Browse the 16 Sweet Sixteen Initiatives and find the one that matches your first need -- food, energy, transportation, or skills.",
    link: { label: "Browse Initiatives", href: "/initiatives" },
    status: "upcoming",
  },
  {
    id: 5,
    label: "Connect with nearby members",
    description:
      "Explore the community resource map to find members in your zip code offering the skills or services you need.",
    status: "upcoming",
  },
  {
    id: 6,
    label: "Contribute your first resource",
    description:
      "Add your skill or service to the community map. List what you can offer. Start building your cooperative reputation.",
    status: "upcoming",
  },
];

// ─── Community resource map data ─────────────────────────────────────────────

interface ResourceListing {
  id: string;
  memberHandle: string;
  category: string;
  icon: typeof Wrench;
  iconColor: string;
  skill: string;
  area: string;
  rating: number;
  initiative?: string;
}

const RESOURCE_LISTINGS: ResourceListing[] = [
  {
    id: "r1",
    memberHandle: "atlas-node-7",
    category: "Manufacturing",
    icon: Wrench,
    iconColor: "text-amber-400",
    skill: "Small-batch electronics assembly",
    area: "San Antonio, TX 78201",
    rating: 4.8,
    initiative: "Defense Klaus",
  },
  {
    id: "r2",
    memberHandle: "family-table-sf",
    category: "Food",
    icon: ChefHat,
    iconColor: "text-orange-400",
    skill: "Community meal coordination (200+ people)",
    area: "San Francisco, CA 94110",
    rating: 4.9,
    initiative: "Let's Make Dinner",
  },
  {
    id: "r3",
    memberHandle: "green-leaf-collective",
    category: "Agriculture",
    icon: Leaf,
    iconColor: "text-green-400",
    skill: "Urban farming consultation, vertical grow setup",
    area: "Chicago, IL 60614",
    rating: 4.7,
    initiative: "The Pantry",
  },
  {
    id: "r4",
    memberHandle: "watts-dispatch-node",
    category: "Energy",
    icon: Zap,
    iconColor: "text-yellow-400",
    skill: "Home battery installation and dispatch wiring",
    area: "Los Angeles, CA 90001",
    rating: 5.0,
    initiative: "Battery Dispatch",
  },
  {
    id: "r5",
    memberHandle: "bookshelf-commons",
    category: "Education",
    icon: BookOpen,
    iconColor: "text-blue-400",
    skill: "Adult literacy tutoring, cooperative economics",
    area: "Detroit, MI 48201",
    rating: 4.6,
    initiative: "Didasko",
  },
  {
    id: "r6",
    memberHandle: "corner-cart-coop",
    category: "Retail",
    icon: ShoppingCart,
    iconColor: "text-violet-400",
    skill: "Neighborhood grocery sourcing, bulk buying coordination",
    area: "Brooklyn, NY 11201",
    rating: 4.8,
    initiative: "Let's Get Groceries",
  },
];

// ─── Initiative integration points ───────────────────────────────────────────

const INITIATIVE_INTEGRATIONS = [
  {
    name: "unTech Onboarding",
    href: "/untech-onboarding",
    desc: "Onboarding path step 2 -- Map & Compass surfaces the next step automatically",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    name: "Let's Make Dinner",
    href: "/initiatives/lets-make-dinner",
    desc: "Community resource map shows active chef nodes and kitchen locations near you",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  {
    name: "Battery Dispatch",
    href: "/spinouts/battery-dispatch-spinout",
    desc: "Maps active battery storage nodes and demand-response pools in your neighborhood",
    color: "from-yellow-500/20 to-green-500/20 border-yellow-500/30",
  },
  {
    name: "Power to the People",
    href: "/initiatives/power-to-the-people",
    desc: "Surfaces civic engagement opportunities and PolEx tracking by district",
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
  },
];

// ─── Live-data hook: resource listings ───────────────────────────────────────

interface McResourceRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  location_city: string | null;
  location_state: string | null;
  verified: boolean;
  marks_bounty: number;
}

function useMcResources(category?: string) {
  return useQuery<McResourceRow[]>({
    queryKey: ["mc-resources", category],
    queryFn: async () => {
      let q = (supabase as any)
        .from("mc_resource_listings")
        .select("id, title, category, description, location_city, location_state, verified, marks_bounty")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(20);
      if (category && category !== "All") {
        q = q.eq("category", category.toLowerCase());
      }
      const { data } = await q;
      return (data as McResourceRow[] | null) ?? [];
    },
    staleTime: 2 * 60_000,
  });
}

interface McOnboardingPath {
  current_step: number;
  completed_steps: number[];
  path_variant: string;
}

function useMcOnboardingPath(userId?: string) {
  return useQuery<McOnboardingPath | null>({
    queryKey: ["mc-onboarding-path", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("mc_onboarding_paths")
        .select("current_step, completed_steps, path_variant")
        .eq("user_id", userId)
        .maybeSingle();
      return data as McOnboardingPath | null;
    },
    staleTime: 5 * 60_000,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapAndCompassPage() {
  usePageSEO({
    title: "Map and Compass | Liana Banyan Spinout",
    description: "Community navigation and local knowledge cooperative. A spinout focused on place-based community intelligence.",
    canonical: "https://lianabanyan.com/spinouts/map-and-compass",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { data: liveResources } = useMcResources(activeCategory);

  const categories = ["All", ...Array.from(new Set(RESOURCE_LISTINGS.map((r) => r.category)))];

  const filtered =
    activeCategory === "All"
      ? RESOURCE_LISTINGS
      : RESOURCE_LISTINGS.filter((r) => r.category === activeCategory);

  const completedSteps = ONBOARDING_PATH.filter((s) => s.status === "done").length;
  const progressPct = Math.round((completedSteps / ONBOARDING_PATH.length) * 100);

  return (
    <PortalPageLayout variant="stage" xrayId="map-and-compass-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/spinouts")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 p-6 space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🧭</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Map & Compass</h1>
                <Badge variant="outline">Navigation & Onboarding</Badge>
                <Badge className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10">
                  Forming
                </Badge>
                <Badge className="text-xs border-green-500/40 text-green-400 bg-green-500/10">
                  Spinout #8
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-xl">
                Navigate the platform and your real-world cooperative community.
                Your onboarding path, the members who can help you, and the
                initiatives active near you -- all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Live Resource Stats */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-400" />
              Community Map -- Live Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{liveResources?.length ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Active Resources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  {(liveResources ?? []).filter((r) => r.verified).length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Verified Listings</div>
              </div>
            </div>
            {liveResources && liveResources.length > 0 && (
              <div className="mt-4 space-y-1">
                {liveResources.slice(0, 3).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium">{r.title}</span>
                    <span className="text-muted-foreground capitalize">{r.category}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Add resources to earn Marks.
            </p>
          </CardContent>
        </Card>

        {/* Onboarding Path Visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Navigation className="h-5 w-5 text-emerald-400" />
              Your Onboarding Path
            </h2>
            <Badge variant="outline" className="text-xs">
              {completedSteps} / {ONBOARDING_PATH.length} complete
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {ONBOARDING_PATH.map((step, i) => (
              <div
                key={step.id}
                className={`flex gap-4 p-4 rounded-xl border transition-all ${
                  step.status === "current"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : step.status === "done"
                    ? "border-border/30 bg-background/40"
                    : "border-border/20 bg-background/20 opacity-60"
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                  {step.status === "done" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : step.status === "current" ? (
                    <div className="h-5 w-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`font-medium text-sm ${
                        step.status === "upcoming" ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {i + 1}. {step.label}
                    </span>
                    {step.status === "current" && (
                      <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        You are here
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  {step.link && step.status !== "upcoming" && (
                    <Link
                      to={step.link.href}
                      className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors mt-1"
                    >
                      {step.link.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Resource Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Map className="h-5 w-5 text-teal-400" />
              Community Resource Map
            </h2>
            <Badge variant="outline" className="text-xs">
              {RESOURCE_LISTINGS.length} listings (demo)
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">
            Members who can help, listed by skill and area. Cooperative wayfinding --
            no corporate directory, no ads.
          </p>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activeCategory === cat
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    : "border-border/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Listings */}
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((listing) => {
              const Icon = listing.icon;
              return (
                <Card key={listing.id} className="border-border/50">
                  <CardContent className="py-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 ${listing.iconColor} mt-0.5 shrink-0`} />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{listing.skill}</span>
                          <Badge variant="outline" className="text-xs">
                            {listing.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {listing.memberHandle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.area}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{listing.rating.toFixed(1)}</span>
                          </div>
                          {listing.initiative && (
                            <span className="text-muted-foreground">
                              via {listing.initiative}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Initiative Integrations */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Compass className="h-5 w-5 text-emerald-400" />
            Initiative Integrations
          </h2>
          <p className="text-sm text-muted-foreground">
            Map & Compass surfaces context from across the platform at the right
            moment in your journey.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {INITIATIVE_INTEGRATIONS.map((integ) => (
              <Link key={integ.name} to={integ.href}>
                <Card
                  className={`border-2 bg-gradient-to-br ${integ.color} hover:shadow-md transition-all cursor-pointer h-full`}
                >
                  <CardContent className="py-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{integ.name}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">{integ.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* For External Cooperatives */}
        <Card className="border-teal-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-teal-400" />
              For External Cooperative Networks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The Map & Compass wayfinding API is available for other cooperative
              networks to license. License includes:
            </p>
            {[
              "Onboarding path visualization component (embeddable)",
              "Community skill directory API",
              "Initiative-to-member matching algorithm",
              "Configurable wayfinding rules for your cooperative model",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs">
                <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                {item}
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              Licensing: Cost+20% on platform tools. Internal member wayfinding
              included in $5/year membership. 83.3% of licensing fees to the Map
              & Compass operations team.
            </p>
          </CardContent>
        </Card>

        {/* Business Plan Stub */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Business Plan Stub</CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Marks = participation, not equity or guaranteed return.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Problem</p>
              <p className="text-muted-foreground">
                Members join cooperatives with good intentions and then get lost.
                There is no wayfinding layer: no way to see where you are, what
                is next, or who around you can help. Good people disengage because
                the path is invisible.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
              <p className="text-muted-foreground">
                Internal member wayfinding: included in $5/year flat membership (no tiers).
                External cooperative licensing: Cost+20% on platform tools. 83.3% of
                licensing fees to the Map & Compass operations team.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>
                  Day 30: Onboarding path visualization live for all new members
                  entering via unTech
                </li>
                <li>
                  Day 60: Community resource map populated with first 100 member
                  skill listings
                </li>
                <li>
                  Day 90: First external cooperative network licensed the
                  wayfinding API
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Marks note */}
        <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-200">
            Marks for Map & Compass contributions (skill listings, onboarding completions,
            resource verifications) represent cooperative participation only --
            <strong> NOT A FINANCIAL RETURN</strong>. Marks are not equity, shares, or
            guaranteed financial return. Marks rates held for Founder review.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Map & Compass -- Spinout #8. Legal entity forming.
            Canon: Wave 22 Phase B / unTech onboarding integration.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Marks represent participation in the Liana Banyan cooperative -- not
            equity, shares, or guaranteed financial return.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
