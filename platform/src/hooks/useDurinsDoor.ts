import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DoorConfig {
  id: string;
  medallion_id: string;
  default_template: string;
  default_data: Record<string, unknown>;
  active_from: string;
  active_until: string | null;
  created_at: string;
}

export interface DoorRule {
  id: string;
  config_id: string;
  key_type: 'phrase' | 'email' | 'code' | 'any';
  key_value: string;
  case_sensitive: boolean;
  single_use: boolean;
  used: boolean;
  template: string;
  experience_data: Record<string, unknown>;
  intended_recipient: string | null;
  sort_order: number;
  created_at: string;
}

export interface DoorConfigWithRules extends DoorConfig {
  rules: DoorRule[];
}

export function useDurinsDoorForMedallion(medallionId: string | undefined) {
  return useQuery({
    queryKey: ['durins-door', medallionId],
    queryFn: async (): Promise<DoorConfigWithRules | null> => {
      if (!medallionId) return null;

      const { data: configs } = await supabase
        .from('durins_door_configs' as never)
        .select('*')
        .eq('medallion_id', medallionId)
        .order('created_at', { ascending: false })
        .limit(1) as { data: DoorConfig[] | null };

      if (!configs || configs.length === 0) return null;
      const config = configs[0];

      const { data: rules } = await supabase
        .from('durins_door_rules' as never)
        .select('*')
        .eq('config_id', config.id)
        .order('sort_order') as { data: DoorRule[] | null };

      return { ...config, rules: rules || [] };
    },
    enabled: !!medallionId,
    staleTime: 30_000,
  });
}

export function useMyDoorConfigs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-door-configs', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('durins_door_configs' as never)
        .select('*')
        .eq('medallion_id', user!.id)
        .order('created_at', { ascending: false }) as { data: DoorConfig[] | null };
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateDoorConfig() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (params: {
      default_template?: string;
      default_data?: Record<string, unknown>;
      active_until?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('durins_door_configs' as never)
        .insert({ medallion_id: user!.id, ...params } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DoorConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-door-configs'] }),
  });
}

export function useCreateDoorRule() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rule: Omit<DoorRule, 'id' | 'created_at' | 'used'>) => {
      const { data, error } = await supabase
        .from('durins_door_rules' as never)
        .insert(rule as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as DoorRule;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['durins-door'] }),
  });
}

export function evaluateDoorRule(
  rules: DoorRule[],
  input: string
): DoorRule | null {
  return rules.find((r) => {
    if (r.single_use && r.used) return false;
    if (r.key_type === 'any') return true;
    return r.case_sensitive
      ? r.key_value === input
      : r.key_value.toLowerCase() === input.toLowerCase();
  }) || null;
}

export function isDoorConfigActive(config: DoorConfig): boolean {
  const now = new Date();
  if (config.active_from && new Date(config.active_from) > now) return false;
  if (config.active_until && new Date(config.active_until) < now) return false;
  return true;
}
