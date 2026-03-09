/**
 * DISCOVERY STATE HOOK
 * ====================
 * Provides shared discovery state for progressive disclosure across the app.
 * Components can check if features/cards are discovered and reveal content accordingly.
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Discovery card slugs mapped to dashboard sections
export const DASHBOARD_DISCOVERY_MAP = {
  // Essential (always visible after signup)
  'membership-status': 'essentials',
  'guild-stake': 'essentials',
  
  // Initiatives (discovered via navigation)
  'lets-make-dinner': 'initiatives',
  'defense-klaus': 'initiatives',
  'lets-get-groceries': 'initiatives',
  'lets-go-shopping': 'initiatives',
  
  // Exploration (discovered via navigation)
  'crowdfunding-hub': 'exploration',
  'medallion-management': 'exploration',
  'hofund-studio': 'exploration',
  'herald-subscription': 'exploration',
  
  // Economy (discovered via navigation)
  'eoi-dashboard': 'economy',
  'project-preferences': 'economy',
  'participation-breakdown': 'economy',
  'contribution-timeline': 'economy',
  
  // Governance (discovered via navigation)
  'legal-formation': 'governance',
  'charitable-loan': 'governance',
  
  // Tools
  'referral-manager': 'tools',
  'physical-badge': 'tools',
} as const;

export type DiscoverySlug = keyof typeof DASHBOARD_DISCOVERY_MAP;

interface DiscoveryState {
  discoveries: Set<string>;
  categoryDiscoveries: Set<string>;
  isLoading: boolean;
  isDiscovered: (slug: string) => boolean;
  isCategoryDiscovered: (category: string) => boolean;
  discoverCard: (slug: string, category?: string) => Promise<void>;
  discoveryLevel: number; // 0 = new, increases as user discovers more
}

const DiscoveryContext = createContext<DiscoveryState | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [discoveries, setDiscoveries] = useState<Set<string>>(new Set());
  const [categoryDiscoveries, setCategoryDiscoveries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load discoveries from database or localStorage (for ghosts)
  useEffect(() => {
    loadDiscoveries();
  }, [user]);

  const loadDiscoveries = async () => {
    setIsLoading(true);
    
    if (user) {
      // Load from database
      const { data } = await supabase
        .from('user_discovery_state')
        .select('card_slug, category_slug')
        .eq('user_id', user.id);

      if (data) {
        const cards = new Set(data.filter(d => d.card_slug).map(d => d.card_slug as string));
        const categories = new Set(data.map(d => d.category_slug));
        
        // Auto-discover essentials for all authenticated users
        cards.add('membership-status');
        cards.add('guild-stake');
        categories.add('essentials');
        
        setDiscoveries(cards);
        setCategoryDiscoveries(categories);
      } else {
        // New user - start with essentials
        setDiscoveries(new Set(['membership-status', 'guild-stake']));
        setCategoryDiscoveries(new Set(['essentials']));
      }
    } else {
      // Ghost user - check localStorage
      const ghostDiscoveries = localStorage.getItem('lb_ghost_discoveries');
      if (ghostDiscoveries) {
        try {
          const parsed = JSON.parse(ghostDiscoveries);
          setDiscoveries(new Set(parsed.cards || []));
          setCategoryDiscoveries(new Set(parsed.categories || []));
        } catch {
          setDiscoveries(new Set());
          setCategoryDiscoveries(new Set());
        }
      } else {
        setDiscoveries(new Set());
        setCategoryDiscoveries(new Set());
      }
    }
    
    setIsLoading(false);
  };

  const isDiscovered = useCallback((slug: string): boolean => {
    return discoveries.has(slug);
  }, [discoveries]);

  const isCategoryDiscovered = useCallback((category: string): boolean => {
    return categoryDiscoveries.has(category);
  }, [categoryDiscoveries]);

  const discoverCard = useCallback(async (slug: string, category?: string) => {
    // Already discovered
    if (discoveries.has(slug)) return;

    const cardCategory = category || DASHBOARD_DISCOVERY_MAP[slug as DiscoverySlug] || 'exploration';

    if (user) {
      // Save to database
      await supabase.from('user_discovery_state').upsert({
        user_id: user.id,
        card_slug: slug,
        category_slug: cardCategory,
        discovered_at: new Date().toISOString(),
      }, { onConflict: 'user_id,card_slug' });
    } else {
      // Save to localStorage for ghosts
      const ghostDiscoveries = localStorage.getItem('lb_ghost_discoveries');
      const parsed = ghostDiscoveries ? JSON.parse(ghostDiscoveries) : { cards: [], categories: [] };
      parsed.cards = [...new Set([...parsed.cards, slug])];
      parsed.categories = [...new Set([...parsed.categories, cardCategory])];
      localStorage.setItem('lb_ghost_discoveries', JSON.stringify(parsed));
    }

    // Update local state
    setDiscoveries(prev => new Set([...prev, slug]));
    setCategoryDiscoveries(prev => new Set([...prev, cardCategory]));
  }, [user, discoveries]);

  // Calculate discovery level based on number of discoveries
  const discoveryLevel = Math.min(10, Math.floor(discoveries.size / 3));

  return (
    <DiscoveryContext.Provider value={{
      discoveries,
      categoryDiscoveries,
      isLoading,
      isDiscovered,
      isCategoryDiscovered,
      discoverCard,
      discoveryLevel,
    }}>
      {children}
    </DiscoveryContext.Provider>
  );
}

export function useDiscovery(): DiscoveryState {
  const context = useContext(DiscoveryContext);
  if (!context) {
    // Return a default state when not wrapped in provider (for backwards compatibility)
    return {
      discoveries: new Set(),
      categoryDiscoveries: new Set(),
      isLoading: false,
      isDiscovered: () => true, // Show everything if no provider
      isCategoryDiscovered: () => true,
      discoverCard: async () => {},
      discoveryLevel: 10,
    };
  }
  return context;
}
