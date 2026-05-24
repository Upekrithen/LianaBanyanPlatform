/**
 * authority_granted_runner.mjs
 * ============================
 * Fires AUTHORITY_GRANTED for specified Old Ones.
 * Usage: node scripts/authority_granted_runner.mjs Yog Dagon Ithaqua
 *
 * For each named Old One:
 *   1. Spawns the fleet (or loads existing)
 *   2. Runs analyze → evaluate → recommend for that Old One's first assigned innovation
 *   3. Fires AUTHORITY_GRANTED:<name> → Channel 4→5→6 cascade
 *   4. Prints receipt
 */

import {
  spawnOldOnesFleet,
  loadFleetReceipt,
  loadAssignments,
} from "../dist/zippleback/old_ones_fleet.js";

import {
  runOldOneLoop,
  fixUponAuthority,
} from "../dist/zippleback/old_ones_loop.js";

const AUTHORIZED_NAMES = process.argv.slice(2);
if (AUTHORIZED_NAMES.length === 0) {
  console.error("Usage: node scripts/authority_granted_runner.mjs <OldOneName> [...]");
  process.exit(1);
}

console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("║  OLD ONES FLEET — AUTHORITY GRANT EXECUTION                 ║");
console.log("║  Bushel 29 / BP021                                           ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

// Spawn or load fleet
let receipt = loadFleetReceipt();
if (!receipt) {
  console.log("⚙  No existing fleet found — spawning new fleet...");
  receipt = spawnOldOnesFleet("BP021");
  console.log(`✅ Fleet spawned: ${receipt.fleet_id}`);
} else {
  console.log(`✅ Existing fleet loaded: ${receipt.fleet_id}`);
}

console.log(`   Coordinator: ${receipt.coordinator}`);
console.log(`   Workers: ${receipt.active_workers.map(w => w.name).join(", ")}`);
console.log(`   Innovations covered: ${receipt.innovations_covered} (${receipt.total_missing} missing + ${receipt.total_stubbed} stubbed)\n`);

// Process each authority grant
for (const name of AUTHORIZED_NAMES) {
  const worker = receipt.active_workers.find(w => w.name === name);
  if (!worker) {
    console.log(`⚠️  AUTHORITY_GRANTED:${name} — Old One not found in fleet. Skipping.`);
    continue;
  }

  const target = worker.innovations_assigned[0];
  if (!target) {
    console.log(`⚠️  AUTHORITY_GRANTED:${name} — No innovation assigned. Skipping.`);
    continue;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🔑 AUTHORITY_GRANTED:${name}`);
  console.log(`   First target: ${target}`);
  console.log(`   Running 4-action loop...`);

  // Run analyze → evaluate → recommend → fix_upon_authority
  const loopResult = runOldOneLoop(
    worker,
    target,
    receipt.fleet_id,
    `AUTHORITY_GRANTED:${name}`
  );

  if (loopResult.final_state === "complete") {
    const fr = loopResult.fix_receipt;
    console.log(`\n   ✅ ${name} — AUTHORITY EXECUTED`);
    console.log(`   └─ Innovation: ${target} (${loopResult.gap_report?.name})`);
    console.log(`   └─ Complexity: ${loopResult.evaluation?.complexity} | Patent risk: ${loopResult.evaluation?.patent_risk}${loopResult.evaluation?.is_crown_jewel ? " ⚠️  CROWN JEWEL" : ""}`);
    console.log(`   └─ Channel 4 directive: ${fr?.channel_4_directive_id}`);
    console.log(`   └─ Channel 5 spawn:     ${fr?.channel_5_spawn_id ?? "(queued)"}`);
    console.log(`   └─ Channel 6 fire:      ${fr?.channel_6_fire_id}`);
    console.log(`   └─ Iron Tablet written: ${fr?.iron_tablet_written}`);
    console.log(`\n   📋 Recommendation:`);
    const rec = loopResult.recommendation;
    if (rec) {
      console.log(`      Files to create: ${rec.files_to_create.join(", ")}`);
      console.log(`      Files to modify: ${rec.files_to_modify.slice(0,2).join(", ")}${rec.files_to_modify.length > 2 ? " +" + (rec.files_to_modify.length-2) + " more" : ""}`);
      console.log(`      Acceptance criteria: ${rec.acceptance_criteria.length} criteria`);
      for (const c of rec.acceptance_criteria.slice(0,3)) {
        console.log(`        • ${c}`);
      }
      if (rec.acceptance_criteria.length > 3) {
        console.log(`        • ...+${rec.acceptance_criteria.length - 3} more`);
      }
    }
    if (loopResult.evaluation?.depends_on?.length) {
      console.log(`\n   📌 Unblocks: innovations that depend on ${target} can now proceed`);
    }
  } else if (loopResult.final_state === "crashed") {
    console.log(`\n   ❌ ${name} — CRASHED during loop. KrissKross recovery eligible.`);
    console.log(`      Check iron_tablets.jsonl for last stable state.`);
  } else {
    console.log(`\n   ⚠️  ${name} — ended in state: ${loopResult.final_state}`);
    if (loopResult.gap_report === null) {
      console.log(`      analyze() may have failed — check innovation ID: ${target}`);
    }
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`\n📋 FLEET STATUS AFTER AUTHORITY GRANTS`);
console.log(`   Fleet ID: ${receipt.fleet_id}`);
console.log(`   Granted in this session: ${AUTHORIZED_NAMES.join(", ")}`);
console.log(`\n   Wave 2 (now unblocked) — these Old Ones may receive authority next:`);
console.log(`     • Shub (MISS-015 Sawtooth60 gap — depends on Dagon's MISS-002)`);
console.log(`     • Ithaqua (MISS-006 AC Pressure — depends on Dagon's MISS-002)`);
console.log(`     • Ithaqua (MISS-007 Banyan Tree — depends on Ithaqua's MISS-001)`);
console.log(`     • Tsathoggua (MISS-005 Hydraulic-to-Pneumatic — depends on MISS-001)`);
console.log(`\n   ⚠️  Crown Jewel protocol: schedule Pawn review before granting:`);
console.log(`     • Dagon MISS-002 Ouralis — patent risk HIGH (game clock Crown Jewel)`);
console.log(`     • Ithaqua MISS-006 AC Pressure — patent risk HIGH (Crown Jewel)`);
console.log(`     • Shub MISS-015 Sawtooth60 — patent risk HIGH (Crown Jewel)`);
console.log(`\n   Iron Tablets: librarian-mcp/stitchpunks/old_ones_fleet/iron_tablets.jsonl`);
console.log(`\nFOR THE KEEP!\n`);
