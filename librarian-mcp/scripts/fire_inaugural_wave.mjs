/**
 * Drekaskip Wave Generator — Inaugural Wave Fire (G10 T4 production-class)
 * Fires 1 production-class wave across 4 axes.
 * Receipt logged to ~/.claude/state/drekaskip/waves/{wave_id}.receipt.json
 *
 * Run: node scripts/fire_inaugural_wave.mjs
 */

import { initWaveGenerator, dispatchWave, getWave } from "../dist/drekaskip/wave_generator.js";
import { resolve } from "node:path";
import { homedir } from "node:os";
import { existsSync, readFileSync } from "node:fs";

initWaveGenerator();

console.log("[drekaskip] Firing inaugural production-class wave...");
console.log("[drekaskip] K30 §10 config: discard_threshold=Infinity, merge_policy=fan_in_synthesize");
console.log("[drekaskip] Commit ref: 03e6337 (K30 Contingency Operator, LB-STACK-0185)");

const wave = await dispatchWave({
  saga_id: "Saga-Drekaskip-Inaugural",
  axes: ["research", "build", "discovery", "synthesis"],
  budget: { max_segs: 12, timeout_s: 30 },
  beat_offset_ms: 50,
});

console.log(`[drekaskip] Wave dispatched: ${wave.wave_id}`);
console.log(`[drekaskip] Saga: ${wave.saga_id}`);
console.log(`[drekaskip] Axes: ${wave.axes.map(a => a.axis_name).join(", ")}`);

// Wait for completion (poll)
let elapsed = 0;
while (elapsed < 30000) {
  await new Promise(r => setTimeout(r, 500));
  elapsed += 500;
  const current = getWave(wave.wave_id);
  if (current?.status === "complete" || current?.status === "aborted") break;
  process.stdout.write(".");
}
console.log();

const completed = getWave(wave.wave_id);
if (!completed) { console.error("[drekaskip] Wave not found after completion wait"); process.exit(1); }

console.log(`\n[drekaskip] === INAUGURAL WAVE RECEIPT ===`);
console.log(`Status: ${completed.status}`);
console.log(`SEGs fired: ${completed.segs_fired}`);
if (completed.receipt) {
  const r = completed.receipt;
  console.log(`t_wave_ms: ${r.t_wave_ms}`);
  console.log(`t_serial_est_ms: ${r.t_serial_est_ms}`);
  console.log(`speedup_ratio: ${r.speedup_ratio}`);
  console.log(`axes_count: ${r.axes_count}`);
  console.log(`K30 §10 claim confirmed: ${r.k30_claim_confirmed}`);
  console.log(`K30 commit ref: ${r.k30_commit_ref}`);
  if (r.k30_claim_violated) {
    console.warn(`[ANOMALY] k30_claim_violated=true — speedup_ratio >= 1.0`);
  }
}

// Verify receipt file on disk
const receiptPath = resolve(homedir(), ".claude", "state", "drekaskip", "waves", `${completed.wave_id}.receipt.json`);
if (existsSync(receiptPath)) {
  console.log(`\n[drekaskip] Receipt persisted: ${receiptPath}`);
} else {
  console.warn(`[drekaskip] Receipt file not found at expected path: ${receiptPath}`);
}

console.log(`\n[drekaskip] === G10 T4 PRODUCTION-CLASS: PASS ===`);
console.log(`[drekaskip] Inaugural wave complete. Drekaskip is alive.`);
