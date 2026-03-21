/**
 * LMD Reviewer Dashboard — recipe iteration reviews (taste/flavor/spice/mouthfeel)
 * Shows reviewer tier (Palate progression), incentive message, and queue of meals to review.
 * SEC language: Marks = service value for participation; no investment/return.
 * data-xray-id: lmd-reviewer-dashboard
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coins, Star, MessageSquare } from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

const PALATE_TIERS: { minReviews: number; label: string; icon: string }[] = [
  { minReviews: 0, label: "Nibbler", icon: "🥢" },
  { minReviews: 5, label: "Taster", icon: "👅" },
  { minReviews: 15, label: "Sampler", icon: "🍽️" },
  { minReviews: 30, label: "Connoisseur", icon: "🍷" },
  { minReviews: 50, label: "Sommelier", icon: "✨" },
  { minReviews: 100, label: "Grand Palate", icon: "👑" },
];

function getPalateTier(reviewCount: number): { label: string; icon: string; next?: { label: string; remaining: number } } {
  let current = PALATE_TIERS[0];
  let next = PALATE_TIERS[1];
  for (let i = PALATE_TIERS.length - 1; i >= 0; i--) {
    if (reviewCount >= PALATE_TIERS[i].minReviews) {
      current = PALATE_TIERS[i];
      next = PALATE_TIERS[i + 1];
      break;
    }
  }
  const remaining = next ? next.minReviews - reviewCount : 0;
  return {
    ...current,
    next: next ? { label: next.label, remaining } : undefined,
  };
}

export default function LMDReviewerDashboard() {
  const { user } = useAuth();

  const { data: config } = useQuery({
    queryKey: ["lmd-review-incentive-config"],
    queryFn: async () => {
      const { data } = await supabase.from("dna_lock").select("parameter_key, parameter_value").in("parameter_key", ["lmd_review_incentive_window_hours", "lmd_review_incentive_marks"]);
      const map: Record<string, string> = {};
      data?.forEach((r: { parameter_key: string; parameter_value: string }) => { map[r.parameter_key] = r.parameter_value; });
      return { windowHours: parseInt(map.lmd_review_incentive_window_hours ?? "72", 10), marks: parseInt(map.lmd_review_incentive_marks ?? "5", 10) };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["lmd-reviewer-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return { reviewCount: 0 };
      const { count, error } = await supabase.from("lmd_recipe_iteration_reviews").select("*", { count: "exact", head: true }).eq("reviewer_id", user.id);
      if (error) throw error;
      return { reviewCount: count ?? 0 };
    },
    enabled: !!user?.id,
  });

  const { data: ordersToReview } = useQuery({
    queryKey: ["lmd-orders-to-review", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: orders, error: ordersErr } = await supabase
        .from("meal_orders")
        .select("id, meal_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (ordersErr || !orders?.length) return [];
      const mealIds = [...new Set(orders.map((o: { meal_id: string }) => o.meal_id))];
      const { data: existing } = await supabase
        .from("lmd_recipe_iteration_reviews")
        .select("meal_id")
        .eq("reviewer_id", user.id)
        .in("meal_id", mealIds);
      const reviewedMealIds = new Set((existing ?? []).map((r: { meal_id: string }) => r.meal_id));
      const needReview = orders.filter((o: { meal_id: string }) => !reviewedMealIds.has(o.meal_id));
      if (needReview.length === 0) return [];
      const { data: meals } = await supabase.from("lmd_meals").select("id, meal_name").in("id", [...new Set(needReview.map((o: { meal_id: string }) => o.meal_id))]);
      const mealMap = new Map((meals ?? []).map((m: { id: string; meal_name: string }) => [m.id, m.meal_name ?? "Meal"]));
      return needReview.map((o: { id: string; meal_id: string; created_at: string }) => ({
        orderId: o.id,
        mealId: o.meal_id,
        mealTitle: mealMap.get(o.meal_id) ?? "Meal",
        orderCreatedAt: o.created_at,
      }));
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <PortalPageLayout>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recipe reviews
            </CardTitle>
            <CardDescription>Sign in to see your reviewer tier and meals waiting for your review.</CardDescription>
          </CardHeader>
        </Card>
      </PortalPageLayout>
    );
  }

  const reviewCount = stats?.reviewCount ?? 0;
  const tier = getPalateTier(reviewCount);
  const list = ordersToReview ?? [];

  return (
    <PortalPageLayout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Your reviewer tier
          </CardTitle>
          <CardDescription>Palate progression — your participation builds credibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-base">
              {tier.icon} {tier.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{reviewCount} reviews submitted</span>
          </div>
          {tier.next && tier.next.remaining > 0 && (
            <p className="text-sm text-muted-foreground">
              {tier.next.remaining} more to reach <strong>{tier.next.label}</strong>.
            </p>
          )}
        </CardContent>
      </Card>

      {config && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-2 text-sm">
              <Coins className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Time-bound service value</p>
                <p className="text-muted-foreground">
                  Submit a review within <strong>{config.windowHours} hours</strong> of delivery to earn <strong>{config.marks} Marks</strong> (one-serving equivalent). This is service value for participation, not investment return.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meals you can review
          </CardTitle>
          <CardDescription>Orders you’ve received that don’t have your review yet.</CardDescription>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No meals waiting for review. Order a meal to review it here.</p>
          ) : (
            <ul className="space-y-2">
              {list.map((item: { orderId: string; mealId: string; mealTitle: string; orderCreatedAt: string }) => (
                <li key={item.orderId} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{item.mealTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      Order {new Date(item.orderCreatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link to={`/initiatives/lets-make-dinner/review/${item.mealId}?orderId=${item.orderId}`}>
                      Review
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
