/**
 * KN-N2 Test Suite — Gold Tablet Authority + Excalibur Pointer + Supersession Cascade
 * =====================================================================================
 * T1: platform_canon mutation requires platform-authority-signer (rejects non-platform)
 * T2: project_rules mutation allowed within own project, rejected cross-project
 * T3: Excalibur ledger-pointer linking round-trip
 * T4: Gold supersession cascade-marks dependent Excalibur as `needs_re_anchor`
 * T5: Excalibur read-only against Gold (rejects mutation attempts from Excalibur context)
 * T6: Authority-list lookup correct for platform-tier signers
 */

import { test } from "node:test";
import { ok, strictEqual } from "node:assert/strict";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import { appendTablet, readTablet } from "../dist/gold_tablet/ledger.js";
import { checkMutationAuthority, checkReadAuthority, isPlatformAuthority } from "../dist/gold_tablet/authority_check.js";
import { linkExcaliburToGold, getExcaliburPointers, getGoldTabletsForExcalibur } from "../dist/gold_tablet/excalibur_pointer.js";
import { cascadeSupersession } from "../dist/gold_tablet/supersession_cascade.js";

function makeTablet(overrides = {}) {
  return {
    tier: "platform_rules",
    scope: "platform",
    topic: `auth-test-${Date.now()}-${Math.random()}`,
    rule_text: "Test rule",
    ratification_session: "BP018",
    signer_id: "BP018",
    ...overrides,
  };
}

// T1: platform_canon requires platform-authority signer
test("T1: platform_canon mutation requires platform-authority-signer", async () => {
  await withStatsCapture(
    { test_id: "knn2-T1", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 6 });

      const reject = checkMutationAuthority({ tier: "platform_canon", scope: "platform", signer_id: "random-user-xyz" });
      ok(!reject.allowed, "Non-platform signer must be rejected");
      ok(reject.reason, "Rejection must include reason");

      const allow = checkMutationAuthority({ tier: "platform_canon", scope: "platform", signer_id: "FOUNDER" });
      ok(allow.allowed, "Founder must be allowed");

      const allowBP = checkMutationAuthority({ tier: "platform_canon", scope: "platform", signer_id: "BP018" });
      ok(allowBP.allowed, "Ratified Bishop session must be allowed");
    }
  );
});

// T2: project_rules allowed within own project, rejected cross-project
test("T2: project_rules mutation scoped correctly", async () => {
  await withStatsCapture(
    { test_id: "knn2-T2", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 6 });

      const allowed = checkMutationAuthority({
        tier: "project_rules",
        scope: "proj-alpha",
        signer_id: "proj-signer-001",
        signer_project_scope: "proj-alpha",
      });
      ok(allowed.allowed, "Own-project signer must be allowed");

      const rejected = checkMutationAuthority({
        tier: "project_rules",
        scope: "proj-beta",
        signer_id: "proj-signer-001",
        signer_project_scope: "proj-alpha",
      });
      ok(!rejected.allowed, "Cross-project mutation must be rejected");
    }
  );
});

// T3: Excalibur ledger-pointer linking round-trip
test("T3: Excalibur ledger-pointer linking round-trip", async () => {
  await withStatsCapture(
    { test_id: "knn2-T3", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 6 });

      const tablet = appendTablet(makeTablet());
      ok(tablet.success);
      const gold_id = tablet.tablet.id;
      const excalibur_id = `EXC-TEST-${Date.now()}`;

      const link = linkExcaliburToGold(gold_id, excalibur_id);
      ok(link.success, "Linking must succeed");
      strictEqual(link.entry.gold_tablet_id, gold_id);
      strictEqual(link.entry.excalibur_id, excalibur_id);
      strictEqual(link.entry.excalibur_status, "anchored");

      const pointers = getExcaliburPointers(gold_id);
      ok(pointers.some((p) => p.excalibur_id === excalibur_id), "Pointer must be retrievable by gold_tablet_id");

      const reverse = getGoldTabletsForExcalibur(excalibur_id);
      ok(reverse.some((p) => p.gold_tablet_id === gold_id), "Reverse lookup must work");
    }
  );
});

// T4: Gold supersession cascade-marks Excalibur as needs_re_anchor
test("T4: Gold supersession cascade-marks dependent Excalibur as needs_re_anchor", async () => {
  await withStatsCapture(
    { test_id: "knn2-T4", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 6 });

      const old_tablet = appendTablet(makeTablet({ topic: "cascade-test" }));
      ok(old_tablet.success);
      const old_id = old_tablet.tablet.id;

      const exc1 = `EXC-CASCADE-A-${Date.now()}`;
      const exc2 = `EXC-CASCADE-B-${Date.now()}`;
      linkExcaliburToGold(old_id, exc1);
      linkExcaliburToGold(old_id, exc2);

      const new_tablet = appendTablet(makeTablet({ topic: "cascade-test", rule_text: "Updated", supersedes: [old_id] }));
      ok(new_tablet.success);

      const cascade = cascadeSupersession(old_id, new_tablet.tablet.id);
      ok(cascade.success, "Cascade must succeed");
      ok(cascade.excalibur_affected.includes(exc1), "exc1 must be in affected");
      ok(cascade.excalibur_affected.includes(exc2), "exc2 must be in affected");

      const pointers = getExcaliburPointers(old_id);
      const p1 = pointers.find((p) => p.excalibur_id === exc1);
      strictEqual(p1?.excalibur_status, "needs_re_anchor", "exc1 must be needs_re_anchor after cascade");
    }
  );
});

// T5: Excalibur read-only (authority check rejects Excalibur as mutator)
test("T5: Excalibur read-only against Gold (rejects mutation from excalibur context)", async () => {
  await withStatsCapture(
    { test_id: "knn2-T5", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 6 });

      // An Excalibur subscriber is not a platform-authority signer
      const check = checkMutationAuthority({
        tier: "platform_canon",
        scope: "platform",
        signer_id: "excalibur-subscriber-abc",
      });
      ok(!check.allowed, "Excalibur subscriber must be rejected as Gold mutator");

      // But Excalibur can READ
      const readCheck = checkReadAuthority({
        tier: "platform_rules",
        scope: "platform",
        reader_cohort_class: "excalibur_subscriber",
      });
      ok(readCheck.allowed, "Excalibur subscriber can read platform_rules");
    }
  );
});

// T6: Authority-list lookup correct for platform-tier signers
test("T6: Authority-list lookup correct for platform-tier signers", async () => {
  await withStatsCapture(
    { test_id: "knn2-T6", test_file: "test_gold_tablet_authority_knn2.mjs", k_prompt_source: "KN-N2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 6 });

      ok(isPlatformAuthority("FOUNDER"), "FOUNDER is platform authority");
      ok(isPlatformAuthority("BP018"), "BP018 is platform authority");
      ok(isPlatformAuthority("K461"), "K461 is platform authority");
      ok(!isPlatformAuthority("member-xyz"), "Random member is not platform authority");
      ok(!isPlatformAuthority("excalibur-subscriber-99"), "Excalibur subscriber is not platform authority");
    }
  );
});
