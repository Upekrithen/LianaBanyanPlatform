import { useMemo, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarDays, Megaphone, Newspaper, Send } from "lucide-react";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { SchedulingEntryBox } from "@/components/scheduling/SchedulingEntryBox";
import { SchedulingControlPanel } from "@/components/scheduling/SchedulingControlPanel";
import { ScheduleRotator } from "@/components/scheduling/ScheduleRotator";
import { ChapterUnlockProgress } from "@/components/cephas";
import type { SchedulingEntry } from "@/components/scheduling/types";

const CT_OFFSET = "-05:00";
const PLATFORM_ORDER = ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"] as const;
const PLATFORM_COLORS: Record<string, string> = {
  twitter: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  linkedin: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  threads: "bg-zinc-500/20 text-zinc-200 border-zinc-400/30",
  bluesky: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  instagram: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  facebook: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
};

type PlatformFilter = "all" | (typeof PLATFORM_ORDER)[number];

type CrewmanEpisode = {
  id: string;
  chapter_id: string | null;
  sequence_number: number | null;
  content: string | null;
  channel: "bst" | "spoonfuls" | "skipping_stones" | null;
  platform: string | null;
  target_platform: string | null;
  scheduled_for: string | null;
  status: string | null;
  dispatch_role: string | null;
  dispatch_staggered_from: string | null;
  dispatch_tz: string | null;
  window_used: { start?: string; end?: string; tz?: string } | null;
};

type NewsSlot = {
  id: string;
  scheduled_date: string;
  slot_time: string;
  content_type: string;
  content: string;
  breaking_news_source: string | null;
  status: string;
};

type DispatchNowResult = {
  status?: string;
  platform?: string;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  episode_count: number;
};

type AnalyticsRow = Record<string, unknown>;
type PrefaceTemplate = Record<string, unknown>;

export default function SocialMediaDashboard() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [breakingNewsContent, setBreakingNewsContent] = useState("");
  const [breakingNewsSource, setBreakingNewsSource] = useState("");
  const [lastDispatchResult, setLastDispatchResult] = useState<DispatchNowResult | null>(null);
  const [prefaceDrafts, setPrefaceDrafts] = useState<Record<string, string>>({});

  const nextDayKey = format(addDays(parseISO(`${selectedDate}T00:00:00${CT_OFFSET}`), 1), "yyyy-MM-dd");
  const sevenDaysAgo = format(addDays(parseISO(`${selectedDate}T00:00:00${CT_OFFSET}`), -6), "yyyy-MM-dd");
  const sevenDaysAhead = format(addDays(parseISO(`${selectedDate}T00:00:00${CT_OFFSET}`), 7), "yyyy-MM-dd");
  const plus24hIso = addDays(parseISO(`${selectedDate}T00:00:00${CT_OFFSET}`), 1).toISOString();

  const todayScheduleQuery = useQuery({
    queryKey: ["dispatch-schedule", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_schedule_admin_view" as never)
        .select("id, chapter_id, sequence_number, content, channel, platform, target_platform, scheduled_for, status, dispatch_role, dispatch_staggered_from, dispatch_tz, window_used")
        .gte("scheduled_for", `${selectedDate}T00:00:00${CT_OFFSET}`)
        .lt("scheduled_for", `${nextDayKey}T00:00:00${CT_OFFSET}`)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewmanEpisode[];
    },
    enabled: !!user && isAdmin,
  });

  const newsSlotQuery = useQuery({
    queryKey: ["news-slot", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_news_slots" as never)
        .select("id, scheduled_date, slot_time, content_type, content, breaking_news_source, status")
        .eq("scheduled_date", selectedDate)
        .eq("status", "scheduled")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as NewsSlot | null;
    },
    enabled: !!user && isAdmin,
  });

  const analyticsQuery = useQuery({
    queryKey: ["distribution-analytics", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_analytics" as never)
        .select("*")
        .gte("dispatch_date", sevenDaysAgo)
        .order("dispatch_date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AnalyticsRow[];
    },
    enabled: !!user && isAdmin,
  });

  const pipelineQuery = useQuery({
    queryKey: ["content-pipeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_episodes" as never)
        .select("id, chapter_id, sequence_number, content, channel, platform, scheduled_for, status")
        .is("scheduled_for", null)
        .eq("status", "staged")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewmanEpisode[];
    },
    enabled: !!user && isAdmin,
  });

  const upcoming24hQuery = useQuery({
    queryKey: ["upcoming-24h", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_schedule_admin_view" as never)
        .select("id, chapter_id, sequence_number, content, channel, platform, target_platform, scheduled_for, status, dispatch_role, dispatch_staggered_from, dispatch_tz, window_used")
        .gte("scheduled_for", `${selectedDate}T00:00:00${CT_OFFSET}`)
        .lt("scheduled_for", plus24hIso)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewmanEpisode[];
    },
    enabled: !!user && isAdmin,
  });

  const calendarQuery = useQuery({
    queryKey: ["content-calendar", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_schedule_admin_view" as never)
        .select("id, chapter_id, sequence_number, content, channel, platform, target_platform, scheduled_for, status, dispatch_role, dispatch_staggered_from, dispatch_tz, window_used")
        .gte("scheduled_for", `${selectedDate}T00:00:00${CT_OFFSET}`)
        .lt("scheduled_for", `${sevenDaysAhead}T00:00:00${CT_OFFSET}`)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewmanEpisode[];
    },
    enabled: !!user && isAdmin,
  });

  const chaptersQuery = useQuery({
    queryKey: ["crewman-chapters-social-maven"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_chapters" as never)
        .select("id, chapter_number, title, episode_count")
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Chapter[];
    },
    enabled: !!user && isAdmin,
  });

  const prefaceTemplatesQuery = useQuery({
    queryKey: ["episode-preface-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_preface_templates" as never)
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as PrefaceTemplate[];
    },
    enabled: !!user && isAdmin,
  });

  useQuery({
    queryKey: ["dispatch-platform-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_platform_config" as never)
        .select("*");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && isAdmin,
  });

  const dispatchNowMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("dispatch-crewman-episode", { body: {} });
      if (error) throw error;
      return (data ?? {}) as DispatchNowResult;
    },
    onSuccess: (result) => {
      setLastDispatchResult(result);
      toast.success("Dispatch check completed.");
      void invalidateAll(queryClient);
    },
    onError: () => toast.error("Dispatch test failed."),
  });

  const bumpCurrentNewsMutation = useMutation({
    mutationFn: async () => {
      const slot = newsSlotQuery.data;
      if (!slot?.content?.trim()) throw new Error("No scheduled news slot content to bump.");
      const { error } = await supabase.functions.invoke("bump-news-slot", {
        body: {
          date: selectedDate,
          breaking_news_content: slot.content.trim(),
          source: slot.breaking_news_source || "scheduled_slot",
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("News slot bumped.");
      queryClient.invalidateQueries({ queryKey: ["news-slot", selectedDate] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to bump news slot."),
  });

  const breakingNewsMutation = useMutation({
    mutationFn: async () => {
      const content = breakingNewsContent.trim();
      if (!content) throw new Error("Breaking news content is required.");

      const bumpResult = await supabase.functions.invoke("bump-news-slot", {
        body: {
          date: selectedDate,
          breaking_news_content: content,
          source: breakingNewsSource.trim() || "manual",
        },
      });
      if (bumpResult.error) throw bumpResult.error;

      const dispatchResult = await supabase.functions.invoke("dispatch-crewman-episode", { body: {} });
      if (dispatchResult.error) throw dispatchResult.error;

      return dispatchResult.data as DispatchNowResult | null;
    },
    onSuccess: (result) => {
      const platformLabel = result?.platform ? ` to ${result.platform}` : "";
      toast.success(`Breaking news dispatched${platformLabel}.`);
      setBreakingNewsContent("");
      setBreakingNewsSource("");
      setLastDispatchResult(result ?? null);
      void invalidateAll(queryClient);
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to dispatch breaking news."),
  });

  const updatePrefaceMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const nextText = prefaceDrafts[templateId]?.trim();
      if (!nextText) throw new Error("Preface text cannot be empty.");
      const { error } = await supabase
        .from("episode_preface_templates" as never)
        .update({ template_text: nextText, updated_at: new Date().toISOString() } as never)
        .eq("id", templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Preface template updated.");
      queryClient.invalidateQueries({ queryKey: ["episode-preface-templates"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update preface."),
  });

  const todaySchedule = todayScheduleQuery.data ?? [];
  const pipeline = pipelineQuery.data ?? [];
  const analyticsRows = analyticsQuery.data ?? [];
  const chapters = chaptersQuery.data ?? [];
  const prefaceTemplates = prefaceTemplatesQuery.data ?? [];
  const calendarRows = calendarQuery.data ?? [];
  const upcoming24h = upcoming24hQuery.data ?? [];
  const activeNewsSlot = newsSlotQuery.data ?? null;

  const filteredSchedule = useMemo(
    () =>
      platformFilter === "all"
        ? todaySchedule
        : todaySchedule.filter((row) => schedulePlatform(row) === platformFilter),
    [todaySchedule, platformFilter],
  );

  const statusSummary = useMemo(() => {
    let dispatched = 0;
    let failed = 0;
    for (const row of todaySchedule) {
      if (row.status === "posted" || row.status === "dispatched") dispatched += 1;
      if (row.status === "failed") failed += 1;
    }
    return {
      dispatched,
      scheduled: todaySchedule.length,
      queue: pipeline.length,
      failed,
    };
  }, [todaySchedule, pipeline.length]);

  const chapterMap = useMemo(() => new Map(chapters.map((chapter) => [chapter.id, chapter])), [chapters]);

  const bstProgress = useMemo(() => {
    const bstEpisodes = [...todaySchedule, ...upcoming24h]
      .filter((episode) => episode.channel === "bst")
      .sort((a, b) => (a.scheduled_for ?? "").localeCompare(b.scheduled_for ?? ""));
    const latest = bstEpisodes.at(-1) ?? null;
    const chapter = latest?.chapter_id ? chapterMap.get(latest.chapter_id) ?? null : null;
    const episodeNumber = latest?.sequence_number ?? 0;
    const total = chapter?.episode_count ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round((episodeNumber / total) * 100)) : 0;
    return { chapter, episodeNumber, total, pct };
  }, [todaySchedule, upcoming24h, chapterMap]);

  const spoonfulsQueueDepth = useMemo(
    () => pipeline.filter((episode) => episode.channel === "spoonfuls").length,
    [pipeline],
  );

  const metricsByPlatform = useMemo(() => {
    const map = new Map<string, { posts: number; reach: number; engagementTotal: number; engagementCount: number }>();
    for (const row of analyticsRows) {
      const platform = normalizePlatform(asString(row.platform) || asString(row.channel) || "unknown");
      const reach = asNumber(row.total_reach) ?? asNumber(row.reach) ?? asNumber(row.impressions) ?? 0;
      const engagement = asNumber(row.engagement_rate) ?? asNumber(row.engagement) ?? 0;
      const current = map.get(platform) ?? { posts: 0, reach: 0, engagementTotal: 0, engagementCount: 0 };
      current.posts += 1;
      current.reach += reach;
      current.engagementTotal += engagement;
      current.engagementCount += 1;
      map.set(platform, current);
    }
    return Array.from(map.entries())
      .map(([platform, metric]) => ({
        platform,
        posts: metric.posts,
        reach: metric.reach,
        engagementRate: metric.engagementCount ? metric.engagementTotal / metric.engagementCount : 0,
      }))
      .sort((a, b) => b.posts - a.posts);
  }, [analyticsRows]);

  const topPerformer = useMemo(() => {
    const today = analyticsRows.filter((row) => asString(row.dispatch_date) === selectedDate);
    if (!today.length) return null;
    return [...today].sort(
      (a, b) =>
        (asNumber(b.engagement_rate) ?? asNumber(b.engagement) ?? 0) -
        (asNumber(a.engagement_rate) ?? asNumber(a.engagement) ?? 0),
    )[0];
  }, [analyticsRows, selectedDate]);

  const trend = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const row of analyticsRows) {
      const day = asString(row.dispatch_date);
      if (!day) continue;
      const current = byDay.get(day) ?? 0;
      const engagement = asNumber(row.engagement_rate) ?? asNumber(row.engagement) ?? 0;
      byDay.set(day, current + engagement);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([day, value]) => ({ day, value }));
  }, [analyticsRows]);

  const maxTrend = Math.max(...trend.map((entry) => entry.value), 1);
  const updateEpisodeScheduleMutation = useMutation({
    mutationFn: async ({ episodeId, scheduledAtIso }: { episodeId: string; scheduledAtIso: string }) => {
      const { error } = await supabase
        .from("crewman_episodes" as never)
        .update({ scheduled_for: scheduledAtIso } as never)
        .eq("id", episodeId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Episode schedule updated.");
      void invalidateAll(queryClient);
    },
    onError: () => toast.error("Failed to update episode schedule."),
  });
  const schedulingEntries: SchedulingEntry[] = useMemo(
    () =>
      todaySchedule
        .filter((episode) => episode.scheduled_for)
        .map((episode) => ({
          id: episode.id,
          contentType: "distribution_post",
          contentId: episode.id,
          contentTitle: `${seriesLabel(episode.channel)} #${episode.sequence_number ?? "?"}`,
          scheduledAt: parseISO(episode.scheduled_for as string),
          target: "distribution-grid",
        })),
    [todaySchedule],
  );

  const scheduleByHour = useMemo(() => {
    const map = new Map<string, CrewmanEpisode[]>();
    for (const row of filteredSchedule) {
      if (!row.scheduled_for) continue;
      const key = format(parseISO(row.scheduled_for), "ha");
      const current = map.get(key) ?? [];
      current.push(row);
      map.set(key, current);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      const aHour = parseHourLabel(a);
      const bHour = parseHourLabel(b);
      return aHour - bHour;
    });
  }, [filteredSchedule]);

  const calendarDays = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, idx) =>
      format(addDays(parseISO(`${selectedDate}T00:00:00${CT_OFFSET}`), idx), "yyyy-MM-dd"),
    );
    return days.map((day) => {
      const rows = calendarRows.filter((row) => (row.scheduled_for ?? "").startsWith(day));
      return {
        day,
        bst: rows.filter((row) => row.channel === "bst").length,
        spoonfuls: rows.filter((row) => row.channel === "spoonfuls").length,
        other: rows.filter((row) => row.channel !== "bst" && row.channel !== "spoonfuls").length,
      };
    });
  }, [calendarRows, selectedDate]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-social-media-dashboard">
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <StaffPageHeader
              title={
                <span className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Social Media Maven Dashboard
                </span>
              }
              description="Daily distribution command center for schedule, engagement, and pipeline operations."
              actions={
                <>
                <Badge variant="secondary">Maven: {user.email ?? "staff"}</Badge>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-[170px]"
                />
                <Button
                  variant="outline"
                  onClick={() => dispatchNowMutation.mutate()}
                  disabled={dispatchNowMutation.isPending}
                >
                  {dispatchNowMutation.isPending ? "Dispatching..." : "Dispatch Now (Test)"}
                </Button>
                </>
              }
            />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Platforms:</span>
              <Button
                size="sm"
                variant={platformFilter === "all" ? "default" : "outline"}
                onClick={() => setPlatformFilter("all")}
              >
                All
              </Button>
              {PLATFORM_ORDER.map((platform) => (
                <Button
                  key={platform}
                  size="sm"
                  variant={platformFilter === platform ? "default" : "outline"}
                  onClick={() => setPlatformFilter(platform)}
                  className="capitalize"
                >
                  {platform}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="outline">{statusSummary.dispatched} dispatched today</Badge>
              <Badge variant="outline">{statusSummary.scheduled} scheduled</Badge>
              <Badge variant="outline">{statusSummary.queue} in queue</Badge>
              <Badge variant={statusSummary.failed ? "destructive" : "secondary"}>
                {statusSummary.failed} failed
              </Badge>
              {lastDispatchResult?.status && <Badge variant="secondary">Last: {lastDispatchResult.status}</Badge>}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6">
            <SchedulingControlPanel
              title="Broadcast Scheduling Control Panel"
              description="Bulk schedule snapshot for today's social broadcast."
              entries={schedulingEntries}
            />
            <ScheduleRotator entries={schedulingEntries} title="Now Airing / Up Next (Staff Broadcast)" />
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">News Slot</CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => bumpCurrentNewsMutation.mutate()}
                    disabled={!activeNewsSlot || bumpCurrentNewsMutation.isPending}
                  >
                    {bumpCurrentNewsMutation.isPending ? "Bumping..." : "Bump"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeNewsSlot ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {activeNewsSlot.content_type.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline">{activeNewsSlot.slot_time}</Badge>
                      <Badge variant="outline">{activeNewsSlot.status}</Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{activeNewsSlot.content}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No scheduled slot for this day.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription>Hour-by-hour dispatch timeline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayScheduleQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading schedule...</p>
                ) : scheduleByHour.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scheduled dispatches for this filter.</p>
                ) : (
                  scheduleByHour.map(([hour, entries]) => (
                    <div key={hour} className="rounded border p-3 space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{hour}</p>
                      {entries.map((episode) => {
                        const preface = resolvePreface(prefaceTemplates, episode, chapterMap.get(episode.chapter_id ?? ""));
                        const displayPlatform = schedulePlatform(episode);
                        const roleLabel = episode.dispatch_role ? episode.dispatch_role.replace("_", " ") : null;
                        const windowLabel = episode.window_used?.start && episode.window_used?.end
                          ? `${episode.window_used.start}-${episode.window_used.end}`
                          : null;
                        return (
                          <div key={episode.id} className="rounded border p-2 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{formatTime(episode.scheduled_for)}</Badge>
                              <Badge variant="secondary">{seriesLabel(episode.channel)}</Badge>
                              <Badge className={platformBadgeClass(displayPlatform)}>
                                {platformGlyph(displayPlatform)} {displayPlatform}
                              </Badge>
                              {roleLabel && <Badge variant="outline" className="capitalize">{roleLabel}</Badge>}
                              {windowLabel && (
                                <Badge variant="outline">
                                  Window {windowLabel} {episode.dispatch_tz ? `(${episode.dispatch_tz})` : ""}
                                </Badge>
                              )}
                              {episode.dispatch_staggered_from && (
                                <Badge variant="outline">
                                  {episode.dispatch_staggered_from === "x" ? "Staggered from X" : "Independent cadence"}
                                </Badge>
                              )}
                              <Badge variant={statusBadgeVariant(episode.status)}>{episode.status ?? "scheduled"}</Badge>
                            </div>
                            <p className="text-sm">{truncate(episode.content ?? "", 50)}</p>
                            {preface && (
                              <details className="text-xs text-muted-foreground">
                                <summary className="cursor-pointer font-medium">Preface preview</summary>
                                <p className="mt-1 whitespace-pre-wrap">{preface}</p>
                              </details>
                            )}
                            <SchedulingEntryBox
                              contentType="distribution_post"
                              contentId={episode.id}
                              contentTitle={`${seriesLabel(episode.channel)} #${episode.sequence_number ?? "?"}`}
                              target="distribution-grid"
                              defaultDate={episode.scheduled_for ? parseISO(episode.scheduled_for) : new Date()}
                              triggerLabel={updateEpisodeScheduleMutation.isPending ? "Saving..." : "Reschedule"}
                              buttonVariant="outline"
                              buttonClassName="h-7 px-2 text-xs"
                              onSubmitEntry={async (entry) => {
                                await updateEpisodeScheduleMutation.mutateAsync({
                                  episodeId: episode.id,
                                  scheduledAtIso: entry.scheduledAt.toISOString(),
                                });
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement Monitor</CardTitle>
                <CardDescription>Seven-day snapshot by platform and episode.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {metricsByPlatform.map((metric) => (
                    <div key={metric.platform} className="rounded border p-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="capitalize font-medium">{metric.platform}</span>
                        <span>{metric.posts} posts</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Reach {metric.reach.toLocaleString()} | Engagement {metric.engagementRate.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                  {metricsByPlatform.length === 0 && (
                    <p className="text-sm text-muted-foreground">No analytics rows available yet.</p>
                  )}
                </div>

                <div className="rounded border p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Top performer today</p>
                  {topPerformer ? (
                    <p className="text-sm mt-1">
                      {asString(topPerformer.episode_title) || asString(topPerformer.episode_id) || "Episode"} -{" "}
                      {(asNumber(topPerformer.engagement_rate) ?? asNumber(topPerformer.engagement) ?? 0).toFixed(2)}%
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No performance rows for this date yet.</p>
                  )}
                </div>

                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">7-day trend</p>
                  {trend.map((point) => (
                    <div key={point.day} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{point.day}</span>
                        <span>{point.value.toFixed(2)}</span>
                      </div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded bg-primary"
                          style={{ width: `${Math.max(6, Math.round((point.value / maxTrend) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {trend.length === 0 && <p className="text-sm text-muted-foreground">No trend data available.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Breaking News
                </CardTitle>
                <CardDescription>Quick-post and immediate dispatch.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Textarea
                  rows={4}
                  placeholder="Write the breaking news copy..."
                  value={breakingNewsContent}
                  onChange={(event) => setBreakingNewsContent(event.target.value)}
                />
                <Input
                  placeholder="Source (optional)"
                  value={breakingNewsSource}
                  onChange={(event) => setBreakingNewsSource(event.target.value)}
                />
                <Button onClick={() => breakingNewsMutation.mutate()} disabled={breakingNewsMutation.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  {breakingNewsMutation.isPending ? "Dispatching..." : "Bump & Dispatch"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Pipeline</CardTitle>
                <CardDescription>Queue depth and near-term content readiness.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded border p-3 space-y-2">
                  <p className="text-sm font-medium">Upcoming episodes (next 24h)</p>
                  {upcoming24h.slice(0, 8).map((episode) => (
                    <div key={episode.id} className="text-xs flex items-center justify-between border rounded px-2 py-1.5">
                      <span>{seriesLabel(episode.channel)} #{episode.sequence_number ?? "?"}</span>
                      <span className="text-muted-foreground">{formatTime(episode.scheduled_for)}</span>
                    </div>
                  ))}
                  {upcoming24h.length === 0 && (
                    <p className="text-sm text-muted-foreground">No scheduled entries in the next 24 hours.</p>
                  )}
                </div>

                <div className="rounded border p-3 space-y-2">
                  <p className="text-sm font-medium">Series progress</p>
                  <p className="text-xs text-muted-foreground">
                    BST Chapter {bstProgress.chapter?.chapter_number ?? "-"}, Episode {bstProgress.episodeNumber || "-"} of{" "}
                    {bstProgress.total || "-"}
                  </p>
                  <Progress value={bstProgress.pct} />
                </div>

                <div className="rounded border p-3">
                  <p className="text-sm font-medium">Spoonfuls queue depth</p>
                  <p className="text-2xl font-semibold mt-1">{spoonfulsQueueDepth}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vote Gate Progress</CardTitle>
                <CardDescription>Celebratory unlock progress for BST chapter papers.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChapterUnlockProgress />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preface Templates</CardTitle>
                <CardDescription>Review and edit chapter preface text.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {prefaceTemplates.slice(0, 6).map((template) => {
                  const id = asString(template.id);
                  if (!id) return null;
                  const rawText = asString(template.template_text) || asString(template.preface_text) || "";
                  const nextText = prefaceDrafts[id] ?? rawText;
                  return (
                    <div key={id} className="rounded border p-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Chapter {asString(template.chapter_number) || asString(template.chapter_id) || "template"}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePrefaceMutation.mutate(id)}
                          disabled={updatePrefaceMutation.isPending || nextText.trim() === rawText.trim()}
                        >
                          Save
                        </Button>
                      </div>
                      <Textarea
                        rows={3}
                        value={nextText}
                        onChange={(event) =>
                          setPrefaceDrafts((prev) => ({ ...prev, [id]: event.target.value }))
                        }
                      />
                    </div>
                  );
                })}
                {prefaceTemplates.length === 0 && (
                  <p className="text-sm text-muted-foreground">No preface templates found.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Content Calendar (7 days)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {calendarDays.map((day) => (
                  <div key={day.day} className="rounded border p-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>{day.day}</span>
                      <span>{day.bst + day.spoonfuls + day.other} posts</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.max(4, day.bst * 8)}%` }} />
                      <div
                        className="h-2 rounded bg-amber-500"
                        style={{ width: `${Math.max(4, day.spoonfuls * 8)}%` }}
                      />
                      <div className="h-2 rounded bg-violet-500" style={{ width: `${Math.max(4, day.other * 8)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

async function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["dispatch-schedule"] }),
    queryClient.invalidateQueries({ queryKey: ["news-slot"] }),
    queryClient.invalidateQueries({ queryKey: ["distribution-analytics"] }),
    queryClient.invalidateQueries({ queryKey: ["content-pipeline"] }),
    queryClient.invalidateQueries({ queryKey: ["upcoming-24h"] }),
    queryClient.invalidateQueries({ queryKey: ["content-calendar"] }),
  ]);
}

function normalizePlatform(value: string | null | undefined) {
  const normalized = (value || "twitter").toLowerCase();
  return normalized.replace("x", "twitter");
}

function schedulePlatform(episode: CrewmanEpisode) {
  return normalizePlatform(episode.target_platform || episode.platform);
}

function truncate(value: string, max: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function statusBadgeVariant(status: string | null) {
  if (status === "failed") return "destructive" as const;
  if (status === "posted" || status === "dispatched") return "default" as const;
  return "secondary" as const;
}

function formatTime(value: string | null) {
  if (!value) return "--";
  return format(parseISO(value), "h:mm a");
}

function seriesLabel(channel: CrewmanEpisode["channel"]) {
  if (channel === "bst") return "BST";
  if (channel === "spoonfuls") return "Spoonfuls";
  if (channel === "skipping_stones") return "Skipping Stones";
  return "Series";
}

function platformGlyph(platform: string) {
  const map: Record<string, string> = {
    twitter: "X",
    linkedin: "in",
    threads: "@",
    bluesky: "B",
    instagram: "IG",
    facebook: "f",
  };
  return map[platform] || "?";
}

function platformBadgeClass(platform: string) {
  return `capitalize border ${PLATFORM_COLORS[platform] ?? "bg-muted text-foreground border-border"}`;
}

function parseHourLabel(label: string) {
  const parsed = Number(label.replace("am", "").replace("pm", ""));
  if (!Number.isFinite(parsed)) return 0;
  if (label.includes("pm") && parsed !== 12) return parsed + 12;
  if (label.includes("am") && parsed === 12) return 0;
  return parsed;
}

function resolvePreface(templates: PrefaceTemplate[], episode: CrewmanEpisode, chapter: Chapter | null | undefined) {
  for (const template of templates) {
    const chapterNumber = asString(template.chapter_number);
    const channel = asString(template.channel);
    if (channel && episode.channel && channel.toLowerCase() !== episode.channel.toLowerCase()) continue;
    if (chapter && chapterNumber && chapterNumber !== String(chapter.chapter_number)) continue;
    const text = asString(template.template_text) || asString(template.preface_text);
    if (text) return text;
  }
  return "";
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
