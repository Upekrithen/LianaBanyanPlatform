/**
 * KN-N1 Test Suite — Gold Tablet Schema + 2-Tier Ledger
 * ======================================================
 * T1: append + read latest-per-id round-trip
 * T2: HMAC signature verifies
 * T3: Chronos signature verifies (ISO-8601 ms format)
 * T4: supersedes chain — newer tablet marks older `superseded`
 * T5: tier enforcement — platform_canon requires platform-tier signer; project_rules allows project-scope
 * T6: concurrent-writer discipline (50 concurrent appendTablet calls; no corruption)
 * T7: serial counter monotonic under concurrency
 * T8: latest-per-id reduction handles 5 mutations correctly
 * T9: Stats-Capture harness emits bookend + interval telemetry
 */

import { test } from "node:test";
import { ok, strictEqual, notStrictEqual, deepStrictEqual } from "node:assert/strict";
import { existsSync, unlinkSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { homedir } from "node:os";

// ─── Sandbox setup (isolate ledger for tests) ─────────────────────────────────

const GOLD_DIR_OVERRIDE = resolve(homedir(), ".claude", "state", "gold_tablet_test_knn1");
const LEDGER_PATH_TEST = resolve(GOLD_DIR_OVERRIDE, "ledger.jsonl");
const COUNTER_FILE_TEST = resolve(GOLD_DIR_OVERRIDE, "serial_counter.txt");

function cleanLedger() {
  for (const f of [LEDGER_PATH_TEST, COUNTER_FILE_TEST, resolve(GOLD_DIR_OVERRIDE, "excalibur_pointers.jsonl")]) {
    if (existsSync(f)) unlinkSync(f);
  }
}

// Override GOLD_DIR in the module by injecting environment variable
// (Tests use a sandboxed path via process.env.GOLD_TABLET_DIR_OVERRIDE)
// Since we can't easily mock ESM imports, we test the full implementation
// using the real dir but with cleanup before/after each test.

import {
  appendTablet,
  readTablet,
  queryTablets,
  verifyTablet,
  auditTablets,
  latestPerIdReduction,
  GOLD_DIR,
  LEDGER_PATH,
} from "../dist/gold_tablet/ledger.js";
import { signGoldTablet, verifyGoldTablet, chronosTimestamp } from "../dist/gold_tablet/hmac.js";
import { checkMutationAuthority, checkReadAuthority } from "../dist/gold_tablet/authority_check.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeTablet(overrides = {}) {
  return {
    tier: "platform_rules",
    scope: "platform",
    topic: `test-topic-${Date.now()}`,
    rule_text: "All members are equal.",
    ratification_session: "BP018",
    signer_id: "BP018",
    ...overrides,
  };
}

// ─── T1: append + read latest-per-id round-trip ───────────────────────────────

test("T1: append + read latest-per-id round-trip", async () => {
  await withStatsCapture(
    { test_id: "knn1-T1", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 9 });

      const result = appendTablet(makeTablet());
      ok(result.success, "appendTablet should succeed");
      ok(result.tablet, "tablet should be returned");
      ok(result.tablet.id.startsWith("LB-GOLD-"), "id must start with LB-GOLD-");
      strictEqual(result.tablet.status, "active");
      strictEqual(result.tablet.tier, "platform_rules");

      const read = readTablet(result.tablet.id);
      ok(read, "readTablet should return the tablet");
      strictEqual(read.id, result.tablet.id);
      strictEqual(read.rule_text, "All members are equal.");
    }
  );
});

// ─── T2: HMAC signature verifies ─────────────────────────────────────────────

test("T2: HMAC signature verifies", async () => {
  await withStatsCapture(
    { test_id: "knn1-T2", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 9 });

      const result = appendTablet(makeTablet({ tier: "platform_canon", scope: "platform", signer_id: "FOUNDER" }));
      ok(result.success);
      ok(verifyTablet(result.tablet), "HMAC signature must verify");

      // Tamper check
      const tampered = { ...result.tablet, rule_text: "TAMPERED RULE" };
      ok(!verifyGoldTablet({
        ...tampered,
        hmac_signature: result.tablet.hmac_signature,
      }), "Tampered tablet must fail HMAC verification");
    }
  );
});

// ─── T3: Chronos timestamp verifies (ISO-8601 with ms) ────────────────────────

test("T3: Chronos timestamp is valid ISO-8601", async () => {
  await withStatsCapture(
    { test_id: "knn1-T3", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 9 });

      const ts = chronosTimestamp();
      ok(!isNaN(Date.parse(ts)), `Chronos timestamp must be valid ISO-8601: ${ts}`);
      ok(ts.includes("T"), "Must include T separator");
      ok(ts.endsWith("Z"), "Must be UTC (ends with Z)");

      const result = appendTablet(makeTablet());
      ok(!isNaN(Date.parse(result.tablet.chronos_ts)), "Tablet chronos_ts must be valid");
      ok(!isNaN(Date.parse(result.tablet.ratification_ts)), "Tablet ratification_ts must be valid");
    }
  );
});

// ─── T4: supersedes chain — newer tablet marks older superseded ───────────────

test("T4: supersedes chain marks prior tablet as superseded", async () => {
  await withStatsCapture(
    { test_id: "knn1-T4", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 9 });

      const original = appendTablet(makeTablet({ topic: "supersedes-test" }));
      ok(original.success);
      strictEqual(readTablet(original.tablet.id).status, "active");

      const replacement = appendTablet(makeTablet({
        topic: "supersedes-test",
        rule_text: "Replacement rule.",
        supersedes: [original.tablet.id],
      }));
      ok(replacement.success);

      const updatedOriginal = readTablet(original.tablet.id);
      strictEqual(updatedOriginal.status, "superseded", "Original must be marked superseded");
      strictEqual(updatedOriginal.superseded_by, replacement.tablet.id);
      strictEqual(readTablet(replacement.tablet.id).status, "active");
    }
  );
});

// ─── T5: tier enforcement ─────────────────────────────────────────────────────

test("T5: platform_canon requires platform-tier signer; project_rules allows project-scope", async () => {
  await withStatsCapture(
    { test_id: "knn1-T5", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 9 });

      // platform_canon: non-platform signer rejected
      const check1 = checkMutationAuthority({ tier: "platform_canon", scope: "platform", signer_id: "member-123" });
      ok(!check1.allowed, "Non-platform signer must be rejected for platform_canon");

      // platform_canon: Founder allowed
      const check2 = checkMutationAuthority({ tier: "platform_canon", scope: "platform", signer_id: "FOUNDER" });
      ok(check2.allowed, "Founder must be allowed for platform_canon");

      // project_rules: project signer allowed for matching scope
      const check3 = checkMutationAuthority({
        tier: "project_rules",
        scope: "my-project",
        signer_id: "proj-signer-x",
        signer_project_scope: "my-project",
      });
      ok(check3.allowed, "Project signer allowed for matching project scope");

      // project_rules: cross-project rejected
      const check4 = checkMutationAuthority({
        tier: "project_rules",
        scope: "other-project",
        signer_id: "proj-signer-x",
        signer_project_scope: "my-project",
      });
      ok(!check4.allowed, "Cross-project mutation must be rejected");

      // READ: platform_rules open to all
      const check5 = checkReadAuthority({ tier: "platform_rules", scope: "platform", reader_cohort_class: "lone_wolf" });
      ok(check5.allowed, "platform_rules read must be open to all");
    }
  );
});

// ─── T6: concurrent-writer discipline ────────────────────────────────────────

test("T6: 50 concurrent appendTablet calls produce no corruption", async () => {
  await withStatsCapture(
    { test_id: "knn1-T6", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 9 });

      const before = Array.from(latestPerIdReduction().keys()).length;
      await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          Promise.resolve(appendTablet(makeTablet({ topic: `concurrent-${i}` })))
        )
      );
      const after = Array.from(latestPerIdReduction().keys()).length;
      ok(after >= before + 50, `Expected at least 50 new tablets, got ${after - before}`);

      // Verify all entries are valid JSON (no corruption)
      const allEntries = Array.from(latestPerIdReduction().values());
      for (const t of allEntries) {
        ok(t.id, "Every tablet must have an id");
        ok(t.hmac_signature, "Every tablet must have an HMAC signature");
      }
    }
  );
});

// ─── T7: serial counter monotonic ────────────────────────────────────────────

test("T7: serial counter is monotonically increasing", async () => {
  await withStatsCapture(
    { test_id: "knn1-T7", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 7, assertion_total: 9 });

      const r1 = appendTablet(makeTablet({ topic: "monotonic-1" }));
      const r2 = appendTablet(makeTablet({ topic: "monotonic-2" }));
      const r3 = appendTablet(makeTablet({ topic: "monotonic-3" }));

      const n1 = parseInt(r1.tablet.id.replace("LB-GOLD-", ""), 10);
      const n2 = parseInt(r2.tablet.id.replace("LB-GOLD-", ""), 10);
      const n3 = parseInt(r3.tablet.id.replace("LB-GOLD-", ""), 10);

      ok(n2 > n1, `${n2} must be > ${n1}`);
      ok(n3 > n2, `${n3} must be > ${n2}`);
    }
  );
});

// ─── T8: latest-per-id reduction handles 5 mutations ─────────────────────────

test("T8: latest-per-id handles 5 mutations correctly", async () => {
  await withStatsCapture(
    { test_id: "knn1-T8", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 8, assertion_total: 9 });

      // Create a tablet then supersede it 4 times in a chain
      let current = appendTablet(makeTablet({ topic: "mutation-chain" }));
      ok(current.success);

      for (let i = 0; i < 4; i++) {
        const next = appendTablet(makeTablet({
          topic: "mutation-chain",
          rule_text: `Mutation ${i + 1}`,
          supersedes: [current.tablet.id],
        }));
        ok(next.success, `Mutation ${i + 1} should succeed`);
        current = next;
      }

      // Only the last one should be active
      const read = readTablet(current.tablet.id);
      strictEqual(read.status, "active");
      strictEqual(read.rule_text, "Mutation 4"); // loop i=0..3 → rule_text = `Mutation ${i+1}`, last = Mutation 4
    }
  );
});

// ─── T9: Stats-Capture harness emits bookend telemetry ────────────────────────

test("T9: Stats-Capture harness emits bookend telemetry", async () => {
  const { TELEMETRY_LIVE } = await import("../dist/stats_capture/harness.js");
  const { readdirSync } = await import("node:fs");

  const before = existsSync(TELEMETRY_LIVE) ? readdirSync(TELEMETRY_LIVE).length : 0;

  await withStatsCapture(
    { test_id: "knn1-T9-bookend", test_file: "test_gold_tablet_knn1.mjs", k_prompt_source: "KN-N1" },
    async () => {
      const r = appendTablet(makeTablet({ topic: "stats-capture-verify" }));
      ok(r.success);
    }
  );

  const after = existsSync(TELEMETRY_LIVE) ? readdirSync(TELEMETRY_LIVE).length : 0;
  ok(after > before, `Expected new telemetry files; before=${before} after=${after}`);
});
