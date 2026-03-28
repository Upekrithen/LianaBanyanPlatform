import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RestaurantListing {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  cuisine: string[];
  price_range: string | null;
  partnership_tier: "none" | "cookbook" | "c90" | "c60" | "c40" | "c20";
  discount_pct: number;
  hours: Record<string, unknown> | null;
  delivery_options: string[];
  scheduling_available: boolean;
  captain_id: string | null;
  campaign_id: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  image_url: string | null;
  onboarded_at: string | null;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price_retail: number;
  price_lb: number | null;
  category: string | null;
  dietary: string[];
  available_days: string[];
  available_hours: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

const TIER_LABELS: Record<string, string> = {
  none: "Not Listed",
  cookbook: "Listed (Full Price)",
  c90: "Tier 1 — C+90",
  c60: "Tier 2 — C+60",
  c40: "Tier 3 — C+40",
  c20: "Tier 4 — C+20",
};

const TIER_ORDER: Record<string, number> = {
  c20: 0,
  c40: 1,
  c60: 2,
  c90: 3,
  cookbook: 4,
  none: 5,
};

export function tierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier;
}

export function tierDiscount(tier: string): number {
  const map: Record<string, number> = { c90: 10, c60: 25, c40: 40, c20: 50 };
  return map[tier] ?? 0;
}

export function useRestaurants(filter?: { tier?: string; cuisine?: string; city?: string }) {
  return useQuery({
    queryKey: ["restaurants", filter],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("restaurant_listings" as never)
        .select("*")
        .order("name") as unknown as Promise<{ data: RestaurantListing[] | null; error: unknown }>);

      if (error || !data) return [];

      let results = data;
      if (filter?.tier && filter.tier !== "all") {
        results = results.filter((r) =>
          filter.tier === "partners" ? r.partnership_tier !== "none" && r.partnership_tier !== "cookbook" : r.partnership_tier === filter.tier
        );
      }
      if (filter?.cuisine) {
        const c = filter.cuisine.toLowerCase();
        results = results.filter((r) => r.cuisine.some((cu) => cu.toLowerCase().includes(c)));
      }
      if (filter?.city) {
        const ci = filter.city.toLowerCase();
        results = results.filter((r) => r.city?.toLowerCase().includes(ci));
      }
      return results.sort((a, b) => TIER_ORDER[a.partnership_tier] - TIER_ORDER[b.partnership_tier]);
    },
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: ["restaurant", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("restaurant_listings" as never)
        .select("*")
        .eq("id", id!)
        .single() as unknown as Promise<{ data: RestaurantListing | null; error: unknown }>);

      if (error || !data) return null;
      return data;
    },
  });
}

export function useMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ["menu-items", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("menu_items" as never)
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .eq("active", true)
        .order("category")
        .order("name") as unknown as Promise<{ data: MenuItem[] | null; error: unknown }>);

      if (error || !data) return [];
      return data;
    },
  });
}
