/**
 * MoneyPenny Outlook Calendar Adapter (§6.2, Bushel 82, BP034)
 * Read-only Outlook/Microsoft Graph calendar integration. v1.
 * To activate: set MONEYPENNY_OUTLOOK_TOKEN or configure calendar_config.json.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { CalendarBlock, ISO8601, AvailabilityClass } from "../types.js";
import { inferAvailabilityFromBlocks } from "./availability_state.js";

interface CalendarConfig {
  outlook?: { access_token?: string; user_id?: string };
}

function loadConfig(): CalendarConfig {
  const p = resolve(homedir(), ".claude", "state", "moneypenny", "calendar_config.json");
  if (!existsSync(p)) return {};
  try { return JSON.parse(readFileSync(p, "utf-8")) as CalendarConfig; }
  catch { return {}; }
}

function getToken(): string | undefined {
  return process.env["MONEYPENNY_OUTLOOK_TOKEN"] ?? loadConfig().outlook?.access_token;
}

export interface CalendarAdapter {
  read_block(start: ISO8601, end: ISO8601): Promise<CalendarBlock[]>;
  inferAvailability(now: ISO8601): Promise<AvailabilityClass>;
}

export const outlookAdapter: CalendarAdapter = {
  async read_block(start: ISO8601, end: ISO8601): Promise<CalendarBlock[]> {
    const token = getToken();
    if (!token) return [];
    try {
      const userId = loadConfig().outlook?.user_id ?? "me";
      const url =
        `https://graph.microsoft.com/v1.0/${userId}/calendarView` +
        `?startDateTime=${encodeURIComponent(start)}&endDateTime=${encodeURIComponent(end)}` +
        `&$select=id,subject,start,end,showAs`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!resp.ok) return [];
      const data = await resp.json() as {
        value: Array<{ id: string; subject: string; start: { dateTime: string }; end: { dateTime: string }; showAs?: string }>;
      };
      return (data.value ?? []).map(ev => ({
        id: ev.id, title: ev.subject, start: ev.start.dateTime, end: ev.end.dateTime,
        availability_class: showAsToClass(ev.showAs), source: "outlook" as const,
      }));
    } catch { return []; }
  },
  async inferAvailability(now: ISO8601): Promise<AvailabilityClass> {
    const end = new Date(new Date(now).getTime() + 3600000).toISOString();
    const blocks = await this.read_block(now, end);
    return inferAvailabilityFromBlocks(blocks, now);
  },
};

function showAsToClass(s?: string): AvailabilityClass {
  switch (s?.toLowerCase()) {
    case "busy": return "DEEP_WORK";
    case "oof": case "outofoffice": return "OUT";
    default: return "OPEN_BLOCK";
  }
}
