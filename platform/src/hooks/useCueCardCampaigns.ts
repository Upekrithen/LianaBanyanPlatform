import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CueCardCampaign {
  id: string;
  title: string;
  slug: string;
  craft_type: string;
  description_template: string;
  icon: string;
  recommended_backing_min: number;
  recommended_backing_max: number;
  early_adopter_slots: number;
  default_production_path: string;
  suggested_categories: string[];
  marketing_copy_template: string | null;
  tip_text: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export function useCueCardCampaigns() {
  return useQuery({
    queryKey: ['cue-card-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cue_card_campaigns' as never)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }) as { data: CueCardCampaign[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as CueCardCampaign[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
