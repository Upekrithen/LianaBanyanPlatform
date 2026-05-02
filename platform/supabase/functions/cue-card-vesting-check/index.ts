/**
 * cue-card-vesting-check — Hourly Vesting State Transition Edge Function (KN103/BP016)
 * ======================================================================================
 * Runs hourly. Scans creator_referrals for members whose Cue Card recency window
 * has expired (recipient_used_at < NOW() - 7 days) and their cohort_class is
 * pied_piper_tier_1 or pied_piper_tier_2_plus.
 *
 * On expiry:
 *   - Emits a notification event to the LB Frame UI (realtime channel)
 *   - Member's next librarian probe will return lone_wolf/brittle automatically
 *     (no explicit state write needed — the RPC reads live data)
 *
 * On expiring_warning (within 24h):
 *   - Emits a warning notification to the LB Frame UI
 *
 * Anti-farming: Trust Match + Repeat-Player-Ratio (Slow Blade V2) already
 * filters throwaway recipients at recipient_used_at write time.
 *
 * Deploy: supabase functions deploy cue-card-vesting-check --project-ref ruuxzilgmuwddcofqecc
 * Schedule: cron(0 * * * *)  (every hour at :00)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

interface VestingCheckRow {
  referrer_id: string;
  referral_id: string;
  most_recent_qualifying_at: string;
  active_count: number;
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const windowStart = new Date(now.getTime() - SEVEN_DAYS_MS).toISOString();
  const warningCutoff = new Date(now.getTime() - (SEVEN_DAYS_MS - TWENTY_FOUR_HOURS_MS)).toISOString();

  // Find members with qualifying cards that are expiring or have just expired
  // "just expired" = recipient_used_at between (now - 7d - 1h) and (now - 7d)
  const hourAgo = new Date(now.getTime() - 3_600_000).toISOString();
  const justExpiredCutoff = new Date(now.getTime() - SEVEN_DAYS_MS - 3_600_000).toISOString();

  const results = {
    checked_at: now.toISOString(),
    expiring_warning_count: 0,
    expired_count: 0,
    notifications_emitted: 0,
    errors: [] as string[],
  };

  // ── 1. Expiring warning: members whose best qualifying card expires within 24h ──
  const { data: expiringRows, error: expiringErr } = await client
    .from("creator_referrals")
    .select("referrer_id, id, recipient_used_at")
    .gte("recipient_used_at", warningCutoff)
    .lt("recipient_used_at", windowStart)
    .in("handshake_vesting_state", ["HANDSHAKE_COMPLETED", "REWARDS_VESTED"])
    .not("recipient_used_at", "is", null);

  if (expiringErr) {
    results.errors.push(`expiring query: ${expiringErr.message}`);
  } else if (expiringRows) {
    for (const row of expiringRows) {
      const expiryAt = new Date(new Date(row.recipient_used_at).getTime() + SEVEN_DAYS_MS);
      const hoursLeft = Math.floor((expiryAt.getTime() - now.getTime()) / 3_600_000);

      const { error: notifyErr } = await client
        .from("lb_frame_notifications")
        .upsert({
          member_id: row.referrer_id,
          notification_type: "cue_card_expiring_warning",
          payload: {
            hours_until_expiry: hoursLeft,
            referral_id: row.id,
            expiry_at: expiryAt.toISOString(),
          },
          created_at: now.toISOString(),
          read: false,
        }, { onConflict: "member_id,notification_type" })
        .select();

      if (notifyErr) {
        results.errors.push(`notify expiring ${row.referrer_id}: ${notifyErr.message}`);
      } else {
        results.expiring_warning_count++;
        results.notifications_emitted++;
      }
    }
  }

  // ── 2. Just-expired: members whose last qualifying card expired in the last hour ──
  const { data: expiredRows, error: expiredErr } = await client
    .from("creator_referrals")
    .select("referrer_id, id, recipient_used_at")
    .gte("recipient_used_at", justExpiredCutoff)
    .lt("recipient_used_at", new Date(now.getTime() - SEVEN_DAYS_MS).toISOString())
    .in("handshake_vesting_state", ["HANDSHAKE_COMPLETED", "REWARDS_VESTED"])
    .not("recipient_used_at", "is", null);

  if (expiredErr) {
    results.errors.push(`expired query: ${expiredErr.message}`);
  } else if (expiredRows) {
    for (const row of expiredRows) {
      const { error: notifyErr } = await client
        .from("lb_frame_notifications")
        .upsert({
          member_id: row.referrer_id,
          notification_type: "cue_card_fluid_expired",
          payload: {
            referral_id: row.id,
            expired_at: now.toISOString(),
          },
          created_at: now.toISOString(),
          read: false,
        }, { onConflict: "member_id,notification_type" })
        .select();

      if (notifyErr) {
        results.errors.push(`notify expired ${row.referrer_id}: ${notifyErr.message}`);
      } else {
        results.expired_count++;
        results.notifications_emitted++;
      }
    }
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { "Content-Type": "application/json" },
    status: results.errors.length > 0 ? 207 : 200,
  });
});
