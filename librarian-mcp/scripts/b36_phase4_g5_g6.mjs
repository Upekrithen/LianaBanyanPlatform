// B36 Phase 4 G5 + G6 — Stack Ledger row + Codex entry (BP025)
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = resolve(__dirname, "..");

const STACK_LEDGER = resolve(ROOT, "../BISHOP_DROPZONE/14_CanonicalReferences/STACK_LEDGER.jsonl");
const stackRow = {
  row_id: "LB-STACK-0019",
  primitive: "Synthesis Triad Dry-Fire — B36 Phase 4 (Bushel 36 Phase 4, BP025)",
  ratification_session: "BP025",
  bushel: 36,
  phase: "Phase 4",
  baseline_without: "Single-Bishop Track 4 response: ~200 words, no structured evaluation, no paper citations, no probability estimates.",
  with_primitive: "Synthesis Triad (Bishop+Pawn+Rook): 600+ words, 5-dimension structured output, PNAS 2026 citation (Pickett et al.), Metaculus community odds, 10-20% probability range, patent-angle identification (HexIsle physics layer analogy). Pawn cost: $0.0167.",
  delta: "G2 PASS: Qualitatively richer output demonstrated. G4 PASS: Cost $0.0167 vs $50 budget. G3 PARTIAL: Rook pending MCP restart. Bushel 35 readiness: GREEN with asterisk.",
  compound_with_prior: [
    "skulk_dispatch (B36 Phase 3, LB-STACK-0018)",
    "dispatch_pawn (K532)",
    "dispatch_rook (B36 Phase 2, BP025)",
    "Pheromone substrate (BP010+)",
  ],
  measurement_class: "empirical (Pawn API dispatch, Bishop aggregation)",
  status: "LANDED",
  ts: new Date().toISOString(),
};

appendFileSync(STACK_LEDGER, JSON.stringify(stackRow) + "\n", "utf-8");
console.log(`G5 PASS: Stack Ledger row ${stackRow.row_id} appended`);

const CODEX_DIR    = resolve(ROOT, "stitchpunks/codex");
const CODEX_LEDGER = resolve(CODEX_DIR, "codex_ledger.jsonl");
const SERIAL_FILE  = resolve(CODEX_DIR, "codex_serial_counter.json");
if (!existsSync(CODEX_DIR)) mkdirSync(CODEX_DIR, { recursive: true });

let next = 1;
if (existsSync(SERIAL_FILE)) {
  try { next = JSON.parse(readFileSync(SERIAL_FILE, "utf-8")).next; } catch {}
}
writeFileSync(SERIAL_FILE, JSON.stringify({ next: next + 1 }, null, 2), "utf-8");
const serial = `LB-CODEX-${String(next).padStart(4, "0")}`;
const reservation_id = randomUUID();
const ts = new Date().toISOString();

const body = `B36 Phase 4 LANDED. Synthesis Triad dry-fire (Track 4: Room-Temperature Superconductors). Skulk dispatch_id: 6127ff38-af02-44a0-a478-4bb9970ad647. Pawn dispatch: f3eecc8a. Bishop synthesis: BISHOP_DROPZONE/02_RookReturns/B36_PHASE4_SYNTHESIS_TRIAD_DRYFIRE_TRACK4.md. G1: Dry run completes. G2: Richer than single-Bishop (5-dimension structured output vs 200-word baseline). G3: PARTIAL (Rook pending MCP restart). G4: Cost $0.0167 vs $50 budget. G5: LB-STACK-0019. G6: ${serial}. B35 readiness: GREEN with asterisk.`;

appendFileSync(CODEX_LEDGER, JSON.stringify({
  type: "reservation", serial, reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 36 Phase 4",
  intended_title: "Bushel 36 Phase 4 — Synthesis Triad Dry-Fire / Track 4 Superconductors",
  intended_session: "BP025", intended_bushel: 36, reserved_ts: ts, reservation_id,
  status: "bound", expires_ts: new Date(Date.now() + 7*86400000).toISOString(),
  bound_codex_id: serial, bound_ts: ts,
}) + "\n", "utf-8");

appendFileSync(CODEX_LEDGER, JSON.stringify({
  id: serial, uuid: randomUUID(),
  title: "Bushel 36 Phase 4 — Synthesis Triad Dry-Fire / Track 4 Superconductors",
  edition: "BP025", status: "bound", created_ts: ts, bound_ts: ts,
  bound_hmac: "sha256:" + createHash("sha256").update(body + ts, "utf-8").digest("hex"),
  chapters: [{ topic: "Synthesis Triad Dry-Fire Track 4", gold_tablet_pointers: ["skulk_dispatch", "dispatch_pawn"], excalibur_pointers: [], jar_pointers: [], body_text: body, ts_drafted: ts }],
}) + "\n", "utf-8");

console.log(`G6 PASS: Codex ${serial} reserved + bound`);
console.log(`\nB36 Phase 4 G5+G6 complete.`);
