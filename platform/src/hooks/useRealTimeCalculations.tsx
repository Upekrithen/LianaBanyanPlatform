import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductCalculations {
  currentVolumeDiscount: number;
  totalUnitsPreordered: number;
  currentUnitPrice: number;
  productionRunEndDate: Date | null;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
}

export interface UserCalculations {
  totalCreditValue: number;
  equityPercentages: Record<string, number>;
  votingPower: number;
}

export interface StalenessStatus {
  isStale: boolean;
  level: 'fresh' | 'warning' | 'stale' | 'critical';
  lastUpdate: Date | null;
  secondsSinceUpdate: number;
}

// Staleness configuration
const STALENESS_CONFIG = {
  product: {
    warningThreshold: 30, // 30 seconds
    staleThreshold: 90, // 90 seconds
    criticalThreshold: 180, // 3 minutes
    pollingInterval: 30000, // 30 seconds
  },
  user: {
    warningThreshold: 30,
    staleThreshold: 90,
    criticalThreshold: 180,
    pollingInterval: 30000,
  },
};

export function useRealTimeCalculations(productId?: string, userId?: string) {
  const [productCalcs, setProductCalcs] = useState<ProductCalculations | null>(null);
  const [userCalcs, setUserCalcs] = useState<UserCalculations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productStaleness, setProductStaleness] = useState<StalenessStatus>({
    isStale: false,
    level: 'fresh',
    lastUpdate: null,
    secondsSinceUpdate: 0,
  });
  const [userStaleness, setUserStaleness] = useState<StalenessStatus>({
    isStale: false,
    level: 'fresh',
    lastUpdate: null,
    secondsSinceUpdate: 0,
  });
  const [realtimeConnected, setRealtimeConnected] = useState(true);

  // Staleness monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      if (productStaleness.lastUpdate) {
        const seconds = Math.floor((now.getTime() - productStaleness.lastUpdate.getTime()) / 1000);
        const config = STALENESS_CONFIG.product;
        
        let level: StalenessStatus['level'] = 'fresh';
        if (seconds > config.criticalThreshold) level = 'critical';
        else if (seconds > config.staleThreshold) level = 'stale';
        else if (seconds > config.warningThreshold) level = 'warning';
        
        setProductStaleness(prev => ({
          ...prev,
          isStale: seconds > config.warningThreshold,
          level,
          secondsSinceUpdate: seconds,
        }));
      }
      
      if (userStaleness.lastUpdate) {
        const seconds = Math.floor((now.getTime() - userStaleness.lastUpdate.getTime()) / 1000);
        const config = STALENESS_CONFIG.user;
        
        let level: StalenessStatus['level'] = 'fresh';
        if (seconds > config.criticalThreshold) level = 'critical';
        else if (seconds > config.staleThreshold) level = 'stale';
        else if (seconds > config.warningThreshold) level = 'warning';
        
        setUserStaleness(prev => ({
          ...prev,
          isStale: seconds > config.warningThreshold,
          level,
          secondsSinceUpdate: seconds,
        }));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [productStaleness.lastUpdate, userStaleness.lastUpdate]);

  useEffect(() => {
    if (productId) {
      loadProductCalculations();
      
      // Set up real-time subscription for critical data (votes, pledges)
      const channel = supabase
        .channel(`product-${productId}-updates`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_votes',
          },
          () => {
            loadProductCalculations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pledges',
          },
          () => {
            loadProductCalculations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'production_levels',
            filter: `product_id=eq.${productId}`,
          },
          () => {
            loadProductCalculations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'industry_pricing_data',
            filter: `product_id=eq.${productId}`,
          },
          () => {
            loadProductCalculations();
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === 'SUBSCRIBED');
        });

      // Polling fallback for secondary data (stats, aggregates)
      const pollingInterval = setInterval(() => {
        if (!realtimeConnected || productStaleness.level === 'critical') {
          loadProductCalculations();
        }
      }, STALENESS_CONFIG.product.pollingInterval);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollingInterval);
      };
    }
  }, [productId, realtimeConnected, productStaleness.level]);

  useEffect(() => {
    if (userId) {
      loadUserCalculations();

      // Subscribe to critical user data (credits, votes)
      const channel = supabase
        .channel(`user-${userId}-credits`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_credits',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            loadUserCalculations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_votes',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            loadUserCalculations();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pledges',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            loadUserCalculations();
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === 'SUBSCRIBED');
        });

      // Polling fallback
      const pollingInterval = setInterval(() => {
        if (!realtimeConnected || userStaleness.level === 'critical') {
          loadUserCalculations();
        }
      }, STALENESS_CONFIG.user.pollingInterval);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(pollingInterval);
      };
    }
  }, [userId, realtimeConnected, userStaleness.level]);

  // Update countdown every second
  useEffect(() => {
    if (productCalcs?.productionRunEndDate) {
      const interval = setInterval(() => {
        setProductCalcs(prev => {
          if (!prev || !prev.productionRunEndDate) return prev;
          return {
            ...prev,
            timeRemaining: calculateTimeRemaining(prev.productionRunEndDate),
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [productCalcs?.productionRunEndDate]);

  const loadProductCalculations = async () => {
    if (!productId) return;

    try {
      // Get product and production levels
      const { data: product } = await supabase
        .from('products')
        .select(`
          *,
          production_levels (*)
        `)
        .eq('id', productId)
        .single();

      if (!product) return;

      // Get current votes
      const { data: levels } = await supabase
        .from('production_levels')
        .select('*, pledges(*)')
        .eq('product_id', productId)
        .order('level_number', { ascending: true });

      // Calculate total units from all votes
      let totalUnitsPreordered = 0;
      let currentLevel = null;
      
      for (const level of levels || []) {
        if (level.current_votes >= level.votes_needed) {
          totalUnitsPreordered += level.units_count;
          currentLevel = level;
        } else {
          break;
        }
      }

      // Get pricing data for volume discount
      const { data: pricingData } = await supabase
        .from('industry_pricing_data')
        .select('*')
        .eq('product_id', productId)
        .gte('units_in_run', totalUnitsPreordered)
        .order('units_in_run', { ascending: true })
        .limit(1)
        .maybeSingle();

      const currentVolumeDiscount = pricingData?.volume_discount_percentage || 0;
      const currentUnitPrice = pricingData?.calculated_unit_price || 
                               currentLevel?.unit_price || 
                               0;

      const productionRunEndDate = pricingData?.run_end_date 
        ? new Date(pricingData.run_end_date) 
        : null;

      setProductCalcs({
        currentVolumeDiscount,
        totalUnitsPreordered,
        currentUnitPrice,
        productionRunEndDate,
        timeRemaining: productionRunEndDate 
          ? calculateTimeRemaining(productionRunEndDate) 
          : null,
      });
      
      // Update staleness status
      setProductStaleness({
        isStale: false,
        level: 'fresh',
        lastUpdate: new Date(),
        secondsSinceUpdate: 0,
      });
    } catch (error) {
      console.error('Error loading product calculations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCalculations = async () => {
    if (!userId) return;

    try {
      // Get user credits
      const { data: credits } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!credits) return;

      // Get user votes across all projects
      const { data: votes } = await supabase
        .from('user_votes')
        .select(`
          *,
          production_levels (
            *,
            products (
              project_id
            )
          )
        `)
        .eq('user_id', userId);

      // Calculate portfolio allocation (user's own distribution across projects)
      const equityPercentages: Record<string, number> = {};
      let totalVotingPower = 0;
      const userProjectTotals: Record<string, number> = {};

      for (const vote of votes || []) {
        const amount = Number(vote.vote_amount) || 0;
        totalVotingPower += amount;
        const projectId = vote.production_levels?.products?.project_id as string | undefined;
        if (projectId) {
          userProjectTotals[projectId] = (userProjectTotals[projectId] || 0) + amount;
        }
      }

      const userTotalAcrossProjects = Object.values(userProjectTotals).reduce((a, b) => a + b, 0);
      for (const [projectId, amt] of Object.entries(userProjectTotals)) {
        equityPercentages[projectId] = userTotalAcrossProjects > 0 ? (amt / userTotalAcrossProjects) * 100 : 0;
      }

      setUserCalcs({
        totalCreditValue: Number(credits.total_credits) - Number(credits.used_credits),
        equityPercentages,
        votingPower: totalVotingPower,
      });
      
      // Update staleness status
      setUserStaleness({
        isStale: false,
        level: 'fresh',
        lastUpdate: new Date(),
        secondsSinceUpdate: 0,
      });
    } catch (error) {
      console.error('Error loading user calculations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  };

  return {
    productCalcs,
    userCalcs,
    isLoading,
    productStaleness,
    userStaleness,
    realtimeConnected,
    refetch: () => {
      if (productId) loadProductCalculations();
      if (userId) loadUserCalculations();
    },
  };
}
