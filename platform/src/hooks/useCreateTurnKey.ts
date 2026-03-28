import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTurnKeyInput {
  title: string;
  category: string;
  description: string;
  images: string[];
  production_method: string | null;
  stl_file_url: string | null;
  creator_backing_credits: number;
  matching_cap: number;
  early_adopter_slots: number;
  cue_card_id: string | null;
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function useCreateTurnKey() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTurnKeyInput) => {
      if (!user) throw new Error('Not authenticated');

      const baseSlug = toSlug(input.title);
      const slug = `${baseSlug}-${Date.now().toString(36)}`;

      const { data: project, error: projErr } = await supabase
        .from('turnkey_projects' as never)
        .insert({
          creator_id: user.id,
          title: input.title,
          slug,
          description: input.description,
          category: input.category,
          images: input.images,
          status: 'active',
          creator_backing_credits: input.creator_backing_credits,
          community_matched: 0,
          matching_cap: input.matching_cap,
          current_tier: 'early_adopter',
          early_adopter_slots: input.early_adopter_slots,
          early_adopter_filled: 0,
          production_method: input.production_method,
          stl_file_url: input.stl_file_url,
          cue_card_id: input.cue_card_id,
        } as never)
        .select('id, slug')
        .single() as { data: { id: string; slug: string } | null; error: unknown };

      if (projErr || !project) throw projErr || new Error('Failed to create project');

      const unitPrice = Math.ceil(input.creator_backing_credits * 1.2);

      await supabase
        .from('turnkey_tier_history' as never)
        .insert({
          project_id: project.id,
          tier: 'early_adopter',
          units_target: input.early_adopter_slots,
          units_filled: 0,
          unit_price_credits: unitPrice,
          production_method: input.production_method,
        } as never);

      return project;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['turnkey-projects'] });
    },
  });
}
