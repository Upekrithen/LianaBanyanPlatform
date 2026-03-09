/**
 * USE HEXISLE WORLD
 * =================
 * React Query hook that wraps all hexisle_* Supabase table calls.
 * Provides player state, cities, buildings, and quests for the 3D world.
 * Follows the same patterns as src/pages/HexIsle.tsx.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HexIslePlayerState {
  id: string;
  user_id: string;
  current_city_id: string | null;
  current_hex_x: number;
  current_hex_y: number;
  level: number;
  credits: number;
  water: number;
  materials: number;
  food: number;
  cities_discovered: string[];
}

export interface HexIsleCity {
  id: string;
  name: string;
  hex_x: number;
  hex_y: number;
  features: Record<string, unknown>;
  guild_hall: string | null;
  population: number;
  well_type: string | null;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useHexIsleWorld(userId?: string) {
  const playerStateQuery = useQuery({
    queryKey: ["hexisle-player-state", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("hexisle_player_state")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data as HexIslePlayerState | null;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });

  const citiesQuery = useQuery({
    queryKey: ["hexisle-cities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hexisle_cities")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []) as HexIsleCity[];
    },
    staleTime: 60_000,
  });

  const buildingsQuery = useQuery({
    queryKey: ["hexisle-buildings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hexisle_buildings")
        .select("*");
      if (error) throw error;
      return data || [];
    },
    staleTime: 60_000,
  });

  return {
    playerState: playerStateQuery.data,
    cities: citiesQuery.data || [],
    buildings: buildingsQuery.data || [],
    isLoading: playerStateQuery.isLoading || citiesQuery.isLoading,
    error: playerStateQuery.error || citiesQuery.error,
  };
}
