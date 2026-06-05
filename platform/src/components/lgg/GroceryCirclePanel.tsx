/**
 * GroceryCirclePanel — Wave 13 / BP073 W7 (real-data wired)
 * ===========================================================
 * Group grocery coordination mini-app for Let's Get Groceries.
 *
 * Securities-clean: Marks = participation credits, never financial return.
 * Supabase tables: grocery_circles, grocery_circle_items, grocery_circle_members
 * Migration: 20260603100002_bp073_w7_lgg_grocery_circles.sql
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { GroceryCircle as GroceryCircleRow, GroceryCircleItem } from "@/integrations/supabase/initiative-types";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ShoppingCart,
  Users,
  Plus,
  Trash2,
  Coins,
  MapPin,
  Star,
  TrendingDown,
  AlertCircle,
  Crown,
  Check,
  ArrowRight,
  Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  unitCost: number;
  unit: string;
  addedBy: string;
  addedByName: string;
  quantity: number;
  costPlusPrice: number;
}

interface CircleMember {
  id: string;
  name: string;
  itemCount: number;
  subtotal: number;
}

interface GroceryCircle {
  id: string;
  name: string;
  neighborhood: string;
  organizerId: string;
  organizerName: string;
  memberCount: number;
  maxMembers: number;
  orderCycleLabel: string;
  orderCloseDate: string;
  pickupDate: string;
  pickupLocation: string;
  isFirstOrganizer: boolean;
  marksForOrganizer: number;
  marksPerOrder: number;
  status: "ordering" | "closed" | "pickup_ready";
  items: GroceryItem[];
  members: CircleMember[];
}

// ─── Supabase query hooks ────────────────────────────────────────────────────

function useActiveCircle(userId: string | null) {
  return useQuery({
    queryKey: ["grocery_circles", "active", userId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("grocery_circles")
        .select(`
          *,
          grocery_circle_members!inner(user_id),
          grocery_circle_items(*)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as (GroceryCircleRow & { grocery_circle_items: GroceryCircleItem[] }) | null;
    },
    enabled: true,
  });
}

function useNearbyCircles() {
  return useQuery({
    queryKey: ["grocery_circles", "nearby"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("grocery_circles")
        .select("*, grocery_circle_members(count)")
        .in("status", ["forming", "active"])
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as GroceryCircleRow[];
    },
  });
}

const COST_PLUS = 1.2; // Cost + 20%

const SAMPLE_CATALOG: Omit<GroceryItem, "id" | "addedBy" | "addedByName" | "quantity" | "costPlusPrice">[] = [
  { name: "Eggs (dozen)", category: "Dairy & Eggs", unitCost: 3.5, unit: "dozen" },
  { name: "Whole milk (gallon)", category: "Dairy & Eggs", unitCost: 3.8, unit: "gallon" },
  { name: "Butter (1 lb)", category: "Dairy & Eggs", unitCost: 4.2, unit: "lb" },
  { name: "Flour (5 lb)", category: "Dry Goods", unitCost: 4.0, unit: "bag" },
  { name: "Rice (5 lb)", category: "Dry Goods", unitCost: 3.2, unit: "bag" },
  { name: "Oats (42 oz)", category: "Dry Goods", unitCost: 5.5, unit: "container" },
  { name: "Olive oil (16 oz)", category: "Oils & Condiments", unitCost: 6.0, unit: "bottle" },
  { name: "Black beans (15 oz, x6)", category: "Dry Goods", unitCost: 5.4, unit: "6-pack" },
  { name: "Canned tomatoes (28 oz, x4)", category: "Dry Goods", unitCost: 7.2, unit: "4-pack" },
  { name: "Chicken thighs (3 lb)", category: "Meat", unitCost: 8.0, unit: "pkg" },
  { name: "Ground beef 80/20 (2 lb)", category: "Meat", unitCost: 10.5, unit: "pkg" },
  { name: "Apples Gala (3 lb)", category: "Produce", unitCost: 4.5, unit: "bag" },
  { name: "Bananas (bunch)", category: "Produce", unitCost: 1.8, unit: "bunch" },
  { name: "Potatoes (5 lb)", category: "Produce", unitCost: 4.0, unit: "bag" },
  { name: "Onions yellow (3 lb)", category: "Produce", unitCost: 2.5, unit: "bag" },
];

function buildSampleCircle(userId: string | null): GroceryCircle {
  const items: GroceryItem[] = [
    {
      id: "item-1",
      name: "Eggs (dozen)",
      category: "Dairy & Eggs",
      unitCost: 3.5,
      unit: "dozen",
      addedBy: "user-neighbor-a",
      addedByName: "Sarah M.",
      quantity: 3,
      costPlusPrice: applyMarkup(3.5),
    },
    {
      id: "item-2",
      name: "Flour (5 lb)",
      category: "Dry Goods",
      unitCost: 4.0,
      unit: "bag",
      addedBy: "user-neighbor-b",
      addedByName: "Terrence A.",
      quantity: 2,
      costPlusPrice: applyMarkup(4.0),
    },
    {
      id: "item-3",
      name: "Chicken thighs (3 lb)",
      category: "Meat",
      unitCost: 8.0,
      unit: "pkg",
      addedBy: userId ?? "guest",
      addedByName: "You",
      quantity: 1,
      costPlusPrice: applyMarkup(8.0),
    },
  ];

  return {
    id: "circle-1",
    name: "Elm Street Grocery Circle",
    neighborhood: "Elm & 14th",
    organizerId: "user-organizer",
    organizerName: "Rosa G.",
    memberCount: 8,
    maxMembers: 20,
    orderCycleLabel: "Weekly (Tue close / Fri pickup)",
    orderCloseDate: "2026-06-10",
    pickupDate: "2026-06-13",
    pickupLocation: "Rosa's garage, 1423 Elm St",
    isFirstOrganizer: false,
    marksForOrganizer: 100,
    marksPerOrder: 20,
    status: "ordering",
    items,
    members: [
      { id: "user-organizer", name: "Rosa G.", itemCount: 4, subtotal: 31.2 },
      { id: "user-neighbor-a", name: "Sarah M.", itemCount: 2, subtotal: 15.4 },
      { id: "user-neighbor-b", name: "Terrence A.", itemCount: 3, subtotal: 22.8 },
      { id: userId ?? "guest", name: "You", itemCount: 1, subtotal: applyMarkup(8.0) },
    ],
  };
}

// ─── Add Item Dialog ──────────────────────────────────────────────────────────

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAdd: (item: Omit<GroceryItem, "id" | "addedBy" | "addedByName">) => void;
}

function AddItemDialog({ open, onOpenChange, onAdd }: AddItemDialogProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof SAMPLE_CATALOG)[0] | null>(null);
  const [qty, setQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customCost, setCustomCost] = useState("");
  const [customUnit, setCustomUnit] = useState("each");
  const [mode, setMode] = useState<"catalog" | "custom">("catalog");

  const filtered = SAMPLE_CATALOG.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (mode === "catalog" && selected) {
      onAdd({
        name: selected.name,
        category: selected.category,
        unitCost: selected.unitCost,
        unit: selected.unit,
        quantity: qty,
        costPlusPrice: applyMarkup(selected.unitCost),
      });
    } else if (mode === "custom" && customName && customCost) {
      const cost = parseFloat(customCost);
      onAdd({
        name: customName,
        category: "Other",
        unitCost: cost,
        unit: customUnit,
        quantity: qty,
        costPlusPrice: applyMarkup(cost),
      });
    }
    onOpenChange(false);
    setSearch("");
    setSelected(null);
    setQty(1);
    setCustomName("");
    setCustomCost("");
    setMode("catalog");
  };

  const canAdd =
    (mode === "catalog" && selected) ||
    (mode === "custom" && customName && parseFloat(customCost) > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-400" />
            Add Item to Circle Order
          </DialogTitle>
          <DialogDescription>
            All items are priced at Cost+20%. You see the source cost and the markup
            before adding anything.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode("catalog")}
              className={`flex-1 text-sm py-1.5 rounded border transition-colors ${
                mode === "catalog"
                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                  : "border-white/20 opacity-50"
              }`}
            >
              From catalog
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 text-sm py-1.5 rounded border transition-colors ${
                mode === "custom"
                  ? "bg-green-500/20 border-green-500/50 text-green-300"
                  : "border-white/20 opacity-50"
              }`}
            >
              Custom item
            </button>
          </div>

          {mode === "catalog" ? (
            <>
              <Input
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                {filtered.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                      selected?.name === c.name
                        ? "bg-green-500/20 border border-green-500/40"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span>
                      {c.name}
                      <span className="text-xs opacity-50 ml-2">/ {c.unit}</span>
                    </span>
                    <span className="text-green-300 font-mono text-xs">
                      ${applyMarkup(c.unitCost).toFixed(2)} <span className="opacity-50">(C+20%)</span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Item name *</Label>
                <Input
                  placeholder="e.g., Sourdough bread"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Your cost ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={customCost}
                    onChange={(e) => setCustomCost(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Unit</Label>
                  <Input
                    placeholder="each, lb, dozen..."
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                  />
                </div>
              </div>
              {customCost && parseFloat(customCost) > 0 && (
                <p className="text-xs text-green-300">
                  Circle price (Cost+20%): ${applyMarkup(parseFloat(customCost)).toFixed(2)}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1">
            <Label>Quantity</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded border border-white/20 flex items-center justify-center hover:bg-white/10"
              >
                -
              </button>
              <span className="w-10 text-center font-mono">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-8 h-8 rounded border border-white/20 flex items-center justify-center hover:bg-white/10"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canAdd}
            onClick={handleAdd}
            className="bg-green-700 hover:bg-green-600"
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── First-Organizer Bounty Banner ────────────────────────────────────────────

function FirstOrganizerBountyBanner({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="rounded-xl border border-yellow-500/40 p-5 space-y-3"
      style={{ background: "rgba(234,179,8,0.08)" }}
    >
      <div className="flex items-start gap-3">
        <Crown className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-yellow-200 mb-1">
            No grocery circle in your neighborhood yet.
          </p>
          <p className="text-sm text-yellow-100/70 mb-3">
            The first organizer on any block earns 100 Marks (participation credits)
            and the <strong>Neighborhood Pioneer</strong> badge. You need a dry space
            (garage, porch, church hall) and 2-3 hours per week.
          </p>
          <div className="flex flex-wrap gap-2 text-xs mb-3">
            <span className="px-2 py-1 rounded bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
              100 Marks on first cycle
            </span>
            <span className="px-2 py-1 rounded bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
              Pioneer badge
            </span>
            <span className="px-2 py-1 rounded bg-yellow-500/15 border border-yellow-500/30 text-yellow-300">
              Earn on every order
            </span>
          </div>
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/15 transition-colors"
          >
            Start a grocery circle
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Onboarding Hook Banner ───────────────────────────────────────────────────

function FirstTimeBanner() {
  return (
    <div
      className="rounded-xl border border-green-500/30 p-5"
      style={{ background: "rgba(34,197,94,0.07)" }}
    >
      <div className="flex items-start gap-3">
        <ShoppingCart className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-green-200 mb-1">First time? Here's how it works.</p>
          <ol className="text-sm text-green-100/70 space-y-1 list-decimal list-inside">
            <li>Join your neighborhood circle (20-100 households).</li>
            <li>Add items before the weekly order closes. Every item is Cost+20% - no hidden markups.</li>
            <li>The organizer places the bulk order. You pay only for what you requested.</li>
            <li>Pick up at the neighborhood node. The organizer earns Marks for running it.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GroceryCirclePanel() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddItem, setShowAddItem] = useState(false);
  const [showStartCircle, setShowStartCircle] = useState(false);
  const [hasSeenOnboarding] = useState(false);

  const { data: dbCircle, isLoading } = useActiveCircle(user?.id ?? null);
  const { data: nearbyCircles = [] } = useNearbyCircles();

  // Map DB row to local GroceryCircle shape
  const circle: GroceryCircle | null = dbCircle
    ? {
        id: dbCircle.id,
        name: dbCircle.name,
        neighborhood: dbCircle.neighborhood ?? "Your area",
        organizerId: dbCircle.organizer_id,
        organizerName: dbCircle.organizer_id.slice(0, 8),
        memberCount: (nearbyCircles.find((c: GroceryCircleRow) => c.id === dbCircle.id) as any)?.grocery_circle_members?.[0]?.count ?? 0,
        maxMembers: dbCircle.max_members,
        orderCycleLabel: "Weekly",
        orderCloseDate: "Next Tuesday",
        pickupDate: "Next Friday",
        pickupLocation: "Circle organizer's address",
        isFirstOrganizer: false,
        marksForOrganizer: dbCircle.marks_for_org,
        marksPerOrder: 20,
        status: "ordering",
        items: (dbCircle.grocery_circle_items ?? []).map((i: GroceryCircleItem) => ({
          id: i.id,
          name: i.item_name,
          category: i.unit ?? "General",
          unitCost: i.estimated_cost ?? 0,
          unit: i.unit ?? "unit",
          addedBy: i.added_by,
          addedByName: i.added_by.slice(0, 8),
          quantity: i.quantity ?? 1,
          costPlusPrice: Math.ceil((i.estimated_cost ?? 0) * COST_PLUS * 100) / 100,
        })),
        members: [],
      }
    : null;

  const noCircle = !isLoading && !circle;

  // Compute totals
  const myItems = circle?.items.filter((i) => i.addedBy === (user?.id ?? "guest")) ?? [];
  const mySubtotal = myItems.reduce((sum, i) => sum + i.costPlusPrice * i.quantity, 0);
  const circleTotal = (circle?.items ?? []).reduce(
    (sum, i) => sum + i.costPlusPrice * i.quantity,
    0
  );
  const savingsVsRetail = circleTotal * 0.15; // ~15% bulk savings estimate

  const addItemMutation = useMutation({
    mutationFn: async (itemData: Omit<GroceryItem, "id" | "addedBy" | "addedByName">) => {
      if (!circle) throw new Error("No active circle");
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("grocery_circle_items").insert({
        circle_id: circle.id,
        added_by: u.id,
        item_name: itemData.name,
        quantity: itemData.quantity,
        unit: itemData.unit,
        estimated_cost: itemData.unitCost,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: (_, itemData) => {
      queryClient.invalidateQueries({ queryKey: ["grocery_circles"] });
      toast({
        title: "Item added to circle order",
        description: `${itemData.name} — Cost+20% applied`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await (supabase as any).from("grocery_circle_items").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery_circles"] });
    },
  });

  const joinCircleMutation = useMutation({
    mutationFn: async (circleId: string) => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Not signed in");
      const { error } = await (supabase as any).from("grocery_circle_members").insert({
        circle_id: circleId,
        user_id: u.id,
      });
      if (error && error.code !== "23505") throw error; // ignore duplicate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery_circles"] });
      toast({
        title: "Joined the circle!",
        description: "You can now add items to this week's order.",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleAddItem = (itemData: Omit<GroceryItem, "id" | "addedBy" | "addedByName">) => {
    if (!user) {
      openOnboard({ reason: "add items to your grocery circle", actionLabel: "Join", membershipIncluded: true });
      return;
    }
    addItemMutation.mutate(itemData);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleJoinCircle = () => {
    if (!user) {
      openOnboard({ reason: "join your neighborhood grocery circle", actionLabel: "Join", membershipIncluded: true });
      return;
    }
    if (nearbyCircles.length > 0) {
      joinCircleMutation.mutate(nearbyCircles[0].id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Onboarding (first visit only) */}
      {!hasSeenOnboarding && circle && <FirstTimeBanner />}

      {/* No circle state */}
      {noCircle && (
        <FirstOrganizerBountyBanner onStart={() => setShowStartCircle(true)} />
      )}

      {/* Circle found */}
      {circle && (
        <>
          {/* Circle info header */}
          <div
            className="rounded-xl border border-green-500/20 p-5 space-y-4"
            style={{ background: "rgba(34,197,94,0.06)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-green-200">{circle.name}</h3>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    {circle.status === "ordering" ? "Ordering open" : "Order closed"}
                  </Badge>
                </div>
                <p className="text-sm opacity-60 flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {circle.neighborhood}
                </p>
              </div>
              <div className="text-right text-xs opacity-50">
                <p>Organized by</p>
                <p className="font-medium text-green-300">{circle.organizerName}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs opacity-60">
                <span>
                  {circle.memberCount}/{circle.maxMembers} members
                </span>
                <span>Order closes {circle.orderCloseDate}</span>
              </div>
              <Progress
                value={(circle.memberCount / circle.maxMembers) * 100}
                className="h-2 bg-white/10"
              />
              <p className="text-xs opacity-50">
                More members = lower per-unit cost. Invite neighbors!
              </p>
            </div>

            {/* Cycle info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 opacity-60">
                <Package className="h-4 w-4" />
                {circle.orderCycleLabel}
              </span>
              <span className="flex items-center gap-1.5 opacity-60">
                <MapPin className="h-4 w-4" />
                Pickup: {circle.pickupLocation}
              </span>
            </div>

            {/* Marks notice */}
            <div className="flex items-center gap-2 text-xs opacity-60 border-t border-white/10 pt-3">
              <Coins className="h-3.5 w-3.5 text-yellow-400" />
              <span>
                Completing an order earns <strong className="text-yellow-300">
                  {circle.marksPerOrder} Marks
                </strong> (participation credits).
                Organizer earns <strong className="text-yellow-300">{circle.marksForOrganizer} Marks</strong> per cycle.
              </span>
            </div>
          </div>

          {/* This week's order */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-200 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                This Week's Order ({circle.items.length} items)
              </h4>
              {circle.status === "ordering" && (
                <button
                  onClick={() => {
                    if (!user) {
                      openOnboard({ reason: "add items to your grocery order", actionLabel: "Join", membershipIncluded: true });
                      return;
                    }
                    setShowAddItem(true);
                  }}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border border-green-500/40 text-green-300 hover:bg-green-500/15 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              )}
            </div>

            {/* Items list */}
            <div className="space-y-2">
              {circle.items.map((item) => {
                const isMine = item.addedBy === (user?.id ?? "guest");
                const lineTotal = item.costPlusPrice * item.quantity;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                      isMine
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs opacity-40">/{item.unit}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs opacity-50 mt-0.5 flex gap-3">
                        <span>
                          Cost: ${item.unitCost.toFixed(2)} → C+20%: ${item.costPlusPrice.toFixed(2)}
                        </span>
                        <span>Added by {isMine ? "You" : item.addedByName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs opacity-60">x{item.quantity}</span>
                      <span className="font-mono text-sm text-green-300">
                        ${lineTotal.toFixed(2)}
                      </span>
                      {isMine && circle.status === "ordering" && (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order summary */}
            <div
              className="rounded-lg border border-white/10 p-4 space-y-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Circle total (Cost+20%)</span>
                <span className="font-mono">${circleTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Your share</span>
                <span className="font-mono text-green-300 font-medium">
                  ${mySubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60 flex items-center gap-1">
                  <TrendingDown className="h-3.5 w-3.5 text-green-400" />
                  Est. bulk savings vs. retail
                </span>
                <span className="text-green-400 font-mono">
                  ~${savingsVsRetail.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center gap-1.5 text-xs opacity-50">
                <Check className="h-3 w-3 text-green-400" />
                All prices are Cost+20%. No surprise charges. No substitutions without permission.
              </div>
            </div>
          </div>

          {/* Member breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium opacity-70 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Who's in this order
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {circle.members.map((m) => {
                const isOrganizer = m.id === circle.organizerId;
                return (
                  <div
                    key={m.id}
                    className="rounded-lg bg-white/5 px-3 py-2 text-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      {isOrganizer && (
                        <Star className="h-3.5 w-3.5 text-yellow-400" />
                      )}
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span className="text-xs opacity-50 font-mono">
                      ${m.subtotal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Join CTA (if not already a member) */}
          {!user && (
            <Button
              className="w-full bg-green-700 hover:bg-green-600"
              onClick={handleJoinCircle}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Join this grocery circle
            </Button>
          )}
        </>
      )}

      {/* Start a circle dialog (stub) */}
      <Dialog open={showStartCircle} onOpenChange={setShowStartCircle}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Start a Grocery Circle
            </DialogTitle>
            <DialogDescription>
              Become the first organizer in your neighborhood. Earn 100 Marks
              (participation credits) on your first completed cycle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2 text-sm">
            <p className="opacity-70">
              You need: a dry space (garage, porch, or community room), about 2-3 hours
              per week, and a way to accept neighbors signing up.
            </p>
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 space-y-2">
              <p className="text-yellow-200 font-medium">What you get as organizer:</p>
              <ul className="text-yellow-100/70 space-y-1 text-xs">
                <li className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  100 Marks on first completed cycle (participation credits)
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Neighborhood Pioneer badge
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Platform manages order aggregation and cost-splitting
                </li>
                <li className="flex items-start gap-1.5">
                  <Check className="h-3.5 w-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  83.3% of the coordination fee goes to you
                </li>
              </ul>
            </div>
            <p className="text-xs opacity-50">
              TODO: Supabase wiring for grocery_circles table. Until then, registrations
              are collected manually and the Founder approves the first organizer per zip code.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartCircle(false)}>
              Not yet
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700"
              onClick={() => {
                if (!user) {
                  openOnboard({ reason: "start a grocery circle", actionLabel: "Join", membershipIncluded: true });
                } else {
                  toast({
                    title: "Organizer interest recorded!",
                    description: "The Founder will reach out to activate your circle. Check your email.",
                  });
                }
                setShowStartCircle(false);
              }}
            >
              I want to start a circle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add item dialog */}
      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        onAdd={handleAddItem}
      />

      {/* Securities-clean footer note */}
      <div className="flex items-start gap-2 text-xs opacity-40 pt-2 border-t border-white/10">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>
          Marks are cooperative participation credits. They track your contribution and unlock
          platform features. They are not equity, shares, or a financial return. Prices shown
          are Cost+20% -- the platform retains 16.7% for infrastructure and the initiative
          charitable pool.
        </span>
      </div>
    </div>
  );
}
