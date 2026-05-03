/**
 * KN-K2 Codex Binding — T1-T6 test suite
 * ==========================================
 * Tests: bind transitions status, post-binding mutation rejected, broken-pointer rejects bind,
 * HMAC verifies, supersede chains, Pheromone Pixie-Dust.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import {
  allocateCodexSerial,
  appendCodexEntry,
  getCodexById,
} from "../dist/codex/schema.js";

import {
  CodexBinding,
  verifyCodexHmac,
} from "../dist/codex/binding.js";

import { withStatsCapture } from "../dist/stats_capture/harness.js";

const binding = new CodexBinding();

function makeValidCodex(title, status = "review") {
  const id = allocateCodexSerial();
  const chapter = {
    topic: `Chapter_${randomUUID().slice(0, 6)}`,
    stratum: "sandstone",
    gold_tablet_pointers: ["LB-GOLD-0001"],
    excalibur_pointers: ["EXC-0001"],
    joules_redemption_pointers: [],
    jar_pointers: ["LB-BISHOP.HS-0001"],
    body_text: "Valid chapter text.",
    ts_drafted: new Date().toISOString(),
  };
  const codex = {
    id,
    uuid: randomUUID(),
    title,
    edition: "1.0",
    chapters: [chapter],
    status,
    created_ts: new Date().toISOString(),
  };
  appendCodexEntry(codex);
  return codex;
}

// ─── T1: Bind transitions status + populates HMAC ─────────────────────────────

test("T1: bind transitions status 'review' → 'bound' + populates bound_hmac", async () => {
  await withStatsCapture({
    test_id: "knk2_t1",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_bind_status" });

    const codex = makeValidCodex("KNK2 T1 Bind Test");
    const result = await binding.bind(codex.id, "KNK_signer");

    ok(!("error" in result), `bind should succeed: ${"error" in result ? result.error : ""}`);
    if ("error" in result) return;

    strictEqual(result.status, "bound");
    ok(result.bound_ts, "bound_ts should be set");
    ok(result.bound_hmac, "bound_hmac should be set");
    strictEqual(result.bound_hmac.length, 16, "HMAC should be 16 hex chars");
  });
});

// ─── T2: Post-binding mutation rejected ──────────────────────────────────────

test("T2: post-binding mutation rejected by checkMutationAllowed", async () => {
  await withStatsCapture({
    test_id: "knk2_t2",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_post_binding_mutation_rejected" });

    const codex = makeValidCodex("KNK2 T2 Mutation Test");
    const bound = await binding.bind(codex.id, "KNK_signer");
    ok(!("error" in bound));
    if ("error" in bound) return;

    const check = binding.checkMutationAllowed(bound);
    ok(!check.allowed, "mutation should be rejected on bound Codex");
    ok(check.reason.includes("IMMUTABLE"), "reason should mention IMMUTABLE");
  });
});

// ─── T3: Codex with broken pointer rejects bind ───────────────────────────────

test("T3: Codex with broken (empty) pointer rejects bind", async () => {
  await withStatsCapture({
    test_id: "knk2_t3",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_broken_pointer_rejects_bind" });

    const id = allocateCodexSerial();
    const brokenChapter = {
      topic: "Broken Chapter",
      stratum: "sand",
      gold_tablet_pointers: [""],   // empty — broken pointer
      excalibur_pointers: ["EXC-0001"],
      jar_pointers: ["LB-BISHOP.HS-0001"],
      body_text: "Text",
      ts_drafted: new Date().toISOString(),
    };
    appendCodexEntry({
      id, uuid: randomUUID(), title: "Broken Codex", edition: "1.0",
      chapters: [brokenChapter], status: "review", created_ts: new Date().toISOString(),
    });

    const result = await binding.bind(id, "KNK_signer");
    ok("error" in result, "bind with broken pointer should return error");
    ok(result.error.includes("broken pointer"), `error should mention broken pointer: ${result.error}`);
  });
});

// ─── T4: HMAC verifies on bound Codex ─────────────────────────────────────────

test("T4: HMAC verifies on bound Codex; fails on tampered", async () => {
  await withStatsCapture({
    test_id: "knk2_t4",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_hmac_verifies" });

    const codex = makeValidCodex("KNK2 T4 HMAC Test");
    const bound = await binding.bind(codex.id, "KNK_signer");
    ok(!("error" in bound));
    if ("error" in bound) return;

    ok(verifyCodexHmac(bound), "HMAC should verify on freshly bound Codex");

    // Tamper — change title
    const tampered = { ...bound, title: "TAMPERED" };
    // HMAC is over chapters + id + ts, not title — but bound_hmac should still verify
    // (title is not part of HMAC payload, so this specific tamper doesn't break HMAC;
    // an actual chapter tamper would)
    const tamperedChapter = { ...bound, chapters: [{ ...bound.chapters[0], topic: "TAMPERED_TOPIC" }] };
    ok(!verifyCodexHmac(tamperedChapter), "HMAC should fail on chapter tamper");
  });
});

// ─── T5: Supersede chains correctly ──────────────────────────────────────────

test("T5: supersede sets old.superseded_by = new.id and marks old as 'superseded'", async () => {
  await withStatsCapture({
    test_id: "knk2_t5",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_supersede_chain" });

    const old_codex = makeValidCodex("KNK2 T5 Old Codex");
    const new_codex = makeValidCodex("KNK2 T5 New Codex", "drafting");

    const bound = await binding.bind(old_codex.id, "KNK_signer");
    ok(!("error" in bound));
    if ("error" in bound) return;

    await binding.supersede(old_codex.id, new_codex.id);

    const read = getCodexById(old_codex.id);
    strictEqual(read.status, "superseded");
    strictEqual(read.superseded_by, new_codex.id);
  });
});

// ─── T6: Pheromone Pixie-Dust emitted on bind ────────────────────────────────

test("T6: bind emits Pheromone Pixie-Dust without error", async () => {
  await withStatsCapture({
    test_id: "knk2_t6",
    test_file: "test_codex_binding_knk2.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_pheromone_pixie_dust" });

    const codex = makeValidCodex("KNK2 T6 Pheromone Test");
    let threw = false;
    try {
      await binding.bind(codex.id, "KNK_pheromone_signer");
    } catch (e) {
      threw = true;
    }
    ok(!threw, "bind should not throw (Pheromone Pixie-Dust is non-fatal)");
  });
});
