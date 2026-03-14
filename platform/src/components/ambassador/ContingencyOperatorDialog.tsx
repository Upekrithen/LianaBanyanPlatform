/**
 * CONTINGENCY OPERATOR DIALOG — Role templates with sliders and real-time derived calculations.
 * Opens from AmbassadorMiniBusinessPlan "Play with these numbers". data-xray-id: contingency-operator-dialog
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HOURS_PER_MONTH_AMBASSADOR = 10;
const HOURS_PER_BATCH_MEAL = 4;
const HOURS_PER_RUN_GROCERY = 2;

export interface ContingencyOperatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultRole?: "ambassador" | "meal_maker" | "grocery_runner";
}

// --- Ambassador template
function AmbassadorTemplate() {
  const [recruitsPerMonth, setRecruitsPerMonth] = useState(5);
  const [marksPerRecruit, setMarksPerRecruit] = useState(20);
  const [monthsActive, setMonthsActive] = useState(12);
  const [ambassadorsSpawned, setAmbassadorsSpawned] = useState(2);

  const totalMarks = recruitsPerMonth * marksPerRecruit * monthsActive;
  const marksPerMonth = recruitsPerMonth * marksPerRecruit;
  const hourlyRate = HOURS_PER_MONTH_AMBASSADOR > 0 ? marksPerMonth / HOURS_PER_MONTH_AMBASSADOR : 0;

  return (
    <Card data-xray-id="co-ambassador-template">
      <CardHeader>
        <CardTitle className="text-base">Ambassador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Recruits per month (1–20)</Label>
          <Slider
            value={[recruitsPerMonth]}
            onValueChange={([v]) => setRecruitsPerMonth(v)}
            min={1}
            max={20}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{recruitsPerMonth}</span>
        </div>
        <div className="space-y-2">
          <Label>Marks earned per recruit (5–50)</Label>
          <Slider
            value={[marksPerRecruit]}
            onValueChange={([v]) => setMarksPerRecruit(v)}
            min={5}
            max={50}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{marksPerRecruit}</span>
        </div>
        <div className="space-y-2">
          <Label>Months active (1–24)</Label>
          <Slider
            value={[monthsActive]}
            onValueChange={([v]) => setMonthsActive(v)}
            min={1}
            max={24}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{monthsActive}</span>
        </div>
        <div className="space-y-2">
          <Label>Ambassadors you spawn (0–10)</Label>
          <Slider
            value={[ambassadorsSpawned]}
            onValueChange={([v]) => setAmbassadorsSpawned(v)}
            min={0}
            max={10}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{ambassadorsSpawned}</span>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <p><strong>Total Marks earned:</strong> {totalMarks}</p>
          <p><strong>Marks/month:</strong> {marksPerMonth}</p>
          <p><strong>Implicit hourly rate</strong> (assume {HOURS_PER_MONTH_AMBASSADOR} hrs/month): {hourlyRate.toFixed(1)} Marks/hr</p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Meal Maker template
function MealMakerTemplate() {
  const [pricePerMeal, setPricePerMeal] = useState(12);
  const [mealsPerBatch, setMealsPerBatch] = useState(8);
  const [batchesPerWeek, setBatchesPerWeek] = useState(3);
  const [ingredientCostPerBatch, setIngredientCostPerBatch] = useState(40);
  const platformFeePct = 20;

  const revenuePerBatch = pricePerMeal * mealsPerBatch;
  const weeklyRevenue = revenuePerBatch * batchesPerWeek;
  const weeklyCost = ingredientCostPerBatch * batchesPerWeek;
  const weeklyNet = weeklyRevenue * (1 - platformFeePct / 100) - weeklyCost;
  const monthlyNet = weeklyNet * 4;
  const hoursPerWeek = batchesPerWeek * HOURS_PER_BATCH_MEAL;
  const hourlyRate = hoursPerWeek > 0 ? weeklyNet / hoursPerWeek : 0;

  return (
    <Card data-xray-id="co-meal-maker-template">
      <CardHeader>
        <CardTitle className="text-base">Meal Maker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Price per meal (Credits) (5–25)</Label>
          <Slider
            value={[pricePerMeal]}
            onValueChange={([v]) => setPricePerMeal(v)}
            min={5}
            max={25}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{pricePerMeal}</span>
        </div>
        <div className="space-y-2">
          <Label>Meals per batch (4–20)</Label>
          <Slider
            value={[mealsPerBatch]}
            onValueChange={([v]) => setMealsPerBatch(v)}
            min={4}
            max={20}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{mealsPerBatch}</span>
        </div>
        <div className="space-y-2">
          <Label>Batches per week (1–7)</Label>
          <Slider
            value={[batchesPerWeek]}
            onValueChange={([v]) => setBatchesPerWeek(v)}
            min={1}
            max={7}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{batchesPerWeek}</span>
        </div>
        <div className="space-y-2">
          <Label>Ingredient cost per batch (10–100)</Label>
          <Slider
            value={[ingredientCostPerBatch]}
            onValueChange={([v]) => setIngredientCostPerBatch(v)}
            min={10}
            max={100}
            step={5}
          />
          <span className="text-sm text-muted-foreground">{ingredientCostPerBatch}</span>
        </div>
        <div className="space-y-2">
          <Label>C+20 platform fee (%)</Label>
          <span className="text-sm text-muted-foreground">20 (locked)</span>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <p><strong>Weekly revenue:</strong> {weeklyRevenue} Credits</p>
          <p><strong>Weekly cost:</strong> {weeklyCost} Credits</p>
          <p><strong>Weekly net:</strong> {weeklyNet.toFixed(0)} Credits</p>
          <p><strong>Monthly net:</strong> {monthlyNet.toFixed(0)} Credits</p>
          <p><strong>Implicit hourly rate</strong> (assume {HOURS_PER_BATCH_MEAL} hrs/batch): {hourlyRate.toFixed(1)} Credits/hr</p>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Grocery Runner template
function GroceryRunnerTemplate() {
  const [feePerHousehold, setFeePerHousehold] = useState(8);
  const [householdsPerRun, setHouseholdsPerRun] = useState(5);
  const [runsPerWeek, setRunsPerWeek] = useState(4);
  const [gasCostPerRun, setGasCostPerRun] = useState(10);
  const platformFeePct = 20;

  const revenuePerRun = feePerHousehold * householdsPerRun;
  const weeklyRevenue = revenuePerRun * runsPerWeek;
  const weeklyCost = gasCostPerRun * runsPerWeek;
  const weeklyNet = weeklyRevenue * (1 - platformFeePct / 100) - weeklyCost;
  const monthlyNet = weeklyNet * 4;
  const hoursPerWeek = runsPerWeek * HOURS_PER_RUN_GROCERY;
  const hourlyRate = hoursPerWeek > 0 ? weeklyNet / hoursPerWeek : 0;

  return (
    <Card data-xray-id="co-grocery-runner-template">
      <CardHeader>
        <CardTitle className="text-base">Grocery Runner</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Fee per household (Credits) (3–15)</Label>
          <Slider
            value={[feePerHousehold]}
            onValueChange={([v]) => setFeePerHousehold(v)}
            min={3}
            max={15}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{feePerHousehold}</span>
        </div>
        <div className="space-y-2">
          <Label>Households per run (2–10)</Label>
          <Slider
            value={[householdsPerRun]}
            onValueChange={([v]) => setHouseholdsPerRun(v)}
            min={2}
            max={10}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{householdsPerRun}</span>
        </div>
        <div className="space-y-2">
          <Label>Runs per week (1–7)</Label>
          <Slider
            value={[runsPerWeek]}
            onValueChange={([v]) => setRunsPerWeek(v)}
            min={1}
            max={7}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{runsPerWeek}</span>
        </div>
        <div className="space-y-2">
          <Label>Gas cost per run (5–20)</Label>
          <Slider
            value={[gasCostPerRun]}
            onValueChange={([v]) => setGasCostPerRun(v)}
            min={5}
            max={20}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{gasCostPerRun}</span>
        </div>
        <div className="space-y-2">
          <Label>C+20 platform fee (%)</Label>
          <span className="text-sm text-muted-foreground">20 (locked)</span>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
          <p><strong>Weekly revenue:</strong> {weeklyRevenue} Credits</p>
          <p><strong>Weekly cost:</strong> {weeklyCost} Credits</p>
          <p><strong>Weekly net:</strong> {weeklyNet.toFixed(0)} Credits</p>
          <p><strong>Monthly net:</strong> {monthlyNet.toFixed(0)} Credits</p>
          <p><strong>Implicit hourly rate</strong> (assume {HOURS_PER_RUN_GROCERY} hrs/run): {hourlyRate.toFixed(1)} Credits/hr</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ContingencyOperatorDialog({
  open,
  onOpenChange,
  defaultRole = "ambassador",
}: ContingencyOperatorDialogProps) {
  const navigate = useNavigate();
  const defaultTab = defaultRole === "meal_maker" ? "meal_maker" : defaultRole === "grocery_runner" ? "grocery_runner" : "ambassador";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-xray-id="contingency-operator-dialog">
        <DialogHeader>
          <DialogTitle>Contingency Operator — Play with the numbers</DialogTitle>
          <DialogDescription>
            Adjust sliders to see how Ambassador, Meal Maker, and Grocery Runner scenarios play out. This is a planning tool, not a guarantee.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ambassador">Ambassador</TabsTrigger>
            <TabsTrigger value="meal_maker">Meal Maker</TabsTrigger>
            <TabsTrigger value="grocery_runner">Grocery Runner</TabsTrigger>
          </TabsList>
          <TabsContent value="ambassador">
            <AmbassadorTemplate />
          </TabsContent>
          <TabsContent value="meal_maker">
            <MealMakerTemplate />
          </TabsContent>
          <TabsContent value="grocery_runner">
            <GroceryRunnerTemplate />
          </TabsContent>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          This is a planning tool, not a guarantee. Outcomes depend on participation and platform activity.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            onOpenChange(false);
            navigate("/pathway");
          }}
        >
          Go to Full Pathway →
        </Button>
      </DialogContent>
    </Dialog>
  );
}
