/**
 * X16 Council Detector
 * Monitors Initiative #15 (Political Expedition Council) for 16+ accepted/active seats
 * Part of Class-B Pheromone subscription system
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const NOTIFICATION_PATH = 'C:\\Users\\Administrator\\.claude\\state\\bishop_dropzone_inbox\\X16_THRESHOLD_FIRED.md';
const DEDUP_WINDOW_HOURS = 168; // 7 days
const THRESHOLD = 16;

interface CountResult {
  n: number;
}

/**
 * Check if notification file exists and is within dedup window
 */
function isWithinDedupWindow(): boolean {
  try {
    if (!fs.existsSync(NOTIFICATION_PATH)) {
      return false;
    }

    const stats = fs.statSync(NOTIFICATION_PATH);
    const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

    return ageHours < DEDUP_WINDOW_HOURS;
  } catch (error) {
    console.error('Error checking dedup window:', error);
    return false;
  }
}

/**
 * Write notification file to Bishop dropzone
 */
function writeNotification(count: number): void {
  const content = `# X16 Council Threshold Fired

**Timestamp:** ${new Date().toISOString()}
**Subscription ID:** x16_council_filled
**Class:** B
**Threshold:** ${THRESHOLD}
**Current Count:** ${count}

## Summary

Initiative #15 (Political Expedition Council) has reached **${count} accepted/active seats** out of 30 total positions.

This triggers the X16 Council threshold and requires **Founder Ratification** before dispatching Saga-X16-Council-Filled-Escalation.

## Next Steps

1. **Bishop Review:** Validate the threshold trigger is legitimate
2. **Founder Ratification:** Approve or deny saga dispatch
3. **DrekaSkip Dispatch:** If approved, launch Saga-X16-Council-Filled-Escalation

## Query Details

\`\`\`sql
SELECT COUNT(*) AS n
FROM public.initiative_crowns ic
JOIN public.initiatives i ON ic.initiative_id = i.id
WHERE i.initiative_number = 15
  AND ic.crown_status IN ('accepted', 'active')
\`\`\`
`;

  const dir = path.dirname(NOTIFICATION_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(NOTIFICATION_PATH, content, 'utf-8');
  console.log(`[X16 Council Detector] Notification written to ${NOTIFICATION_PATH}`);
}

// ─── Result type ────────────────────────────────────────────────────────────

export interface X16DetectorResult {
  fired: boolean;
  count: number;
  reason: string;
}

// ─── Main detector ──────────────────────────────────────────────────────────

/**
 * Run the X16 Council Detector.
 * Queries Supabase for the count of accepted/active seats in Initiative #15
 * (Political Expedition Council). If count >= 16 and not within the 7-day
 * dedup window, writes a Founder Ratification notification to the Bishop
 * dropzone inbox.
 */
export async function runX16CouncilDetector(): Promise<X16DetectorResult> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { fired: false, count: 0, reason: 'Supabase credentials not configured' };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  let count = 0;
  try {
    // PostgREST join: initiative_crowns → initiatives (inner join on initiative_id)
    // Equivalent SQL: SELECT COUNT(*) AS n FROM initiative_crowns ic
    //   JOIN initiatives i ON ic.initiative_id = i.id
    //   WHERE i.initiative_number = 15
    //     AND ic.crown_status IN ('accepted', 'active')
    const response = await supabase
      .from('initiative_crowns')
      .select('initiatives!inner(initiative_number)', { count: 'exact', head: true })
      .eq('initiatives.initiative_number', 15)
      .in('crown_status', ['accepted', 'active']);

    const { count: c, error } = response as unknown as { count: number | null; error: unknown };

    if (error) {
      return { fired: false, count: 0, reason: `Query error: ${String(error)}` };
    }
    count = c ?? 0;
  } catch (err) {
    return { fired: false, count: 0, reason: `Exception: ${String(err)}` };
  }

  if (count < THRESHOLD) {
    return { fired: false, count, reason: `Below threshold (${count}/${THRESHOLD})` };
  }

  if (isWithinDedupWindow()) {
    return { fired: false, count, reason: 'Within dedup window — notification already sent' };
  }

  writeNotification(count);
  return { fired: true, count, reason: `Threshold reached: ${count} >= ${THRESHOLD}` };
}
