/**
 * MoneyPenny Google Calendar Adapter (§6.2, Bushel 82, BP034)
 * Read-only Google Calendar API v3 integration. v1.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";
import type { CalendarBlock, ISO8601, AvailabilityClass } from "../types.js";
import { inferAvailabilityFromBlocks } from "./availability_state.js";
import type { CalendarAdapter } from "./outlook_adapter.js";

interface GoogleConfig { access_token?: string; calendar_id?: string; }

function loadGoogleConfig(): GoogleConfig {
  const p = resolve(homedir(), ".claude", "state", "moneypenny", "calendar_config.json");
  if (!existsSync(p)) return {};
  try { return (JSON.parse(readFileSync(p, "utf-8")) as { google?: GoogleConfig }).google ?? {}; }
  catch { return {}; }
}

function getToken(): string | undefined {
  return process.env["MONEYPENNY_GOOGLE_TOKEN"] ?? loadGoogleConfig().access_token;
}

export const googleAdapter: CalendarAdapter = {
  async read_block(start: ISO8601, end: ISO8601): Promise<CalendarBlock[]> {
    const token = getToken();
    if (!token) return [];
    try {
      const calId = loadGoogleConfig().calendar_id ?? "primary";
      const url =
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events` +
        `?timeMin=${encodeURIComponent(start)}&timeMax=${encodeURIComponent(end)}&singleEvents=true` +
        `&fields=items(id,summary,start,end,status,transparency)`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) return [];
      const data = await resp.json() as {
        items?: Array<{
          id: string; summary?: string;
          start: { dateTime?: string; date?: string };
          end: { dateTime?: string; date?: string };
          status?: string; transparency?: string;
        }>;
      };
      return (data.items ?? []).map(ev => ({
        id: ev.id, title: ev.summary ?? "",
        start: ev.start.dateTime ?? ev.start.date ?? start,
        end: ev.end.dateTime ?? ev.end.date ?? end,
        availability_class: ev.transparency === "transparent" ? "OPEN_BLOCK" as const : "DEEP_WORK" as const,
        source: "google" as const,
      }));
    } catch { return []; }
  },
  async inferAvailability(now: ISO8601): Promise<AvailabilityClass> {
    const end = new Date(new Date(now).getTime() + 3600000).toISOString();
    const blocks = await this.read_block(now, end);
    return inferAvailabilityFromBlocks(blocks, now);
  },
};
