import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ScheduledOrder {
  id: string;
  user_id: string;
  restaurant_id: string;
  meal_plan_id: string | null;
  items: { menu_item_id: string; name: string; quantity: number; price: number }[];
  scheduled_date: string;
  pickup_window: string | null;
  servings: number;
  total_retail: number | null;
  total_lb: number | null;
  advance_payment: number;
  status: "scheduled" | "confirmed" | "preparing" | "ready" | "picked_up" | "cancelled";
  created_at: string;
}

export interface DailyManifest {
  id: string;
  restaurant_id: string;
  manifest_date: string;
  summary: { item_name: string; total_quantity: number }[];
  total_orders: number;
  total_revenue: number;
  advance_paid: number;
  sent_at: string | null;
}

export function useScheduledOrders(filters?: { date?: string; status?: string }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["scheduled-orders", user?.id, filters],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("scheduled_orders" as never)
        .select("*")
        .eq("user_id", user!.id)
        .order("scheduled_date");

      if (filters?.date) {
        query = query.eq("scheduled_date", filters.date) as typeof query;
      }
      if (filters?.status) {
        query = query.eq("status", filters.status) as typeof query;
      }

      const { data, error } = await (query as unknown as Promise<{ data: ScheduledOrder[] | null; error: unknown }>);
      if (error || !data) return [];
      return data.map((o) => ({
        ...o,
        items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      })) as ScheduledOrder[];
    },
  });
}

export function useRestaurantOrders(restaurantId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ["restaurant-orders", restaurantId, date],
    enabled: !!restaurantId,
    queryFn: async () => {
      let query = supabase
        .from("scheduled_orders" as never)
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .order("pickup_window");

      if (date) {
        query = query.eq("scheduled_date", date) as typeof query;
      }

      const { data, error } = await (query as unknown as Promise<{ data: ScheduledOrder[] | null; error: unknown }>);
      if (error || !data) return [];
      return data.map((o) => ({
        ...o,
        items: typeof o.items === "string" ? JSON.parse(o.items) : o.items,
      })) as ScheduledOrder[];
    },
  });
}

export function useDailyManifest(restaurantId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ["daily-manifest", restaurantId, date],
    enabled: !!restaurantId,
    queryFn: async () => {
      const targetDate = date ?? new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const { data, error } = await (supabase
        .from("daily_manifests" as never)
        .select("*")
        .eq("restaurant_id", restaurantId!)
        .eq("manifest_date", targetDate)
        .maybeSingle() as unknown as Promise<{ data: DailyManifest | null; error: unknown }>);

      if (error || !data) return null;
      return {
        ...data,
        summary: typeof data.summary === "string" ? JSON.parse(data.summary) : data.summary,
      } as DailyManifest;
    },
  });
}

export function useCancelOrder() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase
        .from("scheduled_orders" as never)
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("user_id", user.id) as unknown as Promise<{ error: unknown }>);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-orders"] });
    },
  });
}

export function useConfirmOrderReady() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: "confirmed" | "preparing" | "ready" | "picked_up" }) => {
      const { error } = await (supabase
        .from("scheduled_orders" as never)
        .update({ status })
        .eq("id", orderId) as unknown as Promise<{ error: unknown }>);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scheduled-orders"] });
      qc.invalidateQueries({ queryKey: ["restaurant-orders"] });
    },
  });
}
