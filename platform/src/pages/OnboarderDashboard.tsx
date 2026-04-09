import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Store, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingCredit {
  id: string;
  storefront_id: string;
  qualification_date: string | null;
  credit_percentage: number;
  is_qualified: boolean;
  orders_count: number;
  first_order_date: string | null;
  is_active: boolean;
  paused_reason: string | null;
  created_at: string;
}

interface StewardAgreement {
  id: string;
  storefront_id: string;
  management_fee_percentage: number;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface StorefrontInfo {
  id: string;
  name: string;
  slug: string;
  category: string;
  business_location: string | null;
  is_open: boolean;
}

interface OrderStats {
  storefront_id: string;
  revenue: number;
  order_count: number;
}

export default function OnboarderDashboard() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<OnboardingCredit[]>([]);
  const [agreements, setAgreements] = useState<StewardAgreement[]>([]);
  const [storefronts, setStorefronts] = useState<Map<string, StorefrontInfo>>(new Map());
  const [orderStats, setOrderStats] = useState<Map<string, OrderStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedCredit, setExpandedCredit] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch onboarding credits
      const { data: creds } = await supabase
        .from('onboarding_credits' as never)
        .select('*')
        .eq('onboarder_id', user.id) as { data: OnboardingCredit[] | null };

      const myCreds = creds || [];
      setCredits(myCreds);

      // Fetch steward agreements
      const { data: agrs } = await supabase
        .from('steward_agreements' as never)
        .select('*')
        .eq('steward_id', user.id)
        .eq('is_active', true) as { data: StewardAgreement[] | null };

      setAgreements(agrs || []);

      // Fetch storefront info for all referenced storefronts
      const sfIds = [...new Set([
        ...myCreds.map(c => c.storefront_id),
        ...(agrs || []).map(a => a.storefront_id),
      ])];

      if (sfIds.length > 0) {
        const { data: sfs } = await supabase
          .from('storefronts' as never)
          .select('id, name, slug, category, business_location, is_open')
          .in('id', sfIds) as { data: StorefrontInfo[] | null };

        const sfMap = new Map<string, StorefrontInfo>();
        for (const sf of sfs || []) sfMap.set(sf.id, sf);
        setStorefronts(sfMap);

        // Fetch this month's order stats per storefront
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        const { data: orders } = await supabase
          .from('menu_orders' as never)
          .select('storefront_id, total')
          .in('storefront_id', sfIds)
          .eq('stripe_payment_status', 'paid')
          .gte('delivery_date', monthStartStr) as { data: { storefront_id: string; total: number }[] | null };

        const statsMap = new Map<string, OrderStats>();
        for (const order of orders || []) {
          const existing = statsMap.get(order.storefront_id);
          if (existing) {
            existing.revenue += order.total;
            existing.order_count += 1;
          } else {
            statsMap.set(order.storefront_id, {
              storefront_id: order.storefront_id,
              revenue: order.total,
              order_count: 1,
            });
          }
        }
        setOrderStats(statsMap);
      }

      setLoading(false);
    })();
  }, [user]);

  const qualifiedCredits = useMemo(() => credits.filter(c => c.is_qualified && c.is_active), [credits]);
  const pendingCredits = useMemo(() => credits.filter(c => !c.is_qualified), [credits]);

  const totalMonthlyRevenue = useMemo(() => {
    let total = 0;
    for (const credit of qualifiedCredits) {
      const stats = orderStats.get(credit.storefront_id);
      if (stats) total += stats.revenue;
    }
    return total;
  }, [qualifiedCredits, orderStats]);

  const totalOnboardingIncome = useMemo(() => {
    let total = 0;
    for (const credit of qualifiedCredits) {
      const stats = orderStats.get(credit.storefront_id);
      if (stats) total += stats.revenue * (credit.credit_percentage / 100);
    }
    return total;
  }, [qualifiedCredits, orderStats]);

  const totalStewardIncome = useMemo(() => {
    let total = 0;
    for (const agr of agreements) {
      const stats = orderStats.get(agr.storefront_id);
      if (stats) total += stats.revenue * (agr.management_fee_percentage / 100);
    }
    return total;
  }, [agreements, orderStats]);

  const totalAllocationAuthority = totalOnboardingIncome + totalStewardIncome;

  if (loading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="onboarder-dashboard">
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-muted-foreground">Loading earnings & allocation authority...</div>
        </div>
      </PortalPageLayout>
    );
  }

  if (credits.length === 0 && agreements.length === 0) {
    return (
      <PortalPageLayout variant="stage" maxWidth="lg" xrayId="onboarder-dashboard">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>
        <div className="text-center py-16">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <h1 className="text-2xl font-bold mb-2">No Onboarding Credits Yet</h1>
          <p className="text-muted-foreground mb-2 max-w-md mx-auto">
            Onboard local businesses onto Liana Banyan to earn allocation authority through Backed Marks from the platform's share — forever.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Qualify by creating a storefront and generating 10 paid orders within 30 days.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/treasure-maps">
              <Button variant="outline" className="border-slate-600">View Treasure Maps</Button>
            </Link>
            <Link to="/tools/storefront-builder">
              <Button className="bg-amber-600 hover:bg-amber-700">Onboard a Business</Button>
            </Link>
          </div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="onboarder-dashboard">
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold" data-xray-id="onboarder-dash-title">Earnings & Allocation Authority</h1>
        <p className="text-muted-foreground mt-1">Your direct earnings and allocation authority</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-emerald-950/30 border-emerald-800/50">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-emerald-500 uppercase tracking-wider">Allocation Authority</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">${totalAllocationAuthority.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Onboarding Credits</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">${totalOnboardingIncome.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{qualifiedCredits.length} qualified</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Steward Fees</p>
            <p className="text-3xl font-bold text-purple-400 mt-1">${totalStewardIncome.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">{agreements.length} active</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Business Revenue</p>
            <p className="text-3xl font-bold text-slate-300 mt-1">${totalMonthlyRevenue.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">through your businesses</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works callout */}
      <Card className="bg-card/30 border-border/50 mb-8">
        <CardContent className="py-4 px-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-amber-400">How it works:</span> You earn delivery fees directly. Onboarding businesses generates Backed Marks — {' '}
            <span className="text-emerald-400 font-bold">3%</span> of the platform's 13.3% share becomes your allocation authority, not cash. The business pays exactly the same. Backed Marks give you governance influence in the cooperative. Qualify with 10 paid orders + 30 active days.
          </p>
        </CardContent>
      </Card>

      {/* Qualified credits */}
      {qualifiedCredits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-emerald-300 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" /> Qualified Credits ({qualifiedCredits.length})
          </h2>
          <div className="space-y-3">
            {qualifiedCredits.map(credit => {
              const sf = storefronts.get(credit.storefront_id);
              const stats = orderStats.get(credit.storefront_id);
              const monthlyRev = stats?.revenue || 0;
              const creditEarned = monthlyRev * (credit.credit_percentage / 100);
              const agreement = agreements.find(a => a.storefront_id === credit.storefront_id);
              const stewardEarned = agreement ? monthlyRev * (agreement.management_fee_percentage / 100) : 0;
              const isExpanded = expandedCredit === credit.id;

              return (
                <Card key={credit.id} className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedCredit(isExpanded ? null : credit.id)}>
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="font-medium">{sf?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{sf?.business_location || sf?.category || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">This month</p>
                          <p className="font-bold text-emerald-400">${(creditEarned + stewardEarned).toFixed(2)}</p>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Business revenue (this month)</span>
                          <span className="text-slate-300">${monthlyRev.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Onboarding credit ({credit.credit_percentage}%)</span>
                          <span className="text-amber-400 font-medium">${creditEarned.toFixed(2)}</span>
                        </div>
                        {agreement && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Steward fee ({agreement.management_fee_percentage}%)</span>
                            <span className="text-purple-400 font-medium">${stewardEarned.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-border">
                          <span className="text-slate-300 font-medium">Total direct earnings</span>
                          <span className="text-emerald-400 font-bold">${(creditEarned + stewardEarned).toFixed(2)}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                          <span>Qualified: {credit.qualification_date || 'N/A'}</span>
                          <span>Orders: {stats?.order_count || 0} this month</span>
                          {sf?.slug && (
                            <Link to={`/menu/${sf.slug}`} className="text-amber-400 hover:underline">View menu →</Link>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending credits */}
      {pendingCredits.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" /> Qualifying ({pendingCredits.length})
          </h2>
          <div className="space-y-3">
            {pendingCredits.map(credit => {
              const sf = storefronts.get(credit.storefront_id);
              const ordersNeeded = Math.max(0, 10 - credit.orders_count);
              let daysNeeded = 0;
              if (credit.first_order_date) {
                const daysSince = Math.floor((Date.now() - new Date(credit.first_order_date).getTime()) / 86400000);
                daysNeeded = Math.max(0, 30 - daysSince);
              }
              const progress = Math.min(100, (credit.orders_count / 10) * 100);

              return (
                <Card key={credit.id} className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 text-yellow-400" />
                        <div>
                          <p className="font-medium">{sf?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{sf?.business_location || ''}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                        {ordersNeeded > 0 ? `${ordersNeeded} orders to go` : `${daysNeeded} days to go`}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{credit.orders_count}/10 paid orders</span>
                      {credit.first_order_date && <span>{daysNeeded > 0 ? `${30 - daysNeeded}/30 days` : '30/30 days ✓'}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Allocation authority explainer — between onboarding credits and steward agreements */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-emerald-300 mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Your Allocation Authority
        </h2>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Backed Marks earned from businesses you've onboarded. These represent your governance influence — the more businesses you bring to the cooperative, the more weight your voice carries.
        </p>
      </div>

      {/* Active steward agreements */}
      {agreements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Steward Agreements ({agreements.length})
          </h2>
          <div className="space-y-2">
            {agreements.map(agr => {
              const sf = storefronts.get(agr.storefront_id);
              const stats = orderStats.get(agr.storefront_id);
              const monthlyFee = (stats?.revenue || 0) * (agr.management_fee_percentage / 100);
              return (
                <Card key={agr.id} className="bg-card/50 border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sf?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{agr.management_fee_percentage}% management fee · Since {agr.start_date}</p>
                    </div>
                    <p className="font-bold text-purple-400">${monthlyFee.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="bg-card/30 border-border/50">
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground mb-4">Onboard more businesses to grow your allocation authority.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/treasure-maps">
              <Button variant="outline" className="border-slate-600">Browse Treasure Maps</Button>
            </Link>
            <Link to="/tools/storefront-builder">
              <Button className="bg-amber-600 hover:bg-amber-700">Onboard a Business</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-slate-600 text-center mt-6">
        Income shown represents direct service compensation. Backed Marks represent cooperative governance authority, not speculative returns.
        Actual earnings may vary. This is not a speculative instrument.
      </p>
    </PortalPageLayout>
  );
}
