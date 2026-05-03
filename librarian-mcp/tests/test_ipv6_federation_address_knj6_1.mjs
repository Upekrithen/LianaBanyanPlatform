/**
 * KN-J6.1 Test Suite — IPv6 Federation Address Scheme + Scope-Tier Prefixes
 * ===========================================================================
 * T1: buildFederationAddress for each cohort_class produces correct prefix
 * T2: parseFederationAddress round-trips correctly
 * T3: zero-compression canonical form preserved
 * T4: Lone Wolf addresses contain fe80:: prefix (never federate)
 * T5: invalid IPv6 format rejected
 * T6: scope-tier inferred correctly from prefix
 */

import { test } from "node:test";
import { ok, strictEqual } from "node:assert/strict";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import {
  buildFederationAddress,
  parseFederationAddress,
  isValidIPv6,
  inferCohortClass,
  canonicalizeIPv6,
  expandIPv6,
  SCOPE_TIER_PREFIXES,
} from "../dist/house_scribe/ipv6_federation_address.js";

// T1: buildFederationAddress produces correct prefix per cohort_class
test("T1: buildFederationAddress produces correct scope-tier prefix per cohort_class", async () => {
  await withStatsCapture(
    { test_id: "knj61-T1", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 6 });

      const classes = ["lone_wolf", "pied_piper_tier_1", "federation_member", "excalibur_subscriber", "thirteenth_warrior"];
      for (const cc of classes) {
        const addr = buildFederationAddress({
          cohort_class: cc,
          instance_hash: `inst-${cc}`,
          tuple_hash: `tuple-${cc}`,
          resource_suffix: `res-${cc}`,
        });
        ok(addr, `Address must be generated for ${cc}`);
        ok(isValidIPv6(addr), `Address must be valid IPv6 for ${cc}: ${addr}`);

        // Check prefix alignment
        const expanded = expandIPv6(addr);
        ok(expanded, `Address must expand for ${cc}`);

        if (cc === "lone_wolf") {
          ok(expanded.startsWith("fe80"), `Lone Wolf must start with fe80: ${expanded}`);
        } else if (cc === "pied_piper_tier_1") {
          ok(expanded.startsWith("fc00"), `Pied Piper must start with fc00: ${expanded}`);
        } else if (cc === "federation_member") {
          ok(expanded.startsWith("2001"), `Federation Member must start with 2001: ${expanded}`);
        }
      }
    }
  );
});

// T2: parseFederationAddress round-trips correctly
test("T2: parseFederationAddress round-trips correctly", async () => {
  await withStatsCapture(
    { test_id: "knj61-T2", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 6 });

      for (const cc of ["pied_piper_tier_1", "federation_member", "excalibur_subscriber"]) {
        const addr = buildFederationAddress({
          cohort_class: cc,
          instance_hash: `inst-${cc}-rt`,
          tuple_hash: `tuple-${cc}-rt`,
          resource_suffix: `res-${cc}-rt`,
        });

        const parsed = parseFederationAddress(addr);
        ok(parsed, `parseFederationAddress must return result for ${cc}`);
        strictEqual(parsed.cohort_class, cc, `Cohort class must round-trip for ${cc}`);
        ok(parsed.instance_hash, "instance_hash must be present");
        ok(parsed.tuple_hash, "tuple_hash must be present");
      }
    }
  );
});

// T3: zero-compression canonical form
test("T3: zero-compression canonical form is valid IPv6", async () => {
  await withStatsCapture(
    { test_id: "knj61-T3", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 6 });

      // Canonicalize some known addresses
      const cases = [
        "2001:0db8:0000:0000:0000:0000:0000:0001",
        "fe80:0000:0000:0000:0000:0000:0000:0001",
        "fc00:0000:0000:0000:0000:0000:0000:0001",
      ];

      for (const raw of cases) {
        const canonical = canonicalizeIPv6(raw);
        ok(canonical, `Must produce canonical form for ${raw}`);
        ok(canonical.includes("::") || canonical.split(":").every((g) => g.length <= 4),
          `Canonical form must be valid: ${canonical}`);
        // Round-trip: expanded form of canonical == expanded form of raw
        const rawExpanded = expandIPv6(raw);
        const canonExpanded = expandIPv6(canonical);
        strictEqual(rawExpanded, canonExpanded, "Canonical expansion must equal raw expansion");
      }
    }
  );
});

// T4: Lone Wolf addresses contain fe80:: prefix
test("T4: Lone Wolf addresses use fe80:: link-local prefix", async () => {
  await withStatsCapture(
    { test_id: "knj61-T4", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 6 });

      const addr = buildFederationAddress({
        cohort_class: "lone_wolf",
        instance_hash: "lw-inst",
        tuple_hash: "lw-tuple",
        resource_suffix: "lw-res",
      });
      const expanded = expandIPv6(addr);
      ok(expanded.startsWith("fe80"), `Lone Wolf must use fe80 link-local prefix, got: ${expanded}`);

      // Lone Wolf should never federate — validate via prefix inference
      const inferred = inferCohortClass(addr);
      strictEqual(inferred, "lone_wolf", "Lone Wolf must be inferrable from fe80 prefix");
    }
  );
});

// T5: invalid IPv6 rejected
test("T5: invalid IPv6 format rejected", async () => {
  await withStatsCapture(
    { test_id: "knj61-T5", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 5, assertion_total: 6 });

      const invalid = [
        "not-an-address",
        "192.168.1.1",
        "2001:db8::xyz::1",
        "",
        "gggg::1",
      ];

      for (const addr of invalid) {
        ok(!isValidIPv6(addr), `Must reject invalid IPv6: "${addr}"`);
      }

      // parseFederationAddress must return null for invalid
      for (const addr of invalid) {
        const result = parseFederationAddress(addr);
        ok(result === null, `parseFederationAddress must return null for "${addr}"`);
      }
    }
  );
});

// T6: scope-tier inferred from prefix
test("T6: scope-tier inferred correctly from prefix", async () => {
  await withStatsCapture(
    { test_id: "knj61-T6", test_file: "test_ipv6_federation_address_knj6_1.mjs", k_prompt_source: "KN-J6.1" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 6, assertion_total: 6 });

      const expectations = [
        { cohort_class: "lone_wolf", prefix_check: (e) => e.startsWith("fe80") },
        { cohort_class: "pied_piper_tier_1", prefix_check: (e) => e.startsWith("fc00") },
        { cohort_class: "federation_member", prefix_check: (e) => e.startsWith("2001") },
      ];

      for (const { cohort_class, prefix_check } of expectations) {
        const addr = buildFederationAddress({
          cohort_class,
          instance_hash: `inst-${cohort_class}`,
          tuple_hash: `tuple-${cohort_class}`,
          resource_suffix: "scope-test",
        });
        const expanded = expandIPv6(addr);
        ok(prefix_check(expanded), `${cohort_class} must have correct prefix: ${expanded}`);
        const inferred = inferCohortClass(addr);
        strictEqual(inferred, cohort_class, `Must infer ${cohort_class} from its prefix`);
      }
    }
  );
});
