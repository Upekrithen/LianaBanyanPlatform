/**
 * Let's Go Shopping -- Wave 14 Mini-App / BP073 W7 (real-data wired)
 * ===================================================================
 * Group shopping coordination, shared lists, bulk-discount tracking (Cost+20%),
 * Marks for organizers, and "bring a friend" bounty mechanic.
 *
 * Supabase: orders (order_type='shopping'), shopping_participants,
 *           shared_shopping_lists, bring_a_friend_bounties
 * Migration: 20260603100003_bp073_w7_lgs_shopping.sql
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, TrendingDown, Users, Plus, Star, Gift, Copy, Check,
  ArrowRight, Tag, ShieldCheck, BookOpen, CreditCard, ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GroupOrder {
  id: string;
  event_name: string;
  category: string;
  product_name: string;
  product_description: string;
  product_image_url?: string;
  unit_price: number;
  min_quantity_threshold: number;
  current_quantity: number;
  volume_discount_tiers: Array<{ min_qty: number; discount_pct: number }>;
  status: string;
  closes_at: string;
  organizer_id: string;
  marks_reward?: number;
}

// Typed stub - no DB table yet; local state only
// TODO: wire to shared_shopping_lists once schema lands
interface SharedListItem {
  id: string;
  product_name: string;
  quantity: number;
  estimated_cost: number;
  added_by: string;
  claimed: boolean;
}

// Typed stub - no DB table yet
// TODO: wire to bring_a_friend_bounties once schema lands
interface BountyState {
  code: string;
  friendsInvited: number;
  marksEarned: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcDiscount(
  tiers: Array<{ min_qty: number; discount_pct: number }>,
  qty: number,
): number {
  const sorted = [...tiers].sort((a, b) => b.min_qty - a.min_qty);
  for (const tier of sorted) {
    if (qty >= tier.min_qty) return tier.discount_pct;
  }
  return 0;
}

function costPlusTwenty(baseCost: number): number {
  return baseCost * 1.2;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function OrderCard({ order, onJoin }: { order: GroupOrder; onJoin: () => void }) {
  const [qty, setQty] = useState(1);
  const [joining, setJoining] = useState(false);
  const { toast } = useToast();

  const discount = calcDiscount(order.volume_discount_tiers ?? [], order.current_quantity);
  const nextTier = (order.volume_discount_tiers ?? [])
    .sort((a, b) => a.min_qty - b.min_qty)
    .find((t) => t.min_qty > order.current_quantity);
  const unitPrice = costPlusTwenty(order.unit_price);
  const discountedUnit = unitPrice * (1 - discount / 100);
  const totalCost = discountedUnit * qty;
  const progress = Math.min((order.current_quantity / order.min_quantity_threshold) * 100, 100);
  const thresholdMet = order.current_quantity >= order.min_quantity_threshold;

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to join an order");

      // TODO: insert to shopping_participants once table exists in schema
      const { error } = await supabase.from("shopping_participants" as any).insert({
        shopping_order_id: order.id,
        user_id: user.id,
        quantity: qty,
        total_cost: totalCost,
      });
      if (error) throw error;

      toast({ title: "Joined!", description: `You joined the ${order.event_name} order for ${qty} x ${order.product_name}.` });
      onJoin();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setJoining(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{order.product_name}</CardTitle>
            <CardDescription className="mt-0.5 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{order.event_name}</Badge>
              <span className="text-xs text-muted-foreground">
                Closes {new Date(order.closes_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          {thresholdMet && <Badge className="bg-green-500 shrink-0">Live</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {order.product_description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{order.product_description}</p>
        )}

        {/* Participation progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" /> {order.current_quantity} / {order.min_quantity_threshold} units to go live
            </span>
            {nextTier && (
              <span className="text-purple-600 font-medium">
                {nextTier.min_qty - order.current_quantity} more for {nextTier.discount_pct}% off
              </span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Active volume discount */}
        {discount > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-green-700 text-xs font-medium">
            <TrendingDown className="h-3.5 w-3.5" />
            {discount}% volume discount active
          </div>
        )}

        {/* Cost+20% pricing display */}
        <div className="bg-muted/50 rounded p-2 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider cost:</span>
            <span>${order.unit_price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform margin (+20%):</span>
            <span>${(order.unit_price * 0.2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border/50 pt-1">
            <span>Your price{discount > 0 ? ` (-${discount}%)` : ""}:</span>
            <span>
              {discount > 0 && (
                <span className="line-through text-muted-foreground mr-1">${unitPrice.toFixed(2)}</span>
              )}
              ${discountedUnit.toFixed(2)}
            </span>
          </div>
        </div>

        {order.marks_reward && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Organizer earns {order.marks_reward} Marks for running this order
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full gap-2">
              <ShoppingBag className="h-4 w-4" />
              Join Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join {order.event_name} Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              {/* Transparent checkout summary */}
              <div className="rounded border bg-muted/30 p-3 space-y-1 text-sm">
                <p className="font-medium mb-2">Transparent Checkout</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Provider cost ({qty} units):</span>
                  <span>${(order.unit_price * qty).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform margin (20%):</span>
                  <span>${(order.unit_price * 0.2 * qty).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Volume discount (-{discount}%):</span>
                    <span>-${(unitPrice * qty * (discount / 100)).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                  <span>Total:</span>
                  <span>${totalCost.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Seller keeps 83.3% of the margin. Platform retains 16.7% for infrastructure.
                </p>
              </div>
              <Button onClick={handleJoin} disabled={joining} className="w-full">
                {joining ? "Joining..." : `Confirm - $${totalCost.toFixed(2)}`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function CreateOrderDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({
    event_name: "",
    category: "holiday",
    product_name: "",
    product_description: "",
    product_image_url: "",
    unit_price: "",
    min_quantity_threshold: "10",
    closes_at: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to create an order");

      const { data: initiative } = await supabase
        .from("initiatives")
        .select("id")
        .eq("initiative_slug", "lets_go_shopping")
        .single();

      const { error } = await supabase.from("orders" as any).insert({
        initiative_project_id: initiative?.id ?? null,
        event_name: form.event_name,
        category: form.category,
        product_name: form.product_name,
        product_description: form.product_description,
        product_image_url: form.product_image_url || null,
        unit_price: parseFloat(form.unit_price),
        min_quantity_threshold: parseInt(form.min_quantity_threshold),
        closes_at: new Date(form.closes_at).toISOString(),
        organizer_id: user.id,
        marks_reward: 50,
        volume_discount_tiers: [
          { min_qty: 5, discount_pct: 10 },
          { min_qty: 15, discount_pct: 15 },
          { min_qty: 30, discount_pct: 20 },
        ],
        order_type: "shopping",
        status: "pending",
      });
      if (error) throw error;

      toast({
        title: "Order Created",
        description: `Your ${form.event_name} group order is live. You earn 50 Marks when it fills.`,
      });
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Group Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Group Shopping Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Event Name *</Label>
              <Input required placeholder="Back-to-School 2026" value={form.event_name}
                onChange={(e) => setForm({ ...form, event_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="event">Special Event</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Product Name *</Label>
            <Input required placeholder="School supply bundle" value={form.product_name}
              onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="What's in the order..." value={form.product_description}
              onChange={(e) => setForm({ ...form, product_description: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Unit Cost ($) *</Label>
              <Input required type="number" step="0.01" min="0" placeholder="12.00" value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Min Units *</Label>
              <Input required type="number" min="1" placeholder="10" value={form.min_quantity_threshold}
                onChange={(e) => setForm({ ...form, min_quantity_threshold: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Closes *</Label>
              <Input required type="date" value={form.closes_at}
                onChange={(e) => setForm({ ...form, closes_at: e.target.value })} />
            </div>
          </div>

          <div className="rounded border bg-amber-50 border-amber-200 p-3 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">Pricing: Cost+20%</p>
            <p>Your cost + 20% = member price. You keep 83.3% of the margin. 16.7% funds platform infrastructure.</p>
            <p className="font-semibold mt-1">You earn 50 Marks when this order reaches its minimum threshold.</p>
          </div>

          <div className="rounded border bg-muted/30 p-3 text-xs space-y-1">
            <p className="font-medium">Auto volume discount tiers:</p>
            <p className="text-muted-foreground">5+ units: 10% off | 15+ units: 15% off | 30+ units: 20% off</p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Group Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BringAFriendPanel() {
  const [copied, setCopied] = useState(false);
  const { data: liveBounty } = useQuery({
    queryKey: ["bring_a_friend_bounties", "me"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await (supabase as any)
        .from("bring_a_friend_bounties")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const bounty: BountyState = {
    code: liveBounty?.referral_code ?? "LBSHOP-DEMO",
    friendsInvited: liveBounty?.friends_invited ?? 0,
    marksEarned: liveBounty?.marks_earned ?? 0,
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/join?ref=${bounty.code}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border-purple-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" />
          Bring a Friend Bounty
        </CardTitle>
        <CardDescription>Earn Marks when friends place their first order through your link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Input readOnly value={`${window.location.origin}/join?ref=${bounty.code}`} className="text-xs font-mono" />
          <Button size="sm" variant="outline" onClick={handleCopy} className="shrink-0 gap-1.5">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded border bg-background p-3">
            <p className="text-2xl font-bold">{bounty.friendsInvited}</p>
            <p className="text-xs text-muted-foreground">Friends invited</p>
          </div>
          <div className="rounded border bg-background p-3">
            <p className="text-2xl font-bold text-amber-600">{bounty.marksEarned}</p>
            <p className="text-xs text-muted-foreground">Marks earned</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Earn 25 Marks per friend who joins and completes their first group order.
          {/* TODO: real bounty tracking once bring_a_friend_bounties schema lands */}
        </p>
      </CardContent>
    </Card>
  );
}

function SharedListPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: liveItems = [] } = useQuery({
    queryKey: ["shared_shopping_lists", "my_items"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await (supabase as any)
        .from("shared_shopping_lists")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [newItem, setNewItem] = useState({ product_name: "", quantity: 1, estimated_cost: "" });

  const addItemMutation = useMutation({
    mutationFn: async (item: { product_name: string; quantity: number; estimated_cost: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in to add items");
      const { error } = await (supabase as any).from("shared_shopping_lists").insert({
        user_id: user.id,
        product_name: item.product_name,
        quantity: item.quantity,
        estimated_cost: item.estimated_cost,
        claimed: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared_shopping_lists", "my_items"] });
      setNewItem({ product_name: "", quantity: 1, estimated_cost: "" });
      toast({ title: "Added to shared list", description: "When a group order is created, this request helps organizers know what the neighborhood needs." });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleClaimMutation = useMutation({
    mutationFn: async ({ id, claimed }: { id: string; claimed: boolean }) => {
      const { error } = await (supabase as any)
        .from("shared_shopping_lists")
        .update({ claimed })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shared_shopping_lists", "my_items"] }),
  });

  const items: SharedListItem[] = liveItems.length > 0
    ? liveItems.map((i: any) => ({
        id: i.id,
        product_name: i.product_name,
        quantity: i.quantity,
        estimated_cost: Number(i.estimated_cost ?? 0),
        added_by: "You",
        claimed: i.claimed ?? false,
      }))
    : [
        {
          id: "stub-1",
          product_name: "Holiday gift wrapping paper (bulk)",
          quantity: 3,
          estimated_cost: 18.0,
          added_by: "You",
          claimed: false,
        },
      ];

  const addItem = () => {
    if (!newItem.product_name) return;
    addItemMutation.mutate({
      product_name: newItem.product_name,
      quantity: newItem.quantity,
      estimated_cost: parseFloat(newItem.estimated_cost) || 0,
    });
  };

  const toggleClaim = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item || id.startsWith("stub-")) return;
    toggleClaimMutation.mutate({ id, claimed: !item.claimed });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add items you want the neighborhood to source together. Organizers use this to know what to create group orders for.
      </p>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className={`flex items-center justify-between gap-3 p-3 rounded border ${item.claimed ? "opacity-50" : ""}`}>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.claimed ? "line-through text-muted-foreground" : ""}`}>{item.product_name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity} | Est. ${costPlusTwenty(item.estimated_cost).toFixed(2)} (Cost+20%)
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs">{item.added_by}</Badge>
              <Button size="sm" variant={item.claimed ? "outline" : "secondary"}
                className="text-xs h-7 px-2" onClick={() => toggleClaim(item.id)}>
                {item.claimed ? "Unclaim" : "Claim"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-4 pb-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Add to neighborhood wishlist</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-3 sm:col-span-1 space-y-1">
              <Label className="text-xs">Item</Label>
              <Input placeholder="What do you need?" className="h-8 text-sm" value={newItem.product_name}
                onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Qty</Label>
              <Input type="number" min="1" className="h-8 text-sm" value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Est. Cost ($)</Label>
              <Input type="number" step="0.01" min="0" className="h-8 text-sm" value={newItem.estimated_cost}
                onChange={(e) => setNewItem({ ...newItem, estimated_cost: e.target.value })} />
            </div>
          </div>
          <Button size="sm" onClick={addItem} className="w-full gap-2 h-8">
            <Plus className="h-3.5 w-3.5" />
            Add to Wishlist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MarksInfoPanel() {
  return (
    <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
          How Marks Work Here
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <Tag className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p><span className="font-medium">Create a group order:</span> Earn 50 Marks when it reaches minimum threshold</p>
          </div>
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p><span className="font-medium">Bring a friend:</span> Earn 25 Marks per friend who completes their first order</p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <p><span className="font-medium">Harper audit:</span> Volunteer to verify product quality and earn Marks per review</p>
          </div>
        </div>
        <div className="rounded border border-amber-200 bg-amber-50/50 p-2 text-xs text-amber-800 mt-1">
          Marks are participation credits only. They are not securities, not transferable, and not redeemable for cash.
          They unlock platform features and recognition tiers.
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LetsGoShoppingPage() {
  usePageSEO({
    title: "Let's Go Shopping | Liana Banyan",
    description: "Community-coordinated group buying and local shopping trips. Reduce costs and emissions through cooperative purchasing.",
    canonical: "https://lianabanyan.com/initiatives/lets-go-shopping",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["shopping-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders" as any)
        .select("*")
        .eq("order_type", "shopping")
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as GroupOrder[];
    },
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ["shopping-orders"] });

  const holidays = orders.filter((o) => o.category === "holiday");
  const events = orders.filter((o) => o.category === "event");
  const seasonal = orders.filter((o) => o.category === "seasonal");

  const cueCard = getCueCard("lets-go-shopping");
  const walkthrough = getWalkthrough("lets-go-shopping");

  return (
    <LaunchConditionOverlay initiativeSlug="lets-go-shopping" initiativeName="Let's Go Shopping">
      <PortalPageLayout maxWidth="xl" xrayId="lets-go-shopping-page">
        <div className="space-y-6">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate("/initiatives")} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            All Initiatives
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold">Let's Go Shopping</h1>
                <p className="text-muted-foreground">
                  Group orders, volume discounts, Marks for organizers
                </p>
              </div>
            </div>
            <CreateOrderDialog onCreated={refetch} />
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-0">
              <TabsTrigger value="orders" className="gap-1.5">
                <ShoppingBag className="h-4 w-4" />
                Group Orders
                {orders.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{orders.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="gap-1.5">
                <BookOpen className="h-4 w-4" />
                Shared List
              </TabsTrigger>
              <TabsTrigger value="bounty" className="gap-1.5">
                <Gift className="h-4 w-4" />
                Bring a Friend
              </TabsTrigger>
              <TabsTrigger value="marks" className="gap-1.5">
                <Star className="h-4 w-4" />
                Marks
              </TabsTrigger>
              {walkthrough && (
                <TabsTrigger value="walkthrough" className="gap-1.5">
                  <ArrowRight className="h-4 w-4" />
                  How It Works
                </TabsTrigger>
              )}
              {cueCard && (
                <TabsTrigger value="cue-card" className="gap-1.5">
                  <CreditCard className="h-4 w-4" />
                  Cue Card
                </TabsTrigger>
              )}
            </TabsList>

            {/* ── Orders ── */}
            <TabsContent value="orders" className="mt-4 space-y-4">
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                  <TabsTrigger value="holiday">Holidays ({holidays.length})</TabsTrigger>
                  <TabsTrigger value="event">Events ({events.length})</TabsTrigger>
                  <TabsTrigger value="seasonal">Seasonal ({seasonal.length})</TabsTrigger>
                </TabsList>

                {(["all", "holiday", "event", "seasonal"] as const).map((tab) => {
                  const list = tab === "all" ? orders : tab === "holiday" ? holidays : tab === "event" ? events : seasonal;
                  return (
                    <TabsContent key={tab} value={tab} className="mt-4">
                      {isLoading ? (
                        <p className="text-muted-foreground text-sm">Loading orders...</p>
                      ) : list.length === 0 ? (
                        <Card>
                          <CardContent className="py-10 text-center space-y-3">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                            <p className="text-muted-foreground">No {tab === "all" ? "" : tab} orders yet.</p>
                            <Button size="sm" onClick={() => document.querySelector<HTMLButtonElement>("[data-create-order]")?.click()}>
                              Create the first one
                            </Button>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {list.map((order) => (
                            <OrderCard key={order.id} order={order} onJoin={refetch} />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>

              {/* Cost+20% explainer */}
              <Card className="bg-purple-50/50 border-purple-200">
                <CardContent className="py-4 flex gap-3">
                  <Tag className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900">Cost+20% Pricing</p>
                    <p className="text-purple-700 mt-0.5">
                      Every product is priced at the seller's actual cost + 20%. The seller keeps 83.3% of
                      that 20%. No hidden markups, no algorithmic price gouging. Volume discounts reduce the
                      member price further as more people join.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Shared List ── */}
            <TabsContent value="wishlist" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Neighborhood Wishlist</CardTitle>
                  <CardDescription>
                    Items the neighborhood wants to source together. Organizers use this to create group orders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SharedListPanel />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Bounty ── */}
            <TabsContent value="bounty" className="mt-4">
              <div className="max-w-lg space-y-4">
                <BringAFriendPanel />
                <Card>
                  <CardContent className="py-4 text-sm text-muted-foreground space-y-2">
                    <p className="font-medium text-foreground">How the bounty works</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Share your unique referral link with a friend</li>
                      <li>Friend signs up for a $5/year membership</li>
                      <li>Friend places their first group order</li>
                      <li>You receive 25 Marks automatically</li>
                    </ol>
                    <p>No limit to friends you can invite. Marks are participation credits, not cash or securities.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Marks ── */}
            <TabsContent value="marks" className="mt-4">
              <div className="max-w-lg">
                <MarksInfoPanel />
              </div>
            </TabsContent>

            {/* ── Walkthrough ── */}
            {walkthrough && (
              <TabsContent value="walkthrough" className="mt-4">
                <InitiativeWalkthrough
                  steps={walkthrough.steps}
                  initiativeName="Let's Go Shopping"
                />
                {walkthrough.originAnecdote && (
                  <Card className="mt-4 bg-muted/30">
                    <CardContent className="py-4 text-sm text-muted-foreground italic leading-relaxed">
                      "{walkthrough.originAnecdote}"
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            {/* ── Cue Card ── */}
            {cueCard && (
              <TabsContent value="cue-card" className="mt-4">
                <div className="max-w-md">
                  <InitiativeCueCard card={cueCard} />
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Onboarding hook */}
          {!user && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Join the cooperative ($5/year) to create group orders and earn Marks.
                </p>
                <Button size="sm" onClick={() => navigate("/join")}>
                  Join Now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
