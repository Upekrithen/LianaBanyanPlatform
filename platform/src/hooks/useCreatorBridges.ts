import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CreatorBridge {
  id: string;
  user_id: string;
  service_type: string;
  service_url: string;
  display_name: string | null;
  is_primary: boolean;
  verified: boolean;
  created_at: string;
}

export function useCreatorBridges(userId?: string) {
  return useQuery({
    queryKey: ['creator-bridges', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('creator_bridges' as never)
        .select('*')
        .eq('user_id', userId!) as { data: CreatorBridge[] | null; error: unknown };

      if (error) throw error;
      return (data || []) as CreatorBridge[];
    },
    enabled: !!userId,
  });
}

export function useManageBridge() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const createBridge = useMutation({
    mutationFn: async (input: {
      service_type: string;
      service_url: string;
      display_name?: string;
      is_primary?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('creator_bridges' as never)
        .insert({
          user_id: user.id,
          service_type: input.service_type,
          service_url: input.service_url,
          display_name: input.display_name || null,
          is_primary: input.is_primary || false,
          verified: false,
        } as never)
        .select('*')
        .single() as { data: CreatorBridge | null; error: unknown };

      if (error || !data) throw error || new Error('Failed to create bridge');
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['creator-bridges'] });
    },
  });

  const updateBridge = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; service_url?: string; display_name?: string; is_primary?: boolean }) => {
      const { error } = await supabase
        .from('creator_bridges' as never)
        .update(updates as never)
        .eq('id', id) as { error: unknown };

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['creator-bridges'] });
    },
  });

  const deleteBridge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creator_bridges' as never)
        .delete()
        .eq('id', id) as { error: unknown };

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['creator-bridges'] });
    },
  });

  const verifyBridge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('creator_bridges' as never)
        .update({ verified: true } as never)
        .eq('id', id) as { error: unknown };

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['creator-bridges'] });
    },
  });

  return { createBridge, updateBridge, deleteBridge, verifyBridge };
}
