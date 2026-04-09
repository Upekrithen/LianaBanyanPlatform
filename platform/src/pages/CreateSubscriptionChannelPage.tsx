import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Repeat, ArrowLeft, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  { value: "teaching", label: "Teaching" },
  { value: "deals", label: "Deals & Finds" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking" },
  { value: "fitness", label: "Fitness" },
  { value: "music", label: "Music" },
  { value: "crafts", label: "Crafts" },
  { value: "general", label: "General" },
];

const BILLING_CYCLES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "per_session", label: "Per Session" },
];

const CURRENCY_OPTIONS = [
  { value: "marks", label: "All Internal (Marks/Credits/Joules)" },
  { value: "dollars", label: "Dollars (via Stripe)" },
];

export default function CreateSubscriptionChannelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [category, setCategory] = useState("general");
  const [maxSubscribers, setMaxSubscribers] = useState("");
  const [currency, setCurrency] = useState("marks");

  const createMutation = useMutation({
    mutationFn: async () => {
      const priceNum = parseFloat(price);
      if (!priceNum || priceNum <= 0) throw new Error("Price must be greater than 0");
      if (!title.trim()) throw new Error("Title is required");

      if (currency === "dollars" && billingCycle === "per_session") {
        throw new Error("Dollar subscriptions require weekly or monthly billing. Per-session is only available for internal currencies.");
      }

      const payload: Record<string, unknown> = {
        creator_id: user!.id,
        title: title.trim(),
        description: description.trim() || null,
        price: priceNum,
        billing_cycle: billingCycle,
        category,
        currency,
        active: true,
      };
      if (maxSubscribers.trim()) {
        const max = parseInt(maxSubscribers, 10);
        if (max > 0) payload.max_subscribers = max;
      }

      const { data: channelData, error } = await supabase
        .from("subscription_channels" as never)
        .insert(payload as never)
        .select("id")
        .single() as { data: { id: string } | null; error: unknown };
      if (error) throw error;

      if (currency === "dollars" && channelData?.id) {
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://ruuxzilgmuwddcofqecc.supabase.co"}/functions/v1/create-subscription-product`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              channel_id: channelData.id,
              title: title.trim(),
              amount_cents: Math.round(priceNum * 100),
              billing_cycle: billingCycle,
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create Stripe product");
        }
      }
    },
    onSuccess: () => {
      toast({ title: "Channel Created!", description: "Your subscription channel is live." });
      navigate("/subscription-channels");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const previewCreatorAmount = price ? (parseFloat(price) * 0.833).toFixed(2) : "0.00";

  return (
    <PortalPageLayout
      title="Create Subscription Channel"
      subtitle="Set up a recurring subscription for your followers"
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1"
        onClick={() => navigate("/subscription-channels")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Channels
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Channel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Channel Title *</Label>
                <Input
                  id="title"
                    placeholder={'e.g. "Tuesday Spanish Beginner" or "Diana\'s Deal Drops"'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What subscribers get, schedule, any requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (all currencies at parity) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 10"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Cycle *</Label>
                  <Select value={billingCycle} onValueChange={setBillingCycle}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BILLING_CYCLES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Currency *</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max">Max Subscribers (optional)</Label>
                  <Input
                    id="max"
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxSubscribers}
                    onChange={(e) => setMaxSubscribers(e.target.value)}
                  />
                </div>
                {currency === "dollars" && billingCycle === "per_session" && (
                  <div className="flex items-center">
                    <p className="text-xs text-destructive">
                      Dollar subscriptions require weekly or monthly billing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full"
            disabled={!title.trim() || !price || createMutation.isPending}
            onClick={() => createMutation.mutate()}
          >
            {createMutation.isPending ? "Creating..." : "Create Subscription Channel"}
          </Button>
        </div>

        {/* Revenue Preview */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/20 dark:to-emerald-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <CardTitle className="text-sm">Revenue Preview</CardTitle>
              <CardDescription>Per billing cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subscriber pays</span>
                <span className="font-medium">{price || "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">You receive (83.3%)</span>
                <span className="font-semibold text-emerald-600">{previewCreatorAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform (16.7%)</span>
                <span className="text-xs">
                  {price ? (parseFloat(price) * 0.167).toFixed(2) : "0.00"}
                </span>
              </div>
              <hr />
              <p className="text-xs text-muted-foreground">
                {currency === "dollars"
                  ? "Dollar subscriptions processed via Stripe Billing. Stripe fees apply before the 83.3%/16.7% split."
                  : "Internal currency (Marks/Credits/Joules) — zero processing fees. Full 83.3% goes to you."}
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-sm">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="space-y-2 text-muted-foreground text-xs">
                  <p>Subscribers choose their preferred currency when subscribing and can switch anytime.</p>
                  <p>Internal currencies (Marks/Credits/Joules) have zero processing fees — more goes to you.</p>
                  <p>Billing runs automatically. Failed payments retry once after 3 days, then pause.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalPageLayout>
  );
}
