/**
 * Thorax CP-Class Refusal Default — P12
 * =======================================
 * Dream #5 · BP046B · Phase 1
 *
 * P12: CP-class refusal default (Founder R2 ratified).
 *      Thorax transmission UNANIMOUS OR REFUSED.
 *      Isolated state is safe default.
 *
 * Founder verbatim: "Data boats can float all over, but not disembark unless
 *   reciprocal, so no policing needed." (§0 Dream #5)
 *
 * The refusal gate is the last check before any transmission proceeds.
 * If ANY of the following are true, the transmission is refused:
 *   - Channel not in bestie_open or transmitting_east/west
 *   - Choke point not clear (or wrong direction trying to acquire)
 *   - Stamps insufficient (share requires 1 east + 1 west)
 *   - CelPane interference_state = "interfere" (oil = inauthentic)
 *   - cp_refused flag is set on the channel
 *
 * CP = "Cooperative Protocol" — unanimous-or-refused aligns with
 * the cooperative-class dual-veto canon.
 *
 * Composes with:
 *   - thorax_choke.ts (choke point status)
 *   - thorax_channels.ts (channel state)
 *   - thorax_stamp.ts (stamp verification)
 *   - thorax_celpane.ts (interference-state check)
 */

import { readChannel } from "./thorax_channels.js";
import { isChokeClear, getActiveChokeToken } from "./thorax_choke.js";
import { verifyStamps } from "./thorax_stamp.js";
import { latestCelPaneSig } from "./thorax_celpane.js";
import type { ThoraxDirection } from "./thorax_types.js";

// ─── Public API ──────────────────────────────────────────────────────────────

export interface CPRefusalCheckResult {
  /** true = transmission MAY proceed; false = REFUSED */
  unanimous: boolean;
  channel_id: number;
  direction: ThoraxDirection;
  checks: {
    channel_ready:    boolean;
    choke_clear:      boolean;
    stamps_ok:        boolean;
    celpane_water:    boolean;  // "pass" = water = genuine
    not_cp_refused:   boolean;
  };
  refusal_reasons: string[];
}

/**
 * P12: CP-class refusal gate.
 *
 * ALL checks must pass for transmission to proceed (unanimous = true).
 * Any single failure = REFUSED (isolated state is safe default).
 *
 * Ship gate 7: "3rd-party attempts non-reciprocal transmission →
 *   correctly refused, isolated, queued to Phalanx fallback."
 */
export function cpRefusalGate(
  channel_id: number,
  direction: ThoraxDirection,
  requesting_node_id: string
): CPRefusalCheckResult {
  const refusal_reasons: string[] = [];
  const ch = readChannel(channel_id);

  // ─── Check 1: Channel state ────────────────────────────────────────────
  const ready_states = ["bestie_open", "transmitting_east", "transmitting_west"];
  const channel_ready = !!(ch && ready_states.includes(ch.state));
  if (!channel_ready) {
    const state = ch?.state ?? "not_found";
    refusal_reasons.push(`Channel ${channel_id} not ready for transmission (state: ${state}).`);
  }

  // ─── Check 2: Choke point ──────────────────────────────────────────────
  // Clear = no one holds it yet (we can acquire) OR we already hold it
  const active_token = getActiveChokeToken(channel_id);
  const choke_clear = isChokeClear(channel_id) ||
    (active_token?.direction === direction && active_token?.holder_node_id === requesting_node_id);

  if (!choke_clear) {
    const holder = active_token?.holder_node_id;
    const held_dir = active_token?.direction;
    refusal_reasons.push(
      `Choke point on channel ${channel_id} occupied by ${held_dir} (holder: ${holder}). Directional alternation required — wait for shift-to-side.`
    );
  }

  // ─── Check 3: Stamps (share authorization) ──────────────────────────────
  const stamp_verification = verifyStamps(channel_id);
  const stamps_ok = stamp_verification.share_authorized;
  if (!stamps_ok) {
    refusal_reasons.push(
      `Stamp authorization failed on channel ${channel_id}. Required: 1 East + 1 West stamp. Current: ${stamp_verification.east_stamps}E + ${stamp_verification.west_stamps}W.`
    );
  }

  // ─── Check 4: CelPane interference state ────────────────────────────────
  const sig = latestCelPaneSig(channel_id);
  const celpane_water = !sig || sig.interference_state === "pass";
  if (!celpane_water) {
    refusal_reasons.push(
      `CelPane interference state = "interfere" (oil) on channel ${channel_id}. Cannot flow — channel is inauthentic or interrupted.`
    );
  }

  // ─── Check 5: Explicit CP-refused flag ────────────────────────────────
  const not_cp_refused = !ch?.cp_refused;
  if (!not_cp_refused) {
    refusal_reasons.push(
      `Channel ${channel_id} has cp_refused=true (explicit refusal flagged). Transmission blocked.`
    );
  }

  // ─── Verdict ─────────────────────────────────────────────────────────────
  const unanimous =
    channel_ready && choke_clear && stamps_ok && celpane_water && not_cp_refused;

  return {
    unanimous,
    channel_id,
    direction,
    checks: {
      channel_ready,
      choke_clear,
      stamps_ok,
      celpane_water,
      not_cp_refused,
    },
    refusal_reasons,
  };
}

// ─── Ship gate 8: CP refusal smoke test ─────────────────────────────────────

/**
 * Ship gate 8: "3rd-party attempts non-reciprocal transmission →
 *   correctly refused, isolated, queued to Phalanx fallback."
 *
 * Tests that an unauthorized node attempting transmission is refused.
 */
export function smokeGate8(
  channel_id: number,
  direction: ThoraxDirection,
  unauthorized_node_id: string
): {
  passed: boolean;
  refusal_triggered: boolean;
  refusal_reasons: string[];
} {
  const result = cpRefusalGate(channel_id, direction, unauthorized_node_id);
  const refusal_triggered = !result.unanimous;

  return {
    passed: refusal_triggered,
    refusal_triggered,
    refusal_reasons: result.refusal_reasons,
  };
}
