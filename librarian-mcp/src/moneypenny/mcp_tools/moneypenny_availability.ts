/**
 * MCP Tools: moneypenny_availability_get / moneypenny_availability_set (G9 gate)
 * Bushel 82, BP034
 */

import type { AvailabilityClass, ISO8601 } from "../types.js";
import {
  readAvailability, readAvailabilityRecord,
  setAvailability, logAvailabilityChange,
  describeAvailability,
} from "../calendar/availability_state.js";
import { outlookAdapter } from "../calendar/outlook_adapter.js";
import { googleAdapter } from "../calendar/google_adapter.js";

export function moneyPennyAvailabilityGet() {
  const record = readAvailabilityRecord();
  return {
    class: record.class,
    description: describeAvailability(record.class),
    set_at: record.set_at,
    set_by: record.set_by,
    until: record.until ?? null,
  };
}

export interface MoneyPennyAvailabilitySetInput {
  class: AvailabilityClass;
  until?: ISO8601;
}

export function moneyPennyAvailabilitySet(input: MoneyPennyAvailabilitySetInput) {
  const prev = readAvailability();
  setAvailability(input.class, input.until, "founder");
  logAvailabilityChange(prev, input.class, "founder");
  return {
    class: input.class,
    description: describeAvailability(input.class),
    until: input.until ?? null,
    previous_class: prev,
    ts: new Date().toISOString(),
  };
}

export async function moneyPennyAvailabilityInfer() {
  const now = new Date().toISOString();

  const [outlookInfer, googleInfer] = await Promise.allSettled([
    outlookAdapter.inferAvailability(now),
    googleAdapter.inferAvailability(now),
  ]);

  const inferences: AvailabilityClass[] = [];
  if (outlookInfer.status === "fulfilled") inferences.push(outlookInfer.value);
  if (googleInfer.status === "fulfilled") inferences.push(googleInfer.value);

  const PRIORITY: AvailabilityClass[] = ["SLEEP", "OUT", "DEEP_WORK", "FAMILY", "COUNSEL", "OPEN_BLOCK"];
  const inferred = inferences.sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b))[0] ?? "OPEN_BLOCK";

  return {
    inferred_class: inferred,
    description: describeAvailability(inferred),
    sources: {
      outlook: outlookInfer.status === "fulfilled" ? outlookInfer.value : "unavailable",
      google: googleInfer.status === "fulfilled" ? googleInfer.value : "unavailable",
    },
    ts: now,
  };
}
