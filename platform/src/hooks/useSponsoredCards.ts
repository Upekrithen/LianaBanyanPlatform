import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SponsoredCard {
  id: string;
  sponsor_id: string;
  card_type: 'physical' | 'digital' | 'both';
  preloaded_amount: number;
  include_membership: boolean;
  door_config_id: string | null;
  activation_code: string;
  activated: boolean;
  activated_by: string | null;
  activated_at: string | null;
  status: 'created' | 'distributed' | 'activated' | 'expired';
  created_at: string;
  expires_at: string | null;
}

function generateActivationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `LB-${code}`;
}

export function useMySponsoredCards() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['sponsored-cards', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('sponsored_cards' as never)
        .select('*')
        .eq('sponsor_id', user!.id)
        .order('created_at', { ascending: false }) as { data: SponsoredCard[] | null };
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateSponsoredCard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      card_type?: 'physical' | 'digital' | 'both';
      preloaded_amount?: number;
      include_membership?: boolean;
      door_config_id?: string | null;
      expires_at?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('sponsored_cards' as never)
        .insert({
          sponsor_id: user!.id,
          activation_code: generateActivationCode(),
          ...params,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as SponsoredCard;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sponsored-cards'] }),
  });
}

export function useActivateCard() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (activationCode: string) => {
      const { data: cards } = await supabase
        .from('sponsored_cards' as never)
        .select('*')
        .eq('activation_code', activationCode)
        .eq('activated', false) as { data: SponsoredCard[] | null };

      if (!cards || cards.length === 0) throw new Error('Invalid or already-used activation code');

      const card = cards[0];
      if (card.expires_at && new Date(card.expires_at) < new Date()) {
        throw new Error('This card has expired');
      }

      const { data, error } = await supabase
        .from('sponsored_cards' as never)
        .update({
          activated: true,
          activated_by: user!.id,
          activated_at: new Date().toISOString(),
          status: 'activated',
        } as never)
        .eq('id', card.id)
        .select()
        .single();

      if (error) throw error;

      // Create sponsorship attribution (ONE LEVEL ONLY)
      await supabase
        .from('sponsorship_attributions' as never)
        .insert({
          sponsor_id: card.sponsor_id,
          sponsored_user_id: user!.id,
          card_id: card.id,
          marks_earned_signup: 10,
        } as never);

      return data as unknown as SponsoredCard;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sponsored-cards'] });
    },
  });
}

export function useSponsorCardByCode(code: string | undefined) {
  return useQuery({
    queryKey: ['sponsor-card-lookup', code],
    queryFn: async () => {
      if (!code) return null;
      const { data } = await supabase
        .from('sponsored_cards' as never)
        .select('*')
        .eq('activation_code', code)
        .single() as { data: SponsoredCard | null };
      return data;
    },
    enabled: !!code,
  });
}
