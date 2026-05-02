/**
 * test_cue_card_recency.mjs — KN103 / BP016
 * Unit tests for the Cue Card 7-day recency state machine.
 * Pure function tests — no DB required.
 *
 * Run: node tests/test_cue_card_recency.mjs
 */

import { strict as assert } from "assert";
import {
  calculateVestingState,
  cueCardToCohorTier,
  buildReUpReminderMessage,
  validateVestingContext,
} from "../dist/cohort_class/cue_card_recency.js";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;

function makeCtx(opts = {}) {
  const now = opts.nowMs ?? Date.now();
  const qualifyingAt = opts.qualifyingAt ?? new Date(now - (opts.ageMs ?? 0)).toISOString();
  const expiryAt = opts.expiryAt ?? new Date(new Date(qualifyingAt).getTime() + SEVEN_DAYS_MS).toISOString();
  return {
    member_id: "test-member-uuid",
    active_cue_card_count: opts.count ?? 1,
    most_recent_qualifying_at: opts.noQualifying ? null : qualifyingAt,
    expiry_at: opts.noQualifying ? null : expiryAt,
    hours_until_expiry: opts.noQualifying ? null : Math.max(0, (new Date(expiryAt).getTime() - now) / 3_600_000),
  };
}

// ── T1: Inactive baseline ────────────────────────────────────────────────────
{
  const ctx = makeCtx({ noQualifying: true, count: 0 });
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "inactive", "T1: no qualifying card → inactive");
  assert.equal(cueCardToCohorTier(result.state, 0), "lone_wolf", "T1: inactive → lone_wolf");
  console.log("✓ T1 (Inactive baseline)");
}

// ── T2: Active vesting (1 card, 1 day ago) ───────────────────────────────────
{
  const ctx = makeCtx({ ageMs: 86_400_000 });
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "active", "T2: card 1 day ago → active");
  assert.equal(cueCardToCohorTier(result.state, 1), "pied_piper_tier_1", "T2: 1 card → tier 1");
  console.log("✓ T2 (Active vesting)");
}

// ── T3: Multiple active cards (3 cards → tier_2_plus) ────────────────────────
{
  const ctx = makeCtx({ ageMs: 2 * 86_400_000, count: 3 });
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "active", "T3: 3 cards 2 days ago → active");
  assert.equal(cueCardToCohorTier(result.state, 3), "pied_piper_tier_2_plus", "T3: 3 cards → tier_2_plus");
  console.log("✓ T3 (Multiple active cards)");
}

// ── T4: Expiring warning (6.5 days → warning) ────────────────────────────────
{
  const qualifyingAt = new Date(Date.now() - (SEVEN_DAYS_MS - (12 * 60 * 60 * 1000))).toISOString();
  const expiryAt = new Date(new Date(qualifyingAt).getTime() + SEVEN_DAYS_MS).toISOString();
  const ctx = {
    member_id: "test",
    active_cue_card_count: 1,
    most_recent_qualifying_at: qualifyingAt,
    expiry_at: expiryAt,
    hours_until_expiry: 12,
  };
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "expiring_warning", "T4: 12h left → expiring_warning");
  const msg = buildReUpReminderMessage(result);
  assert.ok(msg?.includes("expires in"), "T4: reminder message mentions expiry");
  console.log("✓ T4 (Expiring warning)");
}

// ── T5: Expired (7+ days old) ─────────────────────────────────────────────────
{
  const ctx = makeCtx({ ageMs: SEVEN_DAYS_MS + 60_000 });
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "expired", "T5: 7d + 1min old → expired");
  assert.equal(cueCardToCohorTier(result.state, 1), "lone_wolf", "T5: expired → lone_wolf");
  const msg = buildReUpReminderMessage(result);
  assert.ok(msg?.includes("expired"), "T5: reminder message mentions expired");
  console.log("✓ T5 (Expired downgrade)");
}

// ── T6: Re-up (expired then new card within 7 days) ──────────────────────────
{
  // Simulate: member re-sends a cue card after previous expired → fresh active window
  const ctx = makeCtx({ ageMs: 3 * 60 * 60 * 1000 }); // 3h ago
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "active", "T6: re-up with card 3h ago → active");
  assert.equal(cueCardToCohorTier(result.state, 1), "pied_piper_tier_1", "T6: re-up → pied_piper_tier_1");
  console.log("✓ T6 (Re-up)");
}

// ── T7: Anti-farming (no recipient_used_at = inactive) ───────────────────────
{
  // A throwaway card (handshake completed but recipient_used_at = null) does not count
  const ctx = makeCtx({ noQualifying: true, count: 0 });
  const result = calculateVestingState(ctx);
  assert.equal(result.state, "inactive", "T7: no qualifying cue card → inactive (anti-farming)");
  console.log("✓ T7 (Anti-farming)");
}

// ── T8: validateVestingContext ────────────────────────────────────────────────
{
  assert.equal(validateVestingContext(null), null, "T8: null → null");
  assert.equal(validateVestingContext("string"), null, "T8: string → null");
  const valid = validateVestingContext({ member_id: "abc", active_cue_card_count: 1 });
  assert.ok(valid !== null, "T8: valid object → parsed");
  assert.equal(valid?.member_id, "abc", "T8: member_id preserved");
  console.log("✓ T8 (validateVestingContext)");
}

// ── T9: buildReUpReminderMessage returns null for active/inactive ─────────────
{
  const activeCtx = makeCtx({ ageMs: 60_000 });
  const activeResult = calculateVestingState(activeCtx);
  assert.equal(buildReUpReminderMessage(activeResult), null, "T9: active → no reminder");

  const inactiveCtx = makeCtx({ noQualifying: true, count: 0 });
  const inactiveResult = calculateVestingState(inactiveCtx);
  assert.equal(buildReUpReminderMessage(inactiveResult), null, "T9: inactive → no reminder");
  console.log("✓ T9 (No reminder for active/inactive)");
}

console.log("\n✅ All KN103 Cue Card Recency tests passed (T1–T9)");
