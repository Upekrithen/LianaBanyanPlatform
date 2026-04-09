import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type FamilyCalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
};

type SharedFamilyCalendarProps = {
  events: FamilyCalendarEvent[];
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function startOfWeek(today = new Date()) {
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function dayDate(base: Date, index: number) {
  const date = new Date(base);
  date.setDate(base.getDate() + index);
  return date;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Anytime";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function SharedFamilyCalendar({ events }: SharedFamilyCalendarProps) {
  const weekStart = startOfWeek();
  const slots = DAYS.map((label, index) => {
    const date = dayDate(weekStart, index);
    const dayEvents = events.filter((event) => {
      const eventDate = new Date(event.startsAt);
      if (Number.isNaN(eventDate.getTime())) return false;
      return isSameDay(eventDate, date);
    });
    return { label, date, dayEvents };
  });

  return (
    <Card id="family-calendar">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Shared family calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-7">
          {slots.map((slot, index) => (
            <div key={slot.label} className={index > 2 ? "hidden md:block" : "block"}>
              <div className="mb-2 rounded-lg border bg-muted/20 p-2 text-center">
                <p className="text-xs font-semibold">{slot.label}</p>
                <p className="text-xs text-muted-foreground">
                  {slot.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="space-y-2">
                {slot.dayEvents.length > 0 ? (
                  slot.dayEvents.slice(0, 3).map((event) => (
                    <article key={event.id} className="rounded-lg border bg-background p-2">
                      <p className="line-clamp-2 text-xs font-medium">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground">{formatEventTime(event.startsAt)}</p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-lg border border-dashed p-2 text-xs text-muted-foreground">Open</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
