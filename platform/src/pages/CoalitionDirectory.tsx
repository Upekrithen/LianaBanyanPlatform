import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Handshake, Search, Users, Plus, Percent, ArrowRight, Loader2 } from 'lucide-react';

interface Coalition {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  creator_id: string;
  min_members: number;
  current_members: number;
  discount_tier: number;
  treasury_credits: number;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'retail', label: 'Retail & Shopping' },
  { value: 'services', label: 'Services' },
  { value: 'makers', label: 'Makers & Manufacturing' },
  { value: 'tech', label: 'Technology' },
  { value: 'creative', label: 'Creative & Arts' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  forming: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  active: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  paused: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  dissolved: { bg: 'bg-red-500/20', text: 'text-red-400' },
};

function discountLabel(pct: number): string {
  if (pct >= 20) return '20% Max';
  if (pct >= 15) return '15%';
  if (pct >= 10) return '10%';
  if (pct >= 5) return '5%';
  return 'Forming';
}

function CoalitionCard({ coalition, onClick }: { coalition: Coalition; onClick: () => void }) {
  const sc = STATUS_COLORS[coalition.status] || STATUS_COLORS.forming;
  const progressPct = Math.min(100, (coalition.current_members / Math.max(coalition.min_members, 1)) * 100);

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1" onClick={onClick}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-lg leading-tight truncate group-hover:text-primary transition-colors">
              {coalition.name}
            </h3>
            {coalition.category && (
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{coalition.category}</p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Badge className={`${sc.bg} ${sc.text} border-0 capitalize`}>{coalition.status}</Badge>
            {coalition.discount_tier > 0 && (
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                <Percent className="w-3 h-3 mr-0.5" />{discountLabel(coalition.discount_tier)}
              </Badge>
            )}
          </div>
        </div>

        {coalition.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{coalition.description}</p>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              {coalition.current_members} / {coalition.min_members} members
            </span>
            {coalition.treasury_credits > 0 && (
              <span className="text-xs text-amber-400">{coalition.treasury_credits} credits</span>
            )}
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progressPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            Created {new Date(coalition.created_at).toLocaleDateString()}
          </span>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CoalitionDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const { data: coalitions = [], isLoading } = useQuery({
    queryKey: ['coalitions-directory', search, category],
    queryFn: async () => {
      let q = supabase
        .from('buying_coalitions' as never)
        .select('*')
        .neq('status', 'dissolved')
        .order('current_members', { ascending: false });

      if (search) q = q.ilike('name', `%${search}%`);
      if (category !== 'all') q = q.eq('category', category);

      const { data, error } = await q.limit(50) as { data: Coalition[] | null; error: unknown };
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userSub } = useQuery({
    queryKey: ['my-subscription-tier', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('platform_tier_subscriptions' as never)
        .select('tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle() as { data: { tier: string } | null };
      return data;
    },
    enabled: !!user,
  });

  const canCreate = userSub?.tier === 'builder';

  return (
    <PortalPageLayout title="Coalitions" description="Cooperative buying groups for volume discounts" backButton data-xray-id="coalition-directory">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5">
              <Handshake className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Coalition Directory</h2>
              <p className="text-sm text-muted-foreground">{coalitions.length} coalition{coalitions.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          <Button
            onClick={() => canCreate ? navigate('/coalitions/create') : navigate('/subscribe')}
            className={canCreate ? '' : 'opacity-80'}
          >
            <Plus className="w-4 h-4 mr-1" />
            {canCreate ? 'Create Coalition' : 'Builder Plan Required'}
          </Button>
        </div>

        {/* Discount Scale */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Coalition Discount Scale</h3>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              {[
                { range: '5-9 members', pct: '5%', color: 'text-slate-300' },
                { range: '10-24 members', pct: '10%', color: 'text-emerald-400' },
                { range: '25-49 members', pct: '15%', color: 'text-amber-400' },
                { range: '50+ members', pct: '20%', color: 'text-violet-400' },
              ].map((tier) => (
                <div key={tier.range}>
                  <p className={`text-lg font-bold ${tier.color}`}>{tier.pct}</p>
                  <p className="text-muted-foreground">{tier.range}</p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Discounts come from the platform margin (Cost+20%), not the creator's price. Creators always keep their full share.
            </p>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search coalitions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : coalitions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Handshake className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">No coalitions found</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                {search || category !== 'all' ? 'Try adjusting your filters.' : 'Be the first to start one!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coalitions.map(c => (
              <CoalitionCard key={c.id} coalition={c} onClick={() => navigate(`/coalitions/${c.slug}`)} />
            ))}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
