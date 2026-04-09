import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Play, Pause, FastForward, Send, Activity, BookOpen } from "lucide-react";

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  vote_threshold: number;
  current_engagement: number;
  status: "staged" | "streaming" | "published" | "completed";
  stream_started_at: string | null;
  published_at: string | null;
  created_at: string;
};

type Episode = {
  id: string;
  chapter_id: string;
  sequence_number: number;
  status: "queued" | "posted" | "failed";
  engagement_likes: number;
  engagement_replies: number;
  engagement_reposts: number;
  posted_at: string | null;
};

export default function CrewmanDashboardPage() {
  const queryClient = useQueryClient();

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["crewman-chapters-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_chapters" as never)
        .select("id, chapter_number, title, vote_threshold, current_engagement, status, stream_started_at, published_at, created_at")
        .order("chapter_number", { ascending: true });

      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
    refetchInterval: 60_000,
  });

  const streamingChapter = useMemo(
    () => chapters.find((chapter) => chapter.status === "streaming") ?? null,
    [chapters],
  );

  const { data: streamingEpisodes = [] } = useQuery({
    queryKey: ["crewman-episodes-dashboard", streamingChapter?.id],
    enabled: !!streamingChapter?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_episodes" as never)
        .select("id, chapter_id, sequence_number, status, engagement_likes, engagement_replies, engagement_reposts, posted_at")
        .eq("chapter_id", streamingChapter!.id)
        .order("sequence_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Episode[];
    },
    refetchInterval: 30_000,
  });

  const invokeCrewmanFn = useMutation({
    mutationFn: async (fnName: string) => {
      const { data, error } = await supabase.functions.invoke(fnName, { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crewman-chapters-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["crewman-episodes-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["crewman-history"] });
    },
  });

  const startStreamMutation = useMutation({
    mutationFn: async () => {
      const { data: currentStreaming } = await supabase
        .from("crewman_chapters" as never)
        .select("id")
        .eq("status", "streaming")
        .maybeSingle();
      if (currentStreaming?.id) return { no_op: true };

      const { data: nextStaged } = await supabase
        .from("crewman_chapters" as never)
        .select("id")
        .eq("status", "staged")
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!nextStaged?.id) {
        throw new Error("No staged chapter available.");
      }

      const { error } = await supabase
        .from("crewman_chapters" as never)
        .update({ status: "streaming", stream_started_at: new Date().toISOString() } as never)
        .eq("id", nextStaged.id);
      if (error) throw error;
      return { no_op: false };
    },
    onSuccess: (result) => {
      toast.success(result.no_op ? "A chapter is already streaming." : "Streaming started.");
      queryClient.invalidateQueries({ queryKey: ["crewman-chapters-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to start stream"),
  });

  const pauseStreamMutation = useMutation({
    mutationFn: async () => {
      if (!streamingChapter?.id) throw new Error("No streaming chapter to pause.");
      const { error } = await supabase
        .from("crewman_chapters" as never)
        .update({ status: "staged" } as never)
        .eq("id", streamingChapter.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Stream paused.");
      queryClient.invalidateQueries({ queryKey: ["crewman-chapters-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to pause stream"),
  });

  const advanceChapterMutation = useMutation({
    mutationFn: async () => {
      if (!streamingChapter?.id) throw new Error("No active chapter to advance.");

      const { error: closeError } = await supabase
        .from("crewman_chapters" as never)
        .update({ status: "completed" } as never)
        .eq("id", streamingChapter.id);
      if (closeError) throw closeError;

      const { data: nextStaged } = await supabase
        .from("crewman_chapters" as never)
        .select("id")
        .eq("status", "staged")
        .gt("chapter_number", streamingChapter.chapter_number)
        .order("chapter_number", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (nextStaged?.id) {
        const { error: startError } = await supabase
          .from("crewman_chapters" as never)
          .update({ status: "streaming", stream_started_at: new Date().toISOString() } as never)
          .eq("id", nextStaged.id);
        if (startError) throw startError;
      }
    },
    onSuccess: () => {
      toast.success("Advanced to next chapter.");
      queryClient.invalidateQueries({ queryKey: ["crewman-chapters-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["crewman-episodes-dashboard"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to advance chapter"),
  });

  const episodeStats = useMemo(() => {
    const posted = streamingEpisodes.filter((episode) => episode.status === "posted").length;
    const queued = streamingEpisodes.filter((episode) => episode.status === "queued").length;
    const failed = streamingEpisodes.filter((episode) => episode.status === "failed").length;
    return { posted, queued, failed, total: streamingEpisodes.length };
  }, [streamingEpisodes]);

  const engagementSeries = useMemo(() => {
    return streamingEpisodes.map((episode) => {
      const total = episode.engagement_likes + episode.engagement_replies + episode.engagement_reposts;
      return { sequence: episode.sequence_number, total };
    });
  }, [streamingEpisodes]);

  const publishedHistory = useMemo(
    () => chapters.filter((chapter) => chapter.status === "published" || chapter.status === "completed"),
    [chapters],
  );

  const progressPercent = streamingChapter
    ? Math.min(100, Math.round((streamingChapter.current_engagement / Math.max(streamingChapter.vote_threshold, 1)) * 100))
    : 0;

  return (
    <PortalPageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-7 w-7" />
              Crewman #6 Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Hourly serialized dispatch, chapter vote-gates, and Cephas publication flow.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => invokeCrewmanFn.mutate("dispatch-crewman-episode")}
              disabled={invokeCrewmanFn.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Dispatch Now
            </Button>
            <Button
              variant="outline"
              onClick={() => invokeCrewmanFn.mutate("track-crewman-engagement")}
              disabled={invokeCrewmanFn.isPending}
            >
              <Activity className="w-4 h-4 mr-2" />
              Track Engagement
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current Streaming Chapter</CardTitle>
            <CardDescription>
              {streamingChapter
                ? `Chapter ${streamingChapter.chapter_number}: ${streamingChapter.title}`
                : "No active chapter is currently streaming."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {streamingChapter ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Engagement: {streamingChapter.current_engagement} / {streamingChapter.vote_threshold}
                  </span>
                  <Badge variant="secondary">{progressPercent}%</Badge>
                </div>
                <Progress value={progressPercent} />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Start the next staged chapter to begin hourly dispatch.</p>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => startStreamMutation.mutate()} disabled={startStreamMutation.isPending}>
                <Play className="w-4 h-4 mr-2" />
                Start Stream
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => pauseStreamMutation.mutate()}
                disabled={pauseStreamMutation.isPending || !streamingChapter}
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause Stream
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => advanceChapterMutation.mutate()}
                disabled={advanceChapterMutation.isPending || !streamingChapter}
              >
                <FastForward className="w-4 h-4 mr-2" />
                Advance Chapter
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Episode Queue Status</CardTitle>
              <CardDescription>
                {streamingChapter ? `Chapter ${streamingChapter.chapter_number} queue` : "Waiting for active chapter"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-3 text-sm text-center">
                <div className="rounded border p-2">
                  <div className="font-semibold">{episodeStats.posted}</div>
                  <div className="text-muted-foreground text-xs">Posted</div>
                </div>
                <div className="rounded border p-2">
                  <div className="font-semibold">{episodeStats.queued}</div>
                  <div className="text-muted-foreground text-xs">Queued</div>
                </div>
                <div className="rounded border p-2">
                  <div className="font-semibold">{episodeStats.failed}</div>
                  <div className="text-muted-foreground text-xs">Failed</div>
                </div>
                <div className="rounded border p-2">
                  <div className="font-semibold">{episodeStats.total}</div>
                  <div className="text-muted-foreground text-xs">Total</div>
                </div>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {streamingEpisodes.map((episode) => (
                  <div key={episode.id} className="flex items-center justify-between text-xs border rounded px-2 py-1.5">
                    <span>Episode {episode.sequence_number}</span>
                    <Badge variant={episode.status === "posted" ? "default" : "secondary"}>
                      {episode.status}
                    </Badge>
                  </div>
                ))}
                {!streamingEpisodes.length && (
                  <p className="text-xs text-muted-foreground">No episodes loaded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement by Episode</CardTitle>
              <CardDescription>Combined likes + replies + reposts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {engagementSeries.length ? (
                engagementSeries.map((point) => (
                  <div key={point.sequence} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Episode {point.sequence}</span>
                      <span>{point.total}</span>
                    </div>
                    <Progress value={Math.min(100, point.total)} />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Engagement data appears after dispatch + tracking runs.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Published Chapter History</CardTitle>
            <CardDescription>Chapters that crossed vote-gate and moved forward</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {publishedHistory.map((chapter) => (
              <div key={chapter.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">Chapter {chapter.chapter_number}: {chapter.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {chapter.published_at
                      ? `Published ${new Date(chapter.published_at).toLocaleString()}`
                      : `Created ${new Date(chapter.created_at).toLocaleString()}`}
                  </p>
                </div>
                <Badge variant="outline">{chapter.status}</Badge>
              </div>
            ))}
            {!publishedHistory.length && (
              <p className="text-sm text-muted-foreground">No published chapters yet.</p>
            )}
          </CardContent>
        </Card>

        {chaptersLoading && <p className="text-sm text-muted-foreground">Loading Crewman telemetry...</p>}
      </div>
    </PortalPageLayout>
  );
}
