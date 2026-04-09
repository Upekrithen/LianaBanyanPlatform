import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock3, ListFilter, Tv2 } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { supabase } from "@/integrations/supabase/client";
import { SPICE_RACK, type SpiceType } from "@/lib/spiceRack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SchedulingEntryBox } from "@/components/scheduling/SchedulingEntryBox";

type ViewMode = "listings" | "schedule" | "calendar";
type ScheduleTheme = "guide" | "modern";
type SortMode = "newest" | "most-read" | "highest-rated";
type SeriesFilter = "all" | "bst" | "spoonfuls" | "puddings" | "skipping_stones" | "papers" | "news";
type DepthFilter = "all" | "skipping-stone" | "pudding" | "this-is-not-pudding";
type ReadingTimeFilter = "all" | "quick" | "medium" | "deep";

type ContentRow = {
  content_type: string;
  content_id: string;
  title: string;
  excerpt: string | null;
  primary_spice: SpiceType | null;
  secondary_spices: SpiceType[] | null;
  publish_date: string | null;
  estimated_reading_minutes: number | null;
  pepper_rating_avg: number | null;
  view_count: number | null;
  source_paper: string | null;
  pudding_text: string | null;
};

type ProgramItem = {
  id: string;
  title: string;
  excerpt: string;
  spice: SpiceType | null;
  series: Exclude<SeriesFilter, "all" | "papers">;
  seriesTags: Exclude<SeriesFilter, "all">[];
  depth: Exclude<DepthFilter, "all">;
  publishDate: string | null;
  readingMinutes: number;
  rating: number;
  views: number;
  startAt: Date;
  endAt: Date;
  rotationLabel: "Now Airing" | "Up Next" | "Later Today" | "Tomorrow" | "This Week";
  contentType: string;
};

const LANE_ORDER: Array<ProgramItem["series"]> = ["bst", "spoonfuls", "skipping_stones", "puddings", "news"];
const SERIES_LABEL: Record<ProgramItem["series"], string> = {
  bst: "BST Episodes",
  spoonfuls: "Spoonfuls",
  skipping_stones: "Skipping Stones",
  puddings: "Puddings",
  news: "News Slot",
};
const SPICE_COLOR: Record<SpiceType, string> = {
  salt: "#d4d4d8",
  garlic: "#e9d5ff",
  sugar: "#fbcfe8",
  cinnamon: "#fdba74",
  pepper: "#f87171",
  ginger: "#fb923c",
  cumin: "#a78bfa",
  paprika: "#ef4444",
  basil: "#34d399",
  oregano: "#84cc16",
};
const BLOCK_PIXEL_PER_MIN = 3.5;
const WINDOW_DAYS = 7;
const LISTINGS_PAGE_SIZE = 20;

export default function AllThePuddingPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("listings");
  const [scheduleTheme, setScheduleTheme] = useState<ScheduleTheme>("guide");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [seriesFilter, setSeriesFilter] = useState<SeriesFilter>("all");
  const [depthFilter, setDepthFilter] = useState<DepthFilter>("all");
  const [readingFilter, setReadingFilter] = useState<ReadingTimeFilter>("all");
  const [selectedSpices, setSelectedSpices] = useState<SpiceType[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const contentQuery = useQuery({
    queryKey: ["all-the-pudding-content"],
    queryFn: fetchAllCephasContent,
    staleTime: 60_000,
  });

  const baseItems = useMemo(() => {
    return buildProgramItems(contentQuery.data ?? []);
  }, [contentQuery.data]);

  const filteredItems = useMemo(() => {
    return baseItems.filter((item) => {
      const textHit =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(search.toLowerCase());

      const spiceHit = selectedSpices.length === 0 || (item.spice ? selectedSpices.includes(item.spice) : false);
      const seriesHit = seriesFilter === "all" || item.seriesTags.includes(seriesFilter as Exclude<SeriesFilter, "all">);
      const depthHit = depthFilter === "all" || item.depth === depthFilter;
      const readingHit =
        readingFilter === "all" ||
        (readingFilter === "quick" && item.readingMinutes < 3) ||
        (readingFilter === "medium" && item.readingMinutes >= 3 && item.readingMinutes <= 10) ||
        (readingFilter === "deep" && item.readingMinutes > 10);

      const itemDate = item.publishDate ? new Date(item.publishDate) : null;
      const startHit = !startDate || (itemDate ? itemDate >= new Date(`${startDate}T00:00:00`) : false);
      const endHit = !endDate || (itemDate ? itemDate <= new Date(`${endDate}T23:59:59`) : false);

      return textHit && spiceHit && seriesHit && depthHit && readingHit && startHit && endHit;
    });
  }, [baseItems, depthFilter, endDate, readingFilter, search, selectedSpices, seriesFilter, startDate]);

  const sortedItems = useMemo(() => {
    const copy = [...filteredItems];
    copy.sort((a, b) => {
      if (sortMode === "most-read") return b.views - a.views;
      if (sortMode === "highest-rated") return b.rating - a.rating;
      return new Date(b.publishDate ?? 0).getTime() - new Date(a.publishDate ?? 0).getTime();
    });
    return copy;
  }, [filteredItems, sortMode]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / LISTINGS_PAGE_SIZE));
  const pageItems = useMemo(() => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    const start = (safePage - 1) * LISTINGS_PAGE_SIZE;
    return sortedItems.slice(start, start + LISTINGS_PAGE_SIZE);
  }, [page, sortedItems, totalPages]);

  const scheduleWindow = useMemo(() => {
    const start = startOfDay(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + WINDOW_DAYS);
    return { start, end };
  }, []);

  const scheduleItems = useMemo(() => {
    return sortedItems.filter((item) => item.startAt >= scheduleWindow.start && item.startAt < scheduleWindow.end);
  }, [scheduleWindow.end, scheduleWindow.start, sortedItems]);

  const selectedProgram = useMemo(() => {
    if (!selectedProgramId) return null;
    return scheduleItems.find((item) => item.id === selectedProgramId) ?? null;
  }, [scheduleItems, selectedProgramId]);

  const nowIndicatorLeft = useMemo(() => {
    const now = new Date();
    const totalMs = scheduleWindow.end.getTime() - scheduleWindow.start.getTime();
    const elapsed = now.getTime() - scheduleWindow.start.getTime();
    const clamped = Math.max(0, Math.min(totalMs, elapsed));
    const trackWidth = totalMs / (60 * 1000) * BLOCK_PIXEL_PER_MIN;
    return (clamped / totalMs) * trackWidth;
  }, [scheduleWindow.end, scheduleWindow.start]);

  const dayBuckets = useMemo(() => {
    const map = new Map<string, ProgramItem[]>();
    for (const item of scheduleItems) {
      const key = toDateKey(item.startAt);
      const row = map.get(key) ?? [];
      row.push(item);
      map.set(key, row);
    }
    for (const row of map.values()) {
      row.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    }
    return map;
  }, [scheduleItems]);

  const calendarHeat = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of sortedItems) {
      const key = toDateKey(item.startAt);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [sortedItems]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const selectedCalendarRows = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return (dayBuckets.get(selectedCalendarDate) ?? []).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [dayBuckets, selectedCalendarDate]);

  function toContentUrl(item: ProgramItem) {
    if (item.contentType === "paper" || item.contentType === "pudding") {
      return `/cephas/pudding/${item.id.split(":")[1]}`;
    }
    return "/cephas/all-the-pudding";
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="full" xrayId="all-the-pudding">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="border-primary/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-background">
          <CardHeader>
            <CardTitle className="text-3xl md:text-4xl">All the Pudding</CardTitle>
            <CardDescription className="text-base md:text-lg">
              There is No Spoon
            </CardDescription>
            <p className="text-sm text-muted-foreground">
              Everything the cooperative has written - scheduled for your viewing.
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-5">
            <div className="flex flex-wrap gap-2">
              <Button variant={viewMode === "listings" ? "default" : "outline"} onClick={() => setViewMode("listings")}>📋 Listings</Button>
              <Button variant={viewMode === "schedule" ? "default" : "outline"} onClick={() => setViewMode("schedule")}>📺 Schedule</Button>
              <Button variant={viewMode === "calendar" ? "default" : "outline"} onClick={() => setViewMode("calendar")}>📅 Calendar</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search-all-pudding">Search titles/excerpts</Label>
                <Input
                  id="search-all-pudding"
                  placeholder="Search..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Series</Label>
                <Select value={seriesFilter} onValueChange={(value: SeriesFilter) => setSeriesFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All series</SelectItem>
                    <SelectItem value="bst">BST</SelectItem>
                    <SelectItem value="spoonfuls">Spoonfuls</SelectItem>
                    <SelectItem value="puddings">Puddings</SelectItem>
                    <SelectItem value="skipping_stones">Skipping Stones</SelectItem>
                    <SelectItem value="papers">Papers</SelectItem>
                    <SelectItem value="news">News Slot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Depth layer</Label>
                <Select value={depthFilter} onValueChange={(value: DepthFilter) => setDepthFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All depth layers</SelectItem>
                    <SelectItem value="skipping-stone">Skipping Stone</SelectItem>
                    <SelectItem value="pudding">Pudding</SelectItem>
                    <SelectItem value="this-is-not-pudding">This-is-NOT-Pudding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reading time</Label>
                <Select value={readingFilter} onValueChange={(value: ReadingTimeFilter) => setReadingFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All durations</SelectItem>
                    <SelectItem value="quick">Quick (&lt;3 min)</SelectItem>
                    <SelectItem value="medium">Medium (3-10 min)</SelectItem>
                    <SelectItem value="deep">Deep (&gt;10 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-start">Date range start</Label>
                <Input id="date-start" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-end">Date range end</Label>
                <Input id="date-end" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Spice tags</Label>
              <div className="flex flex-wrap gap-2">
                {SPICE_RACK.map((spice) => {
                  const active = selectedSpices.includes(spice.spice);
                  return (
                    <button
                      key={spice.spice}
                      type="button"
                      onClick={() =>
                        setSelectedSpices((prev) =>
                          prev.includes(spice.spice) ? prev.filter((entry) => entry !== spice.spice) : [...prev, spice.spice],
                        )
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        active ? "border-primary bg-primary/20 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {spice.emoji} {spice.displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {contentQuery.isLoading && (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">Loading cooperative programming...</CardContent>
          </Card>
        )}
        {contentQuery.isError && (
          <Card>
            <CardContent className="py-8 text-sm text-destructive">
              Could not load content. Ensure the `all_cephas_content` view migration is applied.
            </CardContent>
          </Card>
        )}

        {!contentQuery.isLoading && !contentQuery.isError && viewMode === "listings" && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ListFilter className="h-4 w-4" />
                  {sortedItems.length.toLocaleString()} matched listings
                </div>
                <div className="w-full sm:w-64">
                  <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="most-read">Most-read</SelectItem>
                      <SelectItem value="highest-rated">Highest-rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((item) => (
                <Card key={item.id} className="h-full">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{SERIES_LABEL[item.series]}</Badge>
                      <Badge variant="outline">{toDepthLabel(item.depth)}</Badge>
                    </div>
                    <CardDescription className="line-clamp-3">{item.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.spice ? `${spiceEmoji(item.spice)} ${capitalize(item.spice)}` : "Unspiced"}</span>
                      <span>•</span>
                      <span>{formatDate(item.publishDate)}</span>
                      <span>•</span>
                      <span>{item.readingMinutes} min</span>
                    </div>
                    <SchedulingEntryBox
                      contentType={toViewingContentType(item.contentType)}
                      contentId={item.id.split(":")[1]}
                      contentTitle={item.title}
                      contentUrl={toContentUrl(item)}
                      target="helm-calendar"
                      triggerLabel="Schedule Viewing"
                      buttonClassName="w-full"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                  Previous
                </Button>
                <p className="text-sm text-muted-foreground">Page {Math.min(page, totalPages)} of {totalPages}</p>
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                  Next
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {!contentQuery.isLoading && !contentQuery.isError && viewMode === "schedule" && (
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <Card className={scheduleTheme === "guide" ? "border-amber-500/40 bg-amber-900/10" : ""}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Tv2 className="h-5 w-5" />
                      TV Guide Schedule (7 Days)
                    </CardTitle>
                    <CardDescription>Programming blocks sized by reading time. Red line marks current time.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={scheduleTheme === "guide" ? "default" : "outline"} size="sm" onClick={() => setScheduleTheme("guide")}>
                      Old-school
                    </Button>
                    <Button variant={scheduleTheme === "modern" ? "default" : "outline"} size="sm" onClick={() => setScheduleTheme("modern")}>
                      Modern
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <div className="min-w-[2200px]">
                    <div className="ml-40 mb-2 grid grid-cols-7 gap-2 text-xs text-muted-foreground">
                      {Array.from({ length: WINDOW_DAYS }).map((_, index) => {
                        const day = new Date(scheduleWindow.start);
                        day.setDate(day.getDate() + index);
                        return <div key={toDateKey(day)}>{day.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</div>;
                      })}
                    </div>

                    <div className="relative border rounded-md p-3">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                        style={{ left: `${nowIndicatorLeft + 164}px` }}
                        aria-hidden="true"
                      />

                      {LANE_ORDER.map((lane) => (
                        <div key={lane} className="relative flex min-h-[84px] items-stretch border-b last:border-b-0">
                          <div className="w-40 shrink-0 py-3 text-sm font-medium text-muted-foreground">{SERIES_LABEL[lane]}</div>
                          <div className="relative flex-1">
                            {scheduleItems.filter((item) => item.series === lane).map((item) => {
                              const left = minutesBetween(scheduleWindow.start, item.startAt) * BLOCK_PIXEL_PER_MIN;
                              const width = Math.max(110, item.readingMinutes * BLOCK_PIXEL_PER_MIN);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => setSelectedProgramId(item.id)}
                                  className={`absolute top-2 h-[66px] rounded-md border px-2 py-1 text-left transition-shadow ${
                                    scheduleTheme === "guide"
                                      ? "border-amber-700/60 bg-amber-100/10 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.55)]"
                                      : "border-border bg-card hover:shadow-md"
                                  }`}
                                  style={{
                                    left,
                                    width,
                                    borderLeftColor: item.spice ? SPICE_COLOR[item.spice] : undefined,
                                    borderLeftWidth: 4,
                                  }}
                                >
                                  <p className="line-clamp-1 text-xs font-semibold">{item.title}</p>
                                  <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.excerpt}</p>
                                  <p className="mt-1 text-[10px] text-muted-foreground">
                                    {item.readingMinutes}m • {item.spice ? capitalize(item.spice) : "Unspiced"}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-5">
                  {(["Now Airing", "Up Next", "Later Today", "Tomorrow", "This Week"] as const).map((label) => {
                    const count = scheduleItems.filter((item) => item.rotationLabel === label).length;
                    return (
                      <div key={label} className="rounded-md border p-2 text-xs">
                        <p className="font-semibold">{label}</p>
                        <p className="text-muted-foreground">{count} block(s)</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Detail</CardTitle>
                <CardDescription>Click a block for details and scheduling.</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedProgram ? (
                  <p className="text-sm text-muted-foreground">No block selected yet.</p>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-semibold">{selectedProgram.title}</h3>
                    <p className="text-sm text-muted-foreground">{selectedProgram.excerpt}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{SERIES_LABEL[selectedProgram.series]}</Badge>
                      <Badge variant="outline">{selectedProgram.readingMinutes} min</Badge>
                      <Badge variant="outline">{selectedProgram.rotationLabel}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedProgram.startAt.toLocaleString()} - {selectedProgram.endAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </div>
                    <SchedulingEntryBox
                      contentType={toViewingContentType(selectedProgram.contentType)}
                      contentId={selectedProgram.id.split(":")[1]}
                      contentTitle={selectedProgram.title}
                      contentUrl={toContentUrl(selectedProgram)}
                      target="helm-calendar"
                      triggerLabel="Schedule Viewing"
                      buttonClassName="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!contentQuery.isLoading && !contentQuery.isError && viewMode === "calendar" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calendar Heatmap
                </CardTitle>
                <CardDescription>Click a date to inspect that day&apos;s programming.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}>
                    Previous
                  </Button>
                  <p className="text-sm font-medium">
                    {calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                    Next
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day}>{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day) => {
                    const key = toDateKey(day);
                    const count = calendarHeat.get(key) ?? 0;
                    const inMonth = day.getMonth() === calendarMonth.getMonth();
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedCalendarDate(key)}
                        className={`h-14 rounded-md border text-left p-1 transition-colors ${
                          selectedCalendarDate === key ? "border-primary ring-1 ring-primary" : "border-border"
                        } ${inMonth ? "" : "opacity-35"}`}
                        style={{ backgroundColor: count === 0 ? "transparent" : `rgba(245, 158, 11, ${Math.min(0.9, 0.18 + count * 0.09)})` }}
                      >
                        <p className="text-xs">{day.getDate()}</p>
                        {count > 0 && <p className="text-[10px]">{count}</p>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Day Listings</CardTitle>
                <CardDescription>
                  {selectedCalendarDate
                    ? `Programming for ${new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString()}`
                    : "Select a date above to inspect listings."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedCalendarDate ? (
                  <p className="text-sm text-muted-foreground">No date selected.</p>
                ) : selectedCalendarRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scheduled content for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedCalendarRows.map((item) => (
                      <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.startAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} • {item.readingMinutes} min
                          </p>
                        </div>
                        <SchedulingEntryBox
                          contentType={toViewingContentType(item.contentType)}
                          contentId={item.id.split(":")[1]}
                          contentTitle={item.title}
                          contentUrl={toContentUrl(item)}
                          target="helm-calendar"
                          triggerLabel="Schedule Viewing"
                          buttonVariant="secondary"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </PortalPageLayout>
  );
}

function toViewingContentType(contentType: string): "pudding" | "bst_episode" | "spoonful" | "skipping_stone" | "paper" {
  if (contentType === "paper") return "paper";
  if (contentType === "bst_episode") return "bst_episode";
  if (contentType === "spoonful") return "spoonful";
  if (contentType === "skipping_stone") return "skipping_stone";
  return "pudding";
}

async function fetchAllCephasContent(): Promise<ContentRow[]> {
  const fromView = await supabase
    .from("all_cephas_content" as never)
    .select("content_type, content_id, title, excerpt, primary_spice, secondary_spices, publish_date, estimated_reading_minutes, pepper_rating_avg, view_count, source_paper, pudding_text")
    .order("publish_date", { ascending: false });

  if (!fromView.error) {
    return ((fromView.data ?? []) as unknown as ContentRow[]).map(normalizeRow);
  }

  // Fallback during migration lag: compose records from source tables.
  const [puddingsResp, episodesResp, newsResp] = await Promise.all([
    supabase
      .from("cephas_puddings" as never)
      .select("id, title, pudding_text, not_pudding_summary, primary_spice, secondary_spices, created_at, pepper_rating_avg, view_count, source_paper, source_paper_word_count")
      .in("status", ["draft", "published"]),
    supabase
      .from("crewman_episodes" as never)
      .select("id, content, primary_spice, secondary_spices, created_at, channel, status")
      .in("channel", ["bst", "spoonfuls", "skipping_stones"]),
    supabase
      .from("distribution_news_slots" as never)
      .select("id, content, created_at, scheduled_date, status")
      .in("status", ["scheduled", "dispatched"]),
  ]);

  const puddings = ((puddingsResp.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    content_type: "pudding",
    content_id: String(row.id ?? ""),
    title: String(row.title ?? "Pudding"),
    excerpt: toExcerpt(String(row.pudding_text ?? row.not_pudding_summary ?? "")),
    primary_spice: (row.primary_spice ?? null) as SpiceType | null,
    secondary_spices: ((row.secondary_spices ?? []) as SpiceType[]) ?? [],
    publish_date: String(row.created_at ?? ""),
    estimated_reading_minutes: estimateMinutes(String(row.pudding_text ?? "")),
    pepper_rating_avg: Number(row.pepper_rating_avg ?? 0),
    view_count: Number(row.view_count ?? 0),
    source_paper: String(row.source_paper ?? ""),
    pudding_text: String(row.pudding_text ?? ""),
  }));

  const episodes = ((episodesResp.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    content_type: row.channel === "spoonfuls" ? "spoonful" : row.channel === "skipping_stones" ? "skipping_stone" : "bst_episode",
    content_id: String(row.id ?? ""),
    title: row.channel === "spoonfuls" ? "Spoonful" : row.channel === "skipping_stones" ? "Skipping Stone" : "BST Episode",
    excerpt: toExcerpt(String(row.content ?? "")),
    primary_spice: (row.primary_spice ?? null) as SpiceType | null,
    secondary_spices: ((row.secondary_spices ?? []) as SpiceType[]) ?? [],
    publish_date: String(row.created_at ?? ""),
    estimated_reading_minutes: estimateMinutes(String(row.content ?? "")),
    pepper_rating_avg: 0,
    view_count: 0,
    source_paper: null,
    pudding_text: String(row.content ?? ""),
  }));

  const news = ((newsResp.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    content_type: "news_slot",
    content_id: String(row.id ?? ""),
    title: "News Slot",
    excerpt: toExcerpt(String(row.content ?? "")),
    primary_spice: null,
    secondary_spices: [],
    publish_date: String(row.created_at ?? row.scheduled_date ?? ""),
    estimated_reading_minutes: 2,
    pepper_rating_avg: 0,
    view_count: 0,
    source_paper: null,
    pudding_text: String(row.content ?? ""),
  }));

  return [...puddings, ...episodes, ...news].map(normalizeRow);
}

function normalizeRow(row: ContentRow): ContentRow {
  return {
    ...row,
    excerpt: row.excerpt ? toExcerpt(row.excerpt) : toExcerpt(row.pudding_text ?? ""),
    estimated_reading_minutes:
      typeof row.estimated_reading_minutes === "number" && Number.isFinite(row.estimated_reading_minutes)
        ? Math.max(1, row.estimated_reading_minutes)
        : estimateMinutes(row.pudding_text ?? row.excerpt ?? ""),
    pepper_rating_avg: Number(row.pepper_rating_avg ?? 0),
    view_count: Number(row.view_count ?? 0),
  };
}

function buildProgramItems(rows: ContentRow[]): ProgramItem[] {
  const now = new Date();
  const base = startOfHour(now);
  const scheduleAnchors = [9, 11, 13, 15, 17, 20];
  const laneCounts: Record<ProgramItem["series"], number> = {
    bst: 0,
    spoonfuls: 0,
    skipping_stones: 0,
    puddings: 0,
    news: 0,
  };

  return rows.map((row) => {
    const series = toSeries(row.content_type);
    const laneIndex = laneCounts[series]++;
    const dayOffset = Math.floor(laneIndex / scheduleAnchors.length);
    const slotHour = scheduleAnchors[laneIndex % scheduleAnchors.length];
    const startAt = new Date(base);
    startAt.setDate(base.getDate() + Math.min(dayOffset, WINDOW_DAYS - 1));
    startAt.setHours(slotHour, 0, 0, 0);

    const readingMinutes = Math.max(1, row.estimated_reading_minutes ?? estimateMinutes(row.excerpt ?? ""));
    const endAt = new Date(startAt.getTime() + readingMinutes * 60 * 1000);
    const rotationLabel = rotationFor(now, startAt);
    const depth = toDepth(row.content_type);
    const seriesTags: Exclude<SeriesFilter, "all">[] = [series];
    if (series === "puddings" && row.source_paper) seriesTags.push("papers");

    return {
      id: `${row.content_type}:${row.content_id}`,
      title: row.title || "Untitled",
      excerpt: toExcerpt(row.excerpt ?? ""),
      spice: row.primary_spice,
      series,
      seriesTags,
      depth,
      publishDate: row.publish_date,
      readingMinutes,
      rating: Number(row.pepper_rating_avg ?? 0),
      views: Number(row.view_count ?? 0),
      startAt,
      endAt,
      rotationLabel,
      contentType: row.content_type,
    };
  });
}

function toSeries(contentType: string): ProgramItem["series"] {
  if (contentType === "bst_episode") return "bst";
  if (contentType === "spoonful") return "spoonfuls";
  if (contentType === "skipping_stone") return "skipping_stones";
  if (contentType === "news_slot") return "news";
  return "puddings";
}

function toDepth(contentType: string): Exclude<DepthFilter, "all"> {
  if (contentType === "skipping_stone") return "skipping-stone";
  if (contentType === "pudding") return "pudding";
  return "this-is-not-pudding";
}

function toDepthLabel(depth: Exclude<DepthFilter, "all">) {
  if (depth === "skipping-stone") return "Skipping Stone";
  if (depth === "pudding") return "Pudding";
  return "This-is-NOT-Pudding";
}

function rotationFor(now: Date, startsAt: Date): ProgramItem["rotationLabel"] {
  const deltaMs = startsAt.getTime() - now.getTime();
  if (deltaMs <= 0) return "Now Airing";
  const hours = deltaMs / (1000 * 60 * 60);
  if (hours <= 3) return "Up Next";
  if (hours <= 12) return "Later Today";
  if (hours <= 36) return "Tomorrow";
  return "This Week";
}

function toExcerpt(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 150) return cleaned;
  return `${cleaned.slice(0, 149).trimEnd()}...`;
}

function estimateMinutes(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfHour(date: Date) {
  const copy = new Date(date);
  copy.setMinutes(0, 0, 0);
  return copy;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function minutesBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / (60 * 1000));
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function spiceEmoji(spice: SpiceType) {
  return SPICE_RACK.find((entry) => entry.spice === spice)?.emoji ?? "🧂";
}

function buildCalendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const days: Date[] = [];
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }
  return days;
}
