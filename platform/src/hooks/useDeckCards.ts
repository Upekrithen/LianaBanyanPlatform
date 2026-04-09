/**
 * useDeckCards — Hook for reading deck cards, golden keys, and member deck from Supabase.
 * Used by museum pages to show real data instead of hardcoded values.
 *
 * deck_cards schema: id, card_key, title, description, icon, card_type, rarity,
 *   destination_route, unlock_cost_type, unlock_cost_amount, initiative_slug,
 *   is_active, level, created_at
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** All available deck cards (public) */
export function useDeckCards(cardType?: string) {
  return useQuery({
    queryKey: ["deck-cards", cardType],
    queryFn: async () => {
      let query = supabase
        .from("deck_cards")
        .select("*")
        .eq("is_active", true)
        .order("level", { ascending: true });
      if (cardType) query = query.eq("card_type", cardType);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Single deck card by card_key */
export function useDeckCard(cardKey: string) {
  return useQuery({
    queryKey: ["deck-card", cardKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deck_cards")
        .select("*")
        .eq("card_key", cardKey)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** All deck recipes (public) */
export function useDeckRecipes() {
  return useQuery({
    queryKey: ["deck-recipes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("deck_recipes")
        .select("*");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** A member's golden keys (auth required) */
export function useGoldenKeys(memberId: string | undefined) {
  return useQuery({
    queryKey: ["golden-keys", memberId],
    queryFn: async () => {
      if (!memberId) return null;
      const { data, error } = await (supabase as any)
        .from("golden_keys")
        .select("*")
        .eq("member_id", memberId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
    staleTime: 30 * 1000,
  });
}

/** A member's unlocked cards (auth required) */
export function useMemberDeck(memberId: string | undefined) {
  return useQuery({
    queryKey: ["member-deck", memberId],
    queryFn: async () => {
      if (!memberId) return [];
      const { data, error } = await (supabase as any)
        .from("member_deck")
        .select("*, deck_cards(*)")
        .eq("member_id", memberId)
        .order("unlocked_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!memberId,
    staleTime: 30 * 1000,
  });
}
