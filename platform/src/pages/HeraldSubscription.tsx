/**
 * HERALD SUBSCRIPTION PAGE
 * ========================
 * "Don't Break the Chain" subscription management.
 * Members choose a tier, track their chain, and manage posts.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Megaphone,
  Volume2,
  Link2,
  Snowflake,
  Trophy,
  Zap,
  Check,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  HERALD_TIERS,
  type HeraldTier,
  type HeraldTierConfig,
  calculateMultiplier,
  subscribeHerald,
  getHeraldSubscription,
  freezeChain,
  getCurrentMonth,
} from "@/lib/heraldSystem";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const TIER_ICONS: Record<HeraldTier, React.ElementType> = {
  torch_bearer: Flame,
  herald: Megaphone,
  town_crier: Volume2,
};

const TIER_COLORS: Record<HeraldTier, string> = {
  torch_bearer: "from-orange-500/10 to-amber-500/10 border-orange-500/20",
  herald: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  town_crier: "from-purple-500/10 to-pink-500/10 border-purple-500/20",
};

export default function HeraldSubscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [user]);

  const loadSubscription = async () => {
    if (!user) return;
    const sub = await getHeraldSubscription();
    setSubscription(sub);
    setIsLoading(false);
  };

  const handleSubscribe = async (tier: HeraldTier) => {
    setSubscribing(true);
    const result = await subscribeHerald(tier);
    if (result.success) {
      toast.success(`Subscribed as ${HERALD_TIERS.find(t => t.id === tier)?.name}!`);
      await loadSubscription();
    } else {
      toast.error(result.error || "Subscription failed");
    }
    setSubscribing(false);
  };

  const handleFreeze = async () => {
    const result = await freezeChain();
    if (result.success) {
      toast.success("Chain frozen for this month ($5). Your streak is preserved.");
      await loadSubscription();
    } else {
      toast.error("Failed to freeze chain");
    }
  };

  if (isLoading) {
    return (
      <PortalPageLayout>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Herald Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't Break the Chain. Post monthly. Grow your Joule multiplier.
            The longer your streak, the more you earn on everything.
          </p>
        </div>

        {/* Active subscription dashboard */}
        {subscription && subscription.status !== "cancelled" && (
          <div className="mb-12">
            <Card className={`border-2 bg-gradient-to-br ${TIER_COLORS[subscription.tier as HeraldTier]}`}>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Chain status */}
                  <div className="text-center">
                    <div className="text-6xl mb-2">
                      {HERALD_TIERS.find(t => t.id === subscription.tier)?.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      {HERALD_TIERS.find(t => t.id === subscription.tier)?.name}
                    </h3>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Link2 className="w-5 h-5 text-primary" />
                      <span className="text-3xl font-bold text-primary">
                        {subscription.chain_length}
                      </span>
                      <span className="text-muted-foreground">month chain</span>
                    </div>
                    {subscription.chain_frozen && (
                      <Badge className="mt-2 bg-blue-500/10 text-blue-500 border-blue-500/20">
                        <Snowflake className="w-3 h-3 mr-1" />
                        Frozen this month
                      </Badge>
                    )}
                  </div>

                  {/* Multiplier */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Current Multiplier</p>
                    <div className="text-5xl font-bold text-primary">
                      {calculateMultiplier(subscription.tier, subscription.chain_length).toFixed(2)}x
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Max: {subscription.max_multiplier}x
                    </p>
                    <Progress
                      value={
                        ((calculateMultiplier(subscription.tier, subscription.chain_length) -
                          HERALD_TIERS.find(t => t.id === subscription.tier)!.baseMultiplier) /
                          (subscription.max_multiplier -
                            HERALD_TIERS.find(t => t.id === subscription.tier)!.baseMultiplier)) *
                        100
                      }
                      className="mt-3 h-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      +{HERALD_TIERS.find(t => t.id === subscription.tier)?.chainBonusPerMonth}x per month
                    </p>
                  </div>

                  {/* Posts this month */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Posts This Month</p>
                    <div className="text-5xl font-bold text-foreground">
                      {subscription.posts_this_month}
                      <span className="text-2xl text-muted-foreground">
                        /{subscription.required_posts_per_month}
                      </span>
                    </div>
                    <Progress
                      value={(subscription.posts_this_month / subscription.required_posts_per_month) * 100}
                      className="mt-3 h-2"
                    />
                    {subscription.posts_this_month >= subscription.required_posts_per_month ? (
                      <Badge className="mt-2 bg-green-500/10 text-green-500 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" />
                        Requirement met!
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        {subscription.required_posts_per_month - subscription.posts_this_month} more needed
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center mt-8">
                  <Button
                    onClick={() => navigate("/hofund")}
                    className="gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Open Hofund Studio
                  </Button>
                  {!subscription.chain_frozen && subscription.posts_this_month < subscription.required_posts_per_month && (
                    <Button variant="outline" onClick={handleFreeze} className="gap-2">
                      <Snowflake className="w-4 h-4" />
                      Freeze Chain ($5)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tier selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {HERALD_TIERS.map((tier) => {
            const Icon = TIER_ICONS[tier.id];
            const isCurrentTier = subscription?.tier === tier.id && subscription?.status !== "cancelled";
            const color = TIER_COLORS[tier.id];

            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] ${
                  isCurrentTier ? color : "border-border hover:border-primary/20"
                }`}
              >
                {isCurrentTier && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-primary">Current</Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">{tier.icon}</div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {tier.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts/month</span>
                      <span className="font-medium">{tier.postsPerMonth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base multiplier</span>
                      <span className="font-medium">{tier.baseMultiplier}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chain bonus/mo</span>
                      <span className="font-medium">+{tier.chainBonusPerMonth}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max multiplier</span>
                      <span className="font-bold text-primary">{tier.maxMultiplier}x</span>
                    </div>
                  </div>

                  {/* Example chain projection */}
                  <div className="p-3 rounded-lg bg-muted/50 text-xs space-y-1">
                    <p className="font-medium text-foreground">After 6 months:</p>
                    <p className="text-muted-foreground">
                      Multiplier: {calculateMultiplier(tier.id, 6).toFixed(2)}x on all Joule earnings
                    </p>
                    <p className="font-medium text-foreground mt-2">After 12 months:</p>
                    <p className="text-muted-foreground">
                      Multiplier: {calculateMultiplier(tier.id, 12).toFixed(2)}x on all Joule earnings
                    </p>
                  </div>

                  <Button
                    className="w-full gap-2"
                    variant={isCurrentTier ? "outline" : "default"}
                    disabled={isCurrentTier || subscribing}
                    onClick={() => handleSubscribe(tier.id)}
                  >
                    {isCurrentTier ? (
                      <>
                        <Check className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-6">How the Chain Works</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Subscribe</h4>
              <p className="text-xs text-muted-foreground">Pick your tier. Chain starts at 0.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Post Monthly</h4>
              <p className="text-xs text-muted-foreground">Hit your post count. Use Hofund Studio.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Grow Chain</h4>
              <p className="text-xs text-muted-foreground">Each month adds to your multiplier.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-medium text-foreground mb-1">Earn More</h4>
              <p className="text-xs text-muted-foreground">Multiplier applies to ALL Joule earnings.</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-6 max-w-xl mx-auto">
            Miss a month? Chain breaks and multiplier resets to base. Or pay $5 to freeze
            your chain for one month without posting. Your streak is preserved.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
