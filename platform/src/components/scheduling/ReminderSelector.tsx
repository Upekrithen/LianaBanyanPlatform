import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ReminderOption } from "@/components/scheduling/types";

type ReminderSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  options?: ReminderOption[];
};

export const DEFAULT_REMINDER_OPTIONS: ReminderOption[] = [
  { value: "none", label: "No reminder", interval: null },
  { value: "5m", label: "5 minutes before", interval: "5 minutes" },
  { value: "15m", label: "15 minutes before", interval: "15 minutes" },
  { value: "1h", label: "1 hour before", interval: "1 hour" },
  { value: "1d", label: "1 day before", interval: "1 day" },
];

export function ReminderSelector({
  value,
  onChange,
  label = "When to remind",
  options = DEFAULT_REMINDER_OPTIONS,
}: ReminderSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
