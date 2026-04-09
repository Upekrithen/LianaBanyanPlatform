import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Utensils, CalendarDays, BookOpen, ShoppingBasket, ChefHat, Home,
  ArrowRight, Plus, DollarSign, TrendingDown, Clock, Send, Snowflake, Leaf,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { LearnMoreBadge } from "@/components/cephas/LearnMoreBadge";
import { useMealPlan, DAYS, DAY_LABELS, getWeekStart, type MealSlot, type DayOfWeek } from "@/hooks/useMealPlan";
import { useRestaurants } from "@/hooks/useRestaurants";

const MEAL_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4 text-emerald-600" />,
  restaurant: <Utensils className="w-4 h-4 text-orange-600" />,
  grocery: <ShoppingBasket className="w-4 h-4 text-blue-600" />,
};

const SOURCE_COLORS: Record<string, string> = {
  home: "bg-emerald-50 border-emerald-200 text-emerald-800",
  restaurant: "bg-orange-50 border-orange-200 text-orange-800",
  grocery: "bg-blue-50 border-blue-200 text-blue-800",
};

function MealSlotCard({ slot }: { slot: MealSlot }) {
  const label = slot.source === "restaurant" ? slot.restaurant_name : slot.source === "home" ? (slot.recipe_name ?? "Home Cook") : "Groceries";
  return (
    <div className={`rounded-lg border p-2 text-xs font-medium flex items-center gap-1.5 ${SOURCE_COLORS[slot.source]}`}>
      {MEAL_ICONS[slot.source]}
      <span className="truncate">{label}</span>
    </div>
  );
}

function EmptySlot({ day, onClick }: { day: DayOfWeek; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border-2 border-dashed border-muted-foreground/20 p-2 text-xs text-muted-foreground/50 hover:border-primary/40 hover:text-primary/60 transition-colors flex items-center justify-center gap-1 min-h-[40px]"
    >
      <Plus className="w-3 h-3" /> Add
    </button>
  );
}

interface FreezerMealRow {
  id: string;
  node_id: string;
  meal_name: string;
  description: string | null;
  portions_available: number;
  price_per_portion: number;
  dietary_tags: string[];
  frozen_date: string;
  expiry_date: string;
  freezer_nodes: { id: string; name: string; address: string | null; active: boolean };
}

function freezerFreshnessColor(frozenDate: string): { color: string; label: string } {
  const days = Math.floor((Date.now() - new Date(frozenDate).getTime()) / 86400000);
  if (days < 30) return { color: "text-green-600", label: "Fresh" };
  if (days < 60) return { color: "text-yellow-600", label: "Good" };
  return { color: "text-red-600", label: "Use Soon" };
}

const DIETARY_BADGE_COLORS: Record<string, string> = {
  vegetarian: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  vegan: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  "gluten-free": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  halal: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  kosher: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "dairy-free": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "nut-free": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function FamilyTableHub() {
  const navigate = useNavigate();
  const weekStart = getWeekStart();
  const { data: mealPlan } = useMealPlan(weekStart);
  const { data: restaurants } = useRestaurants();
  const [activeTab, setActiveTab] = useState("week");

  const { data: freezerMeals } = useQuery({
    queryKey: ["freezer-meals-family-table"],
    queryFn: async () => {
      const { data: inv, error: invErr } = await supabase
        .from("freezer_inventory" as never)
        .select("*, freezer_nodes!inner(id, name, address, active)")
        .eq("status", "available")
        .gt("portions_available", 0)
        .order("frozen_date", { ascending: false })
        .limit(8);
      if (invErr) return [];
      return (inv ?? []) as FreezerMealRow[];
    },
  });

  const mealsByDay = useMemo(() => {
    const map: Record<DayOfWeek, MealSlot[]> = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
    if (mealPlan?.meals) {
      for (const m of mealPlan.meals) {
        map[m.day]?.push(m);
      }
    }
    return map;
  }, [mealPlan]);

  const totalCost = mealPlan?.total_estimated_cost ?? 0;
  const totalSavings = mealPlan?.total_savings ?? 0;
  const hasMeals = mealPlan?.meals && mealPlan.meals.length > 0;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="family-table-hub">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <Badge variant="outline" className="mb-3 text-orange-600 border-orange-600 bg-orange-50">Initiative #5</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <ChefHat className="h-10 w-10 text-orange-600" />
            Family Table
            <LearnMoreBadge featurePath="/family-table" variant="icon" />
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Plan your week. Browse local menus. Schedule pre-orders. Save money.
          </p>
        </div>
        <Button onClick={() => navigate("/family-table/meal-plan")} className="bg-orange-600 hover:bg-orange-700">
          <CalendarDays className="w-4 h-4 mr-2" /> Open Meal Planner
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1 bg-muted/50">
          <TabsTrigger value="week" className="py-3 text-base data-[state=active]:bg-background">
            <CalendarDays className="w-4 h-4 mr-2" /> This Week
          </TabsTrigger>
          <TabsTrigger value="cookbook" className="py-3 text-base data-[state=active]:bg-background">
            <BookOpen className="w-4 h-4 mr-2" /> Cookbook
          </TabsTrigger>
          <TabsTrigger value="lists" className="py-3 text-base data-[state=active]:bg-background">
            <ShoppingBasket className="w-4 h-4 mr-2" /> My Lists
          </TabsTrigger>
        </TabsList>

        {/* THIS WEEK */}
        <TabsContent value="week" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Weekly Meal Plan</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {hasMeals ? (
                <>
                  <div className="grid grid-cols-7 gap-3 mb-6">
                    {DAYS.map((day) => (
                      <div key={day} className="space-y-2">
                        <p className="text-xs font-semibold text-center uppercase text-muted-foreground">{day}</p>
                        {mealsByDay[day].length > 0 ? (
                          mealsByDay[day].map((slot, i) => <MealSlotCard key={i} slot={slot} />)
                        ) : (
                          <EmptySlot day={day} onClick={() => navigate("/family-table/meal-plan")} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Weekly spend: <strong>${totalCost.toFixed(2)}</strong></span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-sm">Saved <strong>${totalSavings.toFixed(2)}</strong> vs retail</span>
                      </div>
                    )}
                    {!mealPlan?.submitted && (
                      <Button size="sm" className="ml-auto bg-orange-600 hover:bg-orange-700">
                        <Send className="w-3 h-3 mr-1.5" /> Submit Orders
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium mb-1">No meals planned this week</p>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    Build your week in the Meal Planner or browse the Cookbook.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="outline" onClick={() => navigate("/family-table/meal-plan")}>
                      <Plus className="w-4 h-4 mr-1" /> Build Plan
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab("cookbook")}>
                      <BookOpen className="w-4 h-4 mr-1" /> Browse Cookbook
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Utensils className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{mealPlan?.meals?.filter((m) => m.source === "restaurant").length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Restaurant meals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Home className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-2xl font-bold">{mealPlan?.meals?.filter((m) => m.source === "home").length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Home-cooked meals</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{mealPlan?.meals?.filter((m) => m.source === "restaurant" && m.scheduled_pickup_time).length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Pre-orders scheduled</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Available from Freezer Nodes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-cyan-500" />
                Available from Freezer Nodes
              </CardTitle>
              <CardDescription>
                Batch-cooked frozen meals from neighborhood operators — Cost + 20%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {freezerMeals && freezerMeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {freezerMeals.map((meal) => {
                    const freshness = freezerFreshnessColor(meal.frozen_date);
                    return (
                      <Card key={meal.id} className="border hover:shadow-sm transition-shadow">
                        <CardContent className="pt-4 space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-medium text-sm line-clamp-1">{meal.meal_name}</h4>
                            <span className="font-bold text-sm whitespace-nowrap">${meal.price_per_portion.toFixed(2)}</span>
                          </div>
                          {meal.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{meal.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {(meal.dietary_tags ?? []).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`text-[10px] ${DIETARY_BADGE_COLORS[tag] ?? ""}`}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Snowflake className="w-3 h-3" />
                              {meal.freezer_nodes.name}
                            </span>
                            <span className={freshness.color}>{freshness.label}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{meal.portions_available} portions left</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-7 text-xs"
                            onClick={() => navigate(`/freezer-nodes`)}
                          >
                            Order
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Snowflake className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground font-medium mb-1">No Freezer Nodes in your area yet</p>
                  <p className="text-sm text-muted-foreground/70 mb-4">
                    Freezer Node operators batch-cook meals and sell them to neighbors at Cost + 20%.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/freezer-nodes/setup")}>
                    <ChefHat className="w-4 h-4 mr-1" /> Become a Freezer Node operator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COOKBOOK */}
        <TabsContent value="cookbook" className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-2xl font-bold">Local Restaurants</h2>
              <p className="text-sm text-muted-foreground">Browse menus and add to your meal plan</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/cookbook")}>
              View Full Cookbook <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants.slice(0, 4).map((r) => (
                <Card key={r.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/cookbook/${r.id}`)}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{r.name}</CardTitle>
                      {r.partnership_tier !== "none" && r.partnership_tier !== "cookbook" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                          {r.discount_pct}% off for LB members
                        </Badge>
                      ) : r.partnership_tier === "cookbook" ? (
                        <Badge variant="secondary">Listed — Full Price</Badge>
                      ) : null}
                    </div>
                    <CardDescription>
                      {r.address}{r.city ? ` · ${r.city}` : ""} · {r.cuisine.join(", ")} · {r.price_range}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/cookbook/${r.id}`); }}>
                      View Menu
                    </Button>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate("/family-table/meal-plan"); }}>
                      Add to Meal Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-1">No restaurants listed yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  Nominate your favorite local spot through a Campaign!
                </p>
                <Button variant="outline" onClick={() => navigate("/campaigns/nominate")}>
                  Nominate a Restaurant
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* MY LISTS */}
        <TabsContent value="lists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBasket className="w-5 h-5 text-blue-500" />
                Shopping Lists
              </CardTitle>
              <CardDescription>Auto-generated from your meal plan + manual additions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <ShoppingBasket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium mb-1">No lists yet</p>
                <p className="text-sm text-muted-foreground/70 mb-4">
                  Build a meal plan and your grocery list will auto-generate from home-cooked meal recipes.
                </p>
                <Button variant="outline" onClick={() => navigate("/family-table/meal-plan")}>
                  <Plus className="w-4 h-4 mr-1" /> Start a Meal Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
