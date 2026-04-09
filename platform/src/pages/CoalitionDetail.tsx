import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Handshake, Users, Percent, Crown, UserPlus, LogOut,
  Loader2, Shield, BarChart3, Coins, Calendar,
} from 'lucide-react';

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

interface CoalitionMember {
  id: string;
  coalition_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  display_name?: string;
}

const DISCOUNT_TIERS = [
  { min: 5, max: 9, pct: 5, color: 'text-slate-300' },
  { min: 10, max: 24, pct: 10, color: 'text-emerald-400' },
  { min: 25, max: 49, pct: 15, color: 'text-amber-400' },
  { min: 50, max: Infinity, pct: 20, color: 'text-violet-400' },
];

function DiscountTierVisual({ currentMembers }: { currentMembers: number }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Discount Progress</h3>
      <div className="space-y-1.5">
        {DISCOUNT_TIERS.map((tier) => {
          const isActive = currentMembers >= tier.min;
          const isCurrent = currentMembers >= tier.min && (tier.max === Infinity || currentMembers <= tier.max);
          return (
            <div
              key={tier.pct}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                isCurrent ? 'bg-primary/10 ring-1 ring-primary/30' : isActive ? 'bg-muted/60' : 'bg-muted/20 opacity-50'
              }`}
            >
              <span>
                {tier.min}{tier.max === Infinity ? '+' : `-${tier.max}`} members
              </span>
              <Badge className={`${isActive ? tier.color : 'text-muted-foreground'} bg-transparent border-0 font-bold`}>
                {tier.pct}% off
                {isCurrent && <span className="ml-1 text-[10px] font-normal">(current)</span>}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CoalitionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coalition, isLoading } = useQuery({
    queryKey: ['coalition-detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buying_coalitions' as never)
        .select('*')
        .eq('slug', slug)
        .maybeSingle() as { data: Coalition | null; error: unknown };
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['coalition-members', coalition?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buying_coalition_members' as never)
        .select('*')
        .eq('coalition_id', coalition!.id)
        .order('joined_at', { ascending: true }) as { data: CoalitionMember[] | null; error: unknown };
      if (error) throw error;

      if (!data) return [];
      const enriched = await Promise.all(
        data.map(async (m) => {
          const { data: profile } = await supabase
            .from('member_profiles' as never)
            .select('display_name')
            .eq('user_id', m.user_id)
            .maybeSingle() as { data: { display_name: string } | null };
          return { ...m, display_name: profile?.display_name || 'Member' };
        })
      );
      return enriched;
    },
    enabled: !!coalition?.id,
  });

  const userMembership = members.find(m => m.user_id === user?.id);
  const isCreator = coalition?.creator_id === user?.id;

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !coalition) throw new Error('Sign in required');
      const { error } = await supabase
        .from('buying_coalition_members' as never)
        .insert({
          coalition_id: coalition.id,
          user_id: user.id,
          role: 'member',
        } as never) as { error: unknown };
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Joined!', description: `Welcome to ${coalition?.name}.` });
      queryClient.invalidateQueries({ queryKey: ['coalition-detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['coalition-members'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!userMembership) throw new Error('Not a member');
      const { error } = await supabase
        .from('buying_coalition_members' as never)
        .delete()
        .eq('id', userMembership.id) as { error: unknown };
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Left Coalition', description: 'You have left this coalition.' });
      queryClient.invalidateQueries({ queryKey: ['coalition-detail', slug] });
      queryClient.invalidateQueries({ queryKey: ['coalition-members'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <PortalPageLayout title="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </PortalPageLayout>
    );
  }

  if (!coalition) {
    return (
      <PortalPageLayout title="Coalition Not Found" backButton>
        <Card>
          <CardContent className="text-center py-16">
            <Handshake className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">This coalition doesn't exist.</p>
            <Button className="mt-4" onClick={() => navigate('/coalitions')}>Browse Coalitions</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  const statusColors: Record<string, string> = {
    forming: 'bg-amber-500/20 text-amber-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    paused: 'bg-slate-500/20 text-slate-400',
    dissolved: 'bg-red-500/20 text-red-400',
  };

  return (
    <PortalPageLayout title={coalition.name} backButton data-xray-id="coalition-detail">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${statusColors[coalition.status] || ''} border-0 capitalize`}>{coalition.status}</Badge>
              {coalition.category && <Badge variant="outline" className="capitalize">{coalition.category}</Badge>}
              {coalition.discount_tier > 0 && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
                  <Percent className="w-3 h-3 mr-0.5" />{coalition.discount_tier}% discount
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{coalition.name}</h1>
            {coalition.description && <p className="text-muted-foreground">{coalition.description}</p>}
          </div>

          <div className="flex gap-2 shrink-0">
            {user && !userMembership && (
              <Button onClick={() => joinMutation.mutate()} disabled={joinMutation.isPending}>
                {joinMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                Join Coalition
              </Button>
            )}
            {userMembership && !isCreator && (
              <Button variant="outline" onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}>
                {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LogOut className="w-4 h-4 mr-1" />}
                Leave
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Members', value: `${coalition.current_members}`, sub: `of ${coalition.min_members} min` },
            { icon: Percent, label: 'Discount', value: `${coalition.discount_tier}%`, sub: 'from platform margin' },
            { icon: Coins, label: 'Treasury', value: `${coalition.treasury_credits}`, sub: 'credits' },
            { icon: Calendar, label: 'Created', value: new Date(coalition.created_at).toLocaleDateString(), sub: '' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <stat.icon className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                {stat.sub && <p className="text-[10px] text-muted-foreground/60">{stat.sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Discount Progress */}
          <Card>
            <CardContent className="p-5">
              <DiscountTierVisual currentMembers={coalition.current_members} />
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No members yet.</p>
              ) : (
                members.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {(m.display_name || 'M')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.display_name}</p>
                        <p className="text-[11px] text-muted-foreground capitalize">{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {m.role === 'founder' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      {m.role === 'officer' && <Shield className="w-3.5 h-3.5 text-blue-400" />}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(m.joined_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed Placeholder */}
        <Card className="bg-muted/20">
          <CardContent className="p-5 text-center">
            <BarChart3 className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground/60">Member joins, treasury changes, and milestone events will appear here.</p>
          </CardContent>
        </Card>

        {/* Economics Explainer */}
        <Card className="bg-muted/30">
          <CardContent className="p-5 space-y-2">
            <h3 className="text-sm font-medium">How Coalition Discounts Work</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Coalition discounts are calculated from the platform's Cost+20% margin, <strong className="text-foreground">not</strong> from the creator's price.</p>
              <p>Creators always receive their full listed price. The platform absorbs the discount to incentivize cooperative buying.</p>
              <p>As more members join, the coalition unlocks deeper discounts — up to a 20% cap at 50+ members.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
