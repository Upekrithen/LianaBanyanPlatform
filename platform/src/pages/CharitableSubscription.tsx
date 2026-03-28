/**
 * CharitableSubscription — /subscribe-to-feed on .org
 * Fund ongoing meal subscriptions for people in need via Mission ONE.
 */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Heart, UtensilsCrossed, Users, MapPin,
  Loader2, CheckCircle2, Pause, XCircle
} from "lucide-react";

const TIERS = [
  {
    count: 1,
    label: "1 Subscription",
    meals: 28,
    price: 150,
    desc: "Feed one person 28 meals per month from local restaurants.",
  },
  {
    count: 5,
    label: "5 Subscriptions",
    meals: 140,
    price: 700,
    desc: "140 meals per month of variety from 10+ restaurants.",
    popular: true,
  },
  {
    count: 10,
    label: "10 Subscriptions",
    meals: 280,
    price: 1300,
    desc: "Feed ten people. 280 meals monthly. Real impact for a neighborhood.",
  },
];

const AREA_CHOICES = [
  "Wherever Needed Most",
  "San Antonio, TX",
  "Austin, TX",
  "Houston, TX",
  "Dallas, TX",
];

interface SubRow {
  id: string;
  subscription_count: number;
  area_preference: string | null;
  monthly_amount_cents: number;
  meals_funded: number;
  status: string;
  created_at: string;
}

export default function CharitableSubscription() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedTier, setSelectedTier] = useState<typeof TIERS[number] | null>(null);
  const [area, setArea] = useState(AREA_CHOICES[0]);

  const { data: mySubs = [], isLoading } = useQuery({
    queryKey: ["my-charitable-subs", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("charitable_subscriptions" as never)
        .select("*")
        .order("created_at", { ascending: false }) as { data: SubRow[] | null; error: unknown };
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createSub = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedTier) throw new Error("Missing selection");
      const { error } = await supabase.from("charitable_subscriptions" as never).insert({
        sponsor_id: user.id,
        subscription_count: selectedTier.count,
        area_preference: area,
        monthly_amount_cents: selectedTier.price * 100,
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Charitable subscription created! Thank you.");
      setSelectedTier(null);
      qc.invalidateQueries({ queryKey: ["my-charitable-subs"] });
      qc.invalidateQueries({ queryKey: ["org-impact-stats"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeSubs = mySubs.filter((s) => s.status === "active");
  const totalMeals = mySubs.reduce((s, r) => s + r.meals_funded, 0);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Heart className="w-12 h-12 mx-auto text-rose-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in to Subscribe</h2>
        <p className="text-muted-foreground mb-4">
          Fund monthly meal subscriptions for people in need through Mission ONE.
        </p>
        <Button asChild>
          <a href="/auth">Sign In — $5/year</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-400" />
          Subscribe to Feed Someone
        </h1>
        <p className="text-muted-foreground mt-1">
          Fund ongoing monthly meal subscriptions. Same restaurants, same food, no stigma.
        </p>
      </div>

      {/* Impact Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{activeSubs.length}</p>
            <p className="text-xs text-muted-foreground">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-rose-400">{totalMeals.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Meals Funded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {activeSubs.reduce((s, r) => s + r.subscription_count, 0)}
            </p>
            <p className="text-xs text-muted-foreground">People Fed Monthly</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Selection */}
      <div>
        <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <Card
              key={tier.count}
              onClick={() => setSelectedTier(tier)}
              className={`cursor-pointer transition-all relative ${
                selectedTier?.count === tier.count
                  ? "ring-2 ring-rose-500 border-rose-500/40"
                  : "hover:border-zinc-600"
              }`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 right-3 bg-rose-500 text-white text-[10px]">
                  Most Popular
                </Badge>
              )}
              <CardContent className="p-6 text-center">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-rose-400 mb-3" />
                <h3 className="font-bold text-lg">{tier.label}</h3>
                <p className="text-3xl font-bold mt-2">${tier.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mt-2">{tier.meals} meals/month</p>
                <p className="text-xs text-zinc-500 mt-3">{tier.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Area Selection */}
      {selectedTier && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Where should we deploy?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {AREA_CHOICES.map((a) => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                    area === a
                      ? "bg-rose-500/20 border-rose-500 text-rose-400"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {a}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900/60 rounded-lg p-4 mb-4">
              <p className="text-sm">
                <strong>{selectedTier.label}</strong> — ${selectedTier.price}/month — {selectedTier.meals} meals
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Area: {area}
              </p>
            </div>

            <Button
              onClick={() => createSub.mutate()}
              disabled={createSub.isPending}
              className="bg-rose-600 hover:bg-rose-500 text-white w-full"
            >
              {createSub.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Start Feeding People — ${selectedTier.price}/mo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* My Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Your Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : mySubs.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                No subscriptions yet. Choose a plan above to start funding meals.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mySubs.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">
                      {s.subscription_count} subscription{s.subscription_count > 1 ? "s" : ""} — {s.area_preference || "Anywhere"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.meals_funded} meals funded since {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">${(s.monthly_amount_cents / 100).toFixed(0)}/mo</span>
                    <Badge
                      className={
                        s.status === "active"
                          ? "bg-green-600 text-white"
                          : s.status === "paused"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-zinc-700 text-zinc-400"
                      }
                    >
                      {s.status === "active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {s.status === "paused" && <Pause className="w-3 h-3 mr-1" />}
                      {s.status === "cancelled" && <XCircle className="w-3 h-3 mr-1" />}
                      {s.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
