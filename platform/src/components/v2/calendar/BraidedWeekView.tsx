import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { THREAD_LABELS, THREAD_ORDER, ThreadType, WeekThreadEvent } from "./types";
import { ThreadEventTile } from "./ThreadEventTile";

type BraidedWeekViewProps = {
  events: WeekThreadEvent[];
  selectedThread?: ThreadType | "all";
  tourTargetProps?: { "data-tour-target": string };
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function BraidedWeekView({ events, selectedThread = "all", tourTargetProps }: BraidedWeekViewProps) {
  const filtered = selectedThread === "all" ? events : events.filter((event) => event.thread === selectedThread);

  return (
    <Card {...tourTargetProps}>
      <CardHeader>
        <CardTitle className="text-lg">Braided week view</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {THREAD_ORDER.map((thread) => (
            <span key={thread} className="rounded-full border px-2 py-0.5">
              {THREAD_LABELS[thread]}
            </span>
          ))}
        </div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[840px] grid-cols-7 gap-3">
            {DAY_LABELS.map((dayLabel, dayIndex) => (
              <div key={dayLabel} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dayLabel}</p>
                {filtered
                  .filter((event) => event.dayIndex === dayIndex)
                  .sort((a, b) => a.startHour - b.startHour)
                  .map((event) => (
                    <ThreadEventTile key={event.id} event={event} />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
