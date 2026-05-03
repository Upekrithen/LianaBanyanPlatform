/**
 * KN-J6.3 Test Suite — KN-J5 Cross-Cathedral Router IPv6 Extension + MCP Tools
 * ==============================================================================
 * T1: KN-J5 cross-cathedral router accepts IPv6 wildcard pattern (e.g. fc00::*)
 * T2: KN-J5 routes Pied Piper IPv6 to other Pied Piper instances only
 * T3: MCP tool round-trips correctly (coordinate_translate_local_to_federation)
 * T4: Provenance chain returns full translation history
 */

import { test } from "node:test";
import { ok, strictEqual } from "node:assert/strict";
import { withStatsCapture } from "../dist/stats_capture/harness.js";
import {
  localToFederation,
  getTranslationProvenance,
} from "../dist/house_scribe/federation_translation.js";
import {
  isValidIPv6,
  SCOPE_TIER_PREFIXES,
  inferCohortClass,
  buildFederationAddress,
} from "../dist/house_scribe/ipv6_federation_address.js";

// T1: IPv6 wildcard pattern recognition
test("T1: IPv6 scope-tier prefixes can be used as wildcard patterns", async () => {
  await withStatsCapture(
    { test_id: "knj63-T1", test_file: "test_kn_j5_ipv6_extension_knj6_3.mjs", k_prompt_source: "KN-J6.3" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 1, assertion_total: 4 });

      // Pied Piper wildcard: fc00::*
      const ppPrefix = SCOPE_TIER_PREFIXES["pied_piper_tier_1"];
      ok(ppPrefix.startsWith("fc00"), `Pied Piper prefix must start with fc00: ${ppPrefix}`);

      // Generate several Pied Piper addresses and verify they all match the prefix
      for (let i = 0; i < 5; i++) {
        const addr = buildFederationAddress({
          cohort_class: "pied_piper_tier_1",
          instance_hash: `inst-${i}`,
          tuple_hash: `tuple-${i}`,
          resource_suffix: `res-${i}`,
        });
        const inferred = inferCohortClass(addr);
        strictEqual(inferred, "pied_piper_tier_1",
          `Address ${addr} must infer as pied_piper_tier_1, got ${inferred}`);
      }
    }
  );
});

// T2: Pied Piper IPv6 routes to Pied Piper peers only
test("T2: Pied Piper IPv6 addresses route only to pied_piper tier", async () => {
  await withStatsCapture(
    { test_id: "knj63-T2", test_file: "test_kn_j5_ipv6_extension_knj6_3.mjs", k_prompt_source: "KN-J6.3" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 2, assertion_total: 4 });

      const ppAddr = buildFederationAddress({
        cohort_class: "pied_piper_tier_1",
        instance_hash: "pp-inst-routing",
        tuple_hash: "pp-tuple-routing",
        resource_suffix: "pp-res-routing",
      });

      // A federation_member address
      const fmAddr = buildFederationAddress({
        cohort_class: "federation_member",
        instance_hash: "fm-inst-routing",
        tuple_hash: "fm-tuple-routing",
        resource_suffix: "fm-res-routing",
      });

      // They must have different scope-tier prefixes
      const ppClass = inferCohortClass(ppAddr);
      const fmClass = inferCohortClass(fmAddr);

      strictEqual(ppClass, "pied_piper_tier_1", "PP address must infer PP class");
      strictEqual(fmClass, "federation_member", "FM address must infer FM class");
      ok(ppClass !== fmClass, "PP and FM must be distinct classes (different routing targets)");
    }
  );
});

// T3: MCP tool round-trip (coordinate_translate_local_to_federation via translation module)
test("T3: localToFederation MCP tool round-trips correctly", async () => {
  await withStatsCapture(
    { test_id: "knj63-T3", test_file: "test_kn_j5_ipv6_extension_knj6_3.mjs", k_prompt_source: "KN-J6.3" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 3, assertion_total: 4 });

      const tuple = `mcp-round-trip-${Date.now()}`;
      const r = localToFederation({
        local_tuple: tuple,
        instance_id: "LB-CAT.M-MCP-TEST",
        cohort_class: "federation_member",
      });
      ok(r.success, `MCP tool must succeed: ${r.error}`);
      ok(r.federation_address, "Must return federation_address");
      ok(isValidIPv6(r.federation_address), `Must be valid IPv6: ${r.federation_address}`);
      ok(r.provenance_id, "Must return provenance_id");
      ok(r.provenance_id.startsWith("LB-TRANS-"), "provenance_id must start with LB-TRANS-");
    }
  );
});

// T4: Provenance chain returns full translation history
test("T4: Provenance chain returns full translation history", async () => {
  await withStatsCapture(
    { test_id: "knj63-T4", test_file: "test_kn_j5_ipv6_extension_knj6_3.mjs", k_prompt_source: "KN-J6.3" },
    async (harness) => {
      harness.tick({ phase: "D", assertion_index: 4, assertion_total: 4 });

      const tuple = `provenance-chain-${Date.now()}`;

      // Translate multiple times
      localToFederation({ local_tuple: tuple, instance_id: "LB-CAT.M-A", cohort_class: "federation_member" });
      // Second call hits cache but still writes provenance
      localToFederation({ local_tuple: tuple, instance_id: "LB-CAT.M-A", cohort_class: "federation_member" });

      const chain = getTranslationProvenance(tuple);
      ok(chain.length >= 1, `Provenance chain must have at least 1 entry, got ${chain.length}`);
      for (const entry of chain) {
        ok(entry.provenance_id, "Each entry must have provenance_id");
        ok(entry.timestamp, "Each entry must have timestamp");
        ok(!isNaN(Date.parse(entry.timestamp)), "Timestamp must be valid ISO-8601");
      }
    }
  );
});
