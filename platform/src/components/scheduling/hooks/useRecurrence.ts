import { useMemo, useState } from "react";

export type RecurrenceChoice = "once" | "daily" | "weekly" | "monthly" | "custom";

export function useRecurrence(initial: RecurrenceChoice = "once") {
  const [recurrence, setRecurrence] = useState<RecurrenceChoice>(initial);
  const [customInterval, setCustomInterval] = useState("1");
  const [customByWeekday, setCustomByWeekday] = useState<string[]>([]);
  const [customUntil, setCustomUntil] = useState("");

  const recurrenceRule = useMemo(
    () => buildRecurrenceRule(recurrence, customInterval, customByWeekday, customUntil),
    [customByWeekday, customInterval, customUntil, recurrence],
  );

  return {
    recurrence,
    setRecurrence,
    customInterval,
    setCustomInterval,
    customByWeekday,
    setCustomByWeekday,
    customUntil,
    setCustomUntil,
    recurrenceRule,
  };
}

export function buildRecurrenceRule(
  recurrence: RecurrenceChoice,
  customInterval: string,
  customByWeekday: string[],
  customUntil: string,
) {
  if (recurrence === "once") return null;
  if (recurrence === "daily") return "FREQ=DAILY";
  if (recurrence === "weekly") return "FREQ=WEEKLY";
  if (recurrence === "monthly") return "FREQ=MONTHLY";

  const interval = Math.max(1, Number.parseInt(customInterval, 10) || 1);
  const parts = ["FREQ=WEEKLY", `INTERVAL=${interval}`];
  if (customByWeekday.length > 0) {
    parts.push(`BYDAY=${customByWeekday.join(",")}`);
  }
  if (customUntil) {
    parts.push(`UNTIL=${customUntil.replace(/-/g, "")}T235959Z`);
  }
  return parts.join(";");
}
