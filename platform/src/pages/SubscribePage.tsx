import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Check, X, Crown, Rocket, Eye, Users, Zap, Ghost,
  ShoppingBag, Wrench, BarChart3, Loader2, ArrowRight,
} from 'lucide-react';

type Tier = 'explorer' | 'member' | 'builder';

interface TierConfig {
  id: Tier;
  name: string;
  price: string;
  priceNote: string;
  icon: typeof Eye;
  gradient: string;
  badge: string;
  features: { text: string; included: boolean }[];
  cta: string;
}

const TIERS: TierConfig[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    price: 'Free',
    priceNote: 'No credit card needed',
    icon: Eye,
    gradient: 'from-slate-600 to-slate-800',
    badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    features: [
      { text: 'Browse the full marketplace', included: true },
      { text: 'View all products & makers', included: true },
      { text: 'Basic member profile', included: true },
      { text: 'WildFire Tour access', included: true },
      { text: 'List products for sale', included: false },
      { text: 'Join coalitions', included: false },
      { text: 'Earn Credits', included: false },
      { text: 'Crew Tables access', included: false },
      { text: 'Demand signaling (Ghost Credits)', included: false },
      { text: 'Priority production queue', included: false },
      { text: 'Marks eligibility', included: false },
      { text: 'Coalition creation', included: false },
      { text: 'Maker Dashboard access', included: false },
    ],
    cta: 'Current Plan',
  },
  {
    id: 'member',
    name: 'Member',
    price: '$10',
    priceNote: 'per month',
    icon: Users,
    gradient: 'from-emerald-600 to-emerald-800',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    features: [
      { text: 'Browse the full marketplace', included: true },
      { text: 'View all products & makers', included: true },
      { text: 'Basic member profile', included: true },
      { text: 'WildFire Tour access', included: true },
      { text: 'List products for sale', included: true },
      { text: 'Join coalitions', included: true },
      { text: 'Earn Credits', included: true },
      { text: 'Crew Tables access', included: true },
      { text: 'Demand signaling (Ghost Credits)', included: true },
      { text: 'Priority production queue', included: false },
      { text: 'Marks eligibility', included: false },
      { text: 'Coalition creation', included: false },
      { text: 'Maker Dashboard access', included: false },
    ],
    cta: 'Upgrade to Member',
  },
  {
    id: 'builder',
    name: 'Builder',
    price: '$25',
    priceNote: 'per month',
    icon: Rocket,
    gradient: 'from-amber-600 to-amber-800',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    features: [
      { text: 'Browse the full marketplace', included: true },
      { text: 'View all products & makers', included: true },
      { text: 'Basic member profile', included: true },
      { text: 'WildFire Tour access', included: true },
      { text: 'List products for sale', included: true },
      { text: 'Join coalitions', included: true },
      { text: 'Earn Credits', included: true },
      { text: 'Crew Tables access', included: true },
      { text: 'Demand signaling (Ghost Credits)', included: true },
      { text: 'Priority production queue', included: true },
      { text: 'Marks eligibility', included: true },
      { text: 'Coalition creation', included: true },
      { text: 'Maker Dashboard access', included: true },
    ],
    cta: 'Upgrade to Builder',
  },
];

const TIER_ORDER: Record<Tier, number> = { explorer: 0, member: 1, builder: 2 };

function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {included ? (
        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
      )}
      <span className={included ? 'text-slate-700' : 'text-slate-400'}>{text}</span>
    </li>
  );
}

export default function SubscribePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentSub, isLoading } = useQuery({
    queryKey: ['my-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('platform_tier_subscriptions' as never)
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle() as { data: { id: string; tier: Tier; status: string } | null };
      return data;
    },
    enabled: !!user,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tier: Tier) => {
      if (!user) throw new Error('Sign in required');
      if (currentSub) {
        const { error } = await supabase
          .from('platform_tier_subscriptions' as never)
          .update({ tier, updated_at: new Date().toISOString() } as never)
          .eq('id', currentSub.id) as { error: unknown };
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_tier_subscriptions' as never)
          .insert({
            user_id: user.id,
            tier,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
          } as never) as { error: unknown };
        if (error) throw error;
      }
      if (tier !== 'explorer') {
        let token: string | null = null;
        try {
          const raw = localStorage.getItem("sb-ruuxzilgmuwddcofqecc-auth-token");
          if (raw) token = JSON.parse(raw)?.access_token ?? null;
        } catch { /* parse failed */ }
        if (token) {
          const url = `https://ruuxzilgmuwddcofqecc.supabase.co/functions/v1/create-membership-checkout?token=${encodeURIComponent(token)}&tier=${tier}`;
          window.open(url, "_self");
          return;
        }
      }
    },
    onSuccess: (_, tier) => {
      toast({ title: 'Plan Updated!', description: `You're now on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan.` });
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const currentTier: Tier = currentSub?.tier || 'explorer';

  return (
    <PortalPageLayout title="Choose Your Plan" backButton data-xray-id="subscribe-page">
      <div className="space-y-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="bg-amber-500/20 text-amber-900 border-amber-500/40 mb-3">
            <Crown className="w-3 h-3 mr-1" /> Membership Tiers
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Unlock the Cooperative Economy</h1>
          <p className="text-muted-foreground">
            Every tier gives you more tools to participate, create, and benefit from the cooperative marketplace.
            Creator keeps 83.3% — always.
          </p>
        </div>

        {/* Tier Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const isUpgrade = TIER_ORDER[tier.id] > TIER_ORDER[currentTier];
            const isDowngrade = TIER_ORDER[tier.id] < TIER_ORDER[currentTier];
            const TierIcon = tier.icon;

            return (
              <Card
                key={tier.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  isCurrent ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:shadow-md'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center text-xs py-1 font-medium">
                    Current Plan
                  </div>
                )}
                <div className={`bg-gradient-to-br ${tier.gradient} p-6 ${isCurrent ? 'pt-8' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <TierIcon className="w-6 h-6 text-white/90" />
                    <Badge className={tier.badge}>{tier.name}</Badge>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    {tier.priceNote !== 'No credit card needed' && (
                      <span className="text-white/60 text-sm">/{tier.priceNote.replace('per ', '')}</span>
                    )}
                  </div>
                  <p className="text-white/50 text-xs mt-1">{tier.priceNote}</p>
                </div>
                <CardContent className="p-5">
                  <ul className="space-y-2.5 mb-6">
                    {tier.features.map((f, i) => (
                      <FeatureRow key={i} text={f.text} included={f.included} />
                    ))}
                  </ul>
                  {!user ? (
                    <Button className="w-full" onClick={() => navigate('/auth')}>
                      Sign In to Subscribe
                    </Button>
                  ) : isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      <Check className="w-4 h-4 mr-1" /> Your Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={isUpgrade ? 'default' : 'outline'}
                      onClick={() => subscribeMutation.mutate(tier.id)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : isUpgrade ? (
                        <ArrowRight className="w-4 h-4 mr-1" />
                      ) : null}
                      {isUpgrade ? `Upgrade to ${tier.name}` : isDowngrade ? `Switch to ${tier.name}` : tier.cta}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Grid */}
        <div>
          <h2 className="text-xl font-semibold text-center mb-6">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                  {TIERS.map(t => (
                    <th key={t.id} className="text-center py-3 px-4 font-medium">
                      <Badge className={t.badge}>{t.name}</Badge>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIERS[0].features.map((f, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-2.5 px-4 text-slate-600">{f.text}</td>
                    {TIERS.map(t => (
                      <td key={t.id} className="text-center py-2.5 px-4">
                        {t.features[idx].included ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Economic Explainer */}
        <Card className="bg-muted/30 border-border">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              How the Cooperative Economy Works
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p className="text-slate-200 font-medium">Creator Keeps 83.3%</p>
                <p>On every transaction, the creator or worker keeps $416.67 out of every $500. Always.</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-200 font-medium">Cost + 20% Margin</p>
                <p>Platform pricing is always Cost + 20%. Coalition discounts come from the platform margin, not the creator's share.</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-200 font-medium">Coalitions Amplify Savings</p>
                <p>Join a coalition to unlock 5-20% discounts. The more members, the deeper the discount — all absorbed by the platform.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Callout */}
        <div className="text-center pb-4">
          <p className="text-muted-foreground text-sm">
            Your plan selection is recorded immediately. Paid tiers are processed securely via Stripe.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
