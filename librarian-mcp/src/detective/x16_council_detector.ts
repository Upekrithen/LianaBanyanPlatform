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
