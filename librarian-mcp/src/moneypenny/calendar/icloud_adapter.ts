/**
 * MoneyPenny iCloud Calendar Adapter (§6.2, Bushel 82, BP034)
 * Optional at v1 per G9 gate. Returns empty gracefully if not configured.
 */

import type { CalendarBlock, ISO8601, AvailabilityClass } from "../types.js";
import type { CalendarAdapter } from "./outlook_adapter.js";
import { inferAvailabilityFromBlocks } from "./availability_state.js";

export const icloudAdapter: CalendarAdapter = {
  async read_block(_start: ISO8601, _end: ISO8601): Promise<CalendarBlock[]> {
    // CalDAV REPORT implementation deferred to v2 (Apple Continuity gate)
    return [];
  },
  async inferAvailability(now: ISO8601): Promise<AvailabilityClass> {
    const end = new Date(new Date(now).getTime() + 3600000).toISOString();
    const blocks = await this.read_block(now, end);
    return inferAvailabilityFromBlocks(blocks, now);
  },
};
