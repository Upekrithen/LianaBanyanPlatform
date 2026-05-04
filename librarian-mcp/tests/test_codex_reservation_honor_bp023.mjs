/**
 * Bushel 32B — codex_create Reservation-Honor Patch (BP023)
 * ===========================================================
 * T1: codex_create without reservation_id auto-allocates (regression)
 * T2: 10 concurrent codex_create calls with same reservation_id → exactly 1 succeeds, 9 fail corpus_id_already_taken
 * T3: codex_create with valid reservation_id → corpus entry id === reservation.serial
 * T4: codex_create with missing reservation_id → reservation_not_found
 * T5: codex_create with already-bound reservation_id → reservation_already_bound
 * T6: codex_create with expired reservation_id → reservation_expired
 * T7: Full ceremony: reserve → create-with-reservation → add_chapter → review → bind → bind_reservation
 * T8: 5 parallel full-ceremony Bushel fires → all bound with non-colliding IDs
 */

import { strictEqual, ok } from "assert";
import { test } from "node:test";
import { randomUUID } from "crypto";

import {
  allocateCodexSerial,
  appendCodexEntry,
  getCodexById,
  appendReservationEntry,
  getReservationById,
} from "../dist/codex/schema.js";
import { CodexBinding } from "../dist/codex/binding.js";
import {
  reserveNextSerial,
  bindReservation,
  resolveReservationForCreate,
} from "../dist/codex/serial_allocator.js";

const binding = new CodexBinding();

// Helper: create corpus entry using resolveReservationForCreate or auto-allocate
async function createCodex(title, edition, reservation_id) {
  const { randomUUID: uuid } = await import("crypto");
  let id;

  if (reservation_id) {
    const { readAllCodexEntries } = await import("../dist/codex/schema.js");
    const corpusEntryExists = (serial) =>
      readAllCodexEntries().some((c) => c.id === serial);
    const resolved = await resolveReservationForCreate(reservation_id, corpusEntryExists);
    if ("error_code" in resolved) return { error: resolved.error, error_code: resolved.error_code };
    id = resolved.serial;
  } else {
    id = allocateCodexSerial();
  }

  const codex = { id, uuid: uuid(), title, edition, chapters: [], status: "drafting", created_ts: new Date().toISOString() };
  appendCodexEntry(codex);
  return { codex };
}

// Helper: make a review-ready Codex
function makeReviewCodex(id, title) {
  const chapter = {
    topic: "T8_Chapter",
    stratum: "sandstone",
    gold_tablet_pointers: ["LB-GOLD-BP023-0001"],
    excalibur_pointers: ["EXC-BP023-0001"],
    jar_pointers: ["LB-BISHOP.HS-BP023"],
    body_text: "Bushel 32B test chapter.",
    ts_drafted: new Date().toISOString(),
  };
  const codex = { id, uuid: randomUUID(), title, edition: "BP023", chapters: [chapter], status: "review", created_ts: new Date().toISOString() };
  appendCodexEntry(codex);
  return codex;
}

// ─── T1: auto-allocate path (regression) ─────────────────────────────────────

test("T1: codex_create without reservation_id auto-allocates serial (regression)", async () => {
  const result = await createCodex(`BP023_T1_${randomUUID().slice(0, 6)}`, "BP023", undefined);
  ok(!("error_code" in result), "should succeed");
  ok(result.codex.id.startsWith("LB-CODEX-"), `serial format: ${result.codex.id}`);
  strictEqual(result.codex.status, "drafting");

  const read = getCodexById(result.codex.id);
  ok(read, "should be readable from ledger");
  strictEqual(read.status, "drafting");
});

// ─── T2: concurrent same reservation_id → exactly 1 wins ─────────────────────

test("T2: 10 concurrent codex_create with same reservation_id → exactly 1 wins, 9 get corpus_id_already_taken", async () => {
  const resResult = await reserveNextSerial(
    "T2_concurrent_test",
    "T2 Concurrent Race Test",
    "BP023",
    32.5,
  );
  ok(!("error" in resResult), `reservation should succeed: ${"error" in resResult ? resResult.error : ""}`);
  if ("error" in resResult) return;
  const { reservation_id, serial } = resResult;

  const promises = Array.from({ length: 10 }, (_, i) =>
    createCodex(`T2_concurrent_${i}`, "BP023", reservation_id)
  );
  const results = await Promise.all(promises);

  const successes = results.filter((r) => !("error_code" in r));
  const failures = results.filter((r) => "error_code" in r && r.error_code === "corpus_id_already_taken");

  strictEqual(successes.length, 1, `exactly 1 should succeed (got ${successes.length})`);
  strictEqual(failures.length, 9, `exactly 9 should fail with corpus_id_already_taken (got ${failures.length})`);
  strictEqual(successes[0].codex.id, serial, "winner's corpus id should match reservation serial");
});

// ─── T3: valid reservation_id → corpus id matches reserved serial ─────────────

test("T3: codex_create with valid reservation_id → corpus entry id === reservation.serial", async () => {
  const resResult = await reserveNextSerial(
    "T3_valid_test",
    "T3 Valid Reservation Test",
    "BP023",
    32.5,
  );
  ok(!("error" in resResult));
  if ("error" in resResult) return;
  const { reservation_id, serial } = resResult;

  const result = await createCodex(`BP023_T3_${randomUUID().slice(0, 6)}`, "BP023", reservation_id);
  ok(!("error_code" in result), `create should succeed: ${"error_code" in result ? result.error : ""}`);
  if ("error_code" in result) return;

  strictEqual(result.codex.id, serial, "corpus id must equal reservation serial");

  const read = getCodexById(serial);
  ok(read, "corpus entry readable by reserved serial");
  strictEqual(read.id, serial);
});

// ─── T4: missing reservation_id → reservation_not_found ──────────────────────

test("T4: codex_create with non-existent reservation_id → reservation_not_found", async () => {
  const result = await createCodex("T4_missing", "BP023", randomUUID());
  ok("error_code" in result, "should fail");
  strictEqual(result.error_code, "reservation_not_found");
});

// ─── T5: already-bound reservation_id → reservation_already_bound ────────────

test("T5: codex_create with already-bound reservation_id → reservation_already_bound", async () => {
  const resResult = await reserveNextSerial("T5_bound_test", "T5 Bound Test", "BP023", 32.5);
  ok(!("error" in resResult));
  if ("error" in resResult) return;
  const { reservation_id, serial } = resResult;

  // First create (succeeds)
  const first = await createCodex(`T5_first_${serial}`, "BP023", reservation_id);
  ok(!("error_code" in first), "first create should succeed");
  if ("error_code" in first) return;

  // Simulate binding the reservation (write a bound reservation row)
  const existing = getReservationById(reservation_id);
  ok(existing, "reservation should exist");
  appendReservationEntry({ ...existing, status: "bound", bound_codex_id: serial, bound_ts: new Date().toISOString() });

  // Second create with same reservation_id → should fail reservation_already_bound
  const second = await createCodex("T5_second", "BP023", reservation_id);
  ok("error_code" in second, "second create should fail");
  strictEqual(second.error_code, "reservation_already_bound");
});

// ─── T6: expired reservation_id → reservation_expired ────────────────────────

test("T6: codex_create with expired reservation_id → reservation_expired", async () => {
  // Write a reservation row with expired status directly
  const reservation_id = randomUUID();
  const pastTs = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 days ago
  appendReservationEntry({
    type: "reservation",
    serial: `LB-CODEX-EXPIRED-T6-${randomUUID().slice(0, 4)}`,
    reserved_by: "T6_test",
    intended_title: "T6 Expired",
    intended_session: "BP023",
    intended_bushel: 32.5,
    reserved_ts: pastTs,
    reservation_id,
    status: "expired",
    expires_ts: pastTs,
  });

  const result = await createCodex("T6_expired", "BP023", reservation_id);
  ok("error_code" in result, "should fail");
  strictEqual(result.error_code, "reservation_expired");
});

// ─── T7: Full ceremony ────────────────────────────────────────────────────────

test("T7: full ceremony — reserve → create-with-reservation → add_chapter → review → bind → bind_reservation", async () => {
  // 1. Reserve
  const resResult = await reserveNextSerial("T7_ceremony", "T7 Full Ceremony", "BP023", 32.5);
  ok(!("error" in resResult), `reservation failed: ${"error" in resResult ? resResult.error : ""}`);
  if ("error" in resResult) return;
  const { reservation_id, serial } = resResult;

  // 2. Create with reservation_id
  const createResult = await createCodex("T7 Full Ceremony Codex", "BP023", reservation_id);
  ok(!("error_code" in createResult), `create failed: ${"error_code" in createResult ? createResult.error : ""}`);
  if ("error_code" in createResult) return;
  strictEqual(createResult.codex.id, serial, "T7: corpus id must equal reservation serial");

  // 3. Add chapter
  const chapter = {
    topic: "T7_Ceremony_Chapter",
    stratum: "limestone",
    gold_tablet_pointers: ["LB-GOLD-T7"],
    excalibur_pointers: ["EXC-T7"],
    jar_pointers: ["LB-BISHOP.HS-T7"],
    body_text: "T7 ceremony chapter — Bushel 32B dual-serial-space patch test.",
    ts_drafted: new Date().toISOString(),
  };
  const withChapter = { ...createResult.codex, chapters: [chapter] };
  appendCodexEntry(withChapter);

  // 4. Review
  const inReview = { ...withChapter, status: "review" };
  appendCodexEntry(inReview);

  // 5. Bind
  const bound = await binding.bind(serial, "T7_ceremony_signer");
  ok(!("error" in bound), `bind failed: ${"error" in bound ? bound.error : ""}`);
  if ("error" in bound) return;
  strictEqual(bound.status, "bound");
  ok(bound.bound_hmac, "bound_hmac set");

  // 6. bind_reservation
  const bindRes = await bindReservation(reservation_id, serial);
  ok(!("error" in bindRes), `bind_reservation failed: ${"error" in bindRes ? bindRes.error : ""}`);
  if ("error" in bindRes) return;
  strictEqual(bindRes.success, true);
  strictEqual(bindRes.serial, serial, "T7: reservation serial matches bound corpus id");

  // 7. Verify final state: reservation status=bound + corpus status=bound + matching IDs
  const finalRes = getReservationById(reservation_id);
  ok(finalRes, "reservation should still be readable");
  strictEqual(finalRes.status, "bound");
  strictEqual(finalRes.bound_codex_id, serial);

  const finalCodex = getCodexById(serial);
  ok(finalCodex, "corpus entry should be readable");
  strictEqual(finalCodex.status, "bound");
  strictEqual(finalCodex.id, serial);

  strictEqual(finalRes.serial, finalCodex.id, "T7 G-gate: reservation.serial === corpus.id — dual-serial-space UNIFIED");
});

// ─── T8: 5 parallel full-ceremony fires → all non-colliding bound corpus entries ─

test("T8: 5 parallel Bushel fires — all complete with non-colliding bound corpus IDs", async () => {
  async function fireCeremony(label) {
    const resResult = await reserveNextSerial(
      `T8_${label}`,
      `T8 Parallel ${label}`,
      "BP023",
      32.5,
    );
    if ("error" in resResult) throw new Error(`T8 ${label}: reservation failed — ${resResult.error}`);
    const { reservation_id, serial } = resResult;

    const createResult = await createCodex(`T8 ${label}`, "BP023", reservation_id);
    if ("error_code" in createResult) throw new Error(`T8 ${label}: create failed — ${createResult.error}`);

    const chapter = {
      topic: `T8_${label}`,
      stratum: "granite",
      gold_tablet_pointers: [`LB-GOLD-T8-${label}`],
      excalibur_pointers: [`EXC-T8-${label}`],
      jar_pointers: [`LB-BISHOP.HS-T8-${label}`],
      body_text: `T8 parallel ceremony ${label}`,
      ts_drafted: new Date().toISOString(),
    };
    appendCodexEntry({ ...createResult.codex, chapters: [chapter] });
    appendCodexEntry({ ...createResult.codex, chapters: [chapter], status: "review" });

    const bound = await binding.bind(serial, `T8_${label}_signer`);
    if ("error" in bound) throw new Error(`T8 ${label}: bind failed — ${bound.error}`);

    const bindRes = await bindReservation(reservation_id, serial);
    if ("error" in bindRes) throw new Error(`T8 ${label}: bind_reservation failed — ${bindRes.error}`);

    return serial;
  }

  const labels = ["fire_alpha", "fire_beta", "fire_gamma", "fire_delta", "fire_epsilon"];
  const boundIds = await Promise.all(labels.map((l) => fireCeremony(l)));

  // All IDs must be unique (no collisions)
  const uniqueIds = new Set(boundIds);
  strictEqual(uniqueIds.size, 5, `T8: all 5 corpus IDs must be distinct (got ${boundIds.join(", ")})`);

  // All corpus entries must be in bound status
  for (const id of boundIds) {
    const codex = getCodexById(id);
    ok(codex, `T8: corpus entry ${id} should exist`);
    strictEqual(codex.status, "bound", `T8: ${id} should be bound`);
  }
});
