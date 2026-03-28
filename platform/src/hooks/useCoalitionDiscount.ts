import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CoalitionDiscountResult {
  hasDiscount: boolean;
  discountPercent: number;
  coalitionName: string | null;
  isLoading: boolean;
}

/**
 * Returns the highest coalition discount available to the current user.
 * Discount comes from the platform margin (Cost+20%), NOT from the creator's price.
 * Creator always receives their full listed price.
 */
export function useCoalitionDiscount(): CoalitionDiscountResult {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['coalition-discount', user?.id],
    queryFn: async () => {
      if (!user) return { discountPercent: 0, coalitionName: null };

      const { data: memberships } = await supabase
        .from('buying_coalition_members' as never)
        .select('coalition_id')
        .eq('user_id', user.id) as { data: { coalition_id: string }[] | null };

      if (!memberships || memberships.length === 0) {
        return { discountPercent: 0, coalitionName: null };
      }

      const coalitionIds = memberships.map(m => m.coalition_id);

      const { data: coalitions } = await supabase
        .from('buying_coalitions' as never)
        .select('name, discount_tier, status')
        .in('id', coalitionIds)
        .eq('status', 'active')
        .order('discount_tier', { ascending: false })
        .limit(1) as { data: { name: string; discount_tier: number; status: string }[] | null };

      if (!coalitions || coalitions.length === 0) {
        return { discountPercent: 0, coalitionName: null };
      }

      return {
        discountPercent: Number(coalitions[0].discount_tier),
        coalitionName: coalitions[0].name,
      };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  return {
    hasDiscount: (data?.discountPercent ?? 0) > 0,
    discountPercent: data?.discountPercent ?? 0,
    coalitionName: data?.coalitionName ?? null,
    isLoading,
  };
}
