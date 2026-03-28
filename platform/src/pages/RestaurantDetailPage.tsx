import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Star, Utensils, Phone, Globe,
  Plus, ShoppingCart, TrendingDown, Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useRestaurant, useMenuItems, tierLabel, tierDiscount, type MenuItem } from "@/hooks/useRestaurants";

const TIER_COLORS: Record<string, string> = {
  c20: "bg-emerald-600",
  c40: "bg-teal-600",
  c60: "bg-blue-600",
  c90: "bg-indigo-600",
  cookbook: "bg-slate-500",
};

function TierPricingBlock({ item, restaurantTier }: { item: MenuItem; restaurantTier: string }) {
  const hasTier = restaurantTier !== "none" && restaurantTier !== "cookbook";
  const saving = hasTier && item.price_lb ? item.price_retail - item.price_lb : 0;

  const hypotheticals = useMemo(() => {
    if (restaurantTier === "c20") return [];
    const tiers = [
      { tier: "c40", label: "C+40", pct: 40 },
      { tier: "c20", label: "C+20 (Best)", pct: 50 },
    ].filter((t) => {
      const order = { c20: 0, c40: 1, c60: 2, c90: 3, cookbook: 4, none: 5 };
      return (order[t.tier as keyof typeof order] ?? 5) < (order[restaurantTier as keyof typeof order] ?? 5);
    });
    return tiers.map((t) => ({
      label: t.label,
      price: Math.round(item.price_retail * (1 - t.pct / 100) * 100) / 100,
      saving: Math.round(item.price_retail * (t.pct / 100) * 100) / 100,
    }));
  }, [item, restaurantTier]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground">Retail:</span>
        <span className={`font-medium ${hasTier ? "line-through text-muted-foreground" : ""}`}>${item.price_retail.toFixed(2)}</span>
      </div>
      {hasTier && item.price_lb != null && (
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-emerald-700 font-medium">LB Card:</span>
          <span className="font-bold text-emerald-700">${item.price_lb.toFixed(2)}</span>
          <Badge className="bg-emerald-100 text-emerald-800 text-xs hover:bg-emerald-100">
            save ${saving.toFixed(2)}
          </Badge>
        </div>
      )}
      {hypotheticals.length > 0 && (
        <div className="mt-1 space-y-0.5">
          {hypotheticals.map((h) => (
            <div key={h.label} className="flex items-baseline gap-2 text-xs text-muted-foreground/70">
              <Info className="w-3 h-3 shrink-0" />
              <span>If {h.label}: ${h.price.toFixed(2)} (save ${h.saving.toFixed(2)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantDetailPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { data: restaurant, isLoading: loadingR } = useRestaurant(restaurantId);
  const { data: menuItems, isLoading: loadingM } = useMenuItems(restaurantId);
  const [cart, setCart] = useState<Record<string, number>>({});

  const categories = useMemo(() => {
    if (!menuItems) return [];
    const catMap = new Map<string, MenuItem[]>();
    for (const item of menuItems) {
      const cat = item.category ?? "Other";
      if (!catMap.has(cat)) catMap.set(cat, []);
      catMap.get(cat)!.push(item);
    }
    return Array.from(catMap.entries()).map(([name, items]) => ({ name, items }));
  }, [menuItems]);

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0);

  if (loadingR) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="restaurant-detail">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </PortalPageLayout>
    );
  }

  if (!restaurant) {
    return (
      <PortalPageLayout maxWidth="xl" xrayId="restaurant-detail">
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Restaurant not found.</p>
          <Button variant="outline" onClick={() => navigate("/cookbook")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cookbook
          </Button>
        </div>
      </PortalPageLayout>
    );
  }

  const hasTier = restaurant.partnership_tier !== "none" && restaurant.partnership_tier !== "cookbook";
  const tierColor = TIER_COLORS[restaurant.partnership_tier] ?? "bg-slate-500";

  return (
    <PortalPageLayout maxWidth="xl" xrayId="restaurant-detail">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/cookbook")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cookbook
      </Button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Utensils className="h-8 w-8 text-orange-600" />
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {restaurant.address}{restaurant.city ? `, ${restaurant.city}` : ""}{restaurant.state ? `, ${restaurant.state}` : ""}</span>
              {restaurant.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {restaurant.phone}</span>}
              {restaurant.website && (
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Website
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {restaurant.cuisine.map((c) => (
                <Badge key={c} variant="outline">{c}</Badge>
              ))}
              {restaurant.price_range && <Badge variant="secondary">{restaurant.price_range}</Badge>}
            </div>
          </div>

          {hasTier ? (
            <Card className="shrink-0 border-2 border-emerald-200">
              <CardContent className="p-4 text-center">
                <Badge className={`${tierColor} text-white mb-2`}>
                  <Star className="w-3 h-3 mr-1" /> {tierLabel(restaurant.partnership_tier)}
                </Badge>
                <p className="text-2xl font-bold text-emerald-700">{restaurant.discount_pct}% off</p>
                <p className="text-xs text-muted-foreground">for LB members</p>
              </CardContent>
            </Card>
          ) : restaurant.partnership_tier === "cookbook" ? (
            <Badge variant="secondary" className="text-sm py-1.5 px-3">Listed — Full Price (no discount yet)</Badge>
          ) : null}
        </div>

        {restaurant.description && (
          <p className="mt-4 text-muted-foreground">{restaurant.description}</p>
        )}
      </div>

      <Separator className="mb-8" />

      {/* Cart floating bar */}
      {cartCount > 0 && (
        <div className="sticky top-16 z-30 mb-6">
          <Card className="bg-orange-600 text-white border-orange-700">
            <CardContent className="py-3 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <ShoppingCart className="w-5 h-5" /> {cartCount} item{cartCount > 1 ? "s" : ""} selected
              </span>
              <Button variant="secondary" size="sm" onClick={() => navigate("/family-table/meal-plan")}>
                Add to Meal Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Menu */}
      {loadingM ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded" />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-8">
          {categories.map(({ name, items }) => (
            <div key={name}>
              <h2 className="text-xl font-bold mb-4 capitalize">{name.replace(/_/g, " ")}</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                            )}
                          </div>
                        </div>
                        <TierPricingBlock item={item} restaurantTier={restaurant.partnership_tier} />
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                          {item.available_days && item.available_days.length > 0 && item.available_days.length < 7 && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.available_days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ")}
                            </span>
                          )}
                          {item.available_hours && (
                            <span>{item.available_hours}</span>
                          )}
                          {item.dietary && item.dietary.length > 0 && (
                            <span className="flex gap-1">
                              {item.dietary.map((d) => (
                                <Badge key={d} variant="outline" className="text-[10px] px-1.5 py-0">{d}</Badge>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(cart[item.id] ?? 0) > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCart((c) => {
                                const n = { ...c };
                                if (n[item.id] <= 1) delete n[item.id];
                                else n[item.id]--;
                                return n;
                              })}
                            >
                              -
                            </Button>
                            <span className="w-6 text-center font-medium">{cart[item.id]}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setCart((c) => ({ ...c, [item.id]: (c[item.id] ?? 0) + 1 }))}
                            >
                              +
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCart((c) => ({ ...c, [item.id]: 1 }))}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Utensils className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No menu items available yet.</p>
          </CardContent>
        </Card>
      )}
    </PortalPageLayout>
  );
}
