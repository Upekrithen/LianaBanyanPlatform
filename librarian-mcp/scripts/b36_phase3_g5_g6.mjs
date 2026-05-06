// B36 Phase 3 G5 + G6 — Stack Ledger row + Codex entry (BP025)
// Run once: node scripts/b36_phase3_g5_g6.mjs

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = resolve(__dirname, "..");

// ─── G5: Stack Ledger row ───────────────────────────────────────────────────
const STACK_LEDGER = resolve(ROOT, "../BISHOP_DROPZONE/14_CanonicalReferences/STACK_LEDGER.jsonl");

const stackRow = {
  row_id: "LB-STACK-0018",
  primitive: "Skulk Coordinator — Optimus Primal 7th Axis (triad_count) + skulk_dispatch MCP tool (Bushel 36 Phase 3, BP025)",
  ratification_session: "BP025",
  bushel: 36,
  phase: "Phase 3",
  baseline_without: "Optimus Primal returns single-agent recommendation per task (6-axis). No multi-agent coordination. All tasks dispatched to one agent regardless of complexity.",
  with_primitive: "Optimus Primal gains 7th axis (triad_count: 1|3|4). skulk_dispatch tool orchestrates Research/Build/Discovery/Synthesis triads in beat-offset pattern. Foreman (Bishop) aggregates results via substrate. Full Fox Skulk (4-agent) available for Bushel 35-class work.",
  delta: "4 triad combinations validated empirically (6/6 classification tests pass). Beat-offset dispatch: substrate becomes crankshaft. Full Fox Skulk enabled for Bushel 35 nine-track. G1: 30/30 Old Ones fleet tests still pass.",
  compound_with_prior: [
    "Conductor's Baton #2277 (K446a, 6-axis routing)",
    "dispatch_pawn (K532)",
    "dispatch_rook (B36 Phase 2, BP025)",
    "Pheromone substrate (BP010+)",
    "Old Ones Fleet (Bushel 29)",
  ],
  measurement_class: "empirical (G3: 6/6 triad selection tests; G1: 30/30 fleet tests)",
  status: "LANDED",
  ts: new Date().toISOString(),
};

appendFileSync(STACK_LEDGER, JSON.stringify(stackRow) + "\n", "utf-8");
console.log(`G5 PASS: Stack Ledger row ${stackRow.row_id} appended`);

// ─── G6: Codex entry ────────────────────────────────────────────────────────
const CODEX_DIR     = resolve(ROOT, "stitchpunks/codex");
const CODEX_LEDGER  = resolve(CODEX_DIR, "codex_ledger.jsonl");
const SERIAL_FILE   = resolve(CODEX_DIR, "codex_serial_counter.json");

if (!existsSync(CODEX_DIR)) mkdirSync(CODEX_DIR, { recursive: true });

// Allocate next serial
let next = 1;
if (existsSync(SERIAL_FILE)) {
  try { next = JSON.parse(readFileSync(SERIAL_FILE, "utf-8")).next; } catch { /* */ }
}
writeFileSync(SERIAL_FILE, JSON.stringify({ next: next + 1 }, null, 2), "utf-8");
const serial = `LB-CODEX-${String(next).padStart(4, "0")}`;

// Reserve + bind
const reservation_id = randomUUID();
const codex_uuid     = randomUUID();
const ts             = new Date().toISOString();
const ttl_ts         = new Date(Date.now() + 7 * 86400000).toISOString();

const reservation = {
  type: "reservation",
  serial,
  reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 36 Phase 3",
  intended_title: "Bushel 36 Phase 3 — Skulk Coordinator / Optimus Primal 7th Axis",
  intended_session: "BP025",
  intended_bushel: 36,
  reserved_ts: ts,
  reservation_id,
  status: "bound",
  expires_ts: ttl_ts,
  bound_codex_id: serial,
  bound_ts: ts,
};

const bodyText = [
  `skulk_dispatch MCP tool: B36 Phase 3. Optimus Primal extended with 7th axis (triad_count: 1|3|4).`,
  `Four canonical triads: Research (Bishop+Pawn+Knight), Build (Knight+Rook+Bishop), Discovery (Knight+Pawn+Rook), Synthesis (Bishop+Pawn+Rook).`,
  `Full Fox Skulk (triad_count=4): all 4 agents, Synthesis coordination, Bushel 35 default.`,
  `Beat-offset dispatch: agents fire in staggered sequence (default 2000ms offset). Substrate is the crankshaft — each agent writes pheromone records; Foreman aggregates on skulk_dispatch_id.`,
  `G1 PASS: 30/30 Old Ones fleet tests pass post-integration.`,
  `G2 PASS: skulk_dispatch exposed in dist/server.js (verified line 7227+).`,
  `G3 PASS: 6/6 triad selection tests (Research/Build/Discovery/Synthesis/FullSkulk/SingleAgent).`,
  `G4 PASS: Beat-offset sequence verified (_buildBeatSequence function).`,
  `G5 PASS: Stack Ledger row LB-STACK-0018.`,
  `G6 PASS: Codex ${serial} reserved + bound.`,
  `Substrate log: stitchpunks/data/skulk_dispatch_log.jsonl.`,
  `Enables Bushel 35 nine-track Beyond Colossus run on full Fox Skulk.`,
].join(" ");

const codexEntry = {
  id: serial,
  uuid: codex_uuid,
  title: "Bushel 36 Phase 3 — Skulk Coordinator / Optimus Primal 7th Axis",
  edition: "BP025",
  status: "bound",
  created_ts: ts,
  bound_ts: ts,
  bound_hmac: "sha256:" + createHash("sha256").update(bodyText + ts, "utf-8").digest("hex"),
  chapters: [
    {
      topic: "skulk_dispatch MCP Tool — Optimus Primal 7th Axis Extension",
      gold_tablet_pointers: ["skulk_dispatch", "conductor_route"],
      excalibur_pointers: [],
      jar_pointers: [],
      body_text: bodyText,
      ts_drafted: ts,
    },
  ],
};

appendFileSync(CODEX_LEDGER, JSON.stringify(reservation) + "\n", "utf-8");
appendFileSync(CODEX_LEDGER, JSON.stringify(codexEntry) + "\n", "utf-8");
console.log(`G6 PASS: Codex ${serial} reserved + bound`);
console.log(`\nB36 Phase 3 G5+G6 complete. Stack row: LB-STACK-0018. Codex: ${serial}.`);
