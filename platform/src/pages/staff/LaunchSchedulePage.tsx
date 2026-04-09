import { useEffect, useMemo, useState } from "react";
import { addDays, format, parseISO } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchedulingEntryBox } from "@/components/scheduling/SchedulingEntryBox";
import { SchedulingControlPanel } from "@/components/scheduling/SchedulingControlPanel";
import { ScheduleRotator } from "@/components/scheduling/ScheduleRotator";
import type { SchedulingEntry } from "@/components/scheduling/types";

type CrewmanEpisode = {
  id: string;
  sequence_number: number | null;
  content: string | null;
  channel: "bst" | "spoonfuls" | "skipping_stones" | null;
  platform: string | null;
  scheduled_for: string | null;
  status: string | null;
  primary_spice: string | null;
  tags: string[] | null;
};

type AccessLevel = "private" | "semi_public" | "public";

type ViewingToken = {
  id: string;
  token: string;
  label: string | null;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  is_active: boolean;
  created_at: string;
};

type ViewingScheduleView = {
  token_id: string | null;
  viewed_at: string;
};

type NewsSlot = {
  id: string;
  scheduled_date: string;
  slot_time: string;
  content_type: "stats" | "breaking_news" | "deferred";
  content: string;
  original_date: string | null;
  breaking_news_source: string | null;
  status: "scheduled" | "dispatched" | "deferred";
  created_at: string;
  dispatched_at: string | null;
};

type DispatchNowResult = {
  success?: boolean;
  status?: string;
  news_slot_id?: string;
  episode_id?: string;
  platform?: string;
  platform_post_id?: string;
  content_type?: string;
  simulated?: boolean;
};

const CT_OFFSET = "-05:00";
const GRID_PLATFORMS = ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"] as const;
const DAY_START = parseISO("2026-04-05T00:00:00-05:00");
const DAYS = Array.from({ length: 10 }, (_, i) => addDays(DAY_START, i));

export default function LaunchSchedulePage() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(DAY_START);
  const [selectedEpisode, setSelectedEpisode] = useState<CrewmanEpisode | null>(null);
  const [tokenLabel, setTokenLabel] = useState("");
  const [tokenExpiresDays, setTokenExpiresDays] = useState("5");
  const [tokenMaxUses, setTokenMaxUses] = useState("");
  const [pendingAccessLevel, setPendingAccessLevel] = useState<AccessLevel>("private");
  const [breakingNewsContent, setBreakingNewsContent] = useState("");
  const [breakingNewsSource, setBreakingNewsSource] = useState("");
  const [lastDispatchResult, setLastDispatchResult] = useState<DispatchNowResult | null>(null);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const nextDateKey = format(addDays(selectedDate, 1), "yyyy-MM-dd");

  const episodesQuery = useQuery({
    queryKey: ["launch-schedule", selectedDateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_episodes" as never)
        .select("id, sequence_number, content, channel, platform, scheduled_for, status, primary_spice, tags")
        .gte("scheduled_for", `${selectedDateKey}T00:00:00${CT_OFFSET}`)
        .lt("scheduled_for", `${nextDateKey}T00:00:00${CT_OFFSET}`)
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CrewmanEpisode[];
    },
  });

  const accessFlagQuery = useQuery({
    queryKey: ["viewing-schedule-access-flag"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_feature_flags" as never)
        .select("flag_key, flag_value, description")
        .eq("flag_key", "viewing_schedule_access")
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as { flag_key: string; flag_value: AccessLevel; description: string | null } | null;
    },
    enabled: !!user && isAdmin,
  });

  const tokensQuery = useQuery({
    queryKey: ["viewing-schedule-tokens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viewing_schedule_tokens" as never)
        .select("id, token, label, expires_at, max_uses, use_count, is_active, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as unknown as ViewingToken[];
    },
    enabled: !!user && isAdmin,
  });

  const viewsQuery = useQuery({
    queryKey: ["viewing-schedule-views"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viewing_schedule_views" as never)
        .select("token_id, viewed_at")
        .order("viewed_at", { ascending: false })
        .limit(2000);
      if (error) throw error;
      return (data ?? []) as unknown as ViewingScheduleView[];
    },
    enabled: !!user && isAdmin,
  });

  const newsSlotsQuery = useQuery({
    queryKey: ["distribution-news-slots", selectedDateKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distribution_news_slots" as never)
        .select(
          "id, scheduled_date, slot_time, content_type, content, original_date, breaking_news_source, status, created_at, dispatched_at",
        )
        .eq("scheduled_date", selectedDateKey)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as NewsSlot[];
    },
    enabled: !!user && isAdmin,
  });

  const setAccessLevelMutation = useMutation({
    mutationFn: async (level: AccessLevel) => {
      const payload = {
        flag_key: "viewing_schedule_access",
        flag_value: level,
        description: "Access level: private | semi_public | public",
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      };
      const { error } = await supabase
        .from("platform_feature_flags" as never)
        .upsert(payload as never, { onConflict: "flag_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Viewing schedule access level updated.");
      queryClient.invalidateQueries({ queryKey: ["viewing-schedule-access-flag"] });
    },
    onError: () => toast.error("Failed to update access level."),
  });

  const createTokenMutation = useMutation({
    mutationFn: async () => {
      const expiresDays = Number(tokenExpiresDays);
      const maxUses = Number(tokenMaxUses);
      const { data, error } = await supabase.functions.invoke("create-viewing-token", {
        body: {
          label: tokenLabel || null,
          expires_days: Number.isFinite(expiresDays) && expiresDays > 0 ? expiresDays : undefined,
          max_uses: Number.isFinite(maxUses) && maxUses > 0 ? maxUses : undefined,
        },
      });
      if (error) throw error;
      return data as { url?: string };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["viewing-schedule-tokens"] });
      if (result?.url) {
        await navigator.clipboard.writeText(result.url).catch(() => undefined);
        toast.success("Shareable link created and copied.");
      } else {
        toast.success("Shareable link created.");
      }
      setTokenLabel("");
      setTokenMaxUses("");
    },
    onError: () => toast.error("Failed to create shareable link."),
  });

  const toggleTokenMutation = useMutation({
    mutationFn: async ({ id, nextActive }: { id: string; nextActive: boolean }) => {
      const { error } = await supabase
        .from("viewing_schedule_tokens" as never)
        .update({ is_active: nextActive } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewing-schedule-tokens"] });
      toast.success("Token updated.");
    },
    onError: () => toast.error("Failed to update token."),
  });

  const runGridMutation = useMutation({
    mutationFn: async () => {
      const dayNumber = Number(selectedDateKey.slice(-2));
      const slotsPerDay = dayNumber === 12 ? 3 : 6;
      const { error } = await supabase.functions.invoke("schedule-distribution-grid", {
        body: {
          date: selectedDateKey,
          channels: [...GRID_PLATFORMS],
          slots_per_day: slotsPerDay,
          series_mix: { bst: 1, spoonfuls: 2, skipping_stones: 1 },
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Grid schedule run complete for ${selectedDateKey}.`);
      queryClient.invalidateQueries({ queryKey: ["launch-schedule"] });
    },
    onError: () => toast.error("Grid scheduling failed."),
  });

  const dispatchNowMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("dispatch-crewman-episode", {
        body: {},
      });
      if (error) throw error;
      return data as DispatchNowResult;
    },
    onSuccess: (result) => {
      setLastDispatchResult(result ?? null);
      const status = result?.status;
      if (status === "news_slot_dispatched") {
        toast.success("Dispatch complete: news slot post sent.");
      } else if (status === "posted") {
        toast.success("Dispatch complete: queued episode posted.");
      } else {
        toast.message("Dispatch check completed.");
      }
      queryClient.invalidateQueries({ queryKey: ["launch-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["distribution-news-slots", selectedDateKey] });
    },
    onError: () => toast.error("Dispatch test failed."),
  });

  const generateDailyStatsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-daily-stats", {
        body: { date: selectedDateKey },
      });
      if (error) throw error;
      return data as { skipped?: boolean };
    },
    onSuccess: (result) => {
      if (result?.skipped) {
        toast.message(`News slot already exists for ${selectedDateKey}.`);
      } else {
        toast.success(`News slot stats generated for ${selectedDateKey}.`);
      }
      queryClient.invalidateQueries({ queryKey: ["distribution-news-slots", selectedDateKey] });
    },
    onError: () => toast.error("Failed to generate daily stats slot."),
  });

  const bumpNewsSlotMutation = useMutation({
    mutationFn: async () => {
      const content = breakingNewsContent.trim();
      if (!content) {
        throw new Error("Breaking news content is required.");
      }
      const { error } = await supabase.functions.invoke("bump-news-slot", {
        body: {
          date: selectedDateKey,
          breaking_news_content: content,
          source: breakingNewsSource.trim() || "manual",
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`News slot bumped with breaking news for ${selectedDateKey}.`);
      setBreakingNewsContent("");
      setBreakingNewsSource("");
      queryClient.invalidateQueries({ queryKey: ["distribution-news-slots", selectedDateKey] });
    },
    onError: () => toast.error("Failed to bump news slot."),
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedIso: string) => {
      if (!selectedEpisode) return;
      const { error } = await supabase
        .from("crewman_episodes" as never)
        .update({ scheduled_for: updatedIso })
        .eq("id", selectedEpisode.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Schedule updated.");
      queryClient.invalidateQueries({ queryKey: ["launch-schedule"] });
    },
    onError: () => toast.error("Failed to update schedule."),
  });

  const episodes = episodesQuery.data ?? [];
  const statusCounts = useMemo(() => {
    let dispatched = 0;
    let failed = 0;
    for (const episode of episodes) {
      if (episode.status === "posted") dispatched += 1;
      if (episode.status === "failed") failed += 1;
    }
    return {
      scheduled: episodes.length,
      dispatched,
      failed,
    };
  }, [episodes]);

  const gridRows = useMemo(() => {
    const hours = new Set<number>([9, 10, 11, 12, 13, 14, 15, 16]);
    for (const episode of episodes) {
      if (!episode.scheduled_for) continue;
      const hour = Number(format(parseISO(episode.scheduled_for), "H"));
      if (Number.isFinite(hour)) hours.add(hour);
    }
    return [...hours].sort((a, b) => a - b);
  }, [episodes]);

  const byHourPlatform = useMemo(() => {
    const map = new Map<string, CrewmanEpisode[]>();
    for (const episode of episodes) {
      if (!episode.scheduled_for) continue;
      const hour = Number(format(parseISO(episode.scheduled_for), "H"));
      const platform = (episode.platform ?? "twitter").toLowerCase();
      const key = `${hour}|${platform}`;
      const current = map.get(key) ?? [];
      current.push(episode);
      map.set(key, current);
    }
    return map;
  }, [episodes]);

  const tokenRows = tokensQuery.data ?? [];
  const viewRows = viewsQuery.data ?? [];

  const analytics = useMemo(() => {
    const tokenLabelById = new Map<string, string>();
    for (const token of tokenRows) {
      tokenLabelById.set(token.id, token.label || `${token.token.slice(0, 8)}...`);
    }

    const viewsByToken = new Map<string, number>();
    const viewsByDay = new Map<string, number>();

    for (const view of viewRows) {
      const tokenId = view.token_id ?? "public";
      viewsByToken.set(tokenId, (viewsByToken.get(tokenId) ?? 0) + 1);
      const day = view.viewed_at.slice(0, 10);
      viewsByDay.set(day, (viewsByDay.get(day) ?? 0) + 1);
    }

    const tokenBreakdown = Array.from(viewsByToken.entries())
      .map(([tokenId, count]) => ({
        tokenId,
        count,
        label: tokenId === "public" ? "Public (no token)" : (tokenLabelById.get(tokenId) ?? "Unknown token"),
      }))
      .sort((a, b) => b.count - a.count);

    const timeline = Array.from(viewsByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([day, count]) => ({ day, count }));

    return {
      totalViews: viewRows.length,
      tokenBreakdown,
      timeline,
    };
  }, [tokenRows, viewRows]);

  const currentAccessLevel = accessFlagQuery.data?.flag_value ?? "private";
  const newsSlots = newsSlotsQuery.data ?? [];
  const activeNewsSlot = newsSlots.find((slot) => slot.status === "scheduled" && slot.content_type !== "deferred")
    ?? newsSlots.find((slot) => slot.status === "scheduled")
    ?? null;
  const schedulingEntries: SchedulingEntry[] = useMemo(
    () =>
      episodes
        .filter((episode) => episode.scheduled_for)
        .map((episode) => ({
          id: episode.id,
          contentType: "distribution_post",
          contentId: episode.id,
          contentTitle: `${episode.channel?.toUpperCase() ?? "EP"} #${episode.sequence_number ?? "?"}`,
          scheduledAt: new Date(episode.scheduled_for as string),
          target: "distribution-grid",
        })),
    [episodes],
  );

  useEffect(() => {
    if (accessFlagQuery.data?.flag_value) {
      setPendingAccessLevel(accessFlagQuery.data.flag_value);
    }
  }, [accessFlagQuery.data?.flag_value]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-launch-schedule">
        <div className="space-y-6">
        <Card>
          <CardHeader>
            <StaffPageHeader
              title="Opening Gambit Reloaded - Launch Schedule"
              description="Manage Apr 5-14 dispatch timing and run the grid scheduler for the selected day."
              actions={
                <>
                <Button
                  variant="outline"
                  onClick={() => dispatchNowMutation.mutate()}
                  disabled={dispatchNowMutation.isPending}
                >
                  {dispatchNowMutation.isPending ? "Dispatching..." : "Dispatch Now (Test)"}
                </Button>
                <Button onClick={() => runGridMutation.mutate()} disabled={runGridMutation.isPending}>
                  {runGridMutation.isPending ? "Running Grid..." : "Run Grid"}
                </Button>
                </>
              }
            />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={key === selectedDateKey ? "default" : "outline"}
                    onClick={() => setSelectedDate(day)}
                  >
                    {format(day, "MMM d")}
                  </Button>
                );
              })}
            </div>
            {lastDispatchResult && (
              <div className="mt-4 rounded border p-3 space-y-2">
                <p className="text-sm font-medium">Last Dispatch Result</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{lastDispatchResult.status ?? "unknown"}</Badge>
                  {lastDispatchResult.platform && (
                    <Badge variant="outline">{lastDispatchResult.platform}</Badge>
                  )}
                  {typeof lastDispatchResult.simulated === "boolean" && (
                    <Badge variant={lastDispatchResult.simulated ? "secondary" : "default"}>
                      {lastDispatchResult.simulated ? "simulated" : "live"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
                  {JSON.stringify(lastDispatchResult, null, 2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <SchedulingControlPanel
            title="Distribution Scheduling Control Panel"
            description="Bulk schedule snapshot for the selected day."
            entries={schedulingEntries}
            onOpenEntry={(entry) => {
              const episode = episodes.find((item) => item.id === entry.contentId);
              if (episode) setSelectedEpisode(episode);
            }}
          />
          <ScheduleRotator entries={schedulingEntries} title="Now Airing / Up Next (Distribution Grid)" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>News Slot</CardTitle>
                <CardDescription>
                  Reserved daily slot at 17:00 UTC (12:00 CT). Defaults to stats and can be bumped by breaking news.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => generateDailyStatsMutation.mutate()}
                disabled={generateDailyStatsMutation.isPending}
              >
                {generateDailyStatsMutation.isPending ? "Generating..." : "Generate Daily Stats"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {newsSlotsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading news slot...</p>
            ) : activeNewsSlot ? (
              <div className="rounded border p-3 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{activeNewsSlot.content_type.replace("_", " ")}</Badge>
                  <Badge variant={activeNewsSlot.status === "dispatched" ? "default" : "outline"}>
                    {activeNewsSlot.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {activeNewsSlot.scheduled_date} @ {activeNewsSlot.slot_time}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{activeNewsSlot.content}</p>
                {activeNewsSlot.breaking_news_source && (
                  <p className="text-xs text-muted-foreground">
                    Source: {activeNewsSlot.breaking_news_source}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No scheduled news slot for this date yet.
              </p>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Bump with Breaking News</p>
              <Textarea
                rows={4}
                placeholder="Paste breaking news post copy (~280 chars recommended)."
                value={breakingNewsContent}
                onChange={(event) => setBreakingNewsContent(event.target.value)}
              />
              <Input
                placeholder="Source key (example: crown_response_maneet)"
                value={breakingNewsSource}
                onChange={(event) => setBreakingNewsSource(event.target.value)}
              />
              <Button onClick={() => bumpNewsSlotMutation.mutate()} disabled={bumpNewsSlotMutation.isPending}>
                {bumpNewsSlotMutation.isPending ? "Bumping..." : "Bump with Breaking News"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viewing Schedule Access Panel</CardTitle>
            <CardDescription>
              Control private → semi-public → public rollout, generate invite links, and watch access analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="uppercase tracking-wide">
                Current: {currentAccessLevel.replace("_", " ")}
              </Badge>
              <div className="flex flex-wrap gap-2">
                {(["private", "semi_public", "public"] as AccessLevel[]).map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={pendingAccessLevel === level ? "default" : "outline"}
                    onClick={() => setPendingAccessLevel(level)}
                  >
                    {level.replace("_", " ")}
                  </Button>
                ))}
                <Button
                  size="sm"
                  onClick={() => setAccessLevelMutation.mutate(pendingAccessLevel)}
                  disabled={setAccessLevelMutation.isPending || pendingAccessLevel === currentAccessLevel}
                >
                  {setAccessLevelMutation.isPending ? "Saving..." : "Set access level"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1.2fr_0.5fr_0.5fr_auto]">
              <Input
                placeholder="Token label (Phase 3 media, Crown recipients, etc.)"
                value={tokenLabel}
                onChange={(event) => setTokenLabel(event.target.value)}
              />
              <Input
                type="number"
                min={1}
                placeholder="Expires (days)"
                value={tokenExpiresDays}
                onChange={(event) => setTokenExpiresDays(event.target.value)}
              />
              <Input
                type="number"
                min={1}
                placeholder="Max uses"
                value={tokenMaxUses}
                onChange={(event) => setTokenMaxUses(event.target.value)}
              />
              <Button onClick={() => createTokenMutation.mutate()} disabled={createTokenMutation.isPending}>
                {createTokenMutation.isPending ? "Creating..." : "Create shareable link"}
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Active tokens</p>
              {tokensQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading tokens...</p>
              ) : tokenRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tokens yet.</p>
              ) : (
                <div className="space-y-2">
                  {tokenRows.slice(0, 12).map((token) => {
                    const shareUrl = `https://lianabanyan.com/viewing-schedule?t=${token.token}`;
                    return (
                      <div key={token.id} className="rounded border p-3 text-sm space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-medium">{token.label || `${token.token.slice(0, 12)}...`}</div>
                          <Badge variant={token.is_active ? "default" : "secondary"}>
                            {token.is_active ? "active" : "inactive"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Uses: {token.use_count}
                          {typeof token.max_uses === "number" ? ` / ${token.max_uses}` : ""} | Expires:{" "}
                          {token.expires_at ? format(parseISO(token.expires_at), "MMM d, yyyy h:mm a") : "never"}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              await navigator.clipboard.writeText(shareUrl).catch(() => undefined);
                              toast.success("Link copied.");
                            }}
                          >
                            Copy link
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleTokenMutation.mutate({ id: token.id, nextActive: !token.is_active })}
                          >
                            {token.is_active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                View analytics: {analytics.totalViews} total views
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Views by token</p>
                  {analytics.tokenBreakdown.slice(0, 8).map((row) => (
                    <div key={row.tokenId} className="flex items-center justify-between text-sm">
                      <span className="truncate pr-2">{row.label}</span>
                      <span>{row.count}</span>
                    </div>
                  ))}
                  {analytics.tokenBreakdown.length === 0 && (
                    <p className="text-sm text-muted-foreground">No tracked views yet.</p>
                  )}
                </div>
                <div className="rounded border p-3 space-y-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground">7-day timeline</p>
                  {analytics.timeline.map((row) => (
                    <div key={row.day} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{row.day}</span>
                        <span>{row.count}</span>
                      </div>
                      <div className="h-2 rounded bg-muted">
                        <div
                          className="h-2 rounded bg-primary"
                          style={{ width: `${Math.max(8, Math.min(100, row.count * 10))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.timeline.length === 0 && (
                    <p className="text-sm text-muted-foreground">No timeline data yet.</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{format(selectedDate, "EEEE, MMMM d")}</CardTitle>
            <CardDescription>
              Status: {statusCounts.scheduled} scheduled | {statusCounts.dispatched} dispatched | {statusCounts.failed} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {episodesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading schedule...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">CT Time</TableHead>
                    {GRID_PLATFORMS.map((platform) => (
                      <TableHead key={platform} className="capitalize">
                        {platform}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gridRows.map((hour) => (
                    <TableRow key={hour}>
                      <TableCell>{formatHour(hour)}</TableCell>
                      {GRID_PLATFORMS.map((platform) => {
                        const key = `${hour}|${platform}`;
                        const cellEpisodes = byHourPlatform.get(key) ?? [];
                        return (
                          <TableCell key={key} className="align-top">
                            <div className="space-y-1">
                              {cellEpisodes.length === 0 && (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                              {cellEpisodes.map((episode) => (
                                <button
                                  key={episode.id}
                                  type="button"
                                  className="text-left w-full rounded border p-1.5 hover:bg-muted/50"
                                  onClick={() => {
                                    setSelectedEpisode(episode);
                                  }}
                                >
                                  <div className="text-xs font-medium">
                                    {episode.channel?.toUpperCase() ?? "EP"} #{episode.sequence_number ?? "?"}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground line-clamp-2">
                                    {truncateText(episode.content ?? "", 72)}
                                  </div>
                                  {episode.primary_spice && (
                                    <Badge variant="secondary" className="mt-1 capitalize">
                                      {episode.primary_spice}
                                    </Badge>
                                  )}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedEpisode && (
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedEpisode.channel?.toUpperCase()} #{selectedEpisode.sequence_number ?? "?"}
              </CardTitle>
              <CardDescription>Edit schedule time and review full content.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Platform: {selectedEpisode.platform ?? "unknown"}</span>
                <span>|</span>
                <span>Status: {selectedEpisode.status ?? "queued"}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{selectedEpisode.content ?? ""}</p>
              <SchedulingEntryBox
                contentType="distribution_post"
                contentId={selectedEpisode.id}
                contentTitle={`${selectedEpisode.channel?.toUpperCase() ?? "EP"} #${selectedEpisode.sequence_number ?? "?"}`}
                target="distribution-grid"
                defaultDate={selectedEpisode.scheduled_for ? parseISO(selectedEpisode.scheduled_for) : new Date()}
                triggerLabel={updateMutation.isPending ? "Saving..." : "Reschedule Post"}
                onSubmitEntry={async (entry) => {
                  const updatedIso = entry.scheduledAt.toISOString();
                  await updateMutation.mutateAsync(updatedIso);
                }}
              />
            </CardContent>
          </Card>
        )}
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function truncateText(content: string, max: number) {
  const normalized = content.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function formatHour(hour24: number) {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${suffix}`;
}

