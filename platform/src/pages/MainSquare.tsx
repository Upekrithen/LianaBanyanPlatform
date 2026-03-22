import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrencyAmount } from "@/components/CreditSymbol";
import {
  ArrowLeft,
  Search,
  Store,
  Clock,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";

// ============================================================================
// TYPES
// ============================================================================

interface FeaturedProduct {
  name: string;
  price: number;
}

interface Storefront {
  id: string;
  name: string;
  ownerName: string;
  category: StoreCategory;
  xp: number;
  memberSince: string;
  isOpen: boolean;
  featuredProducts: FeaturedProduct[];
  description: string;
}

type StoreCategory =
  | "Food & Drink"
  | "Crafts & Making"
  | "Services"
  | "Digital"
  | "Home & Garden"
  | "Health"
  | "Education";

type SortOption = "featured" | "newest" | "highest-xp" | "alphabetical";

// ============================================================================
// XP BOX NOTATION SYSTEM
// ============================================================================

interface XpTier {
  name: string;
  min: number;
  max: number;
  colorClass: string;
}

const XP_TIERS: XpTier[] = [
  { name: "Bronze", min: 0, max: 9_999, colorClass: "text-amber-700" },
  { name: "Silver", min: 10_000, max: 99_999, colorClass: "text-muted-foreground" },
  { name: "Gold", min: 100_000, max: 999_999, colorClass: "text-yellow-400" },
  { name: "Platinum", min: 1_000_000, max: 9_999_999, colorClass: "text-blue-300" },
  { name: "Diamond", min: 10_000_000, max: 99_999_999, colorClass: "text-cyan-300" },
  { name: "Obsidian", min: 100_000_000, max: Infinity, colorClass: "text-slate-800" },
];

function getXpTier(xp: number): XpTier {
  return XP_TIERS.find((t) => xp >= t.min && xp <= t.max) ?? XP_TIERS[0];
}

function XpBoxNotation({ xp }: { xp: number }) {
  const tier = getXpTier(xp);
  const fullBoxes = Math.floor(xp / 10_000);
  const remainder = xp % 10_000;

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-sm ${tier.colorClass}`}>
      {fullBoxes > 0 && (
        <span>
          {"■".repeat(Math.min(fullBoxes, 10))}
          {fullBoxes > 10 && <span className="text-xs ml-0.5">x{fullBoxes}</span>}
        </span>
      )}
      {remainder > 0 && (
        <span className="opacity-80">
          [{"■"}]-[{remainder.toLocaleString()}]
        </span>
      )}
      {fullBoxes === 0 && remainder === 0 && <span>[0]</span>}
      <span className="text-xs opacity-60 ml-1">{tier.name}</span>
    </span>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const CATEGORIES: StoreCategory[] = [
  "Food & Drink",
  "Crafts & Making",
  "Services",
  "Digital",
  "Home & Garden",
  "Health",
  "Education",
];

const SAMPLE_STORES: Storefront[] = [
  {
    id: "bbc-001",
    name: "Boise Business Cards",
    ownerName: "Captain Mike",
    category: "Crafts & Making",
    xp: 14200,
    memberSince: "2026-01-15",
    isOpen: true,
    description: "Custom letterpress business cards and stationery for the discerning professional.",
    featuredProducts: [
      { name: "Letterpress Cards (100)", price: 45 },
      { name: "Foil Stamped Set", price: 72 },
      { name: "Logo Design Package", price: 120 },
    ],
  },
  {
    id: "ss-002",
    name: "Sarah's Sourdough",
    ownerName: "Sarah Chen",
    category: "Food & Drink",
    xp: 8750,
    memberSince: "2026-02-01",
    isOpen: true,
    description: "Artisan sourdough bread baked fresh daily with heritage grain flour.",
    featuredProducts: [
      { name: "Classic Sourdough Loaf", price: 8 },
      { name: "Olive Rosemary Boule", price: 12 },
      { name: "Starter Kit", price: 25 },
    ],
  },
  {
    id: "cf-003",
    name: "CodeForge Tools",
    ownerName: "DevGuild",
    category: "Digital",
    xp: 45000,
    memberSince: "2025-11-20",
    isOpen: true,
    description: "Developer productivity tools and custom integrations for cooperative teams.",
    featuredProducts: [
      { name: "CI Pipeline Template", price: 30 },
      { name: "API Monitoring Suite", price: 85 },
      { name: "Code Review Bot", price: 50 },
    ],
  },
  {
    id: "gtg-004",
    name: "Green Thumb Gardens",
    ownerName: "Maria Lopez",
    category: "Home & Garden",
    xp: 3200,
    memberSince: "2026-03-01",
    isOpen: false,
    description: "Heirloom seeds, starter kits, and garden planning for every climate zone.",
    featuredProducts: [
      { name: "Heirloom Tomato Seeds", price: 6 },
      { name: "Raised Bed Kit", price: 95 },
      { name: "Garden Plan Consult", price: 35 },
    ],
  },
  {
    id: "hh-005",
    name: "Healthy Habits MSA",
    ownerName: "Dr. Kim",
    category: "Health",
    xp: 22100,
    memberSince: "2025-12-10",
    isOpen: true,
    description: "Preventive wellness programs and Medical Savings Account consultation.",
    featuredProducts: [
      { name: "Wellness Assessment", price: 40 },
      { name: "Nutrition Plan (4 wk)", price: 60 },
      { name: "MSA Setup Guide", price: 15 },
    ],
  },
  {
    id: "dt-006",
    name: "Didasko Tutoring",
    ownerName: "Academy Guild",
    category: "Education",
    xp: 67800,
    memberSince: "2025-10-05",
    isOpen: true,
    description: "Peer-to-peer tutoring and skill mentoring across all Academy disciplines.",
    featuredProducts: [
      { name: "1-on-1 Session (1 hr)", price: 20 },
      { name: "Group Workshop", price: 35 },
      { name: "Study Plan Bundle", price: 50 },
    ],
  },
  {
    id: "hw-007",
    name: "Harbor Woodworks",
    ownerName: "Jake Morrison",
    category: "Crafts & Making",
    xp: 31500,
    memberSince: "2025-11-12",
    isOpen: true,
    description: "Hand-crafted hardwood furniture and custom cabinetry from reclaimed timber.",
    featuredProducts: [
      { name: "Cutting Board (Walnut)", price: 55 },
      { name: "Floating Shelf Set", price: 130 },
      { name: "Custom Quote Request", price: 0 },
    ],
  },
  {
    id: "mvm-008",
    name: "Mountain View Meals",
    ownerName: "Fresh Crew",
    category: "Food & Drink",
    xp: 5600,
    memberSince: "2026-02-20",
    isOpen: false,
    description: "Farm-to-table meal kits featuring seasonal ingredients from local growers.",
    featuredProducts: [
      { name: "Weekly Meal Kit (2)", price: 48 },
      { name: "Family Box (4)", price: 85 },
      { name: "Snack Sampler", price: 22 },
    ],
  },
];

// ============================================================================
// CATEGORY COLORS
// ============================================================================

const CATEGORY_COLORS: Record<StoreCategory, string> = {
  "Food & Drink": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Crafts & Making": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Services: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Digital: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "Home & Garden": "bg-green-500/20 text-green-300 border-green-500/30",
  Health: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Education: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

// ============================================================================
// SORT FUNCTIONS
// ============================================================================

function sortStores(stores: Storefront[], sort: SortOption): Storefront[] {
  const sorted = [...stores];
  switch (sort) {
    case "featured":
      // Open stores first, then by XP descending
      return sorted.sort((a, b) => {
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        return b.xp - a.xp;
      });
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.memberSince).getTime() - new Date(a.memberSince).getTime()
      );
    case "highest-xp":
      return sorted.sort((a, b) => b.xp - a.xp);
    case "alphabetical":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

// ============================================================================
// STOREFRONT CARD
// ============================================================================

function StorefrontCard({ store }: { store: Storefront }) {
  const memberDate = new Date(store.memberSince).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="bg-slate-900/60 border-border/50 hover:border-slate-600/70 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-800 border border-border flex items-center justify-center">
              <Store className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate">{store.name}</h3>
              <p className="text-sm text-muted-foreground truncate">by {store.ownerName}</p>
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
              store.isOpen
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-700/50 text-muted-foreground"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                store.isOpen ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            {store.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-3 flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs ${CATEGORY_COLORS[store.category]}`}
          >
            {store.category}
          </Badge>
          <XpBoxNotation xp={store.xp} />
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Featured
          </p>
          {store.featuredProducts.map((product) => (
            <div
              key={product.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-300 truncate mr-2">{product.name}</span>
              {product.price > 0 ? (
                <CurrencyAmount
                  amount={product.price}
                  currency="credit"
                  className="text-amber-400 shrink-0"
                />
              ) : (
                <span className="text-muted-foreground text-xs italic shrink-0">Free</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Member since {memberDate}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
          Visit Store
        </Button>
      </CardFooter>
    </Card>
  );
}

// ============================================================================
// MAIN SQUARE PAGE
// ============================================================================

const DB_CATEGORY_MAP: Record<string, StoreCategory> = {
  food_drink: "Food & Drink",
  crafts_making: "Crafts & Making",
  services: "Services",
  digital: "Digital",
  home_garden: "Home & Garden",
  health: "Health",
  education: "Education",
};

export default function MainSquare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<StoreCategory | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [stores, setStores] = useState<Storefront[]>(SAMPLE_STORES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStores() {
      try {
        const { data: dbStores } = await supabase
          .from("storefronts")
          .select("*, storefront_products(name, price, currency_type, is_featured)")
          .order("xp_score", { ascending: false });

        if (dbStores && dbStores.length > 0) {
          setStores(
            dbStores.map((s: any) => ({
              id: s.id,
              name: s.name,
              ownerName: s.owner_name,
              category: DB_CATEGORY_MAP[s.category] ?? ("Services" as StoreCategory),
              xp: s.xp_score ?? 0,
              memberSince: s.member_since ?? s.created_at?.slice(0, 10) ?? "2026-01-01",
              isOpen: s.is_open ?? true,
              description: s.description ?? "",
              featuredProducts: (s.storefront_products ?? [])
                .filter((p: any) => p.is_featured)
                .map((p: any) => ({ name: p.name, price: Number(p.price) })),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load storefronts from DB, using sample data", err);
      } finally {
        setLoading(false);
      }
    }
    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    let result = stores;

    if (activeCategory !== "All") {
      result = result.filter((s) => s.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.ownerName.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    return sortStores(result, sortBy);
  }, [searchQuery, activeCategory, sortBy, stores]);

  const totalStores = stores.length;
  const totalProducts = stores.reduce(
    (sum, s) => sum + s.featuredProducts.length,
    0
  );
  const activeCategories = new Set(stores.map((s) => s.category)).size;

  const isEmpty = !loading && filteredStores.length === 0 && searchQuery === "" && activeCategory === "All";

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="main-square">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-amber-600 rounded-full">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Main Square</h1>
            <p className="text-lg text-muted-foreground">
              The cooperative marketplace — every maker, every shop, one square
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-border/50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-amber-400">{totalStores}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Stores</p>
          </div>
          <div className="bg-slate-900/60 border border-border/50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalProducts}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Products</p>
          </div>
          <div className="bg-slate-900/60 border border-border/50 rounded-lg px-4 py-3 text-center">
            <p className="text-2xl font-bold text-violet-400">{activeCategories}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Categories Active</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stores by name, owner, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900/60 border-border text-white placeholder:text-muted-foreground focus:border-amber-600"
          />
        </div>

        {/* Filter & Sort Row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category Filters */}
          <div className="flex-1 flex flex-wrap gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0 hidden sm:block" />
            <Button
              size="sm"
              variant={activeCategory === "All" ? "default" : "outline"}
              onClick={() => setActiveCategory("All")}
              className={
                activeCategory === "All"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "border-border text-muted-foreground hover:text-white hover:bg-slate-800"
              }
            >
              All
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                className={
                  activeCategory === cat
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "border-border text-muted-foreground hover:text-white hover:bg-slate-800"
                }
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-900/60 border border-border rounded-md text-sm text-slate-300 px-3 py-1.5 focus:outline-none focus:border-amber-600"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="highest-xp">Highest XP</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Store Grid or Empty State */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading storefronts...</p>
          </div>
        ) : isEmpty ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-300 mb-2">
              The Square is quiet... for now.
            </h2>
            <p className="text-muted-foreground mb-6">Be the first to open shop.</p>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <Store className="w-4 h-4 mr-2" />
              Open Your Store
            </Button>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No stores match your search. Try broadening your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <StorefrontCard key={store.id} store={store} />
            ))}
          </div>
        )}
    </PortalPageLayout>
  );
}
