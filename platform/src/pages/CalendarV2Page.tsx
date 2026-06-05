import { useMemo, useState } from "react";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import {
  BraidedWeekView,
  PatternHintCard,
  THREAD_LABELS,
  THREAD_ORDER,
  ThreadSourceManager,
  ThreadType,
  TripStoryCard,
  WeekReflectionPanel,
  WeekThreadEvent,
} from "@/components/v2/calendar";
import { cn } from "@/lib/utils";

// TODO (BP072-W9-C5): Replace with real Supabase query from `calendar_events` or
// `craft_treasure_map_progress` table when the user's thread-calendar schema is wired.
// Typed stub: `WeekThreadEvent[]` matching the component contract.
// Expected DB table: calendar_events(id, user_id, title, day_index, start_hour, end_hour, thread)
const MOCK_WEEK_EVENTS: WeekThreadEvent[] = [
  { id: "e1", title: "Morning planning block", dayIndex: 0, startHour: 8, endHour: 9, thread: "personal" },
  { id: "e2", title: "Family table check-in", dayIndex: 0, startHour: 18, endHour: 19, thread: "family" },
  { id: "e3", title: "Provider operations sync", dayIndex: 1, startHour: 10, endHour: 12, thread: "business" },
  { id: "e4", title: "Coalition strategy call", dayIndex: 2, startHour: 13, endHour: 16, thread: "coalition" },
  { id: "e5", title: "Route validation run", dayIndex: 3, startHour: 9, endHour: 11, thread: "route", location: "North corridor" },
  { id: "e6", title: "Defense readiness review", dayIndex: 4, startHour: 15, endHour: 17, thread: "defense" },
  { id: "e7", title: "Coalition follow-up", dayIndex: 5, startHour: 11, endHour: 14, thread: "coalition" },
  { id: "e8", title: "Family errands block", dayIndex: 6, startHour: 12, endHour: 13, thread: "family" },
];

const INITIAL_ENABLED: Record<ThreadType, boolean> = {
  personal: true,
  family: true,
  business: true,
  coalition: true,
  route: true,
  defense: true,
  education: true,
};

function summarizeHours(events: WeekThreadEvent[]) {
  const totals = {
    personal: 0,
    family: 0,
    business: 0,
    coalition: 0,
    route: 0,
    defense: 0,
    education: 0,
  } satisfies Record<ThreadType, number>;

  for (const event of events) {
    totals[event.thread] += Math.max(0, event.endHour - event.startHour);
  }

  return totals;
}

function formatWeekSummary(hours: Record<ThreadType, number>) {
  return `${hours.coalition} hours coalition, ${hours.education} education, ${hours.route} route`;
}

function oneAdjustmentSuggestion(hours: Record<ThreadType, number>) {
  if (hours.coalition > 5 && hours.education === 0) {
    return "Suggested adjustment: add one learning block to keep education in the braid.";
  }
  if (hours.route > 4 && hours.personal < 2) {
    return "Suggested adjustment: reserve one personal block before the next route-heavy day.";
  }
  if (hours.business > 6 && hours.family === 0) {
    return "Suggested adjustment: place one family check-in near your business handoff.";
  }
  return "Suggested adjustment: keep one protected education block to balance the week.";
}

function patternHintQuestion(hours: Record<ThreadType, number>) {
  if (hours.coalition > 5 && hours.education === 0) {
    return "Do you want to keep saying yes to coalition work without a learning thread this week?";
  }
  if (hours.route > 4) {
    return "Do you want to keep saying yes to this route pattern next week?";
  }
  return "Do you want to keep saying yes to this pattern, or rebalance one thread?";
}

export default function CalendarV2Page() {
  const tourTarget = useTourTarget("calendar");
  const [enabledThreads, setEnabledThreads] = useState<Record<ThreadType, boolean>>(INITIAL_ENABLED);
  const [selectedMobileThread, setSelectedMobileThread] = useState<ThreadType | "all">("all");

  const visibleEvents = useMemo(
    () => MOCK_WEEK_EVENTS.filter((event) => enabledThreads[event.thread]),
    [enabledThreads],
  );
  const totals = useMemo(() => summarizeHours(visibleEvents), [visibleEvents]);
  const weekSummaryLine = useMemo(() => formatWeekSummary(totals), [totals]);
  const suggestion = useMemo(() => oneAdjustmentSuggestion(totals), [totals]);
  const hintQuestion = useMemo(() => patternHintQuestion(totals), [totals]);
  const routeEvents = useMemo(() => visibleEvents.filter((event) => event.thread === "route"), [visibleEvents]);

  const utilityStrip = ["7 threads", "Week reflection", "Pattern hints"];

  return (
    <AppShell
      xrayBase="calendar"
      pageTitle="Calendar"
      breadcrumbs="Member workspace / Calendar"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="See what your week says about you"
            headline="A calendar that shows how your cooperative life is unfolding."
            body="Seven threads — personal, family, business, coalition, route, defense, education — braided so you see patterns, not just events."
            primaryCTA={{ label: "Open this week", href: "#braided-week-view" }}
            secondaryCTA={{ label: "Adjust my sources", href: "#thread-source-manager" }}
            proofStrip={utilityStrip}
          />
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <div className="sticky top-[4.1rem] z-10 border-b bg-background/95 py-2 backdrop-blur md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedMobileThread("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs",
                selectedMobileThread === "all" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
              )}
            >
              All
            </button>
            {THREAD_ORDER.map((thread) => (
              <button
                key={thread}
                type="button"
                onClick={() => setSelectedMobileThread(thread)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1 text-xs",
                  selectedMobileThread === thread ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground",
                )}
              >
                {THREAD_LABELS[thread]}
              </button>
            ))}
          </div>
        </div>

        <WeekReflectionPanel summaryLine={weekSummaryLine} adjustmentSuggestion={suggestion} />

        <section id="braided-week-view">
          <BraidedWeekView
            events={visibleEvents}
            selectedThread={selectedMobileThread}
            tourTargetProps={tourTarget}
          />
        </section>

        <PatternHintCard hintQuestion={hintQuestion} />

        <section id="thread-source-manager">
          <ThreadSourceManager
            enabled={enabledThreads}
            onToggle={(thread, value) => setEnabledThreads((prev) => ({ ...prev, [thread]: value }))}
          />
        </section>

        {routeEvents.length > 0 ? <TripStoryCard routeEvents={routeEvents} /> : null}

        <StickyMobileCTA primary={{ label: "Open this week", href: "#braided-week-view" }} />
      </div>
    </AppShell>
  );
}
