/**
 * Thorax Phase 1 Smoke Gates — BP046B
 * =====================================
 * Tests ship gates 1-7 from the paste-wake.
 */

import { initializeChannels, smokeGate3, readAllChannels } from "../dist/thorax/thorax_channels.js";
import { acquireChoke, releaseChoke, isChokeClear, getAllChokeStatus } from "../dist/thorax/thorax_choke.js";
import { initiateHandshake, acceptHandshake, smokeGate1 } from "../dist/thorax/thorax_handshake.js";
import { transmit, smokeGate2, smokeGate4 } from "../dist/thorax/thorax_transmission.js";
import { applyStamp, verifyStamps } from "../dist/thorax/thorax_stamp.js";
import { flagStream } from "../dist/thorax/thorax_flag.js";
import { enqueuePhalanx, smokeGate7 } from "../dist/thorax/thorax_phalanx.js";
import { cpRefusalGate, smokeGate8 } from "../dist/thorax/thorax_refusal.js";
import { createHash } from "crypto";

let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}${detail ? " — " + detail : ""}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

// ─── Gate 3: 12-channel initialization ────────────────────────────────────────
console.log("\n── GATE 3: 12-channel parallelism ─────────────────────────────");
const { initialized, skipped } = initializeChannels();
const g3 = smokeGate3();
check("12 channels initialized", g3.channel_count === 12, `count=${g3.channel_count}`);
check("all_initialized=true", g3.all_initialized);
check("gate_3.passed", g3.passed);

// ─── Gate 1+2: choke point acquire/release + shift-to-side ───────────────────
console.log("\n── GATE 1+2: Choke point mutex + directional alternation ──────");

// Initiate handshake first (needed for state transition)
const hs1 = initiateHandshake(1, "node-east-1", "node-west-1");
check("Handshake initiated", hs1.success, hs1.error ?? "");

const hs_accept = acceptHandshake(hs1.record.handshake_id, "node-west-1");
check("Handshake accepted (reciprocal)", hs_accept.success, hs_accept.error ?? "");
check("Bestie established", hs_accept.bestie_established === true);

const g1 = smokeGate1(1);
check("Gate 1 passed", g1.passed, `handshake=${g1.handshake_complete} state=${g1.channel_state}`);

// Apply stamps (needed for transmission)
const s1 = applyStamp(1, "node-east-1", "east");
check("East stamp applied", s1.success);
const s2 = applyStamp(1, "node-west-1", "west");
check("West stamp applied + share authorized", s2.share_threshold_met === true);

// Transmit East
const payload_hash = createHash("sha256").update("test-payload").digest("hex");
const tx1 = transmit(1, "east", "node-east-1", payload_hash, { skip_celpane: false });
check("East transmission success", tx1.success, tx1.error ?? "");
check("Shift-to-side recorded", !!(tx1.transmission?.shift_to_side_ts));
check("Eblit snapshot captured", !!(tx1.eblit_snapshot_id));

const g2 = smokeGate2(1);
check("Gate 2: East transmit + shift-to-side", g2.passed);

// Transmit West (reciprocal — after shift-to-side channel is back to bestie_open)
const tx2 = transmit(1, "west", "node-west-1", payload_hash, { skip_celpane: false });
check("West transmission success", tx2.success, tx2.error ?? "");

// ─── Gate 4: Persistent-bestie — 3rd transmission doesn't re-fire handshake ──
console.log("\n── GATE 4: Persistent-bestie ──────────────────────────────────");
const tx3 = transmit(1, "east", "node-east-1", payload_hash, { skip_celpane: true });
check("3rd transmission without re-handshake", tx3.success, tx3.error ?? "");
const g4 = smokeGate4(1);
check("Gate 4 passed (≥3 transmissions, bestie held)", g4.passed, `count=${g4.transmission_count}`);

// ─── Gate 5: Per-stream flag constriction on channel 7 ───────────────────────
console.log("\n── GATE 5+6: Per-stream flag constriction + Angel of Death ────");
// Initialize channel 7
initializeChannels(); // idempotent
const hs7 = initiateHandshake(7, "node-east-7", "node-west-7");
check("Channel 7 handshake initiated", hs7.success, hs7.error ?? "");
acceptHandshake(hs7.record.handshake_id, "node-west-7");

const flag7 = flagStream(7, "Test flag for smoke gate 5", "smoke-test-operator");
check("Gate 5: channel 7 flagged", flag7.success);
check("Gate 5: unaffected_channels = 11", (flag7.unaffected_channels?.length ?? 0) === 11);
check("Gate 5: channel 1 unaffected (in unaffected list)", flag7.unaffected_channels?.includes(1));
check("Gate 6: Angel of Death burial ID assigned", !!(flag7.angel_of_death_burial_id));

// Verify channel 7 is stationary, others not
const allChs = readAllChannels();
const ch7 = allChs.find(c => c.channel_id === 7);
const ch1 = allChs.find(c => c.channel_id === 1);
check("Channel 7 state=flagged", ch7?.state === "flagged");
check("Channel 1 state unaffected (bestie_open)", ch1?.state === "bestie_open");

// ─── Gate 7: CP refusal — unauthorized non-reciprocal transmission refused ───
console.log("\n── GATE 7+8: CP refusal default ──────────────────────────────");
const g8 = smokeGate8(7, "east", "unauthorized-node");
check("Gate 7/8: unauthorized transmission refused", g8.passed, g8.refusal_reasons[0] ?? "");

// Enqueue channel 7 to Phalanx
const phalanx7 = enqueuePhalanx(7, "flagged", { flag_record_id: flag7.flag_record?.flag_id });
check("Gate 7: channel 7 enqueued to Phalanx", phalanx7.success);
const g7 = smokeGate7(7);
check("Gate 7 passed (phalanx entry found)", g7.passed, `state=${g7.channel_state}`);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n══════════════════════════════════════════════════════════════");
console.log(`THORAX PHASE 1 SMOKE GATES: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("ALL GATES GREEN ✅ — Thorax Phase 1 LANDED");
} else {
  console.log(`⚠️  ${failed} gate(s) failed — review above`);
  process.exit(1);
}
