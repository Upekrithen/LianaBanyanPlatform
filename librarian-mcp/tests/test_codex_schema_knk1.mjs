/**
 * KN-K1 Codex Schema — T1-T6 test suite
 * ========================================
 * Tests: Codex schema serializes, chapter aggregation round-trips, pointer resolution,
 * pre-bound Codex mutable (mutations append-only).
 */

import { strictEqual, ok, deepStrictEqual } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import {
  allocateCodexSerial,
  appendCodexEntry,
  readAllCodexEntries,
  getCodexById,
  queryCodex,
} from "../dist/codex/schema.js";

import { withStatsCapture } from "../dist/stats_capture/harness.js";

function makeChapter(topic, opts = {}) {
  return {
    topic,
    stratum: opts.stratum ?? "sandstone",
    gold_tablet_pointers: opts.gold ?? ["LB-GOLD-0001"],
    excalibur_pointers: opts.excalibur ?? ["EXC-0001"],
    joules_redemption_pointers: opts.joules ?? [],
    jar_pointers: opts.jars ?? ["LB-BISHOP.HS-0001"],
    body_text: `Chapter about ${topic}`,
    ts_drafted: new Date().toISOString(),
  };
}

function makeCodex(opts = {}) {
  const id = allocateCodexSerial();
  return {
    id,
    uuid: randomUUID(),
    title: opts.title ?? `Test Codex ${id}`,
    edition: opts.edition ?? "1.0",
    chapters: opts.chapters ?? [makeChapter("default_topic")],
    status: opts.status ?? "drafting",
    created_ts: new Date().toISOString(),
  };
}

// ─── T1: Codex schema serializes correctly ────────────────────────────────────

test("T1: Codex schema serializes correctly to ledger and reads back", async () => {
  await withStatsCapture({
    test_id: "knk1_t1",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T1_codex_serialize" });

    const codex = makeCodex({ title: "KNK1 T1 Codex" });
    appendCodexEntry(codex);

    const read = getCodexById(codex.id);
    ok(read, "should read back after append");
    strictEqual(read.title, codex.title);
    strictEqual(read.edition, codex.edition);
    strictEqual(read.status, "drafting");
    ok(read.id.startsWith("LB-CODEX-"), `serial format: ${read.id}`);
  });
});

// ─── T2: Chapter aggregation round-trips ─────────────────────────────────────

test("T2: chapter aggregation round-trips with multiple chapters", async () => {
  await withStatsCapture({
    test_id: "knk1_t2",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T2_chapter_aggregation" });

    const chapters = [
      makeChapter("Chapter Alpha"),
      makeChapter("Chapter Beta"),
      makeChapter("Chapter Gamma"),
    ];

    const codex = makeCodex({ title: "KNK1 T2 Multi-Chapter", chapters });
    appendCodexEntry(codex);

    const read = getCodexById(codex.id);
    ok(read, "codex should be readable");
    strictEqual(read.chapters.length, 3);
    strictEqual(read.chapters[0].topic, "Chapter Alpha");
    strictEqual(read.chapters[1].topic, "Chapter Beta");
    strictEqual(read.chapters[2].topic, "Chapter Gamma");
  });
});

// ─── T3: Gold tablet pointers present ────────────────────────────────────────

test("T3: Gold tablet pointers recorded in chapter", async () => {
  await withStatsCapture({
    test_id: "knk1_t3",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T3_gold_pointers" });

    const chapter = makeChapter("Gold Chapter", { gold: ["LB-GOLD-0001", "LB-GOLD-0002"] });
    const codex = makeCodex({ title: "KNK1 T3 Gold Pointers", chapters: [chapter] });
    appendCodexEntry(codex);

    const read = getCodexById(codex.id);
    deepStrictEqual(read.chapters[0].gold_tablet_pointers, ["LB-GOLD-0001", "LB-GOLD-0002"]);
  });
});

// ─── T4: Excalibur pointers present ──────────────────────────────────────────

test("T4: Excalibur pointers recorded in chapter", async () => {
  await withStatsCapture({
    test_id: "knk1_t4",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T4_excalibur_pointers" });

    const chapter = makeChapter("Excalibur Chapter", { excalibur: ["EXC-0042", "EXC-0099"] });
    const codex = makeCodex({ title: "KNK1 T4 Excalibur Pointers", chapters: [chapter] });
    appendCodexEntry(codex);

    const read = getCodexById(codex.id);
    deepStrictEqual(read.chapters[0].excalibur_pointers, ["EXC-0042", "EXC-0099"]);
  });
});

// ─── T5: Jar pointers recorded ───────────────────────────────────────────────

test("T5: Jar pointers recorded in chapter (Pod-J KN-J1)", async () => {
  await withStatsCapture({
    test_id: "knk1_t5",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T5_jar_pointers" });

    const chapter = makeChapter("Jar Chapter", { jars: ["LB-BISHOP.HS-0001", "LB-KNIGHT.HS-0007"] });
    const codex = makeCodex({ title: "KNK1 T5 Jar Pointers", chapters: [chapter] });
    appendCodexEntry(codex);

    const read = getCodexById(codex.id);
    deepStrictEqual(read.chapters[0].jar_pointers, ["LB-BISHOP.HS-0001", "LB-KNIGHT.HS-0007"]);
  });
});

// ─── T6: Pre-bound Codex mutable; mutations append-only ──────────────────────

test("T6: pre-bound Codex accepts chapter additions (append-only via ledger re-write)", async () => {
  await withStatsCapture({
    test_id: "knk1_t6",
    test_file: "test_codex_schema_knk1.mjs",
    knight_session_id: "KNK",
  }, async (h) => {
    h.tick({ phase: "D", test_name: "T6_pre_bound_mutable" });

    const codex = makeCodex({ title: "KNK1 T6 Mutable Draft", chapters: [makeChapter("Original Chapter")] });
    appendCodexEntry(codex);

    // Add a chapter (simulate update by appending updated codex state)
    const updatedChapters = [...codex.chapters, makeChapter("Added Chapter")];
    const updated = { ...codex, chapters: updatedChapters };
    appendCodexEntry(updated); // last-write-wins for this ID

    const read = getCodexById(codex.id);
    strictEqual(read.chapters.length, 2, "should have 2 chapters after update");
    strictEqual(read.chapters[1].topic, "Added Chapter");
  });
});
