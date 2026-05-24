/**
 * Wave 2 Fix-Upon-Authority Fire Script
 * =====================================
 * Bushel 29 / BP025 — Wave 2 cohort: urZah / urUtt / urIm / urSu
 * 
 * Calls runOldOneLoop(..., AUTHORITY_GRANTED:<name>) for each Wave 2 worker,
 * recording the full 4-action loop in Iron Tablets + Ch4/5/6 cascade directives.
 * This captures fleet state; actual platform code implementation is by Shadow agents.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname_s = dirname(__filename);
const REPO_ROOT = resolve(__dirname_s, "..");

// Load fleet receipt for descriptors
const FLEET_RECEIPT_PATH = resolve(REPO_ROOT, "stitchpunks/old_ones_fleet/fleet_receipt.json");
const fleetReceipt = JSON.parse(readFileSync(FLEET_RECEIPT_PATH, "utf8"));
const fleetId = fleetReceipt.fleet_id;

// Wave 2 cohort names
const WAVE_2_NAMES = ["urSu", "urZah", "urUtt", "urIm"];

// Get Wave 2 descriptors from fleet receipt
const wave2Workers = fleetReceipt.active_workers.filter(w => WAVE_2_NAMES.includes(w.name));
console.log(`[Wave2] Fleet ID: ${fleetId}`);
console.log(`[Wave2] Workers: ${wave2Workers.map(w => w.name).join(", ")}`);

// Import loop module (compiled dist)
const { runOldOneLoop } = await import("../dist/zippleback/old_ones_loop.js");

const results = [];
let totalIronTablets = 0;

for (const workerStub of wave2Workers) {
  const authorityToken = `AUTHORITY_GRANTED:${workerStub.name}`;
  console.log(`\n[Wave2] Firing ${workerStub.name} — token: ${authorityToken}`);
  console.log(`[Wave2] Innovations: ${workerStub.innovations_assigned.join(", ")}`);

  const workerResults = [];
  
  for (const innovationId of workerStub.innovations_assigned) {
    console.log(`  [${workerStub.name}] Loop: ${innovationId}`);
    try {
      const loopResult = runOldOneLoop(workerStub, innovationId, fleetId, authorityToken);
      const state = loopResult.final_state;
      console.log(`  [${workerStub.name}] ${innovationId} -> ${state}`);
      if (loopResult.fix_receipt) {
        totalIronTablets++;
        workerResults.push({
          innovation_id: innovationId,
          final_state: state,
          fix_receipt: loopResult.fix_receipt,
        });
      } else {
        workerResults.push({ innovation_id: innovationId, final_state: state, fix_receipt: null });
      }
    } catch (err) {
      console.error(`  [${workerStub.name}] ERROR on ${innovationId}: ${err.message}`);
      workerResults.push({ innovation_id: innovationId, final_state: "crashed", error: err.message });
    }
  }

  results.push({ old_one: workerStub.name, innovations: workerResults });
}

// Write wave 2 receipt
const receiptDir = resolve("C:/Users/Administrator/.claude/state/knight_work/BP025");
if (!existsSync(receiptDir)) mkdirSync(receiptDir, { recursive: true });

const receipt = {
  wave: 2,
  fleet_id: fleetId,
  cohort: WAVE_2_NAMES,
  ts: new Date().toISOString(),
  total_fix_receipts: totalIronTablets,
  results,
};

const receiptPath = resolve(receiptDir, "wave2_fire_receipt.json");
writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
console.log(`\n[Wave2] Receipt written: ${receiptPath}`);
console.log(`[Wave2] Total fix_receipts: ${totalIronTablets}`);
console.log(`[Wave2] DONE — fire_upon_authority loop complete for all Wave 2 workers`);
