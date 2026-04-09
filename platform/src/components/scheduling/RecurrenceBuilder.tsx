import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RecurrenceChoice } from "@/components/scheduling/hooks/useRecurrence";

type RecurrenceBuilderProps = {
  recurrence: RecurrenceChoice;
  onRecurrenceChange: (value: RecurrenceChoice) => void;
  customInterval: string;
  onCustomIntervalChange: (value: string) => void;
  customByWeekday: string[];
  onCustomByWeekdayChange: (value: string[]) => void;
  customUntil: string;
  onCustomUntilChange: (value: string) => void;
};

export function RecurrenceBuilder({
  recurrence,
  onRecurrenceChange,
  customInterval,
  onCustomIntervalChange,
  customByWeekday,
  onCustomByWeekdayChange,
  customUntil,
  onCustomUntilChange,
}: RecurrenceBuilderProps) {
  return (
    <div className="space-y-2">
      <Label>Repeating</Label>
      <Select value={recurrence} onValueChange={(value: RecurrenceChoice) => onRecurrenceChange(value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="once">Once</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>

      {recurrence === "custom" && (
        <div className="space-y-3 rounded-md border p-3">
          <div className="space-y-2">
            <Label htmlFor="custom-interval">Interval</Label>
            <Input
              id="custom-interval"
              type="number"
              min={1}
              value={customInterval}
              onChange={(event) => onCustomIntervalChange(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Days of week</Label>
            <div className="flex flex-wrap gap-1.5">
              {[
                ["MO", "Mon"],
                ["TU", "Tue"],
                ["WE", "Wed"],
                ["TH", "Thu"],
                ["FR", "Fri"],
                ["SA", "Sat"],
                ["SU", "Sun"],
              ].map(([code, labelText]) => {
                const active = customByWeekday.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    className={`rounded border px-2 py-1 text-xs ${active ? "border-primary bg-primary/10" : "border-border"}`}
                    onClick={() =>
                      onCustomByWeekdayChange(
                        customByWeekday.includes(code)
                          ? customByWeekday.filter((entry) => entry !== code)
                          : [...customByWeekday, code],
                      )
                    }
                  >
                    {labelText}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="custom-until">End date (optional)</Label>
            <Input id="custom-until" type="date" value={customUntil} onChange={(event) => onCustomUntilChange(event.target.value)} />
          </div>
        </div>
      )}
    </div>
  );
}
