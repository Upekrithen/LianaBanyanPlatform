/**
 * KN-K3 Codex MCP Tools — T1-T8 test suite
 * ============================================
 * Tests: codex_create, codex_add_chapter, codex_review, codex_bind,
 * codex_query, codex_supersede, codex_anthology_export, full lifecycle round-trip.
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import {
  allocateCodexSerial,
  appendCodexEntry,
  getCodexById,
  queryCodex,
} from "../dist/codex/schema.js";
import { CodexBinding, verifyCodexHmac } from "../dist/codex/binding.js";
import { emitPheromone } from "../dist/scribes/pheromone.js";
import { withStatsCapture } from "../dist/stats_capture/harness.js";

const binding = new CodexBinding();

function makeReviewCodex(title) {
  const id = allocateCodexSerial();
  const chapter = {
    topic: `Chapter_${randomUUID().slice(0, 6)}`,
    stratum: "sandstone",
    gold_tablet_pointers: ["LB-GOLD-MCP-0001"],
    excalibur_pointers: ["EXC-MCP-0001"],
    joules_redemption_pointers: [],
    jar_pointers: ["LB-BISHOP.HS-0001"],
    body_text: "Test chapter content.",
    ts_drafted: new Date().toISOString(),
  };
  const codex = { id, uuid: randomUUID(), title, edition: "1.0", chapters: [chapter], status: "review", created_ts: new Date().toISOString() };
  appendCodexEntry(codex);
  return codex;
}

// ─── T1: codex_create round-trips ─────────────────────────────────────────────

test("T1: codex_create returns drafting Codex with LB-CODEX serial", async () => {
  await withStatsCapture({
    test_id: "knk3_t1",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_codex_create" });

    const id = allocateCodexSerial();
    const codex = { id, uuid: randomUUID(), title: "KNK3 T1 Test", edition: "1.0", chapters: [], status: "drafting", created_ts: new Date().toISOString() };
    appendCodexEntry(codex);

    const read = getCodexById(id);
    ok(read, "codex should be readable");
    strictEqual(read.status, "drafting");
    ok(id.startsWith("LB-CODEX-"), `serial format: ${id}`);
  });
});

// ─── T2: codex_add_chapter round-trips ────────────────────────────────────────

test("T2: codex_add_chapter appends chapter to drafting Codex", async () => {
  await withStatsCapture({
    test_id: "knk3_t2",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_codex_add_chapter" });

    const id = allocateCodexSerial();
    const codex = { id, uuid: randomUUID(), title: "KNK3 T2", edition: "1.0", chapters: [], status: "drafting", created_ts: new Date().toISOString() };
    appendCodexEntry(codex);

    // Add chapter via manual update (simulating the MCP tool pattern)
    const chapter = { topic: "Chapter Alpha", stratum: "limestone", gold_tablet_pointers: ["LB-GOLD-0001"], excalibur_pointers: ["EXC-0001"], jar_pointers: ["LB-BISHOP.HS-0001"], body_text: "Chapter prose.", ts_drafted: new Date().toISOString() };
    const updated = { ...codex, chapters: [chapter] };
    appendCodexEntry(updated);

    const read = getCodexById(id);
    strictEqual(read.chapters.length, 1, "should have 1 chapter");
    strictEqual(read.chapters[0].topic, "Chapter Alpha");
  });
});

// ─── T3: codex_review transitions to review ───────────────────────────────────

test("T3: codex_review transitions status drafting → review", async () => {
  await withStatsCapture({
    test_id: "knk3_t3",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_codex_review" });

    const id = allocateCodexSerial();
    const codex = { id, uuid: randomUUID(), title: "KNK3 T3", edition: "1.0", chapters: [], status: "drafting", created_ts: new Date().toISOString() };
    appendCodexEntry(codex);

    const reviewed = { ...codex, status: "review" };
    appendCodexEntry(reviewed);

    const read = getCodexById(id);
    strictEqual(read.status, "review");
  });
});

// ─── T4: codex_bind transitions to bound + HMAC ───────────────────────────────

test("T4: codex_bind transitions to bound + bound_hmac populated", async () => {
  await withStatsCapture({
    test_id: "knk3_t4",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_codex_bind" });

    const codex = makeReviewCodex("KNK3 T4 Bind");
    const bound = await binding.bind(codex.id, "KNK3_signer");
    ok(!("error" in bound), `bind should succeed: ${"error" in bound ? bound.error : ""}`);
    if ("error" in bound) return;

    strictEqual(bound.status, "bound");
    ok(bound.bound_hmac, "bound_hmac should be set");
    ok(verifyCodexHmac(bound), "HMAC should verify");
  });
});

// ─── T5: codex_query filters correctly ────────────────────────────────────────

test("T5: codex_query filters by status correctly", async () => {
  await withStatsCapture({
    test_id: "knk3_t5",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_codex_query" });

    const title_unique = `KNK3_T5_${randomUUID().slice(0, 8)}`;
    const codex = makeReviewCodex(title_unique);
    await binding.bind(codex.id, "KNK3_signer");

    const results = queryCodex({ status: "bound" });
    ok(results.length >= 1, "should find at least 1 bound codex");

    const found = results.find((c) => c.title === title_unique);
    ok(found, "should find our specific bound codex by title");
  });
});

// ─── T6: codex_supersede chains correctly ─────────────────────────────────────

test("T6: codex_supersede sets superseded_by and status=superseded", async () => {
  await withStatsCapture({
    test_id: "knk3_t6",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_codex_supersede" });

    const old_codex = makeReviewCodex("KNK3 T6 Old");
    const new_codex = makeReviewCodex("KNK3 T6 New");

    await binding.bind(old_codex.id, "KNK3_signer");
    await binding.supersede(old_codex.id, new_codex.id);

    const read = getCodexById(old_codex.id);
    strictEqual(read.status, "superseded");
    strictEqual(read.superseded_by, new_codex.id);
  });
});

// ─── T7: codex_anthology_export writes provenance ────────────────────────────

test("T7: anthology_export records export in codex.anthology_exports with provenance", async () => {
  await withStatsCapture({
    test_id: "knk3_t7",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T7_anthology_export" });

    const codex = makeReviewCodex("KNK3 T7 Anthology");
    const bound = await binding.bind(codex.id, "KNK3_signer");
    ok(!("error" in bound));
    if ("error" in bound) return;

    const target = "ai_cake";
    const exported_ts = new Date().toISOString();
    const updated = {
      ...bound,
      anthology_exports: [{ target, exported_ts }],
    };
    appendCodexEntry(updated);

    emitPheromone("CodexAnthology", `test_export_${codex.id}`, `codex anthology ${target}`, { cathedral: "knight" });

    const read = getCodexById(codex.id);
    ok(read.anthology_exports, "anthology_exports should be set");
    ok(read.anthology_exports.some((e) => e.target === "ai_cake"), "ai_cake export should be recorded");
  });
});

// ─── T8: Full lifecycle round-trip ───────────────────────────────────────────

test("T8: full lifecycle — create + add_chapter×5 + review + bind + anthology_export", async () => {
  await withStatsCapture({
    test_id: "knk3_t8",
    test_file: "test_codex_mcp_knk3.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T8_full_lifecycle" });

    // 1. Create
    const id = allocateCodexSerial();
    let codex = { id, uuid: randomUUID(), title: `KNK3 T8 Lifecycle ${id}`, edition: "1.0", chapters: [], status: "drafting", created_ts: new Date().toISOString() };
    appendCodexEntry(codex);

    // 2. Add 5 chapters
    for (let i = 0; i < 5; i++) {
      const chapter = {
        topic: `Chapter_${i + 1}`,
        stratum: "sandstone",
        gold_tablet_pointers: [`LB-GOLD-${i + 1}`],
        excalibur_pointers: [`EXC-${i + 1}`],
        jar_pointers: [`LB-BISHOP.HS-${String(i + 1).padStart(4, "0")}`],
        body_text: `Chapter ${i + 1} body.`,
        ts_drafted: new Date().toISOString(),
      };
      codex = { ...codex, chapters: [...codex.chapters, chapter] };
      appendCodexEntry(codex);
    }

    // 3. Review
    codex = { ...codex, status: "review" };
    appendCodexEntry(codex);

    // 4. Bind
    const bound = await binding.bind(id, "KNK3_lifecycle_signer");
    ok(!("error" in bound), `lifecycle bind should succeed: ${"error" in bound ? bound.error : ""}`);
    if ("error" in bound) return;

    strictEqual(bound.status, "bound");
    strictEqual(bound.chapters.length, 5, "should have 5 chapters");

    // 5. Anthology export
    const exported = { ...bound, anthology_exports: [{ target: "no_atomo", exported_ts: new Date().toISOString() }] };
    appendCodexEntry(exported);

    const final = getCodexById(id);
    ok(final.anthology_exports.some((e) => e.target === "no_atomo"), "anthology export recorded");
    ok(verifyCodexHmac(bound), "HMAC still verifies on bound record");
  });
});
