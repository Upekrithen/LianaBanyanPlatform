/**
 * LMD Review Submit — single meal review form (taste, flavor, spice, mouthfeel)
 * Route: /initiatives/lets-make-dinner/review/:mealId?orderId=...
 * data-xray-id: lmd-review-submit-page
 */

import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LMDReviewForm } from "@/components/lmd/LMDReviewForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LMDReviewSubmitPage() {
  const { mealId } = useParams<{ mealId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const { user } = useAuth();

  const { data: meal, isLoading } = useQuery({
    queryKey: ["lmd-meal", mealId],
    queryFn: async () => {
      if (!mealId) return null;
      const { data, error } = await supabase.from("lmd_meals").select("id, meal_name").eq("id", mealId).single();
      if (error || !data) return null;
      return data as { id: string; meal_name: string };
    },
    enabled: !!mealId,
  });

  const { data: order } = useQuery({
    queryKey: ["meal-order", orderId],
    queryFn: async () => {
      if (!orderId || !user?.id) return null;
      const { data } = await supabase.from("meal_orders").select("id, created_at").eq("id", orderId).eq("user_id", user.id).single();
      return data as { id: string; created_at: string } | null;
    },
    enabled: !!orderId && !!user?.id,
  });

  const { data: existing } = useQuery({
    queryKey: ["lmd-existing-review", mealId, user?.id],
    queryFn: async () => {
      if (!mealId || !user?.id) return null;
      const { data } = await supabase
        .from("lmd_recipe_iteration_reviews")
        .select("taste, flavor, spice, mouthfeel, review_text, within_incentive_window")
        .eq("meal_id", mealId)
        .eq("reviewer_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!mealId && !!user?.id,
  });

  if (!user) {
    return (
      <div className="container max-w-lg mx-auto p-6">
        <p className="text-muted-foreground">Sign in to submit a review.</p>
      </div>
    );
  }

  if (isLoading || !mealId) {
    return (
      <div className="container max-w-lg mx-auto p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="container max-w-lg mx-auto p-6">
        <p className="text-muted-foreground">Meal not found.</p>
        <Button variant="link" asChild className="mt-2">
          <Link to="/initiatives/lets-make-dinner/reviews">Back to reviews</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-6 space-y-4" data-xray-id="lmd-review-submit-page">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/initiatives/lets-make-dinner/reviews">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to reviews
        </Link>
      </Button>
      <LMDReviewForm
        mealId={mealId}
        orderId={orderId}
        mealTitle={meal.meal_name}
        orderOrDeliveryAt={order?.created_at}
        existingReview={existing ? { taste: existing.taste!, flavor: existing.flavor!, spice: existing.spice!, mouthfeel: existing.mouthfeel!, review_text: existing.review_text, within_incentive_window: existing.within_incentive_window ?? false } : undefined}
        onSuccess={() => navigate("/initiatives/lets-make-dinner/reviews")}
      />
    </div>
  );
}
