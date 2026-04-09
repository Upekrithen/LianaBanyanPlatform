import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { RecurrenceBuilder } from "@/components/scheduling/RecurrenceBuilder";
import { DEFAULT_REMINDER_OPTIONS, ReminderSelector } from "@/components/scheduling/ReminderSelector";
import { useRecurrence } from "@/components/scheduling/hooks/useRecurrence";
import { useScheduling } from "@/components/scheduling/hooks/useScheduling";
import type { ContentType, SchedulingEntry, SchedulingTarget } from "@/components/scheduling/types";
import { tomorrowAtNineLocal, toIsoFromLocalDateAndTime, toLocalDateInput } from "@/components/scheduling/dateUtils";
import type { ViewingBeacon } from "@/lib/viewingBeaconService";

interface SchedulingEntryBoxProps {
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
  contentUrl?: string;
  target: SchedulingTarget;
  defaultTime?: string;
  defaultDate?: Date;
  onSave?: (beacon: ViewingBeacon) => void;
  onSubmitEntry?: (entry: SchedulingEntry) => Promise<{ id?: string } | void>;
  onCancel?: () => void;
  triggerLabel?: string;
  trigger?: ReactNode;
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonClassName?: string;
}

export function SchedulingEntryBox({
  contentType,
  contentId,
  contentTitle,
  contentUrl,
  target,
  defaultDate,
  defaultTime,
  onSave,
  onSubmitEntry,
  onCancel,
  triggerLabel = "Schedule",
  trigger,
  buttonVariant = "default",
  buttonClassName,
}: SchedulingEntryBoxProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => toLocalDateInput(defaultDate ?? tomorrowAtNineLocal()));
  const [time, setTime] = useState(defaultTime ?? "09:00");
  const {
    recurrence,
    setRecurrence,
    customInterval,
    setCustomInterval,
    customByWeekday,
    setCustomByWeekday,
    customUntil,
    setCustomUntil,
    recurrenceRule,
  } = useRecurrence("once");
  const [reminderKey, setReminderKey] = useState<string>("15m");
  const [label, setLabel] = useState("");
  const { saveEntry, saving } = useScheduling({
    onSubmitEntry,
    onSaved: (result) => {
      if (onSave && "member_id" in result) onSave(result as ViewingBeacon);
    },
  });

  const reminderInterval = DEFAULT_REMINDER_OPTIONS.find((option) => option.value === reminderKey)?.interval ?? "15 minutes";

  const previewText = useMemo(() => {
    const localDate = new Date(`${date}T${time}:00`);
    if (Number.isNaN(localDate.getTime())) return "Choose a valid date and time.";
    const reminderText =
      reminderInterval === null
        ? "No reminder will be sent."
        : `${DEFAULT_REMINDER_OPTIONS.find((option) => option.value === reminderKey)?.label} reminder.`;
    return `${reminderText} Scheduled for ${localDate.toLocaleString([], {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })}.`;
  }, [date, reminderInterval, reminderKey, time]);

  const canSave = Boolean(user && date && time && !saving);

  async function handleSave() {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in before scheduling.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAtIso = toIsoFromLocalDateAndTime(date, time);
    if (!scheduledAtIso) {
      toast({
        title: "Invalid date/time",
        description: "Choose a valid date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveEntry({
        contentType,
        contentId,
        contentTitle,
        contentUrl,
        scheduledAt: new Date(scheduledAtIso),
        reminderOffset: reminderInterval,
        recurrenceRule,
        label: label.trim() || null,
        target,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Could not save schedule",
        description: error instanceof Error ? error.message : "Unexpected error.",
        variant: "destructive",
      });
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onCancel?.();
      }}
    >
      <PopoverTrigger asChild>
        {trigger ?? (
          <Button variant={buttonVariant} className={buttonClassName}>
            {triggerLabel}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[360px] space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">Schedule</h4>
          <p className="text-xs text-muted-foreground">{contentTitle}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="beacon-date">Date</Label>
            <Input id="beacon-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beacon-time">Time</Label>
            <Input id="beacon-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RecurrenceBuilder
            recurrence={recurrence}
            onRecurrenceChange={setRecurrence}
            customInterval={customInterval}
            onCustomIntervalChange={setCustomInterval}
            customByWeekday={customByWeekday}
            onCustomByWeekdayChange={setCustomByWeekday}
            customUntil={customUntil}
            onCustomUntilChange={setCustomUntil}
          />
          <ReminderSelector value={reminderKey} onChange={setReminderKey} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="beacon-label">Label (optional)</Label>
          <Input
            id="beacon-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Morning slot"
          />
        </div>

        <p className="text-xs text-muted-foreground">{previewText}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">Target: {target}</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                onCancel?.();
              }}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleSave} disabled={!canSave}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
