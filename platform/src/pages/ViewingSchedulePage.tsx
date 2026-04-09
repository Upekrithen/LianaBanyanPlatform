import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { SpiceBadge } from "@/components/SpiceBadge";
import { SpiceFilter } from "@/components/SpiceFilter";
import { SpiceType, getSpiceMeta } from "@/lib/spiceRack";
import { PlayCircle, Tv, CalendarClock, Flame, Sparkles, Users } from "lucide-react";
import { SchedulingEntryBox } from "@/components/scheduling/SchedulingEntryBox";

type ScheduleEpisode = {
  id: string;
  chapter_id: string;
  sequence_number: number;
  content: string;
  tags: string[] | null;
  status: "queued" | "posted" | "failed";
  scheduled_for: string | null;
  channel: "bst" | "spoonfuls" | "skipping_stones";
  content_type: string | null;
  primary_spice: string | null;
  secondary_spices: string[] | null;
};

type Chapter = {
  id: string;
  chapter_number: number;
  title: string;
  episode_count: number;
  current_engagement: number;
  vote_threshold: number;
  status: "staged" | "streaming" | "published" | "completed";
};

const CHANNEL_ORDER = ["twitter", "linkedin", "threads", "bluesky", "instagram", "facebook"];
const CHANNEL_LINKS: Record<string, string> = {
  twitter: "https://x.com",
  linkedin: "https://linkedin.com",
  threads: "https://threads.net",
  bluesky: "https://bsky.app",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
};

const SERIES_META = {
  bst: {
    title: "BST",
    description: "Mainline narrative arc: chapter-by-chapter progress of the cooperative build.",
  },
  spoonfuls: {
    title: "Spoonfuls",
    description: "Short practical slices: one actionable idea viewers can carry immediately.",
  },
  skipping_stones: {
    title: "Skipping Stones",
    description: "Cross-links and context jumps that connect episodes to broader system threads.",
  },
};

type AccessLevel = "private" | "semi_public" | "public";

type AccessGateResult = {
  allowed: boolean;
  access_level: AccessLevel;
  reason?: string;
  token_label?: string | null;
};

const FULL_PUBLIC_DATE = "2026-04-14T00:00:00-05:00";

export default function ViewingSchedulePage() {
  const [selectedSpices, setSelectedSpices] = useState<SpiceType[]>([]);
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const inviteToken = useMemo(() => {
    const value = new URLSearchParams(location.search).get("t");
    return value?.trim() || null;
  }, [location.search]);

  const { data: accessGate, isLoading: accessLoading } = useQuery({
    queryKey: ["viewing-schedule-access", inviteToken, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("validate-viewing-access", {
        body: { token: inviteToken },
      });
      if (error) throw error;
      return (data ?? { allowed: false, access_level: "private" }) as AccessGateResult;
    },
    retry: 1,
  });

  const accessLevel = accessGate?.access_level ?? "private";
  const isAllowed = accessGate?.allowed ?? false;

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: todayEpisodes = [], isLoading } = useQuery({
    queryKey: ["viewing-schedule", dayStart.toISOString().slice(0, 10)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_episodes" as never)
        .select("id, chapter_id, sequence_number, content, tags, status, scheduled_for, channel, content_type, primary_spice, secondary_spices")
        .gte("scheduled_for", dayStart.toISOString())
        .lt("scheduled_for", dayEnd.toISOString())
        .order("scheduled_for", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as ScheduleEpisode[];
    },
    enabled: isAllowed,
    refetchInterval: 60_000,
  });

  const { data: chapterSnapshot = null } = useQuery({
    queryKey: ["viewing-schedule-chapter-snapshot"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crewman_chapters" as never)
        .select("id, chapter_number, title, episode_count, current_engagement, vote_threshold, status")
        .in("status", ["streaming", "published", "completed"])
        .order("chapter_number", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as Chapter | null;
    },
    enabled: isAllowed,
    refetchInterval: 60_000,
  });

  const filteredEpisodes = useMemo(() => {
    if (selectedSpices.length === 0) return todayEpisodes;
    return todayEpisodes.filter((episode) => {
      const episodeSpices = extractEpisodeSpices(episode);
      return selectedSpices.some((spice) => episodeSpices.includes(spice));
    });
  }, [todayEpisodes, selectedSpices]);

  const nowPlaying = useMemo(() => {
    const nowMs = Date.now();
    return filteredEpisodes.filter((episode) => {
      if (!episode.scheduled_for) return false;
      const slot = new Date(episode.scheduled_for).getTime();
      const deltaMinutes = Math.abs((slot - nowMs) / (1000 * 60));
      return deltaMinutes <= 45 || episode.status === "posted";
    });
  }, [filteredEpisodes]);

  const channelsInGrid = useMemo(() => {
    const discovered = new Set<string>();
    for (const episode of filteredEpisodes) {
      const channel = getAssignedPlatform(episode.content_type);
      if (channel) discovered.add(channel);
    }
    const sortedKnown = CHANNEL_ORDER.filter((channel) => discovered.has(channel));
    const extras = Array.from(discovered).filter((channel) => !CHANNEL_ORDER.includes(channel));
    return [...sortedKnown, ...extras];
  }, [filteredEpisodes]);

  const slotRows = useMemo(() => {
    const map = new Map<string, Record<string, ScheduleEpisode>>();
    for (const episode of filteredEpisodes) {
      if (!episode.scheduled_for) continue;
      const slotKey = toSlotKey(episode.scheduled_for);
      const channel = getAssignedPlatform(episode.content_type);
      if (!channel) continue;
      const row = map.get(slotKey) ?? {};
      row[channel] = episode;
      map.set(slotKey, row);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([slot, columns]) => ({ slot, columns }));
  }, [filteredEpisodes]);

  const bstEpisodes = useMemo(
    () => filteredEpisodes.filter((episode) => episode.channel === "bst"),
    [filteredEpisodes],
  );

  const seasonProgress = useMemo(() => {
    if (chapterSnapshot) {
      const percentage = Math.min(
        100,
        Math.round((chapterSnapshot.current_engagement / Math.max(1, chapterSnapshot.vote_threshold)) * 100),
      );
      return {
        chapterLabel: `Chapter ${chapterSnapshot.chapter_number}: ${chapterSnapshot.title}`,
        episodeCount: chapterSnapshot.episode_count,
        progressPct: percentage,
      };
    }

    const postedCount = bstEpisodes.filter((episode) => episode.status === "posted").length;
    const total = Math.max(1, bstEpisodes.length);
    return {
      chapterLabel: "BST chapter in progress",
      episodeCount: bstEpisodes.length,
      progressPct: Math.round((postedCount / total) * 100),
    };
  }, [chapterSnapshot, bstEpisodes]);

  if (accessLoading || (user && roleLoading)) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Checking schedule access...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAllowed && accessLevel === "private" && !isAdmin) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-2xl">Viewing Schedule</CardTitle>
            <CardDescription>
              This page is currently staff-only while launch sequencing is finalized.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Staff members can sign in to continue.
            </p>
            <a href="/auth" className="inline-flex">
              <Button>Staff Sign In</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <PlayCircle className="h-7 w-7" />
              🍿 Bring Popcorn
            </CardTitle>
            <CardDescription className="text-base">
              The show is almost live. Full schedule opens {formatCountdown(FULL_PUBLIC_DATE)}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are early. Invite links unlock preview access during the semi-public rollout.
            </p>
            <a href="/auth" className="inline-flex">
              <Button>Join the waitlist</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-6">
      {accessLevel === "semi_public" && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="py-3 text-sm">
            You&apos;re watching early! 🍿
            {accessGate?.token_label ? ` Access: ${accessGate.token_label}.` : ""}
          </CardContent>
        </Card>
      )}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-2">
            <PlayCircle className="h-8 w-8" />
            Bring Popcorn
          </CardTitle>
          <CardDescription className="text-base">
            Watch a cooperative being built, live, across six channels.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tv className="h-5 w-5" />
            Now Playing
          </CardTitle>
          <CardDescription>Current active posts across channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {nowPlaying.length ? nowPlaying.map((episode) => (
            <div key={episode.id} className="border rounded-md px-3 py-2 text-sm flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">
                  {SERIES_META[episode.channel].title} E{episode.sequence_number}
                </div>
                <div className="text-muted-foreground text-xs">{truncateText(episode.content, 110)}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {extractEpisodeSpices(episode).map((spice) => (
                    <SpiceBadge key={`${episode.id}-${spice}`} spice={spice} />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline">{titleCasePlatform(getAssignedPlatform(episode.content_type) ?? "channel")}</Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  {episode.scheduled_for ? new Date(episode.scheduled_for).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "TBD"}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground">
              Nothing is live right now. Check Today&apos;s Grid for upcoming slots.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" />
            Today&apos;s Grid
          </CardTitle>
          <CardDescription>Rows are time slots, columns are channels</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading schedule...</p>
          ) : slotRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scheduled posts yet for today.</p>
          ) : (
            <table className="min-w-[760px] w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b">Time</th>
                  {channelsInGrid.map((channel) => (
                    <th key={channel} className="text-left p-2 border-b">{titleCasePlatform(channel)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slotRows.map((row) => (
                  <tr key={row.slot} className="align-top">
                    <td className="p-2 border-b whitespace-nowrap font-medium">
                      {new Date(row.slot).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </td>
                    {channelsInGrid.map((channel) => {
                      const episode = row.columns[channel];
                      return (
                        <td key={`${row.slot}-${channel}`} className="p-2 border-b">
                          {episode ? (
                            <div className="rounded border p-2 space-y-1">
                              <Badge variant="secondary">{SERIES_META[episode.channel].title}</Badge>
                              <p className="text-xs">{truncateText(episode.content, 96)}</p>
                              <div className="flex flex-wrap gap-1">
                                {extractEpisodeSpices(episode).map((spice) => (
                                  <SpiceBadge key={`${episode.id}-${spice}`} spice={spice} />
                                ))}
                              </div>
                              <SchedulingEntryBox
                                contentType={toViewingContentType(episode.channel)}
                                contentId={episode.id}
                                contentTitle={`${SERIES_META[episode.channel].title} E${episode.sequence_number}`}
                                target="distribution-grid"
                                triggerLabel="Schedule"
                                buttonVariant="outline"
                                buttonClassName="h-7 px-2 text-xs"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Season Progress</CardTitle>
            <CardDescription>{seasonProgress.chapterLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Episode count: {seasonProgress.episodeCount}</span>
              <span>{seasonProgress.progressPct}% vote-gate progress</span>
            </div>
            <Progress value={seasonProgress.progressPct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Spice Filter
            </CardTitle>
            <CardDescription>Filter grid and now playing by tag</CardDescription>
          </CardHeader>
          <CardContent>
            <SpiceFilter selected={selectedSpices} onChange={setSelectedSpices} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Series Guide
          </CardTitle>
          <CardDescription>The three concurrent series in the distribution grid</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(Object.keys(SERIES_META) as Array<keyof typeof SERIES_META>).map((key) => (
            <div key={key} className="rounded-lg border p-4 space-y-2">
              <p className="font-semibold">{SERIES_META[key].title}</p>
              <p className="text-xs text-muted-foreground">{SERIES_META[key].description}</p>
              <div className="flex flex-wrap gap-1.5">
                {channelsInGrid.map((channel) => (
                  <a
                    key={`${key}-${channel}`}
                    href={CHANNEL_LINKS[channel] ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline text-primary"
                  >
                    {titleCasePlatform(channel)}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join the Show
          </CardTitle>
          <CardDescription>$5/year to go from audience to cast member.</CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/auth" className="inline-flex">
            <Button>Become a Member</Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

function truncateText(value: string, max: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}...`;
}

function getAssignedPlatform(contentType: string | null) {
  if (!contentType || !contentType.startsWith("platform:")) return null;
  return contentType.slice("platform:".length).toLowerCase();
}

function toSlotKey(isoDate: string) {
  const date = new Date(isoDate);
  date.setSeconds(0, 0);
  return date.toISOString();
}

function titleCasePlatform(value: string) {
  if (value === "twitter") return "X";
  if (value === "bluesky") return "Bluesky";
  if (value === "linkedin") return "LinkedIn";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractEpisodeSpices(episode: ScheduleEpisode): SpiceType[] {
  const ordered = [episode.primary_spice, ...(episode.secondary_spices ?? [])];
  const normalized = ordered
    .map((value) => getSpiceMeta(value)?.spice)
    .filter((value): value is SpiceType => !!value);

  if (normalized.length > 0) {
    return Array.from(new Set(normalized));
  }

  const legacyFromTags = (episode.tags ?? [])
    .map((tag) => getSpiceMeta(tag.trim().toLowerCase())?.spice)
    .filter((value): value is SpiceType => !!value);
  return Array.from(new Set(legacyFromTags));
}

function formatCountdown(iso: string) {
  const deltaMs = new Date(iso).getTime() - Date.now();
  if (deltaMs <= 0) return "now";
  const totalHours = Math.floor(deltaMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days <= 0) return `in ${hours}h`;
  return `in ${days}d ${hours}h`;
}

function toViewingContentType(channel: ScheduleEpisode["channel"]): "pudding" | "bst_episode" | "spoonful" | "skipping_stone" | "paper" {
  if (channel === "bst") return "bst_episode";
  if (channel === "spoonfuls") return "spoonful";
  return "skipping_stone";
}
