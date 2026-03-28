import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, BookOpen, Star, Filter, MapPin, ChefHat, ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useRestaurants, tierLabel, type RestaurantListing } from "@/hooks/useRestaurants";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "partners", label: "Partners" },
  { value: "c20", label: "Best Deals (C+20)" },
  { value: "c40", label: "Tier 3 (C+40)" },
  { value: "c60", label: "Tier 2 (C+60)" },
  { value: "c90", label: "Tier 1 (C+90)" },
  { value: "cookbook", label: "Cookbook Only" },
];

const TIER_BADGE_STYLES: Record<string, string> = {
  c20: "bg-emerald-100 text-emerald-800",
  c40: "bg-teal-100 text-teal-800",
  c60: "bg-blue-100 text-blue-800",
  c90: "bg-indigo-100 text-indigo-800",
  cookbook: "bg-slate-100 text-slate-600",
  none: "bg-gray-100 text-gray-500",
};

function RestaurantCard({ restaurant }: { restaurant: RestaurantListing }) {
  const navigate = useNavigate();
  const hasTier = restaurant.partnership_tier !== "none" && restaurant.partnership_tier !== "cookbook";
  const badgeStyle = TIER_BADGE_STYLES[restaurant.partnership_tier] ?? TIER_BADGE_STYLES.none;

  return (
    <Card className="hover:shadow-lg transition-all group cursor-pointer" onClick={() => navigate(`/cookbook/${restaurant.id}`)}>
      {restaurant.image_url && (
        <div className="h-40 bg-muted overflow-hidden rounded-t-lg">
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      )}
      <CardHeader className={restaurant.image_url ? "pt-3 pb-2" : "pb-2"}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{restaurant.name}</CardTitle>
            <CardDescription className="mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {restaurant.address ?? restaurant.city}{restaurant.state ? `, ${restaurant.state}` : ""}
              </span>
            </CardDescription>
          </div>
          <Badge className={`${badgeStyle} hover:${badgeStyle} shrink-0`}>
            {hasTier ? `${restaurant.discount_pct}% off` : restaurant.partnership_tier === "cookbook" ? "Full Price" : "Unlisted"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {restaurant.cuisine.map((c) => (
            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
          ))}
        </div>
        {restaurant.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{restaurant.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          {restaurant.price_range && <span>{restaurant.price_range}</span>}
          {hasTier && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <Star className="w-3 h-3" /> {tierLabel(restaurant.partnership_tier)} Partner
            </span>
          )}
          {restaurant.scheduling_available && (
            <span className="text-blue-600">Pre-orders available</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          View Menu <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate("/family-table/meal-plan"); }}>
          Add to Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CookbookPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const { data: restaurants, isLoading } = useRestaurants({ tier: tierFilter });

  const filtered = (restaurants ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.cuisine.some((c) => c.toLowerCase().includes(q)) ||
      r.description?.toLowerCase().includes(q) ||
      r.city?.toLowerCase().includes(q)
    );
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId="cookbook-page">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-orange-600" />
            Cookbook
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse local restaurants, compare prices, and add dishes to your weekly meal plan.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/family-table")}>
          <ChefHat className="w-4 h-4 mr-2" /> Back to Family Table
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search restaurants, dishes, or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={tierFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTierFilter(opt.value)}
              className="shrink-0"
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-2/3" /><div className="h-3 bg-muted rounded w-1/2 mt-2" /></CardHeader>
              <CardContent><div className="h-4 bg-muted rounded w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {search ? "No restaurants match your search" : "No restaurants listed yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {search
                ? "Try a different search term or filter."
                : "Be the first to nominate your favorite local restaurant! Campaigns aggregate demand and bring businesses onto the platform."}
            </p>
            {!search && (
              <Button onClick={() => navigate("/campaigns/nominate")} className="bg-orange-600 hover:bg-orange-700">
                Nominate a Restaurant
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="mt-8 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="py-6">
          <h3 className="font-bold text-lg mb-4 text-orange-900">How the Cookbook Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="font-semibold text-orange-800 mb-1">1. Browse & Add</p>
              <p className="text-sm text-orange-700/80">
                Find dishes you love. Add them to specific days in your weekly meal plan. Mix restaurant meals with home cooking.
              </p>
            </div>
            <div>
              <p className="font-semibold text-orange-800 mb-1">2. Schedule & Save</p>
              <p className="text-sm text-orange-700/80">
                Partner restaurants offer LB member discounts. Schedule ahead for the best deals — advance ordering means guaranteed business for them.
              </p>
            </div>
            <div>
              <p className="font-semibold text-orange-800 mb-1">3. Submit & Pickup</p>
              <p className="text-sm text-orange-700/80">
                Submit your weekly plan to generate pre-orders. Restaurants prep with confidence. You pick up on schedule. Everyone wins.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
