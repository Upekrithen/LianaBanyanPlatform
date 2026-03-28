import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface BrandBounty {
  id: string;
  requester_id: string;
  bounty_type: 'logo' | 'domain_email' | 'designed_card' | 'other';
  rush_tier: number;
  price_marks: number;
  paid_in_credits: boolean;
  brief: Record<string, unknown>;
  designer_id: string | null;
  claimed_at: string | null;
  deliverable_url: string | null;
  delivered_at: string | null;
  approved: boolean | null;
  approved_at: string | null;
  status: 'open' | 'claimed' | 'in_progress' | 'delivered' | 'approved' | 'disputed' | 'cancelled';
  deadline: string;
  created_at: string;
}

export const RUSH_TIERS = [
  { tier: 1, label: 'Today', hours: '4-8hr', color: 'bg-red-600' },
  { tier: 2, label: 'Tomorrow', hours: '24hr', color: 'bg-orange-500' },
  { tier: 3, label: '3 Days', hours: '72hr', color: 'bg-yellow-500' },
  { tier: 4, label: '1 Week', hours: '7 days', color: 'bg-blue-500' },
  { tier: 5, label: '2 Weeks', hours: '14 days', color: 'bg-green-500' },
  { tier: 6, label: 'Whenever', hours: 'No rush', color: 'bg-gray-500' },
] as const;

export const BOUNTY_PRICING: Record<string, Record<number, number>> = {
  logo:          { 1: 200, 2: 150, 3: 100, 4: 60, 5: 40, 6: 30 },
  domain_email:  { 1: 100, 2: 80,  3: 60,  4: 40, 5: 30, 6: 20 },
  designed_card: { 1: 80,  2: 60,  3: 40,  4: 30, 5: 20, 6: 15 },
};

function deadlineFromTier(tier: number): string {
  const now = new Date();
  const offsets: Record<number, number> = {
    1: 8 * 60 * 60 * 1000,
    2: 24 * 60 * 60 * 1000,
    3: 3 * 24 * 60 * 60 * 1000,
    4: 7 * 24 * 60 * 60 * 1000,
    5: 14 * 24 * 60 * 60 * 1000,
    6: 90 * 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + (offsets[tier] || offsets[6])).toISOString();
}

export function useOpenBounties() {
  return useQuery({
    queryKey: ['brand-bounties-open'],
    queryFn: async () => {
      const { data } = await supabase
        .from('brand_bounties' as never)
        .select('*')
        .in('status', ['open'])
        .order('rush_tier', { ascending: true }) as { data: BrandBounty[] | null };
      return data || [];
    },
    staleTime: 30_000,
  });
}

export function useMyBounties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-bounties', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('brand_bounties' as never)
        .select('*')
        .or(`requester_id.eq.${user!.id},designer_id.eq.${user!.id}`)
        .order('created_at', { ascending: false }) as { data: BrandBounty[] | null };
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateBounty() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      bounty_type: 'logo' | 'domain_email' | 'designed_card' | 'other';
      rush_tier: number;
      paid_in_credits?: boolean;
      brief?: Record<string, unknown>;
    }) => {
      const price = BOUNTY_PRICING[params.bounty_type]?.[params.rush_tier] || 30;
      const { data, error } = await supabase
        .from('brand_bounties' as never)
        .insert({
          requester_id: user!.id,
          bounty_type: params.bounty_type,
          rush_tier: params.rush_tier,
          price_marks: price,
          paid_in_credits: params.paid_in_credits || false,
          brief: params.brief || {},
          deadline: deadlineFromTier(params.rush_tier),
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BrandBounty;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brand-bounties-open'] });
      qc.invalidateQueries({ queryKey: ['my-bounties'] });
    },
  });
}

export function useClaimBounty() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (bountyId: string) => {
      const { data, error } = await supabase
        .from('brand_bounties' as never)
        .update({
          designer_id: user!.id,
          claimed_at: new Date().toISOString(),
          status: 'claimed',
        } as never)
        .eq('id', bountyId)
        .eq('status', 'open')
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BrandBounty;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['brand-bounties-open'] });
      qc.invalidateQueries({ queryKey: ['my-bounties'] });
    },
  });
}

export function useDeliverBounty() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: { bountyId: string; deliverable_url: string }) => {
      const { data, error } = await supabase
        .from('brand_bounties' as never)
        .update({
          deliverable_url: params.deliverable_url,
          delivered_at: new Date().toISOString(),
          status: 'delivered',
        } as never)
        .eq('id', params.bountyId)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as BrandBounty;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-bounties'] }),
  });
}
