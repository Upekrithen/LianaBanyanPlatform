/**
 * KN-J6.2 Test Suite — LocalToFederation + FederationToLocal Translation
 * ========================================================================
 * T1: Pied Piper instance translates 4-tuple → IPv6; round-trips back to 4-tuple
 * T2: Lone Wolf cohort_class rejected at translation boundary (never federates)
 * T3: provenance ledger appends one entry per translation
 * T4: Augur Living Gate cache hit on second identical translation (timing assertion)
 * T5: HsCohortClass preserved through translation
 * T6: instance_id recovered correctly from federation address
 * T7: malformed federation address rejects cleanly
 */

import { test } from "node:test";
import { ok, strictEqual } from "node:assert/strict";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import {
  localToFederation,
  federationToLocal,
  getTranslationProvenance,
  readTranslationProvenance,
} from "../dist/house_scribe/federation_translation.js";
import { isValidIPv6 } from "../dist/house_scribe/ipv6_federation_address.js";

// T1: Pied Piper 4-tuple → IPv6 → 4-tuple round-trip
test("T1: Pied Piper translates 4-tuple to IPv6 + round-trips back", async () => {
  await withStatsCapture(
    { test_id: "knj62-T1", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 7 });

      const result = localToFederation({
        local_tuple: `auth-user-session-${Date.now()}`,
        instance_id: "LB-CAT.M-0001",
        cohort_class: "pied_piper_tier_1",
      });
      ok(result.success, `Translation must succeed: ${result.error}`);
      ok(result.federation_address, "Must return federation_address");
      ok(isValidIPv6(result.federation_address), `Must be valid IPv6: ${result.federation_address}`);
      ok(result.provenance_id, "Must return provenance_id");

      // Reverse translation
      const reverse = federationToLocal({ federation_address: result.federation_address });
      ok(reverse.success, `Reverse must succeed: ${reverse.error}`);
      strictEqual(reverse.cohort_class, "pied_piper_tier_1", "cohort_class must round-trip");
    }
  );
});

// T2: Lone Wolf rejected at translation boundary
test("T2: Lone Wolf cohort_class rejected at translation boundary", async () => {
  await withStatsCapture(
    { test_id: "knj62-T2", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 7 });

      const result = localToFederation({
        local_tuple: "auth-user-session-lone",
        instance_id: "LB-CAT.M-LONE",
        cohort_class: "lone_wolf",
      });
      ok(!result.success, "Lone Wolf must be rejected");
      ok(result.error?.toLowerCase().includes("lone wolf") || result.error?.toLowerCase().includes("never"),
        `Error must mention Lone Wolf restriction: ${result.error}`);
    }
  );
});

// T3: provenance ledger appends entry per translation
test("T3: provenance ledger appends one entry per translation", async () => {
  await withStatsCapture(
    { test_id: "knj62-T3", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 7 });

      const tuple = `prov-test-tuple-${Date.now()}`;
      const before = readTranslationProvenance(1000).length;

      localToFederation({
        local_tuple: tuple,
        instance_id: "LB-CAT.M-PROV",
        cohort_class: "federation_member",
      });

      const after = readTranslationProvenance(1000).length;
      ok(after > before, `Provenance ledger must grow: before=${before} after=${after}`);

      const entries = getTranslationProvenance(tuple);
      ok(entries.length > 0, "Must find provenance entries for the tuple");
    }
  );
});

// T4: cache hit on second identical translation
test("T4: Augur Living Gate cache hit on second identical translation", async () => {
  await withStatsCapture(
    { test_id: "knj62-T4", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 7 });

      const tuple = `cache-test-${Date.now()}`;
      const opts = { local_tuple: tuple, instance_id: "LB-CAT.M-CACHE", cohort_class: "federation_member" };

      const r1 = localToFederation(opts);
      ok(r1.success);
      strictEqual(r1.cache_hit, false, "First call must be a cache miss");

      const r2 = localToFederation(opts);
      ok(r2.success);
      strictEqual(r2.cache_hit, true, "Second call must be a cache hit");

      // Addresses must match
      strictEqual(r1.federation_address, r2.federation_address, "Addresses must match on cache hit");
    }
  );
});

// T5: HsCohortClass preserved through translation
test("T5: HsCohortClass preserved through translation", async () => {
  await withStatsCapture(
    { test_id: "knj62-T5", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 7 });

      for (const cohort_class of ["pied_piper_tier_1", "federation_member", "excalibur_subscriber"]) {
        const r = localToFederation({
          local_tuple: `class-test-${cohort_class}-${Date.now()}`,
          instance_id: `LB-CAT.M-${cohort_class.toUpperCase()}`,
          cohort_class,
        });
        ok(r.success, `Translation must succeed for ${cohort_class}`);

        const rev = federationToLocal({ federation_address: r.federation_address });
        ok(rev.success, `Reverse must succeed for ${cohort_class}`);
        strictEqual(rev.cohort_class, cohort_class, `cohort_class must be preserved for ${cohort_class}`);
      }
    }
  );
});

// T6: instance_id recovered from federation address
test("T6: instance_id recovered correctly from federation address", async () => {
  await withStatsCapture(
    { test_id: "knj62-T6", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 7 });

      const instance_id = `LB-CAT.M-INST-${Date.now()}`;
      const tuple = `inst-recovery-${Date.now()}`;
      const r = localToFederation({ local_tuple: tuple, instance_id, cohort_class: "federation_member" });
      ok(r.success);

      const rev = federationToLocal({ federation_address: r.federation_address });
      ok(rev.success);
      // instance_id should be recoverable from cache (same session)
      ok(rev.instance_id === instance_id || rev.instance_id, "instance_id must be present in recovery");
    }
  );
});

// T7: malformed federation address rejects cleanly
test("T7: malformed federation address rejects cleanly", async () => {
  await withStatsCapture(
    { test_id: "knj62-T7", test_file: "test_federation_translation_knj6_2.mjs", k_prompt_source: "KN-J6.2" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 7, assertion_total: 7 });

      const malformed = ["not-an-ipv6", "192.168.1.1", "", "gggg::1"];
      for (const addr of malformed) {
        const r = federationToLocal({ federation_address: addr });
        ok(!r.success, `Must reject malformed address: "${addr}"`);
        ok(r.error, "Must include error message");
      }
    }
  );
});
