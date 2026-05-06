// B36 Phase 5 G5 + G6 + G7 — Stack Ledger + Codex entry (BP025)
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID, createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = resolve(__dirname, "..");

const STACK_LEDGER = resolve(ROOT, "../BISHOP_DROPZONE/14_CanonicalReferences/STACK_LEDGER.jsonl");
const stackRow = {
  row_id: "LB-STACK-0020",
  primitive: "CAI Hearth Local Inference Layer — Ollama 3rd Tier + AMPLIFY Telemetry (Bushel 36 Phase 5, BP025)",
  ratification_session: "BP025",
  bushel: 36,
  phase: "Phase 5",
  baseline_without: "All queries go to cloud APIs. Cache misses (substrate MISS): 1-3s latency + API cost. Local CPU/GPU completely idle for inference.",
  with_primitive: "3-tier routing: Arm B substrate (0.000288ms) → Ollama local (10s actual, 100-500ms target) → cloud. Quality threshold 0.72 calibrated (6/6 test cases). AMPLIFY telemetry: 50% substrate/50% local distribution on test workload, $0.0026 avoided in 2 test calls. llama3.1:8b-instruct-q4_K_M (4.9GB) is local model.",
  delta: "G1: Local Ollama inference completes (10.5s actual). G2: 6/6 quality threshold tests calibrated. G3: Local cache writeback verified (hearth_routing_log.jsonl, amplify_telemetry.jsonl). G4: AMPLIFY UI tool live (amplify_snapshot). G5: Cost telemetry shows $0.0026 avoided. MCP tools: cai_hearth_route + amplify_snapshot + hearth_config.",
  compound_with_prior: [
    "Pheromone substrate Arm B (BP010+, LB-STACK-0014)",
    "skulk_dispatch (B36 Phase 3, LB-STACK-0018)",
    "dispatch_pawn (K532)",
    "dispatch_rook (B36 Phase 2)",
    "conductor_route (K446a, #2277)",
  ],
  measurement_class: "empirical (G2: 6/6 threshold tests; G3: Ollama API call verified; G4: AMPLIFY telemetry logged)",
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
const ts = new Date().toISOString();

const body = `CAI Hearth Local Inference Layer LANDED. B36 Phase 5. Three-tier query routing: substrate (0.000288ms) → Ollama local → cloud. Quality threshold 0.72 calibrated (6/6 tests). Local model: llama3.1:8b-instruct-q4_K_M (4.9GB, 10.5s per inference on this hardware). AMPLIFY telemetry: cost_avoided tracked per routing decision. MCP tools: cai_hearth_route, amplify_snapshot, hearth_config. G5: LB-STACK-0020. G6: ${serial}. G7: Codex entry reserved + bound. AMPLIFY product foundation: user's hardware amplifies their work; substrate makes work effective; cloud reserved for genuinely novel reasoning.`;

appendFileSync(CODEX_LEDGER, JSON.stringify({
  type: "reservation", serial,
  reserved_by: "Knight (Cursor / Sonnet 4.6) — Bushel 36 Phase 5",
  intended_title: "Bushel 36 Phase 5 — CAI Hearth / Ollama Local Inference / AMPLIFY",
  intended_session: "BP025", intended_bushel: 36, reserved_ts: ts,
  reservation_id: randomUUID(), status: "bound",
  expires_ts: new Date(Date.now() + 7*86400000).toISOString(),
  bound_codex_id: serial, bound_ts: ts,
}) + "\n", "utf-8");

appendFileSync(CODEX_LEDGER, JSON.stringify({
  id: serial, uuid: randomUUID(),
  title: "Bushel 36 Phase 5 — CAI Hearth / Ollama Local Inference / AMPLIFY",
  edition: "BP025", status: "bound", created_ts: ts, bound_ts: ts,
  bound_hmac: "sha256:" + createHash("sha256").update(body + ts, "utf-8").digest("hex"),
  chapters: [{
    topic: "CAI Hearth 3-Tier Routing + AMPLIFY",
    gold_tablet_pointers: ["cai_hearth_route", "amplify_snapshot", "hearth_config", "skulk_dispatch"],
    excalibur_pointers: [], jar_pointers: [], body_text: body, ts_drafted: ts,
  }],
}) + "\n", "utf-8");

console.log(`G6+G7 PASS: Codex ${serial} reserved + bound`);
console.log(`\nB36 Phase 5 G5+G6+G7 complete. Stack: LB-STACK-0020. Codex: ${serial}.`);
