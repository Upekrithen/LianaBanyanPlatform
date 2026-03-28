import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type MealType = "breakfast" | "lunch" | "dinner";
export type MealSource = "home" | "restaurant" | "grocery";

export interface MealSlot {
  day: DayOfWeek;
  meal_type: MealType;
  source: MealSource;
  restaurant_id?: string;
  restaurant_name?: string;
  menu_items?: { id: string; name: string; quantity: number; price: number }[];
  scheduled_pickup_time?: string;
  servings: number;
  recipe_id?: string;
  recipe_name?: string;
  estimated_cost: number;
  discount_tier?: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  meals: MealSlot[];
  submitted: boolean;
  total_estimated_cost: number;
  total_savings: number;
  created_at: string;
  updated_at: string;
}

const DAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export { DAYS, DAY_LABELS };

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export { getWeekStart };

export function useMealPlan(weekStart?: string) {
  const { user } = useAuth();
  const week = weekStart ?? getWeekStart();

  return useQuery({
    queryKey: ["meal-plan", user?.id, week],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("meal_plans" as never)
        .select("*")
        .eq("user_id", user!.id)
        .eq("week_start", week)
        .maybeSingle() as unknown as Promise<{ data: MealPlan | null; error: unknown }>);

      if (error) return null;
      if (data) {
        return {
          ...data,
          meals: (typeof data.meals === "string" ? JSON.parse(data.meals) : data.meals) as MealSlot[],
        } as MealPlan;
      }
      return null;
    },
  });
}

export function useSaveMealPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (plan: { week_start: string; meals: MealSlot[] }) => {
      if (!user) throw new Error("Not authenticated");

      const totalCost = plan.meals.reduce((s, m) => s + m.estimated_cost, 0);
      const totalSavings = plan.meals.reduce((s, m) => {
        if (m.source === "restaurant" && m.menu_items) {
          const retail = m.menu_items.reduce((a, i) => a + i.price * i.quantity, 0);
          return s + (retail - m.estimated_cost);
        }
        return s;
      }, 0);

      const { data, error } = await (supabase
        .from("meal_plans" as never)
        .upsert(
          {
            user_id: user.id,
            week_start: plan.week_start,
            meals: JSON.stringify(plan.meals),
            total_estimated_cost: Math.round(totalCost * 100) / 100,
            total_savings: Math.round(totalSavings * 100) / 100,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,week_start" }
        )
        .select()
        .single() as unknown as Promise<{ data: MealPlan | null; error: unknown }>);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-plan"] });
    },
  });
}

export function useSubmitMealPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await (supabase
        .from("meal_plans" as never)
        .update({ submitted: true })
        .eq("id", planId)
        .eq("user_id", user.id) as unknown as Promise<{ error: unknown }>);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meal-plan"] });
      qc.invalidateQueries({ queryKey: ["scheduled-orders"] });
    },
  });
}
