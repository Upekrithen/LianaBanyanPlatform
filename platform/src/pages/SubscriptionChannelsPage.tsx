import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Repeat, Users, Search, Filter, Sparkles, Clock, DollarSign,
  Coins, Zap, CircleDot, ArrowRight, Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { TourModeBanner } from "@/components/wildfire/TourModeBanner";
import { TOUR_SUBSCRIPTIONS } from "@/data/tourMockData";

interface SubscriptionChannel {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  price: number;
  billing_cycle: string;
  max_subscribers: number | null;
  current_subscribers: number;
  category: string;
  cue_card_role: string | null;
  currency: string;
  stripe_price_id: string | null;
  active: boolean;
  created_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "teaching", label: "Teaching" },
  { value: "deals", label: "Deals & Finds" },
  { value: "photography", label: "Photography" },
  { value: "cooking", label: "Cooking" },
  { value: "fitness", label: "Fitness" },
  { value: "music", label: "Music" },
  { value: "crafts", label: "Crafts" },
  { value: "general", label: "General" },
];

const SORT_OPTIONS = [
  { value: "subscribers", label: "Most Subscribers" },
  { value: "newest", label: "Newest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];

const CURRENCY_OPTIONS = [
  { value: "marks", label: "Marks", icon: CircleDot, color: "text-amber-500" },
  { value: "credits", label: "Credits", icon: Coins, color: "text-emerald-500" },
  { value: "joules", label: "Joules", icon: Zap, color: "text-blue-500" },
  { value: "dollars", label: "Dollars", icon: DollarSign, color: "text-green-600" },
];

const CYCLE_LABELS: Record<string, string> = {
  weekly: "/week",
  monthly: "/month",
  per_session: "/session",
};

export default function SubscriptionChannelsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isTourMode } = useWildfireRun();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("subscribers");
  const [subscribeTarget, setSubscribeTarget] = useState<SubscriptionChannel | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("marks");

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ["subscription-channels", category, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("subscription_channels" as never)
        .select("*")
        .eq("active", true);

      if (category !== "all") {
        query = query.eq("category", category);
      }

      switch (sortBy) {
        case "subscribers":
          query = query.order("current_subscribers", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "price_low":
          query = query.order("price", { ascending: true });
          break;
        case "price_high":
          query = query.order("price", { ascending: false });
          break;
      }

      const { data, error } = query;
      if (error) throw error;
      return (data ?? []) as unknown as SubscriptionChannel[];
    },
  });

  const { data: mySubscriptions = [] } = useQuery({
    queryKey: ["my-channel-subscriptions"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("channel_subscriptions" as never)
        .select("channel_id, status")
        .eq("subscriber_id", user.id)
        .in("status", ["active", "paused"]);
      if (error) throw error;
      return (data ?? []) as { channel_id: string; status: string }[];
    },
    enabled: !!user,
  });

  const subscribedChannelIds = new Set(mySubscriptions.map((s) => s.channel_id));

  const subscribeMutation = useMutation({
    mutationFn: async ({ channelId, currency }: { channelId: string; currency: string }) => {
      const channel = channels.find((ch) => ch.id === channelId);

      if (currency === "dollars" && channel?.stripe_price_id) {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://ruuxzilgmuwddcofqecc.supabase.co"}/functions/v1/create-subscription-checkout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authSession?.access_token}`,
            },
            body: JSON.stringify({ channel_id: channelId }),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to start Stripe checkout");
        }
        const { checkout_url } = await res.json();
        window.location.href = checkout_url;
        return;
      }

      const { error } = await supabase
        .from("channel_subscriptions" as never)
        .insert({
          subscriber_id: user!.id,
          channel_id: channelId,
          currency,
          status: "active",
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-channels"] });
      queryClient.invalidateQueries({ queryKey: ["my-channel-subscriptions"] });
      toast({ title: "Subscribed!", description: "You're now subscribed to this channel." });
      setSubscribeTarget(null);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const filtered = channels.filter((ch) =>
    !search || ch.title.toLowerCase().includes(search.toLowerCase()) ||
    (ch.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PortalPageLayout
      title="Subscription Channels"
      subtitle="Subscribe to creators using Marks, Credits, Joules, or Dollars"
    >
      <TourModeBanner pageName="subscriptions" />

      {isTourMode && (
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200"><CardContent className="pt-4 pb-3 text-center"><Repeat className="w-6 h-6 mx-auto mb-1 text-amber-600" /><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Demo Channels</p></CardContent></Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200"><CardContent className="pt-4 pb-3 text-center"><Users className="w-6 h-6 mx-auto mb-1 text-emerald-600" /><p className="text-2xl font-bold">2,168</p><p className="text-xs text-muted-foreground">Demo Subscribers</p></CardContent></Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200"><CardContent className="pt-4 pb-3 text-center"><Sparkles className="w-6 h-6 mx-auto mb-1 text-blue-600" /><p className="text-2xl font-bold">3</p><p className="text-xs text-muted-foreground">Categories</p></CardContent></Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200"><CardContent className="pt-4 pb-3 text-center"><Star className="w-6 h-6 mx-auto mb-1 text-purple-600" /><p className="text-2xl font-bold">0</p><p className="text-xs text-muted-foreground">Your Subscriptions</p></CardContent></Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TOUR_SUBSCRIPTIONS.map((sub) => {
              const currencyIcon = sub.currency === "credits" ? Coins : sub.currency === "marks" ? CircleDot : Zap;
              const CurrIcon = currencyIcon;
              const currencyColor = sub.currency === "credits" ? "text-emerald-500" : sub.currency === "marks" ? "text-amber-500" : "text-blue-500";
              return (
                <Card key={sub.id} className="border-orange-200 dark:border-orange-800 hover:border-orange-300 transition-colors flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{sub.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{sub.description}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 capitalize">{sub.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-lg flex items-center gap-1">
                        <CurrIcon className={`w-4 h-4 ${currencyColor}`} />
                        {sub.price} <span className="text-xs text-muted-foreground font-normal">/{sub.billingCycle}</span>
                      </span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span className="text-xs">{sub.subscribers.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Next delivery: {sub.nextDelivery}</span>
                    </div>
                    <div className="p-2 rounded bg-muted/50 text-xs text-muted-foreground italic">
                      "{sub.preview}"
                    </div>
                    <Button
                      size="sm"
                      className="w-full gap-1 bg-orange-600 hover:bg-orange-700"
                      onClick={() => navigate("/membership")}
                    >
                      Join for $5/year to subscribe for real <ArrowRight className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      {!isTourMode && (<div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>)}

      {/* Stats Banner */}
      {!isTourMode && (<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Repeat className="w-6 h-6 mx-auto mb-1 text-amber-600" />
            <p className="text-2xl font-bold">{channels.length}</p>
            <p className="text-xs text-muted-foreground">Active Channels</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
            <p className="text-2xl font-bold">
              {channels.reduce((sum, ch) => sum + ch.current_subscribers, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <p className="text-2xl font-bold">{new Set(channels.map((c) => c.category)).size}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-4 pb-3 text-center">
            <Star className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <p className="text-2xl font-bold">{mySubscriptions.length}</p>
            <p className="text-xs text-muted-foreground">My Subscriptions</p>
          </CardContent>
        </Card>
      </div>)}

      {/* Channel Cards */}
      {!isTourMode && (isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading channels...</div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Repeat className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No subscription channels found.</p>
            {user && (
              <Button className="mt-4" onClick={() => navigate("/dashboard/helm")}>
                Create Your Own Channel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ch) => {
            const isSubscribed = subscribedChannelIds.has(ch.id);
            const isMine = user?.id === ch.creator_id;
            const isFull = ch.max_subscribers != null && ch.current_subscribers >= ch.max_subscribers;

            return (
              <Card
                key={ch.id}
                className="hover:border-primary/30 transition-colors flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{ch.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {ch.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0 capitalize">
                      {ch.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-lg">
                      {ch.price} <span className="text-xs text-muted-foreground font-normal">{CYCLE_LABELS[ch.billing_cycle] || ""}</span>
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {ch.current_subscribers}{ch.max_subscribers ? `/${ch.max_subscribers}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="capitalize">{ch.billing_cycle.replace("_", " ")} billing</span>
                    {ch.cue_card_role && (
                      <>
                        <span className="mx-1">·</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {ch.cue_card_role.replace("_", " ")}
                        </Badge>
                      </>
                    )}
                  </div>
                  {isMine ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Your Channel
                    </Button>
                  ) : isSubscribed ? (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      Subscribed
                    </Button>
                  ) : isFull ? (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                      Full
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full gap-1"
                      onClick={() => {
                        if (!user) {
                          navigate("/auth");
                          return;
                        }
                        setSubscribeTarget(ch);
                      }}
                    >
                      Subscribe <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}

      {/* Subscribe Dialog — Currency Selector */}
      <Dialog open={!!subscribeTarget} onOpenChange={() => setSubscribeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {subscribeTarget?.title}</DialogTitle>
            <DialogDescription>
              {subscribeTarget?.price} {CYCLE_LABELS[subscribeTarget?.billing_cycle ?? "monthly"]}
              {" — "}Choose your payment currency.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {subscribeTarget?.currency === "dollars" ? (
              <button
                className="flex items-center gap-2 p-3 rounded-lg border-2 border-primary bg-primary/5 col-span-2"
              >
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-sm">Dollars (via Stripe)</span>
              </button>
            ) : (
              CURRENCY_OPTIONS.map((cur) => {
                const Icon = cur.icon;
                const isSelected = selectedCurrency === cur.value;
                return (
                  <button
                    key={cur.value}
                    onClick={() => setSelectedCurrency(cur.value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${cur.color}`} />
                    <span className="font-medium text-sm">{cur.label}</span>
                  </button>
                );
              })
            )}
          </div>
          {selectedCurrency === "dollars" && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Dollar payments processed via Stripe. Standard processing fees apply.
              Creator receives 83.3% of the net amount after fees.
            </p>
          )}
          {selectedCurrency !== "dollars" && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
              Internal currency — zero processing fees. Creator receives 83.3% of the amount.
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubscribeTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!subscribeTarget) return;
                const effectiveCurrency = subscribeTarget.currency === "dollars" ? "dollars" : selectedCurrency;
                subscribeMutation.mutate({
                  channelId: subscribeTarget.id,
                  currency: effectiveCurrency,
                });
              }}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending
                ? "Processing..."
                : subscribeTarget?.currency === "dollars"
                  ? "Continue to Stripe"
                  : "Confirm Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
