import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type ChapterUnlockProgressRow = {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  paper_slug: string;
  engagement_threshold: number;
  unlocked: boolean;
  unlocked_at: string | null;
  weighted_engagement: number;
  raw_engagement: number;
  percent_unlocked: number;
};

type ChapterUnlockProgressProps = {
  chapter_id?: string;
  className?: string;
};

export function ChapterUnlockProgress({ chapter_id, className }: ChapterUnlockProgressProps) {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["chapter-unlock-progress", chapter_id ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("chapter_unlock_progress" as never)
        .select(
          "chapter_id, chapter_number, chapter_title, paper_slug, engagement_threshold, unlocked, unlocked_at, weighted_engagement, raw_engagement, percent_unlocked",
        )
        .order("chapter_number", { ascending: true });
      if (chapter_id) {
        query = query.eq("chapter_id", chapter_id);
      }
      const { data: rows, error } = await query;
      if (error) throw error;
      return (rows ?? []) as ChapterUnlockProgressRow[];
    },
    refetchInterval: 60_000,
  });

  const rows = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        weighted_engagement: Number(row.weighted_engagement ?? 0),
        raw_engagement: Number(row.raw_engagement ?? 0),
        percent_unlocked: Number(row.percent_unlocked ?? 0),
      })),
    [data],
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-muted-foreground">Loading chapter unlock progress...</CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-muted-foreground">
          Unable to load chapter unlock progress right now.
        </CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-sm text-muted-foreground">No chapter unlock progress is configured yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className={className ?? "space-y-3"}>
      {rows.map((row) => {
        const isUnlocked = Boolean(row.unlocked);
        const pct = Math.max(0, Math.min(100, row.percent_unlocked));
        return (
          <Card key={row.chapter_id}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  Chapter {row.chapter_number}: {row.chapter_title}
                </CardTitle>
                {isUnlocked ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-600">Unlocked</Badge>
                ) : (
                  <Badge variant="secondary">{pct}% unlocked</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={pct} />
              <div className="text-xs text-muted-foreground">
                Weighted engagement: {Math.round(row.weighted_engagement).toLocaleString()} /{" "}
                {row.engagement_threshold.toLocaleString()} | Raw engagement: {row.raw_engagement.toLocaleString()}
              </div>
              {isUnlocked ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-emerald-700 dark:text-emerald-400">
                    Unlocked{row.unlocked_at ? ` on ${new Date(row.unlocked_at).toLocaleString()}` : ""}.
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/cephas/papers/${row.paper_slug}`}>Read paper</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Help unlock this chapter: every like, comment, share, and save counts.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
