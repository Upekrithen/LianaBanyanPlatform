import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PuddingPepperRatingProps = {
  puddingNumber: number;
  title?: string;
  initialViewCount?: number;
  initialRatingActive?: boolean;
  initialRatingAvg?: number | null;
  initialRatingCount?: number;
};

type TrackViewResult = {
  view_count?: number;
  rating_active?: boolean;
  pepper_rating_avg?: number | null;
  pepper_rating_count?: number;
};

type RatingSummary = {
  average: number | null;
  count: number;
};

export function PuddingPepperRating({
  puddingNumber,
  title,
  initialViewCount = 0,
  initialRatingActive = false,
  initialRatingAvg = null,
  initialRatingCount = 0,
}: PuddingPepperRatingProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedPepper, setSelectedPepper] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [ratingActive, setRatingActive] = useState(initialRatingActive);
  const [summary, setSummary] = useState<RatingSummary>({
    average: initialRatingAvg,
    count: initialRatingCount,
  });

  const trackViewMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("track-pudding-view", {
        body: {
          pudding_number: puddingNumber,
          viewer_id: user?.id ?? null,
        },
      });
      if (error) throw error;
      return (data ?? {}) as TrackViewResult;
    },
    onSuccess: (result) => {
      setViewCount(Number(result.view_count ?? viewCount));
      setRatingActive(Boolean(result.rating_active));
      setSummary({
        average:
          result.pepper_rating_avg === null || typeof result.pepper_rating_avg === "undefined"
            ? null
            : Number(result.pepper_rating_avg),
        count: Number(result.pepper_rating_count ?? 0),
      });
    },
  });

  const refreshSummaryQuery = useQuery({
    queryKey: ["pudding-rating-summary", puddingNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pudding_pepper_ratings" as never)
        .select("pepper_count")
        .eq("pudding_number", puddingNumber);
      if (error) throw error;

      const rows = (data ?? []) as Array<{ pepper_count: number | null }>;
      if (!rows.length) return { average: null, count: 0 } as RatingSummary;

      const count = rows.length;
      const sum = rows.reduce((acc, row) => acc + Number(row.pepper_count ?? 0), 0);
      return {
        average: Number((sum / count).toFixed(2)),
        count,
      } as RatingSummary;
    },
    enabled: ratingActive,
    staleTime: 10 * 1000,
  });

  const submitRatingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPepper) throw new Error("Pick a pepper rating first.");

      const payload = {
        pudding_number: puddingNumber,
        rater_id: user?.id ?? null,
        pepper_count: selectedPepper,
        comment: comment.trim() || null,
      };

      if (user?.id) {
        const { error } = await supabase
          .from("pudding_pepper_ratings" as never)
          .upsert(payload as never, { onConflict: "pudding_number,rater_id" });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("pudding_pepper_ratings" as never)
          .insert(payload as never);
        if (error) throw error;
      }

      const { error: aggregateError } = await supabase.functions.invoke("aggregate-pudding-ratings", {
        body: { pudding_number: puddingNumber },
      });
      if (aggregateError) {
        // Keep rating submission successful even if aggregation invocation fails.
        console.warn("aggregate-pudding-ratings failed", aggregateError);
      }
    },
    onSuccess: async () => {
      toast.success(`You rated this pudding ${selectedPepper} pepper${selectedPepper === 1 ? "" : "s"}.`);
      setComment("");
      await refreshSummaryQuery.refetch();
      queryClient.invalidateQueries({ queryKey: ["pudding-analytics-table"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to submit rating.");
    },
  });

  useEffect(() => {
    trackViewMutation.mutate();
    // Fire once per pudding render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puddingNumber]);

  useEffect(() => {
    if (refreshSummaryQuery.data) {
      setSummary(refreshSummaryQuery.data);
    }
  }, [refreshSummaryQuery.data]);

  const averageLabel = useMemo(() => {
    if (summary.average === null || summary.count === 0) return "No ratings yet";
    return `${summary.average.toFixed(1)} from ${summary.count} raters`;
  }, [summary.average, summary.count]);

  return (
    <Card className="border-orange-500/30">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">
          {title ? `${title} - Hot Pepper Rating` : "Hot Pepper Rating"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ratings unlock after 100 views. Current views: {viewCount}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!ratingActive ? (
          <p className="text-sm text-muted-foreground">
            Heat rating activates at 100 reads for statistically meaningful feedback.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((pepper) => {
                const active = pepper <= (selectedPepper ?? 0);
                return (
                  <Button
                    key={pepper}
                    type="button"
                    variant={active ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPepper(pepper)}
                    className="px-2"
                    aria-label={`Rate ${pepper} peppers`}
                  >
                    🌶️ {pepper}
                  </Button>
                );
              })}
            </div>

            <Input
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Optional short reaction"
              maxLength={160}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">Current average: {averageLabel}</p>
              <Button onClick={() => submitRatingMutation.mutate()} disabled={!selectedPepper || submitRatingMutation.isPending}>
                {submitRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
