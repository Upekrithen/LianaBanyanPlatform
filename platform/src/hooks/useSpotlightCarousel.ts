import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEED_CARDS, SPOTLIGHT_CATEGORIES, selectCards, type SpotlightCard, type AlgorithmConfig } from '@/lib/spotlightAlgorithm';

const DEFAULT_ALGO_CONFIG: AlgorithmConfig = {
  timeOfDayWeight: 0.2,
  recencyWeight: 0.3,
  viewRatioWeight: 0.3,
  randomSalt: 0.2,
};

export function useSpotlightCarousel(
  pageContext: string = 'landing',
  defaultCategory: string = 'all',
) {
  const [category, setCategory] = useState(defaultCategory);
  const impressionCounts = useRef<Record<string, number>>({});
  const sessionId = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const cards = selectCards(
    SEED_CARDS,
    category,
    DEFAULT_ALGO_CONFIG,
    impressionCounts.current,
  );

  const logEvent = useCallback(
    async (
      cardId: string,
      action: 'impression' | 'click' | 'spotlight' | 'cta_click' | 'dismiss',
      positionInCarousel?: number,
      dwellMs?: number,
    ) => {
      impressionCounts.current[cardId] = (impressionCounts.current[cardId] || 0) + 1;

      try {
        await supabase.from('spotlight_impressions' as any).insert({
          card_id: cardId,
          category,
          position_in_carousel: positionInCarousel ?? null,
          action,
          session_id: sessionId.current,
          dwell_ms: dwellMs ?? null,
          algorithm_config: DEFAULT_ALGO_CONFIG,
          page_context: pageContext,
        });
      } catch {
        // Non-critical — don't block UX
      }
    },
    [category, pageContext],
  );

  return {
    cards,
    category,
    setCategory,
    categories: SPOTLIGHT_CATEGORIES,
    logEvent,
  };
}
