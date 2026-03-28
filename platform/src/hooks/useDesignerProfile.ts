import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DesignerProfile {
  id: string;
  user_id: string;
  services: string[];
  tier_availability: number[];
  weekly_capacity: number;
  pricing_tier: 'c20' | 'c40' | 'c60' | 'c90' | 'retail';
  completed_bounties: number;
  tryout_completed: boolean;
  xp_rating: number;
  avg_quality: number;
  on_time_rate: number;
  created_at: string;
}

export const PRICING_TIERS = [
  { id: 'c20', label: 'C+20 (Constitutional Floor)', pct: 20 },
  { id: 'c40', label: 'C+40', pct: 40 },
  { id: 'c60', label: 'C+60', pct: 60 },
  { id: 'c90', label: 'C+90', pct: 90 },
  { id: 'retail', label: 'Retail (Full Price)', pct: 100 },
] as const;

export function useMyDesignerProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['designer-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('designer_profiles' as never)
        .select('*')
        .eq('user_id', user!.id)
        .single() as { data: DesignerProfile | null };
      return data;
    },
    enabled: !!user,
  });
}

export function useDesignerDirectory() {
  return useQuery({
    queryKey: ['designer-directory'],
    queryFn: async () => {
      const { data } = await supabase
        .from('designer_profiles' as never)
        .select('*')
        .order('xp_rating', { ascending: false }) as { data: DesignerProfile[] | null };
      return data || [];
    },
    staleTime: 60_000,
  });
}

export function useRegisterAsDesigner() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      services: string[];
      tier_availability: number[];
      weekly_capacity?: number;
      pricing_tier?: string;
    }) => {
      const { data, error } = await supabase
        .from('designer_profiles' as never)
        .upsert({
          user_id: user!.id,
          services: params.services,
          tier_availability: params.tier_availability,
          weekly_capacity: params.weekly_capacity || 5,
          pricing_tier: params.pricing_tier || 'retail',
        } as never, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DesignerProfile;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['designer-profile'] });
      qc.invalidateQueries({ queryKey: ['designer-directory'] });
    },
  });
}

export function xpStars(profile: DesignerProfile): number {
  if (!profile.tryout_completed) return 0;
  if (profile.completed_bounties < 5) return 1;
  if (profile.avg_quality >= 4.5 && profile.on_time_rate >= 95) return 5;
  if (profile.avg_quality >= 4.0 && profile.on_time_rate >= 90) return 4;
  if (profile.avg_quality >= 3.5 && profile.on_time_rate >= 80) return 3;
  if (profile.avg_quality >= 3.0) return 2;
  return 1;
}

export function isTryoutMode(profile: DesignerProfile): boolean {
  return !profile.tryout_completed;
}
