import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type MembershipLevel = 'free' | 'active' | 'expired' | 'lifetime';

interface MembershipInfo {
  status: MembershipLevel;
  expiresAt: string | null;
  isGated: boolean;
}

export function useMembershipStatus(): MembershipInfo & { isLoading: boolean } {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['membership-level', user?.id],
    queryFn: async (): Promise<MembershipInfo> => {
      if (!user) return { status: 'free', expiresAt: null, isGated: true };

      const { data: mp } = await supabase
        .from('member_profiles' as never)
        .select('membership_status, membership_expires_at')
        .eq('user_id', user.id)
        .maybeSingle() as { data: { membership_status: string; membership_expires_at: string | null } | null };

      if (mp?.membership_status === 'active' || mp?.membership_status === 'lifetime') {
        return {
          status: mp.membership_status as MembershipLevel,
          expiresAt: mp.membership_expires_at,
          isGated: false,
        };
      }

      // Fallback: user_credits
      const { data: uc } = await supabase
        .from('user_credits')
        .select('membership_stake_paid')
        .eq('user_id', user.id)
        .maybeSingle();

      if (uc?.membership_stake_paid) {
        return { status: 'active', expiresAt: null, isGated: false };
      }

      const status = (mp?.membership_status as MembershipLevel) || 'free';
      return { status, expiresAt: mp?.membership_expires_at || null, isGated: status !== 'active' && status !== 'lifetime' };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  return {
    status: data?.status ?? 'free',
    expiresAt: data?.expiresAt ?? null,
    isGated: data?.isGated ?? true,
    isLoading,
  };
}
