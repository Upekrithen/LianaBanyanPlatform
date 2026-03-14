/**
 * LMD Recipe Iteration Review Form — taste, flavor, spice, mouthfeel (1–5)
 * SEC language: Marks for timely review (service value / allocation), no investment/return.
 * data-xray-id: lmd-review-form
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Clock, Coins } from "lucide-react";

const DIMENSIONS = [
  { key: "taste", label: "Taste", description: "Overall taste quality" },
  { key: "flavor", label: "Flavor", description: "Depth and balance of flavors" },
  { key: "spice", label: "Spice", description: "Spice level and balance" },
  { key: "mouthfeel", label: "Mouthfeel", description: "Texture and finish" },
] as const;

export interface LMDReviewFormProps {
  mealId: string;
  orderId?: string | null;
  mealTitle?: string;
  /** When the order was placed or delivered; used for incentive window. */
  orderOrDeliveryAt?: string;
  /** Already submitted? Show read-only. */
  existingReview?: { taste: number; flavor: number; spice: number; mouthfeel: number; review_text?: string | null; within_incentive_window?: boolean };
  onSuccess?: () => void;
}

export function LMDReviewForm({
  mealId,
  orderId,
  mealTitle,
  orderOrDeliveryAt,
  existingReview,
  onSuccess,
}: LMDReviewFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<string, number>>({
    taste: existingReview?.taste ?? 3,
    flavor: existingReview?.flavor ?? 3,
    spice: existingReview?.spice ?? 3,
    mouthfeel: existingReview?.mouthfeel ?? 3,
  });
  const [reviewText, setReviewText] = useState(existingReview?.review_text ?? "");

  const { data: config } = useQuery({
    queryKey: ["lmd-review-incentive-config"],
    queryFn: async () => {
      const { data } = await supabase.from("dna_lock").select("parameter_key, parameter_value").in("parameter_key", ["lmd_review_incentive_window_hours", "lmd_review_incentive_marks"]);
      const map: Record<string, string> = {};
      data?.forEach((r: { parameter_key: string; parameter_value: string }) => { map[r.parameter_key] = r.parameter_value; });
      return { windowHours: parseInt(map.lmd_review_incentive_window_hours ?? "72", 10), marks: parseInt(map.lmd_review_incentive_marks ?? "5", 10) };
    },
  });

  const now = new Date();
  const refTime = orderOrDeliveryAt ? new Date(orderOrDeliveryAt) : now;
  const hoursSince = (now.getTime() - refTime.getTime()) / (1000 * 60 * 60);
  const withinWindow = config ? hoursSince <= config.windowHours : false;

  const { data: mealRow } = useQuery({
    queryKey: ["lmd-meal-for-review", mealId],
    queryFn: async () => {
      const { data } = await supabase.from("lmd_meals").select("chef_id, portfolio_recipe_id").eq("id", mealId).single();
      return data as { chef_id?: string; portfolio_recipe_id?: string } | null;
    },
    enabled: !!mealId,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sign in to submit a review");
      const { error } = await supabase.from("lmd_recipe_iteration_reviews").insert({
        meal_id: mealId,
        order_id: orderId ?? null,
        reviewer_id: user.id,
        cook_id: mealRow?.chef_id ?? null,
        recipe_id: mealRow?.portfolio_recipe_id ?? null,
        taste: scores.taste,
        flavor: scores.flavor,
        spice: scores.spice,
        mouthfeel: scores.mouthfeel,
        review_text: reviewText.trim() || null,
        within_incentive_window: withinWindow,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lmd-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["lmd-reviewer-stats"] });
      queryClient.invalidateQueries({ queryKey: ["lmd-orders-to-review"] });
      toast.success("Review submitted. Thank you.");
      onSuccess?.();
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Could not submit review");
    },
  });

  if (existingReview) {
    return (
      <Card data-xray-id="lmd-review-form">
        <CardHeader>
          <CardTitle>Your review</CardTitle>
          <CardDescription>{mealTitle ?? "Meal"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DIMENSIONS.map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <p className="text-sm text-muted-foreground">{(existingReview as Record<string, number>)[key]}/5</p>
            </div>
          ))}
          {existingReview.review_text && <p className="text-sm">{existingReview.review_text}</p>}
          {existingReview.within_incentive_window && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Coins className="h-3 w-3" /> Submitted within the incentive window — service value (Marks) applied.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-xray-id="lmd-review-form">
      <CardHeader>
        <CardTitle>Review this meal</CardTitle>
        <CardDescription>{mealTitle ?? "Meal"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {config && (
          <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-2 text-sm">
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Time-bound service value</p>
              <p className="text-muted-foreground">
                Submit within {config.windowHours} hours of delivery to earn {config.marks} Marks (one-serving equivalent). This is service value for participation, not investment return.
              </p>
              {orderOrDeliveryAt && (
                <p className="text-xs mt-1">
                  {withinWindow
                    ? `You're within the window — submit now to qualify.`
                    : `Incentive window has passed; you can still submit your review.`}
                </p>
              )}
            </div>
          </div>
        )}

        {DIMENSIONS.map(({ key, label, description }) => (
          <div key={key} className="space-y-2">
            <Label>{label} — {description}</Label>
            <div className="flex items-center gap-4">
              <Slider
                min={1}
                max={5}
                step={1}
                value={[scores[key] ?? 3]}
                onValueChange={([v]) => setScores((s) => ({ ...s, [key]: v }))}
                className="flex-1"
              />
              <span className="text-sm font-medium w-6">{(scores[key] ?? 3)}</span>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <Label>Comments (optional)</Label>
          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Anything else about this meal?"
            rows={3}
          />
        </div>

        <Button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? "Submitting…" : "Submit review"}
        </Button>
      </CardContent>
    </Card>
  );
}
