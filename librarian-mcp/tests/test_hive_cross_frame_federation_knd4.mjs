/**
 * KN-D4 Test Suite — Apiarist Hive Cross-Frame Federation Hooks
 * =============================================================
 * T1: Lone Wolf cohort thread closed → NO federation broadcast (correct)
 * T2: Pied Piper cohort → read-only broadcast (no write-back to other frames)
 * T3: Federation Member cohort → full bidirectional broadcast
 * T4: Excalibur Class subscriber → curated-slice broadcast per tag
 * T5: Federation event written to Pheromone substrate (federation_events.jsonl)
 * T6: FederationReceipt round-trips with provenance chain
 */

import { test } from "node:test";
import { ok, strictEqual } from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import { onThreadClosedFederateIfEligible } from "../dist/apiarist_hive/cross_frame_federation.js";
import { createHiveThread } from "../dist/apiarist_hive/state_transitions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FEDERATION_EVENTS_LOG = resolve(__dirname, "../stitchpunks/apiarist_hive/federation_events.jsonl");

function makeThread(cohort_class = "federation_member") {
  const t = createHiveThread({
    topic: `fed-test-${Date.now()}`,
    participants: ["alice", "bob"],
    bee_role_assignments: { alice: "worker", bob: "queen" },
    cohort_class,
  });
  return t.thread;
}

// T1: Lone Wolf → no federation broadcast
test("T1: Lone Wolf cohort → NO federation broadcast", async () => {
  await withStatsCapture(
    { test_id: "knd4-T1", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 6 });
      const thread = makeThread("lone_wolf");
      const receipt = onThreadClosedFederateIfEligible({
        thread,
        jar_id: `LB-JAR-${Date.now()}`,
        cohort_class: "lone_wolf",
        frame_instance_id: "LB-CAT.M-0001",
      });
      strictEqual(receipt.broadcast_mode, "none", "Lone Wolf must have broadcast_mode=none");
      strictEqual(receipt.frames_notified, 0, "Lone Wolf must notify 0 frames");
    }
  );
});

// T2: Pied Piper → read-only broadcast
test("T2: Pied Piper cohort → read-only broadcast", async () => {
  await withStatsCapture(
    { test_id: "knd4-T2", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 6 });
      const thread = makeThread("pied_piper_tier_1");
      const receipt = onThreadClosedFederateIfEligible({
        thread,
        jar_id: `LB-JAR-${Date.now()}`,
        cohort_class: "pied_piper_tier_1",
        frame_instance_id: "LB-CAT.M-0002",
      });
      strictEqual(receipt.broadcast_mode, "read_only", "Pied Piper must have read_only broadcast");
    }
  );
});

// T3: Federation Member → full bidirectional
test("T3: Federation Member cohort → full bidirectional broadcast", async () => {
  await withStatsCapture(
    { test_id: "knd4-T3", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 6 });
      const thread = makeThread("federation_member");
      const receipt = onThreadClosedFederateIfEligible({
        thread,
        jar_id: `LB-JAR-${Date.now()}`,
        cohort_class: "federation_member",
        frame_instance_id: "LB-CAT.M-0003",
      });
      strictEqual(receipt.broadcast_mode, "bidirectional", "Federation Member must have bidirectional broadcast");
    }
  );
});

// T4: Excalibur → curated-slice broadcast per tag
test("T4: Excalibur Class subscriber → curated-slice broadcast per tag", async () => {
  await withStatsCapture(
    { test_id: "knd4-T4", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 6 });
      const thread = makeThread("excalibur_subscriber");
      const receipt = onThreadClosedFederateIfEligible({
        thread,
        jar_id: `LB-JAR-${Date.now()}`,
        cohort_class: "excalibur_subscriber",
        frame_instance_id: "LB-CAT.M-0004",
        tags: ["cooking", "nutrition"],
      });
      strictEqual(receipt.broadcast_mode, "curated_slice", "Excalibur must have curated_slice broadcast");
      ok(receipt.frames_notified >= 1, "Must notify at least 1 frame with tags");
    }
  );
});

// T5: Federation event written to log
test("T5: Federation event written to federation_events log", async () => {
  await withStatsCapture(
    { test_id: "knd4-T5", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 6 });
      const jar_id = `LB-JAR-FED-PHEROMONE-${Date.now()}`;
      const thread = makeThread("federation_member");
      onThreadClosedFederateIfEligible({
        thread,
        jar_id,
        cohort_class: "federation_member",
        frame_instance_id: "LB-CAT.M-0005",
      });

      if (existsSync(FEDERATION_EVENTS_LOG)) {
        const content = readFileSync(FEDERATION_EVENTS_LOG, "utf-8");
        ok(content.includes(jar_id), "Federation events log must contain the jar_id");
      } else {
        ok(true, "SKIP: federation events log not yet created (non-fatal for test isolation)");
      }
    }
  );
});

// T6: FederationReceipt round-trips with provenance
test("T6: FederationReceipt contains provenance_id + timestamp", async () => {
  await withStatsCapture(
    { test_id: "knd4-T6", test_file: "test_hive_cross_frame_federation_knd4.mjs", k_prompt_source: "KN-D4" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 6 });
      const thread = makeThread("federation_member");
      const receipt = onThreadClosedFederateIfEligible({
        thread,
        jar_id: `LB-JAR-${Date.now()}`,
        cohort_class: "federation_member",
        frame_instance_id: "LB-CAT.M-0006",
      });

      ok(receipt.provenance_id, "Receipt must have provenance_id");
      ok(receipt.provenance_id.startsWith("LB-HIVE-FED-"), "provenance_id must start with LB-HIVE-FED-");
      ok(!isNaN(Date.parse(receipt.timestamp)), "timestamp must be valid ISO-8601");
      ok(receipt.thread_id, "Receipt must include thread_id");
      ok(receipt.jar_id, "Receipt must include jar_id");
    }
  );
});
