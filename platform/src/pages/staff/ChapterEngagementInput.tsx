import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChapterUnlockProgress } from "@/components/cephas";
import { supabase } from "@/integrations/supabase/client";

type ChapterConfig = {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
};

type EngagementEvent = {
  id: string;
  chapter_id: string;
  platform: string;
  episode_number: number | null;
  event_type: "like" | "comment" | "share" | "save" | "view";
  event_count: number;
  recorded_at: string;
};

const EVENT_TYPES = ["like", "comment", "share", "save", "view"] as const;

export default function ChapterEngagementInput() {
  const queryClient = useQueryClient();
  const [chapterId, setChapterId] = useState("");
  const [platform, setPlatform] = useState("x");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [eventType, setEventType] = useState<(typeof EVENT_TYPES)[number]>("like");
  const [eventCount, setEventCount] = useState("1");

  const chaptersQuery = useQuery({
    queryKey: ["chapter-unlock-config-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_unlock_config" as never)
        .select("chapter_id, chapter_number, chapter_title")
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ChapterConfig[];
    },
  });

  const recentEventsQuery = useQuery({
    queryKey: ["chapter-engagement-events-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_engagement_events" as never)
        .select("id, chapter_id, platform, episode_number, event_type, event_count, recorded_at")
        .order("recorded_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as EngagementEvent[];
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async () => {
      const parsedCount = Number.parseInt(eventCount, 10);
      const parsedEpisode = episodeNumber.trim() ? Number.parseInt(episodeNumber, 10) : null;
      if (!chapterId) throw new Error("Select a chapter.");
      if (!platform.trim()) throw new Error("Platform is required.");
      if (!Number.isFinite(parsedCount) || parsedCount <= 0) throw new Error("Event count must be at least 1.");
      if (episodeNumber.trim() && (!Number.isFinite(parsedEpisode) || parsedEpisode <= 0)) {
        throw new Error("Episode number must be a positive integer.");
      }
      const { error } = await supabase
        .from("chapter_engagement_events" as never)
        .insert({
          chapter_id: chapterId,
          platform: platform.trim().toLowerCase(),
          episode_number: parsedEpisode,
          event_type: eventType,
          event_count: parsedCount,
        } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Engagement event added.");
      setEventCount("1");
      setEpisodeNumber("");
      queryClient.invalidateQueries({ queryKey: ["chapter-engagement-events-recent"] });
      queryClient.invalidateQueries({ queryKey: ["chapter-unlock-progress"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to add event."),
  });

  const chapterMap = useMemo(() => {
    const map = new Map<string, ChapterConfig>();
    for (const row of chaptersQuery.data ?? []) {
      map.set(row.chapter_id, row);
    }
    return map;
  }, [chaptersQuery.data]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-chapter-engagement-input">
        <Card>
          <CardHeader>
            <StaffPageHeader
              title="Chapter Engagement Input"
              description="Manual-first engagement entry for vote-gate progress tracking."
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="chapter-id">Chapter</Label>
                <select
                  id="chapter-id"
                  value={chapterId}
                  onChange={(event) => setChapterId(event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select chapter</option>
                  {(chaptersQuery.data ?? []).map((chapter) => (
                    <option key={chapter.chapter_id} value={chapter.chapter_id}>
                      {chapter.chapter_number}: {chapter.chapter_title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={platform}
                  onChange={(event) => setPlatform(event.target.value)}
                  placeholder="x / threads / linkedin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="episode-number">Episode # (optional)</Label>
                <Input
                  id="episode-number"
                  value={episodeNumber}
                  onChange={(event) => setEpisodeNumber(event.target.value)}
                  placeholder="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Event type</Label>
                <select
                  id="event-type"
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value as (typeof EVENT_TYPES)[number])}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-count">Count</Label>
                <Input
                  id="event-count"
                  value={eventCount}
                  onChange={(event) => setEventCount(event.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
            <Button onClick={() => addEventMutation.mutate()} disabled={addEventMutation.isPending}>
              {addEventMutation.isPending ? "Saving..." : "Add engagement event"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vote-Gate Progress</CardTitle>
            <CardDescription>Live weighted unlock progress across configured BST chapters.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChapterUnlockProgress />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Engagement Events</CardTitle>
            <CardDescription>Latest inserts across all configured chapters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recorded</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Episode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentEventsQuery.data ?? []).map((event) => {
                  const chapter = chapterMap.get(event.chapter_id);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>{new Date(event.recorded_at).toLocaleString()}</TableCell>
                      <TableCell>
                        {chapter ? `${chapter.chapter_number}: ${chapter.chapter_title}` : event.chapter_id}
                      </TableCell>
                      <TableCell className="uppercase">{event.platform}</TableCell>
                      <TableCell>{event.episode_number ?? "-"}</TableCell>
                      <TableCell>{event.event_type}</TableCell>
                      <TableCell className="text-right">{event.event_count}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}
