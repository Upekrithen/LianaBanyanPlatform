import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Home, Utensils, ShoppingBasket, Plus, Trash2,
  ChefHat, Save, Send, ArrowLeft, DollarSign, TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useToast } from "@/hooks/use-toast";
import {
  useMealPlan, useSaveMealPlan, useSubmitMealPlan,
  DAYS, DAY_LABELS, getWeekStart,
  type MealSlot, type DayOfWeek, type MealType, type MealSource,
} from "@/hooks/useMealPlan";

const SOURCE_ICONS: Record<MealSource, React.ReactNode> = {
  home: <Home className="w-4 h-4 text-emerald-600" />,
  restaurant: <Utensils className="w-4 h-4 text-orange-600" />,
  grocery: <ShoppingBasket className="w-4 h-4 text-blue-600" />,
};

const SOURCE_STYLES: Record<MealSource, string> = {
  home: "border-emerald-200 bg-emerald-50/50",
  restaurant: "border-orange-200 bg-orange-50/50",
  grocery: "border-blue-200 bg-blue-50/50",
};

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export default function MealPlanBuilder() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const weekStart = getWeekStart();
  const { data: existingPlan } = useMealPlan(weekStart);
  const savePlan = useSaveMealPlan();
  const submitPlan = useSubmitMealPlan();

  const [meals, setMeals] = useState<MealSlot[]>(existingPlan?.meals ?? []);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<{ day: DayOfWeek; mealType: MealType } | null>(null);
  const [formSource, setFormSource] = useState<MealSource>("home");
  const [formLabel, setFormLabel] = useState("");
  const [formCost, setFormCost] = useState("");
  const [formServings, setFormServings] = useState("1");

  // Sync existing plan when loaded
  React.useEffect(() => {
    if (existingPlan?.meals && existingPlan.meals.length > 0 && meals.length === 0) {
      setMeals(existingPlan.meals);
    }
  }, [existingPlan]);

  const mealGrid = useMemo(() => {
    const grid: Record<string, MealSlot | null> = {};
    for (const day of DAYS) {
      for (const mt of MEAL_TYPES) {
        grid[`${day}-${mt.value}`] = null;
      }
    }
    for (const m of meals) {
      grid[`${m.day}-${m.meal_type}`] = m;
    }
    return grid;
  }, [meals]);

  const totalCost = useMemo(() => meals.reduce((s, m) => s + m.estimated_cost, 0), [meals]);

  const openAdd = useCallback((day: DayOfWeek, mealType: MealType) => {
    setAddTarget({ day, mealType });
    setFormSource("home");
    setFormLabel("");
    setFormCost("");
    setFormServings("1");
    setAddDialogOpen(true);
  }, []);

  const confirmAdd = useCallback(() => {
    if (!addTarget) return;
    const slot: MealSlot = {
      day: addTarget.day,
      meal_type: addTarget.mealType,
      source: formSource,
      servings: parseInt(formServings) || 1,
      estimated_cost: parseFloat(formCost) || 0,
      ...(formSource === "home" ? { recipe_name: formLabel || "Home Cook" } : {}),
      ...(formSource === "restaurant" ? { restaurant_name: formLabel || "Restaurant" } : {}),
    };
    setMeals((prev) => [...prev.filter((m) => !(m.day === addTarget.day && m.meal_type === addTarget.mealType)), slot]);
    setAddDialogOpen(false);
  }, [addTarget, formSource, formLabel, formCost, formServings]);

  const removeSlot = useCallback((day: DayOfWeek, mealType: MealType) => {
    setMeals((prev) => prev.filter((m) => !(m.day === day && m.meal_type === mealType)));
  }, []);

  const handleSave = async () => {
    try {
      await savePlan.mutateAsync({ week_start: weekStart, meals });
      toast({ title: "Meal plan saved!", description: `${meals.length} meals planned for this week.` });
    } catch {
      toast({ title: "Error saving plan", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!existingPlan?.id) {
      await savePlan.mutateAsync({ week_start: weekStart, meals });
    }
    try {
      if (existingPlan?.id) {
        await submitPlan.mutateAsync(existingPlan.id);
      }
      toast({ title: "Orders submitted!", description: "Restaurant pre-orders have been generated from your meal plan." });
    } catch {
      toast({ title: "Error submitting", variant: "destructive" });
    }
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="meal-plan-builder">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate("/family-table")}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Family Table
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-orange-600" />
            Meal Plan Builder
          </h1>
          <p className="mt-1 text-muted-foreground">
            Week of {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/cookbook")}>
            <ChefHat className="w-4 h-4 mr-1" /> Browse Cookbook
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={savePlan.isPending}>
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSubmit} disabled={meals.length === 0 || submitPlan.isPending}>
            <Send className="w-4 h-4 mr-1" /> Submit Orders
          </Button>
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div />
            {DAYS.map((day) => (
              <div key={day} className="text-center">
                <p className="font-semibold text-sm">{DAY_LABELS[day]}</p>
              </div>
            ))}
          </div>

          {/* Meal type rows */}
          {MEAL_TYPES.map(({ value: mealType, label }) => (
            <div key={mealType} className="grid grid-cols-8 gap-2 mb-2">
              <div className="flex items-center justify-end pr-2">
                <Badge variant="outline" className="text-xs">{label}</Badge>
              </div>
              {DAYS.map((day) => {
                const key = `${day}-${mealType}`;
                const slot = mealGrid[key];
                return (
                  <div key={key} className="min-h-[80px]">
                    {slot ? (
                      <Card className={`h-full ${SOURCE_STYLES[slot.source]} group relative`}>
                        <CardContent className="p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            {SOURCE_ICONS[slot.source]}
                            <span className="text-xs font-medium truncate">
                              {slot.source === "restaurant" ? slot.restaurant_name : slot.source === "home" ? slot.recipe_name : "Groceries"}
                            </span>
                          </div>
                          {slot.estimated_cost > 0 && (
                            <p className="text-xs text-muted-foreground">${slot.estimated_cost.toFixed(2)}</p>
                          )}
                          <button
                            onClick={() => removeSlot(day, mealType)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </button>
                        </CardContent>
                      </Card>
                    ) : (
                      <button
                        onClick={() => openAdd(day, mealType)}
                        className="w-full h-full min-h-[80px] rounded-lg border-2 border-dashed border-muted-foreground/15 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-muted-foreground/30" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <Card className="mt-6">
        <CardContent className="py-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Weekly total: <strong>${totalCost.toFixed(2)}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Utensils className="w-4 h-4 text-orange-500" />
            {meals.filter((m) => m.source === "restaurant").length} restaurant
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4 text-emerald-500" />
            {meals.filter((m) => m.source === "home").length} home
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShoppingBasket className="w-4 h-4 text-blue-500" />
            {meals.filter((m) => m.source === "grocery").length} grocery
          </div>
          {existingPlan?.submitted && (
            <Badge className="bg-emerald-100 text-emerald-800">Orders Submitted</Badge>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">{SOURCE_ICONS.home} Home Cook</span>
        <span className="flex items-center gap-1.5">{SOURCE_ICONS.restaurant} Restaurant</span>
        <span className="flex items-center gap-1.5">{SOURCE_ICONS.grocery} Grocery</span>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {addTarget ? `${addTarget.mealType.charAt(0).toUpperCase() + addTarget.mealType.slice(1)} — ${DAY_LABELS[addTarget.day]}` : "Meal"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={formSource} onValueChange={(v) => setFormSource(v as MealSource)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home Cook</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="grocery">Grocery Prep</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{formSource === "restaurant" ? "Restaurant Name" : formSource === "home" ? "Recipe Name" : "Description"}</Label>
              <Input
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder={formSource === "restaurant" ? "e.g. La Capital del Sabor" : formSource === "home" ? "e.g. Lemon Herb Chicken" : "e.g. Meal prep box"}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estimated Cost ($)</Label>
                <Input type="number" step="0.01" min="0" value={formCost} onChange={(e) => setFormCost(e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Servings</Label>
                <Input type="number" min="1" value={formServings} onChange={(e) => setFormServings(e.target.value)} />
              </div>
            </div>
            {formSource === "restaurant" && (
              <p className="text-xs text-muted-foreground">
                Tip: Browse the <button className="text-primary underline" onClick={() => { setAddDialogOpen(false); navigate("/cookbook"); }}>Cookbook</button> to find menus with exact pricing.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmAdd} className="bg-orange-600 hover:bg-orange-700">Add to Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
