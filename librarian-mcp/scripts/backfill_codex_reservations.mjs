/**
 * backfill_codex_reservations.mjs
 * Bushel 32 / BP022 Phase D — Backfill existing paper-draft files as reservation rows.
 *
 * Sweeps the three unbound paper drafts at 0035, 0036, 0037 and writes
 * reservation rows to the codex ledger for each.
 *
 * Also records the historical collision serials (0032/0033/0034) in
 * originally_proposed_serial metadata.
 *
 * Run once: node librarian-mcp/scripts/backfill_codex_reservations.mjs
 */

import { appendFileSync, existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CODEX_LEDGER = resolve(__dirname, "../stitchpunks/codex/codex_ledger.jsonl");

// ─── Read existing reservations to avoid duplicates ──────────────────────────

function readExistingReservationSerials() {
  if (!existsSync(CODEX_LEDGER)) return new Set();
  const raw = readFileSync(CODEX_LEDGER, "utf-8");
  const serials = new Set();
  for (const line of raw.split("\n").filter(l => l.trim())) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === "reservation" && entry.serial) {
        serials.add(entry.serial);
      }
    } catch { /* skip */ }
  }
  return serials;
}

// ─── Backfill entries ─────────────────────────────────────────────────────────

const now = new Date().toISOString();
const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

const drafts = [
  {
    serial: "LB-CODEX-0035",
    reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 11",
    intended_title: "Bushel 11: Cluster K Tier-1 Trademark Batch + Cephas Content Registry Migration",
    intended_session: "BP022",
    intended_bushel: 11,
    originally_proposed_serial: "LB-CODEX-0032",
    paper_draft_path: "BISHOP_DROPZONE/14_CanonicalReferences/LB_CODEX_0035_DRAFT_BUSHEL_11_CLUSTER_K.md",
    reserved_ts: "2026-05-03T00:00:00Z",
    notes: "Originally proposed 0032 (collision: Bushel 15 already-bound 0032). Renamed to 0035 in Bishop Maintenance-Scribe pass.",
  },
  {
    serial: "LB-CODEX-0036",
    reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 9 Phase E",
    intended_title: "Bushel 9: Crown Letter Wave 1 Dispatch Coordination",
    intended_session: "BP022",
    intended_bushel: 9,
    originally_proposed_serial: "LB-CODEX-0033",
    paper_draft_path: "BISHOP_DROPZONE/14_CanonicalReferences/LB_CODEX_0036_DRAFT_BUSHEL_9_CROWN_LETTER_WAVE_1_DISPATCH.md",
    reserved_ts: "2026-05-03T00:00:00Z",
    notes: "Originally proposed 0033 (TRIPLE collision: Bushels 18, 9, 12 all proposed 0033). Renamed to 0036.",
  },
  {
    serial: "LB-CODEX-0037",
    reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 12",
    intended_title: "Bushel 12: Save-the-World 12-Paper Series A&A Formal Drafting Cascade",
    intended_session: "BP022",
    intended_bushel: 12,
    originally_proposed_serial: "LB-CODEX-0033",
    paper_draft_path: "BISHOP_DROPZONE/14_CanonicalReferences/LB-CODEX-0037-BUSHEL-12-SAVE-THE-WORLD-AA-CASCADE-BP022.md",
    reserved_ts: "2026-05-03T00:00:00Z",
    notes: "Originally proposed 0033 (part of TRIPLE collision). Renamed to 0037.",
  },
];

const existingSerials = readExistingReservationSerials();
let written = 0;
let skipped = 0;

for (const draft of drafts) {
  if (existingSerials.has(draft.serial)) {
    console.log(`  SKIP ${draft.serial} — reservation row already exists`);
    skipped++;
    continue;
  }

  const reservation = {
    type: "reservation",
    serial: draft.serial,
    reserved_by: draft.reserved_by,
    intended_title: draft.intended_title,
    intended_session: draft.intended_session,
    intended_bushel: draft.intended_bushel,
    reserved_ts: draft.reserved_ts,
    reservation_id: randomUUID(),
    status: "reserved",
    expires_ts: expires,
    originally_proposed_serial: draft.originally_proposed_serial,
    paper_draft_path: draft.paper_draft_path,
    backfill_notes: draft.notes,
    backfill_ts: now,
  };

  appendFileSync(CODEX_LEDGER, JSON.stringify(reservation) + "\n", "utf-8");
  console.log(`  WROTE ${draft.serial} (originally_proposed: ${draft.originally_proposed_serial})`);
  written++;
}

console.log(`\nBackfill complete: ${written} written, ${skipped} skipped.`);
console.log("G4: Existing collision instances migrated to clean reservation rows.");
